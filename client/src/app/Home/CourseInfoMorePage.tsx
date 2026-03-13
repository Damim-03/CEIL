import { useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  ChevronRight,
  Calendar,
  Users,
  BookOpen,
  Globe,
  Award,
  MapPin,
  Clock,
  UserPlus,
  Loader2,
  Tag,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Info,
  Sparkles,
  BadgeCheck,
  LayoutDashboard,
  LogIn,
  Zap,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { usePublicCourse } from "../../hooks/announce/Usepublic";
import { useAuthRedirect } from "../../lib/utils/auth-redirect";
import { useLanguage } from "../../hooks/useLanguage";
import { LocaleLink } from "../../i18n/locales/components/LocaleLink";
import { Link } from "react-router-dom";

export default function CourseInfoMorePage() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading, isError } = usePublicCourse(id!);
  const { isLoggedIn, role } = useAuthRedirect();
  const { t, dir, isRTL, currentLang } = useLanguage();

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price: number | null, currency: string = "DA") => {
    if (price === null || price === undefined) return "—";
    return `${Number(price).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${currency}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-brand-teal-dark dark:text-[#4ADE80]" />
        <p className="text-brand-brown dark:text-[#888888] text-sm animate-pulse">
          {t("common.loading")}
        </p>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-5"
        dir={dir}
      >
        <XCircle className="w-16 h-16 text-red-300 dark:text-red-400/60" />
        <h2 className="text-2xl font-bold text-brand-black dark:text-[#E5E5E5]">
          {t("courses.notFound")}
        </h2>
        <p className="text-brand-brown dark:text-[#888888]">
          {t("courses.notFoundDesc")}
        </p>
        <Button
          asChild
          className="bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white rounded-xl px-6"
        >
          <LocaleLink to="/courses">{t("courses.backToCourses")}</LocaleLink>
        </Button>
      </div>
    );
  }

  const isOpen =
    course.registration_open &&
    (course.capacity === 0 || course.enrolled < course.capacity);
  const title =
    currentLang === "ar"
      ? course.title_ar || course.course_name
      : course.course_name;
  const altTitle = currentLang === "ar" ? course.course_name : course.title_ar;

  const getDashboardLink = () => {
    if (role === "ADMIN") return "/admin";
    if (role === "TEACHER") return "/teacher";
    return "/student";
  };

  return (
    <div className="min-h-screen bg-brand-gray dark:bg-[#0F0F0F]" dir={dir}>
      {/* HERO */}
      <div className="relative overflow-hidden">
        {course.image_url ? (
          <>
            <img
              src={course.image_url}
              alt={course.course_name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-teal-dark/85 via-brand-teal-dark/75 to-brand-teal/70 dark:from-[#0A0A0A]/90 dark:via-[#0F0F0F]/85 dark:to-[#0A1A10]/80" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-teal-dark via-brand-teal-dark to-brand-teal dark:from-[#0A1A10] dark:via-[#0F1F15] dark:to-[#0A1A10]" />
        )}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-[10%] w-64 h-64 rounded-full border border-white/10 dark:border-white/5" />
          <div className="absolute -bottom-20 right-[5%] w-80 h-80 rounded-full border border-white/5 dark:border-white/[0.03]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
            <LocaleLink
              to="/"
              className="hover:text-white/80 transition-colors"
            >
              {t("common.home")}
            </LocaleLink>
            <ChevronRight
              className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`}
            />
            <LocaleLink
              to="/courses"
              className="hover:text-white/80 transition-colors"
            >
              {t("common.courses")}
            </LocaleLink>
            <ChevronRight
              className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`}
            />
            <span className="text-white/70 font-medium truncate max-w-[200px]">
              {title}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {course.flag_emoji && (
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-5xl shrink-0 shadow-xl">
                {course.flag_emoji}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                {course.language && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold border border-white/20">
                    <Globe className="w-3 h-3" />
                    {course.language}
                  </span>
                )}
                {course.level && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-mustard/90 text-white text-xs font-semibold">
                    <GraduationCap className="w-3 h-3" />
                    {course.level}
                  </span>
                )}
                {course.course_type === "INTENSIVE" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/90 text-white text-xs font-bold backdrop-blur-sm border border-amber-300/30">
                    <Zap className="w-3 h-3" />
                    مكثفة
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm border border-white/20">
                    <BookOpen className="w-3 h-3" />
                    عادية
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isOpen ? "bg-emerald-400/90 text-white" : "bg-red-400/90 text-white"}`}
                >
                  {isOpen ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {isOpen ? t("courses.open") : t("courses.closed")}
                </span>
              </div>
              <h1
                className="text-3xl lg:text-4xl font-bold text-white leading-tight"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {title}
              </h1>
              {altTitle && altTitle !== title && (
                <p
                  className="text-white/50 mt-2 text-base"
                  dir={currentLang === "ar" ? "ltr" : "rtl"}
                >
                  {altTitle}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 50"
            fill="none"
            className="w-full h-auto block"
          >
            <path
              d="M0 50L60 44C120 38 240 26 360 22C480 18 600 22 720 26C840 30 960 34 1080 32C1200 30 1320 22 1380 18L1440 14V50H0Z"
              className="fill-brand-gray dark:fill-[#0F0F0F]"
            />
          </svg>
        </div>
      </div>

      {/* MAIN */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Column */}
          <div className="flex-1 space-y-6">
            {(course.description_ar || course.description) && (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige dark:border-[#2A2A2A] p-6 shadow-sm dark:shadow-black/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-brand-teal-dark/8 dark:bg-[#4ADE80]/[0.08] flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-brand-teal-dark dark:text-[#4ADE80]" />
                  </div>
                  <h2
                    className="text-lg font-bold text-brand-black dark:text-[#E5E5E5]"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {t("courses.aboutCourse")}
                  </h2>
                </div>
                <div className="space-y-3">
                  {currentLang === "ar" && course.description_ar && (
                    <p className="text-brand-black/60 dark:text-[#AAAAAA] leading-relaxed">
                      {course.description_ar}
                    </p>
                  )}
                  {currentLang !== "ar" && course.description && (
                    <p className="text-brand-black/60 dark:text-[#AAAAAA] leading-relaxed">
                      {course.description}
                    </p>
                  )}
                  {currentLang === "ar" &&
                    !course.description_ar &&
                    course.description && (
                      <p
                        className="text-brand-black/60 dark:text-[#AAAAAA] leading-relaxed"
                        dir="ltr"
                      >
                        {course.description}
                      </p>
                    )}
                  {currentLang !== "ar" &&
                    !course.description &&
                    course.description_ar && (
                      <p
                        className="text-brand-black/60 dark:text-[#AAAAAA] leading-relaxed"
                        dir="rtl"
                      >
                        {course.description_ar}
                      </p>
                    )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoChip
                icon={<BadgeCheck className="w-4 h-4" />}
                label={t("courses.type")}
                value={t("courses.certified")}
                color="teal"
              />
              <InfoChip
                icon={<Globe className="w-4 h-4" />}
                label={t("courses.language")}
                value={course.language || "—"}
                color="mustard"
              />
              <InfoChip
                icon={<MapPin className="w-4 h-4" />}
                label={t("courses.format")}
                value={t("courses.inPerson")}
                color="brown"
              />
              <InfoChip
                icon={<BookOpen className="w-4 h-4" />}
                label={t("courses.code")}
                value={course.course_code || "—"}
                color="teal"
              />
            </div>
            {/* Course type banner */}
            {course.course_type === "INTENSIVE" && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">
                    دورة مكثفة
                  </p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-500/70 mt-0.5">
                    {course.session_duration
                      ? `${Math.floor(course.session_duration / 60) > 0 ? Math.floor(course.session_duration / 60) + " ساعة " : ""}${course.session_duration % 60 > 0 ? (course.session_duration % 60) + " دقيقة" : ""} / حصة`
                      : "وتيرة مكثفة مع حصص مطوّلة"}
                  </p>
                </div>
              </div>
            )}

            {course.level && (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige dark:border-[#2A2A2A] p-6 shadow-sm dark:shadow-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-mustard/20 to-brand-mustard/5 dark:from-brand-mustard/15 dark:to-brand-mustard/[0.03] flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-brand-mustard-dark dark:text-[#D4A843]" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-brown dark:text-[#888888] font-medium">
                      {t("courses.level")}
                    </p>
                    <p className="text-xl font-bold text-brand-black dark:text-[#E5E5E5]">
                      {course.level}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {course.pricing && course.pricing.length > 0 && (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige dark:border-[#2A2A2A] overflow-hidden shadow-sm dark:shadow-black/20">
                <div
                  className={`bg-gradient-to-${isRTL ? "l" : "r"} from-brand-teal-dark to-brand-teal dark:from-[#1A1A1A] dark:to-[#1A1A1A] dark:border-b dark:border-[#2A2A2A] px-6 py-4 flex items-center gap-3`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/15 dark:bg-[#4ADE80]/[0.1] flex items-center justify-center">
                    <Tag className="w-4 h-4 text-white dark:text-[#4ADE80]" />
                  </div>
                  <h2
                    className="text-lg font-bold text-white dark:text-[#4ADE80]"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {t("courses.pricingByStatus")}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-brand-gray/50 dark:bg-[#151515]">
                        <th
                          className={`${isRTL ? "text-right" : "text-left"} px-6 py-3 font-semibold text-brand-brown dark:text-[#888888] text-xs`}
                        >
                          {t("courses.status")}
                        </th>
                        <th
                          className={`${isRTL ? "text-right" : "text-left"} px-5 py-3 font-semibold text-brand-brown dark:text-[#888888] text-xs`}
                        >
                          {t("courses.details")}
                        </th>
                        <th
                          className={`${isRTL ? "text-left" : "text-right"} px-6 py-3 font-semibold text-brand-brown dark:text-[#888888] text-xs`}
                        >
                          {t("courses.price")}
                        </th>
                        <th className="text-center px-5 py-3 font-semibold text-brand-brown dark:text-[#888888] text-xs">
                          {t("courses.discount")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {course.pricing.map((p: any, i: number) => (
                        <tr
                          key={p.id || i}
                          className={`border-t border-brand-beige/60 dark:border-[#2A2A2A] hover:bg-brand-teal-dark/[0.02] dark:hover:bg-[#4ADE80]/[0.02] ${i % 2 !== 0 ? "bg-brand-gray/30 dark:bg-[#151515]" : ""}`}
                        >
                          <td className="px-6 py-4 font-semibold text-brand-black dark:text-[#E5E5E5]">
                            {currentLang === "ar"
                              ? p.status_ar || p.status_fr
                              : p.status_fr}
                          </td>
                          <td className="px-5 py-4 text-brand-brown dark:text-[#888888] text-xs">
                            {currentLang === "ar"
                              ? p.status_fr
                              : p.status_ar || ""}
                          </td>
                          <td
                            className={`px-6 py-4 ${isRTL ? "text-left" : "text-right"} font-bold text-brand-black dark:text-[#E5E5E5]`}
                            dir="ltr"
                          >
                            {formatPrice(p.price, p.currency)}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${!p.discount || p.discount === "Aucune" || p.discount === "None" ? "bg-brand-beige/80 dark:bg-[#222222] text-brand-brown dark:text-[#666666]" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800/30"}`}
                            >
                              {p.discount || t("courses.noDiscount")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {course.groups && course.groups.length > 0 && (
              <GroupsSection
                groups={course.groups}
                t={t}
                isRTL={isRTL}
                currentLang={currentLang}
              />
            )}

            {course.session_name && (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige dark:border-[#2A2A2A] overflow-hidden shadow-sm dark:shadow-black/20">
                <div
                  className={`bg-gradient-to-${isRTL ? "l" : "r"} from-brand-teal-dark to-brand-teal dark:from-[#1A1A1A] dark:to-[#1A1A1A] dark:border-b dark:border-[#2A2A2A] px-6 py-4 flex items-center gap-3`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/15 dark:bg-[#4ADE80]/[0.1] flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white dark:text-[#4ADE80]" />
                  </div>
                  <h2
                    className="text-lg font-bold text-white dark:text-[#4ADE80]"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {t("courses.currentSession")}
                  </h2>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-brand-gray/50 dark:bg-[#151515] border border-brand-beige/60 dark:border-[#2A2A2A]">
                    <div className="w-12 h-12 rounded-xl bg-brand-teal-dark/8 dark:bg-[#4ADE80]/[0.08] flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-brand-teal-dark dark:text-[#4ADE80]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-brand-black dark:text-[#E5E5E5]">
                        {course.session_name}
                      </p>
                      <p className="text-brand-brown dark:text-[#888888] text-sm mt-0.5">
                        {formatDate(course.start_date)} —{" "}
                        {formatDate(course.end_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-[300px] shrink-0 space-y-5">
            <div className="bg-white dark:bg-[#161616] rounded-3xl border border-brand-beige dark:border-[#252525] overflow-hidden shadow-md dark:shadow-black/40 sticky top-24">
              <div
                className={`px-5 py-4 flex items-center gap-2.5 ${isOpen ? "bg-gradient-to-l from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700" : "bg-gradient-to-l from-red-400 to-red-500 dark:from-red-500 dark:to-red-600"}`}
              >
                {isOpen ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <XCircle className="w-5 h-5 text-white" />
                )}
                <h3 className="text-base font-bold text-white">
                  {isOpen
                    ? t("courses.registrationOpen")
                    : t("courses.registrationClosed")}
                </h3>
              </div>

              <div className="p-5 space-y-4">
                {course.session_name ? (
                  <div className="space-y-3.5">
                    <SidebarRow
                      icon={<Sparkles className="w-4 h-4" />}
                      label={t("courses.session")}
                      value={course.session_name}
                    />
                    {course.start_date && (
                      <SidebarRow
                        icon={<Calendar className="w-4 h-4" />}
                        label={t("courses.period")}
                        value={`${formatDate(course.start_date)} — ${formatDate(course.end_date)}`}
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-brand-beige dark:text-[#333333] mx-auto mb-2" />
                    <p className="text-brand-brown dark:text-[#888888] text-sm">
                      {t("courses.noSession")}
                    </p>
                  </div>
                )}

                {course.price !== null && Number(course.price) > 0 && (
                  <div className="pt-3.5 border-t border-brand-beige/60 dark:border-[#2A2A2A]">
                    <p className="text-[11px] text-brand-brown dark:text-[#888888] font-medium">
                      {t("courses.startingFrom")}
                    </p>
                    <p
                      className="text-2xl font-bold text-brand-teal-dark dark:text-[#4ADE80] mt-0.5"
                      dir="ltr"
                    >
                      {formatPrice(course.price, course.currency)}
                    </p>
                  </div>
                )}

                <div className="space-y-2.5 pt-1">
                  {isOpen && (
                    <>
                      {!isLoggedIn && (
                        <Button
                          asChild
                          className="w-full bg-brand-mustard hover:bg-brand-mustard/90 text-white gap-2 h-12 text-sm font-semibold rounded-xl shadow-lg"
                        >
                          <LocaleLink
                            to={`/login?redirect=${encodeURIComponent(`/student/courses?courseId=${course.id}`)}`}
                          >
                            <LogIn className="w-4 h-4" />
                            {t("courses.loginToRegister")}
                          </LocaleLink>
                        </Button>
                      )}
                      {isLoggedIn && role === "STUDENT" && (
                        <Button
                          asChild
                          className="w-full bg-brand-mustard hover:bg-brand-mustard/90 text-white gap-2 h-12 text-sm font-semibold rounded-xl shadow-lg"
                        >
                          <Link to={`/student/courses?courseId=${course.id}`}>
                            <UserPlus className="w-4 h-4" />
                            {t("courses.registerNow")}
                          </Link>
                        </Button>
                      )}
                      {isLoggedIn &&
                        (role === "ADMIN" || role === "TEACHER") && (
                          <>
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30">
                              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                                {role === "ADMIN"
                                  ? t("courses.adminsCannotRegister")
                                  : t("courses.teachersCannotRegister")}
                              </p>
                            </div>
                            <Button
                              asChild
                              variant="outline"
                              className="w-full border-brand-beige dark:border-[#2A2A2A] text-brand-teal-dark dark:text-[#4ADE80] hover:bg-brand-teal-dark dark:hover:bg-[#4ADE80] hover:text-white dark:hover:text-[#0F0F0F] gap-2 rounded-xl h-11"
                            >
                              <Link to={getDashboardLink()}>
                                <LayoutDashboard className="w-4 h-4" />
                                {t("common.dashboard")}
                              </Link>
                            </Button>
                          </>
                        )}
                    </>
                  )}
                  <Button
                    variant="outline"
                    asChild
                    className="w-full border-brand-beige dark:border-[#2A2A2A] text-brand-brown dark:text-[#888888] hover:bg-brand-gray dark:hover:bg-[#222222] gap-2 rounded-xl"
                  >
                    <LocaleLink to="/courses">
                      {t("courses.allCourses")}
                    </LocaleLink>
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#161616] rounded-3xl border border-brand-beige dark:border-[#252525] p-5 shadow-sm dark:shadow-black/30">
              <h4
                className="font-bold text-brand-black dark:text-[#E5E5E5] text-sm mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <Info className="w-4 h-4 text-brand-teal-dark dark:text-[#4ADE80]" />
                {t("courses.quickFacts")}
              </h4>
              <div className="space-y-3">
                <QuickRow
                  icon={<Globe className="w-3.5 h-3.5" />}
                  label={t("courses.language")}
                  value={course.language || "—"}
                  isRTL={isRTL}
                />
                <QuickRow
                  icon={<Award className="w-3.5 h-3.5" />}
                  label={t("courses.level")}
                  value={course.level || t("courses.allLevels")}
                  isRTL={isRTL}
                />
                <QuickRow
                  icon={<BookOpen className="w-3.5 h-3.5" />}
                  label={t("courses.code")}
                  value={course.course_code || "—"}
                  isRTL={isRTL}
                />
                <QuickRow
                  icon={<MapPin className="w-3.5 h-3.5" />}
                  label={t("courses.format")}
                  value={t("courses.inPerson")}
                  isRTL={isRTL}
                />
                <QuickRow
                  icon={<Users className="w-3.5 h-3.5" />}
                  label={t("courses.groups")}
                  value={`${course.groups?.length || 0} ${currentLang === "ar" ? "متاحة" : currentLang === "fr" ? "disponible(s)" : "available"}`}
                  isRTL={isRTL}
                />
                <QuickRow
                  icon={<Zap className="w-3.5 h-3.5" />}
                  label="نوع الدورة"
                  value={
                    course.course_type === "INTENSIVE" ? "مكثفة ⚡" : "عادية"
                  }
                  isRTL={isRTL}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Level order ──────────────────────────────────────────────────────────────
const LEVEL_ORDER = ["PRE_A1", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

type LevelKey = (typeof LEVEL_ORDER)[number];

const LEVEL_LABELS: Record<
  LevelKey,
  { label: string; color: string; bg: string; border: string }
> = {
  PRE_A1: {
    label: "Pre-A1",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800/40",
  },
  A1: {
    label: "A1",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-800/40",
  },
  A2: {
    label: "A2",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800/40",
  },
  B1: {
    label: "B1",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/30",
    border: "border-teal-200 dark:border-teal-800/40",
  },
  B2: {
    label: "B2",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800/40",
  },
  C1: {
    label: "C1",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800/40",
  },
  C2: {
    label: "C2",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800/40",
  },
};

type PublicGroup = {
  id: string;
  name: string;
  level?: string;
  teacher?: string | null;
  enrolled?: number;
  capacity?: number;
  status?: string;
};

function GroupsSection({
  groups,
  t,
  isRTL,
  currentLang,
}: {
  groups: PublicGroup[];
  t: (key: string, opts?: Record<string, unknown>) => string;
  isRTL: boolean;
  currentLang: string;
}) {
  // Collect unique levels that exist in groups, sorted by LEVEL_ORDER
  const availableLevels = useMemo(() => {
    const seen = new Set(groups.map((g) => g.level ?? "").filter(Boolean));
    return LEVEL_ORDER.filter((l) => seen.has(l));
  }, [groups]);

  const [activeLevel, setActiveLevel] = useState<string>("ALL");

  const filtered = useMemo(
    () =>
      activeLevel === "ALL"
        ? groups
        : groups.filter((g) => g.level === activeLevel),
    [groups, activeLevel],
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-xl bg-brand-teal-dark/8 dark:bg-[#4ADE80]/[0.08] flex items-center justify-center">
          <Users className="w-4 h-4 text-brand-teal-dark dark:text-[#4ADE80]" />
        </div>
        <div>
          <h2
            className="text-lg font-bold text-brand-black dark:text-[#E5E5E5]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("courses.availableGroups")}
          </h2>
          <p className="text-brand-brown dark:text-[#888888] text-xs">
            {t("courses.groupsAvailable", { count: groups.length })}
          </p>
        </div>
      </div>

      {/* Level filter pills */}
      {availableLevels.length > 1 && (
        <div
          className={`flex flex-wrap gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {/* ALL pill */}
          <button
            onClick={() => setActiveLevel("ALL")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200
              ${
                activeLevel === "ALL"
                  ? "bg-brand-teal-dark dark:bg-[#4ADE80] text-white dark:text-[#0F0F0F] border-transparent shadow-sm"
                  : "bg-white dark:bg-[#1A1A1A] text-brand-brown dark:text-[#888888] border-brand-beige dark:border-[#2A2A2A] hover:border-brand-teal/40 dark:hover:border-[#4ADE80]/30"
              }`}
          >
            {currentLang === "ar"
              ? "الكل"
              : currentLang === "fr"
                ? "Tous"
                : "All"}
            <span className="ms-1.5 opacity-60">({groups.length})</span>
          </button>

          {availableLevels.map((lvl) => {
            const meta = LEVEL_LABELS[lvl];
            const count = groups.filter((g) => g.level === lvl).length;
            const isActive = activeLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200
                  ${
                    isActive
                      ? `${meta.bg} ${meta.color} ${meta.border} shadow-sm scale-105`
                      : "bg-white dark:bg-[#1A1A1A] text-brand-brown dark:text-[#888888] border-brand-beige dark:border-[#2A2A2A] hover:border-brand-teal/30 dark:hover:border-[#4ADE80]/20"
                  }`}
              >
                {meta.label}
                <span className="ms-1.5 opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Groups grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-brand-brown dark:text-[#666666] text-sm">
          {currentLang === "ar"
            ? "لا توجد مجموعات لهذا المستوى"
            : "No groups for this level"}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((g) => {
            const lvlMeta = g.level ? LEVEL_LABELS[g.level as LevelKey] : null;
            return (
              <div
                key={g.id}
                className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige dark:border-[#2A2A2A] p-5 hover:shadow-lg dark:hover:shadow-black/30 hover:border-brand-teal/25 dark:hover:border-[#4ADE80]/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-brand-black dark:text-[#E5E5E5] text-base leading-snug">
                      {g.name}
                    </h3>
                    {g.teacher && (
                      <p className="text-brand-brown dark:text-[#888888] text-xs mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-teal-dark/40 dark:bg-[#4ADE80]/40 shrink-0" />
                        {g.teacher}
                      </p>
                    )}
                    {typeof g.enrolled === "number" &&
                      typeof g.capacity === "number" &&
                      g.capacity > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[10px] text-brand-brown dark:text-[#666666] mb-1">
                            <span>
                              {currentLang === "ar" ? "المقاعد" : "Capacity"}
                            </span>
                            <span>
                              {g.enrolled}/{g.capacity}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-brand-beige dark:bg-[#2A2A2A] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-brand-teal-dark dark:bg-[#4ADE80] transition-all"
                              style={{
                                width: `${Math.min(100, (g.enrolled / g.capacity) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                  </div>
                  {lvlMeta ? (
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border ${lvlMeta.bg} ${lvlMeta.color} ${lvlMeta.border}`}
                    >
                      {lvlMeta.label}
                    </span>
                  ) : g.level ? (
                    <span className="inline-flex px-3 py-1.5 rounded-xl bg-brand-teal-dark/8 dark:bg-[#4ADE80]/[0.1] text-brand-teal-dark dark:text-[#4ADE80] text-xs font-bold shrink-0 border border-brand-teal/10 dark:border-[#4ADE80]/10">
                      {g.level}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoChip({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "teal" | "mustard" | "brown";
}) {
  const styles = {
    teal: "bg-brand-teal-dark/5 dark:bg-[#4ADE80]/[0.05] border-brand-teal/15 dark:border-[#4ADE80]/10",
    mustard:
      "bg-brand-mustard/5 dark:bg-brand-mustard/[0.05] border-brand-mustard/15 dark:border-brand-mustard/10",
    brown:
      "bg-brand-brown/5 dark:bg-[#888888]/[0.05] border-brand-brown/15 dark:border-[#888888]/10",
  };
  const iconStyles = {
    teal: "text-brand-teal-dark dark:text-[#4ADE80]",
    mustard: "text-brand-mustard-dark dark:text-[#D4A843]",
    brown: "text-brand-brown dark:text-[#888888]",
  };
  return (
    <div className={`rounded-xl border p-4 text-center ${styles[color]}`}>
      <div className={`mx-auto mb-2 ${iconStyles[color]}`}>{icon}</div>
      <p className="text-[10px] text-brand-brown dark:text-[#888888] font-medium">
        {label}
      </p>
      <p className="text-sm font-bold text-brand-black dark:text-[#E5E5E5] mt-0.5 truncate">
        {value}
      </p>
    </div>
  );
}

function SidebarRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-brand-brown/60 dark:text-[#666666] shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-brand-brown dark:text-[#888888]">
          {label}
        </p>
        <p className="text-sm font-semibold text-brand-black dark:text-[#E5E5E5] truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function QuickRow({
  icon,
  label,
  value,
  isRTL,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isRTL: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span className="text-brand-brown/50 dark:text-[#555555] shrink-0">
        {icon}
      </span>
      <span className="text-brand-brown dark:text-[#888888]">{label}</span>
      <span
        className={`${isRTL ? "mr-auto" : "ml-auto"} font-semibold text-brand-black dark:text-[#E5E5E5] truncate`}
      >
        {value}
      </span>
    </div>
  );
}
