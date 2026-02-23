// ================================================================
// 📦 src/services/admin/attendance.service.ts
// ✅ Attendance management — shared between Admin & Owner
// ✅ Daily attendance linked to sessions
// ✅ Bulk marking support
// ✅ Student attendance summary with percentage
// 🔌 Socket.IO events included
// ================================================================

import { prisma } from "../../prisma/client";
import { AttendanceStatus } from "../../../generated/prisma/client";
import { emitToAdminLevel, emitToUser, emitToGroup } from "../socket.service";

// ─── MARK SINGLE ATTENDANCE ─────────────────────────────

export async function markAttendance(
  sessionId: string,
  studentId: string,
  status: string,
) {
  if (!studentId || !status) return { error: "validation" as const };

  if (!Object.values(AttendanceStatus).includes(status as AttendanceStatus)) {
    return { error: "invalid_status" as const };
  }

  const session = await prisma.session.findUnique({
    where: { session_id: sessionId },
  });
  if (!session) return { error: "session_not_found" as const };

  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
  });
  if (!student) return { error: "student_not_found" as const };

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      student_id: studentId,
      group_id: session.group_id,
      registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
    },
  });
  if (!enrollment) return { error: "not_enrolled" as const };

  const attendance = await prisma.attendance.upsert({
    where: {
      session_id_student_id: {
        session_id: sessionId,
        student_id: studentId,
      },
    },
    update: {
      status: status as AttendanceStatus,
      attended_at: new Date(),
    },
    create: {
      session_id: sessionId,
      student_id: studentId,
      status: status as AttendanceStatus,
      attended_at: new Date(),
    },
  });

  // 🔌 Socket
  emitToAdminLevel("attendance:marked", {
    session_id: sessionId,
    student_id: studentId,
    status,
    group_id: session.group_id,
  });
  emitToGroup(session.group_id, "attendance:marked", {
    session_id: sessionId,
    student_id: studentId,
    status,
  });

  const attUser = await prisma.user.findFirst({
    where: { student_id: studentId },
    select: { user_id: true },
  });
  if (attUser) {
    emitToUser(attUser.user_id, "attendance:marked", {
      session_id: sessionId,
      student_id: studentId,
      status,
    });
  }

  return { data: attendance };
}

// ─── MARK BULK ATTENDANCE (كل طلاب الحصة دفعة واحدة) ──

interface BulkAttendanceEntry {
  student_id: string;
  status: string; // ✅ Changed from AttendanceStatus to string for safety
}

export async function markBulkAttendance(
  sessionId: string,
  entries: BulkAttendanceEntry[],
) {
  if (!entries || entries.length === 0) {
    return { error: "empty_entries" as const };
  }

  // 🔍 DEBUG LOG — remove after confirming fix
  console.log("═══════════════════════════════════════════════");
  console.log("📋 markBulkAttendance called");
  console.log("📋 sessionId:", sessionId);
  console.log("📋 Raw entries:", entries);
  console.log("📋 entries JSON:", JSON.stringify(entries, null, 2));
  console.log("═══════════════════════════════════════════════");

  // Validate statuses
  for (const entry of entries) {
    console.log(
      `📋 Validating entry: student=${entry.student_id}, status="${entry.status}", type=${typeof entry.status}`,
    );
    if (
      !Object.values(AttendanceStatus).includes(
        entry.status as AttendanceStatus,
      )
    ) {
      console.log(`❌ Invalid status: "${entry.status}"`);
      console.log("📋 Valid values:", Object.values(AttendanceStatus));
      return { error: "invalid_status" as const, student_id: entry.student_id };
    }
  }

  const session = await prisma.session.findUnique({
    where: { session_id: sessionId },
    include: { group: true },
  });
  if (!session) return { error: "session_not_found" as const };

  // Verify all students are enrolled
  const enrolledStudents = await prisma.enrollment.findMany({
    where: {
      group_id: session.group_id,
      registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
      student_id: { in: entries.map((e) => e.student_id) },
    },
    select: { student_id: true },
  });

  const enrolledIds = new Set(enrolledStudents.map((e) => e.student_id));
  const notEnrolled = entries.filter((e) => !enrolledIds.has(e.student_id));
  if (notEnrolled.length > 0) {
    return {
      error: "some_not_enrolled" as const,
      student_ids: notEnrolled.map((e) => e.student_id),
    };
  }

  const now = new Date();

  console.log("📋 About to upsert with statuses:");
  entries.forEach((e) => {
    console.log(`   → student=${e.student_id}, status="${e.status}"`);
  });

  const results = await prisma.$transaction(
    entries.map((entry) =>
      prisma.attendance.upsert({
        where: {
          session_id_student_id: {
            session_id: sessionId,
            student_id: entry.student_id,
          },
        },
        update: {
          status: entry.status as AttendanceStatus,
          attended_at: now,
        },
        create: {
          session_id: sessionId,
          student_id: entry.student_id,
          status: entry.status as AttendanceStatus,
          attended_at: now,
        },
      }),
    ),
  );

  // 🔍 DEBUG — check what was actually saved
  console.log("✅ Upsert results:");
  results.forEach((r) => {
    console.log(
      `   → id=${r.attendance_id}, student=${r.student_id}, status="${r.status}", attended_at=${r.attended_at}`,
    );
  });
  console.log("═══════════════════════════════════════════");

  // 🔌 Socket
  emitToAdminLevel("attendance:bulk_marked", {
    session_id: sessionId,
    group_id: session.group_id,
    count: results.length,
  });
  emitToGroup(session.group_id, "attendance:bulk_marked", {
    session_id: sessionId,
    count: results.length,
  });

  return {
    data: {
      session_id: sessionId,
      marked: results.length,
      records: results,
    },
  };
}

