import { useState } from "react";
import {
  Calendar,
  UserPlus,
  Loader2,
  Globe,
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  Zap,
  ChevronRight,
  ChevronLeft,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/button";
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

// ─── Language Card ──────────────────────────────────────────
function LanguageCard({
  lang,
  displayName,
  courses,
  onSelect,
}: {
  lang: string;
  displayName?: string;
  courses: PublicCourse[];
  onSelect: () => void;
}) {
  const { currentLang } = useLanguage();
  // pick first course with an image for the bg
  const sample = courses.find((c) => c.image_url) || courses[0];
  const flag = courses[0]?.flag_emoji;
  const hasIntensive = courses.some((c) => c.course_type === "INTENSIVE");
  const totalGroups = courses.reduce(
    (acc, c) => acc + (c.groups_count ?? 0),
    0,
  );

  return (
    <button
      onClick={onSelect}
      className="group relative flex flex-col rounded-2xl overflow-hidden text-left transition-all duration-400 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
      style={{ border: "1px solid rgba(216,205,192,0.5)" }}
    >
      {/* Hero image / gradient */}
      <div className="relative h-44 overflow-hidden">
        {sample?.image_url ? (
          <>
            <img
              src={sample.image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #0A1F14 0%, #163524 50%, #0A1510 100%)",
            }}
          />
        )}

        {/* Flag */}
        <div className="absolute top-4 left-4 z-10">
          {flag ? (
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform duration-300">
              {flag}
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white/60" />
            </div>
          )}
        </div>

        {/* Bottom: lang name */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <p className="text-white text-xl font-bold capitalize">
            {displayName || lang}
          </p>
          <p className="text-white/55 text-xs mt-0.5">
            {courses.length} دورة{courses.length > 1 ? "" : ""}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-[#161616] p-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-brand-teal-dark dark:text-[#4ADE80] text-xs font-semibold">
          <span>اختر</span>
          <ChevronLeft className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}

// ─── Type Card ──────────────────────────────────────────────
function TypeCard({
  type,
  count,
  onSelect,
}: {
  type: "NORMAL" | "INTENSIVE";
  count: number;
  onSelect: () => void;
}) {
  const isIntensive = type === "INTENSIVE";
  return (
    <button
      onClick={onSelect}
      className="group relative flex flex-col items-center justify-center rounded-2xl p-10 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
      style={{
        border: isIntensive
          ? "1.5px solid rgba(251,191,36,0.3)"
          : "1.5px solid rgba(74,112,102,0.25)",
        background: isIntensive
          ? "linear-gradient(135deg, rgba(251,191,36,0.04) 0%, rgba(255,255,255,1) 100%)"
          : "linear-gradient(135deg, rgba(38,66,48,0.04) 0%, rgba(255,255,255,1) 100%)",
      }}
    >
      {/* Dark mode override via class */}
      <div
        className="dark:hidden absolute inset-0 rounded-2xl"
        style={{
          background: isIntensive
            ? "linear-gradient(135deg, rgba(251,191,36,0.04), white)"
            : "linear-gradient(135deg, rgba(38,66,48,0.04), white)",
        }}
      />
      <div
        className="hidden dark:block absolute inset-0 rounded-2xl"
        style={{
          background: isIntensive
            ? "linear-gradient(135deg, rgba(251,191,36,0.06), #161616)"
            : "linear-gradient(135deg, rgba(38,66,48,0.07), #161616)",
        }}
      />

      <div
        className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{
          background: isIntensive
            ? "linear-gradient(135deg, #D97706, #F59E0B)"
            : "linear-gradient(135deg, #26423D, #4A7066)",
          boxShadow: isIntensive
            ? "0 8px 24px rgba(217,119,6,0.35)"
            : "0 8px 24px rgba(38,66,48,0.3)",
        }}
      >
        {isIntensive ? (
          <Zap className="w-9 h-9 text-white" />
        ) : (
          <BookOpen className="w-9 h-9 text-white" />
        )}
      </div>

      <h3
        className="relative text-2xl font-bold mb-2"
        style={{ color: isIntensive ? "#B45309" : "#26423D" }}
      >
        {isIntensive ? "مكثفة ⚡" : "عادية"}
      </h3>
      <p className="relative text-sm text-brand-brown dark:text-[#888] mb-1">
        {isIntensive
          ? "دورات مكثفة لتحقيق تقدم سريع في وقت قصير"
          : "دورات منتظمة مع جدول زمني مرن ومتوازن"}
      </p>
      <span
        className="relative inline-flex items-center justify-center mt-3 px-4 py-1.5 rounded-full text-sm font-bold"
        style={{
          background: isIntensive
            ? "rgba(251,191,36,0.12)"
            : "rgba(38,66,48,0.09)",
          color: isIntensive ? "#D97706" : "#26423D",
          border: isIntensive
            ? "1px solid rgba(251,191,36,0.3)"
            : "1px solid rgba(38,66,48,0.2)",
        }}
      >
        {count} دورة
      </span>
    </button>
  );
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

  const isIntensive = course.course_type === "INTENSIVE";
  const sessionDuration = course.session_duration as number | null | undefined;

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
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
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
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: isIntensive
                ? "linear-gradient(135deg, #3D2800 0%, #7A5000 50%, #3D2800 100%)"
                : "linear-gradient(135deg, #0A1F14 0%, #163524 50%, #0A1510 100%)",
            }}
          />
        )}

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          {course.flag_emoji ? (
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              {course.flag_emoji}
            </div>
          ) : (
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white/60" />
            </div>
          )}
          <div className="flex flex-col items-end gap-1.5">
            {isIntensive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/90 text-amber-950 shadow-lg">
                <Zap className="w-2.5 h-2.5" /> مكثف
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg ${
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

        {/* Bottom info */}
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

      {/* Body */}
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
                    color: "#26423D",
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
                  style={{ color: isIntensive ? "#D97706" : "#26423D" }}
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
      </div>

      <div className="mx-5 h-px bg-brand-beige/50 dark:bg-[#222222]" />

      {/* Actions */}
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

// ─── Breadcrumb ─────────────────────────────────────────────
function Breadcrumb({
  steps,
  onNavigate,
  dir,
}: {
  steps: { label: string; onClick: () => void }[];
  onNavigate?: () => void;
  dir: string;
}) {
  const Arrow = dir === "rtl" ? ChevronLeft : ChevronRight;
  return (
    <div className="flex items-center gap-2 text-sm flex-wrap">
      {steps.map((s, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && (
            <Arrow className="w-4 h-4 text-brand-brown/40 dark:text-[#444]" />
          )}
          <button
            onClick={s.onClick}
            className={`font-medium transition-colors ${
              i === steps.length - 1
                ? "text-brand-black dark:text-[#E5E5E5] cursor-default"
                : "text-brand-teal-dark dark:text-[#4ADE80] hover:underline"
            }`}
          >
            {s.label}
          </button>
        </span>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
type Step = "language" | "type" | "courses";

export default function CoursesHomePage() {
  const { t, dir, currentLang } = useLanguage();

  const [step, setStep] = useState<Step>("language");
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<
    "NORMAL" | "INTENSIVE" | null
  >(null);

  // Fetch ALL published courses once — limit 200 to cover all courses
  // Filtering by language & type happens client-side
  const { data, isLoading } = usePublicCourses({ page: 1, limit: 200 });
  const allCourses = data?.data || [];

  // ── Build language map (case-insensitive grouping) ──
  const langMap: Record<string, PublicCourse[]> = {};
  const langDisplayName: Record<string, string> = {};
  allCourses.forEach((c) => {
    if (!c.language) return;
    const key = c.language.toLowerCase().trim();
    if (!langMap[key]) {
      langMap[key] = [];
      langDisplayName[key] =
        c.language.charAt(0).toUpperCase() + c.language.slice(1).toLowerCase();
    }
    langMap[key].push(c);
  });
  const languages = Object.keys(langMap).sort();

  // ── Courses for selected language ──
  const langCourses: PublicCourse[] = selectedLang
    ? (langMap[selectedLang] ?? [])
    : [];

  // ── Split by type ──
  const normalCourses = langCourses.filter(
    (c) => c.course_type !== "INTENSIVE",
  );
  const intensiveCourses = langCourses.filter(
    (c) => c.course_type === "INTENSIVE",
  );
  const hasIntensive = intensiveCourses.length > 0;
  const hasNormal = normalCourses.length > 0;

  // ── Final list based on selected type ──
  const finalCourses =
    selectedType === "INTENSIVE"
      ? intensiveCourses
      : selectedType === "NORMAL"
        ? normalCourses
        : langCourses;

  // Handlers
  const handleLangSelect = (lang: string) => {
    setSelectedLang(lang);
    const lc = langMap[lang] || [];
    const hasInt = lc.some((c) => c.course_type === "INTENSIVE");
    const hasNorm = lc.some((c) => c.course_type !== "INTENSIVE");
    // Skip type step if only one type
    if (hasInt && hasNorm) {
      setStep("type");
    } else {
      setSelectedType(hasInt ? "INTENSIVE" : "NORMAL");
      setStep("courses");
    }
  };

  const handleTypeSelect = (type: "NORMAL" | "INTENSIVE") => {
    setSelectedType(type);
    setStep("courses");
  };

  const goToLanguages = () => {
    setStep("language");
    setSelectedLang(null);
    setSelectedType(null);
  };

  const goToTypes = () => {
    setStep("type");
    setSelectedType(null);
  };

  // Breadcrumb steps
  const breadcrumbSteps = [
    { label: t("courses.pageTitle"), onClick: goToLanguages },
    ...(selectedLang
      ? [
          {
            label:
              langDisplayName[selectedLang] ||
              selectedLang.charAt(0).toUpperCase() + selectedLang.slice(1),
            onClick:
              step === "courses" && hasIntensive && hasNormal
                ? goToTypes
                : goToLanguages,
          },
        ]
      : []),
    ...(step === "courses" && selectedType
      ? [
          {
            label: selectedType === "INTENSIVE" ? "مكثفة ⚡" : "عادية",
            onClick: () => {},
          },
        ]
      : []),
  ];

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

        {/* ── Breadcrumb ── */}
        {step !== "language" && (
          <div className="mb-8">
            <Breadcrumb steps={breadcrumbSteps} dir={dir} />
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-brand-teal-dark dark:text-[#4ADE80]" />
            <p className="text-brand-brown dark:text-[#888888] text-sm font-medium animate-pulse">
              {t("common.loading")}
            </p>
          </div>
        ) : step === "language" ? (
          /* ── STEP 1: Language Grid ── */
          <div>
            <p className="text-sm text-brand-brown dark:text-[#666] mb-6">
              اختر لغة التكوين للبدء
            </p>
            {languages.length === 0 ? (
              <div className="text-center py-24 text-brand-brown dark:text-[#666]">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t("courses.noCourses")}</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {languages.map((lang) => (
                  <LanguageCard
                    key={lang}
                    lang={lang}
                    displayName={langDisplayName[lang]}
                    courses={langMap[lang]}
                    onSelect={() => handleLangSelect(lang)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : step === "type" ? (
          /* ── STEP 2: Type Selection ── */
          <div>
            <p className="text-sm text-brand-brown dark:text-[#666] mb-8 text-center">
              اختر نوع الدورة
            </p>
            <div className="grid gap-8 sm:grid-cols-2 max-w-2xl mx-auto">
              {hasNormal && (
                <TypeCard
                  type="NORMAL"
                  count={normalCourses.length}
                  onSelect={() => handleTypeSelect("NORMAL")}
                />
              )}
              {hasIntensive && (
                <TypeCard
                  type="INTENSIVE"
                  count={intensiveCourses.length}
                  onSelect={() => handleTypeSelect("INTENSIVE")}
                />
              )}
            </div>
          </div>
        ) : (
          /* ── STEP 3: Courses Grid ── */
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {selectedType === "INTENSIVE" ? (
                  <>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-brand-black dark:text-[#E5E5E5]">
                        الدورات المكثفة
                      </h2>
                      <p className="text-xs text-brand-brown dark:text-[#666]">
                        {finalCourses.length} دورة متاحة
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-xl bg-[#26423D]/8 dark:bg-[#26423D]/15 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-[#26423D] dark:text-[#4ADE80]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-brand-black dark:text-[#E5E5E5]">
                        الدورات العادية
                      </h2>
                      <p className="text-xs text-brand-brown dark:text-[#666]">
                        {finalCourses.length} دورة متاحة
                      </p>
                    </div>
                  </>
                )}
              </div>
              {/* Intensive banner */}
              {selectedType === "INTENSIVE" && (
                <div
                  className="px-4 py-2.5 rounded-xl flex items-center gap-2"
                  style={{
                    background: "rgba(251,191,36,0.07)",
                    border: "1px solid rgba(251,191,36,0.2)",
                  }}
                >
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    دورات مكثفة لتحقيق تقدم سريع في وقت قصير
                  </p>
                </div>
              )}
            </div>

            {finalCourses.length === 0 ? (
              <div className="text-center py-24 text-brand-brown dark:text-[#666]">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t("courses.noCoursesFound")}</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {finalCourses.map((course, i) => (
                  <CourseCard key={course.id} course={course} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
