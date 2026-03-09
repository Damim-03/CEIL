// ================================================================
// 📌 src/routes/owner/owner.routes.ts
// ✅ Zod validation on all routes
// ✅ Rate limiting on sensitive operations
// ✅ Secure file uploads with type/size checks
// ✅ FIXED: Activity enhanced routes BEFORE legacy to avoid 401
// ================================================================

import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ownerOnly } from "../../utils/roleGuard";
import {
  validate,
  validateBody,
  validateParams,
  validateQuery,
} from "../../middlewares/validate.middleware";
import {
  sensitiveLimit,
  adminCreateLimit,
  destructiveLimit,
  broadcastLimit,
  uploadLimit,
} from "../../middlewares/Ratelimiter.middleware";
import {
  uploadAvatar,
  uploadImage,
  handleUploadError,
} from "../../middlewares/upload.middleware";

// ─── Validation Schemas ──────────────────────────────────
import {
  userIdParam,
  studentIdParam,
  teacherIdParam,
  courseIdParam,
  departmentIdParam,
  groupIdParam,
  enrollmentIdParam,
  documentIdParam,
  sessionIdParam,
  attendanceIdParam,
  examIdParam,
  resultIdParam,
  feeIdParam,
  announcementIdParam,
  notificationIdParam,
  roomIdParam,
  groupStudentParams,
  studentPermissionParams,
  coursePricingParams,
  createAdminSchema,
  cleanupAuditSchema,
  updateSettingsSchema,
  changeUserRoleSchema,
  createFeeSchema,
  updateFeeSchema,
  markFeePaidSchema,
  createStudentSchema,
  updateStudentSchema,
  createTeacherSchema,
  updateTeacherSchema,
  createCourseSchema,
  updateCourseSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  createGroupSchema,
  updateGroupSchema,
  assignInstructorSchema,
  changeEnrollmentStatusSchema,
  rejectEnrollmentSchema,
  validateEnrollmentSchema,
  createSessionSchema,
  updateSessionSchema,
  markAttendanceSchema,
  updateAttendanceSchema,
  createExamSchema,
  updateExamSchema,
  addResultSchema,
  updateResultSchema,
  createPermissionSchema,
  assignPermissionSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  upsertCourseProfileSchema,
  createPricingSchema,
  updatePricingSchema,
  sendNotificationSchema,
  createRoomSchema,
  updateRoomSchema,
  auditLogQuerySchema,
  usersQuerySchema,
  feesQuerySchema,
  activityQuerySchema,
  announcementQuerySchema,
  notificationQuerySchema,
  roomScheduleQuerySchema,
  roomAvailabilityQuerySchema,
  roomsOverviewQuerySchema,
  feeAnalyticsQuerySchema,
} from "../../validations/owner.validation";

