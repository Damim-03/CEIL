import {
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import PageLoader from "../../../components/PageLoader";
import { useStudentAttendance } from "../../../hooks/student/Usestudent";

export default function Attendance() {
  const { data, isLoading, isError, error } = useStudentAttendance();
  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-950/20 border border-red-800/30 flex items-center justify-center mb-5">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-red-400 mb-1">
          Failed to load attendance
        </h3>
        <p className="text-sm text-[#6B5D4F] dark:text-[#666666] text-center max-w-xs mb-5">
          {error instanceof Error ? error.message : "Something went wrong"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white text-sm font-medium transition-colors"
        >
          Try Again
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

  const rate = summary.attendance_rate;
  const rateColor =
    rate >= 80
      ? { light: "#2B6F5E", dark: "#4ADE80" }
      : rate >= 60
        ? { light: "#C4A035", dark: "#D4A843" }
        : { light: "#dc2626", dark: "#f87171" };

  const progressGradient =
    rate >= 80
      ? "from-[#2B6F5E] to-[#4ADE80]"
      : rate >= 60
        ? "from-[#C4A035] to-[#D4A843]"
        : "from-red-600 to-red-400";

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="relative bg-white dark:bg-[#111111] rounded-2xl border border-[#E8DDD4]/70 dark:border-[#1E1E1E] overflow-hidden">
        {/* decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2B6F5E]/50 to-transparent" />
        <div className="p-6 flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#1a4a3a] flex items-center justify-center shadow-lg shadow-[#2B6F5E]/25 dark:shadow-[#2B6F5E]/10">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#C4A035] border-2 border-white dark:border-[#111111]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1B1B1B] dark:text-[#E8E8E8]">
              My Attendance
            </h1>
            <p className="text-sm text-[#9B8E82] dark:text-[#555555] mt-0.5">
              Track your class attendance records
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white dark:bg-[#111111] border border-[#E8DDD4]/70 dark:border-[#1E1E1E] rounded-2xl p-5 group hover:border-[#2B6F5E]/30 dark:hover:border-[#2B6F5E]/30 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-[#2B6F5E]/8 dark:bg-[#2B6F5E]/10 flex items-center justify-center mb-3">
            <Calendar className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
          </div>
          <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E8E8E8] tabular-nums">
            {summary.total_sessions}
          </p>
          <p className="text-xs text-[#9B8E82] dark:text-[#555555] mt-1 font-medium">
            Total Sessions
          </p>
        </div>

        {/* Present */}
        <div className="bg-[#2B6F5E]/[0.04] dark:bg-[#2B6F5E]/[0.06] border border-[#2B6F5E]/15 dark:border-[#2B6F5E]/20 rounded-2xl p-5 hover:border-[#2B6F5E]/30 dark:hover:border-[#4ADE80]/25 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 flex items-center justify-center mb-3">
            <CheckCircle className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
          </div>
          <p className="text-2xl font-bold text-[#2B6F5E] dark:text-[#4ADE80] tabular-nums">
            {summary.present}
          </p>
          <p className="text-xs text-[#2B6F5E]/60 dark:text-[#4ADE80]/50 mt-1 font-medium">
            Present
          </p>
        </div>

        {/* Absent */}
        <div className="bg-red-50/60 dark:bg-red-950/10 border border-red-200/60 dark:border-red-900/25 rounded-2xl p-5 hover:border-red-300/60 dark:hover:border-red-800/40 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-red-100/80 dark:bg-red-950/30 flex items-center justify-center mb-3">
            <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">
            {summary.absent}
          </p>
          <p className="text-xs text-red-400 dark:text-red-500/70 mt-1 font-medium">
            Absent
          </p>
        </div>

        {/* Rate — with circular progress feel */}
        <div
          className="relative rounded-2xl p-5 overflow-hidden border transition-colors"
          style={{
            background: `color-mix(in srgb, ${rateColor.light} 4%, white)`,
            borderColor: `color-mix(in srgb, ${rateColor.light} 18%, transparent)`,
          }}
        >
          <div className="dark:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{
                background: `color-mix(in srgb, ${rateColor.light} 12%, white)`,
              }}
            >
              <TrendingUp
                className="w-4 h-4"
                style={{ color: rateColor.light }}
              />
            </div>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: rateColor.light }}
            >
              {rate.toFixed(1)}%
            </p>
            <p
              className="text-xs mt-1 font-medium"
              style={{
                color: `color-mix(in srgb, ${rateColor.light} 60%, transparent)`,
              }}
            >
              Attendance Rate
            </p>
          </div>
          <div
            className="hidden dark:block"
            style={{
              background: `color-mix(in srgb, ${rateColor.dark} 5%, #111111)`,
              borderColor: `color-mix(in srgb, ${rateColor.dark} 15%, transparent)`,
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{
                background: `color-mix(in srgb, ${rateColor.dark} 10%, transparent)`,
              }}
            >
              <TrendingUp
                className="w-4 h-4"
                style={{ color: rateColor.dark }}
              />
            </div>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: rateColor.dark }}
            >
              {rate.toFixed(1)}%
            </p>
            <p
              className="text-xs mt-1 font-medium opacity-50"
              style={{ color: rateColor.dark }}
            >
              Attendance Rate
            </p>
          </div>
          {/* tiny progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5 dark:bg-white/5">
            <div
              className={`h-full bg-gradient-to-r ${progressGradient} transition-all duration-700`}
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Status banner ── */}
      {summary.total_sessions > 0 && (
        <div
          className={`rounded-2xl border px-5 py-4 flex items-center gap-3.5 ${
            rate >= 80
              ? "bg-[#2B6F5E]/[0.04] dark:bg-[#4ADE80]/[0.04] border-[#2B6F5E]/15 dark:border-[#4ADE80]/15"
              : rate >= 60
                ? "bg-[#C4A035]/[0.04] dark:bg-[#D4A843]/[0.03] border-[#C4A035]/20 dark:border-[#D4A843]/15"
                : "bg-red-50/60 dark:bg-red-950/10 border-red-200/60 dark:border-red-900/25"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              rate >= 80
                ? "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10"
                : rate >= 60
                  ? "bg-[#C4A035]/10 dark:bg-[#D4A843]/10"
                  : "bg-red-100/80 dark:bg-red-950/30"
            }`}
          >
            {rate >= 80 ? (
              <CheckCircle className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
            ) : rate >= 60 ? (
              <Clock className="w-4 h-4 text-[#C4A035] dark:text-[#D4A843]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E8E8E8]">
              {rate >= 80
                ? "Excellent Attendance!"
                : rate >= 60
                  ? "Good Attendance"
                  : "Attendance Warning"}
            </p>
            <p className="text-xs text-[#9B8E82] dark:text-[#555555] mt-0.5">
              {rate >= 80
                ? "Keep up the great work!"
                : rate >= 60
                  ? "Try to attend more classes to improve."
                  : "Your rate is below acceptable levels."}
            </p>
          </div>
          {/* right: rate pill */}
          <div className="ml-auto shrink-0">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                rate >= 80
                  ? "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]"
                  : rate >= 60
                    ? "bg-[#C4A035]/10 dark:bg-[#D4A843]/10 text-[#C4A035] dark:text-[#D4A843]"
                    : "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400"
              }`}
            >
              {rate.toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* ── Records list ── */}
      <div className="bg-white dark:bg-[#111111] border border-[#E8DDD4]/70 dark:border-[#1E1E1E] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8DDD4]/50 dark:border-[#1E1E1E]">
          <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E8E8E8]">
            Attendance Records
          </h2>
          <p className="text-xs text-[#9B8E82] dark:text-[#555555] mt-0.5">
            Detailed history of all your class sessions
          </p>
        </div>

        {records.length > 0 ? (
          <div className="divide-y divide-[#E8DDD4]/40 dark:divide-[#1E1E1E]">
            {records.map((record: any, index: number) => {
              const isPresent = record.status === "PRESENT";
              return (
                <div
                  key={record.attendance_id || index}
                  className="group flex items-center gap-4 px-6 py-4 hover:bg-[#F8F4F0]/60 dark:hover:bg-[#161616] transition-colors"
                >
                  {/* status icon */}
                  <div
                    className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                      isPresent
                        ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8"
                        : "bg-red-50 dark:bg-red-950/20"
                    }`}
                  >
                    {isPresent ? (
                      <CheckCircle className="w-4.5 h-4.5 text-[#2B6F5E] dark:text-[#4ADE80]" />
                    ) : (
                      <XCircle className="w-4.5 h-4.5 text-red-500 dark:text-red-400" />
                    )}
                  </div>

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E8E8E8] truncate">
                      {record.session?.topic || "Class Session"}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#9B8E82] dark:text-[#555555]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(record.session?.session_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(record.session?.session_date)}
                      </span>
                      {record.session?.group && (
                        <span className="flex items-center gap-1 hidden sm:flex">
                          <BookOpen className="w-3 h-3" />
                          {record.session.group.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* badge */}
                  <span
                    className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide ${
                      isPresent
                        ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]"
                        : "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-[#F0EBE5] dark:bg-[#1E1E1E] flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-[#BEB29E] dark:text-[#444444]" />
            </div>
            <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E8E8E8]">
              No Attendance Records
            </p>
            <p className="text-xs text-[#9B8E82] dark:text-[#555555] mt-1 max-w-xs mx-auto">
              Your records will appear once you start attending classes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
