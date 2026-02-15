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

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-DZ", { weekday: "short", month: "short", day: "numeric" });

const formatFullDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric", weekday: "long" });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" });

const isPast = (d: string) => new Date(d) < new Date();

const getInitials = (first: string, last: string) =>
  `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();

/* ═══════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════ */

const AttendanceSkeleton = () => (
  <div className="space-y-6 animate-pulse" dir="rtl">
    <div>
      <div className="h-7 w-40 bg-[#D8CDC0]/30 rounded-lg" />
      <div className="h-4 w-56 bg-[#D8CDC0]/20 rounded-lg mt-2" />
    </div>
    <div className="flex gap-3">
      <div className="h-11 flex-1 bg-white rounded-xl border border-[#D8CDC0]/40" />
      <div className="h-11 w-48 bg-white rounded-xl border border-[#D8CDC0]/40" />
    </div>
    <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 h-[500px]" />
  </div>
);

/* ═══════════════════════════════════════════════════════════
   AVATAR
═══════════════════════════════════════════════════════════ */

const Avatar = ({ src, first, last }: { src: string | null; first: string; last: string }) => {
  if (src) {
    return (
      <img src={src} alt={`${first} ${last}`} className="w-9 h-9 rounded-full object-cover border-2 border-[#D8CDC0]/30" />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-[#2B6F5E]/10 border-2 border-[#D8CDC0]/30 flex items-center justify-center">
      <span className="text-xs font-semibold text-[#2B6F5E]">{getInitials(first, last)}</span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SESSION SELECTOR
═══════════════════════════════════════════════════════════ */

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
  const [groupFilter, setGroupFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (groupFilter === "all") return sessions;
    return sessions.filter((s) => s.group_id === groupFilter);
  }, [sessions, groupFilter]);

  return (
    <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/25">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#C4A035]/8 flex items-center justify-center">
            <CalendarDays className="w-[18px] h-[18px] text-[#C4A035]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#1B1B1B]">اختر الحصة</h2>
            <p className="text-[11px] text-[#6B5D4F]/50">{sessions.length} حصة متاحة</p>
          </div>
        </div>

        {/* Group filter */}
        <div className="relative">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#BEB29E] pointer-events-none" />
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="h-9 pr-8 pl-6 bg-[#FAFAF8] border border-[#D8CDC0]/40 rounded-lg text-xs text-[#1B1B1B] focus:outline-none appearance-none cursor-pointer"
          >
            <option value="all">كل المجموعات</option>
            {groups.map((g) => (
              <option key={g.group_id} value={g.group_id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-3 max-h-[280px] overflow-y-auto space-y-1.5">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#6B5D4F]/50">لا توجد حصص</div>
        ) : (
          filtered.map((session) => {
            const isSelected = session.session_id === selectedId;
            const past = isPast(session.session_date);

            return (
              <button
                key={session.session_id}
                onClick={() => onSelect(session.session_id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all ${
                  isSelected
                    ? "bg-[#2B6F5E]/8 border border-[#2B6F5E]/20 shadow-sm"
                    : "hover:bg-[#FAFAF8] border border-transparent"
                }`}
              >
                {/* Date */}
                <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg shrink-0 ${
                  isSelected ? "bg-[#2B6F5E]/15" : past ? "bg-[#D8CDC0]/10" : "bg-[#C4A035]/8"
                }`}>
                  <span className="text-[10px] font-medium text-[#6B5D4F]/50 leading-tight">
                    {new Date(session.session_date).toLocaleDateString("ar-DZ", { weekday: "short" })}
                  </span>
                  <span className={`text-base font-bold leading-tight ${isSelected ? "text-[#2B6F5E]" : "text-[#1B1B1B]"}`}>
                    {new Date(session.session_date).getDate()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isSelected ? "text-[#2B6F5E]" : "text-[#1B1B1B]"}`}>
                    {session.group.course.course_name}
                  </p>
                  <p className="text-[11px] text-[#6B5D4F]/50 truncate">
                    {session.group.name} · {formatTime(session.session_date)}
                    {session.topic && ` · ${session.topic}`}
                  </p>
                </div>

                {/* Status */}
                {session.attendance_complete ? (
                  <CheckCircle className="w-4.5 h-4.5 text-[#2B6F5E] shrink-0" />
                ) : session.attendance_taken > 0 ? (
                  <span className="text-[10px] font-bold text-[#C4A035] bg-[#C4A035]/10 px-2 py-0.5 rounded-full shrink-0">
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

/* ═══════════════════════════════════════════════════════════
   ATTENDANCE PANEL
═══════════════════════════════════════════════════════════ */

const AttendancePanel = ({ sessionId }: { sessionId: string }) => {
  const { data, isLoading, isError } = useSessionAttendance(sessionId);
  const bulkMutation = useMarkBulkAttendance();

  const [localStatus, setLocalStatus] = useState<Record<string, AttendanceStatus>>({});
  const [search, setSearch] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const attendance = data as AttendanceData | undefined;

  /* ── Initialize local state from server ── */
  const serverMap = useMemo(() => {
    const map: Record<string, AttendanceStatus | null> = {};
    attendance?.students.forEach((s) => {
      map[s.student.student_id] = s.status;
    });
    return map;
  }, [attendance]);

  /* ── Merged status (local overrides server) ── */
  const getStatus = useCallback(
    (studentId: string): AttendanceStatus | null => {
      if (localStatus[studentId] !== undefined) return localStatus[studentId];
      return serverMap[studentId] ?? null;
    },
    [localStatus, serverMap],
  );

  /* ── Toggle ── */
  const toggleStatus = (studentId: string) => {
    const current = getStatus(studentId);
    const next: AttendanceStatus = current === "PRESENT" ? "ABSENT" : "PRESENT";
    setLocalStatus((prev) => ({ ...prev, [studentId]: next }));
    setHasChanges(true);
  };

  /* ── Bulk actions ── */
  const markAll = (status: AttendanceStatus) => {
    const newMap: Record<string, AttendanceStatus> = {};
    attendance?.students.forEach((s) => {
      newMap[s.student.student_id] = status;
    });
    setLocalStatus(newMap);
    setHasChanges(true);
  };

  /* ── Reset ── */
  const resetChanges = () => {
    setLocalStatus({});
    setHasChanges(false);
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (!attendance) return;

    const records: Array<{ student_id: string; status: AttendanceStatus }> = [];
    attendance.students.forEach((s) => {
      const status = getStatus(s.student.student_id);
      if (status) {
        records.push({ student_id: s.student.student_id, status });
      }
    });

    if (records.length === 0) return;

    await bulkMutation.mutateAsync({ sessionId, records });
    setLocalStatus({});
    setHasChanges(false);
  };

  /* ── Filter ── */
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

  /* ── Counts ── */
  const counts = useMemo(() => {
    if (!attendance) return { present: 0, absent: 0, unmarked: 0, total: 0 };
    let present = 0, absent = 0, unmarked = 0;
    attendance.students.forEach((s) => {
      const status = getStatus(s.student.student_id);
      if (status === "PRESENT") present++;
      else if (status === "ABSENT") absent++;
      else unmarked++;
    });
    return { present, absent, unmarked, total: attendance.students.length };
  }, [attendance, getStatus]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 p-8 animate-pulse">
        <div className="h-5 w-40 bg-[#D8CDC0]/30 rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-[#D8CDC0]/10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !attendance) {
    return (
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 p-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-[#6B5D4F]/70">تعذّر تحميل بيانات الحضور</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-[#D8CDC0]/25">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2B6F5E]/8 flex items-center justify-center">
              <ClipboardCheck className="w-[18px] h-[18px] text-[#2B6F5E]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1B1B1B]">
                تسجيل الحضور
              </h2>
              <p className="text-[11px] text-[#6B5D4F]/50">
                {attendance.group_name} · {formatFullDate(attendance.session_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Topic */}
        {attendance.topic && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-[#FAFAF8] border border-[#D8CDC0]/20 text-xs text-[#6B5D4F]/70">
            الموضوع: <span className="font-medium text-[#1B1B1B]">{attendance.topic}</span>
          </div>
        )}

        {/* Counters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2B6F5E] bg-[#2B6F5E]/8 px-2.5 py-1.5 rounded-full">
            <UserCheck className="w-3 h-3" />
            {counts.present} حاضر
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 bg-red-50 px-2.5 py-1.5 rounded-full">
            <UserX className="w-3 h-3" />
            {counts.absent} غائب
          </span>
          {counts.unmarked > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#BEB29E] bg-[#D8CDC0]/15 px-2.5 py-1.5 rounded-full">
              <Clock className="w-3 h-3" />
              {counts.unmarked} لم يُحدد
            </span>
          )}
          <span className="text-[11px] text-[#BEB29E] mr-auto">
            {counts.total} طالب
          </span>
        </div>

        {/* Bulk actions + search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#BEB29E] pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث عن طالب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pr-8 pl-3 bg-[#FAFAF8] border border-[#D8CDC0]/40 rounded-lg text-xs text-[#1B1B1B] placeholder:text-[#BEB29E] focus:outline-none focus:border-[#2B6F5E]/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => markAll("PRESENT")}
              className="h-9 px-3 text-[11px] font-medium text-[#2B6F5E] bg-[#2B6F5E]/8 hover:bg-[#2B6F5E]/15 rounded-lg transition-colors flex items-center gap-1"
            >
              <UserCheck className="w-3 h-3" />
              الكل حاضر
            </button>
            <button
              onClick={() => markAll("ABSENT")}
              className="h-9 px-3 text-[11px] font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <UserX className="w-3 h-3" />
              الكل غائب
            </button>
          </div>
        </div>
      </div>

      {/* ── Student list ── */}
      <div className="divide-y divide-[#D8CDC0]/10 max-h-[420px] overflow-y-auto">
        {filteredStudents.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#6B5D4F]/50">لا توجد نتائج</div>
        ) : (
          filteredStudents.map((item, idx) => {
            const status = getStatus(item.student.student_id);
            const isPresent = status === "PRESENT";
            const isAbsent = status === "ABSENT";

            return (
              <div
                key={item.student.student_id}
                className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                  isPresent ? "bg-[#2B6F5E]/[0.03]" : isAbsent ? "bg-red-500/[0.02]" : ""
                }`}
              >
                {/* Index */}
                <span className="text-[11px] text-[#BEB29E] w-5 text-center shrink-0">
                  {idx + 1}
                </span>

                {/* Avatar */}
                <Avatar
                  src={item.student.avatar_url}
                  first={item.student.first_name}
                  last={item.student.last_name}
                />

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1B1B1B] truncate">
                    {item.student.first_name} {item.student.last_name}
                  </p>
                  <p className="text-[10px] text-[#6B5D4F]/40 truncate">{item.student.email}</p>
                </div>

                {/* Toggle buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      const next: AttendanceStatus = "PRESENT";
                      setLocalStatus((prev) => ({ ...prev, [item.student.student_id]: next }));
                      setHasChanges(true);
                    }}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      isPresent
                        ? "bg-[#2B6F5E] text-white shadow-sm"
                        : "bg-[#D8CDC0]/10 text-[#BEB29E] hover:bg-[#2B6F5E]/10 hover:text-[#2B6F5E]"
                    }`}
                    title="حاضر"
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const next: AttendanceStatus = "ABSENT";
                      setLocalStatus((prev) => ({ ...prev, [item.student.student_id]: next }));
                      setHasChanges(true);
                    }}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      isAbsent
                        ? "bg-red-500 text-white shadow-sm"
                        : "bg-[#D8CDC0]/10 text-[#BEB29E] hover:bg-red-50 hover:text-red-500"
                    }`}
                    title="غائب"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Save bar ── */}
      <div className={`flex items-center justify-between px-5 py-3.5 border-t border-[#D8CDC0]/25 bg-[#FAFAF8]/70 transition-all ${hasChanges ? "opacity-100" : "opacity-60"}`}>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={resetChanges}
              className="h-9 px-3 text-xs font-medium text-[#6B5D4F] hover:bg-[#D8CDC0]/20 rounded-lg transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              تراجع
            </button>
          )}
          {hasChanges && (
            <span className="text-[11px] text-[#C4A035]">تغييرات غير محفوظة</span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={!hasChanges || bulkMutation.isPending || counts.unmarked === counts.total}
          className="h-10 px-6 text-sm font-medium text-white bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
        >
          {bulkMutation.isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          حفظ الحضور
        </button>
      </div>

      {/* Success message */}
      {bulkMutation.isSuccess && !hasChanges && (
        <div className="px-5 py-2.5 bg-[#2B6F5E]/5 border-t border-[#2B6F5E]/10 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#2B6F5E]" />
          <span className="text-xs font-medium text-[#2B6F5E]">تم حفظ الحضور بنجاح</span>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

export default function TeacherAttendance() {
  const { data: sessionsData, isLoading: loadingSessions } = useTeacherSessions();
  const { data: groupsData } = useTeacherGroups();
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  const sessions: SessionOption[] = sessionsData ?? [];
  const groups: GroupOption[] = groupsData ?? [];

  if (loadingSessions) return <AttendanceSkeleton />;

  return (
    <div dir="rtl" className="space-y-6 pb-8">
      {/* ══════════════════════════════════════════
         HEADER
      ══════════════════════════════════════════ */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B1B1B]">تسجيل الحضور</h1>
        <p className="text-sm text-[#6B5D4F]/70 mt-0.5">
          اختر حصة ثم سجّل حضور وغياب الطلاب
        </p>
      </div>

      {/* ══════════════════════════════════════════
         LAYOUT: Selector + Panel
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Session selector (4/12) */}
        <div className="lg:col-span-4">
          <SessionSelector
            sessions={sessions}
            groups={groups}
            selectedId={selectedSessionId}
            onSelect={setSelectedSessionId}
          />
        </div>

        {/* Attendance panel (8/12) */}
        <div className="lg:col-span-8">
          {!selectedSessionId ? (
            <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/15 flex items-center justify-center mb-4">
                <ClipboardCheck className="w-7 h-7 text-[#BEB29E]" />
              </div>
              <h3 className="text-base font-semibold text-[#1B1B1B] mb-1">
                لم يتم اختيار حصة
              </h3>
              <p className="text-sm text-[#6B5D4F]/60 max-w-xs">
                اختر حصة من القائمة على اليمين لبدء تسجيل الحضور
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