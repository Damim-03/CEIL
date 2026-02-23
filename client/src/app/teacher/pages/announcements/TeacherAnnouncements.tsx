import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Megaphone,
  Search,
  AlertCircle,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pin,
  Bell,
  Info,
  AlertTriangle,
  Tag,
} from "lucide-react";
import { useTeacherAnnouncements } from "../../../../hooks/teacher/Useteacher";
import { useLanguage } from "../../../../hooks/useLanguage";

/* ═══ TYPES ═══ */
interface AnnouncementData {
  announcement_id: string;
  title: string;
  content: string;
  category: string | null;
  priority: string;
  is_pinned: boolean;
  publish_date: string;
  created_at: string;
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
        border: string;
      }
    > = {
      URGENT: {
        label: t("teacher.announcements.urgent"),
        icon: AlertTriangle,
        bg: "bg-red-50 dark:bg-red-950/20",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-800/30",
      },
      HIGH: {
        label: t("teacher.announcements.high"),
        icon: Bell,
        bg: "bg-[#C4A035]/8 dark:bg-[#C4A035]/8",
        text: "text-[#C4A035] dark:text-[#C4A035]",
        border: "border-[#C4A035]/20 dark:border-[#C4A035]/20",
      },
      NORMAL: {
        label: t("teacher.announcements.normal"),
        icon: Info,
        bg: "bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5",
        text: "text-[#2B6F5E] dark:text-[#4ADE80]",
        border: "border-[#2B6F5E]/15 dark:border-[#4ADE80]/15",
      },
      LOW: {
        label: t("teacher.announcements.low"),
        icon: Info,
        bg: "bg-[#D8CDC0]/15 dark:bg-[#2A2A2A]/15",
        text: "text-[#6B5D4F] dark:text-[#AAAAAA]",
        border: "border-[#D8CDC0]/30 dark:border-[#2A2A2A]",
      },
    };
    return m[p] ?? m.NORMAL;
  };
};

const useCategoryLabel = () => {
  const { t } = useLanguage();
  return (c: string | null) => {
    if (!c) return t("teacher.announcements.catGeneral");
    const m: Record<string, string> = {
      GENERAL: t("teacher.announcements.catGeneral"),
      ACADEMIC: t("teacher.announcements.catAcademic"),
      ADMINISTRATIVE: t("teacher.announcements.catAdmin"),
      EVENT: t("teacher.announcements.catEvent"),
      EXAM: t("teacher.announcements.catExam"),
      SCHEDULE: t("teacher.announcements.catSchedule"),
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
    if (mins < 1) return t("teacher.announcements.now");
    if (mins < 60) return t("teacher.announcements.minsAgo", { count: mins });
    if (hrs < 24) return t("teacher.announcements.hrsAgo", { count: hrs });
    if (days === 1) return t("teacher.announcements.yesterday");
    if (days < 7) return t("teacher.announcements.daysAgo", { count: days });
    if (days < 30)
      return t("teacher.announcements.weeksAgo", {
        count: Math.floor(days / 7),
      });
    return new Date(d).toLocaleDateString(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };
};

/* ═══ SKELETON ═══ */
const AnnouncementsSkeleton = ({ rtl }: { rtl: boolean }) => (
  <div className="space-y-6 animate-pulse" dir={rtl ? "rtl" : "ltr"}>
    <div>
      <div className="h-7 w-36 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded-lg" />
      <div className="h-4 w-52 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded-lg mt-2" />
    </div>
    <div className="flex gap-3">
      <div className="h-11 flex-1 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A]" />
      <div className="h-11 w-36 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A]" />
    </div>
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[120px]"
      />
    ))}
  </div>
);

