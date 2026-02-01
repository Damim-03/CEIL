import type { Teacher } from "../../../types/Teacher";
import axiosInstance from "../axios";

export const adminTeachersApi = {
  getAll: async (): Promise<Teacher[]> => {
    const { data } = await axiosInstance.get("/admin/teachers");
    return data;
  },

  getById: async (teacherId: string): Promise<Teacher> => {
    const { data } = await axiosInstance.get(`/admin/teachers/${teacherId}`);
    return data;
  },

  delete: async (teacherId: string) => {
    await axiosInstance.delete(`/admin/teachers/${teacherId}`);
  },
};
