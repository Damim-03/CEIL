"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const roleGuard_1 = require("../../utils/roleGuard");
const role_enum_1 = require("../../enums/role.enum");
const admin_controller_1 = require("../../controllers/admin/admin.controller");
const document_controller_1 = require("../../controllers/admin/document.controller");
const adminRoutes = (0, express_1.Router)();
adminRoutes.patch("/documents/:id/review", document_controller_1.reviewDocumentController);
/* ======================================================
   USERS
====================================================== */
adminRoutes.get("/users", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_USERS]), admin_controller_1.getAllUsersController);
adminRoutes.get("/users/:userId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_USERS]), admin_controller_1.getUserByIdController);
adminRoutes.patch("/users/:userId/role", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_USERS]), admin_controller_1.changeUserRoleController);
adminRoutes.patch("/users/:userId/enable", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_USERS]), admin_controller_1.enableUserController);
adminRoutes.patch("/users/:userId/disable", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_USERS]), admin_controller_1.disableUserController);
/* ======================================================
   STUDENTS
====================================================== */
adminRoutes.post("/students", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_STUDENTS]), admin_controller_1.createStudentController);
adminRoutes.get("/students", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_STUDENTS]), admin_controller_1.getAllStudentsController);
adminRoutes.get("/students/:studentId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_STUDENTS]), admin_controller_1.getStudentByIdController);
adminRoutes.put("/students/:studentId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_STUDENTS]), admin_controller_1.updateStudentController);
adminRoutes.delete("/students/:studentId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_STUDENTS]), admin_controller_1.deleteStudentController);
/* ======================================================
   TEACHERS
====================================================== */
adminRoutes.post("/teachers", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_TEACHERS]), admin_controller_1.createTeacherController);
adminRoutes.get("/teachers", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_TEACHERS]), admin_controller_1.getAllTeachersController);
adminRoutes.get("/teachers/:teacherId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_TEACHERS]), admin_controller_1.getTeacherByIdController);
adminRoutes.put("/teachers/:teacherId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_TEACHERS]), admin_controller_1.updateTeacherController);
adminRoutes.delete("/teachers/:teacherId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_TEACHERS]), admin_controller_1.deleteTeacherController);
/* ======================================================
   COURSES
====================================================== */
adminRoutes.post("/courses", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_COURSES]), admin_controller_1.createCourseController);
adminRoutes.get("/courses", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_COURSES]), admin_controller_1.getAllCoursesController);
adminRoutes.get("/courses/:courseId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_COURSES]), admin_controller_1.getCourseByIdController);
adminRoutes.put("/courses/:courseId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_COURSES]), admin_controller_1.updateCourseController);
adminRoutes.delete("/courses/:courseId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_COURSES]), admin_controller_1.deleteCourseController);
/* ======================================================
   DEPARTMENTS
====================================================== */
adminRoutes.post("/departments", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_CLASSES]), admin_controller_1.createDepartmentController);
adminRoutes.get("/departments", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_CLASSES]), admin_controller_1.getAllDepartmentsController);
adminRoutes.get("/departments/:departmentId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_CLASSES]), admin_controller_1.getDepartmentByIdController);
adminRoutes.put("/departments/:departmentId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_CLASSES]), admin_controller_1.updateDepartmentController);
adminRoutes.delete("/departments/:departmentId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_CLASSES]), admin_controller_1.deleteDepartmentController);
/* ======================================================
   GROUPS
====================================================== */
adminRoutes.post("/groups", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_CLASSES]), admin_controller_1.createGroupController);
adminRoutes.get("/groups", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_CLASSES]), admin_controller_1.getAllGroupsController);
adminRoutes.get("/groups/:groupId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_CLASSES]), admin_controller_1.getGroupByIdController);
adminRoutes.put("/groups/:groupId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_CLASSES]), admin_controller_1.updateGroupController);
adminRoutes.delete("/groups/:groupId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_CLASSES]), admin_controller_1.deleteGroupController);
adminRoutes.post("/groups/:groupId/students/:studentId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_CLASSES]), admin_controller_1.addStudentToGroupController);
adminRoutes.delete("/groups/:groupId/students/:studentId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_CLASSES]), admin_controller_1.removeStudentFromGroupController);
/* ======================================================
   FEES
====================================================== */
adminRoutes.post("/fees", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_FEES]), admin_controller_1.createFeeController);
adminRoutes.get("/fees", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_FEES]), admin_controller_1.getAllFeesController);
adminRoutes.get("/fees/:feeId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_FEES]), admin_controller_1.getFeeByIdController);
adminRoutes.put("/fees/:feeId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_FEES]), admin_controller_1.updateFeeController);
adminRoutes.patch("/fees/:feeId/pay", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_FEES]), admin_controller_1.markFeeAsPaidController);
adminRoutes.delete("/fees/:feeId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_FEES]), admin_controller_1.deleteFeeController);
/* ======================================================
   ENROLLMENTS
====================================================== */
adminRoutes.get("/enrollments", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_ENROLLMENTS]), admin_controller_1.getAllEnrollmentsController);
adminRoutes.get("/enrollments/:enrollmentId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_ENROLLMENTS]), admin_controller_1.getEnrollmentByIdController);
adminRoutes.patch("/enrollments/:enrollmentId/validate", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_ENROLLMENTS]), admin_controller_1.validateEnrollmentController);
adminRoutes.patch("/enrollments/:enrollmentId/reject", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_ENROLLMENTS]), admin_controller_1.rejectEnrollmentController);
adminRoutes.patch("/enrollments/:enrollmentId/mark-paid", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_ENROLLMENTS]), admin_controller_1.markEnrollmentPaidController);
adminRoutes.patch("/enrollments/:enrollmentId/finish", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_ENROLLMENTS]), admin_controller_1.finishEnrollmentController);
/* ======================================================
   DOCUMENTS
====================================================== */
adminRoutes.get("/documents", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_DOCUMENTS]), admin_controller_1.getAllDocumentsController);
adminRoutes.get("/documents/:documentId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_DOCUMENTS]), admin_controller_1.getDocumentByIdController);
adminRoutes.delete("/documents/:documentId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_DOCUMENTS]), admin_controller_1.deleteDocumentController);
/* ======================================================
   SESSIONS
====================================================== */
adminRoutes.post("/sessions", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_SESSIONS]), admin_controller_1.createSessionController);
adminRoutes.get("/sessions", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_SESSIONS]), admin_controller_1.getAllSessionsController);
adminRoutes.get("/sessions/:sessionId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_SESSIONS]), admin_controller_1.getSessionByIdController);
adminRoutes.put("/sessions/:sessionId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_SESSIONS]), admin_controller_1.updateSessionController);
adminRoutes.delete("/sessions/:sessionId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_SESSIONS]), admin_controller_1.deleteSessionController);
/* ======================================================
   ATTENDANCE
====================================================== */
adminRoutes.post("/sessions/:sessionId/attendance", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_ATTENDANCE]), admin_controller_1.markAttendanceController);
adminRoutes.get("/sessions/:sessionId/attendance", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_ATTENDANCE]), admin_controller_1.getAttendanceBySessionController);
adminRoutes.get("/students/:studentId/attendance", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_ATTENDANCE]), admin_controller_1.getAttendanceByStudentController);
adminRoutes.put("/attendance/:attendanceId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_ATTENDANCE]), admin_controller_1.updateAttendanceController);
/* ======================================================
   EXAMS & RESULTS
====================================================== */
adminRoutes.post("/exams", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_EXAMS]), admin_controller_1.createExamController);
adminRoutes.get("/exams", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_EXAMS]), admin_controller_1.getAllExamsController);
adminRoutes.get("/exams/:examId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_EXAMS]), admin_controller_1.getExamByIdController);
adminRoutes.put("/exams/:examId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_EXAMS]), admin_controller_1.updateExamController);
adminRoutes.delete("/exams/:examId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_EXAMS]), admin_controller_1.deleteExamController);
adminRoutes.post("/exams/:examId/results", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_RESULTS]), admin_controller_1.addExamResultsController);
adminRoutes.get("/exams/:examId/results", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_RESULTS]), admin_controller_1.getResultsByExamController);
adminRoutes.get("/students/:studentId/results", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_RESULTS]), admin_controller_1.getResultsByStudentController);
adminRoutes.put("/results/:resultId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_RESULTS]), admin_controller_1.updateResultController);
/* ======================================================
   PERMISSIONS
====================================================== */
adminRoutes.post("/permissions", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_PERMISSIONS]), admin_controller_1.createPermissionController);
adminRoutes.get("/permissions", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_PERMISSIONS]), admin_controller_1.getAllPermissionsController);
adminRoutes.post("/students/:studentId/permissions", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_PERMISSIONS]), admin_controller_1.assignPermissionToStudentController);
adminRoutes.delete("/students/:studentId/permissions/:permissionId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_PERMISSIONS]), admin_controller_1.removePermissionFromStudentController);
/* ======================================================
   DASHBOARD
====================================================== */
adminRoutes.get("/dashboard/stats", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.VIEW_REPORTS]), admin_controller_1.getAdminDashboardStatsController);
/* ======================================================
   REPORTS
====================================================== */
adminRoutes.get("/reports/students", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.VIEW_REPORTS]), admin_controller_1.getStudentsReportController);
adminRoutes.get("/reports/groups", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.VIEW_REPORTS]), admin_controller_1.getGroupsReportController);
adminRoutes.get("/reports/payments", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.VIEW_REPORTS]), admin_controller_1.getPaymentsReportController);
adminRoutes.get("/reports/attendance", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.VIEW_REPORTS]), admin_controller_1.getAttendanceReportController);
adminRoutes.get("/reports/enrollments", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.VIEW_REPORTS]), admin_controller_1.getEnrollmentsReportController);
exports.default = adminRoutes;
//# sourceMappingURL=admin.route.js.map