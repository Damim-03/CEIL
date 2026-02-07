import { useQuery } from "@tanstack/react-query";
import { publicApis } from "../../lib/api/announce/announce.api";

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