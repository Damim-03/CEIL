/* ===============================================================
   ADMIN ENROLLMENTS MANAGEMENT PAGE - Brand Colors Applied
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
  Filter,
  Calendar,
  GraduationCap,
  AlertCircle,
  Tag,
  ExternalLink,
} from "lucide-react";

import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
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
   MAIN PAGE COMPONENT
=============================================================== */

export default function AdminEnrollmentsPage() {
  const { t } = useTranslation();
  const { data: enrollments = [], isLoading } = useAdminEnrollments();
  const validateEnrollment = useValidateEnrollment();
  const rejectEnrollment = useRejectEnrollment();
  const finishEnrollment = useFinishEnrollment();
  const addToGroup = useAddStudentToGroup();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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
    const matchesSearch =
      studentName.includes(search.toLowerCase()) ||
      courseName.includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || enrollment.registration_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: enrollments.length,
    pending: enrollments.filter((e: any) => e.registration_status === "PENDING")
      .length,
    validated: enrollments.filter(
      (e: any) => e.registration_status === "VALIDATED",
    ).length,
    paid: enrollments.filter((e: any) => e.registration_status === "PAID")
      .length,
    rejected: enrollments.filter(
      (e: any) => e.registration_status === "REJECTED",
    ).length,
    finished: enrollments.filter(
      (e: any) => e.registration_status === "FINISHED",
    ).length,
  };

  const pendingEnrollments = filteredEnrollments.filter(
    (e: any) => e.registration_status === "PENDING",
  );
  const validatedEnrollments = filteredEnrollments.filter(
    (e: any) => e.registration_status === "VALIDATED",
  );
  const paidEnrollments = filteredEnrollments.filter(
    (e: any) => e.registration_status === "PAID",
  );
  const finishedEnrollments = filteredEnrollments.filter(
    (e: any) => e.registration_status === "FINISHED",
  );

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

  const openRejectDialog = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setRejectDialog(true);
  };
  const openAssignGroupDialog = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setAssignGroupDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B1B1B]">
              {t("admin.enrollments.title")}
            </h1>
            <p className="text-sm text-[#BEB29E] mt-0.5">
              {t("admin.enrollments.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={FileText}
          label={t("admin.enrollments.stats.total")}
          value={stats.total}
          color="teal"
        />
        <StatCard
          icon={Clock}
          label={t("admin.enrollments.stats.pendingReview")}
          value={stats.pending}
          color="mustard"
          badge={stats.pending > 0}
        />
        <StatCard
          icon={CheckCircle}
          label={t("admin.enrollments.stats.validated")}
          value={stats.validated}
          color="green"
        />
        <StatCard
          icon={DollarSign}
          label={t("admin.enrollments.stats.paid")}
          value={stats.paid}
          color="teal"
          badge={stats.paid > 0}
        />
        <StatCard
          icon={XCircle}
          label={t("admin.enrollments.stats.rejected")}
          value={stats.rejected}
          color="red"
        />
        <StatCard
          icon={GraduationCap}
          label={t("admin.enrollments.stats.finished")}
          value={stats.finished}
          color="beige"
        />
      </div>

      {/* Workflow Info Card */}
      <div className="bg-[#2B6F5E]/5 border border-[#2B6F5E]/15 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#2B6F5E] mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-[#2B6F5E] mb-1">
              {t("admin.enrollments.workflow.title")}
            </h3>
            <p className="text-sm text-[#2B6F5E]/80 leading-relaxed">
              <span className="font-medium">
                {t("admin.enrollments.workflow.pending")}
              </span>{" "}
              → {t("admin.enrollments.workflow.validateStep")} →
              <span className="font-medium">
                {" "}
                {t("admin.enrollments.workflow.validated")}
              </span>{" "}
              → {t("admin.enrollments.workflow.payStep")}{" "}
              <Link
                to="/admin/fees"
                className="underline font-semibold hover:text-[#2B6F5E]"
              >
                {t("admin.enrollments.workflow.feesPage")}
              </Link>{" "}
              →
              <span className="font-medium">
                {" "}
                {t("admin.enrollments.workflow.paid")}
              </span>{" "}
              → {t("admin.enrollments.workflow.assignStep")} →
              <span className="font-medium">
                {" "}
                {t("admin.enrollments.workflow.finished")}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E]" />
            <Input
              placeholder={t("admin.enrollments.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#BEB29E]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[#D8CDC0]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6F5E]/20 focus:border-[#2B6F5E]"
            >
              <option value="all">
                {t("admin.enrollments.filter.allStatus")}
              </option>
              <option value="PENDING">
                {t("admin.enrollments.filter.pending")}
              </option>
              <option value="VALIDATED">
                {t("admin.enrollments.filter.validated")}
              </option>
              <option value="PAID">{t("admin.enrollments.filter.paid")}</option>
              <option value="REJECTED">
                {t("admin.enrollments.filter.rejected")}
              </option>
              <option value="FINISHED">
                {t("admin.enrollments.filter.finished")}
              </option>
            </select>
          </div>
        </div>
        <div className="mt-3 text-sm text-[#6B5D4F]">
          {t("admin.enrollments.showing")}{" "}
          <span className="font-semibold text-[#1B1B1B]">
            {filteredEnrollments.length}
          </span>{" "}
          {t("admin.enrollments.of")}{" "}
          <span className="font-semibold text-[#1B1B1B]">
            {enrollments.length}
          </span>{" "}
          {t("admin.enrollments.enrollmentsLabel")}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            ⏳ {t("admin.enrollments.tabs.pending")} (
            {pendingEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="validated">
            ✅ {t("admin.enrollments.tabs.validated")} (
            {validatedEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            💰 {t("admin.enrollments.tabs.paid")} ({paidEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="finished">
            🎓 {t("admin.enrollments.tabs.finished")} (
            {finishedEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            {t("admin.enrollments.tabs.all")} ({filteredEnrollments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 p-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-[#6B5D4F]">
              <Clock className="w-4 h-4 text-[#C4A035]" />
              <span className="font-medium text-[#1B1B1B]">
                {t("admin.enrollments.actionRequired")}:
              </span>
              <span>{t("admin.enrollments.pendingAction")}</span>
            </div>
          </div>
          {pendingEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingEnrollments.map((enrollment: any) => (
                <EnrollmentCard
                  key={enrollment.enrollment_id}
                  enrollment={enrollment}
                  onValidate={() =>
                    handleValidate(
                      enrollment.enrollment_id,
                      enrollment.pricing_id,
                    )
                  }
                  onReject={() => openRejectDialog(enrollment)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message={t("admin.enrollments.empty.pending")}
              icon={Clock}
            />
          )}
        </TabsContent>

        <TabsContent value="validated">
          <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[#6B5D4F]">
                <DollarSign className="w-4 h-4 text-[#C4A035]" />
                <span className="font-medium text-[#1B1B1B]">
                  {t("admin.enrollments.awaitingPayment")}:
                </span>
                <span>{t("admin.enrollments.validatedAction")}</span>
              </div>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-[#D8CDC0]/60 hover:bg-[#C4A035]/8 hover:border-[#C4A035]/40"
              >
                <Link to="/admin/fees" className="gap-2">
                  <ExternalLink className="w-3.5 h-3.5" />{" "}
                  {t("admin.enrollments.goToFees")}
                </Link>
              </Button>
            </div>
          </div>
          {validatedEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {validatedEnrollments.map((enrollment: any) => (
                <EnrollmentCard
                  key={enrollment.enrollment_id}
                  enrollment={enrollment}
                  showGoToFees
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message={t("admin.enrollments.empty.validated")}
              icon={CheckCircle}
            />
          )}
        </TabsContent>

        <TabsContent value="paid">
          <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 p-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-[#6B5D4F]">
              <Users className="w-4 h-4 text-[#2B6F5E]" />
              <span className="font-medium text-[#1B1B1B]">
                {t("admin.enrollments.actionRequired")}:
              </span>
              <span>{t("admin.enrollments.paidAction")}</span>
            </div>
          </div>
          {paidEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {paidEnrollments.map((enrollment: any) => (
                <EnrollmentCard
                  key={enrollment.enrollment_id}
                  enrollment={enrollment}
                  onAssignGroup={() => openAssignGroupDialog(enrollment)}
                  onFinish={() => handleFinish(enrollment.enrollment_id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message={t("admin.enrollments.empty.paid")}
              icon={DollarSign}
            />
          )}
        </TabsContent>

        <TabsContent value="finished">
          {finishedEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {finishedEnrollments.map((enrollment: any) => (
                <EnrollmentCard
                  key={enrollment.enrollment_id}
                  enrollment={enrollment}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message={t("admin.enrollments.empty.finished")}
              icon={GraduationCap}
            />
          )}
        </TabsContent>

        <TabsContent value="all">
          {filteredEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredEnrollments.map((enrollment: any) => (
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
                      ? () => openRejectDialog(enrollment)
                      : undefined
                  }
                  showGoToFees={enrollment.registration_status === "VALIDATED"}
                  onAssignGroup={
                    enrollment.registration_status === "PAID" &&
                    !enrollment.group_id
                      ? () => openAssignGroupDialog(enrollment)
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
          ) : (
            <EmptyState
              message={t("admin.enrollments.empty.all")}
              icon={FileText}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("admin.enrollments.rejectDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.enrollments.rejectDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t("admin.enrollments.rejectDialog.placeholder")}
              className="w-full p-3 border border-[#D8CDC0]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
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
              className="border-[#D8CDC0]/60"
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

      {/* Assign Group Dialog */}
      <Dialog open={assignGroupDialog} onOpenChange={setAssignGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("admin.enrollments.assignDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.enrollments.assignDialog.description", {
                name: `${selectedEnrollment?.student?.first_name || ""} ${selectedEnrollment?.student?.last_name || ""}`.trim(),
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-[#1B1B1B] mb-2">
              {t("admin.enrollments.assignDialog.availableGroups")}
            </label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.enrollments.assignDialog.selectGroup")}
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
              className="border-[#D8CDC0]/60"
            >
              {t("admin.enrollments.cancel")}
            </Button>
            <Button
              onClick={handleAssignGroup}
              disabled={!selectedGroupId || addToGroup.isPending}
              className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white"
            >
              {addToGroup.isPending
                ? t("admin.enrollments.assignDialog.assigning")
                : t("admin.enrollments.assignDialog.assignBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ===============================================================
   ENROLLMENT CARD
=============================================================== */

interface EnrollmentCardProps {
  enrollment: any;
  onValidate?: () => void;
  onReject?: () => void;
  showGoToFees?: boolean;
  onAssignGroup?: () => void;
  onFinish?: () => void;
}

function EnrollmentCard({
  enrollment,
  onValidate,
  onReject,
  showGoToFees,
  onAssignGroup,
  onFinish,
}: EnrollmentCardProps) {
  const { t } = useTranslation();

  const statusConfig = {
    PENDING: {
      icon: Clock,
      label: t("admin.enrollments.status.pendingReview"),
      bgColor: "bg-[#C4A035]/8",
      textColor: "text-[#C4A035]",
      borderColor: "border-[#C4A035]/20",
    },
    VALIDATED: {
      icon: CheckCircle,
      label: t("admin.enrollments.status.validatedAwaiting"),
      bgColor: "bg-[#8DB896]/10",
      textColor: "text-[#2B6F5E]",
      borderColor: "border-[#8DB896]/30",
    },
    PAID: {
      icon: DollarSign,
      label: t("admin.enrollments.status.paidReady"),
      bgColor: "bg-[#2B6F5E]/5",
      textColor: "text-[#2B6F5E]",
      borderColor: "border-[#2B6F5E]/15",
    },
    REJECTED: {
      icon: XCircle,
      label: t("admin.enrollments.status.rejected"),
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200",
    },
    FINISHED: {
      icon: GraduationCap,
      label: t("admin.enrollments.status.finished"),
      bgColor: "bg-[#D8CDC0]/15",
      textColor: "text-[#6B5D4F]",
      borderColor: "border-[#D8CDC0]/40",
    },
  };

  const config =
    statusConfig[enrollment.registration_status as keyof typeof statusConfig] ||
    statusConfig.PENDING;
  const StatusIcon = config.icon;
  const studentName = enrollment.student
    ? `${enrollment.student.first_name} ${enrollment.student.last_name}`
    : t("admin.enrollments.unknownStudent");
  const courseName =
    enrollment.course?.course_name || t("admin.enrollments.unknownCourse");
  const courseCode = enrollment.course?.course_code;
  const groupName = enrollment.group?.name;
  const pricing = enrollment.pricing;
  const fees = enrollment.fees || [];
  const unpaidFee = fees.find((f: any) => f.status === "UNPAID");
  const enrollmentDate = enrollment.enrollment_date
    ? new Date(enrollment.enrollment_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const REQUIRED_DOCUMENTS = [
    "PHOTO",
    "ID_CARD",
    "SCHOOL_CERTIFICATE",
    "PAYMENT_RECEIPT",
  ];
  const studentDocs = enrollment.student?.documents || [];
  const requiredDocsStatus = REQUIRED_DOCUMENTS.map((type) => {
    const doc = studentDocs.find((d: any) => d.type === type);
    return { type, exists: !!doc, approved: doc?.status === "APPROVED" };
  });
  const allRequiredDocsApproved = requiredDocsStatus.every((d) => d.approved);
  const missingDocs = requiredDocsStatus
    .filter((d) => !d.exists)
    .map((d) => d.type);
  const pendingDocs = requiredDocsStatus
    .filter((d) => d.exists && !d.approved)
    .map((d) => d.type);

  return (
    <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div
        className={`${config.bgColor} ${config.borderColor} border-b px-5 py-3`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${config.textColor}`} />
            <span className={`text-sm font-semibold ${config.textColor}`}>
              {config.label}
            </span>
          </div>
          <span className="text-xs text-[#BEB29E]">
            #{enrollment.enrollment_id.slice(0, 8)}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="text-xs font-medium text-[#6B5D4F] mb-1">
            {t("admin.enrollments.card.student")}
          </p>
          <p className="text-base font-semibold text-[#1B1B1B]">
            {studentName}
          </p>
          {enrollment.student?.email && (
            <p className="text-sm text-[#6B5D4F]">{enrollment.student.email}</p>
          )}
        </div>

        <div className="p-3 bg-[#D8CDC0]/10 rounded-xl">
          <p className="text-xs font-medium text-[#6B5D4F] mb-1">
            {t("admin.enrollments.card.course")}
          </p>
          <p className="text-sm font-semibold text-[#1B1B1B]">{courseName}</p>
          {courseCode && (
            <p className="text-xs text-[#6B5D4F]">
              {t("admin.enrollments.card.code")}: {courseCode}
            </p>
          )}
          {enrollment.level && (
            <p className="text-xs text-[#6B5D4F]">
              {t("admin.enrollments.card.level")}: {enrollment.level}
            </p>
          )}
        </div>

        {pricing && (
          <div className="p-3 bg-[#C4A035]/5 rounded-xl border border-[#C4A035]/15">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-[#C4A035]" />
              <p className="text-xs font-medium text-[#C4A035]">
                {t("admin.enrollments.card.pricingChoice")}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1B1B1B]">
                {pricing.status_fr}
                {pricing.status_ar && (
                  <span className="text-xs text-[#C4A035] mr-1">
                    {" "}
                    ({pricing.status_ar})
                  </span>
                )}
              </p>
              <span className="text-sm font-bold text-[#C4A035]">
                {Number(pricing.price).toLocaleString()}{" "}
                {pricing.currency || "DZD"}
              </span>
            </div>
            {pricing.discount && (
              <p className="text-xs text-[#C4A035]/80 mt-1">
                {pricing.discount}
              </p>
            )}
          </div>
        )}

        {!pricing && enrollment.registration_status === "PENDING" && (
          <div className="p-3 bg-[#D8CDC0]/10 rounded-xl border border-[#D8CDC0]/30">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#BEB29E]" />
              <p className="text-xs text-[#BEB29E]">
                {t("admin.enrollments.card.noPricing")}
              </p>
            </div>
          </div>
        )}

        {showGoToFees && unpaidFee && (
          <div className="p-3 bg-[#C4A035]/5 rounded-xl border border-[#C4A035]/15">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-[#C4A035]" />
              <p className="text-xs font-medium text-[#C4A035]">
                {t("admin.enrollments.card.unpaidFee")}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#1B1B1B]">
                {t("admin.enrollments.card.amount")}:{" "}
                <span className="font-bold">
                  {Number(unpaidFee.amount).toLocaleString()} DZD
                </span>
              </p>
              {unpaidFee.due_date && (
                <p className="text-xs text-[#C4A035]">
                  {t("admin.enrollments.card.due")}:{" "}
                  {new Date(unpaidFee.due_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        {groupName && (
          <div className="p-3 bg-[#2B6F5E]/5 rounded-xl border border-[#2B6F5E]/15">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-[#2B6F5E]" />
              <p className="text-xs font-medium text-[#2B6F5E]">
                {t("admin.enrollments.card.groupAssigned")}
              </p>
            </div>
            <p className="text-sm font-semibold text-[#1B1B1B]">{groupName}</p>
          </div>
        )}

        {enrollment.registration_status === "PENDING" &&
          !allRequiredDocsApproved && (
            <div className="p-3 bg-[#C4A035]/5 rounded-xl border border-[#C4A035]/15">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#C4A035] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#C4A035] mb-1">
                    {t("admin.enrollments.card.docIssues")}
                  </p>
                  {missingDocs.length > 0 && (
                    <p className="text-xs text-[#C4A035]/80">
                      {t("admin.enrollments.card.missing")}:{" "}
                      {missingDocs.join(", ")}
                    </p>
                  )}
                  {pendingDocs.length > 0 && (
                    <p className="text-xs text-[#C4A035]/80">
                      {t("admin.enrollments.card.pendingApproval")}:{" "}
                      {pendingDocs.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

        {enrollment.registration_status === "PENDING" &&
          allRequiredDocsApproved && (
            <div className="p-3 bg-[#8DB896]/10 rounded-xl border border-[#8DB896]/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#2B6F5E]" />
                <p className="text-xs font-medium text-[#2B6F5E]">
                  {t("admin.enrollments.card.allDocsApproved")}
                </p>
              </div>
            </div>
          )}

        <div className="grid grid-cols-1 gap-3 pt-2 border-t border-[#D8CDC0]/30">
          <div className="flex items-center gap-2 text-sm text-[#6B5D4F]">
            <Calendar className="w-4 h-4 text-[#BEB29E]" />
            <span>
              {t("admin.enrollments.card.enrolled")}: {enrollmentDate}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {onValidate && (
            <Button
              onClick={onValidate}
              className="w-full bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white"
              size="sm"
              disabled={!allRequiredDocsApproved}
            >
              <CheckCircle className="w-4 h-4 mr-2" />{" "}
              {t("admin.enrollments.actions.validateCreateFee")}
            </Button>
          )}
          {onReject && (
            <Button
              onClick={onReject}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
              size="sm"
            >
              <XCircle className="w-4 h-4 mr-2" />{" "}
              {t("admin.enrollments.actions.reject")}
            </Button>
          )}
          {showGoToFees && (
            <Button
              asChild
              className="w-full bg-[#C4A035] hover:bg-[#C4A035]/90 text-white"
              size="sm"
            >
              <Link to="/admin/fees">
                <DollarSign className="w-4 h-4 mr-2" />{" "}
                {t("admin.enrollments.actions.confirmPayment")}{" "}
                <ExternalLink className="w-3.5 h-3.5 ml-2" />
              </Link>
            </Button>
          )}
          {onAssignGroup && (
            <Button
              onClick={onAssignGroup}
              className="w-full bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white"
              size="sm"
            >
              <Users className="w-4 h-4 mr-2" />{" "}
              {t("admin.enrollments.actions.assignGroup")}
            </Button>
          )}
          {onFinish && (
            <Button
              onClick={onFinish}
              variant="outline"
              className="w-full border-[#D8CDC0]/60 text-[#6B5D4F] hover:bg-[#D8CDC0]/15"
              size="sm"
            >
              <GraduationCap className="w-4 h-4 mr-2" />{" "}
              {t("admin.enrollments.actions.markFinished")}
            </Button>
          )}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full border-[#D8CDC0]/60 text-[#6B5D4F] hover:bg-[#D8CDC0]/10"
          >
            <Link to={`/admin/students/${enrollment.student_id}`}>
              <Eye className="w-4 h-4 mr-2" />{" "}
              {t("admin.enrollments.actions.viewStudent")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── STAT CARD ── */

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  badge?: boolean;
}

function StatCard({ icon: Icon, label, value, color, badge }: StatCardProps) {
  const colors: Record<string, { bar: string; bg: string; icon: string }> = {
    teal: {
      bar: "from-[#2B6F5E] to-[#2B6F5E]/70",
      bg: "bg-[#2B6F5E]/8",
      icon: "text-[#2B6F5E]",
    },
    mustard: {
      bar: "from-[#C4A035] to-[#C4A035]/70",
      bg: "bg-[#C4A035]/8",
      icon: "text-[#C4A035]",
    },
    green: {
      bar: "from-[#8DB896] to-[#8DB896]/70",
      bg: "bg-[#8DB896]/12",
      icon: "text-[#3D7A4A]",
    },
    red: {
      bar: "from-red-500 to-red-500/70",
      bg: "bg-red-50",
      icon: "text-red-600",
    },
    beige: {
      bar: "from-[#BEB29E] to-[#BEB29E]/70",
      bg: "bg-[#D8CDC0]/20",
      icon: "text-[#6B5D4F]",
    },
  };
  const c = colors[color] || colors.teal;

  return (
    <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-4 overflow-hidden group hover:shadow-md transition-all">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${c.bar} opacity-60 group-hover:opacity-100 transition-opacity`}
      ></div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[#6B5D4F] uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold text-[#1B1B1B] mt-1">{value}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
      {badge && value > 0 && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#C4A035] rounded-full flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">{value}</span>
        </div>
      )}
    </div>
  );
}

/* ── EMPTY STATE ── */

function EmptyState({
  message,
  icon: Icon,
}: {
  message: string;
  icon: React.ElementType;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-[#D8CDC0]/60">
      <div className="w-16 h-16 rounded-full bg-[#D8CDC0]/20 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#BEB29E]" />
      </div>
      <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">{message}</h3>
      <p className="text-[#6B5D4F] text-sm">
        {t("admin.enrollments.emptyHint")}
      </p>
    </div>
  );
}
