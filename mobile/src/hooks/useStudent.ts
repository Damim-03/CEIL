import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSchedule, studentApi } from "../api/student.api";

// ── Profile ──────────────────────────────────────────────────────
export const useProfile = () =>
  useQuery({
    queryKey: ["student-profile"],
    queryFn: studentApi.getProfile,
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentApi.updateProfile,
    onSuccess: (updated) => {
      // تحديث الـ cache مباشرة بدون refetch
      queryClient.setQueryData(["student-profile"], updated);
    },
  });
};

// ── Dashboard ────────────────────────────────────────────────────
export const useDashboard = () =>
  useQuery({
    queryKey: ["student-dashboard"],
    queryFn: studentApi.getDashboard,
  });

// ── Enrollments ──────────────────────────────────────────────────
export const useEnrollments = () =>
  useQuery({
    queryKey: ["student-enrollments"],
    queryFn: async () => {
      const res = await studentApi.getEnrollments();
      return Array.isArray(res) ? res : ((res as any)?.data ?? []);
    },
  });

export const useEnroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentApi.enroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-enrollments"] });
    },
  });
};

export const useCancelEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentApi.cancelEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-enrollments"] });
    },
  });
};

// ── Courses ──────────────────────────────────────────────────────
export const useCourses = () =>
  useQuery({
    queryKey: ["student-courses"],
    queryFn: studentApi.getCourses,
    staleTime: 1000 * 60 * 10,
  });

export const useCourseGroups = (courseId: string) =>
  useQuery({
    queryKey: ["student-course-groups", courseId],
    queryFn: () => studentApi.getCourseGroups(courseId),
    enabled: !!courseId,
  });

export const useCoursePricing = (courseId: string) =>
  useQuery({
    queryKey: ["student-course-pricing", courseId],
    queryFn: () => studentApi.getCoursePricing(courseId),
    enabled: !!courseId,
  });

// ── Attendance ───────────────────────────────────────────────────
export const useAttendance = () =>
  useQuery({
    queryKey: ["student-attendance"],
    queryFn: studentApi.getAttendance,
  });

// ── Fees ─────────────────────────────────────────────────────────
export const useFees = () =>
  useQuery({
    queryKey: ["student-fees"],
    queryFn: studentApi.getFees,
  });

// ── Results ──────────────────────────────────────────────────────
export const useResults = () =>
  useQuery({
    queryKey: ["student-results"],
    queryFn: studentApi.getResults,
  });

// ── Documents ────────────────────────────────────────────────────
export const useDocuments = () =>
  useQuery({
    queryKey: ["student-documents"],
    queryFn: studentApi.getDocuments,
  });

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentApi.uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-documents"] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-documents"] });
    },
  });
};

export const useReuploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentApi.reuploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-documents"] });
    },
  });
};

// ── Schedule ─────────────────────────────────────────────────────
export function useSchedule() {
  return useQuery({
    queryKey: ["public-schedule"],
    queryFn: fetchSchedule,
    staleTime: 1000 * 60 * 5, // 5 دقائق
  });
}

// ── Notifications ────────────────────────────────────────────────
export const useNotifications = (page = 1, unread = false) =>
  useQuery({
    queryKey: ["student-notifications", page, unread],
    queryFn: () => studentApi.getNotifications({ page, limit: 15, unread }),
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: ["student-unread-count"],
    queryFn: studentApi.getUnreadCount,
    refetchInterval: 30000,
  });

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["student-unread-count"] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["student-unread-count"] });
    },
  });
};
