/* ===============================================================
   ADMIN HOOKS - CONSOLIDATED FILE
   
   ✅ Aggressive refresh: FAST=15s / ACTIVE=20s / NORMAL=30s
   ✅ Cross-invalidation: Fees ↔ Enrollments ↔ Dashboard
   
   Last updated: February 2026
=============================================================== */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  adminAttendanceApi,
  adminCoursesApi,
  adminDepartmentsApi,
  adminDocumentsApi,
  adminEnrollmentsApi,
  adminExamsApi,
  adminFeesApi,
  adminGroupsApi,
  adminPermissionsApi,
  updateAdminAvatarApi,
  adminResultsApi,
  adminSessionsApi,
  adminStudentsApi,
  adminTeachersApi,
  adminUsersApi,
  type UserRole,
  type CreateStudentPayload,
  type UpdateStudentPayload,
  announcementApi,
  type UpdateAnnouncementData,
  type CreateAnnouncementData,
  type AnnouncementListParams,
  type CourseProfile,
  adminCoursePricingApi,
  adminCourseProfileApi,
  type CoursePricing,
  type CreateCoursePricingData,
  type CreateCourseProfileData,
  adminDashboardApi,
  adminNotificationApi,
  userNotificationApi,
  type NotificationDetail,
  type NotificationPayload,
  type NotificationTargets,
  adminRoomsApi,
  type UpdateRoomPayload,
  type CreateRoomPayload,
  type Room,
} from "../../lib/api/admin/admin.api";

import { useAuth } from "../../hooks/useAuth";
import type { Session } from "react-router";
import type {
  AdminStudent,
  Teacher,
  Course,
  CourseUI,
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  Group,
  CreateGroupPayload,
  UpdateGroupPayload,
  Enrollment,
  AdminDocumentResponse,
  AdminDocument,
  AttendanceBySession,
  AttendanceByStudent,
  AttendanceStatus,
  Fee,
  Exam,
  ExamResult,
  Result,
  Permission,
  CreatePermissionPayload,
  UpdateCoursePayload,
} from "../../types/Types";

/* ===============================================================
   QUERY KEYS
=============================================================== */

const DASHBOARD_KEY = ["admin-dashboard"];
const QUERY_KEY = "admin-announcements";
const COURSE_PROFILE_KEY = "admin-course-profile";
const COURSE_PRICING_KEY = "admin-course-pricing";
const ROOMS_KEY = ["admin-rooms"];
const roomKey = (id: string) => ["admin-room", id];
const ROOMS_OVERVIEW_KEY = ["admin-rooms-overview"];
const USERS_KEY = ["admin-users"];
const userKey = (id: string) => ["admin-user", id];
const STUDENTS_KEY = ["admin-students"];
const studentKey = (id: string) => ["admin-student", id];
const TEACHERS_KEY = ["admin-teachers"];
const teacherKey = (id: string) => ["admin-teacher", id];
const COURSES_KEY = ["admin-courses"];
const courseKey = (id: string) => ["admin-course", id];
const DEPARTMENTS_KEY = ["admin-departments"];
const departmentKey = (id: string) => ["admin-department", id];
const GROUPS_KEY = ["admin-groups"];
const groupKey = (id: string) => ["admin-group", id];
const ENROLLMENTS_KEY = ["admin-enrollments"];
const enrollmentKey = (id: string) => ["admin-enrollment", id];
const DOCUMENTS_KEY = ["admin-documents"];
const documentKey = (id: string) => ["admin-document", id];
const NOTIFICATIONS_KEY = ["admin-notifications"];
const NOTIFICATION_TARGETS_KEY = ["notification-targets"];
const SESSIONS_KEY = ["admin-sessions"];
const sessionKey = (id: string) => ["admin-session", id];
const sessionAttendanceKey = (id: string) => ["admin-session-attendance", id];
const ATTENDANCE_KEY = ["admin-attendance"];
const FEES_KEY = ["admin-fees"];
const feeKey = (id: string) => ["admin-fee", id];
const EXAMS_KEY = ["admin-exams"];
const examKey = (id: string) => ["admin-exam", id];
const examResultsKey = (id: string) => ["admin-exam-results", id];
const RESULTS_KEY = ["admin-results"];
const PERMISSIONS_KEY = ["admin-permissions"];
const ME_KEY = ["me"];

/* ===============================================================
   🔄 REFRESH CONSTANTS
=============================================================== */

const FAST = 15_000; // 🔴 15s — حي (قاعات، حضور، إشعارات)
const ACTIVE = 20_000; // 🟡 20s — نشط (dashboard, enrollments, fees, sessions)
const NORMAL = 30_000; // 🟢 30s — عادي (طلاب، أساتذة، كورسات)

/* ===============================================================
   DASHBOARD — 🟡 ACTIVE (20s)
=============================================================== */

export interface AdminDashboardStats {
  students: number;
  teachers: number;
  courses: number;
  groups: number;
  unpaidFees: number;
  gender: { Male?: number; Female?: number; Other?: number };
  enrollments: {
    pending: number;
    validated: number;
    paid: number;
    finished: number;
    total: number;
  };
  revenue: {
    collected: number;
    pending: number;
    total: number;
    paidCount: number;
    unpaidCount: number;
    totalCount: number;
  };
  recentEnrollments: Array<{
    enrollment_id: string;
    enrollment_date: string;
    registration_status: string;
    student: {
      student_id: string;
      first_name: string;
      last_name: string;
      email: string;
      avatar_url?: string;
    };
    course: {
      course_id: string;
      course_name: string;
      course_code?: string;
    };
    pricing?: {
      status_fr: string;
      price: number;
      currency: string;
    };
  }>;
  recentFees: Array<{
    fee_id: string;
    amount: number;
    paid_at: string;
    payment_method?: string;
    student: {
      first_name: string;
      last_name: string;
    };
  }>;
}

