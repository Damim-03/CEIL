import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentApi } from "../api/student.api";

// ── Profile ──────────────────────────────────────────────────────
export const useProfile = () =>
  useQuery({
    queryKey: ["student-profile"],
    queryFn: studentApi.getProfile,
  });

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
    queryFn: studentApi.getEnrollments,
  });

// ── Attendance ───────────────────────────────────────────────────
export const useAttendance = () =>
  useQuery({
    queryKey: ["student-attendance"],
    queryFn: studentApi.getAttendance,
  });

// ── Notifications ────────────────────────────────────────────────
export const useNotifications = () =>
  useQuery({
    queryKey: ["student-notifications"],
    queryFn: () => studentApi.getNotifications(),
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

// ── Schedule ─────────────────────────────────────────────────────
export const useSchedule = () =>
  useQuery({
    queryKey: ["student-schedule"],
    queryFn: studentApi.getActiveTimetable,
  });

// ── Fees ─────────────────────────────────────────────────────────
export const useFees = () =>
  useQuery({
    queryKey: ["student-fees"],
    queryFn: studentApi.getFees,
  });