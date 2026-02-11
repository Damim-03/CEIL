import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { JwtUser } from "../../middlewares/auth.middleware";
import { AttendanceStatus } from "../../../generated/prisma/client";
import { uploadToCloudinary } from "../../middlewares/uploadToCloudinary";

/* ═══════════════════════════════════════════════════════
   HELPER: Get teacher record from JWT user
═══════════════════════════════════════════════════════ */

const getTeacherFromUser = async (user: JwtUser) => {
  const dbUser = await prisma.user.findUnique({
    where: { user_id: user.user_id },
    include: { teacher: true },
  });

  return dbUser?.teacher ?? null;
};

/* ═══════════════════════════════════════════════════════
   HELPER: Verify teacher owns a group
═══════════════════════════════════════════════════════ */

const verifyTeacherOwnsGroup = async (teacherId: string, groupId: string) => {
  const group = await prisma.group.findFirst({
    where: {
      group_id: groupId,
      teacher_id: teacherId,
    },
    include: {
      course: true,
      _count: {
        select: {
          enrollments: {
            where: {
              registration_status: {
                in: ["VALIDATED", "PAID", "FINISHED"],
              },
            },
          },
          sessions: true,
        },
      },
    },
  });
  return group;
};

/* ═══════════════════════════════════════════════════════
   HELPER: Verify teacher owns a session
═══════════════════════════════════════════════════════ */

const verifyTeacherOwnsSession = async (
  teacherId: string,
  sessionId: string,
) => {
  const session = await prisma.session.findFirst({
    where: {
      session_id: sessionId,
      group: {
        teacher_id: teacherId,
      },
    },
    include: {
      group: true,
    },
  });

  return session;
};

/* ═══════════════════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════════════════ */

export const getTeacherProfileController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  const fullTeacher = await prisma.teacher.findUnique({
    where: { teacher_id: teacher.teacher_id },
    include: {
      user: {
        select: {
          email: true,
          role: true,
          google_avatar: true,
          created_at: true,
        },
      },
      groups: {
        include: {
          course: true,
          _count: {
            select: {
              enrollments: {
                where: {
                  registration_status: {
                    in: ["VALIDATED", "PAID", "FINISHED"],
                  },
                },
              },
              sessions: true,
            },
          },
        },
      },
    },
  });

  return res.json(fullTeacher);
};

export const updateTeacherProfileController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  const { first_name, last_name, phone_number } = req.body;

  const updated = await prisma.teacher.update({
    where: { teacher_id: teacher.teacher_id },
    data: {
      first_name: first_name?.trim() || undefined,
      last_name: last_name?.trim() || undefined,
      phone_number: phone_number || undefined,
    },
  });

  return res.json({
    message: "Profile updated successfully",
    teacher: updated,
  });
};

export const updateTeacherAvatarController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "Avatar image is required" });
  }

  if (!file.mimetype.startsWith("image/")) {
    return res.status(400).json({ message: "Only image files are allowed" });
  }

  const uploadResult = await uploadToCloudinary(
    file,
    `avatars/teachers/${user.user_id}`,
  );

  await prisma.user.update({
    where: { user_id: user.user_id },
    data: { google_avatar: uploadResult.secure_url },
  });

  return res.json({
    message: "Avatar updated successfully",
    avatar: uploadResult.secure_url,
  });
};

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════ */

