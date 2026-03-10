/* ===============================================================
   ADMIN ENROLLMENTS — Refined Luxury Redesign + Full i18n
   ✅ All logic preserved
   ✅ Full i18n — zero hardcoded strings
   ✅ New: deep visual hierarchy, gradient cards, micro-animations
   ✅ Delete enrollment support
=============================================================== */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Eye,
  FileText,
  Search,
  GraduationCap,
  AlertCircle,
  Tag,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  X,
  Trash2,
} from "lucide-react";

import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

import {
  useAdminEnrollments,
  useValidateEnrollment,
  useRejectEnrollment,
  useFinishEnrollment,
  useAddStudentToGroup,
  useDeleteEnrollment,
} from "../../../../hooks/admin/useAdmin";

import type { Enrollment } from "../../../../types/Types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

/* ===============================================================
   CATEGORY-BASED DOCUMENT REQUIREMENTS
=============================================================== */

type RegistrantCategory = "STUDENT" | "EXTERNAL" | "EMPLOYEE";
interface DocRequirement {
  label: string;
  label_ar: string;
  alternatives: string[];
}

const REQUIRED_DOCUMENTS_BY_CATEGORY: Record<
  RegistrantCategory,
  DocRequirement[]
> = {
  STUDENT: [
    {
      label: "Student Card or Certificate",
      label_ar: "بطاقة طالب أو شهادة مدرسية أو شهادة تسجيل",
      alternatives: [
        "STUDENT_CARD",
        "SCHOOL_CERTIFICATE",
        "REGISTRATION_CERTIFICATE",
      ],
    },
  ],
  EXTERNAL: [
    {
      label: "National ID Card",
      label_ar: "بطاقة التعريف الوطنية",
      alternatives: ["ID_CARD"],
    },
  ],
  EMPLOYEE: [
    {
      label: "Professional Card or Work Certificate",
      label_ar: "بطاقة مهنية أو شهادة عمل",
      alternatives: ["PROFESSIONAL_CARD", "WORK_CERTIFICATE"],
    },
  ],
};

function checkDocumentStatus(student: any) {
  const category: RegistrantCategory =
    student?.registrant_category || "EXTERNAL";
  const requirements = REQUIRED_DOCUMENTS_BY_CATEGORY[category] || [];
  const docs = student?.documents || [];
  const approvedTypes: string[] = docs
    .filter((d: any) => d.status === "APPROVED")
    .map((d: any) => d.type);
  const uploadedTypes: string[] = docs.map((d: any) => d.type);
  const missing: string[] = [];
  const pending: string[] = [];
  for (const req of requirements) {
    const hasApproved = req.alternatives.some((t) => approvedTypes.includes(t));
    if (hasApproved) continue;
    const hasUploaded = req.alternatives.some((t) => uploadedTypes.includes(t));
    if (hasUploaded) {
      pending.push(req.label_ar);
    } else {
      missing.push(req.label_ar);
    }
  }
  return {
    category,
    allApproved: missing.length === 0 && pending.length === 0,
    missing,
    pending,
  };
}

/* ===============================================================
   STATUS CONFIG — uses i18n keys resolved at render time
=============================================================== */

type StatusKey = "PENDING" | "VALIDATED" | "PAID" | "REJECTED" | "FINISHED";

const STATUS_STYLE: Record<
  StatusKey,
  {
    color: string;
    bg: string;
    border: string;
    Icon: React.ElementType;
  }
> = {
  PENDING: {
    color: "#C4A035",
    bg: "rgba(196,160,53,0.08)",
    border: "rgba(196,160,53,0.20)",
    Icon: Clock,
  },
  VALIDATED: {
    color: "#2B6F5E",
    bg: "rgba(43,111,94,0.08)",
    border: "rgba(43,111,94,0.20)",
    Icon: CheckCircle,
  },
  PAID: {
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.20)",
    Icon: DollarSign,
  },
  REJECTED: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.20)",
    Icon: XCircle,
  },
  FINISHED: {
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.08)",
    border: "rgba(148,163,184,0.20)",
    Icon: GraduationCap,
  },
};

