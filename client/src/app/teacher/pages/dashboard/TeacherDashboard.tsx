import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  TrendingUp,
  Clock,
  ChevronLeft,
  FileText,
  BarChart3,
  AlertCircle,
  Layers,
  Radio,
  DoorOpen,
} from "lucide-react";
import { useTeacherDashboard } from "../../../../hooks/teacher/Useteacher";

/* ═══════════════════════════════════════════════════════════
   TYPES (matching API response)
═══════════════════════════════════════════════════════════ */

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
  group: {
    group_id: string;
    name: string;
    course: {
      course_name: string;
    };
  };
  room?: {
    room_id: string;
    name: string;
  } | null;
  _count: {
    attendance: number;
  };
}

interface DashboardExam {
  exam_id: string;
  exam_name: string | null;
  exam_date: string;
  max_marks: number;
  course: {
    course_name: string;
  };
}

interface DashboardData {
  teacher: {
    teacher_id: string;
    first_name: string;
    last_name: string;
  };
  stats: DashboardStats;
  groups: DashboardGroup[];
  upcoming_sessions: DashboardSession[];
  recent_sessions: DashboardSession[];
  upcoming_exams: DashboardExam[];
  live_session: DashboardSession | null;
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-DZ", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("ar-DZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRelativeTime = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "اليوم";
  if (diffDays === 1) return "غداً";
  if (diffDays === -1) return "أمس";
  if (diffDays > 0 && diffDays <= 7) return `بعد ${diffDays} أيام`;
  if (diffDays < 0 && diffDays >= -7) return `منذ ${Math.abs(diffDays)} أيام`;
  return formatDate(dateStr);
};

const isSessionLive = (session: {
  session_date: string;
  end_time: string | null;
}) => {
  const now = new Date();
  const start = new Date(session.session_date);
  const end = session.end_time
    ? new Date(session.end_time)
    : new Date(start.getTime() + 90 * 60000);
  return now >= start && now <= end;
};

const getRemainingTime = (endTimeStr: string | null, startStr: string) => {
  const now = new Date();
  const end = endTimeStr
    ? new Date(endTimeStr)
    : new Date(new Date(startStr).getTime() + 90 * 60000);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return null;
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins} دقيقة متبقية`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${String(m).padStart(2, "0")} متبقية`;
};

const getStatusBadge = (status: string) => {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    ACTIVE: {
      label: "نشط",
      bg: "bg-[#2B6F5E]/10",
      text: "text-[#2B6F5E]",
    },
    INACTIVE: {
      label: "غير نشط",
      bg: "bg-[#BEB29E]/20",
      text: "text-[#6B5D4F]",
    },
    COMPLETED: {
      label: "مكتمل",
      bg: "bg-[#C4A035]/10",
      text: "text-[#C4A035]",
    },
  };
  return (
    map[status] || { label: status, bg: "bg-gray-100", text: "text-gray-600" }
  );
};

