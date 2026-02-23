import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
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
import { useLanguage } from "../../../../hooks/useLanguage";

/* ═══ TYPES ═══ */
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

/* ═══ HELPERS ═══ */
const getLocale = (lang: string) =>
  lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US";
const getInitials = (f: string, l: string) =>
  `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();
const getRateColor = (r: number) =>
  r >= 75
    ? {
        text: "text-[#2B6F5E] dark:text-[#4ADE80]",
        bg: "bg-[#2B6F5E] dark:bg-[#4ADE80]",
        light: "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10",
      }
    : r >= 50
      ? {
          text: "text-[#C4A035] dark:text-[#C4A035]",
          bg: "bg-[#C4A035]",
          light: "bg-[#C4A035]/10 dark:bg-[#C4A035]/10",
        }
      : r > 0
        ? {
            text: "text-red-500 dark:text-red-400",
            bg: "bg-red-50 dark:bg-red-950/200",
            light: "bg-red-50 dark:bg-red-950/20",
          }
        : {
            text: "text-[#BEB29E] dark:text-[#888888]",
            bg: "bg-[#BEB29E]",
            light: "bg-[#D8CDC0]/15 dark:bg-[#2A2A2A]/15",
          };
const getScoreColor = (p: number) =>
  p >= 75
    ? {
        text: "text-[#2B6F5E] dark:text-[#4ADE80]",
        bg: "bg-[#2B6F5E] dark:bg-[#4ADE80]",
      }
    : p >= 50
      ? { text: "text-[#C4A035] dark:text-[#C4A035]", bg: "bg-[#C4A035]" }
      : {
          text: "text-red-500 dark:text-red-400",
          bg: "bg-red-50 dark:bg-red-950/200",
        };

const useStatusConfig = () => {
  const { t } = useLanguage();
  return (status: string) => {
    const m: Record<
      string,
      { label: string; icon: React.ElementType; bg: string; text: string }
    > = {
      PRESENT: {
        label: t("teacher.studentDetails.present"),
        icon: UserCheck,
        bg: "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10",
        text: "text-[#2B6F5E] dark:text-[#4ADE80]",
      },
      ABSENT: {
        label: t("teacher.studentDetails.absent"),
        icon: UserX,
        bg: "bg-red-50 dark:bg-red-950/20",
        text: "text-red-500 dark:text-red-400",
      },
      NOT_RECORDED: {
        label: t("teacher.studentDetails.notRecorded"),
        icon: Clock,
        bg: "bg-[#D8CDC0]/15 dark:bg-[#2A2A2A]/15",
        text: "text-[#BEB29E] dark:text-[#888888]",
      },
    };
    return m[status] || m.NOT_RECORDED;
  };
};

/* ═══ SKELETON ═══ */
const DetailsSkeleton = ({ rtl }: { rtl: boolean }) => (
  <div className="space-y-6 animate-pulse" dir={rtl ? "rtl" : "ltr"}>
    <div className="flex items-center gap-2">
      <div className="h-5 w-16 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded" />
      <div className="h-5 w-5 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded" />
      <div className="h-5 w-28 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded" />
    </div>
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] p-6 h-[140px]" />
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

const AttendanceRing = ({
  rate,
  size = 80,
  label,
}: {
  rate: number;
  size?: number;
  label: string;
}) => {
  const r = size * 0.38,
    c = 2 * Math.PI * r,
    off = c - (rate / 100) * c;
  const col =
    rate >= 75
      ? "#2B6F5E"
      : rate >= 50
        ? "#C4A035"
        : rate > 0
          ? "#DC2626"
          : "#BEB29E";
  const h = size / 2;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={h}
          cy={h}
          r={r}
          fill="none"
          stroke="#D8CDC0"
          strokeWidth="6"
          opacity="0.2"
        />
        <circle
          cx={h}
          cy={h}
          r={r}
          fill="none"
          stroke={col}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
          {rate}%
        </span>
        <span className="text-[9px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
          {label}
        </span>
      </div>
    </div>
  );
};

/* ═══ MAIN ═══ */
export default function TeacherStudentDetails() {
  const { studentId } = useParams<{ studentId: string }>();
  const { t, dir, isRTL, currentLang } = useLanguage();
  const locale = getLocale(currentLang);
  const getStatusCfg = useStatusConfig();
  const BreadChev = isRTL ? ChevronLeft : ChevronRight;
  const {
    data: attendanceData,
    isLoading: loadingAtt,
    isError: errorAtt,
  } = useStudentAttendance(studentId!);
  const {
    data: resultsData,
    isLoading: loadingRes,
    isError: errorRes,
  } = useStudentResults(studentId!);
  const [activeTab, setActiveTab] = useState<TabKey>("attendance");

  const attendance = attendanceData as AttendanceData | undefined;
  const results = resultsData as ResultsData | undefined;
  const student = attendance?.student || results?.student;
  const isLoading = loadingAtt && loadingRes;

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  if (isLoading) return <DetailsSkeleton rtl={isRTL} />;
  if ((errorAtt && errorRes) || !student)
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
          {t("teacher.studentDetails.errorTitle")}
        </h3>
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {t("teacher.studentDetails.errorDesc")}
        </p>
        <Link
          to="/teacher/students"
          className="mt-4 text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:underline"
        >
          {t("teacher.studentDetails.backToStudents")}
        </Link>
      </div>
    );

  const attS = attendance?.summary;
  const resS = results?.summary;
  const tabs: {
    key: TabKey;
    label: string;
    icon: React.ElementType;
    count?: number;
  }[] = [
    {
      key: "attendance",
      label: t("teacher.studentDetails.attendance"),
      icon: ClipboardCheck,
      count: attS?.total_sessions,
    },
    {
      key: "results",
      label: t("teacher.studentDetails.results"),
      icon: Award,
      count: resS?.total_exams,
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
      <nav className="flex items-center gap-1.5 text-sm text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
        <Link
          to="/teacher/students"
          className="hover:text-[#2B6F5E] dark:text-[#4ADE80] transition-colors"
        >
          {t("teacher.studentDetails.students")}
        </Link>
        <BreadChev className="w-3.5 h-3.5" />
        <span className="text-[#1B1B1B] dark:text-[#E5E5E5] font-medium truncate max-w-[200px]">
          {student.first_name} {student.last_name}
        </span>
      </nav>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
        <div
          className={`h-1.5 bg-gradient-to-${isRTL ? "l" : "r"} from-[#2B6F5E] dark:from-[#4ADE80] via-[#2B6F5E]/50 to-transparent`}
        />
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {student.avatar_url ? (
            <img
              src={student.avatar_url}
              alt={`${student.first_name} ${student.last_name}`}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D8CDC0]/3 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/80 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/10 dark:bg-[#4ADE80]/10 border-2 border-[#D8CDC0]/3 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/80 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
                {getInitials(student.first_name, student.last_name)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {student.first_name} {student.last_name}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {student.email}
              </span>
            </div>
          </div>
          {attS && (
            <div className="shrink-0">
              <AttendanceRing
                rate={attS.attendance_rate}
                label={t("teacher.studentDetails.attendanceLabel")}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: t("teacher.studentDetails.sessions"),
            value: attS?.total_sessions ?? 0,
            icon: CalendarDays,
            color: "teal" as const,
          },
          {
            label: t("teacher.studentDetails.present"),
            value: attS?.present ?? 0,
            icon: UserCheck,
            color: "green" as const,
          },
          {
            label: t("teacher.studentDetails.absent"),
            value: attS?.absent ?? 0,
            icon: UserX,
            color: "gold" as const,
          },
          {
            label: t("teacher.studentDetails.exams"),
            value: resS?.total_exams ?? 0,
            icon: Award,
            color: "beige" as const,
          },
        ].map((s) => {
          const c = colorMap[s.color];
          return (
            <div
              key={s.label}
              className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] px-4 py-3 flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}
              >
                <s.icon className={`w-[18px] h-[18px] ${c.icon}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl font-bold leading-tight ${c.val}`}>
                  {s.value}
                </p>
                <p className="text-[11px] text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] truncate">
                  {s.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
        <div className="flex border-b border-[#D8CDC0]/25 dark:border-[#2A2A2A]">
          {tabs.map((tab) => {
            const isAct = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all relative ${isAct ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60 hover:text-[#6B5D4F] dark:text-[#AAAAAA]"}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isAct ? "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]" : "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20 text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50"}`}
                  >
                    {tab.count}
                  </span>
                )}
                {isAct && (
                  <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-[#2B6F5E] dark:bg-[#4ADE80] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "attendance" && (
          <div>
            {loadingAtt ? (
              <div className="p-8 animate-pulse space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/10 dark:bg-[#2A2A2A]/15 rounded-xl"
                  />
                ))}
              </div>
            ) : !attendance || attendance.history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center mb-3">
                  <ClipboardCheck className="w-6 h-6 text-[#BEB29E] dark:text-[#888888]" />
                </div>
                <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
                  {t("teacher.studentDetails.noAttendance")}
                </p>
              </div>
            ) : (
              <>
                <div className="px-5 py-3 bg-[#FAFAF8]/7 dark:bg-[#1A1A1A]/70 dark:bg-[#1A1A1A]/70 border-b border-[#D8CDC0]/1 dark:border-[#2A2A2A]5 dark:border-[#2A2A2A]/50 flex items-center gap-4 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 px-2.5 py-1.5 rounded-full">
                    <UserCheck className="w-3 h-3" />
                    {attS?.present} {t("teacher.studentDetails.present")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2.5 py-1.5 rounded-full">
                    <UserX className="w-3 h-3" />
                    {attS?.absent} {t("teacher.studentDetails.absent")}
                  </span>
                  {(attS?.not_recorded ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#BEB29E] dark:text-[#888888] bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 px-2.5 py-1.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      {attS?.not_recorded}{" "}
                      {t("teacher.studentDetails.notRecorded")}
                    </span>
                  )}
                  <span className="ms-auto text-[11px] text-[#BEB29E] dark:text-[#888888]">
                    {attS?.total_sessions}{" "}
                    {t("teacher.studentDetails.sessionUnit")}
                  </span>
                </div>
                <div className="divide-y divide-[#D8CDC0] dark:divide-[#2A2A2A]/8 max-h-[420px] overflow-y-auto">
                  {attendance.history.map((item) => {
                    const cfg = getStatusCfg(item.status);
                    const SI = cfg.icon;
                    return (
                      <div
                        key={item.session_id}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAF8]/5 dark:bg-[#1A1A1A]/50 dark:hover:bg-[#222222] transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[#D8CDC0]/8 dark:bg-[#2A2A2A]/10 shrink-0">
                          <span className="text-[10px] font-medium text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] leading-tight">
                            {new Date(item.session_date).toLocaleDateString(
                              locale,
                              { weekday: "short" },
                            )}
                          </span>
                          <span className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5] leading-tight">
                            {new Date(item.session_date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                            {item.group.course.course_name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] mt-0.5">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              {item.group.name}
                            </span>
                            {item.topic && (
                              <>
                                <span className="text-[#BEB29E] dark:text-[#888888]">
                                  ·
                                </span>
                                <span className="truncate max-w-[140px]">
                                  {item.topic}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full shrink-0 ${cfg.bg} ${cfg.text}`}
                        >
                          <SI className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "results" && (
          <div>
            {loadingRes ? (
              <div className="p-8 animate-pulse space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/10 dark:bg-[#2A2A2A]/15 rounded-xl"
                  />
                ))}
              </div>
            ) : !results || results.results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center mb-3">
                  <Award className="w-6 h-6 text-[#BEB29E] dark:text-[#888888]" />
                </div>
                <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
                  {t("teacher.studentDetails.noResults")}
                </p>
              </div>
            ) : (
              <>
                <div className="px-5 py-3 bg-[#FAFAF8]/7 dark:bg-[#1A1A1A]/70 dark:bg-[#1A1A1A]/70 border-b border-[#D8CDC0]/1 dark:border-[#2A2A2A]5 dark:border-[#2A2A2A]/50 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
                      {t("teacher.studentDetails.overallAvg")}:
                    </span>
                    <span
                      className={`text-sm font-bold ${getRateColor(resS?.average_percent ?? 0).text}`}
                    >
                      {resS?.average_percent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
                      {t("teacher.studentDetails.totalScore")}:
                    </span>
                    <span className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                      {resS?.total_marks}/{resS?.total_max_marks}
                    </span>
                  </div>
                  <span className="ms-auto text-[11px] text-[#BEB29E] dark:text-[#888888]">
                    {resS?.total_exams} {t("teacher.studentDetails.examUnit")}
                  </span>
                </div>
                <div className="divide-y divide-[#D8CDC0] dark:divide-[#2A2A2A]/8 max-h-[420px] overflow-y-auto">
                  {results.results.map((r) => {
                    const sc = getScoreColor(r.percent);
                    return (
                      <div
                        key={r.result_id}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#FAFAF8]/5 dark:bg-[#1A1A1A]/50 dark:hover:bg-[#222222] transition-colors"
                      >
                        <div
                          className={`w-12 h-12 rounded-xl ${sc.text === "text-[#2B6F5E] dark:text-[#4ADE80]" ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8" : sc.text === "text-[#C4A035] dark:text-[#C4A035]" ? "bg-[#C4A035]/8 dark:bg-[#C4A035]/8" : "bg-red-50 dark:bg-red-950/20"} flex items-center justify-center shrink-0`}
                        >
                          <span className={`text-sm font-bold ${sc.text}`}>
                            {r.percent}%
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                            {r.exam.exam_name || r.exam.course.course_name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] mt-0.5">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {r.exam.course.course_name}
                            </span>
                            <span className="text-[#BEB29E] dark:text-[#888888]">
                              ·
                            </span>
                            <span>{fmtDate(r.exam.exam_date)}</span>
                          </div>
                        </div>
                        <div className="text-start shrink-0">
                          <p className={`text-sm font-bold ${sc.text}`}>
                            {r.marks_obtained}
                            <span className="text-[#BEB29E] dark:text-[#888888] font-normal">
                              /{r.max_marks}
                            </span>
                          </p>
                          {r.grade && (
                            <p className="text-[10px] text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] mt-0.5">
                              {r.grade}
                            </p>
                          )}
                        </div>
                        <div className="hidden sm:block w-20 shrink-0">
                          <div className="h-1.5 bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${sc.bg} rounded-full transition-all duration-500`}
                              style={{ width: `${r.percent}%` }}
                            />
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
