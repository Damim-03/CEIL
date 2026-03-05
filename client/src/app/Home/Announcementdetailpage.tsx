import { useParams } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Tag,
  Loader2,
  ChevronRight,
  Share2,
  Printer,
  FileText,
  Download,
  ExternalLink,
  FileImage,
  Paperclip,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  usePublicAnnouncement,
  usePublicAnnouncements,
} from "../../hooks/announce/Usepublic";
import { useLanguage } from "../../hooks/useLanguage";
import { LocaleLink } from "../../i18n/locales/components/LocaleLink";

const CATEGORY_COLORS: Record<string, string> = {
  NEWS: "bg-blue-500/10 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40",
  FORMATIONS:
    "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
  EXAMS:
    "bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
  REGISTRATION:
    "bg-purple-500/10 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/40",
  EVENTS:
    "bg-rose-500/10 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40",
};

// ─── Attachment helpers ────────────────────────────────────
function getAttachmentMeta(type: string | null | undefined) {
  switch (type) {
    case "pdf":
      return {
        icon: FileText,
        label: "PDF",
        color: "text-red-500 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-500/10",
        border: "border-red-100 dark:border-red-500/20",
        badge: "bg-red-500/10 text-red-600 dark:text-red-400",
        iconBg: "bg-red-500/15",
        iconColor: "text-red-400",
      };
    case "docx":
    case "doc":
      return {
        icon: FileText,
        label: "Word",
        color: "text-blue-500 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-500/10",
        border: "border-blue-100 dark:border-blue-500/20",
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        iconBg: "bg-blue-500/15",
        iconColor: "text-blue-400",
      };
    case "pptx":
    case "ppt":
      return {
        icon: FileText,
        label: "PowerPoint",
        color: "text-orange-500 dark:text-orange-400",
        bg: "bg-orange-50 dark:bg-orange-500/10",
        border: "border-orange-100 dark:border-orange-500/20",
        badge: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        iconBg: "bg-orange-500/15",
        iconColor: "text-orange-400",
      };
    case "image":
      return {
        icon: FileImage,
        label: "Image",
        color: "text-emerald-500 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        border: "border-emerald-100 dark:border-emerald-500/20",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        iconBg: "bg-emerald-500/15",
        iconColor: "text-emerald-400",
      };
    default:
      return {
        icon: Paperclip,
        label: "File",
        color: "text-brand-teal-dark dark:text-[#4ADE80]",
        bg: "bg-brand-teal-dark/5 dark:bg-[#4ADE80]/10",
        border: "border-brand-teal-dark/10 dark:border-[#4ADE80]/20",
        badge: "bg-brand-teal-dark/10 text-brand-teal-dark dark:text-[#4ADE80]",
        iconBg: "bg-white/10",
        iconColor: "text-white/60",
      };
  }
}

