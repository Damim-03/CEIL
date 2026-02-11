import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/download.png";
import ceillogo from "../assets/logo.jpg";
import {
  User,
  LogIn,
  UserPlus,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Globe,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useMe, useLogout } from "../hooks/auth/auth.hooks";
import { useLanguage } from "../hooks/useLanguage";
import { LanguageSwitcher } from "../i18n/locales/components/LanguageSwitcher";
import { LocaleLink } from "../i18n/locales/components/LocaleLink";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();

  const { data: user, isLoading } = useMe();
  const logoutMutation = useLogout();
  const { t, dir, isRTL, currentLang } = useLanguage();

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

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const NAV_LINKS = [
    { to: "/", label: t("common.home") },
    { to: "/courses", label: t("common.courses") },
    { to: "/about-us", label: t("common.features") },
    { to: "/announcements", label: t("common.announcements") },
    { to: "/contact", label: t("common.contact") },
  ];

  const dashboardPath =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "TEACHER"
        ? "/teacher"
        : "/dashboard";

  const isActive = (path: string) => {
    const cleaned =
      location.pathname.replace(new RegExp(`^/${currentLang}`), "") || "/";
    return path === "/" ? cleaned === "/" : cleaned.startsWith(path);
  };

  const showUser = !isLoading && !!user;

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled ? "shadow-[0_4px_30px_rgba(0,0,0,0.08)]" : "shadow-none"
        }`}
        dir={dir}
      >
        {/* ═══════════════════════════════════════════════
            TOP BAR — University Identity
            ═══════════════════════════════════════════════ */}
        <div className="relative bg-white overflow-hidden">
          {/* Subtle geometric pattern */}
          <div
            className="absolute inset-0 opacity-[0.015] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23264230' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {/* Bottom gold accent line */}
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand-mustard/50 to-transparent" />

          <div
            className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-500 ${
              scrolled ? "h-14" : "h-[72px]"
            }`}
          >
            {/* University Logo */}
            <LocaleLink to="/" className="group shrink-0 relative">
              <div className="relative">
                <img
                  src={logo}
                  alt="University"
                  className={`object-contain transition-all duration-500 ${
                    scrolled ? "h-10 w-10" : "h-[52px] w-[52px]"
                  }`}
                />
                {/* Ring on hover */}
                <div className="absolute -inset-1 rounded-2xl border-2 border-brand-teal-dark/0 group-hover:border-brand-teal-dark/[0.08] transition-all duration-300 scale-90 group-hover:scale-100" />
              </div>
            </LocaleLink>

            {/* Center — University Name */}
            <div className="hidden sm:flex flex-col items-center text-center flex-1 px-8 select-none">
              <h1
                className={`font-bold text-brand-teal-dark leading-tight tracking-tight transition-all duration-500 ${
                  scrolled ? "text-sm" : "text-base sm:text-lg lg:text-xl"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
                dir="ltr"
              >
                {t("header.universityName")}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="w-8 h-px bg-gradient-to-r from-transparent to-brand-mustard/50" />
                <p
                  className={`text-brand-teal-dark/50 font-medium tracking-wide transition-all duration-500 ${
                    scrolled ? "text-[9px]" : "text-[11px] sm:text-xs"
                  }`}
                  dir="ltr"
                >
                  {t("header.centerName")}
                </p>
                <span className="w-8 h-px bg-gradient-to-l from-transparent to-brand-mustard/50" />
              </div>
              <p
                className={`text-brand-brown/50 transition-all duration-500 ${
                  scrolled
                    ? "text-[0px] opacity-0 h-0 mt-0"
                    : "text-[11px] opacity-100 h-auto mt-0.5"
                }`}
              >
                {t("header.centerNameAr")}
              </p>
            </div>

            {/* Mobile Title */}
            <div className="flex sm:hidden flex-col items-center text-center flex-1 px-2 select-none">
              <p
                className="text-sm font-bold text-brand-teal-dark tracking-tight"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {t("header.shortName")}
              </p>
              <p className="text-[9px] text-brand-brown/50 tracking-wide">
                {t("header.shortNameAr")}
              </p>
            </div>

            {/* CEIL Logo */}
            <LocaleLink to="/" className="group shrink-0 relative">
              <div className="relative">
                <img
                  src={ceillogo}
                  alt="CEIL"
                  className={`object-contain rounded-lg transition-all duration-500 ${
                    scrolled ? "h-9 w-9" : "h-12 w-12"
                  }`}
                />
                <div className="absolute -inset-1 rounded-2xl border-2 border-brand-teal-dark/0 group-hover:border-brand-teal-dark/[0.08] transition-all duration-300 scale-90 group-hover:scale-100" />
              </div>
            </LocaleLink>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            NAVIGATION BAR
            ═══════════════════════════════════════════════ */}
        <div className="relative">
          {/* Main bg */}
          <div className="absolute inset-0 bg-brand-teal-dark" />
          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] mix-blend-soft-light pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            }}
          />
          {/* Top shine */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
          {/* Bottom brand accent */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-brand-mustard/0 via-brand-mustard/30 to-brand-mustard/0" />

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
                    className="relative px-4 py-[7px] text-[13px] font-medium transition-all duration-200 group"
                  >
                    {/* Hover bg */}
                    <span
                      className={`absolute inset-0 rounded-md transition-all duration-200 ${
                        active
                          ? "bg-white/[0.13]"
                          : "bg-transparent group-hover:bg-white/[0.06]"
                      }`}
                    />
                    {/* Text */}
                    <span
                      className={`relative transition-colors duration-200 ${
                        active
                          ? "text-white"
                          : "text-white/55 group-hover:text-white/90"
                      }`}
                    >
                      {link.label}
                    </span>
                    {/* Active indicator */}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-brand-mustard transition-all duration-300 ${
                        active
                          ? "w-7 opacity-100"
                          : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-40"
                      }`}
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
              {/* Language */}
              <div
                className={`flex items-center ${
                  isRTL ? "ml-2.5 border-l pl-2.5" : "mr-2.5 border-r pr-2.5"
                } border-white/[0.1]`}
              >
                <LanguageSwitcher variant="header" />
              </div>

              {/* Auth */}
              {!showUser && !isLoading && (
                <div className="flex items-center gap-1.5">
                  <Button
                    asChild
                    size="sm"
                    className="relative bg-brand-mustard text-white border-0 rounded-md gap-1.5 h-[30px] text-[11px] font-semibold px-3 overflow-hidden transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(193,154,94,0.35)] active:translate-y-0"
                  >
                    <LocaleLink to="/register">
                      <UserPlus className="w-3 h-3" />
                      {t("common.register")}
                    </LocaleLink>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-white/15 text-white/80 hover:text-white rounded-md gap-1.5 h-[30px] text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/25 transition-all duration-200 hover:-translate-y-[1px]"
                  >
                    <LocaleLink to="/login">
                      <LogIn className="w-3 h-3" />
                      {t("common.login")}
                    </LocaleLink>
                  </Button>
                </div>
              )}

              {/* User */}
              {showUser && (
                <div className="relative" data-user-menu>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen((o) => !o);
                    }}
                    className={`flex items-center gap-2 rounded-md border py-[3px] transition-all duration-200 ${
                      isRTL ? "pl-2 pr-[3px]" : "pr-2 pl-[3px]"
                    } ${
                      userMenuOpen
                        ? "bg-white/[0.1] border-white/20"
                        : "border-white/[0.1] hover:bg-white/[0.07] hover:border-white/[0.16]"
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
                      {/* Online dot */}
                      <div className="absolute -bottom-[2px] -right-[2px] w-2.5 h-2.5 rounded-full bg-emerald-400 border-[1.5px] border-brand-teal-dark" />
                    </div>
                    <span className="text-[11px] font-medium text-white/75 max-w-[70px] truncate">
                      {user.first_name || t("common.dashboard")}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 text-white/30 transition-transform duration-300 ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown */}
                  <div
                    className={`absolute top-full mt-2 w-56 z-50 transition-all duration-200 origin-top ${
                      isRTL ? "left-0" : "right-0"
                    } ${
                      userMenuOpen
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                    }`}
                  >
                    {/* Arrow */}
                    <div
                      className={`absolute -top-[6px] w-3 h-3 bg-white rotate-45 border-l border-t border-brand-beige/40 ${
                        isRTL ? "left-4" : "right-4"
                      }`}
                    />
                    <div className="relative bg-white rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-brand-beige/40 overflow-hidden">
                      {/* User card */}
                      <div className="px-4 py-3 bg-gradient-to-b from-brand-gray/50 to-white border-b border-brand-beige/40">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {user.google_avatar && !avatarError ? (
                              <img
                                src={user.google_avatar}
                                className="h-9 w-9 rounded-lg border border-brand-beige object-cover"
                                alt=""
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-lg border border-brand-beige bg-brand-teal-dark/[0.06] flex items-center justify-center">
                                <User className="h-4 w-4 text-brand-teal-dark/50" />
                              </div>
                            )}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-brand-black truncate">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-[10px] text-brand-brown/60 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1.5">
                        <Link
                          to={dashboardPath}
                          className={`flex items-center gap-2.5 px-4 py-2 text-[13px] text-brand-black/65 hover:bg-brand-teal-dark/[0.04] hover:text-brand-teal-dark transition-colors ${
                            isRTL ? "flex-row" : "flex-row"
                          }`}
                        >
                          <LayoutDashboard className="w-[15px] h-[15px]" />
                          {t("common.dashboard")}
                        </Link>
                      </div>
                      <div className="border-t border-brand-beige/40 py-1.5">
                        <button
                          onClick={() => logoutMutation.mutate()}
                          disabled={logoutMutation.isPending}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-400/80 hover:bg-red-50/60 hover:text-red-500 transition-colors"
                        >
                          <LogOut className="w-[15px] h-[15px]" />
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
                    asChild
                    size="sm"
                    className="bg-brand-mustard text-white border-0 rounded-md gap-1 h-7 text-[10px] font-semibold px-2.5"
                  >
                    <LocaleLink to="/register">
                      <UserPlus className="w-2.5 h-2.5" />
                      {t("common.register")}
                    </LocaleLink>
                  </Button>
                )}
                {showUser && (
                  <Link
                    to={dashboardPath}
                    className="flex items-center gap-1.5 rounded-md border border-white/[0.1] px-2 py-[3px] hover:bg-white/[0.06] transition-colors"
                  >
                    <User className="h-3 w-3 text-white/50" />
                    <span className="text-[10px] font-medium text-white/55">
                      {t("common.dashboard")}
                    </span>
                  </Link>
                )}
              </div>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/[0.07] transition-colors"
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                <div className="relative w-[18px] h-[18px]">
                  <span
                    className={`absolute top-[3px] left-0 w-full h-[1.5px] bg-white rounded-full transition-all duration-300 origin-center ${
                      mobileMenuOpen ? "rotate-45 top-[8px]" : ""
                    }`}
                  />
                  <span
                    className={`absolute top-[8px] left-0 w-full h-[1.5px] bg-white rounded-full transition-all duration-200 ${
                      mobileMenuOpen ? "opacity-0 scale-x-0" : ""
                    }`}
                  />
                  <span
                    className={`absolute top-[13px] left-0 w-full h-[1.5px] bg-white rounded-full transition-all duration-300 origin-center ${
                      mobileMenuOpen ? "-rotate-45 top-[8px]" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            MOBILE MENU — Full slide-down panel
            ═══════════════════════════════════════════════ */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            mobileMenuOpen ? "max-h-[600px]" : "max-h-0"
          }`}
        >
          <div className="relative bg-brand-teal-dark overflow-hidden">
            {/* Pattern bg */}
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
                    className={`group flex items-center gap-3 px-4 py-3.5 text-[13px] font-medium rounded-xl transition-all duration-200 ${
                      active
                        ? "text-white bg-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        : "text-white/50 hover:bg-white/[0.05] hover:text-white/80"
                    }`}
                    style={{
                      animation: mobileMenuOpen
                        ? `headerMobileIn 0.35s cubic-bezier(0.23,1,0.32,1) ${60 + i * 40}ms both`
                        : "none",
                    }}
                  >
                    <span
                      className={`w-1 h-1 rounded-full transition-all duration-300 ${
                        active
                          ? "bg-brand-mustard w-2 shadow-[0_0_8px_rgba(193,154,94,0.6)]"
                          : "bg-white/15 group-hover:bg-white/30"
                      }`}
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

              {/* Separator */}
              <div className="py-2">
                <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
              </div>

              {/* Language */}
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

              {/* Auth */}
              {!showUser && !isLoading && (
                <div
                  style={{
                    animation: mobileMenuOpen
                      ? "headerMobileIn 0.35s cubic-bezier(0.23,1,0.32,1) 380ms both"
                      : "none",
                  }}
                >
                  <div className="py-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <LocaleLink
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-3 text-[13px] font-medium text-white/60 rounded-xl border border-white/[0.08] hover:bg-white/[0.05] hover:text-white/80 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      {t("common.login")}
                    </LocaleLink>
                    <LocaleLink
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-3 text-[13px] font-bold text-white bg-brand-mustard hover:bg-brand-mustard/90 rounded-xl shadow-[0_2px_10px_rgba(193,154,94,0.25)] transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {t("common.register")}
                    </LocaleLink>
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
                    <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                  </div>
                  <button
                    onClick={() => {
                      logoutMutation.mutate();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 text-[13px] font-medium text-red-300/70 rounded-xl border border-red-400/15 hover:bg-red-400/[0.06] hover:text-red-300 transition-colors"
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
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileMenuOpen
            ? "bg-black/25 backdrop-blur-[2px] pointer-events-auto"
            : "bg-transparent backdrop-blur-0 pointer-events-none"
        }`}
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
