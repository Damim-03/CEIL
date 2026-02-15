import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  AlertCircle,
  Clock,
  Pin,
  Bell,
  Info,
  AlertTriangle,
  Tag,
  CalendarDays,
  ArrowRight,
  User,
} from "lucide-react";
import { useTeacherAnnouncementById } from "../../../../hooks/teacher/Useteacher";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

const formatFullDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" });

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
  return formatFullDate(d);
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; bg: string; text: string; accent: string }
> = {
  URGENT: { label: "عاجل", icon: AlertTriangle, bg: "bg-red-50", text: "text-red-600", accent: "from-red-500 via-red-400 to-transparent" },
  HIGH: { label: "مهم", icon: Bell, bg: "bg-[#C4A035]/8", text: "text-[#C4A035]", accent: "from-[#C4A035] via-[#C4A035]/50 to-transparent" },
  NORMAL: { label: "عادي", icon: Info, bg: "bg-[#2B6F5E]/5", text: "text-[#2B6F5E]", accent: "from-[#2B6F5E] via-[#2B6F5E]/50 to-transparent" },
  LOW: { label: "منخفض", icon: Info, bg: "bg-[#D8CDC0]/15", text: "text-[#6B5D4F]", accent: "from-[#BEB29E] via-[#BEB29E]/50 to-transparent" },
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

const DetailSkeleton = () => (
  <div className="space-y-6 animate-pulse" dir="rtl">
    <div className="flex items-center gap-2">
      <div className="h-5 w-20 bg-[#D8CDC0]/30 rounded" />
      <div className="h-5 w-5 bg-[#D8CDC0]/20 rounded" />
      <div className="h-5 w-40 bg-[#D8CDC0]/30 rounded" />
    </div>
    <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 h-[500px]" />
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

export default function TeacherAnnouncementDetail() {
  const { announcementId } = useParams<{ announcementId: string }>();
  const { data, isLoading, isError } = useTeacherAnnouncementById(announcementId!);

  if (isLoading) return <DetailSkeleton />;

  const announcement: AnnouncementDetail | undefined = data?.announcement ?? data;

  if (isError || !announcement) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">تعذّر تحميل الإعلان</h3>
        <p className="text-sm text-[#6B5D4F]/70">قد يكون الإعلان غير موجود أو حدث خطأ</p>
        <Link to="/teacher/announcements" className="mt-4 text-sm font-medium text-[#2B6F5E] hover:underline">
          العودة للإعلانات
        </Link>
      </div>
    );
  }

  const priority = getPriorityConfig(announcement.priority);
  const PriorityIcon = priority.icon;
  const publishDate = announcement.publish_date || announcement.created_at;

  return (
    <div dir="rtl" className="space-y-6 pb-8 max-w-3xl mx-auto">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-sm text-[#6B5D4F]/60">
        <Link to="/teacher/announcements" className="hover:text-[#2B6F5E] transition-colors">
          الإعلانات
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-[#1B1B1B] font-medium truncate max-w-[250px]">
          {announcement.title}
        </span>
      </nav>

      {/* ══════════════════════════════════════════
         ANNOUNCEMENT CARD
      ══════════════════════════════════════════ */}
      <article className="bg-white rounded-2xl border border-[#D8CDC0]/40 overflow-hidden">
        {/* Accent bar */}
        <div className={`h-1.5 bg-gradient-to-l ${priority.accent}`} />

        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-[#D8CDC0]/15">
          {/* Badges row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {announcement.is_pinned && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C4A035] bg-[#C4A035]/10 px-2.5 py-1 rounded-full">
                <Pin className="w-3 h-3" />
                مثبّت
              </span>
            )}
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${priority.bg} ${priority.text}`}>
              <PriorityIcon className="w-3 h-3" />
              {priority.label}
            </span>
            {announcement.category && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6B5D4F]/60 bg-[#D8CDC0]/15 px-2.5 py-1 rounded-full">
                <Tag className="w-3 h-3" />
                {getCategoryLabel(announcement.category)}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-[#1B1B1B] leading-snug mb-4">
            {announcement.title}
          </h1>

          {/* Meta row */}
          <div className="flex items-center gap-4 flex-wrap text-sm text-[#6B5D4F]/60">
            {/* Author */}
            <div className="flex items-center gap-2">
              {announcement.author ? (
                <>
                  {announcement.author.avatar_url ? (
                    <img
                      src={announcement.author.avatar_url}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover border border-[#D8CDC0]/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#2B6F5E]/10 border border-[#D8CDC0]/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#2B6F5E]">
                        {announcement.author.first_name?.charAt(0)}{announcement.author.last_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="font-medium text-[#1B1B1B]">
                    {announcement.author.first_name} {announcement.author.last_name}
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#BEB29E]" />
                  <span className="font-medium text-[#1B1B1B]">الإدارة</span>
                </span>
              )}
            </div>

            <span className="w-px h-4 bg-[#D8CDC0]/30" />

            {/* Date */}
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-[#BEB29E]" />
              {formatFullDate(publishDate)}
            </span>

            <span className="w-px h-4 bg-[#D8CDC0]/30" />

            {/* Time */}
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#BEB29E]" />
              {formatTime(publishDate)}
            </span>

            {/* Relative */}
            <span className="text-[11px] text-[#BEB29E] mr-auto">
              {getRelativeTime(publishDate)}
            </span>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="px-6 py-6">
          {announcement.content ? (
            <div
              className="prose prose-sm max-w-none text-[#1B1B1B]/80 leading-relaxed
                prose-headings:text-[#1B1B1B] prose-headings:font-bold
                prose-p:mb-4 prose-p:leading-relaxed
                prose-a:text-[#2B6F5E] prose-a:underline prose-a:underline-offset-2
                prose-strong:text-[#1B1B1B] prose-strong:font-semibold
                prose-ul:pr-5 prose-ol:pr-5
                prose-li:mb-1
                prose-blockquote:border-r-4 prose-blockquote:border-[#2B6F5E]/30 prose-blockquote:pr-4 prose-blockquote:text-[#6B5D4F]/70
                [direction:rtl]"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />
          ) : (
            <p className="text-sm text-[#6B5D4F]/50 text-center py-8">
              لا يوجد محتوى لهذا الإعلان
            </p>
          )}
        </div>

        {/* ── Footer ── */}
        {announcement.updated_at && announcement.updated_at !== announcement.created_at && (
          <div className="px-6 py-3 border-t border-[#D8CDC0]/10 bg-[#FAFAF8]/50">
            <span className="text-[11px] text-[#BEB29E] flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              آخر تحديث: {formatFullDate(announcement.updated_at)} — {formatTime(announcement.updated_at)}
            </span>
          </div>
        )}
      </article>

      {/* ── Back link ── */}
      <Link
        to="/teacher/announcements"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#2B6F5E] hover:text-[#2B6F5E]/70 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        العودة لقائمة الإعلانات
      </Link>
    </div>
  );
}