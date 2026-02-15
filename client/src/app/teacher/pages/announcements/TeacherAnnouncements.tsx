import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Megaphone,
  Search,
  AlertCircle,
  Filter,
  X,
  ChevronLeft,
  Clock,
  Pin,
  Bell,
  Info,
  AlertTriangle,
  Tag,
} from "lucide-react";
import { useTeacherAnnouncements } from "../../../../hooks/teacher/Useteacher";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-DZ", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const formatFullDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const getRelativeTime = (d: string) => {
  const now = new Date();
  const date = new Date(d);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return "أمس";
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
  return formatDate(d);
};

const PRIORITY_CONFIG: Record<
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
    label: "عاجل",
    icon: AlertTriangle,
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
  },
  HIGH: {
    label: "مهم",
    icon: Bell,
    bg: "bg-[#C4A035]/8",
    text: "text-[#C4A035]",
    border: "border-[#C4A035]/20",
  },
  NORMAL: {
    label: "عادي",
    icon: Info,
    bg: "bg-[#2B6F5E]/5",
    text: "text-[#2B6F5E]",
    border: "border-[#2B6F5E]/15",
  },
  LOW: {
    label: "منخفض",
    icon: Info,
    bg: "bg-[#D8CDC0]/15",
    text: "text-[#6B5D4F]",
    border: "border-[#D8CDC0]/30",
  },
};

const getPriorityConfig = (priority: string) =>
  PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.NORMAL;

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: "عام",
  ACADEMIC: "أكاديمي",
  ADMINISTRATIVE: "إداري",
  EVENT: "فعالية",
  EXAM: "امتحانات",
  SCHEDULE: "جدول زمني",
};

const getCategoryLabel = (cat: string | null) =>
  cat ? CATEGORY_LABELS[cat] || cat : "عام";

/* ═══════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════ */

