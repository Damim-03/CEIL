import axiosInstance from "../axios";

export const studentApi = {
  getProfile: async () => {
    const { data } = await axiosInstance.get("/students/me/profile");
    return data;
  },

  updateProfile: async (payload: any) => {
    const { data } = await axiosInstance.put("/students/profile", payload);
    return data;
  },

  getDocuments: async () => {
    const { data } = await axiosInstance.get("/students/documents");
    return data;
  },

  uploadDocuments: async (formData: FormData) => {
    const { data } = await axiosInstance.post("/students/documents", formData);
    return data;
  },

  deleteDocument: async (documentId: string) => {
    const { data } = await axiosInstance.delete(
      `/students/documents/${documentId}`,
    );
    return data;
  },

  getEnrollments: async () => {
    const { data } = await axiosInstance.get("/students/me/enrollments");
    return data;
  },

  enroll: async (courseId: string) => {
    const { data } = await axiosInstance.post("/students/enroll", { courseId });
    return data;
  },

  uploadAvatar: async (formData: FormData) => {
    const { data } = await axiosInstance.patch("/students/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
