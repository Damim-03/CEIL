import { useParams, Link } from "react-router-dom";
import {
  Users,
  CalendarDays,
  BarChart3,
  ChevronRight,
  ClipboardCheck,
  AlertCircle,
  TrendingUp,
  UserCheck,
  UserX,
  Award,
  Target,
} from "lucide-react";
import { useGroupStats } from "../../../../hooks/teacher/Useteacher";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */

interface AttendanceBySession {
  session_id: string;
  date: string;
  topic: string | null;
  total: number;
  present: number;
  absent: number;
  rate: number;
}

interface ExamStat {
  exam_id: string;
  exam_name: string | null;
  exam_date: string;
  max_marks: number;
  students_graded: number;
  average: number;
  average_percent: number;
  highest: number;
  lowest: number;
  pass_rate: number;
}

interface AbsentStudent {
  student: {
    student_id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
  absences: number;
}

interface GroupStatsData {
  group: {
    group_id: string;
    name: string;
    level: string;
    status: string;
    max_students: number;
    course: {
      course_id: string;
      course_name: string;
    };
  };
  overview: {
    student_count: number;
    capacity: number;
    fill_rate: number;
    total_sessions: number;
    past_sessions: number;
    upcoming_sessions: number;
  };
  attendance: {
    rate: number;
    present: number;
    absent: number;
    total_records: number;
    by_session: AttendanceBySession[];
  };
  exams: ExamStat[];
  most_absent: AbsentStudent[];
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

const formatShortDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("ar-DZ", {
    month: "short",
    day: "numeric",
  });

const formatFullDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const getRateColor = (rate: number) => {
  if (rate >= 75) return "#2B6F5E";
  if (rate >= 50) return "#C4A035";
  return "#DC2626";
};

const getRateBg = (rate: number) => {
  if (rate >= 75) return "bg-[#2B6F5E]";
  if (rate >= 50) return "bg-[#C4A035]";
  return "bg-red-500";
};

const getInitials = (first: string, last: string) =>
  `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();

/* ═══════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════ */

const StatsSkeleton = () => (
  <div className="space-y-6 animate-pulse" dir="rtl">
    <div className="flex items-center gap-2">
      <div className="h-5 w-20 bg-[#D8CDC0]/30 rounded" />
      <div className="h-5 w-5 bg-[#D8CDC0]/20 rounded" />
      <div className="h-5 w-24 bg-[#D8CDC0]/30 rounded" />
      <div className="h-5 w-5 bg-[#D8CDC0]/20 rounded" />
      <div className="h-5 w-20 bg-[#D8CDC0]/30 rounded" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-[#D8CDC0]/40 h-[80px]"
        />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8CDC0]/40 h-[350px]" />
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 h-[350px]" />
    </div>
    <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 h-[300px]" />
  </div>
);

/* ═══════════════════════════════════════════════════════════
   ATTENDANCE RING (large)
═══════════════════════════════════════════════════════════ */

const AttendanceRing = ({ rate }: { rate: number }) => {
  const size = 120;
  const r = 46;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (rate / 100) * circumference;
  const color = getRateColor(rate);
  const half = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={half}
          cy={half}
          r={r}
          fill="none"
          stroke="#D8CDC0"
          strokeWidth="8"
          opacity="0.2"
        />
        <circle
          cx={half}
          cy={half}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#1B1B1B]">{rate}%</span>
        <span className="text-[10px] text-[#6B5D4F]/50">حضور</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   BAR CHART (pure CSS)
═══════════════════════════════════════════════════════════ */

const AttendanceBarChart = ({ data }: { data: AttendanceBySession[] }) => {
  if (data.length === 0) return null;

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#2B6F5E]" />
            حاضر
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#DC2626]/60" />
            غائب
          </span>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-2.5 max-h-[280px] overflow-y-auto scrollbar-thin pr-1">
        {data.map((session) => {
          const presentWidth =
            maxTotal > 0 ? (session.present / maxTotal) * 100 : 0;
          const absentWidth =
            maxTotal > 0 ? (session.absent / maxTotal) * 100 : 0;

          return (
            <div key={session.session_id}>
              {/* Label row */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[#6B5D4F]/70 truncate max-w-[140px]">
                  {session.topic || formatShortDate(session.date)}
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: getRateColor(session.rate) }}
                >
                  {session.rate}%
                </span>
              </div>

              {/* Bar */}
              <div className="flex h-4 rounded-full overflow-hidden bg-[#D8CDC0]/10">
                <div
                  className="bg-[#2B6F5E] transition-all duration-500 rounded-r-full"
                  style={{ width: `${presentWidth}%` }}
                />
                <div
                  className="bg-[#DC2626]/50 transition-all duration-500"
                  style={{ width: `${absentWidth}%` }}
                />
              </div>

              {/* Counts */}
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#6B5D4F]/40">
                <span>{session.present} حاضر</span>
                <span>{session.absent} غائب</span>
                <span className="mr-auto">{formatShortDate(session.date)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SECTION CARD WRAPPER
═══════════════════════════════════════════════════════════ */

const SectionCard = ({
  title,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  children,
  empty,
  emptyIcon: EmptyIcon,
  emptyMessage,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  children?: React.ReactNode;
  empty?: boolean;
  emptyIcon?: React.ElementType;
  emptyMessage?: string;
}) => (
  <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#D8CDC0]/25">
      <div
        className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}
      >
        <Icon className={`w-[18px] h-[18px] ${iconColor}`} />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-[#1B1B1B]">{title}</h2>
        {subtitle && (
          <p className="text-[11px] text-[#6B5D4F]/50">{subtitle}</p>
        )}
      </div>
    </div>

    <div className="p-5">
      {empty && EmptyIcon && emptyMessage ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#D8CDC0]/15 flex items-center justify-center mb-3">
            <EmptyIcon className="w-5 h-5 text-[#BEB29E]" />
          </div>
          <p className="text-sm text-[#6B5D4F]/60">{emptyMessage}</p>
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

export default function TeacherGroupStats() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data, isLoading, isError } = useGroupStats(groupId!);

  if (isLoading) return <StatsSkeleton />;

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
          تعذّر تحميل الإحصائيات
        </h3>
        <p className="text-sm text-[#6B5D4F]/70">يرجى المحاولة لاحقاً</p>
        <Link
          to="/teacher/groups"
          className="mt-4 text-sm font-medium text-[#2B6F5E] hover:underline"
        >
          العودة للمجموعات
        </Link>
      </div>
    );
  }

  const stats = data as GroupStatsData;
  const { group, overview, attendance, exams, most_absent } = stats;

  return (
    <div dir="rtl" className="space-y-6 pb-8">
      {/* ══════════════════════════════════════════
         BREADCRUMB
      ══════════════════════════════════════════ */}
      <nav className="flex items-center gap-1.5 text-sm text-[#6B5D4F]/60 flex-wrap">
        <Link
          to="/teacher/groups"
          className="hover:text-[#2B6F5E] transition-colors"
        >
          مجموعاتي
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <Link
          to={`/teacher/groups/${groupId}`}
          className="hover:text-[#2B6F5E] transition-colors truncate max-w-[120px]"
        >
          {group.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-[#1B1B1B] font-medium">الإحصائيات</span>
      </nav>

      {/* ══════════════════════════════════════════
         PAGE HEADER
      ══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B]">
            إحصائيات {group.name}
          </h1>
          <p className="text-sm text-[#6B5D4F]/70 mt-0.5">
            {group.course.course_name} · {group.level || "—"}
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
         OVERVIEW STATS
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "الطلاب",
            value: `${overview.student_count}/${overview.capacity}`,
            sub: `${overview.fill_rate}% امتلاء`,
            icon: Users,
            color: "teal" as const,
          },
          {
            label: "الحصص المنجزة",
            value: overview.past_sessions,
            sub: `${overview.upcoming_sessions} قادمة`,
            icon: CalendarDays,
            color: "gold" as const,
          },
          {
            label: "نسبة الحضور",
            value: `${attendance.rate}%`,
            sub: `${attendance.present} حاضر`,
            icon: UserCheck,
            color: "green" as const,
          },
          {
            label: "الامتحانات",
            value: exams.length,
            sub:
              exams.length > 0 ? `معدل نجاح ${exams[0].pass_rate}%` : "لا يوجد",
            icon: Award,
            color: "beige" as const,
          },
        ].map((stat) => {
          const colors = {
            teal: {
              bg: "bg-[#2B6F5E]/8",
              icon: "text-[#2B6F5E]",
              val: "text-[#2B6F5E]",
            },
            gold: {
              bg: "bg-[#C4A035]/8",
              icon: "text-[#C4A035]",
              val: "text-[#C4A035]",
            },
            green: {
              bg: "bg-[#8DB896]/12",
              icon: "text-[#3D7A4A]",
              val: "text-[#3D7A4A]",
            },
            beige: {
              bg: "bg-[#D8CDC0]/20",
              icon: "text-[#6B5D4F]",
              val: "text-[#6B5D4F]",
            },
          };
          const c = colors[stat.color];
          return (
            <div
              key={stat.label}
              className="relative bg-white rounded-xl border border-[#D8CDC0]/40 p-4 overflow-hidden"
            >
              <div
                className={`absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b ${
                  stat.color === "teal"
                    ? "from-[#2B6F5E] to-[#2B6F5E]/40"
                    : stat.color === "gold"
                      ? "from-[#C4A035] to-[#C4A035]/40"
                      : stat.color === "green"
                        ? "from-[#8DB896] to-[#8DB896]/40"
                        : "from-[#BEB29E] to-[#BEB29E]/40"
                } opacity-50`}
              />
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}
                >
                  <stat.icon className={`w-[18px] h-[18px] ${c.icon}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-lg font-bold leading-tight ${c.val}`}>
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-[#6B5D4F]/50 truncate">
                    {stat.sub}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-[#6B5D4F]/40 mt-2 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
         ATTENDANCE SECTION (chart + ring)
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart (2/3) */}
        <div className="lg:col-span-2">
          <SectionCard
            title="الحضور حسب الحصة"
            subtitle={`${attendance.by_session.length} حصة مسجّلة`}
            icon={BarChart3}
            iconBg="bg-[#2B6F5E]/8"
            iconColor="text-[#2B6F5E]"
            empty={attendance.by_session.length === 0}
            emptyIcon={ClipboardCheck}
            emptyMessage="لا توجد سجلات حضور بعد"
          >
            <AttendanceBarChart data={attendance.by_session} />
          </SectionCard>
        </div>

        {/* Ring + summary (1/3) */}
        <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#D8CDC0]/25">
            <div className="w-9 h-9 rounded-lg bg-[#8DB896]/12 flex items-center justify-center">
              <TrendingUp className="w-[18px] h-[18px] text-[#3D7A4A]" />
            </div>
            <h2 className="text-sm font-semibold text-[#1B1B1B]">
              ملخص الحضور
            </h2>
          </div>

          <div className="p-5 flex flex-col items-center">
            <AttendanceRing rate={attendance.rate} />

            <div className="w-full mt-6 space-y-3">
              {[
                {
                  label: "إجمالي السجلات",
                  value: attendance.total_records,
                  icon: ClipboardCheck,
                },
                { label: "حاضر", value: attendance.present, icon: UserCheck },
                { label: "غائب", value: attendance.absent, icon: UserX },
                {
                  label: "الحصص المنجزة",
                  value: overview.past_sessions,
                  icon: CalendarDays,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2 text-xs text-[#6B5D4F]/70">
                    <item.icon className="w-3.5 h-3.5 text-[#BEB29E]" />
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-[#1B1B1B]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
         EXAMS + MOST ABSENT
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exams (2/3) */}
        <div className="lg:col-span-2">
          <SectionCard
            title="نتائج الامتحانات"
            subtitle={`${exams.length} امتحان`}
            icon={Award}
            iconBg="bg-[#C4A035]/8"
            iconColor="text-[#C4A035]"
            empty={exams.length === 0}
            emptyIcon={Award}
            emptyMessage="لا توجد امتحانات لهذه المجموعة"
          >
            <div className="space-y-3">
              {exams.map((exam) => (
                <div
                  key={exam.exam_id}
                  className="p-4 rounded-xl bg-[#FAFAF8] border border-[#D8CDC0]/20 hover:border-[#D8CDC0]/40 transition-all"
                >
                  {/* Exam header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[#1B1B1B]">
                        {exam.exam_name || "امتحان"}
                      </h3>
                      <p className="text-[11px] text-[#6B5D4F]/50 mt-0.5">
                        {formatFullDate(exam.exam_date)} · الدرجة القصوى:{" "}
                        {exam.max_marks}
                      </p>
                    </div>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 mr-2"
                      style={{
                        color: getRateColor(exam.pass_rate),
                        backgroundColor: `${getRateColor(exam.pass_rate)}15`,
                      }}
                    >
                      نجاح {exam.pass_rate}%
                    </span>
                  </div>

                  {/* Exam stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: "المعدل",
                        value: `${exam.average}/${exam.max_marks}`,
                        sub: `${exam.average_percent}%`,
                      },
                      { label: "الأعلى", value: exam.highest },
                      { label: "الأدنى", value: exam.lowest },
                      { label: "تم تصحيحهم", value: exam.students_graded },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="text-[10px] text-[#6B5D4F]/50 uppercase tracking-wide mb-0.5">
                          {s.label}
                        </p>
                        <p className="text-sm font-bold text-[#1B1B1B]">
                          {s.value}
                        </p>
                        {s.sub && (
                          <p className="text-[10px] text-[#2B6F5E] font-medium">
                            {s.sub}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Average bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-[#D8CDC0]/15 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${exam.average_percent}%`,
                          backgroundColor: getRateColor(exam.average_percent),
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Most absent (1/3) */}
        <SectionCard
          title="الأكثر غياباً"
          subtitle="أعلى 5 طلاب"
          icon={UserX}
          iconBg="bg-red-500/8"
          iconColor="text-red-500"
          empty={most_absent.length === 0}
          emptyIcon={UserCheck}
          emptyMessage="لا يوجد غيابات مسجّلة"
        >
          <div className="space-y-2">
            {most_absent.map((item, idx) => {
              if (!item.student) return null;
              const s = item.student;
              const maxAbsences = most_absent[0]?.absences || 1;
              const barWidth = Math.round((item.absences / maxAbsences) * 100);

              return (
                <Link
                  key={s.student_id}
                  to={`/teacher/students/${s.student_id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FAFAF8] transition-all group/abs"
                >
                  {/* Rank */}
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      idx === 0
                        ? "bg-red-500/10 text-red-500"
                        : idx === 1
                          ? "bg-[#C4A035]/10 text-[#C4A035]"
                          : "bg-[#D8CDC0]/20 text-[#6B5D4F]/60"
                    }`}
                  >
                    {idx + 1}
                  </span>

                  {/* Avatar */}
                  {s.avatar_url ? (
                    <img
                      src={s.avatar_url}
                      alt={`${s.first_name} ${s.last_name}`}
                      className="w-8 h-8 rounded-full object-cover border-2 border-[#D8CDC0]/30 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#D8CDC0]/15 border-2 border-[#D8CDC0]/30 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold text-[#6B5D4F]">
                        {getInitials(s.first_name, s.last_name)}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1B1B1B] group-hover/abs:text-[#2B6F5E] transition-colors truncate">
                      {s.first_name} {s.last_name}
                    </p>
                    {/* Mini bar */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-[#D8CDC0]/15 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-400/70 rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-red-500 shrink-0">
                        {item.absences}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* ══════════════════════════════════════════
         SESSIONS BREAKDOWN (if data)
      ══════════════════════════════════════════ */}
      {overview.total_sessions > 0 && (
        <SectionCard
          title="توزيع الحصص"
          subtitle={`${overview.total_sessions} حصة إجمالاً`}
          icon={Target}
          iconBg="bg-[#D8CDC0]/20"
          iconColor="text-[#6B5D4F]"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-[#2B6F5E]/5 border border-[#2B6F5E]/10">
              <p className="text-2xl font-bold text-[#2B6F5E]">
                {overview.past_sessions}
              </p>
              <p className="text-[11px] text-[#6B5D4F]/60 mt-1">منجزة</p>
            </div>
            <div className="p-4 rounded-xl bg-[#C4A035]/5 border border-[#C4A035]/10">
              <p className="text-2xl font-bold text-[#C4A035]">
                {overview.upcoming_sessions}
              </p>
              <p className="text-[11px] text-[#6B5D4F]/60 mt-1">قادمة</p>
            </div>
            <div className="p-4 rounded-xl bg-[#D8CDC0]/10 border border-[#D8CDC0]/20">
              <p className="text-2xl font-bold text-[#1B1B1B]">
                {overview.total_sessions}
              </p>
              <p className="text-[11px] text-[#6B5D4F]/60 mt-1">إجمالي</p>
            </div>
          </div>

          {/* Capacity info */}
          <div className="mt-4 p-3 rounded-lg bg-[#FAFAF8] flex items-center justify-between">
            <span className="text-xs text-[#6B5D4F]/60">
              نسبة امتلاء المجموعة
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-[#D8CDC0]/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getRateBg(overview.fill_rate)}`}
                  style={{ width: `${overview.fill_rate}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#1B1B1B]">
                {overview.fill_rate}%
              </span>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