// ─── Controllers ─────────────────────────────────────────
import {
  getOwnerDashboardController,
  getAllAdminsController,
  createAdminController,
  activateAdminController,
  deactivateAdminController,
  deleteAdminController,
  promoteToOwnerController,
  ownerChangeUserRoleController,
  getAuditLogsController,
  getAuditLogStatsController,
  cleanupAuditLogsController,
  getSystemSettingsController,
  updateSystemSettingsController,
  getAllUsersFullController,
  getSystemHealthController,
  getDetailedSystemStatsController,
  ownerGetAllFeesController,
  ownerGetFeeByIdController,
  ownerCreateFeeController,
  ownerUpdateFeeController,
  ownerMarkFeeAsPaidController,
  ownerDeleteFeeController,
  ownerGetRevenueController,
  ownerChangeEnrollmentStatusController,
  ownerDeleteEnrollmentController,
  ownerBroadcastNotificationController,
  ownerGetUserActivityController,
  ownerGetUserActivityByIdController,
  ownerGetFeeAnalyticsController,
  ownerGetUserByIdController,
  ownerEnableUserController,
  ownerDisableUserController,
  ownerCreateStudentController,
  ownerGetAllStudentsController,
  ownerGetStudentByIdController,
  ownerUpdateStudentController,
  ownerDeleteStudentController,
  ownerUpdateStudentAvatarController,
  ownerCreateTeacherController,
  ownerGetAllTeachersController,
  ownerGetTeacherByIdController,
  ownerUpdateTeacherController,
  ownerDeleteTeacherController,
  ownerCreateCourseController,
  ownerGetAllCoursesController,
  ownerGetCourseByIdController,
  ownerUpdateCourseController,
  ownerDeleteCourseController,
  ownerCreateDepartmentController,
  ownerGetAllDepartmentsController,
  ownerGetDepartmentByIdController,
  ownerUpdateDepartmentController,
  ownerDeleteDepartmentController,
  ownerCreateGroupController,
  ownerGetAllGroupsController,
  ownerGetGroupByIdController,
  ownerUpdateGroupController,
  ownerDeleteGroupController,
  ownerAddStudentToGroupController,
  ownerRemoveStudentFromGroupController,
  ownerAssignInstructorToGroupController,
  ownerGetAllEnrollmentsController,
  ownerGetEnrollmentByIdController,
  ownerValidateEnrollmentController,
  ownerRejectEnrollmentController,
  ownerMarkEnrollmentPaidController,
  ownerFinishEnrollmentController,
  ownerGetAllDocumentsController,
  ownerGetDocumentByIdController,
  ownerApproveDocumentController,
  ownerRejectDocumentController,
  ownerDeleteDocumentController,
  ownerCreateSessionController,
  ownerGetAllSessionsController,
  ownerGetSessionByIdController,
  ownerUpdateSessionController,
  ownerDeleteSessionController,
  ownerMarkAttendanceController,
  ownerGetAttendanceBySessionController,
  ownerGetAttendanceByStudentController,
  ownerUpdateAttendanceController,
  ownerCreateExamController,
  ownerGetAllExamsController,
  ownerGetExamByIdController,
  ownerUpdateExamController,
  ownerDeleteExamController,
  ownerAddExamResultsController,
  ownerGetResultsByExamController,
  ownerGetResultsByStudentController,
  ownerUpdateResultController,
  ownerCreatePermissionController,
  ownerGetAllPermissionsController,
  ownerAssignPermissionToStudentController,
  ownerRemovePermissionFromStudentController,
  ownerGetDashboardStatsController,
  ownerGetStudentsReportController,
  ownerGetGroupsReportController,
  ownerGetPaymentsReportController,
  ownerGetAttendanceReportController,
  ownerGetEnrollmentsReportController,
  ownerUpdateAvatarController,
  ownerCreateAnnouncementController,
  ownerGetAllAnnouncementsController,
  ownerGetAnnouncementByIdController,
  ownerUpdateAnnouncementController,
  ownerDeleteAnnouncementController,
  ownerPublishAnnouncementController,
  ownerUnpublishAnnouncementController,
  ownerCreateOrUpdateCourseProfileController,
  ownerGetCourseProfileController,
  ownerPublishCourseProfileController,
  ownerUnpublishCourseProfileController,
  ownerGetCoursePricingController,
  ownerAddCoursePricingController,
  ownerUpdateCoursePricingController,
  ownerDeleteCoursePricingController,
  ownerGetNotificationTargetsController,
  ownerSendNotificationController,
  ownerGetAllNotificationsController,
  ownerGetNotificationByIdController,
  ownerDeleteNotificationController,
  ownerSearchStudentsController,
  ownerCreateRoomController,
  ownerGetAllRoomsController,
  ownerGetRoomByIdController,
  ownerUpdateRoomController,
  ownerDeleteRoomController,
  ownerGetRoomScheduleController,
  ownerGetRoomsScheduleOverviewController,
  ownerCheckRoomAvailabilityController,
  ownerCorrectFeeAmountController,
} from "../../controllers/owner/owner.controller";

import {
  getOnlineUsersController,
  getPresenceStatsController,
  getRecentSessionsController,
  getActivityTimelineController,
  getLoginHistoryController,
  getUserOnlineStatusController,
} from "../../controllers/owner/Activity.controller";

const ownerRoutes = Router();
ownerRoutes.use(authMiddleware, ownerOnly());

// ╔═══════════════════════════════════════════════════════════════╗
// ║  SECTION A: OWNER-EXCLUSIVE                                  ║
// ╚═══════════════════════════════════════════════════════════════╝

/* ═══ Dashboard ═══ */
ownerRoutes.get("/dashboard", getOwnerDashboardController);

