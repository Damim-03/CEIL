import api from "../axios";
import type { Exam, ExamResult } from "../../../types/exam";

/* =======================
   ADMIN EXAMS API
======================= */

export const adminExamsApi = {
  /* =======================
     GET
  ======================= */

  // GET /admin/exams
  async getAll(): Promise<Exam[]> {
    const res = await api.get("/admin/exams");
    return res.data;
  },

  // GET /admin/exams/:examId
  async getById(examId: string): Promise<Exam> {
    const res = await api.get(`/admin/exams/${examId}`);
    return res.data;
  },

  /* =======================
     CRUD
  ======================= */

  // POST /admin/exams
  async create(payload: {
    course_id: string;
    exam_name?: string;
    exam_date: string;
    max_marks: number;
  }): Promise<Exam> {
    const res = await api.post("/admin/exams", payload);
    return res.data;
  },

  // PUT /admin/exams/:examId
  async update(
    examId: string,
    payload: {
      exam_name?: string;
      exam_date?: string;
      max_marks?: number;
    },
  ): Promise<Exam> {
    const res = await api.put(`/admin/exams/${examId}`, payload);
    return res.data;
  },

  // DELETE /admin/exams/:examId
  async delete(examId: string): Promise<{ message: string }> {
    const res = await api.delete(`/admin/exams/${examId}`);
    return res.data;
  },

  /* =======================
     RESULTS
  ======================= */

  // POST /admin/exams/:examId/results
  async addResult(
    examId: string,
    payload: {
      student_id: string;
      marks_obtained: number;
      grade?: string;
    },
  ): Promise<ExamResult> {
    const res = await api.post(`/admin/exams/${examId}/results`, payload);
    return res.data;
  },

  // GET /admin/exams/:examId/results
  async getResults(examId: string): Promise<ExamResult[]> {
    const res = await api.get(`/admin/exams/${examId}/results`);
    return res.data;
  },
};
