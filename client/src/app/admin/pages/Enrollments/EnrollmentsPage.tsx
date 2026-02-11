/* ===============================================================
   ADMIN ENROLLMENTS MANAGEMENT PAGE - WITH PRICING SELECTION
   
   ✅ COMPLETE VERSION with all features:
   1. Document Review (PENDING documents)
   2. Enrollment Validation with Pricing Selection (PENDING → VALIDATED)
   3. Payment Confirmation (VALIDATED → PAID)
   4. Group Assignment (PAID students)
   5. Finish Enrollment (PAID → FINISHED)
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
  Sparkles,
  CheckCircle2,
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
  RadioGroup,
  RadioGroupItem,
} from "../../../../components/ui/radio-group";
import { Label } from "../../../../components/ui/label";
import { Badge } from "../../../../components/ui/badge";

import {
  useAdminEnrollments,
  useValidateEnrollment,
  useRejectEnrollment,
  useMarkEnrollmentPaid,
  useFinishEnrollment,
  useAddStudentToGroup,
} from "../../../../hooks/admin/useAdmin";

import type { Enrollment } from "../../../../types/Types";
import { toast } from "sonner";

/* ===============================================================
   PRICING SELECTION MODAL COMPONENT
=============================================================== */

interface PricingSelectionModalProps {
  open: boolean;
  onClose: () => void;
  enrollment: Enrollment | null;
  onConfirm: (pricingId: string) => Promise<void>;
  isLoading?: boolean;
}

