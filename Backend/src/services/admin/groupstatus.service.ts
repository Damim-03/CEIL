// ================================================================
// 📦 src/services/admin/groupstatus.service.ts
// ✅ Group management — Admin & Owner
// ✅ Realtime via Socket.IO (getIO())
// ✅ MySQL compatible (no mode: "insensitive")
// ✅ transferStudent supports PENDING enrollments
// ================================================================

import { prisma } from "../../prisma/client";
import { GroupStatus, RegistrationStatus } from "../../../generated/prisma";
import { getIO } from "../../config/socket";

// ─── Shared select fragments ──────────────────────────────────

const studentSelect = {
  student_id: true,
  first_name: true,
  last_name: true,
  email: true,
  phone_number: true,
  gender: true,
  avatar_url: true,
  status: true,
  registrant_category: true,
};

const teacherSelect = {
  teacher_id: true,
  first_name: true,
  last_name: true,
  email: true,
  phone_number: true,
};

const groupBaseSelect = {
  group_id: true,
  name: true,
  level: true,
  status: true,
  max_students: true,
  course: {
    select: {
      course_id: true,
      course_name: true,
      course_code: true,
      profile: {
        select: { flag_emoji: true, image_url: true },
      },
    },
  },
  teacher: { select: teacherSelect },
  department: {
    select: { department_id: true, name: true },
  },
  _count: {
    select: { enrollments: true, sessions: true },
  },
};

// ─── Capacity helper ─────────────────────────────────────────

function computeCapacity(
  enrollments: { registration_status: string }[],
  max: number,
) {
  const active = enrollments.filter((e) =>
    ["VALIDATED", "PAID"].includes(e.registration_status),
  ).length;
  const pending = enrollments.filter(
    (e) => e.registration_status === "PENDING",
  ).length;
  return {
    enrolled_count: active,
    pending_count: pending,
    capacity_pct: max > 0 ? Math.round((active / max) * 100) : 0,
    is_full: active >= max,
  };
}

// ─── Socket emit helpers (fire-and-forget) ────────────────────

function emitGroupUpdated(group_id: string, payload: object) {
  try {
    getIO()
      .to("role:ADMIN_LEVEL")
      .to(`group:${group_id}`)
      .emit("group:updated", {
        group_id,
        ...payload,
        timestamp: new Date().toISOString(),
      });
  } catch {
    /* silent in test env */
  }
}

