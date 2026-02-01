import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminGroupsApi } from "../../lib/api/admin/adminGroups.api";
import type {
  Group,
  CreateGroupPayload,
  UpdateGroupPayload,
} from "../../types/group";

/* =======================
   QUERIES
======================= */

// 🔹 Get all groups
export const useAdminGroups = () =>
  useQuery<Group[]>({
    queryKey: ["admin-groups"],
    queryFn: adminGroupsApi.getAll,
  });

// 🔹 Get group by ID
export const useAdminGroup = (groupId?: string) =>
  useQuery<Group>({
    queryKey: ["admin-group", groupId],
    queryFn: () => adminGroupsApi.getById(groupId!),
    enabled: !!groupId,
  });

/* =======================
   MUTATIONS
======================= */

// ➕ Create group
export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGroupPayload) =>
      adminGroupsApi.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-groups"],
      });
    },
  });
};

// ✏️ Update group
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      payload,
    }: {
      groupId: string;
      payload: UpdateGroupPayload;
    }) => adminGroupsApi.update(groupId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-groups"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-group", variables.groupId],
      });
    },
  });
};

// 🗑 Delete group
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) =>
      adminGroupsApi.delete(groupId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-groups"],
      });
    },
  });
};

/* =======================
   STUDENTS MANAGEMENT
======================= */

// ➕ Add student to group
export const useAddStudentToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      studentId,
    }: {
      groupId: string;
      studentId: string;
    }) => adminGroupsApi.addStudent(groupId, studentId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-group", variables.groupId],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-groups"],
      });
    },
  });
};

// ➖ Remove student from group
export const useRemoveStudentFromGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      studentId,
    }: {
      groupId: string;
      studentId: string;
    }) => adminGroupsApi.removeStudent(groupId, studentId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-group", variables.groupId],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-groups"],
      });
    },
  });
};
