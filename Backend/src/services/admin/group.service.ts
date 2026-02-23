// ================================================================
// 📦 src/services/group.service.ts
// ✅ Group CRUD + Student Assignment — shared between Admin & Owner
// 🔌 Socket.IO events included
// ================================================================

import { prisma } from "../../prisma/client";
import { GroupStatus, Level } from "../../../generated/prisma/client";
import { emitToAdminLevel } from "../socket.service";

// ─── CREATE ──────────────────────────────────────────────

export async function createGroup(input: {
  name: string;
  department_id?: string;
  course_id: string;
  level: string;
  max_students?: number;
  teacher_id?: string;
}) {
  const { name, department_id, course_id, level, max_students, teacher_id } =
    input;

  if (!name?.trim() || !course_id || !level) {
    return { error: "validation" as const };
  }

  if (!Object.values(Level).includes(level as Level)) {
    return { error: "invalid_level" as const };
  }

  const [department, course] = await Promise.all([
    department_id
      ? prisma.department.findUnique({ where: { department_id } })
      : Promise.resolve(null),
    prisma.course.findUnique({ where: { course_id } }),
  ]);

  if (department_id && !department)
    return { error: "invalid_department" as const };
  if (!course) return { error: "invalid_course" as const };

  if (teacher_id) {
    const teacher = await prisma.teacher.findUnique({ where: { teacher_id } });
    if (!teacher) return { error: "invalid_teacher" as const };
  }

  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      course_id,
      department_id,
      level: level as Level,
      max_students: max_students ?? 25,
      teacher_id,
      status: GroupStatus.OPEN,
    },
  });

  return { data: group };
}

// ─── LIST ────────────────────────────────────────────────

export async function listGroups() {
  const groups = await prisma.group.findMany({
    include: {
      department: true,
      course: true,
      teacher: true,
      enrollments: {
        where: {
          registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
        },
        include: { student: true },
      },
      _count: {
        select: {
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
          },
        },
      },
    },
  });

  // Transform for backward compatibility
  return groups.map((group) => ({
    ...group,
    students: group.enrollments.map((e) => e.student),
    current_capacity: group._count.enrollments,
  }));
}

// ─── GET BY ID ───────────────────────────────────────────

export async function getGroupById(groupId: string) {
  const group = await prisma.group.findUnique({
    where: { group_id: groupId },
    include: {
      department: true,
      enrollments: {
        where: {
          registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
        },
        include: { student: true },
      },
      _count: {
        select: {
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
          },
        },
      },
    },
  });

  if (!group) return null;

  return {
    ...group,
    students: group.enrollments.map((e) => e.student),
    current_capacity: group._count.enrollments,
  };
}

// ─── UPDATE ──────────────────────────────────────────────

export async function updateGroup(groupId: string, body: Record<string, any>) {
  if (Object.keys(body).length === 0) {
    return { error: "empty_body" as const };
  }

  const allowedFields = ["name", "teacher_id", "max_students", "status"];
  const data = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowedFields.includes(key)),
  );

  const group = await prisma.group.update({
    where: { group_id: groupId },
    data,
  });

  return { data: group };
}

// ─── DELETE ──────────────────────────────────────────────

export async function deleteGroup(groupId: string) {
  await prisma.group.delete({ where: { group_id: groupId } });
  return { data: true };
}

// ─── ADD STUDENT TO GROUP ────────────────────────────────

export async function addStudentToGroup(groupId: string, studentId: string) {
  const group = await prisma.group.findUnique({
    where: { group_id: groupId },
    include: {
      _count: {
        select: {
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
          },
        },
      },
    },
  });

  if (!group) return { error: "group_not_found" as const };

  const currentCapacity = group._count.enrollments;

  if (
    group.status === GroupStatus.FULL ||
    currentCapacity >= group.max_students
  ) {
    return { error: "group_full" as const };
  }

  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
  });

  if (!student) return { error: "student_not_found" as const };

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      student_id: studentId,
      course_id: group.course_id,
      registration_status: { in: ["VALIDATED", "PAID"] },
    },
  });

  if (!enrollment) return { error: "not_enrolled" as const };
  if (enrollment.group_id) return { error: "already_in_group" as const };

  await prisma.enrollment.update({
    where: { enrollment_id: enrollment.enrollment_id },
    data: { group_id: groupId },
  });

  // Update group status if full
  if (currentCapacity + 1 >= group.max_students) {
    await prisma.group.update({
      where: { group_id: groupId },
      data: { status: GroupStatus.FULL },
    });
  }

  // 🔌 Socket
  emitToAdminLevel("group:studentAdded", {
    group_id: groupId,
    student_id: studentId,
  });

  return { data: true };
}

// ─── ASSIGN INSTRUCTOR ──────────────────────────────────

export async function assignInstructor(groupId: string, teacherId?: string) {
  const group = await prisma.group.findUnique({ where: { group_id: groupId } });
  if (!group) return { error: "group_not_found" as const };

  if (teacherId) {
    const teacher = await prisma.teacher.findUnique({
      where: { teacher_id: teacherId },
    });
    if (!teacher) return { error: "teacher_not_found" as const };
  }

  const updatedGroup = await prisma.group.update({
    where: { group_id: groupId },
    data: { teacher_id: teacherId || null },
    include: {
      course: true,
      teacher: true,
      department: true,
      enrollments: { include: { student: true } },
      sessions: true,
      _count: { select: { enrollments: true, sessions: true } },
    },
  });

  // 🔌 Socket
  emitToAdminLevel("group:instructorAssigned", {
    group_id: groupId,
    teacher_id: teacherId || null,
  });

  return { data: updatedGroup };
}

// ─── REMOVE STUDENT FROM GROUP ──────────────────────────

export async function removeStudentFromGroup(
  groupId: string,
  studentId: string,
) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      student_id: studentId,
      group_id: groupId,
      registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
    },
  });

  if (!enrollment) return { error: "not_in_group" as const };

  await prisma.enrollment.update({
    where: { enrollment_id: enrollment.enrollment_id },
    data: { group_id: null },
  });

  // Update group status if it was full
  const group = await prisma.group.findUnique({
    where: { group_id: groupId },
    include: {
      _count: {
        select: {
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
          },
        },
      },
    },
  });

  if (
    group &&
    group.status === GroupStatus.FULL &&
    group._count.enrollments < group.max_students
  ) {
    await prisma.group.update({
      where: { group_id: groupId },
      data: { status: GroupStatus.OPEN },
    });
  }

  // 🔌 Socket
  emitToAdminLevel("group:studentRemoved", {
    group_id: groupId,
    student_id: studentId,
  });

  return { data: true };
}
