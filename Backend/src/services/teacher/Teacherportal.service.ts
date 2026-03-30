// ================================================================
// 📦 src/services/teacherPortal.service.ts
// ✅ Teacher-facing business logic (teacher sees THEIR OWN groups)
// 🔌 Socket.IO realtime events included
// Profile, Dashboard, Groups, Sessions, Attendance, Exams, Results,
// Student views, Group stats, Announcements, Schedule, Rooms
// ================================================================

import { prisma } from "../../prisma/client";
import { JwtUser } from "../../middlewares/auth.middleware";
import { AttendanceStatus } from "../../../generated/prisma/client";
import { uploadToCloudinary } from "../../middlewares/uploadToCloudinary";
import {
  emitToAdminLevel,
  emitToUser,
  emitToGroup,
  triggerDashboardRefresh,
} from "../socket.service";

// ─── Helpers ─────────────────────────────────────────────
async function getTeacherFromUser(user: JwtUser) {
  const dbUser = await prisma.user.findUnique({
    where: { user_id: user.user_id },
    include: { teacher: true },
  });
  return dbUser?.teacher ?? null;
}

async function verifyTeacherOwnsGroup(teacherId: string, groupId: string) {
  return prisma.group.findFirst({
    where: { group_id: groupId, teacher_id: teacherId },
    include: {
      course: true,
      _count: {
        select: {
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
          },
          sessions: true,
        },
      },
    },
  });
}

async function verifyTeacherOwnsSession(teacherId: string, sessionId: string) {
  return prisma.session.findFirst({
    where: { session_id: sessionId, group: { teacher_id: teacherId } },
    include: { group: true },
  });
}

async function verifyTeacherOwnsCourse(teacherId: string, courseId: string) {
  return prisma.group.findFirst({
    where: { teacher_id: teacherId, course_id: courseId },
  });
}

// ══════════════════════════════════════════════
// 1. PROFILE
// ══════════════════════════════════════════════

export async function getProfile(user: JwtUser) {
  const dbUser = await prisma.user.findUnique({
    where: { user_id: user.user_id },
  });

  if (!dbUser?.teacher_id) return null;

  const teacher = await prisma.teacher.findUnique({
    where: { teacher_id: dbUser.teacher_id },
  });

  if (!teacher) return null;

  const [groupCount, sessionCount, examCount] = await Promise.all([
    prisma.group.count({ where: { teacher_id: teacher.teacher_id } }),
    prisma.session.count({
      where: { group: { teacher_id: teacher.teacher_id } },
    }),
    prisma.exam.count({
      where: {
        course: { groups: { some: { teacher_id: teacher.teacher_id } } },
      },
    }),
  ]);

  return {
    user_id: dbUser.user_id,
    first_name: teacher.first_name,
    last_name: teacher.last_name,
    email: teacher.email ?? dbUser.email,
    phone: teacher.phone_number ?? null,
    avatar_url: null,
    google_avatar: dbUser.google_avatar ?? null,
    created_at: dbUser.created_at,
    role: { role_id: dbUser.role, role_name: dbUser.role },
    teacher: { teacher_id: teacher.teacher_id },
    _count: { groups: groupCount, sessions: sessionCount, exams: examCount },
  };
}

export async function updateProfile(
  user: JwtUser,
  body: { first_name?: string; last_name?: string; phone?: string | null },
) {
  const { first_name, last_name, phone } = body;

  const dbUser = await prisma.user.findUnique({
    where: { user_id: user.user_id },
    select: { teacher_id: true },
  });

  if (!dbUser?.teacher_id) {
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };
  }

  const teacherUpdateData: {
    first_name?: string;
    last_name?: string;
    phone_number?: string | null;
  } = {};

  if (first_name !== undefined) teacherUpdateData.first_name = first_name;
  if (last_name !== undefined) teacherUpdateData.last_name = last_name;
  if (phone !== undefined) teacherUpdateData.phone_number = phone;

  if (Object.keys(teacherUpdateData).length > 0) {
    await prisma.teacher.update({
      where: { teacher_id: dbUser.teacher_id },
      data: teacherUpdateData,
    });
  }

  return getProfile(user);
}

export async function updateAvatar(user: JwtUser, file: Express.Multer.File) {
  const result = await uploadToCloudinary(
    file,
    `avatars/teachers/${user.user_id}`,
  );
  await prisma.user.update({
    where: { user_id: user.user_id },
    data: { google_avatar: result.secure_url },
  });
  return { data: { avatar: result.secure_url } };
}

// ══════════════════════════════════════════════
// 2. DASHBOARD
// ══════════════════════════════════════════════

