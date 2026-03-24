// ================================================================
// 📦 src/components/SessionExpiredModal.tsx
// ✅ Modal انتهاء الجلسة — CEIL Platform
// يُعرض عند:
//   1. انتهاء idle timeout (useIdleTimer)
//   2. استجابة 401 من axios (token منتهي)
// ================================================================

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Clock, ShieldAlert } from "lucide-react";

/* ─── أنيميشن keyframes (CSS-in-JS مدمج) ─── */
const STYLES = `
@keyframes ceil-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes ceil-slide-up {
  from { opacity: 0; transform: translateY(28px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes ceil-spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes ceil-pulse-ring {
  0%   { transform: scale(1);    opacity: 0.6; }
  70%  { transform: scale(1.35); opacity: 0;   }
  100% { transform: scale(1.35); opacity: 0;   }
}
@keyframes ceil-tick {
  0%, 100% { transform: scaleY(1); }
  50%       { transform: scaleY(0.85); }
}
@keyframes ceil-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
`;

/* ─── SVG decorative lock icon ─── */
function LockIcon({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* shackle */}
      <path
        d="M20 28V22C20 14.268 25.373 8 32 8C38.627 8 44 14.268 44 22V28"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* body */}
      <rect
        x="13"
        y="28"
        width="38"
        height="28"
        rx="6"
        fill={`${color}18`}
        stroke={color}
        strokeWidth="3"
      />
      {/* keyhole */}
      <circle cx="32" cy="42" r="4" fill={color} />
      <rect x="30" y="44" width="4" height="6" rx="2" fill={color} />
    </svg>
  );
}

/* ─── Countdown ring SVG ─── */
function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const progress = (seconds / total) * circ;
  const color =
    seconds <= 5 ? "#ef4444" : seconds <= 10 ? "#f97316" : "#C4A035";

  return (
    <svg width="64" height="64" style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="4"
      />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - progress}
        style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s ease" }}
      />
    </svg>
  );
}

/* ════════════════════════════════════════════════
   MAIN MODAL COMPONENT
════════════════════════════════════════════════ */
interface SessionExpiredModalProps {
  open: boolean;
  /** سبب انتهاء الجلسة */
  reason?: "idle" | "token";
  /** عند الضغط على "تسجيل الدخول" */
  onLogin?: () => void;
  /** عدد ثواني العد التنازلي قبل إعادة التوجيه (0 = بدون) */
  autoRedirectSeconds?: number;
}

