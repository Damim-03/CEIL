// ================================================================
// 📌 src/lib/api/owner/owner.api.ts
// ✅ Complete — ALL endpoints matching owner.routes.ts
// ✅ Section A: Owner-Exclusive
// ✅ Section B: Admin-equivalent (full CRUD)
// ================================================================

import axiosInstance from "../axios";
import type {
  OwnerDashboard,
  AdminAccount,
  CreateAdminPayload,
  AuditLog,
  AuditLogFilters,
  AuditLogStats,
  PaginatedResponse,
  SystemSettingsResponse,
  OwnerUser,
  UserFilters,
  SystemHealth,
  SystemStats,
  OwnerFee,
  OwnerFeeFilters,
  OwnerFeeSummary,
  OwnerRevenue,
  OwnerEnrollment,
  OwnerEnrollmentFilters,
  OwnerStudent,
  OwnerStudentDetail,
  OwnerDepartment,
  OwnerGroup,
  OwnerCourse,
  OwnerNotification,
  OwnerActivity,
  OwnerActivityFilters,
  OwnerUserActivity,
} from "../../../types/Types";

const BASE = "/owner";

// ╔═══════════════════════════════════════════════════════════════╗
// ║  SECTION A: OWNER-EXCLUSIVE APIs                             ║
// ╚═══════════════════════════════════════════════════════════════╝

/* ═══════════════════════════ 1. Dashboard ═══════════════════════════ */

export const ownerDashboardApi = {
  getOverview: async (): Promise<OwnerDashboard> => {
    const { data } = await axiosInstance.get(`${BASE}/dashboard`);
    return data;
  },

  getStats: async () => {
    const { data } = await axiosInstance.get(`${BASE}/dashboard/stats`);
    return data;
  },

  getStudentsReport: async () => {
    const { data } = await axiosInstance.get(`${BASE}/reports/students`);
    return data;
  },

  getGroupsReport: async () => {
    const { data } = await axiosInstance.get(`${BASE}/reports/groups`);
    return data;
  },

  getPaymentsReport: async () => {
    const { data } = await axiosInstance.get(`${BASE}/reports/payments`);
    return data;
  },

  getAttendanceReport: async () => {
    const { data } = await axiosInstance.get(`${BASE}/reports/attendance`);
    return data;
  },

  getEnrollmentsReport: async () => {
    const { data } = await axiosInstance.get(`${BASE}/reports/enrollments`);
    return data;
  },
};

/* ═══════════════════════════ 2. Admin Management ═══════════════════════════ */

export const ownerAdminsApi = {
  getAll: async (): Promise<AdminAccount[]> => {
    const { data } = await axiosInstance.get(`${BASE}/admins`);
    return data;
  },

  create: async (
    payload: CreateAdminPayload,
  ): Promise<{ message: string; admin: AdminAccount }> => {
    const { data } = await axiosInstance.post(`${BASE}/admins`, payload);
    return data;
  },

  activate: async (
    userId: string,
  ): Promise<{ message: string; user: AdminAccount }> => {
    const { data } = await axiosInstance.patch(
      `${BASE}/admins/${userId}/activate`,
    );
    return data;
  },

  deactivate: async (
    userId: string,
  ): Promise<{ message: string; user: AdminAccount }> => {
    const { data } = await axiosInstance.patch(
      `${BASE}/admins/${userId}/deactivate`,
    );
    return data;
  },

  promote: async (
    userId: string,
  ): Promise<{ message: string; user: AdminAccount }> => {
    const { data } = await axiosInstance.patch(
      `${BASE}/admins/${userId}/promote`,
    );
    return data;
  },

  delete: async (userId: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(`${BASE}/admins/${userId}`);
    return data;
  },
};

/* ═══════════════════════════ 3. Audit Logs ═══════════════════════════ */

export const ownerAuditApi = {
  getAll: async (
    filters?: AuditLogFilters,
  ): Promise<PaginatedResponse<AuditLog>> => {
    const { data } = await axiosInstance.get(`${BASE}/audit-logs`, {
      params: filters,
    });
    return data;
  },

  getStats: async (): Promise<AuditLogStats> => {
    const { data } = await axiosInstance.get(`${BASE}/audit-logs/stats`);
    return data;
  },

  cleanup: async (
    daysToKeep?: number,
  ): Promise<{ message: string; deleted: number }> => {
    const { data } = await axiosInstance.delete(`${BASE}/audit-logs/cleanup`, {
      data: { days_to_keep: daysToKeep || 90 },
    });
    return data;
  },
};

