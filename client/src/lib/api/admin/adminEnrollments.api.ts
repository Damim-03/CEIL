import api from "../axios";
import type { Enrollment } from "../../../types/enrollment";

/* =======================
   ADMIN ENROLLMENTS API
======================= */

export const adminEnrollmentsApi = {
  /* =======================
     GET
  ======================= */

  // GET /admin/enrollments
  async getAll(): Promise<Enrollment[]> {
    const res = await api.get("/admin/enrollments");
    return res.data;
  },

  // GET /admin/enrollments/:enrollmentId
  async getById(enrollmentId: string): Promise<Enrollment> {
    const res = await api.get(`/admin/enrollments/${enrollmentId}`);
    return res.data;
  },

  /* =======================
     STATUS ACTIONS
  ======================= */

  // PATCH /admin/enrollments/:enrollmentId/validate
  async validate(enrollmentId: string): Promise<Enrollment> {
    const res = await api.patch(
      `/admin/enrollments/${enrollmentId}/validate`,
    );
    return res.data;
  },

  // PATCH /admin/enrollments/:enrollmentId/reject
  async reject(
    enrollmentId: string,
    payload?: { reason?: string },
  ): Promise<Enrollment> {
    const res = await api.patch(
      `/admin/enrollments/${enrollmentId}/reject`,
      payload,
    );
    return res.data;
  },

  // PATCH /admin/enrollments/:enrollmentId/mark-paid
  async markPaid(enrollmentId: string): Promise<Enrollment> {
    const res = await api.patch(
      `/admin/enrollments/${enrollmentId}/mark-paid`,
    );
    return res.data;
  },

  // PATCH /admin/enrollments/:enrollmentId/finish
  async finish(enrollmentId: string): Promise<Enrollment> {
    const res = await api.patch(
      `/admin/enrollments/${enrollmentId}/finish`,
    );
    return res.data;
  },
};