export const useAdminDashboard = () =>
  useQuery<AdminDashboardStats>({
    queryKey: DASHBOARD_KEY,
    queryFn: adminDashboardApi.getStats,
    refetchInterval: ACTIVE,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

/* ===============================================================
   USERS — 🟢 NORMAL (30s)
=============================================================== */

export interface AdminUser {
  created_at: string | number | Date;
  user_id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  google_avatar?: string | null;
}

export const useAdminUsers = () =>
  useQuery<AdminUser[]>({
    queryKey: USERS_KEY,
    queryFn: adminUsersApi.getAll,
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminUser = (userId?: string) =>
  useQuery<AdminUser>({
    queryKey: userKey(userId!),
    queryFn: () => adminUsersApi.getById(userId!),
    enabled: !!userId,
  });

export const useToggleUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      isActive,
    }: {
      userId: string;
      isActive: boolean;
    }) =>
      isActive ? adminUsersApi.disable(userId) : adminUsersApi.enable(userId),
    onMutate: async ({ userId, isActive }) => {
      await qc.cancelQueries({ queryKey: userKey(userId) });
      const previousUser = qc.getQueryData<AdminUser>(userKey(userId));
      qc.setQueryData<AdminUser>(userKey(userId), (old) =>
        old ? { ...old, is_active: !isActive } : old,
      );
      return { previousUser };
    },
    onError: (_err, { userId }, context) => {
      if (context?.previousUser) {
        qc.setQueryData(userKey(userId), context.previousUser);
      }
    },
    onSettled: (_data, _error, { userId }) => {
      qc.invalidateQueries({ queryKey: userKey(userId) });
      qc.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, email }: { userId: string; email: string }) =>
      adminUsersApi.update(userId, { email }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminUsersApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
};

/* ===============================================================
   STUDENTS — 🟢 NORMAL (30s)
=============================================================== */

export const useAdminStudents = (params?: {
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: [STUDENTS_KEY, params],
    queryFn: async () => {
      const res = await adminStudentsApi.getAll(params);
      return res; // 🔥 مهم
    },
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminStudent = (studentId?: string) =>
  useQuery<AdminStudent>({
    queryKey: studentKey(studentId!),
    queryFn: async () => {
      const data = await adminStudentsApi.getById(studentId!);
      return data.data ?? data.student ?? data;
    },
    enabled: !!studentId,
  });

export const useCreateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStudentPayload) =>
      adminStudentsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      payload,
    }: {
      studentId: string;
      payload: UpdateStudentPayload;
    }) => adminStudentsApi.update(studentId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: STUDENTS_KEY });
      qc.invalidateQueries({ queryKey: studentKey(variables.studentId) });
    },
  });
};

export const useUpdateStudentAvatar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      formData,
    }: {
      studentId: string;
      formData: FormData;
    }) => adminStudentsApi.updateStudentAvatar(studentId, formData),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: STUDENTS_KEY });
      qc.invalidateQueries({ queryKey: studentKey(variables.studentId) });
    },
  });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => adminStudentsApi.delete(studentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
    onMutate: async (studentId) => {
      await qc.cancelQueries({ queryKey: STUDENTS_KEY });
      const previousStudents = qc.getQueryData<AdminStudent[]>(STUDENTS_KEY);
      qc.setQueryData<AdminStudent[]>(STUDENTS_KEY, (old) =>
        old ? old.filter((s) => s.student_id !== studentId) : [],
      );
      return { previousStudents };
    },
    onError: (_err, _studentId, context) => {
      if (context?.previousStudents) {
        qc.setQueryData(STUDENTS_KEY, context.previousStudents);
      }
    },
  });
};

/* ===============================================================
   TEACHERS — 🟢 NORMAL (30s)
=============================================================== */

export type UpdateTeacherPayload = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
};

export type CreateTeacherPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
};

