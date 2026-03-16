import axiosInstance from "../axios";

export const studentApi = {
  getProfile: async () => {
    const { data } = await axiosInstance.get("/students/me/profile");
    return data;
  },
  updateProfile: async (payload: Record<string, any>) => {
    const { data } = await axiosInstance.put("/students/profile", payload);
    return data;
  },
  uploadAvatar: async (formData: FormData) => {
    const { data } = await axiosInstance.post("/students/avatar", formData);
    return data;
  },
  getDashboard: async () => {
    const { data } = await axiosInstance.get("/students/me/dashboard");
    return data;
  },
  getDocuments: async () => {
    const { data } = await axiosInstance.get("/students/documents");
    if (Array.isArray(data)) {
      return { documents: data, registrant_category: "STUDENT", required_documents: [], is_complete: false, missing: [] };
    }
    return data;
  },
  uploadDocuments: async (formData: FormData) => {
    const { data } = await axiosInstance.post("/students/documents", formData);
    return data;
  },
  deleteDocument: async (documentId: string) => {
    const { data } = await axiosInstance.delete(`/students/documents/${documentId}`);
    return data;
  },
  reuploadDocument: async ({ documentId, formData }: { documentId: string; formData: FormData }) => {
    const { data } = await axiosInstance.put(`/students/documents/${documentId}/reupload`, formData);
    return data;
  },
  enroll: async (payload: { course_id: string; group_id?: string; level?: string; pricing_id?: string }) => {
    const { data } = await axiosInstance.post("/students/enroll", payload);
    return data;
  },
  getEnrollments: async () => {
    const { data } = await axiosInstance.get("/students/me/enrollments");
    return data;
  },
  getEnrollmentDetails: async (enrollmentId: string) => {
    const { data } = await axiosInstance.get(`/students/me/enrollments/${enrollmentId}`);
    return data;
  },
  cancelEnrollment: async (enrollmentId: string) => {
    const { data } = await axiosInstance.delete(`/students/me/enrollments/${enrollmentId}`);
    return data;
  },
  getCourses: async () => {
    const { data } = await axiosInstance.get("/students/courses");
    return data;
  },
  getCourseGroups: async (courseId: string) => {
    const { data } = await axiosInstance.get(`/students/courses/${courseId}/groups`);
    return data;
  },
  getCoursePricing: async (courseId: string) => {
    const { data } = await axiosInstance.get(`/students/courses/${courseId}/pricing`);
    return data;
  },
  joinGroup: async (groupId: string) => {
    const { data } = await axiosInstance.post("/students/groups/join", { groupId });
    return data;
  },
  leaveGroup: async () => {
    const { data } = await axiosInstance.post("/students/groups/leave");
    return data;
  },
  getFees: async () => {
    const { data } = await axiosInstance.get("/students/me/fees");
    return data;
  },
  getAttendance: async () => {
    const { data } = await axiosInstance.get("/students/me/attendance");
    return data;
  },
  getResults: async () => {
    const { data } = await axiosInstance.get("/students/me/results");
    return data;
  },
  getNotifications: async (page = 1, unreadOnly = false) => {
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (unreadOnly) params.append("unread", "true");
    const { data } = await axiosInstance.get(`/students/notifications?${params}`);
    return data;
  },
  getUnreadCount: async () => {
    const { data } = await axiosInstance.get("/students/notifications/unread-count");
    return data;
  },
  markNotificationRead: async (recipientId: string) => {
    const { data } = await axiosInstance.patch(`/students/notifications/${recipientId}/read`);
    return data;
  },
  markAllNotificationsRead: async () => {
    const { data } = await axiosInstance.patch("/students/notifications/read-all");
    return data;
  },
};
