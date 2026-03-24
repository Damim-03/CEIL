// ================================================================
// 📌 src/hooks/owner/useOwner.hooks.ts
// ✅ Complete — ALL sections matching owner.controller.ts
// ✅ Section A: Owner-Exclusive
// ✅ Section B: Admin-equivalent (full CRUD)
// 🔌 REAL-TIME: All polling (refetchInterval) REMOVED
//    → Socket.IO events handle cache invalidation via useSocketEvents("OWNER")
// ================================================================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import {
  ownerDashboardApi,
  ownerAdminsApi,
  ownerUsersApi,
  ownerAuditApi,
  ownerSettingsApi,
  ownerSystemApi,
  ownerFeesApi,
  ownerEnrollmentsApi,
  ownerStudentsApi,
  ownerTeachersApi,
  ownerCoursesApi,
  ownerDepartmentsApi,
  ownerGroupsApi,
  ownerDocumentsApi,
  ownerSessionsApi,
  ownerAttendanceApi,
  ownerExamsApi,
  ownerResultsApi,
  ownerPermissionsApi,
  ownerAnnouncementsApi,
  ownerCourseProfileApi,
  ownerCoursePricingApi,
  ownerNotificationsApi,
  ownerRoomsApi,
  ownerActivityApi,
  ownerAvatarApi,
} from "../../lib/api/owner/owner.api";
import type {
  OwnerDashboard,
  AdminAccount,
  CreateAdminPayload,
  AuditLogFilters,
  AuditLogStats,
  AuditLog,
  PaginatedResponse,
  SystemSettingsResponse,
  OwnerUser,
  UserFilters,
  SystemHealth,
  SystemStats,
  OwnerFeeFilters,
  OwnerEnrollmentFilters,
  OwnerActivityFilters,
} from "../../types/Types";
import type { OwnerNotificationPayload } from "../../lib/api/owner/owner.api";

/* ═══════════════════════════ QUERY KEYS ═══════════════════════════ */

export const OWNER_KEYS = {
  // Section A
  dashboard: ["owner-dashboard"],
  dashboardStats: ["owner-dashboard-stats"],
  admins: ["owner-admins"],
  users: ["owner-users"],
  userDetail: (id: string) => ["owner-user", id],
  auditLogs: ["owner-audit-logs"],
  auditStats: ["owner-audit-stats"],
  settings: ["owner-settings"],
  health: ["owner-health"],
  stats: ["owner-stats"],
  activity: ["owner-activity"],
  userActivity: (id: string) => ["owner-user-activity", id],

  // Section B
  fees: ["owner-fees"],
  feeDetail: (id: string) => ["owner-fee", id],
  revenue: ["owner-revenue"],
  enrollments: ["owner-enrollments"],
  enrollmentDetail: (id: string) => ["owner-enrollment", id],
  students: ["owner-students"],
  studentDetail: (id: string) => ["owner-student", id],
  teachers: ["owner-teachers"],
  teacherDetail: (id: string) => ["owner-teacher", id],
  courses: ["owner-courses"],
  courseDetail: (id: string) => ["owner-course", id],
  departments: ["owner-departments"],
  departmentDetail: (id: string) => ["owner-department", id],
  groups: ["owner-groups"],
  groupDetail: (id: string) => ["owner-group", id],
  documents: ["owner-documents"],
  documentDetail: (id: string) => ["owner-document", id],
  sessions: ["owner-sessions"],
  sessionDetail: (id: string) => ["owner-session", id],
  sessionAttendance: (id: string) => ["owner-session-attendance", id],
  attendance: ["owner-attendance"],
  studentAttendance: (id: string) => ["owner-student-attendance", id],
  exams: ["owner-exams"],
  examDetail: (id: string) => ["owner-exam", id],
  examResults: (id: string) => ["owner-exam-results", id],
  studentResults: (id: string) => ["owner-student-results", id],
  results: ["owner-results"],
  permissions: ["owner-permissions"],
  announcements: ["owner-announcements"],
  announcementDetail: (id: string) => ["owner-announcement", id],
  courseProfile: (id: string) => ["owner-course-profile", id],
  coursePricing: (id: string) => ["owner-course-pricing", id],
  notifications: ["owner-notifications"],
  notificationTargets: ["owner-notification-targets"],
  notificationDetail: (id: string) => ["owner-notification", id],
  searchStudents: ["owner-search-students"],
  rooms: ["owner-rooms"],
  roomDetail: (id: string) => ["owner-room", id],
  roomsOverview: ["owner-rooms-overview"],
  me: ["owner-me"],
} as const;

// ╔═══════════════════════════════════════════════════════════════╗
// ║  SECTION A: OWNER-EXCLUSIVE HOOKS                            ║
// ╚═══════════════════════════════════════════════════════════════╝

