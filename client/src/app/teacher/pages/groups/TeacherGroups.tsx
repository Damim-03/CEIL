import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  CalendarDays,
  Search,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Layers,
  Filter,
  GraduationCap,
  AlertCircle,
  X,
  TrendingUp,
} from "lucide-react";
import { useTeacherGroups } from "../../../../hooks/teacher/Useteacher";
import { useLanguage } from "../../../../hooks/useLanguage";

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
  _count: { enrollments: number; sessions: number };
  student_count: number;
  session_count: number;
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

const useStatusMap = () => {
  const { t } = useLanguage();
  return {
    ACTIVE: {
      label: t("teacher.groups.active"),
      bg: "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10",
      text: "text-[#2B6F5E] dark:text-[#4ADE80]",
      dot: "bg-[#2B6F5E] dark:bg-[#4ADE80]",
    },
    INACTIVE: {
      label: t("teacher.groups.inactive"),
      bg: "bg-[#BEB29E]/15 dark:bg-[#888888]/15",
      text: "text-[#6B5D4F] dark:text-[#AAAAAA]",
      dot: "bg-[#BEB29E]",
    },
    COMPLETED: {
      label: t("teacher.groups.completed"),
      bg: "bg-[#C4A035]/10 dark:bg-[#C4A035]/10",
      text: "text-[#C4A035] dark:text-[#C4A035]",
      dot: "bg-[#C4A035]",
    },
  } as Record<string, { label: string; bg: string; text: string; dot: string }>;
};

const getFillPercent = (current: number, max: number) =>
  max <= 0 ? 0 : Math.min(Math.round((current / max) * 100), 100);

const getFillColor = (percent: number) => {
  if (percent >= 90)
    return { bar: "bg-[#C4A035]", label: "text-[#C4A035] dark:text-[#C4A035]" };
  if (percent >= 60)
    return {
      bar: "bg-[#2B6F5E] dark:bg-[#4ADE80]",
      label: "text-[#2B6F5E] dark:text-[#4ADE80]",
    };
  return { bar: "bg-[#8DB896]", label: "text-[#3D7A4A] dark:text-[#4ADE80]" };
};

/* ═══════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════ */

const GroupsSkeleton = ({ rtl }: { rtl: boolean }) => (
  <div className="space-y-6 animate-pulse" dir={rtl ? "rtl" : "ltr"}>
    <div>
      <div className="h-7 w-36 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded-lg" />
      <div className="h-4 w-56 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded-lg mt-2" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] p-4 h-[76px]"
        />
      ))}
    </div>
    <div className="h-11 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A]" />
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[210px]"
        />
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   STAT PILL
═══════════════════════════════════════════════════════════ */

