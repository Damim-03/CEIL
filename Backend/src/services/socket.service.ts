// ================================================================
// 📌 src/services/socket.service.ts — NEW FILE
// ✅ Central event emitter — import this in controllers
// ✅ All emits are fire-and-forget (never block the response)
// ================================================================

import { getIO } from "../config/socket";

/* ── Emit to ALL connected users ── */
export function emitToAll(event: string, data: any) {
  try { getIO().emit(event, data); } catch {}
}

/* ── Emit to a specific user ── */
export function emitToUser(userId: string, event: string, data: any) {
  try { getIO().to(`user:${userId}`).emit(event, data); } catch {}
}

/* ── Emit to multiple users ── */
export function emitToUsers(userIds: string[], event: string, data: any) {
  try {
    const io = getIO();
    userIds.forEach((uid) => io.to(`user:${uid}`).emit(event, data));
  } catch {}
}

/* ── Emit to a role: OWNER | ADMIN | TEACHER | STUDENT ── */
export function emitToRole(role: string, event: string, data: any) {
  try { getIO().to(`role:${role}`).emit(event, data); } catch {}
}

/* ── Emit to OWNER + ADMIN (admin-level room) ── */
export function emitToAdminLevel(event: string, data: any) {
  try { getIO().to("role:ADMIN_LEVEL").emit(event, data); } catch {}
}

/* ── Emit to a group room ── */
export function emitToGroup(groupId: string, event: string, data: any) {
  try { getIO().to(`group:${groupId}`).emit(event, data); } catch {}
}

/* ── Shortcut: refresh admin/owner dashboards ── */
export function triggerDashboardRefresh(reason: string) {
  emitToAdminLevel("dashboard:refresh", { reason });
}