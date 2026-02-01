import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminCoursesApi,
  type CoursePayload,
} from "../../lib/api/admin/admincourses.api";

import type { Course } from "../../types/course";
import type { CourseUI } from "../../types/course.ui";

/* =======================
   QUERIES
======================= */

/**
 * 🔹 Get all courses (LIST)
 * Used in tables
 */
export const useAdminCourses = () =>
  useQuery<Course[]>({
    queryKey: ["admin-courses"],
    queryFn: adminCoursesApi.getAll,
  });

/**
 * 🔹 Get single course (DETAILS)
 * Transforms Course → CourseUI
 */
export const useAdminCourse = (courseId?: string) =>
  useQuery<CourseUI>({
    queryKey: ["admin-course", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const course = await adminCoursesApi.getById(courseId!); // Course

      // 🔥 Transform DB model → UI model
      const transformed: CourseUI = {
        ...course,

        // UI / computed fields
        enrollment_count: course.enrollments?.length ?? 0,
        completion_rate: undefined, // احسبها لاحقًا إذا لزم
        duration: undefined,
        description: undefined,
        prerequisites: undefined,
        syllabus: undefined,
        instructor: course.teacher
          ? `${course.teacher.first_name} ${course.teacher.last_name}`
          : undefined,

        created_at: undefined,
      };

      return transformed;
    },
  });

/* =======================
   MUTATIONS
======================= */

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminCoursesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: CoursePayload;
    }) => adminCoursesApi.update(courseId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-course"] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminCoursesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
  });
};
