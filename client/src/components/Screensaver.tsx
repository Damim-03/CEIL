import { useEffect, useState } from "react";
import CeilLogo from "../assets/logo-2.png";

interface ScreenSaverProps {
  onDismiss: () => void;
}

export default function ScreenSaver({ onDismiss }: ScreenSaverProps) {
  const [visible, setVisible] = useState(false);
  const [logoPos, setLogoPos] = useState({ x: 50, y: 50 }); // percent
  const [moveDir, setMoveDir] = useState({ dx: 0.12, dy: 0.08 });

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Floating logo — bounces around the screen (DVD-style) slowly
  useEffect(() => {
    const interval = setInterval(() => {
      setLogoPos((pos) => {
        let nx = pos.x + moveDir.dx;
        let ny = pos.y + moveDir.dy;
        let ndx = moveDir.dx;
        let ndy = moveDir.dy;

        // bounds: keep logo (10%–90% to avoid clipping)
        if (nx <= 10 || nx >= 90) {
          ndx = -ndx;
          nx = Math.max(10, Math.min(90, nx));
        }
        if (ny <= 12 || ny >= 88) {
          ndy = -ndy;
          ny = Math.max(12, Math.min(88, ny));
        }

        setMoveDir({ dx: ndx, dy: ndy });
        return { x: nx, y: ny };
      });
    }, 40); // ~25fps smooth movement

    return () => clearInterval(interval);
  }, [moveDir]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 400);
  };

  return (
    <div
      onClick={handleDismiss}
      onKeyDown={handleDismiss}
      className="fixed inset-0 z-9999 cursor-pointer select-none"
      style={{
        background: "#060808",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      {/* Deep vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #0b1512 0%, #060808 100%)",
        }}
      />

      {/* Floating logo container */}
      <div
        className="absolute"
        style={{
          left: `${logoPos.x}%`,
          top: `${logoPos.y}%`,
          transform: "translate(-50%, -50%)",
          transition: "left 0.04s linear, top 0.04s linear",
        }}
      >
        {/* Pulse rings */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            width: "180px",
            height: "180px",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            border: "1px solid rgba(43,111,94,0.3)",
            animation: "ss-ring 3s ease-out infinite",
          }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{
            width: "180px",
            height: "180px",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            border: "1px solid rgba(196,160,53,0.2)",
            animation: "ss-ring 3s ease-out infinite",
            animationDelay: "1s",
          }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{
            width: "180px",
            height: "180px",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            border: "1px solid rgba(43,111,94,0.15)",
            animation: "ss-ring 3s ease-out infinite",
            animationDelay: "2s",
          }}
        />

        {/* Soft glow behind logo */}
        <div
          style={{
            position: "absolute",
            width: "120px",
            height: "120px",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(43,111,94,0.25) 0%, transparent 70%)",
            animation: "ss-glow 2.4s ease-in-out infinite",
          }}
        />

        {/* Logo image */}
        <img
          src={CeilLogo}
          alt="CEIL"
          style={{
            width: "96px",
            height: "96px",
            objectFit: "contain",
            display: "block",
            animation: "ss-breathe 2.4s ease-in-out infinite",
            filter:
              "brightness(0.85) drop-shadow(0 0 14px rgba(43,111,94,0.5)) drop-shadow(0 0 28px rgba(196,160,53,0.2))",
          }}
        />
      </div>

      {/* Bottom hint */}
      <div
        className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1"
        style={{
          opacity: visible ? 0.35 : 0,
          transition: "opacity 1s ease 1s",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(196,160,53,0.7)",
            fontFamily: "serif",
          }}
        >
          مركز التعليم المكثف للغات
        </p>
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.18em",
            color: "rgba(43,111,94,0.5)",
          }}
        >
          انقر في أي مكان للمتابعة
        </p>
      </div>

      <style>{`
        @keyframes ss-breathe {
          0%, 100% { transform: scale(1);    opacity: 0.75; }
          50%       { transform: scale(1.06); opacity: 1; }
        }
        @keyframes ss-glow {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.3); }
        }
        @keyframes ss-ring {
          0%   { transform: translate(-50%, -50%) scale(0.7); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