export const useAdminTeachers = () =>
  useQuery<Teacher[]>({
    queryKey: TEACHERS_KEY,
    queryFn: adminTeachersApi.getAll,
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminTeacher = (teacherId?: string) =>
  useQuery<Teacher>({
    queryKey: teacherId ? teacherKey(teacherId) : ["admin-teacher", "disabled"],
    enabled: typeof teacherId === "string",
    queryFn: () => adminTeachersApi.getById(teacherId!),
  });

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTeacherPayload) =>
      adminTeachersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHERS_KEY });
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
      toast.success("Teacher created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create teacher");
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teacherId: string) => adminTeachersApi.delete(teacherId),
    onSuccess: (_, teacherId) => {
      queryClient.removeQueries({ queryKey: teacherKey(teacherId) });
      queryClient.invalidateQueries({ queryKey: TEACHERS_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Teacher,
    Error,
    { teacherId: string; payload: Partial<Teacher> }
  >({
    mutationFn: ({ teacherId, payload }) =>
      adminTeachersApi.update(teacherId, payload),
    onSuccess: (updatedTeacher) => {
      queryClient.setQueryData(
        teacherKey(updatedTeacher.teacher_id),
        updatedTeacher,
      );
      queryClient.invalidateQueries({ queryKey: TEACHERS_KEY });
    },
  });
};
/* ===============================================================
   COURSES — 🟢 NORMAL (30s)
=============================================================== */

export const useAdminCourses = () =>
  useQuery<Course[]>({
    queryKey: COURSES_KEY,
    queryFn: adminCoursesApi.getAll,
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminCourse = (courseId?: string) =>
  useQuery<CourseUI>({
    queryKey: courseId ? courseKey(courseId) : ["admin-course", "disabled"],
    enabled: typeof courseId === "string",
    queryFn: async () => {
      const course = await adminCoursesApi.getById(courseId!);
      const transformed: CourseUI = {
        ...course,
        enrollment_count: course.enrollments?.length ?? 0,
        completion_rate: undefined,
        duration: undefined,
        description: undefined,
        prerequisites: undefined,
        syllabus: undefined,
        instructor: course.teacher
          ? `${course.teacher.first_name} ${course.teacher.last_name}`
          : undefined,
        created_at: undefined,
      };
      return transformed;
    },
  });

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminCoursesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: UpdateCoursePayload;
    }) => adminCoursesApi.update(courseId, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY });
      queryClient.invalidateQueries({ queryKey: courseKey(vars.courseId) });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminCoursesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
};

/* ===============================================================
   DEPARTMENTS — 🟢 NORMAL (30s)
=============================================================== */

export const useAdminDepartments = () =>
  useQuery<Department[]>({
    queryKey: DEPARTMENTS_KEY,
    queryFn: adminDepartmentsApi.getAll,
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminDepartment = (departmentId?: string) =>
  useQuery<Department>({
    queryKey: departmentKey(departmentId!),
    queryFn: () => adminDepartmentsApi.getById(departmentId!),
    enabled: !!departmentId,
  });

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) =>
      adminDepartmentsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_KEY });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      departmentId,
      payload,
    }: {
      departmentId: string;
      payload: UpdateDepartmentPayload;
    }) => adminDepartmentsApi.update(departmentId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_KEY });
      queryClient.invalidateQueries({
        queryKey: departmentKey(variables.departmentId),
      });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (departmentId: string) =>
      adminDepartmentsApi.delete(departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_KEY });
    },
  });
};

/* ===============================================================
   GROUPS — 🟢 NORMAL (30s)
=============================================================== */

export const useAdminGroups = () =>
  useQuery<Group[]>({
    queryKey: GROUPS_KEY,
    queryFn: adminGroupsApi.getAll,
    select: (data: unknown) => {
      if (Array.isArray(data)) return data as Group[];
      if (Array.isArray((data as { data?: unknown[] })?.data))
        return (data as { data: Group[] }).data;
      if (Array.isArray((data as { groups?: unknown[] })?.groups))
        return (data as { groups: Group[] }).groups;
      return [];
    },
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminGroup = (groupId?: string) =>
  useQuery<Group>({
    queryKey: groupId ? groupKey(groupId) : ["admin-group", "disabled"],
    enabled: typeof groupId === "string",
    queryFn: () => adminGroupsApi.getById(groupId!),
  });

export const useCreateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => adminGroupsApi.create(payload),
    onSuccess: (newGroup) => {
      qc.invalidateQueries({ queryKey: GROUPS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      qc.setQueryData(groupKey(newGroup.group_id), newGroup);
      // ✅ أضف هذا — يُبطل كل الدورات المُحملة (الدورة التي ينتمي إليها الفوج)
      qc.invalidateQueries({ queryKey: COURSES_KEY });
      if (newGroup.course_id) {
        qc.invalidateQueries({ queryKey: courseKey(newGroup.course_id) });
        qc.invalidateQueries({
          queryKey: ["admin-course", newGroup.course_id],
        });
      }
    },
  });
};

export const useUpdateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      payload,
    }: {
      groupId: string;
      payload: UpdateGroupPayload;
    }) => adminGroupsApi.update(groupId, payload),
    onSuccess: (updatedGroup) => {
      qc.setQueryData(groupKey(updatedGroup.group_id), updatedGroup);
      qc.invalidateQueries({ queryKey: GROUPS_KEY });
      // ✅ Fix: invalidate useAdminGroupDetails cache key
      qc.invalidateQueries({
        queryKey: ["admin", "groups", updatedGroup.group_id],
      });
    },
  });
};

export const useDeleteGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => adminGroupsApi.delete(groupId),
    onSuccess: (_, groupId) => {
      qc.removeQueries({ queryKey: groupKey(groupId) });
      qc.invalidateQueries({ queryKey: GROUPS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      qc.invalidateQueries({ queryKey: COURSES_KEY });
      qc.invalidateQueries({ queryKey: ["admin-course"] });
      // ✅ Fix: invalidate useAdminGroupDetails cache key
      qc.invalidateQueries({ queryKey: ["admin", "groups", groupId] });
    },
  });
};

export const useAssignInstructor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      instructorId,
    }: {
      groupId: string;
      instructorId: string | null;
    }) => adminGroupsApi.assignInstructor(groupId, instructorId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: groupKey(vars.groupId) });
      qc.invalidateQueries({ queryKey: GROUPS_KEY });
      // ✅ Fix: invalidate useAdminGroupDetails cache key
      qc.invalidateQueries({ queryKey: ["admin", "groups", vars.groupId] });
    },
  });
};

