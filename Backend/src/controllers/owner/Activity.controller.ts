// ================================================================
// 📌 src/controllers/owner/activity.controller.ts
// ✅ FIXED: Matches AuditLog schema exactly
//
// AuditLog schema fields:
//   log_id      String   @id @default(uuid()) @db.Uuid
//   user_id     String?  @db.Uuid
//   user_email  String?  @db.VarChar(100)
//   user_role   String?  @db.VarChar(20)
//   action      String   @db.VarChar(50)
//   entity_type String   @db.VarChar(50)
//   entity_id   String?  @db.VarChar(100)
//   details     String?  @db.Text            ← JSON string, NOT object
//   ip_address  String?  @db.VarChar(45)
//   created_at  DateTime @default(now())
//
// ❌ NO relation to User model
// ❌ NO 'audit_id' field (it's 'log_id')
// ❌ NO 'performed_at' field (it's 'created_at')
// ================================================================

import { Request, Response } from "express";
import * as PresenceService from "../../services/owner/Presence.service";
import { prisma } from "../../prisma/client";

// ─── Helper: safely parse JSON details string ─────────────
function parseDetails(raw: string | null): Record<string, any> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ─── Helper: map AuditLog row → API response shape ───────
function mapLogToResponse(
  log: {
    log_id: string;
    user_id: string | null;
    user_email: string | null;
    user_role: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    details: string | null;
    ip_address: string | null;
    created_at: Date;
  },
  extra?: {
    isOnline?: boolean;
    avatar?: string | null;
  },
) {
  return {
    id: log.log_id,
    action: log.action,
    entityType: log.entity_type,
    entityId: log.entity_id,
    details: parseDetails(log.details),
    performedAt: log.created_at,
    user: log.user_id
      ? {
          id: log.user_id,
          email: log.user_email,
          role: log.user_role,
          avatar: extra?.avatar ?? null,
          ...(extra?.isOnline !== undefined
            ? { isOnline: extra.isOnline }
            : {}),
        }
      : null,
  };
}

// ─── Helper: batch-fetch avatars from User table ──────────
async function fetchAvatarMap(
  userIds: string[],
): Promise<Map<string, string | null>> {
  if (userIds.length === 0) return new Map();

  const unique = [...new Set(userIds)];
  const users = await prisma.user.findMany({
    where: { user_id: { in: unique } },
    select: { user_id: true, google_avatar: true },
  });

  return new Map(users.map((u) => [u.user_id, u.google_avatar]));
}

// ═══════════════════════════════════════════════════════════
// CONTROLLERS
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/owner/activity/online
 */
export const getOnlineUsersController = async (_: Request, res: Response) => {
  try {
    const data = PresenceService.getOnlineUsers();
    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ message: e.message || "Failed" });
  }
};

/**
 * GET /api/owner/activity/presence-stats
 */
export const getPresenceStatsController = async (_: Request, res: Response) => {
  try {
    const stats = PresenceService.getPresenceStats();
    return res.json(stats);
  } catch (e: any) {
    return res.status(500).json({ message: e.message || "Failed" });
  }
};

/**
 * GET /api/owner/activity/sessions
 */
export const getRecentSessionsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { role, limit } = req.query;
    const sessions = PresenceService.getRecentSessions({
      role: role as string,
      limit: Number(limit) || 50,
    });
    return res.json({ total: sessions.length, sessions });
  } catch (e: any) {
    return res.status(500).json({ message: e.message || "Failed" });
  }
};

/**
 * GET /api/owner/activity/user/:userId/online
 */
export const getUserOnlineStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userId } = req.params;
    const onlineData = PresenceService.getOnlineUsers();
    const user = onlineData.users.find((u) => u.userId === userId);

    return res.json({
      isOnline: !!user,
      ...(user
        ? {
            currentPage: user.currentPage,
            connectedAt: user.connectedAt,
            lastActivity: user.lastActivity,
            device: user.device,
            sessionDuration: Math.floor(
              (Date.now() - new Date(user.connectedAt).getTime()) / 1000,
            ),
          }
        : {}),
    });
  } catch (e: any) {
    return res.status(500).json({ message: e.message || "Failed" });
  }
};

/**
 * GET /api/owner/activity/timeline
 * ✅ Uses: log_id, created_at, NO include (no user relation)
 */
export const getActivityTimelineController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      page = "1",
      limit = "30",
      role,
      action,
      entity_type,
      from,
      to,
    } = req.query as Record<string, string>;

    const pageNum = Number(page);
    const limitNum = Math.min(Number(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    // ✅ Build where clause using actual schema fields
    const where: any = {};

    if (action) {
      where.action = action;
    } else {
      where.action = {
        notIn: ["SESSION_COMPLETED", "USER_CONNECTED", "USER_DISCONNECTED"],
      };
    }

    if (role) where.user_role = role; // ✅ user_role: String? @db.VarChar(20)
    if (entity_type) where.entity_type = entity_type;

    if (from || to) {
      where.created_at = {}; // ✅ created_at, NOT performed_at
      if (from) where.created_at.gte = new Date(from);
      if (to) where.created_at.lte = new Date(to);
    }

    // ✅ NO include — AuditLog has no relation to User
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { created_at: "desc" }, // ✅ created_at
        skip,
        take: limitNum,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // ✅ Batch-fetch avatars separately
    const userIds = logs
      .map((l) => l.user_id)
      .filter((id): id is string => !!id);
    const avatarMap = await fetchAvatarMap(userIds);

    const data = logs.map((log) =>
      mapLogToResponse(log, {
        isOnline: log.user_id
          ? PresenceService.isUserOnline(log.user_id)
          : undefined,
        avatar: log.user_id ? (avatarMap.get(log.user_id) ?? null) : null,
      }),
    );

    return res.json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (e: any) {
    return res.status(500).json({ message: e.message || "Failed" });
  }
};

/**
 * GET /api/owner/activity/login-history
 * ✅ Uses: log_id, created_at, NO include
 */
export const getLoginHistoryController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      page = "1",
      limit = "30",
      user_id,
      from,
      to,
    } = req.query as Record<string, string>;

    const pageNum = Number(page);
    const limitNum = Math.min(Number(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      action: {
        in: [
          "USER_CONNECTED",
          "USER_DISCONNECTED",
          "SESSION_COMPLETED",
          "LOGIN",
          "LOGOUT",
        ],
      },
    };

    if (user_id) where.user_id = user_id; // ✅ user_id: String? @db.Uuid
    if (from || to) {
      where.created_at = {}; // ✅ created_at
      if (from) where.created_at.gte = new Date(from);
      if (to) where.created_at.lte = new Date(to);
    }

    // ✅ NO include
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { created_at: "desc" }, // ✅ created_at
        skip,
        take: limitNum,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // ✅ Batch-fetch avatars
    const userIds = logs
      .map((l) => l.user_id)
      .filter((id): id is string => !!id);
    const avatarMap = await fetchAvatarMap(userIds);

    const data = logs.map((log) =>
      mapLogToResponse(log, {
        avatar: log.user_id ? (avatarMap.get(log.user_id) ?? null) : null,
      }),
    );

    return res.json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (e: any) {
    return res.status(500).json({ message: e.message || "Failed" });
  }
};
