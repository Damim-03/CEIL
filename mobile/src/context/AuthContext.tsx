import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../api/client";

interface Student {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  phone_number: string | null;
  nationality: string | null;
  education_level: string | null;
  study_location: string | null;
  registrant_category: string;
  status: string;
}

interface User {
  user_id: string;
  email: string;
  role: "STUDENT";
  google_avatar: string | null;
  student: Student | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const KEYS = {
  accessToken: "ceil_access_token",
  refreshToken: "ceil_refresh_token",
  user: "ceil_user",
} as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const [token, cached] = await Promise.all([
        AsyncStorage.getItem(KEYS.accessToken),
        AsyncStorage.getItem(KEYS.user),
      ]);

      if (!token) {
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      if (cached) {
        const user: User = JSON.parse(cached);
        setState({ user, isLoading: false, isAuthenticated: true });
      }

      const { data } = await apiClient.get("/auth/me");
      await AsyncStorage.setItem(KEYS.user, JSON.stringify(data));
      setState({ user: data, isLoading: false, isAuthenticated: true });
    } catch {
      await clearStorage();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post("/auth/login", { email, password });

    if (data.user?.role !== "STUDENT") {
      throw new Error("هذا التطبيق مخصص للطلاب فقط");
    }

    await Promise.all([
      AsyncStorage.setItem(KEYS.accessToken, data.accessToken),
      AsyncStorage.setItem(KEYS.refreshToken, data.refreshToken ?? ""),
      AsyncStorage.setItem(KEYS.user, JSON.stringify(data.user)),
    ]);

    setState({ user: data.user, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // silent
    } finally {
      await clearStorage();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/auth/me");
      await AsyncStorage.setItem(KEYS.user, JSON.stringify(data));
      setState((prev) => ({ ...prev, user: data }));
    } catch {
      // silent
    }
  }, []);

  const clearStorage = async () => {
    await Promise.all([
      AsyncStorage.removeItem(KEYS.accessToken),
      AsyncStorage.removeItem(KEYS.refreshToken),
      AsyncStorage.removeItem(KEYS.user),
    ]);
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const useStudent = () => useAuth().user?.student ?? null;
export const useIsAuthenticated = () => useAuth().isAuthenticated;
