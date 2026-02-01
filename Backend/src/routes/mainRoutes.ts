import { Router } from "express";
import authRoutes from "./auth/auth.route";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleGuard } from "../utils/roleGuard";
import { Permissions } from "../enums/role.enum";
import teacherRoutes from "./Teacher/teacher.route";
import adminRoutes from "./admin/admin.route";
import studentRoutes from "./student/student.route";

const mainRoute: Router = Router();

mainRoute.use("/auth", authRoutes);

mainRoute.use(
  "/admin",
  authMiddleware,
  roleGuard([Permissions.MANAGE_USERS]),
  adminRoutes,
);

/* ================= STUDENT ================= */
mainRoute.use(
  "/students",
  authMiddleware,
  roleGuard([Permissions.VIEW_OWN_PROFILE]),
  studentRoutes,
);

mainRoute.use(
  "/teacher",
  authMiddleware,
  roleGuard([Permissions.VIEW_ASSIGNED_COURSES]),
  teacherRoutes,
);

export default mainRoute;