const PILL_COLORS = {
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

const StatPill = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: keyof typeof PILL_COLORS;
}) => {
  const c = PILL_COLORS[color];
  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] px-4 py-3 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}
      >
        <Icon className={`w-[18px] h-[18px] ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className={`text-xl font-bold leading-tight ${c.val}`}>{value}</p>
        <p className="text-[11px] text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] truncate">
          {label}
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   GROUP CARD
═══════════════════════════════════════════════════════════ */

const GroupCard = ({ group }: { group: TeacherGroup }) => {
  const { t, isRTL } = useLanguage();
  const statusMap = useStatusMap();
  const status = statusMap[group.status] ?? {
    label: group.status,
    bg: "bg-gray-100 dark:bg-gray-800/30",
    text: "text-gray-600 dark:text-gray-400 dark:text-gray-500",
    dot: "bg-gray-400 dark:bg-gray-500",
  };
  const fillPercent = getFillPercent(group.student_count, group.max_students);
  const fill = getFillColor(fillPercent);
  const Chev = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Link
      to={`/teacher/groups/${group.group_id}`}
      className="block bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] hover:border-[#2B6F5E]/30 dark:border-[#4ADE80]/30 hover:shadow-lg transition-all duration-300 overflow-hidden group/card"
    >
      {/* Accent bar */}
      <div
        className={`h-1 bg-gradient-to-${isRTL ? "l" : "r"} from-[#2B6F5E] dark:from-[#4ADE80] via-[#2B6F5E]/50 to-transparent opacity-30 group-hover/card:opacity-100 transition-opacity`}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3.5">
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5] group-hover/card:text-[#2B6F5E] dark:text-[#4ADE80] transition-colors truncate leading-snug">
              {group.name}
            </h3>
            <p className="text-xs text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] mt-1 truncate">
              {group.course.course_name}
            </p>
          </div>
          <span
            className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ms-3 ${status.bg} ${status.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        {/* Capacity bar */}
        {group.max_students > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
                {t("teacher.groups.capacity")}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-bold ${fill.label}`}>
                  {fillPercent}%
                </span>
                <span className="text-[11px] text-[#BEB29E] dark:text-[#888888]">
                  ({group.student_count}/{group.max_students})
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded-full overflow-hidden">
              <div
                className={`h-full ${fill.bar} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Info chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/2 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/60 px-2.5 py-1.5 rounded-lg">
            <Users className="w-3.5 h-3.5 text-[#2B6F5E]/50 dark:text-[#4ADE80]/50" />
            {group.student_count} {t("teacher.groups.student")}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/2 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/60 px-2.5 py-1.5 rounded-lg">
            <CalendarDays className="w-3.5 h-3.5 text-[#C4A035]/50 dark:text-[#C4A035]/50" />
            {group.session_count} {t("teacher.groups.session")}
          </span>
          {group.level && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/2 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/60 px-2.5 py-1.5 rounded-lg">
              <BarChart3 className="w-3.5 h-3.5 text-[#8DB896]/70 dark:text-[#4ADE80]/70" />
              {group.level}
            </span>
          )}
          {group.course.course_code && (
            <span className="inline-flex items-center text-[10px] font-mono text-[#BEB29E] dark:text-[#888888] bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/10 dark:bg-[#2A2A2A]/15 border border-[#D8CDC0]/2 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/60 px-2 py-1.5 rounded-lg">
              {group.course.course_code}
            </span>
          )}
          {group.department && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/2 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/60 px-2.5 py-1.5 rounded-lg">
              <GraduationCap className="w-3.5 h-3.5 text-[#BEB29E] dark:text-[#888888]" />
              {group.department.name}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-[#D8CDC0]/1 dark:border-[#2A2A2A]5 dark:border-[#2A2A2A]/50 bg-[#FAFAF8]/6 dark:bg-[#1A1A1A]/60 dark:bg-[#1A1A1A]/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-[#2B6F5E]/6 dark:text-[#4ADE80]/60 dark:text-[#4ADE80]/60 group-hover/card:text-[#2B6F5E] dark:text-[#4ADE80] transition-colors">
          <TrendingUp className="w-3.5 h-3.5" />
          {t("teacher.groups.viewDetails")}
        </div>
        <Chev className="w-4 h-4 text-[#BEB29E] dark:text-[#888888] group-hover/card:text-[#2B6F5E] dark:text-[#4ADE80] transition-all" />
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
}) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center mb-4">
        <BookOpen className="w-7 h-7 text-[#BEB29E] dark:text-[#888888]" />
      </div>
      <h3 className="text-base font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
        {hasFilters
          ? t("teacher.groups.noResults")
          : t("teacher.groups.noGroupsYet")}
      </h3>
      <p className="text-sm text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] max-w-xs mb-4">
        {hasFilters
          ? t("teacher.groups.noResultsDesc")
          : t("teacher.groups.noGroupsDesc")}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:text-[#2B6F5E] dark:hover:text-[#4ADE80]/70 dark:text-[#4ADE80]/70 underline underline-offset-4 transition-colors"
        >
          {t("teacher.groups.clearFilters")}
        </button>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

export default function TeacherGroups() {
  const { data, isLoading, isError } = useTeacherGroups();
  const { t, dir, isRTL } = useLanguage();
  const statusMap = useStatusMap();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const groups: TeacherGroup[] = data ?? [];

  /* Derived stats */
  const stats = useMemo(() => {
    const totalStudents = groups.reduce((s, g) => s + g.student_count, 0);
    const totalSessions = groups.reduce((s, g) => s + g.session_count, 0);
    const activeCount = groups.filter((g) => g.status === "ACTIVE").length;
    return { totalStudents, totalSessions, activeCount };
  }, [groups]);

  /* Unique statuses */
  const statuses = useMemo(
    () => Array.from(new Set(groups.map((g) => g.status))),
    [groups],
  );

  const hasFilters = search.trim() !== "" || statusFilter !== "all";

  /* Filtered groups */
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

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  if (isLoading) return <GroupsSkeleton rtl={isRTL} />;

  if (isError) {
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
          {t("teacher.groups.errorTitle")}
        </h3>
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {t("teacher.groups.errorDesc")}
        </p>
      </div>
    );
  }

  return (
    <div dir={dir} className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("teacher.groups.title")}
          </h1>
          <p className="text-sm text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] mt-0.5">
            {t("teacher.groups.subtitle")}
          </p>
        </div>
        <p className="text-xs text-[#BEB29E] dark:text-[#888888]">
          {t("teacher.groups.totalGroups", { count: groups.length })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill
          label={t("teacher.groups.totalGroupsLabel")}
          value={groups.length}
          icon={Layers}
          color="teal"
        />
        <StatPill
          label={t("teacher.groups.activeGroups")}
          value={stats.activeCount}
          icon={TrendingUp}
          color="green"
        />
        <StatPill
          label={t("teacher.groups.totalStudents")}
          value={stats.totalStudents}
          icon={Users}
          color="gold"
        />
        <StatPill
          label={t("teacher.groups.totalSessions")}
          value={stats.totalSessions}
          icon={CalendarDays}
          color="beige"
        />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
          />
          <input
            type="text"
            placeholder={t("teacher.groups.searchPlaceholder")}
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

        {/* Status filter */}
        <div className="relative shrink-0">
          <Filter
            className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`h-11 ${isRTL ? "pr-10 pl-8" : "pl-10 pr-8"} bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10 appearance-none cursor-pointer transition-all min-w-[140px]`}
          >
            <option value="all">{t("teacher.groups.allStatuses")}</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {(statusMap[s] ?? { label: s }).label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters bar */}
      {hasFilters && (
        <div className="flex items-center justify-between bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border border-[#2B6F5E]/1 dark:border-[#4ADE80]/10 dark:border-[#4ADE80]/10 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
              {t("teacher.groups.results")}:
            </span>
            <span className="font-semibold text-[#2B6F5E] dark:text-[#4ADE80]">
              {filtered.length}
            </span>
            {search.trim() && (
              <span className="text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
                · &quot;{search}&quot;
              </span>
            )}
            {statusFilter !== "all" && (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${(statusMap[statusFilter] ?? { bg: "" }).bg} ${(statusMap[statusFilter] ?? { text: "" }).text}`}
              >
                {(statusMap[statusFilter] ?? { label: statusFilter }).label}
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:text-[#2B6F5E] dark:hover:text-[#4ADE80]/70 dark:text-[#4ADE80]/70 flex items-center gap-1 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            {t("teacher.groups.clear")}
          </button>
        </div>
      )}

      {/* Groups Grid / Empty */}
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
