/* ===============================================================
   ADMIN HOOKS - CONSOLIDATED FILE
   
   All admin-related React Query hooks in one place.
   Organized by domain for easy navigation.
   
   ✅ Updated AdminDashboardStats type for new dashboard
   ✅ Cross-invalidation: Fees ↔ Enrollments ↔ Dashboard
   
   Last updated: February 2026
=============================================================== */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// API imports
import {
  adminAttendanceApi,
  adminCoursesApi,
  type CoursePayload,
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
} from "../../lib/api/admin/admin.api";

// Context
import { useAuth } from "../../context/AuthContext";
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
} from "../../types/Types";

/* ===============================================================
   QUERY KEYS (Centralized)
=============================================================== */

// Dashboard
const DASHBOARD_KEY = ["admin-dashboard"];

const QUERY_KEY = "admin-announcements";

const COURSE_PROFILE_KEY = "admin-course-profile";
const COURSE_PRICING_KEY = "admin-course-pricing";

// Users
const USERS_KEY = ["admin-users"];
const userKey = (id: string) => ["admin-user", id];

// Students
const STUDENTS_KEY = ["admin-students"];
const studentKey = (id: string) => ["admin-student", id];

// Teachers
const TEACHERS_KEY = ["admin-teachers"];
const teacherKey = (id: string) => ["admin-teacher", id];

// Courses
const COURSES_KEY = ["admin-courses"];
const courseKey = (id: string) => ["admin-course", id];

// Departments
const DEPARTMENTS_KEY = ["admin-departments"];
const departmentKey = (id: string) => ["admin-department", id];

// Groups
const GROUPS_KEY = ["admin-groups"];
const groupKey = (id: string) => ["admin-group", id];

// Enrollments
const ENROLLMENTS_KEY = ["admin-enrollments"];
const enrollmentKey = (id: string) => ["admin-enrollment", id];

// Documents
const DOCUMENTS_KEY = ["admin-documents"];
const documentKey = (id: string) => ["admin-document", id];

const NOTIFICATIONS_KEY = ["admin-notifications"];
const NOTIFICATION_TARGETS_KEY = ["notification-targets"];

// Sessions
const SESSIONS_KEY = ["admin-sessions"];
const sessionKey = (id: string) => ["admin-session", id];
const sessionAttendanceKey = (id: string) => ["admin-session-attendance", id];

// Attendance
const ATTENDANCE_KEY = ["admin-attendance"];

// Fees
const FEES_KEY = ["admin-fees"];
const feeKey = (id: string) => ["admin-fee", id];

// Exams
const EXAMS_KEY = ["admin-exams"];
const examKey = (id: string) => ["admin-exam", id];
const examResultsKey = (id: string) => ["admin-exam-results", id];

// Results
const RESULTS_KEY = ["admin-results"];

// Permissions
const PERMISSIONS_KEY = ["admin-permissions"];

// Profile
const ME_KEY = ["me"];

/* ===============================================================
   DASHBOARD - ✅ UPDATED TYPE
=============================================================== */

export interface AdminDashboardStats {
  students: number;
  teachers: number;
  courses: number;
  groups: number;
  unpaidFees: number;
  gender: {
    Male?: number;
    Female?: number;
    Other?: number;
  };
  // ✅ New fields
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

/* ===============================================================
   USERS
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

export const useChangeUserRole = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      adminUsersApi.changeRole(userId, role),

    onMutate: async ({ userId, role }) => {
      await qc.cancelQueries({ queryKey: USERS_KEY });
      const previousUsers = qc.getQueryData<AdminUser[]>(USERS_KEY);
      qc.setQueryData<AdminUser[]>(USERS_KEY, (old) =>
        old ? old.map((u) => (u.user_id === userId ? { ...u, role } : u)) : old,
      );
      return { previousUsers };
    },

    onError: (_error, _vars, context) => {
      if (context?.previousUsers) {
        qc.setQueryData(USERS_KEY, context.previousUsers);
      }
    },

    onSuccess: (data) => {
      if (!data?.user) return;
      qc.setQueryData<AdminUser[]>(USERS_KEY, (old) =>
        old
          ? old.map((u) =>
              u.user_id === data.user.user_id ? { ...u, ...data.user } : u,
            )
          : old,
      );
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
};

/* ===============================================================
   STUDENTS
=============================================================== */

export const useAdminStudents = () =>
  useQuery<AdminStudent[]>({
    queryKey: STUDENTS_KEY,
    queryFn: async () => {
      const res = await adminStudentsApi.getAll();
      return res.data ?? res.students ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

export const useAdminStudent = (studentId?: string) =>
  useQuery<AdminStudent>({
    queryKey: studentKey(studentId!),
    queryFn: async () => {
      const data = await adminStudentsApi.getById(studentId!);
      return data.data ?? data.student ?? data;
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateStudent = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStudentPayload) =>
      adminStudentsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY }); // ✅
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
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY }); // ✅
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
   TEACHERS
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
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY }); // ✅
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
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY }); // ✅
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
   COURSES
