// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../lib/api/auth.api";

/* ================= TYPES ================= */

export type User = {
  user_id: string;
  email: string;
  role: "ADMIN" | "STUDENT" | "TEACHER";
  google_avatar?: string;
  created_at?: string;
  is_active?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  setUser: () => {},
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

/* ================= PROVIDER ================= */

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // تحميل بيانات المستخدم عند بداية التطبيق
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const userData = await authApi.me();
        if (isMounted) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        // الـ interceptor سيحاول التجديد تلقائيًا
        // إذا فشل، سيتم تسجيل الخروج تلقائيًا من الـ interceptor
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // تسجيل الدخول
  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });

      // حفظ الـ tokens
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);

      // تحديث حالة المستخدم
      setUser(response.user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // تسجيل الخروج
  const logout = async () => {
    try {
      // استدعاء API logout
      await authApi.logout();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      // مسح البيانات المحلية
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      // إعادة التوجيه لصفحة تسجيل الدخول
      window.location.href = "/login";
    }
  };

  // تحديث بيانات المستخدم
  const refreshUser = async () => {
    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
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

/* ================= HOOK ================= */

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
