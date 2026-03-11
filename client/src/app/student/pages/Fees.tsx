import {
  DollarSign,
  CheckCircle,
  Calendar,
  AlertCircle,
  CreditCard,
  FileText,
  Banknote,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import PageLoader from "../../../components/PageLoader";
import { useStudentFees } from "../../../hooks/student/Usestudent";

export default function Fees() {
  const { data, isLoading, isError, error } = useStudentFees();

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-950/20 border border-red-800/30 flex items-center justify-center mb-5">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-red-400 mb-1">
          Failed to load fees
        </h3>
        <p className="text-sm text-[#9B8E82] dark:text-[#666666] text-center max-w-xs mb-5">
          {error instanceof Error ? error.message : "Something went wrong"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-[#C4A035] hover:bg-[#C4A035]/90 text-white text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const fees = data?.fees || [];
  const summary = data?.summary || {
    total: 0,
    paid: 0,
    remaining: 0,
    is_fully_paid: true,
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} DA`;

  const isOverdue = (dueDate: string, status: string) => {
    if (status === "PAID") return false;
    return new Date(dueDate) < new Date();
  };

  const paidPercent =
    summary.total > 0 ? Math.round((summary.paid / summary.total) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="relative bg-white dark:bg-[#111111] rounded-2xl border border-[#E8DDD4]/70 dark:border-[#1E1E1E] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C4A035]/50 to-transparent" />
        <div className="p-6 flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#a07a20] flex items-center justify-center shadow-lg shadow-[#C4A035]/25 dark:shadow-[#C4A035]/10">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#2B6F5E] border-2 border-white dark:border-[#111111]" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-[#1B1B1B] dark:text-[#E8E8E8]">
              My Fees
            </h1>
            <p className="text-sm text-[#9B8E82] dark:text-[#555555] mt-0.5">
              Manage your registration and course fees
            </p>
          </div>
          {/* compact progress pill */}
          {summary.total > 0 && (
            <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs text-[#9B8E82] dark:text-[#555555] font-medium">
                {paidPercent}% paid
              </span>
              <div className="w-28 h-1.5 rounded-full bg-[#E8DDD4]/60 dark:bg-[#1E1E1E] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2B6F5E] to-[#C4A035] transition-all duration-700"
                  style={{ width: `${paidPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total */}
        <div className="bg-white dark:bg-[#111111] border border-[#E8DDD4]/70 dark:border-[#1E1E1E] rounded-2xl p-5 hover:border-[#2B6F5E]/25 dark:hover:border-[#2B6F5E]/25 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-[#2B6F5E]/8 dark:bg-[#2B6F5E]/10 flex items-center justify-center mb-3">
            <Banknote className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
          </div>
          <p className="text-xs text-[#9B8E82] dark:text-[#555555] font-medium mb-1">
            Total Fees
          </p>
          <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E8E8E8] tabular-nums">
            {formatCurrency(summary.total)}
          </p>
        </div>

        {/* Paid */}
        <div className="bg-[#2B6F5E]/[0.04] dark:bg-[#2B6F5E]/[0.06] border border-[#2B6F5E]/15 dark:border-[#2B6F5E]/20 rounded-2xl p-5 hover:border-[#2B6F5E]/30 dark:hover:border-[#4ADE80]/25 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 flex items-center justify-center mb-3">
            <CheckCircle className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
          </div>
          <p className="text-xs text-[#2B6F5E]/60 dark:text-[#4ADE80]/50 font-medium mb-1">
            Paid
          </p>
          <p className="text-2xl font-bold text-[#2B6F5E] dark:text-[#4ADE80] tabular-nums">
            {formatCurrency(summary.paid)}
          </p>
        </div>

        {/* Outstanding */}
        <div
          className={`rounded-2xl p-5 border transition-colors ${
            summary.remaining > 0
              ? "bg-red-50/60 dark:bg-red-950/10 border-red-200/60 dark:border-red-900/25 hover:border-red-300/60 dark:hover:border-red-800/40"
              : "bg-white dark:bg-[#111111] border-[#E8DDD4]/70 dark:border-[#1E1E1E]"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              summary.remaining > 0
                ? "bg-red-100/80 dark:bg-red-950/30"
                : "bg-[#E8DDD4]/40 dark:bg-[#1E1E1E]"
            }`}
          >
            <CreditCard
              className={`w-4 h-4 ${
                summary.remaining > 0
                  ? "text-red-500 dark:text-red-400"
                  : "text-[#9B8E82] dark:text-[#444444]"
              }`}
            />
          </div>
          <p
            className={`text-xs font-medium mb-1 ${
              summary.remaining > 0
                ? "text-red-400 dark:text-red-500/70"
                : "text-[#9B8E82] dark:text-[#555555]"
            }`}
          >
            Outstanding
          </p>
          <p
            className={`text-2xl font-bold tabular-nums ${
              summary.remaining > 0
                ? "text-red-600 dark:text-red-400"
                : "text-[#1B1B1B] dark:text-[#E8E8E8]"
            }`}
          >
            {formatCurrency(summary.remaining)}
          </p>
        </div>
      </div>

      {/* ── Status banner ── */}
      <div
        className={`rounded-2xl border px-5 py-4 flex items-center gap-3.5 ${
          summary.is_fully_paid
            ? "bg-[#2B6F5E]/[0.04] dark:bg-[#4ADE80]/[0.04] border-[#2B6F5E]/15 dark:border-[#4ADE80]/15"
            : "bg-[#C4A035]/[0.04] dark:bg-[#D4A843]/[0.03] border-[#C4A035]/20 dark:border-[#D4A843]/15"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            summary.is_fully_paid
              ? "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10"
              : "bg-[#C4A035]/10 dark:bg-[#D4A843]/10"
          }`}
        >
          {summary.is_fully_paid ? (
            <CheckCircle className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#C4A035] dark:text-[#D4A843]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E8E8E8]">
            {summary.is_fully_paid ? "All Paid!" : "Payment Required"}
          </p>
          <p className="text-xs text-[#9B8E82] dark:text-[#555555] mt-0.5">
            {summary.is_fully_paid
              ? "You have no outstanding fees. Great job!"
              : `You have ${formatCurrency(summary.remaining)} in outstanding fees`}
          </p>
        </div>
        <span
          className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full ${
            summary.is_fully_paid
              ? "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]"
              : "bg-[#C4A035]/10 dark:bg-[#D4A843]/10 text-[#C4A035] dark:text-[#D4A843]"
          }`}
        >
          {summary.is_fully_paid ? "✓ Clear" : `${paidPercent}%`}
        </span>
      </div>

      {/* ── Fees list ── */}
      <div className="space-y-3">
        {fees.length > 0 ? (
          fees.map((fee: any) => {
            const overdue = isOverdue(fee.due_date, fee.status);
            const isPaid = fee.status === "PAID";

            const statusColor = isPaid
              ? {
                  iconBg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8",
                  iconColor: "text-[#2B6F5E] dark:text-[#4ADE80]",
                  badge:
                    "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]",
                }
              : overdue
                ? {
                    iconBg: "bg-red-100/80 dark:bg-red-950/30",
                    iconColor: "text-red-500 dark:text-red-400",
                    badge:
                      "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400",
                  }
                : {
                    iconBg: "bg-[#C4A035]/8 dark:bg-[#D4A843]/8",
                    iconColor: "text-[#C4A035] dark:text-[#D4A843]",
                    badge:
                      "bg-[#C4A035]/8 dark:bg-[#D4A843]/10 text-[#C4A035] dark:text-[#D4A843]",
                  };

            return (
              <div
                key={fee.fee_id}
                className="bg-white dark:bg-[#111111] border border-[#E8DDD4]/70 dark:border-[#1E1E1E] rounded-2xl overflow-hidden hover:border-[#D8CDC0]/80 dark:hover:border-[#2A2A2A] transition-colors"
              >
                {/* top accent line for unpaid */}
                {!isPaid && (
                  <div
                    className={`h-0.5 ${
                      overdue
                        ? "bg-gradient-to-r from-red-500 to-red-400"
                        : "bg-gradient-to-r from-[#C4A035] to-[#D4A843]"
                    }`}
                  />
                )}

                <div className="p-5">
                  {/* fee header row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${statusColor.iconBg}`}
                      >
                        <DollarSign
                          className={`w-5 h-5 ${statusColor.iconColor}`}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E8E8E8]">
                          Registration Fee
                        </h3>
                        {fee.enrollment?.course && (
                          <p className="text-xs text-[#9B8E82] dark:text-[#555555] mt-0.5">
                            {fee.enrollment.course.course_name}
                            {fee.enrollment.level &&
                              ` · ${fee.enrollment.level}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide ${statusColor.badge}`}
                    >
                      {isPaid ? "PAID" : overdue ? "OVERDUE" : "PENDING"}
                    </span>
                  </div>

                  {/* detail grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-[#F8F4F0]/60 dark:bg-[#0D0D0D] rounded-xl mb-3">
                    <div>
                      <p className="text-[10px] text-[#9B8E82] dark:text-[#444444] font-medium uppercase tracking-wider mb-1">
                        Amount
                      </p>
                      <p className="text-base font-bold text-[#1B1B1B] dark:text-[#E8E8E8] tabular-nums">
                        {formatCurrency(fee.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#9B8E82] dark:text-[#444444] font-medium uppercase tracking-wider mb-1">
                        Due Date
                      </p>
                      <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E8E8E8] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#9B8E82] dark:text-[#444444]" />
                        {formatDate(fee.due_date)}
                      </p>
                    </div>
                    {isPaid && (
                      <>
                        <div>
                          <p className="text-[10px] text-[#9B8E82] dark:text-[#444444] font-medium uppercase tracking-wider mb-1">
                            Paid On
                          </p>
                          <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E8E8E8]">
                            {formatDate(fee.paid_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#9B8E82] dark:text-[#444444] font-medium uppercase tracking-wider mb-1">
                            Reference
                          </p>
                          <p className="text-xs font-mono text-[#1B1B1B] dark:text-[#E8E8E8] bg-[#E8DDD4]/50 dark:bg-[#1E1E1E] px-2 py-1 rounded-lg truncate">
                            {fee.reference_code}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* payment method */}
                  {isPaid && fee.payment_method && (
                    <div className="flex items-center gap-2 mb-3 px-3 py-2.5 bg-[#2B6F5E]/[0.04] dark:bg-[#4ADE80]/[0.04] border border-[#2B6F5E]/12 dark:border-[#4ADE80]/12 rounded-xl">
                      <CreditCard className="w-3.5 h-3.5 text-[#2B6F5E] dark:text-[#4ADE80] shrink-0" />
                      <span className="text-xs text-[#2B6F5E] dark:text-[#4ADE80]">
                        Paid via <strong>{fee.payment_method}</strong>
                      </span>
                    </div>
                  )}

                  {/* receipt button */}
                  {isPaid && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-[#E8DDD4]/70 dark:border-[#1E1E1E] text-[#6B5D4F] dark:text-[#666666] hover:border-[#C4A035]/40 dark:hover:border-[#D4A843]/30 hover:text-[#C4A035] dark:hover:text-[#D4A843] rounded-xl transition-colors text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 mr-2" />
                      Download Receipt
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white dark:bg-[#111111] border border-[#E8DDD4]/70 dark:border-[#1E1E1E] rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#F0EBE5] dark:bg-[#1E1E1E] flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-[#BEB29E] dark:text-[#444444]" />
            </div>
            <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E8E8E8]">
              No Fees Yet
            </p>
            <p className="text-xs text-[#9B8E82] dark:text-[#555555] mt-1 max-w-xs mx-auto">
              Your fees will appear here once you enroll in a course
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
