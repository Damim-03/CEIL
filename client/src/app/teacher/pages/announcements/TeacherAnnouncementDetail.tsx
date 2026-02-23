import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Clock,
  Pin,
  Bell,
  Info,
  AlertTriangle,
  Tag,
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  User,
} from "lucide-react";
import { useTeacherAnnouncementById } from "../../../../hooks/teacher/Useteacher";
import { useLanguage } from "../../../../hooks/useLanguage";

/* ═══ TYPES ═══ */
interface AnnouncementDetail {
  announcement_id: string;
  title: string;
  content: string | null;
  category: string | null;
  priority: string;
  is_pinned: boolean;
  publish_date: string;
  created_at: string;
  updated_at: string;
  author: {
    user_id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
}

/* ═══ HELPERS ═══ */
const getLocale = (lang: string) =>
  lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US";

const usePriorityConfig = () => {
  const { t } = useLanguage();
  return (p: string) => {
    const m: Record<
      string,
      {
        label: string;
        icon: React.ElementType;
        bg: string;
        text: string;
        accent: string;
      }
    > = {
      URGENT: {
        label: t("teacher.announcementDetail.urgent"),
        icon: AlertTriangle,
        bg: "bg-red-50 dark:bg-red-950/20",
        text: "text-red-600 dark:text-red-400",
        accent: "from-red-500 via-red-400 to-transparent",
      },
      HIGH: {
        label: t("teacher.announcementDetail.high"),
        icon: Bell,
        bg: "bg-[#C4A035]/8 dark:bg-[#C4A035]/8",
        text: "text-[#C4A035] dark:text-[#C4A035]",
        accent: "from-[#C4A035] via-[#C4A035]/50 to-transparent",
      },
      NORMAL: {
        label: t("teacher.announcementDetail.normal"),
        icon: Info,
        bg: "bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5",
        text: "text-[#2B6F5E] dark:text-[#4ADE80]",
        accent:
          "from-[#2B6F5E] dark:from-[#4ADE80] via-[#2B6F5E]/50 to-transparent",
      },
      LOW: {
        label: t("teacher.announcementDetail.low"),
        icon: Info,
        bg: "bg-[#D8CDC0]/15 dark:bg-[#2A2A2A]/15",
        text: "text-[#6B5D4F] dark:text-[#AAAAAA]",
        accent:
          "from-[#BEB29E] dark:from-[#888888] via-[#BEB29E]/50 to-transparent",
      },
    };
    return m[p] ?? m.NORMAL;
  };
};
const useCategoryLabel = () => {
  const { t } = useLanguage();
  return (c: string | null) => {
    if (!c) return t("teacher.announcementDetail.catGeneral");
    const m: Record<string, string> = {
      GENERAL: t("teacher.announcementDetail.catGeneral"),
      ACADEMIC: t("teacher.announcementDetail.catAcademic"),
      ADMINISTRATIVE: t("teacher.announcementDetail.catAdmin"),
      EVENT: t("teacher.announcementDetail.catEvent"),
      EXAM: t("teacher.announcementDetail.catExam"),
      SCHEDULE: t("teacher.announcementDetail.catSchedule"),
    };
    return m[c] || c;
  };
};
const useRelativeTime = () => {
  const { t, currentLang } = useLanguage();
  const locale = getLocale(currentLang);
  return (d: string) => {
    const ms = Date.now() - new Date(d).getTime();
    const mins = Math.floor(ms / 60000),
      hrs = Math.floor(mins / 60),
      days = Math.floor(hrs / 24);
    if (mins < 1) return t("teacher.announcementDetail.now");
    if (mins < 60)
      return t("teacher.announcementDetail.minsAgo", { count: mins });
    if (hrs < 24) return t("teacher.announcementDetail.hrsAgo", { count: hrs });
    if (days === 1) return t("teacher.announcementDetail.yesterday");
    if (days < 7)
      return t("teacher.announcementDetail.daysAgo", { count: days });
    return new Date(d).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
};

/* ═══ SKELETON ═══ */
const DetailSkeleton = ({ rtl }: { rtl: boolean }) => (
  <div className="space-y-6 animate-pulse" dir={rtl ? "rtl" : "ltr"}>
    <div className="flex items-center gap-2">
      <div className="h-5 w-20 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded" />
      <div className="h-5 w-5 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded" />
      <div className="h-5 w-40 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded" />
    </div>
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[500px]" />
  </div>
);

/* ═══ MAIN ═══ */
export default function TeacherAnnouncementDetail() {
  const { announcementId } = useParams<{ announcementId: string }>();
  const { t, dir, isRTL, currentLang } = useLanguage();
  const locale = getLocale(currentLang);
  const getPrio = usePriorityConfig();
  const getCat = useCategoryLabel();
  const relTime = useRelativeTime();
  const BreadChev = isRTL ? ChevronLeft : ChevronRight;
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const { data, isLoading, isError } = useTeacherAnnouncementById(
    announcementId!,
  );

  if (isLoading) return <DetailSkeleton rtl={isRTL} />;
  const announcement: AnnouncementDetail | undefined =
    data?.announcement ?? data;

  if (isError || !announcement)
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
          {t("teacher.announcementDetail.errorTitle")}
        </h3>
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {t("teacher.announcementDetail.errorDesc")}
        </p>
        <Link
          to="/teacher/announcements"
          className="mt-4 text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:underline"
        >
          {t("teacher.announcementDetail.backToList")}
        </Link>
      </div>
    );

  const prio = getPrio(announcement.priority);
  const PI = prio.icon;
  const pubDate = announcement.publish_date || announcement.created_at;
  const fFull = (d: string) =>
    new Date(d).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  const fTime = (d: string) =>
    new Date(d).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  const gradientDir = isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r";

  return (
    <div dir={dir} className="space-y-6 pb-8 max-w-3xl mx-auto">
      <nav className="flex items-center gap-1.5 text-sm text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
        <Link
          to="/teacher/announcements"
          className="hover:text-[#2B6F5E] dark:text-[#4ADE80] transition-colors"
        >
          {t("teacher.announcementDetail.announcements")}
        </Link>
        <BreadChev className="w-3.5 h-3.5" />
        <span className="text-[#1B1B1B] dark:text-[#E5E5E5] font-medium truncate max-w-[250px]">
          {announcement.title}
        </span>
      </nav>

      <article className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
        <div className={`h-1.5 ${gradientDir} ${prio.accent}`} />
        <div className="px-6 pt-6 pb-4 border-b border-[#D8CDC0]/15 dark:border-[#2A2A2A]">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {announcement.is_pinned && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C4A035] dark:text-[#C4A035] dark:text-[#C4A035] bg-[#C4A035]/1 dark:bg-[#C4A035]/10 dark:bg-[#C4A035]/15 dark:bg-[#C4A035]/15 px-2.5 py-1 rounded-full">
                <Pin className="w-3 h-3" />
                {t("teacher.announcementDetail.pinned")}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${prio.bg} ${prio.text}`}
            >
              <PI className="w-3 h-3" />
              {prio.label}
            </span>
            {announcement.category && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 px-2.5 py-1 rounded-full">
                <Tag className="w-3 h-3" />
                {getCat(announcement.category)}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5] leading-snug mb-4">
            {announcement.title}
          </h1>
          <div className="flex items-center gap-4 flex-wrap text-sm text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
            <div className="flex items-center gap-2">
              {announcement.author ? (
                <>
                  {announcement.author.avatar_url ? (
                    <img
                      src={announcement.author.avatar_url}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover border border-[#D8CDC0]/30 dark:border-[#2A2A2A]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/10 dark:bg-[#4ADE80]/10 border border-[#D8CDC0]/3 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/80 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
                        {announcement.author.first_name?.charAt(0)}
                        {announcement.author.last_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {announcement.author.first_name}{" "}
                    {announcement.author.last_name}
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#BEB29E] dark:text-[#888888]" />
                  <span className="font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {t("teacher.announcementDetail.admin")}
                  </span>
                </span>
              )}
            </div>
            <span className="w-px h-4 bg-[#D8CDC0]/30 dark:bg-[#2A2A2A]/30" />
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-[#BEB29E] dark:text-[#888888]" />
              {fFull(pubDate)}
            </span>
            <span className="w-px h-4 bg-[#D8CDC0]/30 dark:bg-[#2A2A2A]/30" />
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#BEB29E] dark:text-[#888888]" />
              {fTime(pubDate)}
            </span>
            <span className="text-[11px] text-[#BEB29E] dark:text-[#888888] ms-auto">
              {relTime(pubDate)}
            </span>
          </div>
        </div>
        <div className="px-6 py-6">
          {announcement.content ? (
            <div
              className={`prose prose-sm max-w-none text-[#1B1B1B] dark:text-[#E5E5E5]/80 leading-relaxed prose-headings:text-[#1B1B1B] dark:text-[#E5E5E5] prose-headings:font-bold prose-p:mb-4 prose-a:text-[#2B6F5E] dark:text-[#4ADE80] prose-a:underline prose-strong:text-[#1B1B1B] dark:text-[#E5E5E5] ${isRTL ? "prose-blockquote:border-r-4 prose-blockquote:pr-4 prose-ul:pr-5 prose-ol:pr-5" : "prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-ul:pl-5 prose-ol:pl-5"} prose-blockquote:border-[#2B6F5E]/30 dark:border-[#4ADE80]/30 prose-blockquote:text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70 [direction:${isRTL ? "rtl" : "ltr"}]`}
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />
          ) : (
            <p className="text-sm text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] text-center py-8">
              {t("teacher.announcementDetail.noContent")}
            </p>
          )}
        </div>
        {announcement.updated_at &&
          announcement.updated_at !== announcement.created_at && (
            <div className="px-6 py-3 border-t border-[#D8CDC0]/1 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/40 bg-[#FAFAF8]/50 dark:bg-[#1A1A1A]/50">
              <span className="text-[11px] text-[#BEB29E] dark:text-[#888888] flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {t("teacher.announcementDetail.lastUpdate")}:{" "}
                {fFull(announcement.updated_at)} —{" "}
                {fTime(announcement.updated_at)}
              </span>
            </div>
          )}
      </article>
      <Link
        to="/teacher/announcements"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:text-[#2B6F5E] dark:hover:text-[#4ADE80]/70 dark:text-[#4ADE80]/70 transition-colors"
      >
        <BackArrow className="w-4 h-4" />
        {t("teacher.announcementDetail.backToList")}
      </Link>
    </div>
  );
}
