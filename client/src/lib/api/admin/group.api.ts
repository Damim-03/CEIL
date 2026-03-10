// ================================================================
// 📦 src/lib/api/admin/group.api.ts
// ✅ Raw API calls for Group management
// ✅ Fixed: correct axiosInstance import path
// ================================================================

import axiosInstance from "../axios"; // ✅ src/lib/api/axios.ts
import type {
  GroupStatus,
  RegistrationStatus,
  GroupStudent,
} from "../../../hooks/admin/useAdminGroups";

export interface GroupsParams {
  status?: GroupStatus;
  level?: string;
  course_id?: string;
  teacher_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── GET GROUPS ───────────────────────────────────────────────

export const groupApi = {
  getGroups: async (params: GroupsParams = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== "ALL" && v !== "",
      ),
    );
    const qs = new URLSearchParams(clean as any).toString();
    const res = await axiosInstance.get(`/admin/groups?${qs}`);

    // ✅ handle both shapes: array OR { data, meta }
    const raw = res.data;
    if (Array.isArray(raw)) {
      return {
        data: raw.map((g) => ({
          ...g,
          enrolled_count: g.current_capacity ?? 0,
          pending_count:
            g.enrollments?.filter(
              (e: any) => e.registration_status === "PENDING",
            ).length ?? 0,
          capacity_pct: Math.round(
            ((g.current_capacity ?? 0) / g.max_students) * 100,
          ),
          is_full: (g.current_capacity ?? 0) >= g.max_students,
          _count: g._count ?? { enrollments: 0, sessions: 0 },
        })),
        meta: { total: raw.length, page: 1, limit: raw.length, total_pages: 1 },
      };
    }
    return raw;
  },

  getGroupDetails: async (groupId: string) => {
    const res = await axiosInstance.get(`/admin/groups/${groupId}/details`);
    return res.data;
  },

  getGroupStudents: async (
    groupId: string,
    params: { status?: RegistrationStatus; page?: number; limit?: number } = {},
  ) => {
    try {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined),
      );
      const qs = new URLSearchParams(clean as any).toString();
      const res = await axiosInstance.get(
        `/admin/groups/${groupId}/students?${qs}`,
      );
      return res.data as { data: GroupStudent[]; meta: any };
    } catch {
      // ✅ fallback: استخدم الـ endpoint القديم
      const res = await axiosInstance.get(`/admin/groups/${groupId}`);
      const group = res.data;
      const enrollments = group.enrollments ?? [];
      return {
        data: enrollments.map((e: any) => ({
          enrollment_id: e.enrollment_id,
          registration_status: e.registration_status,
          enrollment_date: e.enrollment_date,
          student: e.student,
        })),
        meta: {
          total: enrollments.length,
          page: 1,
          limit: enrollments.length,
          total_pages: 1,
        },
      };
    }
  },

  changeStatus: async (groupId: string, status: GroupStatus) => {
    const res = await axiosInstance.patch(`/admin/groups/${groupId}/status`, {
      status,
    });
    return res.data;
  },

  assignTeacher: async (groupId: string, teacher_id: string | null) => {
    const res = await axiosInstance.patch(`/admin/groups/${groupId}/teacher`, {
      teacher_id,
    });
    return res.data;
  },

  transferStudent: async (
    fromGroupId: string,
    studentId: string,
    toGroupId: string,
  ) => {
    const res = await axiosInstance.post(
      `/admin/groups/${fromGroupId}/transfer`,
      {
        student_id: studentId,
        to_group_id: toGroupId,
      },
    );
    return res.data;
  },

  removeStudent: async (groupId: string, studentId: string) => {
    const res = await axiosInstance.delete(
      `/admin/groups/${groupId}/students/${studentId}`,
    );
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