/* ═══ Admin Management ═══ */
ownerRoutes.get("/admins", getAllAdminsController);
ownerRoutes.post(
  "/admins",
  adminCreateLimit,
  validateBody(createAdminSchema),
  createAdminController,
);
ownerRoutes.patch(
  "/admins/:userId/activate",
  validateParams(userIdParam),
  sensitiveLimit,
  activateAdminController,
);
ownerRoutes.patch(
  "/admins/:userId/deactivate",
  validateParams(userIdParam),
  sensitiveLimit,
  deactivateAdminController,
);
ownerRoutes.patch(
  "/admins/:userId/promote",
  validateParams(userIdParam),
  sensitiveLimit,
  promoteToOwnerController,
);
ownerRoutes.delete(
  "/admins/:userId",
  validateParams(userIdParam),
  sensitiveLimit,
  deleteAdminController,
);

/* ═══ Audit Logs ═══ */
ownerRoutes.get(
  "/audit-logs",
  validateQuery(auditLogQuerySchema),
  getAuditLogsController,
);
ownerRoutes.get("/audit-logs/stats", getAuditLogStatsController);
ownerRoutes.delete(
  "/audit-logs/cleanup",
  sensitiveLimit,
  validateBody(cleanupAuditSchema),
  cleanupAuditLogsController,
);

/* ═══ System Settings ═══ */
ownerRoutes.get("/settings", getSystemSettingsController);
ownerRoutes.put(
  "/settings",
  sensitiveLimit,
  validateBody(updateSettingsSchema),
  updateSystemSettingsController,
);

/* ═══ System Health ═══ */
ownerRoutes.get("/system/health", getSystemHealthController);
ownerRoutes.get("/system/stats", getDetailedSystemStatsController);

/* ═══════════════════════════════════════════════════════════════
   ═══ Activity Tracking — Enhanced MUST come FIRST ═══
   ═══ These specific paths must match before /activity/user/:userId
   ═══════════════════════════════════════════════════════════════ */
ownerRoutes.get("/activity/online", getOnlineUsersController);
ownerRoutes.get("/activity/presence-stats", getPresenceStatsController);
ownerRoutes.get("/activity/sessions", getRecentSessionsController);
ownerRoutes.get("/activity/timeline", getActivityTimelineController);
ownerRoutes.get("/activity/login-history", getLoginHistoryController);
ownerRoutes.get(
  "/activity/user/:userId/online",
  validateParams(userIdParam),
  getUserOnlineStatusController,
);

/* ═══ Activity (Legacy) — AFTER enhanced routes ═══ */
ownerRoutes.get(
  "/activity",
  validateQuery(activityQuerySchema),
  ownerGetUserActivityController,
);
ownerRoutes.get(
  "/activity/user/:userId",
  validateParams(userIdParam),
  ownerGetUserActivityByIdController,
);

/* ═══ Fee Analytics ═══ */
ownerRoutes.get(
  "/fees/analytics",
  validateQuery(feeAnalyticsQuerySchema),
  ownerGetFeeAnalyticsController,
);

// ╔═══════════════════════════════════════════════════════════════╗
// ║  SECTION B: ALL CAPABILITIES                                 ║
// ╚═══════════════════════════════════════════════════════════════╝

/* ═══ Avatar ═══ */
ownerRoutes.patch(
  "/me/avatar",
  uploadLimit,
  uploadAvatar.single("avatar"),
  handleUploadError,
  ownerUpdateAvatarController,
);

/* ═══ Users ═══ */
ownerRoutes.get(
  "/users",
  validateQuery(usersQuerySchema),
  getAllUsersFullController,
);
ownerRoutes.get(
  "/users/:userId",
  validateParams(userIdParam),
  ownerGetUserByIdController,
);
ownerRoutes.patch(
  "/users/:userId/role",
  validateParams(userIdParam),
  sensitiveLimit,
  validateBody(changeUserRoleSchema),
  ownerChangeUserRoleController,
);
ownerRoutes.patch(
  "/users/:userId/enable",
  validateParams(userIdParam),
  sensitiveLimit,
  ownerEnableUserController,
);
ownerRoutes.patch(
  "/users/:userId/disable",
  validateParams(userIdParam),
  sensitiveLimit,
  ownerDisableUserController,
);