/* ═══════════════════════════ 4. System Settings ═══════════════════════════ */

export const ownerSettingsApi = {
  getAll: async (): Promise<SystemSettingsResponse> => {
    const { data } = await axiosInstance.get(`${BASE}/settings`);
    return data;
  },

  update: async (
    settings: Record<string, string>,
  ): Promise<{ message: string; count: number }> => {
    const { data } = await axiosInstance.put(`${BASE}/settings`, { settings });
    return data;
  },
};

/* ═══════════════════════════ 5. System Health & Stats ═══════════════════════════ */

export const ownerSystemApi = {
  getHealth: async (): Promise<SystemHealth> => {
    const { data } = await axiosInstance.get(`${BASE}/system/health`);
    return data;
  },

  getStats: async (): Promise<SystemStats> => {
    const { data } = await axiosInstance.get(`${BASE}/system/stats`);
    return data;
  },
};

/* ═══════════════════════════ 6. Activity Tracking ═══════════════════════════ */

export const ownerActivityApi = {
  getAll: async (filters?: OwnerActivityFilters): Promise<OwnerActivity> => {
    const { data } = await axiosInstance.get(`${BASE}/activity`, {
      params: filters,
    });
    return data;
  },

  getByUser: async (
    userId: string,
    params?: { page?: number; limit?: number },
  ): Promise<OwnerUserActivity> => {
    const { data } = await axiosInstance.get(
      `${BASE}/activity/user/${userId}`,
      { params },
    );
    return data;
  },
};

// ╔═══════════════════════════════════════════════════════════════╗
// ║  SECTION B: ALL CAPABILITIES (Admin-equivalent)              ║
// ╚═══════════════════════════════════════════════════════════════╝

/* ═══════════════════════════ Avatar ═══════════════════════════ */

export const ownerAvatarApi = {
  update: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await axiosInstance.patch(`${BASE}/me/avatar`, formData);
    return data;
  },
};

/* ═══════════════════════════ Users ═══════════════════════════ */

export const ownerUsersApi = {
  getAll: async (
    filters?: UserFilters,
  ): Promise<PaginatedResponse<OwnerUser>> => {
    const { data } = await axiosInstance.get(`${BASE}/users`, {
      params: filters,
    });
    return data;
  },

  getById: async (userId: string) => {
    const { data } = await axiosInstance.get(`${BASE}/users/${userId}`);
    return data;
  },

  changeRole: async (
    userId: string,
    role: string,
  ): Promise<{ message: string; user: OwnerUser }> => {
    const { data } = await axiosInstance.patch(`${BASE}/users/${userId}/role`, {
      role,
    });
    return data;
  },

  enable: async (userId: string) => {
    const { data } = await axiosInstance.patch(
      `${BASE}/users/${userId}/enable`,
    );
    return data;
  },

  disable: async (userId: string) => {
    const { data } = await axiosInstance.patch(
      `${BASE}/users/${userId}/disable`,
    );
    return data;
  },
};

/* ═══════════════════════════ Students ═══════════════════════════ */

export const ownerStudentsApi = {
  getAll: async (filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{ data: OwnerStudent[]; meta: any }> => {
    const { data } = await axiosInstance.get(`${BASE}/students`, {
      params: filters,
    });
    return data;
  },

  getById: async (studentId: string): Promise<OwnerStudentDetail> => {
    const { data } = await axiosInstance.get(`${BASE}/students/${studentId}`);
    return data;
  },

  create: async (payload: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    nationality?: string;
    language?: string;
    education_level?: string;
    study_location?: string;
  }) => {
    const { data } = await axiosInstance.post(`${BASE}/students`, payload);
    return data;
  },

  update: async (studentId: string, payload: Record<string, any>) => {
    const { data } = await axiosInstance.put(
      `${BASE}/students/${studentId}`,
      payload,
    );
    return data;
  },

  delete: async (studentId: string) => {
    const { data } = await axiosInstance.delete(
      `${BASE}/students/${studentId}`,
    );
    return data;
  },

  updateAvatar: async (studentId: string, formData: FormData) => {
    const { data } = await axiosInstance.patch(
      `${BASE}/students/${studentId}/avatar`,
      formData,
    );
    return data;
  },
};

