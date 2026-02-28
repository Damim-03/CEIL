// ================================================================
// 📦 src/services/teacher.service.ts
// ✅ Teacher CRUD — shared between Admin & Owner
// 🔌 Socket.IO events included
// ================================================================

import { prisma } from "../../prisma/client";
import { Roles } from "../../enums/role.enum";
import {
  emitToAdminLevel,
  triggerDashboardRefresh,
} from "../socket.service";
import { hashPassword } from "../../utils/password.util";

// ─── Types ───────────────────────────────────────────────

interface CreateTeacherInput {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  password?: string;
}

// ─── CREATE ──────────────────────────────────────────────

export async function createTeacher(input: CreateTeacherInput) {
  const { first_name, last_name, email, phone_number } = input;

  if (!first_name?.trim() || !last_name?.trim() || !email) {
    return { error: "validation" as const };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return { error: "duplicate_email" as const };
  }

  const teacher = await prisma.$transaction(async (tx) => {
    const teacher = await tx.teacher.create({
      data: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.toLowerCase(),
        phone_number: phone_number || null,
      },
    });

    await tx.user.create({
      data: {
        email: email.toLowerCase(),
        password: input.password ? await hashPassword(input.password) : null,
        role: Roles.TEACHER,
        teacher_id: teacher.teacher_id,
      },
    });

    return teacher;
  });

  return { data: teacher };
}

// ─── LIST ────────────────────────────────────────────────

export async function listTeachers() {
  return prisma.teacher.findMany({
    include: {
      groups: {
        include: { course: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
}

// ─── GET BY ID ───────────────────────────────────────────

export async function getTeacherById(teacherId: string) {
  return prisma.teacher.findUnique({
    where: { teacher_id: teacherId },
    include: {
      groups: {
        include: {
          course: true,
          sessions: true,
        },
      },
      user: true,
    },
  });
}

// ─── UPDATE ──────────────────────────────────────────────

export async function updateTeacher(
  teacherId: string,
  body: Record<string, any>,
) {
  if (Object.keys(body).length === 0) {
    return { error: "empty_body" as const };
  }

  const teacher = await prisma.teacher.findUnique({
    where: { teacher_id: teacherId },
  });

  if (!teacher) return { error: "not_found" as const };

  const allowedFields = ["first_name", "last_name", "email", "phone_number"];

  const data = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowedFields.includes(key)),
  );

  const updated = await prisma.teacher.update({
    where: { teacher_id: teacherId },
    data,
  });

  return { data: updated };
}

// ─── DELETE ──────────────────────────────────────────────

export async function deleteTeacher(teacherId: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { teacher_id: teacherId },
    include: {
      groups: { include: { sessions: true } },
    },
  });

  if (!teacher) return { error: "not_found" as const };

  const hasGroups = teacher.groups.length > 0;
  const hasSessions = teacher.groups.some((g) => g.sessions.length > 0);

  if (hasGroups || hasSessions) {
    return { error: "has_dependencies" as const };
  }

  await prisma.teacher.delete({
    where: { teacher_id: teacherId },
  });

  // 🔌 Socket
  emitToAdminLevel("teacher:deleted", { teacher_id: teacherId });
  triggerDashboardRefresh("teacher_deleted");

  return { data: true };
}