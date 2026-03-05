// ================================================================
// 📦 src/pages/admin/groups/AdminGroupsPage.tsx
// ✅ Split view — list left + details right
// ✅ Real API via useAdminGroups hooks
// ✅ Status change, teacher assign, student transfer
// ================================================================

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  UserCheck,
  Layers,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowLeftRight,
  UserCog,
  RefreshCw,
  X,
  GraduationCap,
  BookOpen,
  BarChart3,
  Check,
  Wifi,
} from "lucide-react";
import { useLanguage } from "../../../../hooks/useLanguage";
import { toast } from "sonner";
import {
  useAdminGroups,
  useAdminGroupStudents,
  useChangeGroupStatus,
  useAssignGroupTeacher,
  useTransferStudent,
  useAllTeachers,
  type Group,
  type GroupStudent,
  type GroupStatus,
} from "../../../../hooks/admin/useAdminGroups";
import { useGroupsSocket } from "../../../../hooks/admin/useGroupsSocket";

// ─── Config ───────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, { color: string; bg: string }> = {
  PRE_A1: { color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  A1: { color: "#22c55e", bg: "rgba(34,197,94,0.10)" },
  A2: { color: "#3b82f6", bg: "rgba(59,130,246,0.10)" },
  B1: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
  B2: { color: "#f97316", bg: "rgba(249,115,22,0.10)" },
  C1: { color: "#a855f7", bg: "rgba(168,85,247,0.10)" },
};

const STATUS_CFG: Record<
  GroupStatus,
  { ar: string; fr: string; icon: React.ElementType; color: string; bg: string }
> = {
  OPEN: {
    ar: "مفتوح",
    fr: "Ouvert",
    icon: CheckCircle2,
    color: "#2B6F5E",
    bg: "rgba(43,111,94,0.10)",
  },
  FULL: {
    ar: "ممتلئ",
    fr: "Complet",
    icon: XCircle,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.10)",
  },
  FINISHED: {
    ar: "منتهي",
    fr: "Terminé",
    icon: Clock,
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.10)",
  },
};

const ENROLL_STATUS_CFG: Record<
  string,
  { ar: string; color: string; bg: string }
> = {
  VALIDATED: { ar: "موثق", color: "#2B6F5E", bg: "rgba(43,111,94,0.10)" },
  PAID: { ar: "مدفوع", color: "#3b82f6", bg: "rgba(59,130,246,0.10)" },
  PENDING: { ar: "معلق", color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
  REJECTED: { ar: "مرفوض", color: "#ef4444", bg: "rgba(239,68,68,0.10)" },
  FINISHED: { ar: "منتهي", color: "#94a3b8", bg: "rgba(148,163,184,0.10)" },
};

const COURSE_FLAG: Record<string, string> = {
  ENG: "🇬🇧",
  FRN: "🇫🇷",
  ESP: "🇪🇸",
  ARA: "🇩🇿",
  DEU: "🇩🇪",
  default: "🌐",
};

// ─── Capacity Bar ─────────────────────────────────────────────
function CapacityBar({
  pct,
  count,
  max,
}: {
  pct: number;
  count: number;
  max: number;
}) {
  const color = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#2B6F5E";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-[#9B8E82] dark:text-[#666]">الطلبة</span>
        <span className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
          {count}
          <span className="text-[#9B8E82] font-normal">/{max}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[#F0EBE5] dark:bg-[#2A2A2A] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: GroupStatus }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon className="w-3 h-3" />
      {cfg.ar}
    </span>
  );
}

// ─── Group Row (left panel) ───────────────────────────────────
function GroupRow({
  group,
  selected,
  onClick,
}: {
  group: Group;
  selected: boolean;
  onClick: () => void;
}) {
  const flag = COURSE_FLAG[group.course.course_code] ?? COURSE_FLAG.default;
  const lvl = LEVEL_COLORS[group.level] ?? LEVEL_COLORS.A1;
  const fill = group.capacity_pct;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-[#F0EBE5] dark:border-[#1E1E1E] transition-all duration-150 ${
        selected
          ? "bg-[#EDF6F3] dark:bg-[#0F2420] border-l-2 border-l-[#2B6F5E]"
          : "hover:bg-[#FDFAF7] dark:hover:bg-[#111] border-l-2 border-l-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Flag avatar */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 bg-[#F5F0EB] dark:bg-[#1A1A1A]">
          {flag}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span
              className={`text-[13px] font-semibold truncate ${selected ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
            >
              {group.name}
            </span>
            <StatusBadge status={group.status} />
          </div>

          <div className="flex items-center gap-2">
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-bold"
              style={{ background: lvl.bg, color: lvl.color }}
            >
              {group.level.replace("_", "-")}
            </span>
            <span className="text-[11px] text-[#9B8E82] dark:text-[#555] truncate">
              {group.course.course_name}
            </span>
            <span className="text-[11px] text-[#9B8E82] dark:text-[#555] ms-auto">
              {group.enrolled_count}/{group.max_students}
            </span>
          </div>

          {/* mini bar */}
          <div className="mt-1.5 h-1 rounded-full bg-[#F0EBE5] dark:bg-[#2A2A2A] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${fill}%`,
                background:
                  fill >= 90 ? "#ef4444" : fill >= 70 ? "#f59e0b" : "#2B6F5E",
              }}
            />
          </div>
        </div>

        <ChevronRight
          className={`w-4 h-4 shrink-0 transition-transform ${selected ? "text-[#2B6F5E] dark:text-[#4ADE80] rotate-90" : "text-[#C8BFB5] dark:text-[#333]"}`}
        />
      </div>
    </button>
  );
}

