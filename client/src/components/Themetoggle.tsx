/* ===============================================================
   ThemeToggle.tsx — Dark Mode Toggle Button
   
   📁 src/components/ThemeToggle.tsx
   
   Usage in Header:
     import ThemeToggle from "../../../components/ThemeToggle";
     <ThemeToggle />
=============================================================== */

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../context/Themecontext";
import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils/utils";

const ThemeToggle = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const options = [
    { value: "light" as const, icon: Sun, label: "فاتح" },
    { value: "dark" as const, icon: Moon, label: "داكن" },
    { value: "system" as const, icon: Monitor, label: "النظام" },
  ];

  return (
    <div ref={ref} className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
          "bg-[#D8CDC0]/15 dark:bg-[#2A2A2A] hover:bg-[#D8CDC0]/25 dark:hover:bg-[#333333]",
          "text-[#6B5D4F] dark:text-[#AAAAAA] hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5]",
          "border border-transparent hover:border-[#D8CDC0]/30 dark:hover:border-[#444444]",
        )}
        title={resolvedTheme === "dark" ? "الوضع الداكن" : "الوضع الفاتح"}
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4.5 h-4.5" />
        ) : (
          <Sun className="w-4.5 h-4.5" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/40 dark:border-[#2A2A2A] rounded-xl shadow-xl dark:shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          {options.map((opt) => {
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80] font-medium"
                    : "text-[#6B5D4F] dark:text-[#888888] hover:bg-[#D8CDC0]/10 dark:hover:bg-[#2A2A2A] hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5]",
                )}
              >
                <opt.icon className="w-4 h-4" />
                <span>{opt.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2B6F5E] dark:bg-[#4ADE80]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;