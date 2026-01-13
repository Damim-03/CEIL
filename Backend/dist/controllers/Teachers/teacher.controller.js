"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewStudentsController = exports.enterResultsController = exports.updateExamController = exports.createExamController = exports.manageAttendanceController = exports.getAssignedCoursesController = exports.teacherDashboardController = void 0;
/**
 * =========================
 * TEACHER DASHBOARD
 * =========================
 */
const teacherDashboardController = async (req, res) => {
    const user = req.user;
    return res.json({
        message: "Welcome to Teacher Dashboard",
        teacher_id: user?.user_id,
    });
};
exports.teacherDashboardController = teacherDashboardController;
/**
 * =========================
 * VIEW ASSIGNED COURSES
 * =========================
 */
const getAssignedCoursesController = async (req, res) => {
    const user = req.user;
    // 🔜 Replace with real Prisma query
    return res.json({
        teacher_id: user?.user_id,
        courses: [],
    });
};
exports.getAssignedCoursesController = getAssignedCoursesController;
/**
 * =========================
 * MANAGE ATTENDANCE
 * =========================
 */
const manageAttendanceController = async (req, res) => {
    const { course_id, date, attendance } = req.body;
    // 🔜 Validate & save attendance with Prisma
    return res.json({
        message: "Attendance updated successfully",
    });
};
exports.manageAttendanceController = manageAttendanceController;
/**
 * =========================
 * CREATE EXAM
 * =========================
 */
const createExamController = async (req, res) => {
    const { course_id, title, max_marks, exam_date } = req.body;
    // 🔜 Create exam with Prisma
    return res.status(201).json({
        message: "Exam created successfully",
    });
};
exports.createExamController = createExamController;
/**
 * =========================
 * UPDATE EXAM
 * =========================
 */
const updateExamController = async (req, res) => {
    const { examId } = req.params;
    const updateData = req.body;
    // 🔜 Update exam with Prisma
    return res.json({
        message: "Exam updated successfully",
        examId,
    });
};
exports.updateExamController = updateExamController;
/**
 * =========================
 * ENTER RESULTS
 * =========================
 */
const enterResultsController = async (req, res) => {
    const { exam_id, results } = req.body;
    // 🔜 Save results with Prisma
    return res.json({
        message: "Results submitted successfully",
    });
};
exports.enterResultsController = enterResultsController;
/**
 * =========================
 * VIEW STUDENTS
 * =========================
 */
const viewStudentsController = async (req, res) => {
    const user = req.user;
    // 🔜 Fetch students in teacher courses
    return res.json({
        teacher_id: user?.user_id,
        students: [],
    });
};
exports.viewStudentsController = viewStudentsController;
//# sourceMappingURL=teacher.controller.js.map