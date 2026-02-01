import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminResultsApi } from "../../lib/api/admin/adminResults.api";
import type { Result } from "../../types/result";

/* =======================
   QUERIES
======================= */

// 🔹 Get results by exam
export const useAdminResultsByExam = (examId?: string) =>
  useQuery<Result[]>({
    queryKey: ["admin-results", "exam", examId],
    queryFn: () => adminResultsApi.getByExam(examId!),
    enabled: !!examId,
  });

// 🔹 Get results by student
export const useAdminResultsByStudent = (studentId?: string) =>
  useQuery<Result[]>({
    queryKey: ["admin-results", "student", studentId],
    queryFn: () => adminResultsApi.getByStudent(studentId!),
    enabled: !!studentId,
  });

/* =======================
   MUTATIONS
======================= */

// ➕ Add result
export const useAddResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      examId,
      payload,
    }: {
      examId: string;
      payload: {
        student_id: string;
        marks_obtained: number;
        grade?: string;
      };
    }) => adminResultsApi.add(examId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-results", "exam", variables.examId],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-results"],
      });
    },
  });
};

// ✏️ Update result
export const useUpdateResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resultId,
      payload,
    }: {
      resultId: string;
      payload: {
        marks_obtained?: number;
        grade?: string;
      };
    }) => adminResultsApi.update(resultId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-results"],
      });
    },
  });
};
