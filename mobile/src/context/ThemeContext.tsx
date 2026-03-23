// src/context/ThemeContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors, type AppColors } from "../constants/theme";

// ── Types ─────────────────────────────────────────────────────────
type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode; // الخيار المحفوظ (light | dark | system)
  isDark: boolean; // النتيجة الفعلية
  colors: AppColors; // الألوان الجاهزة للاستخدام
  setMode: (m: ThemeMode) => void;
  toggleTheme: () => void;
}

// ── Context ───────────────────────────────────────────────────────
const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "ceil_theme_mode";

// ── Provider ──────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [ready, setReady] = useState(false);

  // ── Load saved preference ─────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") {
        setModeState(saved);
      }
      setReady(true);
    });
  }, []);

  // ── Resolve actual dark/light ─────────────────────────────────
  const isDark =
    mode === "dark" || (mode === "system" && systemScheme === "dark");

  const colors: AppColors = isDark ? darkColors : lightColors;

  // ── Set mode + persist ────────────────────────────────────────
  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  }, []);

  // ── Toggle light ↔ dark ───────────────────────────────────────
  const toggleTheme = useCallback(() => {
    setMode(isDark ? "light" : "dark");
  }, [isDark, setMode]);

  // Don't render until we've loaded the saved preference
  if (!ready) return null;

  return (
    <ThemeContext.Provider
      value={{ mode, isDark, colors, setMode, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────
export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
