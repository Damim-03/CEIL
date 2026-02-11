import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
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
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { useSearchParams } from "react-router-dom";
import { usePublicCourses } from "../../hooks/announce/Usepublic";
import type { PublicCourse } from "../../lib/api/announce/announce.api";
import { useAuthRedirect } from "../../lib/utils/auth-redirect";
import { useLanguage } from "../../hooks/useLanguage";
import { LocaleLink } from "../../i18n/locales/components/LocaleLink";

function CourseCard({ course }: { course: PublicCourse }) {
  const { t, dir, currentLang } = useLanguage();
  const { isLoggedIn, getRegisterHref } = useAuthRedirect();

  const isOpen =
    course.registration_open &&
    (course.capacity === 0 || course.enrolled < course.capacity);
  const isFull = course.capacity > 0 && course.enrolled >= course.capacity;

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div
      className="group flex flex-col rounded-2xl border border-brand-beige bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand-teal-dark/8 hover:-translate-y-1 hover:border-brand-teal/20"
      dir={dir}
    >
      {/* Header */}
      <div className="relative p-6 pb-5 overflow-hidden">
        {course.image_url ? (
          <>
            <img
              src={course.image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-br from-brand-teal-dark/85 via-brand-teal-dark/75 to-brand-teal/70" />
          </>
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-brand-teal-dark via-brand-teal-dark to-brand-teal" />
        )}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full border border-white/10" />
        </div>

        <div className="relative flex items-start justify-between mb-4">
          {course.flag_emoji ? (
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
              {course.flag_emoji}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white/70" />
            </div>
          )}
          <span
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${isOpen ? "bg-emerald-400/90 text-white" : "bg-red-400/90 text-white"}`}
          >
            {isOpen ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            {isOpen
              ? t("courses.open")
              : isFull
                ? t("courses.full")
                : t("courses.closed")}
          </span>
        </div>

        <div className="relative">
          <h3
            className="text-white text-lg font-bold leading-snug"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {currentLang === "ar"
              ? course.title_ar || course.course_name
              : course.course_name}
          </h3>
          {course.title_ar && course.course_name !== course.title_ar && (
            <p
              className="text-white/60 text-sm mt-1"
              dir={currentLang === "ar" ? "ltr" : "rtl"}
            >
              {currentLang === "ar" ? course.course_name : course.title_ar}
            </p>
          )}
        </div>

        <div className="relative flex items-center gap-2 mt-4 flex-wrap">
          {course.language && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-white text-[11px] font-semibold backdrop-blur-sm border border-white/10">
              <Globe className="w-3 h-3" />
              {course.language}
            </span>
          )}
          {course.level && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-mustard/90 text-white text-[11px] font-semibold">
              <GraduationCap className="w-3 h-3" />
              {course.level}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-5 space-y-4">
        {(course.description_ar || course.description) && (
          <p className="text-sm text-brand-black/55 leading-relaxed line-clamp-2">
            {currentLang === "ar"
              ? course.description_ar || course.description
              : course.description}
          </p>
        )}
        {course.session_name && (
          <div className="text-xs text-brand-brown text-center">
            {t("courses.session")}: {course.session_name}
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-sm">
            <Calendar className="w-3.5 h-3.5 text-brand-teal-dark shrink-0" />
            <span className="text-brand-brown">{t("courses.startDate")}:</span>
            <span
              className={`${currentLang === "ar" ? "mr-auto" : "ml-auto"} font-semibold text-brand-black text-[13px]`}
              dir="ltr"
            >
              {formatDate(course.start_date)}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Clock className="w-3.5 h-3.5 text-brand-teal-dark shrink-0" />
            <span className="text-brand-brown">{t("courses.endDate")}:</span>
            <span
              className={`${currentLang === "ar" ? "mr-auto" : "ml-auto"} font-semibold text-brand-black text-[13px]`}
              dir="ltr"
            >
              {formatDate(course.end_date)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <Users className="w-3.5 h-3.5 text-brand-teal-dark shrink-0" />
          <span className="text-brand-brown">{t("courses.enrolled")}:</span>
          <span
            className={`${currentLang === "ar" ? "mr-auto" : "ml-auto"} font-semibold text-brand-black`}
          >
            {course.enrolled} / {course.capacity || "∞"} {t("common.student")}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 pt-0 flex gap-2.5">
        {isOpen && (
          <Button
            asChild
            className="flex-1 bg-brand-mustard hover:bg-brand-mustard/90 text-white border-0 gap-2 rounded-xl h-11 font-semibold shadow-md"
          >
            <LocaleLink
              to={
                !isLoggedIn
                  ? `/login?redirect=${encodeURIComponent(`/courses/${course.id}`)}`
                  : getRegisterHref(course.id)
              }
            >
              <UserPlus className="w-4 h-4" />
              {!isLoggedIn
                ? t("courses.loginToRegister")
                : t("courses.registerNow")}
            </LocaleLink>
          </Button>
        )}
        <Button
          variant="outline"
          asChild
          className={`${isOpen ? "flex-1" : "w-full"} border-brand-teal-dark/20 text-brand-teal-dark hover:bg-brand-teal-dark hover:text-white hover:border-brand-teal-dark gap-2 rounded-xl h-11`}
        >
          <LocaleLink to={`/courses/${course.id}`}>
            <Info className="w-4 h-4" />
            {t("common.moreInfo")}
          </LocaleLink>
        </Button>
      </div>
    </div>
  );
}

export default function CoursesHomePage() {
  const { data, isLoading } = usePublicCourses({ page: 1, limit: 20 });
  const courses = data?.data || [];
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState(
    searchParams.get("language")?.toLowerCase() || "all",
  );
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

  const filtered = courses.filter((c) => {
    const matchSearch =
      !search ||
      c.course_name.toLowerCase().includes(search.toLowerCase()) ||
      c.title_ar?.toLowerCase().includes(search.toLowerCase()) ||
      c.language?.toLowerCase().includes(search.toLowerCase());
    const matchLang =
      langFilter === "all" || c.language?.toLowerCase() === langFilter;
    return matchSearch && matchLang;
  });

  return (
    <div className="min-h-screen bg-brand-gray relative" dir={dir}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold text-brand-black sm:text-4xl"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("courses.pageTitle")}
          </h1>
          <div className="flex justify-center mt-3">
            <div className="w-14 h-1 rounded-full bg-brand-mustard" />
          </div>
          <p className="mt-4 text-brand-brown max-w-lg mx-auto">
            {t("courses.subtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-brown/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("courses.searchPlaceholder")}
              className="w-full pr-11 pl-4 h-11 rounded-xl border border-brand-beige bg-white text-sm text-brand-black placeholder:text-brand-brown/40 focus:outline-none focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleLangFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${langFilter === "all" ? "bg-brand-teal-dark text-white shadow-md shadow-brand-teal-dark/20" : "bg-white border border-brand-beige text-brand-brown hover:border-brand-teal/30"}`}
            >
              {t("common.all")}
            </button>
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLangFilter(lang!)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${langFilter === lang ? "bg-brand-teal-dark text-white shadow-md shadow-brand-teal-dark/20" : "bg-white border border-brand-beige text-brand-brown hover:border-brand-teal/30"}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-brand-teal-dark" />
            <p className="text-brand-brown text-sm font-medium animate-pulse">
              {t("common.loading")}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-brand-beige/50 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-brand-brown/30" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-brand-black">
                {t("courses.noCoursesFound")}
              </p>
              <p className="text-sm text-brand-brown mt-1">
                {search ? t("courses.tryDifferent") : t("courses.noCourses")}
              </p>
            </div>
            {(search || langFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  handleLangFilter("all");
                }}
                className="rounded-xl border-brand-beige text-brand-brown"
              >
                {t("common.clearFilters")}
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-brand-brown mb-5">
              {t("courses.showing", { count: filtered.length })}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