/* ═══ Students ═══ */
ownerRoutes.post(
  "/students",
  validateBody(createStudentSchema),
  ownerCreateStudentController,
);
ownerRoutes.get("/students", ownerGetAllStudentsController);
ownerRoutes.get(
  "/students/:studentId",
  validateParams(studentIdParam),
  ownerGetStudentByIdController,
);
ownerRoutes.put(
  "/students/:studentId",
  validateParams(studentIdParam),
  validateBody(updateStudentSchema),
  ownerUpdateStudentController,
);
ownerRoutes.delete(
  "/students/:studentId",
  validateParams(studentIdParam),
  destructiveLimit,
  ownerDeleteStudentController,
);
ownerRoutes.patch(
  "/students/:studentId/avatar",
  validateParams(studentIdParam),
  uploadLimit,
  uploadAvatar.single("avatar"),
  handleUploadError,
  ownerUpdateStudentAvatarController,
);

/* ═══ Teachers ═══ */
ownerRoutes.post(
  "/teachers",
  validateBody(createTeacherSchema),
  ownerCreateTeacherController,
);
ownerRoutes.get("/teachers", ownerGetAllTeachersController);
ownerRoutes.get(
  "/teachers/:teacherId",
  validateParams(teacherIdParam),
  ownerGetTeacherByIdController,
);
ownerRoutes.put(
  "/teachers/:teacherId",
  validateParams(teacherIdParam),
  validateBody(updateTeacherSchema),
  ownerUpdateTeacherController,
);
ownerRoutes.delete(
  "/teachers/:teacherId",
  validateParams(teacherIdParam),
  destructiveLimit,
  ownerDeleteTeacherController,
);

/* ═══ Courses ═══ */
ownerRoutes.post(
  "/courses",
  validateBody(createCourseSchema),
  ownerCreateCourseController,
);
ownerRoutes.get("/courses", ownerGetAllCoursesController);
ownerRoutes.get(
  "/courses/:courseId",
  validateParams(courseIdParam),
  ownerGetCourseByIdController,
);
ownerRoutes.put(
  "/courses/:courseId",
  validateParams(courseIdParam),
  validateBody(updateCourseSchema),
  ownerUpdateCourseController,
);
ownerRoutes.delete(
  "/courses/:courseId",
  validateParams(courseIdParam),
  destructiveLimit,
  ownerDeleteCourseController,
);

/* ═══ Departments ═══ */
ownerRoutes.post(
  "/departments",
  validateBody(createDepartmentSchema),
  ownerCreateDepartmentController,
);
ownerRoutes.get("/departments", ownerGetAllDepartmentsController);
ownerRoutes.get(
  "/departments/:departmentId",
  validateParams(departmentIdParam),
  ownerGetDepartmentByIdController,
);
ownerRoutes.put(
  "/departments/:departmentId",
  validateParams(departmentIdParam),
  validateBody(updateDepartmentSchema),
  ownerUpdateDepartmentController,
);
ownerRoutes.delete(
  "/departments/:departmentId",
  validateParams(departmentIdParam),
  destructiveLimit,
  ownerDeleteDepartmentController,
);

/* ═══ Groups ═══ */
ownerRoutes.post(
  "/groups",
  validateBody(createGroupSchema),
  ownerCreateGroupController,
);
ownerRoutes.get("/groups", ownerGetAllGroupsController);
ownerRoutes.get(
  "/groups/:groupId",
  validateParams(groupIdParam),
  ownerGetGroupByIdController,
);
ownerRoutes.put(
  "/groups/:groupId",
  validateParams(groupIdParam),
  validateBody(updateGroupSchema),
  ownerUpdateGroupController,
);
ownerRoutes.delete(
  "/groups/:groupId",
  validateParams(groupIdParam),
  destructiveLimit,
  ownerDeleteGroupController,
);
ownerRoutes.post(
  "/groups/:groupId/students/:studentId",
  validateParams(groupStudentParams),
  ownerAddStudentToGroupController,
);
ownerRoutes.delete(
  "/groups/:groupId/students/:studentId",
  validateParams(groupStudentParams),
  ownerRemoveStudentFromGroupController,
);
ownerRoutes.patch(
  "/groups/:groupId/assign-instructor",
  validateParams(groupIdParam),
  validateBody(assignInstructorSchema),
  ownerAssignInstructorToGroupController,
);