const PricingSelectionModal = ({
  open,
  onClose,
  enrollment,
  onConfirm,
  isLoading = false,
}: PricingSelectionModalProps) => {
  const [selectedPricingId, setSelectedPricingId] = useState<string>("");

  const pricing = enrollment?.course?.profile?.pricing || [];

  const handleConfirm = async () => {
    if (!selectedPricingId && pricing.length > 0) {
      toast.error("Please select a pricing tier");
      return;
    }

    await onConfirm(selectedPricingId);
    setSelectedPricingId("");
  };

  const selectedPricing = pricing.find(
    (p: any) => p.pricing_id === selectedPricingId,
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Validate Enrollment
          </DialogTitle>
          <DialogDescription>
            Select the appropriate pricing tier for this student
          </DialogDescription>
        </DialogHeader>

        {/* Student Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Student</span>
            <span className="font-semibold">
              {enrollment?.student?.first_name} {enrollment?.student?.last_name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Course</span>
            <span className="font-medium">
              {enrollment?.course?.course_name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Enrollment Date
            </span>
            <span className="text-sm">
              {enrollment?.enrollment_date &&
                new Date(enrollment.enrollment_date).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Pricing Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Select Pricing Tier</h3>
          </div>

          {pricing.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 dark:bg-amber-950/30 dark:border-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  No Pricing Configured
                </p>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  Please configure pricing tiers in the course profile before
                  validating enrollments.
                </p>
              </div>
            </div>
          ) : (
            <RadioGroup
              value={selectedPricingId}
              onValueChange={setSelectedPricingId}
              className="space-y-3"
            >
              {pricing.map((tier: any) => {
                const isSelected = selectedPricingId === tier.pricing_id;

                return (
                  <div
                    key={tier.pricing_id}
                    className={`relative rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/30 hover:bg-muted/30"
                    }`}
                  >
                    <Label
                      htmlFor={tier.pricing_id}
                      className="flex items-center gap-4 p-4 cursor-pointer"
                    >
                      <RadioGroupItem
                        value={tier.pricing_id}
                        id={tier.pricing_id}
                        className="flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">
                            {tier.status_fr}
                          </span>
                          {tier.status_ar && (
                            <span className="text-sm text-muted-foreground">
                              ({tier.status_ar})
                            </span>
                          )}
                          {tier.discount &&
                            tier.discount !== "Aucune" &&
                            tier.discount !== "None" && (
                              <Badge
                                variant="secondary"
                                className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                              >
                                <Sparkles className="w-3 h-3 mr-1" />
                                {tier.discount}
                              </Badge>
                            )}
                        </div>

                        {tier.status_en && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {tier.status_en}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-primary">
                            {Number(tier.price).toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {tier.currency}
                          </span>
                        </div>
                      </div>
                    </Label>

                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-5 h-5 text-primary fill-primary/20" />
                      </div>
                    )}
                  </div>
                );
              })}
            </RadioGroup>
          )}
        </div>

        {/* Selected Summary */}
        {selectedPricing && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Selected Category
                </p>
                <p className="font-semibold text-lg">
                  {selectedPricing.status_fr}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">
                    Fee Amount:
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {Number(selectedPricing.price).toLocaleString()}{" "}
                    {selectedPricing.currency}
                  </span>
                </div>
                {selectedPricing.discount &&
                  selectedPricing.discount !== "Aucune" && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      Discount applied: {selectedPricing.discount}
                    </p>
                  )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={(!selectedPricingId && pricing.length > 0) || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Validate Enrollment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ===============================================================
   MAIN PAGE COMPONENT
=============================================================== */

export default function AdminEnrollmentsPage() {
  const { data: enrollments = [], isLoading } = useAdminEnrollments();
  const validateEnrollment = useValidateEnrollment();
  const rejectEnrollment = useRejectEnrollment();
  const markPaid = useMarkEnrollmentPaid();
  const finishEnrollment = useFinishEnrollment();
  const addToGroup = useAddStudentToGroup();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [pricingDialog, setPricingDialog] = useState(false);
  const [assignGroupDialog, setAssignGroupDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  if (isLoading) return <PageLoader />;

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((enrollment) => {
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

  // Stats
  const stats = {
    total: enrollments.length,
    pending: enrollments.filter((e) => e.registration_status === "PENDING")
      .length,
    validated: enrollments.filter((e) => e.registration_status === "VALIDATED")
      .length,
    paid: enrollments.filter((e) => e.registration_status === "PAID").length,
    rejected: enrollments.filter((e) => e.registration_status === "REJECTED")
      .length,
    finished: enrollments.filter((e) => e.registration_status === "FINISHED")
      .length,
  };

  // Categorized enrollments
  const pendingEnrollments = filteredEnrollments.filter(
    (e) => e.registration_status === "PENDING",
  );
  const validatedEnrollments = filteredEnrollments.filter(
    (e) => e.registration_status === "VALIDATED",
  );
  const paidEnrollments = filteredEnrollments.filter(
    (e) => e.registration_status === "PAID",
  );
  const finishedEnrollments = filteredEnrollments.filter(
    (e) => e.registration_status === "FINISHED",
  );

  // ✅ UPDATED: Validate with pricing selection
  const handleValidate = async (pricingId: string) => {
    if (!selectedEnrollment) return;

    try {
      await validateEnrollment.mutateAsync({
        enrollmentId: selectedEnrollment.enrollment_id,
        pricing_id: pricingId,
      });

      toast.success("✅ Enrollment validated! Fee created successfully.");
      setPricingDialog(false);
      setSelectedEnrollment(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to validate enrollment";
      toast.error(message);
      console.error(error);
    }
  };

  const openPricingDialog = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setPricingDialog(true);
  };

  const handleReject = async () => {
    if (!selectedEnrollment || !rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await rejectEnrollment.mutateAsync({
        enrollmentId: selectedEnrollment.enrollment_id,
        reason: rejectReason,
      });
      toast.success("Enrollment rejected");
      setRejectDialog(false);
      setRejectReason("");
      setSelectedEnrollment(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to reject enrollment";
      toast.error(message);
      console.error(error);
    }
  };

  const handleMarkPaid = async (enrollmentId: string) => {
    if (!window.confirm("Confirm payment for this enrollment?")) {
      return;
    }

    try {
      await markPaid.mutateAsync(enrollmentId);
      toast.success(
        "💰 Payment confirmed! Student can now be assigned to a group.",
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to confirm payment";
      toast.error(message);
      console.error(error);
    }
  };

  const handleAssignGroup = async () => {
    if (!selectedEnrollment || !selectedGroupId) {
      toast.error("Please select a group");
      return;
    }

    try {
      await addToGroup.mutateAsync({
        groupId: selectedGroupId,
        studentId: selectedEnrollment.student_id,
      });
      toast.success("👥 Student assigned to group successfully!");
      setAssignGroupDialog(false);
      setSelectedGroupId("");
      setSelectedEnrollment(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to assign student to group";
      toast.error(message);
      console.error(error);
    }
  };

  const handleFinish = async (enrollmentId: string) => {
    if (!window.confirm("Mark this enrollment as finished?")) {
      return;
    }

    try {
      await finishEnrollment.mutateAsync(enrollmentId);
      toast.success("🎓 Enrollment marked as finished!");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to finish enrollment";
      toast.error(message);
      console.error(error);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Enrollment Management
          </h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Complete student enrollment lifecycle from application to group
            assignment
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={FileText}
          label="Total"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="Pending Review"
          value={stats.pending}
          color="yellow"
          badge={stats.pending > 0}
        />
        <StatCard
          icon={CheckCircle}
          label="Validated"
          value={stats.validated}
          color="green"
        />
        <StatCard
          icon={DollarSign}
          label="Paid"
          value={stats.paid}
          color="blue"
          badge={stats.paid > 0}
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={stats.rejected}
          color="red"
        />
        <StatCard
          icon={GraduationCap}
          label="Finished"
          value={stats.finished}
          color="purple"
        />
      </div>

      {/* Workflow Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              Enrollment Workflow
            </h3>
            <p className="text-sm text-blue-700 leading-relaxed">
              <span className="font-medium">PENDING</span> → Validate (creates
              fee) →<span className="font-medium"> VALIDATED</span> → Confirm
              payment →<span className="font-medium"> PAID</span> → Assign to
              group →<span className="font-medium"> FINISHED</span>
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by student name or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="VALIDATED">Validated</option>
              <option value="PAID">Paid</option>
              <option value="REJECTED">Rejected</option>
              <option value="FINISHED">Finished</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredEnrollments.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900">
            {enrollments.length}
          </span>{" "}
          enrollments
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            ⏳ Pending ({pendingEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="validated">
            ✅ Validated ({validatedEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            💰 Paid ({paidEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="finished">
            🎓 Finished ({finishedEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({filteredEnrollments.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending">
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Action Required:</span>
              <span>Review documents and validate enrollments to proceed</span>
            </div>
          </div>
          {pendingEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingEnrollments.map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.enrollment_id}
                  enrollment={enrollment}
                  onValidate={() => openPricingDialog(enrollment)}
                  onReject={() => openRejectDialog(enrollment)}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No pending enrollments" icon={Clock} />
          )}
        </TabsContent>

        {/* Validated Tab */}
        <TabsContent value="validated">
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">Action Required:</span>
              <span>Confirm student payments to allow group assignment</span>
            </div>
          </div>
          {validatedEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {validatedEnrollments.map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.enrollment_id}
                  enrollment={enrollment}
                  onMarkPaid={() => handleMarkPaid(enrollment.enrollment_id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message="No validated enrollments awaiting payment"
              icon={CheckCircle}
            />
          )}
        </TabsContent>

        {/* Paid Tab */}
        <TabsContent value="paid">
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="w-4 h-4" />
              <span className="font-medium">Action Required:</span>
              <span>Assign students to groups and mark as finished</span>
            </div>
          </div>
          {paidEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {paidEnrollments.map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.enrollment_id}
                  enrollment={enrollment}
                  onAssignGroup={() => openAssignGroupDialog(enrollment)}
                  onFinish={() => handleFinish(enrollment.enrollment_id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No paid enrollments" icon={DollarSign} />
          )}
        </TabsContent>

        {/* Finished Tab */}
        <TabsContent value="finished">
          {finishedEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {finishedEnrollments.map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.enrollment_id}
                  enrollment={enrollment}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message="No finished enrollments"
              icon={GraduationCap}
            />
          )}
        </TabsContent>

        {/* All Tab */}
        <TabsContent value="all">
          {filteredEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredEnrollments.map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.enrollment_id}
                  enrollment={enrollment}
                  onValidate={
                    enrollment.registration_status === "PENDING"
                      ? () => openPricingDialog(enrollment)
                      : undefined
                  }
                  onReject={
                    enrollment.registration_status === "PENDING"
                      ? () => openRejectDialog(enrollment)
                      : undefined
                  }
                  onMarkPaid={
                    enrollment.registration_status === "VALIDATED"
                      ? () => handleMarkPaid(enrollment.enrollment_id)
                      : undefined
                  }
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
            <EmptyState message="No enrollments found" icon={FileText} />
          )}
        </TabsContent>
      </Tabs>

      {/* Pricing Selection Modal */}
      <PricingSelectionModal
        open={pricingDialog}
        onClose={() => {
          setPricingDialog(false);
          setSelectedEnrollment(null);
        }}
        enrollment={selectedEnrollment}
        onConfirm={handleValidate}
        isLoading={validateEnrollment.isPending}
      />

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Enrollment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this enrollment. The student
              will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason (e.g., Incomplete documents, Invalid information, etc.)"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || rejectEnrollment.isPending}
            >
              {rejectEnrollment.isPending
                ? "Rejecting..."
                : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Group Dialog */}
      <Dialog open={assignGroupDialog} onOpenChange={setAssignGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Student to Group</DialogTitle>
            <DialogDescription>
              Select a group for {selectedEnrollment?.student?.first_name}{" "}
              {selectedEnrollment?.student?.last_name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Groups
            </label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
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
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignGroup}
              disabled={!selectedGroupId || addToGroup.isPending}
            >
              {addToGroup.isPending ? "Assigning..." : "Assign to Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ===============================================================
   ENROLLMENT CARD COMPONENT
=============================================================== */

interface EnrollmentCardProps {
  enrollment: Enrollment;
  onValidate?: () => void;
  onReject?: () => void;
  onMarkPaid?: () => void;
  onAssignGroup?: () => void;
  onFinish?: () => void;
}

function EnrollmentCard({
  enrollment,
  onValidate,
  onReject,
  onMarkPaid,
  onAssignGroup,
  onFinish,
}: EnrollmentCardProps) {
  // Status configuration
  const statusConfig = {
    PENDING: {
      color: "yellow",
      icon: Clock,
      label: "Pending Review",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-200",
    },
    VALIDATED: {
      color: "green",
      icon: CheckCircle,
      label: "Validated - Awaiting Payment",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
    },
    PAID: {
      color: "blue",
      icon: DollarSign,
      label: "Paid - Ready for Group",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
    },
    REJECTED: {
      color: "red",
      icon: XCircle,
      label: "Rejected",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200",
    },
    FINISHED: {
      color: "purple",
      icon: GraduationCap,
      label: "Finished",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
    },
  };

  const config =
    statusConfig[enrollment.registration_status as keyof typeof statusConfig] ||
    statusConfig.PENDING;
  const StatusIcon = config.icon;

  const studentName = enrollment.student
    ? `${enrollment.student.first_name} ${enrollment.student.last_name}`
    : "Unknown Student";

  const courseName = enrollment.course?.course_name || "Unknown Course";
  const courseCode = enrollment.course?.course_code;
  const groupName = enrollment.group?.name;

  const enrollmentDate = enrollment.enrollment_date
    ? new Date(enrollment.enrollment_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  // Document validation
  const REQUIRED_DOCUMENTS = [
    "PHOTO",
    "ID_CARD",
    "SCHOOL_CERTIFICATE",
    "PAYMENT_RECEIPT",
  ];

  const studentDocs = enrollment.student?.documents || [];

  const requiredDocsStatus = REQUIRED_DOCUMENTS.map((type) => {
    const doc = studentDocs.find((d: any) => d.type === type);
    return {
      type,
      exists: !!doc,
      approved: doc?.status === "APPROVED",
    };
  });

  const allRequiredDocsApproved = requiredDocsStatus.every((d) => d.approved);
  const missingDocs = requiredDocsStatus
    .filter((d) => !d.exists)
    .map((d) => d.type);
  const pendingDocs = requiredDocsStatus
    .filter((d) => d.exists && !d.approved)
    .map((d) => d.type);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Status Header */}
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
          <span className="text-xs text-gray-500">
            #{enrollment.enrollment_id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 space-y-4">
        {/* Student Info */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Student</p>
          <p className="text-base font-semibold text-gray-900">{studentName}</p>
          {enrollment.student?.email && (
            <p className="text-sm text-gray-600">{enrollment.student.email}</p>
          )}
        </div>

        {/* Course Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 mb-1">Course</p>
          <p className="text-sm font-semibold text-gray-900">{courseName}</p>
          {courseCode && (
            <p className="text-xs text-gray-600">Code: {courseCode}</p>
          )}
          {enrollment.level && (
            <p className="text-xs text-gray-600">Level: {enrollment.level}</p>
          )}
        </div>

        {/* Group Info */}
        {groupName && (
          <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-teal-600" />
              <p className="text-xs font-medium text-teal-700">
                Group Assigned
              </p>
            </div>
            <p className="text-sm font-semibold text-teal-900">{groupName}</p>
          </div>
        )}

        {/* Document Status */}
        {enrollment.registration_status === "PENDING" &&
          !allRequiredDocsApproved && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-800 mb-1">
                    ⚠️ Document Issues
                  </p>
                  {missingDocs.length > 0 && (
                    <p className="text-xs text-amber-700">
                      Missing: {missingDocs.join(", ")}
                    </p>
                  )}
                  {pendingDocs.length > 0 && (
                    <p className="text-xs text-amber-700">
                      Pending approval: {pendingDocs.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

        {enrollment.registration_status === "PENDING" &&
          allRequiredDocsApproved && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-xs font-medium text-green-700">
                  ✅ All required documents approved
                </p>
              </div>
            </div>
          )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Enrolled: {enrollmentDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          {onValidate && (
            <Button
              onClick={onValidate}
              className="w-full bg-green-600 hover:bg-green-700"
              size="sm"
              disabled={!allRequiredDocsApproved}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate & Create Fee
            </Button>
          )}

          {onReject && (
            <Button
              onClick={onReject}
              variant="destructive"
              className="w-full"
              size="sm"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          )}

          {onMarkPaid && (
            <Button
              onClick={onMarkPaid}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Confirm Payment
            </Button>
          )}

          {onFinish && (
            <Button
              onClick={onFinish}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Mark as Finished
            </Button>
          )}

          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to={`/admin/students/${enrollment.student_id}`}>
              <Eye className="w-4 h-4 mr-2" />
              View Student Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   STAT CARD COMPONENT
=============================================================== */

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  badge?: boolean;
}

function StatCard({ icon: Icon, label, value, color, badge }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    yellow: "bg-yellow-50 border-yellow-100 text-yellow-600",
    green: "bg-green-50 border-green-100 text-green-600",
    red: "bg-red-50 border-red-100 text-red-600",
    purple: "bg-purple-50 border-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm relative">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div
          className={`w-11 h-11 rounded-lg border flex items-center justify-center ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {badge && value > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">{value}</span>
        </div>
      )}
    </div>
  );
}

/* ===============================================================
   EMPTY STATE COMPONENT
=============================================================== */

interface EmptyStateProps {
  message: string;
  icon: React.ElementType;
}

function EmptyState({ message, icon: Icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{message}</h3>
      <p className="text-gray-600 text-sm">
        Try adjusting your filters or search criteria
      </p>
    </div>
  );
}
