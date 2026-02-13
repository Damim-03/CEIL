/* ===============================================================
   STUDENT HOOKS - CONSOLIDATED FILE
   
   All student-related React Query hooks in one place.
   Organized by domain for easy navigation.
   
   ✅ UPDATED: useEnrollInCourse now supports pricing_id
   
   Last updated: February 2026
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

/* ===============================================================
   PROFILE
=============================================================== */

export const useStudentProfile = () => {
  const qc = useQueryClient();

  const profileQuery = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: studentApi.getProfile,
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
   DASHBOARD
=============================================================== */

export const useStudentDashboard = () => {
  return useQuery<DashboardResponse>({
    queryKey: DASHBOARD_KEY,
    queryFn: studentApi.getDashboard,
  });
};

/* ===============================================================
   DOCUMENTS
=============================================================== */

export const useStudentDocuments = () => {
  const qc = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: studentApi.getDocuments,
  });

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
    uploadDocuments,
    deleteDocument,
    reuploadDocument,
  };
};

/* ===============================================================
   COURSES
=============================================================== */

export const useCourses = () =>
  useQuery({
    queryKey: COURSES_KEY,
    queryFn: studentApi.getCourses,
  });

export const useCourseGroups = (courseId?: string) =>
  useQuery({
    queryKey: [COURSE_GROUPS_KEY, courseId],
    queryFn: () => studentApi.getCourseGroups(courseId!),
    enabled: !!courseId,
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
    staleTime: 5 * 60 * 1000,
    retry: 1,
    throwOnError: false,
  });
};

/* ===============================================================
   ENROLLMENTS
=============================================================== */

export const useStudentEnrollments = () =>
  useQuery({
    queryKey: STUDENT_ENROLLMENTS_KEY,
    queryFn: studentApi.getEnrollments,
    retry: false,
  });

export const useEnrollmentDetails = (enrollmentId?: string) =>
  useQuery({
    queryKey: [ENROLLMENT_DETAILS_KEY, enrollmentId],
    queryFn: () => studentApi.getEnrollmentDetails(enrollmentId!),
    enabled: !!enrollmentId,
  });

/**
 * ✅ UPDATED: PRIMARY ENROLLMENT MUTATION
 *
 * Now accepts pricing_id from PricingModal.
 * The student selects their category (طالب/موظف/خارجي)
 * and this choice is saved with the enrollment.
 *
 * Usage:
 * - With pricing: mutate({ course_id: "...", group_id: "...", pricing_id: "..." })
 * - Without pricing: mutate({ course_id: "...", group_id: "..." })
 */
export const useEnrollInCourse = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      course_id: string;
      group_id?: string;
      level?: string;
      pricing_id?: string; // ✅ NEW
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
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to enroll. Please try again.";

      toast.error("Enrollment Failed", {
        description: msg,
        duration: 7000,
      });
    },
  });
};

export const useCancelEnrollment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) => {
      return studentApi.cancelEnrollment(enrollmentId);
    },
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
      const msg =
        error.response?.data?.message ||
        "Failed to cancel enrollment. Please try again.";

      toast.error("Cancellation Failed", {
        description: msg,
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

      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to join the group. Please try again.";

      toast.error("Join Group Failed", {
        description: msg,
        duration: 7000,
      });
    },
  });
};

export const useLeaveGroup = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => {
      return studentApi.leaveGroup();
    },
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
      const msg =
        error.response?.data?.message ||
        "Failed to leave the group. Please try again.";

      toast.error("Leave Group Failed", {
        description: msg,
        duration: 7000,
      });
    },
  });
};

/* ===============================================================
   ATTENDANCE
=============================================================== */

export const useStudentAttendance = () =>
  useQuery({
    queryKey: ATTENDANCE_KEY,
    queryFn: studentApi.getAttendance,
  });

/* ===============================================================
   FEES
=============================================================== */

export const useStudentFees = () =>
  useQuery({
    queryKey: FEES_KEY,
    queryFn: studentApi.getFees,
  });

/* ===============================================================
   RESULTS
=============================================================== */

export const useStudentResults = () =>
  useQuery({
    queryKey: RESULTS_KEY,
    queryFn: studentApi.getResults,
  });

/* ===============================================================
   LEGACY HOOKS (Backward Compatibility)
=============================================================== */

export const useMyProfile = () =>
  useQuery({
    queryKey: PROFILE_KEY,
    queryFn: studentApi.getProfile,
  });

export const useMyDocuments = () =>
  useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: studentApi.getDocuments,
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
   NOTIFICATIONS
=============================================================== */

export const useStudentNotifications = (page = 1, unreadOnly = false) =>
  useQuery({
    queryKey: [...STUDENT_NOTIFICATIONS_KEY, page, unreadOnly],
    queryFn: () => studentApi.getNotifications(page, unreadOnly),
  });

export const useStudentUnreadCount = () =>
  useQuery({
    queryKey: STUDENT_UNREAD_COUNT_KEY,
    queryFn: studentApi.getUnreadCount,
    refetchInterval: 30_000, // polling كل 30 ثانية
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
