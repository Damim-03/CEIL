// ================================================================
// 📦 src/services/exam.service.ts
// ✅ Exam & Results CRUD — shared between Admin & Owner
// ================================================================

import { prisma } from "../../prisma/client";

// ══════════════════════════════════════════════
// EXAMS
// ══════════════════════════════════════════════

export async function createExam(input: {
  course_id: string;
  exam_name?: string;
  exam_date: string;
  max_marks: number;
}) {
  const { course_id, exam_name, exam_date, max_marks } = input;

  if (!course_id || !exam_date || !max_marks) {
    return { error: "validation" as const };
  }
  if (max_marks <= 0) return { error: "invalid_marks" as const };

  const course = await prisma.course.findUnique({ where: { course_id } });
  if (!course) return { error: "invalid_course" as const };

  const exam = await prisma.exam.create({
    data: {
      course_id,
      exam_name,
      exam_date: new Date(exam_date),
      max_marks,
    },
  });

  return { data: exam };
}

export async function listExams() {
  return prisma.exam.findMany({
    include: { course: true },
    orderBy: { exam_date: "desc" },
  });
}

export async function getExamById(examId: string) {
  return prisma.exam.findUnique({
    where: { exam_id: examId },
    include: {
      course: true,
      results: { include: { student: true } },
    },
  });
}

export async function updateExam(examId: string, body: Record<string, any>) {
  const exam = await prisma.exam.findUnique({
    where: { exam_id: examId },
    include: { results: true },
  });

  if (!exam) return { error: "not_found" as const };
  if (exam.results.length > 0) return { error: "has_results" as const };

  const allowedFields = ["exam_name", "exam_date", "max_marks"];
  const data = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowedFields.includes(key)),
  );

  const updated = await prisma.exam.update({
    where: { exam_id: examId },
    data,
  });

  return { data: updated };
}

export async function deleteExam(examId: string) {
  const exam = await prisma.exam.findUnique({
    where: { exam_id: examId },
    include: { results: true },
  });

  if (!exam) return { error: "not_found" as const };
  if (exam.results.length > 0) return { error: "has_results" as const };

  await prisma.exam.delete({ where: { exam_id: examId } });
  return { data: true };
}

// ══════════════════════════════════════════════
// RESULTS
// ══════════════════════════════════════════════

export async function addExamResult(
  examId: string,
  input: { studentId: string; marks_obtained: number; grade?: string },
) {
  const { studentId, marks_obtained, grade } = input;

  if (!studentId || marks_obtained == null) {
    return { error: "validation" as const };
  }

  const exam = await prisma.exam.findUnique({ where: { exam_id: examId } });
  if (!exam) return { error: "exam_not_found" as const };

  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
  });
  if (!student) return { error: "student_not_found" as const };

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      student_id_course_id: {
        student_id: studentId,
        course_id: exam.course_id,
      },
    },
  });
  if (!enrollment) return { error: "not_enrolled" as const };

  if (marks_obtained < 0 || marks_obtained > exam.max_marks) {
    return { error: "marks_out_of_range" as const, max: exam.max_marks };
  }

  const result = await prisma.result.upsert({
    where: {
      exam_id_student_id: { exam_id: examId, student_id: studentId },
    },
    update: { marks_obtained, grade },
    create: {
      exam_id: examId,
      student_id: studentId,
      marks_obtained,
      grade,
    },
  });

  return { data: result };
}

export async function getResultsByExam(examId: string) {
  return prisma.result.findMany({
    where: { exam_id: examId },
    include: { student: true },
  });
}

export async function getResultsByStudent(studentId: string) {
  return prisma.result.findMany({
    where: { student_id: studentId },
    include: { exam: true },
  });
}

export async function updateResult(
  resultId: string,
  body: Record<string, any>,
) {
  if (Object.keys(body).length === 0) {
    return { error: "empty_body" as const };
  }

  const allowedFields = ["marks_obtained", "grade"];
  const data = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowedFields.includes(key)),
  );

  const result = await prisma.result.update({
    where: { result_id: resultId },
    data,
  });

  return { data: result };
}