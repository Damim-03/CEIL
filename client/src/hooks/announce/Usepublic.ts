// ================================================================
// 📦 src/hooks/public/usePublic.ts
// ✅ Public data hooks — Home, Announcements, Courses
// 🔌 Real-time: auto-refresh announcements on Socket.IO events
// ================================================================

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { publicApis } from "../../lib/api/announce/announce.api";
import { useSocket } from "../../context/SocketContext";

// ─── 🔌 Real-time Announcements Listener ───
// Call this hook in any page that displays public announcements.
// It listens for Socket.IO events and auto-invalidates the cache.

export const useAnnouncementRealtime = () => {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const events = [
      "announcement:published",
      "announcement:unpublished",
      "announcement:pinned",
      "announcement:unpinned",
      "announcement:deleted",
    ];

    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["public", "announcements"] });
      queryClient.invalidateQueries({ queryKey: ["public", "announcement"] });
    };

    events.forEach((event) => socket.on(event, handler));

    return () => {
      events.forEach((event) => socket.off(event, handler));
    };
  }, [socket, isConnected, queryClient]);
};

// ─── Home Stats ───
export const useHomeStats = () =>
  useQuery({
    queryKey: ["public", "home-stats"],
    queryFn: publicApis.getHomeStats,
    staleTime: 5 * 60 * 1000, // 5 min
  });

// ─── Announcements List ───
export const usePublicAnnouncements = (params?: {
  page?: number;
  limit?: number;
  category?: string;
}) =>
  useQuery({
    queryKey: ["public", "announcements", params],
    queryFn: () => publicApis.getAnnouncements(params),
    staleTime: 2 * 60 * 1000, // 2 min
  });

// ─── Announcement Detail ───
export const usePublicAnnouncement = (id: string) =>
  useQuery({
    queryKey: ["public", "announcement", id],
    queryFn: () => publicApis.getAnnouncementById(id),
    enabled: !!id,
  });

// ─── Courses List ───
export const usePublicCourses = (params?: {
  page?: number;
  limit?: number;
  language?: string;
}) =>
  useQuery({
    queryKey: ["public", "courses", params],
    queryFn: () => publicApis.getCourses(params),
    staleTime: 2 * 60 * 1000,
  });

// ─── Course Detail ───
export const usePublicCourse = (id: string) =>
  useQuery({
    queryKey: ["public", "course", id],
    queryFn: () => publicApis.getCourseById(id),
    enabled: !!id,
  });