// ─── Change Status Modal ──────────────────────────────────────
function StatusModal({
  group,
  onClose,
}: {
  group: Group;
  onClose: () => void;
}) {
  const { mutate, isPending } = useChangeGroupStatus();
  const statuses: GroupStatus[] = ["OPEN", "FULL", "FINISHED"];

  const handle = (status: GroupStatus) => {
    mutate(
      { groupId: group.group_id, status },
      {
        onSuccess: () => {
          toast.success("تم تغيير حالة الفوج");
          onClose();
        },
        onError: (e: any) => toast.error(e?.response?.data?.message ?? "خطأ"),
      },
    );
  };

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white dark:bg-[#161616] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-base font-bold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
          تغيير حالة الفوج
        </h3>
        <p className="text-[12px] text-[#9B8E82] mb-5">{group.name}</p>
        <div className="space-y-2">
          {statuses.map((s) => {
            const cfg = STATUS_CFG[s];
            const Icon = cfg.icon;
            const isActive = group.status === s;
            return (
              <button
                key={s}
                onClick={() => !isActive && handle(s)}
                disabled={isPending || isActive}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  isActive
                    ? "border-[#2B6F5E] bg-[#EDF6F3] dark:bg-[#0F2420] cursor-default"
                    : "border-[#E8E0D5] dark:border-[#2A2A2A] hover:border-[#2B6F5E] hover:bg-[#FDFAF7] dark:hover:bg-[#111]"
                }`}
              >
                <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                <span className="text-[13px] font-medium text-[#1B1B1B] dark:text-[#E5E5E5] flex-1 text-start">
                  {cfg.ar}
                </span>
                {isActive && <Check className="w-4 h-4 text-[#2B6F5E]" />}
              </button>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] text-[13px] text-[#9B8E82] hover:bg-[#F5F0EB] dark:hover:bg-[#1A1A1A] transition-colors"
        >
          إلغاء
        </button>
      </div>
    </Overlay>
  );
}

// ─── Assign Teacher Modal ─────────────────────────────────────
function TeacherModal({
  group,
  onClose,
}: {
  group: Group;
  onClose: () => void;
}) {
  const { data: teachers = [], isLoading } = useAllTeachers();
  const { mutate, isPending } = useAssignGroupTeacher();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      (teachers as any[]).filter((t: any) =>
        `${t.first_name} ${t.last_name}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [teachers, search],
  );

  const assign = (teacher_id: string | null) => {
    mutate(
      { groupId: group.group_id, teacher_id },
      {
        onSuccess: () => {
          toast.success(
            teacher_id ? "تم تعيين الأستاذ" : "تم إلغاء تعيين الأستاذ",
          );
          onClose();
        },
        onError: (e: any) => toast.error(e?.response?.data?.message ?? "خطأ"),
      },
    );
  };

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white dark:bg-[#161616] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-base font-bold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
          تعيين أستاذ
        </h3>
        <p className="text-[12px] text-[#9B8E82] mb-4">{group.name}</p>

        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9B8E82]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن أستاذ..."
            className="w-full h-9 pr-9 pl-3 rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] bg-[#F5F0EB] dark:bg-[#111] text-[13px] text-[#1B1B1B] dark:text-[#E5E5E5] outline-none"
          />
        </div>

        <div className="max-h-60 overflow-y-auto space-y-1 mb-3">
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#9B8E82]" />
            </div>
          ) : (
            filtered.map((t: any) => {
              const isCurrent = group.teacher?.teacher_id === t.teacher_id;
              return (
                <button
                  key={t.teacher_id}
                  onClick={() => assign(t.teacher_id)}
                  disabled={isPending}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent
                      ? "bg-[#EDF6F3] dark:bg-[#0F2420]"
                      : "hover:bg-[#F5F0EB] dark:hover:bg-[#111]"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#2B6F5E] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                    {t.first_name[0]}
                    {t.last_name[0]}
                  </div>
                  <div className="flex-1 text-start">
                    <p className="text-[13px] font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                      {t.first_name} {t.last_name}
                    </p>
                    <p className="text-[11px] text-[#9B8E82]">{t.email}</p>
                  </div>
                  {isCurrent && <Check className="w-4 h-4 text-[#2B6F5E]" />}
                </button>
              );
            })
          )}
          {!isLoading && filtered.length === 0 && (
            <p className="py-6 text-center text-[12px] text-[#9B8E82]">
              لا توجد نتائج
            </p>
          )}
        </div>

        {group.teacher && (
          <button
            onClick={() => assign(null)}
            disabled={isPending}
            className="w-full py-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 text-[12px] font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mb-2"
          >
            إلغاء تعيين الأستاذ الحالي
          </button>
        )}
        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] text-[13px] text-[#9B8E82] hover:bg-[#F5F0EB] dark:hover:bg-[#1A1A1A] transition-colors"
        >
          إلغاء
        </button>
      </div>
    </Overlay>
  );
}

