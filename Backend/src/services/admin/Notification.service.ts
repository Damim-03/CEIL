// ================================================================
// 📦 src/services/notification.service.ts
// ✅ Notification management — shared between Admin & Owner
// 🔌 Socket.IO events included
// ================================================================

import { prisma } from "../../prisma/client";
import { emitToUsers } from "../socket.service";

// ─── RESOLVE RECIPIENTS ─────────────────────────────────

export async function resolveRecipients(
  target_type: string,
  options: {
    user_ids?: string[];
    group_id?: string;
    course_id?: string;
  },
): Promise<{ userIds?: string[]; error?: string }> {
  let recipientUserIds: string[] = [];

  switch (target_type) {
    case "ALL_STUDENTS": {
      const students = await prisma.user.findMany({
        where: { role: "STUDENT", is_active: true },
        select: { user_id: true },
      });
      recipientUserIds = students.map((s) => s.user_id);
      break;
    }

    case "ALL_TEACHERS": {
      const teachers = await prisma.user.findMany({
        where: { role: "TEACHER", is_active: true },
        select: { user_id: true },
      });
      recipientUserIds = teachers.map((t) => t.user_id);
      break;
    }

    // ── Owner-only targets ──
    case "ALL_ADMINS": {
      const admins = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "OWNER"] }, is_active: true },
        select: { user_id: true },
      });
      recipientUserIds = admins.map((a) => a.user_id);
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
      if (
        !options.user_ids ||
        !Array.isArray(options.user_ids) ||
        options.user_ids.length === 0
      ) {
        return {
          error: "user_ids array is required for specific targeting",
        };
      }
      const users = await prisma.user.findMany({
        where: { user_id: { in: options.user_ids }, is_active: true },
        select: { user_id: true },
      });
      recipientUserIds = users.map((u) => u.user_id);

      if (recipientUserIds.length === 0) {
        return {
          error: "No valid users found for the provided user_ids",
        };
      }
      break;
    }

    case "GROUP": {
      if (!options.group_id) {
        return {
          error: "group_id is required when target_type is GROUP",
        };
      }

      const group = await prisma.group.findUnique({
        where: { group_id: options.group_id },
      });
      if (!group) return { error: "Group not found" };

      const enrollments = await prisma.enrollment.findMany({
        where: {
          group_id: options.group_id,
          registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
        },
        include: { student: { select: { user_id: true } } },
      });
      recipientUserIds = enrollments.map((e) => e.student.user_id);

      // Include group teacher
      if (group.teacher_id) {
        const teacherUser = await prisma.user.findFirst({
          where: { teacher_id: group.teacher_id },
          select: { user_id: true },
        });
        if (teacherUser) recipientUserIds.push(teacherUser.user_id);
      }
      break;
    }

    case "COURSE": {
      if (!options.course_id) {
        return {
          error: "course_id is required when target_type is COURSE",
        };
      }

      const course = await prisma.course.findUnique({
        where: { course_id: options.course_id },
      });
      if (!course) return { error: "Course not found" };

      const enrollments = await prisma.enrollment.findMany({
        where: {
          course_id: options.course_id,
          registration_status: {
            in: ["PENDING", "VALIDATED", "PAID", "FINISHED"],
          },
        },
        include: { student: { select: { user_id: true } } },
      });
      recipientUserIds = enrollments.map((e) => e.student.user_id);
      break;
    }
  }

  // Remove duplicates
  recipientUserIds = [...new Set(recipientUserIds)];

  return { userIds: recipientUserIds };
}

// ─── SEND NOTIFICATION WITH RECIPIENTS ───────────────────

