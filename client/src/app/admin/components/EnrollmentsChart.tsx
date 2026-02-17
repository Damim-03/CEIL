import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface EnrollmentStats {
  pending: number;
  validated: number;
  paid: number;
  finished: number;
  total: number;
}

interface Props {
  enrollments: EnrollmentStats;
}

const CHART_DATA_CONFIG = [
  { key: "pending", labelKey: "admin.dashboard.pending", color: "#C4A035" },
  { key: "validated", labelKey: "admin.dashboard.validated", color: "#2B6F5E" },
  { key: "paid", labelKey: "admin.dashboard.paid", color: "#8DB896" },
  { key: "finished", labelKey: "admin.dashboard.finished", color: "#BEB29E" },
];

export const EnrollmentsChart = ({ enrollments }: Props) => {
  const { t } = useTranslation();

  const data = CHART_DATA_CONFIG.map((item) => ({
    name: t(item.labelKey),
    value: enrollments[item.key as keyof EnrollmentStats] as number,
    color: item.color,
  }));

  const hasData = enrollments.total > 0;

  // Detect dark mode for dynamic chart colors
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const gridColor = isDark ? "#2A2A2A" : "#f1f5f9";
  const tickColor = isDark ? "#888888" : "#64748b";
  const tooltipBg = isDark ? "#1A1A1A" : "#ffffff";
  const tooltipBorder = isDark ? "#2A2A2A" : "#e2e8f0";
  const tooltipText = isDark ? "#E5E5E5" : "#1B1B1B";

  return (
    <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden h-full transition-colors duration-300">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>

      <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
        {t("admin.dashboard.enrollmentBreakdown", { defaultValue: "Enrollment Breakdown" })}
      </h3>
      <p className="text-xs text-[#6B5D4F] dark:text-[#888888] mb-6">
        {t("admin.dashboard.distributionByStatus", { defaultValue: "Distribution by status" })} · {t("admin.dashboard.total", { defaultValue: "Total" })}: {enrollments.total}
      </p>

      {hasData ? (
        <>
          <div className="h-70">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={gridColor}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: `1px solid ${tooltipBorder}`,
                    backgroundColor: tooltipBg,
                    color: tooltipText,
                    boxShadow: isDark
                      ? "0 4px 12px rgb(0 0 0 / 0.4)"
                      : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [value, t("admin.dashboard.count", { defaultValue: "Count" })]}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={48}>
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 mt-4 text-xs">
            {CHART_DATA_CONFIG.map((item) => (
              <span key={item.key} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#6B5D4F] dark:text-[#AAAAAA]">
                  {t(item.labelKey)}
                </span>
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[280px] text-[#BEB29E] dark:text-[#666666]">
          <BarChart2Icon className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {t("admin.dashboard.noEnrollmentData", { defaultValue: "No enrollment data yet" })}
          </p>
          <p className="text-xs mt-1 text-[#D8CDC0] dark:text-[#555555]">
            {t("admin.dashboard.enrollmentsWillAppear", { defaultValue: "Enrollments will appear here once created" })}
          </p>
        </div>
      )}
    </div>
  );
};

const BarChart2Icon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);