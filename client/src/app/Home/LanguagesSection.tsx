import {
  Loader2,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Users,
  GraduationCap,
  Globe,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { usePublicCourses } from "../../hooks/announce/Usepublic";
import type { PublicCourse } from "../../lib/api/announce/announce.api";
import { useLanguage } from "../../hooks/useLanguage";
import { LocaleLink } from "../../i18n/locales/components/LocaleLink";

function deriveLanguages(courses: PublicCourse[]) {
  const map = new Map<
    string,
    {
      flag_emoji: string;
      course_name: string;
      title_ar: string;
      level: string;
      description_ar: string;
      description: string;
      language: string;
      slug: string;
      courseCount: number;
      image_url: string | null;
    }
  >();

  for (const c of courses) {
    const lang = c.language?.toLowerCase() || "other";
    if (map.has(lang)) {
      const existing = map.get(lang)!;
      existing.courseCount++;
      if (!existing.image_url && c.image_url) existing.image_url = c.image_url;
      continue;
    }
    map.set(lang, {
      flag_emoji: c.flag_emoji || "🌐",
      course_name: c.course_name,
      title_ar: c.title_ar || c.course_name,
      level: c.level || "N/A",
      description_ar: c.description_ar || "",
      description: c.description || "",
      language: c.language || "",
      slug: lang,
      courseCount: 1,
      image_url: c.image_url || null,
    });
  }
  return Array.from(map.values());
}

/* ── Placeholder gradient colors per language ── */
const LANG_GRADIENTS: Record<string, string> = {
  english: "from-blue-600/80 to-indigo-700/80",
  french: "from-red-500/70 to-blue-600/80",
  german: "from-yellow-500/70 to-red-600/70",
  spanish: "from-orange-500/70 to-red-500/70",
  italian: "from-green-600/70 to-red-500/70",
  russian: "from-blue-700/80 to-red-600/70",
  arabic: "from-emerald-600/70 to-teal-700/80",
};

export function LanguagesSection() {
  const { data, isLoading } = usePublicCourses({ page: 1, limit: 50 });
  const languages = deriveLanguages(data?.data || []);
  const { t, dir, isRTL, currentLang } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const ViewAllArrow = isRTL ? ArrowLeft : ArrowRight;

  const getGradient = (slug: string) =>
    LANG_GRADIENTS[slug] || "from-brand-teal-dark/70 to-brand-teal/60";

  return (
    <section
      ref={sectionRef}
      id="languages"
      className="py-20 lg:py-28 bg-white relative overflow-hidden"
      dir={dir}
    >
      {/* ═══ Background ═══ */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23264230' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div
          className="absolute top-[10%] left-[3%] w-80 h-80 rounded-full bg-brand-teal-dark/[0.02]"
          style={{ animation: "langFloat 22s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[5%] right-[5%] w-96 h-96 rounded-full bg-brand-mustard/[0.025]"
          style={{
            animation: "langFloat 28s ease-in-out infinite reverse",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ═══ Header ═══ */}
        <div
          className={`text-center mb-14 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-teal-dark/5 border border-brand-teal-dark/10 px-4 py-1.5 text-xs font-semibold text-brand-teal-dark mb-4">
            <Globe className="w-3.5 h-3.5 text-brand-mustard" />
            {t("courses.sectionTitle")}
          </div>
          <h2
            className="text-3xl font-bold text-brand-black sm:text-4xl"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("courses.sectionTitle")}
          </h2>
          <div className="flex justify-center mt-3">
            <div
              className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${
                isVisible ? "w-16" : "w-0"
              }`}
              style={{ transitionDelay: "300ms" }}
            />
          </div>
          <p className="mt-4 text-brand-brown/70 max-w-lg mx-auto text-[15px]">
            {t("courses.subtitle")}
          </p>
        </div>

        {/* ═══ Content ═══ */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-brand-teal-dark/40 animate-spin" />
            <p className="text-brand-brown/40 text-sm">
              {t("common.loading")}
            </p>
          </div>
        ) : languages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-brand-beige/50 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-brand-brown/30" />
            </div>
            <p className="text-brand-black/35 text-lg">
              {t("courses.noCourses")}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {languages.map((lang, i) => (
                <LocaleLink
                  key={lang.slug}
                  to={`/courses?language=${lang.slug}`}
                  className={`group flex flex-col rounded-2xl border border-brand-beige/70 bg-white overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-brand-teal-dark/[0.06] hover:border-brand-teal-dark/15 hover:-translate-y-1.5 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{
                    transitionDelay: `${200 + i * 100}ms`,
                    transitionDuration: "800ms",
                  }}
                >
                  {/* ── Image Header ── */}
                  <div className="relative h-48 overflow-hidden bg-brand-beige/30">
                    {lang.image_url ? (
                      <img
                        src={lang.image_url}
                        alt={lang.course_name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${getGradient(lang.slug)}`}
                      >
                        {/* Pattern */}
                        <div
                          className="absolute inset-0 opacity-[0.08]"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                            backgroundSize: "24px 24px",
                          }}
                        />
                        {/* Center icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <GraduationCap className="w-16 h-16 text-white/20" />
                        </div>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/[0.05] group-hover:from-black/40 transition-all duration-500" />

                    {/* Flag badge */}
                    <div
                      className={`absolute top-3.5 ${isRTL ? "right-3.5" : "left-3.5"}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-md shadow-lg shadow-black/[0.08] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 border border-white/50">
                        {lang.flag_emoji}
                      </div>
                    </div>

                    {/* Course count */}
                    <div
                      className={`absolute top-3.5 ${isRTL ? "left-3.5" : "right-3.5"}`}
                    >
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-teal-dark/80 backdrop-blur-sm text-white shadow-lg">
                        <Users className="w-3 h-3" />
                        <span className="text-[11px] font-bold">
                          {lang.courseCount}{" "}
                          {lang.courseCount > 1
                            ? t("courses.groups")
                            : t("courses.groups")}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: level pill */}
                    <div className="absolute bottom-3.5 inset-x-3.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-brand-mustard/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                          <Sparkles className="w-3 h-3" />
                          {t("courses.level")} {lang.level}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Card Body ── */}
                  <div className="flex flex-col flex-1 p-5">
                    {/* Title */}
                    <h3
                      className="text-lg font-bold text-brand-black group-hover:text-brand-teal-dark transition-colors duration-200 leading-snug"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {currentLang === "ar"
                        ? lang.title_ar
                        : lang.course_name}
                    </h3>
                    {lang.course_name !== lang.title_ar && (
                      <p
                        className="text-sm text-brand-brown/50 mt-1"
                        dir={currentLang === "ar" ? "ltr" : "rtl"}
                      >
                        {currentLang === "ar"
                          ? lang.course_name
                          : lang.title_ar}
                      </p>
                    )}

                    {/* Description */}
                    <div className="flex-1 mt-3">
                      {currentLang === "ar" && lang.description_ar && (
                        <p className="text-[13px] text-brand-black/45 leading-relaxed line-clamp-3">
                          {lang.description_ar}
                        </p>
                      )}
                      {currentLang !== "ar" && lang.description && (
                        <p className="text-[13px] text-brand-black/45 leading-relaxed line-clamp-3">
                          {lang.description}
                        </p>
                      )}
                      {currentLang === "ar" &&
                        !lang.description_ar &&
                        lang.description && (
                          <p
                            className="text-[13px] text-brand-black/45 leading-relaxed line-clamp-3"
                            dir="ltr"
                          >
                            {lang.description}
                          </p>
                        )}
                    </div>

                    {/* Meta */}
                    <div className="mt-4 pt-3.5 border-t border-brand-beige/50 flex items-center justify-between text-[11px] text-brand-brown/50">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {t("courses.formationType")}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-brand-beige" />
                        <span>{lang.language}</span>
                      </div>
                      {/* Arrow */}
                      <div
                        className={`flex items-center gap-1 text-brand-teal-dark/40 group-hover:text-brand-teal-dark transition-colors duration-200 ${
                          isRTL
                            ? "group-hover:-translate-x-0.5"
                            : "group-hover:translate-x-0.5"
                        } transition-transform`}
                      >
                        <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {t("common.learnMore")}
                        </span>
                        {isRTL ? (
                          <ChevronLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                  </div>
                </LocaleLink>
              ))}
            </div>

            {/* View All */}
            <div
              className={`text-center mt-12 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${300 + languages.length * 100}ms` }}
            >
              <Button
                variant="outline"
                asChild
                className="border-brand-beige text-brand-teal-dark hover:bg-brand-teal-dark hover:text-white hover:border-brand-teal-dark px-8 rounded-xl h-11 gap-2 font-semibold text-[13px] group/btn transition-all duration-300 hover:shadow-lg hover:shadow-brand-teal-dark/[0.1] hover:-translate-y-0.5"
              >
                <LocaleLink to="/courses">
                  {t("courses.viewAllCourses")}
                  <ViewAllArrow className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                </LocaleLink>
              </Button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes langFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
}