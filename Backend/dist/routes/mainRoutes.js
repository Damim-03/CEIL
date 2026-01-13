"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = __importDefault(require("./auth/auth.route"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const roleGuard_1 = require("../utils/roleGuard");
const role_enum_1 = require("../enums/role.enum");
const teacher_route_1 = __importDefault(require("./Teacher/teacher.route"));
const admin_route_1 = __importDefault(require("./admin/admin.route"));
const mainRoute = (0, express_1.Router)();
mainRoute.use("/auth", auth_route_1.default);
mainRoute.use("/admin", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([
    role_enum_1.Permissions.MANAGE_USERS,
]), admin_route_1.default);
mainRoute.use("/teacher", auth_middleware_1.authMiddleware, (0, roleGuard_1.roleGuard)([role_enum_1.Permissions.VIEW_ASSIGNED_COURSES]), teacher_route_1.default);
exports.default = mainRoute;
//# sourceMappingURL=mainRoutes.js.map