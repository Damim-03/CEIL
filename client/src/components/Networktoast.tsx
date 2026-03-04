import { useEffect, useRef, useState } from "react";
import { Wifi, WifiOff, WifiZero } from "lucide-react";
import { useNetworkStatus } from "../hooks/Usenetworkstatus";
import type { NetworkQuality } from "../hooks/Usenetworkstatus";

const CONFIG: Record<
  NetworkQuality,
  { icon: React.ElementType; msg: string; sub: string; color: string; bg: string; border: string }
> = {
  online: {
    icon: Wifi,
    msg: "عادت الاتصال",
    sub: "Connection restored",
    color: "text-[#2B6F5E]",
    bg: "bg-[#2B6F5E]/10 dark:bg-[#2B6F5E]/15",
    border: "border-[#2B6F5E]/30 dark:border-[#2B6F5E]/25",
  },
  slow: {
    icon: WifiZero,
    msg: "اتصال ضعيف",
    sub: "Slow connection detected",
    color: "text-[#C4A035]",
    bg: "bg-[#C4A035]/10 dark:bg-[#C4A035]/12",
    border: "border-[#C4A035]/30 dark:border-[#C4A035]/25",
  },
  offline: {
    icon: WifiOff,
    msg: "لا يوجد اتصال",
    sub: "You are offline",
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800/40",
  },
};

export default function NetworkToast() {
  const { status } = useNetworkStatus();
  const prevStatus = useRef<NetworkQuality | null>(null);
  const [show, setShow] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<NetworkQuality>("online");
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Skip the very first "online" on mount — no need to announce it
    if (prevStatus.current === null) {
      prevStatus.current = status;
      return;
    }
    if (prevStatus.current === status) return;
    prevStatus.current = status;

    // Show toast
    setCurrentStatus(status);
    setShow(true);

    if (hideTimer.current) clearTimeout(hideTimer.current);

    // offline stays visible until restored; online/slow auto-hide after 4s
    if (status !== "offline") {
      hideTimer.current = setTimeout(() => setShow(false), 4000);
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [status]);

  const cfg = CONFIG[currentStatus];
  const Icon = cfg.icon;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 left-1/2 z-[99999] pointer-events-none"
      style={{
        transform: show
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(-110%)",
        transition: "transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div
        className={`
          flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg
          border backdrop-blur-sm pointer-events-auto
          ${cfg.bg} ${cfg.border}
        `}
        style={{ minWidth: "260px", maxWidth: "380px" }}
      >
        {/* Icon */}
        <div className={`shrink-0 ${cfg.color}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-tight ${cfg.color}`}>
            {cfg.msg}
          </p>
          <p className="text-xs text-[#6B5D4F] dark:text-[#888888] mt-0.5 leading-tight">
            {cfg.sub}
          </p>
        </div>

        {/* Dot indicator */}
        <div className="shrink-0">
          <span
            className={`
              block w-2.5 h-2.5 rounded-full
              ${currentStatus === "online"  ? "bg-[#2B6F5E] animate-pulse" : ""}
              ${currentStatus === "slow"    ? "bg-[#C4A035] animate-pulse" : ""}
              ${currentStatus === "offline" ? "bg-red-500" : ""}
            `}
          />
        </div>
      </div>
    </div>
  );
}