// ================================================================
// 📦 src/hooks/useIdleTimer.ts
// ✅ يراقب النشاط ويُطلق callback عند الخمول
// ================================================================

import { useEffect, useRef, useCallback } from "react";

interface UseIdleTimerOptions {
  /** مدة الخمول بالميلي ثانية (افتراضي: 30 دقيقة) */
  timeout?: number;
  /** يُستدعى عند انتهاء المهلة */
  onIdle: () => void;
  /** هل الـ timer نشط؟ */
  enabled?: boolean;
}

const IDLE_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "touchmove",
  "scroll",
  "wheel",
  "click",
] as const;

export function useIdleTimer({
  timeout = 30 * 60 * 1000, // 30 min
  onIdle,
  enabled = true,
}: UseIdleTimerOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onIdleRef.current(), timeout);
  }, [timeout]);

  useEffect(() => {
    if (!enabled) return;

    reset(); // ابدأ الـ timer عند التفعيل

    const handleActivity = () => reset();
    IDLE_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true }),
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      IDLE_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
    };
  }, [enabled, reset]);
}
