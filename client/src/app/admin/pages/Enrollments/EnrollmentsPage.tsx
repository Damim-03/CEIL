/* ===============================================================
   ADMIN ENROLLMENTS — Refined Luxury Redesign
   ✅ All logic preserved
   ✅ New: deep visual hierarchy, gradient cards, micro-animations
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
  CircleDot,
  X,
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
   STATUS CONFIG
=============================================================== */

const STATUS_META = {
  PENDING: {
    label: "قيد المراجعة",
    color: "#C4A035",
    bg: "rgba(196,160,53,0.08)",
    border: "rgba(196,160,53,0.20)",
    glow: "rgba(196,160,53,0.15)",
    Icon: Clock,
    dot: "#C4A035",
  },
  VALIDATED: {
    label: "موثق",
    color: "#2B6F5E",
    bg: "rgba(43,111,94,0.08)",
    border: "rgba(43,111,94,0.20)",
    glow: "rgba(43,111,94,0.15)",
    Icon: CheckCircle,
    dot: "#2B6F5E",
  },
  PAID: {
    label: "مدفوع",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.20)",
    glow: "rgba(59,130,246,0.15)",
    Icon: DollarSign,
    dot: "#3b82f6",
  },
  REJECTED: {
    label: "مرفوض",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.20)",
    glow: "rgba(239,68,68,0.15)",
    Icon: XCircle,
    dot: "#ef4444",
  },
  FINISHED: {
    label: "مكتمل",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.08)",
    border: "rgba(148,163,184,0.20)",
    glow: "rgba(148,163,184,0.10)",
    Icon: GraduationCap,
    dot: "#94a3b8",
  },
} as const;

/* ===============================================================
   TAB CONFIG
=============================================================== */

const TABS = [
  { key: "pending", label: "معلق", icon: Clock, accent: "#C4A035" },
  { key: "validated", label: "موثق", icon: CheckCircle, accent: "#2B6F5E" },
  { key: "paid", label: "مدفوع", icon: DollarSign, accent: "#3b82f6" },
  { key: "finished", label: "مكتمل", icon: GraduationCap, accent: "#94a3b8" },
  { key: "all", label: "الكل", icon: FileText, accent: "#6366f1" },
] as const;

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

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["key"]>("pending");
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [assignGroupDialog, setAssignGroupDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  if (isLoading) return <PageLoader />;

  const filteredEnrollments = enrollments.filter((enrollment: any) => {
    const studentName = enrollment.student
      ? `${enrollment.student.first_name} ${enrollment.student.last_name}`.toLowerCase()
      : "";
    const courseName = enrollment.course?.course_name?.toLowerCase() || "";
    return (
      studentName.includes(search.toLowerCase()) ||
      courseName.includes(search.toLowerCase())
    );
  });

  const byStatus = (status: string) =>
    filteredEnrollments.filter((e: any) => e.registration_status === status);
  const pending = byStatus("PENDING");
  const validated = byStatus("VALIDATED");
  const paid = byStatus("PAID");
  const finished = byStatus("FINISHED");

  const tabItems = {
    pending,
    validated,
    paid,
    finished,
    all: filteredEnrollments,
  };

  const stats = [
    {
      label: "الكل",
      value: enrollments.length,
      color: "#6366f1",
      Icon: FileText,
    },
    {
      label: "معلق",
      value: byStatus("PENDING").length,
      color: "#C4A035",
      Icon: Clock,
      badge: true,
    },
    {
      label: "موثق",
      value: byStatus("VALIDATED").length,
      color: "#2B6F5E",
      Icon: CheckCircle,
    },
    {
      label: "مدفوع",
      value: byStatus("PAID").length,
      color: "#3b82f6",
      Icon: DollarSign,
      badge: true,
    },
    {
      label: "مرفوض",
      value: byStatus("REJECTED").length,
      color: "#ef4444",
      Icon: XCircle,
    },
    {
      label: "مكتمل",
      value: byStatus("FINISHED").length,
      color: "#94a3b8",
      Icon: GraduationCap,
    },
  ];

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
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || t("admin.enrollments.validateFailed"),
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
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || t("admin.enrollments.rejectFailed"),
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
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          t("admin.enrollments.assignGroupFailed"),
      );
    }
  };

  const handleFinish = async (enrollmentId: string) => {
    if (!window.confirm(t("admin.enrollments.confirmFinish"))) return;
    try {
      await finishEnrollment.mutateAsync(enrollmentId);
      toast.success(t("admin.enrollments.finishSuccess"));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || t("admin.enrollments.finishFailed"),
      );
    }
  };

  const currentList = tabItems[activeTab];
  const currentTabMeta = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="min-h-screen bg-[#FDFAF7] dark:bg-[#080808]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F1F1A] via-[#1A2E28] to-[#0F1F1A] p-8 border border-[#2B6F5E]/30">
          {/* Ambient glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#2B6F5E]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 left-10 w-48 h-48 rounded-full bg-[#C4A035]/10 blur-3xl pointer-events-none" />
          {/* Dot grid */}
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
                    لوحة التسجيلات
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

            {/* Workflow steps */}
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
              {["معلق", "موثق", "مدفوع", "مكتمل"].map((step, i, arr) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-white/70">
                    {step}
                  </span>
                  {i < arr.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-white/30" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {stats.map(({ label, value, color, Icon, badge }) => (
            <div key={label} className="relative group">
              <div
                className="bg-white dark:bg-[#111] rounded-2xl border border-[#E8E0D5] dark:border-[#1E1E1E] p-4 text-center hover:border-opacity-100 transition-all duration-300 hover:shadow-lg cursor-default overflow-hidden"
                style={{ "--glow": color } as any}
              >
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
                    {label}
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

        {/* ── Search + Tabs Bar ── */}
        <div className="bg-white dark:bg-[#0D0D0D] rounded-2xl border border-[#E8E0D5] dark:border-[#1E1E1E] overflow-hidden">
          {/* Search */}
          <div className="px-4 pt-4 pb-3 border-b border-[#F0EBE5] dark:border-[#1A1A1A]">
            <div className="relative">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B8E82]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو المادة..."
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
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => {
              const count = tabItems[tab.key].length;
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
                  {tab.label}
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

        {/* ── Content ── */}
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
              />
            ))}
          </div>
        )}

        {/* ── Reject Dialog ── */}
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

        {/* ── Assign Group Dialog ── */}
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
      </div>
    </div>
  );
}

