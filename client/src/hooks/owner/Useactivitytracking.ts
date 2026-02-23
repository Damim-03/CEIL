// ================================================================
// 📌 src/hooks/owner/useActivityTracking.ts
// ✅ Real-time presence & activity tracking hooks
// ✅ Imports from ownerActivity.api.ts
// ✅ Socket.IO listeners for real-time presence updates
// ================================================================

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import {
  type PresenceStats,
  type OnlineUsersResponse,
  ownerActivityTrackingApi,
  type SessionRecord,
  type TimelineFilters,
  type TimelineEntry,
  type LoginHistoryFilters,
  type UserOnlineStatus,
} from "../../lib/api/owner/activity.api";
import type { PaginatedResponse } from "../../lib/api/owner/activity.api";

// Re-export types for convenience
export type {
  OnlineUser,
  PresenceStats,
  TimelineEntry,
  SessionRecord,
  UserOnlineStatus,
  OnlineUsersResponse,
} from "../../lib/api/owner/activity.api";

/* ═══════════════════════════ QUERY KEYS ═══════════════════════════ */

export const ACTIVITY_KEYS = {
  onlineUsers: ["owner-online-users"],
  presenceStats: ["owner-presence-stats"],
  recentSessions: ["owner-recent-sessions"],
  timeline: ["owner-activity-timeline"],
  loginHistory: ["owner-login-history"],
  userOnlineStatus: (id: string) => ["owner-user-online", id],
} as const;

/* ═══════════════════════════ HOOKS ═══════════════════════════ */

/** 🟢 Online users — real-time via Socket.IO with HTTP fallback */
export const useOnlineUsers = () => {
  const qc = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handler = (data: {
      stats: PresenceStats;
      users: OnlineUsersResponse["users"];
    }) => {
      qc.setQueryData(ACTIVITY_KEYS.onlineUsers, {
        total: data.users.length,
        byRole: data.stats.onlineByRole,
        users: data.users,
      });
      qc.setQueryData(ACTIVITY_KEYS.presenceStats, data.stats);
    };
    socket.on("presence:update", handler);
    return () => {
      socket.off("presence:update", handler);
    };
  }, [socket, qc]);

  return useQuery<OnlineUsersResponse>({
    queryKey: ACTIVITY_KEYS.onlineUsers,
    queryFn: ownerActivityTrackingApi.getOnlineUsers,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
};

/** 📊 Presence stats for dashboard cards */
export const usePresenceStats = () =>
  useQuery<PresenceStats>({
    queryKey: ACTIVITY_KEYS.presenceStats,
    queryFn: ownerActivityTrackingApi.getPresenceStats,
    refetchInterval: 30_000,
    placeholderData: (prev: any) => prev,
  });

/** 📜 Recent completed sessions */
export const useRecentSessions = (params?: { role?: string; limit?: number }) =>
  useQuery<{ total: number; sessions: SessionRecord[] }>({
    queryKey: [...ACTIVITY_KEYS.recentSessions, params],
    queryFn: () => ownerActivityTrackingApi.getRecentSessions(params),
    placeholderData: (prev: any) => prev,
  });

/** ⏱️ Activity timeline */
export const useActivityTimeline = (params?: TimelineFilters) =>
  useQuery<PaginatedResponse<TimelineEntry>>({
    queryKey: [...ACTIVITY_KEYS.timeline, params],
    queryFn: () => ownerActivityTrackingApi.getTimeline(params),
    placeholderData: (prev: any) => prev,
  });

/** 🔐 Login/Logout history */
export const useLoginHistory = (params?: LoginHistoryFilters) =>
  useQuery<PaginatedResponse<TimelineEntry>>({
    queryKey: [...ACTIVITY_KEYS.loginHistory, params],
    queryFn: () => ownerActivityTrackingApi.getLoginHistory(params),
    placeholderData: (prev: any) => prev,
  });

/** 🔍 Check if specific user is online */
export const useUserOnlineStatus = (userId?: string) =>
  useQuery<UserOnlineStatus>({
    queryKey: ACTIVITY_KEYS.userOnlineStatus(userId!),
    queryFn: () => ownerActivityTrackingApi.getUserOnlineStatus(userId!),
    enabled: !!userId,
    refetchInterval: 15_000,
  });

/** 📍 Auto-report page changes — use in Layout */
export const usePageTracking = () => {
  const location = useLocation();
  const { socket } = useSocket();
  const lastPage = useRef("");

  useEffect(() => {
    if (!socket || !location.pathname) return;
    if (location.pathname === lastPage.current) return;
    lastPage.current = location.pathname;
    socket.emit("presence:pageChange", { page: location.pathname });
  }, [location.pathname, socket]);
};

/** 💓 Heartbeat — keeps session alive — use in Layout */
export const usePresenceHeartbeat = (intervalMs = 60_000) => {
  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;
    const interval = setInterval(
      () => socket.emit("presence:heartbeat"),
      intervalMs,
    );
    return () => clearInterval(interval);
  }, [socket, intervalMs]);
};
