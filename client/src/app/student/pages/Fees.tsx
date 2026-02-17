import {
  DollarSign,
  Download,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  CreditCard,
  FileText,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import PageLoader from "../../../components/PageLoader";
import { useStudentFees } from "../../../hooks/student/Usestudent";

export default function Fees() {
  const { data, isLoading, isError, error } = useStudentFees();

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 mb-4">
          <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1">
          Error loading fees
        </h3>
        <p className="text-sm text-[#6B5D4F] dark:text-[#888888] text-center max-w-sm mb-4">
          {error instanceof Error ? error.message : "Failed to load fees"}
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#6B5D4F] dark:text-[#888888] rounded-xl"
        >
          Retry
        </Button>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-lg shadow-[#C4A035]/20 dark:shadow-black/30">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              My Fees
            </h1>
            <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-0.5">
              Manage your registration and course fees
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/60 dark:border-[#2A2A2A] rounded-2xl p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2B6F5E] to-[#2B6F5E]/70 opacity-60"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/[0.08] rounded-xl">
              <DollarSign className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80]" />
            </div>
            <p className="text-sm font-medium text-[#6B5D4F] dark:text-[#888888]">
              Total Fees
            </p>
          </div>
          <p className="text-3xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {formatCurrency(summary.total)}
          </p>
        </div>
        <div className="relative bg-[#8DB896]/5 dark:bg-[#4ADE80]/5 border border-[#8DB896]/25 dark:border-[#4ADE80]/15 rounded-2xl p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8DB896] to-[#8DB896]/70 opacity-60"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#8DB896]/12 dark:bg-[#4ADE80]/10 rounded-xl">
              <CheckCircle className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80]" />
            </div>
            <p className="text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80]">
              Paid
            </p>
          </div>
          <p className="text-3xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {formatCurrency(summary.paid)}
          </p>
        </div>
        <div
          className={`relative border rounded-2xl p-6 overflow-hidden ${summary.remaining > 0 ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30" : "bg-white dark:bg-[#1A1A1A] border-[#D8CDC0]/60 dark:border-[#2A2A2A]"}`}
        >
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 opacity-60 ${summary.remaining > 0 ? "bg-gradient-to-b from-red-500 to-red-500/70" : "bg-gradient-to-b from-[#D8CDC0] to-[#D8CDC0]/70 dark:from-[#2A2A2A] dark:to-[#2A2A2A]/70"}`}
          ></div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-xl ${summary.remaining > 0 ? "bg-red-100 dark:bg-red-950/30" : "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]"}`}
            >
              <CreditCard
                className={`w-5 h-5 ${summary.remaining > 0 ? "text-red-600 dark:text-red-400" : "text-[#6B5D4F] dark:text-[#888888]"}`}
              />
            </div>
            <p
              className={`text-sm font-medium ${summary.remaining > 0 ? "text-red-700 dark:text-red-400" : "text-[#6B5D4F] dark:text-[#888888]"}`}
            >
              Outstanding
            </p>
          </div>
          <p
            className={`text-3xl font-bold ${summary.remaining > 0 ? "text-red-900 dark:text-red-300" : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
          >
            {formatCurrency(summary.remaining)}
          </p>
        </div>
      </div>

      {/* Status Banner */}
      {summary.is_fully_paid ? (
        <div className="bg-[#8DB896]/8 dark:bg-[#4ADE80]/5 border border-[#8DB896]/25 dark:border-[#4ADE80]/15 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80]" />
            <div>
              <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                All Paid!
              </p>
              <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                You have no outstanding fees
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#C4A035]/5 dark:bg-[#D4A843]/[0.03] border border-[#C4A035]/20 dark:border-[#D4A843]/15 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#C4A035] dark:text-[#D4A843]" />
            <div>
              <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                Payment Required
              </p>
              <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                You have {formatCurrency(summary.remaining)} in outstanding fees
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fees List */}
      <div className="space-y-4">
        {fees.length > 0 ? (
          fees.map((fee: any) => {
            const overdue = isOverdue(fee.due_date, fee.status);
            return (
              <div
                key={fee.fee_id}
                className="bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/60 dark:border-[#2A2A2A] rounded-2xl p-6 hover:shadow-md dark:hover:shadow-black/20 transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${fee.status === "PAID" ? "bg-[#8DB896]/12 dark:bg-[#4ADE80]/10" : overdue ? "bg-red-100 dark:bg-red-950/30" : "bg-[#C4A035]/8 dark:bg-[#D4A843]/[0.08]"}`}
                    >
                      <DollarSign
                        className={`w-6 h-6 ${fee.status === "PAID" ? "text-[#2B6F5E] dark:text-[#4ADE80]" : overdue ? "text-red-600 dark:text-red-400" : "text-[#C4A035] dark:text-[#D4A843]"}`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-[#1B1B1B] dark:text-[#E5E5E5]">
                        Registration Fee
                      </h3>
                      {fee.enrollment?.course && (
                        <p className="text-sm text-[#6B5D4F] dark:text-[#888888] mt-1">
                          {fee.enrollment.course.course_name}
                          {fee.enrollment.level && ` - ${fee.enrollment.level}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    className={
                      fee.status === "PAID"
                        ? "bg-[#8DB896]/12 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80] border-[#8DB896]/25 dark:border-[#4ADE80]/15"
                        : overdue
                          ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30"
                          : "bg-[#C4A035]/8 dark:bg-[#D4A843]/[0.08] text-[#C4A035] dark:text-[#D4A843] border-[#C4A035]/20 dark:border-[#D4A843]/15"
                    }
                  >
                    {fee.status === "PAID" ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : overdue ? (
                      <AlertCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {fee.status === "PAID"
                      ? "PAID"
                      : overdue
                        ? "OVERDUE"
                        : "PENDING"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-[#D8CDC0]/8 dark:bg-[#151515] rounded-xl">
                  <div>
                    <p className="text-xs text-[#BEB29E] dark:text-[#666666] mb-1">
                      Amount
                    </p>
                    <p className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                      {formatCurrency(fee.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#BEB29E] dark:text-[#666666] mb-1">
                      Due Date
                    </p>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#BEB29E] dark:text-[#666666]" />
                      <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                        {formatDate(fee.due_date)}
                      </p>
                    </div>
                  </div>
                  {fee.status === "PAID" && (
                    <>
                      <div>
                        <p className="text-xs text-[#BEB29E] dark:text-[#666666] mb-1">
                          Payment Date
                        </p>
                        <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                          {formatDate(fee.paid_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#BEB29E] dark:text-[#666666] mb-1">
                          Reference
                        </p>
                        <p className="text-xs font-mono text-[#1B1B1B] dark:text-[#E5E5E5] bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] px-2 py-1 rounded">
                          {fee.reference_code}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                {fee.status === "PAID" && fee.payment_method && (
                  <div className="mb-4 p-3 bg-[#8DB896]/8 dark:bg-[#4ADE80]/5 border border-[#8DB896]/20 dark:border-[#4ADE80]/15 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
                      <span className="text-sm text-[#2B6F5E] dark:text-[#4ADE80]">
                        Paid via <strong>{fee.payment_method}</strong>
                      </span>
                    </div>
                  </div>
                )}
                {fee.status === "UNPAID" && (
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl">
                      <CreditCard className="w-4 h-4 mr-2" /> Pay Now
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#6B5D4F] dark:text-[#888888] rounded-xl"
                    >
                      <Download className="w-4 h-4 mr-2" /> Invoice
                    </Button>
                  </div>
                )}
                {fee.status === "PAID" && (
                  <Button
                    variant="outline"
                    className="w-full border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#6B5D4F] dark:text-[#888888] rounded-xl"
                  >
                    <FileText className="w-4 h-4 mr-2" /> Download Receipt
                  </Button>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/60 dark:border-[#2A2A2A] rounded-2xl">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-[#BEB29E] dark:text-[#555555]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
              No Fees Yet
            </h3>
            <p className="text-sm text-[#6B5D4F] dark:text-[#888888] max-w-sm mx-auto">
              Your fees will appear here once you enroll in a course
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
