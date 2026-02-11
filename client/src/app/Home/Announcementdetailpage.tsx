import { useParams } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Tag,
  Loader2,
  ChevronRight,
  Share2,
  Printer,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  usePublicAnnouncement,
  usePublicAnnouncements,
} from "../../hooks/announce/Usepublic";
import { useLanguage } from "../../hooks/useLanguage";
import { LocaleLink } from "../../i18n/locales/components/LocaleLink";

const CATEGORY_COLORS: Record<string, string> = {
  NEWS: "bg-blue-500/10 text-blue-700 border-blue-200",
  FORMATIONS: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  EXAMS: "bg-amber-500/10 text-amber-700 border-amber-200",
  REGISTRATION: "bg-purple-500/10 text-purple-700 border-purple-200",
  EVENTS: "bg-rose-500/10 text-rose-700 border-rose-200",
};

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: announcement, isLoading, isError } = usePublicAnnouncement(id!);
  const { data: relatedData } = usePublicAnnouncements({ page: 1, limit: 4 });
  const { t, dir, currentLang, isRTL } = useLanguage();

  const locale =
    currentLang === "ar" ? "ar-DZ" : currentLang === "fr" ? "fr-FR" : "en-GB";
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const formatDateShort = (date: string) =>
    new Date(date).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    });

  const getCatLabel = (cat: string) =>
    t(`announcements.categories.${cat?.toUpperCase()}`, { defaultValue: cat });

  const relatedAnnouncements =
    relatedData?.data.filter((a) => a.id !== id)?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-brand-teal-dark animate-spin" />
      </div>
    );
  }

  if (isError || !announcement) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
        dir={dir}
      >
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <span className="text-3xl">😕</span>
        </div>
        <h2
          className="text-2xl font-bold text-brand-black"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {t("announcements.notFound")}
        </h2>
        <p className="text-brand-brown">{t("announcements.notFoundDesc")}</p>
        <Button
          asChild
          className="bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white mt-2 rounded-xl"
        >
          <LocaleLink to="/announcements">
            <ArrowRight
              className={`w-4 h-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`}
            />
            {t("announcements.backToNews")}
          </LocaleLink>
        </Button>
      </div>
    );
  }

  const title =
    currentLang === "ar"
      ? announcement.title_ar || announcement.title
      : announcement.title;
  const excerpt =
    currentLang === "ar"
      ? announcement.excerpt_ar || announcement.excerpt
      : announcement.excerpt;
  const content =
    currentLang === "ar"
      ? announcement.content_ar || announcement.content
      : announcement.content;
  const categoryStyle =
    CATEGORY_COLORS[announcement.category?.toUpperCase() || ""] ||
    "bg-brand-teal-dark/10 text-brand-teal-dark border-brand-teal/20";
  const categoryLabel = getCatLabel(announcement.category || "");

  return (
    <main className="min-h-screen bg-white" dir={dir}>
      {/* Hero Image */}
      {announcement.image_url && (
        <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[480px] overflow-hidden">
          <img
            src={announcement.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {announcement.category && (
            <div className={`absolute top-6 ${isRTL ? "right-6" : "left-6"}`}>
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border backdrop-blur-sm ${categoryStyle}`}
              >
                <Tag className="w-3.5 h-3.5" />
                {categoryLabel}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <div className="mx-auto max-w-4xl">
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {title}
              </h1>
              <div className="flex items-center gap-4 mt-4 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(announcement.date)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-brand-brown py-6 border-b border-brand-beige">
          <LocaleLink
            to="/"
            className="hover:text-brand-teal-dark transition-colors"
          >
            {t("common.home")}
          </LocaleLink>
          <ChevronRight
            className={`w-3.5 h-3.5 text-brand-brown/40 ${isRTL ? "rotate-180" : ""}`}
          />
          <LocaleLink
            to="/announcements"
            className="hover:text-brand-teal-dark transition-colors"
          >
            {t("common.announcements")}
          </LocaleLink>
          <ChevronRight
            className={`w-3.5 h-3.5 text-brand-brown/40 ${isRTL ? "rotate-180" : ""}`}
          />
          <span className="text-brand-black/60 line-clamp-1 max-w-[200px]">
            {title}
          </span>
        </nav>

        {/* Title (when no image) */}
        {!announcement.image_url && (
          <div className="pt-10 pb-6">
            {announcement.category && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border mb-4 ${categoryStyle}`}
              >
                <Tag className="w-3 h-3" />
                {categoryLabel}
              </span>
            )}
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-black leading-snug"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {title}
            </h1>
            <div className="flex items-center gap-4 mt-4 text-sm text-brand-brown">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(announcement.date)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 py-4 border-b border-brand-beige">
          <Button
            variant="outline"
            size="sm"
            className="border-brand-beige text-brand-brown hover:text-brand-teal-dark hover:border-brand-teal/30 gap-2"
            onClick={() => window.print()}
          >
            <Printer className="w-3.5 h-3.5" />
            {t("common.print")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-brand-beige text-brand-brown hover:text-brand-teal-dark hover:border-brand-teal/30 gap-2"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
          >
            <Share2 className="w-3.5 h-3.5" />
            {t("common.share")}
          </Button>
        </div>

        {/* Content */}
        <article className="py-10">
          {excerpt && (
            <p
              className={`text-lg text-brand-black/70 leading-relaxed mb-8 ${isRTL ? "pr-4 border-r-4" : "pl-4 border-l-4"} border-brand-mustard`}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {excerpt}
            </p>
          )}
          {content && content.includes("<") ? (
            <div
              className="prose prose-lg max-w-none prose-headings:text-brand-black prose-headings:font-bold prose-p:text-brand-black/70 prose-p:leading-relaxed prose-a:text-brand-teal-dark prose-a:no-underline hover:prose-a:underline prose-strong:text-brand-black prose-img:rounded-2xl prose-img:shadow-md"
              style={{ fontFamily: "var(--font-sans)" }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="text-brand-black/70 leading-relaxed whitespace-pre-wrap text-lg">
              {content || t("announcements.noContent")}
            </div>
          )}
        </article>

        {/* Related */}
        {relatedAnnouncements.length > 0 && (
          <section className="py-10 border-t border-brand-beige">
            <h2
              className="text-xl font-bold text-brand-black mb-6"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {t("announcements.relatedNews")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedAnnouncements.map((item) => (
                <LocaleLink
                  key={item.id}
                  to={`/announcements/${item.id}`}
                  className="group rounded-2xl border border-brand-beige bg-brand-gray p-4 transition-all hover:shadow-md hover:border-brand-mustard/30"
                >
                  {item.image_url && (
                    <div className="w-full h-[140px] rounded-xl overflow-hidden mb-3">
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h3
                    className="text-sm font-bold text-brand-black leading-snug line-clamp-2 group-hover:text-brand-teal-dark transition-colors"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {currentLang === "ar"
                      ? item.title_ar || item.title
                      : item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-brand-brown">
                    <Calendar className="w-3 h-3" />
                    {formatDateShort(item.date)}
                  </div>
                </LocaleLink>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                asChild
                className="border-brand-beige text-brand-teal-dark hover:bg-brand-teal-dark hover:text-white hover:border-brand-teal-dark rounded-xl"
              >
                <LocaleLink to="/announcements">
                  {t("announcements.viewAll")}
                </LocaleLink>
              </Button>
            </div>
          </section>
        )}
        <div className="h-10" />
      </div>
    </main>
  );
}
