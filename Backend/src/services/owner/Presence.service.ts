// ================================================================
// 📌 src/services/owner/Presence.service.ts
// ✅ Real-time user presence tracking
// ✅ Online/Offline status, session duration, page tracking
// ✅ Login/Logout event logging to AuditLog
// ✅ setupPresenceTracking REMOVED — handled in socket.ts
// ================================================================

import { prisma } from "../../prisma/client";
import { logAuditEvent } from "../../middlewares/auditLog.middleware";

// ─── In-Memory Presence Store ────────────────────────────
export interface PresenceData {
  userId: string;
  socketId: string;
  role: string;
  email: string;
  name: string;
  avatar?: string;
  connectedAt: Date;
  lastActivity: Date;
  currentPage: string;
  device: string;
  ip?: string;
}

const onlineUsers = new Map<string, PresenceData>();

// ─── Session History ─────────────────────────────────────
interface SessionRecord {
  userId: string;
  role: string;
  name: string;
  connectedAt: Date;
  disconnectedAt: Date;
  duration: number;
  pagesVisited: string[];
}

const recentSessions: SessionRecord[] = [];
const MAX_SESSION_HISTORY = 500;
const pageVisits = new Map<string, string[]>();

// ═══════════════════════════════════════════════════════════
// PUBLIC API — called from socket.ts
// ═══════════════════════════════════════════════════════════

export function userConnected(data: {
  userId: string;
  socketId: string;
  role: string;
  email: string;
  name: string;
  avatar?: string;
  device?: string;
  ip?: string;
}) {
  const presence: PresenceData = {
    userId: data.userId,
    socketId: data.socketId,
    role: data.role,
    email: data.email,
    name: data.name,
    avatar: data.avatar,
    connectedAt: new Date(),
    lastActivity: new Date(),
    currentPage: "/dashboard",
    device: data.device || "web",
    ip: data.ip,
  };

  onlineUsers.set(data.userId, presence);
  pageVisits.set(data.userId, ["/dashboard"]);

  logAuditEvent({
    user_id: data.userId,
    user_role: data.role as any,
    action: "USER_CONNECTED",
    entity_type: "Session",
    entity_id: data.socketId,
    details: { device: presence.device, ip: data.ip },
  }).catch(() => {});
}

export function userDisconnected(userId: string) {
  const presence = onlineUsers.get(userId);
  if (!presence) return;

  const disconnectedAt = new Date();
  const duration = Math.floor(
    (disconnectedAt.getTime() - presence.connectedAt.getTime()) / 1000,
  );

  const session: SessionRecord = {
    userId,
    role: presence.role,
    name: presence.name,
    connectedAt: presence.connectedAt,
    disconnectedAt,
    duration,
    pagesVisited: pageVisits.get(userId) || [],
  };

  recentSessions.unshift(session);
  if (recentSessions.length > MAX_SESSION_HISTORY) {
    recentSessions.pop();
  }

  logAuditEvent({
    user_id: userId,
    user_role: presence.role as any,
    action: "USER_DISCONNECTED",
    entity_type: "Session",
    entity_id: presence.socketId,
    details: {
      duration_seconds: duration,
      duration_human: formatDuration(duration),
      pages_visited: session.pagesVisited.length,
    },
  }).catch(() => {});

  persistSession(session).catch(() => {});

  onlineUsers.delete(userId);
  pageVisits.delete(userId);
}

export function userPageChanged(userId: string, page: string) {
  const presence = onlineUsers.get(userId);
  if (!presence) return;

  presence.currentPage = page;
  presence.lastActivity = new Date();
  onlineUsers.set(userId, presence);

  const pages = pageVisits.get(userId) || [];
  if (!pages.includes(page)) {
    pages.push(page);
    pageVisits.set(userId, pages);
  }
}

export function userHeartbeat(userId: string) {
  const presence = onlineUsers.get(userId);
  if (!presence) return;
  presence.lastActivity = new Date();
  onlineUsers.set(userId, presence);
}

// ═══════════════════════════════════════════════════════════
// QUERY API — called from activity.controller.ts
// ═══════════════════════════════════════════════════════════

export function getOnlineUsers(): {
  total: number;
  byRole: Record<string, number>;
  users: (PresenceData & { sessionDuration?: number })[];
} {
  const users = Array.from(onlineUsers.values());
  const byRole: Record<string, number> = {};

  users.forEach((u) => {
    byRole[u.role] = (byRole[u.role] || 0) + 1;
  });

  return {
    total: users.length,
    byRole,
    users: users.map((u) => ({
      ...u,
      sessionDuration: Math.floor(
        (Date.now() - u.connectedAt.getTime()) / 1000,
      ),
    })),
  };
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}

export function getRecentSessions(options?: {
  role?: string;
  limit?: number;
}): SessionRecord[] {
  let sessions = [...recentSessions];
  if (options?.role) {
    sessions = sessions.filter((s) => s.role === options.role);
  }
  return sessions.slice(0, options?.limit || 50);
}

export function getPresenceStats(): {
  onlineNow: number;
  onlineByRole: Record<string, number>;
  peakToday: number;
  avgSessionDuration: number;
  totalSessionsToday: number;
  activePages: Record<string, number>;
} {
  const users = Array.from(onlineUsers.values());
  const onlineByRole: Record<string, number> = {};
  const activePages: Record<string, number> = {};

  users.forEach((u) => {
    onlineByRole[u.role] = (onlineByRole[u.role] || 0) + 1;
    activePages[u.currentPage] = (activePages[u.currentPage] || 0) + 1;
  });

  const todaySessions = recentSessions.filter(
    (s) => s.disconnectedAt.getTime() > Date.now() - 24 * 60 * 60 * 1000,
  );

  const avgDuration =
    todaySessions.length > 0
      ? Math.floor(
          todaySessions.reduce((sum, s) => sum + s.duration, 0) /
            todaySessions.length,
        )
      : 0;

  return {
    onlineNow: users.length,
    onlineByRole,
    peakToday: Math.max(users.length, todaySessions.length),
    avgSessionDuration: avgDuration,
    totalSessionsToday: todaySessions.length,
    activePages,
  };
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

async function persistSession(session: SessionRecord) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: session.userId,
        user_role: session.role as any,
        action: "SESSION_COMPLETED",
        entity_type: "Session",
        entity_id: `session_${Date.now()}`,
        details: JSON.stringify({
          duration_seconds: session.duration,
          duration_human: formatDuration(session.duration),
          pages_visited: session.pagesVisited,
          pages_count: session.pagesVisited.length,
          connected_at: session.connectedAt.toISOString(),
          disconnected_at: session.disconnectedAt.toISOString(),
        }),
        ip_address: null,
      },
    });
  } catch {
    // Silently fail
  }
}
