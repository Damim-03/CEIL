import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminAttendanceApi } from "../../lib/api/admin/adminAttendance.api";
import type {
  AttendanceBySession,
  AttendanceByStudent,
  AttendanceStatus,
} from "../../types/attendance";

/* =======================
   QUERIES
======================= */

// 🔹 Attendance by Session
export const useAdminAttendanceBySession = (sessionId?: string) =>
  useQuery<AttendanceBySession[]>({
    queryKey: ["admin-attendance", "session", sessionId],
    queryFn: () => adminAttendanceApi.getBySession(sessionId!),
    enabled: !!sessionId,
  });

// 🔹 Attendance by Student
export const useAdminAttendanceByStudent = (studentId?: string) =>
  useQuery<AttendanceByStudent[]>({
    queryKey: ["admin-attendance", "student", studentId],
    queryFn: () => adminAttendanceApi.getByStudent(studentId!),
    enabled: !!studentId,
  });

/* =======================
   MUTATIONS
======================= */

// 🔹 Mark / Create Attendance
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
        queryKey: ["admin-attendance", "session", variables.session_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-attendance", "student", variables.student_id],
      });
    },
  });
};

// 🔹 Update Attendance Status
export const useAdminUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      attendanceId: string;
      status: AttendanceStatus;
    }) =>
      adminAttendanceApi.updateStatus(
        payload.attendanceId,
        payload.status,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-attendance"],
      });
    },
  });
};

// 🔹 Delete Attendance
export const useAdminDeleteAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attendanceId: string) =>
      adminAttendanceApi.delete(attendanceId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-attendance"],
      });
    },
  });
};
