/* ===============================================================
   ThemeToggleHeader.tsx — Nav Bar Variant
   
   📁 src/components/ThemeToggleHeader.tsx
   
   Same circular reveal animation as ThemeToggle but styled for
   the dark nav bar background (bg-brand-teal-dark / dark:bg-[#0F0F0F])
=============================================================== */

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../context/Themecontext";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../lib/utils/utils";

const ANIMATION_DURATION = 600;

const ThemeToggleHeader = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const animateThemeChange = useCallback(
    (newTheme: "light" | "dark" | "system") => {
      if (isAnimating) return;

      const root = document.documentElement;

      if ("startViewTransition" in document) {
        setIsAnimating(true);

        const btn = buttonRef.current;
        const rect = btn?.getBoundingClientRect();
        const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const y = rect ? rect.top + rect.height / 2 : 0;

        const maxRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
          setTheme(newTheme);
        });

        transition.ready.then(() => {
          root.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${maxRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: ANIMATION_DURATION,
              easing: "cubic-bezier(0.4, 0, 0.2, 1)",
              pseudoElement: "::view-transition-new(root)",
            }
          );
        });

        transition.finished.then(() => {
          setIsAnimating(false);
        });
      } else {
        performFallbackAnimation(newTheme);
      }
    },
    [isAnimating, setTheme]
  );

  const performFallbackAnimation = useCallback(
    (newTheme: "light" | "dark" | "system") => {
      setIsAnimating(true);

      const btn = buttonRef.current;
      const rect = btn?.getBoundingClientRect();
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const y = rect ? rect.top + rect.height / 2 : 0;

      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 99999;
        pointer-events: none;
        clip-path: circle(0px at ${x}px ${y}px);
        transition: clip-path ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1);
      `;

      const willBeDark =
        newTheme === "dark" ||
        (newTheme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      overlay.style.backgroundColor = willBeDark ? "#0F0F0F" : "#FAFAF8";
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.style.clipPath = `circle(${maxRadius}px at ${x}px ${y}px)`;
      });

      setTimeout(() => {
        setTheme(newTheme);
      }, ANIMATION_DURATION * 0.3);

      setTimeout(() => {
        overlay.remove();
        setIsAnimating(false);
      }, ANIMATION_DURATION);
    },
    [setTheme]
  );

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setOpen(false);
    const newResolved =
      newTheme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : newTheme;
    if (newResolved === resolvedTheme) {
      setTheme(newTheme);
      return;
    }
    animateThemeChange(newTheme);
  };

  const handleQuickToggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    animateThemeChange(newTheme);
  };

  const options = [
    { value: "light" as const, icon: Sun, label: "فاتح" },
    { value: "dark" as const, icon: Moon, label: "داكن" },
    { value: "system" as const, icon: Monitor, label: "النظام" },
  ];

  return (
    <div ref={ref} className="relative">
      {/* Toggle Button — styled for dark nav bar bg */}
      <button
        ref={buttonRef}
        onClick={handleQuickToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
        disabled={isAnimating}
        className={cn(
          "relative w-[30px] h-[30px] rounded-md flex items-center justify-center transition-all duration-200",
          "bg-white/[0.04] hover:bg-white/[0.09]",
          "text-white/50 hover:text-white/90",
          "border border-white/[0.1] hover:border-white/[0.16]",
          "active:scale-90",
          isAnimating && "pointer-events-none"
        )}
        title={`${resolvedTheme === "dark" ? "الوضع الداكن" : "الوضع الفاتح"} · كليك يمين للخيارات`}
      >
        <div className="relative w-[14px] h-[14px]">
          <Sun
            className={cn(
              "w-[14px] h-[14px] absolute inset-0 transition-all duration-500",
              resolvedTheme === "dark"
                ? "opacity-0 rotate-90 scale-0"
                : "opacity-100 rotate-0 scale-100"
            )}
          />
          <Moon
            className={cn(
              "w-[14px] h-[14px] absolute inset-0 transition-all duration-500",
              resolvedTheme === "dark"
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-90 scale-0"
            )}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={cn(
            "absolute top-full right-0 mt-2 w-36",
            "bg-white dark:bg-[#1A1A1A]",
            "border border-[#D8CDC0]/40 dark:border-[#2A2A2A]",
            "rounded-xl shadow-xl dark:shadow-black/50",
            "overflow-hidden z-50",
            "animate-in fade-in slide-in-from-top-2 duration-200"
          )}
        >
          {options.map((opt) => {
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleThemeChange(opt.value)}
                disabled={isAnimating}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80] font-medium"
                    : "text-[#6B5D4F] dark:text-[#888888] hover:bg-[#D8CDC0]/10 dark:hover:bg-[#2A2A2A] hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5]"
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

export default ThemeToggleHeader;