export async function getDashboard(user: JwtUser) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher) return null;

  const groups = await prisma.group.findMany({
    where: { teacher_id: teacher.teacher_id },
    include: {
      course: true,
      department: true,
      _count: {
        select: {
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
          },
          sessions: true,
        },
      },
    },
  });

  const totalStudents = groups.reduce((s, g) => s + g._count.enrollments, 0);
  const totalSessions = groups.reduce((s, g) => s + g._count.sessions, 0);

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // ✅ بداية اليوم الحالي (00:00:00) لإظهار كل حصص اليوم
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  // ✅ نهاية أمس (لتجنب تكرار حصص اليوم في recent)
  const yesterday = new Date(dayStart);
  yesterday.setSeconds(-1);

  const [upcomingSessions, recentSessions] = await Promise.all([
    // upcoming = من بداية اليوم → نهاية الأسبوع (يشمل كل حصص اليوم)
    prisma.session.findMany({
      where: {
        group: { teacher_id: teacher.teacher_id },
        session_date: { gte: dayStart, lte: nextWeek },
      },
      include: {
        group: { include: { course: true } },
        room: true,
        _count: { select: { attendance: true } },
      },
      orderBy: { session_date: "asc" },
      take: 20,
    }),
    // recent = الأسبوع الماضي حتى أمس (لا تكرار حصص اليوم)
    prisma.session.findMany({
      where: {
        group: { teacher_id: teacher.teacher_id },
        session_date: { gte: lastWeek, lte: yesterday },
      },
      include: {
        group: { include: { course: true } },
        room: true,
        _count: { select: { attendance: true } },
      },
      orderBy: { session_date: "desc" },
      take: 5,
    }),
  ]);

  // Attendance rate
  const allSessionIds = await prisma.session.findMany({
    where: { group: { teacher_id: teacher.teacher_id } },
    select: { session_id: true },
  });
  const sessionIds = allSessionIds.map((s) => s.session_id);
  let attendanceRate = 0;
  if (sessionIds.length > 0) {
    const stats = await prisma.attendance.groupBy({
      by: ["status"],
      where: { session_id: { in: sessionIds } },
      _count: { status: true },
    });
    const present =
      stats.find((a) => a.status === "PRESENT")?._count.status || 0;
    const total = stats.reduce((s, a) => s + a._count.status, 0);
    attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
  }

  // Upcoming exams
  const courseIds = [...new Set(groups.map((g) => g.course.course_id))];
  const upcomingExams = await prisma.exam.findMany({
    where: { course_id: { in: courseIds }, exam_date: { gte: now } },
    include: { course: true },
    orderBy: { exam_date: "asc" },
    take: 5,
  });

  // Live session detection — يفحص في upcomingSessions (يشمل اليوم)
  const liveSession = upcomingSessions.find((s) => {
    const start = new Date(s.session_date);
    const end = s.end_time
      ? new Date(s.end_time)
      : new Date(start.getTime() + 90 * 60000);
    return now >= start && now <= end;
  });

  return {
    teacher: {
      teacher_id: teacher.teacher_id,
      first_name: teacher.first_name,
      last_name: teacher.last_name,
    },
    stats: {
      total_groups: groups.length,
      total_students: totalStudents,
      total_sessions: totalSessions,
      attendance_rate: attendanceRate,
    },
    groups: groups.map((g) => ({
      group_id: g.group_id,
      name: g.name,
      level: g.level,
      status: g.status,
      course_name: g.course.course_name,
      department_name: g.department?.name ?? null,
      student_count: g._count.enrollments,
      session_count: g._count.sessions,
    })),
    upcoming_sessions: upcomingSessions,
    recent_sessions: recentSessions,
    upcoming_exams: upcomingExams,
    live_session: liveSession || null,
  };
}

// ══════════════════════════════════════════════
// 3. ASSIGNED GROUPS
// ══════════════════════════════════════════════

export async function getAssignedGroups(user: JwtUser) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher) return null;

  const groups = await prisma.group.findMany({
    where: { teacher_id: teacher.teacher_id },
    include: {
      course: true,
      department: true,
      _count: {
        select: {
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
          },
          sessions: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return groups.map((g) => ({
    ...g,
    student_count: g._count.enrollments,
    session_count: g._count.sessions,
  }));
}

export async function getGroupStudents(user: JwtUser, groupId: string) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };

  const group = await verifyTeacherOwnsGroup(teacher.teacher_id, groupId);
  if (!group)
    return {
      error: "forbidden" as const,
      message: "You are not assigned to this group",
    };

  const enrollments = await prisma.enrollment.findMany({
    where: {
      group_id: groupId,
      registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
    },
    include: {
      student: { include: { user: { select: { google_avatar: true } } } },
    },
    orderBy: { student: { first_name: "asc" } },
  });

  const sessions = await prisma.session.findMany({
    where: { group_id: groupId },
    select: { session_id: true },
  });
  const sessionIds = sessions.map((s) => s.session_id);

  const students = await Promise.all(
    enrollments.map(async (e) => {
      let attendance = { total: 0, present: 0, absent: 0, rate: 0 };
      if (sessionIds.length > 0) {
        const records = await prisma.attendance.findMany({
          where: {
            student_id: e.student.student_id,
            session_id: { in: sessionIds },
          },
        });
        const present = records.filter((a) => a.status === "PRESENT").length;
        attendance = {
          total: records.length,
          present,
          absent: records.length - present,
          rate:
            records.length > 0
              ? Math.round((present / records.length) * 100)
              : 0,
        };
      }
      return {
        student_id: e.student.student_id,
        first_name: e.student.first_name,
        last_name: e.student.last_name,
        email: e.student.email,
        avatar_url: e.student.avatar_url,
        google_avatar: e.student.user?.google_avatar,
        enrollment_status: e.registration_status,
        attendance,
      };
    }),
  );

  return { data: { group_id: groupId, group_name: group.name, students } };
}

export async function getGroupDetails(user: JwtUser, groupId: string) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };

  const group = await prisma.group.findFirst({
    where: { group_id: groupId, teacher_id: teacher.teacher_id },
    include: {
      course: {
        select: {
          course_id: true,
          course_name: true,
          course_code: true,
          credits: true,
        },
      },
      department: { select: { department_id: true, name: true } },
      enrollments: {
        where: {
          registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
        },
        include: {
          student: { include: { user: { select: { google_avatar: true } } } },
        },
      },
      sessions: {
        orderBy: { session_date: "desc" },
        take: 10,
        include: { room: true, _count: { select: { attendance: true } } },
      },
      _count: {
        select: {
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
          },
          sessions: true,
        },
      },
    },
  });

  if (!group)
    return {
      error: "forbidden" as const,
      message: "Group not found or you are not assigned to it",
    };

  const allSessions = await prisma.session.findMany({
    where: { group_id: groupId },
    include: { attendance: true },
  });
  const totalRecords = allSessions.reduce(
    (s, ses) => s + ses.attendance.length,
    0,
  );
  const presentCount = allSessions.reduce(
    (s, ses) => s + ses.attendance.filter((a) => a.status === "PRESENT").length,
    0,
  );
  const attendanceRate =
    totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  return {
    data: {
      ...group,
      student_count: group._count.enrollments,
      session_count: group._count.sessions,
      students: group.enrollments.map((e) => ({
        ...e.student,
        avatar: e.student.user?.google_avatar || e.student.avatar_url,
        enrollment_status: e.registration_status,
      })),
      stats: {
        attendance_rate: attendanceRate,
        total_sessions: allSessions.length,
        total_attendance_records: totalRecords,
        present_count: presentCount,
      },
    },
  };
}

