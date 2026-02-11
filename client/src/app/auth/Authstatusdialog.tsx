import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "../../i18n";

type AuthStatus = "idle" | "loading" | "success" | "error";
type AuthAction = "login" | "register";

interface AuthStatusDialogProps {
  status: AuthStatus;
  action: AuthAction;
  errorMessage?: string;
  onClose?: () => void;
}

export default function AuthStatusDialog({
  status,
  action,
  errorMessage,
  onClose,
}: AuthStatusDialogProps) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<"hidden" | "entering" | "visible" | "exiting">("hidden");

  const closeDialog = useCallback(() => {
    setPhase("exiting");
    setTimeout(() => {
      setPhase("hidden");
      onClose?.();
    }, 350);
  }, [onClose]);

  useEffect(() => {
    if (status !== "idle") {
      setPhase("entering");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase("visible"));
      });
    }
    if (status === "success") {
      const timer = setTimeout(closeDialog, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, closeDialog]);

  if (phase === "hidden" || status === "idle") return null;

  const isVisible = phase === "visible";
  const isExiting = phase === "exiting";

  const content = {
    login: {
      loading: { title: t("auth.dialog.signingIn"), subtitle: t("auth.dialog.verifying") },
      success: { title: t("auth.dialog.welcomeBack"), subtitle: t("auth.dialog.redirectDashboard") },
      error: { title: t("auth.dialog.signInFailed"), subtitle: errorMessage || t("auth.dialog.invalidCredentials") },
    },
    register: {
      loading: { title: t("auth.dialog.creatingAccount"), subtitle: t("auth.dialog.settingUp") },
      success: { title: t("auth.dialog.accountCreated"), subtitle: t("auth.dialog.redirectSignIn") },
      error: { title: t("auth.dialog.registrationFailed"), subtitle: errorMessage || t("auth.dialog.somethingWrong") },
    },
  };

  const current = content[action][status as "loading" | "success" | "error"];
  if (!current) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={() => status === "error" && closeDialog()}
      >
        <div
          className="absolute inset-0 transition-all duration-500 ease-out"
          style={{
            backgroundColor: isVisible && !isExiting ? "rgba(0, 0, 0, 0.45)" : "rgba(0, 0, 0, 0)",
            backdropFilter: isVisible && !isExiting ? "blur(12px)" : "blur(0px)",
          }}
        />

        <div
          className="relative w-full max-w-[380px] transition-all duration-500 ease-out"
          style={{
            opacity: isVisible && !isExiting ? 1 : 0,
            transform: isExiting
              ? "scale(0.9) translateY(20px)"
              : isVisible
                ? "scale(1) translateY(0)"
                : "scale(0.85) translateY(30px)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`absolute -inset-6 rounded-[40px] blur-3xl opacity-50 transition-opacity duration-700 ${
              status === "loading"
                ? "bg-gradient-to-br from-teal-400/30 to-cyan-300/20"
                : status === "success"
                  ? "bg-gradient-to-br from-emerald-400/30 to-green-300/20"
                  : "bg-gradient-to-br from-red-400/25 to-rose-300/15"
            }`}
          />

          <div
            className={`relative bg-white/95 backdrop-blur-xl rounded-3xl border shadow-2xl overflow-hidden ${
              status === "error" ? "animate-[dialogShake_0.5s_ease-in-out]" : ""
            }`}
            style={{
              borderColor:
                status === "loading" ? "rgba(0,128,128,0.15)"
                  : status === "success" ? "rgba(16,185,129,0.2)"
                  : "rgba(239,68,68,0.2)",
            }}
          >
            <div className="h-1 w-full overflow-hidden">
              {status === "loading" ? (
                <div className="h-full w-full bg-gradient-to-r from-teal-200 via-teal-400 to-cyan-400 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ animation: "authProgressSlide 1.8s ease-in-out infinite" }} />
                </div>
              ) : status === "success" ? (
                <div className="h-full w-full bg-gradient-to-r from-emerald-300 via-green-400 to-teal-400" />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-red-300 via-rose-400 to-red-400" />
              )}
            </div>

            <div className="px-10 pt-12 pb-10 flex flex-col items-center text-center">
              <div className="relative mb-8">
                {status === "loading" && (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-[3px] border-teal-100 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-[3px] border-transparent" style={{ borderTopColor: "rgb(13,148,136)", animation: "spin 1s linear infinite" }} />
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100/50 flex items-center justify-center">
                        {action === "register" ? (
                          <Sparkles className="w-7 h-7 text-teal-600" style={{ animation: "pulse 2s ease-in-out infinite" }} />
                        ) : (
                          <Loader2 className="w-7 h-7 text-teal-600 animate-spin" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {status === "success" && (
                  <div className="relative">
                    <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-emerald-300" style={{ animation: "authSuccessRing 1.5s ease-out forwards" }} />
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 flex items-center justify-center relative z-10">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" style={{ animation: "authCheckPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards" }} />
                    </div>
                  </div>
                )}
                {status === "error" && (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2.5">{current.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[280px]">{current.subtitle}</p>

              {status === "loading" && (
                <div className="flex gap-2 mt-7">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-teal-300" style={{ animation: `authDotBounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />
                  ))}
                </div>
              )}
              {status === "success" && (
                <div className="mt-7 w-16 h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ animation: "authSuccessBar 1.8s ease-out forwards" }} />
                </div>
              )}
              {status === "error" && (
                <button onClick={closeDialog} className="mt-7 px-8 py-3 bg-gray-900 hover:bg-gray-800 active:scale-[0.97] text-white text-sm font-semibold rounded-2xl transition-all shadow-lg">
                  {t("auth.dialog.tryAgain")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.7; transform:scale(0.9); } }
        @keyframes authProgressSlide { 0% { transform:translateX(-100%); } 100% { transform:translateX(300%); } }
        @keyframes authDotBounce { 0%,80%,100% { transform:translateY(0); opacity:0.4; } 40% { transform:translateY(-8px); opacity:1; } }
        @keyframes authCheckPop { 0% { transform:scale(0) rotate(-45deg); opacity:0; } 60% { transform:scale(1.15) rotate(5deg); } 100% { transform:scale(1) rotate(0); opacity:1; } }
        @keyframes authSuccessRing { 0% { transform:scale(0.8); opacity:0; } 50% { opacity:1; } 100% { transform:scale(1.3); opacity:0; } }
        @keyframes authSuccessBar { 0% { width:0%; } 100% { width:100%; } }
        @keyframes dialogShake { 0%,100% { transform:translateX(0); } 10%,30%,50%,70%,90% { transform:translateX(-6px); } 20%,40%,60%,80% { transform:translateX(6px); } }
      `}</style>
    </>
  );
}