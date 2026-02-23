// ================================================================
// 📌 src/lib/api/owner/ownerActivity.api.ts
// ✅ Activity tracking API endpoints
// ✅ Matches existing owner.api.ts pattern
// ================================================================

import axiosInstance from "../axios";

/* ═══════════════════════════ TYPES ═══════════════════════════ */

export interface OnlineUser {
  userId: string;
  socketId: string;
  role: string;
  email: string;
  name: string;
  avatar?: string;
  connectedAt: string;
  lastActivity: string;
  currentPage: string;
  device: string;
  sessionDuration?: number;
}

export interface OnlineUsersResponse {
  total: number;
  byRole: Record<string, number>;
  users: OnlineUser[];
}

export interface PresenceStats {
  onlineNow: number;
  onlineByRole: Record<string, number>;
  peakToday: number;
  avgSessionDuration: number;
  totalSessionsToday: number;
  activePages: Record<string, number>;
}

export interface SessionRecord {
  userId: string;
  role: string;
  name: string;
  connectedAt: string;
  disconnectedAt: string;
  duration: number;
  pagesVisited: string[];
}

export interface TimelineEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  performedAt: string;
  user: {
    id: string;
    email: string;
    role: string;
    avatar?: string;
    isOnline: boolean;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TimelineFilters {
  page?: number;
  limit?: number;
  role?: string;
  action?: string;
  entity_type?: string;
  from?: string;
  to?: string;
}

export interface LoginHistoryFilters {
  page?: number;
  limit?: number;
  user_id?: string;
  from?: string;
  to?: string;
}

export interface UserOnlineStatus {
  isOnline: boolean;
  currentPage?: string;
  connectedAt?: string;
  lastActivity?: string;
  device?: string;
  sessionDuration?: number;
}

/* ═══════════════════════════ API ═══════════════════════════ */

export const ownerActivityTrackingApi = {
  /** GET /api/owner/activity/online */
  getOnlineUsers: async (): Promise<OnlineUsersResponse> => {
    const { data } = await axiosInstance.get("/owner/activity/online");
    return data;
  },

  /** GET /api/owner/activity/presence-stats */
  getPresenceStats: async (): Promise<PresenceStats> => {
    const { data } = await axiosInstance.get("/owner/activity/presence-stats");
    return data;
  },

  /** GET /api/owner/activity/sessions */
  getRecentSessions: async (
    params?: { role?: string; limit?: number },
  ): Promise<{ total: number; sessions: SessionRecord[] }> => {
    const { data } = await axiosInstance.get("/owner/activity/sessions", { params });
    return data;
  },

  /** GET /api/owner/activity/timeline */
  getTimeline: async (
    params?: TimelineFilters,
  ): Promise<PaginatedResponse<TimelineEntry>> => {
    const { data } = await axiosInstance.get("/owner/activity/timeline", { params });
    return data;
  },

  /** GET /api/owner/activity/login-history */
  getLoginHistory: async (
    params?: LoginHistoryFilters,
  ): Promise<PaginatedResponse<TimelineEntry>> => {
    const { data } = await axiosInstance.get("/owner/activity/login-history", { params });
    return data;
  },

  /** GET /api/owner/activity/user/:userId/online */
  getUserOnlineStatus: async (userId: string): Promise<UserOnlineStatus> => {
    const { data } = await axiosInstance.get(`/owner/activity/user/${userId}/online`);
    return data;
  },
};