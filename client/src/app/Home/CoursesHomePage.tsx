import { useState, useEffect } from "react";
import {
  Calendar,
  UserPlus,
  Loader2,
  Globe,
  GraduationCap,
  Search,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  Zap,
  LayoutGrid,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { useSearchParams } from "react-router-dom";
import { usePublicCourses } from "../../hooks/announce/Usepublic";
import type { PublicCourse } from "../../lib/api/announce/announce.api";
import { useAuthRedirect } from "../../lib/utils/auth-redirect";
import { useLanguage } from "../../hooks/useLanguage";
import { LocaleLink } from "../../i18n/locales/components/LocaleLink";
import { useMe } from "../../hooks/auth/auth.hooks";
import { Link } from "react-router-dom";

// ─── helpers ───────────────────────────────────────────────
function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDuration(
  minutes: number | null | undefined,
  t: (k: string) => string,
) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}س ${m}د`;
  if (h > 0) return `${h} ${t("courses.hours")}`;
  return `${m} ${t("courses.minutes")}`;
}

// ─── CourseCard ─────────────────────────────────────────────
function CourseCard({
  course,
  index = 0,
}: {
  course: PublicCourse;
  index?: number;
}) {
  const { t, dir, currentLang } = useLanguage();
  const { isLoggedIn } = useAuthRedirect();
  const { data: user } = useMe();

  const isIntensive = (course as any).course_type === "INTENSIVE";
  const sessionDuration = (course as any).session_duration as
    | number
    | null
    | undefined;

  const isOpen =
    course.registration_open &&
    (course.capacity === 0 || course.enrolled < course.capacity);
  const isFull = course.capacity > 0 && course.enrolled >= course.capacity;

  const canRegister =
    !isLoggedIn || (user?.role !== "ADMIN" && user?.role !== "TEACHER");

  const durationLabel = formatDuration(sessionDuration, t);

  return (
    <div
      className="group flex flex-col rounded-2xl bg-white dark:bg-[#161616] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5"
      style={{
        border: isIntensive
          ? "1px solid rgba(251,191,36,0.25)"
          : "1px solid rgba(216,205,192,0.8)",
        animationDelay: `${index * 60}ms`,
      }}
      dir={dir}
    >
      {/* ── Image / Hero ── */}
      <div className="relative h-52 overflow-hidden">
        {/* Intensive accent line */}
        {isIntensive && (
          <div
            className="absolute top-0 left-0 right-0 h-0.5 z-10"
            style={{
              background:
                "linear-gradient(to right, #F59E0B, #FCD34D, #F59E0B)",
            }}
          />
        )}

        {course.image_url ? (
          <>
            <img
              src={course.image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div
              className="absolute inset-0"
              style={{
                background: isIntensive
                  ? "linear-gradient(135deg, rgba(180,120,0,0.22) 0%, transparent 60%)"
                  : "linear-gradient(135deg, rgba(38,66,48,0.22) 0%, transparent 60%)",
              }}
            />
          </>
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{
                background: isIntensive
                  ? "linear-gradient(135deg, #3D2800 0%, #7A5000 50%, #3D2800 100%)"
                  : "linear-gradient(135deg, #0A1F14 0%, #163524 50%, #0A1510 100%)",
              }}
            />
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full border border-white/5" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full border border-white/5" />
          </>
        )}

        {/* Top row: flag + badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          {course.flag_emoji ? (
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              {course.flag_emoji}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white/60" />
            </div>
          )}

          <div className="flex flex-col items-end gap-1.5">
            {isIntensive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/90 text-amber-950 shadow-lg backdrop-blur-sm">
                <Zap className="w-2.5 h-2.5" />
                {t("courses.intensive")}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg backdrop-blur-sm ${
                isOpen
                  ? "bg-emerald-500/90 text-white"
                  : "bg-red-500/90 text-white"
              }`}
            >
              {isOpen ? (
                <CheckCircle2 className="w-2.5 h-2.5" />
              ) : (
                <XCircle className="w-2.5 h-2.5" />
              )}
              {isOpen
                ? t("courses.open")
                : isFull
                  ? t("courses.full")
                  : t("courses.closed")}
            </span>
          </div>
        </div>

        {/* Bottom: title + chips */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3
            className="text-white text-lg font-bold leading-snug drop-shadow-sm line-clamp-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {currentLang === "ar"
              ? course.title_ar || course.course_name
              : course.course_name}
          </h3>
          {course.title_ar && course.course_name !== course.title_ar && (
            <p
              className="text-white/45 text-xs mt-0.5 truncate"
              dir={currentLang === "ar" ? "ltr" : "rtl"}
            >
              {currentLang === "ar" ? course.course_name : course.title_ar}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            {course.language && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-semibold backdrop-blur-sm border border-white/10">
                <Globe className="w-2 h-2" />
                {course.language}
              </span>
            )}
            {course.level && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{
                  background: isIntensive
                    ? "rgba(251,191,36,0.75)"
                    : "rgba(193,150,90,0.85)",
                  color: isIntensive ? "#3D2800" : "#fff",
                }}
              >
                <GraduationCap className="w-2 h-2" />
                {course.level}
              </span>
            )}
            {durationLabel && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/12 text-white text-[10px] font-semibold backdrop-blur-sm border border-white/10">
                <Clock className="w-2 h-2" />
                {durationLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 p-5 space-y-3">
        {(course.description_ar || course.description) && (
          <p className="text-xs text-brand-black/55 dark:text-[#777777] leading-relaxed line-clamp-2">
            {currentLang === "ar"
              ? course.description_ar || course.description
              : course.description}
          </p>
        )}

        {course.session_name && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={
              isIntensive
                ? {
                    background: "rgba(251,191,36,0.06)",
                    borderColor: "rgba(251,191,36,0.2)",
                    color: "#B45309",
                  }
                : {
                    background: "rgba(74,112,102,0.06)",
                    borderColor: "rgba(74,112,102,0.15)",
                    color: "var(--color-brand-teal-dark, #26423D)",
                  }
            }
          >
            <Clock className="w-3 h-3" />
            {course.session_name}
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: t("courses.startDate"),
              value: formatDate(course.start_date),
            },
            { label: t("courses.endDate"), value: formatDate(course.end_date) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="p-3 rounded-xl bg-brand-gray/60 dark:bg-[#1E1E1E] border border-brand-beige/50 dark:border-[#252525]"
            >
              <p className="text-[9px] text-brand-brown dark:text-[#555555] font-medium mb-1">
                {label}
              </p>
              <div className="flex items-center gap-1">
                <Calendar
                  className="w-3 h-3 shrink-0"
                  style={{
                    color: isIntensive
                      ? "#D97706"
                      : "var(--color-brand-teal-dark, #26423D)",
                  }}
                />
                <span
                  className="text-xs font-bold text-brand-black dark:text-[#E5E5E5]"
                  dir="ltr"
                >
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Capacity bar */}
        {course.capacity > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-brand-brown dark:text-[#555555]">
                {t("courses.enrolled")}
              </span>
              <span className="text-[10px] font-bold text-brand-black dark:text-[#E5E5E5]">
                {course.enrolled}/{course.capacity}
              </span>
            </div>
            <div className="h-1 rounded-full bg-brand-beige/60 dark:bg-[#2A2A2A] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (course.enrolled / course.capacity) * 100)}%`,
                  background: isIntensive
                    ? "linear-gradient(to right, #D97706, #F59E0B)"
                    : "linear-gradient(to right, #26423D, #4A7066)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="mx-5 h-px bg-brand-beige/50 dark:bg-[#222222]" />

      {/* ── Actions ── */}
      <div className="p-4 flex gap-2">
        {isOpen && canRegister && (
          <Button
            asChild
            className="flex-1 gap-1.5 rounded-xl h-10 text-xs font-semibold border-0 shadow-md"
            style={
              isIntensive
                ? {
                    background: "linear-gradient(135deg, #D97706, #F59E0B)",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(217,119,6,0.3)",
                  }
                : {
                    background: "var(--color-brand-mustard, #C19A5A)",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(193,150,90,0.25)",
                  }
            }
          >
            {!isLoggedIn ? (
              <LocaleLink
                to={`/login?redirect=${encodeURIComponent(`/student/courses?courseId=${course.id}`)}`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                {t("courses.loginToRegister")}
              </LocaleLink>
            ) : (
              <Link to={`/student/courses?courseId=${course.id}`}>
                <UserPlus className="w-3.5 h-3.5" />
                {t("courses.registerNow")}
              </Link>
            )}
          </Button>
        )}
        <Button
          variant="outline"
          asChild
          className={`${isOpen && canRegister ? "flex-1" : "w-full"} gap-1.5 rounded-xl h-10 text-xs border-brand-beige dark:border-[#2A2A2A] text-brand-teal-dark dark:text-[#4ADE80] hover:bg-brand-teal-dark dark:hover:bg-[#4ADE80] hover:text-white dark:hover:text-[#0F0F0F] hover:border-transparent transition-all`}
        >
          <LocaleLink to={`/courses/${course.id}`}>
            <Info className="w-3.5 h-3.5" />
            {t("common.moreInfo")}
          </LocaleLink>
        </Button>
      </div>
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  count,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  accent: "teal" | "amber";
}) {
  const tealColor = "var(--color-brand-teal-dark, #26423D)";
  const amberColor = "#D97706";
  const color = accent === "amber" ? amberColor : tealColor;

  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background:
            accent === "amber"
              ? "rgba(251,191,36,0.09)"
              : "rgba(38,66,48,0.07)",
          border: `1px solid ${accent === "amber" ? "rgba(251,191,36,0.22)" : "rgba(38,66,48,0.12)"}`,
        }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <h2
        className="text-lg font-bold text-brand-black dark:text-[#E5E5E5]"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {title}
      </h2>
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
        style={{
          background:
            accent === "amber"
              ? "rgba(251,191,36,0.09)"
              : "rgba(38,66,48,0.07)",
          color,
          border: `1px solid ${accent === "amber" ? "rgba(251,191,36,0.2)" : "rgba(38,66,48,0.12)"}`,
        }}
      >
        {count}
      </span>
      <div
        className="hidden sm:block flex-1 max-w-xs h-px ms-1"
        style={{
          background:
            accent === "amber"
              ? "linear-gradient(to right, rgba(251,191,36,0.3), transparent)"
              : "linear-gradient(to right, rgba(38,66,48,0.15), transparent)",
        }}
      />
    </div>
  );
}

// ─── Type Tabs ───────────────────────────────────────────────
type TypeFilter = "all" | "NORMAL" | "INTENSIVE";

function TypeTabs({
  value,
  onChange,
  normalCount,
  intensiveCount,
  allCount,
  t,
}: {
  value: TypeFilter;
  onChange: (v: TypeFilter) => void;
  normalCount: number;
  intensiveCount: number;
  allCount: number;
  t: (k: string) => string;
}) {
  const tabs: {
    id: TypeFilter;
    label: string;
    count: number;
    icon: React.ReactNode;
  }[] = [
    {
      id: "all",
      label: t("common.all"),
      count: allCount,
      icon: <LayoutGrid className="w-3.5 h-3.5" />,
    },
    {
      id: "NORMAL",
      label: t("courses.normal"),
      count: normalCount,
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    {
      id: "INTENSIVE",
      label: t("courses.intensive"),
      count: intensiveCount,
      icon: <Zap className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#161616] border border-brand-beige/80 dark:border-[#222222] w-fit flex-wrap">
      {tabs.map((tab) => {
        const active = value === tab.id;
        const isIntensiveTab = tab.id === "INTENSIVE";
        let activeStyle: React.CSSProperties = {};
        if (active) {
          activeStyle = isIntensiveTab
            ? {
                background: "linear-gradient(135deg, #D97706, #F59E0B)",
                color: "#fff",
                boxShadow: "0 3px 10px rgba(217,119,6,0.3)",
              }
            : {
                background: "var(--color-brand-teal-dark, #26423D)",
                color: "#fff",
                boxShadow: "0 3px 10px rgba(38,66,48,0.25)",
              };
        }
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            style={
              active
                ? activeStyle
                : { color: "#888", background: "transparent" }
            }
          >
            {tab.icon}
            {tab.label}
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
              style={
                active
                  ? { background: "rgba(255,255,255,0.22)", color: "inherit" }
                  : { background: "rgba(0,0,0,0.06)", color: "#999" }
              }
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function CoursesHomePage() {
  const { data, isLoading } = usePublicCourses({ page: 1, limit: 20 });
  const courses = data?.data || [];
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState(
    searchParams.get("language")?.toLowerCase() || "all",
  );
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const { t, dir } = useLanguage();

  useEffect(() => {
    const urlLang = searchParams.get("language")?.toLowerCase();
    if (urlLang && urlLang !== langFilter) setLangFilter(urlLang);
  }, [langFilter, searchParams]);

  const handleLangFilter = (lang: string) => {
    setLangFilter(lang);
    if (lang === "all") searchParams.delete("language");
    else searchParams.set("language", lang);
    setSearchParams(searchParams, { replace: true });
  };

  const languages = Array.from(
    new Set(courses.map((c) => c.language?.toLowerCase()).filter(Boolean)),
  );

  const applyBaseFilters = (list: PublicCourse[]) =>
    list.filter((c) => {
      const matchSearch =
        !search ||
        c.course_name.toLowerCase().includes(search.toLowerCase()) ||
        c.title_ar?.toLowerCase().includes(search.toLowerCase()) ||
        c.language?.toLowerCase().includes(search.toLowerCase());
      const matchLang =
        langFilter === "all" || c.language?.toLowerCase() === langFilter;
      return matchSearch && matchLang;
    });

  const allBase = applyBaseFilters(courses);
  const filteredNormal = allBase.filter(
    (c) => (c as any).course_type !== "INTENSIVE",
  );
  const filteredIntensive = allBase.filter(
    (c) => (c as any).course_type === "INTENSIVE",
  );
  const hasIntensive = courses.some(
    (c) => (c as any).course_type === "INTENSIVE",
  );

  const allFiltered =
    typeFilter === "NORMAL"
      ? filteredNormal
      : typeFilter === "INTENSIVE"
        ? filteredIntensive
        : allBase;

  const totalCount = allFiltered.length;

  return (
    <div className="min-h-screen bg-brand-gray dark:bg-[#0F0F0F]" dir={dir}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* ── Page Header ── */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold text-brand-black dark:text-[#E5E5E5] sm:text-4xl"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("courses.pageTitle")}
          </h1>
          <div className="flex justify-center mt-3">
            <div className="w-14 h-1 rounded-full bg-brand-mustard" />
          </div>
          <p className="mt-4 text-brand-brown dark:text-[#888888] max-w-lg mx-auto text-sm">
            {t("courses.subtitle")}
          </p>
        </div>

        {/* ── Controls ── */}
        <div className="flex flex-col gap-3 mb-8">
          {/* Search + language */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-brown/40 dark:text-[#555555]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("courses.searchPlaceholder")}
                className="w-full pr-11 pl-4 h-11 rounded-xl border border-brand-beige dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-sm text-brand-black dark:text-[#E5E5E5] placeholder:text-brand-brown/40 dark:placeholder:text-[#555555] focus:outline-none focus:border-brand-teal/40 dark:focus:border-[#4ADE80]/30 transition-all"
              />
            </div>
            {languages.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleLangFilter("all")}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${langFilter === "all" ? "bg-brand-teal-dark dark:bg-[#4ADE80] text-white dark:text-[#0F0F0F] shadow-md" : "bg-white dark:bg-[#1A1A1A] border border-brand-beige dark:border-[#2A2A2A] text-brand-brown dark:text-[#888888]"}`}
                >
                  {t("common.all")}
                </button>
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLangFilter(lang!)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${langFilter === lang ? "bg-brand-teal-dark dark:bg-[#4ADE80] text-white dark:text-[#0F0F0F] shadow-md" : "bg-white dark:bg-[#1A1A1A] border border-brand-beige dark:border-[#2A2A2A] text-brand-brown dark:text-[#888888]"}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Type tabs — only if intensive courses exist */}
          {hasIntensive && (
            <TypeTabs
              value={typeFilter}
              onChange={setTypeFilter}
              normalCount={filteredNormal.length}
              intensiveCount={filteredIntensive.length}
              allCount={allBase.length}
              t={t}
            />
          )}
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-brand-teal-dark dark:text-[#4ADE80]" />
            <p className="text-brand-brown dark:text-[#888888] text-sm font-medium animate-pulse">
              {t("common.loading")}
            </p>
          </div>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-brand-beige/50 dark:bg-[#2A2A2A] flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-brand-brown/30 dark:text-[#555555]" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-brand-black dark:text-[#E5E5E5]">
                {t("courses.noCoursesFound")}
              </p>
              <p className="text-sm text-brand-brown dark:text-[#888888] mt-1">
                {search || langFilter !== "all" || typeFilter !== "all"
                  ? t("courses.tryDifferent")
                  : t("courses.noCourses")}
              </p>
            </div>
            {(search || langFilter !== "all" || typeFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  handleLangFilter("all");
                  setTypeFilter("all");
                }}
                className="rounded-xl border-brand-beige dark:border-[#2A2A2A] text-brand-brown dark:text-[#888888]"
              >
                {t("common.clearFilters")}
              </Button>
            )}
          </div>
        ) : typeFilter === "all" && hasIntensive ? (
          /* ── Grouped view ── */
          <div className="space-y-14">
            {filteredNormal.length > 0 && (
              <section>
                <SectionHeader
                  icon={<BookOpen className="w-5 h-5" />}
                  title={t("courses.normalCourses")}
                  count={filteredNormal.length}
                  accent="teal"
                />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredNormal.map((course, i) => (
                    <CourseCard key={course.id} course={course} index={i} />
                  ))}
                </div>
              </section>
            )}

            {filteredIntensive.length > 0 && (
              <section>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div
                      className="w-full h-px"
                      style={{
                        background:
                          "linear-gradient(to right, transparent, rgba(251,191,36,0.3), transparent)",
                      }}
                    />
                  </div>
                </div>
                <SectionHeader
                  icon={<Zap className="w-5 h-5" />}
                  title={t("courses.intensiveCourses")}
                  count={filteredIntensive.length}
                  accent="amber"
                />
                {/* Info banner */}
                <div
                  className="mb-5 px-4 py-3 rounded-xl flex items-center gap-2.5"
                  style={{
                    background: "rgba(251,191,36,0.06)",
                    border: "1px solid rgba(251,191,36,0.2)",
                  }}
                >
                  <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#B45309" }}
                  >
                    {t("courses.intensiveDescription")}
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredIntensive.map((course, i) => (
                    <CourseCard key={course.id} course={course} index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* ── Flat grid ── */
          <>
            <p className="text-xs text-brand-brown dark:text-[#666666] mb-5">
              {t("courses.showing", { count: totalCount })}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allFiltered.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
