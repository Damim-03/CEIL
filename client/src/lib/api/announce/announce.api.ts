import axiosInstance from "../axios";

// ─── Types ───

export interface PublicAnnouncement {
  id: string;
  title: string;
  title_ar: string | null;
  excerpt: string | null;
  excerpt_ar: string | null;
  category: string | null;
  image_url: string | null;
  date: string;
}

export interface PublicAnnouncementDetail extends PublicAnnouncement {
  content: string;
  content_ar: string | null;
}

export interface PublicCourse {
  id: string;
  course_name: string;
  course_code: string | null;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  language: string | null;
  level: string | null;
  flag_emoji: string | null;
  price: number | null;
  currency: string;
  fee_amount: number | null;
  session_name: string | null;
  start_date: string | null;
  end_date: string | null;
  registration_open: boolean;
  image_url: string | null;
  enrolled: number;
  capacity: number;
}

export interface PublicCourseGroup {
  id: string;
  name: string;
  level: string;
  max_students: number;
  enrolled: number;
  teacher: string | null;
}

export interface PublicCourseDetail extends PublicCourse {
  groups: PublicCourseGroup[];
}

export interface HomeStats {
  languages_count: number;
  students_count: number;
  courses_count: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ─── API Calls (using axiosInstance, baseURL already = VITE_API_URL) ───

export const publicApis = {
  getHomeStats: () =>
    axiosInstance.get<HomeStats>("/public/home/stats").then((r) => r.data),

  getAnnouncements: (params?: {
    page?: number;
    limit?: number;
    category?: string;
  }) =>
    axiosInstance
      .get<Paginated<PublicAnnouncement>>("/public/announcements", { params })
      .then((r) => r.data),

  getAnnouncementById: (id: string) =>
    axiosInstance
      .get<PublicAnnouncementDetail>(`/public/announcements/${id}`)
      .then((r) => r.data),

  getCourses: (params?: { page?: number; limit?: number; language?: string }) =>
    axiosInstance
      .get<Paginated<PublicCourse>>("/public/courses", { params })
      .then((r) => r.data),

  getCourseById: (id: string) =>
    axiosInstance
      .get<PublicCourseDetail>(`/public/courses/${id}`)
      .then((r) => r.data),
};
