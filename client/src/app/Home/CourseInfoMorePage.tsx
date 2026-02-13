import { useParams } from "react-router-dom";
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
        <Loader2 className="w-12 h-12 animate-spin text-brand-teal-dark" />
        <p className="text-brand-brown text-sm animate-pulse">
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
        <XCircle className="w-16 h-16 text-red-300" />
        <h2 className="text-2xl font-bold text-brand-black">
          {t("courses.notFound")}
        </h2>
        <p className="text-brand-brown">{t("courses.notFoundDesc")}</p>
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
  const fillPercent =
    course.capacity > 0
      ? Math.min((course.enrolled / course.capacity) * 100, 100)
      : 0;
  const title =
    currentLang === "ar"
      ? course.title_ar || course.course_name
      : course.course_name;
  const altTitle = currentLang === "ar" ? course.course_name : course.title_ar;

  // Dashboard link for admin/teacher
  const getDashboardLink = () => {
    if (role === "ADMIN") return "/admin";
    if (role === "TEACHER") return "/teacher";
    return "/dashboard";
  };

  return (
    <div className="min-h-screen bg-brand-gray" dir={dir}>
      {/* HERO */}
      <div className="relative overflow-hidden">
        {course.image_url ? (
          <>
            <img
              src={course.image_url}
              alt={course.course_name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-teal-dark/85 via-brand-teal-dark/75 to-brand-teal/70" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-teal-dark via-brand-teal-dark to-brand-teal" />
        )}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-[10%] w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-20 right-[5%] w-80 h-80 rounded-full border border-white/5" />
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
              className="fill-brand-gray"
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
              <div className="bg-white rounded-2xl border border-brand-beige p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-brand-teal-dark/8 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-brand-teal-dark" />
                  </div>
                  <h2
                    className="text-lg font-bold text-brand-black"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {t("courses.aboutCourse")}
                  </h2>
                </div>
                <div className="space-y-3">
                  {currentLang === "ar" && course.description_ar && (
                    <p className="text-brand-black/60 leading-relaxed">
                      {course.description_ar}
                    </p>
                  )}
                  {currentLang !== "ar" && course.description && (
                    <p className="text-brand-black/60 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                  {currentLang === "ar" &&
                    !course.description_ar &&
                    course.description && (
                      <p
                        className="text-brand-black/60 leading-relaxed"
                        dir="ltr"
                      >
                        {course.description}
                      </p>
                    )}
                  {currentLang !== "ar" &&
                    !course.description &&
                    course.description_ar && (
                      <p
                        className="text-brand-black/60 leading-relaxed"
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

            {course.level && (
              <div className="bg-white rounded-2xl border border-brand-beige p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-mustard/20 to-brand-mustard/5 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-brand-mustard-dark" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-brown font-medium">
                      {t("courses.level")}
                    </p>
                    <p className="text-xl font-bold text-brand-black">
                      {course.level}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {course.pricing && course.pricing.length > 0 && (
              <div className="bg-white rounded-2xl border border-brand-beige overflow-hidden shadow-sm">
                <div
                  className={`bg-gradient-to-${isRTL ? "l" : "r"} from-brand-teal-dark to-brand-teal px-6 py-4 flex items-center gap-3`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                  <h2
                    className="text-lg font-bold text-white"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {t("courses.pricingByStatus")}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-brand-gray/50">
                        <th
                          className={`${isRTL ? "text-right" : "text-left"} px-6 py-3 font-semibold text-brand-brown text-xs`}
                        >
                          {t("courses.status")}
                        </th>
                        <th
                          className={`${isRTL ? "text-right" : "text-left"} px-5 py-3 font-semibold text-brand-brown text-xs`}
                        >
                          {t("courses.details")}
                        </th>
                        <th
                          className={`${isRTL ? "text-left" : "text-right"} px-6 py-3 font-semibold text-brand-brown text-xs`}
                        >
                          {t("courses.price")}
                        </th>
                        <th className="text-center px-5 py-3 font-semibold text-brand-brown text-xs">
                          {t("courses.discount")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {course.pricing.map((p: any, i: number) => (
                        <tr
                          key={p.id || i}
                          className={`border-t border-brand-beige/60 hover:bg-brand-teal-dark/[0.02] ${i % 2 !== 0 ? "bg-brand-gray/30" : ""}`}
                        >
                          <td className="px-6 py-4 font-semibold text-brand-black">
                            {currentLang === "ar"
                              ? p.status_ar || p.status_fr
                              : p.status_fr}
                          </td>
                          <td className="px-5 py-4 text-brand-brown text-xs">
                            {currentLang === "ar"
                              ? p.status_fr
                              : p.status_ar || ""}
                          </td>
                          <td
                            className={`px-6 py-4 ${isRTL ? "text-left" : "text-right"} font-bold text-brand-black`}
                            dir="ltr"
                          >
                            {formatPrice(p.price, p.currency)}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${!p.discount || p.discount === "Aucune" || p.discount === "None" ? "bg-brand-beige/80 text-brand-brown" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"}`}
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
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-9 h-9 rounded-lg bg-brand-teal-dark/8 flex items-center justify-center">
                    <Users className="w-4 h-4 text-brand-teal-dark" />
                  </div>
                  <div>
                    <h2
                      className="text-lg font-bold text-brand-black"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {t("courses.availableGroups")}
                    </h2>
                    <p className="text-brand-brown text-xs">
                      {t("courses.groupsAvailable", {
                        count: course.groups.length,
                      })}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {course.groups.map((g: any) => {
                    const gFill =
                      g.max_students > 0
                        ? Math.min((g.enrolled / g.max_students) * 100, 100)
                        : 0;
                    return (
                      <div
                        key={g.id}
                        className="bg-white rounded-xl border border-brand-beige p-5 hover:shadow-md hover:border-brand-teal/20 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-brand-black text-base">
                              {g.name}
                            </h3>
                            {g.teacher && (
                              <p className="text-brand-brown text-xs mt-0.5">
                                {g.teacher}
                              </p>
                            )}
                          </div>
                          <span className="inline-flex px-2.5 py-1 rounded-lg bg-brand-teal-dark/8 text-brand-teal-dark text-xs font-bold">
                            {g.level}
                          </span>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-brand-brown">
                              {t("courses.enrolled")}
                            </span>
                            <span className="font-semibold text-brand-black">
                              {g.enrolled} / {g.max_students}
                            </span>
                          </div>
                          <div className="h-2 bg-brand-beige/80 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${gFill >= 90 ? "bg-red-400" : gFill >= 60 ? "bg-brand-mustard" : "bg-brand-teal-dark"}`}
                              style={{ width: `${gFill}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {course.session_name && (
              <div className="bg-white rounded-2xl border border-brand-beige overflow-hidden shadow-sm">
                <div
                  className={`bg-gradient-to-${isRTL ? "l" : "r"} from-brand-teal-dark to-brand-teal px-6 py-4 flex items-center gap-3`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h2
                    className="text-lg font-bold text-white"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {t("courses.currentSession")}
                  </h2>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-brand-gray/50 border border-brand-beige/60">
                    <div className="w-12 h-12 rounded-xl bg-brand-teal-dark/8 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-brand-teal-dark" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-brand-black">
                        {course.session_name}
                      </p>
                      <p className="text-brand-brown text-sm mt-0.5">
                        {formatDate(course.start_date)} —{" "}
                        {formatDate(course.end_date)}
                      </p>
                    </div>
                    <div
                      className={`${isRTL ? "text-left" : "text-right"} shrink-0`}
                    >
                      <p className="font-bold text-brand-black text-lg">
                        {course.enrolled}
                        <span className="text-brand-brown font-normal text-sm">
                          /{course.capacity || "∞"}
                        </span>
                      </p>
                      <p className="text-brand-brown text-xs">
                        {t("courses.enrolled")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-[300px] shrink-0 space-y-5">
            <div className="bg-white rounded-2xl border border-brand-beige overflow-hidden shadow-sm sticky top-24">
              <div
                className={`px-5 py-4 flex items-center gap-2.5 ${isOpen ? "bg-gradient-to-l from-emerald-500 to-emerald-600" : "bg-gradient-to-l from-red-400 to-red-500"}`}
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
                    <SidebarRow
                      icon={<Users className="w-4 h-4" />}
                      label={t("courses.enrolled")}
                      value={`${course.enrolled} / ${course.capacity || "∞"}`}
                    />
                    {course.capacity > 0 && (
                      <div>
                        <div className="h-2 bg-brand-beige rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${fillPercent >= 90 ? "bg-red-400" : fillPercent >= 60 ? "bg-brand-mustard" : "bg-brand-teal-dark"}`}
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-brand-brown mt-1">
                          {Math.round(fillPercent)}% {t("courses.filled")}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-brand-beige mx-auto mb-2" />
                    <p className="text-brand-brown text-sm">
                      {t("courses.noSession")}
                    </p>
                  </div>
                )}

                {course.price !== null && Number(course.price) > 0 && (
                  <div className="pt-3.5 border-t border-brand-beige/60">
                    <p className="text-[11px] text-brand-brown font-medium">
                      {t("courses.startingFrom")}
                    </p>
                    <p
                      className="text-2xl font-bold text-brand-teal-dark mt-0.5"
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
                            to={`/login?redirect=${encodeURIComponent(`/dashboard/courses?courseId=${course.id}`)}`}
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
                          <Link to={`/dashboard/courses?courseId=${course.id}`}>
                            <UserPlus className="w-4 h-4" />
                            {t("courses.registerNow")}
                          </Link>
                        </Button>
                      )}
                      {isLoggedIn &&
                        (role === "ADMIN" || role === "TEACHER") && (
                          <>
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                              <Info className="w-4 h-4 text-amber-600 shrink-0" />
                              <p className="text-xs text-amber-700 font-medium">
                                {role === "ADMIN"
                                  ? t("courses.adminsCannotRegister")
                                  : t("courses.teachersCannotRegister")}
                              </p>
                            </div>
                            <Button
                              asChild
                              variant="outline"
                              className="w-full border-brand-beige text-brand-teal-dark hover:bg-brand-teal-dark hover:text-white gap-2 rounded-xl h-11"
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
                    className="w-full border-brand-beige text-brand-brown hover:bg-brand-gray gap-2 rounded-xl"
                  >
                    <LocaleLink to="/courses">
                      {t("courses.allCourses")}
                    </LocaleLink>
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-brand-beige p-5 shadow-sm">
              <h4
                className="font-bold text-brand-black text-sm mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <Info className="w-4 h-4 text-brand-teal-dark" />
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
              </div>
            </div>
          </div>
        </div>
      </div>
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
    teal: "bg-brand-teal-dark/5 border-brand-teal/15",
    mustard: "bg-brand-mustard/5 border-brand-mustard/15",
    brown: "bg-brand-brown/5 border-brand-brown/15",
  };
  const iconStyles = {
    teal: "text-brand-teal-dark",
    mustard: "text-brand-mustard-dark",
    brown: "text-brand-brown",
  };
  return (
    <div className={`rounded-xl border p-4 text-center ${styles[color]}`}>
      <div className={`mx-auto mb-2 ${iconStyles[color]}`}>{icon}</div>
      <p className="text-[10px] text-brand-brown font-medium">{label}</p>
      <p className="text-sm font-bold text-brand-black mt-0.5 truncate">
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
      <span className="text-brand-brown/60 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-brand-brown">{label}</p>
        <p className="text-sm font-semibold text-brand-black truncate">
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
      <span className="text-brand-brown/50 shrink-0">{icon}</span>
      <span className="text-brand-brown">{label}</span>
      <span
        className={`${isRTL ? "mr-auto" : "ml-auto"} font-semibold text-brand-black truncate`}
      >
        {value}
      </span>
    </div>
  );
}
