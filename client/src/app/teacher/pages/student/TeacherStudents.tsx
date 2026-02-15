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

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

const getInitials = (first: string, last: string) =>
  `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();

const getRateColor = (rate: number) => {
  if (rate >= 75) return { text: "text-[#2B6F5E]", bg: "bg-[#2B6F5E]", light: "bg-[#2B6F5E]/10" };
  if (rate >= 50) return { text: "text-[#C4A035]", bg: "bg-[#C4A035]", light: "bg-[#C4A035]/10" };
  if (rate > 0) return { text: "text-red-500", bg: "bg-red-500", light: "bg-red-50" };
  return { text: "text-[#BEB29E]", bg: "bg-[#BEB29E]", light: "bg-[#D8CDC0]/15" };
};

const getStatusLabel = (status: string) => {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    PAID: { label: "مدفوع", bg: "bg-[#2B6F5E]/10", text: "text-[#2B6F5E]" },
    VALIDATED: { label: "مؤكد", bg: "bg-[#C4A035]/10", text: "text-[#C4A035]" },
    FINISHED: { label: "منتهي", bg: "bg-[#D8CDC0]/20", text: "text-[#6B5D4F]" },
  };
  return map[status] || { label: status, bg: "bg-gray-100", text: "text-gray-600" };
};

/* ═══════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════ */

const StudentsSkeleton = () => (
  <div className="space-y-6 animate-pulse" dir="rtl">
    <div>
      <div className="h-7 w-32 bg-[#D8CDC0]/30 rounded-lg" />
      <div className="h-4 w-52 bg-[#D8CDC0]/20 rounded-lg mt-2" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-[#D8CDC0]/40 h-[76px]" />
      ))}
    </div>
    <div className="flex gap-3">
      <div className="h-11 flex-1 bg-white rounded-xl border border-[#D8CDC0]/40" />
      <div className="h-11 w-44 bg-white rounded-xl border border-[#D8CDC0]/40" />
    </div>
    <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 h-[500px]" />
  </div>
);

/* ═══════════════════════════════════════════════════════════
   AVATAR
═══════════════════════════════════════════════════════════ */

const StudentAvatar = ({ student }: { student: StudentData }) => {
  const src = student.google_avatar || student.avatar_url;
  if (src) {
    return <img src={src} alt={`${student.first_name} ${student.last_name}`} className="w-10 h-10 rounded-full object-cover border-2 border-[#D8CDC0]/30" />;
  }
  return (
    <div className="w-10 h-10 rounded-full bg-[#2B6F5E]/10 border-2 border-[#D8CDC0]/30 flex items-center justify-center">
      <span className="text-xs font-bold text-[#2B6F5E]">{getInitials(student.first_name, student.last_name)}</span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ATTENDANCE MINI BAR
═══════════════════════════════════════════════════════════ */

const AttendanceMiniBar = ({ attendance }: { attendance: StudentAttendance }) => {
  const color = getRateColor(attendance.rate);
  if (attendance.total === 0) {
    return <span className="text-[11px] text-[#BEB29E]">لا توجد بيانات</span>;
  }
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-[#D8CDC0]/15 rounded-full overflow-hidden">
        <div className={`h-full ${color.bg} rounded-full transition-all duration-500`} style={{ width: `${attendance.rate}%` }} />
      </div>
      <span className={`text-[11px] font-bold ${color.text} w-9 text-left`}>{attendance.rate}%</span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   STUDENT ROW
═══════════════════════════════════════════════════════════ */

const StudentRow = ({ student, index, groupName }: { student: StudentData; index: number; groupName: string }) => {
  const status = getStatusLabel(student.enrollment_status);
  const rateColor = getRateColor(student.attendance.rate);

  return (
    <Link
      to={`/teacher/students/${student.student_id}`}
      className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAF8] border-b border-[#D8CDC0]/8 last:border-b-0 transition-all group/row"
    >
      {/* Index */}
      <span className="text-[11px] text-[#BEB29E] w-6 text-center shrink-0">{index}</span>

      {/* Avatar */}
      <StudentAvatar student={student} />

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1B1B1B] group-hover/row:text-[#2B6F5E] transition-colors truncate">
          {student.first_name} {student.last_name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-[#6B5D4F]/40 truncate max-w-[180px]">{student.email}</span>
          <span className="text-[10px] text-[#BEB29E]">·</span>
          <span className="text-[10px] text-[#6B5D4F]/40">{groupName}</span>
        </div>
      </div>

      {/* Attendance */}
      <div className="hidden sm:flex shrink-0">
        <AttendanceMiniBar attendance={student.attendance} />
      </div>

      {/* Attendance counts (mobile-friendly) */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#2B6F5E] bg-[#2B6F5E]/8 px-1.5 py-0.5 rounded">
          <UserCheck className="w-2.5 h-2.5" />
          {student.attendance.present}
        </span>
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
          <UserX className="w-2.5 h-2.5" />
          {student.attendance.absent}
        </span>
      </div>

      {/* Status */}
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${status.bg} ${status.text}`}>
        {status.label}
      </span>

      {/* Arrow */}
      <Eye className="w-4 h-4 text-[#BEB29E] group-hover/row:text-[#2B6F5E] shrink-0 transition-colors" />
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

