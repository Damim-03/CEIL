import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { studentApi } from "../../lib/api/student/student.api";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const PROFILE_KEY = ["student-profile"];
export const DOCUMENTS_KEY = ["student-documents"];
export const DASHBOARD_KEY = ["student-dashboard"];
export const COURSES_KEY = ["courses"];
export const COURSE_GROUPS_KEY = ["course-groups"];
export const COURSE_PRICING_KEY = ["course-pricing"];
export const STUDENT_ENROLLMENTS_KEY = ["student-enrollments"];
export const ENROLLMENT_DETAILS_KEY = ["enrollment-details"];
export const ATTENDANCE_KEY = ["student-attendance"];
export const FEES_KEY = ["student-fees"];
export const RESULTS_KEY = ["student-results"];
export const STUDENT_NOTIFICATIONS_KEY = ["student-notifications"];
export const STUDENT_UNREAD_COUNT_KEY = ["student-unread-count"];
export const ME_KEY = ["me"];

const FAST = 15_000;
const ACTIVE = 20_000;
const NORMAL = 30_000;

// ─── Profile ──────────────────────────────────────────────────────────────────
export const useStudentProfile = () => {
  const qc = useQueryClient();

  const profileQuery = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: studentApi.getProfile,
    refetchInterval: NORMAL,
    placeholderData: (prev: any) => prev,
  });

  const updateProfile = useMutation({
    mutationFn: studentApi.updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      qc.invalidateQueries({ queryKey: ME_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      Alert.alert("✓", "Profile updated successfully");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message ?? "Failed to update profile");
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: studentApi.uploadAvatar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      qc.invalidateQueries({ queryKey: ME_KEY });
      Alert.alert("✓", "Avatar uploaded successfully");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message ?? "Failed to upload avatar");
    },
  });

  return { ...profileQuery, updateProfile, uploadAvatar };
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const useStudentDashboard = () =>
  useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: studentApi.getDashboard,
    refetchInterval: ACTIVE,
    placeholderData: (prev: any) => prev,
  });

// ─── Documents ────────────────────────────────────────────────────────────────
export type RegistrantCategory = "STUDENT" | "EXTERNAL" | "EMPLOYEE";

export const useStudentDocuments = () => {
  const qc = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: studentApi.getDocuments,
    refetchInterval: NORMAL,
    placeholderData: (prev: any) => prev,
    select: (data: any) => {
      if (Array.isArray(data)) {
        return { documents: data, registrant_category: "STUDENT" as RegistrantCategory, required_documents: [], is_complete: false, missing: [] };
      }
      return {
        documents: data.documents || [],
        registrant_category: (data.registrant_category || "STUDENT") as RegistrantCategory,
        required_documents: data.required_documents || [],
        is_complete: data.is_complete || false,
        missing: data.missing || [],
      };
    },
  });

  const uploadDocuments = useMutation({
    mutationFn: studentApi.uploadDocuments,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      Alert.alert("✓", `${data.documents?.length || 0} document(s) uploaded`);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message ?? "Failed to upload documents");
    },
  });

  const uploadWithCategory = useMutation({
    mutationFn: async ({ formData, newCategory, currentCategory }: { formData: FormData; newCategory: RegistrantCategory; currentCategory: RegistrantCategory }) => {
      if (newCategory !== currentCategory) {
        await studentApi.updateProfile({ registrant_category: newCategory });
      }
      return studentApi.uploadDocuments(formData);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      Alert.alert("✓", "Document uploaded successfully");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message ?? "Failed to upload");
    },
  });

  const deleteDocument = useMutation({
    mutationFn: studentApi.deleteDocument,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      Alert.alert("✓", "Document deleted");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message ?? "Failed to delete");
    },
  });

  const reuploadDocument = useMutation({
    mutationFn: studentApi.reuploadDocument,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      Alert.alert("✓", "Document re-uploaded — pending review");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message ?? "Failed to re-upload");
    },
  });

  return {
    ...documentsQuery,
    documents: documentsQuery.data?.documents || [],
    registrantCategory: documentsQuery.data?.registrant_category || "STUDENT",
    requiredDocuments: documentsQuery.data?.required_documents || [],
    isDocumentsComplete: documentsQuery.data?.is_complete || false,
    missingDocuments: documentsQuery.data?.missing || [],
    uploadDocuments,
    uploadWithCategory,
    deleteDocument,
    reuploadDocument,
  };
};

