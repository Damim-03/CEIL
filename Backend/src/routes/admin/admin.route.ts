import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../enums/role.enum";

import {
  /* ================= USERS ================= */
  changeUserRoleController,
  getAllUsersController,
  getUserByIdController,
  enableUserController,
  disableUserController,

  /* ================= STUDENTS ================= */
  createStudentController,
  getAllStudentsController,
  getStudentByIdController,
  updateStudentController,
  deleteStudentController,

  /* ================= TEACHERS ================= */
  createTeacherController,
  getAllTeachersController,
  getTeacherByIdController,
  updateTeacherController,
  deleteTeacherController,

  /* ================= COURSES ================= */
  createCourseController,
  getAllCoursesController,
  getCourseByIdController,
  updateCourseController,
  deleteCourseController,

  /* ================= DEPARTMENTS ================= */
  createDepartmentController,
  getAllDepartmentsController,
  getDepartmentByIdController,
  updateDepartmentController,
  deleteDepartmentController,

  /* ================= GROUPS ================= */
  createGroupController,
  getAllGroupsController,
  getGroupByIdController,
  updateGroupController,
  deleteGroupController,

  /* ================= FEES ================= */
  createFeeController,
  getAllFeesController,
  getFeeByIdController,
  updateFeeController,
  deleteFeeController,
  markFeeAsPaidController,

  /* ================= ENROLLMENTS ================= */
  getAllEnrollmentsController,
  getEnrollmentByIdController,
  validateEnrollmentController,
  finishEnrollmentController,
  markEnrollmentPaidController,
  rejectEnrollmentController,

  /* ================= SESSIONS ================= */
  createSessionController,
  getAllSessionsController,
  getSessionByIdController,
  updateSessionController,
  deleteSessionController,

  /* ================= ATTENDANCE ================= */
  markAttendanceController,
  getAttendanceBySessionController,
  getAttendanceByStudentController,
  updateAttendanceController,

  /* ================= EXAMS ================= */
  createExamController,
  getAllExamsController,
  getExamByIdController,
  updateExamController,
  deleteExamController,

  /* ================= RESULTS ================= */
  addExamResultsController,
  getResultsByExamController,
  getResultsByStudentController,
  updateResultController,

  /* ================= PERMISSIONS ================= */
  createPermissionController,
  getAllPermissionsController,
  assignPermissionToStudentController,
  removePermissionFromStudentController,

  /* ================= DASHBOARD ================= */
  getAdminDashboardStatsController,
  deleteDocumentController,
  getAllDocumentsController,
  getDocumentByIdController,
  addStudentToGroupController,
  removeStudentFromGroupController,
  getStudentsReportController,
  getAttendanceReportController,
  getEnrollmentsReportController,
  getGroupsReportController,
  getPaymentsReportController,
} from "../../controllers/admin/admin.controller";
import { reviewDocumentController } from "../../controllers/admin/document.controller";

const adminRoutes = Router();

adminRoutes.patch("/documents/:id/review", reviewDocumentController);

/* ======================================================
   USERS
====================================================== */

adminRoutes.get(
  "/users",
  authMiddleware,
  roleGuard([Permissions.MANAGE_USERS]),
  getAllUsersController
);

adminRoutes.get(
  "/users/:userId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_USERS]),
  getUserByIdController
);

adminRoutes.patch(
  "/users/:userId/role",
  authMiddleware,
  roleGuard([Permissions.MANAGE_USERS]),
  changeUserRoleController
);

adminRoutes.patch(
  "/users/:userId/enable",
  authMiddleware,
  roleGuard([Permissions.MANAGE_USERS]),
  enableUserController
);

adminRoutes.patch(
  "/users/:userId/disable",
  authMiddleware,
  roleGuard([Permissions.MANAGE_USERS]),
  disableUserController
);

/* ======================================================
   STUDENTS
====================================================== */

adminRoutes.post(
  "/students",
  authMiddleware,
  roleGuard([Permissions.MANAGE_STUDENTS]),
  createStudentController
);

adminRoutes.get(
  "/students",
  authMiddleware,
  roleGuard([Permissions.MANAGE_STUDENTS]),
  getAllStudentsController
);

adminRoutes.get(
  "/students/:studentId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_STUDENTS]),
  getStudentByIdController
);

adminRoutes.put(
  "/students/:studentId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_STUDENTS]),
  updateStudentController
);

adminRoutes.delete(
  "/students/:studentId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_STUDENTS]),
  deleteStudentController
);

/* ======================================================
   TEACHERS
====================================================== */

adminRoutes.post(
  "/teachers",
  authMiddleware,
  roleGuard([Permissions.MANAGE_TEACHERS]),
  createTeacherController
);

