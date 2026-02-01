import api from "../axios";
import type {
  AdminDashboardStats,
  StudentsReport,
  GroupsReportItem,
  PaymentsReport,
  AttendanceReport,
  EnrollmentsReport,
} from "../../../types/dashboard";

/* =======================
   ADMIN DASHBOARD API
======================= */

export const adminDashboardApi = {
  /* =======================
     DASHBOARD STATS
  ======================= */

  /**
   * GET /admin/dashboard/stats
   */
  getStats(): Promise<AdminDashboardStats> {
    return api.get("/admin/dashboard/stats").then((res) => res.data);
  },

  /* =======================
     REPORTS
  ======================= */

  /**
   * GET /admin/reports/students
   */
  getStudentsReport(): Promise<StudentsReport> {
    return api.get("/admin/reports/students").then((res) => res.data);
  },

  /**
   * GET /admin/reports/groups
   */
  getGroupsReport(): Promise<GroupsReportItem[]> {
    return api.get("/admin/reports/groups").then((res) => res.data);
  },

  /**
   * GET /admin/reports/payments
   */
  getPaymentsReport(): Promise<PaymentsReport> {
    return api.get("/admin/reports/payments").then((res) => res.data);
  },

  /**
   * GET /admin/reports/attendance
   */
  getAttendanceReport(): Promise<AttendanceReport> {
    return api.get("/admin/reports/attendance").then((res) => res.data);
  },

  /**
   * GET /admin/reports/enrollments
   */
  getEnrollmentsReport(): Promise<EnrollmentsReport> {
    return api.get("/admin/reports/enrollments").then((res) => res.data);
  },
};
