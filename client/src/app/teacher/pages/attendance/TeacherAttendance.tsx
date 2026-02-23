import { useState, useMemo, useCallback } from "react";
import {
  ClipboardCheck,
  Search,
  AlertCircle,
  Clock,
  UserCheck,
  UserX,
  CalendarDays,
  CheckCircle,
  Filter,
  Save,
  RotateCcw,
} from "lucide-react";
import {
  useTeacherSessions,
  useTeacherGroups,
  useSessionAttendance,
  useMarkBulkAttendance,
} from "../../../../hooks/teacher/Useteacher";
import { useLanguage } from "../../../../hooks/useLanguage";

/* ═══ TYPES ═══ */
interface GroupOption {
  group_id: string;
  name: string;
  course: { course_name: string };
}
interface SessionOption {
  session_id: string;
  session_date: string;
  topic: string | null;
  group_id: string;
  group: {
    group_id: string;
    name: string;
    course: { course_name: string; course_code: string };
  };
  enrolled_students: number;
  attendance_taken: number;
  attendance_complete: boolean;
}
interface AttendanceStudent {
  student: {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
  };
  attendance_id: string | null;
  status: "PRESENT" | "ABSENT" | null;
}
interface AttendanceData {
  session_id: string;
  session_date: string;
  topic: string | null;
  group_name: string;
  total_students: number;
  marked_count: number;
  students: AttendanceStudent[];
}
type AttendanceStatus = "PRESENT" | "ABSENT";

/* ═══ HELPERS ═══ */
const getLocale = (lang: string) =>
  lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US";
