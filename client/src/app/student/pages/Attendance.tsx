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
        <p className="text-sm text-[#6B5D4F] text-center max-w-sm mb-4">
          {error instanceof Error ? error.message : "Failed to load attendance"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#2B6F5E] text-white rounded-xl hover:bg-[#2B6F5E]/90"
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
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getColor = (r: number) =>
    r >= 80 ? "text-[#2B6F5E]" : r >= 60 ? "text-[#C4A035]" : "text-red-600";
  const getBg = (r: number) =>
    r >= 80
      ? "bg-[#8DB896]/8 border-[#8DB896]/25"
      : r >= 60
        ? "bg-[#C4A035]/5 border-[#C4A035]/20"
        : "bg-red-50 border-red-200";

  return (
    <div className="space-y-6">
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B1B1B]">My Attendance</h1>
            <p className="text-sm text-[#BEB29E] mt-0.5">
              Track your class attendance records
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Sessions",
            value: summary.total_sessions,
            color: "#2B6F5E",
            bg: "bg-[#2B6F5E]/8",
            border: "border-[#D8CDC0]/60",
            icon: Calendar,
            bgCard: "bg-white",
          },
          {
            label: "Present",
            value: summary.present,
            color: "#2B6F5E",
            bg: "bg-[#8DB896]/12",
            border: "border-[#8DB896]/25",
            icon: CheckCircle,
            bgCard: "bg-[#8DB896]/5",
          },
          {
            label: "Absent",
            value: summary.absent,
            color: "#dc2626",
            bg: "bg-red-100",
            border: "border-red-200",
            icon: XCircle,
            bgCard: "bg-red-50",
          },
          {
            label: "Rate",
            value: `${summary.attendance_rate.toFixed(1)}%`,
            color:
              summary.attendance_rate >= 80
                ? "#2B6F5E"
                : summary.attendance_rate >= 60
                  ? "#C4A035"
                  : "#dc2626",
            bg:
              summary.attendance_rate >= 80
                ? "bg-[#8DB896]/12"
                : summary.attendance_rate >= 60
                  ? "bg-[#C4A035]/8"
                  : "bg-red-100",
            border:
              summary.attendance_rate >= 80
                ? "border-[#8DB896]/25"
                : summary.attendance_rate >= 60
                  ? "border-[#C4A035]/20"
                  : "border-red-200",
            icon: TrendingUp,
            bgCard: getBg(summary.attendance_rate).split(" ")[0],
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`relative ${s.bgCard} border ${s.border} rounded-2xl p-6 overflow-hidden`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 ${s.bg} rounded-xl`}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <p className="text-sm font-medium" style={{ color: s.color }}>
                {s.label}
              </p>
            </div>
            <p className="text-3xl font-bold text-[#1B1B1B]">{s.value}</p>
          </div>
        ))}
      </div>

      {summary.total_sessions > 0 &&
        (summary.attendance_rate >= 80 ? (
          <div className="bg-[#8DB896]/8 border border-[#8DB896]/25 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#2B6F5E]" />
              <div>
                <p className="font-semibold text-[#1B1B1B]">
                  Excellent Attendance!
                </p>
                <p className="text-sm text-[#6B5D4F]">
                  Keep up the great work!
                </p>
              </div>
            </div>
          </div>
        ) : summary.attendance_rate >= 60 ? (
          <div className="bg-[#C4A035]/5 border border-[#C4A035]/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#C4A035]" />
              <div>
                <p className="font-semibold text-[#1B1B1B]">Good Attendance</p>
                <p className="text-sm text-[#6B5D4F]">
                  Try to attend more classes to improve.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-semibold text-[#1B1B1B]">
                  Attendance Warning
                </p>
                <p className="text-sm text-[#6B5D4F]">
                  Your rate is below acceptable levels.
                </p>
              </div>
            </div>
          </div>
        ))}

      <div className="bg-white border border-[#D8CDC0]/60 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#D8CDC0]/30">
          <h2 className="text-lg font-semibold text-[#1B1B1B]">
            Attendance Records
          </h2>
          <p className="text-sm text-[#BEB29E] mt-1">
            Detailed history of all your class sessions
          </p>
        </div>
        {records.length > 0 ? (
          <div className="divide-y divide-[#D8CDC0]/30">
            {records.map((record: any, index: number) => (
              <div
                key={record.attendance_id || index}
                className="p-6 hover:bg-[#D8CDC0]/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`p-3 rounded-xl ${record.status === "PRESENT" ? "bg-[#8DB896]/12" : "bg-red-100"}`}
                    >
                      {record.status === "PRESENT" ? (
                        <CheckCircle className="w-6 h-6 text-[#2B6F5E]" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-[#1B1B1B]">
                            {record.session?.topic || "Class Session"}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-[#6B5D4F]">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-[#BEB29E]" />
                              <span>
                                {formatDate(record.session?.session_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-[#BEB29E]" />
                              <span>
                                {formatTime(record.session?.session_date)}
                              </span>
                            </div>
                            {record.session?.group && (
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4 text-[#BEB29E]" />
                                <span>{record.session.group.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge
                          className={
                            record.status === "PRESENT"
                              ? "bg-[#8DB896]/12 text-[#2B6F5E] border-[#8DB896]/25"
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
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#D8CDC0]/20 mx-auto mb-4">
              <Calendar className="w-8 h-8 text-[#BEB29E]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1B1B1B] mb-2">
              No Attendance Records
            </h3>
            <p className="text-sm text-[#6B5D4F] max-w-sm mx-auto">
              Your records will appear once you start attending classes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
