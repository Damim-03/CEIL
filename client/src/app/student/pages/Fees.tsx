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
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-red-600 mb-1">
          Error loading fees
        </h3>
        <p className="text-sm text-gray-600 text-center max-w-sm mb-4">
          {error instanceof Error ? error.message : "Failed to load fees"}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} DA`;
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === "PAID") return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Fees</h1>
        <p className="text-gray-600 mt-1">
          Manage your registration and course fees
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Fees */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Total Fees</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(summary.total)}
          </p>
        </div>

        {/* Paid */}
        <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm bg-green-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-700">Paid</p>
          </div>
          <p className="text-3xl font-bold text-green-900">
            {formatCurrency(summary.paid)}
          </p>
        </div>

        {/* Remaining */}
        <div
          className={`bg-white border rounded-xl p-6 shadow-sm ${
            summary.remaining > 0
              ? "border-red-200 bg-red-50"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-lg ${
                summary.remaining > 0 ? "bg-red-100" : "bg-gray-100"
              }`}
            >
              <CreditCard
                className={`w-5 h-5 ${
                  summary.remaining > 0 ? "text-red-600" : "text-gray-600"
                }`}
              />
            </div>
            <p
              className={`text-sm font-medium ${
                summary.remaining > 0 ? "text-red-700" : "text-gray-600"
              }`}
            >
              Outstanding
            </p>
          </div>
          <p
            className={`text-3xl font-bold ${
              summary.remaining > 0 ? "text-red-900" : "text-gray-900"
            }`}
          >
            {formatCurrency(summary.remaining)}
          </p>
        </div>
      </div>

      {/* Status Banner */}
      {summary.is_fully_paid ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">All Paid!</p>
              <p className="text-sm text-green-700">
                You have no outstanding fees
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-900">Payment Required</p>
              <p className="text-sm text-yellow-700">
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
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Fee Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        fee.status === "PAID"
                          ? "bg-green-100"
                          : overdue
                            ? "bg-red-100"
                            : "bg-yellow-100"
                      }`}
                    >
                      <DollarSign
                        className={`w-6 h-6 ${
                          fee.status === "PAID"
                            ? "text-green-600"
                            : overdue
                              ? "text-red-600"
                              : "text-yellow-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        Registration Fee
                      </h3>
                      {fee.enrollment?.course && (
                        <p className="text-sm text-gray-600 mt-1">
                          📚 {fee.enrollment.course.course_name}
                          {fee.enrollment.level && ` - ${fee.enrollment.level}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    className={
                      fee.status === "PAID"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : overdue
                          ? "bg-red-100 text-red-700 border-red-200"
                          : "bg-yellow-100 text-yellow-700 border-yellow-200"
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

                {/* Fee Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(fee.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Due Date</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(fee.due_date)}
                      </p>
                    </div>
                  </div>
                  {fee.status === "PAID" && (
                    <>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Payment Date
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(fee.paid_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Reference</p>
                        <p className="text-xs font-mono text-gray-900 bg-gray-200 px-2 py-1 rounded">
                          {fee.reference_code}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Payment Method (if paid) */}
                {fee.status === "PAID" && fee.payment_method && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700">
                        Paid via <strong>{fee.payment_method}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {fee.status === "UNPAID" && (
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Now
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Invoice
                    </Button>
                  </div>
                )}

                {fee.status === "PAID" && (
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4">
              <DollarSign className="w-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Fees Yet
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Your fees will appear here once you enroll in a course
            </p>
          </div>
        )}
      </div>
    </div>
  );
}