export const useAddStudentToGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      studentId,
    }: {
      groupId: string;
      studentId: string;
    }) => adminGroupsApi.addStudent(groupId, studentId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: groupKey(vars.groupId) });
      qc.invalidateQueries({ queryKey: GROUPS_KEY });
      qc.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
    },
  });
};

export const useRemoveStudentFromGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      studentId,
    }: {
      groupId: string;
      studentId: string;
    }) => adminGroupsApi.removeStudent(groupId, studentId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: groupKey(vars.groupId) });
      qc.invalidateQueries({ queryKey: GROUPS_KEY });
      qc.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
    },
  });
};

/* ===============================================================
   ENROLLMENTS — 🟡 ACTIVE (20s)
=============================================================== */

export const useAdminEnrollments = () =>
  useQuery<Enrollment[]>({
    queryKey: ENROLLMENTS_KEY,
    queryFn: adminEnrollmentsApi.getAll,
    refetchInterval: ACTIVE,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminEnrollment = (enrollmentId?: string) =>
  useQuery<Enrollment>({
    queryKey: enrollmentKey(enrollmentId!),
    queryFn: () => adminEnrollmentsApi.getById(enrollmentId!),
    enabled: Boolean(enrollmentId),
  });

// في useAdmin.ts أضف هذا الـ hook
export const useDeleteEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) =>
      adminEnrollmentsApi.delete(enrollmentId),
    onSuccess: (_, enrollmentId) => {
      qc.removeQueries({ queryKey: enrollmentKey(enrollmentId) });
      invalidateEnrollments(qc, enrollmentId);
    },
  });
};

const invalidateEnrollments = (
  qc: ReturnType<typeof useQueryClient>,
  id?: string,
) => {
  qc.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
  qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
  qc.invalidateQueries({ queryKey: FEES_KEY });
  if (id) qc.invalidateQueries({ queryKey: enrollmentKey(id) });
};

export const useValidateEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      enrollmentId,
      pricing_id,
    }: {
      enrollmentId: string;
      pricing_id?: string;
    }) => adminEnrollmentsApi.validate(enrollmentId, { pricing_id }),
    onSuccess: (_, { enrollmentId }) => invalidateEnrollments(qc, enrollmentId),
  });
};

export const useRejectEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      enrollmentId,
      reason,
    }: {
      enrollmentId: string;
      reason?: string;
    }) => adminEnrollmentsApi.reject(enrollmentId, { reason }),
    onSuccess: (_, vars) => invalidateEnrollments(qc, vars.enrollmentId),
  });
};

export const useMarkEnrollmentPaid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) =>
      adminEnrollmentsApi.markPaid(enrollmentId),
    onSuccess: (_, enrollmentId) => invalidateEnrollments(qc, enrollmentId),
  });
};

export const useFinishEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) =>
      adminEnrollmentsApi.finish(enrollmentId),
    onSuccess: (_, enrollmentId) => invalidateEnrollments(qc, enrollmentId),
  });
};

/* ===============================================================
   DOCUMENTS — 🟡 ACTIVE (20s)
=============================================================== */

const getFileType = (path: string): "pdf" | "image" | "doc" => {
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext ?? ""))
    return "image";
  if (["doc", "docx", "txt", "rtf"].includes(ext ?? "")) return "doc";
  return "doc";
};

const transformDocument = (doc: AdminDocumentResponse): AdminDocument => {
  try {
    return {
      id: doc.document_id,
      fileName: doc.file_path.split("/").pop() ?? "document",
      fileUrl: doc.file_path,
      fileType: getFileType(doc.file_path),
      uploadDate: doc.uploaded_at,
      status: doc.status || "PENDING",
      student: {
        id: doc.student.student_id,
        name: `${doc.student.first_name} ${doc.student.last_name}`,
        email: doc.student.email,
        avatar: null,
      },
    };
  } catch (error) {
    console.error("Error transforming document:", error, doc);
    throw new Error("Failed to transform document data");
  }
};

export const useAdminDocuments = () =>
  useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: async () => {
      try {
        const res = await adminDocumentsApi.getAll();
        if (!res) return [];
        if (!Array.isArray(res)) throw new Error("Invalid response format");
        if (res.length > 0 && "fileName" in res[0]) {
          return res.map((doc: any) => ({
            ...doc,
            status: doc.status || "PENDING",
          })) as AdminDocument[];
        }
        return res.map(transformDocument);
      } catch (error) {
        console.error("Error fetching documents:", error);
        throw error;
      }
    },
    retry: 2,
    refetchInterval: ACTIVE,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminDocument = (documentId?: string) =>
  useQuery<AdminDocument>({
    queryKey: documentKey(documentId!),
    queryFn: async () => {
      const res: AdminDocumentResponse = await adminDocumentsApi.getById(
        documentId!,
      );
      return transformDocument(res);
    },
    enabled: !!documentId,
    retry: 2,
  });

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => adminDocumentsApi.delete(documentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      toast.success("🗑️ Document deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete document",
      );
    },
  });
};

export const useApproveDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => adminDocumentsApi.approve(documentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      qc.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
      qc.invalidateQueries({ queryKey: STUDENTS_KEY });
      toast.success("✅ Document approved successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to approve document",
      );
    },
  });
};