/* ===============================================================
   ENROLLMENT CARD — Refined luxury design
=============================================================== */

function EnrollmentCard({
  enrollment,
  onValidate,
  onReject,
  showGoToFees,
  onAssignGroup,
  onFinish,
}: {
  enrollment: any;
  onValidate?: () => void;
  onReject?: () => void;
  showGoToFees?: boolean;
  onAssignGroup?: () => void;
  onFinish?: () => void;
}) {
  const { t } = useTranslation();
  const status = enrollment.registration_status as keyof typeof STATUS_META;
  const meta = STATUS_META[status] ?? STATUS_META.PENDING;
  const { Icon } = meta;

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
    ? new Date(enrollment.enrollment_date).toLocaleDateString("ar-DZ")
    : "—";

  return (
    <div className="group relative bg-white dark:bg-[#0D0D0D] rounded-2xl border border-[#E8E0D5] dark:border-[#1E1E1E] overflow-hidden hover:border-opacity-80 transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/40 flex flex-col">
      {/* Top accent bar */}
      <div
        className="h-[3px] w-full transition-all duration-300 group-hover:h-[4px]"
        style={{
          background: `linear-gradient(90deg, ${meta.color}, ${meta.color}60)`,
        }}
      />

      {/* Ambient glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${meta.color}06, transparent 60%)`,
        }}
      />

      {/* ── Status Header ── */}
      <div
        className="relative px-5 pt-4 pb-3 flex items-center justify-between"
        style={{
          background: meta.bg,
          borderBottom: `1px solid ${meta.border}`,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: meta.color + "20" }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
          </div>
          <span className="text-[12px] font-bold" style={{ color: meta.color }}>
            {meta.label}
          </span>
          {/* Pulse dot for pending */}
          {status === "PENDING" && (
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: meta.color }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: meta.color }}
              />
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-[#9B8E82] dark:text-[#555]">
          #{enrollment.enrollment_id.slice(0, 8)}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="relative p-5 flex flex-col gap-4 flex-1">
        {/* Student */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black text-white shrink-0"
            style={{
              background: `linear-gradient(135deg, ${meta.color}, ${meta.color}90)`,
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
          <span className="text-[10px] text-[#9B8E82] dark:text-[#555] shrink-0">
            {enrollmentDate}
          </span>
        </div>

        {/* Course */}
        <div className="rounded-xl p-3 bg-[#F5F0EB] dark:bg-[#111] border border-[#E8E0D5] dark:border-[#1E1E1E]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-[#9B8E82] uppercase tracking-wide mb-0.5">
                المادة
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
            style={{ background: "#C4A03508", borderColor: "#C4A03525" }}
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
            style={{ background: "#C4A03508", borderColor: "#C4A03525" }}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-[#C4A035]" />
              <span className="text-[11px] text-[#9B8E82]">رسوم غير مسددة</span>
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
            <span className="text-[12px] font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {groupName}
            </span>
          </div>
        )}

        {/* Document status (PENDING only) */}
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
                    مستندات ناقصة
                  </p>
                  {docStatus.missing.length > 0 && (
                    <p className="text-[11px] text-[#C4A035]/80">
                      ناقص: {docStatus.missing.join("، ")}
                    </p>
                  )}
                  {docStatus.pending.length > 0 && (
                    <p className="text-[11px] text-[#C4A035]/80">
                      في الانتظار: {docStatus.pending.join("، ")}
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
              background: `linear-gradient(135deg, #2B6F5E, #1E5044)`,
              boxShadow: "0 4px 12px rgba(43,111,94,0.25)",
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
              borderColor: "rgba(239,68,68,0.3)",
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
              boxShadow: "0 4px 12px rgba(196,160,53,0.25)",
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
              boxShadow: "0 4px 12px rgba(43,111,94,0.25)",
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
      </div>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({ tabKey }: { tabKey: string }) {
  const icons: Record<string, any> = {
    pending: Clock,
    validated: CheckCircle,
    paid: DollarSign,
    finished: GraduationCap,
    all: FileText,
  };
  const Icon = icons[tabKey] || FileText;
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#0D0D0D] rounded-2xl border border-[#E8E0D5] dark:border-[#1E1E1E]">
      <div className="w-16 h-16 rounded-2xl bg-[#F5F0EB] dark:bg-[#1A1A1A] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[#C8BFB5] dark:text-[#333]" />
      </div>
      <p className="text-[15px] font-semibold text-[#9B8E82]">
        لا توجد تسجيلات
      </p>
      <p className="text-[12px] text-[#C8BFB5] dark:text-[#444] mt-1">
        جرّب تغيير الفلتر أو البحث
      </p>
    </div>
  );
}
