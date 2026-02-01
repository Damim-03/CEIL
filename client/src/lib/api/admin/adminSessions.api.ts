import api from "../axios";
import type { Session } from "../../../types/session";

/* =======================
   ADMIN SESSIONS API
======================= */

export const adminSessionsApi = {
  /* =======================
     GET
  ======================= */

  // GET /admin/sessions
  async getAll(): Promise<Session[]> {
    const res = await api.get("/admin/sessions");
    return res.data;
  },

  // GET /admin/sessions/:sessionId
  async getById(sessionId: string): Promise<Session> {
    const res = await api.get(`/admin/sessions/${sessionId}`);
    return res.data;
  },

  /* =======================
     CRUD
  ======================= */

  // POST /admin/sessions
  async create(payload: {
    course_id: string;
    teacher_id: string;
    group_id: string;
    session_date: string;
    topic?: string;
  }): Promise<Session> {
    const res = await api.post("/admin/sessions", payload);
    return res.data;
  },

  // PUT /admin/sessions/:sessionId
  async update(
    sessionId: string,
    payload: {
      session_date?: string;
      topic?: string;
    },
  ): Promise<Session> {
    const res = await api.put(`/admin/sessions/${sessionId}`, payload);
    return res.data;
  },

  // DELETE /admin/sessions/:sessionId
  async delete(sessionId: string): Promise<{ message: string }> {
    const res = await api.delete(`/admin/sessions/${sessionId}`);
    return res.data;
  },

  /* =======================
     ATTENDANCE (via Session)
  ======================= */

  // POST /admin/sessions/:sessionId/attendance
  async markAttendance(
    sessionId: string,
    payload: {
      studentId: string;
      status: "Present" | "Absent";
    },
  ) {
    const res = await api.post(
      `/admin/sessions/${sessionId}/attendance`,
      payload,
    );
    return res.data;
  },

  // GET /admin/sessions/:sessionId/attendance
  async getAttendance(sessionId: string) {
    const res = await api.get(
      `/admin/sessions/${sessionId}/attendance`,
    );
    return res.data;
  },
};