export const teacherDashboardController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  // ── Groups with student counts ──
  const groups = await prisma.group.findMany({
    where: { teacher_id: teacher.teacher_id },
    include: {
      course: true,
      department: true,
      _count: {
        select: {
          enrollments: {
            where: {
              registration_status: {
                in: ["VALIDATED", "PAID", "FINISHED"],
              },
            },
          },
          sessions: true,
        },
      },
    },
  });

  // ── Total students across all groups ──
  const totalStudents = groups.reduce(
    (sum, g) => sum + g._count.enrollments,
    0,
  );

  // ── Total sessions ──
  const totalSessions = groups.reduce((sum, g) => sum + g._count.sessions, 0);

  // ── Upcoming sessions (next 7 days) ──
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingSessions = await prisma.session.findMany({
    where: {
      group: { teacher_id: teacher.teacher_id },
      session_date: { gte: now, lte: nextWeek },
    },
    include: {
      group: {
        include: { course: true },
      },
      _count: { select: { attendance: true } },
    },
    orderBy: { session_date: "asc" },
    take: 10,
  });

  // ── Recent sessions (last 7 days) ──
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recentSessions = await prisma.session.findMany({
    where: {
      group: { teacher_id: teacher.teacher_id },
      session_date: { gte: lastWeek, lte: now },
    },
    include: {
      group: {
        include: { course: true },
      },
      _count: { select: { attendance: true } },
    },
    orderBy: { session_date: "desc" },
    take: 5,
  });

  // ── Attendance rate (all time) ──
  const allSessionIds = await prisma.session.findMany({
    where: { group: { teacher_id: teacher.teacher_id } },
    select: { session_id: true },
  });

  const sessionIds = allSessionIds.map((s) => s.session_id);

  let attendanceRate = 0;
  if (sessionIds.length > 0) {
    const attendanceStats = await prisma.attendance.groupBy({
      by: ["status"],
      where: { session_id: { in: sessionIds } },
      _count: { status: true },
    });

    const present =
      attendanceStats.find((a) => a.status === "PRESENT")?._count.status || 0;
    const total = attendanceStats.reduce((sum, a) => sum + a._count.status, 0);
    attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
  }

  // ── Upcoming exams ──
  const groupIds = groups.map((g) => g.group_id);
  const courseIds = [...new Set(groups.map((g) => g.course.course_id))];

  const upcomingExams = await prisma.exam.findMany({
    where: {
      course_id: { in: courseIds },
      exam_date: { gte: now },
    },
    include: { course: true },
    orderBy: { exam_date: "asc" },
    take: 5,
  });

  return res.json({
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
  });
};

/* ═══════════════════════════════════════════════════════════
   COURSES & GROUPS
═══════════════════════════════════════════════════════════ */