function emitGroupStatusChanged(
  group_id: string,
  name: string,
  status: GroupStatus,
) {
  try {
    getIO().to("role:ADMIN_LEVEL").emit("group:statusChanged", {
      group_id,
      name,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch {}
}

function emitStudentTransferred(payload: {
  student_id: string;
  student_name: string;
  from_group_id: string;
  from_group_name: string;
  to_group_id: string;
  to_group_name: string;
}) {
  try {
    getIO()
      .to("role:ADMIN_LEVEL")
      .to(`group:${payload.from_group_id}`)
      .to(`group:${payload.to_group_id}`)
      .to(`user:${payload.student_id}`)
      .emit("group:studentTransferred", {
        ...payload,
        timestamp: new Date().toISOString(),
      });
  } catch {}
}

function emitTeacherAssigned(group_id: string, teacher: object | null) {
  try {
    getIO()
      .to("role:ADMIN_LEVEL")
      .to(`group:${group_id}`)
      .emit("group:teacherAssigned", {
        group_id,
        teacher,
        timestamp: new Date().toISOString(),
      });
  } catch {}
}

// ─── GET ALL ─────────────────────────────────────────────────

export async function getGroups(
  params: {
    status?: GroupStatus;
    level?: string;
    course_id?: string;
    teacher_id?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  const {
    status,
    level,
    course_id,
    teacher_id,
    search,
    page = 1,
    limit = 20,
  } = params;

  const where: any = {};
  if (status) where.status = status;
  if (level) where.level = level;
  if (course_id) where.course_id = course_id;
  if (teacher_id) where.teacher_id = teacher_id;
  if (search) {
    // ✅ MySQL compatible — no mode: "insensitive" (MySQL is case-insensitive by default)
    where.OR = [
      { name: { contains: search } },
      { course: { course_name: { contains: search } } },
    ];
  }

  const [groups, total] = await Promise.all([
    prisma.group.findMany({
      where,
      select: {
        ...groupBaseSelect,
        enrollments: {
          where: {
            registration_status: { in: ["VALIDATED", "PAID", "PENDING"] },
          },
          select: { enrollment_id: true, registration_status: true },
        },
      },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.group.count({ where }),
  ]);

  const data = groups.map(({ enrollments, ...g }) => ({
    ...g,
    ...computeCapacity(enrollments, g.max_students),
  }));

  return {
    data,
    meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
  };
}

// ─── GET BY ID ───────────────────────────────────────────────

export async function getGroupById(group_id: string) {
  const group = await prisma.group.findUnique({
    where: { group_id },
    select: {
      ...groupBaseSelect,
      sessions: {
        orderBy: { session_date: "desc" },
        take: 5,
        select: {
          session_id: true,
          session_date: true,
          topic: true,
          room: { select: { name: true } },
          _count: { select: { attendance: true } },
        },
      },
      enrollments: {
        where: {
          registration_status: { in: ["VALIDATED", "PAID", "PENDING"] },
        },
        select: {
          enrollment_id: true,
          registration_status: true,
          enrollment_date: true,
          student: { select: studentSelect },
          pricing: { select: { status_fr: true, price: true, currency: true } },
        },
        orderBy: { enrollment_date: "asc" },
      },
    },
  });

  if (!group) return null;

  return {
    ...group,
    ...computeCapacity(group.enrollments, group.max_students),
  };
}

// ─── GET STUDENTS ────────────────────────────────────────────

export async function getGroupStudents(
  group_id: string,
  params: { status?: RegistrationStatus; page?: number; limit?: number } = {},
) {
  const { status, page = 1, limit = 25 } = params;

  const exists = await prisma.group.findUnique({
    where: { group_id },
    select: { group_id: true },
  });
  if (!exists) return { error: "not_found" as const };

  const where: any = {
    group_id,
    // ✅ إذا لم يُحدد status نجلب كل الحالات (VALIDATED + PAID + PENDING + FINISHED + REJECTED)
    ...(status ? { registration_status: status } : {}),
  };

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      select: {
        enrollment_id: true,
        registration_status: true,
        enrollment_date: true,
        level: true,
        student: { select: studentSelect },
        fees: {
          select: { fee_id: true, status: true, amount: true },
          orderBy: { due_date: "desc" },
          take: 1,
        },
        pricing: { select: { status_fr: true, price: true, currency: true } },
      },
      orderBy: { enrollment_date: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.enrollment.count({ where }),
  ]);

  return {
    data: enrollments,
    meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
  };
}

// ─── CHANGE STATUS ───────────────────────────────────────────

export async function changeGroupStatus(
  group_id: string,
  status: GroupStatus,
  changed_by: string,
) {
  const group = await prisma.group.findUnique({
    where: { group_id },
    select: { group_id: true, name: true, status: true },
  });

  if (!group) return { error: "not_found" as const };
  if (group.status === status) return { error: "same_status" as const };

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.group.update({
      where: { group_id },
      data: { status },
      select: groupBaseSelect,
    });

    // FINISHED → أغلق كل التسجيلات النشطة تلقائياً
    if (status === "FINISHED") {
      const active = await tx.enrollment.findMany({
        where: { group_id, registration_status: { in: ["VALIDATED", "PAID"] } },
        select: { enrollment_id: true, registration_status: true },
      });

      if (active.length > 0) {
        await tx.enrollment.updateMany({
          where: { enrollment_id: { in: active.map((e) => e.enrollment_id) } },
          data: { registration_status: "FINISHED" },
        });
        await tx.registrationHistory.createMany({
          data: active.map((e) => ({
            enrollment_id: e.enrollment_id,
            old_status: e.registration_status,
            new_status: "FINISHED" as RegistrationStatus,
            changed_by,
          })),
        });
      }
    }

    return result;
  });

  emitGroupStatusChanged(group_id, group.name, status);
  emitGroupUpdated(group_id, { status });

  return { data: updated };
}

// ─── TRANSFER STUDENT ────────────────────────────────────────

export async function transferStudent(input: {
  student_id: string;
  from_group_id: string;
  to_group_id: string;
  changed_by: string;
}) {
  const { student_id, from_group_id, to_group_id, changed_by } = input;

  if (from_group_id === to_group_id) return { error: "same_group" as const };

  const [fromGroup, toGroup] = await Promise.all([
    prisma.group.findUnique({
      where: { group_id: from_group_id },
      select: {
        group_id: true,
        name: true,
        status: true,
        max_students: true,
        course_id: true,
      },
    }),
    prisma.group.findUnique({
      where: { group_id: to_group_id },
      select: {
        group_id: true,
        name: true,
        status: true,
        max_students: true,
        course_id: true,
      },
    }),
  ]);

  if (!fromGroup) return { error: "from_group_not_found" as const };
  if (!toGroup) return { error: "to_group_not_found" as const };
  if (fromGroup.course_id !== toGroup.course_id)
    return { error: "different_course" as const };
  if (toGroup.status === "FINISHED")
    return { error: "target_finished" as const };

  // ✅ يدعم PENDING + VALIDATED + PAID
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      student_id,
      group_id: from_group_id,
      registration_status: { in: ["VALIDATED", "PAID", "PENDING"] },
    },
  });
  if (!enrollment) return { error: "not_enrolled_in_source" as const };

  // الطاقة تُحسب فقط من VALIDATED + PAID (PENDING لا يحجز مقعداً)
  const targetCount = await prisma.enrollment.count({
    where: {
      group_id: to_group_id,
      registration_status: { in: ["VALIDATED", "PAID"] },
    },
  });
  if (targetCount >= toGroup.max_students)
    return { error: "target_full" as const };

  const duplicate = await prisma.enrollment.findFirst({
    where: {
      student_id,
      group_id: to_group_id,
      registration_status: { notIn: ["REJECTED", "FINISHED"] },
    },
  });
  if (duplicate) return { error: "already_in_target" as const };

  // ── Transaction ──
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.enrollment.update({
      where: { enrollment_id: enrollment.enrollment_id },
      data: { group_id: to_group_id },
      select: {
        enrollment_id: true,
        registration_status: true,
        student: { select: studentSelect },
        group: { select: { group_id: true, name: true } },
      },
    });

    await tx.registrationHistory.create({
      data: {
        enrollment_id: enrollment.enrollment_id,
        old_status: enrollment.registration_status,
        new_status: enrollment.registration_status,
        changed_by,
      },
    });

    // تحديث حالة الفوجين تلقائياً بناءً على الطاقة الجديدة
    const [newFromCount, newToCount] = await Promise.all([
      tx.enrollment.count({
        where: {
          group_id: from_group_id,
          registration_status: { in: ["VALIDATED", "PAID"] },
        },
      }),
      tx.enrollment.count({
        where: {
          group_id: to_group_id,
          registration_status: { in: ["VALIDATED", "PAID"] },
        },
      }),
    ]);

    const statusUpdates: Promise<any>[] = [];
    if (fromGroup.status === "FULL" && newFromCount < fromGroup.max_students)
      statusUpdates.push(
        tx.group.update({
          where: { group_id: from_group_id },
          data: { status: "OPEN" },
        }),
      );
    if (newToCount >= toGroup.max_students)
      statusUpdates.push(
        tx.group.update({
          where: { group_id: to_group_id },
          data: { status: "FULL" },
        }),
      );
    if (statusUpdates.length) await Promise.all(statusUpdates);

    return updated;
  });

  emitStudentTransferred({
    student_id,
    student_name: `${result.student.first_name} ${result.student.last_name}`,
    from_group_id,
    from_group_name: fromGroup.name,
    to_group_id,
    to_group_name: toGroup.name,
  });
  emitGroupUpdated(from_group_id, { action: "student_left" });
  emitGroupUpdated(to_group_id, { action: "student_joined" });

  return {
    data: {
      enrollment: result,
      from_group: { group_id: from_group_id, name: fromGroup.name },
      to_group: { group_id: to_group_id, name: toGroup.name },
    },
  };
}

