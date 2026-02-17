import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  gender: Record<string, number>;
}

const COLORS: Record<string, string> = {
  Male: "#2B6F5E",
  Female: "#C4A035",
  Other: "#8DB896",
};

export const GenderChart = ({ gender }: Props) => {
  const { t } = useTranslation();
  const total = Object.values(gender).reduce((a, b) => a + b, 0);

  const LABELS: Record<string, string> = {
    Male: t("admin.dashboard.male", { defaultValue: "Male" }),
    Female: t("admin.dashboard.female", { defaultValue: "Female" }),
    Other: t("admin.dashboard.other", { defaultValue: "Other" }),
  };

  const data = Object.entries(gender)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: LABELS[key] || key,
      value,
      percent: total ? ((value / total) * 100).toFixed(1) : "0",
      color: COLORS[key] || "#BEB29E",
    }));

  const hasData = total > 0;

  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const tooltipBg = isDark ? "#1A1A1A" : "#ffffff";
  const tooltipBorder = isDark ? "#2A2A2A" : "#e2e8f0";
  const tooltipText = isDark ? "#E5E5E5" : "#1B1B1B";

  return (
    <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden h-full transition-colors duration-300">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#2B6F5E]"></div>

      <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
        {t("admin.dashboard.genderDistribution", {
          defaultValue: "Gender Distribution",
        })}
      </h3>
      <p className="text-xs text-[#6B5D4F] dark:text-[#888888] mb-4">
        {t("admin.dashboard.totalStudents", { defaultValue: "Total students" })}
        : {total}
      </p>

      {hasData ? (
        <>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
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
                  formatter={(value: number, name: string) => [
                    `${value} (${((value / total) * 100).toFixed(1)}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Center label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[15%] text-center pointer-events-none">
            <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {total}
            </p>
            <p className="text-[10px] text-[#6B5D4F] dark:text-[#888888]">
              {t("admin.dashboard.total", { defaultValue: "Total" })}
            </p>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-5 mt-3 text-xs">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#6B5D4F] dark:text-[#AAAAAA]">
                  {item.name}{" "}
                  <span className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {item.percent}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[280px] text-[#BEB29E] dark:text-[#666666]">
          <UsersIcon className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {t("admin.dashboard.noStudentData", {
              defaultValue: "No student data yet",
            })}
          </p>
        </div>
      )}
    </div>
  );
};

const UsersIcon = ({ className }: { className?: string }) => (
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
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
