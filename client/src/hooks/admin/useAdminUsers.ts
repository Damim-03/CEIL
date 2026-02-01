import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminUsersApi,
  type UserRole,
} from "../../lib/api/admin/adminUsers.api";

/* ================= TYPES ================= */

export interface AdminUser {
  user_id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

/* ================= QUERY KEYS ================= */

const USERS_KEY = ["admin-users"];

/* ================= QUERIES ================= */

export const useAdminUsers = () =>
  useQuery<AdminUser[]>({
    queryKey: USERS_KEY,
    queryFn: adminUsersApi.getAll,
  });

export const useAdminUser = (userId?: string) =>
  useQuery<AdminUser>({
    queryKey: ["admin-user", userId],
    queryFn: () => adminUsersApi.getById(userId!),
    enabled: !!userId,
  });

/* ================= MUTATIONS ================= */

export const useToggleUserStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isActive,
    }: {
      userId: string;
      isActive: boolean;
    }) =>
      isActive ? adminUsersApi.disable(userId) : adminUsersApi.enable(userId),

    onMutate: async ({ userId, isActive }) => {
      await qc.cancelQueries({ queryKey: ["admin-user", userId] });

      const previousUser = qc.getQueryData<AdminUser>(["admin-user", userId]);

      qc.setQueryData<AdminUser>(["admin-user", userId], (old) =>
        old ? { ...old, is_active: !isActive } : old,
      );

      return { previousUser };
    },

    onError: (_err, { userId }, context) => {
      if (context?.previousUser) {
        qc.setQueryData(["admin-user", userId], context.previousUser);
      }
    },

    onSettled: (_data, _error, { userId }) => {
      qc.invalidateQueries({ queryKey: ["admin-user", userId] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, email }: { userId: string; email: string }) =>
      adminUsersApi.update(userId, { email }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: adminUsersApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
};

// src/hooks/admin/admin.users.hooks.ts
export const useChangeUserRole = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      adminUsersApi.changeRole(userId, role),

    /* ================= OPTIMISTIC UPDATE ================= */
    onMutate: async ({ userId, role }) => {
      await qc.cancelQueries({ queryKey: USERS_KEY });

      const previousUsers = qc.getQueryData<AdminUser[]>(USERS_KEY);

      qc.setQueryData<AdminUser[]>(USERS_KEY, (old) =>
        old ? old.map((u) => (u.user_id === userId ? { ...u, role } : u)) : old,
      );

      return { previousUsers };
    },

    /* ================= ROLLBACK ================= */
    onError: (_error, _vars, context) => {
      if (context?.previousUsers) {
        qc.setQueryData(USERS_KEY, context.previousUsers);
      }
    },

    /* ================= SYNC WITH SERVER ================= */
    onSuccess: (data) => {
      if (!data?.user) return;

      qc.setQueryData<AdminUser[]>(USERS_KEY, (old) =>
        old
          ? old.map((u) =>
              u.user_id === data.user.user_id ? { ...u, ...data.user } : u,
            )
          : old,
      );
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
};
