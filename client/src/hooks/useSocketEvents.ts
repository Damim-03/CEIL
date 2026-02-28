// ================================================================
// 📌 src/hooks/useSocketEvents.ts — NEW FILE
// ✅ Listens to Socket.IO events → auto-invalidates React Query
// ✅ Role-aware: each role only handles relevant events
// ✅ Drop-in: just call useSocketEvents() in your layout
// ================================================================

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../context/SocketContext";
import { toast } from "sonner";
import axiosInstance from "../lib/api/axios";

/* ══════════════════════════════════════════════════════════════
   EVENT → QUERY KEY MAPPING
   
   When a socket event fires, we invalidate the matching 
   React Query keys so the UI auto-refreshes.
══════════════════════════════════════════════════════════════ */

// ─── Admin query keys (from useAdmin.hooks.ts) ───
const ADMIN_INVALIDATION_MAP: Record<string, string[][]> = {
  // Students
  "student:created": [["admin-students"], ["admin-dashboard"]],
  "student:deleted": [["admin-students"], ["admin-dashboard"]],

  // Teachers
  "teacher:created": [["admin-teachers"], ["admin-dashboard"], ["admin-users"]],
  "teacher:deleted": [["admin-teachers"], ["admin-dashboard"]],

  // Users
  "user:enabled": [["admin-users"]],
  "user:disabled": [["admin-users"]],
  "user:roleChanged": [["admin-users"], ["admin-dashboard"]],

  // Enrollments
  "enrollment:statusChanged": [
    ["admin-enrollments"],
    ["admin-dashboard"],
    ["admin-fees"],
  ],

  // Fees
  "fee:created": [["admin-fees"], ["admin-dashboard"]],
  "fee:paid": [["admin-fees"], ["admin-enrollments"], ["admin-dashboard"]],
  "fee:deleted": [["admin-fees"], ["admin-dashboard"]],

  // Documents
  "document:approved": [
    ["admin-documents"],
    ["admin-enrollments"],
    ["admin-students"],
  ],
  "document:rejected": [
    ["admin-documents"],
    ["admin-enrollments"],
    ["admin-students"],
  ],

  // Sessions
  "session:created": [
    ["admin", "sessions"],
    ["admin-rooms"],
    ["admin-rooms-overview"],
  ],
  "session:deleted": [
    ["admin", "sessions"],
    ["admin-rooms"],
    ["admin-rooms-overview"],
  ],

  // Attendance
  "attendance:marked": [["admin-attendance"]],
  "attendance:updated": [["admin-attendance"]],

  // Groups
  "group:studentAdded": [["admin-groups"], ["admin-enrollments"]],
  "group:studentRemoved": [["admin-groups"], ["admin-enrollments"]],
  "group:instructorAssigned": [["admin-groups"]],

  // Announcements
  "announcement:published": [
    ["admin-announcements"],
    ["public", "announcements"],
  ],
  "announcement:unpublished": [
    ["admin-announcements"],
    ["public", "announcements"],
  ],
  "announcement:pinned": [
    // ✅ NEW
    ["admin-announcements"],
    ["public", "announcements"],
  ],
  "announcement:unpinned": [
    // ✅ NEW
    ["admin-announcements"],
    ["public", "announcements"],
  ],
  "announcement:deleted": [
    ["admin-announcements"],
    ["public", "announcements"], // ✅ ADDED — was missing
  ],

  // Rooms
  "room:created": [["admin-rooms"]],
  "room:updated": [["admin-rooms"], ["admin-rooms-overview"]],
  "room:deleted": [["admin-rooms"], ["admin-rooms-overview"]],

  // Dashboard refresh
  "dashboard:refresh": [["admin-dashboard"]],
};

