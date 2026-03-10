// ================================================================
// 📦 src/pages/admin/groups/AdminGroupsPage.tsx
// ✅ Fix: useAdminGroupStudents with limit:200 to fetch ALL students
// ✅ Fix: Filter pills include FINISHED + REJECTED
// ✅ Fix: ENROLL_STATUS_CFG includes REJECTED
// ✅ Added: Remove student from group (with confirmation dialog)
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
  Check,
  Wifi,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdminGroups,
  useAdminGroupStudents,
  useChangeGroupStatus,
  useAssignGroupTeacher,
  useTransferStudent,
  useRemoveStudentFromGroup,
  useAllTeachers,
  type Group,
  type GroupStudent,
  type GroupStatus,
  type GroupTeacher,
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

// ✅ Fix: added REJECTED
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
  const studentCount = group.enrolled_count + group.pending_count;
  const fill =
    group.max_students > 0
      ? Math.min(Math.round((studentCount / group.max_students) * 100), 100)
      : 0;

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
              {studentCount}/{group.max_students}
            </span>
          </div>
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

// ─── Change Status Modal ──────────────────────────────────────
function StatusModal({
  group,
  onClose,
}: {
  group: Group;
  onClose: () => void;
}) {
  const { mutate, isPending } = useChangeGroupStatus();
  const [hovered, setHovered] = useState<GroupStatus | null>(null);
  const statuses: GroupStatus[] = ["OPEN", "FULL", "FINISHED"];
  const preview = hovered ?? group.status;
  const previewCfg = STATUS_CFG[preview];

  const handle = (status: GroupStatus) => {
    if (status === group.status || isPending) return;
    mutate(
      { groupId: group.group_id, status },
      {
        onSuccess: () => {
          toast.success("تم تغيير حالة الفوج");
          onClose();
        },
        onError: (e: unknown) => {
          const err = e as { response?: { data?: { message?: string } } };
          toast.error(err?.response?.data?.message ?? "خطأ");
        },
      },
    );
  };

  return (
    <Overlay onClose={onClose}>
      <div
        className="bg-white dark:bg-[#0E0E0E] rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden"
        style={{
          border: `1.5px solid ${previewCfg.color}30`,
          transition: "border-color 0.3s",
        }}
      >
        <div
          className="h-0.75 w-full transition-all duration-300"
          style={{ background: previewCfg.color }}
        />
        <div className="p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[10px] font-semibold text-[#9B8E82] uppercase tracking-[0.12em] mb-1">
                حالة الفوج
              </p>
              <h3 className="text-[14px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5] leading-tight max-w-35 truncate">
                {group.name}
              </h3>
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all duration-300"
              style={{
                background: previewCfg.color + "18",
                color: previewCfg.color,
              }}
            >
              {(() => {
                const Icon = previewCfg.icon;
                return <Icon className="w-3 h-3" />;
              })()}
              {previewCfg.ar}
            </div>
          </div>
          <div className="relative flex p-1 rounded-2xl bg-[#F5F0EB] dark:bg-[#1A1A1A] mb-4">
            {statuses.map((s) => {
              const cfg = STATUS_CFG[s];
              const Icon = cfg.icon;
              const isActive = group.status === s;
              const isHov = hovered === s;
              return (
                <button
                  key={s}
                  onClick={() => handle(s)}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(null)}
                  disabled={isPending}
                  className="relative flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-200"
                  style={{
                    background: isActive
                      ? cfg.color + "18"
                      : isHov
                        ? cfg.color + "0C"
                        : "transparent",
                    boxShadow: isActive
                      ? `inset 0 0 0 1px ${cfg.color}40`
                      : "none",
                  }}
                >
                  <Icon
                    className="w-4 h-4 transition-all duration-200"
                    style={{ color: isActive || isHov ? cfg.color : "#9B8E82" }}
                  />
                  <span
                    className="text-[10px] font-semibold transition-all duration-200"
                    style={{ color: isActive || isHov ? cfg.color : "#9B8E82" }}
                  >
                    {cfg.ar}
                  </span>
                  {isActive && (
                    <span
                      className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300"
                      style={{ background: cfg.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          {(hovered === "FINISHED" || preview === "FINISHED") &&
            group.status !== "FINISHED" && (
              <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 text-[11px] text-amber-600 dark:text-amber-400 text-center">
                ⚠️ سيتم إغلاق جميع التسجيلات النشطة
              </div>
            )}
          {isPending ? (
            <div className="flex justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#9B8E82]" />
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl text-[12px] text-[#9B8E82] hover:bg-[#F5F0EB] dark:hover:bg-[#1A1A1A] hover:text-[#3D3530] dark:hover:text-[#CCC] transition-colors"
            >
              إغلاق
            </button>
          )}
        </div>
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
      (teachers as GroupTeacher[]).filter((t: GroupTeacher) =>
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
        onError: (e: unknown) => {
          const err = e as { response?: { data?: { message?: string } } };
          toast.error(err?.response?.data?.message ?? "خطأ");
        },
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
            filtered.map((t: GroupTeacher) => {
              const isCurrent = group.teacher?.teacher_id === t.teacher_id;
              return (
                <button
                  key={t.teacher_id}
                  onClick={() => assign(t.teacher_id)}
                  disabled={isPending}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isCurrent ? "bg-[#EDF6F3] dark:bg-[#0F2420]" : "hover:bg-[#F5F0EB] dark:hover:bg-[#111]"}`}
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

// ─── Student Detail + Transfer + Remove Modal ─────────────────
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
  const { mutate: transferMutate, isPending: transferPending } =
    useTransferStudent();
  const { mutate: removeMutate, isPending: removePending } =
    useRemoveStudentFromGroup();
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [step, setStep] = useState<"info" | "transfer" | "confirmRemove">(
    "info",
  );

  const s = student.student;
  const cfg =
    ENROLL_STATUS_CFG[student.registration_status] ?? ENROLL_STATUS_CFG.PENDING;
  const lvl = LEVEL_COLORS[group.level] ?? LEVEL_COLORS.A1;
  const flag = COURSE_FLAG[group.course.course_code] ?? COURSE_FLAG.default;

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
    transferMutate(
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
        onError: (e: unknown) => {
          const err = e as { response?: { data?: { message?: string } } };
          toast.error(err?.response?.data?.message ?? "خطأ في النقل");
        },
      },
    );
  };

  const handleRemove = () => {
    removeMutate(
      { groupId: group.group_id, studentId: s.student_id },
      {
        onSuccess: () => {
          toast.success(`تم حذف ${s.first_name} من الفوج`);
          onClose();
        },
        onError: (e: unknown) => {
          const err = e as { response?: { data?: { message?: string } } };
          toast.error(err?.response?.data?.message ?? "خطأ في الحذف");
        },
      },
    );
  };

  // ─── Confirm Remove Screen ────────────────────────────────
  if (step === "confirmRemove") {
    return (
      <Overlay onClose={onClose}>
        <div className="bg-white dark:bg-[#161616] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
          <div className="h-1 w-full bg-red-500" />
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-[15px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5] text-center mb-1">
              حذف الطالب من الفوج
            </h3>
            <p className="text-[12px] text-[#9B8E82] text-center mb-4">
              هل تريد حذف{" "}
              <span className="font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {s.first_name} {s.last_name}
              </span>{" "}
              من فوج{" "}
              <span className="font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {group.name}
              </span>
              ؟
            </p>
            <div className="px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 mb-5">
              <p className="text-[11px] text-red-600 dark:text-red-400 text-center">
                ⚠️ سيتم حذف تسجيله من هذا الفوج نهائياً
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep("info")}
                disabled={removePending}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] text-[13px] text-[#9B8E82] hover:bg-[#F5F0EB] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleRemove}
                disabled={removePending}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                {removePending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                نعم، احذف
              </button>
            </div>
          </div>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white dark:bg-[#161616] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
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

            {/* ✅ Footer: إغلاق + حذف + تحويل */}
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] text-[13px] text-[#9B8E82] hover:bg-[#F5F0EB] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                إغلاق
              </button>
              {/* ✅ زر حذف من الفوج — لكل الحالات */}
              <button
                onClick={() => setStep("confirmRemove")}
                className="py-2.5 px-3 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 text-[13px] font-medium hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-1.5 transition-colors"
                title="حذف من الفوج"
              >
                <Trash2 className="w-3.5 h-3.5" />
                حذف
              </button>
              {/* ✅ زر التحويل — فقط للحالات النشطة */}
              {["VALIDATED", "PAID", "PENDING", "FINISHED"].includes(
                student.registration_status,
              ) && (
                <button
                  onClick={() => setStep("transfer")}
                  className="flex-1 py-2.5 rounded-xl bg-[#2B6F5E] hover:bg-[#235C4E] text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  تحويل إلى فوج آخر
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="p-5 space-y-3">
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
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9B8E82]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو الأستاذ..."
                  className="w-full h-9 pr-9 pl-3 rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] bg-[#F5F0EB] dark:bg-[#111] text-[13px] outline-none text-[#1B1B1B] dark:text-[#E5E5E5]"
                />
              </div>
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
                    const capacityColor =
                      g.capacity_pct >= 90
                        ? "#ef4444"
                        : g.capacity_pct >= 70
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
                            <div className="flex items-center gap-1 text-[11px] text-[#9B8E82] mb-1.5">
                              <GraduationCap className="w-3 h-3 shrink-0" />
                              {g.teacher ? (
                                `${g.teacher.first_name} ${g.teacher.last_name}`
                              ) : (
                                <span className="italic">لا يوجد أستاذ</span>
                              )}
                            </div>
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
                                    width: `${g.capacity_pct}%`,
                                    background: capacityColor,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
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
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={() => setStep("info")}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E0D5] dark:border-[#2A2A2A] text-[13px] text-[#9B8E82] hover:bg-[#F5F0EB] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                رجوع
              </button>
              <button
                onClick={handleTransfer}
                disabled={!selectedGroup || transferPending}
                className="flex-1 py-2.5 rounded-xl bg-[#2B6F5E] hover:bg-[#235C4E] text-white text-[13px] font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
              >
                {transferPending ? (
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
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  const {
    data: studentsData,
    isLoading: loadingStudents,
    refetch,
  } = useAdminGroupStudents(group.group_id, { limit: 200 });

  const students = useMemo(() => studentsData?.data ?? [], [studentsData]);

  const filtered = useMemo(() => {
    let list =
      enrollFilter === "ALL"
        ? students
        : students.filter(
            (s: GroupStudent) => s.registration_status === enrollFilter,
          );
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      list = list.filter(
        (s: GroupStudent) =>
          `${s.student.first_name} ${s.student.last_name}`
            .toLowerCase()
            .includes(q) || s.student.email?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [students, enrollFilter, studentSearch]);

  const flag = COURSE_FLAG[group.course.course_code] ?? COURSE_FLAG.default;
  const lvl = LEVEL_COLORS[group.level] ?? LEVEL_COLORS.A1;
  const realTotal =
    students.length > 0
      ? students.length
      : group.enrolled_count + group.pending_count;
  const realPending = students.filter(
    (s: GroupStudent) => s.registration_status === "PENDING",
  ).length;
  const realActive = students.filter((s: GroupStudent) =>
    ["VALIDATED", "PAID"].includes(s.registration_status),
  ).length;
  const maxCapacity = group.max_students ?? 25;
  const realCapacityPct =
    maxCapacity > 0
      ? Math.min(Math.round((realTotal / maxCapacity) * 100), 100)
      : 0;
  const capacityColor =
    realCapacityPct >= 90
      ? "#ef4444"
      : realCapacityPct >= 70
        ? "#f59e0b"
        : "#2B6F5E";

  return (
    <div className="flex flex-col h-full bg-[#FDFAF7] dark:bg-[#0A0A0A]">
      {/* Header */}
      <div className="shrink-0 bg-white dark:bg-[#0D0D0D] border-b border-[#E8E0D5] dark:border-[#1E1E1E]">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F5F0EB] dark:bg-[#1A1A1A] flex items-center justify-center text-xl shrink-0">
            {flag}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[14px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5] truncate leading-tight">
                {group.name}
              </h2>
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0"
                style={{ background: lvl.bg, color: lvl.color }}
              >
                {group.level.replace("_", "-")}
              </span>
              <StatusBadge status={group.status} />
            </div>
            <p className="text-[11px] text-[#9B8E82] truncate mt-0.5">
              {group.course.course_name}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setStatusModal(true)}
              title="تغيير الحالة"
              className="w-8 h-8 rounded-xl bg-[#F5F0EB] dark:bg-[#1A1A1A] hover:bg-[#E8E0D5] dark:hover:bg-[#222] flex items-center justify-center transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#9B8E82]" />
            </button>
            <button
              onClick={() => setTeacherModal(true)}
              title="تعيين أستاذ"
              className="w-8 h-8 rounded-xl bg-[#F5F0EB] dark:bg-[#1A1A1A] hover:bg-[#E8E0D5] dark:hover:bg-[#222] flex items-center justify-center transition-colors"
            >
              <UserCog className="w-3.5 h-3.5 text-[#9B8E82]" />
            </button>
            <button
              onClick={() => refetch()}
              title="تحديث"
              className="w-8 h-8 rounded-xl bg-[#F5F0EB] dark:bg-[#1A1A1A] hover:bg-[#E8E0D5] dark:hover:bg-[#222] flex items-center justify-center transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#C8BFB5]" />
            </button>
            <button
              onClick={() => setHeaderCollapsed((p) => !p)}
              title="تصغير/تكبير"
              className="w-8 h-8 rounded-xl bg-[#F5F0EB] dark:bg-[#1A1A1A] hover:bg-[#E8E0D5] dark:hover:bg-[#222] flex items-center justify-center transition-all"
              style={{ transform: headerCollapsed ? "rotate(180deg)" : "none" }}
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#9B8E82] rotate-90" />
            </button>
          </div>
        </div>

        {!headerCollapsed && (
          <div className="px-4 pb-3 space-y-2.5">
            <div className="grid grid-cols-4 gap-2">
              <div
                className="col-span-2 rounded-xl p-2.5 flex items-center gap-2.5"
                style={{
                  background: capacityColor + "10",
                  border: `1px solid ${capacityColor}25`,
                }}
              >
                <div className="shrink-0">
                  <p
                    className="text-[18px] font-black leading-none"
                    style={{ color: capacityColor }}
                  >
                    {realTotal}
                    <span className="text-[12px] font-semibold text-[#9B8E82]">
                      /{maxCapacity}
                    </span>
                  </p>
                  <p className="text-[9px] text-[#9B8E82] mt-0.5">طالب</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-2 rounded-full bg-[#F0EBE5] dark:bg-[#2A2A2A] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${realCapacityPct}%`,
                        background: capacityColor,
                      }}
                    />
                  </div>
                  <p
                    className="text-[9px] font-semibold mt-0.5"
                    style={{ color: capacityColor }}
                  >
                    {realCapacityPct}% إشغال ({realActive} نشط
                    {realPending > 0 ? ` · ${realPending} معلق` : ""})
                  </p>
                </div>
              </div>
              <div className="rounded-xl p-2.5 bg-[#F5F0EB] dark:bg-[#111] text-center">
                <Layers className="w-3.5 h-3.5 text-[#2B6F5E] dark:text-[#4ADE80] mx-auto mb-0.5" />
                <p className="text-[16px] font-black text-[#1B1B1B] dark:text-[#E5E5E5] leading-none">
                  {group._count.sessions}
                </p>
                <p className="text-[9px] text-[#9B8E82] mt-0.5">حصة</p>
              </div>
              <div
                className="rounded-xl p-2.5 text-center"
                style={{
                  background:
                    realPending > 0 ? "rgba(245,158,11,0.08)" : "#F5F0EB",
                  border:
                    realPending > 0
                      ? "1px solid rgba(245,158,11,0.25)"
                      : "none",
                }}
              >
                <Clock
                  className="w-3.5 h-3.5 mx-auto mb-0.5"
                  style={{ color: realPending > 0 ? "#f59e0b" : "#C8BFB5" }}
                />
                <p
                  className="text-[16px] font-black leading-none"
                  style={{ color: realPending > 0 ? "#f59e0b" : "#9B8E82" }}
                >
                  {realPending}
                </p>
                <p className="text-[9px] text-[#9B8E82] mt-0.5">معلق</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5F0EB] dark:bg-[#111]">
              <div className="w-6 h-6 rounded-full bg-[#2B6F5E]/15 flex items-center justify-center shrink-0">
                <GraduationCap className="w-3.5 h-3.5 text-[#2B6F5E] dark:text-[#4ADE80]" />
              </div>
              <p
                className={`flex-1 text-[12px] font-medium truncate min-w-0 ${group.teacher ? "text-[#1B1B1B] dark:text-[#E5E5E5]" : "text-[#9B8E82] italic"}`}
              >
                {group.teacher
                  ? `${group.teacher.first_name} ${group.teacher.last_name}`
                  : "لا يوجد أستاذ"}
              </p>
              <button
                onClick={() => setTeacherModal(true)}
                className="shrink-0 text-[10px] font-semibold text-[#2B6F5E] dark:text-[#4ADE80] hover:underline"
              >
                تعديل
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Students Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-2.5 bg-white dark:bg-[#0D0D0D] border-b border-[#F0EBE5] dark:border-[#1A1A1A] shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3.5 h-3.5 text-[#2B6F5E] dark:text-[#4ADE80]" />
            <span className="text-[12px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              الطلبة ({filtered.length}
              {filtered.length !== students.length ? `/${students.length}` : ""}
              )
            </span>
            {realPending > 0 && enrollFilter !== "PENDING" && (
              <button
                onClick={() => setEnrollFilter("PENDING")}
                className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-200 transition-colors"
              >
                {realPending} معلق
              </button>
            )}
            <div className="ms-auto flex gap-1 flex-wrap">
              {(
                [
                  "ALL",
                  "VALIDATED",
                  "PAID",
                  "PENDING",
                  "FINISHED",
                  "REJECTED",
                ] as const
              ).map((s) => {
                const count =
                  s === "ALL"
                    ? students.length
                    : students.filter(
                        (st: GroupStudent) => st.registration_status === s,
                      ).length;
                if (s !== "ALL" && count === 0) return null;
                const cfg = ENROLL_STATUS_CFG[s];
                const isActive = enrollFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setEnrollFilter(s)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all duration-150"
                    style={
                      isActive
                        ? {
                            background: s === "ALL" ? "#2B6F5E" : cfg?.color,
                            color: "#fff",
                          }
                        : { background: "transparent", color: "#9B8E82" }
                    }
                  >
                    {s === "ALL" ? "الكل" : cfg?.ar}
                    {count > 0 && (
                      <span className="ms-1 opacity-70">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#C8BFB5]" />
            <input
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="ابحث في طلبة الفوج..."
              className="w-full h-7 pr-8 pl-3 rounded-lg border border-[#E8E0D5] dark:border-[#2A2A2A] bg-[#F5F0EB] dark:bg-[#111] text-[11px] text-[#1B1B1B] dark:text-[#E5E5E5] placeholder-[#C8BFB5] outline-none focus:border-[#2B6F5E] transition-colors"
            />
            {studentSearch && (
              <button
                onClick={() => setStudentSearch("")}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#C8BFB5] flex items-center justify-center hover:bg-[#9B8E82] transition-colors"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Students grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {loadingStudents ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#2B6F5E]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#F5F0EB] dark:bg-[#1A1A1A] flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-[#C8BFB5] dark:text-[#333]" />
              </div>
              <p className="text-[13px] font-semibold text-[#9B8E82]">
                {studentSearch ? "لا توجد نتائج" : "لا يوجد طلبة"}
              </p>
              {studentSearch && (
                <button
                  onClick={() => setStudentSearch("")}
                  className="mt-2 text-[11px] text-[#2B6F5E] dark:text-[#4ADE80] hover:underline"
                >
                  مسح البحث
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filtered.map((s: GroupStudent) => {
                const cfg =
                  ENROLL_STATUS_CFG[s.registration_status] ??
                  ENROLL_STATUS_CFG.PENDING;
                const canTransfer = [
                  "VALIDATED",
                  "PAID",
                  "PENDING",
                  "FINISHED",
                ].includes(s.registration_status);
                const avatarBg = cfg.color + "18";
                const initials = `${s.student.first_name[0] ?? ""}${s.student.last_name[0] ?? ""}`;

                return (
                  <div
                    key={s.enrollment_id}
                    onClick={() => setSelectedStudent(s)}
                    className="group/card relative bg-white dark:bg-[#111] rounded-xl border border-[#E8E0D5] dark:border-[#1E1E1E] p-3 cursor-pointer hover:border-[#2B6F5E]/40 hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200 overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl transition-all duration-200 group-hover/card:h-0.75"
                      style={{ background: cfg.color }}
                    />
                    <div className="flex items-start gap-2.5 mt-1">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 relative"
                        style={{ background: avatarBg, color: cfg.color }}
                      >
                        {initials}
                        {s.registration_status === "PENDING" && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#111] bg-[#f59e0b]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5] truncate leading-tight">
                          {s.student.first_name} {s.student.last_name}
                        </p>
                        <p className="text-[10px] text-[#9B8E82] truncate mt-0.5">
                          {s.student.email}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span
                            className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {cfg.ar}
                          </span>
                          <span className="text-[9px] text-[#C8BFB5]">
                            {new Date(s.enrollment_date).toLocaleDateString(
                              "ar-DZ",
                            )}
                          </span>
                        </div>
                      </div>
                      {/* ✅ Action buttons on hover: Transfer + Delete */}
                      <div className="shrink-0 flex flex-col gap-1 opacity-0 group-hover/card:opacity-100 transition-all duration-150 mt-0.5">
                        {canTransfer && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudent(s);
                            }}
                            title="نقل الطالب"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9B8E82] hover:text-[#2B6F5E] hover:bg-[#EDF6F3] dark:hover:bg-[#0F2420] transition-all duration-150"
                          >
                            <ArrowLeftRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(s);
                            // فتح الـ modal مباشرة على شاشة التأكيد
                            // نفتح الـ modal أولاً ثم ننتقل لـ confirmRemove
                          }}
                          title="حذف من الفوج"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9B8E82] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-150"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useAdminGroups({
    search: search || undefined,
    status: filterStatus !== "ALL" ? (filterStatus as GroupStatus) : undefined,
    level: filterLevel !== "ALL" ? filterLevel : undefined,
    limit: 100,
  });

  const groups = useMemo(() => data?.data ?? [], [data]);
  const selected = groups.find((g: Group) => g.group_id === selectedId) ?? null;

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
      open: groups.filter((g: Group) => g.status === "OPEN").length,
      full: groups.filter((g: Group) => g.status === "FULL").length,
      finished: groups.filter((g: Group) => g.status === "FINISHED").length,
    }),
    [groups],
  );

  return (
    <div
      className="flex flex-col h-[calc(100vh-64px)] bg-[#FDFAF7] dark:bg-[#0A0A0A]"
      dir="rtl"
    >
      {/* Top bar */}
      <div className="px-5 pt-4 pb-3 bg-white dark:bg-[#0D0D0D] border-b border-[#E8E0D5] dark:border-[#1E1E1E] shrink-0 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[18px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              إدارة الأفواج
            </h1>
            <span
              title="مباشر"
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold transition-all duration-500 ${realtimeFlash ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 scale-110" : "bg-[#F0EBE5] dark:bg-[#1A1A1A] text-[#9B8E82]"}`}
            >
              <Wifi className="w-2.5 h-2.5" />
              مباشر
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0EBE5] dark:bg-[#1A1A1A] text-[#9B8E82]">
              {stats.total} فوج
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDF6F3] dark:bg-[#0F2420] text-[#2B6F5E] dark:text-[#4ADE80]">
              {stats.open} مفتوح
            </span>
            {stats.full > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-900/10 text-red-500">
                {stats.full} ممتلئ
              </span>
            )}
            {stats.finished > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5F0EB] dark:bg-[#1A1A1A] text-[#9B8E82]">
                {stats.finished} منتهي
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-0 group/search">
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B8E82] group-focus-within/search:text-[#2B6F5E] dark:group-focus-within/search:text-[#4ADE80] transition-colors pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن فوج، مادة، أستاذ..."
              className="w-full h-10 pr-10 pl-4 rounded-2xl border-2 border-[#E8E0D5] dark:border-[#2A2A2A] bg-[#F5F0EB] dark:bg-[#111] text-[13px] text-[#1B1B1B] dark:text-[#E5E5E5] placeholder-[#C8BFB5] dark:placeholder-[#444] outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] focus:bg-white dark:focus:bg-[#0D0D0D] transition-all duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#C8BFB5] dark:bg-[#333] flex items-center justify-center hover:bg-[#9B8E82] dark:hover:bg-[#444] transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 p-1 rounded-2xl bg-[#F5F0EB] dark:bg-[#1A1A1A] border border-[#E8E0D5] dark:border-[#2A2A2A]">
            {(
              [
                { value: "ALL", label: "الكل", Icon: Layers, color: null },
                {
                  value: "OPEN",
                  label: "مفتوح",
                  Icon: CheckCircle2,
                  color: "#2B6F5E",
                },
                {
                  value: "FULL",
                  label: "ممتلئ",
                  Icon: XCircle,
                  color: "#ef4444",
                },
                {
                  value: "FINISHED",
                  label: "منتهي",
                  Icon: Clock,
                  color: "#94a3b8",
                },
              ] as const
            ).map(({ value, label, Icon, color }) => {
              const isActive = filterStatus === value;
              return (
                <button
                  key={value}
                  onClick={() => setFilterStatus(value)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-semibold transition-all duration-200"
                  style={
                    isActive
                      ? {
                          background: color ? color + "15" : "#2B6F5E",
                          color: color ?? "#fff",
                          boxShadow: color
                            ? `inset 0 0 0 1.5px ${color}50`
                            : "none",
                        }
                      : { color: "#9B8E82" }
                  }
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 shrink-0 p-1 rounded-2xl bg-[#F5F0EB] dark:bg-[#1A1A1A] border border-[#E8E0D5] dark:border-[#2A2A2A]">
            {(
              [
                { value: "ALL", label: "الكل", color: null },
                { value: "PRE_A1", label: "PRE-A1", color: "#94a3b8" },
                { value: "A1", label: "A1", color: "#22c55e" },
                { value: "A2", label: "A2", color: "#3b82f6" },
                { value: "B1", label: "B1", color: "#f59e0b" },
                { value: "B2", label: "B2", color: "#f97316" },
                { value: "C1", label: "C1", color: "#a855f7" },
              ] as const
            ).map(({ value, label, color }) => {
              const isActive = filterLevel === value;
              return (
                <button
                  key={value}
                  onClick={() => setFilterLevel(value)}
                  className="h-8 px-2.5 rounded-xl text-[11px] font-bold transition-all duration-200"
                  style={
                    isActive
                      ? {
                          background: color ? color + "18" : "#2B6F5E",
                          color: color ?? "#fff",
                          boxShadow: color
                            ? `inset 0 0 0 1.5px ${color}50`
                            : "none",
                        }
                      : { color: "#9B8E82" }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`shrink-0 border-l border-[#E8E0D5] dark:border-[#1E1E1E] flex flex-col bg-white dark:bg-[#0D0D0D] overflow-hidden transition-all duration-300 ${selected ? "w-80" : "w-full max-w-full"}`}
        >
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
              groups.map((g: Group) => (
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
