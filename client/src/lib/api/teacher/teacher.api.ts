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

  // ======================== GROUPS ========================

  getMyGroups: async () => {
    const { data } = await axiosInstance.get("/teachers/me/groups");
    return data;
  },

  getGroupStudents: async (groupId: string) => {
    const { data } = await axiosInstance.get(
      `/teachers/me/groups/${groupId}/students`,
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
    topic?: string;
  }) => {
    const { data } = await axiosInstance.post("/teachers/me/sessions", payload);
    return data;
  },

  updateSession: async (
    sessionId: string,
    payload: { session_date?: string; topic?: string },
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
};