/* ═══ Fees ═══ */
ownerRoutes.get("/fees/revenue", ownerGetRevenueController);
ownerRoutes.get(
  "/fees",
  validateQuery(feesQuerySchema),
  ownerGetAllFeesController,
);
ownerRoutes.get(
  "/fees/:feeId",
  validateParams(feeIdParam),
  ownerGetFeeByIdController,
);
ownerRoutes.post(
  "/fees",
  validateBody(createFeeSchema),
  ownerCreateFeeController,
);
ownerRoutes.put(
  "/fees/:feeId",
  validateParams(feeIdParam),
  validateBody(updateFeeSchema),
  ownerUpdateFeeController,
);
ownerRoutes.patch(
  "/fees/:feeId/pay",
  validateParams(feeIdParam),
  validateBody(markFeePaidSchema),
  ownerMarkFeeAsPaidController,
);
ownerRoutes.delete(
  "/fees/:feeId",
  validateParams(feeIdParam),
  destructiveLimit,
  ownerDeleteFeeController,
);

/* ═══ Enrollments ═══ */
ownerRoutes.get("/enrollments", ownerGetAllEnrollmentsController);
ownerRoutes.get(
  "/enrollments/:enrollmentId",
  validateParams(enrollmentIdParam),
  ownerGetEnrollmentByIdController,
);
ownerRoutes.patch(
  "/enrollments/:enrollmentId/validate",
  validateParams(enrollmentIdParam),
  validateBody(validateEnrollmentSchema),
  ownerValidateEnrollmentController,
);
ownerRoutes.patch(
  "/enrollments/:enrollmentId/reject",
  validateParams(enrollmentIdParam),
  validateBody(rejectEnrollmentSchema),
  ownerRejectEnrollmentController,
);
ownerRoutes.patch(
  "/enrollments/:enrollmentId/mark-paid",
  validateParams(enrollmentIdParam),
  ownerMarkEnrollmentPaidController,
);
ownerRoutes.patch(
  "/enrollments/:enrollmentId/finish",
  validateParams(enrollmentIdParam),
  ownerFinishEnrollmentController,
);
ownerRoutes.patch(
  "/enrollments/:enrollmentId/status",
  validateParams(enrollmentIdParam),
  validateBody(changeEnrollmentStatusSchema),
  ownerChangeEnrollmentStatusController,
);
ownerRoutes.delete(
  "/enrollments/:enrollmentId",
  validateParams(enrollmentIdParam),
  destructiveLimit,
  ownerDeleteEnrollmentController,
);

/* ═══ Documents ═══ */
ownerRoutes.get("/documents", ownerGetAllDocumentsController);
ownerRoutes.get(
  "/documents/:documentId",
  validateParams(documentIdParam),
  ownerGetDocumentByIdController,
);
ownerRoutes.put(
  "/documents/:documentId/approve",
  validateParams(documentIdParam),
  ownerApproveDocumentController,
);
ownerRoutes.put(
  "/documents/:documentId/reject",
  validateParams(documentIdParam),
  ownerRejectDocumentController,
);
ownerRoutes.delete(
  "/documents/:documentId",
  validateParams(documentIdParam),
  destructiveLimit,
  ownerDeleteDocumentController,
);

/* ═══ Sessions ═══ */
ownerRoutes.post(
  "/sessions",
  validateBody(createSessionSchema),
  ownerCreateSessionController,
);
ownerRoutes.get("/sessions", ownerGetAllSessionsController);
ownerRoutes.get(
  "/sessions/:sessionId",
  validateParams(sessionIdParam),
  ownerGetSessionByIdController,
);
ownerRoutes.put(
  "/sessions/:sessionId",
  validateParams(sessionIdParam),
  validateBody(updateSessionSchema),
  ownerUpdateSessionController,
);
ownerRoutes.delete(
  "/sessions/:sessionId",
  validateParams(sessionIdParam),
  destructiveLimit,
  ownerDeleteSessionController,
);