// ══════════════════════════════════════════════
// 4. SESSIONS
// ══════════════════════════════════════════════

export async function getSessions(user: JwtUser, groupIdFilter?: string) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher) return null;

  const where: any = { group: { teacher_id: teacher.teacher_id } };
  if (groupIdFilter) where.group_id = groupIdFilter;

  const sessions = await prisma.session.findMany({
    where,
    include: {
      group: {
        include: {
          course: {
            select: { course_id: true, course_name: true, course_code: true },
          },
        },
      },
      room: true,
      _count: { select: { attendance: true } },
    },
    orderBy: { session_date: "desc" },
  });

  return Promise.all(
    sessions.map(async (session) => {
      const enrolledCount = await prisma.enrollment.count({
        where: {
          group_id: session.group_id,
          registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
        },
      });
      return {
        ...session,
        enrolled_students: enrolledCount,
        attendance_taken: session._count.attendance,
        attendance_complete: session._count.attendance >= enrolledCount,
      };
    }),
  );
}

export async function createSession(
  user: JwtUser,
  data: {
    group_id: string;
    session_date: string;
    end_time?: string;
    topic?: string;
  },
) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };
  if (!data.group_id || !data.session_date)
    return {
      error: "validation" as const,
      message: "group_id and session_date are required",
    };

  const group = await verifyTeacherOwnsGroup(teacher.teacher_id, data.group_id);
  if (!group)
    return {
      error: "forbidden" as const,
      message: "You are not assigned to this group",
    };

  const startDate = new Date(data.session_date);
  let endDate: Date | null = null;
  if (data.end_time) {
    endDate = new Date(data.end_time);
    if (endDate <= startDate)
      return {
        error: "validation" as const,
        message: "وقت الانتهاء يجب أن يكون بعد وقت البداية",
      };
  }

  const session = await prisma.session.create({
    data: {
      group_id: data.group_id,
      session_date: startDate,
      end_time: endDate,
      topic: data.topic || null,
    },
    include: { group: { include: { course: true } }, room: true },
  });

  emitToAdminLevel("session:created", {
    session_id: session.session_id,
    group_id: data.group_id,
    group_name: group.name,
    teacher_name: `${teacher.first_name} ${teacher.last_name}`,
    session_date: session.session_date,
    topic: session.topic,
  });
  emitToGroup(data.group_id, "session:created", {
    session_id: session.session_id,
    session_date: session.session_date,
    end_time: session.end_time,
    topic: session.topic,
    group_name: group.name,
    course_name: group.course.course_name,
  });

  return { data: session };
}

export async function updateSession(
  user: JwtUser,
  sessionId: string,
  data: { session_date?: string; end_time?: string; topic?: string },
) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };

  const session = await verifyTeacherOwnsSession(teacher.teacher_id, sessionId);
  if (!session)
    return {
      error: "forbidden" as const,
      message: "You don't have access to this session",
    };

  const effectiveStart = data.session_date
    ? new Date(data.session_date)
    : session.session_date;
  let effectiveEnd: Date | null | undefined = undefined;
  if (data.end_time !== undefined) {
    effectiveEnd = data.end_time ? new Date(data.end_time) : null;
    if (effectiveEnd && effectiveEnd <= effectiveStart)
      return {
        error: "validation" as const,
        message: "وقت الانتهاء يجب أن يكون بعد وقت البداية",
      };
  }

  const updated = await prisma.session.update({
    where: { session_id: sessionId },
    data: {
      session_date: data.session_date ? new Date(data.session_date) : undefined,
      end_time: effectiveEnd,
      topic: data.topic !== undefined ? data.topic : undefined,
    },
    include: { group: { include: { course: true } }, room: true },
  });

  emitToGroup(session.group_id!, "session:updated", {
    session_id: sessionId,
    session_date: updated.session_date,
    end_time: updated.end_time,
    topic: updated.topic,
  });

  return { data: updated };
}

