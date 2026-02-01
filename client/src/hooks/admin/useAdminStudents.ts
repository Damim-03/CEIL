import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminStudentsApi } from "../../lib/api/admin/adminStudents.api";
import type { AdminStudent } from "../../types/AdminStudent";
import type { CreateStudentPayload, UpdateStudentPayload } from "../../lib/api/admin/adminStudents.api";

/* ================= QUERY KEYS ================= */

const STUDENTS_KEY = ["admin-students"];
const studentKey = (id: string) => ["admin-student", id];

/* ================= QUERIES ================= */

export const useAdminStudents = () =>
  useQuery<AdminStudent[]>({
    queryKey: STUDENTS_KEY,
    queryFn: async () => {
      const res = await adminStudentsApi.getAll();
      return res.data ?? res.students ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - prevents unnecessary refetches
  });

export const useAdminStudent = (studentId?: string) =>
  useQuery<AdminStudent>({
    queryKey: studentKey(studentId!),
    queryFn: async () => {
      const data = await adminStudentsApi.getById(studentId!);
      return data.data ?? data.student ?? data; // Handle different response formats
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

/* ================= MUTATIONS ================= */

export const useCreateStudent = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStudentPayload) => adminStudentsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDENTS_KEY });
    },
  });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, payload }: { studentId: string; payload: UpdateStudentPayload }) =>
      adminStudentsApi.update(studentId, payload),
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific student
      qc.invalidateQueries({ queryKey: STUDENTS_KEY });
      qc.invalidateQueries({ queryKey: studentKey(variables.studentId) });
    },
  });
};

export const useUpdateStudentAvatar = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, formData }: { studentId: string; formData: FormData }) =>
      adminStudentsApi.updateStudentAvatar(studentId, formData),
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific student
      qc.invalidateQueries({ queryKey: STUDENTS_KEY });
      qc.invalidateQueries({ queryKey: studentKey(variables.studentId) });
    },
  });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (studentId: string) => adminStudentsApi.delete(studentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STUDENTS_KEY });
    },
    // Optimistic update - immediately remove from UI before API confirms
    onMutate: async (studentId) => {
      // Cancel outgoing refetches
      await qc.cancelQueries({ queryKey: STUDENTS_KEY });

      // Snapshot previous value
      const previousStudents = qc.getQueryData<AdminStudent[]>(STUDENTS_KEY);

      // Optimistically update
      qc.setQueryData<AdminStudent[]>(STUDENTS_KEY, (old) =>
        old ? old.filter((s) => s.student_id !== studentId) : []
      );

      // Return context with previous value
      return { previousStudents };
    },
    // Rollback on error
    onError: (_err, _studentId, context) => {
      if (context?.previousStudents) {
        qc.setQueryData(STUDENTS_KEY, context.previousStudents);
      }
    },
  });
};

/* ================= TYPE EXPORT ================= */

export type { AdminStudent };