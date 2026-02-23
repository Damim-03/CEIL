import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  X,
  Eye,
  UserCheck,
  UserX,
  Layers,
  BarChart3,
} from "lucide-react";
import {
  useTeacherGroups,
  useGroupStudents,
} from "../../../../hooks/teacher/Useteacher";
import { useLanguage } from "../../../../hooks/useLanguage";

/* ═══ TYPES ═══ */
interface GroupOption {
  group_id: string;
  name: string;
  course: { course_id: string; course_name: string };
  student_count: number;
}
interface StudentAttendance {
  total: number;
  present: number;
  absent: number;
  rate: number;
}
interface StudentData {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  google_avatar: string | null;
  enrollment_status: string;
  attendance: StudentAttendance;
}
interface GroupStudentsResponse {
  group_id: string;
  group_name: string;
  students: StudentData[];
}

/* ═══ HELPERS ═══ */
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

const useStatusLabels = () => {
  const { t } = useLanguage();
  return (status: string) => {
    const map: Record<string, { label: string; bg: string; text: string }> = {
      PAID: {
        label: t("teacher.students.paid"),
        bg: "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10",
        text: "text-[#2B6F5E] dark:text-[#4ADE80]",
      },
      VALIDATED: {
        label: t("teacher.students.validated"),
        bg: "bg-[#C4A035]/10 dark:bg-[#C4A035]/10",
        text: "text-[#C4A035] dark:text-[#C4A035]",
      },
      FINISHED: {
        label: t("teacher.students.finished"),
        bg: "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20",
        text: "text-[#6B5D4F] dark:text-[#AAAAAA]",
      },
    };
    return (
      map[status] || {
        label: status,
        bg: "bg-gray-100 dark:bg-gray-800/30",
        text: "text-gray-600 dark:text-gray-400 dark:text-gray-500",
      }
    );
  };
};

/* ═══ SKELETON ═══ */
const StudentsSkeleton = ({ rtl }: { rtl: boolean }) => (
  <div className="space-y-6 animate-pulse" dir={rtl ? "rtl" : "ltr"}>
    <div>
      <div className="h-7 w-32 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded-lg" />
      <div className="h-4 w-52 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded-lg mt-2" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[76px]"
        />
      ))}
    </div>
    <div className="flex gap-3">
      <div className="h-11 flex-1 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A]" />
      <div className="h-11 w-44 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A]" />
    </div>
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[500px]" />
  </div>
);

const StudentAvatar = ({ student }: { student: StudentData }) => {
  const src = student.google_avatar || student.avatar_url;
  if (src)
    return (
      <img
        src={src}
        alt={`${student.first_name} ${student.last_name}`}
        className="w-10 h-10 rounded-full object-cover border-2 border-[#D8CDC0]/30 dark:border-[#2A2A2A]"
      />
    );
  return (
    <div className="w-10 h-10 rounded-full bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/10 dark:bg-[#4ADE80]/10 border-2 border-[#D8CDC0]/3 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/80 flex items-center justify-center">
      <span className="text-xs font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
        {getInitials(student.first_name, student.last_name)}
      </span>
    </div>
  );
};

const AttendanceMiniBar = ({
  attendance,
  noDataLabel,
}: {
  attendance: StudentAttendance;
  noDataLabel: string;
}) => {
  const color = getRateColor(attendance.rate);
  if (attendance.total === 0)
    return (
      <span className="text-[11px] text-[#BEB29E] dark:text-[#888888]">
        {noDataLabel}
      </span>
    );
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 rounded-full overflow-hidden">
        <div
          className={`h-full ${color.bg} rounded-full transition-all duration-500`}
          style={{ width: `${attendance.rate}%` }}
        />
      </div>
      <span
        className={`text-[11px] font-bold ${color.text} w-9 ${/* text-left in LTR, text-right in RTL handled by dir */ "text-start"}`}
      >
        {attendance.rate}%
      </span>
    </div>
  );
};

