import api from "../axios";
import type {
  Permission,
  StudentPermission,
  CreatePermissionPayload,
} from "../../../types/permission";

/* =======================
   ADMIN PERMISSIONS API
======================= */

export const adminPermissionsApi = {
  /* =======================
     PERMISSIONS
  ======================= */

  // GET /admin/permissions
  async getAll(): Promise<Permission[]> {
    const res = await api.get("/admin/permissions");
    return res.data;
  },

  // POST /admin/permissions
  async create(
    payload: CreatePermissionPayload,
  ): Promise<Permission> {
    const res = await api.post("/admin/permissions", payload);
    return res.data;
  },

  /* =======================
     STUDENT PERMISSIONS
  ======================= */

  // POST /admin/students/:studentId/permissions
  async assignToStudent(
    studentId: string,
    permissionId: string,
  ): Promise<StudentPermission> {
    const res = await api.post(
      `/admin/students/${studentId}/permissions`,
      { permissionId },
    );
    return res.data;
  },

  // DELETE /admin/students/:studentId/permissions/:permissionId
  async removeFromStudent(
    studentId: string,
    permissionId: string,
  ): Promise<{ message: string }> {
    const res = await api.delete(
      `/admin/students/${studentId}/permissions/${permissionId}`,
    );
    return res.data;
  },
};
