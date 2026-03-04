import { useEffect, useState } from "react";
import CeilLogo from "../assets/logo-2.png";

interface ScreenSaverProps {
  onDismiss: () => void;
}

const TEXTS = [
  "جامعة الشهيد حمّه لخضر - الوادي",
  "مركز التعليم المكثف للغات",
  "Université Echahid Hamma Lakhdar - El Oued",
  "Centre d'Enseignement Intensif des Langues",
];

export default function ScreenSaver({ onDismiss }: ScreenSaverProps) {
  const [visible, setVisible] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true); // true = typing, false = erasing

  // Fade in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Typewriter engine
  useEffect(() => {
    const fullText = TEXTS[textIndex];

    if (typing) {
      if (displayed.length < fullText.length) {
        const t = setTimeout(() => {
          setDisplayed(fullText.slice(0, displayed.length + 1));
        }, 55);
        return () => clearTimeout(t);
      } else {
        // Finished typing — pause then start erasing
        const t = setTimeout(() => setTyping(false), 2200);
        return () => clearTimeout(t);
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1));
        }, 30);
        return () => clearTimeout(t);
      } else {
        // Finished erasing — move to next text
        setTextIndex((i) => (i + 1) % TEXTS.length);
        setTyping(true);
      }
    }
  }, [displayed, typing, textIndex]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 400);
  };

  const isArabic = /[\u0600-\u06FF]/.test(displayed);

  return (
    <div
      onClick={handleDismiss}
      onKeyDown={handleDismiss}
      tabIndex={0}
      className="fixed inset-0 cursor-pointer select-none outline-none"
      style={{
        zIndex: 9999,
        background: "#050808",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    >
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 50%, #0c1714 0%, #050808 100%)",
        }}
      />

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-10">
        {/* ── Logo + rings ── */}
        <div className="relative flex items-center justify-center">
          {/* Ring 1 */}
          <span
            style={{
              position: "absolute",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              border: "1px solid rgba(43,111,94,0.25)",
              animation: "ss-ring 3.2s ease-out infinite",
            }}
          />
          {/* Ring 2 */}
          <span
            style={{
              position: "absolute",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              border: "1px solid rgba(196,160,53,0.18)",
              animation: "ss-ring 3.2s ease-out infinite",
              animationDelay: "1.06s",
            }}
          />
          {/* Ring 3 */}
          <span
            style={{
              position: "absolute",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              border: "1px solid rgba(43,111,94,0.12)",
              animation: "ss-ring 3.2s ease-out infinite",
              animationDelay: "2.13s",
            }}
          />

          {/* Glow blob */}
          <div
            style={{
              position: "absolute",
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(43,111,94,0.22) 0%, transparent 70%)",
              animation: "ss-glow 2.6s ease-in-out infinite",
            }}
          />

          {/* Logo */}
          <img
            src={CeilLogo}
            alt="CEIL"
            style={{
              width: "110px",
              height: "110px",
              objectFit: "contain",
              display: "block",
              animation: "ss-breathe 2.6s ease-in-out infinite",
              filter:
                "brightness(0.88) drop-shadow(0 0 16px rgba(43,111,94,0.55)) drop-shadow(0 0 32px rgba(196,160,53,0.22))",
            }}
          />
        </div>

        {/* ── Typewriter text ── */}
        <div
          style={{ minHeight: "28px", display: "flex", alignItems: "center" }}
        >
          <p
            style={{
              fontSize: "13px",
              letterSpacing: isArabic ? "0.05em" : "0.2em",
              color:
                textIndex % 2 === 0
                  ? "rgba(196,160,53,0.75)"
                  : "rgba(43,111,94,0.7)",
              fontFamily: isArabic ? "serif" : "monospace",
              direction: isArabic ? "rtl" : "ltr",
              transition: "color 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            {displayed}
            {/* Blinking cursor */}
            <span
              style={{
                display: "inline-block",
                width: "2px",
                height: "14px",
                background:
                  textIndex % 2 === 0
                    ? "rgba(196,160,53,0.8)"
                    : "rgba(43,111,94,0.7)",
                marginRight: isArabic ? "0" : "0",
                marginLeft: isArabic ? "0" : "3px",
                verticalAlign: "middle",
                animation: "ss-cursor 0.8s step-end infinite",
              }}
            />
          </p>
        </div>

        {/* ── Thin gold divider ── */}
        <div
          style={{
            width: "60px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(196,160,53,0.4), transparent)",
            animation: "ss-line-pulse 2.6s ease-in-out infinite",
          }}
        />
      </div>

      {/* Bottom dismiss hint */}
      <div
        className="absolute bottom-7 left-0 right-0 flex justify-center"
        style={{
          opacity: visible ? 0.28 : 0,
          transition: "opacity 1.2s ease 1.5s",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.22em",
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
          }}
        >
          انقر في أي مكان للمتابعة
        </p>
      </div>

      <style>{`
        @keyframes ss-breathe {
          0%, 100% { transform: scale(1);     opacity: 0.78; }
          50%       { transform: scale(1.07);  opacity: 1;    }
        }
        @keyframes ss-glow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.35); }
        }
        @keyframes ss-ring {
          0%   { transform: scale(0.65); opacity: 0;   }
          18%  { opacity: 1; }
          100% { transform: scale(1.7);  opacity: 0;   }
        }
        @keyframes ss-cursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes ss-line-pulse {
          0%, 100% { opacity: 0.4; transform: scaleX(1); }
          50%       { opacity: 1;   transform: scaleX(1.6); }
        }
      `}</style>
    </div>
  );
}