/* ═══════════════════════════════════════════════════════════════════
   1. DASHBOARD
═══════════════════════════════════════════════════════════════════ */

export const useOwnerDashboard = () =>
  useQuery<OwnerDashboard>({
    queryKey: OWNER_KEYS.dashboard,
    queryFn: ownerDashboardApi.getOverview,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useOwnerDashboardStats = () =>
  useQuery({
    queryKey: OWNER_KEYS.dashboardStats,
    queryFn: ownerDashboardApi.getStats,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useOwnerStudentsReport = () =>
  useQuery({
    queryKey: ["owner-reports-students"],
    queryFn: ownerDashboardApi.getStudentsReport,
  });

export const useOwnerGroupsReport = () =>
  useQuery({
    queryKey: ["owner-reports-groups"],
    queryFn: ownerDashboardApi.getGroupsReport,
  });

export const useOwnerPaymentsReport = () =>
  useQuery({
    queryKey: ["owner-reports-payments"],
    queryFn: ownerDashboardApi.getPaymentsReport,
  });

export const useOwnerAttendanceReport = () =>
  useQuery({
    queryKey: ["owner-reports-attendance"],
    queryFn: ownerDashboardApi.getAttendanceReport,
  });

export const useOwnerEnrollmentsReport = () =>
  useQuery({
    queryKey: ["owner-reports-enrollments"],
    queryFn: ownerDashboardApi.getEnrollmentsReport,
  });

/* ═══════════════════════════════════════════════════════════════════
   2. ADMIN MANAGEMENT
═══════════════════════════════════════════════════════════════════ */

export const useOwnerAdmins = () =>
  useQuery<AdminAccount[]>({
    queryKey: OWNER_KEYS.admins,
    queryFn: ownerAdminsApi.getAll,
  });

export const useCreateAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => ownerAdminsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.admins });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      toast.success("Admin created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create admin");
    },
  });
};

export const useActivateAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => ownerAdminsApi.activate(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.admins });
      toast.success("Admin activated");
    },
  });
};

export const useDeactivateAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => ownerAdminsApi.deactivate(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.admins });
      toast.success("Admin deactivated");
    },
  });
};

export const usePromoteToOwner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => ownerAdminsApi.promote(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.admins });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      toast.success("Admin promoted to OWNER");
    },
  });
};

export const useDeleteAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => ownerAdminsApi.delete(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.admins });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      toast.success("Admin deleted");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   3. AUDIT LOGS
═══════════════════════════════════════════════════════════════════ */

export const useAuditLogs = (filters?: AuditLogFilters) =>
  useQuery<PaginatedResponse<AuditLog>>({
    queryKey: [...OWNER_KEYS.auditLogs, filters],
    queryFn: () => ownerAuditApi.getAll(filters),
    placeholderData: (prev: any) => prev,
  });

export const useAuditLogStats = () =>
  useQuery<AuditLogStats>({
    queryKey: OWNER_KEYS.auditStats,
    queryFn: ownerAuditApi.getStats,
  });

export const useCleanupAuditLogs = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (daysToKeep?: number) => ownerAuditApi.cleanup(daysToKeep),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.auditLogs });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.auditStats });
      toast.success(data.message);
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   4. SYSTEM SETTINGS
═══════════════════════════════════════════════════════════════════ */

export const useSystemSettings = () =>
  useQuery<SystemSettingsResponse>({
    queryKey: OWNER_KEYS.settings,
    queryFn: ownerSettingsApi.getAll,
  });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: Record<string, string>) =>
      ownerSettingsApi.update(settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.settings });
      toast.success("Settings updated");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   5. SYSTEM HEALTH & STATS
═══════════════════════════════════════════════════════════════════ */

export const useSystemHealth = () =>
  useQuery<SystemHealth>({
    queryKey: OWNER_KEYS.health,
    queryFn: ownerSystemApi.getHealth,
    refetchInterval: 60_000, // Health check — keep 1min polling as fallback
  });

export const useSystemStats = () =>
  useQuery<SystemStats>({
    queryKey: OWNER_KEYS.stats,
    queryFn: ownerSystemApi.getStats,
    refetchInterval: 60_000, // Stats — keep 1min polling as fallback
  });

/* ═══════════════════════════════════════════════════════════════════
   6. ACTIVITY TRACKING
═══════════════════════════════════════════════════════════════════ */

export const useOwnerActivity = (filters?: OwnerActivityFilters) =>
  useQuery({
    queryKey: [...OWNER_KEYS.activity, filters],
    queryFn: () => ownerActivityApi.getAll(filters),
    placeholderData: (prev: any) => prev,
  });