adminRoutes.get(
  "/teachers",
  authMiddleware,
  roleGuard([Permissions.MANAGE_TEACHERS]),
  getAllTeachersController
);

adminRoutes.get(
  "/teachers/:teacherId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_TEACHERS]),
  getTeacherByIdController
);

adminRoutes.put(
  "/teachers/:teacherId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_TEACHERS]),
  updateTeacherController
);

adminRoutes.delete(
  "/teachers/:teacherId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_TEACHERS]),
  deleteTeacherController
);

/* ======================================================
   COURSES
====================================================== */

adminRoutes.post(
  "/courses",
  authMiddleware,
  roleGuard([Permissions.MANAGE_COURSES]),
  createCourseController
);

adminRoutes.get(
  "/courses",
  authMiddleware,
  roleGuard([Permissions.MANAGE_COURSES]),
  getAllCoursesController
);

adminRoutes.get(
  "/courses/:courseId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_COURSES]),
  getCourseByIdController
);

adminRoutes.put(
  "/courses/:courseId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_COURSES]),
  updateCourseController
);

adminRoutes.delete(
  "/courses/:courseId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_COURSES]),
  deleteCourseController
);

/* ======================================================
   DEPARTMENTS
====================================================== */

adminRoutes.post(
  "/departments",
  authMiddleware,
  roleGuard([Permissions.MANAGE_CLASSES]),
  createDepartmentController
);

adminRoutes.get(
  "/departments",
  authMiddleware,
  roleGuard([Permissions.MANAGE_CLASSES]),
  getAllDepartmentsController
);

adminRoutes.get(
  "/departments/:departmentId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_CLASSES]),
  getDepartmentByIdController
);

adminRoutes.put(
  "/departments/:departmentId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_CLASSES]),
  updateDepartmentController
);

adminRoutes.delete(
  "/departments/:departmentId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_CLASSES]),
  deleteDepartmentController
);

/* ======================================================
   GROUPS
====================================================== */

adminRoutes.post(
  "/groups",
  authMiddleware,
  roleGuard([Permissions.MANAGE_CLASSES]),
  createGroupController
);

adminRoutes.get(
  "/groups",
  authMiddleware,
  roleGuard([Permissions.MANAGE_CLASSES]),
  getAllGroupsController
);

adminRoutes.get(
  "/groups/:groupId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_CLASSES]),
  getGroupByIdController
);

adminRoutes.put(
  "/groups/:groupId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_CLASSES]),
  updateGroupController
);

adminRoutes.delete(
  "/groups/:groupId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_CLASSES]),
  deleteGroupController
);

adminRoutes.post(
  "/groups/:groupId/students/:studentId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_CLASSES]),
  addStudentToGroupController
);

adminRoutes.delete(
  "/groups/:groupId/students/:studentId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_CLASSES]),
  removeStudentFromGroupController
);

/* ======================================================
   FEES
====================================================== */

adminRoutes.post(
  "/fees",
  authMiddleware,
  roleGuard([Permissions.MANAGE_FEES]),
  createFeeController
);

adminRoutes.get(
  "/fees",
  authMiddleware,
  roleGuard([Permissions.MANAGE_FEES]),
  getAllFeesController
);

adminRoutes.get(
  "/fees/:feeId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_FEES]),
  getFeeByIdController
);

adminRoutes.put(
  "/fees/:feeId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_FEES]),
  updateFeeController
);

adminRoutes.patch(
  "/fees/:feeId/pay",
  authMiddleware,
  roleGuard([Permissions.MANAGE_FEES]),
  markFeeAsPaidController
);

adminRoutes.delete(
  "/fees/:feeId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_FEES]),
  deleteFeeController
);

/* ======================================================
   ENROLLMENTS
====================================================== */

adminRoutes.get(
  "/enrollments",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ENROLLMENTS]),
  getAllEnrollmentsController
);

adminRoutes.get(
  "/enrollments/:enrollmentId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ENROLLMENTS]),
  getEnrollmentByIdController
);

adminRoutes.patch(
  "/enrollments/:enrollmentId/validate",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ENROLLMENTS]),
  validateEnrollmentController
);

adminRoutes.patch(
  "/enrollments/:enrollmentId/reject",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ENROLLMENTS]),
  rejectEnrollmentController
);

adminRoutes.patch(
  "/enrollments/:enrollmentId/mark-paid",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ENROLLMENTS]),
  markEnrollmentPaidController
);

adminRoutes.patch(
  "/enrollments/:enrollmentId/finish",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ENROLLMENTS]),
  finishEnrollmentController
);

/* ======================================================
   DOCUMENTS
====================================================== */

