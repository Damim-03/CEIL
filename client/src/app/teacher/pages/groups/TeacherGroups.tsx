import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  CalendarDays,
  Search,
  BarChart3,
  ChevronLeft,
  Layers,
  Filter,
  GraduationCap,
  AlertCircle,
  X,
  TrendingUp,
} from "lucide-react";
import { useTeacherGroups } from "../../../../hooks/teacher/Useteacher";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */

interface GroupCourse {
  course_id: string;
  course_name: string;
  course_code: string;
}

interface GroupDepartment {
  department_id: string;
  name: string;
}

interface TeacherGroup {
  group_id: string;
  name: string;
  level: string;
  status: string;
  max_students: number;
  course_id: string;
  teacher_id: string;
  department_id: string | null;
  created_at: string;
  course: GroupCourse;
  department: GroupDepartment | null;
  _count: {
    enrollments: number;
    sessions: number;
  };
  student_count: number;
  session_count: number;
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

const STATUS_MAP: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  ACTIVE: {
    label: "نشط",
    bg: "bg-[#2B6F5E]/10",
    text: "text-[#2B6F5E]",
    dot: "bg-[#2B6F5E]",
  },
  INACTIVE: {
    label: "غير نشط",
    bg: "bg-[#BEB29E]/15",
    text: "text-[#6B5D4F]",
    dot: "bg-[#BEB29E]",
  },
  COMPLETED: {
    label: "مكتمل",
    bg: "bg-[#C4A035]/10",
    text: "text-[#C4A035]",
    dot: "bg-[#C4A035]",
  },
};

const getStatusConfig = (status: string) =>
  STATUS_MAP[status] ?? {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };

const getFillPercent = (current: number, max: number) =>
  max <= 0 ? 0 : Math.min(Math.round((current / max) * 100), 100);

const getFillColor = (percent: number) => {
  if (percent >= 90) return { bar: "bg-[#C4A035]", label: "text-[#C4A035]" };
  if (percent >= 60) return { bar: "bg-[#2B6F5E]", label: "text-[#2B6F5E]" };
  return { bar: "bg-[#8DB896]", label: "text-[#3D7A4A]" };
};

/* ═══════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════ */

const GroupsSkeleton = () => (
  <div className="space-y-6 animate-pulse" dir="rtl">
    <div>
      <div className="h-7 w-36 bg-[#D8CDC0]/30 rounded-lg" />
      <div className="h-4 w-56 bg-[#D8CDC0]/20 rounded-lg mt-2" />
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-[#D8CDC0]/40 p-4 h-[76px]"
        />
      ))}
    </div>

    <div className="h-11 bg-white rounded-xl border border-[#D8CDC0]/40" />

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#D8CDC0]/40 h-[210px]"
        />
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   STAT PILL
═══════════════════════════════════════════════════════════ */

interface StatPillProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: "teal" | "gold" | "green" | "beige";
}