/* ═══ CARD ═══ */
const AnnouncementCard = ({
  announcement,
}: {
  announcement: AnnouncementData;
}) => {
  const { t, isRTL } = useLanguage();
  const getPrio = usePriorityConfig();
  const getCat = useCategoryLabel();
  const relTime = useRelativeTime();
  const ReadChev = isRTL ? ChevronLeft : ChevronRight;
  const prio = getPrio(announcement.priority);
  const PI = prio.icon;
  const isUrg =
    announcement.priority === "URGENT" || announcement.priority === "HIGH";
  const gradientDir = isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r";

  return (
    <Link
      to={`/teacher/announcements/${announcement.announcement_id}`}
      className={`block bg-white dark:bg-[#1A1A1A] rounded-2xl border hover:shadow-lg transition-all overflow-hidden group/card ${isUrg ? prio.border : "border-[#D8CDC0]/40 dark:border-[#2A2A2A] hover:border-[#D8CDC0]/60 dark:border-[#2A2A2A]"}`}
    >
      {announcement.priority === "URGENT" && (
        <div
          className={`h-1 ${gradientDir} from-red-500 via-red-400 to-transparent`}
        />
      )}
      {announcement.priority === "HIGH" && (
        <div
          className={`h-1 ${gradientDir} from-[#C4A035] dark:from-[#C4A035] via-[#C4A035]/50 to-transparent`}
        />
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          {announcement.is_pinned && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C4A035] dark:text-[#C4A035] dark:text-[#C4A035] bg-[#C4A035]/1 dark:bg-[#C4A035]/10 dark:bg-[#C4A035]/15 dark:bg-[#C4A035]/15 px-2 py-0.5 rounded-full">
              <Pin className="w-2.5 h-2.5" />
              {t("teacher.announcements.pinned")}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${prio.bg} ${prio.text}`}
          >
            <PI className="w-2.5 h-2.5" />
            {prio.label}
          </span>
          {announcement.category && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 px-2 py-0.5 rounded-full">
              <Tag className="w-2.5 h-2.5" />
              {getCat(announcement.category)}
            </span>
          )}
          <span className="text-[10px] text-[#BEB29E] dark:text-[#888888] ms-auto flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {relTime(announcement.publish_date || announcement.created_at)}
          </span>
        </div>
        <h3 className="text-[15px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5] group-hover/card:text-[#2B6F5E] dark:text-[#4ADE80] transition-colors mb-1.5 line-clamp-1">
          {announcement.title}
        </h3>
        {announcement.content && (
          <p className="text-sm text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] line-clamp-2 leading-relaxed">
            {announcement.content.replace(/<[^>]*>/g, "")}
          </p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#D8CDC0]/10 dark:border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            {announcement.author ? (
              <>
                {announcement.author.avatar_url ? (
                  <img
                    src={announcement.author.avatar_url}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/10 dark:bg-[#4ADE80]/10 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
                      {announcement.author.first_name?.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-[11px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
                  {announcement.author.first_name}{" "}
                  {announcement.author.last_name}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-[#BEB29E] dark:text-[#888888]">
                {t("teacher.announcements.admin")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#2B6F5E]/5 dark:text-[#4ADE80]/50 dark:text-[#4ADE80]/50 group-hover/card:text-[#2B6F5E] dark:text-[#4ADE80] transition-colors">
            {t("teacher.announcements.readMore")}
            <ReadChev
              className={`w-3.5 h-3.5 ${isRTL ? "group-hover/card:translate-x-0.5" : "group-hover/card:-translate-x-0.5"} transition-transform`}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ═══ MAIN ═══ */
export default function TeacherAnnouncements() {
  const { t, dir, isRTL } = useLanguage();
  const getCat = useCategoryLabel();
  const { data, isLoading, isError } = useTeacherAnnouncements();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const announcements: AnnouncementData[] = Array.isArray(data)
    ? data
    : (data?.announcements ?? data?.data ?? []);
  const categories = useMemo(() => {
    const s = new Set<string>();
    announcements.forEach((a) => {
      if (a.category) s.add(a.category);
    });
    return Array.from(s);
  }, [announcements]);
  const filtered = useMemo(() => {
    let r = announcements;
    if (categoryFilter !== "all")
      r = r.filter((a) => a.category === categoryFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.content?.toLowerCase().includes(q),
      );
    }
    r.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return (
        new Date(b.publish_date || b.created_at).getTime() -
        new Date(a.publish_date || a.created_at).getTime()
      );
    });
    return r;
  }, [announcements, search, categoryFilter]);
  const hasFilters = search.trim() !== "" || categoryFilter !== "all";
  const stats = useMemo(
    () => ({
      total: announcements.length,
      pinned: announcements.filter((a) => a.is_pinned).length,
      urgent: announcements.filter(
        (a) => a.priority === "URGENT" || a.priority === "HIGH",
      ).length,
    }),
    [announcements],
  );

  if (isLoading) return <AnnouncementsSkeleton rtl={isRTL} />;
  if (isError)
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
          {t("teacher.announcements.errorTitle")}
        </h3>
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {t("teacher.announcements.errorDesc")}
        </p>
      </div>
    );

  return (
    <div dir={dir} className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("teacher.announcements.title")}
          </h1>
          <p className="text-sm text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] mt-0.5">
            {t("teacher.announcements.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
          {stats.pinned > 0 && (
            <span className="flex items-center gap-1">
              <Pin className="w-3 h-3 text-[#C4A035] dark:text-[#C4A035]" />
              {stats.pinned} {t("teacher.announcements.pinned")}
            </span>
          )}
          {stats.urgent > 0 && (
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              {stats.urgent} {t("teacher.announcements.important")}
            </span>
          )}
          <span>
            {stats.total} {t("teacher.announcements.announcement")}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
          />
          <input
            type="text"
            placeholder={t("teacher.announcements.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full h-11 ${isRTL ? "pr-10 pl-9" : "pl-10 pr-9"} bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] placeholder:text-[#BEB29E] dark:text-[#888888] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10 transition-all`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 hover:bg-[#D8CDC0]/5 dark:hover:bg-[#222222]0 dark:bg-[#2A2A2A]/50 flex items-center justify-center transition-colors`}
            >
              <X className="w-3 h-3 text-[#6B5D4F] dark:text-[#AAAAAA]" />
            </button>
          )}
        </div>
        {categories.length > 0 && (
          <div className="relative shrink-0">
            <Filter
              className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`h-11 ${isRTL ? "pr-10 pl-8" : "pl-10 pr-8"} bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10 appearance-none cursor-pointer transition-all min-w-[140px]`}
            >
              <option value="all">
                {t("teacher.announcements.allCategories")}
              </option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {getCat(c)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {hasFilters && (
        <div className="flex items-center justify-between bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border border-[#2B6F5E]/1 dark:border-[#4ADE80]/10 dark:border-[#4ADE80]/10 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
              {t("teacher.announcements.results")}:
            </span>
            <span className="font-semibold text-[#2B6F5E] dark:text-[#4ADE80]">
              {filtered.length}
            </span>
            {search.trim() && (
              <span className="text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
                · &quot;{search}&quot;
              </span>
            )}
            {categoryFilter !== "all" && (
              <span className="text-[10px] font-medium text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 px-2 py-0.5 rounded-full">
                {getCat(categoryFilter)}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setSearch("");
              setCategoryFilter("all");
            }}
            className="text-xs font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:text-[#2B6F5E] dark:hover:text-[#4ADE80]/70 dark:text-[#4ADE80]/70 flex items-center gap-1 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            {t("teacher.announcements.clear")}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center mb-4">
            <Megaphone className="w-7 h-7 text-[#BEB29E] dark:text-[#888888]" />
          </div>
          <h3 className="text-base font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
            {announcements.length === 0
              ? t("teacher.announcements.noAnnouncements")
              : t("teacher.announcements.noMatchResults")}
          </h3>
          <p className="text-sm text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] max-w-xs">
            {announcements.length === 0
              ? t("teacher.announcements.noAnnouncementsDesc")
              : t("teacher.announcements.noMatchDesc")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <AnnouncementCard key={a.announcement_id} announcement={a} />
          ))}
        </div>
      )}
    </div>
  );
}
