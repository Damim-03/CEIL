/* ===============================================================
   ThemeContext.tsx — Dark Mode System
   
   📁 src/context/ThemeContext.tsx
   
   Features:
   - System preference detection
   - localStorage persistence
   - Smooth CSS transitions
   - Tailwind dark: class strategy
=============================================================== */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getSystemTheme = (): "light" | "dark" =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("ceil-theme") as Theme | null;
    return stored || "light";
  });

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  // Apply dark class to <html>
  useEffect(() => {
    const root = document.documentElement;

    // Smooth transition for theme change
    root.style.setProperty("transition", "background-color 0.3s ease, color 0.3s ease");

    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Clean up transition after animation
    const timer = setTimeout(() => {
      root.style.removeProperty("transition");
    }, 300);

    return () => clearTimeout(timer);
  }, [resolvedTheme]);

  // Listen to system preference changes
  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setThemeState("system"); // triggers re-render
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("ceil-theme", newTheme);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};