export const useOwnerUserActivity = (
  userId?: string,
  params?: { page?: number; limit?: number },
) =>
  useQuery({
    queryKey: [...OWNER_KEYS.userActivity(userId!), params],
    queryFn: () => ownerActivityApi.getByUser(userId!, params),
    enabled: !!userId,
  });

// ╔═══════════════════════════════════════════════════════════════╗
// ║  SECTION B: ALL CAPABILITIES (Admin-equivalent)              ║
// ╚═══════════════════════════════════════════════════════════════╝

/* ═══════════════════════════════════════════════════════════════════
   AVATAR
═══════════════════════════════════════════════════════════════════ */

export const useUpdateOwnerAvatar = () => {
  const { setUser } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => ownerAvatarApi.update(file),
    onSuccess: (data) => {
      if (data?.user) setUser(data.user);
      qc.invalidateQueries({ queryKey: OWNER_KEYS.me });
      toast.success("Avatar updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update avatar");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   USERS (Full control + Role changes)
═══════════════════════════════════════════════════════════════════ */

export const useOwnerUsers = (filters?: UserFilters) =>
  useQuery<PaginatedResponse<OwnerUser>>({
    queryKey: [...OWNER_KEYS.users, filters],
    queryFn: () => ownerUsersApi.getAll(filters),
    placeholderData: (prev: any) => prev,
  });

export const useOwnerUserDetail = (userId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.userDetail(userId!),
    queryFn: () => ownerUsersApi.getById(userId!),
    enabled: !!userId,
  });

export const useOwnerChangeRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      ownerUsersApi.changeRole(userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.users });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.admins });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.students });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.teachers });
      toast.success("Role updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to change role");
    },
  });
};

export const useOwnerEnableUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => ownerUsersApi.enable(userId),
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.users });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.userDetail(userId) });
    },
  });
};

export const useOwnerDisableUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => ownerUsersApi.disable(userId),
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.users });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.userDetail(userId) });
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   STUDENTS — Full CRUD
═══════════════════════════════════════════════════════════════════ */

export const useOwnerStudents = (filters?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) =>
  useQuery({
    queryKey: [...OWNER_KEYS.students, filters],
    queryFn: () => ownerStudentsApi.getAll(filters),
    placeholderData: (prev: any) => prev,
  });

export const useOwnerStudentDetail = (studentId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.studentDetail(studentId!),
    queryFn: () => ownerStudentsApi.getById(studentId!),
    enabled: !!studentId,
  });

export const useOwnerCreateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number?: string;
      nationality?: string;
      language?: string;
      education_level?: string;
      study_location?: string;
    }) => ownerStudentsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.students });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      toast.success("Student created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create student");
    },
  });
};

export const useOwnerUpdateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      payload,
    }: {
      studentId: string;
      payload: Record<string, any>;
    }) => ownerStudentsApi.update(studentId, payload),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.students });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.studentDetail(studentId) });
      toast.success("Student updated");
    },
  });
};

export const useOwnerDeleteStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => ownerStudentsApi.delete(studentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.students });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      toast.success("Student deactivated");
    },
  });
};

export const useOwnerUpdateStudentAvatar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      formData,
    }: {
      studentId: string;
      formData: FormData;
    }) => ownerStudentsApi.updateAvatar(studentId, formData),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.students });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.studentDetail(studentId) });
      toast.success("Avatar updated");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   TEACHERS — Full CRUD
═══════════════════════════════════════════════════════════════════ */

export const useOwnerTeachers = () =>
  useQuery({
    queryKey: OWNER_KEYS.teachers,
    queryFn: ownerTeachersApi.getAll,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useOwnerTeacherDetail = (teacherId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.teacherDetail(teacherId!),
    queryFn: () => ownerTeachersApi.getById(teacherId!),
    enabled: !!teacherId,
  });

export const useOwnerCreateTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number?: string;
      password?: string; // ← ADD THIS
    }) => ownerTeachersApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.teachers });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.users });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      toast.success("Teacher created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create teacher");
    },
  });
};

export const useOwnerUpdateTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      teacherId,
      payload,
    }: {
      teacherId: string;
      payload: Record<string, any>;
    }) => ownerTeachersApi.update(teacherId, payload),
    onSuccess: (_, { teacherId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.teachers });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.teacherDetail(teacherId) });
      toast.success("Teacher updated");
    },
  });
};

export const useOwnerDeleteTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teacherId: string) => ownerTeachersApi.delete(teacherId),
    onSuccess: (_, teacherId) => {
      qc.removeQueries({ queryKey: OWNER_KEYS.teacherDetail(teacherId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.teachers });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      toast.success("Teacher deleted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete teacher");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   COURSES — Full CRUD
═══════════════════════════════════════════════════════════════════ */

export const useOwnerCourses = () =>
  useQuery({
    queryKey: OWNER_KEYS.courses,
    queryFn: ownerCoursesApi.getAll,
  });

export const useOwnerCourseDetail = (courseId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.courseDetail(courseId!),
    queryFn: () => ownerCoursesApi.getById(courseId!),
    enabled: !!courseId,
  });

export const useOwnerCreateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      course_name: string;
      course_code?: string;
      credits?: number;
    }) => ownerCoursesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.courses });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      toast.success("Course created");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create course");
    },
  });
};

