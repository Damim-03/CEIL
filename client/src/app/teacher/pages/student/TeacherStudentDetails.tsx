import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  AlertCircle,
  UserCheck,
  UserX,
  CalendarDays,
  Award,
  Mail,
  ClipboardCheck,
  Clock,
  BookOpen,
  Layers,
} from "lucide-react";
import {
  useStudentAttendance,
  useStudentResults,
} from "../../../../hooks/teacher/Useteacher";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */

interface StudentInfo {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
}

interface AttendanceHistory {
  session_id: string;
  session_date: string;
  topic: string | null;
  group: {
    group_id: string;
    name: string;
    level: string;
    course: { course_name: string };
  };
  status: "PRESENT" | "ABSENT" | "NOT_RECORDED";
}

interface AttendanceSummary {
  total_sessions: number;
  recorded: number;
  present: number;
  absent: number;
  not_recorded: number;
  attendance_rate: number;
}

interface AttendanceData {
  student: StudentInfo;
  summary: AttendanceSummary;
  history: AttendanceHistory[];
}

interface ExamResult {
  result_id: string;
  marks_obtained: number;
  max_marks: number;
  grade: string | null;
  percent: number;
  exam: {
    exam_id: string;
    exam_name: string | null;
    exam_date: string;
    course: { course_id: string; course_name: string; course_code: string };
  };
}

interface ResultsSummary {
  total_exams: number;
  total_marks: number;
  total_max_marks: number;
  average_percent: number;
}

interface ResultsData {
  student: StudentInfo;
  summary: ResultsSummary;
  results: ExamResult[];
}

type TabKey = "attendance" | "results";

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-DZ", { weekday: "short", month: "short", day: "numeric" });

const formatFullDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" });

