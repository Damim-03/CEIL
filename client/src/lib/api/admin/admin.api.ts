/* ===============================================================
   ADMIN API - CONSOLIDATED FILE
   
   All admin-related API calls in one place.
   Organized by domain for easy navigation.
   
   Last updated: February 2026
=============================================================== */

import axiosInstance from "../axios";

/* ===============================================================
   TYPE IMPORTS
=============================================================== */

import type {
  Attendance,
  AttendanceBySession,
  AttendanceByStudent,
  AttendanceStatus,
  AdminDashboardStats,
  StudentsReport,
  GroupsReportItem,
  PaymentsReport,
  AttendanceReport,
  EnrollmentsReport,
  Course,
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  Group,
  CreateGroupPayload,
  UpdateGroupPayload,
  Enrollment,
  Exam,
  ExamResult,
  Fee,
  Permission,
  StudentPermission,
  CreatePermissionPayload,
  Result,
  Session,
  Teacher,
} from "../../../types/Types";

/* ===============================================================
   PAYLOAD TYPES
=============================================================== */

export interface Announcement {
  announcement_id: string;
  title: string;
  title_ar: string | null;
  content: string;
  content_ar: string | null;
  excerpt: string | null;
  excerpt_ar: string | null;
  category: string | null;
  image_url: string | null;
  image_public_id: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementListParams {
  page?: number;
  limit?: number;
  category?: string;
  is_published?: boolean;
  search?: string;
}

export interface CreateAnnouncementData {
  title: string;
  title_ar?: string;
  content: string;
  content_ar?: string;
  excerpt?: string;
  excerpt_ar?: string;
  category?: string;
  is_published?: boolean;
  image?: File;
}

export interface UpdateAnnouncementData {
  title?: string;
  title_ar?: string;
  content?: string;
  content_ar?: string;
  excerpt?: string;
  excerpt_ar?: string;
  category?: string;
  image?: File;
}

export interface CreateStudentPayload {
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  status?: string;
}

export type UpdateStudentPayload = CreateStudentPayload;

export interface CoursePayload {
  course_name: string;
  course_code?: string;
  credits?: number;
  description?: string;
  teacher_id?: string;
}

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

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/* ===============================================================
   USERS API
=============================================================== */

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

  changeRole: async (userId: string, role: UserRole) => {
    const response = await axiosInstance.patch(`/admin/users/${userId}/role`, {
      role,
    });
    return response.data;
  },
};

/* ===============================================================
   STUDENTS API
=============================================================== */

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

/* ===============================================================
   TEACHERS API
=============================================================== */

/* ===============================================================
   TEACHERS API — UPDATED (add this create method)
=============================================================== */

export const adminTeachersApi = {
  getAll: async (): Promise<Teacher[]> => {
    const { data } = await axiosInstance.get("/admin/teachers");
    return data;
  },

  getById: async (teacherId: string): Promise<Teacher> => {
    const { data } = await axiosInstance.get(`/admin/teachers/${teacherId}`);
    return data;
  },

  // ✅ NEW: Create teacher (creates User + Teacher in backend)
  create: async (payload: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
  }): Promise<Teacher> => {
    const { data } = await axiosInstance.post("/admin/teachers", payload);
    return data;
  },

  update: async (
    teacherId: string,
    payload: Partial<Teacher>,
  ): Promise<Teacher> => {
    const { data } = await axiosInstance.put(
      `/admin/teachers/${teacherId}`,
      payload,
    );
    return data;
  },

  delete: async (teacherId: string) => {
    await axiosInstance.delete(`/admin/teachers/${teacherId}`);
  },
};

/* ===============================================================
   COURSES API
=============================================================== */

