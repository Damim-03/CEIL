import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Users,
  CalendarDays,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  ClipboardCheck,
  BookOpen,
  AlertCircle,
  GraduationCap,
  TrendingUp,
  Search,
  UserCheck,
  UserX,
  Eye,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useGroupDetails } from "../../../../hooks/teacher/Useteacher";
import { useLanguage } from "../../../../hooks/useLanguage";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */

interface StudentInfo {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  avatar: string | null;
  enrollment_status: string;
}

interface SessionInfo {
  session_id: string;
  session_date: string;
  topic: string | null;
  _count: { attendance: number };
}

interface GroupDetailsData {
  group_id: string;
  name: string;
  level: string;
  status: string;
  max_students: number;
  created_at: string;
  course: {
    course_id: string;
    course_name: string;
    course_code: string;
    credits: number;
  };
  department: { department_id: string; name: string } | null;
  students: StudentInfo[];
  sessions: SessionInfo[];
  student_count: number;
  session_count: number;
  stats: {
    attendance_rate: number;
    total_sessions: number;
    total_attendance_records: number;
    present_count: number;
  };
  enrollments: any[];
  _count: { enrollments: number; sessions: number };
}

type TabKey = "students" | "sessions";

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

const getLocale = (lang: string) =>
  lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US";

const useStatusMap = () => {
  const { t } = useLanguage();
  return {
    ACTIVE: {
      label: t("teacher.groupDetails.active"),
      bg: "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10",
      text: "text-[#2B6F5E] dark:text-[#4ADE80]",
      dot: "bg-[#2B6F5E] dark:bg-[#4ADE80]",
    },
    INACTIVE: {
      label: t("teacher.groupDetails.inactive"),
      bg: "bg-[#BEB29E]/15 dark:bg-[#888888]/15",
      text: "text-[#6B5D4F] dark:text-[#AAAAAA]",
      dot: "bg-[#BEB29E]",
    },
    COMPLETED: {
      label: t("teacher.groupDetails.completed"),
      bg: "bg-[#C4A035]/10 dark:bg-[#C4A035]/10",
      text: "text-[#C4A035] dark:text-[#C4A035]",
      dot: "bg-[#C4A035]",
    },
  } as Record<string, { label: string; bg: string; text: string; dot: string }>;
};

const useEnrollmentLabels = () => {
  const { t } = useLanguage();
  return {
    PAID: {
      label: t("teacher.groupDetails.paid"),
      bg: "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]",
    },
    VALIDATED: {
      label: t("teacher.groupDetails.validated"),
      bg: "bg-[#C4A035]/10 dark:bg-[#C4A035]/10 text-[#C4A035] dark:text-[#C4A035]",
    },
    FINISHED: {
      label: t("teacher.groupDetails.finished"),
      bg: "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20 text-[#6B5D4F] dark:text-[#AAAAAA]",
    },
  } as Record<string, { label: string; bg: string }>;
};

