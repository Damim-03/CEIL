import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentApi } from "../../lib/api/student/student.api";

/* ================= QUERY KEYS ================= */

const PROFILE_KEY = ["student-profile"];
const DOCUMENTS_KEY = ["student-documents"];
export const STUDENT_ENROLLMENTS_KEY = ["student-enrollments"];

/* ================= PROFILE ================= */

export const useMyProfile = () =>
  useQuery({
    queryKey: PROFILE_KEY,
    queryFn: studentApi.getProfile,
  });

/* ================= DOCUMENTS ================= */

export const useMyDocuments = () =>
  useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: studentApi.getDocuments,
  });

/* ================= GET ENROLLMENTS ================= */

export const useStudentEnrollments = () =>
  useQuery({
    queryKey: STUDENT_ENROLLMENTS_KEY,
    queryFn: studentApi.getEnrollments,
    retry: false,
  });

/* ================= CREATE ENROLLMENT ================= */

export function useEnroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => studentApi.enroll(courseId),
    onSuccess: () => {
      // 🔄 refresh enrollments after success
      queryClient.invalidateQueries({
        queryKey: STUDENT_ENROLLMENTS_KEY,
      });
    },
  });
}
