import { useEffect, useState, useRef } from "react";

export type NetworkQuality = "online" | "slow" | "offline";

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkQuality>(
    navigator.onLine ? "online" : "offline"
  );
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ping test to measure latency
  const checkQuality = async () => {
    if (!navigator.onLine) {
      setStatus("offline");
      return;
    }
    try {
      const start = Date.now();
      await fetch("/favicon.ico?_=" + start, {
        method: "HEAD",
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });
      const latency = Date.now() - start;
      setStatus(latency > 1500 ? "slow" : "online");
    } catch {
      setStatus(navigator.onLine ? "slow" : "offline");
    }
  };

  useEffect(() => {
    const handleOnline  = () => checkQuality();
    const handleOffline = () => setStatus("offline");

    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);

    // Poll every 20s
    pingRef.current = setInterval(checkQuality, 20_000);
    checkQuality();

    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (pingRef.current) clearInterval(pingRef.current);
    };
  }, []);

  return { status };
}