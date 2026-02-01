import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminPermissionsApi } from "../../lib/api/admin/adminPermissions.api";
import type {
  Permission,
  CreatePermissionPayload,
} from "../../types/permission";

/* =======================
   QUERIES
======================= */

// 🔹 Get all permissions
export const useAdminPermissions = () =>
  useQuery<Permission[]>({
    queryKey: ["admin-permissions"],
    queryFn: adminPermissionsApi.getAll,
  });

/* =======================
   MUTATIONS
======================= */

// ➕ Create permission
export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePermissionPayload) =>
      adminPermissionsApi.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-permissions"],
      });
    },
  });
};

// ➕ Assign permission to student
export const useAssignPermissionToStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      permissionId,
    }: {
      studentId: string;
      permissionId: string;
    }) =>
      adminPermissionsApi.assignToStudent(studentId, permissionId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-student", variables.studentId],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-permissions"],
      });
    },
  });
};

// ➖ Remove permission from student
export const useRemovePermissionFromStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      permissionId,
    }: {
      studentId: string;
      permissionId: string;
    }) =>
      adminPermissionsApi.removeFromStudent(studentId, permissionId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-student", variables.studentId],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-permissions"],
      });
    },
  });
};