=============================================================== */

export const useAdminCourses = () =>
  useQuery<Course[]>({
    queryKey: COURSES_KEY,
    queryFn: adminCoursesApi.getAll,
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
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY }); // ✅
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
      payload: CoursePayload;
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
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY }); // ✅
    },
  });
};

/* ===============================================================
   DEPARTMENTS
=============================================================== */

export const useAdminDepartments = () =>
  useQuery<Department[]>({
    queryKey: DEPARTMENTS_KEY,
    queryFn: adminDepartmentsApi.getAll,
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
   GROUPS
=============================================================== */

export const useAdminGroups = () =>
  useQuery<Group[]>({
    queryKey: GROUPS_KEY,
    queryFn: adminGroupsApi.getAll,
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
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY }); // ✅
      qc.setQueryData(groupKey(newGroup.group_id), newGroup);
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
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY }); // ✅
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
      qc.invalidateQueries({ queryKey: ENROLLMENTS_KEY }); // ✅
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
      qc.invalidateQueries({ queryKey: ENROLLMENTS_KEY }); // ✅
    },
  });
};

/* ===============================================================
   ENROLLMENTS - ✅ Cross-invalidation with Dashboard & Fees
=============================================================== */

export const useAdminEnrollments = () =>
  useQuery<Enrollment[]>({
    queryKey: ENROLLMENTS_KEY,
    queryFn: adminEnrollmentsApi.getAll,
    staleTime: 1000 * 30,
  });

export const useAdminEnrollment = (enrollmentId?: string) =>
  useQuery<Enrollment>({
    queryKey: enrollmentKey(enrollmentId!),
    queryFn: () => adminEnrollmentsApi.getById(enrollmentId!),
    enabled: Boolean(enrollmentId),
  });

// ✅ Updated: invalidates dashboard + fees too
const invalidateEnrollments = (
  qc: ReturnType<typeof useQueryClient>,
  id?: string,
) => {
  qc.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
  qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
  qc.invalidateQueries({ queryKey: FEES_KEY });
  if (id) {
    qc.invalidateQueries({ queryKey: enrollmentKey(id) });
  }
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
   DOCUMENTS
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
    staleTime: 30000,
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      qc.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
      qc.invalidateQueries({ queryKey: STUDENTS_KEY });
      toast.success("❌ Document rejected");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to reject document",
      );
    },
  });
};

/* ===============================================================
   SESSIONS
=============================================================== */

export const useAdminSessions = () =>
  useQuery<Session[]>({
    queryKey: SESSIONS_KEY,
    queryFn: adminSessionsApi.getAll,
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
      payload: { session_date?: string; topic?: string };
    }) => adminSessionsApi.update(sessionId, payload),
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(
        sessionKey(updatedSession.session_id),
        updatedSession,
      );
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
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
      queryClient.invalidateQueries({
        queryKey: sessionAttendanceKey(vars.sessionId),
      });
    },
  });
};

/* ===============================================================
   ATTENDANCE
=============================================================== */

export const useAdminAttendanceBySession = (sessionId?: string) =>
  useQuery<AttendanceBySession[]>({
    queryKey: [ATTENDANCE_KEY, "session", sessionId],
    queryFn: () => adminAttendanceApi.getBySession(sessionId!),
    enabled: !!sessionId,
  });

