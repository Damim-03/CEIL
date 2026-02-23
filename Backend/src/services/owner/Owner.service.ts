// ================================================================
// 📦 src/services/owner.service.ts
// ✅ Owner-specific business logic
// Dashboard, Admin CRUD, Audit Logs, Settings, Users, Activity, Revenue
// ================================================================

import { prisma } from "../../prisma/client";
import { logAuditEvent } from "../../middlewares/auditLog.middleware";
import {
  UserRole,
  FeeStatus,
  RegistrationStatus,
} from "../../../generated/prisma/client";

import {
  emitToAdminLevel,
  emitToUser,
  emitToUsers,
  emitToRole,
  triggerDashboardRefresh,
} from "../../services/socket.service";

// ─── Types ───────────────────────────────────────────────

interface AuditActor {
  user_id: string;
  role: string;
}

// ══════════════════════════════════════════════
// 1. SYSTEM OVERVIEW DASHBOARD — ✅ ENHANCED
// ══════════════════════════════════════════════

export async function getOwnerDashboard() {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const endOfToday = new Date(startOfToday.getTime() + 86_400_000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    // ═══ KPIs ═══
    totalStudents,
    activeStudents,
    totalTeachers,
    totalCourses,
    totalGroups,
    totalSessions,
    totalExams,
    activeRooms,
    totalUsers,
    activeUsers,
    disabledUsers,
    adminsCount,
    ownersCount,

    // ═══ Revenue ═══
    paidFees,
    unpaidFees,
    totalFeesCount,
    avgFee,
    feesByMethod,
    feesByMonth,
    recentPayments,
    revenueThisMonth,
    revenueLastMonth,
    revenueToday,

    // ═══ Enrollments ═══
    enrollmentsByStatus,
    enrollmentsByCourse,
    recentEnrollments,
    enrollmentsThisMonth,
    enrollmentsLastMonth,

    // ═══ Attendance ═══
    attendanceByStatus,
    todayAttendance,
    topAbsentStudents,

    // ═══ Users ═══
    usersByRole,
    googleUsers,
    passwordUsers,
    recentAuditLogs,
    auditByAction,
    auditToday,
    auditThisWeek,

    // ═══ Students ═══
    genderStats,
    newStudentsThisMonth,
    newStudentsLastMonth,
    studentsByLevel,

    // ═══ Documents ═══
    docsByStatus,

    // ═══ Communications ═══
    publishedAnnouncements,
    pinnedAnnouncements,
    totalNotifications,
    notificationReadStats,

    // ═══ Groups ═══
    groupsByStatus,
    todaySessions,
    groupFillData,

    // ═══ System ═══
    settingsCount,
    lastSettingsUpdate,
  ] = await Promise.all([
    // ─── KPIs ────────────────────────────────────
    prisma.student.count(),
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.teacher.count(),
    prisma.course.count(),
    prisma.group.count(),
    prisma.session.count(),
    prisma.exam.count(),
    prisma.room.count({ where: { is_active: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { is_active: true } }),
    prisma.user.count({ where: { is_active: false } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "OWNER" } }),

    // ─── Revenue ─────────────────────────────────
    prisma.fee.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.fee.aggregate({
      where: { status: "UNPAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.fee.count(),
    prisma.fee.aggregate({ _avg: { amount: true } }),
    prisma.$queryRaw<
      Array<{ payment_method: string | null; count: number; total: number }>
    >`
      SELECT payment_method, COUNT(*)::int as count, COALESCE(SUM(amount), 0)::float as total
      FROM "Fee" WHERE status = 'PAID'
      GROUP BY payment_method ORDER BY total DESC
    `,
    prisma.$queryRaw<Array<{ month: string; total: number; count: number }>>`
      SELECT TO_CHAR(paid_at, 'YYYY-MM') as month, COALESCE(SUM(amount), 0)::float as total, COUNT(*)::int as count
      FROM "Fee" WHERE status = 'PAID' AND paid_at IS NOT NULL
      GROUP BY TO_CHAR(paid_at, 'YYYY-MM') ORDER BY month DESC LIMIT 12
    `,
    prisma.fee.findMany({
      where: { status: "PAID" },
      orderBy: { paid_at: "desc" },
      take: 10,
      include: {
        student: {
          select: { first_name: true, last_name: true, avatar_url: true },
        },
      },
    }),
    prisma.fee.aggregate({
      where: { status: "PAID", paid_at: { gte: startOfMonth } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.fee.aggregate({
      where: {
        status: "PAID",
        paid_at: { gte: startOfLastMonth, lt: startOfMonth },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.fee.aggregate({
      where: { status: "PAID", paid_at: { gte: startOfToday } },
      _sum: { amount: true },
      _count: true,
    }),

    // ─── Enrollments ─────────────────────────────
    prisma.enrollment.groupBy({
      by: ["registration_status"],
      _count: { registration_status: true },
    }),
    prisma.$queryRaw<
      Array<{ course_id: string; course_name: string; count: number }>
    >`
      SELECT e.course_id, c.course_name, COUNT(*)::int as count
      FROM "Enrollment" e JOIN "Course" c ON e.course_id = c.course_id
      GROUP BY e.course_id, c.course_name ORDER BY count DESC
    `,
    prisma.enrollment.findMany({
      take: 10,
      orderBy: { enrollment_date: "desc" },
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
        course: {
          select: { course_id: true, course_name: true, course_code: true },
        },
        pricing: { select: { status_fr: true, price: true, currency: true } },
      },
    }),
    prisma.enrollment.count({
      where: { enrollment_date: { gte: startOfMonth } },
    }),
    prisma.enrollment.count({
      where: { enrollment_date: { gte: startOfLastMonth, lt: startOfMonth } },
    }),

    // ─── Attendance ──────────────────────────────
    prisma.attendance.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.$queryRaw<Array<{ status: string; count: number }>>`
      SELECT a.status, COUNT(*)::int as count
      FROM "Attendance" a JOIN "Session" s ON a.session_id = s.session_id
      WHERE s.session_date >= ${startOfToday} AND s.session_date < ${endOfToday}
      GROUP BY a.status
    `,
    prisma.$queryRaw<
      Array<{
        student_id: string;
        first_name: string;
        last_name: string;
        absent_count: number;
      }>
    >`
      SELECT s.student_id, s.first_name, s.last_name, COUNT(*)::int as absent_count
      FROM "Attendance" a JOIN "Student" s ON a.student_id = s.student_id
      WHERE a.status = 'ABSENT'
      GROUP BY s.student_id, s.first_name, s.last_name
      ORDER BY absent_count DESC LIMIT 5
    `,

    // ─── Users ───────────────────────────────────
    prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
    prisma.user.count({ where: { google_id: { not: null } } }),
    prisma.user.count({ where: { password: { not: null } } }),
    prisma.auditLog.findMany({ orderBy: { created_at: "desc" }, take: 20 }),
    prisma.$queryRaw<Array<{ action: string; count: number }>>`
      SELECT action, COUNT(*)::int as count FROM "AuditLog"
      GROUP BY action ORDER BY count DESC LIMIT 10
    `,
    prisma.auditLog.count({ where: { created_at: { gte: startOfToday } } }),
    prisma.auditLog.count({
      where: { created_at: { gte: new Date(Date.now() - 7 * 86_400_000) } },
    }),

    // ─── Students ────────────────────────────────
    prisma.student.groupBy({ by: ["gender"], _count: { gender: true } }),
    prisma.student.count({
      where: { created_at: { gte: startOfMonth }, status: "ACTIVE" },
    }),
    prisma.student.count({
      where: {
        created_at: { gte: startOfLastMonth, lt: startOfMonth },
        status: "ACTIVE",
      },
    }),
    prisma.$queryRaw<Array<{ level: string; count: number }>>`
      SELECT e.level, COUNT(DISTINCT e.student_id)::int as count
      FROM "Enrollment" e
      WHERE e.level IS NOT NULL AND e.registration_status IN ('VALIDATED', 'PAID', 'FINISHED')
      GROUP BY e.level ORDER BY e.level
    `,

    // ─── Documents ───────────────────────────────
    prisma.document.groupBy({ by: ["status"], _count: { status: true } }),

    // ─── Communications ──────────────────────────
    prisma.announcement.count({ where: { is_published: true } }),
    prisma.announcement.count({ where: { is_pinned: true } }),
    prisma.notification.count(),
    prisma.$queryRaw<[{ total: number; read_count: number }]>`
      SELECT COUNT(*)::int as total, COALESCE(SUM(CASE WHEN is_read THEN 1 ELSE 0 END), 0)::int as read_count
      FROM "NotificationRecipient"
    `,

    // ─── Groups ──────────────────────────────────
    prisma.group.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.session.count({
      where: { session_date: { gte: startOfToday, lt: endOfToday } },
    }),
    prisma.$queryRaw<
      Array<{
        group_id: string;
        name: string;
        max_students: number;
        enrolled: number;
      }>
    >`
      SELECT g.group_id, g.name, g.max_students,
        COUNT(DISTINCT e.student_id)::int as enrolled
      FROM "Group" g
      LEFT JOIN "Enrollment" e ON e.group_id = g.group_id
        AND e.registration_status IN ('VALIDATED', 'PAID', 'FINISHED')
      WHERE g.status = 'OPEN'
      GROUP BY g.group_id, g.name, g.max_students
      ORDER BY g.name
    `,

    // ─── System ──────────────────────────────────
    prisma.systemSettings.count(),
    prisma.systemSettings.findFirst({
      orderBy: { updated_at: "desc" },
      select: { updated_at: true },
    }),
  ]);

  // ═══════════════════════════════════════════════
  // Transform
  // ═══════════════════════════════════════════════

  // Revenue
  const collected = Number(paidFees._sum.amount || 0);
  const pendingAmount = Number(unpaidFees._sum.amount || 0);
  const collectionRate =
    totalFeesCount > 0
      ? Math.round((paidFees._count / totalFeesCount) * 100)
      : 0;
  const thisMonthRevenue = Number(revenueThisMonth._sum.amount || 0);
  const lastMonthRevenue = Number(revenueLastMonth._sum.amount || 0);
  const revenueChangePercent =
    lastMonthRevenue > 0
      ? Math.round(
          ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
        )
      : thisMonthRevenue > 0
        ? 100
        : 0;

  // Enrollments
  const eMap = Object.fromEntries(
    enrollmentsByStatus.map((e) => [
      e.registration_status,
      e._count.registration_status,
    ]),
  );
  const ePending = eMap.PENDING || 0;
  const eValidated = eMap.VALIDATED || 0;
  const ePaid = eMap.PAID || 0;
  const eFinished = eMap.FINISHED || 0;
  const eRejected = eMap.REJECTED || 0;
  const eTotal = ePending + eValidated + ePaid + eFinished + eRejected;
  const acceptanceRate =
    eTotal > 0
      ? Math.round(((eValidated + ePaid + eFinished) / eTotal) * 100)
      : 0;
  const enrollmentChangePercent =
    enrollmentsLastMonth > 0
      ? Math.round(
          ((enrollmentsThisMonth - enrollmentsLastMonth) /
            enrollmentsLastMonth) *
            100,
        )
      : enrollmentsThisMonth > 0
        ? 100
        : 0;

  // Attendance
  const attMap = Object.fromEntries(
    attendanceByStatus.map((a) => [a.status, a._count.status]),
  );
  const totalPresent = attMap.PRESENT || 0;
  const totalAbsent = attMap.ABSENT || 0;
  const totalAtt = totalPresent + totalAbsent;
  const overallRate =
    totalAtt > 0 ? Math.round((totalPresent / totalAtt) * 100) : 0;

  const todayMap = Object.fromEntries(
    (todayAttendance as any[]).map((a) => [a.status, Number(a.count)]),
  );
  const todayP = todayMap.PRESENT || 0;
  const todayA = todayMap.ABSENT || 0;
  const todayTotal = todayP + todayA;
  const todayRate =
    todayTotal > 0 ? Math.round((todayP / todayTotal) * 100) : 0;

  // Users
  const roleMap = Object.fromEntries(
    usersByRole.map((u) => [u.role, u._count.role]),
  );

  // Gender
  const genderMap = Object.fromEntries(
    genderStats.map((g) => [g.gender, g._count.gender]),
  );

  // Students without group
  const studentsWithGroup = await prisma.enrollment.findMany({
    where: {
      group_id: { not: null },
      registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
    },
    select: { student_id: true },
    distinct: ["student_id"],
  });
  const withoutGroup = Math.max(activeStudents - studentsWithGroup.length, 0);

  // Documents
  const docMap = Object.fromEntries(
    docsByStatus.map((d) => [d.status, d._count.status]),
  );

  // Notifications
  const notifStats = (notificationReadStats as any[])[0] || {
    total: 0,
    read_count: 0,
  };
  const notifReadRate =
    Number(notifStats.total) > 0
      ? Math.round(
          (Number(notifStats.read_count) / Number(notifStats.total)) * 100,
        )
      : 0;

  // Groups
  const groupStatusMap = Object.fromEntries(
    groupsByStatus.map((g) => [g.status, g._count.status]),
  );

  // ═══════════════════════════════════════════════
  // Response
  // ═══════════════════════════════════════════════

  return {
    // ── 1. KPI Cards ──
    kpis: {
      total_students: totalStudents,
      active_students: activeStudents,
      total_teachers: totalTeachers,
      total_courses: totalCourses,
      total_groups: totalGroups,
      total_sessions: totalSessions,
      total_exams: totalExams,
      total_rooms: activeRooms,
      total_users: totalUsers,
      total_admins: adminsCount,
      total_owners: ownersCount,
    },

    // ── 2. System (Users overview) ──
    system: {
      total_users: totalUsers,
      active_users: activeUsers,
      disabled_users: disabledUsers,
      owners: ownersCount,
      admins: adminsCount,
    },

    // ── 3. Users by Role ──
    users_by_role: usersByRole.map((u) => ({
      role: u.role,
      count: u._count.role,
    })),

    // ── 4. Users Details ──
    users: {
      by_role: {
        OWNER: roleMap.OWNER || 0,
        ADMIN: roleMap.ADMIN || 0,
        TEACHER: roleMap.TEACHER || 0,
        STUDENT: roleMap.STUDENT || 0,
      },
      active: activeUsers,
      inactive: disabledUsers,
      google_users: googleUsers,
      password_users: passwordUsers,
    },

    // ── 5. Revenue ──
    revenue: {
      collected,
      pending: pendingAmount,
      total: collected + pendingAmount,
      paid_count: paidFees._count,
      unpaid_count: unpaidFees._count,
      total_fees_count: totalFeesCount,
      collection_rate: collectionRate,
      average_fee: Number(avgFee._avg.amount || 0),
      today: {
        amount: Number(revenueToday._sum.amount || 0),
        count: revenueToday._count,
      },
      this_month: { amount: thisMonthRevenue, count: revenueThisMonth._count },
      last_month: { amount: lastMonthRevenue, count: revenueLastMonth._count },
      month_change_percent: revenueChangePercent,
      by_payment_method: (feesByMethod as any[]).map((f) => ({
        payment_method: f.payment_method,
        count: Number(f.count),
        total: Number(f.total),
      })),
      by_month: (feesByMonth as any[]).map((f) => ({
        month: f.month,
        total: Number(f.total),
        count: Number(f.count),
      })),
      recent_payments: recentPayments.map((f) => ({
        fee_id: f.fee_id,
        amount: Number(f.amount),
        paid_at: f.paid_at?.toISOString() || null,
        payment_method: f.payment_method,
        student_name: `${f.student.first_name} ${f.student.last_name}`,
        student_avatar: f.student.avatar_url,
      })),
    },

    // ── 6. Finance (legacy compat) ──
    finance: {
      total_revenue: collected + pendingAmount,
      collected,
      pending: pendingAmount,
      paid_count: paidFees._count,
      unpaid_count: unpaidFees._count,
    },

    // ── 7. Enrollments ──
    enrollments: {
      pending: ePending,
      validated: eValidated,
      paid: ePaid,
      finished: eFinished,
      rejected: eRejected,
      total: eTotal,
      acceptance_rate: acceptanceRate,
      this_month: enrollmentsThisMonth,
      last_month: enrollmentsLastMonth,
      month_change_percent: enrollmentChangePercent,
      by_course: (enrollmentsByCourse as any[]).map((e) => ({
        course_id: e.course_id,
        course_name: e.course_name,
        count: Number(e.count),
      })),
      recent: recentEnrollments.map((e) => ({
        enrollment_id: e.enrollment_id,
        enrollment_date: e.enrollment_date.toISOString(),
        registration_status: e.registration_status,
        student: {
          student_id: e.student.student_id,
          first_name: e.student.first_name,
          last_name: e.student.last_name,
          avatar_url: e.student.avatar_url,
        },
        course: {
          course_id: e.course.course_id,
          course_name: e.course.course_name,
        },
        pricing: e.pricing
          ? {
              status_fr: e.pricing.status_fr,
              price: Number(e.pricing.price),
              currency: e.pricing.currency,
            }
          : null,
      })),
    },

    // ── 8. Enrollments by Status (legacy compat) ──
    enrollments_by_status: enrollmentsByStatus.map((e) => ({
      status: e.registration_status,
      count: e._count.registration_status,
    })),

    // ── 9. Attendance ──
    attendance: {
      total_present: totalPresent,
      total_absent: totalAbsent,
      overall_rate: overallRate,
      today: { present: todayP, absent: todayA, rate: todayRate },
      top_absent_students: (topAbsentStudents as any[]).map((s) => ({
        student_id: s.student_id,
        student_name: `${s.first_name} ${s.last_name}`,
        absent_count: Number(s.absent_count),
      })),
    },

    // ── 10. Audit Logs ──
    audit: {
      today: auditToday,
      this_week: auditThisWeek,
      by_action: (auditByAction as any[]).map((a) => ({
        action: a.action,
        count: Number(a.count),
      })),
      recent: recentAuditLogs.map((log) => ({
        log_id: log.log_id,
        action: log.action,
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        user_email: log.user_email,
        user_role: log.user_role,
        created_at: log.created_at.toISOString(),
        details: log.details ? JSON.parse(log.details) : null,
      })),
    },

    // ── 11. Recent Activity (legacy compat) ──
    recent_activity: recentAuditLogs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    })),

    // ── 12. Students ──
    students: {
      gender: {
        male: genderMap.MALE || 0,
        female: genderMap.FEMALE || 0,
        other: genderMap.OTHER || 0,
      },
      new_this_month: newStudentsThisMonth,
      new_last_month: newStudentsLastMonth,
      new_change_percent:
        newStudentsLastMonth > 0
          ? Math.round(
              ((newStudentsThisMonth - newStudentsLastMonth) /
                newStudentsLastMonth) *
                100,
            )
          : newStudentsThisMonth > 0
            ? 100
            : 0,
      without_group: withoutGroup,
      by_level: (studentsByLevel as any[]).map((l) => ({
        level: l.level,
        count: Number(l.count),
      })),
    },

    // ── 13. Academics (legacy compat) ──
    academics: {
      total_students: totalStudents,
      active_students: activeStudents,
      total_teachers: totalTeachers,
      total_courses: totalCourses,
      total_groups: totalGroups,
      total_enrollments: eTotal,
      total_sessions: totalSessions,
      total_exams: totalExams,
    },

    // ── 14. Documents ──
    documents: {
      pending: docMap.PENDING || 0,
      approved: docMap.APPROVED || 0,
      rejected: docMap.REJECTED || 0,
    },

    // ── 15. Communications ──
    communications: {
      published_announcements: publishedAnnouncements,
      pinned_announcements: pinnedAnnouncements,
      total_notifications: totalNotifications,
      notification_read_rate: notifReadRate,
    },

    // ── 16. Infrastructure ──
    infrastructure: {
      groups: {
        open: groupStatusMap.OPEN || 0,
        full: groupStatusMap.FULL || 0,
        finished: groupStatusMap.FINISHED || 0,
      },
      sessions_today: todaySessions,
      rooms_active: activeRooms,
      group_fill_rates: (groupFillData as any[]).map((g) => ({
        group_id: g.group_id,
        group_name: g.name,
        enrolled: Number(g.enrolled),
        max: g.max_students,
        fill_rate:
          g.max_students > 0
            ? Math.round((Number(g.enrolled) / g.max_students) * 100)
            : 0,
      })),
    },

    // ── 17. System Settings ──
    settings: {
      settings_count: settingsCount,
      last_settings_update:
        lastSettingsUpdate?.updated_at?.toISOString() || null,
    },
  };
}

// ══════════════════════════════════════════════
// 2. MANAGE ADMINS
// ══════════════════════════════════════════════

export async function listAdmins() {
  return prisma.user.findMany({
    where: { role: { in: ["ADMIN", "OWNER"] } },
    select: {
      user_id: true,
      email: true,
      role: true,
      is_active: true,
      google_avatar: true,
      created_at: true,
    },
    orderBy: [{ role: "asc" }, { created_at: "desc" }],
  });
}

export async function createAdmin(
  actor: AuditActor,
  data: { email: string; password?: string },
) {
  if (!data.email?.trim()) {
    return { error: "validation" as const, message: "email is required" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (existing) {
    return {
      error: "duplicate" as const,
      message: "User with this email already exists",
    };
  }

  const admin = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      password: data.password || null,
      role: "ADMIN",
      is_active: true,
    },
    select: {
      user_id: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
    },
  });

  await logAuditEvent({
    user_id: actor.user_id,
    user_role: actor.role,
    action: "CREATE_ADMIN",
    entity_type: "USER",
    entity_id: admin.user_id,
    details: { admin_email: admin.email },
  });

  emitToRole("OWNER", "admin:created", {
    user_id: admin.user_id,
    email: admin.email,
  });

  return { data: admin };
}

export async function activateAdmin(actor: AuditActor, userId: string) {
  const user = await prisma.user.findUnique({ where: { user_id: userId } });
  if (!user) return { error: "not_found" as const };
  if (user.role !== "ADMIN")
    return { error: "bad_request" as const, message: "Only for ADMIN users" };

  const updated = await prisma.user.update({
    where: { user_id: userId },
    data: { is_active: true },
    select: { user_id: true, email: true, role: true, is_active: true },
  });

  await logAuditEvent({
    user_id: actor.user_id,
    user_role: actor.role,
    action: "ACTIVATE_ADMIN",
    entity_type: "USER",
    entity_id: userId,
    details: { admin_email: user.email },
  });

  emitToRole("OWNER", "admin:activated", { user_id: userId });

  return { data: updated };
}

export async function deactivateAdmin(actor: AuditActor, userId: string) {
  if (actor.user_id === userId)
    return {
      error: "bad_request" as const,
      message: "You cannot deactivate yourself",
    };

  const user = await prisma.user.findUnique({ where: { user_id: userId } });
  if (!user) return { error: "not_found" as const };
  if (user.role === "OWNER")
    return {
      error: "forbidden" as const,
      message: "Cannot deactivate another OWNER",
    };
  if (user.role !== "ADMIN")
    return { error: "bad_request" as const, message: "Only for ADMIN users" };

  const updated = await prisma.user.update({
    where: { user_id: userId },
    data: { is_active: false },
    select: { user_id: true, email: true, role: true, is_active: true },
  });

  await logAuditEvent({
    user_id: actor.user_id,
    user_role: actor.role,
    action: "DEACTIVATE_ADMIN",
    entity_type: "USER",
    entity_id: userId,
    details: { admin_email: user.email },
  });

  emitToRole("OWNER", "admin:deactivated", { user_id: userId });
  emitToUser(userId, "user:disabled", { user_id: userId });

  return { data: updated };
}

export async function deleteAdmin(actor: AuditActor, userId: string) {
  if (actor.user_id === userId)
    return {
      error: "bad_request" as const,
      message: "You cannot delete yourself",
    };

  const user = await prisma.user.findUnique({ where: { user_id: userId } });
  if (!user) return { error: "not_found" as const };
  if (user.role === "OWNER")
    return {
      error: "forbidden" as const,
      message: "Cannot delete an OWNER account",
    };
  if (user.role !== "ADMIN")
    return { error: "bad_request" as const, message: "Only for ADMIN users" };

  await prisma.user.delete({ where: { user_id: userId } });

  await logAuditEvent({
    user_id: actor.user_id,
    user_role: actor.role,
    action: "DELETE_ADMIN",
    entity_type: "USER",
    entity_id: userId,
    details: { deleted_email: user.email },
  });

  emitToRole("OWNER", "admin:deleted", { user_id: userId });

  return { data: { message: "Admin deleted successfully" } };
}

export async function promoteToOwner(actor: AuditActor, userId: string) {
  const user = await prisma.user.findUnique({ where: { user_id: userId } });
  if (!user) return { error: "not_found" as const };
  if (user.role !== "ADMIN")
    return {
      error: "bad_request" as const,
      message: "Only ADMIN users can be promoted",
    };

  const updated = await prisma.user.update({
    where: { user_id: userId },
    data: { role: "OWNER" },
    select: { user_id: true, email: true, role: true, is_active: true },
  });

  await logAuditEvent({
    user_id: actor.user_id,
    user_role: actor.role,
    action: "PROMOTE_TO_OWNER",
    entity_type: "USER",
    entity_id: userId,
    details: {
      promoted_email: user.email,
      old_role: "ADMIN",
      new_role: "OWNER",
    },
  });

  emitToRole("OWNER", "admin:promoted", {
    user_id: userId,
    new_role: "OWNER",
  });
  emitToUser(userId, "user:roleChanged", {
    user_id: userId,
    old_role: "ADMIN",
    new_role: "OWNER",
  });

  return { data: updated };
}

export async function changeUserRole(
  actor: AuditActor,
  userId: string,
  role: UserRole,
) {
  if (!Object.values(UserRole).includes(role)) {
    return { error: "validation" as const, message: "Invalid role value" };
  }

  if (actor.user_id === userId && role !== "OWNER") {
    return {
      error: "forbidden" as const,
      message: "You cannot demote yourself from OWNER",
    };
  }

  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    include: { student: true, teacher: true },
  });
  if (!user) return { error: "not_found" as const };

  const oldRole = user.role;
  if (oldRole === role) return { data: user, message: "Role already assigned" };

  const updatedUser = await prisma.$transaction(async (tx) => {
    let first_name = "Unknown";
    let last_name = "User";

    if (user.student) {
      first_name = user.student.first_name || "Unknown";
      last_name = user.student.last_name || "User";
    } else if (user.teacher) {
      first_name = user.teacher.first_name || "Unknown";
      last_name = user.teacher.last_name || "User";
    }

    // Cleanup old role data
    if (user.student && role !== "STUDENT") {
      await tx.attendance.deleteMany({
        where: { student_id: user.student.student_id },
      });
      await tx.result.deleteMany({
        where: { student_id: user.student.student_id },
      });
      await tx.fee.deleteMany({
        where: { student_id: user.student.student_id },
      });
      await tx.enrollment.deleteMany({
        where: { student_id: user.student.student_id },
      });
      await tx.document.deleteMany({
        where: { student_id: user.student.student_id },
      });
      await tx.studentPermission.deleteMany({
        where: { student_id: user.student.student_id },
      });
      await tx.student.delete({
        where: { student_id: user.student.student_id },
      });
    }

    if (user.teacher && role !== "TEACHER") {
      const hasGroups = await tx.group.findFirst({
        where: { teacher_id: user.teacher.teacher_id },
      });
      if (hasGroups) {
        throw new Error(
          "Cannot change role: Teacher is assigned to groups. Remove groups first.",
        );
      }
      await tx.teacher.delete({
        where: { teacher_id: user.teacher.teacher_id },
      });
    }

    // Setup new role data
    if (role === "STUDENT") {
      const student = await tx.student.create({
        data: {
          user_id: user.user_id,
          first_name,
          last_name,
          email: user.email,
        },
      });
      await tx.user.update({
        where: { user_id: userId },
        data: {
          role: "STUDENT",
          student_id: student.student_id,
          teacher_id: null,
        },
      });
    } else if (role === "TEACHER") {
      const teacher = await tx.teacher.create({
        data: { first_name, last_name, email: user.email },
      });
      await tx.user.update({
        where: { user_id: userId },
        data: {
          role: "TEACHER",
          teacher_id: teacher.teacher_id,
          student_id: null,
        },
      });
    } else {
      await tx.user.update({
        where: { user_id: userId },
        data: { role, student_id: null, teacher_id: null },
      });
    }

    return tx.user.findUnique({
      where: { user_id: userId },
      include: { student: true, teacher: true },
    });
  });

  await logAuditEvent({
    user_id: actor.user_id,
    user_role: actor.role,
    action: "CHANGE_ROLE",
    entity_type: "USER",
    entity_id: userId,
    details: { email: user.email, old_role: oldRole, new_role: role },
  });

  emitToUser(userId, "user:roleChanged", {
    user_id: userId,
    old_role: oldRole,
    new_role: role,
  });
  emitToAdminLevel("user:roleChanged", {
    user_id: userId,
    old_role: oldRole,
    new_role: role,
  });
  triggerDashboardRefresh("user_role_changed");

  return { data: updatedUser };
}

// ══════════════════════════════════════════════
// 3. AUDIT LOGS
// ══════════════════════════════════════════════

export async function listAuditLogs(params: {
  page?: number;
  limit?: number;
  action?: string;
  entity_type?: string;
  user_id?: string;
  from?: string;
  to?: string;
}) {
  const page = params.page || 1;
  const limit = params.limit || 50;

  const where: any = {};
  if (params.action) where.action = params.action;
  if (params.entity_type) where.entity_type = params.entity_type;
  if (params.user_id) where.user_id = params.user_id;
  if (params.from || params.to) {
    where.created_at = {};
    if (params.from) where.created_at.gte = new Date(params.from);
    if (params.to) where.created_at.lte = new Date(params.to);
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    })),
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getAuditLogStats() {
  const [actionStats, entityStats, todayCount, weekCount] = await Promise.all([
    prisma.auditLog.groupBy({
      by: ["action"],
      _count: { action: true },
      orderBy: { _count: { action: "desc" } },
      take: 10,
    }),
    prisma.auditLog.groupBy({
      by: ["entity_type"],
      _count: { entity_type: true },
      orderBy: { _count: { entity_type: "desc" } },
    }),
    prisma.auditLog.count({
      where: {
        created_at: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.auditLog.count({
      where: {
        created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return {
    today: todayCount,
    this_week: weekCount,
    by_action: actionStats.map((a) => ({
      action: a.action,
      count: a._count.action,
    })),
    by_entity: entityStats.map((e) => ({
      entity_type: e.entity_type,
      count: e._count.entity_type,
    })),
  };
}

export async function cleanupAuditLogs(actor: AuditActor, daysToKeep?: number) {
  const keepDays = daysToKeep || 90;
  const cutoffDate = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);

  const result = await prisma.auditLog.deleteMany({
    where: { created_at: { lt: cutoffDate } },
  });

  await logAuditEvent({
    user_id: actor.user_id,
    user_role: actor.role,
    action: "CLEANUP_AUDIT_LOGS",
    entity_type: "AUDIT_LOG",
    details: { days_kept: keepDays, deleted_count: result.count },
  });

  emitToRole("OWNER", "system:auditCleanup", { deleted: result.count });

  return { deleted: result.count, days_kept: keepDays };
}

// ══════════════════════════════════════════════
// 4. SYSTEM SETTINGS
// ══════════════════════════════════════════════

export async function getSystemSettings() {
  const settings = await prisma.systemSettings.findMany({
    orderBy: { key: "asc" },
  });

  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return { settings: settingsMap, raw: settings };
}

export async function updateSystemSettings(
  actor: AuditActor,
  settings: Record<string, any>,
) {
  if (!settings || typeof settings !== "object") {
    return { error: "validation" as const };
  }

  const updates = await prisma.$transaction(
    Object.entries(settings).map(([key, value]) =>
      prisma.systemSettings.upsert({
        where: { key },
        update: { value: String(value), updated_by: actor.user_id },
        create: { key, value: String(value), updated_by: actor.user_id },
      }),
    ),
  );

  await logAuditEvent({
    user_id: actor.user_id,
    user_role: actor.role,
    action: "UPDATE_SETTINGS",
    entity_type: "SYSTEM_SETTINGS",
    details: { updated_keys: Object.keys(settings) },
  });

  emitToRole("OWNER", "system:settingsUpdated", {
    keys: Object.keys(settings),
  });

  return { data: { count: updates.length } };
}

// ══════════════════════════════════════════════
// 5. ALL USERS MANAGEMENT
// ══════════════════════════════════════════════

export async function listAllUsers(params: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  is_active?: string;
}) {
  const page = params.page || 1;
  const limit = params.limit || 50;
  const where: any = {};

  if (params.role && Object.values(UserRole).includes(params.role as UserRole))
    where.role = params.role;
  if (params.is_active !== undefined)
    where.is_active = params.is_active === "true";
  if (params.search) {
    where.OR = [
      { email: { contains: params.search, mode: "insensitive" } },
      {
        student: {
          OR: [
            { first_name: { contains: params.search, mode: "insensitive" } },
            { last_name: { contains: params.search, mode: "insensitive" } },
          ],
        },
      },
      {
        teacher: {
          OR: [
            { first_name: { contains: params.search, mode: "insensitive" } },
            { last_name: { contains: params.search, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        student: {
          select: {
            student_id: true,
            first_name: true,
            last_name: true,
            email: true,
            status: true,
          },
        },
        teacher: {
          select: {
            teacher_id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { user_id: userId },
    include: { student: true, teacher: true },
  });
}

export async function enableUser(userId: string) {
  const user = await prisma.user.update({
    where: { user_id: userId },
    data: { is_active: true },
  });
  emitToAdminLevel("user:enabled", { user_id: userId });
  return user;
}

export async function disableUser(userId: string) {
  const user = await prisma.user.update({
    where: { user_id: userId },
    data: { is_active: false },
  });
  emitToUser(userId, "user:disabled", { user_id: userId });
  emitToAdminLevel("user:disabled", { user_id: userId });
  return user;
}

// ══════════════════════════════════════════════
// 6. SYSTEM HEALTH & STATISTICS
// ══════════════════════════════════════════════

export async function getSystemHealth() {
  const dbStart = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  const dbLatency = Date.now() - dbStart;
  const userCount = await prisma.user.count();

  return {
    status: "healthy",
    database: { connected: true, latency_ms: dbLatency },
    users: userCount,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  };
}

export async function getDetailedSystemStats() {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    enrollmentsThisMonth,
    enrollmentsLastMonth,
    feesThisMonth,
    feesLastMonth,
    sessionsThisMonth,
    newStudentsThisMonth,
    newStudentsLastMonth,
    attendanceStats,
  ] = await Promise.all([
    prisma.enrollment.count({
      where: { enrollment_date: { gte: thisMonth } },
    }),
    prisma.enrollment.count({
      where: { enrollment_date: { gte: lastMonth, lt: thisMonth } },
    }),
    prisma.fee.aggregate({
      where: { paid_at: { gte: thisMonth }, status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.fee.aggregate({
      where: { paid_at: { gte: lastMonth, lt: thisMonth }, status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.session.count({ where: { session_date: { gte: thisMonth } } }),
    prisma.student.count({ where: { created_at: { gte: thisMonth } } }),
    prisma.student.count({
      where: { created_at: { gte: lastMonth, lt: thisMonth } },
    }),
    prisma.attendance.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const present =
    attendanceStats.find((a) => a.status === "PRESENT")?._count.status || 0;
  const total = attendanceStats.reduce((sum, a) => sum + a._count.status, 0);

  return {
    monthly_comparison: {
      enrollments: {
        this_month: enrollmentsThisMonth,
        last_month: enrollmentsLastMonth,
        change_percent:
          enrollmentsLastMonth > 0
            ? Math.round(
                ((enrollmentsThisMonth - enrollmentsLastMonth) /
                  enrollmentsLastMonth) *
                  100,
              )
            : 100,
      },
      revenue: {
        this_month: Number(feesThisMonth._sum.amount || 0),
        last_month: Number(feesLastMonth._sum.amount || 0),
      },
      new_students: {
        this_month: newStudentsThisMonth,
        last_month: newStudentsLastMonth,
      },
      sessions_this_month: sessionsThisMonth,
    },
    attendance: {
      overall_rate: total > 0 ? Math.round((present / total) * 100) : 0,
      present,
      absent: total - present,
      total,
    },
  };
}

// ══════════════════════════════════════════════
// 7. REVENUE ANALYTICS
// ══════════════════════════════════════════════

export async function getRevenue() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

  const [
    daily,
    monthly,
    yearly,
    lastMonthAgg,
    lastYearAgg,
    recentPayments,
    monthlyBreakdown,
  ] = await Promise.all([
    prisma.fee.aggregate({
      where: { status: "PAID", paid_at: { gte: todayStart } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.fee.aggregate({
      where: { status: "PAID", paid_at: { gte: monthStart } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.fee.aggregate({
      where: { status: "PAID", paid_at: { gte: yearStart } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.fee.aggregate({
      where: {
        status: "PAID",
        paid_at: { gte: lastMonthStart, lt: monthStart },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.fee.aggregate({
      where: {
        status: "PAID",
        paid_at: { gte: lastYearStart, lte: lastYearEnd },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.fee.findMany({
      where: { status: "PAID" },
      take: 15,
      orderBy: { paid_at: "desc" },
      include: {
        student: { select: { first_name: true, last_name: true } },
      },
    }),
    prisma.$queryRaw<Array<{ month: number; total: number; count: bigint }>>`
      SELECT EXTRACT(MONTH FROM paid_at)::int as month,
             SUM(amount)::float as total,
             COUNT(*)::bigint as count
      FROM "Fee"
      WHERE status = 'PAID'
        AND paid_at >= ${yearStart}
      GROUP BY EXTRACT(MONTH FROM paid_at)
      ORDER BY month
    `,
  ]);

  // Resolve processors
  const processorIds = [
    ...new Set(recentPayments.map((f) => f.processed_by).filter(Boolean)),
  ] as string[];
  const processorsMap: Record<string, string> = {};
  if (processorIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { user_id: { in: processorIds } },
      select: { user_id: true, email: true },
    });
    users.forEach((u) => {
      processorsMap[u.user_id] = u.email;
    });
  }

  return {
    daily: { amount: Number(daily._sum.amount || 0), count: daily._count },
    monthly: {
      amount: Number(monthly._sum.amount || 0),
      count: monthly._count,
    },
    yearly: { amount: Number(yearly._sum.amount || 0), count: yearly._count },
    comparison: {
      month_vs_last: {
        current: Number(monthly._sum.amount || 0),
        previous: Number(lastMonthAgg._sum.amount || 0),
        change_percent:
          Number(lastMonthAgg._sum.amount || 0) > 0
            ? Math.round(
                ((Number(monthly._sum.amount || 0) -
                  Number(lastMonthAgg._sum.amount || 0)) /
                  Number(lastMonthAgg._sum.amount || 0)) *
                  100,
              )
            : 100,
      },
      year_vs_last: {
        current: Number(yearly._sum.amount || 0),
        previous: Number(lastYearAgg._sum.amount || 0),
      },
    },
    monthly_breakdown: monthlyBreakdown.map((m) => ({
      month: m.month,
      total: m.total,
      count: Number(m.count),
    })),
    recent_payments: recentPayments.map((f) => ({
      fee_id: f.fee_id,
      amount: Number(f.amount),
      paid_at: f.paid_at,
      student: f.student
        ? `${f.student.first_name} ${f.student.last_name}`
        : "—",
      payment_method: f.payment_method,
      reference_code: f.reference_code,
      processed_by: f.processed_by
        ? processorsMap[f.processed_by] || f.processed_by
        : null,
      processed_at: f.processed_at,
    })),
  };
}

// ══════════════════════════════════════════════
// 8. OWNER FEES — Full CRUD (extends FeeService)
// ══════════════════════════════════════════════

export async function listOwnerFees(params: {
  page?: number;
  limit?: number;
  status?: string;
  student_id?: string;
}) {
  const page = params.page || 1;
  const limit = params.limit || 50;

  const where: any = {};
  if (params.status && ["PAID", "UNPAID"].includes(params.status))
    where.status = params.status;
  if (params.student_id) where.student_id = params.student_id;

  const [fees, total, paidAgg, unpaidAgg] = await Promise.all([
    prisma.fee.findMany({
      where,
      include: {
        student: {
          select: {
            student_id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        enrollment: {
          select: {
            enrollment_id: true,
            registration_status: true,
            course: {
              select: {
                course_id: true,
                course_name: true,
                course_code: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { due_date: "desc" },
    }),
    prisma.fee.count({ where }),
    prisma.fee.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.fee.aggregate({
      where: { status: "UNPAID" },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  // Resolve processed_by and created_by
  const processorIds = [
    ...new Set(fees.map((f) => f.processed_by).filter(Boolean)),
  ] as string[];
  const creatorIds = [
    ...new Set(fees.map((f) => f.created_by).filter(Boolean)),
  ] as string[];
  const allUserIds = [...new Set([...processorIds, ...creatorIds])];

  const usersMap: Record<string, { email: string; role: string }> = {};
  if (allUserIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { user_id: { in: allUserIds } },
      select: { user_id: true, email: true, role: true },
    });
    users.forEach((u) => {
      usersMap[u.user_id] = { email: u.email, role: u.role };
    });
  }

  return {
    data: fees.map((f) => ({
      ...f,
      processed_by_user: f.processed_by
        ? usersMap[f.processed_by] || null
        : null,
      created_by_user: f.created_by ? usersMap[f.created_by] || null : null,
    })),
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
    summary: {
      paid: {
        count: paidAgg._count,
        amount: Number(paidAgg._sum.amount || 0),
      },
      unpaid: {
        count: unpaidAgg._count,
        amount: Number(unpaidAgg._sum.amount || 0),
      },
      total_amount:
        Number(paidAgg._sum.amount || 0) + Number(unpaidAgg._sum.amount || 0),
    },
  };
}

export async function createOwnerFee(
  actor: AuditActor,
  data: {
    student_id: string;
    enrollment_id?: string;
    amount: number;
    due_date: string;
  },
) {
  if (!data.student_id || !data.amount || !data.due_date) {
    return {
      error: "validation" as const,
      message: "student_id, amount and due_date are required",
    };
  }

  const student = await prisma.student.findUnique({
    where: { student_id: data.student_id },
  });
  if (!student)
    return { error: "bad_request" as const, message: "Invalid student_id" };

  if (data.enrollment_id) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { enrollment_id: data.enrollment_id },
    });
    if (!enrollment)
      return {
        error: "bad_request" as const,
        message: "Invalid enrollment_id",
      };
  }

  const fee = await prisma.fee.create({
    data: {
      student_id: data.student_id,
      enrollment_id: data.enrollment_id,
      amount: data.amount,
      due_date: new Date(data.due_date),
      status: FeeStatus.UNPAID,
      created_by: actor.user_id,
    },
    include: {
      student: { select: { first_name: true, last_name: true } },
    },
  });

  await logAuditEvent({
    user_id: actor.user_id,
    user_role: actor.role,
    action: "CREATE_FEE",
    entity_type: "Fee",
    entity_id: fee.fee_id,
    details: { student_id: data.student_id, amount: data.amount },
  });

  emitToAdminLevel("fee:created", {
    fee_id: fee.fee_id,
    student_id: fee.student_id,
    amount: Number(fee.amount),
    status: "UNPAID",
  });
  triggerDashboardRefresh("fee_created");

  return { data: fee };
}

export async function updateOwnerFee(
  actor: AuditActor,
  feeId: string,
  updates: {
    amount?: number;
    due_date?: string;
    status?: string;
    payment_method?: string;
    reference_code?: string;
  },
) {
  const fee = await prisma.fee.findUnique({ where: { fee_id: feeId } });
  if (!fee) return { error: "not_found" as const };

  const data: any = {};
  if (updates.amount !== undefined) data.amount = updates.amount;
  if (updates.due_date) data.due_date = new Date(updates.due_date);
  if (updates.payment_method) data.payment_method = updates.payment_method;
  if (updates.reference_code) data.reference_code = updates.reference_code;
  if (updates.status && ["PAID", "UNPAID"].includes(updates.status)) {
    data.status = updates.status;
    if (updates.status === "PAID" && fee.status !== "PAID")
      data.paid_at = new Date();
    if (updates.status === "UNPAID") data.paid_at = null;
  }

  data.processed_by = actor.user_id;
  data.processed_at = new Date();

  const updated = await prisma.fee.update({
    where: { fee_id: feeId },
    data,
    include: { student: { select: { first_name: true, last_name: true } } },
  });

  await logAuditEvent({
    user_id: actor.user_id,
    user_role: actor.role,
    action: "UPDATE_FEE",
    entity_type: "Fee",
    entity_id: feeId,
    details: { changes: data },
  });

  return { data: updated };
}

export async function deleteOwnerFee(actor: AuditActor, feeId: string) {
  const fee = await prisma.fee.findUnique({ where: { fee_id: feeId } });
  if (!fee) return { error: "not_found" as const };

  await prisma.fee.delete({ where: { fee_id: feeId } });

  await logAuditEvent({
    user_id: actor.user_id,
    user_role: actor.role,
    action: "DELETE_FEE",
    entity_type: "Fee",
    entity_id: feeId,
    details: { amount: Number(fee.amount), status: fee.status },
  });

  emitToAdminLevel("fee:deleted", { fee_id: feeId });
  triggerDashboardRefresh("fee_deleted");

  return { data: { message: "Fee deleted successfully" } };
}

// ══════════════════════════════════════════════
// 9. ACTIVITY TRACKING
// ══════════════════════════════════════════════

export async function getUserActivity(params: {
  page?: number;
  limit?: number;
  user_id?: string;
  role?: string;
  action?: string;
  entity_type?: string;
  from?: string;
  to?: string;
}) {
  const page = params.page || 1;
  const limit = params.limit || 50;

  const where: any = {};
  if (params.user_id) where.user_id = params.user_id;
  if (params.role) where.user_role = params.role;
  if (params.action) where.action = params.action;
  if (params.entity_type) where.entity_type = params.entity_type;
  if (params.from || params.to) {
    where.created_at = {};
    if (params.from) where.created_at.gte = new Date(params.from);
    if (params.to) where.created_at.lte = new Date(params.to);
  }

  const [logs, total, actionBreakdown, roleBreakdown, activeToday] =
    await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({
        by: ["action"],
        where,
        _count: { action: true },
        orderBy: { _count: { action: "desc" } },
        take: 15,
      }),
      prisma.auditLog.groupBy({
        by: ["user_role"],
        where,
        _count: { user_role: true },
      }),
      prisma.auditLog.groupBy({
        by: ["user_id"],
        where: {
          created_at: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        _count: { user_id: true },
      }),
    ]);

  return {
    data: logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    })),
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
    analytics: {
      top_actions: actionBreakdown.map((a) => ({
        action: a.action,
        count: a._count.action,
      })),
      by_role: roleBreakdown.map((r) => ({
        role: r.user_role,
        count: r._count.user_role,
      })),
      active_users_today: activeToday.length,
    },
  };
}

export async function getUserActivityById(
  userId: string,
  params: { page?: number; limit?: number },
) {
  const page = params.page || 1;
  const limit = params.limit || 30;

  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
      google_avatar: true,
    },
  });
  if (!user) return { error: "not_found" as const };

  const [logs, total, topActions] = await Promise.all([
    prisma.auditLog.findMany({
      where: { user_id: userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
    }),
    prisma.auditLog.count({ where: { user_id: userId } }),
    prisma.auditLog.groupBy({
      by: ["action"],
      where: { user_id: userId },
      _count: { action: true },
      orderBy: { _count: { action: "desc" } },
      take: 10,
    }),
  ]);

  return {
    data: {
      user,
      activity: logs.map((log) => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
      })),
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
      top_actions: topActions.map((a) => ({
        action: a.action,
        count: a._count.action,
      })),
    },
  };
}

// ══════════════════════════════════════════════
// 10. BROADCAST NOTIFICATIONS
// ══════════════════════════════════════════════

export async function broadcastNotification(
  actor: AuditActor,
  data: {
    title: string;
    title_ar?: string;
    message: string;
    message_ar?: string;
    target_type: string;
    priority?: string;
    course_id?: string;
    group_id?: string;
    user_ids?: string[];
  },
) {
  if (!data.title?.trim() || !data.message?.trim()) {
    return {
      error: "validation" as const,
      message: "title and message are required",
    };
  }

  const validTargets = [
    "ALL_STUDENTS",
    "ALL_TEACHERS",
    "ALL_ADMINS",
    "ALL_USERS",
    "SPECIFIC_STUDENTS",
    "SPECIFIC_TEACHERS",
    "SPECIFIC_ADMINS",
    "GROUP",
    "COURSE",
  ];
  if (!validTargets.includes(data.target_type)) {
    return {
      error: "validation" as const,
      message: `target_type must be one of: ${validTargets.join(", ")}`,
    };
  }

  let recipientUserIds: string[] = [];

  switch (data.target_type) {
    case "ALL_STUDENTS": {
      const users = await prisma.user.findMany({
        where: { role: "STUDENT", is_active: true },
        select: { user_id: true },
      });
      recipientUserIds = users.map((u) => u.user_id);
      break;
    }
    case "ALL_TEACHERS": {
      const users = await prisma.user.findMany({
        where: { role: "TEACHER", is_active: true },
        select: { user_id: true },
      });
      recipientUserIds = users.map((u) => u.user_id);
      break;
    }
    case "ALL_ADMINS": {
      const users = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "OWNER"] }, is_active: true },
        select: { user_id: true },
      });
      recipientUserIds = users.map((u) => u.user_id);
      break;
    }
    case "ALL_USERS": {
      const users = await prisma.user.findMany({
        where: { is_active: true },
        select: { user_id: true },
      });
      recipientUserIds = users.map((u) => u.user_id);
      break;
    }
    case "SPECIFIC_STUDENTS":
    case "SPECIFIC_TEACHERS":
    case "SPECIFIC_ADMINS": {
      if (!data.user_ids?.length) {
        return {
          error: "validation" as const,
          message: "user_ids array is required",
        };
      }
      const existing = await prisma.user.findMany({
        where: { user_id: { in: data.user_ids }, is_active: true },
        select: { user_id: true },
      });
      recipientUserIds = existing.map((u) => u.user_id);
      break;
    }
    case "GROUP": {
      if (!data.group_id)
        return {
          error: "validation" as const,
          message: "group_id is required",
        };
      const enrollments = await prisma.enrollment.findMany({
        where: {
          group_id: data.group_id,
          registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
        },
        include: { student: { select: { user_id: true } } },
      });
      recipientUserIds = enrollments.map((e) => e.student.user_id);
      break;
    }
    case "COURSE": {
      if (!data.course_id)
        return {
          error: "validation" as const,
          message: "course_id is required",
        };
      const enrollments = await prisma.enrollment.findMany({
        where: {
          course_id: data.course_id,
          registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
        },
        include: { student: { select: { user_id: true } } },
      });
      recipientUserIds = enrollments.map((e) => e.student.user_id);
      break;
    }
  }

  if (recipientUserIds.length === 0) {
    return {
      error: "bad_request" as const,
      message: "No recipients found for this target",
    };
  }

  const dbTargetMap: Record<string, string> = {
    ALL_STUDENTS: "ALL_STUDENTS",
    ALL_TEACHERS: "ALL_TEACHERS",
    ALL_ADMINS: "ALL_STUDENTS",
    ALL_USERS: "ALL_STUDENTS",
    SPECIFIC_STUDENTS: "SPECIFIC_STUDENTS",
    SPECIFIC_TEACHERS: "SPECIFIC_TEACHERS",
    SPECIFIC_ADMINS: "SPECIFIC_STUDENTS",
    GROUP: "GROUP",
    COURSE: "COURSE",
  };

  const notification = await prisma.notification.create({
    data: {
      title: data.title,
      title_ar: data.title_ar,
      message: data.message,
      message_ar: data.message_ar,
      target_type: dbTargetMap[data.target_type] as any,
      priority: (data.priority || "NORMAL") as any,
      course_id: data.course_id || null,
      group_id: data.group_id || null,
      created_by: actor.user_id,
      recipients: {
        create: recipientUserIds.map((uid) => ({ user_id: uid })),
      },
    },
    include: { _count: { select: { recipients: true } } },
  });

  await logAuditEvent({
    user_id: actor.user_id,
    user_role: actor.role,
    action: "BROADCAST_NOTIFICATION",
    entity_type: "Notification",
    entity_id: notification.notification_id,
    details: {
      target_type: data.target_type,
      recipients_count: recipientUserIds.length,
      priority: data.priority || "NORMAL",
    },
  });

  emitToUsers(recipientUserIds, "notification:new", {
    notification_id: notification.notification_id,
    title: data.title,
    title_ar: data.title_ar,
    message: data.message,
    message_ar: data.message_ar,
    priority: data.priority || "NORMAL",
    target_type: data.target_type,
    created_at: notification.created_at.toISOString(),
  });

  return {
    data: notification,
    recipients_count: recipientUserIds.length,
  };
}
