import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { authApi, type RegisterPayload } from "../../lib/api/auth.api";
import { useAuth } from "../../context/AuthContext";

const ME_KEY = ["me"];

export const useLogin = () => {
  const qc = useQueryClient();
  const router = useRouter();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      // Save tokens
      if (data.access_token) {
        await SecureStore.setItemAsync("access_token", data.access_token);
      }
      if (data.refresh_token) {
        await SecureStore.setItemAsync("refresh_token", data.refresh_token);
      }
      qc.removeQueries({ queryKey: ME_KEY });

      try {
        const user = await authApi.me();
        qc.setQueryData(ME_KEY, user);
        setUser(user);

        const redirectMap: Record<string, string> = {
          ADMIN: "/(admin)",
          TEACHER: "/(teacher)",
          STUDENT: "/(student)",
          OWNER: "/(owner)",
        };
        router.replace((redirectMap[user.role] ?? "/(student)") as any);
      } catch {
        router.replace("/auth/login" as any);
      }
    },
  });
};

export const useRegister = () =>
  useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  });

export const useMe = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ME_KEY,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });

export const useLogout = () => {
  const qc = useQueryClient();
  const router = useRouter();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: async () => {
      try { await authApi.logout(); } catch {}
    },
    onSettled: async () => {
      await logout();
      qc.removeQueries({ queryKey: ME_KEY });
      qc.clear();
      router.replace("/auth/login" as any);
    },
  });
};
