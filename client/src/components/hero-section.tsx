import { Button } from "../components/ui/button";
import {
  BookOpen,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  useHomeStats,
  usePublicAnnouncements,
} from "../hooks/announce/Usepublic";
import { useLanguage } from "../hooks/useLanguage";
import { LocaleLink } from "../i18n/locales/components/LocaleLink";

export function HeroSection() {
  const { data: stats } = useHomeStats();
  const { data: announcementsData } = usePublicAnnouncements({
    page: 1,
    limit: 6,
  });
  const { t, dir, isRTL, currentLang } = useLanguage();
  const [loaded, setLoaded] = useState(false);

  const announcements = announcementsData?.data || [];

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(
      currentLang === "ar" ? "ar-DZ" : currentLang === "fr" ? "fr-FR" : "en-GB",
      { month: "short", day: "numeric" },
    );

  const getTitle = (item: any) =>
    currentLang === "ar" ? item.title_ar || item.title : item.title;

  return (
    <section
      className="relative overflow-hidden min-h-[85vh] flex flex-col"
      dir={dir}
    >
      {/* ═══ Background ═══ */}
      <div className="absolute inset-0 bg-gradient-to-bl from-brand-teal-dark via-brand-teal-dark to-[#1a3528]" />
      <div className="absolute inset-0 pointer-events-none">
        {/* Geometric circles */}
        <div
          className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full border border-white/[0.05]"
          style={{ animation: "heroOrbit 60s linear infinite" }}
        />
        <div
          className="absolute bottom-[15%] left-[5%] w-[300px] h-[300px] rounded-full border border-white/[0.04]"
          style={{ animation: "heroOrbit 45s linear infinite reverse" }}
        />
        <div className="absolute top-[30%] left-[20%] w-[200px] h-[200px] rounded-full bg-white/[0.015]" />
        <div className="absolute top-[55%] right-[25%] w-[150px] h-[150px] rounded-full bg-brand-mustard/[0.04]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "50px 50px",
          }}
        />
        {/* Noise */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ═══ Main Content ═══ */}
      <div className="relative flex-1 flex items-center">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24 w-full">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 rounded-full bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] px-5 py-2.5 text-xs font-semibold text-white/75 tracking-wide transition-all duration-1000 ${
                loaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-mustard" />
              {t("hero.badge")}
            </div>

            {/* Title */}
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.15] tracking-tight transition-all duration-1000 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{
                fontFamily: "var(--font-sans)",
                transitionDelay: "150ms",
              }}
            >
              {t("hero.title")}
              <span className="block text-2xl sm:text-3xl font-normal text-white/45 mt-3">
                {t("hero.subtitle")}
              </span>
            </h1>

            {/* Description */}
            <p
              className={`text-lg sm:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto transition-all duration-1000 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              {t("hero.description")}
            </p>

            {/* Buttons */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 transition-all duration-1000 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: "450ms" }}
            >
              <Button
                size="lg"
                asChild
                className="bg-brand-mustard hover:bg-brand-mustard/90 text-white border-0 shadow-lg shadow-brand-mustard/25 px-8 h-13 text-base font-semibold rounded-xl gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <a href="#languages">
                  <Calendar className="w-4 h-4" />
                  {t("hero.exploreCourses")}
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/15 text-white hover:bg-white/[0.08] hover:border-white/25 px-8 h-13 text-base rounded-xl gap-2 bg-white/[0.04] backdrop-blur-sm hover:-translate-y-0.5 transition-all duration-300"
              >
                <LocaleLink to="/about-us">
                  <BookOpen className="w-4 h-4" />
                  {t("common.learnMore")}
                </LocaleLink>
              </Button>
            </div>

            {/* Stats */}
            <div
              className={`flex items-center justify-center gap-8 sm:gap-12 pt-10 transition-all duration-1000 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              <StatItem
                value={
                  stats?.languages_count ? `${stats.languages_count}+` : "6+"
                }
                label={t("hero.languages")}
                loaded={loaded}
                delay={700}
              />
              <div className="w-px h-12 bg-white/10" />
              <StatItem
                value="4"
                label={t("hero.levels")}
                loaded={loaded}
                delay={800}
              />
              <div className="w-px h-12 bg-white/10" />
              <StatItem
                value={
                  stats?.students_count ? `${stats.students_count}+` : "500+"
                }
                label={t("hero.students")}
                loaded={loaded}
                delay={900}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ News Ticker ═══ */}
      {announcements.length > 0 && (
        <div className="relative z-10">
          <NewsTicker
            announcements={announcements}
            t={t}
            isRTL={isRTL}
            currentLang={currentLang}
            formatDate={formatDate}
            getTitle={getTitle}
            loaded={loaded}
          />
        </div>
      )}

      {/* ═══ Wave ═══ */}
      <div className="relative z-10">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto block">
          <path
            d="M0 60L48 54C96 48 192 36 288 30C384 24 480 24 576 28C672 32 768 40 864 42C960 44 1056 40 1152 36C1248 32 1344 28 1392 26L1440 24V60H0Z"
            fill="white"
          />
        </svg>
      </div>

      {/* ═══ Keyframes ═══ */}
      <style>{`
        @keyframes heroOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(${isRTL ? "50%" : "-50%"}); }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   StatItem with count-up feel
   ═══════════════════════════════════════════════════════ */
function StatItem({
  value,
  label,
  loaded,
  delay,
}: {
  value: string;
  label: string;
  loaded: boolean;
  delay: number;
}) {
  return (
    <div
      className={`text-center transition-all duration-700 ${
        loaded
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-95"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
        {value}
      </p>
      <p className="text-xs text-white/40 font-medium mt-1 tracking-wide">
        {label}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   News Ticker — infinite scrolling marquee
   ═══════════════════════════════════════════════════════ */
function NewsTicker({
  announcements,
  t,
  isRTL,
  currentLang,
  formatDate,
  getTitle,
  loaded,
}: {
  announcements: any[];
  t: any;
  isRTL: boolean;
  currentLang: string;
  formatDate: (d: string) => string;
  getTitle: (item: any) => string;
  loaded: boolean;
}) {
  const [paused, setPaused] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Duplicate items for seamless loop
  const items = [...announcements, ...announcements];

  const CATEGORY_DOTS: Record<string, string> = {
    NEWS: "bg-blue-400",
    FORMATIONS: "bg-emerald-400",
    EXAMS: "bg-amber-400",
    REGISTRATION: "bg-purple-400",
    EVENTS: "bg-rose-400",
  };

  return (
    <div
      className={`bg-gradient-to-r from-black/30 via-black/20 to-black/30 backdrop-blur-sm border-t border-white/[0.06] transition-all duration-1000 ${
        loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: "800ms" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-12 gap-4">
          {/* Label */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-brand-mustard" />
              {/* Ping dot */}
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-mustard animate-pulse" />
            </div>
            <span className="text-[11px] font-bold text-brand-mustard uppercase tracking-wider hidden sm:inline">
              {t("hero.latestNews") || t("announcements.sectionTitle")}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 shrink-0" />

          {/* Scrolling area */}
          <div
            className="flex-1 overflow-hidden relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Fade edges */}
            <div
              className={`absolute top-0 bottom-0 w-8 z-10 pointer-events-none ${isRTL ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-black/30 to-transparent`}
            />
            <div
              className={`absolute top-0 bottom-0 w-8 z-10 pointer-events-none ${isRTL ? "left-0 bg-gradient-to-r" : "right-0 bg-gradient-to-l"} from-black/30 to-transparent`}
            />

            <div
              ref={tickerRef}
              className="flex items-center gap-6 whitespace-nowrap"
              style={{
                animation: `tickerScroll ${announcements.length * 8}s linear infinite`,
                animationPlayState: paused ? "paused" : "running",
              }}
            >
              {items.map((item, i) => {
                const catDot =
                  CATEGORY_DOTS[item.category?.toUpperCase() || ""] ||
                  "bg-white/40";
                return (
                  <LocaleLink
                    key={`${item.id}-${i}`}
                    to={`/announcements/${item.id}`}
                    className="group inline-flex items-center gap-2.5 shrink-0 py-1 hover:opacity-100 transition-opacity"
                  >
                    {/* Category dot */}
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${catDot} shrink-0`}
                    />
                    {/* Date */}
                    <span className="text-[11px] text-white/30 font-medium tabular-nums">
                      {formatDate(item.date)}
                    </span>
                    {/* Title */}
                    <span className="text-[13px] text-white/55 group-hover:text-white transition-colors duration-200 font-medium">
                      {getTitle(item)}
                    </span>
                    {/* Separator */}
                    <span className="text-white/15 mx-2">•</span>
                  </LocaleLink>
                );
              })}
            </div>
          </div>

          {/* View all link */}
          <LocaleLink
            to="/announcements"
            className={`shrink-0 hidden sm:flex items-center gap-1 text-[11px] font-medium text-white/35 hover:text-brand-mustard transition-colors duration-200`}
          >
            {t("announcements.viewAll")}
            {isRTL ? (
              <ChevronLeft className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </LocaleLink>
        </div>
      </div>
    </div>
  );
}
