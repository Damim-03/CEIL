/* ===============================================================
   SystemPage.tsx — Owner: System Health & Statistics
   
   📁 src/app/owner/pages/System/SystemPage.tsx
=============================================================== */

import { useTranslation } from "react-i18next";
import {
  useSystemHealth,
  useSystemStats,
} from "../../../../hooks/owner/Useowner.hooks";
import {
  Activity,
  Database,
  Cpu,
  HardDrive,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  UserCheck,
} from "lucide-react";

const SystemPage = () => {
  const { t } = useTranslation();
  const { data: health, isLoading: healthLoading } = useSystemHealth();
  const { data: stats, isLoading: statsLoading } = useSystemStats();

  if (healthLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-[#D4A843]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ═══ Header ═══ */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A843] to-[#B8912E] flex items-center justify-center shadow-md shadow-[#D4A843]/20">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("owner.system.title", "System Health & Stats")}
          </h1>
          <p className="text-sm text-[#BEB29E] dark:text-[#666666]">
            {t("owner.system.subtitle", "Real-time monitoring")}
          </p>
        </div>
      </div>

      {/* ═══ Health Status ═══ */}
      {health && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  health.status === "healthy"
                    ? "bg-emerald-50 dark:bg-emerald-950/20"
                    : "bg-red-50 dark:bg-red-950/20"
                }`}
              >
                <Activity
                  className={`h-5 w-5 ${
                    health.status === "healthy"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                />
              </div>
              <div>
                <p className="text-xs text-[#BEB29E] dark:text-[#666666]">
                  Status
                </p>
                <p
                  className={`text-sm font-bold ${
                    health.status === "healthy"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {health.status.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-950/20">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-[#BEB29E] dark:text-[#666666]">
                  {t("owner.system.dbLatency", "DB Latency")}
                </p>
                <p className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {health.database.latency_ms}ms
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-violet-50 dark:bg-violet-950/20">
                <Cpu className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-[#BEB29E] dark:text-[#666666]">
                  {t("owner.system.uptime", "Uptime")}
                </p>
                <p className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {formatUptime(health.uptime)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-50 dark:bg-orange-950/20">
                <HardDrive className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-[#BEB29E] dark:text-[#666666]">
                  {t("owner.system.memory", "Memory")}
                </p>
                <p className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {formatBytes(health.memory.heapUsed)} /{" "}
                  {formatBytes(health.memory.heapTotal)}
                </p>
              </div>
            </div>
            {/* Memory bar */}
            <div className="w-full h-2 bg-[#F0ECE4] dark:bg-[#2A2A2A] rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full"
                style={{
                  width: `${Math.round((health.memory.heapUsed / health.memory.heapTotal) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══ Monthly Comparison ═══ */}
      {stats && (
        <>
          <h2 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("owner.system.monthlyComparison", "Monthly Comparison")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ComparisonCard
              icon={Users}
              label={t("owner.system.newStudents", "New Students")}
              thisMonth={stats.monthly_comparison.new_students.this_month}
              lastMonth={stats.monthly_comparison.new_students.last_month}
            />
            <ComparisonCard
              icon={Calendar}
              label={t("owner.system.enrollments", "Enrollments")}
              thisMonth={stats.monthly_comparison.enrollments.this_month}
              lastMonth={stats.monthly_comparison.enrollments.last_month}
              changePercent={
                stats.monthly_comparison.enrollments.change_percent
              }
            />
            <ComparisonCard
              icon={DollarSign}
              label={t("owner.system.revenue", "Revenue")}
              thisMonth={stats.monthly_comparison.revenue.this_month}
              lastMonth={stats.monthly_comparison.revenue.last_month}
              suffix=" DA"
            />
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-50 dark:bg-cyan-950/20">
                  <UserCheck className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-[#BEB29E] dark:text-[#666666]">
                    {t("owner.system.attendanceRate", "Attendance Rate")}
                  </p>
                  <p className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {stats.attendance.overall_rate}%
                  </p>
                </div>
              </div>
              <div className="w-full h-2 bg-[#F0ECE4] dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${stats.attendance.overall_rate}%` }}
                />
              </div>
              <p className="text-[10px] text-[#BEB29E] dark:text-[#555555] mt-1">
                {stats.attendance.present} / {stats.attendance.total}{" "}
                {t("owner.system.sessions", "sessions")}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemPage;

/* ═══ Helper Components ═══ */

function ComparisonCard({
  icon: Icon,
  label,
  thisMonth,
  lastMonth,
  changePercent,
  suffix = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  thisMonth: number;
  lastMonth: number;
  changePercent?: number;
  suffix?: string;
}) {
  const diff = thisMonth - lastMonth;
  const isUp = diff >= 0;
  const pct =
    changePercent ??
    (lastMonth > 0
      ? Math.round((diff / lastMonth) * 100)
      : thisMonth > 0
        ? 100
        : 0);

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#D4A843]/10 dark:bg-[#D4A843]/10">
          <Icon className="h-5 w-5 text-[#D4A843]" />
        </div>
        <p className="text-xs text-[#BEB29E] dark:text-[#666666]">{label}</p>
      </div>
      <p className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
        {thisMonth.toLocaleString()}
        {suffix}
      </p>
      <div className="flex items-center gap-1 mt-1">
        {isUp ? (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
        )}
        <span
          className={`text-xs font-medium ${
            isUp
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {isUp ? "+" : ""}
          {pct}%
        </span>
        <span className="text-[10px] text-[#BEB29E] dark:text-[#555555]">
          vs {lastMonth.toLocaleString()}
          {suffix}
        </span>
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