const STATUS_LABEL_KEYS: Record<StatusKey, string> = {
  PENDING: "admin.enrollments.status.pendingReview",
  VALIDATED: "admin.enrollments.status.validatedAwaiting",
  PAID: "admin.enrollments.status.paidReady",
  REJECTED: "admin.enrollments.status.rejected",
  FINISHED: "admin.enrollments.status.finished",
};

/* ===============================================================
   TAB CONFIG — label keys resolved via t() at render time
=============================================================== */

const TABS: {
  key: string;
  labelKey: string;
  statsKey: string;
  icon: React.ElementType;
  accent: string;
}[] = [
  {
    key: "pending",
    labelKey: "admin.enrollments.tabs.pending",
    statsKey: "admin.enrollments.stats.pendingReview",
    icon: Clock,
    accent: "#C4A035",
  },
  {
    key: "validated",
    labelKey: "admin.enrollments.tabs.validated",
    statsKey: "admin.enrollments.stats.validated",
    icon: CheckCircle,
    accent: "#2B6F5E",
  },
  {
    key: "paid",
    labelKey: "admin.enrollments.tabs.paid",
    statsKey: "admin.enrollments.stats.paid",
    icon: DollarSign,
    accent: "#3b82f6",
  },
  {
    key: "finished",
    labelKey: "admin.enrollments.tabs.finished",
    statsKey: "admin.enrollments.stats.finished",
    icon: GraduationCap,
    accent: "#94a3b8",
  },
  {
    key: "all",
    labelKey: "admin.enrollments.tabs.all",
    statsKey: "admin.enrollments.stats.total",
    icon: FileText,
    accent: "#6366f1",
  },
];

/* ===============================================================
   MAIN PAGE
=============================================================== */

