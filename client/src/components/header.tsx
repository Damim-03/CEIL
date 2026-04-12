import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/download.png";
import ceillogo from "../assets/logo-2.png";
import {
  User,
  LogIn,
  UserPlus,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Globe,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useMe, useLogout } from "../hooks/auth/auth.hooks";
import { useLanguage } from "../hooks/useLanguage";
import { LanguageSwitcher } from "../i18n/locales/components/LanguageSwitcher";
import { LocaleLink } from "../i18n/locales/components/LocaleLink";
import ThemeToggle from "../components/Themetoggle";
import ThemeToggleHeader from "../components/ThemetoggleHeader";
import { TermsModal } from "../app/auth/Authpage";

/* ═══════════════════════════════════════════════════════
   DASHBOARD SPOTLIGHT TOOLTIP
═══════════════════════════════════════════════════════ */
function DashboardSpotlight({
  dashboardPath,
  userName,
  onDismiss,
}: {
  dashboardPath: string;
  userName: string;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <>
      {/* Backdrop شفاف يغطي الشاشة عند الضغط خارجها */}
      <div className="fixed inset-0 z-40" onClick={handleDismiss} />

      {/* Spotlight حول زر Dashboard */}
      <div
        className={`absolute top-full mt-3 z-50 transition-all duration-300 ${
          // RTL/LTR positioning
          "right-0"
        } ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-2 scale-95"
        }`}
        style={{ minWidth: "280px" }}
      >
        {/* السهم للأعلى */}
        <div className="absolute -top-2 right-6 w-4 h-4 bg-white dark:bg-[#1A1A1A] rotate-45 border-l border-t border-brand-beige/40 dark:border-[#2A2A2A] z-10" />

        {/* البطاقة */}
        <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige/60 dark:border-[#2A2A2A] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* شريط علوي ملوّن */}
          <div className="h-1 bg-gradient-to-r from-[#2B6F5E] via-[#C4A035] to-[#2B6F5E]" />

          <div className="p-5">
            {/* أيقونة + عنوان */}
            <div className="flex items-start gap-3 mb-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#1a4a3a] flex items-center justify-center shadow-lg shadow-[#2B6F5E]/25">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                {/* نبضة */}
                <div className="absolute inset-0 rounded-xl bg-[#2B6F5E]/40 animate-ping" />
                {/* نجمة */}
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C4A035] border-2 border-white dark:border-[#1A1A1A] flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold text-[#C4A035] uppercase tracking-widest">
                    مرحباً بك 🎉
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5] leading-snug">
                  أهلاً {userName}! حسابك جاهز
                </h3>
              </div>
            </div>

            {/* النص */}
            <p className="text-xs text-[#6B5D4F] dark:text-[#888888] leading-relaxed mb-4">
              انقر على{" "}
              <span className="font-semibold text-[#2B6F5E] dark:text-[#4ADE80]">
                لوحة التحكم
              </span>{" "}
              للوصول إلى حسابك ورفع وثائقك واستكشاف كل الخدمات المتاحة لك.
            </p>

            {/* أزرار */}
            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 h-8 rounded-xl border border-[#E8DDD4]/70 dark:border-[#2A2A2A] text-xs font-medium text-[#9B8E82] dark:text-[#666666] hover:bg-[#F8F4F0] dark:hover:bg-[#222222] transition-colors"
              >
                لاحقاً
              </button>
              <Link
                to={dashboardPath}
                onClick={handleDismiss}
                className="flex-1"
              >
                <button className="w-full h-8 rounded-xl bg-gradient-to-r from-[#2B6F5E] to-[#1a4a3a] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-md shadow-[#2B6F5E]/20">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  انتقل الآن
                  <ArrowRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════════════ */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { data: user, isLoading } = useMe();
  const logoutMutation = useLogout();
  const { t, dir, isRTL, currentLang } = useLanguage();

  const [termsOpen, setTermsOpen] = useState(false);

  // ✅ Spotlight state
  const [showSpotlight, setShowSpotlight] = useState(false);

  const handleRegisterWithTerms = () => {
    setTermsOpen(true);
  };

  // ✅ منطق ظهور الـ Spotlight — مرة واحدة فقط في الحياة
  useEffect(() => {
    if (!user) return;

    // فقط للطالب الجديد — يمكنك تغيير الشرط حسب احتياجك
    const spotlightKey = `dashboard_spotlight_shown_${user.user_id}`;
    const alreadyShown = localStorage.getItem(spotlightKey);

    if (!alreadyShown) {
      const timer = setTimeout(() => {
        setShowSpotlight(true);
        localStorage.setItem(spotlightKey, "true");
      }, 1200); // تأخير 1.2 ثانية بعد الدخول
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-user-menu]")) {
        setUserMenuOpen(false);
      }
    };
    setTimeout(() => document.addEventListener("click", handler), 0);
    return () => document.removeEventListener("click", handler);
  }, [userMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const NAV_LINKS = [
    { to: "/", label: t("common.home") },
    { to: "/courses", label: t("common.courses") },
    { to: "/announcements", label: t("common.announcements") },
    { to: "/about-us", label: t("common.features") },
    { to: "/OurPlatform", label: t("common.OurPlatform") },
    { to: "/timetable", label: t("common.timetable") },
  ];

  const dashboardPath =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "TEACHER"
        ? "/teacher"
        : "/student";

  const isActive = (path: string) => {
    const cleaned =
      location.pathname.replace(new RegExp(`^/${currentLang}`), "") || "/";
    return path === "/" ? cleaned === "/" : cleaned.startsWith(path);
  };

  const showUser = !isLoading && !!user;

  return (
    <>
      <TermsModal
        open={termsOpen}
        onAccept={() => {
          setTermsOpen(false);
          navigate(`/${currentLang}/register`);
        }}
        onClose={() => setTermsOpen(false)}
      />

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "shadow-[0_4px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            : "shadow-none"
        }`}
        dir={dir}
      >
        {/* ═══ TOP BAR ═══ */}
        <div className="relative bg-white dark:bg-[#1A1A1A] overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23264230' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute bottom-0 inset-x-0 h-0.5 bg-linear-to-r from-transparent via-brand-mustard/50 dark:via-brand-mustard/30 to-transparent" />

          <div
            className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-500 ${
              scrolled ? "h-14" : "h-18"
            }`}
          >
            <LocaleLink to="/" className="group shrink-0 relative">
              <div className="relative">
                <img
                  src={logo}
                  alt="University"
                  className={`object-contain transition-all duration-500 ${scrolled ? "h-10 w-10" : "h-13 w-13"}`}
                />
                <div className="absolute -inset-1 rounded-2xl border-2 border-brand-teal-dark/0 group-hover:border-brand-teal-dark/8 dark:group-hover:border-[#4ADE80]/8 transition-all duration-300 scale-90 group-hover:scale-100" />
              </div>
            </LocaleLink>

            <div className="hidden sm:flex flex-col items-center text-center flex-1 px-8 select-none">
              <h1
                className={`font-bold text-brand-teal-dark dark:text-[#E5E5E5] leading-tight tracking-tight transition-all duration-500 ${scrolled ? "text-sm" : "text-base sm:text-lg lg:text-xl"}`}
                style={{ fontFamily: "var(--font-sans)" }}
                dir="ltr"
              >
                {t("header.universityName")}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="w-8 h-px bg-linear-to-r from-transparent to-brand-mustard/50 dark:to-brand-mustard/30" />
                <p
                  className={`text-brand-teal-dark/50 dark:text-[#888888] font-medium tracking-wide transition-all duration-500 ${scrolled ? "text-[9px]" : "text-[11px] sm:text-xs"}`}
                  dir="ltr"
                >
                  {t("header.centerName")}
                </p>
                <span className="w-8 h-px bg-linear-to-l from-transparent to-brand-mustard/50 dark:to-brand-mustard/30" />
              </div>
              <p
                className={`text-brand-brown/50 dark:text-[#666666] transition-all duration-500 ${scrolled ? "text-[0px] opacity-0 h-0 mt-0" : "text-[11px] opacity-100 h-auto mt-0.5"}`}
              >
                {t("header.centerNameAr")}
              </p>
            </div>

            <div className="flex sm:hidden flex-col items-center text-center flex-1 px-2 select-none">
              <p
                className="text-sm font-bold text-brand-teal-dark dark:text-[#E5E5E5] tracking-tight"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {t("header.shortName")}
              </p>
              <p className="text-[9px] text-brand-brown/50 dark:text-[#666666] tracking-wide">
                {t("header.shortNameAr")}
              </p>
            </div>

            <LocaleLink to="/" className="group shrink-0 relative">
              <div className="relative">
                <img
                  src={ceillogo}
                  alt="CEIL"
                  className={`object-contain rounded-lg transition-all duration-500 ${scrolled ? "h-10 w-10" : "h-13 w-13"}`}
                />
                <div className="absolute -inset-1 rounded-2xl border-2 border-brand-teal-dark/0 group-hover:border-brand-teal-dark/8 dark:group-hover:border-[#4ADE80]/8 transition-all duration-300 scale-90 group-hover:scale-100" />
              </div>
            </LocaleLink>
          </div>
        </div>

        {/* ═══ NAVIGATION BAR ═══ */}
        <div className="relative">
          <div className="absolute inset-0 bg-brand-teal-dark dark:bg-[#0F0F0F]" />
          <div
            className="absolute inset-0 opacity-[0.04] mix-blend-soft-light pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-brand-mustard/0 via-brand-mustard/30 to-brand-mustard/0" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-11">
            {/* ── Desktop Nav ── */}
            <nav
              ref={navRef}
              className="hidden md:flex items-center gap-0.5 flex-1"
            >
              {NAV_LINKS.map((link) => {
                const active = isActive(link.to);
                return (
                  <LocaleLink
                    key={link.to}
                    to={link.to}
                    className="relative px-4 py-1.75 text-[13px] font-medium transition-all duration-200 group"
                  >
                    <span
                      className={`absolute inset-0 rounded-md transition-all duration-200 ${active ? "bg-white/13" : "bg-transparent group-hover:bg-white/6"}`}
                    />
                    <span
                      className={`relative transition-colors duration-200 ${active ? "text-white" : "text-white/55 group-hover:text-white/90"}`}
                    >
                      {link.label}
                    </span>
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-brand-mustard transition-all duration-300 ${active ? "w-7 opacity-100" : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-40"}`}
                      style={
                        active
                          ? {
                              boxShadow:
                                "0 0 10px rgba(193,154,94,0.6), 0 0 3px rgba(193,154,94,0.4)",
                            }
                          : undefined
                      }
                    />
                  </LocaleLink>
                );
              })}
            </nav>

            {/* ── Desktop: Lang + Auth ── */}
            <div className="hidden md:flex items-center gap-2.5">
              <div
                className={`flex items-center ${isRTL ? "ml-2.5 border-l pl-2.5" : "mr-2.5 border-r pr-2.5"} border-white/10`}
              >
                <LanguageSwitcher variant="header" />
              </div>

              <ThemeToggleHeader />

              {!showUser && !isLoading && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    onClick={handleRegisterWithTerms}
                    className="relative bg-brand-mustard text-white border-0 rounded-md gap-1.5 h-7.5 text-[11px] font-semibold px-3 overflow-hidden transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(193,154,94,0.35)] active:translate-y-0"
                  >
                    <UserPlus className="w-3 h-3" />
                    {t("common.register")}
                  </Button>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-white/15 text-white/80 hover:text-white rounded-md gap-1.5 h-7.5 text-[11px] font-medium bg-white/4 hover:bg-white/9 hover:border-white/25 transition-all duration-200 hover:-translate-y-px"
                  >
                    <LocaleLink to="/login">
                      <LogIn className="w-3 h-3" />
                      {t("common.login")}
                    </LocaleLink>
                  </Button>
                </div>
              )}

              {showUser && (
                // ✅ relative container للـ Spotlight
                <div className="relative" data-user-menu>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen((o) => !o);
                      // أغلق الـ spotlight عند فتح الـ dropdown
                      if (showSpotlight) setShowSpotlight(false);
                    }}
                    className={`flex items-center gap-2 rounded-md border py-0.75 transition-all duration-200 ${isRTL ? "pl-2 pr-0.75" : "pr-2 pl-0.75"} ${
                      // ✅ إضافة حلقة ضوئية حول الزر عند ظهور الـ Spotlight
                      showSpotlight
                        ? "border-[#C4A035]/60 shadow-[0_0_0_3px_rgba(196,160,53,0.2),0_0_20px_rgba(196,160,53,0.15)] bg-white/15"
                        : userMenuOpen
                          ? "bg-white/10 border-white/20"
                          : "border-white/10 hover:bg-white/[0.07] hover:border-white/16"
                    }`}
                  >
                    <div className="relative">
                      {user.google_avatar && !avatarError ? (
                        <img
                          src={user.google_avatar}
                          className="h-6 w-6 rounded-[5px] border border-white/20 object-cover"
                          alt=""
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-[5px] border border-white/20 bg-white/10 flex items-center justify-center">
                          <User className="h-3 w-3 text-white/60" />
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-[1.5px] border-brand-teal-dark dark:border-[#0F0F0F]" />
                    </div>
                    <span className="text-[11px] font-medium text-white/75 max-w-17.5 truncate">
                      {user.first_name || t("common.dashboard")}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 text-white/30 transition-transform duration-300 ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* ✅ Spotlight Tooltip */}
                  {showSpotlight && !userMenuOpen && (
                    <DashboardSpotlight
                      dashboardPath={dashboardPath}
                      userName={user.first_name || ""}
                      onDismiss={() => setShowSpotlight(false)}
                    />
                  )}

                  {/* Dropdown */}
                  <div
                    className={`absolute top-full mt-2 w-56 z-50 transition-all duration-200 origin-top ${isRTL ? "left-0" : "right-0"} ${userMenuOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"}`}
                  >
                    <div
                      className={`absolute -top-1.5 w-3 h-3 bg-white dark:bg-[#1A1A1A] rotate-45 border-l border-t border-brand-beige/40 dark:border-[#2A2A2A] ${isRTL ? "left-4" : "right-4"}`}
                    />
                    <div className="relative bg-white dark:bg-[#1A1A1A] rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] border border-brand-beige/40 dark:border-[#2A2A2A] overflow-hidden">
                      <div className="px-4 py-3 bg-linear-to-b from-brand-gray/50 dark:from-[#222222] to-white dark:to-[#1A1A1A] border-b border-brand-beige/40 dark:border-[#2A2A2A]">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {user.google_avatar && !avatarError ? (
                              <img
                                src={user.google_avatar}
                                className="h-9 w-9 rounded-lg border border-brand-beige dark:border-[#2A2A2A] object-cover"
                                alt=""
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-lg border border-brand-beige dark:border-[#2A2A2A] bg-brand-teal-dark/6 dark:bg-[#222222] flex items-center justify-center">
                                <User className="h-4 w-4 text-brand-teal-dark/50 dark:text-[#888888]" />
                              </div>
                            )}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-[#1A1A1A]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-brand-black dark:text-[#E5E5E5] truncate">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-[10px] text-brand-brown/60 dark:text-[#666666] truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1.5">
                        <Link
                          to={dashboardPath}
                          className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-brand-black/65 dark:text-[#AAAAAA] hover:bg-brand-teal-dark/4 dark:hover:bg-[#222222] hover:text-brand-teal-dark dark:hover:text-[#4ADE80] transition-colors"
                        >
                          <LayoutDashboard className="w-3.75 h-3.75" />
                          {t("common.dashboard")}
                        </Link>
                      </div>
                      <div className="border-t border-brand-beige/40 dark:border-[#2A2A2A] py-1.5">
                        <button
                          onClick={() => logoutMutation.mutate()}
                          disabled={logoutMutation.isPending}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-400/80 dark:text-red-400/70 hover:bg-red-50/60 dark:hover:bg-red-950/30 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <LogOut className="w-3.75 h-3.75" />
                          {logoutMutation.isPending
                            ? "..."
                            : t("common.logout")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Mobile Row ── */}
            <div className="flex md:hidden items-center gap-2 w-full justify-between">
              <div className="flex items-center gap-1.5">
                {!showUser && !isLoading && (
                  <Button
                    size="sm"
                    onClick={handleRegisterWithTerms}
                    className="bg-brand-mustard text-white border-0 rounded-md gap-1 h-7 text-[10px] font-semibold px-2.5"
                  >
                    <UserPlus className="w-2.5 h-2.5" />
                    {t("common.register")}
                  </Button>
                )}
                {showUser && (
                  // ✅ Mobile — relative container للـ Spotlight
                  <div className="relative">
                    <Link
                      to={dashboardPath}
                      onClick={() => setShowSpotlight(false)}
                      className={`flex items-center gap-1.5 rounded-md border px-2 py-0.75 hover:bg-white/6 transition-all ${
                        showSpotlight
                          ? "border-[#C4A035]/60 shadow-[0_0_0_2px_rgba(196,160,53,0.25)] bg-white/10"
                          : "border-white/10"
                      }`}
                    >
                      <User className="h-3 w-3 text-white/50" />
                      <span className="text-[10px] font-medium text-white/55">
                        {t("common.dashboard")}
                      </span>
                      {/* ✅ نقطة نبضية على الموبايل */}
                      {showSpotlight && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C4A035] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C4A035]" />
                        </span>
                      )}
                    </Link>

                    {/* ✅ Tooltip مصغر للموبايل */}
                    {showSpotlight && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowSpotlight(false)}
                        />
                        <div className="absolute top-full mt-2 left-0 z-50 w-64 bg-white dark:bg-[#1A1A1A] rounded-xl border border-brand-beige/60 dark:border-[#2A2A2A] shadow-xl overflow-hidden">
                          <div className="h-0.5 bg-gradient-to-r from-[#2B6F5E] via-[#C4A035] to-[#2B6F5E]" />
                          <div className="p-4">
                            <p className="text-[10px] font-bold text-[#C4A035] uppercase tracking-widest mb-1">
                              مرحباً بك 🎉
                            </p>
                            <p className="text-xs font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
                              حسابك جاهز! انقر هنا للدخول
                            </p>
                            <p className="text-[11px] text-[#6B5D4F] dark:text-[#888888] leading-relaxed">
                              ادخل للوحة التحكم لرفع وثائقك واستكشاف الخدمات.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/[0.07] transition-colors"
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                <div className="relative w-4.5 h-4.5">
                  <span
                    className={`absolute top-0.75 left-0 w-full h-[1.5px] bg-white rounded-full transition-all duration-300 origin-center ${mobileMenuOpen ? "rotate-45 top-2" : ""}`}
                  />
                  <span
                    className={`absolute top-2 left-0 w-full h-[1.5px] bg-white rounded-full transition-all duration-200 ${mobileMenuOpen ? "opacity-0 scale-x-0" : ""}`}
                  />
                  <span
                    className={`absolute top-3.25 left-0 w-full h-[1.5px] bg-white rounded-full transition-all duration-300 origin-center ${mobileMenuOpen ? "-rotate-45 top-2" : ""}`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ═══ MOBILE MENU ═══ */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${mobileMenuOpen ? "max-h-150" : "max-h-0"}`}
        >
          <div className="relative bg-brand-teal-dark dark:bg-[#0F0F0F] overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            <nav className="relative mx-auto max-w-7xl px-5 py-5 space-y-1">
              {NAV_LINKS.map((link, i) => {
                const active = isActive(link.to);
                return (
                  <LocaleLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center gap-3 px-4 py-3.5 text-[13px] font-medium rounded-xl transition-all duration-200 ${active ? "text-white bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" : "text-white/50 hover:bg-white/5 hover:text-white/80"}`}
                    style={{
                      animation: mobileMenuOpen
                        ? `headerMobileIn 0.35s cubic-bezier(0.23,1,0.32,1) ${60 + i * 40}ms both`
                        : "none",
                    }}
                  >
                    <span
                      className={`w-1 h-1 rounded-full transition-all duration-300 ${active ? "bg-brand-mustard w-2 shadow-[0_0_8px_rgba(193,154,94,0.6)]" : "bg-white/15 group-hover:bg-white/30"}`}
                    />
                    {link.label}
                    {active && (
                      <span
                        className={`${isRTL ? "mr-auto" : "ml-auto"} w-1 h-1 rounded-full bg-brand-mustard/40`}
                      />
                    )}
                  </LocaleLink>
                );
              })}

              <div className="py-2">
                <div className="h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
              </div>

              <div
                className="px-4"
                style={{
                  animation: mobileMenuOpen
                    ? "headerMobileIn 0.35s cubic-bezier(0.23,1,0.32,1) 320ms both"
                    : "none",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-3 h-3 text-white/25" />
                  <p className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.12em]">
                    {t("common.language") || "Language"}
                  </p>
                </div>
                <LanguageSwitcher variant="menu" />
              </div>

              <div
                className="px-4 pt-2"
                style={{
                  animation: mobileMenuOpen
                    ? "headerMobileIn 0.35s cubic-bezier(0.23,1,0.32,1) 340ms both"
                    : "none",
                }}
              >
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/8">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-white/50">
                      {t("common.theme") || "المظهر"}
                    </span>
                  </div>
                  <ThemeToggle />
                </div>
              </div>

              {!showUser && !isLoading && (
                <div
                  style={{
                    animation: mobileMenuOpen
                      ? "headerMobileIn 0.35s cubic-bezier(0.23,1,0.32,1) 380ms both"
                      : "none",
                  }}
                >
                  <div className="py-2">
                    <div className="h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <LocaleLink
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-3 text-[13px] font-medium text-white/60 rounded-xl border border-white/8 hover:bg-white/5 hover:text-white/80 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      {t("common.login")}
                    </LocaleLink>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleRegisterWithTerms();
                      }}
                      className="flex items-center justify-center gap-1.5 py-3 text-[13px] font-bold text-white bg-brand-mustard hover:bg-brand-mustard/90 rounded-xl shadow-[0_2px_10px_rgba(193,154,94,0.25)] transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {t("common.register")}
                    </button>
                  </div>
                </div>
              )}

              {showUser && (
                <div
                  style={{
                    animation: mobileMenuOpen
                      ? "headerMobileIn 0.35s cubic-bezier(0.23,1,0.32,1) 380ms both"
                      : "none",
                  }}
                >
                  <div className="py-2">
                    <div className="h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
                  </div>
                  <button
                    onClick={() => {
                      logoutMutation.mutate();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 text-[13px] font-medium text-red-300/70 rounded-xl border border-red-400/15 hover:bg-red-400/6 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t("common.logout")}
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${mobileMenuOpen ? "bg-black/25 backdrop-blur-[2px] pointer-events-auto" : "bg-transparent backdrop-blur-0 pointer-events-none"}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <style>{`
        @keyframes headerMobileIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
