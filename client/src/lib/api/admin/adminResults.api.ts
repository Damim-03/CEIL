import api from "../axios";
import type { Result } from "../../../types/result";

/* =======================
   ADMIN RESULTS API
======================= */

export const adminResultsApi = {
  /* =======================
     GET
  ======================= */

  // GET /admin/exams/:examId/results
  async getByExam(examId: string): Promise<Result[]> {
    const res = await api.get(`/admin/exams/${examId}/results`);
    return res.data;
  },

  // GET /admin/students/:studentId/results
  async getByStudent(studentId: string): Promise<Result[]> {
    const res = await api.get(`/admin/students/${studentId}/results`);
    return res.data;
  },

  /* =======================
     MUTATIONS
  ======================= */

  // POST /admin/exams/:examId/results
  async add(
    examId: string,
    payload: {
      student_id: string;
      marks_obtained: number;
      grade?: string;
    },
  ): Promise<Result> {
    const res = await api.post(
      `/admin/exams/${examId}/results`,
      payload,
    );
    return res.data;
  },

  // PUT /admin/results/:resultId
  async update(
    resultId: string,
    payload: {
      marks_obtained?: number;
      grade?: string;
    },
  ): Promise<Result> {
    const res = await api.put(`/admin/results/${resultId}`, payload);
    return res.data;
  },
};
