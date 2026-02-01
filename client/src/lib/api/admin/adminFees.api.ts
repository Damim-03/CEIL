import api from "../axios";
import type { Fee, FeeStatus } from "../../../types/fee";

/* =======================
   ADMIN FEES API
======================= */

export const adminFeesApi = {
  /* =======================
     GET
  ======================= */

  // GET /admin/fees
  async getAll(): Promise<Fee[]> {
    const res = await api.get("/admin/fees");
    return res.data;
  },

  // GET /admin/fees/:feeId
  async getById(feeId: string): Promise<Fee> {
    const res = await api.get(`/admin/fees/${feeId}`);
    return res.data;
  },

  /* =======================
     CRUD
  ======================= */

  // POST /admin/fees
  async create(payload: {
    student_id: string;
    enrollment_id?: string;
    amount: number;
    due_date: string;
  }): Promise<Fee> {
    const res = await api.post("/admin/fees", payload);
    return res.data;
  },

  // PUT /admin/fees/:feeId
  async update(
    feeId: string,
    payload: {
      amount?: number;
      due_date?: string;
    },
  ): Promise<Fee> {
    const res = await api.put(`/admin/fees/${feeId}`, payload);
    return res.data;
  },

  // DELETE /admin/fees/:feeId
  async delete(feeId: string): Promise<{ message: string }> {
    const res = await api.delete(`/admin/fees/${feeId}`);
    return res.data;
  },

  /* =======================
     STATUS
  ======================= */

  // PATCH /admin/fees/:feeId/pay
  async markAsPaid(
    feeId: string,
    payload?: {
      payment_method?: string;
      reference_code?: string;
    },
  ): Promise<Fee> {
    const res = await api.patch(`/admin/fees/${feeId}/pay`, payload);
    return res.data;
  },
};