export const useOwnerUpdateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: Record<string, any>;
    }) => ownerCoursesApi.update(courseId, payload),
    onSuccess: (_, { courseId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.courses });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.courseDetail(courseId) });
      toast.success("Course updated");
    },
  });
};

export const useOwnerDeleteCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => ownerCoursesApi.delete(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.courses });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      toast.success("Course deleted");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   DEPARTMENTS — Full CRUD
═══════════════════════════════════════════════════════════════════ */

export const useOwnerDepartments = () =>
  useQuery({
    queryKey: OWNER_KEYS.departments,
    queryFn: ownerDepartmentsApi.getAll,
  });

export const useOwnerDepartmentDetail = (departmentId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.departmentDetail(departmentId!),
    queryFn: () => ownerDepartmentsApi.getById(departmentId!),
    enabled: !!departmentId,
  });

export const useOwnerCreateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      ownerDepartmentsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.departments });
      toast.success("Department created");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create department",
      );
    },
  });
};

export const useOwnerUpdateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      departmentId,
      payload,
    }: {
      departmentId: string;
      payload: Record<string, any>;
    }) => ownerDepartmentsApi.update(departmentId, payload),
    onSuccess: (_, { departmentId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.departments });
      qc.invalidateQueries({
        queryKey: OWNER_KEYS.departmentDetail(departmentId),
      });
      toast.success("Department updated");
    },
  });
};

export const useOwnerDeleteDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (departmentId: string) =>
      ownerDepartmentsApi.delete(departmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.departments });
      toast.success("Department deleted");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete department",
      );
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   GROUPS — Full CRUD + Student/Instructor
═══════════════════════════════════════════════════════════════════ */

export const useOwnerGroups = (filters?: {
  page?: number;
  limit?: number;
  course_id?: string;
}) =>
  useQuery({
    queryKey: [...OWNER_KEYS.groups, filters],
    queryFn: () => ownerGroupsApi.getAll(filters),
    placeholderData: (prev: any) => prev,
  });

export const useOwnerGroupDetail = (groupId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.groupDetail(groupId!),
    queryFn: () => ownerGroupsApi.getById(groupId!),
    enabled: !!groupId,
  });

export const useOwnerCreateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name: string;
      course_id: string;
      level: string;
      department_id?: string;
      max_students?: number;
      teacher_id?: string;
    }) => ownerGroupsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.groups });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      toast.success("Group created");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create group");
    },
  });
};

export const useOwnerUpdateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      payload,
    }: {
      groupId: string;
      payload: Record<string, any>;
    }) => ownerGroupsApi.update(groupId, payload),
    onSuccess: (_, { groupId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.groups });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.groupDetail(groupId) });
      toast.success("Group updated");
    },
  });
};

export const useOwnerDeleteGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => ownerGroupsApi.delete(groupId),
    onSuccess: (_, groupId) => {
      qc.removeQueries({ queryKey: OWNER_KEYS.groupDetail(groupId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.groups });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      toast.success("Group deleted");
    },
  });
};

export const useOwnerAddStudentToGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      studentId,
    }: {
      groupId: string;
      studentId: string;
    }) => ownerGroupsApi.addStudent(groupId, studentId),
    onSuccess: (_, { groupId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.groupDetail(groupId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.groups });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.enrollments });
      toast.success("Student added to group");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add student");
    },
  });
};

export const useOwnerRemoveStudentFromGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      studentId,
    }: {
      groupId: string;
      studentId: string;
    }) => ownerGroupsApi.removeStudent(groupId, studentId),
    onSuccess: (_, { groupId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.groupDetail(groupId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.groups });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.enrollments });
      toast.success("Student removed from group");
    },
  });
};

export const useOwnerAssignInstructor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      teacherId,
    }: {
      groupId: string;
      teacherId: string | null;
    }) => ownerGroupsApi.assignInstructor(groupId, teacherId),
    onSuccess: (_, { groupId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.groupDetail(groupId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.groups });
      toast.success("Instructor assignment updated");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   FEES — Full CRUD + Revenue Analytics
═══════════════════════════════════════════════════════════════════ */

export const useOwnerFees = (filters?: OwnerFeeFilters) =>
  useQuery({
    queryKey: [...OWNER_KEYS.fees, filters],
    queryFn: () => ownerFeesApi.getAll(filters),
    placeholderData: (prev: any) => prev,
  });

export const useOwnerFeeDetail = (feeId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.feeDetail(feeId!),
    queryFn: () => ownerFeesApi.getById(feeId!),
    enabled: !!feeId,
  });

