/* ===============================================================
   STUDENT HOOKS - CONSOLIDATED FILE
   
   ✅ UPDATED: useStudentDocuments now returns category-aware data
   ✅ UPDATED: updateCategory — updates registrant_category in DB
               then uploads document in correct sequence
   Last updated: March 2026
=============================================================== */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentApi } from "../../lib/api/student/student.api";
import { toast } from "sonner";
import type { DashboardResponse } from "../../types/Types";

/* ===============================================================
   QUERY KEYS (Centralized)
=============================================================== */

const PROFILE_KEY = ["student-profile"];
const DOCUMENTS_KEY = ["student-documents"];
const DASHBOARD_KEY = ["student-dashboard"];
const COURSES_KEY = ["courses"];
const COURSE_GROUPS_KEY = ["course-groups"];
const COURSE_PRICING_KEY = ["course-pricing"];
const STUDENT_ENROLLMENTS_KEY = ["student-enrollments"];
const ENROLLMENT_DETAILS_KEY = ["enrollment-details"];
const ATTENDANCE_KEY = ["student-attendance"];
const FEES_KEY = ["student-fees"];
const RESULTS_KEY = ["student-results"];
const STUDENT_NOTIFICATIONS_KEY = ["student-notifications"];
const STUDENT_UNREAD_COUNT_KEY = ["student-unread-count"];
const ME_KEY = ["me"];

/* ===============================================================
   🔄 REFRESH CONSTANTS
=============================================================== */

const FAST = 15_000;
const ACTIVE = 20_000;
const NORMAL = 30_000;

/* ===============================================================
   TYPE DEFINITIONS
=============================================================== */

interface CoursePricing {
  pricing_id: string;
  status_fr: string;
  status_ar?: string;
  status_en?: string;
  price: number;
  currency: string;
  discount?: string;
  sort_order: number;
}

interface CourseProfile {
  profile_id: string;
  course_id: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  language?: string;
  level?: string;
  flag_emoji?: string;
  price?: number;
  currency?: string;
  session_name?: string;
  start_date?: string;
  end_date?: string;
  image_url?: string;
  registration_open: boolean;
  is_published: boolean;
  pricing: CoursePricing[];
  course: {
    course_id: string;
    course_name: string;
    course_code?: string;
  };
}

export type RegistrantCategory = "STUDENT" | "EXTERNAL" | "EMPLOYEE";

/* ===============================================================
   PROFILE — 🟢 30s
=============================================================== */

export const useStudentProfile = () => {
  const qc = useQueryClient();

  const profileQuery = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: studentApi.getProfile,
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

  const updateProfile = useMutation({
    mutationFn: studentApi.updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      qc.invalidateQueries({ queryKey: ME_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error("Update failed", {
        description:
          error.response?.data?.message || "Failed to update profile.",
      });
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: studentApi.uploadAvatar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      qc.invalidateQueries({ queryKey: ME_KEY });
      toast.success("Avatar uploaded successfully");
    },
    onError: (error: any) => {
      toast.error("Upload failed", {
        description:
          error.response?.data?.message || "Failed to upload avatar.",
      });
    },
  });

  return {
    ...profileQuery,
    updateProfile,
    uploadAvatar,
  };
};

/* ===============================================================
   DASHBOARD — 🟡 20s
=============================================================== */

export const useStudentDashboard = () => {
  return useQuery<DashboardResponse>({
    queryKey: DASHBOARD_KEY,
    queryFn: studentApi.getDashboard,
    refetchInterval: ACTIVE,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });
};

/* ===============================================================
   DOCUMENTS — 🟢 30s
   ✅ updateCategory + uploadDocuments run in correct sequence:
      1. If category changed → update it first (await)
      2. Then upload the document
      This prevents category changing without a file being saved.
=============================================================== */

export const useStudentDocuments = () => {
  const qc = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: studentApi.getDocuments,
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
    select: (data: any) => {
      if (Array.isArray(data)) {
        return {
          documents: data,
          registrant_category: "STUDENT" as RegistrantCategory,
          required_documents: [],
          is_complete: false,
          missing: [],
        };
      }
      return {
        documents: data.documents || [],
        registrant_category: (data.registrant_category ||
          "STUDENT") as RegistrantCategory,
        required_documents: data.required_documents || [],
        is_complete: data.is_complete || false,
        missing: data.missing || [],
      };
    },
  });

  // ── Standard upload (no category change) ──────────────────
  const uploadDocuments = useMutation({
    mutationFn: studentApi.uploadDocuments,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      toast.success("Documents uploaded successfully", {
        description: `${data.documents?.length || 0} document(s) uploaded.`,
      });
    },
    onError: (error: any) => {
      toast.error("Upload failed", {
        description:
          error.response?.data?.message || "Failed to upload documents.",
      });
    },
  });

  // ── Upload with optional category update ──────────────────
  // ✅ Sequence: update category first (if changed), THEN upload file
  // If category update fails → upload is aborted
  const uploadWithCategory = useMutation({
    mutationFn: async ({
      formData,
      newCategory,
      currentCategory,
    }: {
      formData: FormData;
      newCategory: RegistrantCategory;
      currentCategory: RegistrantCategory;
    }) => {
      // Step 1: update category only if it changed
      if (newCategory !== currentCategory) {
        await studentApi.updateProfile({ registrant_category: newCategory });
      }
      // Step 2: upload document
      return studentApi.uploadDocuments(formData);
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      qc.invalidateQueries({ queryKey: PROFILE_KEY });

      const categoryChanged =
        variables.newCategory !== variables.currentCategory;
      toast.success("Upload successful", {
        description: categoryChanged
          ? `Category updated to ${variables.newCategory} and document uploaded.`
          : `${data.documents?.length || 0} document(s) uploaded.`,
      });
    },
    onError: (error: any) => {
      toast.error("Upload failed", {
        description:
          error.response?.data?.message || "Failed to complete upload.",
      });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: studentApi.deleteDocument,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      toast.success("Document deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Delete failed", {
        description:
          error.response?.data?.message || "Failed to delete document.",
      });
    },
  });

  const reuploadDocument = useMutation({
    mutationFn: studentApi.reuploadDocument,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      toast.success("Document re-uploaded successfully", {
        description: "Your document is now pending review.",
      });
    },
    onError: (error: any) => {
      toast.error("Re-upload failed", {
        description:
          error.response?.data?.message || "Failed to re-upload document.",
      });
    },
  });

  return {
    ...documentsQuery,
    documents: documentsQuery.data?.documents || [],
    registrantCategory: documentsQuery.data?.registrant_category || "STUDENT",
    requiredDocuments: documentsQuery.data?.required_documents || [],
    isDocumentsComplete: documentsQuery.data?.is_complete || false,
    missingDocuments: documentsQuery.data?.missing || [],
    // Standard upload (when category doesn't change)
    uploadDocuments,
    // ✅ Upload with category change in correct sequence
    uploadWithCategory,
    deleteDocument,
    reuploadDocument,
  };
};