const getInitials = (first: string, last: string) =>
  `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();

/* ═══════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════ */

const DetailsSkeleton = ({ rtl }: { rtl: boolean }) => (
  <div className="space-y-6 animate-pulse" dir={rtl ? "rtl" : "ltr"}>
    <div className="flex items-center gap-2">
      <div className="h-5 w-20 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded" />
      <div className="h-5 w-5 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded" />
      <div className="h-5 w-32 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded" />
    </div>
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] p-6 h-[160px]" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[80px]"
        />
      ))}
    </div>
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[400px]" />
  </div>
);

/* ═══════════════════════════════════════════════════════════
   ATTENDANCE RING
═══════════════════════════════════════════════════════════ */

const AttendanceRing = ({
  rate,
  size = 64,
}: {
  rate: number;
  size?: number;
}) => {
  const r = size * 0.38;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (rate / 100) * circumference;
  const color = rate >= 75 ? "#2B6F5E" : rate >= 50 ? "#C4A035" : "#DC2626";
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
          strokeWidth="5"
          opacity="0.25"
        />
        <circle
          cx={half}
          cy={half}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
          {rate}%
        </span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   AVATAR
═══════════════════════════════════════════════════════════ */

const StudentAvatar = ({ student }: { student: StudentInfo }) => {
  const src = student.avatar || student.avatar_url;
  const initials = getInitials(student.first_name, student.last_name);

  if (src) {
    return (
      <img
        src={src}
        alt={`${student.first_name} ${student.last_name}`}
        className="w-9 h-9 rounded-full object-cover border-2 border-[#D8CDC0]/30 dark:border-[#2A2A2A]"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/10 dark:bg-[#4ADE80]/10 border-2 border-[#D8CDC0]/3 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/80 flex items-center justify-center">
      <span className="text-xs font-semibold text-[#2B6F5E] dark:text-[#4ADE80]">
        {initials}
      </span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

export default function TeacherGroupDetails() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data, isLoading, isError } = useGroupDetails(groupId!);
  const { t, dir, isRTL, currentLang } = useLanguage();
  const statusMap = useStatusMap();
  const enrollmentLabels = useEnrollmentLabels();
  const [activeTab, setActiveTab] = useState<TabKey>("students");
  const [studentSearch, setStudentSearch] = useState("");

  const locale = getLocale(currentLang);
  const BreadcrumbChev = isRTL ? ChevronLeft : ChevronRight;
  const StatsArrow = isRTL ? ArrowLeft : ArrowRight;

  if (isLoading) return <DetailsSkeleton rtl={isRTL} />;

  if (isError || !data) {
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
          {t("teacher.groupDetails.errorTitle")}
        </h3>
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {t("teacher.groupDetails.errorDesc")}
        </p>
        <Link
          to="/teacher/groups"
          className="mt-4 text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:underline"
        >
          {t("teacher.groupDetails.backToGroups")}
        </Link>
      </div>
    );
  }

  const group = data as GroupDetailsData;
  const status = statusMap[group.status] ?? {
    label: group.status,
    bg: "bg-gray-100 dark:bg-gray-800/30",
    text: "text-gray-600 dark:text-gray-400 dark:text-gray-500",
    dot: "bg-gray-400 dark:bg-gray-500",
  };
  const fillPercent =
    group.max_students > 0
      ? Math.min(
          Math.round((group.student_count / group.max_students) * 100),
          100,
        )
      : 0;

  const filteredStudents = studentSearch.trim()
    ? group.students.filter((s) => {
        const q = studentSearch.trim().toLowerCase();
        return (
          s.first_name.toLowerCase().includes(q) ||
          s.last_name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
        );
      })
    : group.students;

  const tabs: {
    key: TabKey;
    label: string;
    icon: React.ElementType;
    count: number;
  }[] = [
    {
      key: "students",
      label: t("teacher.groupDetails.students"),
      icon: Users,
      count: group.student_count,
    },
    {
      key: "sessions",
      label: t("teacher.groupDetails.sessions"),
      icon: CalendarDays,
      count: group.session_count,
    },
  ];

  const statsItems = [
    {
      label: t("teacher.groupDetails.students"),
      value: group.student_count,
      icon: Users,
      color: "teal" as const,
    },
    {
      label: t("teacher.groupDetails.sessions"),
      value: group.session_count,
      icon: CalendarDays,
      color: "gold" as const,
    },
    {
      label: t("teacher.groupDetails.presentCount"),
      value: group.stats.present_count,
      icon: UserCheck,
      color: "green" as const,
    },
    {
      label: t("teacher.groupDetails.attendanceRecords"),
      value: group.stats.total_attendance_records,
      icon: ClipboardCheck,
      color: "beige" as const,
    },
  ];

  const colorMap = {
    teal: {
      bg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8",
      icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
      val: "text-[#2B6F5E] dark:text-[#4ADE80]",
    },
    gold: {
      bg: "bg-[#C4A035]/8 dark:bg-[#C4A035]/8",
      icon: "text-[#C4A035] dark:text-[#C4A035]",
      val: "text-[#C4A035] dark:text-[#C4A035]",
    },
    green: {
      bg: "bg-[#8DB896]/12 dark:bg-[#4ADE80]/12",
      icon: "text-[#3D7A4A] dark:text-[#4ADE80]",
      val: "text-[#3D7A4A] dark:text-[#4ADE80]",
    },
    beige: {
      bg: "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20",
      icon: "text-[#6B5D4F] dark:text-[#AAAAAA]",
      val: "text-[#6B5D4F] dark:text-[#AAAAAA]",
    },
  };

  return (
    <div dir={dir} className="space-y-6 pb-8">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 text-sm text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
        <Link
          to="/teacher/groups"
          className="hover:text-[#2B6F5E] dark:text-[#4ADE80] transition-colors"
        >
          {t("teacher.groupDetails.myGroups")}
        </Link>
        <BreadcrumbChev className="w-3.5 h-3.5" />
        <span className="text-[#1B1B1B] dark:text-[#E5E5E5] font-medium truncate max-w-[200px]">
          {group.name}
        </span>
      </nav>

      {/* HEADER CARD */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
        <div
          className={`h-1.5 bg-gradient-to-${isRTL ? "l" : "r"} from-[#2B6F5E] dark:from-[#4ADE80] via-[#2B6F5E]/50 to-transparent`}
        />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {group.name}
                </h1>
                <span
                  className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>

              <div className="flex items-center gap-4 flex-wrap text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#2B6F5E]/50 dark:text-[#4ADE80]/50" />
                  {group.course.course_name}
                </span>
                {group.course.course_code && (
                  <span className="text-xs font-mono text-[#BEB29E] dark:text-[#888888] bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 px-2 py-0.5 rounded">
                    {group.course.course_code}
                  </span>
                )}
                {group.level && (
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-[#8DB896]/70 dark:text-[#4ADE80]/70" />
                    {group.level}
                  </span>
                )}
                {group.department && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#BEB29E] dark:text-[#888888]" />
                    {group.department.name}
                  </span>
                )}
              </div>

              {group.max_students > 0 && (
                <div className="mt-4 max-w-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
                      {t("teacher.groupDetails.capacity")}
                    </span>
                    <span className="text-[11px] text-[#6B5D4F] dark:text-[#AAAAAA]">
                      <span className="font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
                        {group.student_count}
                      </span>
                      <span className="text-[#BEB29E] dark:text-[#888888]">
                        {" "}
                        / {group.max_students}
                      </span>
                      <span className="text-[#BEB29E] dark:text-[#888888] ms-1">
                        ({fillPercent}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${fillPercent >= 90 ? "bg-[#C4A035]" : fillPercent >= 60 ? "bg-[#2B6F5E] dark:bg-[#4ADE80]" : "bg-[#8DB896]"}`}
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1 shrink-0">
              <AttendanceRing rate={group.stats.attendance_rate} size={72} />
              <span className="text-[10px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
                {t("teacher.groupDetails.attendanceRate")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsItems.map((stat) => {
          const c = colorMap[stat.color];
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] px-4 py-3 flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}
              >
                <stat.icon className={`w-[18px] h-[18px] ${c.icon}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl font-bold leading-tight ${c.val}`}>
                  {stat.value}
                </p>
                <p className="text-[11px] text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] truncate">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* STATS LINK */}
      <Link
        to={`/teacher/groups/${groupId}/stats`}
        className={`flex items-center justify-between bg-gradient-to-${isRTL ? "l" : "r"} from-[#2B6F5E] dark:from-[#4ADE80]/5 to-transparent border border-[#2B6F5E]/1 dark:border-[#4ADE80]/10 dark:border-[#4ADE80]/10 rounded-xl px-5 py-3.5 group hover:border-[#2B6F5E]/25 dark:border-[#4ADE80]/25 transition-all`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/10 dark:bg-[#4ADE80]/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {t("teacher.groupDetails.detailedStats")}
            </p>
            <p className="text-[11px] text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
              {t("teacher.groupDetails.detailedStatsDesc")}
            </p>
          </div>
        </div>
        <StatsArrow className="w-5 h-5 text-[#BEB29E] dark:text-[#888888] group-hover:text-[#2B6F5E] dark:text-[#4ADE80] transition-all" />
      </Link>

      {/* TABS */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
        <div className="flex border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all relative ${isActive ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60 hover:text-[#6B5D4F] dark:text-[#AAAAAA]"}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]" : "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20 text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50"}`}
                >
                  {tab.count}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-[#2B6F5E] dark:bg-[#4ADE80] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* TAB: STUDENTS */}
        {activeTab === "students" && (
          <div>
            {group.students.length > 0 && (
              <div className="px-4 pt-4">
                <div className="relative max-w-sm">
                  <Search
                    className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
                  />
                  <input
                    type="text"
                    placeholder={t("teacher.groupDetails.searchStudent")}
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className={`w-full h-10 ${isRTL ? "pr-9 pl-4" : "pl-9 pr-4"} bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-lg text-sm text-[#1B1B1B] dark:text-[#E5E5E5] placeholder:text-[#BEB29E] dark:text-[#888888] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-1 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10 transition-all`}
                  />
                </div>
              </div>
            )}

            <div className="p-4">
              {group.students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-[#BEB29E] dark:text-[#888888]" />
                  </div>
                  <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
                    {t("teacher.groupDetails.noStudents")}
                  </p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
                    {t("teacher.groupDetails.noSearchResults", {
                      query: studentSearch,
                    })}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredStudents.map((student, index) => {
                    const enrollment =
                      enrollmentLabels[student.enrollment_status];
                    return (
                      <Link
                        key={student.student_id}
                        to={`/teacher/students/${student.student_id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FAFAF8] dark:hover:bg-[#222222] border border-transparent hover:border-[#D8CDC0]/30 dark:border-[#2A2A2A] transition-all group/row"
                      >
                        <span className="text-[11px] text-[#BEB29E] dark:text-[#888888] w-5 text-center shrink-0">
                          {index + 1}
                        </span>
                        <StudentAvatar student={student} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] group-hover/row:text-[#2B6F5E] dark:text-[#4ADE80] transition-colors truncate">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-[11px] text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] truncate">
                            {student.email}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${enrollment ? enrollment.bg : "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20 text-[#6B5D4F] dark:text-[#AAAAAA]"}`}
                        >
                          {enrollment
                            ? enrollment.label
                            : student.enrollment_status}
                        </span>
                        <Eye className="w-4 h-4 text-[#BEB29E] dark:text-[#888888] group-hover/row:text-[#2B6F5E] dark:text-[#4ADE80] shrink-0 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: SESSIONS */}
        {activeTab === "sessions" && (
          <div className="p-4">
            {group.sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center mb-3">
                  <CalendarDays className="w-6 h-6 text-[#BEB29E] dark:text-[#888888]" />
                </div>
                <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
                  {t("teacher.groupDetails.noSessions")}
                </p>
                <Link
                  to="/teacher/sessions"
                  className="mt-3 text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:underline"
                >
                  {t("teacher.groupDetails.createSession")}
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {group.sessions.map((session) => {
                  const isPast = new Date(session.session_date) < new Date();
                  const hasAttendance = session._count.attendance > 0;

                  return (
                    <Link
                      key={session.session_id}
                      to="/teacher/sessions"
                      className="flex items-center gap-4 p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#111111] hover:bg-[#F5F3EF] dark:hover:bg-[#222222] border border-transparent hover:border-[#D8CDC0]/30 dark:border-[#2A2A2A] transition-all group/sess"
                    >
                      <div
                        className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 ${isPast ? "bg-[#D8CDC0]/15 dark:bg-[#2A2A2A]/15" : "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8"}`}
                      >
                        <span
                          className={`text-[11px] font-medium leading-tight ${isPast ? "text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50" : "text-[#2B6F5E]/70 dark:text-[#4ADE80]/70"}`}
                        >
                          {new Date(session.session_date).toLocaleDateString(
                            locale,
                            { weekday: "short" },
                          )}
                        </span>
                        <span
                          className={`text-lg font-bold leading-tight ${isPast ? "text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70" : "text-[#2B6F5E] dark:text-[#4ADE80]"}`}
                        >
                          {new Date(session.session_date).getDate()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                          {session.topic || t("teacher.groupDetails.noTopic")}
                        </p>
                        <p className="text-[11px] text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] mt-0.5">
                          {new Date(session.session_date).toLocaleDateString(
                            locale,
                            { year: "numeric", month: "long", day: "numeric" },
                          )}
                        </p>
                      </div>

                      {hasAttendance ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 px-2.5 py-1 rounded-full shrink-0">
                          <UserCheck className="w-3 h-3" />
                          {session._count.attendance}
                        </span>
                      ) : isPast ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C4A035] dark:text-[#C4A035] dark:text-[#C4A035] bg-[#C4A035]/8 dark:bg-[#C4A035]/10 dark:bg-[#C4A035]/10 px-2.5 py-1 rounded-full shrink-0">
                          <UserX className="w-3 h-3" />
                          {t("teacher.groupDetails.notRecorded")}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#BEB29E] dark:text-[#888888] shrink-0">
                          {t("teacher.groupDetails.upcoming")}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {group.session_count > group.sessions.length && (
                  <div className="text-center pt-2">
                    <Link
                      to={`/teacher/sessions?group_id=${groupId}`}
                      className="text-xs font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:underline"
                    >
                      {t("teacher.groupDetails.viewAllSessions", {
                        count: group.session_count,
                      })}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