// ─── GET TEACHER ─────────────────────────────────────────────

export async function getGroupTeacher(group_id: string) {
  const group = await prisma.group.findUnique({
    where: { group_id },
    select: {
      group_id: true,
      name: true,
      teacher: {
        select: {
          ...teacherSelect,
          groups: {
            select: { group_id: true, name: true, status: true, level: true },
          },
        },
      },
    },
  });

  if (!group) return { error: "not_found" as const };
  return { data: group };
}

// ─── ASSIGN TEACHER ──────────────────────────────────────────

export async function assignTeacher(
  group_id: string,
  teacher_id: string | null,
) {
  const group = await prisma.group.findUnique({
    where: { group_id },
    select: { group_id: true },
  });
  if (!group) return { error: "not_found" as const };

  if (teacher_id) {
    const teacher = await prisma.teacher.findUnique({ where: { teacher_id } });
    if (!teacher) return { error: "teacher_not_found" as const };
  }

  const updated = await prisma.group.update({
    where: { group_id },
    data: { teacher_id },
    select: { group_id: true, name: true, teacher: { select: teacherSelect } },
  });

  emitTeacherAssigned(group_id, updated.teacher);
  emitGroupUpdated(group_id, { teacher: updated.teacher });

  return { data: updated };
}

// ─── TRANSFER REQUESTS ───────────────────────────────────────

export async function getTransferRequests() {
  const pending = await prisma.enrollment.findMany({
    where: {
      registration_status: "PENDING",
      group_id: { not: null },
    },
    select: {
      enrollment_id: true,
      registration_status: true,
      enrollment_date: true,
      student: { select: studentSelect },
      group: {
        select: {
          group_id: true,
          name: true,
          level: true,
          status: true,
          course: { select: { course_name: true, course_code: true } },
        },
      },
      course: { select: { course_name: true } },
    },
    orderBy: { enrollment_date: "asc" },
  });

  return { data: pending, total: pending.length };
}