/* ═══════════════════════════ Teachers ═══════════════════════════ */

export const ownerTeachersApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get(`${BASE}/teachers`);
    return data;
  },

  getById: async (teacherId: string) => {
    const { data } = await axiosInstance.get(`${BASE}/teachers/${teacherId}`);
    return data;
  },

  create: async (payload: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    password?: string; // ← ADD THIS
  }) => {
    const { data } = await axiosInstance.post(`${BASE}/teachers`, payload);
    return data;
  },

  update: async (teacherId: string, payload: Record<string, any>) => {
    const { data } = await axiosInstance.put(
      `${BASE}/teachers/${teacherId}`,
      payload,
    );
    return data;
  },

  delete: async (teacherId: string) => {
    const { data } = await axiosInstance.delete(
      `${BASE}/teachers/${teacherId}`,
    );
    return data;
  },
};

/* ═══════════════════════════ Courses ═══════════════════════════ */

export const ownerCoursesApi = {
  getAll: async (): Promise<OwnerCourse[]> => {
    const { data } = await axiosInstance.get(`${BASE}/courses`);
    return data;
  },

  getById: async (courseId: string) => {
    const { data } = await axiosInstance.get(`${BASE}/courses/${courseId}`);
    return data;
  },

  create: async (payload: {
    course_name: string;
    course_code?: string;
    credits?: number;
  }) => {
    const { data } = await axiosInstance.post(`${BASE}/courses`, payload);
    return data;
  },

  update: async (courseId: string, payload: Record<string, any>) => {
    const { data } = await axiosInstance.put(
      `${BASE}/courses/${courseId}`,
      payload,
    );
    return data;
  },

  delete: async (courseId: string) => {
    const { data } = await axiosInstance.delete(`${BASE}/courses/${courseId}`);
    return data;
  },
};

/* ═══════════════════════════ Departments ═══════════════════════════ */

export const ownerDepartmentsApi = {
  getAll: async (): Promise<OwnerDepartment[]> => {
    const { data } = await axiosInstance.get(`${BASE}/departments`);
    return data;
  },

  getById: async (departmentId: string) => {
    const { data } = await axiosInstance.get(
      `${BASE}/departments/${departmentId}`,
    );
    return data;
  },

  create: async (payload: { name: string; description?: string }) => {
    const { data } = await axiosInstance.post(`${BASE}/departments`, payload);
    return data;
  },

  update: async (departmentId: string, payload: Record<string, any>) => {
    const { data } = await axiosInstance.put(
      `${BASE}/departments/${departmentId}`,
      payload,
    );
    return data;
  },

  delete: async (departmentId: string) => {
    const { data } = await axiosInstance.delete(
      `${BASE}/departments/${departmentId}`,
    );
    return data;
  },
};

/* ═══════════════════════════ Groups ═══════════════════════════ */

export const ownerGroupsApi = {
  getAll: async (filters?: {
    page?: number;
    limit?: number;
    course_id?: string;
  }): Promise<{ data: OwnerGroup[]; meta: any }> => {
    const { data } = await axiosInstance.get(`${BASE}/groups`, {
      params: filters,
    });
    return data;
  },

  getById: async (groupId: string) => {
    const { data } = await axiosInstance.get(`${BASE}/groups/${groupId}`);
    return data;
  },

  create: async (payload: {
    name: string;
    course_id: string;
    level: string;
    department_id?: string;
    max_students?: number;
    teacher_id?: string;
  }) => {
    const { data } = await axiosInstance.post(`${BASE}/groups`, payload);
    return data;
  },

  update: async (groupId: string, payload: Record<string, any>) => {
    const { data } = await axiosInstance.put(
      `${BASE}/groups/${groupId}`,
      payload,
    );
    return data;
  },

  delete: async (groupId: string) => {
    const { data } = await axiosInstance.delete(`${BASE}/groups/${groupId}`);
    return data;
  },

  addStudent: async (groupId: string, studentId: string) => {
    const { data } = await axiosInstance.post(
      `${BASE}/groups/${groupId}/students/${studentId}`,
    );
    return data;
  },

  removeStudent: async (groupId: string, studentId: string) => {
    const { data } = await axiosInstance.delete(
      `${BASE}/groups/${groupId}/students/${studentId}`,
    );
    return data;
  },

  assignInstructor: async (groupId: string, teacherId: string | null) => {
    const { data } = await axiosInstance.patch(
      `${BASE}/groups/${groupId}/assign-instructor`,
      { teacher_id: teacherId },
    );
    return data;
  },
};

