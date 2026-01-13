"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const roleGuard_1 = require("../../utils/roleGuard");
const role_enum_1 = require("../../enums/role.enum");
const teacher_controller_1 = require("../../controllers/Teachers/teacher.controller");
const teacherRoutes = (0, express_1.Router)();
teacherRoutes.get("/dashboard", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.VIEW_ASSIGNED_COURSES]), teacher_controller_1.teacherDashboardController);
teacherRoutes.get("/courses", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.VIEW_ASSIGNED_COURSES]), teacher_controller_1.getAssignedCoursesController);
teacherRoutes.post("/attendance", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.MANAGE_ATTENDANCE]), teacher_controller_1.manageAttendanceController);
teacherRoutes.post("/exams", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.CREATE_EXAMS]), teacher_controller_1.createExamController);
teacherRoutes.put("/exams/:examId", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.UPDATE_EXAMS]), teacher_controller_1.updateExamController);
teacherRoutes.post("/results", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.ENTER_RESULTS]), teacher_controller_1.enterResultsController);
teacherRoutes.get("/students", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.VIEW_STUDENTS]), teacher_controller_1.viewStudentsController);
exports.default = teacherRoutes;
//# sourceMappingURL=teacher.route.js.map