export const getAssignedGroupsController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  const groups = await prisma.group.findMany({
    where: { teacher_id: teacher.teacher_id },
    include: {
      course: true,
      department: true,
      _count: {
        select: {
          enrollments: {
            where: {
              registration_status: {
                in: ["VALIDATED", "PAID", "FINISHED"],
              },
            },
          },
          sessions: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const formatted = groups.map((g) => ({
    ...g,
    student_count: g._count.enrollments,
    session_count: g._count.sessions,
  }));

  return res.json(formatted);
};

export const getGroupStudentsController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const { groupId } = req.params;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  // ── Verify teacher owns this group ──
  const group = await verifyTeacherOwnsGroup(teacher.teacher_id, groupId);

  if (!group) {
    return res.status(403).json({
      message: "You are not assigned to this group",
    });
  }

  // ── Get students via enrollments ──
  const enrollments = await prisma.enrollment.findMany({
    where: {
      group_id: groupId,
      registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
    },
    include: {
      student: {
        include: {
          user: {
            select: {
              google_avatar: true,
            },
          },
        },
      },
    },
    orderBy: {
      student: { first_name: "asc" },
    },
  });

  // ── Get attendance summary per student ──
  const sessions = await prisma.session.findMany({
    where: { group_id: groupId },
    select: { session_id: true },
  });

  const sessionIds = sessions.map((s) => s.session_id);

  const students = await Promise.all(
    enrollments.map(async (e) => {
      let attendanceSummary = {
        total: 0,
        present: 0,
        absent: 0,
        rate: 0,
      };

      if (sessionIds.length > 0) {
        const attendance = await prisma.attendance.findMany({
          where: {
            student_id: e.student.student_id,
            session_id: { in: sessionIds },
          },
        });

        const present = attendance.filter((a) => a.status === "PRESENT").length;
        const total = attendance.length;

        attendanceSummary = {
          total,
          present,
          absent: total - present,
          rate: total > 0 ? Math.round((present / total) * 100) : 0,
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
        attendance: attendanceSummary,
      };
    }),
  );

  return res.json({
    group_id: groupId,
    group_name: group.name,
    students,
  });
};

/* ═══════════════════════════════════════════════════════════
   SESSIONS
═══════════════════════════════════════════════════════════ */

export const getTeacherSessionsController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  const { group_id } = req.query;

  const where: any = {
    group: { teacher_id: teacher.teacher_id },
  };

  if (group_id) {
    where.group_id = group_id as string;
  }

  const sessions = await prisma.session.findMany({
    where,
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
        },
      },
      _count: { select: { attendance: true } },
    },
    orderBy: { session_date: "desc" },
  });

  // ── Add attendance completion info ──
  const enriched = await Promise.all(
    sessions.map(async (session) => {
      const enrolledCount = await prisma.enrollment.count({
        where: {
          group_id: session.group_id,
          registration_status: {
            in: ["VALIDATED", "PAID", "FINISHED"],
          },
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

  return res.json(enriched);
};

export const createTeacherSessionController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const { group_id, session_date, topic } = req.body;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  if (!group_id || !session_date) {
    return res.status(400).json({
      message: "group_id and session_date are required",
    });
  }

  // ── Verify teacher owns this group ──
  const group = await verifyTeacherOwnsGroup(teacher.teacher_id, group_id);

  if (!group) {
    return res.status(403).json({
      message: "You are not assigned to this group",
    });
  }

  const session = await prisma.session.create({
    data: {
      group_id,
      session_date: new Date(session_date),
      topic: topic || null,
    },
    include: {
      group: {
        include: {
          course: true,
        },
      },
    },
  });

  return res.status(201).json(session);
};

export const updateTeacherSessionController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const { sessionId } = req.params;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  // ── Verify teacher owns this session ──
  const session = await verifyTeacherOwnsSession(teacher.teacher_id, sessionId);

  if (!session) {
    return res.status(403).json({
      message: "You don't have access to this session",
    });
  }

  const { session_date, topic } = req.body;

  const updated = await prisma.session.update({
    where: { session_id: sessionId },
    data: {
      session_date: session_date ? new Date(session_date) : undefined,
      topic: topic !== undefined ? topic : undefined,
    },
  });

  return res.json(updated);
};

export const deleteTeacherSessionController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const { sessionId } = req.params;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  // ── Verify teacher owns this session ──
  const session = await verifyTeacherOwnsSession(teacher.teacher_id, sessionId);

  if (!session) {
    return res.status(403).json({
      message: "You don't have access to this session",
    });
  }

  // ── Check no attendance records ──
  const attendanceCount = await prisma.attendance.count({
    where: { session_id: sessionId },
  });

  if (attendanceCount > 0) {
    return res.status(400).json({
      message: "Cannot delete session with attendance records",
    });
  }

  await prisma.session.delete({
    where: { session_id: sessionId },
  });

  return res.json({ message: "Session deleted successfully" });
};

/* ═══════════════════════════════════════════════════════════
   ATTENDANCE
═══════════════════════════════════════════════════════════ */

export const getSessionAttendanceController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const { sessionId } = req.params;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  // ── Verify teacher owns this session ──
  const session = await verifyTeacherOwnsSession(teacher.teacher_id, sessionId);

  if (!session) {
    return res.status(403).json({
      message: "You don't have access to this session",
    });
  }

  // ── Get all enrolled students in the group ──
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

  // ── Get existing attendance records ──
  const attendance = await prisma.attendance.findMany({
    where: { session_id: sessionId },
  });

  const attendanceMap = new Map(attendance.map((a) => [a.student_id, a]));

  // ── Merge: all students with their attendance status ──
  const result = enrollments.map((e) => {
    const record = attendanceMap.get(e.student.student_id);
    return {
      student: e.student,
      attendance_id: record?.attendance_id ?? null,
      status: record?.status ?? null, // null = not yet marked
    };
  });

  return res.json({
    session_id: sessionId,
    session_date: session.session_date,
    topic: session.topic,
    group_name: session.group?.name,
    total_students: enrollments.length,
    marked_count: attendance.length,
    students: result,
  });
};

export const markSessionAttendanceController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const { sessionId } = req.params;
  const { student_id, status } = req.body;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  if (!student_id || !status) {
    return res.status(400).json({
      message: "student_id and status are required",
    });
  }

  if (!Object.values(AttendanceStatus).includes(status)) {
    return res.status(400).json({ message: "Invalid attendance status" });
  }

  // ── Verify teacher owns this session ──
  const session = await verifyTeacherOwnsSession(teacher.teacher_id, sessionId);

  if (!session) {
    return res.status(403).json({
      message: "You don't have access to this session",
    });
  }

  // ── Verify student is enrolled in the group ──
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      student_id,
      group_id: session.group_id,
      registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
    },
  });

  if (!enrollment) {
    return res.status(400).json({
      message: "Student is not enrolled in this group",
    });
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      session_id_student_id: {
        session_id: sessionId,
        student_id,
      },
    },
    update: { status },
    create: {
      session_id: sessionId,
      student_id,
      status,
    },
  });

  return res.json(attendance);
};