export const useRejectDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      documentId,
      reason,
    }: {
      documentId: string;
      reason: string;
    }) => adminDocumentsApi.reject(documentId, reason),
    // ✅ الـ backend يتكفل بالإشعار والـ rejection_reason
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      qc.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
      qc.invalidateQueries({ queryKey: STUDENTS_KEY });
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "فشل رفض الوثيقة");
    },
  });
};

/* ===============================================================
   SESSIONS — 🟡 ACTIVE (20s)
=============================================================== */

export const useAdminSessions = () =>
  useQuery({
    queryKey: SESSIONS_KEY, // ✅ was ["admin", "sessions"] — now consistent
    queryFn: () => adminSessionsApi.getAll(),
    select: (data: unknown) => {
      if (Array.isArray(data)) return data;
      if (Array.isArray((data as { data?: unknown[] })?.data))
        return (data as { data: unknown[] }).data;
      if (Array.isArray((data as { sessions?: unknown[] })?.sessions))
        return (data as { sessions: unknown[] }).sessions;
      return [];
    },
    refetchInterval: ACTIVE,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminSession = (sessionId?: string) =>
  useQuery<Session>({
    queryKey: sessionId ? sessionKey(sessionId) : ["admin-session", "disabled"],
    enabled: typeof sessionId === "string",
    queryFn: () => adminSessionsApi.getById(sessionId!),
  });

export const useAdminSessionAttendance = (sessionId?: string) =>
  useQuery({
    queryKey: sessionId
      ? sessionAttendanceKey(sessionId)
      : ["admin-session-attendance", "disabled"],
    enabled: typeof sessionId === "string",
    queryFn: () => adminSessionsApi.getAttendance(sessionId!),
  });

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminSessionsApi.create,
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ROOMS_KEY });
      queryClient.invalidateQueries({ queryKey: ROOMS_OVERVIEW_KEY });
      queryClient.setQueryData(sessionKey(newSession.session_id), newSession);
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: {
        session_date?: string;
        topic?: string;
        room_id?: string | null;
      };
    }) => adminSessionsApi.update(sessionId, payload),
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(
        sessionKey(updatedSession.session_id),
        updatedSession,
      );
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ROOMS_KEY });
      queryClient.invalidateQueries({ queryKey: ROOMS_OVERVIEW_KEY });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => adminSessionsApi.delete(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.removeQueries({ queryKey: sessionKey(sessionId) });
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ROOMS_KEY });
      queryClient.invalidateQueries({ queryKey: ROOMS_OVERVIEW_KEY });
    },
  });
};

export const useMarkSessionAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: { studentId: string; status: "Present" | "Absent" };
    }) => adminSessionsApi.markAttendance(sessionId, payload),
    onSuccess: (_, vars) => {
      // ✅ Invalidate BOTH keys
      queryClient.invalidateQueries({
        queryKey: sessionAttendanceKey(vars.sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: [ATTENDANCE_KEY, "session", vars.sessionId],
      });
    },
  });
};

/* ===============================================================
   ATTENDANCE — 🔴 FAST (15s)
=============================================================== */

export const useAdminAttendanceBySession = (sessionId?: string) =>
  useQuery<AttendanceBySession[]>({
    queryKey: [ATTENDANCE_KEY, "session", sessionId],
    queryFn: () => adminAttendanceApi.getBySession(sessionId!),
    enabled: !!sessionId,
    refetchInterval: FAST,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminAttendanceByStudent = (studentId?: string) =>
  useQuery<AttendanceByStudent[]>({
    queryKey: [ATTENDANCE_KEY, "student", studentId],
    queryFn: () => adminAttendanceApi.getByStudent(studentId!),
    enabled: !!studentId,
    refetchInterval: FAST,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      session_id: string;
      student_id: string;
      status: AttendanceStatus;
    }) => adminAttendanceApi.markAttendance(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ATTENDANCE_KEY, "session", variables.session_id],
      });
      queryClient.invalidateQueries({
        queryKey: [ATTENDANCE_KEY, "student", variables.student_id],
      });
    },
  });
};

export const useAdminUpdateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { attendanceId: string; status: AttendanceStatus }) =>
      adminAttendanceApi.updateStatus(payload.attendanceId, payload.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
};

export const useAdminDeleteAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attendanceId: string) =>
      adminAttendanceApi.delete(attendanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
};

/* ===============================================================
   FEES — 🟡 ACTIVE (20s)
=============================================================== */

export const useAdminFees = (params?: { page?: number; limit?: number }) =>
  useQuery({
    queryKey: [...FEES_KEY, params],
    queryFn: () => adminFeesApi.getAll(params),
    refetchInterval: ACTIVE,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminFee = (feeId?: string) =>
  useQuery<Fee>({
    queryKey: feeKey(feeId!),
    queryFn: () => adminFeesApi.getById(feeId!),
    enabled: !!feeId,
  });

export const useUpdateFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      feeId,
      payload,
    }: {
      feeId: string;
      payload: { amount?: number; due_date?: string };
    }) => adminFeesApi.update(feeId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FEES_KEY });
      queryClient.invalidateQueries({ queryKey: feeKey(variables.feeId) });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
};

export const useMarkFeePaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      feeId,
      payload,
    }: {
      feeId: string;
      payload?: { payment_method?: string; reference_code?: string };
    }) => adminFeesApi.markAsPaid(feeId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FEES_KEY });
      queryClient.invalidateQueries({ queryKey: feeKey(variables.feeId) });
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
};
/* ===============================================================
   EXAMS — 🟢 NORMAL (30s)
=============================================================== */

