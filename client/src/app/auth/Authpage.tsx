import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../components/ui/select";
import { GoogleIcon } from "../../components/google-icon";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  Globe,
  X,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Info,
  ClipboardList,
  FileCheck,
  GraduationCap,
} from "lucide-react";
import { useLogin, useRegister } from "../../hooks/auth/auth.hooks";
import { useLanguage } from "../../hooks/useLanguage";
import { LocaleLink } from "../../i18n/locales/components/LocaleLink";
import { LanguageSwitcher } from "../../i18n/locales/components/LanguageSwitcher";
import AuthStatusDialog from "./Authstatusdialog";
import logo from "../../assets/download.png";
import ceillogo from "../../assets/logo.jpg";

// ─── Terms Modal (self-contained, reuses existing modal style from FileCompositionSection) ───
function TermsModal({
  open,
  onAccept,
  onClose,
}: {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
}) {
  const { t, dir, isRTL } = useLanguage();
  const [accepted, setAccepted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "docs" | "conditions" | "warnings" | "notes"
  >("conditions");

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleProceed = () => {
    if (!accepted) {
      setShowWarning(true);
      return;
    }
    onAccept();
  };

  const DOCS = [
    {
      icon: ClipboardList,
      title: t("centerInfo.enrollment.registrationForm"),
      desc: t("centerInfo.enrollment.registrationFormDesc"),
    },
    {
      icon: FileCheck,
      title: t("centerInfo.enrollment.commitmentContract"),
      desc: t("centerInfo.enrollment.commitmentContractDesc"),
    },
  ];

  const conditions = t("centerInfo.enrollment.conditionsList", {
    returnObjects: true,
  }) as string[];
  const warnings = t("centerInfo.enrollment.warningsList", {
    returnObjects: true,
  }) as string[];
  const notes = t("centerInfo.enrollment.notesList", {
    returnObjects: true,
  }) as string[];

  const TABS = [
    {
      key: "conditions" as const,
      label: t("centerInfo.enrollment.conditions"),
      icon: ShieldCheck,
      count: Array.isArray(conditions) ? conditions.length : 0,
    },
    {
      key: "docs" as const,
      label: t("centerInfo.enrollment.requiredDocs"),
      icon: FileText,
      count: DOCS.length,
    },
    {
      key: "warnings" as const,
      label: t("centerInfo.enrollment.warnings"),
      icon: AlertTriangle,
      count: Array.isArray(warnings) ? warnings.length : 0,
    },
    {
      key: "notes" as const,
      label: t("centerInfo.enrollment.importantNotes"),
      icon: Info,
      count: Array.isArray(notes) ? notes.length : 0,
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      dir={dir}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 w-full max-w-2xl max-h-[90vh] overflow-hidden transition-all duration-300 ${
          open ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#1A1A1A] border-b border-brand-beige/50 dark:border-[#2A2A2A] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal-dark/[0.08] dark:bg-[#4ADE80]/[0.1] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-brand-teal-dark dark:text-[#4ADE80]" />
            </div>
            <div>
              <h3
                className="text-lg font-bold text-brand-black dark:text-[#E5E5E5]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {t("centerInfo.enrollment.modalTitle")}
              </h3>
              <p className="text-[11px] text-brand-brown/50 dark:text-[#666666] mt-0.5">
                {isRTL
                  ? "يُرجى القراءة قبل إنشاء الحساب"
                  : "Veuillez lire avant de créer votre compte"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-brand-gray dark:bg-[#222222] hover:bg-brand-beige dark:hover:bg-[#333333] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-brand-black/50 dark:text-[#888888]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-brand-beige/40 dark:border-[#2A2A2A] bg-brand-gray/30 dark:bg-[#151515] px-4 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-all duration-200 shrink-0 ${
                    isActive
                      ? "text-brand-teal-dark dark:text-[#4ADE80]"
                      : "text-brand-brown/50 dark:text-[#666666] hover:text-brand-brown/80 dark:hover:text-[#AAAAAA]"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${tab.key === "warnings" && isActive ? "text-amber-500 dark:text-amber-400" : ""}`}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      isActive
                        ? "bg-brand-teal-dark dark:bg-[#4ADE80] text-white dark:text-[#0F0F0F]"
                        : "bg-brand-beige/60 dark:bg-[#2A2A2A] text-brand-brown/50 dark:text-[#666666]"
                    }`}
                  >
                    {tab.count}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-2 h-[2px] rounded-full bg-brand-teal-dark dark:bg-[#4ADE80]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto px-6 py-5 space-y-4"
          style={{ maxHeight: "calc(90vh - 260px)" }}
        >
          {activeTab === "conditions" && Array.isArray(conditions) && (
            <div className="space-y-3">
              {conditions.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-brand-gray/40 dark:bg-[#222222] border border-brand-beige/40 dark:border-[#2A2A2A]"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-teal-dark/[0.08] dark:bg-[#4ADE80]/[0.1] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal-dark dark:text-[#4ADE80]" />
                  </div>
                  <p className="text-brand-black/65 dark:text-[#AAAAAA] text-[13px] leading-relaxed pt-0.5">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "docs" && (
            <div className="space-y-4">
              {DOCS.map((doc, i) => {
                const Icon = doc.icon;
                return (
                  <div
                    key={i}
                    className="bg-brand-gray/40 dark:bg-[#222222] rounded-xl p-5 border border-brand-beige/40 dark:border-[#2A2A2A]"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-brand-teal-dark/[0.08] dark:bg-[#4ADE80]/[0.1] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-brand-teal-dark dark:text-[#4ADE80]" />
                      </div>
                      <div>
                        <h4
                          className="font-bold text-brand-black dark:text-[#E5E5E5] text-[15px] mb-1.5"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          {doc.title}
                        </h4>
                        <p className="text-brand-black/55 dark:text-[#AAAAAA] text-[13px] leading-relaxed">
                          {doc.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "warnings" && Array.isArray(warnings) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
                <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                <p className="text-amber-700/70 dark:text-amber-400/70 text-[12px] font-medium">
                  {t("centerInfo.enrollment.warnings")}
                </p>
              </div>
              {warnings.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-red-50/40 dark:bg-red-950/20 border border-red-200/30 dark:border-red-800/20"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-500/[0.08] dark:bg-red-500/[0.12] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-500 dark:text-red-400 text-[11px] font-bold">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-brand-black/60 dark:text-[#AAAAAA] text-[13px] leading-relaxed pt-0.5">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "notes" && Array.isArray(notes) && (
            <div className="space-y-3">
              {notes.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/20"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/[0.08] dark:bg-blue-500/[0.12] flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  </div>
                  <p className="text-brand-black/60 dark:text-[#AAAAAA] text-[13px] leading-relaxed pt-0.5">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-[#1A1A1A] border-t border-brand-beige/50 dark:border-[#2A2A2A] px-6 py-4 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => {
                  setAccepted(e.target.checked);
                  setShowWarning(false);
                }}
                className="sr-only peer"
              />
              <div className="w-5 h-5 rounded-md border-2 border-brand-beige dark:border-[#444444] peer-checked:border-brand-teal-dark dark:peer-checked:border-[#4ADE80] peer-checked:bg-brand-teal-dark dark:peer-checked:bg-[#4ADE80] transition-all duration-200 flex items-center justify-center">
                {accepted && (
                  <svg
                    className="w-3 h-3 text-white dark:text-[#0F0F0F]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span
              className={`text-[13px] leading-relaxed transition-colors ${accepted ? "text-brand-black/70 dark:text-[#CCCCCC]" : "text-brand-black/50 dark:text-[#888888] group-hover:text-brand-black/65 dark:group-hover:text-[#AAAAAA]"}`}
            >
              {t("centerInfo.enrollment.acceptTerms")}
            </span>
          </label>

          {showWarning && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <p className="text-amber-600 dark:text-amber-400 text-[12px] font-medium">
                {t("centerInfo.enrollment.mustAcceptTerms")}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-brand-beige dark:border-[#2A2A2A] text-brand-brown/60 dark:text-[#888888] hover:bg-brand-gray dark:hover:bg-[#222222] rounded-xl h-11 font-medium"
            >
              {t("centerInfo.enrollment.close")}
            </Button>
            <Button
              onClick={handleProceed}
              className={`flex-1 rounded-xl h-11 font-semibold gap-2 transition-all duration-300 ${
                accepted
                  ? "bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white shadow-lg shadow-brand-teal-dark/20 hover:shadow-xl hover:-translate-y-0.5"
                  : "bg-brand-beige dark:bg-[#222222] text-brand-brown/40 dark:text-[#555555] cursor-not-allowed"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              {t("centerInfo.enrollment.proceedToRegister")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AuthPage
// ─────────────────────────────────────────────────────────────
export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, dir, isRTL, currentLang } = useLanguage();

  const isRegisterRoute = location.pathname.includes("/register");
  const [mode, setMode] = useState<"login" | "register">(
    isRegisterRoute ? "register" : "login",
  );
  const [transitioning, setTransitioning] = useState(false);

  // ✅ Terms modal — shown before switching to register
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    const target = location.pathname.includes("/register")
      ? "register"
      : "login";
    if (target !== mode) {
      setTransitioning(true);
      setTimeout(() => {
        setMode(target);
        setTransitioning(false);
      }, 200);
    }
  }, [location.pathname, mode]);

  const doSwitchToRegister = () => {
    setTransitioning(true);
    navigate(`/${currentLang}/register`, { replace: true });
    setTimeout(() => {
      setMode("register");
      setTransitioning(false);
    }, 200);
  };

  const switchMode = (to: "login" | "register") => {
    if (to === mode) return;
    if (to === "register") {
      // ✅ Show terms first — only switch after accept
      setTermsOpen(true);
      return;
    }
    setTransitioning(true);
    navigate(`/${currentLang}/login`, { replace: true });
    setTimeout(() => {
      setMode("login");
      setTransitioning(false);
    }, 200);
  };

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <>
      {/* ✅ Terms modal */}
      <TermsModal
        open={termsOpen}
        onAccept={() => {
          setTermsOpen(false);
          doSwitchToRegister();
        }}
        onClose={() => setTermsOpen(false)}
      />

      <div className="flex min-h-screen" dir={dir}>
        {/* ═══ Left/Right Panel — Branding ═══ */}
        <div
          className={`hidden lg:flex lg:w-[44%] relative bg-linear-to-br from-brand-teal-dark via-brand-teal-dark to-[#1a3528] dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A1A10] overflow-hidden ${isRTL ? "order-2" : "order-1"}`}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-10 w-72 h-72 rounded-full border border-white/6" />
            <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full border border-white/4" />
            <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-white/2" />
            <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-brand-mustard/15 dark:bg-brand-mustard/[0.08]" />
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="relative flex flex-col justify-between p-12 w-full">
            <div className="flex items-center justify-between">
              <LocaleLink to="/" className="flex items-center gap-3 group">
                <img
                  src={ceillogo}
                  alt="CEIL"
                  className="w-10 h-10 rounded-xl border border-white/15 object-contain"
                />
                <div>
                  <span className="text-lg font-bold text-white">CEIL</span>
                  <span className="block text-[10px] text-white/40 tracking-wide">
                    {t("footer.universityLabel")}
                  </span>
                </div>
              </LocaleLink>
              <LanguageSwitcher variant="header" />
            </div>

            <div className="space-y-8">
              <div
                className="transition-all duration-500 ease-out"
                style={{
                  opacity: transitioning ? 0 : 1,
                  transform: transitioning
                    ? "translateY(12px)"
                    : "translateY(0)",
                }}
              >
                {mode === "login" ? (
                  <>
                    <h2
                      className="text-4xl font-bold text-white leading-tight"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {t("auth.welcomeBack")}
                      <br />
                      <span className="text-brand-mustard">
                        {t("auth.learningJourney")}
                      </span>
                    </h2>
                    <p className="text-white/50 mt-4 text-lg leading-relaxed max-w-sm">
                      {t("auth.welcomeBackDesc")}
                    </p>
                  </>
                ) : (
                  <>
                    <h2
                      className="text-4xl font-bold text-white leading-tight"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {t("auth.startYour")}
                      <br />
                      <span className="text-brand-mustard">
                        {t("auth.languageAdventure")}
                      </span>
                    </h2>
                    <p className="text-white/50 mt-4 text-lg leading-relaxed max-w-sm">
                      {t("auth.startYourDesc")}
                    </p>
                  </>
                )}
              </div>

              <div
                className="transition-all duration-500 ease-out delay-75"
                style={{
                  opacity: transitioning ? 0 : 1,
                  transform: transitioning
                    ? "translateY(8px)"
                    : "translateY(0)",
                }}
              >
                {mode === "login" ? (
                  <div className="flex gap-3 flex-wrap">
                    <PillBadge
                      icon={<BookOpen className="w-4 h-4" />}
                      label={t("auth.languagesAvailable")}
                    />
                    <PillBadge
                      icon={<Users className="w-4 h-4" />}
                      label={t("auth.studentsCount")}
                    />
                    <PillBadge
                      icon={<Award className="w-4 h-4" />}
                      label={t("auth.certified")}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <FeatureItem
                      icon={<Globe className="w-4 h-4" />}
                      text={t("auth.languagesAvailable")}
                    />
                    <FeatureItem
                      icon={<BookOpen className="w-4 h-4" />}
                      text={t("auth.cefr")}
                    />
                    <FeatureItem
                      icon={<Users className="w-4 h-4" />}
                      text={t("auth.smallGroups")}
                    />
                    <FeatureItem
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      text={t("auth.officialCerts")}
                    />
                  </div>
                )}
              </div>
            </div>

            <div
              className="transition-all duration-500 ease-out delay-100"
              style={{ opacity: transitioning ? 0 : 1 }}
            >
              {mode === "login" ? (
                <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl border border-white/[0.1] p-6">
                  <p className="text-white/70 text-sm leading-relaxed italic">
                    "{t("auth.testimonialQuote")}"
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-8 h-8 rounded-full bg-brand-mustard/25 flex items-center justify-center text-white text-xs font-bold">
                      S
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">
                        {t("auth.testimonialName")}
                      </p>
                      <p className="text-white/40 text-xs">
                        {t("auth.testimonialRole")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <img
                    src={logo}
                    alt="University"
                    className="w-8 h-8 object-contain opacity-50"
                  />
                  <p className="text-white/30 text-xs">
                    © {new Date().getFullYear()} CEIL –{" "}
                    {t("footer.universityLabel")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ Form Panel ═══ */}
        <div
          className={`flex-1 flex items-center justify-center bg-brand-gray dark:bg-[#121212] px-4 py-10 relative ${isRTL ? "order-1" : "order-2"}`}
        >
          <div
            className="absolute inset-0 opacity-[0.012] dark:opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative w-full max-w-lg">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-between mb-8">
              <LocaleLink to="/" className="flex items-center gap-3">
                <img
                  src={ceillogo}
                  alt="CEIL"
                  className="w-10 h-10 rounded-xl object-contain"
                />
                <span className="text-xl font-bold text-brand-black dark:text-[#E5E5E5]">
                  CEIL
                </span>
              </LocaleLink>
              <LanguageSwitcher variant="header" />
            </div>

            {/* Mode Tabs */}
            <div className="flex bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige dark:border-[#2A2A2A] p-1.5 mb-6 shadow-sm dark:shadow-black/20">
              <button
                onClick={() => switchMode("login")}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  mode === "login"
                    ? "bg-brand-teal-dark dark:bg-[#4ADE80] text-white dark:text-[#0F0F0F] shadow-md shadow-brand-teal-dark/20 dark:shadow-[#4ADE80]/10"
                    : "text-brand-brown dark:text-[#888888] hover:text-brand-black dark:hover:text-[#CCCCCC]"
                }`}
              >
                {t("auth.signIn")}
              </button>
              <button
                onClick={() => switchMode("register")}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  mode === "register"
                    ? "bg-brand-teal-dark dark:bg-[#4ADE80] text-white dark:text-[#0F0F0F] shadow-md shadow-brand-teal-dark/20 dark:shadow-[#4ADE80]/10"
                    : "text-brand-brown dark:text-[#888888] hover:text-brand-black dark:hover:text-[#CCCCCC]"
                }`}
              >
                {t("auth.createAccount")}
              </button>
            </div>

            {/* Form */}
            <div
              className="transition-all duration-300 ease-out"
              style={{
                opacity: transitioning ? 0 : 1,
                transform: transitioning
                  ? mode === "register"
                    ? `translateX(${isRTL ? "20px" : "-20px"})`
                    : `translateX(${isRTL ? "-20px" : "20px"})`
                  : "translateX(0)",
              }}
            >
              {mode === "login" ? (
                <LoginForm />
              ) : (
                <RegisterForm switchToLogin={() => switchMode("login")} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══ Login Form ═══ */
function LoginForm() {
  const { t, isRTL } = useLanguage();
  const loginMutation = useLogin();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const registeredSuccess = (location.state as any)?.registered;
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dialogStatus, setDialogStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [dialogError, setDialogError] = useState("");
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.email.trim()) e.email = t("auth.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = t("auth.emailInvalid");
    if (!formData.password) e.password = t("auth.passwordRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setDialogStatus("loading");
    loginMutation.mutate(formData, {
      onSuccess: () => setDialogStatus("success"),
      onError: (err: any) => {
        setDialogError(err.response?.data?.message || err.message || "");
        setDialogStatus("error");
      },
    });
  };

  return (
    <>
      <AuthStatusDialog
        status={dialogStatus}
        action="login"
        errorMessage={dialogError}
        onClose={() => setDialogStatus("idle")}
      />
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige dark:border-[#2A2A2A] p-8 shadow-sm dark:shadow-black/20">
        <div className="mb-7">
          <h1
            className="text-2xl font-bold text-brand-black dark:text-[#E5E5E5]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("auth.signIn")}
          </h1>
          <p className="mt-2 text-sm text-brand-brown dark:text-[#888888]">
            {t("auth.signInSubtitle")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2.5 h-12 rounded-xl border-brand-beige dark:border-[#2A2A2A] text-brand-black dark:text-[#E5E5E5] hover:bg-brand-gray dark:hover:bg-[#222222] font-medium"
          onClick={() => {
            window.location.href =
              import.meta.env.VITE_API_URL + "/auth/google";
          }}
        >
          <GoogleIcon /> {t("auth.continueWithGoogle")}
        </Button>
        <Divider text={t("auth.orSignInWith")} />
        {registeredSuccess && (
          <div className="mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            {t("auth.accountCreatedSuccess")}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label={t("auth.email")} error={errors.email}>
            <Input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((p) => ({ ...p, email: e.target.value }))
              }
              className="h-12 rounded-xl border-brand-beige dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-brand-teal/40 dark:focus:border-[#4ADE80]/30 focus:ring-2 focus:ring-brand-teal/10 dark:focus:ring-[#4ADE80]/10"
            />
          </Field>
          <Field
            label={t("auth.password")}
            error={errors.password}
            trailing={
              <button
                type="button"
                className="text-xs text-brand-teal-dark dark:text-[#4ADE80] hover:underline font-medium"
              >
                {t("auth.forgot")}
              </button>
            }
          >
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, password: e.target.value }))
                }
                className="h-12 rounded-xl border-brand-beige dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] pr-12 focus:border-brand-teal/40 dark:focus:border-[#4ADE80]/30 focus:ring-2 focus:ring-brand-teal/10 dark:focus:ring-[#4ADE80]/10"
              />
              <PasswordToggle
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />
            </div>
          </Field>
          <Button
            className="w-full h-12 rounded-xl bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white font-semibold text-base shadow-lg shadow-brand-teal-dark/20 gap-2 hover:-translate-y-0.5 transition-all duration-300"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              t("auth.signingIn")
            ) : (
              <>
                {t("auth.signIn")} <Arrow className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </>
  );
}

/* ═══ Register Form ═══ */
function RegisterForm({ switchToLogin }: { switchToLogin: () => void }) {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    phone_number: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [dialogStatus, setDialogStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [dialogError, setDialogError] = useState("");
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const update = (field: string, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwordsNoMatch"));
      return;
    }
    setDialogStatus("loading");
    registerMutation.mutate(
      { ...formData, confirmPassword: undefined } as any,
      {
        onSuccess: () => {
          setDialogStatus("success");
          setTimeout(() => {
            navigate("/login", { replace: true, state: { registered: true } });
          }, 1800);
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            (err.response?.status === 409
              ? t("auth.emailAlreadyRegistered")
              : err.message || "");
          setDialogError(msg);
          setDialogStatus("error");
        },
      },
    );
  };

  return (
    <>
      <AuthStatusDialog
        status={dialogStatus}
        action="register"
        errorMessage={dialogError}
        onClose={() => setDialogStatus("idle")}
      />
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige dark:border-[#2A2A2A] p-8 shadow-sm dark:shadow-black/20">
        <div className="mb-6">
          <h1
            className="text-2xl font-bold text-brand-black dark:text-[#E5E5E5]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("auth.createAccount")}
          </h1>
          <p className="mt-2 text-sm text-brand-brown dark:text-[#888888]">
            {t("auth.createAccountSubtitle")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2.5 h-12 rounded-xl border-brand-beige dark:border-[#2A2A2A] text-brand-black dark:text-[#E5E5E5] hover:bg-brand-gray dark:hover:bg-[#222222] font-medium"
          onClick={() => {
            window.location.href =
              import.meta.env.VITE_API_URL + "/auth/google";
          }}
        >
          <GoogleIcon /> {t("auth.signUpWithGoogle")}
        </Button>
        <Divider text={t("auth.orRegisterWith")} />
        {error && <ErrorBanner message={error} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("auth.firstName")}>
              <Input
                placeholder={t("auth.firstName")}
                value={formData.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                className="h-11 rounded-xl border-brand-beige dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-brand-teal/40 dark:focus:border-[#4ADE80]/30 focus:ring-2 focus:ring-brand-teal/10 dark:focus:ring-[#4ADE80]/10"
              />
            </Field>
            <Field label={t("auth.lastName")}>
              <Input
                placeholder={t("auth.lastName")}
                value={formData.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                className="h-11 rounded-xl border-brand-beige dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-brand-teal/40 dark:focus:border-[#4ADE80]/30 focus:ring-2 focus:ring-brand-teal/10 dark:focus:ring-[#4ADE80]/10"
              />
            </Field>
          </div>
          <Field label={t("auth.email")}>
            <Input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => update("email", e.target.value)}
              className="h-11 rounded-xl border-brand-beige dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-brand-teal/40 dark:focus:border-[#4ADE80]/30 focus:ring-2 focus:ring-brand-teal/10 dark:focus:ring-[#4ADE80]/10"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("auth.password")}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="h-11 rounded-xl border-brand-beige dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] pr-10 focus:border-brand-teal/40 dark:focus:border-[#4ADE80]/30 focus:ring-2 focus:ring-brand-teal/10 dark:focus:ring-[#4ADE80]/10"
                />
                <PasswordToggle
                  show={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                />
              </div>
            </Field>
            <Field label={t("auth.confirmPassword")}>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                className="h-11 rounded-xl border-brand-beige dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-brand-teal/40 dark:focus:border-[#4ADE80]/30 focus:ring-2 focus:ring-brand-teal/10 dark:focus:ring-[#4ADE80]/10"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("auth.gender")}>
              <Select
                value={formData.gender}
                onValueChange={(v) => update("gender", v)}
              >
                <SelectTrigger className="h-11 rounded-xl border-brand-beige dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5]">
                  <SelectValue placeholder={t("auth.select")} />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#1A1A1A] dark:border-[#2A2A2A]">
                  <SelectItem value="Male">{t("auth.male")}</SelectItem>
                  <SelectItem value="Female">{t("auth.female")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("auth.phone")}>
              <Input
                type="tel"
                placeholder="+213..."
                value={formData.phone_number}
                onChange={(e) => update("phone_number", e.target.value)}
                className="h-11 rounded-xl border-brand-beige dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-brand-teal/40 dark:focus:border-[#4ADE80]/30 focus:ring-2 focus:ring-brand-teal/10 dark:focus:ring-[#4ADE80]/10"
                dir="ltr"
              />
            </Field>
          </div>
          <Button
            className="w-full h-12 rounded-xl bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white font-semibold text-base shadow-lg shadow-brand-teal-dark/20 gap-2 mt-2 hover:-translate-y-0.5 transition-all duration-300"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              t("auth.creatingAccount")
            ) : (
              <>
                {t("auth.createAccount")} <Arrow className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </>
  );
}

/* ═══ Shared ═══ */
function Field({
  label,
  error,
  trailing,
  children,
}: {
  label: string;
  error?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-brand-black dark:text-[#E5E5E5]">
          {label}
        </Label>
        {trailing}
      </div>
      {children}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
function Divider({ text }: { text: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-brand-beige dark:border-[#2A2A2A]" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white dark:bg-[#1A1A1A] px-3 text-brand-brown dark:text-[#888888] font-medium">
          {text}
        </span>
      </div>
    </div>
  );
}
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 px-4 py-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
      <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
        <span className="text-red-500 dark:text-red-400 text-xs font-bold">
          !
        </span>
      </div>
      {message}
    </div>
  );
}
function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-brown/50 dark:text-[#555555] hover:text-brand-brown dark:hover:text-[#888888] transition-colors"
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}
function PillBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.07] backdrop-blur-sm border border-white/[0.1] text-white text-xs font-medium">
      {icon}
      {label}
    </div>
  );
}
function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-white/60 text-sm">
      <div className="w-8 h-8 rounded-lg bg-white/[0.07] flex items-center justify-center shrink-0">
        {icon}
      </div>
      {text}
    </div>
  );
}
