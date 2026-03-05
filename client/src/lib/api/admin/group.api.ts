// ================================================================
// 📦 src/api/admin/group.api.ts
// ✅ Raw API calls for Group management
// ================================================================

import axiosInstance from "../../../lib/api/axios"; // adjust path to your axiosInstance
import type { GroupStatus, RegistrationStatus, Group, GroupStudent } from "../../../hooks/admin/useAdminGroups";

export interface GroupsParams {
  status?:    GroupStatus;
  level?:     string;
  course_id?: string;
  teacher_id?:string;
  search?:    string;
  page?:      number;
  limit?:     number;
}

// ─── GET GROUPS ───────────────────────────────────────────────

export const groupApi = {
  getGroups: async (params: GroupsParams = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "ALL" && v !== "")
    );
    const qs = new URLSearchParams(clean as any).toString();
    const res = await axiosInstance.get(`/admin/groups?${qs}`);
    return res.data as {
      data: Group[];
      meta: { total: number; page: number; limit: number; total_pages: number };
    };
  },

  getGroupDetails: async (groupId: string) => {
    const res = await axiosInstance.get(`/admin/groups/${groupId}/details`);
    return res.data;
  },

  getGroupStudents: async (
    groupId: string,
    params: { status?: RegistrationStatus; page?: number; limit?: number } = {}
  ) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    );
    const qs = new URLSearchParams(clean as any).toString();
    const res = await axiosInstance.get(`/admin/groups/${groupId}/students?${qs}`);
    return res.data as { data: GroupStudent[]; meta: any };
  },

  changeStatus: async (groupId: string, status: GroupStatus) => {
    const res = await axiosInstance.patch(`/admin/groups/${groupId}/status`, { status });
    return res.data;
  },

  assignTeacher: async (groupId: string, teacher_id: string | null) => {
    const res = await axiosInstance.patch(`/admin/groups/${groupId}/teacher`, { teacher_id });
    return res.data;
  },

  transferStudent: async (fromGroupId: string, studentId: string, toGroupId: string) => {
    const res = await axiosInstance.post(`/admin/groups/${fromGroupId}/transfer`, {
      student_id:  studentId,
      to_group_id: toGroupId,
    });
    return res.data;
  },

  getTransferRequests: async () => {
    const res = await axiosInstance.get("/admin/groups/transfer-requests");
    return res.data;
  },

  getAllTeachers: async () => {
    const res = await axiosInstance.get("/admin/teachers?limit=200");
    return res.data?.data ?? res.data ?? [];
  },
};