/* ===============================================================
   COURSES — 🟢 30s
=============================================================== */

export const useCourses = () =>
  useQuery({
    queryKey: COURSES_KEY,
    queryFn: studentApi.getCourses,
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useCourseGroups = (courseId?: string) =>
  useQuery({
    queryKey: [COURSE_GROUPS_KEY, courseId],
    queryFn: () => studentApi.getCourseGroups(courseId!),
    enabled: !!courseId,
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useCoursePricing = (courseId: string | null) => {
  return useQuery<CourseProfile>({
    queryKey: [COURSE_PRICING_KEY, courseId],
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");
      const data = await studentApi.getCoursePricing(courseId);
      if (!data) throw new Error("No pricing data returned from server");
      return data;
    },
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
    throwOnError: false,
  });
};

/* ===============================================================
   ENROLLMENTS — 🟡 20s
=============================================================== */

export const useStudentEnrollments = () =>
  useQuery({
    queryKey: STUDENT_ENROLLMENTS_KEY,
    queryFn: studentApi.getEnrollments,
    retry: false,
    refetchInterval: ACTIVE,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useEnrollmentDetails = (enrollmentId?: string) =>
  useQuery({
    queryKey: [ENROLLMENT_DETAILS_KEY, enrollmentId],
    queryFn: () => studentApi.getEnrollmentDetails(enrollmentId!),
    enabled: !!enrollmentId,
    refetchInterval: ACTIVE,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useEnrollInCourse = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      course_id: string;
      group_id?: string;
      level?: string;
      pricing_id?: string;
    }) => {
      console.log("🔵 ENROLLMENT REQUEST:", payload);
      return studentApi.enroll(payload);
    },
    onSuccess: (data) => {
      console.log("✅ ENROLLMENT SUCCESS:", data);
      qc.invalidateQueries({ queryKey: STUDENT_ENROLLMENTS_KEY });
      qc.invalidateQueries({ queryKey: COURSE_GROUPS_KEY });
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      toast.success("Enrollment successful!", {
        description: data.group_id
          ? "You have been enrolled in the course and joined the group."
          : "Your enrollment is pending review. You will be notified once approved.",
        duration: 5000,
      });
    },
    onError: (error: any) => {
      console.error("❌ ENROLLMENT FAILED:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to enroll. Please try again.";
      toast.error("Enrollment Failed", { description: msg, duration: 7000 });
    },
  });
};

export const useCancelEnrollment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) =>
      studentApi.cancelEnrollment(enrollmentId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: STUDENT_ENROLLMENTS_KEY });
      qc.invalidateQueries({ queryKey: COURSE_GROUPS_KEY });
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      toast.success("Enrollment cancelled", {
        description: data.had_paid_fees
          ? "Please contact administration for fee refund."
          : "Your enrollment has been cancelled successfully.",
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast.error("Cancellation Failed", {
        description:
          error.response?.data?.message ||
          "Failed to cancel enrollment. Please try again.",
        duration: 7000,
      });
    },
  });
};