export const markBulkAttendanceController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const { sessionId } = req.params;
  const { records } = req.body;
  // records = [{ student_id: "...", status: "PRESENT" | "ABSENT" }, ...]
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({
      message: "records array is required",
    });
  }

  // ── Verify teacher owns this session ──
  const session = await verifyTeacherOwnsSession(teacher.teacher_id, sessionId);

  if (!session) {
    return res.status(403).json({
      message: "You don't have access to this session",
    });
  }

  // ── Validate all statuses ──
  const invalidRecords = records.filter(
    (r: any) => !Object.values(AttendanceStatus).includes(r.status),
  );

  if (invalidRecords.length > 0) {
    return res.status(400).json({
      message: "Invalid attendance status in records",
      invalid: invalidRecords,
    });
  }

  // ── Bulk upsert in transaction ──
  const results = await prisma.$transaction(
    records.map((r: { student_id: string; status: AttendanceStatus }) =>
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

  return res.json({
    message: `Attendance recorded for ${results.length} students`,
    count: results.length,
  });
};

/* ═══════════════════════════════════════════════════════════
   EXAMS
═══════════════════════════════════════════════════════════ */

export const getTeacherExamsController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  // ── Get course IDs from assigned groups ──
  const groups = await prisma.group.findMany({
    where: { teacher_id: teacher.teacher_id },
    select: { course_id: true },
  });

  const courseIds = [...new Set(groups.map((g) => g.course_id))];

  if (courseIds.length === 0) {
    return res.json([]);
  }

  const exams = await prisma.exam.findMany({
    where: { course_id: { in: courseIds } },
    include: {
      course: true,
      _count: { select: { results: true } },
    },
    orderBy: { exam_date: "desc" },
  });

  return res.json(exams);
};

export const createTeacherExamController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const { course_id, exam_name, exam_date, max_marks } = req.body;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  if (!course_id || !exam_date || !max_marks) {
    return res.status(400).json({
      message: "course_id, exam_date and max_marks are required",
    });
  }

  if (max_marks <= 0) {
    return res.status(400).json({
      message: "max_marks must be greater than 0",
    });
  }

  // ── Verify teacher is assigned to a group in this course ──
  const group = await prisma.group.findFirst({
    where: {
      teacher_id: teacher.teacher_id,
      course_id,
    },
  });

  if (!group) {
    return res.status(403).json({
      message: "You are not assigned to any group in this course",
    });
  }

  const exam = await prisma.exam.create({
    data: {
      course_id,
      exam_name: exam_name || null,
      exam_date: new Date(exam_date),
      max_marks,
    },
    include: { course: true },
  });

  return res.status(201).json(exam);
};

export const updateTeacherExamController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const { examId } = req.params;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  const exam = await prisma.exam.findUnique({
    where: { exam_id: examId },
    include: { results: true },
  });

  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  // ── Verify teacher teaches this course ──
  const group = await prisma.group.findFirst({
    where: {
      teacher_id: teacher.teacher_id,
      course_id: exam.course_id,
    },
  });

  if (!group) {
    return res.status(403).json({
      message: "You are not assigned to this course",
    });
  }

  if (exam.results.length > 0) {
    return res.status(400).json({
      message: "Cannot update exam after results are added",
    });
  }

  const { exam_name, exam_date, max_marks } = req.body;

  const updated = await prisma.exam.update({
    where: { exam_id: examId },
    data: {
      exam_name: exam_name !== undefined ? exam_name : undefined,
      exam_date: exam_date ? new Date(exam_date) : undefined,
      max_marks: max_marks !== undefined ? max_marks : undefined,
    },
  });

  return res.json(updated);
};

export const deleteTeacherExamController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const { examId } = req.params;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  const exam = await prisma.exam.findUnique({
    where: { exam_id: examId },
    include: { results: true },
  });

  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  // ── Verify teacher teaches this course ──
  const group = await prisma.group.findFirst({
    where: {
      teacher_id: teacher.teacher_id,
      course_id: exam.course_id,
    },
  });

  if (!group) {
    return res.status(403).json({
      message: "You are not assigned to this course",
    });
  }

  if (exam.results.length > 0) {
    return res.status(400).json({
      message: "Cannot delete exam with existing results",
    });
  }

  await prisma.exam.delete({ where: { exam_id: examId } });

  return res.json({ message: "Exam deleted successfully" });
};

