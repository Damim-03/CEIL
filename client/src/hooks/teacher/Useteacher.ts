import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "../../lib/api/teacher/teacher.api";

/* ═══════════════════════════════════════════════════════
   QUERY KEYS
═══════════════════════════════════════════════════════ */

export const teacherKeys = {
  all: ["teacher"] as const,

  // Profile
  profile: () => [...teacherKeys.all, "profile"] as const,

  // Dashboard
  dashboard: () => [...teacherKeys.all, "dashboard"] as const,

  // Schedule
  schedule: (days?: number) =>
    [...teacherKeys.all, "schedule", days ?? 30] as const,

  // Groups
  groups: () => [...teacherKeys.all, "groups"] as const,
  groupDetails: (groupId: string) =>
    [...teacherKeys.all, "groups", groupId] as const,
  groupStudents: (groupId: string) =>
    [...teacherKeys.all, "groups", groupId, "students"] as const,
  groupStats: (groupId: string) =>
    [...teacherKeys.all, "groups", groupId, "stats"] as const,

  // Students
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

  // Sessions
  sessions: (groupId?: string) =>
    [...teacherKeys.all, "sessions", groupId ?? "all"] as const,
  sessionAttendance: (sessionId: string) =>
    [...teacherKeys.all, "sessions", sessionId, "attendance"] as const,

  // Exams & Results
  exams: () => [...teacherKeys.all, "exams"] as const,
  examResults: (examId: string) =>
    [...teacherKeys.all, "exams", examId, "results"] as const,

  // Announcements
  announcements: (params?: { page?: number; category?: string }) =>
    [...teacherKeys.all, "announcements", params ?? {}] as const,
  announcementById: (id: string) =>
    [...teacherKeys.all, "announcements", id] as const,

  // Notifications
  notifications: () => [...teacherKeys.all, "notifications"] as const,
  unreadCount: () =>
    [...teacherKeys.all, "notifications", "unread-count"] as const,
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

export const useTeacherRoomsOverview = (date?: string) => {
  return useQuery({
    queryKey: ["teacher", "rooms-overview", date],
    queryFn: () => teacherApi.getRoomsOverview(date),
    // ✅ تحديث تلقائي كل 30 ثانية عند عرض صفحة القاعات
    refetchInterval: 30_000,
    // ✅ يعيد التحميل فوراً عند عودة المستخدم للتبويب
    refetchOnWindowFocus: true,
    // ✅ يحتفظ بالبيانات القديمة أثناء إعادة التحميل (لا flicker)
    placeholderData: (prev: any) => prev,
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
   SCHEDULE
═══════════════════════════════════════════════════════ */

export const useTeacherSchedule = (days?: number) =>
  useQuery({
    queryKey: teacherKeys.schedule(days),
    queryFn: () => teacherApi.getSchedule(days),
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
   STUDENTS (per-student data)
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
      end_time?: string; // ← جديد
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
      end_time?: string | null; // ← جديد
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
