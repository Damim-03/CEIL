import api from "../axios";
import type {
  Group,
  CreateGroupPayload,
  UpdateGroupPayload,
} from "../../../types/group";

/* =======================
   ADMIN GROUPS API
======================= */

export const adminGroupsApi = {
  /* =======================
     GET
  ======================= */

  // GET /admin/groups
  async getAll(): Promise<Group[]> {
    const res = await api.get("/admin/groups");
    return res.data;
  },

  // GET /admin/groups/:groupId
  async getById(groupId: string): Promise<Group> {
    const res = await api.get(`/admin/groups/${groupId}`);
    return res.data;
  },

  /* =======================
     CRUD
  ======================= */

  // POST /admin/groups
  async create(payload: CreateGroupPayload): Promise<Group> {
    const res = await api.post("/admin/groups", payload);
    return res.data;
  },

  // PUT /admin/groups/:groupId
  async update(
    groupId: string,
    payload: UpdateGroupPayload,
  ): Promise<Group> {
    const res = await api.put(`/admin/groups/${groupId}`, payload);
    return res.data;
  },

  // DELETE /admin/groups/:groupId
  async delete(groupId: string): Promise<{ message: string }> {
    const res = await api.delete(`/admin/groups/${groupId}`);
    return res.data;
  },

  /* =======================
     STUDENTS MANAGEMENT
  ======================= */

  // POST /admin/groups/:groupId/students/:studentId
  async addStudent(
    groupId: string,
    studentId: string,
  ): Promise<{ message: string }> {
    const res = await api.post(
      `/admin/groups/${groupId}/students/${studentId}`,
    );
    return res.data;
  },

  // DELETE /admin/groups/:groupId/students/:studentId
  async removeStudent(
    groupId: string,
    studentId: string,
  ): Promise<{ message: string }> {
    const res = await api.delete(
      `/admin/groups/${groupId}/students/${studentId}`,
    );
    return res.data;
  },
};
