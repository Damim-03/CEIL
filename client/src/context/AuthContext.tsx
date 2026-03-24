import { useEffect, useState } from "react";
import { authApi } from "../lib/api/auth.api";
import { AuthContext } from "./auth.context";

export type User = {
  user_id: string;
  email: string;
  role: "ADMIN" | "STUDENT" | "TEACHER";
  google_avatar?: string;
  created_at?: string;
  is_active?: boolean;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const userData = await authApi.me();
        if (isMounted) setUser(userData);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem("access_token", res.access_token);
    localStorage.setItem("refresh_token", res.refresh_token);
    setUser(res.user);
  };

  const logout = async (redirect = true) => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      if (redirect) window.location.href = "/login";
    }
  };

  const refreshUser = async () => {
    const userData = await authApi.me();
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        setUser,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