// ─── Attachment Viewer Modal ───────────────────────────────
function AttachmentViewerModal({
  url,
  name,
  type,
  onClose,
  t,
}: {
  url: string;
  name: string;
  type: string | null | undefined;
  onClose: () => void;
  t: (k: string, opts?: any) => string;
}) {
  const meta = getAttachmentMeta(type);
  const Icon = meta.icon;
  const isImage = type === "image";
  const isPdf = type === "pdf";
  const isDocument =
    type === "docx" || type === "doc" || type === "pptx" || type === "ppt";

  const [pdfImgFailed, setPdfImgFailed] = useState(false);

  // نفس نهجة AdminDocuments: Cloudinary يحوّل PDF → JPG
  const pdfAsImageUrl = url.replace("/upload/", "/upload/pg_1,f_jpg,q_auto/");
  const openUrl = isPdf ? pdfAsImageUrl : url;

  // Microsoft Office Viewer للـ Word/PPT
  const msViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-[#1C1C1E]"
        style={{ maxHeight: "92vh" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.iconBg}`}
            >
              <Icon className={`w-4 h-4 ${meta.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-tight truncate max-w-[180px] sm:max-w-[360px]">
                {name}
              </p>
              <p className="text-[11px] text-white/40 mt-0.5">{meta.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {t("common.openTab", { defaultValue: "Open in New Tab" })}
              </span>
            </a>
            <a
              href={openUrl}
              download={name}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-mustard hover:bg-brand-mustard/90 text-white transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {t("common.download", { defaultValue: "تحميل الوثيقة" })}
              </span>
            </a>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div
          className="flex-1 overflow-auto bg-white rounded-b-2xl"
          style={{ maxHeight: "calc(92vh - 76px)" }}
        >
          {/* صورة عادية */}
          {isImage && (
            <div className="flex items-center justify-center min-h-full p-4 bg-black/30">
              <img
                src={url}
                alt={name}
                className="max-w-full object-contain rounded-xl shadow-2xl"
                style={{ maxHeight: "calc(92vh - 100px)" }}
              />
            </div>
          )}

          {/* PDF — نفس نهجة AdminDocuments: Cloudinary PDF→JPG */}
          {isPdf && !pdfImgFailed && (
            <div className="w-full p-2">
              <img
                src={pdfAsImageUrl}
                alt={name}
                className="w-full object-contain mx-auto"
                onError={() => setPdfImgFailed(true)}
              />
            </div>
          )}

          {/* PDF fallback إذا فشل التحويل */}
          {isPdf && pdfImgFailed && (
            <div className="flex flex-col items-center justify-center gap-5 py-20 bg-[#1C1C1E]">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center px-4">
                <p className="text-white/80 font-medium mb-1">{name}</p>
                <p className="text-white/40 text-sm">
                  {t("common.previewUnavailable", {
                    defaultValue: "لا يمكن عرض هذا الملف في المتصفح",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("common.openTab", { defaultValue: "Open in New Tab" })}
                </a>
                <a
                  href={url}
                  download={name}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-mustard hover:bg-brand-mustard/90 text-white text-sm font-medium transition-all"
                >
                  <Download className="w-4 h-4" />
                  {t("common.download", { defaultValue: "تحميل" })}
                </a>
              </div>
            </div>
          )}

          {/* Word / PowerPoint — Microsoft Office Viewer */}
          {isDocument && (
            <iframe
              src={msViewerUrl}
              className="w-full"
              style={{ height: "calc(92vh - 76px)", border: "none" }}
              title={name}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Attachment Card ───────────────────────────────────────
function AttachmentCard({
  url,
  name,
  type,
  t,
}: {
  url: string;
  name: string | null | undefined;
  type: string | null | undefined;
  t: (k: string, opts?: any) => string;
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const meta = getAttachmentMeta(type);
  const Icon = meta.icon;
  const displayName =
    name || t("announcements.attachment", { defaultValue: "Attachment" });
  const isImage = type === "image";

  return (
    <>
      <div
        className={`rounded-2xl border ${meta.border} ${meta.bg} overflow-hidden`}
      >
        {/* Image inline preview */}
        {isImage && (
          <div
            className="w-full h-52 overflow-hidden cursor-pointer"
            onClick={() => setViewerOpen(true)}
          >
            <img
              src={url}
              alt={displayName}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-5 flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center shrink-0`}
          >
            <Icon className={`w-6 h-6 ${meta.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-brand-black dark:text-[#E5E5E5] truncate">
              {displayName}
            </p>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${meta.badge}`}
            >
              {meta.label}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setViewerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1A1A] border border-brand-beige dark:border-[#2A2A2A] text-xs font-semibold text-brand-teal-dark dark:text-[#4ADE80] hover:bg-brand-teal-dark dark:hover:bg-[#4ADE80] hover:text-white dark:hover:text-[#0F0F0F] hover:border-brand-teal-dark dark:hover:border-[#4ADE80] transition-all duration-200 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t("common.view", { defaultValue: "View" })}
            </button>
            <a
              href={url}
              download={displayName}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1A1A] border border-brand-beige dark:border-[#2A2A2A] text-xs font-semibold text-brand-brown dark:text-[#AAAAAA] hover:bg-brand-beige dark:hover:bg-[#2A2A2A] transition-all duration-200 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              {t("common.download", { defaultValue: "Download" })}
            </a>
          </div>
        </div>
      </div>

      {viewerOpen && (
        <AttachmentViewerModal
          url={url}
          name={displayName}
          type={type}
          onClose={() => setViewerOpen(false)}
          t={t}
        />
      )}
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────
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
        <Loader2 className="w-10 h-10 text-brand-teal-dark dark:text-[#4ADE80] animate-spin" />
      </div>
    );
  }

  if (isError || !announcement) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
        dir={dir}
      >
        <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <span className="text-3xl">😕</span>
        </div>
        <h2
          className="text-2xl font-bold text-brand-black dark:text-[#E5E5E5]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {t("announcements.notFound")}
        </h2>
        <p className="text-brand-brown dark:text-[#888888]">
          {t("announcements.notFoundDesc")}
        </p>
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
    "bg-brand-teal-dark/10 dark:bg-[#4ADE80]/10 text-brand-teal-dark dark:text-[#4ADE80] border-brand-teal/20 dark:border-[#4ADE80]/15";
  const categoryLabel = getCatLabel(announcement.category || "");

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]" dir={dir}>
      {/* ── Hero Image ── */}
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
        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-sm text-brand-brown dark:text-[#888888] py-6 border-b border-brand-beige dark:border-[#2A2A2A]">
          <LocaleLink
            to="/"
            className="hover:text-brand-teal-dark dark:hover:text-[#4ADE80] transition-colors"
          >
            {t("common.home")}
          </LocaleLink>
          <ChevronRight
            className={`w-3.5 h-3.5 text-brand-brown/40 dark:text-[#555555] ${isRTL ? "rotate-180" : ""}`}
          />
          <LocaleLink
            to="/announcements"
            className="hover:text-brand-teal-dark dark:hover:text-[#4ADE80] transition-colors"
          >
            {t("common.announcements")}
          </LocaleLink>
          <ChevronRight
            className={`w-3.5 h-3.5 text-brand-brown/40 dark:text-[#555555] ${isRTL ? "rotate-180" : ""}`}
          />
          <span className="text-brand-black/60 dark:text-[#AAAAAA] line-clamp-1 max-w-[200px]">
            {title}
          </span>
        </nav>

        {/* ── Title (no image) ── */}
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
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-black dark:text-[#E5E5E5] leading-snug"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {title}
            </h1>
            <div className="flex items-center gap-4 mt-4 text-sm text-brand-brown dark:text-[#888888]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(announcement.date)}
              </span>
            </div>
          </div>
        )}

        {/* ── Actions bar ── */}
        <div className="flex items-center gap-3 py-4 border-b border-brand-beige dark:border-[#2A2A2A]">
          <Button
            variant="outline"
            size="sm"
            className="border-brand-beige dark:border-[#2A2A2A] text-brand-brown dark:text-[#AAAAAA] hover:text-brand-teal-dark dark:hover:text-[#4ADE80] hover:border-brand-teal/30 dark:hover:border-[#4ADE80]/30 gap-2"
            onClick={() => window.print()}
          >
            <Printer className="w-3.5 h-3.5" />
            {t("common.print")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-brand-beige dark:border-[#2A2A2A] text-brand-brown dark:text-[#AAAAAA] hover:text-brand-teal-dark dark:hover:text-[#4ADE80] hover:border-brand-teal/30 dark:hover:border-[#4ADE80]/30 gap-2"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
          >
            <Share2 className="w-3.5 h-3.5" />
            {t("common.share")}
          </Button>
        </div>

        {/* ── Article ── */}
        <article className="py-10">
          {excerpt && (
            <p
              className={`text-lg text-brand-black/70 dark:text-[#CCCCCC] leading-relaxed mb-8 ${isRTL ? "pr-4 border-r-4" : "pl-4 border-l-4"} border-brand-mustard`}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {excerpt}
            </p>
          )}
          {content && content.includes("<") ? (
            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-brand-black dark:prose-headings:text-[#E5E5E5] prose-headings:font-bold prose-p:text-brand-black/70 dark:prose-p:text-[#CCCCCC] prose-p:leading-relaxed prose-a:text-brand-teal-dark dark:prose-a:text-[#4ADE80] prose-a:no-underline hover:prose-a:underline prose-strong:text-brand-black dark:prose-strong:text-[#E5E5E5] prose-img:rounded-2xl prose-img:shadow-md"
              style={{ fontFamily: "var(--font-sans)" }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="text-brand-black/70 dark:text-[#CCCCCC] leading-relaxed whitespace-pre-wrap text-lg">
              {content || t("announcements.noContent")}
            </div>
          )}
        </article>

        {/* ── Attachment ── */}
        {announcement.attachment_url && (
          <section className="py-8 border-t border-brand-beige dark:border-[#2A2A2A]">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-brand-teal-dark/8 dark:bg-[#4ADE80]/10 flex items-center justify-center">
                <Paperclip className="w-4 h-4 text-brand-teal-dark dark:text-[#4ADE80]" />
              </div>
              <h2
                className="text-base font-bold text-brand-black dark:text-[#E5E5E5]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {t("announcements.attachedDocument", {
                  defaultValue: "Attached Document",
                })}
              </h2>
            </div>
            <AttachmentCard
              url={announcement.attachment_url}
              name={announcement.attachment_name}
              type={announcement.attachment_type}
              t={t}
            />
          </section>
        )}

        {/* ── Related ── */}
        {relatedAnnouncements.length > 0 && (
          <section className="py-10 border-t border-brand-beige dark:border-[#2A2A2A]">
            <h2
              className="text-xl font-bold text-brand-black dark:text-[#E5E5E5] mb-6"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {t("announcements.relatedNews")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedAnnouncements.map((item) => (
                <LocaleLink
                  key={item.id}
                  to={`/announcements/${item.id}`}
                  className="group rounded-2xl border border-brand-beige dark:border-[#2A2A2A] bg-brand-gray dark:bg-[#1A1A1A] p-4 transition-all hover:shadow-md dark:hover:shadow-black/30 hover:border-brand-mustard/30 dark:hover:border-[#D4A843]/30"
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
                    className="text-sm font-bold text-brand-black dark:text-[#E5E5E5] leading-snug line-clamp-2 group-hover:text-brand-teal-dark dark:group-hover:text-[#4ADE80] transition-colors"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {currentLang === "ar"
                      ? item.title_ar || item.title
                      : item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-brand-brown dark:text-[#666666]">
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
                className="border-brand-beige dark:border-[#2A2A2A] text-brand-teal-dark dark:text-[#4ADE80] hover:bg-brand-teal-dark dark:hover:bg-[#4ADE80] hover:text-white dark:hover:text-[#0F0F0F] hover:border-brand-teal-dark dark:hover:border-[#4ADE80] rounded-xl"
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
