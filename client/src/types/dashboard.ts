/* =======================
   ADMIN DASHBOARD STATS
======================= */

/**
 * Response from:
 * GET /admin/dashboard/stats
 */
export interface AdminDashboardStats {
  students: number;
  teachers: number;
  courses: number;
  unpaidFees: number;

  gender: {
    Male: number;
    Female: number;
    Other: number;
  };
}

/* =======================
   REPORTS
======================= */

/**
 * GET /admin/reports/students
 */
export interface StudentsReport {
  total: number;
  students: StudentReportItem[];
}

export interface StudentReportItem {
  student_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  group?: {
    group_id: string;
    name: string;
  } | null;
  enrollments: {
    enrollment_id: string;
    course_id: string;
  }[];
}

/**
 * GET /admin/reports/groups
 */
export interface GroupsReportItem {
  group_id: string;
  name: string;
  department: string;
  total_students: number;
}

/**
 * GET /admin/reports/payments
 */
export interface PaymentsReport {
  total: number;
  paid: number;
  unpaid: number;
  totalAmount: number;
  paidAmount: number;
}

/**
 * GET /admin/reports/attendance
 */
export interface AttendanceReport {
  present: number;
  absent: number;
}

/**
 * GET /admin/reports/enrollments
 */
export interface EnrollmentsReport {
  Pending: number;
  Validated: number;
  Paid: number;
  Finished: number;
  Rejected: number;
}
