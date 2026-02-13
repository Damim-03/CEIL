import { useState, type FormEvent } from "react";
import {
  DollarSign,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  X,
  User,
  Calendar,
  CreditCard,
  Receipt,
  Filter,
  BadgeCheck,
  ChevronDown,
  TrendingUp,
  Banknote,
  Hash,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  useAdminFees,
  useCreateFee,
  useUpdateFee,
  useMarkFeePaid,
  useDeleteFee,
  useAdminStudents,
  useAdminEnrollments,
} from "../../../../hooks/admin/useAdmin";
import type { Fee } from "../../../../types/Types";
import { useTranslation } from "react-i18next";

/* ── TYPES & CONSTANTS ── */

type FeeStatus = "PAID" | "UNPAID" | "OVERDUE";
type FilterStatus = "ALL" | FeeStatus;

const useStatusConfig = () => {
  const { t } = useTranslation();
  return {
    PAID: {
      label: t("admin.fees.paid"),
      color: "text-[#2B6F5E]",
      bg: "bg-[#8DB896]/12 border-[#8DB896]/30",
      icon: CheckCircle2,
    },
    UNPAID: {
      label: t("admin.fees.unpaid"),
      color: "text-[#C4A035]",
      bg: "bg-[#C4A035]/8 border-[#C4A035]/20",
      icon: Clock,
    },
    OVERDUE: {
      label: t("admin.fees.overdue"),
      color: "text-red-700",
      bg: "bg-red-50 border-red-200",
      icon: AlertCircle,
    },
  } as Record<
    FeeStatus,
    { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
  >;
};

const PAYMENT_METHODS = [{ value: "CASH", label: "cash", icon: "💵" }];

/* ── HELPERS ── */

const getFeeStatus = (fee: Fee): FeeStatus => {
  if (fee.status === "PAID" || fee.paid_at) return "PAID";
  if (fee.due_date && new Date(fee.due_date) < new Date()) return "OVERDUE";
  return "UNPAID";
};

const formatCurrency = (amount: number) =>
  `${amount.toLocaleString("en-US")} DA`;

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/* ── DIALOG ── */

const Dialog = ({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-[#D8CDC0]/60 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8CDC0]/30 bg-[#D8CDC0]/8">
            <h3 className="text-lg font-bold text-[#1B1B1B]">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#D8CDC0]/20 transition-colors"
            >
              <X className="w-4 h-4 text-[#BEB29E]" />
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </>
  );
};

/* ── CREATE FEE FORM ── */

const CreateFeeForm = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const createFee = useCreateFee();
  const { data: students = [], isLoading: studentsLoading } =
    useAdminStudents();
  const { data: enrollments = [], isLoading: enrollmentsLoading } =
    useAdminEnrollments();

  const [studentId, setStudentId] = useState("");
  const [enrollmentId, setEnrollmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const filteredStudents = students.filter((s) => {
    const full = `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase();
    return full.includes(studentSearch.toLowerCase());
  });

  const selectedStudent = students.find((s) => s.student_id === studentId);
  const studentEnrollments = enrollments.filter(
    (e: any) => e.student_id === studentId,
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!studentId || !amount || !dueDate) return;
    try {
      await createFee.mutateAsync({
        student_id: studentId,
        enrollment_id: enrollmentId || undefined,
        amount: Number(amount),
        due_date: dueDate,
      });
      onClose();
    } catch (err) {
      console.error("Create fee error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-[#1B1B1B] mb-2">
          {t("admin.fees.student")} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStudentDropdown(!showStudentDropdown)}
            className="w-full h-11 flex items-center justify-between px-4 rounded-xl border-2 border-[#D8CDC0]/60 bg-white text-sm font-medium hover:border-[#2B6F5E]/40 transition-all"
          >
            <span
              className={
                selectedStudent
                  ? "text-[#1B1B1B] flex items-center gap-2"
                  : "text-[#BEB29E] flex items-center gap-2"
              }
            >
              {selectedStudent ? (
                <>
                  <User className="w-4 h-4 text-[#2B6F5E]" />
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  {t("admin.fees.selectStudent")}
                </>
              )}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[#BEB29E] transition-transform ${showStudentDropdown ? "rotate-180" : ""}`}
            />
          </button>
          {showStudentDropdown && (
            <div className="absolute z-10 mt-2 w-full bg-white border-2 border-[#D8CDC0]/60 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-3 border-b border-[#D8CDC0]/30 bg-[#D8CDC0]/8">
                <Input
                  placeholder={t("admin.fees.searchStudents")}
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="h-9 text-sm border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20"
                  autoFocus
                />
              </div>
              <ul className="max-h-48 overflow-y-auto py-1">
                {studentsLoading ? (
                  <li className="px-4 py-4 flex items-center justify-center gap-2 text-xs text-[#BEB29E]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("common.loading")}
                  </li>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <li key={s.student_id}>
                      <button
                        type="button"
                        onClick={() => {
                          setStudentId(s.student_id);
                          setShowStudentDropdown(false);
                          setEnrollmentId("");
                        }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-all ${studentId === s.student_id ? "bg-[#2B6F5E]/5 text-[#2B6F5E] border-l-4 border-[#2B6F5E]" : "text-[#1B1B1B] hover:bg-[#D8CDC0]/10"}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#C4A035]/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-[#C4A035]" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {s.first_name} {s.last_name}
                          </p>
                          <p className="text-xs text-[#BEB29E]">{s.email}</p>
                        </div>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-8 text-center text-sm text-[#BEB29E]">
                    {t("admin.fees.noStudentsFound")}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {studentId && studentEnrollments.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-[#1B1B1B] mb-2">
            {t("admin.fees.enrollment")}{" "}
            <span className="text-xs font-normal text-[#BEB29E]">
              ({t("admin.fees.optional")})
            </span>
          </label>
          <select
            value={enrollmentId}
            onChange={(e) => setEnrollmentId(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border-2 border-[#D8CDC0]/60 bg-white text-sm font-medium hover:border-[#2B6F5E]/40 transition-all focus:outline-none focus:ring-4 focus:ring-[#2B6F5E]/20"
          >
            <option value="">{t("admin.fees.noSpecificEnrollment")}</option>
            {studentEnrollments.map((e: any) => (
              <option key={e.enrollment_id} value={e.enrollment_id}>
                {e.course?.course_name || e.enrollment_id.slice(0, 8)} —{" "}
                {e.status}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#1B1B1B] mb-2">
            {t("admin.fees.amountDZD")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <DollarSign className="w-4 h-4 text-[#BEB29E]" />
            </div>
            <Input
              type="number"
              min={0}
              placeholder="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 h-11 border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1B1B1B] mb-2">
            {t("admin.fees.dueDate")} <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-11 border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="text-[#6B5D4F]"
        >
          {t("admin.fees.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={createFee.isPending || !studentId || !amount || !dueDate}
          className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white gap-2"
        >
          {createFee.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}{" "}
          {t("admin.fees.createFee")}
        </Button>
      </div>
    </form>
  );
};

/* ── MARK PAID FORM ── */

const MarkPaidForm = ({ fee, onClose }: { fee: Fee; onClose: () => void }) => {
  const { t } = useTranslation();
  const markPaid = useMarkFeePaid();
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceCode, setReferenceCode] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await markPaid.mutateAsync({
        feeId: fee.fee_id,
        payload: {
          payment_method: paymentMethod,
          reference_code: referenceCode || undefined,
        },
      });
      onClose();
    } catch (err) {
      console.error("Mark paid error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-4 rounded-xl bg-[#2B6F5E]/5 border border-[#2B6F5E]/15">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#6B5D4F]">{t("admin.fees.student")}</p>
            <p className="font-semibold text-[#1B1B1B]">
              {(fee as any).student?.first_name}{" "}
              {(fee as any).student?.last_name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#6B5D4F]">{t("admin.fees.amount")}</p>
            <p className="text-2xl font-bold text-[#2B6F5E]">
              {formatCurrency(fee.amount)}
            </p>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#1B1B1B] mb-3">
          {t("admin.fees.paymentMethod")}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => setPaymentMethod(method.value)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-sm font-medium transition-all ${paymentMethod === method.value ? "border-[#2B6F5E] bg-[#2B6F5E]/5 text-[#2B6F5E] ring-4 ring-[#2B6F5E]/10" : "border-[#D8CDC0]/60 hover:border-[#D8CDC0] text-[#6B5D4F]"}`}
            >
              <span className="text-xl">{method.icon}</span>
              {t(`admin.fees.paymentMethods.${method.label}`)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#1B1B1B] mb-2">
          {t("admin.fees.referenceCode")}{" "}
          <span className="text-xs font-normal text-[#BEB29E]">
            ({t("admin.fees.optional")})
          </span>
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Hash className="w-4 h-4 text-[#BEB29E]" />
          </div>
          <Input
            placeholder={t("admin.fees.referenceCodePlaceholder")}
            value={referenceCode}
            onChange={(e) => setReferenceCode(e.target.value)}
            className="pl-10 h-11 border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="text-[#6B5D4F]"
        >
          {t("admin.fees.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={markPaid.isPending}
          className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white gap-2"
        >
          {markPaid.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <BadgeCheck className="w-4 h-4" />
          )}{" "}
          {t("admin.fees.confirmPayment")}
        </Button>
      </div>
    </form>
  );
};

/* ── EDIT FEE FORM ── */

const EditFeeForm = ({ fee, onClose }: { fee: Fee; onClose: () => void }) => {
  const { t } = useTranslation();
  const updateFee = useUpdateFee();
  const [amount, setAmount] = useState(String(fee.amount));
  const [dueDate, setDueDate] = useState(
    fee.due_date ? new Date(fee.due_date).toISOString().split("T")[0] : "",
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateFee.mutateAsync({
        feeId: fee.fee_id,
        payload: { amount: Number(amount), due_date: dueDate },
      });
      onClose();
    } catch (err) {
      console.error("Update fee error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#1B1B1B] mb-2">
            {t("admin.fees.amountDZD")}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <DollarSign className="w-4 h-4 text-[#BEB29E]" />
            </div>
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 h-11 border-[#D8CDC0]/60 focus:border-[#2B6F5E]"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1B1B1B] mb-2">
            {t("admin.fees.dueDate")}
          </label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-11 border-[#D8CDC0]/60 focus:border-[#2B6F5E]"
            required
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="text-[#6B5D4F]"
        >
          {t("admin.fees.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={updateFee.isPending}
          className="bg-[#C4A035] hover:bg-[#C4A035]/90 text-white gap-2"
        >
          {updateFee.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Edit className="w-4 h-4" />
          )}{" "}
          {t("admin.fees.updateFee")}
        </Button>
      </div>
    </form>
  );
};

/* ── DELETE CONFIRM ── */

const DeleteConfirm = ({ fee, onClose }: { fee: Fee; onClose: () => void }) => {
  const { t } = useTranslation();
  const deleteFee = useDeleteFee();
  const handleDelete = async () => {
    try {
      await deleteFee.mutateAsync(fee.fee_id);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
        <div>
          <p className="font-semibold text-red-900">
            {t("admin.fees.deleteThisFee")}
          </p>
          <p className="text-sm text-red-700 mt-1">
            {t("admin.fees.amount")}:{" "}
            <strong>{formatCurrency(fee.amount)}</strong> —{" "}
            {t("admin.fees.cannotUndo")}
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="text-[#6B5D4F]"
        >
          {t("admin.fees.cancel")}
        </Button>
        <Button
          onClick={handleDelete}
          disabled={deleteFee.isPending}
          className="bg-red-500 hover:bg-red-600 text-white gap-2"
        >
          {deleteFee.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}{" "}
          {t("admin.fees.deleteFee")}
        </Button>
      </div>
    </div>
  );
};

/* ── FEE ROW ── */

const FeeRow = ({
  fee,
  onMarkPaid,
  onEdit,
  onDelete,
}: {
  fee: Fee;
  onMarkPaid: (f: Fee) => void;
  onEdit: (f: Fee) => void;
  onDelete: (f: Fee) => void;
}) => {
  const { t } = useTranslation();
  const STATUS_CONFIG = useStatusConfig();
  const status = getFeeStatus(fee);
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;
  const student = (fee as any).student;
  const studentName = student
    ? `${student.first_name} ${student.last_name}`
    : t("admin.fees.unknown");

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-[#D8CDC0]/40 hover:border-[#D8CDC0]/60 hover:bg-[#D8CDC0]/5 transition-all duration-200">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center border ${config.bg} shrink-0`}
      >
        <StatusIcon className={`w-5 h-5 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-[#1B1B1B] truncate">{studentName}</p>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.color}`}
          >
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-[#BEB29E]">
          {fee.due_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {t("admin.fees.due")}: {formatDate(fee.due_date)}
            </span>
          )}
          {(fee as any).payment_method && (
            <span className="flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              {(fee as any).payment_method}
            </span>
          )}
          {fee.paid_at && (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#2B6F5E]" />
              {t("admin.fees.paidLabel")}: {formatDate(fee.paid_at)}
            </span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p
          className={`text-lg font-bold ${status === "PAID" ? "text-[#2B6F5E]" : status === "OVERDUE" ? "text-red-700" : "text-[#1B1B1B]"}`}
        >
          {formatCurrency(fee.amount)}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {status !== "PAID" && (
          <button
            onClick={() => onMarkPaid(fee)}
            className="p-2 rounded-lg hover:bg-[#8DB896]/15 text-[#2B6F5E] transition-colors"
            title={t("admin.fees.markAsPaid")}
          >
            <BadgeCheck className="w-4 h-4" />
          </button>
        )}
        {status !== "PAID" && (
          <button
            onClick={() => onEdit(fee)}
            className="p-2 rounded-lg hover:bg-[#C4A035]/10 text-[#C4A035] transition-colors"
            title={t("admin.fees.edit")}
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(fee)}
          className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
          title={t("admin.fees.delete")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ── MAIN PAGE ── */

const FeesPage = () => {
  const { t } = useTranslation();
  const STATUS_CONFIG = useStatusConfig();
  const { data: fees = [], isLoading } = useAdminFees();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [markPaidFee, setMarkPaidFee] = useState<Fee | null>(null);
  const [editFee, setEditFee] = useState<Fee | null>(null);
  const [deleteFee, setDeleteFee] = useState<Fee | null>(null);

  const totalFees = fees.length;
  const paidFees = fees.filter((f) => getFeeStatus(f) === "PAID");
  const unpaidFees = fees.filter((f) => getFeeStatus(f) === "UNPAID");
  const overdueFees = fees.filter((f) => getFeeStatus(f) === "OVERDUE");
  const totalCollected = paidFees.reduce((sum, f) => sum + Number(f.amount), 0);
  const totalPending = [...unpaidFees, ...overdueFees].reduce(
    (sum, f) => sum + Number(f.amount),
    0,
  );

  const filtered = fees.filter((fee) => {
    const status = getFeeStatus(fee);
    if (filterStatus !== "ALL" && status !== filterStatus) return false;
    if (search) {
      const student = (fee as any).student;
      const studentName = student
        ? `${student.first_name} ${student.last_name}`.toLowerCase()
        : "";
      const email = student?.email?.toLowerCase() || "";
      const s = search.toLowerCase();
      if (!studentName.includes(s) && !email.includes(s)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const order: Record<FeeStatus, number> = { OVERDUE: 0, UNPAID: 1, PAID: 2 };
    return order[getFeeStatus(a)] - order[getFeeStatus(b)];
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B1B1B]">
                {t("admin.fees.title")}
              </h1>
              <p className="text-sm text-[#BEB29E]">
                {t("admin.fees.subtitle")}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white gap-2 shadow-md shadow-[#2B6F5E]/20"
          >
            <Plus className="w-4 h-4" /> {t("admin.fees.newFee")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: t("admin.fees.totalFees"),
            value: String(totalFees),
            icon: Receipt,
            color: "teal" as const,
          },
          {
            label: `${t("admin.fees.collected")} (${paidFees.length})`,
            value: formatCurrency(totalCollected),
            icon: TrendingUp,
            color: "green" as const,
            valueColor: "text-[#2B6F5E]",
          },
          {
            label: `${t("admin.fees.pending")} (${unpaidFees.length})`,
            value: formatCurrency(totalPending),
            icon: Clock,
            color: "mustard" as const,
            valueColor: "text-[#C4A035]",
          },
          {
            label: t("admin.fees.overdue"),
            value: String(overdueFees.length),
            icon: AlertCircle,
            color: "red" as const,
            valueColor: "text-red-700",
          },
        ].map((stat) => {
          const colors = {
            teal: {
              bar: "from-[#2B6F5E] to-[#2B6F5E]/70",
              bg: "bg-[#2B6F5E]/8",
              icon: "text-[#2B6F5E]",
            },
            green: {
              bar: "from-[#8DB896] to-[#8DB896]/70",
              bg: "bg-[#8DB896]/12",
              icon: "text-[#3D7A4A]",
            },
            mustard: {
              bar: "from-[#C4A035] to-[#C4A035]/70",
              bg: "bg-[#C4A035]/8",
              icon: "text-[#C4A035]",
            },
            red: {
              bar: "from-red-500 to-red-500/70",
              bg: "bg-red-50",
              icon: "text-red-600",
            },
          };
          const c = colors[stat.color];
          return (
            <div
              key={stat.label}
              className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md transition-all"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${c.bar} opacity-60 group-hover:opacity-100 transition-opacity`}
              ></div>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <div>
                  <p
                    className={`text-xl font-bold ${"valueColor" in stat ? stat.valueColor : "text-[#1B1B1B]"}`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-[#6B5D4F]">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E]" />
            <Input
              placeholder={t("admin.fees.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#BEB29E]" />
            {(["ALL", "UNPAID", "OVERDUE", "PAID"] as FilterStatus[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === status
                      ? status === "ALL"
                        ? "bg-[#1B1B1B] text-white"
                        : status === "PAID"
                          ? "bg-[#2B6F5E] text-white"
                          : status === "OVERDUE"
                            ? "bg-red-600 text-white"
                            : "bg-[#C4A035] text-white"
                      : "bg-[#D8CDC0]/20 text-[#6B5D4F] hover:bg-[#D8CDC0]/30"
                  }`}
                >
                  {status === "ALL"
                    ? t("common.all")
                    : STATUS_CONFIG[status].label}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Fee List */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#2B6F5E]" />
          </div>
        ) : sorted.length > 0 ? (
          <div className="space-y-2">
            {sorted.map((fee) => (
              <FeeRow
                key={fee.fee_id}
                fee={fee}
                onMarkPaid={setMarkPaidFee}
                onEdit={setEditFee}
                onDelete={setDeleteFee}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Banknote className="w-16 h-16 mx-auto text-[#D8CDC0] mb-4" />
            <p className="font-semibold text-[#6B5D4F]">
              {search || filterStatus !== "ALL"
                ? t("admin.fees.noMatchingFees")
                : t("admin.fees.noFeesYet")}
            </p>
            <p className="text-sm text-[#BEB29E] mt-1">
              {search || filterStatus !== "ALL"
                ? t("admin.fees.tryDifferentSearch")
                : t("admin.fees.clickNewFee")}
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t("admin.fees.createNewFee")}
      >
        <CreateFeeForm onClose={() => setCreateOpen(false)} />
      </Dialog>
      <Dialog
        open={!!markPaidFee}
        onClose={() => setMarkPaidFee(null)}
        title={t("admin.fees.confirmPayment")}
      >
        {markPaidFee && (
          <MarkPaidForm
            fee={markPaidFee}
            onClose={() => setMarkPaidFee(null)}
          />
        )}
      </Dialog>
      <Dialog
        open={!!editFee}
        onClose={() => setEditFee(null)}
        title={t("admin.fees.editFee")}
      >
        {editFee && (
          <EditFeeForm fee={editFee} onClose={() => setEditFee(null)} />
        )}
      </Dialog>
      <Dialog
        open={!!deleteFee}
        onClose={() => setDeleteFee(null)}
        title={t("admin.fees.deleteFee")}
      >
        {deleteFee && (
          <DeleteConfirm fee={deleteFee} onClose={() => setDeleteFee(null)} />
        )}
      </Dialog>
    </div>
  );
};

export default FeesPage;
