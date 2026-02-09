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
import { Card, CardContent } from "../../../../components/ui/card";
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

/* ===============================================================
   TYPES & CONSTANTS
=============================================================== */

type FeeStatus = "PAID" | "UNPAID" | "OVERDUE";
type FilterStatus = "ALL" | FeeStatus;

const STATUS_CONFIG: Record<
  FeeStatus,
  { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  PAID: {
    label: "Paid",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
  },
  UNPAID: {
    label: "Unpaid",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: Clock,
  },
  OVERDUE: {
    label: "Overdue",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: AlertCircle,
  },
};

const PAYMENT_METHODS = [{ value: "CASH", label: "Cash", icon: "💵" }];

/* ===============================================================
   HELPER FUNCTIONS
=============================================================== */

const getFeeStatus = (fee: Fee): FeeStatus => {
  if (fee.status === "PAID" || fee.paid_at) return "PAID";
  if (fee.due_date && new Date(fee.due_date) < new Date()) return "OVERDUE";
  return "UNPAID";
};

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString("en-US")} DA`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/* ===============================================================
   DIALOG COMPONENT
=============================================================== */

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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </>
  );
};

/* ===============================================================
   CREATE FEE FORM
=============================================================== */

const CreateFeeForm = ({ onClose }: { onClose: () => void }) => {
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

  // Filter enrollments for selected student
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
      {/* Student Select */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Student <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStudentDropdown(!showStudentDropdown)}
            className="w-full h-11 flex items-center justify-between px-4 rounded-xl border-2 border-gray-300 bg-white text-sm font-medium hover:border-blue-400 transition-all"
          >
            <span
              className={
                selectedStudent
                  ? "text-gray-900 flex items-center gap-2"
                  : "text-gray-400 flex items-center gap-2"
              }
            >
              {selectedStudent ? (
                <>
                  <User className="w-4 h-4 text-blue-500" />
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  Select a student
                </>
              )}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${showStudentDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {showStudentDropdown && (
            <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <Input
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="h-9 text-sm"
                  autoFocus
                />
              </div>
              <ul className="max-h-48 overflow-y-auto py-1">
                {studentsLoading ? (
                  <li className="px-4 py-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
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
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-all ${
                          studentId === s.student_id
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {s.first_name} {s.last_name}
                          </p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-8 text-center text-sm text-gray-400">
                    No students found
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Select (optional) */}
      {studentId && studentEnrollments.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Enrollment{" "}
            <span className="text-xs font-normal text-gray-400">
              (optional)
            </span>
          </label>
          <select
            value={enrollmentId}
            onChange={(e) => setEnrollmentId(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border-2 border-gray-300 bg-white text-sm font-medium hover:border-blue-400 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            <option value="">No specific enrollment</option>
            {studentEnrollments.map((e: any) => (
              <option key={e.enrollment_id} value={e.enrollment_id}>
                {e.course?.course_name || e.enrollment_id.slice(0, 8)} —{" "}
                {e.status}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Amount & Due Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Amount (DZD) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <Input
              type="number"
              min={0}
              placeholder="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 h-11"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Due Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-11"
            required
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createFee.isPending || !studentId || !amount || !dueDate}
          className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 gap-2"
        >
          {createFee.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Create Fee
        </Button>
      </div>
    </form>
  );
};

/* ===============================================================
   MARK AS PAID FORM
=============================================================== */

const MarkPaidForm = ({ fee, onClose }: { fee: Fee; onClose: () => void }) => {
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
      {/* Fee Summary */}
      <div className="p-4 rounded-xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Student</p>
            <p className="font-semibold text-gray-900">
              {(fee as any).student?.first_name}{" "}
              {(fee as any).student?.last_name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Amount</p>
            <p className="text-2xl font-bold text-emerald-700">
              {formatCurrency(fee.amount)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Payment Method
        </label>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => setPaymentMethod(method.value)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                paymentMethod === method.value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-500/20"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              <span className="text-xl">{method.icon}</span>
              {method.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reference Code */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Reference Code{" "}
          <span className="text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Hash className="w-4 h-4 text-gray-400" />
          </div>
          <Input
            placeholder="e.g. REC-2026-001"
            value={referenceCode}
            onChange={(e) => setReferenceCode(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={markPaid.isPending}
          className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 gap-2"
        >
          {markPaid.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <BadgeCheck className="w-4 h-4" />
          )}
          Confirm Payment
        </Button>
      </div>
    </form>
  );
};

/* ===============================================================
   EDIT FEE FORM
=============================================================== */

const EditFeeForm = ({ fee, onClose }: { fee: Fee; onClose: () => void }) => {
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
        payload: {
          amount: Number(amount),
          due_date: dueDate,
        },
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Amount (DZD)
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 h-11"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Due Date
          </label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-11"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updateFee.isPending}
          className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2"
        >
          {updateFee.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Edit className="w-4 h-4" />
          )}
          Update Fee
        </Button>
      </div>
    </form>
  );
};

/* ===============================================================
   DELETE CONFIRM
=============================================================== */

const DeleteConfirm = ({ fee, onClose }: { fee: Fee; onClose: () => void }) => {
  const deleteFee = useDeleteFee();

  const handleDelete = async () => {
    try {
      await deleteFee.mutateAsync(fee.fee_id);
      onClose();
    } catch (err) {
      console.error("Delete fee error:", err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
        <div>
          <p className="font-semibold text-red-900">Delete this fee?</p>
          <p className="text-sm text-red-700 mt-1">
            Amount: <strong>{formatCurrency(fee.amount)}</strong> — This action
            cannot be undone.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          disabled={deleteFee.isPending}
          className="bg-red-600 hover:bg-red-700 gap-2"
        >
          {deleteFee.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Delete Fee
        </Button>
      </div>
    </div>
  );
};

/* ===============================================================
   FEE ROW
=============================================================== */

const FeeRow = ({
  fee,
  onMarkPaid,
  onEdit,
  onDelete,
}: {
  fee: Fee;
  onMarkPaid: (fee: Fee) => void;
  onEdit: (fee: Fee) => void;
  onDelete: (fee: Fee) => void;
}) => {
  const status = getFeeStatus(fee);
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  const student = (fee as any).student;
  const studentName = student
    ? `${student.first_name} ${student.last_name}`
    : "Unknown";

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-200">
      {/* Status Icon */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center border ${config.bg} shrink-0`}
      >
        <StatusIcon className={`w-5 h-5 ${config.color}`} />
      </div>

      {/* Student Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 truncate">{studentName}</p>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.color}`}
          >
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          {fee.due_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Due: {formatDate(fee.due_date)}
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
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Paid: {formatDate(fee.paid_at)}
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p
          className={`text-lg font-bold ${status === "PAID" ? "text-emerald-700" : status === "OVERDUE" ? "text-red-700" : "text-gray-900"}`}
        >
          {formatCurrency(fee.amount)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {status !== "PAID" && (
          <button
            onClick={() => onMarkPaid(fee)}
            className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
            title="Mark as Paid"
          >
            <BadgeCheck className="w-4 h-4" />
          </button>
        )}
        {status !== "PAID" && (
          <button
            onClick={() => onEdit(fee)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(fee)}
          className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ===============================================================
   MAIN PAGE
=============================================================== */

const FeesPage = () => {
  const { data: fees = [], isLoading } = useAdminFees();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");

  const [createOpen, setCreateOpen] = useState(false);
  const [markPaidFee, setMarkPaidFee] = useState<Fee | null>(null);
  const [editFee, setEditFee] = useState<Fee | null>(null);
  const [deleteFee, setDeleteFee] = useState<Fee | null>(null);

  // Stats
  const totalFees = fees.length;
  const paidFees = fees.filter((f) => getFeeStatus(f) === "PAID");
  const unpaidFees = fees.filter((f) => getFeeStatus(f) === "UNPAID");
  const overdueFees = fees.filter((f) => getFeeStatus(f) === "OVERDUE");
  const totalCollected = paidFees.reduce((sum, f) => sum + Number(f.amount), 0);
  const totalPending = [...unpaidFees, ...overdueFees].reduce(
    (sum, f) => sum + Number(f.amount),
    0,
  );

  // Filter & Search
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

  // Sort: OVERDUE first, then UNPAID, then PAID
  const sorted = [...filtered].sort((a, b) => {
    const order: Record<FeeStatus, number> = {
      OVERDUE: 0,
      UNPAID: 1,
      PAID: 2,
    };
    return order[getFeeStatus(a)] - order[getFeeStatus(b)];
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fees</h1>
            <p className="text-sm text-gray-500">
              Manage student payments and fees
            </p>
          </div>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New Fee
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-100 rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalFees}</p>
              <p className="text-xs text-gray-500">Total Fees</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">
                {formatCurrency(totalCollected)}
              </p>
              <p className="text-xs text-gray-500">
                Collected ({paidFees.length})
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">
                {formatCurrency(totalPending)}
              </p>
              <p className="text-xs text-gray-500">
                Pending ({unpaidFees.length})
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 rounded-2xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">
                {overdueFees.length}
              </p>
              <p className="text-xs text-gray-500">Overdue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="border border-gray-100 rounded-2xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by student name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              {(["ALL", "UNPAID", "OVERDUE", "PAID"] as FilterStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filterStatus === status
                        ? status === "ALL"
                          ? "bg-gray-900 text-white"
                          : status === "PAID"
                            ? "bg-emerald-600 text-white"
                            : status === "OVERDUE"
                              ? "bg-red-600 text-white"
                              : "bg-amber-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {status === "ALL" ? "All" : STATUS_CONFIG[status].label}
                  </button>
                ),
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee List */}
      <Card className="border border-gray-100 rounded-2xl shadow-sm">
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
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
              <Banknote className="w-16 h-16 mx-auto text-gray-200 mb-4" />
              <p className="font-semibold text-gray-500">
                {search || filterStatus !== "ALL"
                  ? "No matching fees found"
                  : "No fees created yet"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {search || filterStatus !== "ALL"
                  ? "Try different search or filter"
                  : 'Click "New Fee" to create one'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Fee"
      >
        <CreateFeeForm onClose={() => setCreateOpen(false)} />
      </Dialog>

      <Dialog
        open={!!markPaidFee}
        onClose={() => setMarkPaidFee(null)}
        title="Confirm Payment"
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
        title="Edit Fee"
      >
        {editFee && (
          <EditFeeForm fee={editFee} onClose={() => setEditFee(null)} />
        )}
      </Dialog>

      <Dialog
        open={!!deleteFee}
        onClose={() => setDeleteFee(null)}
        title="Delete Fee"
      >
        {deleteFee && (
          <DeleteConfirm fee={deleteFee} onClose={() => setDeleteFee(null)} />
        )}
      </Dialog>
    </div>
  );
};

export default FeesPage;