// ─── Owner query keys (from useOwner.hooks.ts) ───
const OWNER_INVALIDATION_MAP: Record<string, string[][]> = {
  // Admin management
  "admin:created": [["owner-admins"], ["owner-dashboard"]],
  "admin:activated": [["owner-admins"]],
  "admin:deactivated": [["owner-admins"]],
  "admin:deleted": [["owner-admins"], ["owner-dashboard"]],
  "admin:promoted": [["owner-admins"], ["owner-dashboard"]],

  // System
  "system:settingsUpdated": [["owner-settings"]],
  "system:auditCleanup": [["owner-audit-logs"], ["owner-audit-stats"]],

  // All admin events also apply to owner
  ...Object.fromEntries(
    Object.entries(ADMIN_INVALIDATION_MAP).map(([event, adminKeys]) => {
      // Map admin-* keys to owner-* keys
      const ownerKeys = adminKeys.map((key) =>
        key.map((k) => k.replace("admin-", "owner-")),
      );
      // Include BOTH admin and owner keys (owner sees admin pages too)
      return [event, [...adminKeys, ...ownerKeys]];
    }),
  ),

  // Dashboard refresh → both
  "dashboard:refresh": [
    ["admin-dashboard"],
    ["owner-dashboard"],
    ["owner-dashboard-stats"],
  ],
};

// ─── Student query keys (from useStudent.hooks.ts) ───
const STUDENT_INVALIDATION_MAP: Record<string, string[][]> = {
  "enrollment:statusChanged": [
    ["student-enrollments"],
    ["student-dashboard"],
    ["student-fees"],
  ],
  "fee:paid": [["student-fees"], ["student-dashboard"]],
  "document:approved": [
    ["student-documents"],
    ["student-dashboard"],
    ["student-profile"],
  ],
  "document:rejected": [["student-documents"], ["student-dashboard"]],
  "attendance:marked": [["student-attendance"]],
  "session:created": [["student-dashboard"]],
  "announcement:published": [["public", "announcements"]],
  "announcement:unpublished": [["public", "announcements"]],
  "announcement:pinned": [["public", "announcements"]], // ✅ NEW
  "announcement:unpinned": [["public", "announcements"]], // ✅ NEW
  "announcement:deleted": [["public", "announcements"]], // ✅ NEW
  "user:disabled": [["me"]],
  "user:roleChanged": [["me"]],
};

// ─── Teacher query keys (from useTeacher.hooks.ts) ───
const TEACHER_INVALIDATION_MAP: Record<string, string[][]> = {
  "session:created": [
    ["teacher", "sessions"],
    ["teacher", "dashboard"],
    ["teacher", "schedule"],
  ],
  "session:deleted": [
    ["teacher", "sessions"],
    ["teacher", "dashboard"],
    ["teacher", "schedule"],
  ],
  "attendance:marked": [["teacher", "sessions"]],
  "group:studentAdded": [["teacher", "groups"]],
  "group:studentRemoved": [["teacher", "groups"]],
  "group:instructorAssigned": [
    ["teacher", "groups"],
    ["teacher", "dashboard"],
  ],
  "announcement:published": [["teacher", "announcements"]],
  "announcement:unpublished": [["teacher", "announcements"]],
  "announcement:pinned": [
    ["teacher", "announcements"],
    ["public", "announcements"],
  ], // ✅ NEW
  "announcement:unpinned": [
    ["teacher", "announcements"],
    ["public", "announcements"],
  ], // ✅ NEW
  "announcement:deleted": [["teacher", "announcements"]], // ✅ NEW
  "user:disabled": [["me"]],
  "user:roleChanged": [["me"]],
};

/* ══════════════════════════════════════════════════════════════
   HOOK: useSocketEvents(role)
   
   Call this ONCE in each role's layout component.
   It subscribes to relevant socket events and invalidates
   the matching React Query caches automatically.
══════════════════════════════════════════════════════════════ */

type Role = "ADMIN" | "OWNER" | "STUDENT" | "TEACHER";

