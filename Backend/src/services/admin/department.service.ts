// ================================================================
// 📦 src/services/department.service.ts
// ✅ Department CRUD — shared between Admin & Owner
// ================================================================

import { prisma } from "../../prisma/client";

// ─── CREATE ──────────────────────────────────────────────

export async function createDepartment(input: {
  name: string;
  description?: string;
}) {
  const { name, description } = input;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return { error: "validation" as const };
  }

  const exists = await prisma.department.findUnique({
    where: { name: name.trim() },
  });

  if (exists) return { error: "duplicate_name" as const };

  const department = await prisma.department.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
    },
  });

  return { data: department };
}

// ─── LIST ────────────────────────────────────────────────

export async function listDepartments() {
  return prisma.department.findMany({
    orderBy: { created_at: "desc" },
    include: {
      groups: {
        select: { group_id: true, name: true },
      },
    },
  });
}

// ─── GET BY ID ───────────────────────────────────────────

export async function getDepartmentById(departmentId: string) {
  if (!departmentId) return null;

  return prisma.department.findUnique({
    where: { department_id: departmentId },
    include: {
      groups: {
        include: {
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
            include: {
              student: {
                select: {
                  student_id: true,
                  first_name: true,
                  last_name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

// ─── UPDATE ──────────────────────────────────────────────

export async function updateDepartment(
  departmentId: string,
  input: { name?: string; description?: string },
) {
  const exists = await prisma.department.findUnique({
    where: { department_id: departmentId },
  });

  if (!exists) return { error: "not_found" as const };

  if (input.name && input.name !== exists.name) {
    const duplicate = await prisma.department.findUnique({
      where: { name: input.name },
    });
    if (duplicate) return { error: "duplicate_name" as const };
  }

  const department = await prisma.department.update({
    where: { department_id: departmentId },
    data: {
      name: input.name?.trim(),
      description: input.description?.trim(),
    },
  });

  return { data: department };
}

// ─── DELETE ──────────────────────────────────────────────

export async function deleteDepartment(departmentId: string) {
  const department = await prisma.department.findUnique({
    where: { department_id: departmentId },
    include: { groups: true },
  });

  if (!department) return { error: "not_found" as const };

  if (department.groups.length > 0) {
    return { error: "has_groups" as const };
  }

  await prisma.department.delete({
    where: { department_id: departmentId },
  });

  return { data: true };
}