export const adminCoursesApi = {
  getAll: async (): Promise<Course[]> => {
    const res =
      await axiosInstance.get<PaginatedResponse<Course>>("/admin/courses");
    return res.data.data;
  },

  getById: async (courseId: string): Promise<Course> => {
    const res = await axiosInstance.get<Course>(`/admin/courses/${courseId}`);
    return res.data;
  },

  create: async (payload: CoursePayload): Promise<Course> => {
    const res = await axiosInstance.post<Course>("/admin/courses", payload);
    return res.data;
  },

  update: async (courseId: string, payload: CoursePayload): Promise<Course> => {
    const res = await axiosInstance.put<Course>(
      `/admin/courses/${courseId}`,
      payload,
    );
    return res.data;
  },

  delete: async (courseId: string): Promise<void> => {
    await axiosInstance.delete(`/admin/courses/${courseId}`);
  },
};

/* ===============================================================
   DEPARTMENTS API
=============================================================== */

export const adminDepartmentsApi = {
  async getAll(): Promise<Department[]> {
    const res = await axiosInstance.get("/admin/departments");
    return res.data;
  },

  async getById(departmentId: string): Promise<Department> {
    const res = await axiosInstance.get(`/admin/departments/${departmentId}`);
    return res.data;
  },

  async create(payload: CreateDepartmentPayload): Promise<Department> {
    const res = await axiosInstance.post("/admin/departments", payload);
    return res.data;
  },

  async update(
    departmentId: string,
    payload: UpdateDepartmentPayload,
  ): Promise<Department> {
    const res = await axiosInstance.put(
      `/admin/departments/${departmentId}`,
      payload,
    );
    return res.data;
  },

  async delete(departmentId: string): Promise<{ message: string }> {
    const res = await axiosInstance.delete(
      `/admin/departments/${departmentId}`,
    );
    return res.data;
  },
};

/* ===============================================================
   GROUPS API
=============================================================== */

export const adminGroupsApi = {
  async getAll(): Promise<Group[]> {
    const res = await axiosInstance.get("/admin/groups");
    return res.data;
  },

  async getById(groupId: string): Promise<Group> {
    const res = await axiosInstance.get(`/admin/groups/${groupId}`);
    return res.data;
  },

  async create(payload: CreateGroupPayload): Promise<Group> {
    const res = await axiosInstance.post("/admin/groups", payload);
    return res.data;
  },

  async update(groupId: string, payload: UpdateGroupPayload): Promise<Group> {
    const res = await axiosInstance.put(`/admin/groups/${groupId}`, payload);
    return res.data;
  },

  async delete(groupId: string): Promise<{ message: string }> {
    const res = await axiosInstance.delete(`/admin/groups/${groupId}`);
    return res.data;
  },

  async addStudent(
    groupId: string,
    studentId: string,
  ): Promise<{ message: string }> {
    const res = await axiosInstance.post(
      `/admin/groups/${groupId}/students/${studentId}`,
    );
    return res.data;
  },

  async removeStudent(
    groupId: string,
    studentId: string,
  ): Promise<{ message: string }> {
    const res = await axiosInstance.delete(
      `/admin/groups/${groupId}/students/${studentId}`,
    );
    return res.data;
  },

  assignInstructor: async (
    groupId: string,
    teacherId: string | null,
  ): Promise<Group> => {
    const res = await axiosInstance.patch(
      `/admin/groups/${groupId}/assign-instructor`,
      { teacher_id: teacherId },
    );
    return res.data;
  },
};

/* ===============================================================
   ENROLLMENTS API
=============================================================== */

export const adminEnrollmentsApi = {
  async getAll(): Promise<Enrollment[]> {
    const res = await axiosInstance.get("/admin/enrollments");
    return res.data;
  },

  async getById(enrollmentId: string): Promise<Enrollment> {
    const res = await axiosInstance.get(`/admin/enrollments/${enrollmentId}`);
    return res.data;
  },

  async validate(enrollmentId: string): Promise<Enrollment> {
    const res = await axiosInstance.patch(
      `/admin/enrollments/${enrollmentId}/validate`,
    );
    return res.data;
  },

  async reject(
    enrollmentId: string,
    payload?: { reason?: string },
  ): Promise<Enrollment> {
    const res = await axiosInstance.patch(
      `/admin/enrollments/${enrollmentId}/reject`,
      payload,
    );
    return res.data;
  },

  async markPaid(enrollmentId: string): Promise<Enrollment> {
    const res = await axiosInstance.patch(
      `/admin/enrollments/${enrollmentId}/mark-paid`,
    );
    return res.data;
  },

  async finish(enrollmentId: string): Promise<Enrollment> {
    const res = await axiosInstance.patch(
      `/admin/enrollments/${enrollmentId}/finish`,
    );
    return res.data;
  },
};