/* ═══════════════════════════ Fees ═══════════════════════════ */

export const ownerFeesApi = {
  getAll: async (
    filters?: OwnerFeeFilters,
  ): Promise<{ data: OwnerFee[]; meta: any; summary: OwnerFeeSummary }> => {
    const { data } = await axiosInstance.get(`${BASE}/fees`, {
      params: filters,
    });
    return data;
  },

  getById: async (feeId: string): Promise<OwnerFee> => {
    const { data } = await axiosInstance.get(`${BASE}/fees/${feeId}`);
    return data;
  },

  create: async (payload: {
    student_id: string;
    enrollment_id?: string;
    amount: number;
    due_date: string;
  }): Promise<{ message: string; fee: OwnerFee }> => {
    const { data } = await axiosInstance.post(`${BASE}/fees`, payload);
    return data;
  },

  update: async (
    feeId: string,
    payload: {
      amount?: number;
      due_date?: string;
      status?: "PAID" | "UNPAID";
      payment_method?: string;
      reference_code?: string;
    },
  ): Promise<{ message: string; fee: OwnerFee }> => {
    const { data } = await axiosInstance.put(`${BASE}/fees/${feeId}`, payload);
    return data;
  },

  markAsPaid: async (
    feeId: string,
    payload?: {
      payment_method?: string;
      reference_code?: string;
    },
  ): Promise<{ message: string; fee: OwnerFee; enrollment?: any }> => {
    const { data } = await axiosInstance.patch(
      `${BASE}/fees/${feeId}/pay`,
      payload,
    );
    return data;
  },

  delete: async (feeId: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(`${BASE}/fees/${feeId}`);
    return data;
  },

  getRevenue: async (): Promise<OwnerRevenue> => {
    const { data } = await axiosInstance.get(`${BASE}/fees/revenue`);
    return data;
  },

  correctAmount: async (
    feeId: string,
    amount: number,
  ): Promise<{
    message: string;
    data: any;
    correction: { old_amount: number; new_amount: number; diff: number };
  }> => {
    const { data } = await axiosInstance.patch(
      `${BASE}/fees/${feeId}/correct-amount`,
      { amount },
    );
    return data;
  },

  getFeeAnalytics: (params?: {
    period?: "daily" | "monthly" | "yearly";
    date?: string;
    page?: number;
    limit?: number;
  }) =>
    axiosInstance.get("/owner/fees/analytics", { params }).then((r) => r.data),
};

/* ═══════════════════════════ Enrollments ═══════════════════════════ */

export const ownerEnrollmentsApi = {
  getAll: async (
    filters?: OwnerEnrollmentFilters,
  ): Promise<{
    data: OwnerEnrollment[];
    meta: any;
    status_breakdown: any[];
  }> => {
    const { data } = await axiosInstance.get(`${BASE}/enrollments`, {
      params: filters,
    });
    return data;
  },

  getById: async (enrollmentId: string): Promise<OwnerEnrollment> => {
    const { data } = await axiosInstance.get(
      `${BASE}/enrollments/${enrollmentId}`,
    );
    return data;
  },

  validate: async (enrollmentId: string, payload?: { pricing_id?: string }) => {
    const { data } = await axiosInstance.patch(
      `${BASE}/enrollments/${enrollmentId}/validate`,
      payload || {},
    );
    return data;
  },

  reject: async (enrollmentId: string, payload?: { reason?: string }) => {
    const { data } = await axiosInstance.patch(
      `${BASE}/enrollments/${enrollmentId}/reject`,
      payload,
    );
    return data;
  },

  markPaid: async (enrollmentId: string) => {
    const { data } = await axiosInstance.patch(
      `${BASE}/enrollments/${enrollmentId}/mark-paid`,
    );
    return data;
  },

  finish: async (enrollmentId: string) => {
    const { data } = await axiosInstance.patch(
      `${BASE}/enrollments/${enrollmentId}/finish`,
    );
    return data;
  },

  changeStatus: async (
    enrollmentId: string,
    status: string,
  ): Promise<{ message: string; enrollment: OwnerEnrollment }> => {
    const { data } = await axiosInstance.patch(
      `${BASE}/enrollments/${enrollmentId}/status`,
      { status },
    );
    return data;
  },

  delete: async (enrollmentId: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(
      `${BASE}/enrollments/${enrollmentId}`,
    );
    return data;
  },
};

