import { useState, type FormEvent } from "react";
import {
  DollarSign,
  Search,
  Edit,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  X,
  Calendar,
  CreditCard,
  Receipt,
  Filter,
  BadgeCheck,
  Banknote,
  Hash,
  Info,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  useAdminFees,
  useUpdateFee,
  useMarkFeePaid,
} from "../../../../hooks/admin/useAdmin";
import type { Fee } from "../../../../types/Types";
import { useTranslation } from "react-i18next";

// ❌ REMOVED: useCreateFee, useDeleteFee — OWNER-only now
// ❌ REMOVED: Plus, Trash2, User, ChevronDown icons (used in create/delete)
// ❌ REMOVED: useAdminStudents, useAdminEnrollments (used in create form)

/* ── TYPES & CONSTANTS ── */

type FeeStatus = "UNPAID" | "OVERDUE";
type FilterStatus = "ALL" | FeeStatus;

// Admin only sees UNPAID fees — no PAID status needed
const useStatusConfig = () => {
  const { t } = useTranslation();
  return {
    UNPAID: {
      label: t("admin.fees.unpaid"),
      color: "text-[#C4A035] dark:text-[#D4A843]",
      bg: "bg-[#C4A035]/8 dark:bg-[#C4A035]/10 border-[#C4A035]/20 dark:border-[#C4A035]/15",
      icon: Clock,
    },
    OVERDUE: {
      label: t("admin.fees.overdue"),
      color: "text-red-700 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40",
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
        className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl dark:shadow-black/50 w-full max-w-lg border border-[#D8CDC0]/60 dark:border-[#2A2A2A] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A] bg-[#D8CDC0]/8 dark:bg-[#0F0F0F]">
            <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#D8CDC0]/20 dark:hover:bg-[#222222] transition-colors"
            >
              <X className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </>
  );
};

// ❌ REMOVED: CreateFeeForm — Fee creation is now OWNER-only

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
      <div className="p-4 rounded-xl bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border border-[#2B6F5E]/15 dark:border-[#4ADE80]/15">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
              {t("admin.fees.student")}
            </p>
            <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {(fee as any).student?.first_name}{" "}
              {(fee as any).student?.last_name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
              {t("admin.fees.amount")}
            </p>
            <p className="text-2xl font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
              {formatCurrency(fee.amount)}
            </p>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-3">
          {t("admin.fees.paymentMethod")}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => setPaymentMethod(method.value)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-sm font-medium transition-all ${paymentMethod === method.value ? "border-[#2B6F5E] dark:border-[#4ADE80] bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 text-[#2B6F5E] dark:text-[#4ADE80] ring-4 ring-[#2B6F5E]/10 dark:ring-[#4ADE80]/10" : "border-[#D8CDC0]/60 dark:border-[#2A2A2A] hover:border-[#D8CDC0] dark:hover:border-[#555555] text-[#6B5D4F] dark:text-[#AAAAAA]"}`}
            >
              <span className="text-xl">{method.icon}</span>
              {t(`admin.fees.paymentMethods.${method.label}`)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
          {t("admin.fees.referenceCode")}{" "}
          <span className="text-xs font-normal text-[#BEB29E] dark:text-[#666666]">
            ({t("admin.fees.optional")})
          </span>
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Hash className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
          </div>
          <Input
            placeholder={t("admin.fees.referenceCodePlaceholder")}
            value={referenceCode}
            onChange={(e) => setReferenceCode(e.target.value)}
            className="pl-10 h-11 border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/20"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="text-[#6B5D4F] dark:text-[#AAAAAA] dark:hover:bg-[#222222]"
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
          <label className="block text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
            {t("admin.fees.amountDZD")}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <DollarSign className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
            </div>
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 h-11 border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/20"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
            {t("admin.fees.dueDate")}
          </label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-11 border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/20"
            required
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="text-[#6B5D4F] dark:text-[#AAAAAA] dark:hover:bg-[#222222]"
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

// ❌ REMOVED: DeleteConfirm — Fee deletion is now OWNER-only

/* ── FEE ROW ── */

const FeeRow = ({
  fee,
  onMarkPaid,
  onEdit,
}: {
  fee: Fee;
  onMarkPaid: (f: Fee) => void;
  onEdit: (f: Fee) => void;
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
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] hover:border-[#D8CDC0]/60 dark:hover:border-[#555555]/30 hover:bg-[#D8CDC0]/5 dark:hover:bg-[#222222] transition-all duration-200">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center border ${config.bg} shrink-0`}
      >
        <StatusIcon className={`w-5 h-5 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
            {studentName}
          </p>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.color}`}
          >
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-[#BEB29E] dark:text-[#666666]">
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
        </div>
      </div>
      <div className="text-right shrink-0">
        <p
          className={`text-lg font-bold ${status === "OVERDUE" ? "text-red-700 dark:text-red-400" : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
        >
          {formatCurrency(fee.amount)}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onMarkPaid(fee)}
          className="p-2 rounded-lg hover:bg-[#8DB896]/15 dark:hover:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80] transition-colors"
          title={t("admin.fees.markAsPaid")}
        >
          <BadgeCheck className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(fee)}
          className="p-2 rounded-lg hover:bg-[#C4A035]/10 dark:hover:bg-[#C4A035]/10 text-[#C4A035] dark:text-[#D4A843] transition-colors"
          title={t("admin.fees.edit")}
        >
          <Edit className="w-4 h-4" />
        </button>
        {/* ❌ REMOVED: Delete button — OWNER-only */}
      </div>
    </div>
  );
};

/* ── MAIN PAGE ── */

const FeesPage = () => {
  const { t } = useTranslation();
  const STATUS_CONFIG = useStatusConfig();

  // ✅ UPDATED: useAdminFees now returns paginated { data, meta }
  // Admin only sees UNPAID fees from the backend
  const { data: feesResponse, isLoading } = useAdminFees();
  const fees = feesResponse?.data ?? [];
  const meta = feesResponse?.meta;

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [markPaidFee, setMarkPaidFee] = useState<Fee | null>(null);
  const [editFee, setEditFee] = useState<Fee | null>(null);

  // ❌ REMOVED: createOpen, deleteFee states

  const totalFees = meta?.total ?? fees.length;
  const unpaidFees = fees.filter((f) => getFeeStatus(f) === "UNPAID");
  const overdueFees = fees.filter((f) => getFeeStatus(f) === "OVERDUE");
  const totalPending = fees.reduce((sum, f) => sum + Number(f.amount), 0);

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
    const order: Record<FeeStatus, number> = { OVERDUE: 0, UNPAID: 1 };
    return order[getFeeStatus(a)] - order[getFeeStatus(b)];
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20 dark:shadow-[#2B6F5E]/10">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("admin.fees.title")}
              </h1>
              <p className="text-sm text-[#BEB29E] dark:text-[#666666]">
                {t("admin.fees.subtitle")}
              </p>
            </div>
          </div>
          {/* ❌ REMOVED: "New Fee" button — OWNER-only */}
        </div>
      </div>

      {/* Info Banner — Admin restricted view */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-[#C4A035]/5 dark:bg-[#C4A035]/10 border border-[#C4A035]/20 dark:border-[#C4A035]/15">
        <Info className="w-5 h-5 text-[#C4A035] dark:text-[#D4A843] shrink-0" />
        <p className="text-sm text-[#6B5D4F] dark:text-[#AAAAAA]">
          {t("admin.fees.unpaidOnlyNotice", {
            defaultValue:
              "You can view and process unpaid fees. Fee creation, deletion, and paid fee history are managed by the system owner.",
          })}
        </p>
      </div>

      {/* Stats — Only unpaid-related stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: t("admin.fees.totalUnpaid"),
            value: String(totalFees),
            icon: Receipt,
            color: "teal" as const,
          },
          {
            label: `${t("admin.fees.pending")} (${unpaidFees.length})`,
            value: formatCurrency(totalPending),
            icon: Clock,
            color: "mustard" as const,
            valueColor: "text-[#C4A035] dark:text-[#D4A843]",
          },
          {
            label: t("admin.fees.overdue"),
            value: String(overdueFees.length),
            icon: AlertCircle,
            color: "red" as const,
            valueColor: "text-red-700 dark:text-red-400",
          },
        ].map((stat) => {
          const colors = {
            teal: {
              bar: "from-[#2B6F5E] to-[#2B6F5E]/70",
              bg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10",
              icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
            },
            mustard: {
              bar: "from-[#C4A035] to-[#C4A035]/70",
              bg: "bg-[#C4A035]/8 dark:bg-[#D4A843]/10",
              icon: "text-[#C4A035] dark:text-[#D4A843]",
            },
            red: {
              bar: "from-red-500 to-red-500/70",
              bg: "bg-red-50 dark:bg-red-950/30",
              icon: "text-red-600 dark:text-red-400",
            },
          };
          const c = colors[stat.color];
          return (
            <div
              key={stat.label}
              className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-5 overflow-hidden group hover:shadow-md dark:hover:shadow-black/20 transition-all"
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
                    className={`text-xl font-bold ${"valueColor" in stat ? stat.valueColor : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-[#6B5D4F] dark:text-[#888888]">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filters — No PAID filter (admin can't see paid) */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
            <Input
              placeholder={t("admin.fees.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
            {(["ALL", "UNPAID", "OVERDUE"] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === status
                    ? status === "ALL"
                      ? "bg-[#1B1B1B] dark:bg-[#E5E5E5] text-white dark:text-[#1A1A1A]"
                      : status === "OVERDUE"
                        ? "bg-red-600 text-white"
                        : "bg-[#C4A035] text-white"
                    : "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/30 dark:hover:bg-[#333333]"
                }`}
              >
                {status === "ALL"
                  ? t("common.all")
                  : STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fee List */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#2B6F5E] dark:text-[#4ADE80]" />
          </div>
        ) : sorted.length > 0 ? (
          <div className="space-y-2">
            {sorted.map((fee) => (
              <FeeRow
                key={fee.fee_id}
                fee={fee}
                onMarkPaid={setMarkPaidFee}
                onEdit={setEditFee}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Banknote className="w-16 h-16 mx-auto text-[#D8CDC0] dark:text-[#555555] mb-4" />
            <p className="font-semibold text-[#6B5D4F] dark:text-[#AAAAAA]">
              {search || filterStatus !== "ALL"
                ? t("admin.fees.noMatchingFees")
                : t("admin.fees.noUnpaidFees", {
                    defaultValue: "No unpaid fees at the moment",
                  })}
            </p>
            <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-1">
              {search || filterStatus !== "ALL"
                ? t("admin.fees.tryDifferentSearch")
                : t("admin.fees.allFeesCollected", {
                    defaultValue: "All student fees have been collected",
                  })}
            </p>
          </div>
        )}
      </div>

      {/* ❌ REMOVED: Create Fee Dialog */}

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

      {/* ❌ REMOVED: Delete Fee Dialog */}
    </div>
  );
};

export default FeesPage;