export function useSocketEvents(role: Role) {
  const { socket, isConnected } = useSocket();
  const qc = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Pick the right map for this role
    let eventMap: Record<string, string[][]>;
    switch (role) {
      case "OWNER":
        eventMap = OWNER_INVALIDATION_MAP;
        break;
      case "ADMIN":
        eventMap = ADMIN_INVALIDATION_MAP;
        break;
      case "STUDENT":
        eventMap = STUDENT_INVALIDATION_MAP;
        break;
      case "TEACHER":
        eventMap = TEACHER_INVALIDATION_MAP;
        break;
      default:
        eventMap = {};
    }

    // Subscribe to each event
    const handlers: Array<[string, (...args: any[]) => void]> = [];

    for (const [event, queryKeys] of Object.entries(eventMap)) {
      const handler = (data: any) => {
        console.log(`🔌 [${role}] ${event}`, data);

        // Invalidate all matching query keys
        for (const key of queryKeys) {
          qc.invalidateQueries({ queryKey: key });
        }
      };

      socket.on(event, handler);
      handlers.push([event, handler]);
    }

    // ── Real-time notification handler ──
    const notifHandler = (data: any) => {
      console.log(`🔔 [${role}] notification:new`, data);

      // Invalidate notification queries
      if (role === "STUDENT") {
        qc.invalidateQueries({ queryKey: ["student-notifications"] });
        qc.invalidateQueries({ queryKey: ["student-unread-count"] });
      } else if (role === "TEACHER") {
        qc.invalidateQueries({ queryKey: ["teacher", "notifications"] });
        qc.invalidateQueries({
          queryKey: ["teacher", "notifications", "unread-count"],
        });
      } else {
        // ADMIN / OWNER
        qc.invalidateQueries({ queryKey: ["admin-notifications"] });
        if (role === "OWNER") {
          qc.invalidateQueries({ queryKey: ["owner-notifications"] });
        }
      }

      // Show toast notification
      const title = data?.title || data?.title_ar || "إشعار جديد";
      const message = data?.message || data?.message_ar || "";
      toast.info(title, { description: message, duration: 5000 });
    };

    // ── Force logout when account is disabled ──
    // ── Force logout when account is disabled ──
    const disabledHandler = async () => {
      console.log(`🚫 [${role}] Account disabled — forcing logout`);
      toast.error("تم تعطيل حسابك من قبل الإدارة", { duration: 5000 });

      // 1. مسح الكوكيز من السيرفر
      try {
        await axiosInstance.post("/auth/logout");
      } catch {
        // ignore — الحساب معطّل أصلاً
      }

      // 2. مسح كل الـ cache
      qc.clear();

      // 3. توجيه لصفحة unauthorized
      setTimeout(() => {
        window.location.replace("/unauthorized?reason=disabled");
      }, 1500);
    };

    socket.on("user:disabled", disabledHandler);
    handlers.push(["user:disabled", disabledHandler]);

    socket.on("notification:new", notifHandler);
    handlers.push(["notification:new", notifHandler]);

    // Cleanup
    return () => {
      for (const [event, handler] of handlers) {
        socket.off(event, handler);
      }
    };
  }, [socket, isConnected, role, qc]);
}

/* ══════════════════════════════════════════════════════════════
   HOOK: useSocketRoom(roomName)
   
   Join/leave a Socket.IO room dynamically.
   Use for group-specific or course-specific pages.
   
   Example: useSocketRoom(`group:${groupId}`)
══════════════════════════════════════════════════════════════ */

export function useSocketRoom(roomName: string | null) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected || !roomName) return;

    const [prefix, id] = roomName.split(":");
    if (!id) return;

    if (prefix === "group") {
      socket.emit("join:group", id);
    } else if (prefix === "course") {
      socket.emit("join:course", id);
    }

    return () => {
      if (prefix === "group") {
        socket.emit("leave:group", id);
      } else if (prefix === "course") {
        socket.emit("leave:course", id);
      }
    };
  }, [socket, isConnected, roomName]);
}
