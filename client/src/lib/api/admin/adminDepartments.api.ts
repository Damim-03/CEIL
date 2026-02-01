import api from "../axios";
import type {
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from "../../../types/department";

/* =======================
   ADMIN DEPARTMENTS API
======================= */

export const adminDepartmentsApi = {
  /* =======================
     GET
  ======================= */

  /**
   * 🔹 Get all departments
   * GET /admin/departments
   */
  getAll(): Promise<Department[]> {
    return api.get("/admin/departments").then((res) => res.data);
  },

  /**
   * 🔹 Get department by ID
   * GET /admin/departments/:departmentId
   */
  getById(departmentId: string): Promise<Department> {
    return api
      .get(`/admin/departments/${departmentId}`)
      .then((res) => res.data);
  },

  /* =======================
     MUTATIONS
  ======================= */

  /**
   * 🔹 Create department
   * POST /admin/departments
   */
  create(payload: CreateDepartmentPayload): Promise<Department> {
    return api.post("/admin/departments", payload).then((res) => res.data);
  },

  /**
   * 🔹 Update department
   * PUT /admin/departments/:departmentId
   */
  update(
    departmentId: string,
    payload: UpdateDepartmentPayload,
  ): Promise<Department> {
    return api
      .put(`/admin/departments/${departmentId}`, payload)
      .then((res) => res.data);
  },

  /**
   * 🔹 Delete department
   * DELETE /admin/departments/:departmentId
   */
  delete(departmentId: string): Promise<{ message: string }> {
    return api
      .delete(`/admin/departments/${departmentId}`)
      .then((res) => res.data);
  },
};
