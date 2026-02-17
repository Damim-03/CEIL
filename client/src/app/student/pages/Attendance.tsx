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
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 mb-4">
          <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1">
          Error loading attendance
        </h3>
        <p className="text-sm text-[#6B5D4F] dark:text-[#888888] text-center max-w-sm mb-4">
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

  const getBg = (r: number) =>
    r >= 80
      ? "bg-[#8DB896]/8 dark:bg-[#4ADE80]/5 border-[#8DB896]/25 dark:border-[#4ADE80]/15"
      : r >= 60
        ? "bg-[#C4A035]/5 dark:bg-[#D4A843]/[0.03] border-[#C4A035]/20 dark:border-[#D4A843]/15"
        : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30";

  return (
    <div className="space-y-6">
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20 dark:shadow-black/30">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              My Attendance
            </h1>
            <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-0.5">
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
            darkColor: "#4ADE80",
            bg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/[0.08]",
            border: "border-[#D8CDC0]/60 dark:border-[#2A2A2A]",
            icon: Calendar,
            bgCard: "bg-white dark:bg-[#1A1A1A]",
          },
          {
            label: "Present",
            value: summary.present,
            color: "#2B6F5E",
            darkColor: "#4ADE80",
            bg: "bg-[#8DB896]/12 dark:bg-[#4ADE80]/10",
            border: "border-[#8DB896]/25 dark:border-[#4ADE80]/15",
            icon: CheckCircle,
            bgCard: "bg-[#8DB896]/5 dark:bg-[#4ADE80]/5",
          },
          {
            label: "Absent",
            value: summary.absent,
            color: "#dc2626",
            darkColor: "#f87171",
            bg: "bg-red-100 dark:bg-red-950/30",
            border: "border-red-200 dark:border-red-800/30",
            icon: XCircle,
            bgCard: "bg-red-50 dark:bg-red-950/20",
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
            darkColor:
              summary.attendance_rate >= 80
                ? "#4ADE80"
                : summary.attendance_rate >= 60
                  ? "#D4A843"
                  : "#f87171",
            bg:
              summary.attendance_rate >= 80
                ? "bg-[#8DB896]/12 dark:bg-[#4ADE80]/10"
                : summary.attendance_rate >= 60
                  ? "bg-[#C4A035]/8 dark:bg-[#D4A843]/[0.08]"
                  : "bg-red-100 dark:bg-red-950/30",
            border:
              summary.attendance_rate >= 80
                ? "border-[#8DB896]/25 dark:border-[#4ADE80]/15"
                : summary.attendance_rate >= 60
                  ? "border-[#C4A035]/20 dark:border-[#D4A843]/15"
                  : "border-red-200 dark:border-red-800/30",
            icon: TrendingUp,
            bgCard: getBg(summary.attendance_rate)
              .split(" ")
              .slice(0, 2)
              .join(" "),
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`relative ${s.bgCard} border ${s.border} rounded-2xl p-6 overflow-hidden`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 ${s.bg} rounded-xl`}>
                <s.icon
                  className="w-5 h-5 hidden dark:block"
                  style={{ color: s.darkColor }}
                />
                <s.icon
                  className="w-5 h-5 dark:hidden"
                  style={{ color: s.color }}
                />
              </div>
              <p
                className="text-sm font-medium hidden dark:block"
                style={{ color: s.darkColor }}
              >
                {s.label}
              </p>
              <p
                className="text-sm font-medium dark:hidden"
                style={{ color: s.color }}
              >
                {s.label}
              </p>
            </div>
            <p className="text-3xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {summary.total_sessions > 0 &&
        (summary.attendance_rate >= 80 ? (
          <div className="bg-[#8DB896]/8 dark:bg-[#4ADE80]/5 border border-[#8DB896]/25 dark:border-[#4ADE80]/15 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80]" />
              <div>
                <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  Excellent Attendance!
                </p>
                <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                  Keep up the great work!
                </p>
              </div>
            </div>
          </div>
        ) : summary.attendance_rate >= 60 ? (
          <div className="bg-[#C4A035]/5 dark:bg-[#D4A843]/[0.03] border border-[#C4A035]/20 dark:border-[#D4A843]/15 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#C4A035] dark:text-[#D4A843]" />
              <div>
                <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  Good Attendance
                </p>
                <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                  Try to attend more classes to improve.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  Attendance Warning
                </p>
                <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                  Your rate is below acceptable levels.
                </p>
              </div>
            </div>
          </div>
        ))}

      <div className="bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/60 dark:border-[#2A2A2A] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
          <h2 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            Attendance Records
          </h2>
          <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-1">
            Detailed history of all your class sessions
          </p>
        </div>
        {records.length > 0 ? (
          <div className="divide-y divide-[#D8CDC0]/30 dark:divide-[#2A2A2A]">
            {records.map((record: any, index: number) => (
              <div
                key={record.attendance_id || index}
                className="p-6 hover:bg-[#D8CDC0]/5 dark:hover:bg-[#222222] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`p-3 rounded-xl ${record.status === "PRESENT" ? "bg-[#8DB896]/12 dark:bg-[#4ADE80]/10" : "bg-red-100 dark:bg-red-950/30"}`}
                    >
                      {record.status === "PRESENT" ? (
                        <CheckCircle className="w-6 h-6 text-[#2B6F5E] dark:text-[#4ADE80]" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                            {record.session?.topic || "Class Session"}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-[#6B5D4F] dark:text-[#888888]">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
                              <span>
                                {formatDate(record.session?.session_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
                              <span>
                                {formatTime(record.session?.session_date)}
                              </span>
                            </div>
                            {record.session?.group && (
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
                                <span>{record.session.group.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge
                          className={
                            record.status === "PRESENT"
                              ? "bg-[#8DB896]/12 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80] border-[#8DB896]/25 dark:border-[#4ADE80]/15"
                              : "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30"
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
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] mx-auto mb-4">
              <Calendar className="w-8 h-8 text-[#BEB29E] dark:text-[#555555]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
              No Attendance Records
            </h3>
            <p className="text-sm text-[#6B5D4F] dark:text-[#888888] max-w-sm mx-auto">
              Your records will appear once you start attending classes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
