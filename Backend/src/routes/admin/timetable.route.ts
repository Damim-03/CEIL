// src/routes/admin/timetable.route.ts
// يُضاف في نفس مجلد admin.route.ts

import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../enums/role.enum";
import {
  validateCreateEntry,
  validateUpdateEntry,
} from "../../validations/timetable.validation";
import {
  checkConflictController,
  getRoomTimetableController,
  getAllEntriesController,
  createEntryController,
  bulkDeleteController,
  updateEntryController,
  deleteEntryController,
  resetConfigController,
  saveConfigController,
  getConfigController,
} from "../../controllers/admin/timetable.controller";

const timetableRoutes = Router();

// ⚠️ ترتيب مهم: static routes قبل :params

/**
 * GET /admin/timetable/check-conflict
 * Query: room_id, day_of_week, start_time, end_time, exclude_id?
 */
timetableRoutes.get(
  "/check-conflict",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  checkConflictController,
);

/**
 * GET /admin/timetable/room/:roomId
 * توقيت قاعة كاملة طوال الأسبوع
 */
timetableRoutes.get(
  "/room/:roomId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  getRoomTimetableController,
);

/**
 * GET /admin/timetable
 * كل الحصص — Query: room_id?, day_of_week?, language?, level?, group_id?
 */
timetableRoutes.get(
  "/",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  getAllEntriesController,
);

/**
 * POST /admin/timetable
 * Body: { room_id, day_of_week, start_time, end_time, level, language, group_label, group_id?, session_name? }
 */
timetableRoutes.post(
  "/",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  validateCreateEntry,
  createEntryController,
);

/**
 * DELETE /admin/timetable/bulk
 * Body: { ids: string[] }
 */
timetableRoutes.delete(
  "/bulk",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  bulkDeleteController,
);

/**
 * PUT /admin/timetable/:entryId
 */
timetableRoutes.put(
  "/:entryId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  validateUpdateEntry,
  updateEntryController,
);

/**
 * DELETE /admin/timetable/:entryId
 */
timetableRoutes.delete(
  "/:entryId",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  deleteEntryController,
);

timetableRoutes.put(
  "/config",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  saveConfigController,
);

timetableRoutes.get(
  "/config",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  getConfigController,
);

timetableRoutes.put(
  "/config",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  saveConfigController,
);

timetableRoutes.delete(
  "/config/reset",
  authMiddleware,
  roleGuard([Permissions.MANAGE_SESSIONS]),
  resetConfigController,
);

export default timetableRoutes;
