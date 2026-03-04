import CeilLogo from "../assets/logo-2.png";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-[#0E0E0E]">
      {/* Ambient background glow */}
      <div className="absolute w-80 h-80 rounded-full bg-[#2B6F5E]/8 dark:bg-[#2B6F5E]/12 blur-3xl animate-pulse-glow" />
      <div
        className="absolute w-56 h-56 rounded-full bg-[#C4A035]/6 dark:bg-[#C4A035]/10 blur-2xl animate-pulse-glow"
        style={{ animationDelay: "0.8s" }}
      />

      <div className="relative flex flex-col items-center gap-6">
        {/* Logo wrapper with expanding rings */}
        <div className="relative flex items-center justify-center">
          {/* Outer slow ring */}
          <span className="absolute w-52 h-52 rounded-full border border-[#2B6F5E]/15 dark:border-[#2B6F5E]/20 animate-ring-expand" />
          {/* Middle ring */}
          <span
            className="absolute w-40 h-40 rounded-full border border-[#C4A035]/12 dark:border-[#C4A035]/18 animate-ring-expand"
            style={{ animationDelay: "0.5s" }}
          />
          {/* Inner ring */}
          <span
            className="absolute w-28 h-28 rounded-full border border-[#2B6F5E]/20 dark:border-[#2B6F5E]/30 animate-ring-expand"
            style={{ animationDelay: "1s" }}
          />

          {/* Logo — breathes between dim and bright */}
          <div className="relative w-36 h-36 animate-logo-breathe">
            <img
              src={CeilLogo}
              alt="CEIL Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-[11px] font-medium tracking-[0.25em] uppercase text-[#2B6F5E]/70 dark:text-[#4ADE80]/50 animate-fade-up">
          مركز التعليم المكثف للغات بجامعة الوادي
        </p>

        {/* Shimmer loading bar */}
        <div className="w-36 h-0.5 bg-brand-beige/40 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-linear-to-r from-transparent via-[#2B6F5E] to-transparent dark:via-[#4ADE80] animate-shimmer" />
        </div>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.9; transform: scale(1.1); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        @keyframes ring-expand {
          0%   { transform: scale(0.88); opacity: 0; }
          25%  { opacity: 1; }
          100% { transform: scale(1.18); opacity: 0; }
        }
        .animate-ring-expand {
          animation: ring-expand 2.8s ease-out infinite;
        }

        /* Light mode: dim → bright */
        @keyframes logo-breathe {
          0%, 100% { filter: brightness(0.55) saturate(0.7); transform: scale(1); }
          50%       { filter: brightness(1)    saturate(1);   transform: scale(1.04); }
        }
        /* Dark mode: medium glow → strong glow */
        @keyframes logo-breathe-dark {
          0%, 100% {
            filter: brightness(0.8) drop-shadow(0 0 10px rgba(43,111,94,0.25));
            transform: scale(1);
          }
          50% {
            filter: brightness(1.1) drop-shadow(0 0 24px rgba(43,111,94,0.55));
            transform: scale(1.04);
          }
        }
        .animate-logo-breathe {
          animation: logo-breathe 2.4s ease-in-out infinite;
        }
        .dark .animate-logo-breathe {
          animation: logo-breathe-dark 2.4s ease-in-out infinite;
        }

        @keyframes fade-up {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.8s ease-out 0.3s both;
        }

        @keyframes shimmer {
          0%   { transform: translateX(-200%); }
          100% { transform: translateX(400%); }
        }
        .animate-shimmer {
          animation: shimmer 1.9s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
