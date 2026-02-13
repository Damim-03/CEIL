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
  { key: "pending", label: "Pending", color: "#f59e0b" },
  { key: "validated", label: "Validated", color: "#3b82f6" },
  { key: "paid", label: "Paid", color: "#10b981" },
  { key: "finished", label: "Finished", color: "#8b5cf6" },
];

export const EnrollmentsChart = ({ enrollments }: Props) => {
  const data = CHART_DATA_CONFIG.map((item) => ({
    name: item.label,
    value: enrollments[item.key as keyof EnrollmentStats] as number,
    color: item.color,
  }));

  const hasData = enrollments.total > 0;

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden h-full">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600"></div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">
        Enrollment Breakdown
      </h3>
      <p className="text-xs text-gray-500 mb-6">
        Distribution by status · Total: {enrollments.total}
      </p>

      {hasData ? (
        <>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [value, "Count"]}
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
                <span className="text-gray-600">{item.label}</span>
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
          <BarChart2Icon className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">No enrollment data yet</p>
          <p className="text-xs mt-1">
            Enrollments will appear here once created
          </p>
        </div>
      )}
    </div>
  );
};

// Simple fallback icon (avoids extra import if lucide not available in this file)
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