/* ═══════════════════════════ Documents ═══════════════════════════ */

export const ownerDocumentsApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get(`${BASE}/documents`);
    return data;
  },

  getById: async (documentId: string) => {
    const { data } = await axiosInstance.get(`${BASE}/documents/${documentId}`);
    return data;
  },

  approve: async (documentId: string) => {
    const { data } = await axiosInstance.put(
      `${BASE}/documents/${documentId}/approve`,
    );
    return data;
  },

  reject: async (documentId: string) => {
    const { data } = await axiosInstance.put(
      `${BASE}/documents/${documentId}/reject`,
    );
    return data;
  },

  delete: async (documentId: string) => {
    const { data } = await axiosInstance.delete(
      `${BASE}/documents/${documentId}`,
    );
    return data;
  },
};

/* ═══════════════════════════ Sessions ═══════════════════════════ */

export const ownerSessionsApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get(`${BASE}/sessions`);
    return data;
  },

  getById: async (sessionId: string) => {
    const { data } = await axiosInstance.get(`${BASE}/sessions/${sessionId}`);
    return data;
  },

  create: async (payload: {
    group_id: string;
    session_date: string;
    end_time?: string;
    topic?: string;
    room_id?: string;
  }) => {
    const { data } = await axiosInstance.post(`${BASE}/sessions`, payload);
    return data;
  },

  update: async (
    sessionId: string,
    payload: {
      session_date?: string;
      end_time?: string | null;
      topic?: string;
      room_id?: string | null;
    },
  ) => {
    const { data } = await axiosInstance.put(
      `${BASE}/sessions/${sessionId}`,
      payload,
    );
    return data;
  },

  delete: async (sessionId: string) => {
    const { data } = await axiosInstance.delete(
      `${BASE}/sessions/${sessionId}`,
    );
    return data;
  },
};

/* ═══════════════════════════ Attendance ═══════════════════════════ */

export const ownerAttendanceApi = {
  markAttendance: async (
    sessionId: string,
    payload: { student_id: string; status: string },
  ) => {
    const { data } = await axiosInstance.post(
      `${BASE}/sessions/${sessionId}/attendance`,
      payload,
    );
    return data;
  },

  getBySession: async (sessionId: string) => {
    const { data } = await axiosInstance.get(
      `${BASE}/sessions/${sessionId}/attendance`,
    );
    return data;
  },

  getByStudent: async (studentId: string) => {
    const { data } = await axiosInstance.get(
      `${BASE}/students/${studentId}/attendance`,
    );
    return data;
  },

  update: async (attendanceId: string, status: string) => {
    const { data } = await axiosInstance.put(
      `${BASE}/attendance/${attendanceId}`,
      { status },
    );
    return data;
  },
};

/* ═══════════════════════════ Exams ═══════════════════════════ */

export const ownerExamsApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get(`${BASE}/exams`);
    return data;
  },

  getById: async (examId: string) => {
    const { data } = await axiosInstance.get(`${BASE}/exams/${examId}`);
    return data;
  },

  create: async (payload: {
    course_id: string;
    exam_name?: string;
    exam_date: string;
    max_marks: number;
  }) => {
    const { data } = await axiosInstance.post(`${BASE}/exams`, payload);
    return data;
  },

  update: async (examId: string, payload: Record<string, any>) => {
    const { data } = await axiosInstance.put(
      `${BASE}/exams/${examId}`,
      payload,
    );
    return data;
  },

  delete: async (examId: string) => {
    const { data } = await axiosInstance.delete(`${BASE}/exams/${examId}`);
    return data;
  },
};

/* ═══════════════════════════ Results ═══════════════════════════ */