export async function deleteSession(user: JwtUser, sessionId: string) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };

  const session = await verifyTeacherOwnsSession(teacher.teacher_id, sessionId);
  if (!session)
    return {
      error: "forbidden" as const,
      message: "You don't have access to this session",
    };

  const count = await prisma.attendance.count({
    where: { session_id: sessionId },
  });
  if (count > 0)
    return {
      error: "bad_request" as const,
      message: "Cannot delete session with attendance records",
    };

  await prisma.session.delete({ where: { session_id: sessionId } });

  emitToGroup(session.group_id!, "session:deleted", {
    session_id: sessionId,
    session_date: session.session_date,
  });
  emitToAdminLevel("session:deleted", {
    session_id: sessionId,
    group_name: session.group?.name,
    teacher_name: `${teacher.first_name} ${teacher.last_name}`,
  });

  return { data: { message: "Session deleted successfully" } };
}

// ══════════════════════════════════════════════
// 5. ATTENDANCE
// ══════════════════════════════════════════════

export async function getSessionAttendance(user: JwtUser, sessionId: string) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };

  const session = await verifyTeacherOwnsSession(teacher.teacher_id, sessionId);
  if (!session)
    return {
      error: "forbidden" as const,
      message: "You don't have access to this session",
    };

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
    orderBy: { student: { first_name: "asc" } },
  });

  const attendance = await prisma.attendance.findMany({
    where: { session_id: sessionId },
  });
  const map = new Map(attendance.map((a) => [a.student_id, a]));

  const students = enrollments.map((e) => {
    const record = map.get(e.student.student_id);
    return {
      student: e.student,
      attendance_id: record?.attendance_id ?? null,
      status: record?.status ?? null,
    };
  });

  return {
    data: {
      session_id: sessionId,
      session_date: session.session_date,
      end_time: session.end_time,
      topic: session.topic,
      group_name: session.group?.name,
      total_students: enrollments.length,
      marked_count: attendance.length,
      students,
    },
  };
}

export async function markAttendance(
  user: JwtUser,
  sessionId: string,
  studentId: string,
  status: AttendanceStatus,
) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };
  if (!studentId || !status)
    return {
      error: "validation" as const,
      message: "student_id and status are required",
    };
  if (!Object.values(AttendanceStatus).includes(status))
    return {
      error: "validation" as const,
      message: "Invalid attendance status",
    };

  const session = await verifyTeacherOwnsSession(teacher.teacher_id, sessionId);
  if (!session)
    return {
      error: "forbidden" as const,
      message: "You don't have access to this session",
    };

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      student_id: studentId,
      group_id: session.group_id,
      registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
    },
  });
  if (!enrollment)
    return {
      error: "bad_request" as const,
      message: "Student is not enrolled in this group",
    };

  const record = await prisma.attendance.upsert({
    where: {
      session_id_student_id: { session_id: sessionId, student_id: studentId },
    },
    update: { status },
    create: { session_id: sessionId, student_id: studentId, status },
  });

  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
  });
  if (student?.user_id)
    emitToUser(student.user_id, "attendance:marked", {
      session_id: sessionId,
      status,
      session_date: session.session_date,
      group_name: session.group?.name,
    });
  emitToAdminLevel("attendance:marked", {
    session_id: sessionId,
    student_id: studentId,
    status,
    teacher_name: `${teacher.first_name} ${teacher.last_name}`,
  });

  return { data: record };
}

export async function markBulkAttendance(
  user: JwtUser,
  sessionId: string,
  records: { student_id: string; status: AttendanceStatus }[],
) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };
  if (!Array.isArray(records) || records.length === 0)
    return {
      error: "validation" as const,
      message: "records array is required",
    };

  const session = await verifyTeacherOwnsSession(teacher.teacher_id, sessionId);
  if (!session)
    return {
      error: "forbidden" as const,
      message: "You don't have access to this session",
    };

  const invalid = records.filter(
    (r) => !Object.values(AttendanceStatus).includes(r.status),
  );
  if (invalid.length > 0)
    return {
      error: "validation" as const,
      message: "Invalid attendance status in records",
      invalid,
    };

  const results = await prisma.$transaction(
    records.map((r) =>
      prisma.attendance.upsert({
        where: {
          session_id_student_id: {
            session_id: sessionId,
            student_id: r.student_id,
          },
        },
        update: { status: r.status },
        create: {
          session_id: sessionId,
          student_id: r.student_id,
          status: r.status,
        },
      }),
    ),
  );

  const studentUsers = await prisma.student.findMany({
    where: { student_id: { in: records.map((r) => r.student_id) } },
    select: { student_id: true, user_id: true },
  });
  const userMap = new Map(studentUsers.map((s) => [s.student_id, s.user_id]));
  for (const r of records) {
    const uid = userMap.get(r.student_id);
    if (uid)
      emitToUser(uid, "attendance:marked", {
        session_id: sessionId,
        status: r.status,
        session_date: session.session_date,
        group_name: session.group?.name,
      });
  }
  emitToAdminLevel("attendance:bulkMarked", {
    session_id: sessionId,
    group_name: session.group?.name,
    count: results.length,
    teacher_name: `${teacher.first_name} ${teacher.last_name}`,
  });
  emitToGroup(session.group_id!, "attendance:updated", {
    session_id: sessionId,
    marked_count: results.length,
  });

  return {
    data: {
      message: `Attendance recorded for ${results.length} students`,
      count: results.length,
    },
  };
}

// ══════════════════════════════════════════════
// 6. EXAMS
// ══════════════════════════════════════════════

