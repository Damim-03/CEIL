import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "../../lib/api/teacher/teacher.api";
import { useMe } from "../auth/auth.hooks";

/* ═══════════════════════════════════════════════════════
   QUERY KEYS
═══════════════════════════════════════════════════════ */

export const teacherKeys = {
  all: ["teacher"] as const,
  profile: () => [...teacherKeys.all, "profile"] as const,
  dashboard: () => [...teacherKeys.all, "dashboard"] as const,
  schedule: (days?: number) =>
    [...teacherKeys.all, "schedule", days ?? 30] as const,
  myTimetable: () => [...teacherKeys.all, "my-timetable"] as const,
  rooms: (date: string) => [...teacherKeys.all, "rooms", date] as const,
  groups: () => [...teacherKeys.all, "groups"] as const,
  groupDetails: (groupId: string) =>
    [...teacherKeys.all, "groups", groupId] as const,
  groupStudents: (groupId: string) =>
    [...teacherKeys.all, "groups", groupId, "students"] as const,
  groupStats: (groupId: string) =>
    [...teacherKeys.all, "groups", groupId, "stats"] as const,
  studentAttendance: (studentId: string, groupId?: string) =>
    [
      ...teacherKeys.all,
      "students",
      studentId,
      "attendance",
      groupId ?? "all",
    ] as const,
  studentResults: (studentId: string) =>
    [...teacherKeys.all, "students", studentId, "results"] as const,
  sessions: (groupId?: string) =>
    [...teacherKeys.all, "sessions", groupId ?? "all"] as const,
  sessionAttendance: (sessionId: string) =>
    [...teacherKeys.all, "sessions", sessionId, "attendance"] as const,
  exams: () => [...teacherKeys.all, "exams"] as const,
  examResults: (examId: string) =>
    [...teacherKeys.all, "exams", examId, "results"] as const,
  announcements: (params?: { page?: number; category?: string }) =>
    [...teacherKeys.all, "announcements", params ?? {}] as const,
  announcementById: (id: string) =>
    [...teacherKeys.all, "announcements", id] as const,
  notifications: () => [...teacherKeys.all, "notifications"] as const,
  unreadCount: () =>
    [...teacherKeys.all, "notifications", "unread-count"] as const,
};

/* ═══════════════════════════════════════════════════════
   TYPES — Timetable (TeacherScheduleEntry)
═══════════════════════════════════════════════════════ */

export interface TeacherTimetableEntry {
  entry_id: string;
  day_of_week: number; // 0=السبت … 5=الخميس
  start_time: string; // "08:00"
  end_time: string; // "09:30"
  language: string; // "FR" | "EN" | ...
  level: string;
  group_label: string;
  notes?: string | null;
  group?: {
    group_id: string;
    name: string;
    level: string;
    course: { course_id: string; course_name: string; course_code: string };
  } | null;
  room?: { room_id: string; name: string } | null;
}

export interface TeacherTimetableResponse {
  teacher_id: string;
  teacher_name: string;
  entries: TeacherTimetableEntry[];
}

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

export const useTeacherDashboard = () => {
  const { data: me } = useMe();
  return useQuery({
    queryKey: teacherKeys.dashboard(),
    queryFn: teacherApi.getDashboard,
    enabled: me?.role === "TEACHER",
  });
};

/* ═══════════════════════════════════════════════════════
   SCHEDULE — حصص يومية فعلية (Session-based)
═══════════════════════════════════════════════════════ */

export const useTeacherSchedule = (days?: number) =>
  useQuery({
    queryKey: teacherKeys.schedule(days),
    queryFn: () => teacherApi.getSchedule(days),
  });

/* ═══════════════════════════════════════════════════════
   TIMETABLE — الجدول الزمني الثابت (TeacherScheduleEntry)
═══════════════════════════════════════════════════════ */

export const useMyTimetable = () =>
  useQuery<TeacherTimetableResponse>({
    queryKey: teacherKeys.myTimetable(),
    queryFn: teacherApi.getMyTimetable,
    staleTime: 5 * 60 * 1000,
  });