// ─── GET BY SESSION (مع كل الطلاب المسجلين) ────────────

export async function getAttendanceBySession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { session_id: sessionId },
    include: {
      group: { select: { group_id: true, name: true } },
    },
  });

  if (!session) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: {
      group_id: session.group_id,
      registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
    },
    include: {
      student: {
        select: {
          student_id: true,
          first_name: true,
          last_name: true,
          email: true,
          avatar_url: true,
        },
      },
    },
  });

  const attendance = await prisma.attendance.findMany({
    where: { session_id: sessionId },
  });

  const attendanceMap = new Map(attendance.map((a) => [a.student_id, a]));

  const students = enrollments.map((enr) => {
    const record = attendanceMap.get(enr.student_id);
    return {
      student_id: enr.student_id,
      first_name: enr.student.first_name,
      last_name: enr.student.last_name,
      email: enr.student.email,
      avatar_url: enr.student.avatar_url,
      attendance_id: record?.attendance_id ?? null,
      status: record?.status ?? null,
      attended_at: record?.attended_at ?? null,
    };
  });

  return {
    session_id: sessionId,
    session_date: session.session_date,
    end_time: session.end_time,
    topic: session.topic,
    group: session.group,
    total_students: enrollments.length,
    marked_count: attendance.length,
    unmarked_count: enrollments.length - attendance.length,
    students,
  };
}

// ─── GET BY STUDENT ──────────────────────────────────────

export async function getAttendanceByStudent(studentId: string) {
  return prisma.attendance.findMany({
    where: { student_id: studentId },
    include: {
      session: {
        include: {
          group: { select: { group_id: true, name: true } },
        },
      },
    },
    orderBy: { session: { session_date: "desc" } },
  });
}

// ─── GET BY DATE (حضور يوم معين لمجموعة) ────────────────

export async function getAttendanceByDate(groupId: string, date: string) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const sessions = await prisma.session.findMany({
    where: {
      group_id: groupId,
      session_date: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      attendance: {
        include: {
          student: {
            select: {
              student_id: true,
              first_name: true,
              last_name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      },
    },
    orderBy: { session_date: "asc" },
  });

  return {
    date,
    group_id: groupId,
    sessions: sessions.map((session) => ({
      session_id: session.session_id,
      session_date: session.session_date,
      end_time: session.end_time,
      topic: session.topic,
      attendance: session.attendance.map((a) => ({
        attendance_id: a.attendance_id,
        student: a.student,
        status: a.status,
        attended_at: a.attended_at,
      })),
    })),
  };
}

// ─── STUDENT SUMMARY (ملخص + نسبة الحضور) ───────────────

export async function getStudentAttendanceSummary(
  studentId: string,
  groupId?: string,
) {
  const enrollmentWhere: any = {
    student_id: studentId,
    registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
  };
  if (groupId) enrollmentWhere.group_id = groupId;

  const enrollments = await prisma.enrollment.findMany({
    where: enrollmentWhere,
    include: {
      group: {
        include: {
          sessions: {
            select: { session_id: true, session_date: true, topic: true },
            orderBy: { session_date: "asc" },
          },
          course: { select: { course_name: true, course_code: true } },
        },
      },
    },
  });

  const summaries = await Promise.all(
    enrollments
      .filter((enr) => enr.group)
      .map(async (enr) => {
        const group = enr.group!;
        const totalSessions = group.sessions.length;
        const sessionIds = group.sessions.map((s) => s.session_id);

        const records = await prisma.attendance.findMany({
          where: {
            student_id: studentId,
            session_id: { in: sessionIds },
          },
        });

        const present = records.filter((a) => a.status === "PRESENT").length;
        const absent = records.filter((a) => a.status === "ABSENT").length;
        const unmarked = totalSessions - records.length;
        const percentage =
          totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0;

        return {
          group_id: group.group_id,
          group_name: group.name,
          course_name: group.course?.course_name,
          course_code: group.course?.course_code,
          total_sessions: totalSessions,
          present,
          absent,
          unmarked,
          attendance_percentage: percentage,
          records: records.map((a) => {
            const session = group.sessions.find(
              (s) => s.session_id === a.session_id,
            );
            return {
              session_id: a.session_id,
              session_date: session?.session_date,
              topic: session?.topic,
              status: a.status,
              attended_at: a.attended_at,
            };
          }),
        };
      }),
  );

  const totalSessions = summaries.reduce((s, g) => s + g.total_sessions, 0);
  const totalPresent = summaries.reduce((s, g) => s + g.present, 0);

  return {
    student_id: studentId,
    groups: summaries,
    overall: {
      total_sessions: totalSessions,
      total_present: totalPresent,
      total_absent: summaries.reduce((s, g) => s + g.absent, 0),
      overall_percentage:
        totalSessions > 0
          ? Math.round((totalPresent / totalSessions) * 100)
          : 0,
    },
  };
}

// ─── UPDATE ──────────────────────────────────────────────

export async function updateAttendance(attendanceId: string, status: string) {
  if (!status) return { error: "validation" as const };

  if (!Object.values(AttendanceStatus).includes(status as AttendanceStatus)) {
    return { error: "invalid_status" as const };
  }

  const attendance = await prisma.attendance.update({
    where: { attendance_id: attendanceId },
    data: {
      status: status as AttendanceStatus,
      attended_at: new Date(),
    },
  });

  emitToAdminLevel("attendance:updated", {
    attendance_id: attendanceId,
    status,
  });

  return { data: attendance };
}
