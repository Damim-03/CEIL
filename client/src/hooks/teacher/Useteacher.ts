import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "../../lib/api/teacher/teacher.api";

/* ═══════════════════════════════════════════════════════
   QUERY KEYS
═══════════════════════════════════════════════════════ */

export const teacherKeys = {
  all: ["teacher"] as const,
  profile: () => [...teacherKeys.all, "profile"] as const,
  dashboard: () => [...teacherKeys.all, "dashboard"] as const,
  groups: () => [...teacherKeys.all, "groups"] as const,
  groupStudents: (groupId: string) =>
    [...teacherKeys.all, "groups", groupId, "students"] as const,
  sessions: (groupId?: string) =>
    [...teacherKeys.all, "sessions", groupId ?? "all"] as const,
  sessionAttendance: (sessionId: string) =>
    [...teacherKeys.all, "sessions", sessionId, "attendance"] as const,
  exams: () => [...teacherKeys.all, "exams"] as const,
  examResults: (examId: string) =>
    [...teacherKeys.all, "exams", examId, "results"] as const,
};

/* ═══════════════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════════════ */

export const useTeacherProfile = () =>
  useQuery({
    queryKey: teacherKeys.profile(),
    queryFn: teacherApi.getProfile,
  });

export const useUpdateTeacherProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, any>) =>
      teacherApi.updateProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.profile() });
      qc.invalidateQueries({ queryKey: teacherKeys.dashboard() });
    },
  });
};

export const useUploadTeacherAvatar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => teacherApi.uploadAvatar(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.profile() });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
};

/* ═══════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════ */

export const useTeacherDashboard = () =>
  useQuery({
    queryKey: teacherKeys.dashboard(),
    queryFn: teacherApi.getDashboard,
  });

/* ═══════════════════════════════════════════════════════
   GROUPS
═══════════════════════════════════════════════════════ */

export const useTeacherGroups = () =>
  useQuery({
    queryKey: teacherKeys.groups(),
    queryFn: teacherApi.getMyGroups,
  });

export const useGroupStudents = (groupId: string) =>
  useQuery({
    queryKey: teacherKeys.groupStudents(groupId),
    queryFn: () => teacherApi.getGroupStudents(groupId),
    enabled: !!groupId,
  });

/* ═══════════════════════════════════════════════════════
   SESSIONS
═══════════════════════════════════════════════════════ */

export const useTeacherSessions = (groupId?: string) =>
  useQuery({
    queryKey: teacherKeys.sessions(groupId),
    queryFn: () => teacherApi.getSessions(groupId),
  });

export const useCreateSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      group_id: string;
      session_date: string;
      topic?: string;
    }) => teacherApi.createSession(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...teacherKeys.all, "sessions"] });
      qc.invalidateQueries({ queryKey: teacherKeys.dashboard() });
    },
  });
};

export const useUpdateSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      ...payload
    }: {
      sessionId: string;
      session_date?: string;
      topic?: string;
    }) => teacherApi.updateSession(sessionId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...teacherKeys.all, "sessions"] });
    },
  });
};

export const useDeleteSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => teacherApi.deleteSession(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...teacherKeys.all, "sessions"] });
      qc.invalidateQueries({ queryKey: teacherKeys.dashboard() });
    },
  });
};

/* ═══════════════════════════════════════════════════════
   ATTENDANCE
═══════════════════════════════════════════════════════ */

export const useSessionAttendance = (sessionId: string) =>
  useQuery({
    queryKey: teacherKeys.sessionAttendance(sessionId),
    queryFn: () => teacherApi.getSessionAttendance(sessionId),
    enabled: !!sessionId,
  });

export const useMarkAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      student_id,
      status,
    }: {
      sessionId: string;
      student_id: string;
      status: "PRESENT" | "ABSENT";
    }) => teacherApi.markAttendance(sessionId, { student_id, status }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: teacherKeys.sessionAttendance(variables.sessionId),
      });
    },
  });
};

export const useMarkBulkAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      records,
    }: {
      sessionId: string;
      records: Array<{ student_id: string; status: "PRESENT" | "ABSENT" }>;
    }) => teacherApi.markBulkAttendance(sessionId, records),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: teacherKeys.sessionAttendance(variables.sessionId),
      });
      qc.invalidateQueries({ queryKey: [...teacherKeys.all, "sessions"] });
      qc.invalidateQueries({ queryKey: teacherKeys.dashboard() });
    },
  });
};

/* ═══════════════════════════════════════════════════════
   EXAMS
═══════════════════════════════════════════════════════ */

export const useTeacherExams = () =>
  useQuery({
    queryKey: teacherKeys.exams(),
    queryFn: teacherApi.getExams,
  });

export const useCreateExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      course_id: string;
      exam_name?: string;
      exam_date: string;
      max_marks: number;
    }) => teacherApi.createExam(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.exams() });
      qc.invalidateQueries({ queryKey: teacherKeys.dashboard() });
    },
  });
};

export const useUpdateExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      examId,
      ...payload
    }: {
      examId: string;
      exam_name?: string;
      exam_date?: string;
      max_marks?: number;
    }) => teacherApi.updateExam(examId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.exams() });
    },
  });
};

export const useDeleteExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (examId: string) => teacherApi.deleteExam(examId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.exams() });
      qc.invalidateQueries({ queryKey: teacherKeys.dashboard() });
    },
  });
};

/* ═══════════════════════════════════════════════════════
   RESULTS
═══════════════════════════════════════════════════════ */

export const useExamResults = (examId: string) =>
  useQuery({
    queryKey: teacherKeys.examResults(examId),
    queryFn: () => teacherApi.getExamResults(examId),
    enabled: !!examId,
  });

export const useAddResult = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      examId,
      ...payload
    }: {
      examId: string;
      student_id: string;
      marks_obtained: number;
      grade?: string;
    }) => teacherApi.addResult(examId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: teacherKeys.examResults(variables.examId),
      });
    },
  });
};

export const useAddBulkResults = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      examId,
      results,
    }: {
      examId: string;
      results: Array<{
        student_id: string;
        marks_obtained: number;
        grade?: string;
      }>;
    }) => teacherApi.addBulkResults(examId, results),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: teacherKeys.examResults(variables.examId),
      });
      qc.invalidateQueries({ queryKey: teacherKeys.exams() });
    },
  });
};
