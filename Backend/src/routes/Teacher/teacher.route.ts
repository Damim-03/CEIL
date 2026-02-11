import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../enums/role.enum";
import { upload } from "../../middlewares/upload.middleware";
import {
  // Profile
  getTeacherProfileController,
  updateTeacherProfileController,
  updateTeacherAvatarController,

  // Dashboard
  teacherDashboardController,

  // Courses & Groups
  getAssignedGroupsController,
  getGroupStudentsController,

  // Sessions
  getTeacherSessionsController,
  createTeacherSessionController,
  updateTeacherSessionController,
  deleteTeacherSessionController,

  // Attendance
  getSessionAttendanceController,
  markSessionAttendanceController,
  markBulkAttendanceController,

  // Exams
  getTeacherExamsController,
  createTeacherExamController,
  updateTeacherExamController,
  deleteTeacherExamController,

  // Results
  getExamResultsController,
  addExamResultController,
  addBulkExamResultsController,
} from "../../controllers/Teachers/teacher.controller";

const teacherRoutes: Router = Router();

/* ======================================================
   PROFILE
====================================================== */

teacherRoutes.get(
  "/me/profile",
  authMiddleware,
  roleGuard([Permissions.VIEW_ASSIGNED_COURSES]),
  getTeacherProfileController,
);

teacherRoutes.put(
  "/me/profile",
  authMiddleware,
  roleGuard([Permissions.VIEW_ASSIGNED_COURSES]),
  updateTeacherProfileController,
);

teacherRoutes.patch(
  "/me/avatar",
  authMiddleware,
  roleGuard([Permissions.VIEW_ASSIGNED_COURSES]),
  upload.single("avatar"),
  updateTeacherAvatarController,
);

/* ======================================================
   DASHBOARD
====================================================== */

teacherRoutes.get(
  "/me/dashboard",
  authMiddleware,
  roleGuard([Permissions.VIEW_ASSIGNED_COURSES]),
  teacherDashboardController,
);

/* ======================================================
   COURSES & GROUPS
====================================================== */

teacherRoutes.get(
  "/me/groups",
  authMiddleware,
  roleGuard([Permissions.VIEW_ASSIGNED_COURSES]),
  getAssignedGroupsController,
);

teacherRoutes.get(
  "/me/groups/:groupId/students",
  authMiddleware,
  roleGuard([Permissions.VIEW_STUDENTS]),
  getGroupStudentsController,
);

/* ======================================================
   SESSIONS
====================================================== */

teacherRoutes.get(
  "/me/sessions",
  authMiddleware,
  roleGuard([Permissions.VIEW_ASSIGNED_COURSES]),
  getTeacherSessionsController,
);

teacherRoutes.post(
  "/me/sessions",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ATTENDANCE]),
  createTeacherSessionController,
);

teacherRoutes.put(
  "/me/sessions/:sessionId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ATTENDANCE]),
  updateTeacherSessionController,
);

teacherRoutes.delete(
  "/me/sessions/:sessionId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ATTENDANCE]),
  deleteTeacherSessionController,
);

/* ======================================================
   ATTENDANCE
====================================================== */

teacherRoutes.get(
  "/me/sessions/:sessionId/attendance",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ATTENDANCE]),
  getSessionAttendanceController,
);

teacherRoutes.post(
  "/me/sessions/:sessionId/attendance",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ATTENDANCE]),
  markSessionAttendanceController,
);

teacherRoutes.post(
  "/me/sessions/:sessionId/attendance/bulk",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ATTENDANCE]),
  markBulkAttendanceController,
);

/* ======================================================
   EXAMS
====================================================== */

teacherRoutes.get(
  "/me/exams",
  authMiddleware,
  roleGuard([Permissions.CREATE_EXAMS]),
  getTeacherExamsController,
);

teacherRoutes.post(
  "/me/exams",
  authMiddleware,
  roleGuard([Permissions.CREATE_EXAMS]),
  createTeacherExamController,
);

teacherRoutes.put(
  "/me/exams/:examId",
  authMiddleware,
  roleGuard([Permissions.UPDATE_EXAMS]),
  updateTeacherExamController,
);

teacherRoutes.delete(
  "/me/exams/:examId",
  authMiddleware,
  roleGuard([Permissions.CREATE_EXAMS]),
  deleteTeacherExamController,
);

/* ======================================================
   RESULTS
====================================================== */

teacherRoutes.get(
  "/me/exams/:examId/results",
  authMiddleware,
  roleGuard([Permissions.ENTER_RESULTS]),
  getExamResultsController,
);

teacherRoutes.post(
  "/me/exams/:examId/results",
  authMiddleware,
  roleGuard([Permissions.ENTER_RESULTS]),
  addExamResultController,
);

teacherRoutes.post(
  "/me/exams/:examId/results/bulk",
  authMiddleware,
  roleGuard([Permissions.ENTER_RESULTS]),
  addBulkExamResultsController,
);

export default teacherRoutes;