/* ═══ Attendance ═══ */
ownerRoutes.post(
  "/sessions/:sessionId/attendance",
  validateParams(sessionIdParam),
  validateBody(markAttendanceSchema),
  ownerMarkAttendanceController,
);
ownerRoutes.get(
  "/sessions/:sessionId/attendance",
  validateParams(sessionIdParam),
  ownerGetAttendanceBySessionController,
);
ownerRoutes.get(
  "/students/:studentId/attendance",
  validateParams(studentIdParam),
  ownerGetAttendanceByStudentController,
);
ownerRoutes.put(
  "/attendance/:attendanceId",
  validateParams(attendanceIdParam),
  validateBody(updateAttendanceSchema),
  ownerUpdateAttendanceController,
);

/* ═══ Exams ═══ */
ownerRoutes.post(
  "/exams",
  validateBody(createExamSchema),
  ownerCreateExamController,
);
ownerRoutes.get("/exams", ownerGetAllExamsController);
ownerRoutes.get(
  "/exams/:examId",
  validateParams(examIdParam),
  ownerGetExamByIdController,
);
ownerRoutes.put(
  "/exams/:examId",
  validateParams(examIdParam),
  validateBody(updateExamSchema),
  ownerUpdateExamController,
);
ownerRoutes.delete(
  "/exams/:examId",
  validateParams(examIdParam),
  destructiveLimit,
  ownerDeleteExamController,
);

/* ═══ Results ═══ */
ownerRoutes.post(
  "/exams/:examId/results",
  validateParams(examIdParam),
  validateBody(addResultSchema),
  ownerAddExamResultsController,
);
ownerRoutes.get(
  "/exams/:examId/results",
  validateParams(examIdParam),
  ownerGetResultsByExamController,
);
ownerRoutes.get(
  "/students/:studentId/results",
  validateParams(studentIdParam),
  ownerGetResultsByStudentController,
);
ownerRoutes.put(
  "/results/:resultId",
  validateParams(resultIdParam),
  validateBody(updateResultSchema),
  ownerUpdateResultController,
);

/* ═══ Permissions ═══ */
ownerRoutes.post(
  "/permissions",
  validateBody(createPermissionSchema),
  ownerCreatePermissionController,
);
ownerRoutes.get("/permissions", ownerGetAllPermissionsController);
ownerRoutes.post(
  "/students/:studentId/permissions",
  validateParams(studentIdParam),
  validateBody(assignPermissionSchema),
  ownerAssignPermissionToStudentController,
);
ownerRoutes.delete(
  "/students/:studentId/permissions/:permissionId",
  validateParams(studentPermissionParams),
  ownerRemovePermissionFromStudentController,
);

/* ═══ Dashboard Stats & Reports ═══ */
ownerRoutes.get("/dashboard/stats", ownerGetDashboardStatsController);
ownerRoutes.get("/reports/students", ownerGetStudentsReportController);
ownerRoutes.get("/reports/groups", ownerGetGroupsReportController);
ownerRoutes.get("/reports/payments", ownerGetPaymentsReportController);
ownerRoutes.get("/reports/attendance", ownerGetAttendanceReportController);
ownerRoutes.get("/reports/enrollments", ownerGetEnrollmentsReportController);

/* ═══ Announcements ═══ */
ownerRoutes.post(
  "/announcements",
  uploadLimit,
  uploadImage.single("image"),
  handleUploadError,
  validateBody(createAnnouncementSchema),
  ownerCreateAnnouncementController,
);
ownerRoutes.get(
  "/announcements",
  validateQuery(announcementQuerySchema),
  ownerGetAllAnnouncementsController,
);
ownerRoutes.get(
  "/announcements/:announcementId",
  validateParams(announcementIdParam),
  ownerGetAnnouncementByIdController,
);
ownerRoutes.put(
  "/announcements/:announcementId",
  validateParams(announcementIdParam),
  uploadLimit,
  uploadImage.single("image"),
  handleUploadError,
  ownerUpdateAnnouncementController,
);
ownerRoutes.delete(
  "/announcements/:announcementId",
  validateParams(announcementIdParam),
  destructiveLimit,
  ownerDeleteAnnouncementController,
);
ownerRoutes.patch(
  "/announcements/:announcementId/publish",
  validateParams(announcementIdParam),
  ownerPublishAnnouncementController,
);
ownerRoutes.patch(
  "/announcements/:announcementId/unpublish",
  validateParams(announcementIdParam),
  ownerUnpublishAnnouncementController,
);