const isPast = (d: string) => new Date(d) < new Date();
const getInitials = (f: string, l: string) =>
  `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();

/* ═══ SKELETON ═══ */
const AttendanceSkeleton = ({ rtl }: { rtl: boolean }) => (
  <div className="space-y-6 animate-pulse" dir={rtl ? "rtl" : "ltr"}>
    <div>
      <div className="h-7 w-40 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded-lg" />
      <div className="h-4 w-56 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded-lg mt-2" />
    </div>
    <div className="flex gap-3">
      <div className="h-11 flex-1 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A]" />
      <div className="h-11 w-48 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A]" />
    </div>
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[500px]" />
  </div>
);

/* ═══ AVATAR ═══ */
const Avatar = ({
  src,
  first,
  last,
}: {
  src: string | null;
  first: string;
  last: string;
}) => {
  if (src)
    return (
      <img
        src={src}
        alt={`${first} ${last}`}
        className="w-9 h-9 rounded-full object-cover border-2 border-[#D8CDC0]/30 dark:border-[#2A2A2A]"
      />
    );
  return (
    <div className="w-9 h-9 rounded-full bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/10 dark:bg-[#4ADE80]/10 border-2 border-[#D8CDC0]/3 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/80 flex items-center justify-center">
      <span className="text-xs font-semibold text-[#2B6F5E] dark:text-[#4ADE80]">
        {getInitials(first, last)}
      </span>
    </div>
  );
};

/* ═══ SESSION SELECTOR ═══ */
const SessionSelector = ({
  sessions,
  groups,
  selectedId,
  onSelect,
}: {
  sessions: SessionOption[];
  groups: GroupOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) => {
  const { t, isRTL, currentLang } = useLanguage();
  const locale = getLocale(currentLang);
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const filtered = useMemo(
    () =>
      groupFilter === "all"
        ? sessions
        : sessions.filter((s) => s.group_id === groupFilter),
    [sessions, groupFilter],
  );
  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/25 dark:border-[#2A2A2A]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#C4A035]/8 dark:bg-[#C4A035]/10 dark:bg-[#C4A035]/10 flex items-center justify-center">
            <CalendarDays className="w-[18px] h-[18px] text-[#C4A035] dark:text-[#C4A035]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {t("teacher.attendance.selectSession")}
            </h2>
            <p className="text-[11px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
              {t("teacher.attendance.sessionsAvailable", {
                count: sessions.length,
              })}
            </p>
          </div>
        </div>
        <div className="relative">
          <Filter
            className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
          />
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className={`h-9 ${isRTL ? "pr-8 pl-6" : "pl-8 pr-6"} bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-lg text-xs text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none appearance-none cursor-pointer`}
          >
            <option value="all">{t("teacher.attendance.allGroups")}</option>
            {groups.map((g) => (
              <option key={g.group_id} value={g.group_id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="p-3 max-h-[280px] overflow-y-auto space-y-1.5">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
            {t("teacher.attendance.noSessions")}
          </div>
        ) : (
          filtered.map((session) => {
            const isSel = session.session_id === selectedId;
            const past = isPast(session.session_date);
            return (
              <button
                key={session.session_id}
                onClick={() => onSelect(session.session_id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl ${isRTL ? "text-right" : "text-left"} transition-all ${isSel ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 border border-[#2B6F5E]/20 dark:border-[#4ADE80]/20 shadow-sm" : "hover:bg-[#FAFAF8] dark:bg-[#111111] border border-transparent"}`}
              >
                <div
                  className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg shrink-0 ${isSel ? "bg-[#2B6F5E]/15 dark:bg-[#4ADE80]/15" : past ? "bg-[#D8CDC0]/10 dark:bg-[#2A2A2A]/10" : "bg-[#C4A035]/8 dark:bg-[#C4A035]/8"}`}
                >
                  <span className="text-[10px] font-medium text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] leading-tight">
                    {new Date(session.session_date).toLocaleDateString(locale, {
                      weekday: "short",
                    })}
                  </span>
                  <span
                    className={`text-base font-bold leading-tight ${isSel ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
                  >
                    {new Date(session.session_date).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${isSel ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
                  >
                    {session.group.course.course_name}
                  </p>
                  <p className="text-[11px] text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] truncate">
                    {session.group.name} · {fmtTime(session.session_date)}
                    {session.topic && ` · ${session.topic}`}
                  </p>
                </div>
                {session.attendance_complete ? (
                  <CheckCircle className="w-4.5 h-4.5 text-[#2B6F5E] dark:text-[#4ADE80] shrink-0" />
                ) : session.attendance_taken > 0 ? (
                  <span className="text-[10px] font-bold text-[#C4A035] dark:text-[#C4A035] dark:text-[#C4A035] bg-[#C4A035]/1 dark:bg-[#C4A035]/10 dark:bg-[#C4A035]/15 dark:bg-[#C4A035]/15 px-2 py-0.5 rounded-full shrink-0">
                    {session.attendance_taken}/{session.enrolled_students}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

/* ═══ ATTENDANCE PANEL ═══ */
const AttendancePanel = ({ sessionId }: { sessionId: string }) => {
  const { t, isRTL, currentLang } = useLanguage();
  const locale = getLocale(currentLang);
  const { data, isLoading, isError } = useSessionAttendance(sessionId);
  const bulkMut = useMarkBulkAttendance();
  const [localStatus, setLocalStatus] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [search, setSearch] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const attendance = data as AttendanceData | undefined;

  const serverMap = useMemo(() => {
    const m: Record<string, AttendanceStatus | null> = {};
    attendance?.students.forEach((s) => {
      m[s.student.student_id] = s.status;
    });
    return m;
  }, [attendance]);
  const getStatus = useCallback(
    (id: string): AttendanceStatus | null =>
      localStatus[id] !== undefined ? localStatus[id] : (serverMap[id] ?? null),
    [localStatus, serverMap],
  );

  const markAll = (st: AttendanceStatus) => {
    const m: Record<string, AttendanceStatus> = {};
    attendance?.students.forEach((s) => {
      m[s.student.student_id] = st;
    });
    setLocalStatus(m);
    setHasChanges(true);
  };
  const resetChanges = () => {
    setLocalStatus({});
    setHasChanges(false);
  };

  const handleSave = async () => {
    if (!attendance) return;
    const records: Array<{ student_id: string; status: AttendanceStatus }> = [];
    attendance.students.forEach((s) => {
      const st = getStatus(s.student.student_id);
      if (st) records.push({ student_id: s.student.student_id, status: st });
    });
    if (records.length === 0) return;
    await bulkMut.mutateAsync({ sessionId, records });
    setLocalStatus({});
    setHasChanges(false);
  };

  const filteredStudents = useMemo(() => {
    if (!attendance) return [];
    if (!search.trim()) return attendance.students;
    const q = search.trim().toLowerCase();
    return attendance.students.filter(
      (s) =>
        s.student.first_name.toLowerCase().includes(q) ||
        s.student.last_name.toLowerCase().includes(q),
    );
  }, [attendance, search]);

  const counts = useMemo(() => {
    if (!attendance) return { present: 0, absent: 0, unmarked: 0, total: 0 };
    let p = 0,
      a = 0,
      u = 0;
    attendance.students.forEach((s) => {
      const st = getStatus(s.student.student_id);
      if (st === "PRESENT") p++;
      else if (st === "ABSENT") a++;
      else u++;
    });
    return {
      present: p,
      absent: a,
      unmarked: u,
      total: attendance.students.length,
    };
  }, [attendance, getStatus]);

  const fmtFull = (d: string) =>
    new Date(d).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });

  if (isLoading)
    return (
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] p-8 animate-pulse">
        <div className="h-5 w-40 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-14 bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/10 dark:bg-[#2A2A2A]/15 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  if (isError || !attendance)
    return (
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] p-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {t("teacher.attendance.loadError")}
        </p>
      </div>
    );

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#D8CDC0]/25 dark:border-[#2A2A2A]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 flex items-center justify-center">
              <ClipboardCheck className="w-[18px] h-[18px] text-[#2B6F5E] dark:text-[#4ADE80]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("teacher.attendance.recordAttendance")}
              </h2>
              <p className="text-[11px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
                {attendance.group_name} · {fmtFull(attendance.session_date)}
              </p>
            </div>
          </div>
        </div>
        {attendance.topic && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/2 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/60 text-xs text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
            {t("teacher.attendance.topic")}:{" "}
            <span className="font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
              {attendance.topic}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 px-2.5 py-1.5 rounded-full">
            <UserCheck className="w-3 h-3" />
            {counts.present} {t("teacher.attendance.present")}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2.5 py-1.5 rounded-full">
            <UserX className="w-3 h-3" />
            {counts.absent} {t("teacher.attendance.absent")}
          </span>
          {counts.unmarked > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#BEB29E] dark:text-[#888888] bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 px-2.5 py-1.5 rounded-full">
              <Clock className="w-3 h-3" />
              {counts.unmarked} {t("teacher.attendance.unmarked")}
            </span>
          )}
          <span className="text-[11px] text-[#BEB29E] dark:text-[#888888] ms-auto">
            {counts.total} {t("teacher.attendance.student")}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3">
          <div className="relative flex-1">
            <Search
              className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
            />
            <input
              type="text"
              placeholder={t("teacher.attendance.searchStudent")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full h-9 ${isRTL ? "pr-8 pl-3" : "pl-8 pr-3"} bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-lg text-xs text-[#1B1B1B] dark:text-[#E5E5E5] placeholder:text-[#BEB29E] dark:text-[#888888] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/30 dark:border-[#4ADE80]/30 transition-all`}
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => markAll("PRESENT")}
              className="h-9 px-3 text-[11px] font-medium text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 hover:bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/15 dark:hover:bg-[#4ADE80]/15 rounded-lg transition-colors flex items-center gap-1"
            >
              <UserCheck className="w-3 h-3" />
              {t("teacher.attendance.allPresent")}
            </button>
            <button
              onClick={() => markAll("ABSENT")}
              className="h-9 px-3 text-[11px] font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <UserX className="w-3 h-3" />
              {t("teacher.attendance.allAbsent")}
            </button>
          </div>
        </div>
      </div>
      <div className="divide-y divide-[#D8CDC0] dark:divide-[#2A2A2A]/10 max-h-[420px] overflow-y-auto">
        {filteredStudents.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
            {t("teacher.attendance.noResults")}
          </div>
        ) : (
          filteredStudents.map((item, idx) => {
            const st = getStatus(item.student.student_id);
            const isP = st === "PRESENT",
              isA = st === "ABSENT";
            return (
              <div
                key={item.student.student_id}
                className={`flex items-center gap-3 px-5 py-3 transition-colors ${isP ? "bg-[#2B6F5E]/[0.03]" : isA ? "bg-red-50 dark:bg-red-950/200/[0.02]" : ""}`}
              >
                <span className="text-[11px] text-[#BEB29E] dark:text-[#888888] w-5 text-center shrink-0">
                  {idx + 1}
                </span>
                <Avatar
                  src={item.student.avatar_url}
                  first={item.student.first_name}
                  last={item.student.last_name}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                    {item.student.first_name} {item.student.last_name}
                  </p>
                  <p className="text-[10px] text-[#6B5D4F]/4 dark:text-[#AAAAAA]/40 dark:text-[#666666] truncate">
                    {item.student.email}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setLocalStatus((p) => ({
                        ...p,
                        [item.student.student_id]: "PRESENT",
                      }));
                      setHasChanges(true);
                    }}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isP ? "bg-[#2B6F5E] dark:bg-[#4ADE80] text-white shadow-sm" : "bg-[#D8CDC0]/10 dark:bg-[#2A2A2A]/10 text-[#BEB29E] dark:text-[#888888] hover:bg-[#2B6F5E]/1 dark:hover:bg-[#4ADE80]/10 dark:bg-[#4ADE80]/10 hover:text-[#2B6F5E] dark:text-[#4ADE80]"}`}
                    title={t("teacher.attendance.present")}
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setLocalStatus((p) => ({
                        ...p,
                        [item.student.student_id]: "ABSENT",
                      }));
                      setHasChanges(true);
                    }}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isA ? "bg-red-50 dark:bg-red-950/200 text-white shadow-sm" : "bg-[#D8CDC0]/10 dark:bg-[#2A2A2A]/10 text-[#BEB29E] dark:text-[#888888] hover:bg-red-50 dark:bg-red-950/20 hover:text-red-500 dark:text-red-400"}`}
                    title={t("teacher.attendance.absent")}
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div
        className={`flex items-center justify-between px-5 py-3.5 border-t border-[#D8CDC0]/2 dark:border-[#2A2A2A]5 dark:border-[#2A2A2A]/70 bg-[#FAFAF8]/7 dark:bg-[#1A1A1A]/70 dark:bg-[#1A1A1A]/70 transition-all ${hasChanges ? "opacity-100" : "opacity-60"}`}
      >
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={resetChanges}
              className="h-9 px-3 text-xs font-medium text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:hover:bg-[#222222] rounded-lg transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t("teacher.attendance.undo")}
            </button>
          )}
          {hasChanges && (
            <span className="text-[11px] text-[#C4A035] dark:text-[#C4A035]">
              {t("teacher.attendance.unsavedChanges")}
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={
            !hasChanges || bulkMut.isPending || counts.unmarked === counts.total
          }
          className="h-10 px-6 text-sm font-medium text-white bg-[#2B6F5E] dark:bg-[#4ADE80] hover:bg-[#2B6F5E]/9 dark:bg-[#4ADE80]/90 dark:hover:bg-[#4ADE80]/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
        >
          {bulkMut.isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {t("teacher.attendance.saveAttendance")}
        </button>
      </div>
      {bulkMut.isSuccess && !hasChanges && (
        <div className="px-5 py-2.5 bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border-t border-[#2B6F5E]/1 dark:border-[#4ADE80]/10 dark:border-[#4ADE80]/10 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
          <span className="text-xs font-medium text-[#2B6F5E] dark:text-[#4ADE80]">
            {t("teacher.attendance.savedSuccess")}
          </span>
        </div>
      )}
    </div>
  );
};

/* ═══ MAIN ═══ */
export default function TeacherAttendance() {
  const { t, dir, isRTL } = useLanguage();
  const { data: sessionsData, isLoading: loadingSessions } =
    useTeacherSessions();
  const { data: groupsData } = useTeacherGroups();
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const sessions: SessionOption[] = sessionsData ?? [];
  const groups: GroupOption[] = groupsData ?? [];

  if (loadingSessions) return <AttendanceSkeleton rtl={isRTL} />;

  return (
    <div dir={dir} className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
          {t("teacher.attendance.title")}
        </h1>
        <p className="text-sm text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] mt-0.5">
          {t("teacher.attendance.subtitle")}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <SessionSelector
            sessions={sessions}
            groups={groups}
            selectedId={selectedSessionId}
            onSelect={setSelectedSessionId}
          />
        </div>
        <div className="lg:col-span-8">
          {!selectedSessionId ? (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center mb-4">
                <ClipboardCheck className="w-7 h-7 text-[#BEB29E] dark:text-[#888888]" />
              </div>
              <h3 className="text-base font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
                {t("teacher.attendance.noSessionSelected")}
              </h3>
              <p className="text-sm text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] max-w-xs">
                {t("teacher.attendance.selectSessionDesc")}
              </p>
            </div>
          ) : (
            <AttendancePanel sessionId={selectedSessionId} />
          )}
        </div>
      </div>
    </div>
  );
}
