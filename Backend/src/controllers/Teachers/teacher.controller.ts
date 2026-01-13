import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { JwtUser } from "../../middlewares/auth.middleware";

/**
 * =========================
 * TEACHER DASHBOARD
 * =========================
 */
export const teacherDashboardController = async (
  req: Request,
  res: Response
) => {
  const user = (req as Request & { user?: JwtUser }).user;

  return res.json({
    message: "Welcome to Teacher Dashboard",
    teacher_id: user?.user_id,
  });
};

/**
 * =========================
 * VIEW ASSIGNED COURSES
 * =========================
 */
export const getAssignedCoursesController = async (
  req: Request,
  res: Response
) => {
  const user = (req as Request & { user?: JwtUser }).user;

  // 🔜 Replace with real Prisma query
  return res.json({
    teacher_id: user?.user_id,
    courses: [],
  });
};

/**
 * =========================
 * MANAGE ATTENDANCE
 * =========================
 */
export const manageAttendanceController = async (
  req: Request,
  res: Response
) => {
  const { course_id, date, attendance } = req.body;

  // 🔜 Validate & save attendance with Prisma
  return res.json({
    message: "Attendance updated successfully",
  });
};

/**
 * =========================
 * CREATE EXAM
 * =========================
 */
export const createExamController = async (req: Request, res: Response) => {
  const { course_id, title, max_marks, exam_date } = req.body;

  // 🔜 Create exam with Prisma
  return res.status(201).json({
    message: "Exam created successfully",
  });
};

/**
 * =========================
 * UPDATE EXAM
 * =========================
 */
export const updateExamController = async (req: Request, res: Response) => {
  const { examId } = req.params;
  const updateData = req.body;

  // 🔜 Update exam with Prisma
  return res.json({
    message: "Exam updated successfully",
    examId,
  });
};

/**
 * =========================
 * ENTER RESULTS
 * =========================
 */
export const enterResultsController = async (req: Request, res: Response) => {
  const { exam_id, results } = req.body;

  // 🔜 Save results with Prisma
  return res.json({
    message: "Results submitted successfully",
  });
};

/**
 * =========================
 * VIEW STUDENTS
 * =========================
 */
export const viewStudentsController = async (req: Request, res: Response) => {
  const user = (req as Request & { user?: JwtUser }).user;

  // 🔜 Fetch students in teacher courses
  return res.json({
    teacher_id: user?.user_id,
    students: [],
  });
};
