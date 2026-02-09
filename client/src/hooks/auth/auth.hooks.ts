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
      // ✅ Step 1: Clear ALL cached state (including 401 error states)
      qc.removeQueries({ queryKey: ME_KEY });

      try {
        // ✅ Step 2: Direct API call — NOT fetchQuery
        // fetchQuery can get stuck if interceptor retries or cache conflicts
        const user = await authApi.me();

        // ✅ Step 3: Manually put fresh data into cache
        qc.setQueryData(ME_KEY, user);

        // ✅ Step 4: Redirect based on role
        const redirectMap: Record<string, string> = {
          ADMIN: "/admin",
          TEACHER: "/teacher",
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
    mutationFn: authApi.logout,
    onSuccess: () => {
      qc.removeQueries({ queryKey: ME_KEY });
      window.location.replace("/login");
    },
  });
};
