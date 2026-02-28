/* ===============================================================
   OwnerFeeAnalytics.tsx
   
   📁 src/app/owner/pages/FeeAnalytics/OwnerFeeAnalytics.tsx
   
   🔒 Owner-exclusive: Fee analytics page
   ✅ Daily / Monthly / Yearly views
   ✅ Who paid, when, who confirmed
   ✅ Who hasn't paid, when due
   ✅ Revenue charts & breakdowns
   ✅ Dark mode · i18n (AR / EN / FR)
=============================================================== */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  ShieldCheck,
  BarChart3,
  CreditCard,
  Banknote,
  Eye,
} from "lucide-react";
import PageLoader from "../../../components/PageLoader";
import { useOwnerFeeAnalytics } from "../../../hooks/owner/Useowner.hooks";

/* ═══ Helpers ═══ */
const formatCurrency = (n: number) => `${Number(n).toLocaleString("en-US")} DA`;
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const formatDateTime = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function OwnerFeeAnalytics() {
  const { t } = useTranslation();

  // ── State ──
  const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">(
    "monthly",
  );
  const [dailyDate, setDailyDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [yearDate, setYearDate] = useState(() =>
    String(new Date().getFullYear()),
  );
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"paid" | "unpaid">("paid");

  // ── Date for API ──
  const apiDate = useMemo(() => {
    if (period === "daily") return dailyDate;
    if (period === "yearly") return yearDate;
    return monthDate;
  }, [period, dailyDate, monthDate, yearDate]);

  // ── Fetch ──
  const { data, isLoading, isError } = useOwnerFeeAnalytics({
    period,
    date: apiDate,
    page,
    limit: 15,
  });

  // ── Display label ──
  // ── Display label ──
  const periodLabel = data?.period_label;
  const displayLabel = useMemo(() => {
    if (periodLabel) return periodLabel;
    return apiDate;
  }, [periodLabel, apiDate]);

  // ── Navigation ──
  const navigateDate = (dir: -1 | 1) => {
    if (period === "daily") {
      const d = new Date(dailyDate);
      d.setDate(d.getDate() + dir);
      setDailyDate(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      );
    } else if (period === "monthly") {
      const d = new Date(monthDate + "-01");
      d.setMonth(d.getMonth() + dir);
      setMonthDate(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      );
    } else {
      setYearDate(String(parseInt(yearDate) + dir));
    }
    setPage(1);
  };

  const summary = data?.summary;
  const overall = data?.overall;
  const paidFees = data?.paid_fees ?? [];
  const unpaidFees = data?.unpaid_fees ?? [];
  const dailyBreakdown = data?.daily_breakdown ?? [];
  const monthlyBreakdown = data?.monthly_breakdown ?? [];
  const pagination = data?.pagination;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#2B6F5E]"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-lg shadow-[#C4A035]/20 dark:shadow-[#C4A035]/10">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {t("owner.feeAnalytics.title", "Fee Analytics")}
                </h1>
                <span className="px-2 py-0.5 bg-[#C4A035]/15 dark:bg-[#C4A035]/20 text-[#9A7D2A] dark:text-[#D4A843] text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {t("owner.feeAnalytics.ownerBadge", "Owner")}
                </span>
              </div>
              <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-0.5">
                {t(
                  "owner.feeAnalytics.subtitle",
                  "Track payments, revenue, and outstanding fees",
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ PERIOD SELECTOR + DATE NAV ═══════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Period Tabs */}
        <div className="flex gap-1 p-1 bg-[#D8CDC0]/20 dark:bg-[#151515] rounded-xl">
          {(["daily", "monthly", "yearly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                setPage(1);
              }}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? "bg-white dark:bg-[#1A1A1A] text-[#C4A035] dark:text-[#D4A843] shadow-sm dark:shadow-black/20"
                  : "text-[#6B5D4F] dark:text-[#666666] hover:text-[#1B1B1B] dark:hover:text-[#AAAAAA]"
              }`}
            >
              {t(
                `owner.feeAnalytics.${p}`,
                p.charAt(0).toUpperCase() + p.slice(1),
              )}
            </button>
          ))}
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/60 dark:border-[#2A2A2A] rounded-xl px-2 py-1.5">
          <button
            onClick={() => navigateDate(-1)}
            className="p-1.5 rounded-lg hover:bg-[#D8CDC0]/15 dark:hover:bg-[#222222] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[#6B5D4F] dark:text-[#888888]" />
          </button>
          <div className="flex items-center gap-2 px-3">
            <Calendar className="w-4 h-4 text-[#C4A035]" />
            <span className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] min-w-[120px] text-center">
              {displayLabel}
            </span>
          </div>
          <button
            onClick={() => navigateDate(1)}
            className="p-1.5 rounded-lg hover:bg-[#D8CDC0]/15 dark:hover:bg-[#222222] transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-[#6B5D4F] dark:text-[#888888]" />
          </button>
          {period === "daily" && (
            <input
              type="date"
              value={dailyDate}
              onChange={(e) => {
                setDailyDate(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-[#D8CDC0]/40 dark:border-[#2A2A2A] rounded-lg px-2 py-1.5 bg-transparent text-[#1B1B1B] dark:text-[#E5E5E5] dark:[color-scheme:dark] w-[140px]"
            />
          )}
          {period === "monthly" && (
            <input
              type="month"
              value={monthDate}
              onChange={(e) => {
                setMonthDate(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-[#D8CDC0]/40 dark:border-[#2A2A2A] rounded-lg px-2 py-1.5 bg-transparent text-[#1B1B1B] dark:text-[#E5E5E5] dark:[color-scheme:dark] w-[140px]"
            />
          )}
          {period === "yearly" && (
            <select
              value={yearDate}
              onChange={(e) => {
                setYearDate(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-[#D8CDC0]/40 dark:border-[#2A2A2A] rounded-lg px-2 py-1.5 bg-transparent text-[#1B1B1B] dark:text-[#E5E5E5] dark:bg-[#1A1A1A] w-[90px]"
            >
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - 2 + i,
              ).map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ═══════════ SUMMARY CARDS ═══════════ */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={CheckCircle}
            label={t("owner.feeAnalytics.paidPeriod", "Paid (Period)")}
            value={formatCurrency(summary.paid_total)}
            sub={`${summary.paid_count} ${t("owner.feeAnalytics.payments", "payments")}`}
            variant="green"
          />
          <SummaryCard
            icon={XCircle}
            label={t("owner.feeAnalytics.unpaidPeriod", "Unpaid (Period)")}
            value={formatCurrency(summary.unpaid_total)}
            sub={`${summary.unpaid_count} ${t("owner.feeAnalytics.pending", "pending")}`}
            variant="red"
          />
          <SummaryCard
            icon={TrendingUp}
            label={t("owner.feeAnalytics.totalPeriod", "Total (Period)")}
            value={formatCurrency(summary.total_amount)}
            sub={`${summary.total_count} ${t("owner.feeAnalytics.fees", "fees")}`}
            variant="mustard"
          />
          <SummaryCard
            icon={Banknote}
            label={t("owner.feeAnalytics.allTime", "All Time Revenue")}
            value={formatCurrency(overall?.paid_total ?? 0)}
            sub={`${overall?.paid_count ?? 0} ${t("owner.feeAnalytics.totalPayments", "total payments")}`}
            variant="teal"
          />
        </div>
      )}

      {/* ═══════════ CHART — Daily/Monthly Breakdown ═══════════ */}
      {(dailyBreakdown.length > 0 || monthlyBreakdown.length > 0) && (
        <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#8DB896]"></div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-md shadow-[#2B6F5E]/20 dark:shadow-[#2B6F5E]/10">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {period === "yearly"
                ? t("owner.feeAnalytics.monthlyBreakdown", "Monthly Breakdown")
                : t("owner.feeAnalytics.dailyBreakdown", "Daily Breakdown")}
            </h3>
          </div>

          {/* Simple bar chart */}
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1.5 min-w-[500px] h-[180px] pt-4">
              {(period === "yearly" ? monthlyBreakdown : dailyBreakdown).map(
                (item: any, idx: number) => {
                  const items =
                    period === "yearly" ? monthlyBreakdown : dailyBreakdown;
                  const maxVal = Math.max(
                    ...items.map((i: any) => i.paid_total || i.total || 0),
                    1,
                  );
                  const val = item.paid_total || item.total || 0;
                  const height = Math.max((val / maxVal) * 150, 4);
                  const label =
                    period === "yearly"
                      ? MONTHS_SHORT[item.month - 1]
                      : new Date(item.date).getDate();
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1 flex-1 min-w-[28px]"
                      title={`${formatCurrency(val)} · ${item.paid_count || item.count || 0} ${t("owner.feeAnalytics.payments", "payments")}`}
                    >
                      <span className="text-[9px] font-medium text-[#6B5D4F] dark:text-[#888888]">
                        {val > 0
                          ? val >= 1000
                            ? `${(val / 1000).toFixed(0)}k`
                            : val
                          : ""}
                      </span>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-[#2B6F5E] to-[#8DB896] dark:from-[#2B6F5E] dark:to-[#4ADE80]/60 transition-all duration-300 hover:opacity-80"
                        style={{ height: `${height}px` }}
                      />
                      <span className="text-[10px] font-medium text-[#BEB29E] dark:text-[#666666]">
                        {label}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ PAID / UNPAID TABS ═══════════ */}
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/60"></div>

        {/* Tab Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
          <div className="flex gap-1 p-1 bg-[#D8CDC0]/20 dark:bg-[#151515] rounded-xl">
            <button
              onClick={() => {
                setActiveTab("paid");
                setPage(1);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "paid"
                  ? "bg-white dark:bg-[#1A1A1A] text-[#2B6F5E] dark:text-[#4ADE80] shadow-sm dark:shadow-black/20"
                  : "text-[#6B5D4F] dark:text-[#666666]"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {t("owner.feeAnalytics.paidFees", "Paid Fees")}
              {summary && summary.paid_count > 0 && (
                <span className="bg-[#8DB896]/20 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {summary.paid_count}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("unpaid");
                setPage(1);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "unpaid"
                  ? "bg-white dark:bg-[#1A1A1A] text-red-600 dark:text-red-400 shadow-sm dark:shadow-black/20"
                  : "text-[#6B5D4F] dark:text-[#666666]"
              }`}
            >
              <XCircle className="w-4 h-4" />
              {t("owner.feeAnalytics.unpaidFees", "Unpaid Fees")}
              {summary && summary.unpaid_count > 0 && (
                <span className="bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {summary.unpaid_count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="divide-y divide-[#D8CDC0]/30 dark:divide-[#2A2A2A]">
          {activeTab === "paid" ? (
            paidFees.length > 0 ? (
              paidFees.map((fee: any) => (
                <PaidFeeRow key={fee.fee_id} fee={fee} />
              ))
            ) : (
              <EmptyState type="paid" />
            )
          ) : unpaidFees.length > 0 ? (
            unpaidFees.map((fee: any) => (
              <UnpaidFeeRow key={fee.fee_id} fee={fee} />
            ))
          ) : (
            <EmptyState type="unpaid" />
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
            <p className="text-xs text-[#BEB29E] dark:text-[#666666]">
              {t("owner.feeAnalytics.page", "Page")} {pagination.page} /{" "}
              {pagination.pages} · {pagination.total}{" "}
              {t("owner.feeAnalytics.total", "total")}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-lg hover:bg-[#D8CDC0]/15 dark:hover:bg-[#222222] disabled:opacity-30 text-[#6B5D4F] dark:text-[#888888]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from(
                { length: Math.min(pagination.pages, 5) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    page === p
                      ? "bg-[#C4A035] text-white"
                      : "text-[#6B5D4F] dark:text-[#888888] hover:bg-[#D8CDC0]/15 dark:hover:bg-[#222222]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg hover:bg-[#D8CDC0]/15 dark:hover:bg-[#222222] disabled:opacity-30 text-[#6B5D4F] dark:text-[#888888]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════ */

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  variant,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  variant: "green" | "red" | "mustard" | "teal";
}) {
  const styles = {
    green: {
      bg: "bg-[#8DB896]/8 dark:bg-[#4ADE80]/5",
      border: "border-[#8DB896]/25 dark:border-[#4ADE80]/15",
      icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
      iconBg: "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10",
      bar: "from-[#8DB896] to-[#2B6F5E]",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-200 dark:border-red-800/30",
      icon: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-950/30",
      bar: "from-red-500 to-red-600",
    },
    mustard: {
      bg: "bg-[#C4A035]/5 dark:bg-[#D4A843]/[0.03]",
      border: "border-[#C4A035]/20 dark:border-[#D4A843]/15",
      icon: "text-[#C4A035] dark:text-[#D4A843]",
      iconBg: "bg-[#C4A035]/10 dark:bg-[#D4A843]/10",
      bar: "from-[#C4A035] to-[#C4A035]/70",
    },
    teal: {
      bg: "bg-white dark:bg-[#1A1A1A]",
      border: "border-[#D8CDC0]/60 dark:border-[#2A2A2A]",
      icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
      iconBg: "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10",
      bar: "from-[#2B6F5E] to-[#2B6F5E]/70",
    },
  };
  const s = styles[variant];
  return (
    <div
      className={`relative ${s.bg} border ${s.border} rounded-2xl p-5 overflow-hidden`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.bar} opacity-60`}
      ></div>
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${s.icon}`} />
        </div>
        <p className={`text-sm font-medium ${s.icon}`}>{label}</p>
      </div>
      <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
        {value}
      </p>
      <p className="text-xs text-[#BEB29E] dark:text-[#666666] mt-1">{sub}</p>
    </div>
  );
}

/* ── Paid Fee Row ── */
function PaidFeeRow({ fee }: { fee: any }) {
  const { t } = useTranslation();

  return (
    <div className="p-5 hover:bg-[#D8CDC0]/5 dark:hover:bg-[#222222] transition-colors">
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div className="w-10 h-10 rounded-xl bg-[#8DB896]/12 dark:bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
          <CheckCircle className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              {/* Student */}
              <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {fee.student
                  ? `${fee.student.first_name} ${fee.student.last_name}`
                  : t("owner.feeAnalytics.unknownStudent", "Unknown Student")}
              </p>
              {/* Course */}
              {fee.course && (
                <p className="text-xs text-[#6B5D4F] dark:text-[#888888] mt-0.5">
                  {fee.course.course_name}
                  {fee.course.course_code && (
                    <span className="text-[#BEB29E] dark:text-[#555555]">
                      {" "}
                      · {fee.course.course_code}
                    </span>
                  )}
                </p>
              )}
            </div>
            {/* Amount */}
            <p className="text-lg font-bold text-[#2B6F5E] dark:text-[#4ADE80] shrink-0">
              {formatCurrency(fee.amount)}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 p-3 bg-[#D8CDC0]/8 dark:bg-[#151515] rounded-xl">
            <DetailItem
              icon={Calendar}
              label={t("owner.feeAnalytics.paidAt", "Paid At")}
              value={fee.paid_at ? formatDateTime(fee.paid_at) : "—"}
            />
            <DetailItem
              icon={CreditCard}
              label={t("owner.feeAnalytics.method", "Method")}
              value={fee.payment_method || "—"}
            />
            <DetailItem
              icon={Eye}
              label={t("owner.feeAnalytics.reference", "Reference")}
              value={fee.reference_code || "—"}
              mono
            />
            <DetailItem
              icon={ShieldCheck}
              label={t("owner.feeAnalytics.confirmedBy", "Confirmed By")}
              value={
                fee.confirmed_by
                  ? `${fee.confirmed_by.email} (${fee.confirmed_by.role})`
                  : t("owner.feeAnalytics.system", "System")
              }
              highlight
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Unpaid Fee Row ── */
function UnpaidFeeRow({ fee }: { fee: any }) {
  const { t } = useTranslation();
  const now = new Date();
  const dueDate = fee.due_date ? new Date(fee.due_date) : null;
  const isOverdue = dueDate ? dueDate < now : false;

  return (
    <div className="p-5 hover:bg-[#D8CDC0]/5 dark:hover:bg-[#222222] transition-colors">
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isOverdue
              ? "bg-red-100 dark:bg-red-950/30"
              : "bg-[#C4A035]/10 dark:bg-[#D4A843]/10"
          }`}
        >
          {isOverdue ? (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          ) : (
            <Clock className="w-5 h-5 text-[#C4A035] dark:text-[#D4A843]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {fee.student
                    ? `${fee.student.first_name} ${fee.student.last_name}`
                    : t("owner.feeAnalytics.unknownStudent", "Unknown Student")}
                </p>
                {isOverdue && (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-[10px] font-bold rounded-full uppercase">
                    {t("owner.feeAnalytics.overdue", "Overdue")}
                  </span>
                )}
              </div>
              {fee.course && (
                <p className="text-xs text-[#6B5D4F] dark:text-[#888888] mt-0.5">
                  {fee.course.course_name}
                </p>
              )}
            </div>
            <p
              className={`text-lg font-bold shrink-0 ${
                isOverdue
                  ? "text-red-600 dark:text-red-400"
                  : "text-[#C4A035] dark:text-[#D4A843]"
              }`}
            >
              {formatCurrency(fee.amount)}
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 p-3 bg-[#D8CDC0]/8 dark:bg-[#151515] rounded-xl">
            <DetailItem
              icon={Calendar}
              label={t("owner.feeAnalytics.dueDate", "Due Date")}
              value={fee.due_date ? formatDate(fee.due_date) : "—"}
            />
            <DetailItem
              icon={Clock}
              label={t("owner.feeAnalytics.status", "Status")}
              value={fee.status}
            />
            {fee.student?.email && (
              <DetailItem
                icon={Users}
                label={t("owner.feeAnalytics.email", "Email")}
                value={fee.student.email}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Detail Item ── */
function DetailItem({
  icon: Icon,
  label,
  value,
  mono,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] text-[#BEB29E] dark:text-[#666666] uppercase tracking-wider mb-0.5 flex items-center gap-1">
        <Icon className="w-3 h-3" /> {label}
      </p>
      <p
        className={`text-xs font-semibold truncate ${
          highlight
            ? "text-[#2B6F5E] dark:text-[#4ADE80]"
            : "text-[#1B1B1B] dark:text-[#E5E5E5]"
        } ${mono ? "font-mono text-[11px] bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] px-1.5 py-0.5 rounded inline-block" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({ type }: { type: "paid" | "unpaid" }) {
  const { t } = useTranslation();

  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] flex items-center justify-center mx-auto mb-4">
        {type === "paid" ? (
          <CheckCircle className="w-8 h-8 text-[#BEB29E] dark:text-[#555555]" />
        ) : (
          <XCircle className="w-8 h-8 text-[#BEB29E] dark:text-[#555555]" />
        )}
      </div>
      <p className="text-sm font-medium text-[#6B5D4F] dark:text-[#888888]">
        {type === "paid"
          ? t("owner.feeAnalytics.noPayments", "No payments for this period")
          : t("owner.feeAnalytics.noUnpaid", "No unpaid fees for this period")}
      </p>
      <p className="text-xs text-[#BEB29E] dark:text-[#666666] mt-1">
        {t(
          "owner.feeAnalytics.tryDifferent",
          "Try selecting a different date range",
        )}
      </p>
    </div>
  );
}
