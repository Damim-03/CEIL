import { useParams, Link } from "react-router-dom";
import {
  Users,
  CalendarDays,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  ClipboardCheck,
  AlertCircle,
  TrendingUp,
  UserCheck,
  UserX,
  Award,
  Target,
} from "lucide-react";
import { useGroupStats } from "../../../../hooks/teacher/Useteacher";
import { useLanguage } from "../../../../hooks/useLanguage";

/* ═══ TYPES ═══ */
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
    course: { course_id: string; course_name: string };
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

/* ═══ HELPERS ═══ */
const getLocale = (lang: string) =>
  lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US";
const getRateColor = (r: number) =>
  r >= 75 ? "#2B6F5E" : r >= 50 ? "#C4A035" : "#DC2626";
const getRateBg = (r: number) =>
  r >= 75
    ? "bg-[#2B6F5E] dark:bg-[#4ADE80]"
    : r >= 50
      ? "bg-[#C4A035]"
      : "bg-red-50 dark:bg-red-950/200";
const getInitials = (f: string, l: string) =>
  `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();

/* ═══ SKELETON ═══ */
const StatsSkeleton = ({ rtl }: { rtl: boolean }) => (
  <div className="space-y-6 animate-pulse" dir={rtl ? "rtl" : "ltr"}>
    <div className="flex items-center gap-2">
      {[20, 5, 24, 5, 20].map((w, i) => (
        <div
          key={i}
          className={`h-5 w-${w} bg-[#D8CDC0]/${i % 2 ? 20 : 30} rounded`}
        />
      ))}
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[80px]"
        />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[350px]" />
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[350px]" />
    </div>
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[300px]" />
  </div>
);

/* ═══ RING ═══ */
const AttendanceRing = ({ rate, label }: { rate: number; label: string }) => {
  const size = 120,
    r = 46,
    c = 2 * Math.PI * r,
    off = c - (rate / 100) * c,
    col = getRateColor(rate),
    h = size / 2;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={h}
          cy={h}
          r={r}
          fill="none"
          stroke="#D8CDC0"
          strokeWidth="8"
          opacity="0.2"
        />
        <circle
          cx={h}
          cy={h}
          r={r}
          fill="none"
          stroke={col}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
          {rate}%
        </span>
        <span className="text-[10px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
          {label}
        </span>
      </div>
    </div>
  );
};

