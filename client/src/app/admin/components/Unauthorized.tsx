import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldX, ArrowLeft, Home, LogIn } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   403 UNAUTHORIZED PAGE
   
   Animated "stop" hand + shield icon with floating particles,
   smooth entrance animations, and helpful action buttons.
   Brand-consistent design with teal/mustard palette.
═══════════════════════════════════════════════════════════ */

export default function Unauthorized() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 overflow-hidden relative">
      {/* ── Background decorations ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Floating shapes */}
        <div
          className="absolute top-[15%] left-[10%] w-64 h-64 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)",
            animation: "floatSlow 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[20%] right-[8%] w-80 h-80 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(234,179,8,0.1) 0%, transparent 70%)",
            animation: "floatSlow 10s ease-in-out 2s infinite reverse",
          }}
        />
        <div
          className="absolute top-[60%] left-[60%] w-40 h-40 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)",
            animation: "floatSlow 6s ease-in-out 1s infinite",
          }}
        />
      </div>

      {/* ── Main content ── */}
      <div
        className="relative max-w-lg w-full text-center transition-all duration-1000 ease-out"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(40px)",
        }}
      >
        {/* ═══ Animated Hand + Shield ═══ */}
        <div className="relative inline-block mb-10">
          {/* Outer pulse ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              animation: "pulseRing 3s ease-in-out infinite",
              background:
                "radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)",
              transform: "scale(2.5)",
            }}
          />

          {/* Shield background */}
          <div
            className="relative w-36 h-36 mx-auto flex items-center justify-center"
            style={{
              animation: "gentleFloat 4s ease-in-out infinite",
            }}
          >
            {/* Shield shape */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-32 h-32 rounded-3xl bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 border-2 border-red-100/80 shadow-lg shadow-red-100/30"
                style={{ transform: "rotate(45deg)" }}
              />
            </div>

            {/* Shield icon */}
            <div
              className="relative z-10 transition-all duration-700 delay-300"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0.5)",
              }}
            >
              <ShieldX
                className="w-12 h-12 text-red-400/80"
                strokeWidth={1.5}
              />
            </div>

            {/* Waving hand */}
            <div
              className="absolute -top-4 -right-4 z-20 transition-all duration-700 delay-500"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted
                  ? "scale(1) rotate(0deg)"
                  : "scale(0) rotate(-90deg)",
              }}
            >
              <div
                className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-amber-200/40 border border-amber-100 flex items-center justify-center"
                style={{ animation: "waveHand 2.5s ease-in-out infinite" }}
              >
                <span
                  className="text-3xl select-none"
                  role="img"
                  aria-label="waving hand"
                >
                  🖐️
                </span>
              </div>
            </div>

            {/* Small "X" particles */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-red-200"
                style={{
                  animation: `particle${i + 1} 3s ease-in-out ${i * 0.8}s infinite`,
                  opacity: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* ═══ Error code ═══ */}
        <div
          className="transition-all duration-700 delay-200"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 mb-6">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs font-bold text-red-500 tracking-widest uppercase">
              Error 403
            </span>
          </div>
        </div>

        {/* ═══ Title ═══ */}
        <div
          className="transition-all duration-700 delay-300"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
            Access{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-red-500">Denied</span>
              <span
                className="absolute bottom-1 left-0 right-0 h-3 bg-red-100/60 rounded-sm -z-0"
                style={{
                  animation: mounted
                    ? "underlineGrow 0.8s ease-out 0.8s forwards"
                    : "none",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                }}
              />
            </span>
          </h1>
        </div>

        {/* ═══ Description ═══ */}
        <div
          className="transition-all duration-700 delay-[400ms]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto mb-3">
            You don't have permission to access this page.
          </p>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mb-10">
            If you believe this is a mistake, please contact your administrator
            or try signing in with a different account.
          </p>
        </div>

        {/* ═══ Action buttons ═══ */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-700 delay-500"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <Link
            to="/"
            className="group flex items-center gap-2.5 px-7 py-3.5 bg-gray-900 hover:bg-gray-800 active:scale-[0.97] text-white font-semibold rounded-2xl transition-all shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30"
          >
            <Home className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Go Home
          </Link>

          <Link
            to="/login"
            className="group flex items-center gap-2.5 px-7 py-3.5 bg-white hover:bg-gray-50 active:scale-[0.97] text-gray-700 font-semibold rounded-2xl border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow"
          >
            <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            Sign In
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 px-5 py-3.5 text-gray-400 hover:text-gray-600 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Go Back
          </button>
        </div>

        {/* ═══ Footer hint ═══ */}
        <div
          className="mt-16 transition-all duration-700 delay-[600ms]"
          style={{
            opacity: mounted ? 1 : 0,
          }}
        >
          <div className="inline-flex items-center gap-3 text-xs text-gray-300">
            <div className="w-8 h-px bg-gray-200" />
            <span>LTC Platform • Language Training Center</span>
            <div className="w-8 h-px bg-gray-200" />
          </div>
        </div>
      </div>

      {/* ═══ Keyframes ═══ */}
      <style>{`
        @keyframes waveHand {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(16deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(16deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(12deg); }
          60% { transform: rotate(0deg); }
        }
        
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10px, -15px) scale(1.05); }
          66% { transform: translate(-8px, 8px) scale(0.95); }
        }
        
        @keyframes pulseRing {
          0%, 100% { opacity: 0.3; transform: scale(2.2); }
          50% { opacity: 0.6; transform: scale(2.8); }
        }
        
        @keyframes particle1 {
          0%, 100% { transform: translate(0, 0) scale(0); opacity: 0; }
          20% { opacity: 0.8; transform: translate(-30px, -40px) scale(1); }
          80% { opacity: 0; transform: translate(-50px, -60px) scale(0.5); }
        }
        @keyframes particle2 {
          0%, 100% { transform: translate(0, 0) scale(0); opacity: 0; }
          20% { opacity: 0.6; transform: translate(35px, -35px) scale(1); }
          80% { opacity: 0; transform: translate(55px, -55px) scale(0.3); }
        }
        @keyframes particle3 {
          0%, 100% { transform: translate(0, 0) scale(0); opacity: 0; }
          20% { opacity: 0.7; transform: translate(25px, 30px) scale(1); }
          80% { opacity: 0; transform: translate(40px, 50px) scale(0.4); }
        }
        
        @keyframes underlineGrow {
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
