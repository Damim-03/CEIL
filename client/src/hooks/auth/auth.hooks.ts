import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi, type RegisterPayload } from "../../lib/api/auth.api";

/* ================= QUERY KEYS ================= */

const ME_KEY = ["me"];

/* ================= LOGIN ================= */

export const useLogin = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      qc.removeQueries({ queryKey: ME_KEY });

      try {
        const user = await authApi.me();
        qc.setQueryData(ME_KEY, user);

        // Check for saved redirect URL (from ProtectedRoute)
        const from = (location.state as { from?: string })?.from;

        if (from) {
          navigate(from, { replace: true });
          return;
        }

        const redirectMap: Record<string, string> = {
          ADMIN: "/admin",
          TEACHER: "/admin",
          STUDENT: "/dashboard",
        };

        navigate(redirectMap[user.role] ?? "/dashboard", { replace: true });
      } catch {
        navigate("/login", { replace: true });
      }
    },
  });
};

/* ================= REGISTER ================= */

export const useRegister = () =>
  useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  });

/* ================= ME (SOURCE OF TRUTH) ================= */

export const useMe = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ME_KEY,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });

/* ================= LOGOUT ================= */

export const useLogout = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch {
        // ✅ Ignore 401 — cookie already expired, that's fine
      }
    },
    onSettled: () => {
      // ✅ ALWAYS clear cache and redirect, even if API failed
      qc.removeQueries({ queryKey: ME_KEY });
      qc.clear();
      window.location.replace("/");
    },
  });
};
