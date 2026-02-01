import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminDepartmentsApi } from "../../lib/api/admin/adminDepartments.api";
import type {
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from "../../types/department";

/* =======================
   QUERIES
======================= */

// 🔹 Get all departments
export const useAdminDepartments = () =>
  useQuery<Department[]>({
    queryKey: ["admin-departments"],
    queryFn: adminDepartmentsApi.getAll,
  });

// 🔹 Get department by ID
export const useAdminDepartment = (departmentId?: string) =>
  useQuery<Department>({
    queryKey: ["admin-department", departmentId],
    queryFn: () => adminDepartmentsApi.getById(departmentId!),
    enabled: !!departmentId,
  });

/* =======================
   MUTATIONS
======================= */

// 🔹 Create department
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) =>
      adminDepartmentsApi.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-departments"],
      });
    },
  });
};

// 🔹 Update department
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      departmentId,
      payload,
    }: {
      departmentId: string;
      payload: UpdateDepartmentPayload;
    }) => adminDepartmentsApi.update(departmentId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-departments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-department", variables.departmentId],
      });
    },
  });
};

// 🔹 Delete department
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (departmentId: string) =>
      adminDepartmentsApi.delete(departmentId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-departments"],
      });
    },
  });
};