const getInitials = (first: string, last: string) =>
  `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();

const getRateColor = (rate: number) => {
  if (rate >= 75) return { text: "text-[#2B6F5E]", bg: "bg-[#2B6F5E]", light: "bg-[#2B6F5E]/10" };
  if (rate >= 50) return { text: "text-[#C4A035]", bg: "bg-[#C4A035]", light: "bg-[#C4A035]/10" };
  if (rate > 0) return { text: "text-red-500", bg: "bg-red-500", light: "bg-red-50" };
  return { text: "text-[#BEB29E]", bg: "bg-[#BEB29E]", light: "bg-[#D8CDC0]/15" };
};

const getScoreColor = (percent: number) => {
  if (percent >= 75) return { text: "text-[#2B6F5E]", bg: "bg-[#2B6F5E]" };
  if (percent >= 50) return { text: "text-[#C4A035]", bg: "bg-[#C4A035]" };
  return { text: "text-red-500", bg: "bg-red-500" };
};

const getStatusConfig = (status: string) => {
  const map: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
    PRESENT: { label: "حاضر", icon: UserCheck, bg: "bg-[#2B6F5E]/10", text: "text-[#2B6F5E]" },
    ABSENT: { label: "غائب", icon: UserX, bg: "bg-red-50", text: "text-red-500" },
    NOT_RECORDED: { label: "لم يُسجل", icon: Clock, bg: "bg-[#D8CDC0]/15", text: "text-[#BEB29E]" },
  };
  return map[status] || map.NOT_RECORDED;
};

/* ═══════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════ */

const DetailsSkeleton = () => (
  <div className="space-y-6 animate-pulse" dir="rtl">
    <div className="flex items-center gap-2">
      <div className="h-5 w-16 bg-[#D8CDC0]/30 rounded" />
      <div className="h-5 w-5 bg-[#D8CDC0]/20 rounded" />
      <div className="h-5 w-28 bg-[#D8CDC0]/30 rounded" />
    </div>
    <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 p-6 h-[140px]" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-[#D8CDC0]/40 h-[80px]" />
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 h-[400px]" />
  </div>
);

/* ═══════════════════════════════════════════════════════════
   ATTENDANCE RING
═══════════════════════════════════════════════════════════ */

const AttendanceRing = ({ rate, size = 80 }: { rate: number; size?: number }) => {
  const r = size * 0.38;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (rate / 100) * circumference;
  const color = rate >= 75 ? "#2B6F5E" : rate >= 50 ? "#C4A035" : rate > 0 ? "#DC2626" : "#BEB29E";
  const half = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={half} cy={half} r={r} fill="none" stroke="#D8CDC0" strokeWidth="6" opacity="0.2" />
        <circle cx={half} cy={half} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-[#1B1B1B]">{rate}%</span>
        <span className="text-[9px] text-[#6B5D4F]/50">حضور</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

export default function TeacherStudentDetails() {
  const { studentId } = useParams<{ studentId: string }>();
  const { data: attendanceData, isLoading: loadingAtt, isError: errorAtt } = useStudentAttendance(studentId!);
  const { data: resultsData, isLoading: loadingRes, isError: errorRes } = useStudentResults(studentId!);

  const [activeTab, setActiveTab] = useState<TabKey>("attendance");

  const attendance = attendanceData as AttendanceData | undefined;
  const results = resultsData as ResultsData | undefined;
  const student = attendance?.student || results?.student;

  const isLoading = loadingAtt && loadingRes;

  if (isLoading) return <DetailsSkeleton />;

  if ((errorAtt && errorRes) || !student) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">تعذّر تحميل بيانات الطالب</h3>
        <p className="text-sm text-[#6B5D4F]/70">يرجى التحقق من الرابط أو المحاولة لاحقاً</p>
        <Link to="/teacher/students" className="mt-4 text-sm font-medium text-[#2B6F5E] hover:underline">
          العودة للطلاب
        </Link>
      </div>
    );
  }

  const attSummary = attendance?.summary;
  const resSummary = results?.summary;
  const avatarSrc = student.avatar_url;

  const tabs: { key: TabKey; label: string; icon: React.ElementType; count?: number }[] = [
    { key: "attendance", label: "الحضور", icon: ClipboardCheck, count: attSummary?.total_sessions },
    { key: "results", label: "النتائج", icon: Award, count: resSummary?.total_exams },
  ];

  return (
    <div dir="rtl" className="space-y-6 pb-8">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-sm text-[#6B5D4F]/60">
        <Link to="/teacher/students" className="hover:text-[#2B6F5E] transition-colors">الطلاب</Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-[#1B1B1B] font-medium truncate max-w-[200px]">
          {student.first_name} {student.last_name}
        </span>
      </nav>

      {/* ══════════════════════════════════════════
         STUDENT PROFILE CARD
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-l from-[#2B6F5E] via-[#2B6F5E]/50 to-transparent" />
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          {avatarSrc ? (
            <img src={avatarSrc} alt={`${student.first_name} ${student.last_name}`}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D8CDC0]/30 shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#2B6F5E]/10 border-2 border-[#D8CDC0]/30 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-[#2B6F5E]">{getInitials(student.first_name, student.last_name)}</span>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[#1B1B1B]">
              {student.first_name} {student.last_name}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-[#6B5D4F]/60 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {student.email}
              </span>
            </div>
          </div>

          {/* Attendance ring */}
          {attSummary && (
            <div className="shrink-0">
              <AttendanceRing rate={attSummary.attendance_rate} />
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
         STATS ROW
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "الحصص", value: attSummary?.total_sessions ?? 0, icon: CalendarDays, color: "teal" as const },
          { label: "حاضر", value: attSummary?.present ?? 0, icon: UserCheck, color: "green" as const },
          { label: "غائب", value: attSummary?.absent ?? 0, icon: UserX, color: "gold" as const },
          { label: "الامتحانات", value: resSummary?.total_exams ?? 0, icon: Award, color: "beige" as const },
        ].map((stat) => {
          const colors = {
            teal: { bg: "bg-[#2B6F5E]/8", icon: "text-[#2B6F5E]", val: "text-[#2B6F5E]" },
            gold: { bg: "bg-[#C4A035]/8", icon: "text-[#C4A035]", val: "text-[#C4A035]" },
            green: { bg: "bg-[#8DB896]/12", icon: "text-[#3D7A4A]", val: "text-[#3D7A4A]" },
            beige: { bg: "bg-[#D8CDC0]/20", icon: "text-[#6B5D4F]", val: "text-[#6B5D4F]" },
          };
          const c = colors[stat.color];
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-[#D8CDC0]/40 px-4 py-3 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-[18px] h-[18px] ${c.icon}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl font-bold leading-tight ${c.val}`}>{stat.value}</p>
                <p className="text-[11px] text-[#6B5D4F]/60 truncate">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
         TABS
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-[#D8CDC0]/25">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all relative ${
                  isActive ? "text-[#2B6F5E]" : "text-[#6B5D4F]/60 hover:text-[#6B5D4F]"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-[#2B6F5E]/10 text-[#2B6F5E]" : "bg-[#D8CDC0]/20 text-[#6B5D4F]/50"
                  }`}>
                    {tab.count}
                  </span>
                )}
                {isActive && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-[#2B6F5E] rounded-t-full" />}
              </button>
            );
          })}
        </div>

        {/* ════════════════════════════════════
           TAB: ATTENDANCE
        ════════════════════════════════════ */}
        {activeTab === "attendance" && (
          <div>
            {loadingAtt ? (
              <div className="p-8 animate-pulse space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 bg-[#D8CDC0]/10 rounded-xl" />
                ))}
              </div>
            ) : !attendance || attendance.history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#D8CDC0]/15 flex items-center justify-center mb-3">
                  <ClipboardCheck className="w-6 h-6 text-[#BEB29E]" />
                </div>
                <p className="text-sm text-[#6B5D4F]/70">لا توجد سجلات حضور</p>
              </div>
            ) : (
              <>
                {/* Summary bar */}
                <div className="px-5 py-3 bg-[#FAFAF8]/70 border-b border-[#D8CDC0]/15 flex items-center gap-4 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2B6F5E] bg-[#2B6F5E]/8 px-2.5 py-1.5 rounded-full">
                    <UserCheck className="w-3 h-3" />
                    {attSummary?.present} حاضر
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 bg-red-50 px-2.5 py-1.5 rounded-full">
                    <UserX className="w-3 h-3" />
                    {attSummary?.absent} غائب
                  </span>
                  {(attSummary?.not_recorded ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#BEB29E] bg-[#D8CDC0]/15 px-2.5 py-1.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      {attSummary?.not_recorded} لم يُسجل
                    </span>
                  )}
                  <span className="mr-auto text-[11px] text-[#BEB29E]">
                    {attSummary?.total_sessions} حصة
                  </span>
                </div>

                {/* History list */}
                <div className="divide-y divide-[#D8CDC0]/8 max-h-[420px] overflow-y-auto">
                  {attendance.history.map((item) => {
                    const config = getStatusConfig(item.status);
                    const StatusIcon = config.icon;

                    return (
                      <div key={item.session_id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAF8]/50 transition-colors">
                        {/* Date */}
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[#D8CDC0]/8 shrink-0">
                          <span className="text-[10px] font-medium text-[#6B5D4F]/50 leading-tight">
                            {new Date(item.session_date).toLocaleDateString("ar-DZ", { weekday: "short" })}
                          </span>
                          <span className="text-sm font-bold text-[#1B1B1B] leading-tight">
                            {new Date(item.session_date).getDate()}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1B1B1B] truncate">
                            {item.group.course.course_name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-[#6B5D4F]/50 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              {item.group.name}
                            </span>
                            {item.topic && (
                              <>
                                <span className="text-[#BEB29E]">·</span>
                                <span className="truncate max-w-[140px]">{item.topic}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status */}
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full shrink-0 ${config.bg} ${config.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════
           TAB: RESULTS
        ════════════════════════════════════ */}
        {activeTab === "results" && (
          <div>
            {loadingRes ? (
              <div className="p-8 animate-pulse space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-[#D8CDC0]/10 rounded-xl" />
                ))}
              </div>
            ) : !results || results.results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#D8CDC0]/15 flex items-center justify-center mb-3">
                  <Award className="w-6 h-6 text-[#BEB29E]" />
                </div>
                <p className="text-sm text-[#6B5D4F]/70">لا توجد نتائج بعد</p>
              </div>
            ) : (
              <>
                {/* Summary bar */}
                <div className="px-5 py-3 bg-[#FAFAF8]/70 border-b border-[#D8CDC0]/15 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#6B5D4F]/60">المعدل العام:</span>
                    <span className={`text-sm font-bold ${getRateColor(resSummary?.average_percent ?? 0).text}`}>
                      {resSummary?.average_percent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#6B5D4F]/60">المجموع:</span>
                    <span className="text-sm font-bold text-[#1B1B1B]">
                      {resSummary?.total_marks}/{resSummary?.total_max_marks}
                    </span>
                  </div>
                  <span className="mr-auto text-[11px] text-[#BEB29E]">
                    {resSummary?.total_exams} امتحان
                  </span>
                </div>

                {/* Results list */}
                <div className="divide-y divide-[#D8CDC0]/8 max-h-[420px] overflow-y-auto">
                  {results.results.map((result) => {
                    const scoreColor = getScoreColor(result.percent);
                    return (
                      <div key={result.result_id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#FAFAF8]/50 transition-colors">
                        {/* Score circle */}
                        <div className={`w-12 h-12 rounded-xl ${scoreColor.text === "text-[#2B6F5E]" ? "bg-[#2B6F5E]/8" : scoreColor.text === "text-[#C4A035]" ? "bg-[#C4A035]/8" : "bg-red-50"} flex items-center justify-center shrink-0`}>
                          <span className={`text-sm font-bold ${scoreColor.text}`}>{result.percent}%</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1B1B1B] truncate">
                            {result.exam.exam_name || result.exam.course.course_name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-[#6B5D4F]/50 mt-0.5">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {result.exam.course.course_name}
                            </span>
                            <span className="text-[#BEB29E]">·</span>
                            <span>{formatDate(result.exam.exam_date)}</span>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-left shrink-0">
                          <p className={`text-sm font-bold ${scoreColor.text}`}>
                            {result.marks_obtained}
                            <span className="text-[#BEB29E] font-normal">/{result.max_marks}</span>
                          </p>
                          {result.grade && (
                            <p className="text-[10px] text-[#6B5D4F]/50 mt-0.5">{result.grade}</p>
                          )}
                        </div>

                        {/* Bar */}
                        <div className="hidden sm:block w-20 shrink-0">
                          <div className="h-1.5 bg-[#D8CDC0]/15 rounded-full overflow-hidden">
                            <div className={`h-full ${scoreColor.bg} rounded-full transition-all duration-500`} style={{ width: `${result.percent}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}