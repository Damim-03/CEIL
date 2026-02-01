import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi, type RegisterPayload } from "../../lib/api/auth.api";

/* ================= QUERY KEYS ================= */

const ME_KEY = ["me"];

/* ================= LOGIN ================= */

export const useLogin = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      const user = await qc.fetchQuery({
        queryKey: ME_KEY,
        queryFn: authApi.me,
      });

      const redirectMap: Record<string, string> = {
        ADMIN: "/admin",
        TEACHER: "/teacher",
        STUDENT: "/dashboard",
      };

      navigate(redirectMap[user.role] ?? "/login", {
        replace: true,
      });
    },
  });
};

/* ================= REGISTER ================= */

export const useRegister = () =>
  useMutation({
    mutationFn: (payload: RegisterPayload) =>
      authApi.register(payload),
  });

/* ================= ME (SOURCE OF TRUTH) ================= */

export const useMe = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ME_KEY,
    queryFn: authApi.me,
    retry: false,
    staleTime: Infinity,
    refetchOnMount: false,
    enabled: options?.enabled ?? true,
  });

/* ================= LOGOUT ================= */

export const useLogout = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      await qc.cancelQueries({ queryKey: ME_KEY });
      qc.removeQueries({ queryKey: ME_KEY });

      window.location.replace("/login");
    },
  });
};