adminRoutes.get(
  "/documents",
  authMiddleware,
  roleGuard([Permissions.MANAGE_DOCUMENTS]),
  getAllDocumentsController
);

adminRoutes.get(
  "/documents/:documentId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_DOCUMENTS]),
  getDocumentByIdController
);

adminRoutes.delete(
  "/documents/:documentId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_DOCUMENTS]),
  deleteDocumentController
);

/* ======================================================
   SESSIONS
====================================================== */

adminRoutes.post(
  "/sessions",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  createSessionController
);

adminRoutes.get(
  "/sessions",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  getAllSessionsController
);

adminRoutes.get(
  "/sessions/:sessionId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  getSessionByIdController
);

adminRoutes.put(
  "/sessions/:sessionId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  updateSessionController
);

adminRoutes.delete(
  "/sessions/:sessionId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  deleteSessionController
);

/* ======================================================
   ATTENDANCE
====================================================== */

adminRoutes.post(
  "/sessions/:sessionId/attendance",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ATTENDANCE]),
  markAttendanceController
);

adminRoutes.get(
  "/sessions/:sessionId/attendance",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ATTENDANCE]),
  getAttendanceBySessionController
);

adminRoutes.get(
  "/students/:studentId/attendance",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ATTENDANCE]),
  getAttendanceByStudentController
);

adminRoutes.put(
  "/attendance/:attendanceId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ATTENDANCE]),
  updateAttendanceController
);

/* ======================================================
   EXAMS & RESULTS
====================================================== */

adminRoutes.post(
  "/exams",
  authMiddleware,
  roleGuard([Permissions.MANAGE_EXAMS]),
  createExamController
);

adminRoutes.get(
  "/exams",
  authMiddleware,
  roleGuard([Permissions.MANAGE_EXAMS]),
  getAllExamsController
);

adminRoutes.get(
  "/exams/:examId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_EXAMS]),
  getExamByIdController
);

adminRoutes.put(
  "/exams/:examId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_EXAMS]),
  updateExamController
);

adminRoutes.delete(
  "/exams/:examId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_EXAMS]),
  deleteExamController
);

adminRoutes.post(
  "/exams/:examId/results",
  authMiddleware,
  roleGuard([Permissions.MANAGE_RESULTS]),
  addExamResultsController
);

adminRoutes.get(
  "/exams/:examId/results",
  authMiddleware,
  roleGuard([Permissions.MANAGE_RESULTS]),
  getResultsByExamController
);

adminRoutes.get(
  "/students/:studentId/results",
  authMiddleware,
  roleGuard([Permissions.MANAGE_RESULTS]),
  getResultsByStudentController
);

adminRoutes.put(
  "/results/:resultId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_RESULTS]),
  updateResultController
);

/* ======================================================
   PERMISSIONS
====================================================== */

adminRoutes.post(
  "/permissions",
  authMiddleware,
  roleGuard([Permissions.MANAGE_PERMISSIONS]),
  createPermissionController
);

adminRoutes.get(
  "/permissions",
  authMiddleware,
  roleGuard([Permissions.MANAGE_PERMISSIONS]),
  getAllPermissionsController
);

adminRoutes.post(
  "/students/:studentId/permissions",
  authMiddleware,
  roleGuard([Permissions.MANAGE_PERMISSIONS]),
  assignPermissionToStudentController
);

adminRoutes.delete(
  "/students/:studentId/permissions/:permissionId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_PERMISSIONS]),
  removePermissionFromStudentController
);

/* ======================================================
   DASHBOARD
====================================================== */

adminRoutes.get(
  "/dashboard/stats",
  authMiddleware,
  roleGuard([Permissions.VIEW_REPORTS]),
  getAdminDashboardStatsController
);

/* ======================================================
   REPORTS
====================================================== */

adminRoutes.get(
  "/reports/students",
  authMiddleware,
  roleGuard([Permissions.VIEW_REPORTS]),
  getStudentsReportController
);

adminRoutes.get(
  "/reports/groups",
  authMiddleware,
  roleGuard([Permissions.VIEW_REPORTS]),
  getGroupsReportController
);

adminRoutes.get(
  "/reports/payments",
  authMiddleware,
  roleGuard([Permissions.VIEW_REPORTS]),
  getPaymentsReportController
);

adminRoutes.get(
  "/reports/attendance",
  authMiddleware,
  roleGuard([Permissions.VIEW_REPORTS]),
  getAttendanceReportController
);

adminRoutes.get(
  "/reports/enrollments",
  authMiddleware,
  roleGuard([Permissions.VIEW_REPORTS]),
  getEnrollmentsReportController
);

export default adminRoutes;
