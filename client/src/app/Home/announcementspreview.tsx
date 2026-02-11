import {
  Calendar,
  Loader2,
  Newspaper,
  Tag,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { usePublicAnnouncements } from "../../hooks/announce/Usepublic";
import { useLanguage } from "../../hooks/useLanguage";
import { LocaleLink } from "../../i18n/locales/components/LocaleLink";

const CATEGORY_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; glow: string }
> = {
  NEWS: {
    bg: "bg-blue-500/[0.08]",
    text: "text-blue-600",
    border: "border-blue-200/40",
    glow: "shadow-blue-500/10",
  },
  FORMATIONS: {
    bg: "bg-emerald-500/[0.08]",
    text: "text-emerald-600",
    border: "border-emerald-200/40",
    glow: "shadow-emerald-500/10",
  },
  EXAMS: {
    bg: "bg-amber-500/[0.08]",
    text: "text-amber-600",
    border: "border-amber-200/40",
    glow: "shadow-amber-500/10",
  },
  REGISTRATION: {
    bg: "bg-purple-500/[0.08]",
    text: "text-purple-600",
    border: "border-purple-200/40",
    glow: "shadow-purple-500/10",
  },
  EVENTS: {
    bg: "bg-rose-500/[0.08]",
    text: "text-rose-600",
    border: "border-rose-200/40",
    glow: "shadow-rose-500/10",
  },
};

const DEFAULT_CAT = {
  bg: "bg-brand-teal-dark/[0.08]",
  text: "text-brand-teal-dark",
  border: "border-brand-teal-dark/20",
  glow: "shadow-brand-teal-dark/10",
};

