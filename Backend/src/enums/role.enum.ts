/**
 * Roles & Permissions for Student Management System
 * -------------------------------------------------
 * Roles = WHO the user is
 * Permissions = WHAT the user can do
 */

/* ================= ROLES ================= */

export const Roles = {
  ADMIN: "ADMIN", // System administrator
  TEACHER: "TEACHER", // Teacher / Instructor
  STUDENT: "STUDENT", // Student / Learner
} as const;

/**
 * Role type
 * Example: "ADMIN" | "TEACHER" | "STUDENT"
 */
export type RoleType = keyof typeof Roles;

/* ================= PERMISSIONS ================= */

export const Permissions = {
  /* ===== STUDENT PERMISSIONS ===== */
  VIEW_OWN_PROFILE: "VIEW_OWN_PROFILE",
  EDIT_OWN_PROFILE: "EDIT_OWN_PROFILE",

  VIEW_OWN_COURSES: "VIEW_OWN_COURSES",
  VIEW_OWN_ATTENDANCE: "VIEW_OWN_ATTENDANCE",
  VIEW_OWN_RESULTS: "VIEW_OWN_RESULTS",
  VIEW_OWN_FEES: "VIEW_OWN_FEES",

  /* ===== TEACHER PERMISSIONS ===== */
  VIEW_ASSIGNED_COURSES: "VIEW_ASSIGNED_COURSES",
  MANAGE_ATTENDANCE: "MANAGE_ATTENDANCE",

  CREATE_EXAMS: "CREATE_EXAMS",
  UPDATE_EXAMS: "UPDATE_EXAMS",
  ENTER_RESULTS: "ENTER_RESULTS",

  VIEW_STUDENTS: "VIEW_STUDENTS",

  /* ===== ADMIN PERMISSIONS ===== */
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_STUDENTS: "MANAGE_STUDENTS",
  MANAGE_TEACHERS: "MANAGE_TEACHERS",

  MANAGE_COURSES: "MANAGE_COURSES",
  MANAGE_CLASSES: "MANAGE_CLASSES", // groups + departments + student→group

  MANAGE_ENROLLMENTS: "MANAGE_ENROLLMENTS",
  MANAGE_SESSIONS: "MANAGE_SESSIONS",
  MANAGE_EXAMS: "MANAGE_EXAMS",
  MANAGE_RESULTS: "MANAGE_RESULTS",

  MANAGE_FEES: "MANAGE_FEES",
  MANAGE_PERMISSIONS: "MANAGE_PERMISSIONS",

  MANAGE_DOCUMENTS: "MANAGE_DOCUMENTS",

  MANAGE_ANNOUNCEMENTS: "MANAGE_ANNOUNCEMENTS",

  VIEW_REPORTS: "VIEW_REPORTS",
} as const;

/**
 * Permission type
 * Example: "MANAGE_USERS" | "VIEW_OWN_RESULTS" | ...
 */
export type PermissionType = keyof typeof Permissions;

/* ================= ROLE → PERMISSION MAP ================= */

export const RolePermissions: Record<RoleType, PermissionType[]> = {
  ADMIN: [
    Permissions.MANAGE_USERS,
    Permissions.MANAGE_STUDENTS,
    Permissions.MANAGE_TEACHERS,

    Permissions.MANAGE_COURSES,
    Permissions.MANAGE_CLASSES,

    Permissions.MANAGE_ENROLLMENTS,
    Permissions.MANAGE_SESSIONS,
    Permissions.MANAGE_EXAMS,
    Permissions.MANAGE_RESULTS,

    Permissions.MANAGE_FEES,
    Permissions.MANAGE_PERMISSIONS,

    Permissions.MANAGE_DOCUMENTS,

    Permissions.MANAGE_ANNOUNCEMENTS,

    Permissions.VIEW_REPORTS,
  ],

  TEACHER: [
    Permissions.VIEW_ASSIGNED_COURSES,
    Permissions.MANAGE_ATTENDANCE,

    Permissions.CREATE_EXAMS,
    Permissions.UPDATE_EXAMS,
    Permissions.ENTER_RESULTS,

    Permissions.VIEW_STUDENTS,
  ],

  STUDENT: [
    Permissions.VIEW_OWN_PROFILE,
    Permissions.EDIT_OWN_PROFILE,

    Permissions.VIEW_OWN_COURSES,
    Permissions.VIEW_OWN_ATTENDANCE,
    Permissions.VIEW_OWN_RESULTS,
    Permissions.VIEW_OWN_FEES,
  ],
};
