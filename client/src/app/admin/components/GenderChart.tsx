import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  gender: Record<string, number>;
}

const COLORS: Record<string, string> = {
  Male: "#3b82f6",
  Female: "#ec4899",
  Other: "#a855f7",
};

const COLOR_LIST = ["#3b82f6", "#ec4899", "#a855f7"];

export const GenderChart = ({ gender }: Props) => {
  const total = Object.values(gender).reduce((a, b) => a + b, 0);

  const data = Object.entries(gender)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key,
      value,
      percent: total ? ((value / total) * 100).toFixed(1) : "0",
      color: COLORS[key] || "#94a3b8",
    }));

  const hasData = total > 0;

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden h-full">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-pink-500 to-purple-600"></div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">
        Gender Distribution
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Total students: {total}
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
                    <Cell
                      key={index}
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
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
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-[10px] text-gray-500">Total</p>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-5 mt-3 text-xs">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600">
                  {item.name}{" "}
                  <span className="font-semibold text-gray-800">
                    {item.percent}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
          <UsersIcon className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">No student data yet</p>
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