const StudentRow = ({
  student,
  index,
  groupName,
  getStatus,
}: {
  student: StudentData;
  index: number;
  groupName: string;
  getStatus: (s: string) => { label: string; bg: string; text: string };
}) => {
  const status = getStatus(student.enrollment_status);
  return (
    <Link
      to={`/teacher/students/${student.student_id}`}
      className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAF8] dark:hover:bg-[#222222] border-b border-[#D8CDC0]/8 dark:border-[#2A2A2A]/30 last:border-b-0 transition-all group/row"
    >
      <span className="text-[11px] text-[#BEB29E] dark:text-[#888888] w-6 text-center shrink-0">
        {index}
      </span>
      <StudentAvatar student={student} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] group-hover/row:text-[#2B6F5E] dark:text-[#4ADE80] transition-colors truncate">
          {student.first_name} {student.last_name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-[#6B5D4F]/4 dark:text-[#AAAAAA]/40 dark:text-[#666666] truncate max-w-[180px]">
            {student.email}
          </span>
          <span className="text-[10px] text-[#BEB29E] dark:text-[#888888]">
            ·
          </span>
          <span className="text-[10px] text-[#6B5D4F]/40 dark:text-[#AAAAAA]/40">
            {groupName}
          </span>
        </div>
      </div>
      <div className="hidden sm:flex shrink-0">
        <AttendanceMiniBar attendance={student.attendance} noDataLabel="" />
      </div>
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 px-1.5 py-0.5 rounded">
          <UserCheck className="w-2.5 h-2.5" />
          {student.attendance.present}
        </span>
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 rounded">
          <UserX className="w-2.5 h-2.5" />
          {student.attendance.absent}
        </span>
      </div>
      <span
        className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${status.bg} ${status.text}`}
      >
        {status.label}
      </span>
      <Eye className="w-4 h-4 text-[#BEB29E] dark:text-[#888888] group-hover/row:text-[#2B6F5E] dark:text-[#4ADE80] shrink-0 transition-colors" />
    </Link>
  );
};

/* ═══ MAIN ═══ */
export default function TeacherStudents() {
  const { t, dir, isRTL, currentLang } = useLanguage();
  const getStatus = useStatusLabels();
  const { data: groupsData, isLoading: loadingGroups } = useTeacherGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "attendance">("name");
  const groups: GroupOption[] = groupsData ?? [];
  const activeGroupId =
    selectedGroupId === "all" ? groups[0]?.group_id : selectedGroupId;
  const { data: studentsData, isLoading: loadingStudents } = useGroupStudents(
    activeGroupId || "",
  );
  const groupStudents = studentsData as GroupStudentsResponse | undefined;
  const stats = useMemo(
    () => ({
      totalStudents: groups.reduce((s, g) => s + g.student_count, 0),
      groupCount: groups.length,
    }),
    [groups],
  );

  const displayStudents = useMemo(() => {
    let st = groupStudents?.students ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      st = st.filter(
        (s) =>
          s.first_name.toLowerCase().includes(q) ||
          s.last_name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q),
      );
    }
    if (sortBy === "attendance")
      st = [...st].sort((a, b) => b.attendance.rate - a.attendance.rate);
    else
      st = [...st].sort((a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(
          `${b.first_name} ${b.last_name}`,
          currentLang === "ar" ? "ar" : currentLang === "fr" ? "fr" : "en",
        ),
      );
    return st;
  }, [groupStudents, search, sortBy, currentLang]);

  const currentGroupName = groupStudents?.group_name || "";

  if (loadingGroups) return <StudentsSkeleton rtl={isRTL} />;
  if (groups.length === 0)
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center mb-4">
          <Users className="w-7 h-7 text-[#BEB29E] dark:text-[#888888]" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
          {t("teacher.students.noGroups")}
        </h3>
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {t("teacher.students.noGroupsDesc")}
        </p>
      </div>
    );

  return (
    <div dir={dir} className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("teacher.students.title")}
          </h1>
          <p className="text-sm text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] mt-0.5">
            {t("teacher.students.subtitle")}
          </p>
        </div>
        <p className="text-xs text-[#BEB29E] dark:text-[#888888]">
          {t("teacher.students.summary", {
            students: stats.totalStudents,
            groups: stats.groupCount,
          })}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {groups.map((g) => {
          const isAct = activeGroupId === g.group_id;
          return (
            <button
              key={g.group_id}
              onClick={() => setSelectedGroupId(g.group_id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${isAct ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 border-[#2B6F5E]/20 dark:border-[#4ADE80]/20 text-[#2B6F5E] dark:text-[#4ADE80] shadow-sm" : "bg-white dark:bg-[#1A1A1A] border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] hover:border-[#D8CDC0]/60 dark:border-[#2A2A2A] hover:text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
            >
              <Layers className="w-3.5 h-3.5" />
              {g.name}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isAct ? "bg-[#2B6F5E]/15 dark:bg-[#4ADE80]/15 text-[#2B6F5E] dark:text-[#4ADE80]" : "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20 text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50"}`}
              >
                {g.student_count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
          />
          <input
            type="text"
            placeholder={t("teacher.students.searchPlaceholder")}
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
        <div className="relative shrink-0">
          <BarChart3
            className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "attendance")}
            className={`h-11 ${isRTL ? "pr-10 pl-8" : "pl-10 pr-8"} bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10 appearance-none cursor-pointer transition-all min-w-[140px]`}
          >
            <option value="name">{t("teacher.students.sortByName")}</option>
            <option value="attendance">
              {t("teacher.students.sortByAttendance")}
            </option>
          </select>
        </div>
      </div>

      {search.trim() && (
        <div className="flex items-center justify-between bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border border-[#2B6F5E]/1 dark:border-[#4ADE80]/10 dark:border-[#4ADE80]/10 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
              {t("teacher.students.results")}:
            </span>
            <span className="font-semibold text-[#2B6F5E] dark:text-[#4ADE80]">
              {displayStudents.length}
            </span>
            <span className="text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
              · &quot;{search}&quot;
            </span>
          </div>
          <button
            onClick={() => setSearch("")}
            className="text-xs font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:text-[#2B6F5E] dark:hover:text-[#4ADE80]/70 dark:text-[#4ADE80]/70 flex items-center gap-1 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            {t("teacher.students.clear")}
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
        <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-[#FAFAF8]/7 dark:bg-[#1A1A1A]/70 dark:bg-[#1A1A1A]/70 border-b border-[#D8CDC0]/1 dark:border-[#2A2A2A]5 dark:border-[#2A2A2A]/50 text-[10px] font-medium text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] uppercase tracking-wider">
          <span className="w-6 text-center">#</span>
          <span className="w-10"></span>
          <span className="flex-1">{t("teacher.students.student")}</span>
          <span className="w-[120px]">{t("teacher.students.attendance")}</span>
          <span className="hidden md:block w-[80px]">
            {t("teacher.students.presentAbsent")}
          </span>
          <span className="w-[60px] text-center">
            {t("teacher.students.status")}
          </span>
          <span className="w-4"></span>
        </div>

        {loadingStudents ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-14 bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/10 dark:bg-[#2A2A2A]/15 rounded-xl"
              />
            ))}
          </div>
        ) : displayStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-[#BEB29E] dark:text-[#888888]" />
            </div>
            <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
              {groupStudents?.students.length === 0
                ? t("teacher.students.noStudentsInGroup")
                : t("teacher.students.noSearchResults", { query: search })}
            </h3>
            <p className="text-xs text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
              {groupStudents?.students.length === 0
                ? t("teacher.students.willAppear")
                : t("teacher.students.tryDifferent")}
            </p>
          </div>
        ) : (
          <div>
            {displayStudents.map((s, i) => (
              <StudentRow
                key={s.student_id}
                student={s}
                index={i + 1}
                groupName={currentGroupName}
                getStatus={getStatus}
              />
            ))}
          </div>
        )}

        {displayStudents.length > 0 && (
          <div className="px-5 py-3 border-t border-[#D8CDC0]/1 dark:border-[#2A2A2A]5 dark:border-[#2A2A2A]/50 bg-[#FAFAF8]/5 dark:bg-[#1A1A1A]/50 dark:bg-[#1A1A1A]/50 flex items-center justify-between">
            <span className="text-[11px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
              {t("teacher.students.countInGroup", {
                count: displayStudents.length,
                group: currentGroupName,
              })}
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-[#2B6F5E] dark:text-[#4ADE80]">
                <UserCheck className="w-3 h-3" />
                {t("teacher.students.avgAttendance")}:{" "}
                <span className="font-bold">
                  {displayStudents.length > 0
                    ? Math.round(
                        displayStudents.reduce(
                          (s, st) => s + st.attendance.rate,
                          0,
                        ) / displayStudents.length,
                      )
                    : 0}
                  %
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