/* ═══════════════════════════════════════════════════════════
   RESULTS
═══════════════════════════════════════════════════════════ */

export const getExamResultsController = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;
  const { examId } = req.params;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  const exam = await prisma.exam.findUnique({
    where: { exam_id: examId },
    include: { course: true },
  });

  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  // ── Verify teacher teaches this course ──
  const group = await prisma.group.findFirst({
    where: {
      teacher_id: teacher.teacher_id,
      course_id: exam.course_id,
    },
  });

  if (!group) {
    return res.status(403).json({
      message: "You are not assigned to this course",
    });
  }

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

  return res.json({
    exam,
    results,
    summary: {
      total: results.length,
      average:
        results.length > 0
          ? Math.round(
              (results.reduce((sum, r) => sum + r.marks_obtained, 0) /
                results.length) *
                100,
            ) / 100
          : 0,
      max_marks: exam.max_marks,
    },
  });
};

export const addExamResultController = async (req: Request, res: Response) => {
  const user = (req as any).user as JwtUser;
  const { examId } = req.params;
  const { student_id, marks_obtained, grade } = req.body;
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  if (!student_id || marks_obtained == null) {
    return res.status(400).json({
      message: "student_id and marks_obtained are required",
    });
  }

  const exam = await prisma.exam.findUnique({
    where: { exam_id: examId },
  });

  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  // ── Verify teacher teaches this course ──
  const group = await prisma.group.findFirst({
    where: {
      teacher_id: teacher.teacher_id,
      course_id: exam.course_id,
    },
  });

  if (!group) {
    return res.status(403).json({
      message: "You are not assigned to this course",
    });
  }

  if (marks_obtained < 0 || marks_obtained > exam.max_marks) {
    return res.status(400).json({
      message: `Marks must be between 0 and ${exam.max_marks}`,
    });
  }

  // ── Verify student is enrolled ──
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      student_id,
      course_id: exam.course_id,
      registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
    },
  });

  if (!enrollment) {
    return res.status(400).json({
      message: "Student is not enrolled in this course",
    });
  }

  const result = await prisma.result.upsert({
    where: {
      exam_id_student_id: {
        exam_id: examId,
        student_id,
      },
    },
    update: { marks_obtained, grade },
    create: {
      exam_id: examId,
      student_id,
      marks_obtained,
      grade,
    },
  });

  return res.json(result);
};

export const addBulkExamResultsController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as any).user as JwtUser;
  const { examId } = req.params;
  const { results: records } = req.body;
  // records = [{ student_id, marks_obtained, grade? }, ...]
  const teacher = await getTeacherFromUser(user);

  if (!teacher) {
    return res.status(404).json({ message: "Teacher profile not found" });
  }

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({
      message: "results array is required",
    });
  }

  const exam = await prisma.exam.findUnique({
    where: { exam_id: examId },
  });

  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  // ── Verify teacher teaches this course ──
  const group = await prisma.group.findFirst({
    where: {
      teacher_id: teacher.teacher_id,
      course_id: exam.course_id,
    },
  });

  if (!group) {
    return res.status(403).json({
      message: "You are not assigned to this course",
    });
  }

  // ── Validate marks ──
  const invalid = records.filter(
    (r: any) => r.marks_obtained < 0 || r.marks_obtained > exam.max_marks,
  );

  if (invalid.length > 0) {
    return res.status(400).json({
      message: `Marks must be between 0 and ${exam.max_marks}`,
      invalid,
    });
  }

  // ── Bulk upsert ──
  const results = await prisma.$transaction(
    records.map(
      (r: { student_id: string; marks_obtained: number; grade?: string }) =>
        prisma.result.upsert({
          where: {
            exam_id_student_id: {
              exam_id: examId,
              student_id: r.student_id,
            },
          },
          update: {
            marks_obtained: r.marks_obtained,
            grade: r.grade,
          },
          create: {
            exam_id: examId,
            student_id: r.student_id,
            marks_obtained: r.marks_obtained,
            grade: r.grade,
          },
        }),
    ),
  );

  return res.json({
    message: `Results saved for ${results.length} students`,
    count: results.length,
  });
};
