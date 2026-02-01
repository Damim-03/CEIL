import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminEnrollmentsApi } from "../../lib/api/admin/adminEnrollments.api";
import type { Enrollment } from "../../types/enrollment";

/* =======================
   QUERIES
======================= */

// 🔹 Get all enrollments
export const useAdminEnrollments = () =>
  useQuery<Enrollment[]>({
    queryKey: ["admin-enrollments"],
    queryFn: adminEnrollmentsApi.getAll,
  });

// 🔹 Get enrollment by ID
export const useAdminEnrollment = (enrollmentId?: string) =>
  useQuery<Enrollment>({
    queryKey: ["admin-enrollment", enrollmentId],
    queryFn: () => adminEnrollmentsApi.getById(enrollmentId!),
    enabled: !!enrollmentId,
  });

/* =======================
   MUTATIONS
======================= */

// ✅ Validate enrollment
export const useValidateEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) =>
      adminEnrollmentsApi.validate(enrollmentId),

    onSuccess: (_, enrollmentId) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-enrollments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-enrollment", enrollmentId],
      });
    },
  });
};

// ❌ Reject enrollment
export const useRejectEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      reason,
    }: {
      enrollmentId: string;
      reason?: string;
    }) => adminEnrollmentsApi.reject(enrollmentId, { reason }),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-enrollments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-enrollment", variables.enrollmentId],
      });
    },
  });
};

// 💰 Mark enrollment as paid
export const useMarkEnrollmentPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) =>
      adminEnrollmentsApi.markPaid(enrollmentId),

    onSuccess: (_, enrollmentId) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-enrollments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-enrollment", enrollmentId],
      });
    },
  });
};

// 🏁 Finish enrollment
export const useFinishEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) =>
      adminEnrollmentsApi.finish(enrollmentId),

    onSuccess: (_, enrollmentId) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-enrollments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-enrollment", enrollmentId],
      });
    },
  });
};
