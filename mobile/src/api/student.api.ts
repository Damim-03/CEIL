import { apiClient } from "./client";
import type {
  Enrollment,
  AttendanceRecord,
  AttendanceSummary,
  NotificationRecipient,
  Timetable,
  Student,
  Fee,
} from "../types";

export const studentApi = {
  // ── Profile ────────────────────────────────────────────────

  getProfile: async (): Promise<Student> => {
    const { data } = await apiClient.get("/students/me/profile");
    return data;
  },

  updateProfile: async (body: Partial<Student>): Promise<Student> => {
    const { data } = await apiClient.put("/students/profile", body);
    return data;
  },

  uploadAvatar: async (formData: FormData) => {
    const { data } = await apiClient.post("/students/avatar", formData);
    return data;
  },

  getDashboard: async () => {
    const { data } = await apiClient.get("/students/me/dashboard");
    return data;
  },

  // ── Enrollments ────────────────────────────────────────────

  getEnrollments: async (): Promise<Enrollment[]> => {
    const { data } = await apiClient.get("/students/me/enrollments");
    return data?.data ?? data;
  },

  getEnrollmentById: async (id: string): Promise<Enrollment> => {
    const { data } = await apiClient.get(`/students/me/enrollments/${id}`);
    return data;
  },

  enroll: async (body: {
    course_id: string;
    group_id?: string;
    pricing_id?: string;
  }) => {
    const { data } = await apiClient.post("/students/enroll", body);
    return data;
  },

  cancelEnrollment: async (id: string) => {
    const { data } = await apiClient.delete(`/students/me/enrollments/${id}`);
    return data;
  },

  // ── Courses ────────────────────────────────────────────────

  getCourses: async () => {
    const { data } = await apiClient.get("/students/courses");
    return data?.data ?? data;
  },

  getCourseGroups: async (courseId: string) => {
    const { data } = await apiClient.get(
      `/students/courses/${courseId}/groups`,
    );
    return data?.data ?? data;
  },

  getCoursePricing: async (courseId: string) => {
    const { data } = await apiClient.get(
      `/students/courses/${courseId}/pricing`,
    );
    return data;
  },

  // ── Groups ─────────────────────────────────────────────────

  joinGroup: async (body: { group_id: string }) => {
    const { data } = await apiClient.post("/students/groups/join", body);
    return data;
  },

  leaveGroup: async (body: { group_id: string }) => {
    const { data } = await apiClient.post("/students/groups/leave", body);
    return data;
  },

  // ── Documents ──────────────────────────────────────────────

  getDocuments: async () => {
    const { data } = await apiClient.get("/students/documents");
    if (Array.isArray(data)) {
      return {
        documents: data,
        registrant_category: "STUDENT",
        required_documents: [],
        is_complete: false,
        missing: [],
      };
    }
    return data?.data ?? data;
  },

  // ✅ Fixed: multipart headers + transformRequest
  uploadDocument: async (formData: FormData) => {
    const { data } = await apiClient.post("/students/documents", formData);
    return data;
  },

  deleteDocument: async (documentId: string) => {
    const { data } = await apiClient.delete(
      `/students/documents/${documentId}`,
    );
    return data;
  },

  // ✅ Fixed: multipart headers + transformRequest
  reuploadDocument: async ({
    documentId,
    formData,
  }: {
    documentId: string;
    formData: FormData;
  }) => {
    const { data } = await apiClient.put(
      `/students/documents/${documentId}/reupload`,
      formData,
    );
    return data;
  },

  // ── Fees ───────────────────────────────────────────────────

  getFees: async (): Promise<Fee[]> => {
    const { data } = await apiClient.get("/students/me/fees");
    return data?.data ?? data;
  },

  // ── Attendance ─────────────────────────────────────────────

  getAttendance: async (): Promise<{
    records: AttendanceRecord[];
    summary: AttendanceSummary;
  }> => {
    const { data } = await apiClient.get("/students/me/attendance");
    return data;
  },

  // ── Results ────────────────────────────────────────────────

  getResults: async () => {
    const { data } = await apiClient.get("/students/me/results");
    return data?.data ?? data;
  },

  // ── Schedule ───────────────────────────────────────────────

  getActiveTimetable: async (): Promise<Timetable> => {
    const { data } = await apiClient.get("/timetables/active");
    return data;
  },

  // ── Notifications ──────────────────────────────────────────

  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    unread?: boolean;
  }): Promise<{ data: NotificationRecipient[]; unread_count: number }> => {
    const { data } = await apiClient.get("/students/notifications", { params });
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get(
      "/students/notifications/unread-count",
    );
    return data?.unread_count ?? 0;
  },

  markAsRead: async (recipientId: string) => {
    const { data } = await apiClient.patch(
      `/students/notifications/${recipientId}/read`,
    );
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await apiClient.patch("/students/notifications/read-all");
    return data;
  },
};
