import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFeesApi } from "../../lib/api/admin/adminFees.api";
import type { Fee } from "../../types/fee";

/* =======================
   QUERIES
======================= */

// 🔹 Get all fees
export const useAdminFees = () =>
  useQuery<Fee[]>({
    queryKey: ["admin-fees"],
    queryFn: adminFeesApi.getAll,
  });

// 🔹 Get fee by ID
export const useAdminFee = (feeId?: string) =>
  useQuery<Fee>({
    queryKey: ["admin-fee", feeId],
    queryFn: () => adminFeesApi.getById(feeId!),
    enabled: !!feeId,
  });

/* =======================
   MUTATIONS
======================= */

// ➕ Create fee
export const useCreateFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminFeesApi.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-fees"],
      });
    },
  });
};

// ✏️ Update fee
export const useUpdateFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      feeId,
      payload,
    }: {
      feeId: string;
      payload: {
        amount?: number;
        due_date?: string;
      };
    }) => adminFeesApi.update(feeId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-fees"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-fee", variables.feeId],
      });
    },
  });
};

// 💰 Mark fee as paid
export const useMarkFeePaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      feeId,
      payload,
    }: {
      feeId: string;
      payload?: {
        payment_method?: string;
        reference_code?: string;
      };
    }) => adminFeesApi.markAsPaid(feeId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-fees"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-fee", variables.feeId],
      });
    },
  });
};

// 🗑 Delete fee
export const useDeleteFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feeId: string) => adminFeesApi.delete(feeId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-fees"],
      });
    },
  });
};
