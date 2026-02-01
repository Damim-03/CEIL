/* =======================
   ENUMS
======================= */

export type AttendanceStatus = "Present" | "Absent";

/* =======================
   BASE ATTENDANCE
   (matches Prisma model)
======================= */

export interface Attendance {
  attendance_id: string;

  session_id: string;
  student_id: string;

  status: AttendanceStatus;
}

/* =======================
   ADMIN / TEACHER RESPONSES
======================= */

/**
 * 🔹 Attendance returned when fetching
 * attendance by session
 */
export interface AttendanceBySession {
  attendance_id: string;
  status: AttendanceStatus;
  student: {
    student_id: string;
    first_name: string;
    last_name: string;
    email?: string | null;
  };
}

/**
 * 🔹 Attendance returned when fetching
 * attendance by student
 */
export interface AttendanceByStudent {
  attendance_id: string;
  status: AttendanceStatus;
  session: {
    session_id: string;
    session_date: string;
    topic?: string | null;
  };
}

/* =======================
   MUTATIONS
======================= */

export interface MarkAttendancePayload {
  studentId: string;
  status: AttendanceStatus;
}

export interface UpdateAttendancePayload {
  status: AttendanceStatus;
}
