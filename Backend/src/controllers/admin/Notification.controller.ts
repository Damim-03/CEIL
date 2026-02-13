import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { JwtUser } from "../../middlewares/auth.middleware";

export const sendNotificationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const admin = (req as Request & { user?: JwtUser }).user;
    const {
      title,
      title_ar,
      message,
      message_ar,
      target_type,
      priority = "NORMAL",
      course_id,
      group_id,
      user_ids,
    } = req.body;

    // ── Validation ──
    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        message: "title and message are required",
      });
    }

    if (!target_type) {
      return res.status(400).json({
        message: "target_type is required",
      });
    }

    const validTargets = [
      "ALL_STUDENTS",
      "ALL_TEACHERS",
      "SPECIFIC_STUDENTS",
      "SPECIFIC_TEACHERS",
      "GROUP",
      "COURSE",
    ];

    if (!validTargets.includes(target_type)) {
      return res.status(400).json({
        message: `target_type must be one of: ${validTargets.join(", ")}`,
      });
    }

    // ── Resolve recipient user_ids based on target_type ──
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

      case "SPECIFIC_STUDENTS":
      case "SPECIFIC_TEACHERS": {
        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
          return res.status(400).json({
            message: "user_ids array is required for specific targeting",
          });
        }
        // Validate that all user_ids exist
        const users = await prisma.user.findMany({
          where: { user_id: { in: user_ids }, is_active: true },
          select: { user_id: true },
        });
        recipientUserIds = users.map((u) => u.user_id);

        if (recipientUserIds.length === 0) {
          return res.status(400).json({
            message: "No valid users found for the provided user_ids",
          });
        }
        break;
      }

      case "GROUP": {
        if (!group_id) {
          return res.status(400).json({
            message: "group_id is required when target_type is GROUP",
          });
        }

        const group = await prisma.group.findUnique({
          where: { group_id },
        });

        if (!group) {
          return res.status(404).json({ message: "Group not found" });
        }

        // Get all students enrolled in this group
        const enrollments = await prisma.enrollment.findMany({
          where: {
            group_id,
            registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
          },
          include: {
            student: {
              select: { user_id: true },
            },
          },
        });

        recipientUserIds = enrollments.map((e) => e.student.user_id);

        // Also include the group teacher if exists
        if (group.teacher_id) {
          const teacherUser = await prisma.user.findFirst({
            where: { teacher_id: group.teacher_id },
            select: { user_id: true },
          });
          if (teacherUser) {
            recipientUserIds.push(teacherUser.user_id);
          }
        }
        break;
      }

      case "COURSE": {
        if (!course_id) {
          return res.status(400).json({
            message: "course_id is required when target_type is COURSE",
          });
        }

        const course = await prisma.course.findUnique({
          where: { course_id },
        });

        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }

        // Get all students enrolled in this course
        const enrollments = await prisma.enrollment.findMany({
          where: {
            course_id,
            registration_status: {
              in: ["PENDING", "VALIDATED", "PAID", "FINISHED"],
            },
          },
          include: {
            student: {
              select: { user_id: true },
            },
          },
        });

        recipientUserIds = enrollments.map((e) => e.student.user_id);
        break;
      }
    }

    // Remove duplicates
    recipientUserIds = [...new Set(recipientUserIds)];

    if (recipientUserIds.length === 0) {
      return res.status(400).json({
        message: "No recipients found for the selected target",
      });
    }

    // ── Create notification + recipients in transaction ──
    const result = await prisma.$transaction(async (tx) => {
      const notification = await tx.notification.create({
        data: {
          title: title.trim(),
          title_ar: title_ar?.trim() || null,
          message: message.trim(),
          message_ar: message_ar?.trim() || null,
          target_type,
          priority,
          course_id: course_id || null,
          group_id: group_id || null,
          created_by: admin?.user_id || null,
        },
      });

      // Create recipient records
      await tx.notificationRecipient.createMany({
        data: recipientUserIds.map((user_id) => ({
          notification_id: notification.notification_id,
          user_id,
        })),
      });

      return notification;
    });

    return res.status(201).json({
      message: "Notification sent successfully",
      notification: result,
      recipients_count: recipientUserIds.length,
    });
  } catch (error: any) {
    console.error("❌ Send notification error:", error);
    return res.status(500).json({
      message: error.message || "Failed to send notification",
    });
  }
};

// ================================================================
// GET ALL NOTIFICATIONS (Admin view)
// GET /api/admin/notifications?page=1&limit=20
// ================================================================
export const getAllNotificationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          course: {
            select: { course_id: true, course_name: true },
          },
          group: {
            select: { group_id: true, name: true },
          },
          _count: {
            select: { recipients: true },
          },
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
      recipients: undefined, // Remove raw recipients from response
      _count: undefined,
    }));

    return res.json({
      data,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("❌ Get notifications error:", error);
    return res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};

// ================================================================
// GET NOTIFICATION BY ID (Admin - with recipient details)
// GET /api/admin/notifications/:notificationId
// ================================================================
export const getNotificationByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { notificationId } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { notification_id: notificationId },
      include: {
        course: {
          select: { course_id: true, course_name: true },
        },
        group: {
          select: { group_id: true, name: true },
        },
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

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json(notification);
  } catch (error: any) {
    console.error("❌ Get notification error:", error);
    return res.status(500).json({ message: "Failed to fetch notification" });
  }
};