export const useOwnerCorrectFeeAmount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ feeId, amount }: { feeId: string; amount: number }) =>
      ownerFeesApi.correctAmount(feeId, amount),
    onSuccess: (data, { feeId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.fees });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.feeDetail(feeId) });
      qc.invalidateQueries({ queryKey: ["owner", "fee-analytics"] });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.revenue });
      toast.success(
        `✅ تم تعديل المبلغ — ${data.correction.new_amount.toLocaleString()} DA`,
      );
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "فشل تعديل المبلغ");
    },
  });
};

export const useOwnerCreateFee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      student_id: string;
      enrollment_id?: string;
      amount: number;
      due_date: string;
    }) => ownerFeesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.fees });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.revenue });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      toast.success("Fee created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create fee");
    },
  });
};

export const useOwnerFeeAnalytics = (params?: {
  period?: "daily" | "monthly" | "yearly";
  date?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ["owner", "fee-analytics", params],
    queryFn: () => ownerFeesApi.getFeeAnalytics(params),
    staleTime: 30 * 1000,
  });

export const useOwnerUpdateFee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ feeId, payload }: { feeId: string; payload: any }) =>
      ownerFeesApi.update(feeId, payload),
    onSuccess: (_, { feeId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.fees });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.feeDetail(feeId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.revenue });
      toast.success("Fee updated");
    },
  });
};

export const useOwnerMarkFeePaid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      feeId,
      payload,
    }: {
      feeId: string;
      payload?: { payment_method?: string; reference_code?: string };
    }) => ownerFeesApi.markAsPaid(feeId, payload),
    onSuccess: (_, { feeId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.fees });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.feeDetail(feeId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.revenue });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.enrollments });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      toast.success("Fee marked as paid");
    },
  });
};

export const useOwnerDeleteFee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (feeId: string) => ownerFeesApi.delete(feeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.fees });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.revenue });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      toast.success("Fee deleted");
    },
  });
};

export const useOwnerRevenue = () =>
  useQuery({
    queryKey: OWNER_KEYS.revenue,
    queryFn: ownerFeesApi.getRevenue,
    placeholderData: (prev: any) => prev,
  });

/* ═══════════════════════════════════════════════════════════════════
   ENROLLMENTS — Full CRUD + Status management
═══════════════════════════════════════════════════════════════════ */

export const useOwnerEnrollments = (filters?: OwnerEnrollmentFilters) =>
  useQuery({
    queryKey: [...OWNER_KEYS.enrollments, filters],
    queryFn: () => ownerEnrollmentsApi.getAll(filters),
    placeholderData: (prev: any) => prev,
  });

export const useOwnerEnrollmentDetail = (enrollmentId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.enrollmentDetail(enrollmentId!),
    queryFn: () => ownerEnrollmentsApi.getById(enrollmentId!),
    enabled: !!enrollmentId,
  });

const invalidateOwnerEnrollments = (
  qc: ReturnType<typeof useQueryClient>,
  enrollmentId?: string,
) => {
  qc.invalidateQueries({ queryKey: OWNER_KEYS.enrollments });
  qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
  qc.invalidateQueries({ queryKey: OWNER_KEYS.fees });
  if (enrollmentId)
    qc.invalidateQueries({
      queryKey: OWNER_KEYS.enrollmentDetail(enrollmentId),
    });
};

export const useOwnerValidateEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      enrollmentId,
      pricing_id,
    }: {
      enrollmentId: string;
      pricing_id?: string;
    }) => ownerEnrollmentsApi.validate(enrollmentId, { pricing_id }),
    onSuccess: (_, { enrollmentId }) =>
      invalidateOwnerEnrollments(qc, enrollmentId),
  });
};

export const useOwnerRejectEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      enrollmentId,
      reason,
    }: {
      enrollmentId: string;
      reason?: string;
    }) => ownerEnrollmentsApi.reject(enrollmentId, { reason }),
    onSuccess: (_, { enrollmentId }) =>
      invalidateOwnerEnrollments(qc, enrollmentId),
  });
};

export const useOwnerMarkEnrollmentPaid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) =>
      ownerEnrollmentsApi.markPaid(enrollmentId),
    onSuccess: (_, enrollmentId) =>
      invalidateOwnerEnrollments(qc, enrollmentId),
  });
};

export const useOwnerFinishEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) =>
      ownerEnrollmentsApi.finish(enrollmentId),
    onSuccess: (_, enrollmentId) =>
      invalidateOwnerEnrollments(qc, enrollmentId),
  });
};

export const useOwnerChangeEnrollmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      enrollmentId,
      status,
    }: {
      enrollmentId: string;
      status: string;
    }) => ownerEnrollmentsApi.changeStatus(enrollmentId, status),
    onSuccess: (_, { enrollmentId }) => {
      invalidateOwnerEnrollments(qc, enrollmentId);
      toast.success("Enrollment status updated");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update status");
    },
  });
};

export const useOwnerDeleteEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) =>
      ownerEnrollmentsApi.delete(enrollmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.enrollments });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.fees });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.dashboard });
      toast.success("Enrollment deleted");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   DOCUMENTS
═══════════════════════════════════════════════════════════════════ */

export const useOwnerDocuments = () =>
  useQuery({
    queryKey: OWNER_KEYS.documents,
    queryFn: ownerDocumentsApi.getAll,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useOwnerDocumentDetail = (documentId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.documentDetail(documentId!),
    queryFn: () => ownerDocumentsApi.getById(documentId!),
    enabled: !!documentId,
  });

export const useOwnerApproveDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => ownerDocumentsApi.approve(documentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.documents });
      toast.success("Document approved");
    },
  });
};

export const useOwnerRejectDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => ownerDocumentsApi.reject(documentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.documents });
      toast.success("Document rejected");
    },
  });
};

export const useOwnerDeleteDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => ownerDocumentsApi.delete(documentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.documents });
      toast.success("Document deleted");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   SESSIONS — Full CRUD
═══════════════════════════════════════════════════════════════════ */

export const useOwnerSessions = () =>
  useQuery({
    queryKey: OWNER_KEYS.sessions,
    queryFn: ownerSessionsApi.getAll,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useOwnerSessionDetail = (sessionId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.sessionDetail(sessionId!),
    queryFn: () => ownerSessionsApi.getById(sessionId!),
    enabled: !!sessionId,
  });

export const useOwnerCreateSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      group_id: string;
      session_date: string;
      end_time?: string;
      topic?: string;
      room_id?: string;
    }) => ownerSessionsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.sessions });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.rooms });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.roomsOverview });
      toast.success("Session created");
    },
  });
};

export const useOwnerUpdateSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: Record<string, any>;
    }) => ownerSessionsApi.update(sessionId, payload),
    onSuccess: (_, { sessionId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.sessions });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.sessionDetail(sessionId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.rooms });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.roomsOverview });
      toast.success("Session updated");
    },
  });
};

export const useOwnerDeleteSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => ownerSessionsApi.delete(sessionId),
    onSuccess: (_, sessionId) => {
      qc.removeQueries({ queryKey: OWNER_KEYS.sessionDetail(sessionId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.sessions });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.rooms });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.roomsOverview });
      toast.success("Session deleted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete session");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   ATTENDANCE
═══════════════════════════════════════════════════════════════════ */

export const useOwnerAttendanceBySession = (sessionId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.sessionAttendance(sessionId!),
    queryFn: () => ownerAttendanceApi.getBySession(sessionId!),
    enabled: !!sessionId,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useOwnerAttendanceByStudent = (studentId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.studentAttendance(studentId!),
    queryFn: () => ownerAttendanceApi.getByStudent(studentId!),
    enabled: !!studentId,
    placeholderData: (prev: any) => prev,
  });

export const useOwnerMarkAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      student_id,
      status,
    }: {
      sessionId: string;
      student_id: string;
      status: string;
    }) => ownerAttendanceApi.markAttendance(sessionId, { student_id, status }),
    onSuccess: (_, { sessionId, student_id }) => {
      qc.invalidateQueries({
        queryKey: OWNER_KEYS.sessionAttendance(sessionId),
      });
      qc.invalidateQueries({
        queryKey: OWNER_KEYS.studentAttendance(student_id),
      });
    },
  });
};

export const useOwnerUpdateAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      attendanceId,
      status,
    }: {
      attendanceId: string;
      status: string;
    }) => ownerAttendanceApi.update(attendanceId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.attendance });
      toast.success("Attendance updated");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   EXAMS — Full CRUD
═══════════════════════════════════════════════════════════════════ */

export const useOwnerExams = () =>
  useQuery({
    queryKey: OWNER_KEYS.exams,
    queryFn: ownerExamsApi.getAll,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useOwnerExamDetail = (examId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.examDetail(examId!),
    queryFn: () => ownerExamsApi.getById(examId!),
    enabled: !!examId,
  });

export const useOwnerCreateExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      course_id: string;
      exam_name?: string;
      exam_date: string;
      max_marks: number;
    }) => ownerExamsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.exams });
      toast.success("Exam created");
    },
  });
};

export const useOwnerUpdateExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      examId,
      payload,
    }: {
      examId: string;
      payload: Record<string, any>;
    }) => ownerExamsApi.update(examId, payload),
    onSuccess: (_, { examId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.exams });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.examDetail(examId) });
      toast.success("Exam updated");
    },
  });
};

