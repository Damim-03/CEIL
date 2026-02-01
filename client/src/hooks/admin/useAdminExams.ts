import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminExamsApi } from "../../lib/api/admin/adminExams.api";
import type { Exam, ExamResult } from "../../types/exam";

/* =======================
   QUERIES
======================= */

// 🔹 Get all exams
export const useAdminExams = () =>
  useQuery<Exam[]>({
    queryKey: ["admin-exams"],
    queryFn: adminExamsApi.getAll,
  });

// 🔹 Get exam by ID
export const useAdminExam = (examId?: string) =>
  useQuery<Exam>({
    queryKey: ["admin-exam", examId],
    queryFn: () => adminExamsApi.getById(examId!),
    enabled: !!examId,
  });

// 🔹 Get results by exam
export const useAdminExamResults = (examId?: string) =>
  useQuery<ExamResult[]>({
    queryKey: ["admin-exam-results", examId],
    queryFn: () => adminExamsApi.getResults(examId!),
    enabled: !!examId,
  });

/* =======================
   MUTATIONS
======================= */

// ➕ Create exam
export const useCreateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminExamsApi.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-exams"],
      });
    },
  });
};

// ✏️ Update exam
export const useUpdateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      examId,
      payload,
    }: {
      examId: string;
      payload: {
        exam_name?: string;
        exam_date?: string;
        max_marks?: number;
      };
    }) => adminExamsApi.update(examId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-exams"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-exam", variables.examId],
      });
    },
  });
};

// 🗑 Delete exam
export const useDeleteExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: string) => adminExamsApi.delete(examId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-exams"],
      });
    },
  });
};

// ➕ Add exam result
export const useAddExamResult = () => {
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
    }) => adminExamsApi.addResult(examId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-exam-results", variables.examId],
      });
    },
  });
};
