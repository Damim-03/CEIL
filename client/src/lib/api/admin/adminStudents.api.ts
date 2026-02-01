import axiosInstance from "../axios";

export interface CreateStudentPayload {
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  status?: string;
}

export type UpdateStudentPayload = CreateStudentPayload;

export const adminStudentsApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/admin/students");
    return data;
  },

  getById: async (studentId: string) => {
    const { data } = await axiosInstance.get(`/admin/students/${studentId}`);
    return data;
  },

  create: async (payload: CreateStudentPayload) => {
    const { data } = await axiosInstance.post("/admin/students", payload);
    return data;
  },

  update: async (studentId: string, payload: UpdateStudentPayload) => {
    const { data } = await axiosInstance.put(
      `/admin/students/${studentId}`,
      payload,
    );
    return data;
  },

  updateStudentAvatar: async (studentId: string, formData: FormData) => {
    const { data } = await axiosInstance.patch(
      `/admin/students/${studentId}/avatar`,
      formData,
    );
    return data;
  },

  delete: async (studentId: string) => {
    await axiosInstance.delete(`/admin/students/${studentId}`);
  },
};