export const useOwnerDeleteExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (examId: string) => ownerExamsApi.delete(examId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.exams });
      toast.success("Exam deleted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete exam");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   RESULTS
═══════════════════════════════════════════════════════════════════ */

export const useOwnerResultsByExam = (examId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.examResults(examId!),
    queryFn: () => ownerResultsApi.getByExam(examId!),
    enabled: !!examId,
  });

export const useOwnerResultsByStudent = (studentId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.studentResults(studentId!),
    queryFn: () => ownerResultsApi.getByStudent(studentId!),
    enabled: !!studentId,
  });

export const useOwnerAddExamResult = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      examId,
      payload,
    }: {
      examId: string;
      payload: { studentId: string; marks_obtained: number; grade?: string };
    }) => ownerResultsApi.addByExam(examId, payload),
    onSuccess: (_, { examId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.examResults(examId) });
      toast.success("Result added");
    },
  });
};

export const useOwnerUpdateResult = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      resultId,
      payload,
    }: {
      resultId: string;
      payload: Record<string, any>;
    }) => ownerResultsApi.update(resultId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.results });
      toast.success("Result updated");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   PERMISSIONS
═══════════════════════════════════════════════════════════════════ */

export const useOwnerPermissions = () =>
  useQuery({
    queryKey: OWNER_KEYS.permissions,
    queryFn: ownerPermissionsApi.getAll,
    placeholderData: (prev: any) => prev,
  });

export const useOwnerCreatePermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      ownerPermissionsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.permissions });
      toast.success("Permission created");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create permission",
      );
    },
  });
};

export const useOwnerAssignPermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      permissionId,
    }: {
      studentId: string;
      permissionId: string;
    }) => ownerPermissionsApi.assignToStudent(studentId, permissionId),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.studentDetail(studentId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.permissions });
      toast.success("Permission assigned");
    },
  });
};

export const useOwnerRemovePermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      permissionId,
    }: {
      studentId: string;
      permissionId: string;
    }) => ownerPermissionsApi.removeFromStudent(studentId, permissionId),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.studentDetail(studentId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.permissions });
      toast.success("Permission removed");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   ANNOUNCEMENTS
═══════════════════════════════════════════════════════════════════ */

export const useOwnerAnnouncements = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  is_published?: boolean;
}) =>
  useQuery({
    queryKey: [...OWNER_KEYS.announcements, params],
    queryFn: () => ownerAnnouncementsApi.getAll(params),
  });

export const useOwnerAnnouncementDetail = (id?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.announcementDetail(id!),
    queryFn: () => ownerAnnouncementsApi.getById(id!),
    enabled: !!id,
  });

export const useOwnerCreateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => ownerAnnouncementsApi.create(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.announcements });
      toast.success("Announcement created");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create announcement",
      );
    },
  });
};

export const useOwnerUpdateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      ownerAnnouncementsApi.update(id, formData),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.announcements });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.announcementDetail(id) });
      toast.success("Announcement updated");
    },
  });
};

export const useOwnerDeleteAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ownerAnnouncementsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.announcements });
      toast.success("Announcement deleted");
    },
  });
};

export const useOwnerPublishAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ownerAnnouncementsApi.publish(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.announcements });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.announcementDetail(id) });
      toast.success("Announcement published");
    },
  });
};

export const useOwnerUnpublishAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ownerAnnouncementsApi.unpublish(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.announcements });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.announcementDetail(id) });
      toast.success("Announcement unpublished");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   COURSE PROFILES & PRICING
═══════════════════════════════════════════════════════════════════ */

export const useOwnerCourseProfile = (courseId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.courseProfile(courseId!),
    queryFn: () => ownerCourseProfileApi.get(courseId!),
    enabled: !!courseId,
  });

export const useOwnerCreateOrUpdateCourseProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      formData,
    }: {
      courseId: string;
      formData: FormData;
    }) => ownerCourseProfileApi.createOrUpdate(courseId, formData),
    onSuccess: (_, { courseId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.courseProfile(courseId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.courses });
      toast.success("Course profile saved");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to save profile");
    },
  });
};

export const useOwnerPublishCourseProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => ownerCourseProfileApi.publish(courseId),
    onSuccess: (_, courseId) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.courseProfile(courseId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.courses });
      toast.success("Profile published");
    },
  });
};

export const useOwnerUnpublishCourseProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => ownerCourseProfileApi.unpublish(courseId),
    onSuccess: (_, courseId) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.courseProfile(courseId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.courses });
      toast.success("Profile unpublished");
    },
  });
};