/* ═══════════════════════════════════════════════════════════
   SKELETON LOADER
═══════════════════════════════════════════════════════════ */

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse" dir="rtl">
    <div className="h-8 w-64 bg-[#D8CDC0]/30 rounded-lg" />
    <div className="h-4 w-48 bg-[#D8CDC0]/20 rounded-lg" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#D8CDC0]/40 p-5 h-[100px]"
        >
          <div className="h-3 w-20 bg-[#D8CDC0]/30 rounded mb-3" />
          <div className="h-7 w-14 bg-[#D8CDC0]/30 rounded" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8CDC0]/40 p-6 h-[320px]" />
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 p-6 h-[320px]" />
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════════ */

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: "teal" | "gold" | "green" | "beige";
  suffix?: string;
  link?: string;
}

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  suffix,
  link,
}: StatCardProps) => {
  const colorMap = {
    teal: {
      bar: "from-[#2B6F5E] to-[#2B6F5E]/60",
      bg: "bg-[#2B6F5E]/8",
      icon: "text-[#2B6F5E]",
      value: "text-[#2B6F5E]",
    },
    gold: {
      bar: "from-[#C4A035] to-[#C4A035]/60",
      bg: "bg-[#C4A035]/8",
      icon: "text-[#C4A035]",
      value: "text-[#C4A035]",
    },
    green: {
      bar: "from-[#8DB896] to-[#8DB896]/60",
      bg: "bg-[#8DB896]/12",
      icon: "text-[#3D7A4A]",
      value: "text-[#3D7A4A]",
    },
    beige: {
      bar: "from-[#BEB29E] to-[#BEB29E]/60",
      bg: "bg-[#D8CDC0]/20",
      icon: "text-[#6B5D4F]",
      value: "text-[#6B5D4F]",
    },
  };

  const c = colorMap[color];

  const content = (
    <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/50 p-5 overflow-hidden group hover:shadow-lg hover:border-[#D8CDC0]/80 transition-all duration-300 cursor-pointer">
      <div
        className={`absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b ${c.bar} opacity-50 group-hover:opacity-100 transition-opacity`}
      />
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#6B5D4F]/80 uppercase tracking-wider mb-1.5">
            {label}
          </p>
          <p className={`text-2xl font-bold ${c.value}`}>
            {value}
            {suffix && (
              <span className="text-sm font-medium mr-0.5">{suffix}</span>
            )}
          </p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  return content;
};

/* ═══════════════════════════════════════════════════════════
   ATTENDANCE RING
═══════════════════════════════════════════════════════════ */

const AttendanceRing = ({ rate }: { rate: number }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rate / 100) * circumference;

  const getColor = (r: number) => {
    if (r >= 75) return "#2B6F5E";
    if (r >= 50) return "#C4A035";
    return "#DC2626";
  };

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#D8CDC0"
          strokeWidth="6"
          opacity="0.3"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={getColor(rate)}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-[#1B1B1B]">{rate}%</span>
        <span className="text-[10px] text-[#6B5D4F]/70">حضور</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════ */

const EmptyState = ({
  icon: Icon,
  message,
}: {
  icon: React.ElementType;
  message: string;
}) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="w-14 h-14 rounded-2xl bg-[#D8CDC0]/20 flex items-center justify-center mb-3">
      <Icon className="w-6 h-6 text-[#BEB29E]" />
    </div>
    <p className="text-sm text-[#6B5D4F]/70">{message}</p>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   LIVE SESSION BANNER
═══════════════════════════════════════════════════════════ */

const LiveSessionBanner = ({ session }: { session: DashboardSession }) => {
  const remaining = getRemainingTime(session.end_time, session.session_date);

  return (
    <div className="relative bg-gradient-to-l from-[#2B6F5E] via-[#2B6F5E]/95 to-[#1a5446] rounded-2xl p-5 text-white overflow-hidden">
      {/* Animated background pulse */}
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/5 to-transparent animate-pulse" />

      <div className="relative flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Live indicator */}
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold bg-red-500/90 px-2 py-0.5 rounded-full uppercase tracking-wide">
                جارية الآن
              </span>
              {remaining && (
                <span className="text-[11px] text-white/60">{remaining}</span>
              )}
            </div>
            <h3 className="text-lg font-bold truncate">
              {session.group.course.course_name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-white/70 mt-0.5 flex-wrap">
              <span>{session.group.name}</span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(session.session_date)}
                {session.end_time && (
                  <span> ← {formatTime(session.end_time)}</span>
                )}
              </span>
              {session.room && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="flex items-center gap-1">
                    <DoorOpen className="w-3.5 h-3.5" />
                    {session.room.name}
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
          تسجيل الحضور
        </Link>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

export default function TeacherDashboard() {
  const { data, isLoading, isError } = useTeacherDashboard();

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <div
        dir="rtl"
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">
          حدث خطأ أثناء تحميل البيانات
        </h3>
        <p className="text-sm text-[#6B5D4F]/70">
          يرجى تحديث الصفحة أو المحاولة لاحقاً
        </p>
      </div>
    );
  }

  const dashboard = data as DashboardData;
  const {
    teacher,
    stats,
    groups,
    upcoming_sessions,
    recent_sessions,
    upcoming_exams,
    live_session,
  } = dashboard;

  // Also detect live from frontend side (fallback)
  const activeLive =
    live_session ||
    [...upcoming_sessions, ...recent_sessions].find(isSessionLive) ||
    null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء النور";

  return (
    <div dir="rtl" className="space-y-6 pb-8">
      {/* ── Greeting ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B]">
            {greeting}، {teacher.first_name} 👋
          </h1>
          <p className="text-sm text-[#6B5D4F]/70 mt-0.5">
            إليك نظرة عامة على أنشطتك التعليمية
          </p>
        </div>
        <p className="text-xs text-[#BEB29E]">
          {new Date().toLocaleDateString("ar-DZ", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* ══ LIVE SESSION BANNER ══ */}
      {activeLive && <LiveSessionBanner session={activeLive} />}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="المجموعات"
          value={stats.total_groups}
          icon={Layers}
          color="teal"
          link="/teacher/groups"
        />
        <StatCard
          label="الطلاب"
          value={stats.total_students}
          icon={Users}
          color="gold"
          link="/teacher/students"
        />
        <StatCard
          label="الحصص"
          value={stats.total_sessions}
          icon={CalendarDays}
          color="green"
          link="/teacher/sessions"
        />
        <StatCard
          label="نسبة الحضور"
          value={stats.attendance_rate}
          icon={ClipboardCheck}
          color="beige"
          suffix="%"
          link="/teacher/attendance"
        />
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ════ Upcoming Sessions (2/3) ════ */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8CDC0]/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/30">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#2B6F5E]/8 flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-[#2B6F5E]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1B1B1B]">
                  الحصص القادمة
                </h2>
                <p className="text-[11px] text-[#6B5D4F]/60">
                  خلال الأيام السبعة القادمة
                </p>
              </div>
            </div>
            <Link
              to="/teacher/schedule"
              className="text-xs font-medium text-[#2B6F5E] hover:text-[#2B6F5E]/80 flex items-center gap-1 transition-colors"
            >
              عرض الجدول
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4">
            {upcoming_sessions.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                message="لا توجد حصص قادمة خلال الأسبوع"
              />
            ) : (
              <div className="space-y-2.5">
                {upcoming_sessions.slice(0, 5).map((session) => {
                  const live = isSessionLive(session);
                  return (
                    <div
                      key={session.session_id}
                      className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all group ${
                        live
                          ? "bg-[#2B6F5E]/5 border-[#2B6F5E]/20 ring-1 ring-[#2B6F5E]/10"
                          : "bg-[#FAFAF8] hover:bg-[#F5F3EF] border-transparent hover:border-[#D8CDC0]/40"
                      }`}
                    >
                      {/* Date badge */}
                      <div
                        className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 ${
                          live
                            ? "bg-[#2B6F5E]/15 ring-2 ring-[#2B6F5E]/20"
                            : "bg-[#2B6F5E]/8"
                        }`}
                      >
                        <span
                          className={`text-[11px] font-medium leading-tight ${live ? "text-[#2B6F5E]" : "text-[#2B6F5E]/70"}`}
                        >
                          {new Date(session.session_date).toLocaleDateString(
                            "ar-DZ",
                            { weekday: "short" },
                          )}
                        </span>
                        <span
                          className={`text-lg font-bold leading-tight ${live ? "text-[#2B6F5E]" : "text-[#2B6F5E]"}`}
                        >
                          {new Date(session.session_date).getDate()}
                        </span>
                      </div>

                      {/* Session info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h3 className="text-sm font-semibold text-[#1B1B1B] truncate">
                            {session.group.course.course_name}
                          </h3>
                          {live ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#2B6F5E] px-2 py-0.5 rounded-full">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                              </span>
                              جارية
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C4A035]/10 text-[#C4A035] font-medium shrink-0">
                              {getRelativeTime(session.session_date)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#6B5D4F]/70 flex-wrap">
                          <span>{session.group.name}</span>
                          {session.room && (
                            <>
                              <span className="text-[#BEB29E]">•</span>
                              <span className="flex items-center gap-0.5">
                                <DoorOpen className="w-3 h-3" />
                                {session.room.name}
                              </span>
                            </>
                          )}
                          {session.topic && (
                            <>
                              <span className="text-[#BEB29E]">•</span>
                              <span className="truncate max-w-[140px]">
                                {session.topic}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Time range */}
                      <div className="text-left shrink-0">
                        <p className="text-xs font-medium text-[#1B1B1B]">
                          {formatTime(session.session_date)}
                        </p>
                        {session.end_time && (
                          <p className="text-[10px] text-[#6B5D4F]/50">
                            ← {formatTime(session.end_time)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ════ Attendance Overview (1/3) ════ */}
        <div className="bg-white rounded-2xl border border-[#D8CDC0]/50 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#D8CDC0]/30">
            <div className="w-9 h-9 rounded-lg bg-[#8DB896]/12 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-[#3D7A4A]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1B1B1B]">
                نسبة الحضور
              </h2>
              <p className="text-[11px] text-[#6B5D4F]/60">
                المعدل العام لجميع المجموعات
              </p>
            </div>
          </div>

          <div className="p-6 flex flex-col items-center">
            <AttendanceRing rate={stats.attendance_rate} />
            <div className="w-full mt-6 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B5D4F]/70">إجمالي الحصص</span>
                <span className="font-semibold text-[#1B1B1B]">
                  {stats.total_sessions}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B5D4F]/70">إجمالي الطلاب</span>
                <span className="font-semibold text-[#1B1B1B]">
                  {stats.total_students}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B5D4F]/70">المجموعات النشطة</span>
                <span className="font-semibold text-[#1B1B1B]">
                  {groups.filter((g) => g.status === "ACTIVE").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Groups + Exams Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ════ My Groups (2/3) ════ */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8CDC0]/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/30">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#C4A035]/8 flex items-center justify-center">
                <BookOpen className="w-4.5 h-4.5 text-[#C4A035]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1B1B1B]">
                  مجموعاتي
                </h2>
                <p className="text-[11px] text-[#6B5D4F]/60">
                  {groups.length} مجموعة مسندة إليك
                </p>
              </div>
            </div>
            <Link
              to="/teacher/groups"
              className="text-xs font-medium text-[#2B6F5E] hover:text-[#2B6F5E]/80 flex items-center gap-1 transition-colors"
            >
              عرض الكل
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4">
            {groups.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                message="لم يتم إسناد أي مجموعة بعد"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {groups.slice(0, 4).map((group) => {
                  const badge = getStatusBadge(group.status);
                  return (
                    <Link
                      key={group.group_id}
                      to={`/teacher/groups/${group.group_id}`}
                      className="p-4 rounded-xl border border-[#D8CDC0]/40 hover:border-[#2B6F5E]/30 hover:shadow-md transition-all group bg-[#FAFAF8] hover:bg-white"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-[#1B1B1B] truncate group-hover:text-[#2B6F5E] transition-colors">
                            {group.name}
                          </h3>
                          <p className="text-xs text-[#6B5D4F]/70 truncate mt-0.5">
                            {group.course_name}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.bg} ${badge.text} shrink-0 mr-2`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-[#6B5D4F]/60">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {group.student_count} طالب
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {group.session_count} حصة
                        </span>
                        {group.level && (
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3.5 h-3.5" />
                            {group.level}
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

        {/* ════ Upcoming Exams (1/3) ════ */}
        <div className="bg-white rounded-2xl border border-[#D8CDC0]/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/30">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#D8CDC0]/20 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-[#6B5D4F]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1B1B1B]">
                  الامتحانات القادمة
                </h2>
              </div>
            </div>
            <Link
              to="/teacher/exams"
              className="text-xs font-medium text-[#2B6F5E] hover:text-[#2B6F5E]/80 flex items-center gap-1 transition-colors"
            >
              الكل
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4">
            {upcoming_exams.length === 0 ? (
              <EmptyState icon={FileText} message="لا توجد امتحانات قادمة" />
            ) : (
              <div className="space-y-2.5">
                {upcoming_exams.map((exam) => (
                  <div
                    key={exam.exam_id}
                    className="p-3.5 rounded-xl bg-[#FAFAF8] border border-transparent hover:border-[#D8CDC0]/40 transition-all"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className="text-sm font-medium text-[#1B1B1B] truncate flex-1">
                        {exam.exam_name || exam.course.course_name}
                      </h3>
                      <span className="text-[10px] font-bold text-[#C4A035] bg-[#C4A035]/10 px-2 py-0.5 rounded-full shrink-0 mr-2">
                        /{exam.max_marks}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#6B5D4F]/60">
                      <span>{exam.course.course_name}</span>
                      <span className="text-[#BEB29E]">•</span>
                      <span className="font-medium text-[#2B6F5E]">
                        {getRelativeTime(exam.exam_date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Sessions ── */}
      {recent_sessions.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#D8CDC0]/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/30">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#BEB29E]/12 flex items-center justify-center">
                <ClipboardCheck className="w-4.5 h-4.5 text-[#6B5D4F]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1B1B1B]">
                  آخر الحصص
                </h2>
                <p className="text-[11px] text-[#6B5D4F]/60">
                  الحصص المنجزة خلال الأسبوع الماضي
                </p>
              </div>
            </div>
            <Link
              to="/teacher/sessions"
              className="text-xs font-medium text-[#2B6F5E] hover:text-[#2B6F5E]/80 flex items-center gap-1 transition-colors"
            >
              جميع الحصص
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#D8CDC0]/20">
                  <th className="text-right text-[11px] font-medium text-[#6B5D4F]/60 uppercase tracking-wider px-5 py-3">
                    التاريخ
                  </th>
                  <th className="text-right text-[11px] font-medium text-[#6B5D4F]/60 uppercase tracking-wider px-5 py-3">
                    الوقت
                  </th>
                  <th className="text-right text-[11px] font-medium text-[#6B5D4F]/60 uppercase tracking-wider px-5 py-3">
                    المادة
                  </th>
                  <th className="text-right text-[11px] font-medium text-[#6B5D4F]/60 uppercase tracking-wider px-5 py-3">
                    المجموعة
                  </th>
                  <th className="text-right text-[11px] font-medium text-[#6B5D4F]/60 uppercase tracking-wider px-5 py-3">
                    الموضوع
                  </th>
                  <th className="text-right text-[11px] font-medium text-[#6B5D4F]/60 uppercase tracking-wider px-5 py-3">
                    الحضور
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent_sessions.map((session) => (
                  <tr
                    key={session.session_id}
                    className="border-b border-[#D8CDC0]/10 hover:bg-[#FAFAF8] transition-colors"
                  >
                    <td className="px-5 py-3.5 text-xs text-[#1B1B1B] whitespace-nowrap">
                      {formatDate(session.session_date)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#6B5D4F] whitespace-nowrap">
                      {formatTime(session.session_date)}
                      {session.end_time && (
                        <span className="text-[#BEB29E]">
                          {" "}
                          ← {formatTime(session.end_time)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-[#1B1B1B]">
                      {session.group.course.course_name}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#6B5D4F]/70">
                      {session.group.name}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#6B5D4F]/70 max-w-[200px] truncate">
                      {session.topic || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {session._count.attendance > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2B6F5E] bg-[#2B6F5E]/8 px-2.5 py-1 rounded-full">
                          <ClipboardCheck className="w-3 h-3" />
                          {session._count.attendance} تسجيل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C4A035] bg-[#C4A035]/8 px-2.5 py-1 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          لم يُسجل
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
