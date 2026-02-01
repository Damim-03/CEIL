import api from "../axios";
import type {
  Attendance,
  AttendanceBySession,
  AttendanceByStudent,
  AttendanceStatus,
} from "../../../types/attendance";

/* =======================
   ADMIN ATTENDANCE API
======================= */

export const adminAttendanceApi = {
  /**
   * 🔹 Get attendance by session
   * GET /admin/attendance/session/:sessionId
   */
  getBySession(sessionId: string): Promise<AttendanceBySession[]> {
    return api
      .get(`/admin/attendance/session/${sessionId}`)
      .then((res) => res.data);
  },

  /**
   * 🔹 Get attendance by student
   * GET /admin/attendance/student/:studentId
   */
  getByStudent(studentId: string): Promise<AttendanceByStudent[]> {
    return api
      .get(`/admin/attendance/student/${studentId}`)
      .then((res) => res.data);
  },

  /**
   * 🔹 Mark attendance (bulk or single)
   * POST /admin/attendance
   */
  markAttendance(payload: {
    session_id: string;
    student_id: string;
    status: AttendanceStatus;
  }): Promise<Attendance> {
    return api.post("/admin/attendance", payload).then((res) => res.data);
  },

  /**
   * 🔹 Update attendance status
   * PATCH /admin/attendance/:attendanceId
   */
  updateStatus(
    attendanceId: string,
    status: AttendanceStatus,
  ): Promise<Attendance> {
    return api
      .patch(`/admin/attendance/${attendanceId}`, { status })
      .then((res) => res.data);
  },

  /**
   * 🔹 Delete attendance record
   * DELETE /admin/attendance/:attendanceId
   */
  delete(attendanceId: string): Promise<void> {
    return api.delete(`/admin/attendance/${attendanceId}`);
  },
};
