// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { apiClient, sessionEvents, SESSION_EXPIRED_EVENT } from "../api/client";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

// ── Types ────────────────────────────────────────────────────────
interface Student {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  phone_number: string | null;
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

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginWithGoogle: () => Promise<void>; // ✅
}

// ── Context ──────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

const KEYS = {
  accessToken: "ceil_access_token",
  refreshToken: "ceil_refresh_token",
  user: "ceil_user",
} as const;

// ── Google Client IDs ─────────────────────────────────────────────
// 🔑 ضع هنا الـ Client IDs من Google Cloud Console
const GOOGLE_WEB_CLIENT_ID =
  "631352520680-u904t4var3ud8ko1pk312mrthbdd8msq.apps.googleusercontent.com";

// ── Provider ─────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // ── Google Auth Request ───────────────────────────────────────
  const [_, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId:
      Platform.OS === "android" ? GOOGLE_WEB_CLIENT_ID : undefined,
    iosClientId: Platform.OS === "ios" ? GOOGLE_WEB_CLIENT_ID : undefined,
  });

  console.log("Redirect URI:", AuthSession.makeRedirectUri({ scheme: "ceil" }));

  // ── Handle Google Response ────────────────────────────────────
  useEffect(() => {
    if (googleResponse?.type === "success") {
      const token = googleResponse.authentication?.accessToken;
      if (token) handleGoogleMobile(token);
    }
  }, [googleResponse]);

  // ── Boot ──────────────────────────────────────────────────────
  useEffect(() => {
    restoreSession();

    const handleExpired = async () => {
      await clearStorage();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    };

    sessionEvents.on(SESSION_EXPIRED_EVENT, handleExpired);
    return () => {
      sessionEvents.off(SESSION_EXPIRED_EVENT, handleExpired);
    };
  }, []);

  // ── Restore session ───────────────────────────────────────────
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

      try {
        const { data } = await apiClient.get("/auth/me");
        await AsyncStorage.setItem(KEYS.user, JSON.stringify(data));
        setState({ user: data, isLoading: false, isAuthenticated: true });
      } catch {
        if (!cached) {
          await clearStorage();
          setState({ user: null, isLoading: false, isAuthenticated: false });
        }
      }
    } catch {
      await clearStorage();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  };

  // ── Login ─────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post("/auth/login", { email, password });

    await Promise.all([
      AsyncStorage.setItem(KEYS.accessToken, data.accessToken),
      AsyncStorage.setItem(KEYS.refreshToken, data.refreshToken ?? ""),
      AsyncStorage.setItem(KEYS.user, JSON.stringify(data.user)),
    ]);

    setState({ user: data.user, isLoading: false, isAuthenticated: true });
  }, []);

  // ── Register ──────────────────────────────────────────────────
  const register = useCallback(async (payload: RegisterPayload) => {
    const { data } = await apiClient.post("/auth/register", {
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      phone_number: payload.phone,
      password: payload.password,
    });

    if (data.accessToken) {
      await Promise.all([
        AsyncStorage.setItem(KEYS.accessToken, data.accessToken),
        AsyncStorage.setItem(KEYS.refreshToken, data.refreshToken ?? ""),
        AsyncStorage.setItem(KEYS.user, JSON.stringify(data.user)),
      ]);
      setState({ user: data.user, isLoading: false, isAuthenticated: true });
    } else {
      throw new Error("تم إنشاء الحساب، يرجى تسجيل الدخول");
    }
  }, []);

  // ── Google Mobile Login ───────────────────────────────────────
  const handleGoogleMobile = async (googleToken: string) => {
    try {
      const { data } = await apiClient.post("/auth/google/mobile", {
        accessToken: googleToken,
      });

      await Promise.all([
        AsyncStorage.setItem(KEYS.accessToken, data.accessToken),
        AsyncStorage.setItem(KEYS.refreshToken, data.refreshToken ?? ""),
        AsyncStorage.setItem(KEYS.user, JSON.stringify(data.user)),
      ]);

      setState({ user: data.user, isLoading: false, isAuthenticated: true });
    } catch (e) {
      console.error("Google mobile login failed:", e);
      throw e;
    }
  };

  const loginWithGoogle = useCallback(async () => {
    await googlePromptAsync();
  }, [googlePromptAsync]);

  // ── Logout ────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      await clearStorage();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  // ── Refresh user ──────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/auth/me");
      await AsyncStorage.setItem(KEYS.user, JSON.stringify(data));
      setState((prev) => ({ ...prev, user: data }));
    } catch {}
  }, []);

  // ── Clear storage ─────────────────────────────────────────────
  const clearStorage = async () => {
    await Promise.all([
      AsyncStorage.removeItem(KEYS.accessToken),
      AsyncStorage.removeItem(KEYS.refreshToken),
      AsyncStorage.removeItem(KEYS.user),
    ]);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUser,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const useStudent = () => useAuth().user?.student ?? null;
export const useIsAuthenticated = () => useAuth().isAuthenticated;
