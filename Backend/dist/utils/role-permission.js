"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissions = void 0;
const role_enum_1 = require("../enums/role.enum");
/**
 * Role → Permission mapping
 * -------------------------
 * Roles define WHO the user is
 * Permissions define WHAT the user can do
 */
exports.RolePermissions = {
    /**
     * =========================
     * ADMIN (Full access)
     * =========================
     */
    ADMIN: [
        // User management
        role_enum_1.Permissions.MANAGE_USERS,
        role_enum_1.Permissions.MANAGE_STUDENTS,
        role_enum_1.Permissions.MANAGE_TEACHERS,
        // Academic structure
        role_enum_1.Permissions.MANAGE_COURSES,
        role_enum_1.Permissions.MANAGE_CLASSES,
        // Finance
        role_enum_1.Permissions.MANAGE_FEES,
        // System
        role_enum_1.Permissions.MANAGE_PERMISSIONS,
        role_enum_1.Permissions.VIEW_REPORTS,
    ],
    /**
     * =========================
     * TEACHER
     * =========================
     */
    TEACHER: [
        // Courses
        role_enum_1.Permissions.VIEW_ASSIGNED_COURSES,
        // Attendance
        role_enum_1.Permissions.MANAGE_ATTENDANCE,
        // Exams & Results
        role_enum_1.Permissions.CREATE_EXAMS,
        role_enum_1.Permissions.UPDATE_EXAMS,
        role_enum_1.Permissions.ENTER_RESULTS,
        // Students
        role_enum_1.Permissions.VIEW_STUDENTS,
    ],
    /**
     * =========================
     * STUDENT
     * =========================
     */
    STUDENT: [
        // Profile
        role_enum_1.Permissions.VIEW_OWN_PROFILE,
        role_enum_1.Permissions.EDIT_OWN_PROFILE,
        // Academics
        role_enum_1.Permissions.VIEW_OWN_COURSES,
        role_enum_1.Permissions.VIEW_OWN_ATTENDANCE,
        role_enum_1.Permissions.VIEW_OWN_RESULTS,
        // Finance
        role_enum_1.Permissions.VIEW_OWN_FEES,
    ],
};
//# sourceMappingURL=role-permission.js.map