import { useEffect, useState } from "react";
import CeilLogo from "../assets/logo-2.png";

export default function PageLoader() {
  const [phase, setPhase] = useState<"dark" | "sweep" | "bright" | "hold">(
    "dark",
  );

  useEffect(() => {
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
            "radial-gradient(ellipse 70% 60% at 50% 50%, #0d1a15 0%, #050505 100%)",
        }}
      />

      {/* ── Sweep light ray ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(105deg, transparent 25%, rgba(196,160,53,0.06) 42%, rgba(255,255,255,0.22) 50%, rgba(196,160,53,0.06) 58%, transparent 75%)",
          transform:
            phase === "sweep"
              ? "translateX(220vw)"
              : phase === "dark"
                ? "translateX(-120vw)"
                : "translateX(220vw)",
          transition:
            phase === "sweep"
              ? "transform 1s cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
        }}
      />

      {/* ── Ambient glow large ── */}
      <div
        className="absolute rounded-full blur-3xl transition-opacity duration-1000"
        style={{
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(43,111,94,0.3) 0%, transparent 70%)",
          opacity: phase === "bright" || phase === "hold" ? 1 : 0,
        }}
      />

      {/* ── Ambient glow gold ── */}
      <div
        className="absolute rounded-full blur-2xl transition-opacity duration-1000"
        style={{
          width: "300px",
          height: "300px",
          background:
            "radial-gradient(circle, rgba(196,160,53,0.22) 0%, transparent 70%)",
          opacity: phase === "bright" || phase === "hold" ? 1 : 0,
          transitionDelay: "300ms",
        }}
      />

      {/* ── Main content ── */}
      <div className="relative flex flex-col items-center gap-9">
        {/* Logo */}
        <div className="relative flex items-center justify-center">
          {/* Ripple rings */}
          {(phase === "bright" || phase === "hold") && (
            <>
              <span
                className="absolute rounded-full border border-[#2B6F5E]/18 animate-ring-out"
                style={{ width: "300px", height: "300px" }}
              />
              <span
                className="absolute rounded-full border border-[#C4A035]/13 animate-ring-out"
                style={{
                  width: "260px",
                  height: "260px",
                  animationDelay: "0.5s",
                }}
              />
              <span
                className="absolute rounded-full border border-[#2B6F5E]/22 animate-ring-out"
                style={{
                  width: "220px",
                  height: "220px",
                  animationDelay: "1s",
                }}
              />
              <span
                className="absolute rounded-full border border-[#C4A035]/10 animate-ring-out"
                style={{
                  width: "180px",
                  height: "180px",
                  animationDelay: "1.5s",
                }}
              />
            </>
          )}

          {/* Logo image */}
          <div
            style={{
              width: "200px",
              height: "200px",
              filter:
                phase === "dark"
                  ? "brightness(0.08) saturate(0)"
                  : phase === "sweep"
                    ? "brightness(0.35) saturate(0.4)"
                    : phase === "bright"
                      ? "brightness(1.2) saturate(1.15) drop-shadow(0 0 40px rgba(43,111,94,0.8)) drop-shadow(0 0 80px rgba(196,160,53,0.35))"
                      : "brightness(1.05) saturate(1) drop-shadow(0 0 22px rgba(43,111,94,0.5)) drop-shadow(0 0 44px rgba(196,160,53,0.22))",
              transform: phase === "bright" ? "scale(1.08)" : "scale(1)",
              transition:
                phase === "sweep"
                  ? "filter 1s ease, transform 1s ease"
                  : phase === "bright"
                    ? "filter 0.7s ease-out, transform 0.7s ease-out"
                    : "filter 1.4s ease, transform 1.4s ease",
              animation:
                phase === "hold"
                  ? "pulse-hold 3s ease-in-out infinite"
                  : "none",
            }}
          >
            <img
              src={CeilLogo}
              alt="CEIL"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Text */}
        <div
          className="flex flex-col items-center gap-2.5"
          style={{
            opacity: phase === "bright" || phase === "hold" ? 1 : 0,
            transform:
              phase === "bright" || phase === "hold"
                ? "translateY(0)"
                : "translateY(14px)",
            transition:
              "opacity 0.9s ease-out 0.4s, transform 0.9s ease-out 0.4s",
          }}
        >
          <p
            style={{
              fontFamily: "serif",
              fontSize: "13px",
              letterSpacing: "0.22em",
              color: "rgba(196,160,53,0.85)",
              textAlign: "center",
            }}
          >
            مركز التعليم المكثّف للغات
          </p>

          {/* Divider */}
          <div
            style={{
              width: "60px",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(196,160,53,0.5), transparent)",
            }}
          />

          <p
            style={{
              fontSize: "10px",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(43,111,94,0.65)",
              textAlign: "center",
            }}
          >
            Université Echahid Hamma Lakhdar · El Oued
          </p>
        </div>

        {/* Progress line */}
        <div
          className="overflow-hidden rounded-full"
          style={{
            width: "160px",
            height: "1px",
            background: "rgba(255,255,255,0.05)",
            opacity: phase === "bright" || phase === "hold" ? 1 : 0,
            transition: "opacity 0.6s ease 0.8s",
          }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, #C4A035, #2B6F5E, transparent)",
              animation: "progress-sweep 2.2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes ring-out {
          0%   { transform: scale(0.85); opacity: 0; }
          15%  { opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .animate-ring-out {
          animation: ring-out 3.5s ease-out infinite;
        }

        @keyframes progress-sweep {
          0%   { width: 0%;   margin-left: 0%; }
          50%  { width: 60%;  margin-left: 20%; }
          100% { width: 0%;   margin-left: 100%; }
        }

        @keyframes pulse-hold {
          0%, 100% {
            filter: brightness(1.05) saturate(1)
              drop-shadow(0 0 22px rgba(43,111,94,0.5))
              drop-shadow(0 0 44px rgba(196,160,53,0.22));
          }
          50% {
            filter: brightness(1.1) saturate(1)
              drop-shadow(0 0 30px rgba(43,111,94,0.6))
              drop-shadow(0 0 55px rgba(196,160,53,0.28));
          }
        }
      `}</style>
    </div>
  );
}
