// ================================================================
// 📦 src/services/course.service.ts
// ✅ Course CRUD — shared between Admin & Owner
// ================================================================

import { prisma } from "../../prisma/client";

// ─── CREATE ──────────────────────────────────────────────

export async function createCourse(input: {
  course_name: string;
  course_code?: string;
  credits?: number;
}) {
  const { course_name, course_code, credits } = input;

  if (!course_name?.trim()) {
    return { error: "validation" as const };
  }

  if (course_code) {
    const exists = await prisma.course.findFirst({ where: { course_code } });
    if (exists) return { error: "duplicate_code" as const };
  }

  const course = await prisma.course.create({
    data: {
      course_name: course_name.trim(),
      course_code,
      credits,
    },
  });

  return { data: course };
}

// ─── LIST ────────────────────────────────────────────────

export async function listCourses(params: { page?: number; limit?: number } = {}) {
  const page = params.page || 1;
  const limit = params.limit || 20;

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        profile: true,
        groups: { include: { teacher: true } },
      },
      orderBy: { course_name: "asc" },
    }),
    prisma.course.count(),
  ]);

  return {
    data: courses,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

// ─── GET BY ID ───────────────────────────────────────────

export async function getCourseById(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { course_id: courseId },
    include: {
      groups: {
        include: {
          sessions: true,
          teacher: true,
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
      },
    },
  });

  if (!course) return null;

  // Transform groups to include current_capacity
  return {
    ...course,
    groups: course.groups.map((group) => ({
      ...group,
      current_capacity: group._count.enrollments,
    })),
  };
}

// ─── UPDATE ──────────────────────────────────────────────

export async function updateCourse(courseId: string, body: Record<string, any>) {
  if (Object.keys(body).length === 0) {
    return { error: "empty_body" as const };
  }

  const course = await prisma.course.findUnique({
    where: { course_id: courseId },
  });

  if (!course) return { error: "not_found" as const };

  const allowedFields = ["course_name", "course_code", "credits"];
  const data = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowedFields.includes(key)),
  );

  const updated = await prisma.course.update({
    where: { course_id: courseId },
    data,
  });

  return { data: updated };
}

// ─── DELETE ──────────────────────────────────────────────

export async function deleteCourse(courseId: string) {
  await prisma.course.delete({ where: { course_id: courseId } });
  return { data: true };
}