const AnnouncementsSkeleton = () => (
  <div className="space-y-6 animate-pulse" dir="rtl">
    <div>
      <div className="h-7 w-36 bg-[#D8CDC0]/30 rounded-lg" />
      <div className="h-4 w-52 bg-[#D8CDC0]/20 rounded-lg mt-2" />
    </div>
    <div className="flex gap-3">
      <div className="h-11 flex-1 bg-white rounded-xl border border-[#D8CDC0]/40" />
      <div className="h-11 w-36 bg-white rounded-xl border border-[#D8CDC0]/40" />
    </div>
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl border border-[#D8CDC0]/40 h-[120px]"
      />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   ANNOUNCEMENT CARD
═══════════════════════════════════════════════════════════ */

const AnnouncementCard = ({
  announcement,
}: {
  announcement: AnnouncementData;
}) => {
  const priority = getPriorityConfig(announcement.priority);
  const PriorityIcon = priority.icon;
  const isUrgent =
    announcement.priority === "URGENT" || announcement.priority === "HIGH";

  return (
    <Link
      to={`/teacher/announcements/${announcement.announcement_id}`}
      className={`block bg-white rounded-2xl border hover:shadow-lg transition-all overflow-hidden group/card ${
        isUrgent
          ? priority.border
          : "border-[#D8CDC0]/40 hover:border-[#D8CDC0]/60"
      }`}
    >
      {/* Urgent accent */}
      {announcement.priority === "URGENT" && (
        <div className="h-1 bg-gradient-to-l from-red-500 via-red-400 to-transparent" />
      )}
      {announcement.priority === "HIGH" && (
        <div className="h-1 bg-gradient-to-l from-[#C4A035] via-[#C4A035]/50 to-transparent" />
      )}

      <div className="p-5">
        {/* Top row: badges */}
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          {announcement.is_pinned && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C4A035] bg-[#C4A035]/10 px-2 py-0.5 rounded-full">
              <Pin className="w-2.5 h-2.5" />
              مثبّت
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${priority.bg} ${priority.text}`}
          >
            <PriorityIcon className="w-2.5 h-2.5" />
            {priority.label}
          </span>
          {announcement.category && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#6B5D4F]/60 bg-[#D8CDC0]/15 px-2 py-0.5 rounded-full">
              <Tag className="w-2.5 h-2.5" />
              {getCategoryLabel(announcement.category)}
            </span>
          )}
          <span className="text-[10px] text-[#BEB29E] mr-auto flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {getRelativeTime(
              announcement.publish_date || announcement.created_at,
            )}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-[#1B1B1B] group-hover/card:text-[#2B6F5E] transition-colors mb-1.5 line-clamp-1">
          {announcement.title}
        </h3>

        {/* Content preview */}
        {announcement.content && (
          <p className="text-sm text-[#6B5D4F]/60 line-clamp-2 leading-relaxed">
            {announcement.content.replace(/<[^>]*>/g, "")}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#D8CDC0]/10">
          {/* Author */}
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
                  <div className="w-5 h-5 rounded-full bg-[#2B6F5E]/10 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-[#2B6F5E]">
                      {announcement.author.first_name?.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-[11px] text-[#6B5D4F]/50">
                  {announcement.author.first_name}{" "}
                  {announcement.author.last_name}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-[#BEB29E]">الإدارة</span>
            )}
          </div>

          {/* Read more */}
          <div className="flex items-center gap-1 text-[11px] text-[#2B6F5E]/50 group-hover/card:text-[#2B6F5E] transition-colors">
            قراءة المزيد
            <ChevronLeft className="w-3.5 h-3.5 group-hover/card:-translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

export default function TeacherAnnouncements() {
  const { data, isLoading, isError } = useTeacherAnnouncements();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const rawAnnouncements = Array.isArray(data)
    ? data
    : (data?.announcements ?? data?.data ?? []);

  const announcements: AnnouncementData[] = rawAnnouncements;

  /* ── Unique categories ── */
  const categories = useMemo(() => {
    const cats = new Set<string>();
    announcements.forEach((a) => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [announcements]);

  /* ── Filter ── */
  const filtered = useMemo(() => {
    let result = announcements;

    if (categoryFilter !== "all") {
      result = result.filter((a) => a.category === categoryFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.content?.toLowerCase().includes(q),
      );
    }

    // Pinned first, then by date
    result.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return (
        new Date(b.publish_date || b.created_at).getTime() -
        new Date(a.publish_date || a.created_at).getTime()
      );
    });

    return result;
  }, [announcements, search, categoryFilter]);

  const hasFilters = search.trim() !== "" || categoryFilter !== "all";

  /* ── Stats ── */
  const stats = useMemo(() => {
    const pinned = announcements.filter((a) => a.is_pinned).length;
    const urgent = announcements.filter(
      (a) => a.priority === "URGENT" || a.priority === "HIGH",
    ).length;
    return { total: announcements.length, pinned, urgent };
  }, [announcements]);

  if (isLoading) return <AnnouncementsSkeleton />;

  if (isError) {
    return (
      <div
        dir="rtl"
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">
          تعذّر تحميل الإعلانات
        </h3>
        <p className="text-sm text-[#6B5D4F]/70">يرجى المحاولة لاحقاً</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6 pb-8">
      {/* ══════════════════════════════════════════
         HEADER
      ══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B]">الإعلانات</h1>
          <p className="text-sm text-[#6B5D4F]/70 mt-0.5">
            آخر الإعلانات والتحديثات من الإدارة
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#6B5D4F]/50">
          {stats.pinned > 0 && (
            <span className="flex items-center gap-1">
              <Pin className="w-3 h-3 text-[#C4A035]" />
              {stats.pinned} مثبّت
            </span>
          )}
          {stats.urgent > 0 && (
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              {stats.urgent} مهم
            </span>
          )}
          <span>{stats.total} إعلان</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════
         SEARCH + FILTER
      ══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث في الإعلانات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pr-10 pl-9 bg-white border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] placeholder:text-[#BEB29E] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#D8CDC0]/30 hover:bg-[#D8CDC0]/50 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-[#6B5D4F]" />
            </button>
          )}
        </div>

        {categories.length > 0 && (
          <div className="relative shrink-0">
            <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-11 pr-10 pl-8 bg-white border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10 appearance-none cursor-pointer transition-all min-w-[140px]"
            >
              <option value="all">جميع التصنيفات</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {getCategoryLabel(c)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Filter bar */}
      {hasFilters && (
        <div className="flex items-center justify-between bg-[#2B6F5E]/5 border border-[#2B6F5E]/10 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-[#6B5D4F]/70">النتائج:</span>
            <span className="font-semibold text-[#2B6F5E]">
              {filtered.length}
            </span>
            {search.trim() && (
              <span className="text-[#6B5D4F]/50">· &quot;{search}&quot;</span>
            )}
            {categoryFilter !== "all" && (
              <span className="text-[10px] font-medium text-[#6B5D4F]/60 bg-[#D8CDC0]/15 px-2 py-0.5 rounded-full">
                {getCategoryLabel(categoryFilter)}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setSearch("");
              setCategoryFilter("all");
            }}
            className="text-xs font-medium text-[#2B6F5E] hover:text-[#2B6F5E]/70 flex items-center gap-1 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            مسح
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════
         ANNOUNCEMENTS LIST
      ══════════════════════════════════════════ */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/15 flex items-center justify-center mb-4">
            <Megaphone className="w-7 h-7 text-[#BEB29E]" />
          </div>
          <h3 className="text-base font-semibold text-[#1B1B1B] mb-1">
            {announcements.length === 0
              ? "لا توجد إعلانات"
              : "لا توجد نتائج مطابقة"}
          </h3>
          <p className="text-sm text-[#6B5D4F]/60 max-w-xs">
            {announcements.length === 0
              ? "ستظهر الإعلانات هنا بمجرد نشرها من قبل الإدارة"
              : "جرّب تغيير البحث أو التصنيف"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((announcement) => (
            <AnnouncementCard
              key={announcement.announcement_id}
              announcement={announcement}
            />
          ))}
        </div>
      )}
    </div>
  );
}
