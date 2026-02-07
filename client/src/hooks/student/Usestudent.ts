/* ===============================================================
   STUDENT HOOKS - CONSOLIDATED FILE
   
   All student-related React Query hooks in one place.
   Organized by domain for easy navigation.
   
   Replaces 11 separate files with 1 unified file.
   
   Last updated: $(date)
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
const STUDENT_ENROLLMENTS_KEY = ["student-enrollments"];
const ENROLLMENT_DETAILS_KEY = ["enrollment-details"];
const ATTENDANCE_KEY = ["student-attendance"];
const FEES_KEY = ["student-fees"];
const RESULTS_KEY = ["student-results"];
const ME_KEY = ["me"];

/* ===============================================================
   PROFILE
=============================================================== */

/**
 * Get student profile with update and avatar upload mutations
 */
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
        description: error.response?.data?.message || "Failed to update profile.",
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
        description: error.response?.data?.message || "Failed to upload avatar.",
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

/**
 * Get student dashboard with profile completion and enrollment status
 */
export const useStudentDashboard = () => {
  return useQuery<DashboardResponse>({
    queryKey: DASHBOARD_KEY,
    queryFn: studentApi.getDashboard,
  });
};

/* ===============================================================
   DOCUMENTS
=============================================================== */

/**
 * Get student documents with upload, delete, and reupload mutations
 */
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
        description: error.response?.data?.message || "Failed to upload documents.",
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
        description: error.response?.data?.message || "Failed to delete document.",
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
        description: error.response?.data?.message || "Failed to re-upload document.",
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

/**
 * Get all available courses
 */
export const useCourses = () =>
  useQuery({
    queryKey: COURSES_KEY,
    queryFn: studentApi.getCourses,
  });

/**
 * Get groups for a specific course
 */
export const useCourseGroups = (courseId?: string) =>
  useQuery({
    queryKey: [COURSE_GROUPS_KEY, courseId],
    queryFn: () => studentApi.getCourseGroups(courseId!),
    enabled: !!courseId,
  });

/* ===============================================================
   ENROLLMENTS
=============================================================== */

/**
 * Get all student enrollments
 */
export const useStudentEnrollments = () =>
  useQuery({
    queryKey: STUDENT_ENROLLMENTS_KEY,
    queryFn: studentApi.getEnrollments,
    retry: false,
  });

/**
 * Get detailed information about a specific enrollment
 */
export const useEnrollmentDetails = (enrollmentId?: string) =>
  useQuery({
    queryKey: [ENROLLMENT_DETAILS_KEY, enrollmentId],
    queryFn: () => studentApi.getEnrollmentDetails(enrollmentId!),
    enabled: !!enrollmentId,
  });

/**
 * PRIMARY ENROLLMENT MUTATION
 * 
 * Enroll in a course with optional group assignment.
 * This performs enrollment and group joining in a single transaction.
 * 
 * Usage:
 * - With group: mutate({ course_id: "...", group_id: "..." })
 * - Without group: mutate({ course_id: "..." })
 * 
 * Backend validations:
 * - Checks if student profile is complete
 * - Verifies documents are approved
 * - Ensures group is not full (if group_id provided)
 * - Prevents duplicate enrollments
 * - Validates group belongs to the course
 */
export const useEnrollInCourse = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: { course_id: string; group_id?: string }) => {
      console.log("🔵 ENROLLMENT REQUEST:", payload);
      return studentApi.enroll(payload);
    },
    onSuccess: (data) => {
      console.log("✅ ENROLLMENT SUCCESS:", data);
      
      // Invalidate all related queries to refresh UI
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

      const msg = error.response?.data?.message || 
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

/**
 * Cancel an enrollment
 * 
 * Allows student to cancel their enrollment before it's finalized.
 * If fees were paid, student will need to contact administration for refund.
 */
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
      const msg = error.response?.data?.message || 
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

/**
 * Join a group (for students with approved enrollments)
 * 
 * Use this when:
 * - Student has VALIDATED or PAID enrollment without a group
 * - Student wants to join a specific group
 * 
 * @example
 * const { mutate: joinGroup } = useJoinGroup();
 * joinGroup("group-uuid");
 */
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
        description: `You are now in ${data.group_name ? `group "${data.group_name}"` : 'the group'}${data.level ? ` (Level ${data.level})` : ''}.`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      console.error("❌ JOIN GROUP FAILED:", error);
      
      const msg = error.response?.data?.message || 
                  error.response?.data?.error ||
                  "Failed to join the group. Please try again.";

      toast.error("Join Group Failed", {
        description: msg,
        duration: 7000,
      });
    },
  });
};

/**
 * Leave current group
 * 
 * Allows student to leave their current group.
 * Student can then join another group if desired.
 */
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
      const msg = error.response?.data?.message || 
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

/**
 * Get student attendance records with summary
 * 
 * Returns:
 * - records: List of attendance records
 * - summary: { total_sessions, present, absent, attendance_rate }
 */
export const useStudentAttendance = () =>
  useQuery({
    queryKey: ATTENDANCE_KEY,
    queryFn: studentApi.getAttendance,
  });

/* ===============================================================
   FEES
=============================================================== */

/**
 * Get student fees with payment summary
 * 
 * Returns:
 * - fees: List of fees
 * - summary: { total, paid, remaining, is_fully_paid }
 */
export const useStudentFees = () =>
  useQuery({
    queryKey: FEES_KEY,
    queryFn: studentApi.getFees,
  });

/* ===============================================================
   RESULTS
=============================================================== */

/**
 * Get exam results with average score
 * 
 * Returns:
 * - results: List of exam results
 * - summary: { total_exams, average_score }
 */
export const useStudentResults = () =>
  useQuery({
    queryKey: RESULTS_KEY,
    queryFn: studentApi.getResults,
  });

/* ===============================================================
   LEGACY HOOKS (Backward Compatibility)
=============================================================== */

/**
 * @deprecated Use useStudentProfile() instead
 */
export const useMyProfile = () =>
  useQuery({
    queryKey: PROFILE_KEY,
    queryFn: studentApi.getProfile,
  });

/**
 * @deprecated Use useStudentDocuments() instead
 */
export const useMyDocuments = () =>
  useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: studentApi.getDocuments,
  });

/**
 * @deprecated Use useEnrollInCourse() instead
 */
export function useEnroll() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => studentApi.enroll({ course_id: courseId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDENT_ENROLLMENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
}

/* ===============================================================
   EXPORTED QUERY KEYS
=============================================================== */

export {
  PROFILE_KEY,
  DOCUMENTS_KEY,
  DASHBOARD_KEY,
  COURSES_KEY,
  COURSE_GROUPS_KEY,
  STUDENT_ENROLLMENTS_KEY,
  ENROLLMENT_DETAILS_KEY,
  ATTENDANCE_KEY,
  FEES_KEY,
  RESULTS_KEY,
  ME_KEY,
};