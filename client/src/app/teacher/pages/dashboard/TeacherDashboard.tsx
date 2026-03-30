import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  BarChart3,
  AlertCircle,
  Layers,
  DoorOpen,
} from "lucide-react";
import { useTeacherDashboard } from "../../../../hooks/teacher/Useteacher";
import { useLanguage } from "../../../../hooks/useLanguage";

/* ═══ TYPES ═══ */
interface DashboardStats {
  total_groups: number;
  total_students: number;
  total_sessions: number;
  attendance_rate: number;
}
interface DashboardGroup {
  group_id: string;
  name: string;
  level: string;
  status: string;
  course_name: string;
  department_name: string | null;
  student_count: number;
  session_count: number;
}
interface DashboardSession {
  session_id: string;
  session_date: string;
  end_time: string | null;
  topic: string | null;
  group: { group_id: string; name: string; course: { course_name: string } };
  room?: { room_id: string; name: string } | null;
  _count: { attendance: number };
}
interface DashboardExam {
  exam_id: string;
  exam_name: string | null;
  exam_date: string;
  max_marks: number;
  course: { course_name: string };
}
interface DashboardData {
  teacher: { teacher_id: string; first_name: string; last_name: string };
  stats: DashboardStats;
  groups: DashboardGroup[];
  upcoming_sessions: DashboardSession[];
  recent_sessions: DashboardSession[];
  upcoming_exams: DashboardExam[];
  live_session: DashboardSession | null;
}

/* ═══ HELPERS ═══ */
const getLocale = (lang: string) =>
  lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US";

