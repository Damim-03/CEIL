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
  getGroupDetailsController, // ✅ NEW
  getGroupStudentsController,
  getGroupStatsController, // ✅ NEW

  // Sessions
  getTeacherSessionsController,
  createTeacherSessionController,
  updateTeacherSessionController,
  deleteTeacherSessionController,

  // Schedule
  getTeacherScheduleController, // ✅ NEW

  // Attendance
  getSessionAttendanceController,
  markSessionAttendanceController,
  markBulkAttendanceController,
  getStudentAttendanceController, // ✅ NEW

  // Exams
  getTeacherExamsController,
  createTeacherExamController,
  updateTeacherExamController,
  deleteTeacherExamController,

  // Results
  getExamResultsController,
  addExamResultController,
  addBulkExamResultsController,
  getStudentResultsController, // ✅ NEW

  // Announcements
  getTeacherAnnouncementsController, // ✅ NEW
  getTeacherAnnouncementByIdController, // ✅ NEW

  getTeacherRoomsOverviewController 
} from "../../controllers/Teachers/teacher.controller";
import {
  getMyNotificationsController,
  getUnreadCountController,
  markAllNotificationsReadController,
  markNotificationReadController,
} from "../../controllers/admin/Notification.controller";

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
   SCHEDULE (upcoming sessions)                    ✅ NEW
====================================================== */

teacherRoutes.get(
  "/me/schedule",
  authMiddleware,
  roleGuard([Permissions.VIEW_ASSIGNED_COURSES]),
  getTeacherScheduleController,
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

// ✅ NEW — Full group details (must be BEFORE /:groupId/students)
teacherRoutes.get(
  "/me/groups/:groupId",
  authMiddleware,
  roleGuard([Permissions.VIEW_ASSIGNED_COURSES]),
  getGroupDetailsController,
);

teacherRoutes.get(
  "/me/groups/:groupId/students",
  authMiddleware,
  roleGuard([Permissions.VIEW_STUDENTS]),
  getGroupStudentsController,
);

// ✅ NEW — Group statistics (attendance, grades, etc.)
teacherRoutes.get(
  "/me/groups/:groupId/stats",
  authMiddleware,
  roleGuard([Permissions.VIEW_ASSIGNED_COURSES]),
  getGroupStatsController,
);

/* ======================================================
   STUDENTS — Attendance & Results per student     ✅ NEW
====================================================== */

// ✅ NEW — Student's attendance history across teacher's groups
teacherRoutes.get(
  "/me/students/:studentId/attendance",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ATTENDANCE]),
  getStudentAttendanceController,
);

// ✅ NEW — Student's exam results in teacher's courses
teacherRoutes.get(
  "/me/students/:studentId/results",
  authMiddleware,
  roleGuard([Permissions.ENTER_RESULTS]),
  getStudentResultsController,
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

teacherRoutes.get(
  "/rooms/overview", 
  authMiddleware, 
  roleGuard([Permissions.VIEW_ROOMS]),
  getTeacherRoomsOverviewController);

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

/* ======================================================
   ANNOUNCEMENTS (read-only, published only)       ✅ NEW
====================================================== */

teacherRoutes.get(
  "/me/announcements",
  authMiddleware,
  roleGuard([Permissions.VIEW_ASSIGNED_COURSES]),
  getTeacherAnnouncementsController,
);

teacherRoutes.get(
  "/me/announcements/:announcementId",
  authMiddleware,
  roleGuard([Permissions.VIEW_ASSIGNED_COURSES]),
  getTeacherAnnouncementByIdController,
);

/* ======================================================
   NOTIFICATIONS
====================================================== */

teacherRoutes.get(
  "/notifications",
  authMiddleware,
  getMyNotificationsController,
);

teacherRoutes.get(
  "/notifications/unread-count",
  authMiddleware,
  getUnreadCountController,
);

teacherRoutes.patch(
  "/notifications/read-all",
  authMiddleware,
  markAllNotificationsReadController,
);

teacherRoutes.patch(
  "/notifications/:recipientId/read",
  authMiddleware,
  markNotificationReadController,
);

export default teacherRoutes;