export default function TeacherStudents() {
  const { data: groupsData, isLoading: loadingGroups } = useTeacherGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "attendance">("name");

  const groups: GroupOption[] = groupsData ?? [];

  // Load first group by default, or the selected group
  const activeGroupId = selectedGroupId === "all" ? groups[0]?.group_id : selectedGroupId;

  // We need to load students for each group when "all" is selected
  // For simplicity, load the selected group's students
  const { data: studentsData, isLoading: loadingStudents } = useGroupStudents(activeGroupId || "");

  const groupStudents = studentsData as GroupStudentsResponse | undefined;

  // For "all" view, we cycle through groups - but API returns per group
  // So we show a group switcher as tabs when "all"
  const allGroupIds = useMemo(() => groups.map((g) => g.group_id), [groups]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const totalStudents = groups.reduce((s, g) => s + g.student_count, 0);
    const groupCount = groups.length;
    return { totalStudents, groupCount };
  }, [groups]);

  /* ── Filter + Sort ── */
  const displayStudents = useMemo(() => {
    let students = groupStudents?.students ?? [];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      students = students.filter(
        (s) =>
          s.first_name.toLowerCase().includes(q) ||
          s.last_name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q),
      );
    }

    if (sortBy === "attendance") {
      students = [...students].sort((a, b) => b.attendance.rate - a.attendance.rate);
    } else {
      students = [...students].sort((a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`, "ar"),
      );
    }

    return students;
  }, [groupStudents, search, sortBy]);

  const currentGroupName = groupStudents?.group_name || "";
  const hasFilters = search.trim() !== "";

  if (loadingGroups) return <StudentsSkeleton />;

  if (groups.length === 0) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/15 flex items-center justify-center mb-4">
          <Users className="w-7 h-7 text-[#BEB29E]" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">لا توجد مجموعات</h3>
        <p className="text-sm text-[#6B5D4F]/70">لا يمكن عرض الطلاب بدون مجموعات مسندة</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6 pb-8">
      {/* ══════════════════════════════════════════
         HEADER
      ══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B]">الطلاب</h1>
          <p className="text-sm text-[#6B5D4F]/70 mt-0.5">
            عرض طلاب مجموعاتك مع ملخص الحضور
          </p>
        </div>
        <p className="text-xs text-[#BEB29E]">
          {stats.totalStudents} طالب في {stats.groupCount} مجموعة
        </p>
      </div>

      {/* ══════════════════════════════════════════
         GROUP TABS
      ══════════════════════════════════════════ */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {groups.map((g) => {
          const isActive = activeGroupId === g.group_id;
          return (
            <button
              key={g.group_id}
              onClick={() => setSelectedGroupId(g.group_id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                isActive
                  ? "bg-[#2B6F5E]/8 border-[#2B6F5E]/20 text-[#2B6F5E] shadow-sm"
                  : "bg-white border-[#D8CDC0]/40 text-[#6B5D4F]/70 hover:border-[#D8CDC0]/60 hover:text-[#1B1B1B]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {g.name}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-[#2B6F5E]/15 text-[#2B6F5E]" : "bg-[#D8CDC0]/20 text-[#6B5D4F]/50"
              }`}>
                {g.student_count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
         SEARCH + SORT
      ══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pr-10 pl-9 bg-white border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] placeholder:text-[#BEB29E] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#D8CDC0]/30 hover:bg-[#D8CDC0]/50 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-[#6B5D4F]" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative shrink-0">
          <BarChart3 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "attendance")}
            className="h-11 pr-10 pl-8 bg-white border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10 appearance-none cursor-pointer transition-all min-w-[140px]"
          >
            <option value="name">ترتيب بالاسم</option>
            <option value="attendance">ترتيب بالحضور</option>
          </select>
        </div>
      </div>

      {/* Filter bar */}
      {hasFilters && (
        <div className="flex items-center justify-between bg-[#2B6F5E]/5 border border-[#2B6F5E]/10 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#6B5D4F]/70">النتائج:</span>
            <span className="font-semibold text-[#2B6F5E]">{displayStudents.length}</span>
            <span className="text-[#6B5D4F]/50">· &quot;{search}&quot;</span>
          </div>
          <button
            onClick={() => setSearch("")}
            className="text-xs font-medium text-[#2B6F5E] hover:text-[#2B6F5E]/70 flex items-center gap-1 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            مسح
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════
         STUDENTS LIST
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-[#FAFAF8]/70 border-b border-[#D8CDC0]/15 text-[10px] font-medium text-[#6B5D4F]/50 uppercase tracking-wider">
          <span className="w-6 text-center">#</span>
          <span className="w-10"></span>
          <span className="flex-1">الطالب</span>
          <span className="w-[120px]">الحضور</span>
          <span className="hidden md:block w-[80px]">حاضر/غائب</span>
          <span className="w-[60px] text-center">الحالة</span>
          <span className="w-4"></span>
        </div>

        {/* Loading */}
        {loadingStudents ? (
          <div className="p-8 space-y-3 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-[#D8CDC0]/10 rounded-xl" />
            ))}
          </div>
        ) : displayStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#D8CDC0]/15 flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-[#BEB29E]" />
            </div>
            <h3 className="text-sm font-semibold text-[#1B1B1B] mb-1">
              {groupStudents?.students.length === 0
                ? "لا يوجد طلاب في هذه المجموعة"
                : `لا توجد نتائج لـ "${search}"`}
            </h3>
            <p className="text-xs text-[#6B5D4F]/50">
              {groupStudents?.students.length === 0
                ? "سيظهر الطلاب بمجرد تسجيلهم"
                : "جرّب كلمة بحث مختلفة"}
            </p>
          </div>
        ) : (
          <div>
            {displayStudents.map((student, idx) => (
              <StudentRow
                key={student.student_id}
                student={student}
                index={idx + 1}
                groupName={currentGroupName}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        {displayStudents.length > 0 && (
          <div className="px-5 py-3 border-t border-[#D8CDC0]/15 bg-[#FAFAF8]/50 flex items-center justify-between">
            <span className="text-[11px] text-[#6B5D4F]/50">
              {displayStudents.length} طالب في {currentGroupName}
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-[#2B6F5E]">
                <UserCheck className="w-3 h-3" />
                متوسط الحضور:{" "}
                <span className="font-bold">
                  {displayStudents.length > 0
                    ? Math.round(
                        displayStudents.reduce((s, st) => s + st.attendance.rate, 0) /
                          displayStudents.length,
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