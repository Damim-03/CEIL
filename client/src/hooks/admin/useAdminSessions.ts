import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminSessionsApi } from "../../lib/api/admin/adminSessions.api";
import type { Session } from "../../types/session";

/* =======================
   QUERIES
======================= */

// 🔹 Get all sessions
export const useAdminSessions = () =>
  useQuery<Session[]>({
    queryKey: ["admin-sessions"],
    queryFn: adminSessionsApi.getAll,
  });

// 🔹 Get session by ID
export const useAdminSession = (sessionId?: string) =>
  useQuery<Session>({
    queryKey: ["admin-session", sessionId],
    queryFn: () => adminSessionsApi.getById(sessionId!),
    enabled: !!sessionId,
  });

// 🔹 Get session attendance
export const useAdminSessionAttendance = (sessionId?: string) =>
  useQuery({
    queryKey: ["admin-session-attendance", sessionId],
    queryFn: () => adminSessionsApi.getAttendance(sessionId!),
    enabled: !!sessionId,
  });

/* =======================
   MUTATIONS
======================= */

// ➕ Create session
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminSessionsApi.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-sessions"],
      });
    },
  });
};

// ✏️ Update session
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
      };
    }) => adminSessionsApi.update(sessionId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-sessions"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-session", variables.sessionId],
      });
    },
  });
};

// 🗑 Delete session
export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      adminSessionsApi.delete(sessionId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-sessions"],
      });
    },
  });
};

// 🧑‍🏫 Mark attendance via session
export const useMarkSessionAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: {
        studentId: string;
        status: "Present" | "Absent";
      };
    }) => adminSessionsApi.markAttendance(sessionId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-session-attendance", variables.sessionId],
      });
    },
  });
};