export const useAdminExams = () =>
  useQuery<Exam[]>({
    queryKey: EXAMS_KEY,
    queryFn: adminExamsApi.getAll,
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminExam = (examId?: string) =>
  useQuery<Exam>({
    queryKey: examKey(examId!),
    queryFn: () => adminExamsApi.getById(examId!),
    enabled: !!examId,
  });

export const useAdminExamResults = (examId?: string) =>
  useQuery<ExamResult[]>({
    queryKey: examResultsKey(examId!),
    queryFn: () => adminExamsApi.getResults(examId!),
    enabled: !!examId,
  });

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminExamsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAMS_KEY });
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      examId,
      payload,
    }: {
      examId: string;
      payload: { exam_name?: string; exam_date?: string; max_marks?: number };
    }) => adminExamsApi.update(examId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EXAMS_KEY });
      queryClient.invalidateQueries({ queryKey: examKey(variables.examId) });
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (examId: string) => adminExamsApi.delete(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAMS_KEY });
    },
  });
};

export const useAddExamResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      examId,
      payload,
    }: {
      examId: string;
      payload: {
        student_id: string;
        marks_obtained: number;
        grade?: string;
      };
    }) => adminExamsApi.addResult(examId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: examResultsKey(variables.examId),
      });
    },
  });
};

/* ===============================================================
   RESULTS
=============================================================== */

export const useAdminResultsByExam = (examId?: string) =>
  useQuery<Result[]>({
    queryKey: [RESULTS_KEY, "exam", examId],
    queryFn: () => adminResultsApi.getByExam(examId!),
    enabled: !!examId,
  });

export const useAdminResultsByStudent = (studentId?: string) =>
  useQuery<Result[]>({
    queryKey: [RESULTS_KEY, "student", studentId],
    queryFn: () => adminResultsApi.getByStudent(studentId!),
    enabled: !!studentId,
  });

export const useAddResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      examId,
      payload,
    }: {
      examId: string;
      payload: {
        student_id: string;
        marks_obtained: number;
        grade?: string;
      };
    }) => adminResultsApi.add(examId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [RESULTS_KEY, "exam", variables.examId],
      });
      queryClient.invalidateQueries({ queryKey: RESULTS_KEY });
    },
  });
};

export const useUpdateResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      resultId,
      payload,
    }: {
      resultId: string;
      payload: { marks_obtained?: number; grade?: string };
    }) => adminResultsApi.update(resultId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESULTS_KEY });
    },
  });
};

/* ===============================================================
   PERMISSIONS — 🟢 NORMAL (30s)
=============================================================== */

export const useAdminPermissions = () =>
  useQuery<Permission[]>({
    queryKey: PERMISSIONS_KEY,
    queryFn: adminPermissionsApi.getAll,
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePermissionPayload) =>
      adminPermissionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY });
    },
  });
};

export const useAssignPermissionToStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      permissionId,
    }: {
      studentId: string;
      permissionId: string;
    }) => adminPermissionsApi.assignToStudent(studentId, permissionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: studentKey(variables.studentId),
      });
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY });
    },
  });
};

export const useRemovePermissionFromStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      permissionId,
    }: {
      studentId: string;
      permissionId: string;
    }) => adminPermissionsApi.removeFromStudent(studentId, permissionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: studentKey(variables.studentId),
      });
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY });
    },
  });
};

/* ===============================================================
   PROFILE
=============================================================== */

export const useUpdateAdminAvatar = () => {
  const { setUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminAvatarApi,
    onSuccess: (data) => {
      if (data?.user) setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ME_KEY });
      toast.success("Avatar updated successfully");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update avatar";
      toast.error(message);
    },
  });
};

/* ===============================================================
   ANNOUNCEMENTS — 🟢 NORMAL (30s)
=============================================================== */

export const useAdminAnnouncements = (params?: AnnouncementListParams) =>
  useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => announcementApi.getAll(params),
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminAnnouncement = (id: string) =>
  useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => announcementApi.getById(id),
    enabled: !!id,
  });

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnnouncementData) => announcementApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(res.message || "تم إنشاء الإعلان بنجاح");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء إنشاء الإعلان",
      );
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncementData }) =>
      announcementApi.update(id, data),
    onSuccess: (res, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      toast.success(res.message || "تم تحديث الإعلان بنجاح");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء تحديث الإعلان",
      );
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementApi.delete(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(res.message || "تم حذف الإعلان بنجاح");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء حذف الإعلان",
      );
    },
  });
};

export const usePublishAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementApi.publish(id),
    onSuccess: (res, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      toast.success(res.message || "تم نشر الإعلان بنجاح");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء نشر الإعلان",
      );
    },
  });
};

export const usePinAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementApi.pin(id),
    onSuccess: (res, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      toast.success(res.message || "تم تثبيت الإعلان");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء تثبيت الإعلان",
      );
    },
  });
};

export const useAdminMarkBulkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      entries,
    }: {
      sessionId: string;
      entries: Array<{ student_id: string; status: AttendanceStatus }>;
    }) => adminAttendanceApi.markBulkAttendance(sessionId, entries),
    onSuccess: (_, variables) => {
      // ✅ Invalidate the key used by useAdminSessionAttendance (modal)
      queryClient.invalidateQueries({
        queryKey: sessionAttendanceKey(variables.sessionId),
      });
      // ✅ Invalidate the key used by useAdminAttendanceBySession
      queryClient.invalidateQueries({
        queryKey: [ATTENDANCE_KEY, "session", variables.sessionId],
      });
      // ✅ Invalidate all attendance queries
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء تسجيل الحضور",
      );
    },
  });
};

