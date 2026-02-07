import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Clock,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import PageLoader from "../../../components/PageLoader";
import { useStudentAttendance } from "../../../hooks/student/Usestudent";

export default function Attendance() {
  const { data, isLoading, isError, error } = useStudentAttendance();

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-red-600 mb-1">
          Error loading attendance
        </h3>
        <p className="text-sm text-gray-600 text-center max-w-sm mb-4">
          {error instanceof Error ? error.message : "Failed to load attendance"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const records = data?.records || [];
  const summary = data?.summary || {
    total_sessions: 0,
    present: 0,
    absent: 0,
    attendance_rate: 0,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getAttendanceBgColor = (rate: number) => {
    if (rate >= 80) return "bg-green-50 border-green-200";
    if (rate >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-600 mt-1">Track your class attendance records</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Total Sessions</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {summary.total_sessions}
          </p>
        </div>

        {/* Present */}
        <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm bg-green-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-700">Present</p>
          </div>
          <p className="text-3xl font-bold text-green-900">
            {summary.present}
          </p>
        </div>

        {/* Absent */}
        <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm bg-red-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm font-medium text-red-700">Absent</p>
          </div>
          <p className="text-3xl font-bold text-red-900">{summary.absent}</p>
        </div>

        {/* Attendance Rate */}
        <div
          className={`bg-white border rounded-xl p-6 shadow-sm ${getAttendanceBgColor(summary.attendance_rate)}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-lg ${
                summary.attendance_rate >= 80
                  ? "bg-green-100"
                  : summary.attendance_rate >= 60
                    ? "bg-yellow-100"
                    : "bg-red-100"
              }`}
            >
              <TrendingUp
                className={`w-5 h-5 ${getAttendanceColor(summary.attendance_rate)}`}
              />
            </div>
            <p
              className={`text-sm font-medium ${getAttendanceColor(summary.attendance_rate)}`}
            >
              Attendance Rate
            </p>
          </div>
          <p
            className={`text-3xl font-bold ${getAttendanceColor(summary.attendance_rate)}`}
          >
            {summary.attendance_rate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Performance Alert */}
      {summary.total_sessions > 0 && (
        <>
          {summary.attendance_rate >= 80 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    Excellent Attendance!
                  </p>
                  <p className="text-sm text-green-700">
                    Keep up the great work! Your attendance rate is outstanding.
                  </p>
                </div>
              </div>
            </div>
          ) : summary.attendance_rate >= 60 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    Good Attendance
                  </p>
                  <p className="text-sm text-yellow-700">
                    You're doing well, but try to attend more classes to improve
                    your learning.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">
                    Attendance Warning
                  </p>
                  <p className="text-sm text-red-700">
                    Your attendance rate is below acceptable levels. Please
                    attend classes regularly.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Attendance Records */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Attendance Records
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Detailed history of all your class sessions
          </p>
        </div>

        {records.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {records.map((record: any, index: number) => (
              <div
                key={record.attendance_id || index}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* Session Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`p-3 rounded-lg ${
                        record.status === "PRESENT"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      {record.status === "PRESENT" ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {record.session?.topic || "Class Session"}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatDate(record.session?.session_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatTime(record.session?.session_date)}
                              </span>
                            </div>
                            {record.session?.group && (
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                <span>{record.session.group.name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <Badge
                          className={
                            record.status === "PRESENT"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }
                        >
                          {record.status === "PRESENT" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Attendance Records
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Your attendance records will appear here once you start attending
              classes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}