export const useOwnerCoursePricing = (courseId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.coursePricing(courseId!),
    queryFn: () => ownerCoursePricingApi.getAll(courseId!),
    enabled: !!courseId,
  });

export const useOwnerAddCoursePricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: {
        status_fr: string;
        status_ar?: string;
        status_en?: string;
        price: number;
        currency?: string;
        discount?: string;
        sort_order?: number;
      };
    }) => ownerCoursePricingApi.create(courseId, payload),
    onSuccess: (_, { courseId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.coursePricing(courseId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.courseProfile(courseId) });
      toast.success("Pricing added");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add pricing");
    },
  });
};

export const useOwnerUpdateCoursePricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      pricingId,
      payload,
    }: {
      courseId: string;
      pricingId: string;
      payload: Record<string, any>;
    }) => ownerCoursePricingApi.update(courseId, pricingId, payload),
    onSuccess: (_, { courseId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.coursePricing(courseId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.courseProfile(courseId) });
      toast.success("Pricing updated");
    },
  });
};

export const useOwnerDeleteCoursePricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      pricingId,
    }: {
      courseId: string;
      pricingId: string;
    }) => ownerCoursePricingApi.delete(courseId, pricingId),
    onSuccess: (_, { courseId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.coursePricing(courseId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.courseProfile(courseId) });
      toast.success("Pricing deleted");
    },
  });
};

/* ═══════════════════════════════════════════════════════════════════
   NOTIFICATIONS
═══════════════════════════════════════════════════════════════════ */

export const useOwnerNotificationTargets = () =>
  useQuery({
    queryKey: OWNER_KEYS.notificationTargets,
    queryFn: ownerNotificationsApi.getTargets,
    staleTime: 2 * 60 * 1000,
  });

export const useOwnerSearchStudents = (query: string, targetType?: string) => {
  return useQuery({
    queryKey: ["owner", "search-students", query, targetType],
    queryFn: () => ownerNotificationsApi.searchStudents(query, targetType),
    enabled: query.length >= 2,
  });
};

export const useOwnerSendNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OwnerNotificationPayload) =>
      ownerNotificationsApi.send(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.notifications });
      toast.success(data.message || "Notification sent");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to send notification",
      );
    },
  });
};

export const useOwnerBroadcastNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OwnerNotificationPayload) =>
      ownerNotificationsApi.broadcast(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.notifications });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to send notification",
      );
    },
  });
};

export const useOwnerNotifications = (params?: {
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: [...OWNER_KEYS.notifications, params],
    queryFn: () => ownerNotificationsApi.getAll(params),
  });

export const useOwnerNotificationDetail = (id?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.notificationDetail(id!),
    queryFn: () => ownerNotificationsApi.getById(id!),
    enabled: !!id,
  });

export const useOwnerDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ownerNotificationsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.notifications });
      toast.success("Notification deleted");
    },
    onError: () => toast.error("Failed to delete notification"),
  });
};

/* ═══════════════════════════════════════════════════════════════════
   ROOMS — Full CRUD + Schedule
═══════════════════════════════════════════════════════════════════ */

export const useOwnerRooms = (params?: {
  include_sessions?: boolean;
  active_only?: boolean;
}) =>
  useQuery({
    queryKey: [...OWNER_KEYS.rooms, params],
    queryFn: () => ownerRoomsApi.getAll(params),
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useOwnerRoomDetail = (roomId?: string) =>
  useQuery({
    queryKey: OWNER_KEYS.roomDetail(roomId!),
    queryFn: () => ownerRoomsApi.getById(roomId!),
    enabled: !!roomId,
  });

export const useOwnerRoomsScheduleOverview = (date: string) =>
  useQuery({
    queryKey: [...OWNER_KEYS.roomsOverview, date],
    queryFn: () => ownerRoomsApi.getScheduleOverview(date),
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useOwnerCreateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name: string;
      capacity?: number;
      location?: string;
    }) => ownerRoomsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.rooms });
      toast.success("Room created");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create room");
    },
  });
};

export const useOwnerUpdateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomId,
      payload,
    }: {
      roomId: string;
      payload: Record<string, any>;
    }) => ownerRoomsApi.update(roomId, payload),
    onSuccess: (_, { roomId }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEYS.rooms });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.roomDetail(roomId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.roomsOverview });
      toast.success("Room updated");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update room");
    },
  });
};

export const useOwnerDeleteRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => ownerRoomsApi.delete(roomId),
    onSuccess: (data, roomId) => {
      qc.removeQueries({ queryKey: OWNER_KEYS.roomDetail(roomId) });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.rooms });
      qc.invalidateQueries({ queryKey: OWNER_KEYS.roomsOverview });
      if (data.deactivated) {
        toast.info("Room has sessions — deactivated instead of deleted");
      } else {
        toast.success("Room deleted");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete room");
    },
  });
};