// ================================================================
// DELETE NOTIFICATION
// DELETE /api/admin/notifications/:notificationId
// ================================================================
export const deleteNotificationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { notificationId } = req.params;

    const exists = await prisma.notification.findUnique({
      where: { notification_id: notificationId },
    });

    if (!exists) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await prisma.notification.delete({
      where: { notification_id: notificationId },
    });

    return res.json({ message: "Notification deleted successfully" });
  } catch (error: any) {
    console.error("❌ Delete notification error:", error);
    return res.status(500).json({ message: "Failed to delete notification" });
  }
};

// ================================================================
// GET MY NOTIFICATIONS (Student/Teacher view)
// GET /api/student/notifications OR /api/teacher/notifications
// ================================================================
export const getMyNotificationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = (req as Request & { user?: JwtUser }).user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const unreadOnly = req.query.unread === "true";

    const where: any = {
      user_id: user.user_id,
    };

    if (unreadOnly) {
      where.is_read = false;
    }

    const [recipients, total, unreadCount] = await Promise.all([
      prisma.notificationRecipient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          notification: {
            include: {
              course: {
                select: { course_name: true },
              },
              group: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { notification: { created_at: "desc" } },
      }),
      prisma.notificationRecipient.count({ where }),
      prisma.notificationRecipient.count({
        where: { user_id: user.user_id, is_read: false },
      }),
    ]);

    const data = recipients.map((r) => ({
      recipient_id: r.recipient_id,
      is_read: r.is_read,
      read_at: r.read_at,
      ...r.notification,
    }));

    return res.json({
      data,
      unread_count: unreadCount,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("❌ Get my notifications error:", error);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// ================================================================
// MARK NOTIFICATION AS READ
// PATCH /api/student/notifications/:recipientId/read
// ================================================================
export const markNotificationReadController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = (req as Request & { user?: JwtUser }).user;
    const { recipientId } = req.params;

    const recipient = await prisma.notificationRecipient.findFirst({
      where: {
        recipient_id: recipientId,
        user_id: user?.user_id,
      },
    });

    if (!recipient) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (recipient.is_read) {
      return res.json({ message: "Already read" });
    }

    await prisma.notificationRecipient.update({
      where: { recipient_id: recipientId },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return res.json({ message: "Marked as read" });
  } catch (error: any) {
    console.error("❌ Mark read error:", error);
    return res.status(500).json({ message: "Failed to mark as read" });
  }
};

// ================================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/student/notifications/read-all
// ================================================================
export const markAllNotificationsReadController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = (req as Request & { user?: JwtUser }).user;

    const result = await prisma.notificationRecipient.updateMany({
      where: {
        user_id: user?.user_id,
        is_read: false,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return res.json({
      message: "All notifications marked as read",
      count: result.count,
    });
  } catch (error: any) {
    console.error("❌ Mark all read error:", error);
    return res.status(500).json({ message: "Failed to mark all as read" });
  }
};

// ================================================================
// GET UNREAD COUNT
// GET /api/student/notifications/unread-count
// ================================================================
export const getUnreadCountController = async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: JwtUser }).user;

    const count = await prisma.notificationRecipient.count({
      where: {
        user_id: user?.user_id,
        is_read: false,
      },
    });

    return res.json({ unread_count: count });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to get unread count" });
  }
};

// ================================================================
// HELPER: Get targeting options for admin form
// GET /api/admin/notifications/targets
// ================================================================
export const getNotificationTargetsController = async (
  _req: Request,
  res: Response,
) => {
  try {
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
          course: {
            select: { course_name: true },
          },
          teacher: {
            select: { first_name: true, last_name: true },
          },
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
          user: {
            select: { user_id: true },
          },
        },
        orderBy: { first_name: "asc" },
      }),
    ]);

    return res.json({
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
    });
  } catch (error: any) {
    console.error("❌ Get targets error:", error);
    return res.status(500).json({ message: "Failed to fetch targets" });
  }
};
  
// Search students for notification targeting
export const searchStudentsController = async (req: any, res: any) => {
  try {
    const search = String(req.query.q || "").trim();
    if (search.length < 2) return res.json({ students: [] });

    const users = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        is_active: true,
        OR: [
          {
            student: { first_name: { contains: search, mode: "insensitive" } },
          },
          { student: { last_name: { contains: search, mode: "insensitive" } } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
      include: {
        student: true,
      },
      take: 20,
    });

    res.json({
      students: users
        .filter((u: any) => u.student)
        .map((u: any) => ({
          student_id: u.student.student_id,
          first_name: u.student.first_name,
          last_name: u.student.last_name,
          email: u.email || u.student.email || "",
          user_id: u.user_id,
        })),
    });
  } catch (error: any) {
    console.error("❌ searchStudents error:", error);
    res
      .status(500)
      .json({ message: "Failed to search students", error: error.message });
  }
};
