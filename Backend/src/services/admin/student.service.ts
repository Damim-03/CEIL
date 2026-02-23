// ================================================================
// 📦 src/services/student.service.ts
// ✅ Student CRUD — shared between Admin & Owner
// 🔌 Socket.IO events included
// ================================================================

import { prisma } from "../../prisma/client";
import { Roles } from "../../enums/role.enum";
import { StudentStatus } from "../../../generated/prisma/client";
import {
  emitToAdminLevel,
  triggerDashboardRefresh,
} from "../socket.service";

// ─── Types ───────────────────────────────────────────────

interface CreateStudentInput {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  nationality?: string;
  language?: string;
  education_level?: string;
  study_location?: string;
}

interface ListStudentsParams {
  page?: number;
  limit?: number;
  status?: StudentStatus;
}

// ─── CREATE ──────────────────────────────────────────────

export async function createStudent(input: CreateStudentInput) {
  const { first_name, last_name, email, ...rest } = input;

  if (!first_name?.trim() || !last_name?.trim() || !email) {
    return { error: "validation" as const };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return { error: "duplicate_email" as const };
  }

  const student = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: email.toLowerCase(),
        password: null,
        role: Roles.STUDENT,
      },
    });

    const student = await tx.student.create({
      data: {
        user_id: user.user_id,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.toLowerCase(),
        phone_number: rest.phone_number,
        nationality: rest.nationality,
        language: rest.language,
        education_level: rest.education_level,
        study_location: rest.study_location,
      },
    });

    await tx.user.update({
      where: { user_id: user.user_id },
      data: { student_id: student.student_id },
    });

    return student;
  });

  // 🔌 Socket
  emitToAdminLevel("student:created", {
    student_id: student.student_id,
    first_name: student.first_name,
    last_name: student.last_name,
  });
  triggerDashboardRefresh("student_created");

  return { data: student };
}

// ─── LIST ────────────────────────────────────────────────

export async function listStudents(params: ListStudentsParams = {}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const status = params.status || StudentStatus.ACTIVE;

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where: { status },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            user_id: true,
            email: true,
            google_avatar: true,
          },
        },
        enrollments: {
          where: {
            registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            group_id: { not: null },
          },
          include: {
            group: true,
            course: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.student.count({ where: { status } }),
  ]);

  return {
    data: students,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

// ─── GET BY ID ───────────────────────────────────────────

export async function getStudentById(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
    include: {
      user: {
        select: {
          user_id: true,
          email: true,
          google_avatar: true,
        },
      },
      enrollments: {
        include: {
          course: true,
          group: {
            include: { teacher: true },
          },
        },
      },
      attendance: true,
      fees: true,
    },
  });

  if (!student || student.status === StudentStatus.INACTIVE) return null;
  return student;
}

// ─── UPDATE ──────────────────────────────────────────────

export async function updateStudent(
  studentId: string,
  body: Record<string, any>,
) {
  if (Object.keys(body).length === 0) {
    return { error: "empty_body" as const };
  }

  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
  });

  if (!student) return { error: "not_found" as const };

  const allowedFields = [
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "nationality",
    "language",
    "education_level",
    "study_location",
  ];

  const data = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowedFields.includes(key)),
  );

  const updated = await prisma.student.update({
    where: { student_id: studentId },
    data,
  });

  return { data: updated };
}

// ─── DELETE (soft) ───────────────────────────────────────

export async function deleteStudent(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
  });

  if (!student) return { error: "not_found" as const };

  await prisma.student.update({
    where: { student_id: studentId },
    data: { status: StudentStatus.INACTIVE },
  });

  // 🔌 Socket
  emitToAdminLevel("student:deleted", { student_id: studentId });
  triggerDashboardRefresh("student_deleted");

  return { data: true };
}