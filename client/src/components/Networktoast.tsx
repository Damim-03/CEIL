import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Wifi, WifiOff } from "lucide-react";
import { useNetworkStatus } from "../hooks/Usenetworkstatus";
import type { NetworkQuality } from "../hooks/Usenetworkstatus";

// WifiZero doesn't exist in lucide — use a custom weak-wifi icon
function WifiWeak({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 20h.01" />
      <path d="M8.5 16.5a5 5 0 0 1 7 0" opacity="0.3" />
      <path d="M5 12.5a9 9 0 0 1 14 0" opacity="0.15" />
    </svg>
  );
}

const CONFIG: Record<
  NetworkQuality,
  {
    icon: React.ElementType;
    msg: string;
    sub: string;
    dotColor: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    shadowColor: string;
  }
> = {
  online: {
    icon: Wifi,
    msg: "عادت الاتصال",
    sub: "Connection restored",
    dotColor: "#2B6F5E",
    textColor: "#2B6F5E",
    bgColor: "rgba(43,111,94,0.08)",
    borderColor: "rgba(43,111,94,0.25)",
    shadowColor: "rgba(43,111,94,0.15)",
  },
  slow: {
    icon: WifiWeak,
    msg: "اتصال ضعيف",
    sub: "Slow connection detected",
    dotColor: "#C4A035",
    textColor: "#C4A035",
    bgColor: "rgba(196,160,53,0.08)",
    borderColor: "rgba(196,160,53,0.25)",
    shadowColor: "rgba(196,160,53,0.12)",
  },
  offline: {
    icon: WifiOff,
    msg: "لا يوجد اتصال",
    sub: "You are offline",
    dotColor: "#ef4444",
    textColor: "#ef4444",
    bgColor: "rgba(239,68,68,0.07)",
    borderColor: "rgba(239,68,68,0.22)",
    shadowColor: "rgba(239,68,68,0.12)",
  },
};

function Toast() {
  const { status } = useNetworkStatus();
  const prevStatus = useRef<NetworkQuality | null>(null);
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState<NetworkQuality>("online");
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevStatus.current === null) {
      prevStatus.current = status;
      return;
    }
    if (prevStatus.current === status) return;
    prevStatus.current = status;

    setCurrent(status);
    setShow(true);

    if (hideTimer.current) clearTimeout(hideTimer.current);

    if (status !== "offline") {
      hideTimer.current = setTimeout(() => setShow(false), 4000);
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [status]);

  const cfg = CONFIG[current];
  const Icon = cfg.icon;

  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        zIndex: 2147483647, // max z-index — above everything
        transform: show
          ? "translateX(-50%) translateY(0px)"
          : "translateX(-50%) translateY(-16px)",
        opacity: show ? 1 : 0,
        visibility: show ? "visible" : "hidden",
        transition: show
          ? "transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease"
          : "transform 0.25s ease, opacity 0.22s ease, visibility 0s linear 0.22s",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 18px",
          borderRadius: "16px",
          border: `1px solid ${cfg.borderColor}`,
          background: cfg.bgColor,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: `0 8px 32px ${cfg.shadowColor}, 0 2px 8px rgba(0,0,0,0.12)`,
          minWidth: "240px",
          maxWidth: "360px",
          // Dark mode via CSS variable fallback
          backgroundColor: cfg.bgColor,
        }}
      >
        {/* Icon */}
        <Icon
          className="w-[18px] h-[18px] shrink-0"
          style={{ color: cfg.textColor }}
        />

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: cfg.textColor,
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            {cfg.msg}
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "rgba(107,93,79,0.85)",
              marginTop: "2px",
              lineHeight: 1.3,
              margin: "2px 0 0",
            }}
          >
            {cfg.sub}
          </p>
        </div>

        {/* Status dot */}
        <span
          style={{
            display: "block",
            width: "9px",
            height: "9px",
            borderRadius: "50%",
            background: cfg.dotColor,
            flexShrink: 0,
            animation:
              current !== "offline"
                ? "nt-pulse 1.5s ease-in-out infinite"
                : "none",
            boxShadow: `0 0 6px ${cfg.dotColor}`,
          }}
        />
      </div>

      <style>{`
        @keyframes nt-pulse {
          0%, 100% { opacity: 1;   transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}

// ✅ Portal — renders directly into document.body, escapes ALL overflow/z-index stacking
export default function NetworkToast() {
  return createPortal(<Toast />, document.body);
}
