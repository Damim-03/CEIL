// src/routes/admin/teacherSchedule.route.ts

import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../enums/role.enum";
import {
  getAllTeacherScheduleController,
  getTeacherScheduleByIdController,
  createTeacherScheduleController,
  updateTeacherScheduleController,
  deleteTeacherScheduleController,
  clearTeacherScheduleController,
} from "../../controllers/admin/teacherSchedule.controller";

const teacherScheduleRoutes = Router();

// ── Static routes قبل /:entryId ──────────────────────────────

/**
 * GET /admin/teacher-schedule
 * كل الحصص — Query: teacher_id?, day_of_week?, language?
 */
teacherScheduleRoutes.get(
  "/",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  getAllTeacherScheduleController,
);

/**
 * POST /admin/teacher-schedule
 */
teacherScheduleRoutes.post(
  "/",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  createTeacherScheduleController,
);

/**
 * GET /admin/teacher-schedule/teacher/:teacherId
 * جدول أستاذ كامل (للإدارة)
 */
teacherScheduleRoutes.get(
  "/teacher/:teacherId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  getTeacherScheduleByIdController,
);

/**
 * DELETE /admin/teacher-schedule/teacher/:teacherId/clear
 * حذف كل جدول أستاذ
 */
teacherScheduleRoutes.delete(
  "/teacher/:teacherId/clear",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  clearTeacherScheduleController,
);

/**
 * PUT /admin/teacher-schedule/:entryId
 */
teacherScheduleRoutes.put(
  "/:entryId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  updateTeacherScheduleController,
);

/**
 * DELETE /admin/teacher-schedule/:entryId
 */
teacherScheduleRoutes.delete(
  "/:entryId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  deleteTeacherScheduleController,
);

export default teacherScheduleRoutes;
