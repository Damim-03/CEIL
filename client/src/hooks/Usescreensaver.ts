import { useEffect, useState, useRef, useCallback } from "react";

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
// For testing, use: const IDLE_TIMEOUT_MS = 10 * 1000;

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "touchmove",
  "scroll",
  "wheel",
  "click",
];

export function useScreenSaver() {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsIdle(false);
    timerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, IDLE_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    resetTimer();
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true }),
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer),
      );
    };
  }, [resetTimer]);

  return { isIdle, resetTimer };
}