// ─── Courses ──────────────────────────────────────────────────────────────────
export const useCourses = () =>
  useQuery({ queryKey: COURSES_KEY, queryFn: studentApi.getCourses, refetchInterval: NORMAL, placeholderData: (prev: any) => prev });

export const useCourseGroups = (courseId?: string) =>
  useQuery({ queryKey: [COURSE_GROUPS_KEY, courseId], queryFn: () => studentApi.getCourseGroups(courseId!), enabled: !!courseId, placeholderData: (prev: any) => prev });

export const useCoursePricing = (courseId: string | null) =>
  useQuery({ queryKey: [COURSE_PRICING_KEY, courseId], queryFn: () => studentApi.getCoursePricing(courseId!), enabled: !!courseId, staleTime: 2 * 60 * 1000, retry: 1 });

// ─── Enrollments ──────────────────────────────────────────────────────────────
export const useStudentEnrollments = () =>
  useQuery({ queryKey: STUDENT_ENROLLMENTS_KEY, queryFn: studentApi.getEnrollments, retry: false, refetchInterval: ACTIVE, placeholderData: (prev: any) => prev });

export const useEnrollmentDetails = (enrollmentId?: string) =>
  useQuery({ queryKey: [ENROLLMENT_DETAILS_KEY, enrollmentId], queryFn: () => studentApi.getEnrollmentDetails(enrollmentId!), enabled: !!enrollmentId, placeholderData: (prev: any) => prev });

export const useEnrollInCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { course_id: string; group_id?: string; level?: string; pricing_id?: string }) => studentApi.enroll(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: STUDENT_ENROLLMENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      Alert.alert("✓", data.group_id ? "Enrolled successfully!" : "Enrollment pending review");
    },
    onError: (error: any) => {
      Alert.alert("Enrollment Failed", error.response?.data?.message ?? "Please try again");
    },
  });
};

export const useCancelEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) => studentApi.cancelEnrollment(enrollmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDENT_ENROLLMENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      Alert.alert("✓", "Enrollment cancelled");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message ?? "Failed to cancel");
    },
  });
};

// ─── Groups ───────────────────────────────────────────────────────────────────
export const useJoinGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => studentApi.joinGroup(groupId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: COURSE_GROUPS_KEY });
      qc.invalidateQueries({ queryKey: STUDENT_ENROLLMENTS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      Alert.alert("✓", `Joined ${data.group_name ?? "group"} successfully`);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message ?? "Failed to join group");
    },
  });
};

export const useLeaveGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => studentApi.leaveGroup(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COURSE_GROUPS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      Alert.alert("✓", "Left group successfully");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message ?? "Failed to leave group");
    },
  });
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const useStudentAttendance = () =>
  useQuery({ queryKey: ATTENDANCE_KEY, queryFn: studentApi.getAttendance, refetchInterval: FAST, placeholderData: (prev: any) => prev });

// ─── Fees ─────────────────────────────────────────────────────────────────────
export const useStudentFees = () =>
  useQuery({ queryKey: FEES_KEY, queryFn: studentApi.getFees, refetchInterval: ACTIVE, placeholderData: (prev: any) => prev });

// ─── Results ──────────────────────────────────────────────────────────────────
export const useStudentResults = () =>
  useQuery({ queryKey: RESULTS_KEY, queryFn: studentApi.getResults, refetchInterval: NORMAL, placeholderData: (prev: any) => prev });

// ─── Notifications ────────────────────────────────────────────────────────────
export const useStudentNotifications = (page = 1, unreadOnly = false) =>
  useQuery({
    queryKey: [...STUDENT_NOTIFICATIONS_KEY, page, unreadOnly],
    queryFn: () => studentApi.getNotifications(page, unreadOnly),
    refetchInterval: ACTIVE,
    placeholderData: (prev: any) => prev,
  });

export const useStudentUnreadCount = () =>
  useQuery({ queryKey: STUDENT_UNREAD_COUNT_KEY, queryFn: studentApi.getUnreadCount, refetchInterval: FAST });

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
    },
  });
};