// ✅ NEW: Get attendance by date for a group
export const useAdminAttendanceByDate = (groupId?: string, date?: string) =>
  useQuery({
    queryKey: [ATTENDANCE_KEY, "date", groupId, date],
    queryFn: () => adminAttendanceApi.getByDate(groupId!, date!),
    enabled: !!groupId && !!date,
    refetchInterval: FAST,
    refetchOnWindowFocus: true,
  });

// ✅ NEW: Student attendance summary with percentage
export const useAdminStudentAttendanceSummary = (
  studentId?: string,
  groupId?: string,
) =>
  useQuery({
    queryKey: [ATTENDANCE_KEY, "summary", studentId, groupId],
    queryFn: () => adminAttendanceApi.getStudentSummary(studentId!, groupId),
    enabled: !!studentId,
  });

export const useUnpinAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementApi.unpin(id),
    onSuccess: (res, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      toast.success(res.message || "تم إلغاء تثبيت الإعلان");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء إلغاء التثبيت",
      );
    },
  });
};

export const useUnpublishAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementApi.unpublish(id),
    onSuccess: (res, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      toast.success(res.message || "تم إلغاء نشر الإعلان");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء إلغاء النشر",
      );
    },
  });
};

/* ===============================================================
   COURSE PROFILE & PRICING
=============================================================== */

export const useAdminCourseProfile = (courseId?: string) =>
  useQuery<CourseProfile>({
    queryKey: [COURSE_PROFILE_KEY, courseId],
    queryFn: () => adminCourseProfileApi.get(courseId!),
    enabled: !!courseId,
  });

export const useCreateOrUpdateCourseProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: CreateCourseProfileData;
    }) => adminCourseProfileApi.createOrUpdate(courseId, data),
    onSuccess: (_, { courseId }) => {
      qc.invalidateQueries({ queryKey: [COURSE_PROFILE_KEY, courseId] });
      qc.invalidateQueries({ queryKey: COURSES_KEY });
      toast.success("تم حفظ الملف العام بنجاح");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "حدث خطأ");
    },
  });
};

export const usePublishCourseProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => adminCourseProfileApi.publish(courseId),
    onSuccess: (_, courseId) => {
      qc.invalidateQueries({ queryKey: [COURSE_PROFILE_KEY, courseId] });
      qc.invalidateQueries({ queryKey: COURSES_KEY });
      toast.success("تم النشر بنجاح");
    },
  });
};

export const useUnpublishCourseProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => adminCourseProfileApi.unpublish(courseId),
    onSuccess: (_, courseId) => {
      qc.invalidateQueries({ queryKey: [COURSE_PROFILE_KEY, courseId] });
      qc.invalidateQueries({ queryKey: COURSES_KEY });
      toast.success("تم إلغاء النشر");
    },
  });
};

export const useAdminCoursePricing = (courseId?: string) =>
  useQuery<CoursePricing[]>({
    queryKey: [COURSE_PRICING_KEY, courseId],
    queryFn: () => adminCoursePricingApi.getAll(courseId!),
    enabled: !!courseId,
  });

export const useAddCoursePricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: CreateCoursePricingData;
    }) => adminCoursePricingApi.create(courseId, data),
    onSuccess: (_, { courseId }) => {
      qc.invalidateQueries({ queryKey: [COURSE_PRICING_KEY, courseId] });
      qc.invalidateQueries({ queryKey: [COURSE_PROFILE_KEY, courseId] });
      toast.success("تم إضافة التعرفة بنجاح");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "حدث خطأ");
    },
  });
};

export const useUpdateCoursePricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      pricingId,
      data,
    }: {
      courseId: string;
      pricingId: string;
      data: Partial<CreateCoursePricingData>;
    }) => adminCoursePricingApi.update(courseId, pricingId, data),
    onSuccess: (_, { courseId }) => {
      qc.invalidateQueries({ queryKey: [COURSE_PRICING_KEY, courseId] });
      qc.invalidateQueries({ queryKey: [COURSE_PROFILE_KEY, courseId] });
      toast.success("تم تحديث التعرفة");
    },
  });
};

export const useDeleteCoursePricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      pricingId,
    }: {
      courseId: string;
      pricingId: string;
    }) => adminCoursePricingApi.delete(courseId, pricingId),
    onSuccess: (_, { courseId }) => {
      qc.invalidateQueries({ queryKey: [COURSE_PRICING_KEY, courseId] });
      qc.invalidateQueries({ queryKey: [COURSE_PROFILE_KEY, courseId] });
      toast.success("تم حذف التعرفة");
    },
  });
};

/* ===============================================================
   NOTIFICATIONS — 🟡 ACTIVE (20s)
=============================================================== */

export const useNotificationTargets = () =>
  useQuery<NotificationTargets>({
    queryKey: NOTIFICATION_TARGETS_KEY,
    queryFn: adminNotificationApi.getTargets,
    staleTime: 2 * 60 * 1000,
  });