export const useAdminAttendanceByStudent = (studentId?: string) =>
  useQuery<AttendanceByStudent[]>({
    queryKey: [ATTENDANCE_KEY, "student", studentId],
    queryFn: () => adminAttendanceApi.getByStudent(studentId!),
    enabled: !!studentId,
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
   FEES - ✅ Cross-invalidation with Enrollments & Dashboard
=============================================================== */

export const useAdminFees = () =>
  useQuery<Fee[]>({
    queryKey: FEES_KEY,
    queryFn: adminFeesApi.getAll,
  });

export const useAdminFee = (feeId?: string) =>
  useQuery<Fee>({
    queryKey: feeKey(feeId!),
    queryFn: () => adminFeesApi.getById(feeId!),
    enabled: !!feeId,
  });

export const useCreateFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminFeesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEES_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY }); // ✅
    },
  });
};

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
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY }); // ✅
    },
  });
};

// ✅ CRITICAL: Mark fee paid → invalidate enrollments + dashboard
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
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEY }); // ✅ enrollment auto-advances
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY }); // ✅ dashboard stats update
    },
  });
};

export const useDeleteFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feeId: string) => adminFeesApi.delete(feeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEES_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY }); // ✅
    },
  });
};

/* ===============================================================
   EXAMS
=============================================================== */

export const useAdminExams = () =>
  useQuery<Exam[]>({
    queryKey: EXAMS_KEY,
    queryFn: adminExamsApi.getAll,
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
      payload: { student_id: string; marks_obtained: number; grade?: string };
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
      payload: { student_id: string; marks_obtained: number; grade?: string };
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
   PERMISSIONS
=============================================================== */

export const useAdminPermissions = () =>
  useQuery<Permission[]>({
    queryKey: PERMISSIONS_KEY,
    queryFn: adminPermissionsApi.getAll,
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
      if (data?.user) {
        setUser(data.user);
      }
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

// ─── ANNOUNCEMENTS ───

export const useAdminAnnouncements = (params?: AnnouncementListParams) =>
  useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => announcementApi.getAll(params),
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
   NOTIFICATIONS - Admin Side
=============================================================== */

/** Get targeting options (courses, groups, teachers) for the send form */
export const useNotificationTargets = () =>
  useQuery<NotificationTargets>({
    queryKey: NOTIFICATION_TARGETS_KEY,
    queryFn: adminNotificationApi.getTargets,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

/** Send a notification to selected targets */
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

/** Get all notifications (admin list with pagination) */
export const useAdminNotifications = (page = 1) =>
  useQuery({
    queryKey: [...NOTIFICATIONS_KEY, page],
    queryFn: () => adminNotificationApi.getAll(page),
  });

/** Get notification detail with recipient list */
export const useAdminNotificationDetail = (id?: string) =>
  useQuery<NotificationDetail>({
    queryKey: ["admin-notification", id],
    queryFn: () => adminNotificationApi.getById(id!),
    enabled: !!id,
  });

/** Delete a notification */
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
   NOTIFICATIONS - Student / Teacher Side (my notifications)
=============================================================== */

const MY_NOTIFICATIONS_KEY = (base: string) => [`${base}-notifications`];
const UNREAD_COUNT_KEY = (base: string) => [`${base}-unread-count`];

/** Get my notifications (student or teacher) */
export const useMyNotifications = (
  base: "student" | "teacher",
  page = 1,
  unreadOnly = false,
) =>
  useQuery({
    queryKey: [...MY_NOTIFICATIONS_KEY(base), page, unreadOnly],
    queryFn: () => userNotificationApi.getMine(base, page, unreadOnly),
  });

/** Get unread count — polls every 30s for live badge updates */
export const useUnreadNotificationCount = (base: "student" | "teacher") =>
  useQuery({
    queryKey: UNREAD_COUNT_KEY(base),
    queryFn: () => userNotificationApi.getUnreadCount(base),
    refetchInterval: 30_000, // Poll every 30 seconds
  });

/** Mark one notification as read */
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

/** Mark all notifications as read */
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

// أضف بعد useDeleteNotification

/** Search students for specific targeting */
export const useSearchStudents = (query: string) =>
  useQuery({
    queryKey: ["search-students", query],
    queryFn: () => userNotificationApi.searchStudents(query),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });

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
