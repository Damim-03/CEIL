import { useEffect, useState } from "react";
import CeilLogo from "../assets/logo-2.png";

export default function PageLoader() {
  const [phase, setPhase] = useState<"dark" | "sweep" | "bright" | "hold">(
    "dark",
  );

  useEffect(() => {
    // Phase timeline (ms):
    // 0        → dark    (logo barely visible)
    // 600      → sweep   (light sweeps across)
    // 1400     → bright  (full reveal + glow)
    // 2800     → hold    (stays bright, subtle pulse)
    const t1 = setTimeout(() => setPhase("sweep"), 600);
    const t2 = setTimeout(() => setPhase("bright"), 1400);
    const t3 = setTimeout(() => setPhase("hold"), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: "#050505" }}
    >
      {/* ── Deep background vignette ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, #0d1a15 0%, #050505 100%)",
        }}
      />

      {/* ── Sweep light ray (the Mercedes beam) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(105deg, transparent 30%, rgba(196,160,53,0.08) 45%, rgba(255,255,255,0.18) 50%, rgba(196,160,53,0.08) 55%, transparent 70%)",
          transform:
            phase === "sweep"
              ? "translateX(100vw)"
              : phase === "dark"
                ? "translateX(-100vw)"
                : "translateX(100vw)",
          transition:
            phase === "sweep"
              ? "transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
        }}
      />

      {/* ── Ambient glow — only after reveal ── */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl transition-opacity duration-1000"
        style={{
          background:
            "radial-gradient(circle, rgba(43,111,94,0.35) 0%, transparent 70%)",
          opacity: phase === "bright" || phase === "hold" ? 1 : 0,
        }}
      />
      <div
        className="absolute w-64 h-64 rounded-full blur-2xl transition-opacity duration-1000"
        style={{
          background:
            "radial-gradient(circle, rgba(196,160,53,0.2) 0%, transparent 70%)",
          opacity: phase === "bright" || phase === "hold" ? 1 : 0,
          transitionDelay: "200ms",
        }}
      />

      {/* ── Main content ── */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="relative flex items-center justify-center">
          {/* Ripple rings — appear only after reveal */}
          {(phase === "bright" || phase === "hold") && (
            <>
              <span className="absolute w-56 h-56 rounded-full border border-[#2B6F5E]/20 animate-ring-out" />
              <span
                className="absolute w-44 h-44 rounded-full border border-[#C4A035]/15 animate-ring-out"
                style={{ animationDelay: "0.45s" }}
              />
              <span
                className="absolute w-32 h-32 rounded-full border border-[#2B6F5E]/25 animate-ring-out"
                style={{ animationDelay: "0.9s" }}
              />
            </>
          )}

          {/* Logo image */}
          <div
            className="w-40 h-40 transition-all"
            style={{
              filter:
                phase === "dark"
                  ? "brightness(0.08) saturate(0)"
                  : phase === "sweep"
                    ? "brightness(0.35) saturate(0.4)"
                    : phase === "bright"
                      ? "brightness(1.15) saturate(1.1) drop-shadow(0 0 32px rgba(43,111,94,0.7)) drop-shadow(0 0 60px rgba(196,160,53,0.3))"
                      : "brightness(1) saturate(1) drop-shadow(0 0 18px rgba(43,111,94,0.45)) drop-shadow(0 0 36px rgba(196,160,53,0.18))",
              transform: phase === "bright" ? "scale(1.06)" : "scale(1)",
              transition:
                phase === "sweep"
                  ? "filter 0.9s ease, transform 0.9s ease"
                  : phase === "bright"
                    ? "filter 0.6s ease-out, transform 0.6s ease-out"
                    : "filter 1.2s ease, transform 1.2s ease",
            }}
          >
            <img
              src={CeilLogo}
              alt="CEIL"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Text — fades in after reveal */}
        <div
          className="flex flex-col items-center gap-1.5"
          style={{
            opacity: phase === "bright" || phase === "hold" ? 1 : 0,
            transform:
              phase === "bright" || phase === "hold"
                ? "translateY(0)"
                : "translateY(10px)",
            transition:
              "opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s",
          }}
        >
          <p
            style={{
              fontFamily: "serif",
              fontSize: "11px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(196,160,53,0.8)",
            }}
          >
            مركز التعليم المكثف للغات
          </p>
          <p
            style={{
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(43,111,94,0.6)",
            }}
          >
            جامعة الشهيد حمّه لخضر · الوادي
          </p>
        </div>

        {/* Progress line — elegant thin bar */}
        <div
          className="overflow-hidden rounded-full"
          style={{
            width: "120px",
            height: "1px",
            background: "rgba(255,255,255,0.06)",
            opacity: phase === "bright" || phase === "hold" ? 1 : 0,
            transition: "opacity 0.6s ease 0.6s",
          }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, #C4A035, #2B6F5E, transparent)",
              animation: "progress-sweep 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes ring-out {
          0%   { transform: scale(0.85); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: scale(1.25); opacity: 0; }
        }
        .animate-ring-out {
          animation: ring-out 3s ease-out infinite;
        }

        @keyframes progress-sweep {
          0%   { width: 0%;   margin-left: 0%; }
          50%  { width: 60%;  margin-left: 20%; }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