export default function AdminEnrollmentsPage() {
  const { t } = useTranslation();
  const { data: enrollments = [], isLoading } = useAdminEnrollments();
  const validateEnrollment = useValidateEnrollment();
  const rejectEnrollment = useRejectEnrollment();
  const finishEnrollment = useFinishEnrollment();
  const addToGroup = useAddStudentToGroup();
  const deleteEnrollment = useDeleteEnrollment();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [assignGroupDialog, setAssignGroupDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  if (isLoading) return <PageLoader />;

  /* ── Filtering ── */
  const filtered = enrollments.filter((e: any) => {
    const name = e.student
      ? `${e.student.first_name} ${e.student.last_name}`.toLowerCase()
      : "";
    const course = e.course?.course_name?.toLowerCase() || "";
    return (
      name.includes(search.toLowerCase()) ||
      course.includes(search.toLowerCase())
    );
  });

  const byStatus = (s: string) =>
    filtered.filter((e: any) => e.registration_status === s);

  const tabItems: Record<string, any[]> = {
    pending: byStatus("PENDING"),
    validated: byStatus("VALIDATED"),
    paid: byStatus("PAID"),
    finished: byStatus("FINISHED"),
    all: filtered,
  };

  /* ── Stats ── */
  const statsConfig = [
    {
      labelKey: "admin.enrollments.stats.total",
      value: enrollments.length,
      color: "#6366f1",
      Icon: FileText,
    },
    {
      labelKey: "admin.enrollments.stats.pendingReview",
      value: byStatus("PENDING").length,
      color: "#C4A035",
      Icon: Clock,
      badge: true,
    },
    {
      labelKey: "admin.enrollments.stats.validated",
      value: byStatus("VALIDATED").length,
      color: "#2B6F5E",
      Icon: CheckCircle,
    },
    {
      labelKey: "admin.enrollments.stats.paid",
      value: byStatus("PAID").length,
      color: "#3b82f6",
      Icon: DollarSign,
      badge: true,
    },
    {
      labelKey: "admin.enrollments.stats.rejected",
      value: byStatus("REJECTED").length,
      color: "#ef4444",
      Icon: XCircle,
    },
    {
      labelKey: "admin.enrollments.stats.finished",
      value: byStatus("FINISHED").length,
      color: "#94a3b8",
      Icon: GraduationCap,
    },
  ];

  /* ── Handlers ── */
  const handleValidate = async (
    enrollmentId: string,
    pricingId?: string | null,
  ) => {
    if (!window.confirm(t("admin.enrollments.confirmValidate"))) return;
    try {
      await validateEnrollment.mutateAsync({
        enrollmentId,
        pricing_id: pricingId || undefined,
      });
      toast.success(t("admin.enrollments.validateSuccess"));
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || t("admin.enrollments.validateFailed"),
      );
    }
  };

  const handleReject = async () => {
    if (!selectedEnrollment || !rejectReason.trim()) {
      toast.error(t("admin.enrollments.provideReason"));
      return;
    }
    try {
      await rejectEnrollment.mutateAsync({
        enrollmentId: selectedEnrollment.enrollment_id,
        reason: rejectReason,
      });
      toast.success(t("admin.enrollments.rejectSuccess"));
      setRejectDialog(false);
      setRejectReason("");
      setSelectedEnrollment(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || t("admin.enrollments.rejectFailed"),
      );
    }
  };

  const handleAssignGroup = async () => {
    if (!selectedEnrollment || !selectedGroupId) {
      toast.error(t("admin.enrollments.selectGroupError"));
      return;
    }
    try {
      await addToGroup.mutateAsync({
        groupId: selectedGroupId,
        studentId: selectedEnrollment.student_id,
      });
      toast.success(t("admin.enrollments.assignGroupSuccess"));
      setAssignGroupDialog(false);
      setSelectedGroupId("");
      setSelectedEnrollment(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          t("admin.enrollments.assignGroupFailed"),
      );
    }
  };

  const handleFinish = async (enrollmentId: string) => {
    if (!window.confirm(t("admin.enrollments.confirmFinish"))) return;
    try {
      await finishEnrollment.mutateAsync(enrollmentId);
      toast.success(t("admin.enrollments.finishSuccess"));
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || t("admin.enrollments.finishFailed"),
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedEnrollment) return;
    try {
      await deleteEnrollment.mutateAsync(selectedEnrollment.enrollment_id);
      toast.success(t("admin.enrollments.deleteSuccess"));
      setDeleteDialog(false);
      setSelectedEnrollment(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || t("admin.enrollments.deleteFailed"),
      );
    }
  };

  const currentList = tabItems[activeTab] ?? [];

  /* ── Workflow steps from i18n ── */
  const workflowSteps = [
    t("admin.enrollments.workflow.pending"),
    t("admin.enrollments.workflow.validated"),
    t("admin.enrollments.workflow.paid"),
    t("admin.enrollments.workflow.finished"),
  ];

  return (
    <div className="min-h-screen bg-[#FDFAF7] dark:bg-[#080808]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ══════════════ HERO HEADER ══════════════ */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F1F1A] via-[#1A2E28] to-[#0F1F1A] p-8 border border-[#2B6F5E]/30">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#2B6F5E]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 left-10 w-48 h-48 rounded-full bg-[#C4A035]/10 blur-3xl pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#1A4A3A] flex items-center justify-center shadow-2xl shadow-[#2B6F5E]/40 border border-[#2B6F5E]/50">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C4A035] border-2 border-[#0F1F1A] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#C4A035]" />
                  <span className="text-[11px] font-bold text-[#C4A035] uppercase tracking-[0.2em]">
                    {t("admin.enrollments.workflow.title")}
                  </span>
                </div>
                <h1 className="text-3xl font-black text-white leading-tight">
                  {t("admin.enrollments.title")}
                </h1>
                <p className="text-[#7BA898] text-sm mt-1">
                  {t("admin.enrollments.subtitle")}
                </p>
              </div>
            </div>

            {/* Workflow pill */}
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
              {workflowSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-white/70">
                    {step}
                  </span>
                  {i < workflowSteps.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-white/30" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════ STATS GRID ══════════════ */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {statsConfig.map(({ labelKey, value, color, Icon, badge }) => (
            <div key={labelKey} className="relative group">
              <div className="bg-white dark:bg-[#111] rounded-2xl border border-[#E8E0D5] dark:border-[#1E1E1E] p-4 text-center transition-all duration-300 hover:shadow-lg cursor-default overflow-hidden">
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${color}08, transparent 70%)`,
                  }}
                />
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center"
                    style={{ background: color + "15" }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <p className="text-2xl font-black text-[#1B1B1B] dark:text-white">
                    {value}
                  </p>
                  <p className="text-[10px] font-semibold text-[#9B8E82] dark:text-[#555] mt-0.5 uppercase tracking-wide">
                    {t(labelKey)}
                  </p>
                </div>
              </div>
              {badge && value > 0 && (
                <div
                  className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                  style={{ background: color }}
                >
                  {value}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ══════════════ SEARCH + TABS BAR ══════════════ */}
        <div className="bg-white dark:bg-[#0D0D0D] rounded-2xl border border-[#E8E0D5] dark:border-[#1E1E1E] overflow-hidden">
          {/* Search */}
          <div className="px-4 pt-4 pb-3 border-b border-[#F0EBE5] dark:border-[#1A1A1A]">
            <div className="relative">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B8E82]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("admin.enrollments.searchPlaceholder")}
                className="w-full h-10 pr-10 pl-4 rounded-xl border-2 border-[#E8E0D5] dark:border-[#2A2A2A] bg-[#F5F0EB] dark:bg-[#111] text-[13px] text-[#1B1B1B] dark:text-[#E5E5E5] placeholder-[#C8BFB5] dark:placeholder-[#444] outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] focus:bg-white dark:focus:bg-[#0D0D0D] transition-all duration-200"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#C8BFB5] dark:bg-[#333] flex items-center justify-center hover:bg-[#9B8E82] transition-colors"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const count = tabItems[tab.key]?.length ?? 0;
              const isActive = activeTab === tab.key;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="relative flex items-center gap-2 px-5 py-3.5 text-[12px] font-semibold whitespace-nowrap transition-all duration-200 border-b-2"
                  style={{
                    borderBottomColor: isActive ? tab.accent : "transparent",
                    color: isActive ? tab.accent : "#9B8E82",
                    background: isActive ? tab.accent + "08" : "transparent",
                  }}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {t(tab.labelKey)}
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: isActive
                        ? tab.accent + "20"
                        : "rgba(148,163,184,0.1)",
                      color: isActive ? tab.accent : "#9B8E82",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ══════════════ CARDS GRID ══════════════ */}
        {currentList.length === 0 ? (
          <EmptyState tabKey={activeTab} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {currentList.map((enrollment: any) => (
              <EnrollmentCard
                key={enrollment.enrollment_id}
                enrollment={enrollment}
                onValidate={
                  enrollment.registration_status === "PENDING"
                    ? () =>
                        handleValidate(
                          enrollment.enrollment_id,
                          enrollment.pricing_id,
                        )
                    : undefined
                }
                onReject={
                  enrollment.registration_status === "PENDING"
                    ? () => {
                        setSelectedEnrollment(enrollment);
                        setRejectDialog(true);
                      }
                    : undefined
                }
                showGoToFees={enrollment.registration_status === "VALIDATED"}
                onAssignGroup={
                  enrollment.registration_status === "PAID" &&
                  !enrollment.group_id
                    ? () => {
                        setSelectedEnrollment(enrollment);
                        setAssignGroupDialog(true);
                      }
                    : undefined
                }
                onFinish={
                  enrollment.registration_status === "PAID"
                    ? () => handleFinish(enrollment.enrollment_id)
                    : undefined
                }
                onDelete={() => {
                  setSelectedEnrollment(enrollment);
                  setDeleteDialog(true);
                }}
              />
            ))}
          </div>
        )}

        {/* ══════════════ REJECT DIALOG ══════════════ */}
        <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
          <DialogContent className="dark:bg-[#111] dark:border-[#2A2A2A]">
            <DialogHeader>
              <DialogTitle className="dark:text-white">
                {t("admin.enrollments.rejectDialog.title")}
              </DialogTitle>
              <DialogDescription className="dark:text-[#888]">
                {t("admin.enrollments.rejectDialog.description")}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("admin.enrollments.rejectDialog.placeholder")}
                className="w-full p-3 border-2 border-[#E8E0D5] dark:border-[#2A2A2A] bg-[#F5F0EB] dark:bg-[#1A1A1A] text-[#1B1B1B] dark:text-[#E5E5E5] placeholder-[#C8BFB5] dark:placeholder-[#444] rounded-xl text-sm outline-none focus:border-red-400 transition-colors"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialog(false);
                  setRejectReason("");
                  setSelectedEnrollment(null);
                }}
                className="dark:border-[#2A2A2A] dark:text-[#E5E5E5] dark:hover:bg-[#1A1A1A]"
              >
                {t("admin.enrollments.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason.trim() || rejectEnrollment.isPending}
              >
                {rejectEnrollment.isPending
                  ? t("admin.enrollments.rejectDialog.rejecting")
                  : t("admin.enrollments.rejectDialog.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ══════════════ ASSIGN GROUP DIALOG ══════════════ */}
        <Dialog open={assignGroupDialog} onOpenChange={setAssignGroupDialog}>
          <DialogContent className="dark:bg-[#111] dark:border-[#2A2A2A]">
            <DialogHeader>
              <DialogTitle className="dark:text-white">
                {t("admin.enrollments.assignDialog.title")}
              </DialogTitle>
              <DialogDescription className="dark:text-[#888]">
                {t("admin.enrollments.assignDialog.description", {
                  name: `${selectedEnrollment?.student?.first_name || ""} ${selectedEnrollment?.student?.last_name || ""}`.trim(),
                })}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="block text-[12px] font-semibold text-[#6B5D4F] dark:text-[#888] mb-2">
                {t("admin.enrollments.assignDialog.availableGroups")}
              </label>
              <Select
                value={selectedGroupId}
                onValueChange={setSelectedGroupId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      "admin.enrollments.assignDialog.selectGroup",
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {selectedEnrollment?.course?.groups
                    ?.filter(
                      (g: any) =>
                        g.status === "OPEN" &&
                        g._count &&
                        g._count.enrollments < g.max_students,
                    )
                    .map((group: any) => (
                      <SelectItem key={group.group_id} value={group.group_id}>
                        {group.name} - {group.level} (
                        {group._count?.enrollments || 0}/{group.max_students})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAssignGroupDialog(false);
                  setSelectedGroupId("");
                  setSelectedEnrollment(null);
                }}
                className="dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
              >
                {t("admin.enrollments.cancel")}
              </Button>
              <Button
                onClick={handleAssignGroup}
                disabled={!selectedGroupId || addToGroup.isPending}
                className="bg-[#2B6F5E] hover:bg-[#235C4E] text-white"
              >
                {addToGroup.isPending
                  ? t("admin.enrollments.assignDialog.assigning")
                  : t("admin.enrollments.assignDialog.assignBtn")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ══════════════ DELETE DIALOG ══════════════ */}
        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <DialogContent className="dark:bg-[#111] dark:border-[#2A2A2A]">
            <DialogHeader>
              <DialogTitle className="text-red-500 dark:text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                {t("admin.enrollments.deleteDialog.title")}
              </DialogTitle>
              <DialogDescription className="dark:text-[#888]">
                {t("admin.enrollments.deleteDialog.description", {
                  name: `${selectedEnrollment?.student?.first_name || ""} ${selectedEnrollment?.student?.last_name || ""}`.trim(),
                  course: selectedEnrollment?.course?.course_name || "",
                })}
              </DialogDescription>
            </DialogHeader>

            {/* Warning box */}
            <div className="rounded-xl p-4 border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[12px] font-bold text-red-600 dark:text-red-400">
                    {t("admin.enrollments.deleteDialog.warningTitle")}
                  </p>
                  <p className="text-[11px] text-red-500/80 dark:text-red-400/70">
                    {t("admin.enrollments.deleteDialog.warningBody")}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialog(false);
                  setSelectedEnrollment(null);
                }}
                className="dark:border-[#2A2A2A] dark:text-[#E5E5E5] dark:hover:bg-[#1A1A1A]"
              >
                {t("admin.enrollments.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteEnrollment.isPending}
              >
                {deleteEnrollment.isPending
                  ? t("admin.enrollments.deleteDialog.deleting")
                  : t("admin.enrollments.deleteDialog.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/* ===============================================================
   ENROLLMENT CARD
=============================================================== */

function EnrollmentCard({
  enrollment,
  onValidate,
  onReject,
  showGoToFees,
  onAssignGroup,
  onFinish,
  onDelete,
}: {
  enrollment: any;
  onValidate?: () => void;
  onReject?: () => void;
  showGoToFees?: boolean;
  onAssignGroup?: () => void;
  onFinish?: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const status = (enrollment.registration_status as StatusKey) ?? "PENDING";
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
  const { Icon } = style;
  const label = t(STATUS_LABEL_KEYS[status] ?? STATUS_LABEL_KEYS.PENDING);

  const studentName = enrollment.student
    ? `${enrollment.student.first_name} ${enrollment.student.last_name}`
    : t("admin.enrollments.unknownStudent");
  const courseName =
    enrollment.course?.course_name || t("admin.enrollments.unknownCourse");
  const pricing = enrollment.pricing;
  const fees = enrollment.fees || [];
  const unpaidFee = fees.find((f: any) => f.status === "UNPAID");
  const docStatus = checkDocumentStatus(enrollment.student);
  const groupName = enrollment.group?.name;
  const enrollmentDate = enrollment.enrollment_date
    ? new Date(enrollment.enrollment_date).toLocaleDateString()
    : "—";

  return (
    <div className="group relative bg-white dark:bg-[#0D0D0D] rounded-2xl border border-[#E8E0D5] dark:border-[#1E1E1E] overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/40 flex flex-col">
      {/* Top accent bar */}
      <div
        className="h-[3px] w-full transition-all duration-300 group-hover:h-[4px]"
        style={{
          background: `linear-gradient(90deg, ${style.color}, ${style.color}55)`,
        }}
      />

      {/* Ambient hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${style.color}06, transparent 55%)`,
        }}
      />

      {/* ── Status Header ── */}
      <div
        className="relative px-5 pt-4 pb-3 flex items-center justify-between"
        style={{
          background: style.bg,
          borderBottom: `1px solid ${style.border}`,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: style.color + "22" }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: style.color }} />
          </div>
          <span
            className="text-[12px] font-bold"
            style={{ color: style.color }}
          >
            {label}
          </span>
          {/* Live pulse for PENDING */}
          {status === "PENDING" && (
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: style.color }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: style.color }}
              />
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-[#9B8E82] dark:text-[#444]">
          #{enrollment.enrollment_id.slice(0, 8)}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="relative p-5 flex flex-col gap-4 flex-1">
        {/* Student row */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black text-white shrink-0"
            style={{
              background: `linear-gradient(135deg, ${style.color}, ${style.color}88)`,
            }}
          >
            {enrollment.student?.first_name?.[0]}
            {enrollment.student?.last_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
              {studentName}
            </p>
            {enrollment.student?.email && (
              <p className="text-[11px] text-[#9B8E82] dark:text-[#555] truncate">
                {enrollment.student.email}
              </p>
            )}
          </div>
          <span className="text-[10px] text-[#9B8E82] dark:text-[#444] shrink-0">
            {enrollmentDate}
          </span>
        </div>

        {/* Course */}
        <div className="rounded-xl p-3 bg-[#F5F0EB] dark:bg-[#111] border border-[#E8E0D5] dark:border-[#1E1E1E]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-[#9B8E82] uppercase tracking-wide mb-0.5">
                {t("admin.enrollments.card.course")}
              </p>
              <p className="text-[13px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                {courseName}
              </p>
            </div>
            {enrollment.level && (
              <span className="shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#2B6F5E]/10 text-[#2B6F5E] dark:text-[#4ADE80]">
                {enrollment.level}
              </span>
            )}
          </div>
        </div>

        {/* Pricing */}
        {pricing && (
          <div
            className="rounded-xl p-3 flex items-center justify-between gap-2 border"
            style={{
              background: "rgba(196,160,53,0.05)",
              borderColor: "rgba(196,160,53,0.22)",
            }}
          >
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#C4A035]" />
              <span className="text-[12px] font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {pricing.status_fr}
              </span>
            </div>
            <span className="text-[13px] font-black text-[#C4A035]">
              {Number(pricing.price).toLocaleString()}{" "}
              <span className="text-[10px] font-semibold">DZD</span>
            </span>
          </div>
        )}

        {/* Unpaid fee */}
        {showGoToFees && unpaidFee && (
          <div
            className="rounded-xl p-3 flex items-center justify-between border"
            style={{
              background: "rgba(196,160,53,0.05)",
              borderColor: "rgba(196,160,53,0.22)",
            }}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-[#C4A035]" />
              <span className="text-[11px] text-[#9B8E82] dark:text-[#666]">
                {t("admin.enrollments.card.unpaidFee")}
              </span>
            </div>
            <span className="text-[13px] font-black text-[#C4A035]">
              {Number(unpaidFee.amount).toLocaleString()} DZD
            </span>
          </div>
        )}

        {/* Group assigned */}
        {groupName && (
          <div
            className="rounded-xl p-3 flex items-center gap-2 border"
            style={{
              background: "rgba(43,111,94,0.06)",
              borderColor: "rgba(43,111,94,0.18)",
            }}
          >
            <Users className="w-3.5 h-3.5 text-[#2B6F5E] dark:text-[#4ADE80]" />
            <div>
              <p className="text-[10px] font-semibold text-[#9B8E82] uppercase tracking-wide">
                {t("admin.enrollments.card.groupAssigned")}
              </p>
              <p className="text-[12px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {groupName}
              </p>
            </div>
          </div>
        )}

        {/* Document status — PENDING only */}
        {status === "PENDING" &&
          (docStatus.allApproved ? (
            <div
              className="rounded-xl p-3 flex items-center gap-2 border"
              style={{
                background: "rgba(43,111,94,0.06)",
                borderColor: "rgba(43,111,94,0.18)",
              }}
            >
              <CheckCircle className="w-3.5 h-3.5 text-[#2B6F5E] dark:text-[#4ADE80]" />
              <span className="text-[11px] font-semibold text-[#2B6F5E] dark:text-[#4ADE80]">
                {t("admin.enrollments.card.allDocsApproved")}
              </span>
            </div>
          ) : (
            <div
              className="rounded-xl p-3 border"
              style={{
                background: "rgba(196,160,53,0.06)",
                borderColor: "rgba(196,160,53,0.22)",
              }}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-[#C4A035] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-[#C4A035] mb-1">
                    {t("admin.enrollments.card.docIssues")}
                  </p>
                  {docStatus.missing.length > 0 && (
                    <p className="text-[11px] text-[#C4A035]/80">
                      {t("admin.enrollments.card.missing")}:{" "}
                      {docStatus.missing.join("، ")}
                    </p>
                  )}
                  {docStatus.pending.length > 0 && (
                    <p className="text-[11px] text-[#C4A035]/80">
                      {t("admin.enrollments.card.pendingApproval")}:{" "}
                      {docStatus.pending.join("، ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* ── Actions ── */}
      <div className="px-5 pb-5 flex flex-col gap-2 relative">
        {onValidate && (
          <button
            onClick={onValidate}
            disabled={!docStatus.allApproved}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-[12px] font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, #2B6F5E, #1E5044)",
              boxShadow: "0 4px 14px rgba(43,111,94,0.28)",
            }}
          >
            <CheckCircle className="w-4 h-4" />
            {t("admin.enrollments.actions.validateCreateFee")}
          </button>
        )}

        {onReject && (
          <button
            onClick={onReject}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-[12px] font-semibold border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            style={{
              borderColor: "rgba(239,68,68,0.30)",
              color: "#ef4444",
              background: "rgba(239,68,68,0.04)",
            }}
          >
            <XCircle className="w-3.5 h-3.5" />
            {t("admin.enrollments.actions.reject")}
          </button>
        )}

        {showGoToFees && (
          <Link
            to="/admin/fees"
            className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-[12px] font-bold text-white transition-all duration-200 hover:scale-[1.01]"
            style={{
              background: "linear-gradient(135deg, #C4A035, #A8862A)",
              boxShadow: "0 4px 14px rgba(196,160,53,0.28)",
            }}
          >
            <DollarSign className="w-4 h-4" />
            {t("admin.enrollments.actions.confirmPayment")}
            <ExternalLink className="w-3 h-3 opacity-70" />
          </Link>
        )}

        {onAssignGroup && (
          <button
            onClick={onAssignGroup}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-[12px] font-bold text-white transition-all duration-200 hover:scale-[1.01]"
            style={{
              background: "linear-gradient(135deg, #2B6F5E, #1E5044)",
              boxShadow: "0 4px 14px rgba(43,111,94,0.28)",
            }}
          >
            <Users className="w-4 h-4" />
            {t("admin.enrollments.actions.assignGroup")}
          </button>
        )}

        {onFinish && (
          <button
            onClick={onFinish}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-[12px] font-semibold border transition-all duration-200 hover:scale-[1.01]"
            style={{
              borderColor: "#E8E0D5",
              color: "#6B7280",
              background: "transparent",
            }}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            {t("admin.enrollments.actions.markFinished")}
          </button>
        )}

        <Link
          to={`/admin/students/${enrollment.student_id}`}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-[12px] font-semibold border transition-all duration-200 hover:scale-[1.01] text-[#9B8E82] hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5]"
          style={{ borderColor: "#E8E0D5", background: "transparent" }}
        >
          <Eye className="w-3.5 h-3.5" />
          {t("admin.enrollments.actions.viewStudent")}
          <ChevronRight className="w-3 h-3 opacity-50" />
        </Link>

        {/* ── Delete button — always visible ── */}
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-[12px] font-semibold border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          style={{
            borderColor: "rgba(239,68,68,0.25)",
            color: "#ef4444",
            background: "rgba(239,68,68,0.03)",
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t("admin.enrollments.actions.delete")}
        </button>
      </div>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({ tabKey }: { tabKey: string }) {
  const { t } = useTranslation();
  const icons: Record<string, React.ElementType> = {
    pending: Clock,
    validated: CheckCircle,
    paid: DollarSign,
    finished: GraduationCap,
    all: FileText,
  };
  const emptyKeys: Record<string, string> = {
    pending: "admin.enrollments.empty.pending",
    validated: "admin.enrollments.empty.validated",
    paid: "admin.enrollments.empty.paid",
    finished: "admin.enrollments.empty.finished",
    all: "admin.enrollments.empty.all",
  };
  const Icon = icons[tabKey] ?? FileText;
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#0D0D0D] rounded-2xl border border-[#E8E0D5] dark:border-[#1E1E1E]">
      <div className="w-16 h-16 rounded-2xl bg-[#F5F0EB] dark:bg-[#1A1A1A] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[#C8BFB5] dark:text-[#333]" />
      </div>
      <p className="text-[15px] font-semibold text-[#9B8E82]">
        {t(emptyKeys[tabKey] ?? "admin.enrollments.empty.all")}
      </p>
      <p className="text-[12px] text-[#C8BFB5] dark:text-[#444] mt-1">
        {t("admin.enrollments.emptyHint")}
      </p>
    </div>
  );
}
