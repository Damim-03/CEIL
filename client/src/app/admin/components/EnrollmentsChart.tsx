import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type EnrollmentStat = {
  month: string;
  enrollments: number;
  completions: number;
  dropouts: number;
};

interface Props {
  data: EnrollmentStat[];
}

export const EnrollmentsChart = ({ data }: Props) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Enrollments Over Time
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-95 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line dataKey="enrollments" stroke="#3b82f6" strokeWidth={2} />
              <Line dataKey="completions" stroke="#eab308" strokeWidth={2} />
              <Line dataKey="dropouts" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