export const ownerResultsApi = {
  addByExam: async (
    examId: string,
    payload: {
      studentId: string;
      marks_obtained: number;
      grade?: string;
    },
  ) => {
    const { data } = await axiosInstance.post(
      `${BASE}/exams/${examId}/results`,
      payload,
    );
    return data;
  },

  getByExam: async (examId: string) => {
    const { data } = await axiosInstance.get(`${BASE}/exams/${examId}/results`);
    return data;
  },

  getByStudent: async (studentId: string) => {
    const { data } = await axiosInstance.get(
      `${BASE}/students/${studentId}/results`,
    );
    return data;
  },

  update: async (resultId: string, payload: Record<string, any>) => {
    const { data } = await axiosInstance.put(
      `${BASE}/results/${resultId}`,
      payload,
    );
    return data;
  },
};

/* ═══════════════════════════ Permissions ═══════════════════════════ */

export const ownerPermissionsApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get(`${BASE}/permissions`);
    return data;
  },

  create: async (payload: { name: string; description?: string }) => {
    const { data } = await axiosInstance.post(`${BASE}/permissions`, payload);
    return data;
  },

  assignToStudent: async (studentId: string, permissionId: string) => {
    const { data } = await axiosInstance.post(
      `${BASE}/students/${studentId}/permissions`,
      { permissionId },
    );
    return data;
  },

  removeFromStudent: async (studentId: string, permissionId: string) => {
    const { data } = await axiosInstance.delete(
      `${BASE}/students/${studentId}/permissions/${permissionId}`,
    );
    return data;
  },
};

/* ═══════════════════════════ Announcements ═══════════════════════════ */