export function SessionExpiredModal({
  open,
  reason = "idle",
  onLogin,
  autoRedirectSeconds = 15,
}: SessionExpiredModalProps) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(autoRedirectSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* inject CSS once */
  useEffect(() => {
    if (document.getElementById("ceil-session-styles")) return;
    const tag = document.createElement("style");
    tag.id = "ceil-session-styles";
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }, []);

  /* countdown */
  useEffect(() => {
    if (!open || autoRedirectSeconds === 0) return;
    setCountdown(autoRedirectSeconds);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleLogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [open]);

  function handleLogin() {
    clearInterval(timerRef.current!);
    if (onLogin) {
      onLogin();
    } else {
      navigate("/login", { replace: true });
    }
  }

  if (!open) return null;

  const isIdle = reason === "idle";
  const accentColor = "#C4A035";
  const glowColor = isIdle ? "#C4A035" : "#ef4444";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        animation: "ceil-fade-in 0.25s ease forwards",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(5, 12, 9, 0.88)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          borderRadius: "24px",
          overflow: "hidden",
          background:
            "linear-gradient(155deg, #0d1f18 0%, #162d22 55%, #0a1810 100%)",
          border: `1px solid ${glowColor}30`,
          boxShadow: `0 0 80px ${glowColor}20, 0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)`,
          animation:
            "ceil-slide-up 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        {/* Top glow line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${glowColor}80, transparent)`,
          }}
        />

        {/* Ambient mesh bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(circle at 80% 10%, ${glowColor}18 0%, transparent 55%), radial-gradient(circle at 15% 85%, rgba(43,111,94,0.15) 0%, transparent 50%)`,
          }}
        />

        {/* Grid texture */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.03,
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="sm-grid"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="white"
                strokeWidth="0.7"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sm-grid)" />
        </svg>

        <div style={{ position: "relative", padding: "2.5rem 2rem 2rem" }}>
          {/* ── Icon zone ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "1.75rem",
            }}
          >
            {/* pulse rings */}
            <div
              style={{
                position: "relative",
                width: "96px",
                height: "96px",
                marginBottom: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* outer ring */}
              <div
                style={{
                  position: "absolute",
                  inset: "-12px",
                  borderRadius: "50%",
                  border: `1.5px solid ${glowColor}40`,
                  animation: "ceil-pulse-ring 2.5s ease-out infinite",
                }}
              />
              {/* mid ring */}
              <div
                style={{
                  position: "absolute",
                  inset: "-4px",
                  borderRadius: "50%",
                  border: `1px solid ${glowColor}25`,
                  animation: "ceil-pulse-ring 2.5s ease-out infinite 0.4s",
                }}
              />
              {/* icon bg */}
              <div
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${glowColor}20 0%, ${glowColor}08 70%)`,
                  border: `1.5px solid ${glowColor}35`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 30px ${glowColor}25`,
                }}
              >
                <div style={{ width: "52px", height: "52px" }}>
                  {isIdle ? (
                    <LockIcon color={glowColor} />
                  ) : (
                    <ShieldAlert
                      className="w-full h-full"
                      style={{ color: glowColor }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Text ── */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#ffffff",
                marginBottom: "0.5rem",
                lineHeight: 1.2,
              }}
            >
              {isIdle ? "انتهت جلستك" : "انتهت صلاحية الجلسة"}
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.6,
                maxWidth: "300px",
                margin: "0 auto",
              }}
            >
              {isIdle
                ? "لم يتم رصد أي نشاط لفترة طويلة. تم إنهاء جلستك تلقائياً لحماية حسابك."
                : "انتهت صلاحية رمز الدخول. يرجى تسجيل الدخول من جديد للمتابعة."}
            </p>
          </div>

          {/* ── Info row ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.875rem 1rem",
              borderRadius: "14px",
              marginBottom: "1.5rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                flexShrink: 0,
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock
                style={{ width: "18px", height: "18px", color: accentColor }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: `${accentColor}80`,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "2px",
                }}
              >
                {isIdle ? "سبب الإنهاء" : "حالة الرمز"}
              </p>
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {isIdle
                  ? "عدم النشاط لفترة طويلة"
                  : "رمز الدخول منتهي الصلاحية"}
              </p>
            </div>
            {/* countdown ring */}
            {autoRedirectSeconds > 0 && (
              <div
                style={{
                  position: "relative",
                  width: "64px",
                  height: "64px",
                  flexShrink: 0,
                }}
              >
                <CountdownRing
                  seconds={countdown}
                  total={autoRedirectSeconds}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    animation:
                      countdown <= 5 ? "ceil-tick 1s ease infinite" : undefined,
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 900,
                      tabularNums: "tabular-nums",
                      color:
                        countdown <= 5
                          ? "#ef4444"
                          : countdown <= 10
                            ? "#f97316"
                            : accentColor,
                      lineHeight: 1,
                    }}
                  >
                    {countdown}
                  </span>
                  <span
                    style={{
                      fontSize: "0.55rem",
                      color: "rgba(255,255,255,0.3)",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}
                  >
                    ثانية
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── CTA Button ── */}
          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "0.9rem",
              borderRadius: "14px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              fontSize: "0.95rem",
              fontWeight: 800,
              letterSpacing: "0.01em",
              color: "#0a1810",
              background: `linear-gradient(135deg, ${accentColor} 0%, #d4b040 50%, ${accentColor} 100%)`,
              backgroundSize: "200% auto",
              boxShadow: `0 0 24px ${accentColor}40, 0 8px 24px rgba(0,0,0,0.3)`,
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              animation: "ceil-shimmer 3s linear infinite",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                `0 0 36px ${accentColor}60, 0 12px 32px rgba(0,0,0,0.4)`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                `0 0 24px ${accentColor}40, 0 8px 24px rgba(0,0,0,0.3)`;
            }}
          >
            <LogIn style={{ width: "18px", height: "18px" }} />
            تسجيل الدخول مجدداً
          </button>

          {/* ── Footer note ── */}
          <p
            style={{
              textAlign: "center",
              marginTop: "1rem",
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.02em",
            }}
          >
            CEIL · Centre d'Enseignement Intensif des Langues
          </p>
        </div>

        {/* Bottom glow line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: `linear-gradient(90deg, transparent, rgba(196,160,53,0.3), transparent)`,
          }}
        />
      </div>
    </div>
  );
}

export default SessionExpiredModal;
