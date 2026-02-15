import axiosInstance from "../axios";

export const teacherApi = {
  // ======================== PROFILE ========================

  getProfile: async () => {
    const { data } = await axiosInstance.get("/teachers/me/profile");
    return data;
  },

  updateProfile: async (payload: Record<string, any>) => {
    const { data } = await axiosInstance.put("/teachers/me/profile", payload);
    return data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await axiosInstance.patch("/teachers/me/avatar", formData);
    return data;
  },

  // ======================== DASHBOARD ========================

  getDashboard: async () => {
    const { data } = await axiosInstance.get("/teachers/me/dashboard");
    return data;
  },

  // ======================== SCHEDULE ========================

  getSchedule: async (days?: number) => {
    const params = days ? { days } : {};
    const { data } = await axiosInstance.get("/teachers/me/schedule", {
      params,
    });
    return data;
  },

  // ======================== GROUPS ========================

  getMyGroups: async () => {
    const { data } = await axiosInstance.get("/teachers/me/groups");
    return data;
  },

  getGroupDetails: async (groupId: string) => {
    const { data } = await axiosInstance.get(`/teachers/me/groups/${groupId}`);
    return data;
  },

  getGroupStudents: async (groupId: string) => {
    const { data } = await axiosInstance.get(
      `/teachers/me/groups/${groupId}/students`,
    );
    return data;
  },

  getGroupStats: async (groupId: string) => {
    const { data } = await axiosInstance.get(
      `/teachers/me/groups/${groupId}/stats`,
    );
    return data;
  },

  // ======================== STUDENTS ========================

  getStudentAttendance: async (studentId: string, groupId?: string) => {
    const params = groupId ? { groupId } : {};
    const { data } = await axiosInstance.get(
      `/teachers/me/students/${studentId}/attendance`,
      { params },
    );
    return data;
  },

  getStudentResults: async (studentId: string) => {
    const { data } = await axiosInstance.get(
      `/teachers/me/students/${studentId}/results`,
    );
    return data;
  },

  // ======================== SESSIONS ========================

  getSessions: async (groupId?: string) => {
    const params = groupId ? { group_id: groupId } : {};
    const { data } = await axiosInstance.get("/teachers/me/sessions", {
      params,
    });
    return data;
  },

  createSession: async (payload: {
    group_id: string;
    session_date: string;
    end_time?: string; // ← جديد
    topic?: string;
  }) => {
    const { data } = await axiosInstance.post("/teachers/me/sessions", payload);
    return data;
  },

  updateSession: async (
    sessionId: string,
    payload: {
      session_date?: string;
      end_time?: string | null; // ← جديد
      topic?: string;
    },
  ) => {
    const { data } = await axiosInstance.put(
      `/teachers/me/sessions/${sessionId}`,
      payload,
    );
    return data;
  },

  deleteSession: async (sessionId: string) => {
    const { data } = await axiosInstance.delete(
      `/teachers/me/sessions/${sessionId}`,
    );
    return data;
  },

  getRoomsOverview: async (date?: string) => {
    const params = date ? `?date=${date}` : "";
    const res = await axiosInstance.get(`/teacher/rooms/overview${params}`);
    return res.data;
  },

  // ======================== ATTENDANCE ========================

  getSessionAttendance: async (sessionId: string) => {
    const { data } = await axiosInstance.get(
      `/teachers/me/sessions/${sessionId}/attendance`,
    );
    return data;
  },

  markAttendance: async (
    sessionId: string,
    payload: { student_id: string; status: "PRESENT" | "ABSENT" },
  ) => {
    const { data } = await axiosInstance.post(
      `/teachers/me/sessions/${sessionId}/attendance`,
      payload,
    );
    return data;
  },

  markBulkAttendance: async (
    sessionId: string,
    records: Array<{ student_id: string; status: "PRESENT" | "ABSENT" }>,
  ) => {
    const { data } = await axiosInstance.post(
      `/teachers/me/sessions/${sessionId}/attendance/bulk`,
      { records },
    );
    return data;
  },

  // ======================== EXAMS ========================

  getExams: async () => {
    const { data } = await axiosInstance.get("/teachers/me/exams");
    return data;
  },

  createExam: async (payload: {
    course_id: string;
    exam_name?: string;
    exam_date: string;
    max_marks: number;
  }) => {
    const { data } = await axiosInstance.post("/teachers/me/exams", payload);
    return data;
  },

  updateExam: async (
    examId: string,
    payload: { exam_name?: string; exam_date?: string; max_marks?: number },
  ) => {
    const { data } = await axiosInstance.put(
      `/teachers/me/exams/${examId}`,
      payload,
    );
    return data;
  },

  deleteExam: async (examId: string) => {
    const { data } = await axiosInstance.delete(`/teachers/me/exams/${examId}`);
    return data;
  },

  // ======================== RESULTS ========================

  getExamResults: async (examId: string) => {
    const { data } = await axiosInstance.get(
      `/teachers/me/exams/${examId}/results`,
    );
    return data;
  },

  addResult: async (
    examId: string,
    payload: { student_id: string; marks_obtained: number; grade?: string },
  ) => {
    const { data } = await axiosInstance.post(
      `/teachers/me/exams/${examId}/results`,
      payload,
    );
    return data;
  },

  addBulkResults: async (
    examId: string,
    results: Array<{
      student_id: string;
      marks_obtained: number;
      grade?: string;
    }>,
  ) => {
    const { data } = await axiosInstance.post(
      `/teachers/me/exams/${examId}/results/bulk`,
      { results },
    );
    return data;
  },

  // ======================== ANNOUNCEMENTS ========================

  getAnnouncements: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
  }) => {
    const { data } = await axiosInstance.get("/teachers/me/announcements", {
      params,
    });
    return data;
  },

  getAnnouncementById: async (announcementId: string) => {
    const { data } = await axiosInstance.get(
      `/teachers/me/announcements/${announcementId}`,
    );
    return data;
  },

  // ======================== NOTIFICATIONS ========================

  getNotifications: async () => {
    const { data } = await axiosInstance.get("/teachers/notifications");
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await axiosInstance.get(
      "/teachers/notifications/unread-count",
    );
    return data;
  },

  markNotificationRead: async (recipientId: string) => {
    const { data } = await axiosInstance.patch(
      `/teachers/notifications/${recipientId}/read`,
    );
    return data;
  },

  markAllNotificationsRead: async () => {
    const { data } = await axiosInstance.patch(
      "/teachers/notifications/read-all",
    );
    return data;
  },
};