export async function sendNotificationWithRecipients(
  input: {
    title: string;
    title_ar?: string;
    message: string;
    message_ar?: string;
    target_type: string;
    priority?: string;
    course_id?: string;
    group_id?: string;
    created_by?: string;
  },
  recipientUserIds: string[],
) {
  const notification = await prisma.$transaction(async (tx) => {
    const notif = await tx.notification.create({
      data: {
        title: input.title.trim(),
        title_ar: input.title_ar?.trim() || null,
        message: input.message.trim(),
        message_ar: input.message_ar?.trim() || null,
        target_type: input.target_type as any,
        priority: (input.priority || "NORMAL") as any,
        course_id: input.course_id || null,
        group_id: input.group_id || null,
        created_by: input.created_by || null,
      },
    });

    await tx.notificationRecipient.createMany({
      data: recipientUserIds.map((user_id) => ({
        notification_id: notif.notification_id,
        user_id,
      })),
    });

    return notif;
  });

  // 🔌 Socket: push real-time notification
  emitToUsers(recipientUserIds, "notification:new", {
    notification_id: notification.notification_id,
    title: notification.title,
    title_ar: notification.title_ar,
    message: notification.message,
    message_ar: notification.message_ar,
    priority: notification.priority,
    target_type: notification.target_type,
    created_at: notification.created_at.toISOString(),
  });

  return notification;
}

// ─── LIST NOTIFICATIONS (Admin view) ─────────────────────

