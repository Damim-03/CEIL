import { useState } from "react";
import {
  Check,
  X,
  DollarSign,
  CheckCircle2,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import type { Enrollment } from "../../../../types/enrollment";
import type { RegistrationStatus } from "../../../../types/enums";

// Import your hooks
import {
  useAdminEnrollments,
  useValidateEnrollment,
  useRejectEnrollment,
  useMarkEnrollmentPaid,
  useFinishEnrollment,
} from "../../../../hooks/admin/useAdminEnrollments";

const EnrollmentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "all">(
    "all",
  );
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<Enrollment | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Queries
  const { data: enrollments = [], isLoading } = useAdminEnrollments();

  // Mutations
  const validateMutation = useValidateEnrollment();
  const rejectMutation = useRejectEnrollment();
  const markPaidMutation = useMarkEnrollmentPaid();
  const finishMutation = useFinishEnrollment();

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.student?.first_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      enrollment.student?.last_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      enrollment.course?.course_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || enrollment.registration_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Status badge styling
  const getStatusBadge = (status: RegistrationStatus) => {
    const styles: Record<RegistrationStatus, string> = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Validated: "bg-blue-100 text-blue-800 border-blue-300",
      Paid: "bg-green-100 text-green-800 border-green-300",
      Finished: "bg-gray-100 text-gray-800 border-gray-300",
      Rejected: "bg-red-100 text-red-800 border-red-300",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  // Get status badge class helper
  const getStatusClass = (status: RegistrationStatus): string => {
    const classes: Record<RegistrationStatus, string> = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Validated: "bg-blue-100 text-blue-800 border-blue-300",
      Paid: "bg-green-100 text-green-800 border-green-300",
      Finished: "bg-gray-100 text-gray-800 border-gray-300",
      Rejected: "bg-red-100 text-red-800 border-red-300",
    };
    return classes[status];
  };

  // Handle actions
  const handleValidate = (enrollmentId: string) => {
    validateMutation.mutate(enrollmentId);
  };

  const handleReject = () => {
    if (!selectedEnrollment) return;

    rejectMutation.mutate(
      {
        enrollmentId: selectedEnrollment.enrollment_id,
        reason: rejectReason,
      },
      {
        onSuccess: () => {
          setShowRejectModal(false);
          setSelectedEnrollment(null);
          setRejectReason("");
        },
      },
    );
  };

  const handleMarkPaid = (enrollmentId: string) => {
    markPaidMutation.mutate(enrollmentId);
  };

  const handleFinish = (enrollmentId: string) => {
    finishMutation.mutate(enrollmentId);
  };

  // Get available actions based on status
  const getAvailableActions = (enrollment: Enrollment) => {
    const status = enrollment.registration_status;

    return (
      <div className="flex gap-2 justify-end">
        {status === "Pending" && (
          <>
            <button
              onClick={() => handleValidate(enrollment.enrollment_id)}
              disabled={validateMutation.isPending}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Validate"
              aria-label="Validate enrollment"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => {
                setSelectedEnrollment(enrollment);
                setShowRejectModal(true);
              }}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              title="Reject"
              aria-label="Reject enrollment"
            >
              <X size={16} />
            </button>
          </>
        )}

        {status === "Validated" && (
          <button
            onClick={() => handleMarkPaid(enrollment.enrollment_id)}
            disabled={markPaidMutation.isPending}
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Mark as Paid"
            aria-label="Mark as paid"
          >
            <DollarSign size={16} />
          </button>
        )}

        {status === "Paid" && (
          <button
            onClick={() => handleFinish(enrollment.enrollment_id)}
            disabled={finishMutation.isPending}
            className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Finish"
            aria-label="Finish enrollment"
          >
            <CheckCircle2 size={16} />
          </button>
        )}

        <button
          onClick={() => setSelectedEnrollment(enrollment)}
          className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          title="View Details"
          aria-label="View enrollment details"
        >
          <Eye size={16} />
        </button>
      </div>
    );
  };

  // Statistics
  const stats = {
    total: enrollments.length,
    pending: enrollments.filter((e) => e.registration_status === "Pending")
      .length,
    validated: enrollments.filter((e) => e.registration_status === "Validated")
      .length,
    paid: enrollments.filter((e) => e.registration_status === "Paid").length,
    finished: enrollments.filter((e) => e.registration_status === "Finished")
      .length,
    rejected: enrollments.filter((e) => e.registration_status === "Rejected")
      .length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enrollments Management
          </h1>
          <p className="text-gray-600">
            Manage student enrollments and registrations
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard label="Total" value={stats.total} color="#6B7280" />
          <StatCard label="Pending" value={stats.pending} color="#EAB308" />
          <StatCard label="Validated" value={stats.validated} color="#3B82F6" />
          <StatCard label="Paid" value={stats.paid} color="#10B981" />
          <StatCard label="Finished" value={stats.finished} color="#A855F7" />
          <StatCard label="Rejected" value={stats.rejected} color="#EF4444" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by student name or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={20}
              />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as RegistrationStatus | "all")
                }
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-50 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="VALIDATED">Validated</option>
                <option value="PAID">Paid</option>
                <option value="FINISHED">Finished</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEnrollments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <AlertCircle className="mx-auto mb-2" size={48} />
                      <p className="text-lg">No enrollments found</p>
                      {searchQuery && (
                        <p className="text-sm mt-2">
                          Try adjusting your search or filters
                        </p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <tr
                      key={enrollment.enrollment_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="text-blue-600" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.student?.first_name}{" "}
                              {enrollment.student?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {enrollment.student_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <BookOpen
                            className="text-gray-400 mr-2 shrink-0"
                            size={16}
                          />
                          <div className="text-sm text-gray-900">
                            {enrollment.course?.course_name || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-2 shrink-0" size={16} />
                          {new Date(
                            enrollment.enrollment_date,
                          ).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(enrollment.registration_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {enrollment.level || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {getAvailableActions(enrollment)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredEnrollments.length} of {enrollments.length}{" "}
          enrollment{enrollments.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Enrollment</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject the enrollment for{" "}
              <span className="font-medium">
                {selectedEnrollment.student?.first_name}{" "}
                {selectedEnrollment.student?.last_name}
              </span>
              ? Please provide a reason:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4 outline-none resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedEnrollment(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEnrollment && !showRejectModal && (
        <EnrollmentDetailModal
          enrollment={selectedEnrollment}
          onClose={() => setSelectedEnrollment(null)}
          getStatusClass={getStatusClass}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div
    className="bg-white rounded-lg shadow-sm p-4 border-l-4"
    style={{ borderLeftColor: color }}
  >
    <div className="text-sm text-gray-600 mb-1">{label}</div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
  </div>
);

// Enrollment Detail Modal Component
const EnrollmentDetailModal = ({
  enrollment,
  onClose,
  getStatusClass,
}: {
  enrollment: Enrollment;
  onClose: () => void;
  getStatusClass: (status: RegistrationStatus) => string;
}) => (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h3 className="text-xl font-semibold">Enrollment Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Status */}
        <div>
          <label className="text-sm font-medium text-gray-500 block mb-2">
            Status
          </label>
          <div className="inline-block">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusClass(enrollment.registration_status)}`}
            >
              {enrollment.registration_status}
            </span>
          </div>
        </div>

        {/* Student Info */}
        <div>
          <label className="text-sm font-medium text-gray-500 block mb-2">
            Student
          </label>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-900">
              {enrollment.student?.first_name} {enrollment.student?.last_name}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              ID: {enrollment.student_id}
            </p>
          </div>
        </div>

        {/* Course Info */}
        <div>
          <label className="text-sm font-medium text-gray-500 block mb-2">
            Course
          </label>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-900">
              {enrollment.course?.course_name || "N/A"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              ID: {enrollment.course_id}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-2">
              Enrollment Date
            </label>
            <p className="text-gray-900">
              {new Date(enrollment.enrollment_date).toLocaleDateString()}
            </p>
          </div>
          {enrollment.start_date && (
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">
                Start Date
              </label>
              <p className="text-gray-900">
                {new Date(enrollment.start_date).toLocaleDateString()}
              </p>
            </div>
          )}
          {enrollment.end_date && (
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">
                End Date
              </label>
              <p className="text-gray-900">
                {new Date(enrollment.end_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {enrollment.level && (
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-2">
              Level
            </label>
            <p className="text-gray-900">{enrollment.level}</p>
          </div>
        )}

        {enrollment.group_id && (
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-2">
              Group
            </label>
            <p className="text-gray-900">{enrollment.group_id}</p>
          </div>
        )}

        {/* Fees */}
        {enrollment.fees && enrollment.fees.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-2">
              Fees
            </label>
            <div className="space-y-2">
              {enrollment.fees.map((fee, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-lg flex justify-between items-center"
                >
                  <span className="text-gray-900">Fee {index + 1}</span>
                  <span className="font-medium text-gray-900">
                    {typeof fee === "object" ? JSON.stringify(fee) : fee}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 px-6 py-4">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default EnrollmentsPage;
