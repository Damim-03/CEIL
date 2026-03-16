import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { authApi } from "../lib/api/auth.api";

export type User = {
  user_id: string;
  email: string;
  role: "OWNER" | "ADMIN" | "STUDENT" | "TEACHER";
  first_name?: string;
  last_name?: string;
  display_name?: string;
  google_avatar?: string;
  is_active?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  setUser: () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const userData = await authApi.me();
        if (mounted) setUser(userData);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadUser();
    return () => { mounted = false; };
  }, []);

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    setUser(null);
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
  };

  const refreshUser = async () => {
    const userData = await authApi.me();
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated: !!user,
      setUser, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
