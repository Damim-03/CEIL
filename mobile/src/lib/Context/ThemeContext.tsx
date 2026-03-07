// ================================================================
// src/lib/Context/ThemeContext.tsx
// Global theme — shared across all screens like Telegram
// ================================================================
import React, { createContext, useContext, useState, useCallback } from "react";
import { useColorScheme } from "react-native";

// ── Palettes ─────────────────────────────────────────────────────
export const dark = {
  isDark:   true,
  bg:       "#0A0A0A",
  surface:  "#141414",
  surface2: "#1C1C1C",
  surface3: "#242424",
  border:   "#2A2A2A",
  text1:    "#F0F0F0",
  text2:    "#A0A0A0",
  text3:    "#555555",
  heroTint: "rgba(255,255,255,0.06)",
  navBg:    "#111111",
  pillBg:   "#1A2E26",
  navBorder:"#1E2E28",
  inactive: "#4A5A52",
};

export const light = {
  isDark:   false,
  bg:       "#F4F6F5",
  surface:  "#FFFFFF",
  surface2: "#F0F2F1",
  surface3: "#E8EDEB",
  border:   "#E0E6E3",
  text1:    "#111111",
  text2:    "#555555",
  text3:    "#AAAAAA",
  heroTint: "rgba(0,0,0,0.06)",
  navBg:    "#FFFFFF",
  pillBg:   "#EAF4F0",
  navBorder:"#E0EDE8",
  inactive: "#9AABA3",
};

export type Theme = typeof dark;

// ── Context ───────────────────────────────────────────────────────
interface ThemeCtx {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: dark,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(scheme === "dark");

  const toggleTheme = useCallback(() => setIsDark(prev => !prev), []);

  return (
    <ThemeContext.Provider value={{ theme: isDark ? dark : light, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}