const fmtDate = (d: string, lang: string) =>
  new Date(d).toLocaleDateString(getLocale(lang), {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const fmtTime = (d: string, lang: string) =>
  new Date(d).toLocaleTimeString(getLocale(lang), {
    hour: "2-digit",
    minute: "2-digit",
  });

const relTime = (d: string, t: (k: string, o?: any) => string) => {
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  if (diff === 0) return t("teacher.dashboard.today");
  if (diff === 1) return t("teacher.dashboard.tomorrow");
  if (diff === -1) return t("teacher.dashboard.yesterday");
  if (diff > 0 && diff <= 7)
    return t("teacher.dashboard.inDays", { count: diff });
  if (diff < 0 && diff >= -7)
    return t("teacher.dashboard.daysAgo", { count: Math.abs(diff) });
  return fmtDate(d, "en");
};

const isLive = (s: { session_date: string; end_time: string | null }) => {
  const now = Date.now(),
    start = new Date(s.session_date).getTime();
  return (
    now >= start &&
    now <= (s.end_time ? new Date(s.end_time).getTime() : start + 5400000)
  );
};

// ✅ هل الحصة في نفس اليوم الحالي؟
const isToday = (dateStr: string) => {
  const d = new Date(dateStr),
    now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const remaining = (
  end: string | null,
  start: string,
  t: (k: string, o?: any) => string,
) => {
  const diff =
    (end ? new Date(end).getTime() : new Date(start).getTime() + 5400000) -
    Date.now();
  if (diff <= 0) return null;
  const m = Math.round(diff / 60000);
  return m < 60
    ? t("teacher.dashboard.minutesLeft", { count: m })
    : t("teacher.dashboard.timeLeft", {
        h: Math.floor(m / 60),
        m: String(m % 60).padStart(2, "0"),
      });
};

const useStatusLabels = () => {
  const { t } = useLanguage();
  return {
    ACTIVE: {
      label: t("teacher.dashboard.active"),
      bg: "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10",
      text: "text-[#2B6F5E] dark:text-[#4ADE80]",
    },
    INACTIVE: {
      label: t("teacher.dashboard.inactive"),
      bg: "bg-[#BEB29E]/20 dark:bg-[#888888]/20",
      text: "text-[#6B5D4F] dark:text-[#AAAAAA]",
    },
    COMPLETED: {
      label: t("teacher.dashboard.completed"),
      bg: "bg-[#C4A035]/10 dark:bg-[#C4A035]/10",
      text: "text-[#C4A035] dark:text-[#C4A035]",
    },
  } as Record<string, { label: string; bg: string; text: string }>;
};

/* ═══ SKELETON ═══ */
const Skeleton = ({ rtl }: { rtl: boolean }) => (
  <div className="space-y-6 animate-pulse" dir={rtl ? "rtl" : "ltr"}>
    <div className="h-8 w-64 bg-brand-beige/30 dark:bg-[#2A2A2A]/30 rounded-lg" />
    <div className="h-4 w-48 bg-brand-beige/20 dark:bg-[#2A2A2A]/20 rounded-lg" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige/40 dark:border-[#2A2A2A] p-5 h-25"
        >
          <div className="h-3 w-20 bg-brand-beige/30 dark:bg-[#2A2A2A]/30 rounded mb-3" />
          <div className="h-7 w-14 bg-brand-beige/30 dark:bg-[#2A2A2A]/30 rounded" />
        </div>
      ))}
    </div>
  </div>
);

/* ═══ STAT CARD ═══ */
const cMap = {
  teal: {
    bar: "from-[#2B6F5E] dark:from-[#4ADE80] to-[#2B6F5E]/60",
    bg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8",
    icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
    val: "text-[#2B6F5E] dark:text-[#4ADE80]",
  },
  gold: {
    bar: "from-[#C4A035] to-[#C4A035]/60",
    bg: "bg-[#C4A035]/8 dark:bg-[#C4A035]/8",
    icon: "text-[#C4A035]",
    val: "text-[#C4A035]",
  },
  green: {
    bar: "from-[#8DB896] to-[#8DB896]/60",
    bg: "bg-[#8DB896]/12 dark:bg-[#4ADE80]/12",
    icon: "text-[#3D7A4A] dark:text-[#4ADE80]",
    val: "text-[#3D7A4A] dark:text-[#4ADE80]",
  },
  beige: {
    bar: "from-[#BEB29E] dark:from-[#888888] to-[#BEB29E]/60",
    bg: "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20",
    icon: "text-[#6B5D4F] dark:text-[#AAAAAA]",
    val: "text-[#6B5D4F] dark:text-[#AAAAAA]",
  },
};

const Stat = ({
  label,
  value,
  icon: I,
  color,
  suffix,
  link,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: keyof typeof cMap;
  suffix?: string;
  link?: string;
}) => {
  const c = cMap[color];
  const { isRTL } = useLanguage();
  const el = (
    <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige/50 dark:border-[#2A2A2A] p-5 overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div
        className={`absolute ${isRTL ? "right-0" : "left-0"} top-0 bottom-0 w-1 bg-linear-to-b ${c.bar} opacity-50 group-hover:opacity-100 transition-opacity`}
      />
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#6B5D4F]/80 dark:text-[#AAAAAA] uppercase tracking-wider mb-1.5">
            {label}
          </p>
          <p className={`text-2xl font-bold ${c.val}`}>
            {value}
            {suffix && (
              <span className="text-sm font-medium ms-0.5">{suffix}</span>
            )}
          </p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}
        >
          <I className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
  return link ? <Link to={link}>{el}</Link> : el;
};

/* ═══ RING ═══ */
const Ring = ({ rate, label }: { rate: number; label: string }) => {
  const r = 36,
    circ = 2 * Math.PI * r,
    off = circ - (rate / 100) * circ;
  const col = rate >= 75 ? "#2B6F5E" : rate >= 50 ? "#C4A035" : "#DC2626";
  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="#D8CDC0"
          strokeWidth="6"
          opacity="0.3"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={col}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={off}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
          {rate}%
        </span>
        <span className="text-[10px] text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {label}
        </span>
      </div>
    </div>
  );
};

/* ═══ EMPTY ═══ */
const Empty = ({ icon: I, msg }: { icon: React.ElementType; msg: string }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="w-14 h-14 rounded-2xl bg-brand-beige/20 dark:bg-[#2A2A2A]/20 flex items-center justify-center mb-3">
      <I className="w-6 h-6 text-brand-brown dark:text-[#888888]" />
    </div>
    <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">{msg}</p>
  </div>
);

/* ═══ LIVE BANNER ═══ */
const LiveBanner = ({ s }: { s: DashboardSession }) => {
  const { t, currentLang } = useLanguage();
  const rem = remaining(s.end_time, s.session_date, t);
  return (
    <div className="relative bg-linear-to-r from-[#2B6F5E] via-[#2B6F5E]/95 to-[#1a5446] rounded-2xl p-5 text-white overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-pulse" />
      <div className="relative flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold bg-red-500/90 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                {t("teacher.dashboard.liveNow")}
              </span>
              {rem && <span className="text-[11px] text-white/60">{rem}</span>}
            </div>
            <h3 className="text-lg font-bold truncate">
              {s.group.course.course_name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-white/70 mt-0.5 flex-wrap">
              <span>{s.group.name}</span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {fmtTime(s.session_date, currentLang)}
                {s.end_time && (
                  <span> — {fmtTime(s.end_time, currentLang)}</span>
                )}
              </span>
              {s.room && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="flex items-center gap-1">
                    <DoorOpen className="w-3.5 h-3.5" />
                    {s.room.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <Link
          to="/teacher/sessions"
          className="shrink-0 text-sm font-semibold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
        >
          <ClipboardCheck className="w-4 h-4" />
          {t("teacher.dashboard.registerAttendance")}
        </Link>
      </div>
    </div>
  );
};

/* ═══ SESSION ROW ═══ */
const SessionRow = ({
  session,
  isRTL,
  locale,
  currentLang,
  t,
  showTodayBadge,
}: {
  session: DashboardSession;
  isRTL: boolean;
  locale: string;
  currentLang: string;
  t: (k: string, o?: any) => string;
  showTodayBadge: boolean;
}) => {
  const live = isLive(session);
  const today = isToday(session.session_date);
  const isPast = new Date(session.session_date) < new Date() && !live;

  return (
    <div
      className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all group
      ${
        live
          ? "bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border-[#2B6F5E]/20 dark:border-[#4ADE80]/20 ring-1 ring-[#2B6F5E] dark:ring-[#4ADE80]/20"
          : today && !isPast
            ? "bg-[#2B6F5E]/3 dark:bg-[#4ADE80]/3 border-[#2B6F5E]/10 dark:border-[#4ADE80]/10"
            : isPast
              ? "bg-[#FAFAF8] dark:bg-[#111111] border-transparent opacity-60"
              : "bg-[#FAFAF8] dark:bg-[#111111] hover:bg-[#F5F3EF] dark:hover:bg-[#222222] border-transparent hover:border-[#D8CDC0]/40 dark:border-[#2A2A2A]"
      }`}
    >
      {/* Date box */}
      <div
        className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0
        ${
          live
            ? "bg-[#2B6F5E]/15 dark:bg-[#4ADE80]/15 ring-2 ring-[#2B6F5E] dark:ring-[#4ADE80]/20"
            : today
              ? "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10"
              : "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8"
        }`}
      >
        <span className="text-[10px] font-medium text-[#2B6F5E]/70 dark:text-[#4ADE80]/70 leading-tight">
          {new Date(session.session_date).toLocaleDateString(locale, {
            weekday: "short",
          })}
        </span>
        <span className="text-lg font-bold text-[#2B6F5E] dark:text-[#4ADE80] leading-tight">
          {new Date(session.session_date).getDate()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
            {session.group.course.course_name}
          </h3>
          {live && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#2B6F5E] dark:bg-[#4ADE80] px-2 py-0.5 rounded-full shrink-0">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              {t("teacher.dashboard.live")}
            </span>
          )}
          {/* ✅ شارة "اليوم" للحصص القادمة في نفس اليوم */}
          {showTodayBadge && !live && today && !isPast && (
            <span className="text-[10px] font-bold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 px-2 py-0.5 rounded-full shrink-0">
              {t("teacher.dashboard.today")}
            </span>
          )}
          {isPast && today && (
            <span className="text-[10px] font-medium text-[#BEB29E] dark:text-[#888888] px-2 py-0.5 rounded-full bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/30 shrink-0">
              انتهت
            </span>
          )}
          {!live && !today && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C4A035]/10 dark:bg-[#C4A035]/15 text-[#C4A035] font-medium shrink-0">
              {relTime(session.session_date, t)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6B5D4F]/70 dark:text-[#999999] flex-wrap">
          <span>{session.group.name}</span>
          {session.room && (
            <>
              <span className="text-[#BEB29E] dark:text-[#888888]">•</span>
              <span className="flex items-center gap-0.5">
                <DoorOpen className="w-3 h-3" />
                {session.room.name}
              </span>
            </>
          )}
          {session.topic && (
            <>
              <span className="text-[#BEB29E] dark:text-[#888888]">•</span>
              <span className="truncate max-w-[140px]">{session.topic}</span>
            </>
          )}
        </div>
      </div>

      {/* Time */}
      <div className={`${isRTL ? "text-left" : "text-right"} shrink-0`}>
        <p className="text-xs font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
          {fmtTime(session.session_date, currentLang)}
        </p>
        {session.end_time && (
          <p className="text-[10px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
            — {fmtTime(session.end_time, currentLang)}
          </p>
        )}
        {session._count.attendance > 0 && (
          <p className="text-[10px] text-[#2B6F5E] dark:text-[#4ADE80] mt-0.5 flex items-center gap-0.5 justify-end">
            <ClipboardCheck className="w-2.5 h-2.5" />
            {session._count.attendance}
          </p>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function TeacherDashboard() {
  const { data, isLoading, isError } = useTeacherDashboard();
  const { t, dir, isRTL, currentLang } = useLanguage();
  const statusLabels = useStatusLabels();
  const Chev = isRTL ? ChevronLeft : ChevronRight;
  const locale = getLocale(currentLang);

  if (isLoading) return <Skeleton rtl={isRTL} />;
  if (isError || !data)
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
          {t("teacher.dashboard.errorTitle")}
        </h3>
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {t("teacher.dashboard.errorDesc")}
        </p>
      </div>
    );

  const {
    teacher,
    stats,
    groups,
    upcoming_sessions,
    recent_sessions,
    upcoming_exams,
    live_session,
  } = data as DashboardData;
  const activeLive =
    live_session ||
    [...upcoming_sessions, ...recent_sessions].find(isLive) ||
    null;

  // ✅ فصل حصص اليوم عن الحصص القادمة
  const todaySessions = upcoming_sessions.filter((s) =>
    isToday(s.session_date),
  );
  const futureSessions = upcoming_sessions.filter(
    (s) => !isToday(s.session_date),
  );
  // اليوم أولاً ثم المستقبل
  const displaySessions = [...todaySessions, ...futureSessions].slice(0, 6);
  const hasTodaySessions = todaySessions.length > 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t("teacher.dashboard.goodMorning")
      : hour < 18
        ? t("teacher.dashboard.goodAfternoon")
        : t("teacher.dashboard.goodEvening");

  return (
    <div dir={dir} className="space-y-6 pb-8">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {greeting}، {teacher.first_name} 👋
          </h1>
          <p className="text-sm text-[#6B5D4F]/70 dark:text-[#999999] mt-0.5">
            {t("teacher.dashboard.overview")}
          </p>
        </div>
        <p className="text-xs text-[#BEB29E] dark:text-[#888888]">
          {new Date().toLocaleDateString(locale, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {activeLive && <LiveBanner s={activeLive} />}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label={t("teacher.dashboard.groups")}
          value={stats.total_groups}
          icon={Layers}
          color="teal"
          link="/teacher/groups"
        />
        <Stat
          label={t("teacher.dashboard.students")}
          value={stats.total_students}
          icon={Users}
          color="gold"
          link="/teacher/students"
        />
        <Stat
          label={t("teacher.dashboard.sessions")}
          value={stats.total_sessions}
          icon={CalendarDays}
          color="green"
          link="/teacher/sessions"
        />
        <Stat
          label={t("teacher.dashboard.attendanceRate")}
          value={stats.attendance_rate}
          icon={ClipboardCheck}
          color="beige"
          suffix="%"
          link="/teacher/attendance"
        />
      </div>

      {/* Sessions + Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ✅ Upcoming Sessions — اليوم أولاً */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/50 dark:border-[#2A2A2A] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] flex items-center gap-2">
                  {displaySessions.length > 0
                    ? t("teacher.dashboard.upcomingSessions")
                    : "الحصص"}
                  {hasTodaySessions && (
                    <span className="text-[10px] font-bold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 px-2 py-0.5 rounded-full">
                      {todaySessions.length} {t("teacher.dashboard.today")}
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
                  {displaySessions.length > 0
                    ? t("teacher.dashboard.nextSevenDays")
                    : "آخر الحصص المسجلة"}
                </p>
              </div>
            </div>
            <Link
              to="/teacher/schedule"
              className="text-xs font-medium text-[#2B6F5E] dark:text-[#4ADE80] flex items-center gap-1"
            >
              {t("teacher.dashboard.viewSchedule")}{" "}
              <Chev className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4">
            {displaySessions.length === 0 ? (
              // ✅ لا توجد حصص قادمة — اعرض الحصص الأخيرة إن وجدت
              recent_sessions.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-[#BEB29E]/30 dark:bg-[#888888]/20" />
                    <span className="text-[10px] font-medium text-[#BEB29E] dark:text-[#888888] px-2">
                      آخر الحصص
                    </span>
                    <div className="flex-1 h-px bg-[#BEB29E]/30 dark:bg-[#888888]/20" />
                  </div>
                  {recent_sessions.slice(0, 3).map((session) => (
                    <SessionRow
                      key={session.session_id}
                      session={session}
                      isRTL={isRTL}
                      locale={locale}
                      currentLang={currentLang}
                      t={t}
                      showTodayBadge={false}
                    />
                  ))}
                </div>
              ) : (
                <Empty
                  icon={CalendarDays}
                  msg={t("teacher.dashboard.noUpcoming")}
                />
              )
            ) : (
              <div className="space-y-2.5">
                {/* ✅ فاصل "حصص اليوم" */}
                {hasTodaySessions && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-[#2B6F5E]/15 dark:bg-[#4ADE80]/15" />
                    <span className="text-[10px] font-bold text-[#2B6F5E] dark:text-[#4ADE80] px-2.5 py-1 bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 rounded-full">
                      📅 {t("teacher.dashboard.today")}
                    </span>
                    <div className="flex-1 h-px bg-[#2B6F5E]/15 dark:bg-[#4ADE80]/15" />
                  </div>
                )}

                {displaySessions.map((session, idx) => {
                  // أضف فاصل "الأيام القادمة" عند الانتقال من اليوم إلى المستقبل
                  const isFirstFuture =
                    !isToday(session.session_date) &&
                    idx > 0 &&
                    isToday(displaySessions[idx - 1].session_date);

                  return (
                    <div key={session.session_id}>
                      {isFirstFuture && futureSessions.length > 0 && (
                        <div className="flex items-center gap-2 my-3">
                          <div className="flex-1 h-px bg-[#D8CDC0]/40 dark:bg-[#2A2A2A]" />
                          <span className="text-[10px] font-medium text-[#BEB29E] dark:text-[#888888] px-2">
                            {t("teacher.dashboard.nextSevenDays")}
                          </span>
                          <div className="flex-1 h-px bg-[#D8CDC0]/40 dark:bg-[#2A2A2A]" />
                        </div>
                      )}
                      <SessionRow
                        session={session}
                        isRTL={isRTL}
                        locale={locale}
                        currentLang={currentLang}
                        t={t}
                        showTodayBadge={hasTodaySessions}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Attendance Ring */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/50 dark:border-[#2A2A2A] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
            <div className="w-9 h-9 rounded-lg bg-[#8DB896]/10 dark:bg-[#4ADE80]/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#3D7A4A] dark:text-[#4ADE80]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("teacher.dashboard.attendanceOverview")}
              </h2>
              <p className="text-[11px] text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
                {t("teacher.dashboard.overallAvg")}
              </p>
            </div>
          </div>
          <div className="p-6 flex flex-col items-center">
            <Ring
              rate={stats.attendance_rate}
              label={t("teacher.dashboard.attendance")}
            />
            <div className="w-full mt-6 space-y-2.5">
              {[
                { k: "totalSessions", v: stats.total_sessions },
                { k: "totalStudents", v: stats.total_students },
                {
                  k: "activeGroups",
                  v: groups.filter((g) => g.status === "ACTIVE").length,
                },
              ].map(({ k, v }) => (
                <div
                  key={k}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
                    {t(`teacher.dashboard.${k}`)}
                  </span>
                  <span className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Groups + Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Groups */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/50 dark:border-[#2A2A2A] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#C4A035]/8 dark:bg-[#C4A035]/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#C4A035]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {t("teacher.dashboard.myGroups")}
                </h2>
                <p className="text-[11px] text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
                  {t("teacher.dashboard.groupsAssigned", {
                    count: groups.length,
                  })}
                </p>
              </div>
            </div>
            <Link
              to="/teacher/groups"
              className="text-xs font-medium text-[#2B6F5E] dark:text-[#4ADE80] flex items-center gap-1"
            >
              {t("teacher.dashboard.viewAll")} <Chev className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4">
            {groups.length === 0 ? (
              <Empty icon={BookOpen} msg={t("teacher.dashboard.noGroupsYet")} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {groups.slice(0, 4).map((g) => {
                  const b = statusLabels[g.status] || statusLabels.ACTIVE;
                  return (
                    <Link
                      key={g.group_id}
                      to={`/teacher/groups/${g.group_id}`}
                      className="p-4 rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] hover:border-[#2B6F5E]/30 hover:shadow-md transition-all group bg-[#FAFAF8] dark:bg-[#111111] hover:bg-white dark:hover:bg-[#1A1A1A]"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate group-hover:text-[#2B6F5E] dark:group-hover:text-[#4ADE80] transition-colors">
                            {g.name}
                          </h3>
                          <p className="text-xs text-[#6B5D4F]/70 dark:text-[#999999] truncate mt-0.5">
                            {g.course_name}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${b.bg} ${b.text} shrink-0 ms-2`}
                        >
                          {b.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {g.student_count} {t("teacher.dashboard.student")}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {g.session_count} {t("teacher.dashboard.session")}
                        </span>
                        {g.level && (
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3.5 h-3.5" />
                            {g.level}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Exams */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/50 dark:border-[#2A2A2A] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#6B5D4F] dark:text-[#AAAAAA]" />
              </div>
              <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("teacher.dashboard.upcomingExams")}
              </h2>
            </div>
            <Link
              to="/teacher/exams"
              className="text-xs font-medium text-[#2B6F5E] dark:text-[#4ADE80] flex items-center gap-1"
            >
              {t("teacher.dashboard.all")} <Chev className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4">
            {upcoming_exams.length === 0 ? (
              <Empty
                icon={FileText}
                msg={t("teacher.dashboard.noUpcomingExams")}
              />
            ) : (
              <div className="space-y-2.5">
                {upcoming_exams.map((e) => (
                  <div
                    key={e.exam_id}
                    className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#111111] border border-transparent hover:border-[#D8CDC0]/40 dark:border-[#2A2A2A] transition-all"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] truncate flex-1">
                        {e.exam_name || e.course.course_name}
                      </h3>
                      <span className="text-[10px] font-bold text-[#C4A035] bg-[#C4A035]/10 px-2 py-0.5 rounded-full shrink-0 ms-2">
                        /{e.max_marks}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
                      <span>{e.course.course_name}</span>
                      <span className="text-[#BEB29E] dark:text-[#888888]">
                        •
                      </span>
                      <span className="font-medium text-[#2B6F5E] dark:text-[#4ADE80]">
                        {relTime(e.exam_date, t)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sessions Table */}
      {recent_sessions.length > 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/50 dark:border-[#2A2A2A] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#BEB29E]/10 dark:bg-[#888888]/10 flex items-center justify-center">
                <ClipboardCheck className="w-4 h-4 text-[#6B5D4F] dark:text-[#AAAAAA]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {t("teacher.dashboard.recentSessions")}
                </h2>
                <p className="text-[11px] text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
                  {t("teacher.dashboard.recentSessionsDesc")}
                </p>
              </div>
            </div>
            <Link
              to="/teacher/sessions"
              className="text-xs font-medium text-[#2B6F5E] dark:text-[#4ADE80] flex items-center gap-1"
            >
              {t("teacher.dashboard.allSessions")}{" "}
              <Chev className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#D8CDC0]/20 dark:border-[#2A2A2A]">
                  {[
                    "date",
                    "time",
                    "subject",
                    "group",
                    "topic",
                    "attendance",
                  ].map((k) => (
                    <th
                      key={k}
                      className={`${isRTL ? "text-right" : "text-left"} text-[11px] font-medium text-[#6B5D4F]/60 dark:text-[#888888] uppercase tracking-wider px-5 py-3`}
                    >
                      {t(`teacher.dashboard.${k}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent_sessions.map((s) => (
                  <tr
                    key={s.session_id}
                    className="border-b border-[#D8CDC0]/10 dark:border-[#2A2A2A]/40 hover:bg-[#FAFAF8] dark:hover:bg-[#222222] transition-colors"
                  >
                    <td className="px-5 py-3.5 text-xs text-[#1B1B1B] dark:text-[#E5E5E5] whitespace-nowrap">
                      {fmtDate(s.session_date, currentLang)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#6B5D4F] dark:text-[#AAAAAA] whitespace-nowrap">
                      {fmtTime(s.session_date, currentLang)}
                      {s.end_time && (
                        <span className="text-[#BEB29E] dark:text-[#888888]">
                          {" "}
                          — {fmtTime(s.end_time, currentLang)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                      {s.group.course.course_name}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
                      {s.group.name}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#6B5D4F]/70 dark:text-[#999999] max-w-[200px] truncate">
                      {s.topic || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {s._count.attendance > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 px-2.5 py-1 rounded-full">
                          <ClipboardCheck className="w-3 h-3" />
                          {t("teacher.dashboard.records", {
                            count: s._count.attendance,
                          })}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C4A035] bg-[#C4A035]/8 px-2.5 py-1 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          {t("teacher.dashboard.notRecorded")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