export function AnnouncementsPreview() {
  const { data, isLoading } = usePublicAnnouncements({ page: 1, limit: 4 });
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
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const announcements = data?.data || [];
  const featured = announcements[0];
  const others = announcements.slice(1);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(
      currentLang === "ar" ? "ar-DZ" : currentLang === "fr" ? "fr-FR" : "en-GB",
      { year: "numeric", month: "short", day: "numeric" },
    );

  const getCatLabel = (cat: string) =>
    t(`announcements.categories.${cat?.toUpperCase()}`, {
      defaultValue: cat,
    });

  const getCatStyle = (cat: string) =>
    CATEGORY_CONFIG[cat?.toUpperCase() || ""] || DEFAULT_CAT;

  const getTitle = (item: any) =>
    currentLang === "ar" ? item.title_ar || item.title : item.title;

  const getExcerpt = (item: any) =>
    currentLang === "ar" ? item.excerpt_ar || item.excerpt : item.excerpt;

  const ViewAllArrow = isRTL ? ArrowLeft : ArrowRight;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28 bg-brand-gray/40 relative overflow-hidden"
      dir={dir}
    >
      {/* ═══ Background ═══ */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #264230 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-[15%] right-[5%] w-72 h-72 rounded-full bg-brand-mustard/[0.03]" />
        <div className="absolute bottom-[10%] left-[3%] w-80 h-80 rounded-full bg-brand-teal-dark/[0.02]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ═══ Header ═══ */}
        <div
          className={`text-center mb-14 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2
            className="text-3xl font-bold text-brand-black sm:text-4xl"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("announcements.sectionTitle")}
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
            {t("announcements.subtitle")}
          </p>
        </div>

        {/* ═══ Content ═══ */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-brand-teal-dark/40 animate-spin" />
            <p className="text-brand-brown/40 text-sm">{t("common.loading")}</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-brand-beige/50 flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-8 h-8 text-brand-brown/30" />
            </div>
            <p className="text-brand-black/35 text-lg">
              {t("announcements.noAnnouncements")}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] items-start">
            {/* ── News List ── */}
            <div
              className={`space-y-3.5 order-2 lg:order-1 transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : `opacity-0 ${isRTL ? "translate-x-8" : "-translate-x-8"}`
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              {others.map((item, i) => {
                const catStyle = getCatStyle(item.category);
                return (
                  <LocaleLink
                    key={item.id}
                    to={`/announcements/${item.id}`}
                    className={`group relative flex gap-4 rounded-2xl border border-brand-beige/80 bg-white p-4 transition-all duration-300 hover:shadow-lg hover:shadow-brand-teal-dark/[0.04] hover:border-brand-teal-dark/15 hover:-translate-y-0.5 ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-6"
                    }`}
                    style={{
                      transitionDelay: `${300 + i * 100}ms`,
                      transitionDuration: "700ms",
                    }}
                  >
                    {/* Thumbnail */}
                    {item.image_url ? (
                      <div className="w-[105px] h-[88px] rounded-xl overflow-hidden shrink-0 bg-brand-beige/50">
                        <img
                          src={item.image_url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-[105px] h-[88px] rounded-xl shrink-0 bg-gradient-to-br from-brand-teal-dark/[0.06] to-brand-teal-dark/[0.02] flex items-center justify-center">
                        <Newspaper className="w-6 h-6 text-brand-teal-dark/20" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 flex flex-col">
                      {/* Category + Date */}
                      <div className="flex items-center gap-2 mb-1.5">
                        {item.category && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-md text-[10px] font-semibold border ${catStyle.bg} ${catStyle.text} ${catStyle.border} shadow-sm ${catStyle.glow}`}
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {getCatLabel(item.category)}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[11px] text-brand-brown/45">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.date)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-[14px] font-bold text-brand-black leading-snug line-clamp-2 group-hover:text-brand-teal-dark transition-colors duration-200"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {getTitle(item)}
                      </h3>

                      {/* Excerpt */}
                      <p className="mt-auto pt-1.5 text-[12px] text-brand-black/35 line-clamp-1">
                        {getExcerpt(item)}
                      </p>
                    </div>

                    {/* Arrow indicator */}
                    <div
                      className={`self-center shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                        isRTL
                          ? "-translate-x-1 group-hover:translate-x-0"
                          : "translate-x-1 group-hover:translate-x-0"
                      }`}
                    >
                      <Chevron className="w-4 h-4 text-brand-teal-dark/40" />
                    </div>
                  </LocaleLink>
                );
              })}

              {/* View All */}
              <Button
                variant="outline"
                asChild
                className="w-full border-brand-beige/80 text-brand-teal-dark hover:bg-brand-teal-dark hover:text-white hover:border-brand-teal-dark rounded-xl h-11 gap-2 font-semibold text-[13px] group/btn transition-all duration-300"
              >
                <LocaleLink to="/announcements">
                  {t("announcements.viewAll")}
                  <ViewAllArrow className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                </LocaleLink>
              </Button>
            </div>

            {/* ── Featured Card ── */}
            {featured && (
              <div
                className={`order-1 lg:order-2 transition-all duration-1000 ${
                  isVisible
                    ? "opacity-100 translate-x-0"
                    : `opacity-0 ${isRTL ? "-translate-x-8" : "translate-x-8"}`
                }`}
                style={{ transitionDelay: "300ms" }}
              >
                <LocaleLink
                  to={`/announcements/${featured.id}`}
                  className="group block rounded-2xl overflow-hidden border border-brand-beige/60 bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-brand-teal-dark/[0.06] hover:border-brand-teal-dark/10"
                >
                  <div className="relative min-h-[440px] lg:min-h-[470px] overflow-hidden bg-brand-beige/30">
                    {/* Image */}
                    {featured.image_url ? (
                      <img
                        src={featured.image_url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-teal-dark via-brand-teal-dark/90 to-brand-teal">
                        {/* Pattern for no-image */}
                        <div
                          className="absolute inset-0 opacity-[0.05]"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                            backgroundSize: "30px 30px",
                          }}
                        />
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/[0.03] group-hover:from-black/75 transition-all duration-500" />

                    {/* Top: Category badge */}
                    {featured.category && (
                      <div
                        className={`absolute top-5 ${isRTL ? "right-5" : "left-5"}`}
                      >
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md text-brand-teal-dark text-[11px] font-bold shadow-lg shadow-black/[0.08] border border-white/50">
                          <Tag className="w-3 h-3" />
                          {getCatLabel(featured.category)}
                        </span>
                      </div>
                    )}

                    {/* "Featured" label */}
                    <div
                      className={`absolute top-5 ${isRTL ? "left-5" : "right-5"}`}
                    >
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-mustard/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                        <Sparkles className="w-3 h-3" />
                        {t("announcements.featured") || "Featured"}
                      </span>
                    </div>

                    {/* Bottom content */}
                    <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7">
                      {/* Date */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.12] backdrop-blur-sm">
                          <Calendar className="w-3 h-3 text-white/70" />
                          <span className="text-[11px] text-white/80 font-medium">
                            {formatDate(featured.date)}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-xl sm:text-2xl font-bold text-white leading-snug line-clamp-3 group-hover:text-brand-mustard/90 transition-colors duration-300"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {getTitle(featured)}
                      </h3>

                      {/* Excerpt */}
                      {getExcerpt(featured) && (
                        <p className="mt-3 text-[13px] text-white/50 line-clamp-2 leading-relaxed">
                          {getExcerpt(featured)}
                        </p>
                      )}

                      {/* Read more hint */}
                      <div className="mt-4 flex items-center gap-1.5 text-white/40 group-hover:text-brand-mustard/70 transition-colors duration-300">
                        <span className="text-[12px] font-medium">
                          {t("common.learnMore")}
                        </span>
                        <Chevron
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isRTL
                              ? "group-hover:-translate-x-1"
                              : "group-hover:translate-x-1"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </LocaleLink>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