export const useSendNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotificationPayload) =>
      adminNotificationApi.send(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      toast.success("تم إرسال الإشعار بنجاح", {
        description: `تم الإرسال إلى ${data.recipients_count} مستلم`,
      });
    },
    onError: (error: any) => {
      toast.error("فشل إرسال الإشعار", {
        description: error.response?.data?.message || "حاول مرة أخرى",
      });
    },
  });
};

export const useAdminNotifications = (page = 1) =>
  useQuery({
    queryKey: [...NOTIFICATIONS_KEY, page],
    queryFn: () => adminNotificationApi.getAll(page),
    refetchInterval: ACTIVE,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminNotificationDetail = (id?: string) =>
  useQuery<NotificationDetail>({
    queryKey: ["admin-notification", id],
    queryFn: () => adminNotificationApi.getById(id!),
    enabled: !!id,
  });

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminNotificationApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      toast.success("تم حذف الإشعار");
    },
    onError: () => toast.error("فشل حذف الإشعار"),
  });
};

/* ===============================================================
   NOTIFICATIONS - Student / Teacher Side
=============================================================== */

const MY_NOTIFICATIONS_KEY = (base: string) => [`${base}-notifications`];
const UNREAD_COUNT_KEY = (base: string) => [`${base}-unread-count`];

export const useMyNotifications = (
  base: "student" | "teacher",
  page = 1,
  unreadOnly = false,
) =>
  useQuery({
    queryKey: [...MY_NOTIFICATIONS_KEY(base), page, unreadOnly],
    queryFn: () => userNotificationApi.getMine(base, page, unreadOnly),
  });

export const useUnreadNotificationCount = (base: "student" | "teacher") =>
  useQuery({
    queryKey: UNREAD_COUNT_KEY(base),
    queryFn: () => userNotificationApi.getUnreadCount(base),
    refetchInterval: FAST, // 🔴 15s
  });

export const useMarkNotificationRead = (base: "student" | "teacher") => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recipientId: string) =>
      userNotificationApi.markRead(base, recipientId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MY_NOTIFICATIONS_KEY(base) });
      qc.invalidateQueries({ queryKey: UNREAD_COUNT_KEY(base) });
    },
  });
};

export const useMarkAllNotificationsRead = (base: "student" | "teacher") => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => userNotificationApi.markAllRead(base),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MY_NOTIFICATIONS_KEY(base) });
      qc.invalidateQueries({ queryKey: UNREAD_COUNT_KEY(base) });
      toast.success("تم تحديد الكل كمقروء");
    },
  });
};

export const useSearchStudents = (query: string) =>
  useQuery({
    queryKey: ["search-students", query],
    queryFn: () => userNotificationApi.searchStudents(query),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });

/* ===============================================================
   ROOMS — 🟢 NORMAL (30s) CRUD / 🔴 FAST (15s) Timetable
=============================================================== */

export const useAdminRooms = (params?: {
  include_sessions?: boolean;
  active_only?: boolean;
}) =>
  useQuery<Room[]>({
    queryKey: [...ROOMS_KEY, params],
    queryFn: () => adminRoomsApi.getAll(params),
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useAdminRoom = (roomId?: string) =>
  useQuery<Room>({
    queryKey: roomId ? roomKey(roomId) : ["admin-room", "disabled"],
    queryFn: () => adminRoomsApi.getById(roomId!),
    enabled: !!roomId,
  });

export const useRoomsScheduleOverview = (date: string) =>
  useQuery({
    queryKey: ["admin", "rooms-schedule-overview", date],
    queryFn: () => adminRoomsApi.getScheduleOverview(date),
    refetchInterval: FAST, // 🔴 15s
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useCreateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoomPayload) => adminRoomsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROOMS_KEY });
      toast.success("تم إنشاء القاعة بنجاح");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء إنشاء القاعة",
      );
    },
  });
};

export const useUpdateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomId,
      payload,
    }: {
      roomId: string;
      payload: UpdateRoomPayload;
    }) => adminRoomsApi.update(roomId, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ROOMS_KEY });
      qc.invalidateQueries({ queryKey: roomKey(vars.roomId) });
      qc.invalidateQueries({ queryKey: ROOMS_OVERVIEW_KEY });
      toast.success("تم تحديث القاعة بنجاح");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء التحديث");
    },
  });
};

export const useDeleteRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => adminRoomsApi.delete(roomId),
    onSuccess: (data, roomId) => {
      qc.removeQueries({ queryKey: roomKey(roomId) });
      qc.invalidateQueries({ queryKey: ROOMS_KEY });
      qc.invalidateQueries({ queryKey: ROOMS_OVERVIEW_KEY });
      if (data.deactivated) {
        toast.info("القاعة مرتبطة بحصص - تم تعطيلها بدلاً من حذفها");
      } else {
        toast.success("تم حذف القاعة بنجاح");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء الحذف");
    },
  });
};

/* ===============================================================
   EXPORTS
=============================================================== */

export {
  DASHBOARD_KEY,
  USERS_KEY,
  STUDENTS_KEY,
  TEACHERS_KEY,
  COURSES_KEY,
  DEPARTMENTS_KEY,
  GROUPS_KEY,
  ENROLLMENTS_KEY,
  DOCUMENTS_KEY,
  SESSIONS_KEY,
  ATTENDANCE_KEY,
  FEES_KEY,
  EXAMS_KEY,
  RESULTS_KEY,
  PERMISSIONS_KEY,
  ME_KEY,
  NOTIFICATIONS_KEY,
  NOTIFICATION_TARGETS_KEY,
};

export type { AdminStudent };