/* ===============================================================
   GROUP MANAGEMENT
=============================================================== */

export const useJoinGroup = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => {
      console.log("🔵 JOIN GROUP REQUEST:", groupId);
      return studentApi.joinGroup(groupId);
    },
    onSuccess: (data) => {
      console.log("✅ JOIN GROUP SUCCESS:", data);
      qc.invalidateQueries({ queryKey: COURSE_GROUPS_KEY });
      qc.invalidateQueries({ queryKey: STUDENT_ENROLLMENTS_KEY });
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      toast.success("Joined group successfully!", {
        description: `You are now in ${data.group_name ? `group "${data.group_name}"` : "the group"}${data.level ? ` (Level ${data.level})` : ""}.`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      console.error("❌ JOIN GROUP FAILED:", error);
      toast.error("Join Group Failed", {
        description:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to join the group. Please try again.",
        duration: 7000,
      });
    },
  });
};

export const useLeaveGroup = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => studentApi.leaveGroup(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COURSE_GROUPS_KEY });
      qc.invalidateQueries({ queryKey: STUDENT_ENROLLMENTS_KEY });
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      toast.success("Left group successfully", {
        description: "You can now join another group.",
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast.error("Leave Group Failed", {
        description:
          error.response?.data?.message ||
          "Failed to leave the group. Please try again.",
        duration: 7000,
      });
    },
  });
};

/* ===============================================================
   ATTENDANCE — 🔴 15s
=============================================================== */

export const useStudentAttendance = () =>
  useQuery({
    queryKey: ATTENDANCE_KEY,
    queryFn: studentApi.getAttendance,
    refetchInterval: FAST,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

/* ===============================================================
   FEES — 🟡 20s
=============================================================== */

export const useStudentFees = () =>
  useQuery({
    queryKey: FEES_KEY,
    queryFn: studentApi.getFees,
    refetchInterval: ACTIVE,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

/* ===============================================================
   RESULTS — 🟢 30s
=============================================================== */

export const useStudentResults = () =>
  useQuery({
    queryKey: RESULTS_KEY,
    queryFn: studentApi.getResults,
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

/* ===============================================================
   LEGACY HOOKS
=============================================================== */

export const useMyProfile = () =>
  useQuery({
    queryKey: PROFILE_KEY,
    queryFn: studentApi.getProfile,
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useMyDocuments = () =>
  useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: studentApi.getDocuments,
    refetchInterval: NORMAL,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export function useEnroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) =>
      studentApi.enroll({ course_id: courseId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDENT_ENROLLMENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
}

/* ===============================================================
   NOTIFICATIONS — 🟡 20s
=============================================================== */

export const useStudentNotifications = (page = 1, unreadOnly = false) =>
  useQuery({
    queryKey: [...STUDENT_NOTIFICATIONS_KEY, page, unreadOnly],
    queryFn: () => studentApi.getNotifications(page, unreadOnly),
    refetchInterval: ACTIVE,
    refetchOnWindowFocus: true,
    placeholderData: (prev: any) => prev,
  });

export const useStudentUnreadCount = () =>
  useQuery({
    queryKey: STUDENT_UNREAD_COUNT_KEY,
    queryFn: studentApi.getUnreadCount,
    refetchInterval: FAST,
  });

export const useMarkStudentNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: studentApi.markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDENT_NOTIFICATIONS_KEY });
      qc.invalidateQueries({ queryKey: STUDENT_UNREAD_COUNT_KEY });
    },
  });
};

export const useMarkAllStudentNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: studentApi.markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDENT_NOTIFICATIONS_KEY });
      qc.invalidateQueries({ queryKey: STUDENT_UNREAD_COUNT_KEY });
      toast.success("تم تحديد جميع الإشعارات كمقروءة");
    },
  });
};

/* ===============================================================
   EXPORTED QUERY KEYS
=============================================================== */

export {
  PROFILE_KEY,
  DOCUMENTS_KEY,
  DASHBOARD_KEY,
  COURSES_KEY,
  COURSE_GROUPS_KEY,
  COURSE_PRICING_KEY,
  STUDENT_ENROLLMENTS_KEY,
  ENROLLMENT_DETAILS_KEY,
  ATTENDANCE_KEY,
  FEES_KEY,
  RESULTS_KEY,
  ME_KEY,
  STUDENT_NOTIFICATIONS_KEY,
  STUDENT_UNREAD_COUNT_KEY,
};