export async function getExams(user: JwtUser) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher) return null;

  const groups = await prisma.group.findMany({
    where: { teacher_id: teacher.teacher_id },
    select: { course_id: true },
  });
  const courseIds = [...new Set(groups.map((g) => g.course_id))];
  if (courseIds.length === 0) return [];

  return prisma.exam.findMany({
    where: { course_id: { in: courseIds } },
    include: { course: true, _count: { select: { results: true } } },
    orderBy: { exam_date: "desc" },
  });
}

export async function createExam(
  user: JwtUser,
  data: {
    course_id: string;
    exam_name?: string;
    exam_date: string;
    max_marks: number;
  },
) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };
  if (!data.course_id || !data.exam_date || !data.max_marks)
    return {
      error: "validation" as const,
      message: "course_id, exam_date and max_marks are required",
    };
  if (data.max_marks <= 0)
    return {
      error: "validation" as const,
      message: "max_marks must be greater than 0",
    };

  const group = await verifyTeacherOwnsCourse(
    teacher.teacher_id,
    data.course_id,
  );
  if (!group)
    return {
      error: "forbidden" as const,
      message: "You are not assigned to any group in this course",
    };

  const exam = await prisma.exam.create({
    data: {
      course_id: data.course_id,
      exam_name: data.exam_name || null,
      exam_date: new Date(data.exam_date),
      max_marks: data.max_marks,
    },
    include: { course: true },
  });

  emitToAdminLevel("exam:created", {
    exam_id: exam.exam_id,
    exam_name: exam.exam_name,
    course_name: exam.course.course_name,
    exam_date: exam.exam_date,
    teacher_name: `${teacher.first_name} ${teacher.last_name}`,
  });

  return { data: exam };
}

export async function updateExam(
  user: JwtUser,
  examId: string,
  data: { exam_name?: string; exam_date?: string; max_marks?: number },
) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };

  const exam = await prisma.exam.findUnique({
    where: { exam_id: examId },
    include: { results: true },
  });
  if (!exam) return { error: "not_found" as const, message: "Exam not found" };

  const group = await verifyTeacherOwnsCourse(
    teacher.teacher_id,
    exam.course_id,
  );
  if (!group)
    return {
      error: "forbidden" as const,
      message: "You are not assigned to this course",
    };
  if (exam.results.length > 0)
    return {
      error: "bad_request" as const,
      message: "Cannot update exam after results are added",
    };

  const updated = await prisma.exam.update({
    where: { exam_id: examId },
    data: {
      exam_name: data.exam_name ?? undefined,
      exam_date: data.exam_date ? new Date(data.exam_date) : undefined,
      max_marks: data.max_marks ?? undefined,
    },
  });

  emitToAdminLevel("exam:updated", {
    exam_id: examId,
    exam_name: updated.exam_name,
    exam_date: updated.exam_date,
  });

  return { data: updated };
}

export async function deleteExam(user: JwtUser, examId: string) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };

  const exam = await prisma.exam.findUnique({
    where: { exam_id: examId },
    include: { results: true, course: true },
  });
  if (!exam) return { error: "not_found" as const, message: "Exam not found" };

  const group = await verifyTeacherOwnsCourse(
    teacher.teacher_id,
    exam.course_id,
  );
  if (!group)
    return {
      error: "forbidden" as const,
      message: "You are not assigned to this course",
    };
  if (exam.results.length > 0)
    return {
      error: "bad_request" as const,
      message: "Cannot delete exam with existing results",
    };

  await prisma.exam.delete({ where: { exam_id: examId } });

  emitToAdminLevel("exam:deleted", {
    exam_id: examId,
    exam_name: exam.exam_name,
    course_name: exam.course.course_name,
  });

  return { data: { message: "Exam deleted successfully" } };
}

// ══════════════════════════════════════════════
// 7. RESULTS
// ══════════════════════════════════════════════

export async function getExamResults(user: JwtUser, examId: string) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };

  const exam = await prisma.exam.findUnique({
    where: { exam_id: examId },
    include: { course: true },
  });
  if (!exam) return { error: "not_found" as const, message: "Exam not found" };

  const group = await verifyTeacherOwnsCourse(
    teacher.teacher_id,
    exam.course_id,
  );
  if (!group)
    return {
      error: "forbidden" as const,
      message: "You are not assigned to this course",
    };

  const results = await prisma.result.findMany({
    where: { exam_id: examId },
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
    orderBy: { student: { first_name: "asc" } },
  });

  const avg =
    results.length > 0
      ? Math.round(
          (results.reduce((s, r) => s + r.marks_obtained, 0) / results.length) *
            100,
        ) / 100
      : 0;

  return {
    data: {
      exam,
      results,
      summary: {
        total: results.length,
        average: avg,
        max_marks: exam.max_marks,
      },
    },
  };
}

