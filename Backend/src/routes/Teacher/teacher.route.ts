import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../enums/role.enum";
import {
  teacherDashboardController,
  getAssignedCoursesController,
  manageAttendanceController,
  createExamController,
  updateExamController,
  enterResultsController,
  viewStudentsController,
} from "../../controllers/Teachers/teacher.controller";

const teacherRoutes: Router = Router();

teacherRoutes.get(
  "/dashboard",
  authMiddleware,
  roleGuard([Permissions.VIEW_ASSIGNED_COURSES]),
  teacherDashboardController
);

teacherRoutes.get(
  "/courses",
  authMiddleware,
  roleGuard([Permissions.VIEW_ASSIGNED_COURSES]),
  getAssignedCoursesController
);

teacherRoutes.post(
  "/attendance",
  authMiddleware,
  roleGuard([Permissions.MANAGE_ATTENDANCE]),
  manageAttendanceController
);

teacherRoutes.post(
  "/exams",
  authMiddleware,
  roleGuard([Permissions.CREATE_EXAMS]),
  createExamController
);

teacherRoutes.put(
  "/exams/:examId",
  authMiddleware,
  roleGuard([Permissions.UPDATE_EXAMS]),
  updateExamController
);

teacherRoutes.post(
  "/results",
  authMiddleware,
  roleGuard([Permissions.ENTER_RESULTS]),
  enterResultsController
);

teacherRoutes.get(
  "/students",
  authMiddleware,
  roleGuard([Permissions.VIEW_STUDENTS]),
  viewStudentsController
);

export default teacherRoutes;