export async function listNotifications(params: {
  page?: number;
  limit?: number;
}) {
  const page = params.page || 1;
  const limit = params.limit || 20;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        course: { select: { course_id: true, course_name: true } },
        group: { select: { group_id: true, name: true } },
        _count: { select: { recipients: true } },
        recipients: {
          where: { is_read: true },
          select: { recipient_id: true },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.notification.count(),
  ]);

  const data = notifications.map((n) => ({
    ...n,
    total_recipients: n._count.recipients,
    read_count: n.recipients.length,
    recipients: undefined,
    _count: undefined,
  }));

  return {
    data,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

// ─── GET BY ID (Admin - with recipients) ─────────────────

export async function getNotificationById(notificationId: string) {
  return prisma.notification.findUnique({
    where: { notification_id: notificationId },
    include: {
      course: { select: { course_id: true, course_name: true } },
      group: { select: { group_id: true, name: true } },
      recipients: {
        include: {
          user: {
            select: {
              user_id: true,
              email: true,
              role: true,
              google_avatar: true,
              student: {
                select: { first_name: true, last_name: true },
              },
              teacher: {
                select: { first_name: true, last_name: true },
              },
            },
          },
        },
        orderBy: { is_read: "asc" },
      },
    },
  });
}

// ─── DELETE ──────────────────────────────────────────────

export async function deleteNotification(notificationId: string) {
  const exists = await prisma.notification.findUnique({
    where: { notification_id: notificationId },
  });

  if (!exists) return null;

  await prisma.notification.delete({
    where: { notification_id: notificationId },
  });

  return true;
}

// ─── GET TARGETS (for admin form) ────────────────────────

export async function getNotificationTargets() {
  const [courses, groups, teachers] = await Promise.all([
    prisma.course.findMany({
      select: {
        course_id: true,
        course_name: true,
        course_code: true,
        _count: {
          select: {
            enrollments: {
              where: {
                registration_status: {
                  in: ["VALIDATED", "PAID", "FINISHED"],
                },
              },
            },
          },
        },
      },
      orderBy: { course_name: "asc" },
    }),
    prisma.group.findMany({
      select: {
        group_id: true,
        name: true,
        level: true,
        course: { select: { course_name: true } },
        teacher: { select: { first_name: true, last_name: true } },
        _count: {
          select: {
            enrollments: {
              where: {
                registration_status: {
                  in: ["VALIDATED", "PAID", "FINISHED"],
                },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.teacher.findMany({
      select: {
        teacher_id: true,
        first_name: true,
        last_name: true,
        email: true,
        user: { select: { user_id: true } },
      },
      orderBy: { first_name: "asc" },
    }),
  ]);

  return {
    courses: courses.map((c) => ({
      ...c,
      student_count: c._count.enrollments,
      _count: undefined,
    })),
    groups: groups.map((g) => ({
      ...g,
      student_count: g._count.enrollments,
      _count: undefined,
    })),
    teachers: teachers.map((t) => ({
      ...t,
      user_id: t.user?.user_id,
      user: undefined,
    })),
  };
}

// ─── SEARCH STUDENTS (for notification targeting) ────────

export async function searchStudentsForNotification(search: string) {
  if (search.trim().length < 2) return [];

  const users = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      is_active: true,
      OR: [
        {
          student: {
            first_name: { contains: search },
          },
        },
        {
          student: {
            last_name: { contains: search },
          },
        },
        { email: { contains: search } },
      ],
    },
    include: { student: true },
    take: 20,
  });

  return users
    .filter((u: any) => u.student)
    .map((u: any) => ({
      student_id: u.student.student_id,
      first_name: u.student.first_name,
      last_name: u.student.last_name,
      email: u.email || u.student.email || "",
      user_id: u.user_id,
    }));
}

export async function searchUsersForNotification(
  search: string,
  targetType?: string,
) {
  if (search.trim().length < 2) return [];

  // Determine role filter based on target type
  let roleFilter: any = { role: "STUDENT" };
  if (targetType === "SPECIFIC_TEACHERS") {
    roleFilter = { role: "TEACHER" };
  } else if (targetType === "SPECIFIC_ADMINS") {
    roleFilter = { role: { in: ["ADMIN", "OWNER"] } };
  }

  const users = await prisma.user.findMany({
    where: {
      ...roleFilter,
      is_active: true,
      OR: [
        { email: { contains: search } },
        { student: { first_name: { contains: search } } },
        { student: { last_name: { contains: search } } },
        { teacher: { first_name: { contains: search } } },
        { teacher: { last_name: { contains: search } } },
      ],
    },
    include: { student: true, teacher: true },
    take: 20,
  });

  return users.map((u) => ({
    user_id: u.user_id,
    first_name:
      u.student?.first_name || u.teacher?.first_name || u.email.split("@")[0],
    last_name: u.student?.last_name || u.teacher?.last_name || "",
    email: u.email,
  }));
}

// ─── GET MY NOTIFICATIONS (Student/Teacher) ──────────────

export async function getMyNotifications(
  userId: string,
  params: { page?: number; limit?: number; unreadOnly?: boolean },
) {
  const page = params.page || 1;
  const limit = params.limit || 20;

  const where: any = { user_id: userId };
  if (params.unreadOnly) where.is_read = false;

  const [recipients, total, unreadCount] = await Promise.all([
    prisma.notificationRecipient.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        notification: {
          include: {
            course: { select: { course_name: true } },
            group: { select: { name: true } },
          },
        },
      },
      orderBy: { notification: { created_at: "desc" } },
    }),
    prisma.notificationRecipient.count({ where }),
    prisma.notificationRecipient.count({
      where: { user_id: userId, is_read: false },
    }),
  ]);

  const data = recipients.map((r) => ({
    recipient_id: r.recipient_id,
    is_read: r.is_read,
    read_at: r.read_at,
    ...r.notification,
  }));

  return {
    data,
    unread_count: unreadCount,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

// ─── MARK AS READ ────────────────────────────────────────

export async function markNotificationRead(
  recipientId: string,
  userId: string,
) {
  const recipient = await prisma.notificationRecipient.findFirst({
    where: { recipient_id: recipientId, user_id: userId },
  });

  if (!recipient) return { error: "not_found" as const };
  if (recipient.is_read) return { data: "already_read" as const };

  await prisma.notificationRecipient.update({
    where: { recipient_id: recipientId },
    data: { is_read: true, read_at: new Date() },
  });

  return { data: "marked" as const };
}

// ─── MARK ALL AS READ ────────────────────────────────────

export async function markAllNotificationsRead(userId: string) {
  const result = await prisma.notificationRecipient.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true, read_at: new Date() },
  });

  return result.count;
}

// ─── UNREAD COUNT ────────────────────────────────────────

export async function getUnreadCount(userId: string) {
  return prisma.notificationRecipient.count({
    where: { user_id: userId, is_read: false },
  });
}