export async function addExamResult(
  user: JwtUser,
  examId: string,
  data: { student_id: string; marks_obtained: number; grade?: string },
) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };
  if (!data.student_id || data.marks_obtained == null)
    return {
      error: "validation" as const,
      message: "student_id and marks_obtained are required",
    };

  const exam = await prisma.exam.findUnique({
    where: { exam_id: examId },
    include: { course: true },
  });
  if (!exam) return { error: "not_found" as const, message: "Exam not found" };

  const group = await verifyTeacherOwnsCourse(
    teacher.teacher_id,
    exam.course_id,
  );
  if (!group)
    return {
      error: "forbidden" as const,
      message: "You are not assigned to this course",
    };
  if (data.marks_obtained < 0 || data.marks_obtained > exam.max_marks)
    return {
      error: "validation" as const,
      message: `Marks must be between 0 and ${exam.max_marks}`,
    };

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      student_id: data.student_id,
      course_id: exam.course_id,
      registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
    },
  });
  if (!enrollment)
    return {
      error: "bad_request" as const,
      message: "Student is not enrolled in this course",
    };

  const result = await prisma.result.upsert({
    where: {
      exam_id_student_id: { exam_id: examId, student_id: data.student_id },
    },
    update: { marks_obtained: data.marks_obtained, grade: data.grade },
    create: {
      exam_id: examId,
      student_id: data.student_id,
      marks_obtained: data.marks_obtained,
      grade: data.grade,
    },
  });

  const student = await prisma.student.findUnique({
    where: { student_id: data.student_id },
  });
  if (student?.user_id)
    emitToUser(student.user_id, "result:added", {
      exam_id: examId,
      exam_name: exam.exam_name,
      course_name: exam.course.course_name,
      marks_obtained: data.marks_obtained,
      max_marks: exam.max_marks,
      grade: data.grade,
    });

  return { data: result };
}

export async function addBulkExamResults(
  user: JwtUser,
  examId: string,
  records: { student_id: string; marks_obtained: number; grade?: string }[],
) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };
  if (!Array.isArray(records) || records.length === 0)
    return {
      error: "validation" as const,
      message: "results array is required",
    };

  const exam = await prisma.exam.findUnique({
    where: { exam_id: examId },
    include: { course: true },
  });
  if (!exam) return { error: "not_found" as const, message: "Exam not found" };

  const group = await verifyTeacherOwnsCourse(
    teacher.teacher_id,
    exam.course_id,
  );
  if (!group)
    return {
      error: "forbidden" as const,
      message: "You are not assigned to this course",
    };

  const invalid = records.filter(
    (r) => r.marks_obtained < 0 || r.marks_obtained > exam.max_marks,
  );
  if (invalid.length > 0)
    return {
      error: "validation" as const,
      message: `Marks must be between 0 and ${exam.max_marks}`,
      invalid,
    };

  const results = await prisma.$transaction(
    records.map((r) =>
      prisma.result.upsert({
        where: {
          exam_id_student_id: { exam_id: examId, student_id: r.student_id },
        },
        update: { marks_obtained: r.marks_obtained, grade: r.grade },
        create: {
          exam_id: examId,
          student_id: r.student_id,
          marks_obtained: r.marks_obtained,
          grade: r.grade,
        },
      }),
    ),
  );

  const studentUsers = await prisma.student.findMany({
    where: { student_id: { in: records.map((r) => r.student_id) } },
    select: { student_id: true, user_id: true },
  });
  const userMap = new Map(studentUsers.map((s) => [s.student_id, s.user_id]));
  for (const r of records) {
    const uid = userMap.get(r.student_id);
    if (uid)
      emitToUser(uid, "result:added", {
        exam_id: examId,
        exam_name: exam.exam_name,
        course_name: exam.course.course_name,
        marks_obtained: r.marks_obtained,
        max_marks: exam.max_marks,
        grade: r.grade,
      });
  }
  emitToAdminLevel("result:bulkAdded", {
    exam_id: examId,
    exam_name: exam.exam_name,
    count: results.length,
    teacher_name: `${teacher.first_name} ${teacher.last_name}`,
  });

  return {
    data: {
      message: `Results saved for ${results.length} students`,
      count: results.length,
    },
  };
}

// ══════════════════════════════════════════════
// 8. STUDENT VIEWS
// ══════════════════════════════════════════════

export async function getStudentAttendance(
  user: JwtUser,
  studentId: string,
  groupIdFilter?: string,
) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };

  const teacherGroups = await prisma.group.findMany({
    where: { teacher_id: teacher.teacher_id },
    select: { group_id: true },
  });
  const teacherGroupIds = teacherGroups.map((g) => g.group_id);
  if (teacherGroupIds.length === 0)
    return {
      error: "forbidden" as const,
      message: "You have no assigned groups",
    };

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      student_id: studentId,
      group_id: { in: teacherGroupIds },
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
  if (!enrollment)
    return {
      error: "forbidden" as const,
      message: "Student is not in any of your groups",
    };

  const sessionFilter: any = { group_id: { in: teacherGroupIds } };
  if (groupIdFilter && typeof groupIdFilter === "string") {
    if (!teacherGroupIds.includes(groupIdFilter))
      return {
        error: "forbidden" as const,
        message: "You are not assigned to this group",
      };
    sessionFilter.group_id = groupIdFilter;
  }

  const sessions = await prisma.session.findMany({
    where: sessionFilter,
    orderBy: { session_date: "desc" },
    include: {
      group: {
        select: {
          group_id: true,
          name: true,
          level: true,
          course: { select: { course_name: true } },
        },
      },
    },
  });
  const attendance = await prisma.attendance.findMany({
    where: {
      student_id: studentId,
      session_id: { in: sessions.map((s) => s.session_id) },
    },
  });
  const attendanceMap = new Map(
    attendance.map((a) => [a.session_id, a.status]),
  );

  const history = sessions.map((s) => ({
    session_id: s.session_id,
    session_date: s.session_date,
    end_time: s.end_time,
    topic: s.topic,
    group: s.group,
    status: attendanceMap.get(s.session_id) || "NOT_RECORDED",
  }));
  const recorded = history.filter((h) => h.status !== "NOT_RECORDED");
  const present = recorded.filter((h) => h.status === "PRESENT").length;
  const absent = recorded.filter((h) => h.status === "ABSENT").length;

  return {
    data: {
      student: enrollment.student,
      summary: {
        total_sessions: history.length,
        recorded: recorded.length,
        present,
        absent,
        not_recorded: history.length - recorded.length,
        attendance_rate:
          recorded.length > 0
            ? Math.round((present / recorded.length) * 100)
            : 0,
      },
      history,
    },
  };
}