/* ═══ Course Profiles & Pricing ═══ */
ownerRoutes.post(
  "/courses/:courseId/profile",
  validateParams(courseIdParam),
  uploadLimit,
  uploadImage.single("image"),
  handleUploadError,
  ownerCreateOrUpdateCourseProfileController,
);
ownerRoutes.get(
  "/courses/:courseId/profile",
  validateParams(courseIdParam),
  ownerGetCourseProfileController,
);
ownerRoutes.patch(
  "/courses/:courseId/profile/publish",
  validateParams(courseIdParam),
  ownerPublishCourseProfileController,
);
ownerRoutes.patch(
  "/courses/:courseId/profile/unpublish",
  validateParams(courseIdParam),
  ownerUnpublishCourseProfileController,
);
ownerRoutes.get(
  "/courses/:courseId/pricing",
  validateParams(courseIdParam),
  ownerGetCoursePricingController,
);
ownerRoutes.post(
  "/courses/:courseId/pricing",
  validateParams(courseIdParam),
  validateBody(createPricingSchema),
  ownerAddCoursePricingController,
);
ownerRoutes.put(
  "/courses/:courseId/pricing/:pricingId",
  validate({ params: coursePricingParams, body: updatePricingSchema }),
  ownerUpdateCoursePricingController,
);
ownerRoutes.delete(
  "/courses/:courseId/pricing/:pricingId",
  validateParams(coursePricingParams),
  destructiveLimit,
  ownerDeleteCoursePricingController,
);

/* ═══ Notifications ═══ */
ownerRoutes.get(
  "/notifications/targets",
  ownerGetNotificationTargetsController,
);
ownerRoutes.get(
  "/notifications/search-students",
  ownerSearchStudentsController,
);
ownerRoutes.post(
  "/notifications",
  validateBody(sendNotificationSchema),
  ownerSendNotificationController,
);
ownerRoutes.post(
  "/notifications/broadcast",
  broadcastLimit,
  validateBody(sendNotificationSchema),
  ownerBroadcastNotificationController,
);
ownerRoutes.get(
  "/notifications",
  validateQuery(notificationQuerySchema),
  ownerGetAllNotificationsController,
);
ownerRoutes.get(
  "/notifications/:notificationId",
  validateParams(notificationIdParam),
  ownerGetNotificationByIdController,
);
ownerRoutes.delete(
  "/notifications/:notificationId",
  validateParams(notificationIdParam),
  destructiveLimit,
  ownerDeleteNotificationController,
);

/* ═══ Rooms ═══ */
ownerRoutes.get(
  "/rooms/schedule/overview",
  validateQuery(roomsOverviewQuerySchema),
  ownerGetRoomsScheduleOverviewController,
);
ownerRoutes.post(
  "/rooms",
  validateBody(createRoomSchema),
  ownerCreateRoomController,
);
ownerRoutes.get("/rooms", ownerGetAllRoomsController);
ownerRoutes.get(
  "/rooms/:roomId",
  validateParams(roomIdParam),
  ownerGetRoomByIdController,
);
ownerRoutes.put(
  "/rooms/:roomId",
  validateParams(roomIdParam),
  validateBody(updateRoomSchema),
  ownerUpdateRoomController,
);
ownerRoutes.delete(
  "/rooms/:roomId",
  validateParams(roomIdParam),
  destructiveLimit,
  ownerDeleteRoomController,
);
ownerRoutes.get(
  "/rooms/:roomId/schedule",
  validate({ params: roomIdParam, query: roomScheduleQuerySchema }),
  ownerGetRoomScheduleController,
);
ownerRoutes.get(
  "/rooms/:roomId/availability",
  validate({ params: roomIdParam, query: roomAvailabilityQuerySchema }),
  ownerCheckRoomAvailabilityController,
);

ownerRoutes.patch(
  "/fees/:feeId/correct-amount",
  validateParams(feeIdParam),
  sensitiveLimit,
  ownerCorrectFeeAmountController,
);

export default ownerRoutes;