/* ═══ BAR CHART ═══ */
const AttendanceBarChart = ({
  data,
  lang,
  presentLabel,
  absentLabel,
}: {
  data: AttendanceBySession[];
  lang: string;
  presentLabel: string;
  absentLabel: string;
}) => {
  if (data.length === 0) return null;
  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const locale = getLocale(lang);
  const fmtShort = (d: string) =>
    new Date(d).toLocaleDateString(locale, { month: "short", day: "numeric" });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-[11px]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#2B6F5E] dark:bg-[#4ADE80]" />
          {presentLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#DC2626]/60 dark:bg-[#DC2626]/60" />
          {absentLabel}
        </span>
      </div>
      <div className="space-y-2.5 max-h-[280px] overflow-y-auto scrollbar-thin pe-1">
        {data.map((session) => {
          const pw = maxTotal > 0 ? (session.present / maxTotal) * 100 : 0;
          const aw = maxTotal > 0 ? (session.absent / maxTotal) * 100 : 0;
          return (
            <div key={session.session_id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] truncate max-w-[140px]">
                  {session.topic || fmtShort(session.date)}
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: getRateColor(session.rate) }}
                >
                  {session.rate}%
                </span>
              </div>
              <div className="flex h-4 rounded-full overflow-hidden bg-[#D8CDC0]/10 dark:bg-[#2A2A2A]/10">
                <div
                  className="bg-[#2B6F5E] dark:bg-[#4ADE80] transition-all duration-500 rounded-e-full"
                  style={{ width: `${pw}%` }}
                />
                <div
                  className="bg-[#DC2626]/50 dark:bg-[#DC2626]/50 transition-all duration-500"
                  style={{ width: `${aw}%` }}
                />
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#6B5D4F]/40 dark:text-[#AAAAAA]/40">
                <span>
                  {session.present} {presentLabel}
                </span>
                <span>
                  {session.absent} {absentLabel}
                </span>
                <span className="ms-auto">{fmtShort(session.date)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══ SECTION CARD ═══ */
const SectionCard = ({
  title,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  children,
  empty,
  emptyIcon: EI,
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
  <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#D8CDC0]/25 dark:border-[#2A2A2A]">
      <div
        className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}
      >
        <Icon className={`w-[18px] h-[18px] ${iconColor}`} />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    <div className="p-5">
      {empty && EI && emptyMessage ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center mb-3">
            <EI className="w-5 h-5 text-[#BEB29E] dark:text-[#888888]" />
          </div>
          <p className="text-sm text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
            {emptyMessage}
          </p>
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function TeacherGroupStats() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data, isLoading, isError } = useGroupStats(groupId!);
  const { t, dir, isRTL, currentLang } = useLanguage();
  const locale = getLocale(currentLang);
  const Chev = isRTL ? ChevronLeft : ChevronRight;

  const fmtFull = (d: string) =>
    new Date(d).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (isLoading) return <StatsSkeleton rtl={isRTL} />;

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
          {t("teacher.groupStats.errorTitle")}
        </h3>
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {t("teacher.groupStats.errorDesc")}
        </p>
        <Link
          to="/teacher/groups"
          className="mt-4 text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:underline"
        >
          {t("teacher.groupStats.backToGroups")}
        </Link>
      </div>
    );

  const stats = data as GroupStatsData;
  const { group, overview, attendance, exams, most_absent } = stats;

  const colorMap = {
    teal: {
      bg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8",
      icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
      val: "text-[#2B6F5E] dark:text-[#4ADE80]",
      bar: "from-[#2B6F5E] dark:from-[#4ADE80] to-[#2B6F5E]/40",
    },
    gold: {
      bg: "bg-[#C4A035]/8 dark:bg-[#C4A035]/8",
      icon: "text-[#C4A035] dark:text-[#C4A035]",
      val: "text-[#C4A035] dark:text-[#C4A035]",
      bar: "from-[#C4A035] to-[#C4A035] dark:to-[#C4A035]/40",
    },
    green: {
      bg: "bg-[#8DB896]/12 dark:bg-[#4ADE80]/12",
      icon: "text-[#3D7A4A] dark:text-[#4ADE80]",
      val: "text-[#3D7A4A] dark:text-[#4ADE80]",
      bar: "from-[#8DB896] to-[#8DB896]/40",
    },
    beige: {
      bg: "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20",
      icon: "text-[#6B5D4F] dark:text-[#AAAAAA]",
      val: "text-[#6B5D4F] dark:text-[#AAAAAA]",
      bar: "from-[#BEB29E] dark:from-[#888888] to-[#BEB29E]/40",
    },
  };

  const overviewStats = [
    {
      label: t("teacher.groupStats.students"),
      value: `${overview.student_count}/${overview.capacity}`,
      sub: t("teacher.groupStats.fillRate", { rate: overview.fill_rate }),
      icon: Users,
      color: "teal" as const,
    },
    {
      label: t("teacher.groupStats.completedSessions"),
      value: overview.past_sessions,
      sub: t("teacher.groupStats.upcomingCount", {
        count: overview.upcoming_sessions,
      }),
      icon: CalendarDays,
      color: "gold" as const,
    },
    {
      label: t("teacher.groupStats.attendanceRate"),
      value: `${attendance.rate}%`,
      sub: t("teacher.groupStats.presentCount", { count: attendance.present }),
      icon: UserCheck,
      color: "green" as const,
    },
    {
      label: t("teacher.groupStats.exams"),
      value: exams.length,
      sub:
        exams.length > 0
          ? t("teacher.groupStats.passRate", { rate: exams[0].pass_rate })
          : t("teacher.groupStats.none"),
      icon: Award,
      color: "beige" as const,
    },
  ];

  return (
    <div dir={dir} className="space-y-6 pb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] flex-wrap">
        <Link
          to="/teacher/groups"
          className="hover:text-[#2B6F5E] dark:text-[#4ADE80] transition-colors"
        >
          {t("teacher.groupStats.myGroups")}
        </Link>
        <Chev className="w-3.5 h-3.5" />
        <Link
          to={`/teacher/groups/${groupId}`}
          className="hover:text-[#2B6F5E] dark:text-[#4ADE80] transition-colors truncate max-w-[120px]"
        >
          {group.name}
        </Link>
        <Chev className="w-3.5 h-3.5" />
        <span className="text-[#1B1B1B] dark:text-[#E5E5E5] font-medium">
          {t("teacher.groupStats.statistics")}
        </span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
          {t("teacher.groupStats.statsOf", { name: group.name })}
        </h1>
        <p className="text-sm text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] mt-0.5">
          {group.course.course_name} · {group.level || "—"}
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {overviewStats.map((stat) => {
          const c = colorMap[stat.color];
          return (
            <div
              key={stat.label}
              className="relative bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] p-4 overflow-hidden"
            >
              <div
                className={`absolute ${isRTL ? "right-0" : "left-0"} top-0 bottom-0 w-1 bg-gradient-to-b ${c.bar} opacity-50`}
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
                  <p className="text-[11px] text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] truncate">
                    {stat.sub}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-[#6B5D4F]/4 dark:text-[#AAAAAA]/40 dark:text-[#666666] mt-2 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Attendance Chart + Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard
            title={t("teacher.groupStats.attendanceBySession")}
            subtitle={t("teacher.groupStats.sessionsRecorded", {
              count: attendance.by_session.length,
            })}
            icon={BarChart3}
            iconBg="bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8"
            iconColor="text-[#2B6F5E] dark:text-[#4ADE80]"
            empty={attendance.by_session.length === 0}
            emptyIcon={ClipboardCheck}
            emptyMessage={t("teacher.groupStats.noAttendanceYet")}
          >
            <AttendanceBarChart
              data={attendance.by_session}
              lang={currentLang}
              presentLabel={t("teacher.groupStats.present")}
              absentLabel={t("teacher.groupStats.absent")}
            />
          </SectionCard>
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#D8CDC0]/25 dark:border-[#2A2A2A]">
            <div className="w-9 h-9 rounded-lg bg-[#8DB896]/1 dark:bg-[#4ADE80]/12 dark:bg-[#4ADE80]/10 flex items-center justify-center">
              <TrendingUp className="w-[18px] h-[18px] text-[#3D7A4A] dark:text-[#4ADE80]" />
            </div>
            <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {t("teacher.groupStats.attendanceSummary")}
            </h2>
          </div>
          <div className="p-5 flex flex-col items-center">
            <AttendanceRing
              rate={attendance.rate}
              label={t("teacher.groupStats.attendance")}
            />
            <div className="w-full mt-6 space-y-3">
              {[
                {
                  label: t("teacher.groupStats.totalRecords"),
                  value: attendance.total_records,
                  icon: ClipboardCheck,
                },
                {
                  label: t("teacher.groupStats.present"),
                  value: attendance.present,
                  icon: UserCheck,
                },
                {
                  label: t("teacher.groupStats.absent"),
                  value: attendance.absent,
                  icon: UserX,
                },
                {
                  label: t("teacher.groupStats.completedSessions"),
                  value: overview.past_sessions,
                  icon: CalendarDays,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2 text-xs text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
                    <item.icon className="w-3.5 h-3.5 text-[#BEB29E] dark:text-[#888888]" />
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exams + Most Absent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard
            title={t("teacher.groupStats.examResults")}
            subtitle={t("teacher.groupStats.examCount", {
              count: exams.length,
            })}
            icon={Award}
            iconBg="bg-[#C4A035]/8 dark:bg-[#C4A035]/8"
            iconColor="text-[#C4A035] dark:text-[#C4A035]"
            empty={exams.length === 0}
            emptyIcon={Award}
            emptyMessage={t("teacher.groupStats.noExams")}
          >
            <div className="space-y-3">
              {exams.map((exam) => (
                <div
                  key={exam.exam_id}
                  className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/2 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/60 hover:border-[#D8CDC0]/40 dark:border-[#2A2A2A] transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                        {exam.exam_name || t("teacher.groupStats.exam")}
                      </h3>
                      <p className="text-[11px] text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] mt-0.5">
                        {fmtFull(exam.exam_date)} ·{" "}
                        {t("teacher.groupStats.maxMarks")}: {exam.max_marks}
                      </p>
                    </div>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ms-2"
                      style={{
                        color: getRateColor(exam.pass_rate),
                        backgroundColor: `${getRateColor(exam.pass_rate)}15`,
                      }}
                    >
                      {t("teacher.groupStats.pass")} {exam.pass_rate}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: t("teacher.groupStats.average"),
                        value: `${exam.average}/${exam.max_marks}`,
                        sub: `${exam.average_percent}%`,
                      },
                      {
                        label: t("teacher.groupStats.highest"),
                        value: exam.highest,
                      },
                      {
                        label: t("teacher.groupStats.lowest"),
                        value: exam.lowest,
                      },
                      {
                        label: t("teacher.groupStats.graded"),
                        value: exam.students_graded,
                      },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="text-[10px] text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] uppercase tracking-wide mb-0.5">
                          {s.label}
                        </p>
                        <p className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                          {s.value}
                        </p>
                        {"sub" in s && s.sub && (
                          <p className="text-[10px] text-[#2B6F5E] dark:text-[#4ADE80] font-medium">
                            {s.sub}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <div className="h-2 bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 rounded-full overflow-hidden">
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

        <SectionCard
          title={t("teacher.groupStats.mostAbsent")}
          subtitle={t("teacher.groupStats.top5")}
          icon={UserX}
          iconBg="bg-red-50 dark:bg-red-950/200/8"
          iconColor="text-red-500 dark:text-red-400"
          empty={most_absent.length === 0}
          emptyIcon={UserCheck}
          emptyMessage={t("teacher.groupStats.noAbsences")}
        >
          <div className="space-y-2">
            {most_absent.map((item, idx) => {
              if (!item.student) return null;
              const s = item.student;
              const maxAbs = most_absent[0]?.absences || 1;
              const barW = Math.round((item.absences / maxAbs) * 100);
              return (
                <Link
                  key={s.student_id}
                  to={`/teacher/students/${s.student_id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FAFAF8] dark:hover:bg-[#222222] transition-all group/abs"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${idx === 0 ? "bg-red-50 dark:bg-red-950/200/10 text-red-500 dark:text-red-400" : idx === 1 ? "bg-[#C4A035]/10 dark:bg-[#C4A035]/10 text-[#C4A035] dark:text-[#C4A035]" : "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20 text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60"}`}
                  >
                    {idx + 1}
                  </span>
                  {s.avatar_url ? (
                    <img
                      src={s.avatar_url}
                      alt={`${s.first_name} ${s.last_name}`}
                      className="w-8 h-8 rounded-full object-cover border-2 border-[#D8CDC0]/3 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/80 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 border-2 border-[#D8CDC0]/3 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/80 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold text-[#6B5D4F] dark:text-[#AAAAAA]">
                        {getInitials(s.first_name, s.last_name)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] group-hover/abs:text-[#2B6F5E] dark:text-[#4ADE80] transition-colors truncate">
                      {s.first_name} {s.last_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-400 dark:bg-red-500/70 rounded-full transition-all duration-500"
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-red-500 dark:text-red-400 shrink-0">
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

      {/* Sessions Breakdown */}
      {overview.total_sessions > 0 && (
        <SectionCard
          title={t("teacher.groupStats.sessionBreakdown")}
          subtitle={t("teacher.groupStats.totalSessionsCount", {
            count: overview.total_sessions,
          })}
          icon={Target}
          iconBg="bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20"
          iconColor="text-[#6B5D4F] dark:text-[#AAAAAA]"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border border-[#2B6F5E]/10 dark:border-[#4ADE80]/10">
              <p className="text-2xl font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
                {overview.past_sessions}
              </p>
              <p className="text-[11px] text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] mt-1">
                {t("teacher.groupStats.completed")}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#C4A035]/5 dark:bg-[#C4A035]/8 dark:bg-[#C4A035]/8 border border-[#C4A035]/10 dark:border-[#C4A035]/10">
              <p className="text-2xl font-bold text-[#C4A035] dark:text-[#C4A035]">
                {overview.upcoming_sessions}
              </p>
              <p className="text-[11px] text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] mt-1">
                {t("teacher.groupStats.upcoming")}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/10 dark:bg-[#2A2A2A]/15 border border-[#D8CDC0]/20 dark:border-[#2A2A2A]">
              <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {overview.total_sessions}
              </p>
              <p className="text-[11px] text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] mt-1">
                {t("teacher.groupStats.total")}
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-[#FAFAF8] dark:bg-[#111111] flex items-center justify-between">
            <span className="text-xs text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
              {t("teacher.groupStats.groupFillRate")}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getRateBg(overview.fill_rate)}`}
                  style={{ width: `${overview.fill_rate}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {overview.fill_rate}%
              </span>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