export async function getStudentResults(user: JwtUser, studentId: string) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };

  const teacherGroups = await prisma.group.findMany({
    where: { teacher_id: teacher.teacher_id },
    select: { course_id: true, group_id: true },
  });
  const teacherCourseIds = [...new Set(teacherGroups.map((g) => g.course_id))];
  const teacherGroupIds = teacherGroups.map((g) => g.group_id);
  if (teacherCourseIds.length === 0)
    return {
      error: "forbidden" as const,
      message: "You have no assigned courses",
    };

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      student_id: studentId,
      group_id: { in: teacherGroupIds },
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
  if (!enrollment)
    return {
      error: "forbidden" as const,
      message: "Student is not in any of your groups",
    };

  const results = await prisma.result.findMany({
    where: {
      student_id: studentId,
      exam: { course_id: { in: teacherCourseIds } },
    },
    include: {
      exam: {
        include: {
          course: {
            select: { course_id: true, course_name: true, course_code: true },
          },
        },
      },
    },
    orderBy: { exam: { exam_date: "desc" } },
  });

  const totalMarks = results.reduce((s, r) => s + r.marks_obtained, 0);
  const totalMaxMarks = results.reduce((s, r) => s + r.exam.max_marks, 0);

  return {
    data: {
      student: enrollment.student,
      summary: {
        total_exams: results.length,
        total_marks: totalMarks,
        total_max_marks: totalMaxMarks,
        average_percent:
          totalMaxMarks > 0
            ? Math.round((totalMarks / totalMaxMarks) * 100)
            : 0,
      },
      results: results.map((r) => ({
        result_id: r.result_id,
        marks_obtained: r.marks_obtained,
        max_marks: r.exam.max_marks,
        grade: r.grade,
        percent: Math.round((r.marks_obtained / r.exam.max_marks) * 100),
        exam: {
          exam_id: r.exam.exam_id,
          exam_name: r.exam.exam_name,
          exam_date: r.exam.exam_date,
          course: r.exam.course,
        },
      })),
    },
  };
}

// ══════════════════════════════════════════════
// 9. GROUP STATS
// ══════════════════════════════════════════════

export async function getGroupStats(user: JwtUser, groupId: string) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher)
    return {
      error: "not_found" as const,
      message: "Teacher profile not found",
    };

  const group = await prisma.group.findFirst({
    where: { group_id: groupId, teacher_id: teacher.teacher_id },
    include: { course: { select: { course_id: true, course_name: true } } },
  });
  if (!group)
    return {
      error: "forbidden" as const,
      message: "Group not found or you are not assigned to it",
    };

  const studentCount = await prisma.enrollment.count({
    where: {
      group_id: groupId,
      registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
    },
  });
  const sessions = await prisma.session.findMany({
    where: { group_id: groupId },
    include: { attendance: true },
    orderBy: { session_date: "asc" },
  });

  const totalSessions = sessions.length;
  const pastSessions = sessions.filter(
    (s) => s.session_date <= new Date(),
  ).length;
  const upcomingSessions = totalSessions - pastSessions;
  const totalRecords = sessions.reduce(
    (s, ses) => s + ses.attendance.length,
    0,
  );
  const presentCount = sessions.reduce(
    (s, ses) => s + ses.attendance.filter((a) => a.status === "PRESENT").length,
    0,
  );
  const absentCount = totalRecords - presentCount;
  const attendanceRate =
    totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  const attendanceBySession = sessions
    .filter((s) => s.attendance.length > 0)
    .map((s) => {
      const p = s.attendance.filter((a) => a.status === "PRESENT").length;
      return {
        session_id: s.session_id,
        date: s.session_date,
        end_time: s.end_time,
        topic: s.topic,
        total: s.attendance.length,
        present: p,
        absent: s.attendance.length - p,
        rate: Math.round((p / s.attendance.length) * 100),
      };
    });

  const exams = await prisma.exam.findMany({
    where: { course_id: group.course_id },
    include: {
      results: {
        where: {
          student: {
            enrollments: {
              some: {
                group_id: groupId,
                registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
              },
            },
          },
        },
      },
    },
    orderBy: { exam_date: "desc" },
  });

  const examStats = exams.map((exam) => {
    const marks = exam.results.map((r) => r.marks_obtained);
    const avg =
      marks.length > 0
        ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length)
        : 0;
    const passCount = marks.filter((m) => m >= exam.max_marks * 0.5).length;
    return {
      exam_id: exam.exam_id,
      exam_name: exam.exam_name,
      exam_date: exam.exam_date,
      max_marks: exam.max_marks,
      students_graded: marks.length,
      average: avg,
      average_percent:
        exam.max_marks > 0 ? Math.round((avg / exam.max_marks) * 100) : 0,
      highest: marks.length > 0 ? Math.max(...marks) : 0,
      lowest: marks.length > 0 ? Math.min(...marks) : 0,
      pass_rate:
        marks.length > 0 ? Math.round((passCount / marks.length) * 100) : 0,
    };
  });

  const studentAbsences = await prisma.attendance.groupBy({
    by: ["student_id"],
    where: { status: "ABSENT", session: { group_id: groupId } },
    _count: { student_id: true },
    orderBy: { _count: { student_id: "desc" } },
    take: 5,
  });
  const absentStudentIds = studentAbsences.map((s) => s.student_id);
  const absentStudents =
    absentStudentIds.length > 0
      ? await prisma.student.findMany({
          where: { student_id: { in: absentStudentIds } },
          select: {
            student_id: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        })
      : [];
  const mostAbsent = studentAbsences.map((sa) => ({
    student: absentStudents.find((s) => s.student_id === sa.student_id),
    absences: sa._count.student_id,
  }));

  return {
    data: {
      group: {
        group_id: group.group_id,
        name: group.name,
        level: group.level,
        status: group.status,
        max_students: group.max_students,
        course: group.course,
      },
      overview: {
        student_count: studentCount,
        capacity: group.max_students,
        fill_rate:
          group.max_students > 0
            ? Math.round((studentCount / group.max_students) * 100)
            : 0,
        total_sessions: totalSessions,
        past_sessions: pastSessions,
        upcoming_sessions: upcomingSessions,
      },
      attendance: {
        rate: attendanceRate,
        present: presentCount,
        absent: absentCount,
        total_records: totalRecords,
        by_session: attendanceBySession,
      },
      exams: examStats,
      most_absent: mostAbsent,
    },
  };
}