/* ═══════════════════════════════════════════════════════
   ROOMS OVERVIEW
═══════════════════════════════════════════════════════ */

export const useTeacherRoomsOverview = (date: string) =>
  useQuery({
    queryKey: teacherKeys.rooms(date),
    queryFn: () => teacherApi.getRoomsOverview(date),
    staleTime: 30 * 1000,
    enabled: !!date,
  });

/* ═══════════════════════════════════════════════════════
   GROUPS
═══════════════════════════════════════════════════════ */

export const useTeacherGroups = () =>
  useQuery({
    queryKey: teacherKeys.groups(),
    queryFn: teacherApi.getMyGroups,
  });

export const useGroupDetails = (groupId: string) =>
  useQuery({
    queryKey: teacherKeys.groupDetails(groupId),
    queryFn: () => teacherApi.getGroupDetails(groupId),
    enabled: !!groupId,
  });

export const useGroupStudents = (groupId: string) =>
  useQuery({
    queryKey: teacherKeys.groupStudents(groupId),
    queryFn: () => teacherApi.getGroupStudents(groupId),
    enabled: !!groupId,
  });

export const useGroupStats = (groupId: string) =>
  useQuery({
    queryKey: teacherKeys.groupStats(groupId),
    queryFn: () => teacherApi.getGroupStats(groupId),
    enabled: !!groupId,
  });

/* ═══════════════════════════════════════════════════════
   STUDENTS
═══════════════════════════════════════════════════════ */

export const useStudentAttendance = (studentId: string, groupId?: string) =>
  useQuery({
    queryKey: teacherKeys.studentAttendance(studentId, groupId),
    queryFn: () => teacherApi.getStudentAttendance(studentId, groupId),
    enabled: !!studentId,
  });

export const useStudentResults = (studentId: string) =>
  useQuery({
    queryKey: teacherKeys.studentResults(studentId),
    queryFn: () => teacherApi.getStudentResults(studentId),
    enabled: !!studentId,
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
      end_time?: string;
      topic?: string;
    }) => teacherApi.createSession(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...teacherKeys.all, "sessions"] });
      qc.invalidateQueries({ queryKey: teacherKeys.dashboard() });
      qc.invalidateQueries({ queryKey: [...teacherKeys.all, "schedule"] });
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
      end_time?: string | null;
      topic?: string;
    }) => teacherApi.updateSession(sessionId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...teacherKeys.all, "sessions"] });
      qc.invalidateQueries({ queryKey: [...teacherKeys.all, "schedule"] });
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
      qc.invalidateQueries({ queryKey: [...teacherKeys.all, "schedule"] });
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
      qc.invalidateQueries({ queryKey: [...teacherKeys.all, "groups"] });
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

/* ═══════════════════════════════════════════════════════
   ANNOUNCEMENTS
═══════════════════════════════════════════════════════ */

export const useTeacherAnnouncements = (params?: {
  page?: number;
  limit?: number;
  category?: string;
}) =>
  useQuery({
    queryKey: teacherKeys.announcements(params),
    queryFn: () => teacherApi.getAnnouncements(params),
  });

export const useTeacherAnnouncementById = (announcementId: string) =>
  useQuery({
    queryKey: teacherKeys.announcementById(announcementId),
    queryFn: () => teacherApi.getAnnouncementById(announcementId),
    enabled: !!announcementId,
  });

/* ═══════════════════════════════════════════════════════
   NOTIFICATIONS
═══════════════════════════════════════════════════════ */

export const useTeacherNotifications = () =>
  useQuery({
    queryKey: teacherKeys.notifications(),
    queryFn: teacherApi.getNotifications,
  });

export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: teacherKeys.unreadCount(),
    queryFn: teacherApi.getUnreadCount,
    refetchInterval: 30_000,
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recipientId: string) =>
      teacherApi.markNotificationRead(recipientId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.notifications() });
      qc.invalidateQueries({ queryKey: teacherKeys.unreadCount() });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => teacherApi.markAllNotificationsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.notifications() });
      qc.invalidateQueries({ queryKey: teacherKeys.unreadCount() });
    },
  });
};