/* ===============================================================
   DOCUMENTS API
=============================================================== */

export const adminDocumentsApi = {
  getAll: async () => {
    try {
      const { data } = await axiosInstance.get("/admin/documents");
      console.log("Documents API response:", data);
      return data;
    } catch (error: any) {
      console.error("Error in getAll:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  getById: async (documentId: string) => {
    try {
      const { data } = await axiosInstance.get(
        `/admin/documents/${documentId}`,
      );
      console.log("Document API response:", data);
      return data;
    } catch (error: any) {
      console.error("Error in getById:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  delete: async (documentId: string) => {
    try {
      const { data } = await axiosInstance.delete(
        `/admin/documents/${documentId}`,
      );
      console.log("Delete API response:", data);
      return data;
    } catch (error: any) {
      console.error("Error in delete:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  approve: async (documentId: string) => {
    try {
      const { data } = await axiosInstance.put(
        `/admin/documents/${documentId}/approve`,
      );
      console.log("Approve API response:", data);
      return data;
    } catch (error: any) {
      console.error("Error in approve:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  reject: async (documentId: string, reason: string) => {
    try {
      const { data } = await axiosInstance.put(
        `/admin/documents/${documentId}/reject`,
        { reason },
      );
      console.log("Reject API response:", data);
      return data;
    } catch (error: any) {
      console.error("Error in reject:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },
};

/* ===============================================================
   SESSIONS API
=============================================================== */

export const adminSessionsApi = {
  async getAll(): Promise<Session[]> {
    const res = await axiosInstance.get("/admin/sessions");
    return res.data;
  },

  async getById(sessionId: string): Promise<Session> {
    const res = await axiosInstance.get(`/admin/sessions/${sessionId}`);
    return res.data;
  },

  // ✅ FIXED: Only send group_id (course & teacher come from group)
  async create(payload: {
    group_id: string;
    session_date: string;
    topic?: string;
  }): Promise<Session> {
    const res = await axiosInstance.post("/admin/sessions", payload);
    return res.data;
  },

  async update(
    sessionId: string,
    payload: {
      session_date?: string;
      topic?: string;
    },
  ): Promise<Session> {
    const res = await axiosInstance.put(
      `/admin/sessions/${sessionId}`,
      payload,
    );
    return res.data;
  },

  async delete(sessionId: string): Promise<{ message: string }> {
    const res = await axiosInstance.delete(`/admin/sessions/${sessionId}`);
    return res.data;
  },

  async getAttendance(sessionId: string) {
    const res = await axiosInstance.get(
      `/admin/sessions/${sessionId}/attendance`,
    );
    return res.data;
  },
};

/* ===============================================================
   ATTENDANCE API
=============================================================== */

export const adminAttendanceApi = {
  async getBySession(sessionId: string): Promise<AttendanceBySession[]> {
    const res = await axiosInstance.get(
      `/admin/sessions/${sessionId}/attendance`,
    );
    return res.data;
  },

  async getByStudent(studentId: string): Promise<AttendanceByStudent[]> {
    const res = await axiosInstance.get(
      `/admin/attendance/student/${studentId}`,
    );
    return res.data;
  },

  async markAttendance(payload: {
    session_id: string;
    student_id: string;
    status: AttendanceStatus;
  }): Promise<Attendance> {
    const res = await axiosInstance.post(
      `/admin/sessions/${payload.session_id}/attendance`,
      {
        student_id: payload.student_id,
        status: payload.status,
      },
    );
    return res.data;
  },

  async updateStatus(
    attendanceId: string,
    status: AttendanceStatus,
  ): Promise<Attendance> {
    const res = await axiosInstance.patch(`/admin/attendance/${attendanceId}`, {
      status,
    });
    return res.data;
  },

  delete(attendanceId: string): Promise<void> {
    return axiosInstance.delete(`/admin/attendance/${attendanceId}`);
  },
};

/* ===============================================================
   FEES API
=============================================================== */

export const adminFeesApi = {
  async getAll(): Promise<Fee[]> {
    const res = await axiosInstance.get("/admin/fees");
    return res.data;
  },

  async getById(feeId: string): Promise<Fee> {
    const res = await axiosInstance.get(`/admin/fees/${feeId}`);
    return res.data;
  },

  async create(payload: {
    student_id: string;
    enrollment_id?: string;
    amount: number;
    due_date: string;
  }): Promise<Fee> {
    const res = await axiosInstance.post("/admin/fees", payload);
    return res.data;
  },

  async update(
    feeId: string,
    payload: {
      amount?: number;
      due_date?: string;
    },
  ): Promise<Fee> {
    const res = await axiosInstance.put(`/admin/fees/${feeId}`, payload);
    return res.data;
  },

  async delete(feeId: string): Promise<{ message: string }> {
    const res = await axiosInstance.delete(`/admin/fees/${feeId}`);
    return res.data;
  },

  async markAsPaid(
    feeId: string,
    payload?: {
      payment_method?: string;
      reference_code?: string;
    },
  ): Promise<Fee> {
    const res = await axiosInstance.patch(`/admin/fees/${feeId}/pay`, payload);
    return res.data;
  },
};

/* ===============================================================
   EXAMS API
=============================================================== */

export const adminExamsApi = {
  async getAll(): Promise<Exam[]> {
    const res = await axiosInstance.get("/admin/exams");
    return res.data;
  },

  async getById(examId: string): Promise<Exam> {
    const res = await axiosInstance.get(`/admin/exams/${examId}`);
    return res.data;
  },

  async create(payload: {
    course_id: string;
    exam_name?: string;
    exam_date: string;
    max_marks: number;
  }): Promise<Exam> {
    const res = await axiosInstance.post("/admin/exams", payload);
    return res.data;
  },

  async update(
    examId: string,
    payload: {
      exam_name?: string;
      exam_date?: string;
      max_marks?: number;
    },
  ): Promise<Exam> {
    const res = await axiosInstance.put(`/admin/exams/${examId}`, payload);
    return res.data;
  },

  async delete(examId: string): Promise<{ message: string }> {
    const res = await axiosInstance.delete(`/admin/exams/${examId}`);
    return res.data;
  },

  async addResult(
    examId: string,
    payload: {
      student_id: string;
      marks_obtained: number;
      grade?: string;
    },
  ): Promise<ExamResult> {
    const res = await axiosInstance.post(
      `/admin/exams/${examId}/results`,
      payload,
    );
    return res.data;
  },

  async getResults(examId: string): Promise<ExamResult[]> {
    const res = await axiosInstance.get(`/admin/exams/${examId}/results`);
    return res.data;
  },
};

/* ===============================================================
   RESULTS API
=============================================================== */

export const adminResultsApi = {
  async getByExam(examId: string): Promise<Result[]> {
    const res = await axiosInstance.get(`/admin/exams/${examId}/results`);
    return res.data;
  },

  async getByStudent(studentId: string): Promise<Result[]> {
    const res = await axiosInstance.get(`/admin/students/${studentId}/results`);
    return res.data;
  },

  async add(
    examId: string,
    payload: {
      student_id: string;
      marks_obtained: number;
      grade?: string;
    },
  ): Promise<r> {
    const res = await axiosInstance.post(
      `/admin/exams/${examId}/results`,
      payload,
    );
    return res.data;
  },

  async update(
    resultId: string,
    payload: {
      marks_obtained?: number;
      grade?: string;
    },
  ): Promise<r> {
    const res = await axiosInstance.put(`/admin/results/${resultId}`, payload);
    return res.data;
  },
};

/* ===============================================================
   PERMISSIONS API
=============================================================== */

export const adminPermissionsApi = {
  async getAll(): Promise<Permission[]> {
    const res = await axiosInstance.get("/admin/permissions");
    return res.data;
  },

  async create(payload: CreatePermissionPayload): Promise<Permission> {
    const res = await axiosInstance.post("/admin/permissions", payload);
    return res.data;
  },

  async assignToStudent(
    studentId: string,
    permissionId: string,
  ): Promise<StudentPermission> {
    const res = await axiosInstance.post(
      `/admin/students/${studentId}/permissions`,
      {
        permissionId,
      },
    );
    return res.data;
  },

  async removeFromStudent(
    studentId: string,
    permissionId: string,
  ): Promise<{ message: string }> {
    const res = await axiosInstance.delete(
      `/admin/students/${studentId}/permissions/${permissionId}`,
    );
    return res.data;
  },
};

/* ===============================================================
   DASHBOARD API
=============================================================== */

export const adminDashboardApi = {
  async getStats(): Promise<AdminDashboardStats> {
    const res = await axiosInstance.get("/admin/dashboard/stats");
    return res.data;
  },

  async getStudentsReport(): Promise<StudentsReport> {
    const res = await axiosInstance.get("/admin/reports/students");
    return res.data;
  },

  async getGroupsReport(): Promise<GroupsReportItem[]> {
    const res = await axiosInstance.get("/admin/reports/groups");
    return res.data;
  },

  async getPaymentsReport(): Promise<PaymentsReport> {
    const res = await axiosInstance.get("/admin/reports/payments");
    return res.data;
  },

  async getAttendanceReport(): Promise<AttendanceReport> {
    const res = await axiosInstance.get("/admin/reports/attendance");
    return res.data;
  },

  async getEnrollmentsReport(): Promise<EnrollmentsReport> {
    const res = await axiosInstance.get("/admin/reports/enrollments");
    return res.data;
  },
};

/* ===============================================================
   PROFILE API
=============================================================== */

export const updateAdminAvatarApi = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await axiosInstance.patch("/admin/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const announcementApi = {
  // GET all
  getAll: (params?: AnnouncementListParams) =>
    axiosInstance
      .get<PaginatedResponse<Announcement>>("/admin/announcements", { params })
      .then((res) => res.data),

  // GET by ID
  getById: (id: string) =>
    axiosInstance
      .get<{ data: Announcement }>(`/admin/announcements/${id}`)
      .then((res) => res.data.data),

  // CREATE
  create: (data: CreateAnnouncementData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.title_ar) formData.append("title_ar", data.title_ar);
    formData.append("content", data.content);
    if (data.content_ar) formData.append("content_ar", data.content_ar);
    if (data.excerpt) formData.append("excerpt", data.excerpt);
    if (data.excerpt_ar) formData.append("excerpt_ar", data.excerpt_ar);
    if (data.category) formData.append("category", data.category);
    if (data.is_published !== undefined)
      formData.append("is_published", String(data.is_published));
    if (data.image) formData.append("image", data.image);

    return axiosInstance
      .post<{
        message: string;
        data: Announcement;
      }>("/admin/announcements", formData)
      .then((res) => res.data);
  },

  // UPDATE
  update: (id: string, data: UpdateAnnouncementData) => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.title_ar) formData.append("title_ar", data.title_ar);
    if (data.content) formData.append("content", data.content);
    if (data.content_ar) formData.append("content_ar", data.content_ar);
    if (data.excerpt) formData.append("excerpt", data.excerpt);
    if (data.excerpt_ar) formData.append("excerpt_ar", data.excerpt_ar);
    if (data.category) formData.append("category", data.category);
    if (data.image) formData.append("image", data.image);

    return axiosInstance
      .put<{
        message: string;
        data: Announcement;
      }>(`/admin/announcements/${id}`, formData)
      .then((res) => res.data);
  },

  // DELETE
  delete: (id: string) =>
    axiosInstance
      .delete<{ message: string }>(`/admin/announcements/${id}`)
      .then((res) => res.data),

  // PUBLISH
  publish: (id: string) =>
    axiosInstance
      .patch<{
        message: string;
        data: Announcement;
      }>(`/admin/announcements/${id}/publish`)
      .then((res) => res.data),

  // UNPUBLISH
  unpublish: (id: string) =>
    axiosInstance
      .patch<{
        message: string;
        data: Announcement;
      }>(`/admin/announcements/${id}/unpublish`)
      .then((res) => res.data),
};

/* ===============================================================
   COURSE PROFILE API
=============================================================== */

export interface CourseProfile {
  profile_id: string;
  course_id: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  language: string | null;
  level: string | null;
  flag_emoji: string | null;
  price: number | null;
  currency: string | null;
  session_name: string | null;
  start_date: string | null;
  end_date: string | null;
  registration_open: boolean;
  is_published: boolean;
  image_url: string | null;
  image_public_id: string | null;
  created_at: string;
  updated_at: string;
  pricing: CoursePricing[];
  course?: {
    course_id: string;
    course_name: string;
    course_code: string | null;
  };
}

export interface CoursePricing {
  pricing_id: string;
  profile_id: string;
  status_fr: string;
  status_ar: string | null;
  status_en: string | null;
  price: number;
  currency: string;
  discount: string | null;
  sort_order: number;
}

export interface CreateCourseProfileData {
  title_ar?: string;
  description?: string;
  description_ar?: string;
  language?: string;
  level?: string;
  flag_emoji?: string;
  price?: number;
  currency?: string;
  session_name?: string;
  start_date?: string;
  end_date?: string;
  registration_open?: boolean;
  is_published?: boolean;
  image?: File;
}

export interface CreateCoursePricingData {
  status_fr: string;
  status_ar?: string;
  status_en?: string;
  price: number;
  currency?: string;
  discount?: string;
  sort_order?: number;
}

export const adminCourseProfileApi = {
  get: async (courseId: string): Promise<CourseProfile> => {
    const { data } = await axiosInstance.get(
      `/admin/courses/${courseId}/profile`,
    );
    return data;
  },

  createOrUpdate: async (
    courseId: string,
    payload: CreateCourseProfileData,
  ): Promise<CourseProfile> => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "image" && value instanceof File) {
          formData.append("image", value);
        } else {
          formData.append(key, String(value));
        }
      }
    });
    const { data } = await axiosInstance.post(
      `/admin/courses/${courseId}/profile`,
      formData,
    );
    return data;
  },

  publish: async (courseId: string): Promise<CourseProfile> => {
    const { data } = await axiosInstance.patch(
      `/admin/courses/${courseId}/profile/publish`,
    );
    return data;
  },

  unpublish: async (courseId: string): Promise<CourseProfile> => {
    const { data } = await axiosInstance.patch(
      `/admin/courses/${courseId}/profile/unpublish`,
    );
    return data;
  },
};

/* ===============================================================
   COURSE PRICING API
=============================================================== */

export const adminCoursePricingApi = {
  getAll: async (courseId: string): Promise<CoursePricing[]> => {
    const { data } = await axiosInstance.get(
      `/admin/courses/${courseId}/pricing`,
    );
    return data;
  },

  create: async (
    courseId: string,
    payload: CreateCoursePricingData,
  ): Promise<CoursePricing> => {
    const { data } = await axiosInstance.post(
      `/admin/courses/${courseId}/pricing`,
      payload,
    );
    return data;
  },

  update: async (
    courseId: string,
    pricingId: string,
    payload: Partial<CreateCoursePricingData>,
  ): Promise<CoursePricing> => {
    const { data } = await axiosInstance.put(
      `/admin/courses/${courseId}/pricing/${pricingId}`,
      payload,
    );
    return data;
  },

  delete: async (
    courseId: string,
    pricingId: string,
  ): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(
      `/admin/courses/${courseId}/pricing/${pricingId}`,
    );
    return data;
  },
};
