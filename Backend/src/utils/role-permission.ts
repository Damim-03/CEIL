import {
  Roles,
  Permissions,
  PermissionType,
  RoleType,
} from "../enums/role.enum";

/**
 * Role → Permission mapping
 * -------------------------
 * Roles define WHO the user is
 * Permissions define WHAT the user can do
 */
export const RolePermissions: Record<RoleType, PermissionType[]> = {
  /**
   * =========================
   * ADMIN (Full access)
   * =========================
   */
  ADMIN: [
    // User management
    Permissions.MANAGE_USERS,
    Permissions.MANAGE_STUDENTS,
    Permissions.MANAGE_TEACHERS,

    // Academic structure
    Permissions.MANAGE_COURSES,
    Permissions.MANAGE_CLASSES,

    // Finance
    Permissions.MANAGE_FEES,

    // System
    Permissions.MANAGE_PERMISSIONS,
    Permissions.VIEW_REPORTS,
  ],

  /**
   * =========================
   * TEACHER
   * =========================
   */
  TEACHER: [
    // Courses
    Permissions.VIEW_ASSIGNED_COURSES,

    // Attendance
    Permissions.MANAGE_ATTENDANCE,

    // Exams & Results
    Permissions.CREATE_EXAMS,
    Permissions.UPDATE_EXAMS,
    Permissions.ENTER_RESULTS,

    // Students
    Permissions.VIEW_STUDENTS,
  ],

  /**
   * =========================
   * STUDENT
   * =========================
   */
  STUDENT: [
    // Profile
    Permissions.VIEW_OWN_PROFILE,
    Permissions.EDIT_OWN_PROFILE,

    // Academics
    Permissions.VIEW_OWN_COURSES,
    Permissions.VIEW_OWN_ATTENDANCE,
    Permissions.VIEW_OWN_RESULTS,

    // Finance
    Permissions.VIEW_OWN_FEES,
  ],
};
