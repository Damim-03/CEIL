// ================================================================
// 📌 src/controllers/admin/Notification.controller.ts
// ✅ Refactored: Uses NotificationService (Socket.IO inside service)
// ================================================================

import { Request, Response } from "express";
import { JwtUser } from "../../middlewares/auth.middleware";
import * as NotificationService from "../../services/admin/Notification.service";

// ═══════════════════════════════════════════════════════
// SEND NOTIFICATION
// POST /api/admin/notifications
// ═══════════════════════════════════════════════════════
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
      return res
        .status(400)
        .json({ message: "title and message are required" });
    }

    if (!target_type) {
      return res.status(400).json({ message: "target_type is required" });
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

    // ── Resolve recipients via service ──
    const resolved = await NotificationService.resolveRecipients(target_type, {
      user_ids,
      group_id,
      course_id,
    });

    if (resolved.error) {
      return res.status(400).json({ message: resolved.error });
    }

    if (!resolved.userIds || resolved.userIds.length === 0) {
      return res.status(400).json({
        message: "No recipients found for the selected target",
      });
    }

    // ── Send via service (creates notification + recipients + socket) ──
    const notification =
      await NotificationService.sendNotificationWithRecipients(
        {
          title,
          title_ar,
          message,
          message_ar,
          target_type,
          priority,
          course_id,
          group_id,
          created_by: admin?.user_id,
        },
        resolved.userIds,
      );

    return res.status(201).json({
      message: "Notification sent successfully",
      notification,
      recipients_count: resolved.userIds.length,
    });
  } catch (error: any) {
    console.error("❌ Send notification error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to send notification" });
  }
};

// ═══════════════════════════════════════════════════════
// GET ALL NOTIFICATIONS (Admin view)
// GET /api/admin/notifications?page=1&limit=20
// ═══════════════════════════════════════════════════════
export const getAllNotificationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await NotificationService.listNotifications({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    return res.json(result);
  } catch (error: any) {
    console.error("❌ Get notifications error:", error);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// ═══════════════════════════════════════════════════════
// GET NOTIFICATION BY ID (Admin - with recipients)
// GET /api/admin/notifications/:notificationId
// ═══════════════════════════════════════════════════════
export const getNotificationByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const notification = await NotificationService.getNotificationById(
      req.params.notificationId,
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.json(notification);
  } catch (error: any) {
    console.error("❌ Get notification error:", error);
    return res.status(500).json({ message: "Failed to fetch notification" });
  }
};

// ═══════════════════════════════════════════════════════
// DELETE NOTIFICATION
// DELETE /api/admin/notifications/:notificationId
// ═══════════════════════════════════════════════════════
export const deleteNotificationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await NotificationService.deleteNotification(
      req.params.notificationId,
    );
    if (!result) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.json({ message: "Notification deleted successfully" });
  } catch (error: any) {
    console.error("❌ Delete notification error:", error);
    return res.status(500).json({ message: "Failed to delete notification" });
  }
};

// ═══════════════════════════════════════════════════════
// GET MY NOTIFICATIONS (Student/Teacher view)
// GET /api/student/notifications
// ═══════════════════════════════════════════════════════
export const getMyNotificationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = (req as Request & { user?: JwtUser }).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const result = await NotificationService.getMyNotifications(user.user_id, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      unreadOnly: req.query.unread === "true",
    });

    return res.json(result);
  } catch (error: any) {
    console.error("❌ Get my notifications error:", error);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// ═══════════════════════════════════════════════════════
// MARK AS READ
// PATCH /api/student/notifications/:recipientId/read
// ═══════════════════════════════════════════════════════
export const markNotificationReadController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = (req as Request & { user?: JwtUser }).user;

    const result = await NotificationService.markNotificationRead(
      req.params.recipientId,
      user!.user_id,
    );

    if ("error" in result) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (result.data === "already_read") {
      return res.json({ message: "Already read" });
    }

    return res.json({ message: "Marked as read" });
  } catch (error: any) {
    console.error("❌ Mark read error:", error);
    return res.status(500).json({ message: "Failed to mark as read" });
  }
};

// ═══════════════════════════════════════════════════════
// MARK ALL AS READ
// PATCH /api/student/notifications/read-all
// ═══════════════════════════════════════════════════════
export const markAllNotificationsReadController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = (req as Request & { user?: JwtUser }).user;
    const count = await NotificationService.markAllNotificationsRead(
      user!.user_id,
    );
    return res.json({
      message: "All notifications marked as read",
      count,
    });
  } catch (error: any) {
    console.error("❌ Mark all read error:", error);
    return res.status(500).json({ message: "Failed to mark all as read" });
  }
};

// ═══════════════════════════════════════════════════════
// GET UNREAD COUNT
// GET /api/student/notifications/unread-count
// ═══════════════════════════════════════════════════════
export const getUnreadCountController = async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: JwtUser }).user;
    const count = await NotificationService.getUnreadCount(user!.user_id);
    return res.json({ unread_count: count });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to get unread count" });
  }
};

// ═══════════════════════════════════════════════════════
// GET TARGETING OPTIONS (for admin form)
// GET /api/admin/notifications/targets
// ═══════════════════════════════════════════════════════
export const getNotificationTargetsController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const targets = await NotificationService.getNotificationTargets();
    return res.json(targets);
  } catch (error: any) {
    console.error("❌ Get targets error:", error);
    return res.status(500).json({ message: "Failed to fetch targets" });
  }
};

// ═══════════════════════════════════════════════════════
// SEARCH STUDENTS (for targeting)
// GET /api/admin/notifications/search-students?q=...
// ═══════════════════════════════════════════════════════
export const searchStudentsController = async (req: Request, res: Response) => {
  try {
    const search = String(req.query.q || "").trim();
    const students =
      await NotificationService.searchStudentsForNotification(search);
    return res.json({ students });
  } catch (error: any) {
    console.error("❌ searchStudents error:", error);
    return res
      .status(500)
      .json({ message: "Failed to search students", error: error.message });
  }
};
