import axiosInstance from "../axios";

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export interface User {
  user_id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  google_avatar?: string | null;
  created_at: string;
  last_login: string;
}

export const adminUsersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await axiosInstance.get("/admin/users");
    return data;
  },

  getById: async (userId: string): Promise<User> => {
    const { data } = await axiosInstance.get(`/admin/users/${userId}`);
    return data;
  },

  enable: async (userId: string) => {
    await axiosInstance.patch(`/admin/users/${userId}/enable`);
  },

  disable: async (userId: string) => {
    await axiosInstance.patch(`/admin/users/${userId}/disable`);
  },

  update: async (userId: string, payload: { email: string }) => {
    await axiosInstance.put(`/admin/users/${userId}`, payload);
  },

  delete: async (userId: string) => {
    await axiosInstance.delete(`/admin/users/${userId}`);
  },

  // 🔥🔥 NEW: CHANGE ROLE
  changeRole: async (userId: string, role: UserRole) => {
    const response = await axiosInstance.patch(`/admin/users/${userId}/role`, {
      role,
    });

    return response.data;
  },
};
