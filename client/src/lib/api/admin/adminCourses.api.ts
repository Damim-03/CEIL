import type { Course } from "../../../types/Course";
import axiosInstance from "../axios";

export interface CoursePayload {
  course_name: string;
  course_code?: string;
  credits?: number;
  description?: string;
  teacher_id?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const adminCoursesApi = {
  getAll: async (): Promise<Course[]> => {
    const res =
      await axiosInstance.get<PaginatedResponse<Course>>("/admin/courses");
    // Backend always returns { data: [...], meta: {...} } via getAllCoursesController
    return res.data.data;
  },

  getById: async (courseId: string): Promise<Course> => {
    const res = await axiosInstance.get<Course>(`/admin/courses/${courseId}`);
    // Backend returns the course object directly via getCourseByIdController
    return res.data;
  },

  create: async (payload: CoursePayload): Promise<Course> => {
    const res = await axiosInstance.post<Course>("/admin/courses", payload);
    return res.data;
  },

  update: async (courseId: string, payload: CoursePayload): Promise<Course> => {
    const res = await axiosInstance.put<Course>(
      `/admin/courses/${courseId}`,
      payload,
    );
    return res.data;
  },

  delete: async (courseId: string): Promise<void> => {
    await axiosInstance.delete(`/admin/courses/${courseId}`);
  },
};