const PILL_COLORS = {
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

const StatPill = ({ label, value, icon: Icon, color }: StatPillProps) => {
  const c = PILL_COLORS[color];
  return (
    <div className="bg-white rounded-xl border border-[#D8CDC0]/40 px-4 py-3 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}
      >
        <Icon className={`w-[18px] h-[18px] ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className={`text-xl font-bold leading-tight ${c.val}`}>{value}</p>
        <p className="text-[11px] text-[#6B5D4F]/60 truncate">{label}</p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   GROUP CARD
═══════════════════════════════════════════════════════════ */

const GroupCard = ({ group }: { group: TeacherGroup }) => {
  const status = getStatusConfig(group.status);
  const fillPercent = getFillPercent(group.student_count, group.max_students);
  const fill = getFillColor(fillPercent);

  return (
    <Link
      to={`/teacher/groups/${group.group_id}`}
      className="block bg-white rounded-2xl border border-[#D8CDC0]/40 hover:border-[#2B6F5E]/30 hover:shadow-lg transition-all duration-300 overflow-hidden group/card"
    >
      {/* Accent bar */}
      <div className="h-1 bg-gradient-to-l from-[#2B6F5E] via-[#2B6F5E]/50 to-transparent opacity-30 group-hover/card:opacity-100 transition-opacity" />

      <div className="p-5">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-3.5">
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-bold text-[#1B1B1B] group-hover/card:text-[#2B6F5E] transition-colors truncate leading-snug">
              {group.name}
            </h3>
            <p className="text-xs text-[#6B5D4F]/70 mt-1 truncate">
              {group.course.course_name}
            </p>
          </div>

          <span
            className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 mr-3 ${status.bg} ${status.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        {/* ── Capacity bar ── */}
        {group.max_students > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[#6B5D4F]/60">الامتلاء</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-bold ${fill.label}`}>
                  {fillPercent}%
                </span>
                <span className="text-[11px] text-[#BEB29E]">
                  ({group.student_count}/{group.max_students})
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-[#D8CDC0]/20 rounded-full overflow-hidden">
              <div
                className={`h-full ${fill.bar} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Info chips ── */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] text-[#6B5D4F]/70 bg-[#FAFAF8] border border-[#D8CDC0]/20 px-2.5 py-1.5 rounded-lg">
            <Users className="w-3.5 h-3.5 text-[#2B6F5E]/50" />
            {group.student_count} طالب
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-[#6B5D4F]/70 bg-[#FAFAF8] border border-[#D8CDC0]/20 px-2.5 py-1.5 rounded-lg">
            <CalendarDays className="w-3.5 h-3.5 text-[#C4A035]/50" />
            {group.session_count} حصة
          </span>
          {group.level && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#6B5D4F]/70 bg-[#FAFAF8] border border-[#D8CDC0]/20 px-2.5 py-1.5 rounded-lg">
              <BarChart3 className="w-3.5 h-3.5 text-[#8DB896]/70" />
              {group.level}
            </span>
          )}
          {group.course.course_code && (
            <span className="inline-flex items-center text-[10px] font-mono text-[#BEB29E] bg-[#D8CDC0]/10 border border-[#D8CDC0]/20 px-2 py-1.5 rounded-lg">
              {group.course.course_code}
            </span>
          )}
          {group.department && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#6B5D4F]/70 bg-[#FAFAF8] border border-[#D8CDC0]/20 px-2.5 py-1.5 rounded-lg">
              <GraduationCap className="w-3.5 h-3.5 text-[#BEB29E]" />
              {group.department.name}
            </span>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-2.5 border-t border-[#D8CDC0]/15 bg-[#FAFAF8]/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-[#2B6F5E]/60 group-hover/card:text-[#2B6F5E] transition-colors">
          <TrendingUp className="w-3.5 h-3.5" />
          عرض التفاصيل والإحصائيات
        </div>
        <ChevronLeft className="w-4 h-4 text-[#BEB29E] group-hover/card:text-[#2B6F5E] group-hover/card:-translate-x-1 transition-all" />
      </div>
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════ */

const EmptyState = ({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/15 flex items-center justify-center mb-4">
      <BookOpen className="w-7 h-7 text-[#BEB29E]" />
    </div>
    <h3 className="text-base font-semibold text-[#1B1B1B] mb-1">
      {hasFilters ? "لا توجد نتائج مطابقة" : "لم يتم إسناد أي مجموعة بعد"}
    </h3>
    <p className="text-sm text-[#6B5D4F]/60 max-w-xs mb-4">
      {hasFilters
        ? "جرّب تغيير كلمة البحث أو الفلتر للعثور على مجموعاتك"
        : "سيتم عرض المجموعات هنا بمجرد إسنادها إليك من قبل الإدارة"}
    </p>
    {hasFilters && (
      <button
        onClick={onClear}
        className="text-sm font-medium text-[#2B6F5E] hover:text-[#2B6F5E]/70 underline underline-offset-4 transition-colors"
      >
        مسح الفلاتر
      </button>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

export default function TeacherGroups() {
  const { data, isLoading, isError } = useTeacherGroups();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const groups: TeacherGroup[] = data ?? [];

  /* ── Derived stats ── */
  const stats = useMemo(() => {
    const totalStudents = groups.reduce((s, g) => s + g.student_count, 0);
    const totalSessions = groups.reduce((s, g) => s + g.session_count, 0);
    const activeCount = groups.filter((g) => g.status === "ACTIVE").length;
    return { totalStudents, totalSessions, activeCount };
  }, [groups]);

  /* ── Unique statuses ── */
  const statuses = useMemo(
    () => Array.from(new Set(groups.map((g) => g.status))),
    [groups],
  );

  /* ── Has active filters? ── */
  const hasFilters = search.trim() !== "" || statusFilter !== "all";

  /* ── Filtered groups ── */
  const filtered = useMemo(() => {
    let result = groups;

    if (statusFilter !== "all") {
      result = result.filter((g) => g.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.course.course_name.toLowerCase().includes(q) ||
          g.course.course_code?.toLowerCase().includes(q) ||
          g.department?.name.toLowerCase().includes(q) ||
          g.level?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [groups, search, statusFilter]);

  /* ── Clear filters ── */
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  /* ── Loading ── */
  if (isLoading) return <GroupsSkeleton />;

  /* ── Error ── */
  if (isError) {
    return (
      <div
        dir="rtl"
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">
          حدث خطأ أثناء تحميل المجموعات
        </h3>
        <p className="text-sm text-[#6B5D4F]/70">
          يرجى تحديث الصفحة أو المحاولة لاحقاً
        </p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6 pb-8">
      {/* ══════════════════════════════════════════
         PAGE HEADER
      ══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B]">مجموعاتي</h1>
          <p className="text-sm text-[#6B5D4F]/70 mt-0.5">
            جميع المجموعات المسندة إليك ومعلوماتها التفصيلية
          </p>
        </div>
        <p className="text-xs text-[#BEB29E]">
          {groups.length} مجموعة إجمالاً
        </p>
      </div>

      {/* ══════════════════════════════════════════
         QUICK STATS
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill
          label="إجمالي المجموعات"
          value={groups.length}
          icon={Layers}
          color="teal"
        />
        <StatPill
          label="المجموعات النشطة"
          value={stats.activeCount}
          icon={TrendingUp}
          color="green"
        />
        <StatPill
          label="إجمالي الطلاب"
          value={stats.totalStudents}
          icon={Users}
          color="gold"
        />
        <StatPill
          label="إجمالي الحصص"
          value={stats.totalSessions}
          icon={CalendarDays}
          color="beige"
        />
      </div>

      {/* ══════════════════════════════════════════
         SEARCH & FILTER
      ══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث بالاسم، المادة، المستوى، القسم..."
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

        {/* Status filter */}
        <div className="relative shrink-0">
          <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 pr-10 pl-8 bg-white border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10 appearance-none cursor-pointer transition-all min-w-[140px]"
          >
            <option value="all">جميع الحالات</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {getStatusConfig(s).label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Active filters bar ── */}
      {hasFilters && (
        <div className="flex items-center justify-between bg-[#2B6F5E]/5 border border-[#2B6F5E]/10 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-[#6B5D4F]/70">النتائج:</span>
            <span className="font-semibold text-[#2B6F5E]">
              {filtered.length}
            </span>
            {search.trim() && (
              <span className="text-[#6B5D4F]/50">· &quot;{search}&quot;</span>
            )}
            {statusFilter !== "all" && (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getStatusConfig(statusFilter).bg} ${getStatusConfig(statusFilter).text}`}
              >
                {getStatusConfig(statusFilter).label}
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-[#2B6F5E] hover:text-[#2B6F5E]/70 flex items-center gap-1 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            مسح
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════
         GROUPS GRID / EMPTY
      ══════════════════════════════════════════ */}
      {filtered.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((group) => (
            <GroupCard key={group.group_id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}