// ══════════════════════════════════════════════
// 10. ANNOUNCEMENTS
// ══════════════════════════════════════════════

export async function getAnnouncements(opts: {
  page?: number;
  limit?: number;
  category?: string;
}) {
  const page = opts.page || 1;
  const limit = opts.limit || 10;
  const where: any = { is_published: true };
  if (opts.category && opts.category !== "all") where.category = opts.category;

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { published_at: "desc" },
      select: {
        announcement_id: true,
        title: true,
        title_ar: true,
        excerpt: true,
        excerpt_ar: true,
        category: true,
        image_url: true,
        published_at: true,
      },
    }),
    prisma.announcement.count({ where }),
  ]);

  return {
    data: announcements,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getAnnouncementById(announcementId: string) {
  return prisma.announcement.findFirst({
    where: { announcement_id: announcementId, is_published: true },
  });
}

// ══════════════════════════════════════════════
// 11. SCHEDULE
// ══════════════════════════════════════════════

export async function getSchedule(user: JwtUser, days?: number) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher) return null;

  const d = days || 30;
  const now = new Date();
  const futureDate = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  const sessions = await prisma.session.findMany({
    where: {
      group: { teacher_id: teacher.teacher_id },
      session_date: { gte: now, lte: futureDate },
    },
    include: {
      group: {
        include: {
          course: {
            select: { course_id: true, course_name: true, course_code: true },
          },
        },
      },
      room: true,
    },
    orderBy: { session_date: "asc" },
  });

  const byDate: Record<string, typeof sessions> = {};
  sessions.forEach((s) => {
    const key = s.session_date.toISOString().split("T")[0];
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(s);
  });

  return { total: sessions.length, sessions, by_date: byDate };
}

// ══════════════════════════════════════════════
// 12. ROOMS OVERVIEW
// ══════════════════════════════════════════════

export async function getRoomsOverview(user: JwtUser, date?: string) {
  const teacher = await getTeacherFromUser(user);
  if (!teacher) return { error: "forbidden" as const, message: "غير مصرح لك" };

  const targetDate = date ? new Date(date) : new Date();
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const rooms = await prisma.room.findMany({
    where: { is_active: true },
    include: {
      sessions: {
        where: { session_date: { gte: dayStart, lte: dayEnd } },
        orderBy: { session_date: "asc" },
        include: {
          group: {
            include: {
              course: {
                select: {
                  course_id: true,
                  course_name: true,
                  course_code: true,
                },
              },
              teacher: {
                select: { teacher_id: true, first_name: true, last_name: true },
              },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const now = new Date();
  const overview = rooms.map((room) => ({
    room_id: room.room_id,
    name: room.name,
    capacity: room.capacity,
    location: room.location,
    sessions_count: room.sessions.length,
    sessions: room.sessions.map((s) => ({
      session_id: s.session_id,
      session_date: s.session_date,
      end_time: s.end_time,
      topic: s.topic,
      group_name: s.group.name,
      course_name: s.group.course.course_name,
      course_code: s.group.course.course_code,
      teacher_name: s.group.teacher
        ? `${s.group.teacher.first_name} ${s.group.teacher.last_name}`
        : null,
      is_mine: s.group.teacher?.teacher_id === teacher.teacher_id,
    })),
    is_occupied: room.sessions.some((s) => {
      const start = new Date(s.session_date);
      const end = s.end_time
        ? new Date(s.end_time)
        : new Date(start.getTime() + 90 * 60000);
      return now >= start && now <= end;
    }),
  }));

  return {
    data: {
      date: targetDate.toISOString().split("T")[0],
      total_rooms: rooms.length,
      occupied_now: overview.filter((r) => r.is_occupied).length,
      free_now: overview.filter((r) => !r.is_occupied).length,
      rooms: overview,
    },
  };
}