export const ownerAnnouncementsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    is_published?: boolean;
  }) => {
    const { data } = await axiosInstance.get(`${BASE}/announcements`, {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get(`${BASE}/announcements/${id}`);
    return data;
  },

  create: async (formData: FormData) => {
    const { data } = await axiosInstance.post(
      `${BASE}/announcements`,
      formData,
    );
    return data;
  },

  update: async (id: string, formData: FormData) => {
    const { data } = await axiosInstance.put(
      `${BASE}/announcements/${id}`,
      formData,
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(`${BASE}/announcements/${id}`);
    return data;
  },

  publish: async (id: string) => {
    const { data } = await axiosInstance.patch(
      `${BASE}/announcements/${id}/publish`,
    );
    return data;
  },

  unpublish: async (id: string) => {
    const { data } = await axiosInstance.patch(
      `${BASE}/announcements/${id}/unpublish`,
    );
    return data;
  },
};

/* ═══════════════════════════ Course Profiles & Pricing ═══════════════════════════ */

export const ownerCourseProfileApi = {
  get: async (courseId: string) => {
    const { data } = await axiosInstance.get(
      `${BASE}/courses/${courseId}/profile`,
    );
    return data;
  },

  createOrUpdate: async (courseId: string, formData: FormData) => {
    const { data } = await axiosInstance.post(
      `${BASE}/courses/${courseId}/profile`,
      formData,
    );
    return data;
  },

  publish: async (courseId: string) => {
    const { data } = await axiosInstance.patch(
      `${BASE}/courses/${courseId}/profile/publish`,
    );
    return data;
  },

  unpublish: async (courseId: string) => {
    const { data } = await axiosInstance.patch(
      `${BASE}/courses/${courseId}/profile/unpublish`,
    );
    return data;
  },
};

export const ownerCoursePricingApi = {
  getAll: async (courseId: string) => {
    const { data } = await axiosInstance.get(
      `${BASE}/courses/${courseId}/pricing`,
    );
    return data;
  },

  create: async (
    courseId: string,
    payload: {
      status_fr: string;
      status_ar?: string;
      status_en?: string;
      price: number;
      currency?: string;
      discount?: string;
      sort_order?: number;
    },
  ) => {
    const { data } = await axiosInstance.post(
      `${BASE}/courses/${courseId}/pricing`,
      payload,
    );
    return data;
  },

  update: async (
    courseId: string,
    pricingId: string,
    payload: Record<string, any>,
  ) => {
    const { data } = await axiosInstance.put(
      `${BASE}/courses/${courseId}/pricing/${pricingId}`,
      payload,
    );
    return data;
  },

  delete: async (courseId: string, pricingId: string) => {
    const { data } = await axiosInstance.delete(
      `${BASE}/courses/${courseId}/pricing/${pricingId}`,
    );
    return data;
  },
};

/* ═══════════════════════════ Notifications ═══════════════════════════ */

export type OwnerNotificationTargetType =
  | "ALL_STUDENTS"
  | "ALL_TEACHERS"
  | "ALL_ADMINS"
  | "ALL_USERS"
  | "SPECIFIC_STUDENTS"
  | "SPECIFIC_TEACHERS"
  | "SPECIFIC_ADMINS"
  | "GROUP"
  | "COURSE";

export interface OwnerNotificationPayload {
  title: string;
  title_ar?: string;
  message: string;
  message_ar?: string;
  target_type: OwnerNotificationTargetType;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  course_id?: string;
  group_id?: string;
  user_ids?: string[];
}

export const ownerNotificationsApi = {
  getTargets: async () => {
    const { data } = await axiosInstance.get(`${BASE}/notifications/targets`);
    return data;
  },

  searchStudents: async (query: string, targetType?: string) => {
    const params = new URLSearchParams({ q: query });
    if (targetType) params.append("target_type", targetType);
    const { data } = await axiosInstance.get(
      `${BASE}/notifications/search-students?${params.toString()}`,
    );
    return data;
  },

  send: async (payload: OwnerNotificationPayload) => {
    const { data } = await axiosInstance.post(`${BASE}/notifications`, payload);
    return data;
  },

  broadcast: async (
    payload: OwnerNotificationPayload,
  ): Promise<{ message: string; notification: OwnerNotification }> => {
    const { data } = await axiosInstance.post(
      `${BASE}/notifications/broadcast`,
      payload,
    );
    return data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: OwnerNotification[]; meta: any }> => {
    const { data } = await axiosInstance.get(`${BASE}/notifications`, {
      params,
    });
    return data;
  },

  getById: async (notificationId: string) => {
    const { data } = await axiosInstance.get(
      `${BASE}/notifications/${notificationId}`,
    );
    return data;
  },

  delete: async (notificationId: string) => {
    const { data } = await axiosInstance.delete(
      `${BASE}/notifications/${notificationId}`,
    );
    return data;
  },
};

/* ═══════════════════════════ Rooms ═══════════════════════════ */

export const ownerRoomsApi = {
  getAll: async (params?: {
    include_sessions?: boolean;
    active_only?: boolean;
  }) => {
    const { data } = await axiosInstance.get(`${BASE}/rooms`, { params });
    return data;
  },

  getById: async (roomId: string) => {
    const { data } = await axiosInstance.get(`${BASE}/rooms/${roomId}`);
    return data;
  },

  create: async (payload: {
    name: string;
    capacity?: number;
    location?: string;
  }) => {
    const { data } = await axiosInstance.post(`${BASE}/rooms`, payload);
    return data;
  },

  update: async (roomId: string, payload: Record<string, any>) => {
    const { data } = await axiosInstance.put(
      `${BASE}/rooms/${roomId}`,
      payload,
    );
    return data;
  },

  delete: async (roomId: string) => {
    const { data } = await axiosInstance.delete(`${BASE}/rooms/${roomId}`);
    return data;
  },

  getSchedule: async (
    roomId: string,
    params?: { from?: string; to?: string },
  ) => {
    const { data } = await axiosInstance.get(
      `${BASE}/rooms/${roomId}/schedule`,
      { params },
    );
    return data;
  },

  getScheduleOverview: async (date?: string) => {
    const { data } = await axiosInstance.get(
      `${BASE}/rooms/schedule/overview`,
      { params: { date } },
    );
    return data;
  },

  checkAvailability: async (
    roomId: string,
    params: { date: string; end_time?: string },
  ) => {
    const { data } = await axiosInstance.get(
      `${BASE}/rooms/${roomId}/availability`,
      { params },
    );
    return data;
  },
};

/* ═══════════════════════════ Legacy Academics (kept for backward compat) ═══════════════════════════ */

export const ownerAcademicsApi = {
  getDepartments: ownerDepartmentsApi.getAll,
  getGroups: ownerGroupsApi.getAll,
  getCourses: ownerCoursesApi.getAll,
};