// ─── Transfer Modal ───────────────────────────────────────────
function TransferModal({
  student,
  fromGroup,
  allGroups,
  onClose,
}: {
  student: GroupStudent;
  fromGroup: Group;
  allGroups: Group[];
  onClose: () => void;
}) {
  const { mutate, isPending } = useTransferStudent();
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const eligible = allGroups.filter(
    (g) =>
      g.group_id !== fromGroup.group_id &&
      g.course.course_id === fromGroup.course.course_id &&
      g.status !== "FINISHED" &&
      !g.is_full &&
      g.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handle = () => {
    if (!selectedGroup) return;
    mutate(
      {
        fromGroupId: fromGroup.group_id,
        studentId: student.student.student_id,
        toGroupId: selectedGroup.group_id,
      },
      {
        onSuccess: () => {
          toast.success(
            `تم نقل ${student.student.first_name} إلى ${selectedGroup.name}`,
          );
          onClose();
        },
        onError: (e: any) =>
          toast.error(e?.response?.data?.message ?? "خطأ في النقل"),
      },
    );
  };

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white dark:bg-[#161616] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-base font-bold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
          نقل الطالب
        </h3>
        <p className="text-[12px] text-[#9B8E82] mb-4">
          {student.student.first_name} {student.student.last_name} — من:{" "}
          <span className="font-semibold">{fromGroup.name}</span>
        </p>

        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9B8E82]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن فوج..."
            className="w-full h-9 pr-9 pl-3 rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] bg-[#F5F0EB] dark:bg-[#111] text-[13px] outline-none text-[#1B1B1B] dark:text-[#E5E5E5]"
          />
        </div>

        <div className="max-h-52 overflow-y-auto space-y-1 mb-4">
          {eligible.length === 0 ? (
            <p className="py-8 text-center text-[12px] text-[#9B8E82]">
              لا توجد أفواج متاحة لنفس المادة
            </p>
          ) : (
            eligible.map((g) => (
              <button
                key={g.group_id}
                onClick={() => setSelectedGroup(g)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                  selectedGroup?.group_id === g.group_id
                    ? "border-[#2B6F5E] bg-[#EDF6F3] dark:bg-[#0F2420]"
                    : "border-transparent hover:bg-[#F5F0EB] dark:hover:bg-[#111]"
                }`}
              >
                <div className="flex-1 text-start">
                  <p className="text-[13px] font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {g.name}
                  </p>
                  <p className="text-[11px] text-[#9B8E82]">
                    {g.level.replace("_", "-")} · {g.enrolled_count}/
                    {g.max_students}
                  </p>
                </div>
                <StatusBadge status={g.status} />
                {selectedGroup?.group_id === g.group_id && (
                  <Check className="w-4 h-4 text-[#2B6F5E] shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] text-[13px] text-[#9B8E82]"
          >
            إلغاء
          </button>
          <button
            onClick={handle}
            disabled={!selectedGroup || isPending}
            className="flex-1 py-2.5 rounded-xl bg-[#2B6F5E] hover:bg-[#235C4E] text-white text-[13px] font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowLeftRight className="w-4 h-4" />
            )}
            نقل
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ─── Overlay ──────────────────────────────────────────────────
function Overlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </div>
  );
}

// ─── Student Detail + Transfer Modal ─────────────────────────
function StudentDetailModal({
  student,
  group,
  allGroups,
  onClose,
}: {
  student: GroupStudent;
  group: Group;
  allGroups: Group[];
  onClose: () => void;
}) {
  const { mutate, isPending } = useTransferStudent();
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [step, setStep] = useState<"info" | "transfer">("info");

  const s = student.student;
  const cfg =
    ENROLL_STATUS_CFG[student.registration_status] ?? ENROLL_STATUS_CFG.PENDING;
  const lvl = LEVEL_COLORS[group.level] ?? LEVEL_COLORS.A1;
  const flag = COURSE_FLAG[group.course.course_code] ?? COURSE_FLAG.default;

  // كل الأفواج من نفس المادة عدا الفوج الحالي
  const eligibleGroups = allGroups.filter(
    (g) =>
      g.group_id !== group.group_id &&
      g.course.course_id === group.course.course_id &&
      g.status !== "FINISHED",
  );

  const filteredGroups = eligibleGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.teacher &&
        `${g.teacher.first_name} ${g.teacher.last_name}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );

  const handleTransfer = () => {
    if (!selectedGroup) return;
    mutate(
      {
        fromGroupId: group.group_id,
        studentId: s.student_id,
        toGroupId: selectedGroup.group_id,
      },
      {
        onSuccess: () => {
          toast.success(`تم نقل ${s.first_name} إلى ${selectedGroup.name}`);
          onClose();
        },
        onError: (e: any) =>
          toast.error(e?.response?.data?.message ?? "خطأ في النقل"),
      },
    );
  };

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white dark:bg-[#161616] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EBE5] dark:border-[#1E1E1E]">
          <div className="flex items-center gap-2">
            {step === "transfer" && (
              <button
                onClick={() => setStep("info")}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9B8E82] hover:bg-[#F0EBE5] dark:hover:bg-[#222] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <h3 className="text-[15px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {step === "info" ? "بيانات الطالب" : "اختر الفوج الجديد"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9B8E82] hover:bg-[#F0EBE5] dark:hover:bg-[#222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "info" ? (
          <>
            <div className="p-5 space-y-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#2B6F5E]/10 flex items-center justify-center text-[15px] font-bold text-[#2B6F5E] dark:text-[#4ADE80] shrink-0">
                  {s.first_name[0]}
                  {s.last_name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {s.first_name} {s.last_name}
                  </p>
                  <p className="text-[12px] text-[#9B8E82]">{s.email}</p>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.ar}
                </span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2">
                {s.phone_number && (
                  <div className="bg-[#F5F0EB] dark:bg-[#111] rounded-xl px-3 py-2">
                    <p className="text-[10px] text-[#9B8E82] mb-0.5">الهاتف</p>
                    <p
                      className="text-[12px] font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate"
                      dir="ltr"
                    >
                      {s.phone_number}
                    </p>
                  </div>
                )}
                {s.registrant_category && (
                  <div className="bg-[#F5F0EB] dark:bg-[#111] rounded-xl px-3 py-2">
                    <p className="text-[10px] text-[#9B8E82] mb-0.5">الصفة</p>
                    <p className="text-[12px] font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                      {s.registrant_category}
                    </p>
                  </div>
                )}
                <div className="bg-[#F5F0EB] dark:bg-[#111] rounded-xl px-3 py-2">
                  <p className="text-[10px] text-[#9B8E82] mb-0.5">
                    تاريخ التسجيل
                  </p>
                  <p className="text-[12px] font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {new Date(student.enrollment_date).toLocaleDateString(
                      "ar-DZ",
                    )}
                  </p>
                </div>
                {s.gender && (
                  <div className="bg-[#F5F0EB] dark:bg-[#111] rounded-xl px-3 py-2">
                    <p className="text-[10px] text-[#9B8E82] mb-0.5">الجنس</p>
                    <p className="text-[12px] font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                      {s.gender === "MALE" ? "ذكر" : "أنثى"}
                    </p>
                  </div>
                )}
              </div>

              {/* Current group card */}
              <div className="rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] overflow-hidden">
                <div className="px-3 py-2 bg-[#F5F0EB] dark:bg-[#111] border-b border-[#E8E0D5] dark:border-[#2A2A2A]">
                  <p className="text-[10px] font-semibold text-[#9B8E82] uppercase tracking-wide">
                    الفوج الحالي
                  </p>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg">{flag}</span>
                    <span className="text-[13px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                      {group.name}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: lvl.bg, color: lvl.color }}
                    >
                      {group.level.replace("_", "-")}
                    </span>
                    <StatusBadge status={group.status} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-[#9B8E82]">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    {group.course.course_name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-[#9B8E82]">
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    {group.teacher ? (
                      `${group.teacher.first_name} ${group.teacher.last_name}`
                    ) : (
                      <span className="italic">لا يوجد أستاذ</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] text-[13px] text-[#9B8E82] hover:bg-[#F5F0EB] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                إغلاق
              </button>
              <button
                onClick={() => setStep("transfer")}
                className="flex-1 py-2.5 rounded-xl bg-[#2B6F5E] hover:bg-[#235C4E] text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeftRight className="w-4 h-4" />
                تحويل إلى فوج آخر
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-5 space-y-3">
              {/* Student reminder */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F5F0EB] dark:bg-[#111]">
                <div className="w-7 h-7 rounded-full bg-[#2B6F5E]/10 flex items-center justify-center text-[11px] font-bold text-[#2B6F5E] dark:text-[#4ADE80] shrink-0">
                  {s.first_name[0]}
                  {s.last_name[0]}
                </div>
                <span className="text-[12px] font-medium text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                  {s.first_name} {s.last_name}
                </span>
                <span className="ms-auto text-[11px] text-[#9B8E82]">
                  من: <span className="font-semibold">{group.name}</span>
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9B8E82]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو الأستاذ..."
                  className="w-full h-9 pr-9 pl-3 rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] bg-[#F5F0EB] dark:bg-[#111] text-[13px] outline-none text-[#1B1B1B] dark:text-[#E5E5E5]"
                />
              </div>

              {/* Groups list */}
              <div className="max-h-64 overflow-y-auto space-y-1.5 -mx-1 px-1">
                {filteredGroups.length === 0 ? (
                  <p className="py-8 text-center text-[12px] text-[#9B8E82]">
                    لا توجد أفواج متاحة لنفس المادة
                  </p>
                ) : (
                  filteredGroups.map((g) => {
                    const isFull = g.is_full;
                    const isSelected = selectedGroup?.group_id === g.group_id;
                    const gLvl = LEVEL_COLORS[g.level] ?? LEVEL_COLORS.A1;
                    const capacityPct = g.capacity_pct;
                    const capacityColor =
                      capacityPct >= 90
                        ? "#ef4444"
                        : capacityPct >= 70
                          ? "#f59e0b"
                          : "#2B6F5E";

                    return (
                      <button
                        key={g.group_id}
                        onClick={() => !isFull && setSelectedGroup(g)}
                        disabled={isFull}
                        className={`w-full text-right rounded-xl border p-3 transition-all ${
                          isFull
                            ? "border-[#F0EBE5] dark:border-[#1E1E1E] opacity-50 cursor-not-allowed bg-[#FAFAFA] dark:bg-[#0D0D0D]"
                            : isSelected
                              ? "border-[#2B6F5E] bg-[#EDF6F3] dark:bg-[#0F2420]"
                              : "border-[#E8E0D5] dark:border-[#2A2A2A] hover:border-[#2B6F5E] hover:bg-[#FDFAF7] dark:hover:bg-[#111]"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {/* Group info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="text-[13px] font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                                {g.name}
                              </span>
                              <span
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0"
                                style={{
                                  background: gLvl.bg,
                                  color: gLvl.color,
                                }}
                              >
                                {g.level.replace("_", "-")}
                              </span>
                              {isFull && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-100 dark:bg-red-900/20 text-red-500 shrink-0">
                                  ممتلئ
                                </span>
                              )}
                            </div>

                            {/* Teacher */}
                            <div className="flex items-center gap-1 text-[11px] text-[#9B8E82] mb-1.5">
                              <GraduationCap className="w-3 h-3 shrink-0" />
                              {g.teacher ? (
                                `${g.teacher.first_name} ${g.teacher.last_name}`
                              ) : (
                                <span className="italic">لا يوجد أستاذ</span>
                              )}
                            </div>

                            {/* Capacity bar */}
                            <div className="space-y-0.5">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-[#9B8E82]">الطاقة</span>
                                <span
                                  className="font-semibold"
                                  style={{ color: capacityColor }}
                                >
                                  {g.enrolled_count}/{g.max_students}
                                </span>
                              </div>
                              <div className="h-1 rounded-full bg-[#F0EBE5] dark:bg-[#2A2A2A] overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${capacityPct}%`,
                                    background: capacityColor,
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Check icon */}
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#2B6F5E] shrink-0 mt-1" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={() => setStep("info")}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] text-[13px] text-[#9B8E82] hover:bg-[#F5F0EB] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                رجوع
              </button>
              <button
                onClick={handleTransfer}
                disabled={!selectedGroup || isPending}
                className="flex-1 py-2.5 rounded-xl bg-[#2B6F5E] hover:bg-[#235C4E] text-white text-[13px] font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowLeftRight className="w-4 h-4" />
                )}
                تأكيد النقل
              </button>
            </div>
          </>
        )}
      </div>
    </Overlay>
  );
}

// ─── Right Panel — Group Details ──────────────────────────────
function GroupDetails({
  group,
  allGroups,
}: {
  group: Group;
  allGroups: Group[];
}) {
  const [statusModal, setStatusModal] = useState(false);
  const [teacherModal, setTeacherModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<GroupStudent | null>(
    null,
  );
  const [enrollFilter, setEnrollFilter] = useState<string>("ALL");

  const {
    data: studentsData,
    isLoading: loadingStudents,
    refetch,
  } = useAdminGroupStudents(group.group_id);

  const students = studentsData?.data ?? [];

  const filtered = useMemo(
    () =>
      enrollFilter === "ALL"
        ? students
        : students.filter((s) => s.registration_status === enrollFilter),
    [students, enrollFilter],
  );

  const flag = COURSE_FLAG[group.course.course_code] ?? COURSE_FLAG.default;
  const lvl = LEVEL_COLORS[group.level] ?? LEVEL_COLORS.A1;

  return (
    <div className="flex flex-col h-full">
      {/* ── Group header ── */}
      <div className="p-5 border-b border-[#F0EBE5] dark:border-[#1E1E1E] shrink-0">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F0EB] dark:bg-[#1A1A1A] flex items-center justify-center text-2xl shrink-0">
            {flag}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[16px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5] leading-tight">
              {group.name}
            </h2>
            <p className="text-[12px] text-[#9B8E82]">
              {group.course.course_name}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold"
                style={{ background: lvl.bg, color: lvl.color }}
              >
                {group.level.replace("_", "-")}
              </span>
              <StatusBadge status={group.status} />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            {
              icon: Users,
              label: "الطلبة",
              value: `${group.enrolled_count}/${group.max_students}`,
            },
            { icon: Layers, label: "الحصص", value: group._count.sessions },
            {
              icon: BarChart3,
              label: "الإشغال",
              value: `${group.capacity_pct}%`,
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-[#F5F0EB] dark:bg-[#111] rounded-xl p-3 text-center"
            >
              <Icon className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80] mx-auto mb-1" />
              <p className="text-[14px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {value}
              </p>
              <p className="text-[10px] text-[#9B8E82]">{label}</p>
            </div>
          ))}
        </div>

        <CapacityBar
          pct={group.capacity_pct}
          count={group.enrolled_count}
          max={group.max_students}
        />

        {/* Teacher */}
        <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-[#F5F0EB] dark:bg-[#111]">
          <div className="w-8 h-8 rounded-full bg-[#2B6F5E]/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[#9B8E82] uppercase tracking-wide">
              الأستاذ
            </p>
            <p
              className={`text-[13px] font-medium truncate ${group.teacher ? "text-[#1B1B1B] dark:text-[#E5E5E5]" : "text-[#9B8E82] italic"}`}
            >
              {group.teacher
                ? `${group.teacher.first_name} ${group.teacher.last_name}`
                : "غير محدد"}
            </p>
          </div>
          <button
            onClick={() => setTeacherModal(true)}
            className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:bg-[#2B6F5E]/10 transition-colors"
          >
            <UserCog className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setStatusModal(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F5F0EB] dark:bg-[#111] hover:bg-[#E8E0D5] dark:hover:bg-[#1A1A1A] text-[12px] font-medium text-[#3D3530] dark:text-[#CCCCCC] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            تغيير الحالة
          </button>
          <button
            onClick={() => refetch()}
            className="w-9 flex items-center justify-center rounded-xl bg-[#F5F0EB] dark:bg-[#111] hover:bg-[#E8E0D5] dark:hover:bg-[#1A1A1A] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#9B8E82]" />
          </button>
        </div>
      </div>

      {/* ── Students list ── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-3 flex items-center gap-2 border-b border-[#F0EBE5] dark:border-[#1E1E1E] shrink-0">
          <Users className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
          <span className="text-[13px] font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            الطلبة ({students.length})
          </span>
          <div className="ms-auto flex gap-1">
            {["ALL", "VALIDATED", "PAID", "PENDING"].map((s) => (
              <button
                key={s}
                onClick={() => setEnrollFilter(s)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors ${
                  enrollFilter === s
                    ? "bg-[#2B6F5E] text-white"
                    : "bg-[#F5F0EB] dark:bg-[#1A1A1A] text-[#9B8E82] hover:text-[#3D3530] dark:hover:text-[#CCCCCC]"
                }`}
              >
                {s === "ALL" ? "الكل" : (ENROLL_STATUS_CFG[s]?.ar ?? s)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingStudents ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#2B6F5E]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-[#E8E0D5] dark:text-[#2A2A2A] mx-auto mb-3" />
              <p className="text-[13px] text-[#9B8E82]">لا يوجد طلبة</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F0EB] dark:divide-[#1A1A1A]">
              {filtered.map((s) => {
                const cfg =
                  ENROLL_STATUS_CFG[s.registration_status] ??
                  ENROLL_STATUS_CFG.PENDING;
                const canTransfer =
                  s.registration_status === "VALIDATED" ||
                  s.registration_status === "PAID" ||
                  s.registration_status === "PENDING";
                return (
                  <div
                    key={s.enrollment_id}
                    onClick={() => setSelectedStudent(s)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#FDFAF7] dark:hover:bg-[#0D0D0D] group/row transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#2B6F5E]/10 flex items-center justify-center text-[12px] font-bold text-[#2B6F5E] dark:text-[#4ADE80] shrink-0">
                      {s.student.first_name[0]}
                      {s.student.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                        {s.student.first_name} {s.student.last_name}
                      </p>
                      <p className="text-[11px] text-[#9B8E82] truncate">
                        {s.student.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.ar}
                      </span>
                      {canTransfer && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(s);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9B8E82] hover:text-[#2B6F5E] hover:bg-[#EDF6F3] dark:hover:bg-[#0F2420] opacity-0 group-hover/row:opacity-100 transition-all"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {statusModal && (
        <StatusModal group={group} onClose={() => setStatusModal(false)} />
      )}
      {teacherModal && (
        <TeacherModal group={group} onClose={() => setTeacherModal(false)} />
      )}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          group={group}
          allGroups={allGroups}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminGroupsPage() {
  const { currentLang } = useLanguage();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useAdminGroups({
    search: search || undefined,
    status: filterStatus !== "ALL" ? (filterStatus as any) : undefined,
    level: filterLevel !== "ALL" ? filterLevel : undefined,
    limit: 100,
  });

  const groups = data?.data ?? [];
  const selected = groups.find((g) => g.group_id === selectedId) ?? null;

  // ✅ Realtime — auto-refresh on socket events
  const [realtimeFlash, setRealtimeFlash] = useState(false);
  useGroupsSocket({
    watchGroupIds: selectedId ? [selectedId] : [],
    onEvent: () => {
      setRealtimeFlash(true);
      setTimeout(() => setRealtimeFlash(false), 1500);
    },
  });

  const stats = useMemo(
    () => ({
      total: groups.length,
      open: groups.filter((g) => g.status === "OPEN").length,
      full: groups.filter((g) => g.status === "FULL").length,
      finished: groups.filter((g) => g.status === "FINISHED").length,
    }),
    [groups],
  );

  return (
    <div
      className="flex flex-col h-[calc(100vh-64px)] bg-[#FDFAF7] dark:bg-[#0A0A0A]"
      dir="rtl"
    >
      {/* ── Top bar ── */}
      <div className="px-5 py-4 bg-white dark:bg-[#0D0D0D] border-b border-[#E8E0D5] dark:border-[#1E1E1E] shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                إدارة الأفواج
              </h1>
              <span
                title="مباشر"
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold transition-all duration-500 ${
                  realtimeFlash
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 scale-110"
                    : "bg-[#F0EBE5] dark:bg-[#1A1A1A] text-[#9B8E82]"
                }`}
              >
                <Wifi className="w-2.5 h-2.5" />
                مباشر
              </span>
            </div>
            <p className="text-[12px] text-[#9B8E82]">
              {stats.total} فوج — {stats.open} مفتوح · {stats.full} ممتلئ ·{" "}
              {stats.finished} منتهي
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9B8E82]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث..."
                className="h-9 pr-9 pl-3 w-48 rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] bg-[#F5F0EB] dark:bg-[#111] text-[13px] text-[#1B1B1B] dark:text-[#E5E5E5] outline-none"
              />
            </div>
            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] bg-[#F5F0EB] dark:bg-[#111] text-[12px] text-[#3D3530] dark:text-[#CCCCCC] outline-none"
            >
              <option value="ALL">كل الحالات</option>
              <option value="OPEN">مفتوح</option>
              <option value="FULL">ممتلئ</option>
              <option value="FINISHED">منتهي</option>
            </select>
            {/* Level filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] bg-[#F5F0EB] dark:bg-[#111] text-[12px] text-[#3D3530] dark:text-[#CCCCCC] outline-none"
            >
              <option value="ALL">كل المستويات</option>
              {["PRE_A1", "A1", "A2", "B1", "B2", "C1"].map((l) => (
                <option key={l} value={l}>
                  {l.replace("_", "-")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Split view ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Groups list */}
        <div
          className={`shrink-0 border-l border-[#E8E0D5] dark:border-[#1E1E1E] flex flex-col bg-white dark:bg-[#0D0D0D] overflow-hidden transition-all duration-300 ${
            selected ? "w-80" : "w-full max-w-full"
          }`}
        >
          {/* List header */}
          <div className="px-4 py-2.5 border-b border-[#F0EBE5] dark:border-[#1A1A1A] flex items-center justify-between shrink-0">
            <span className="text-[12px] text-[#9B8E82]">
              {groups.length} فوج
            </span>
            {selected && (
              <button
                onClick={() => setSelectedId(null)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[#9B8E82] hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5] hover:bg-[#F0EBE5] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List body */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#2B6F5E]" />
              </div>
            ) : isError ? (
              <div className="py-20 text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-[13px] text-[#9B8E82] mb-3">
                  خطأ في تحميل البيانات
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 rounded-xl bg-[#2B6F5E] text-white text-[12px]"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : groups.length === 0 ? (
              <div className="py-20 text-center">
                <BookOpen className="w-10 h-10 text-[#E8E0D5] dark:text-[#2A2A2A] mx-auto mb-3" />
                <p className="text-[13px] text-[#9B8E82]">لا توجد أفواج</p>
              </div>
            ) : (
              groups.map((g) => (
                <GroupRow
                  key={g.group_id}
                  group={g}
                  selected={selectedId === g.group_id}
                  onClick={() => setSelectedId(g.group_id)}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT — Details */}
        {selected ? (
          <div className="flex-1 overflow-hidden">
            <GroupDetails group={selected} allGroups={groups} />
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-[#FDFAF7] dark:bg-[#0A0A0A]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F0EBE5] dark:bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-7 h-7 text-[#C8BFB5] dark:text-[#333]" />
              </div>
              <p className="text-[14px] font-medium text-[#9B8E82]">
                اختر فوجاً لعرض التفاصيل
              </p>
              <p className="text-[12px] text-[#C8BFB5] dark:text-[#444] mt-1">
                اضغط على أي فوج من القائمة
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
