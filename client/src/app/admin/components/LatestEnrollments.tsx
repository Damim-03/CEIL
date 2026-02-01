import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../lib/utils/utils";

interface Enrollment {
  id: string;
  student: string;
  course: string;
  status: "approved" | "pending" | "rejected";
}

interface Props {
  enrollments: Enrollment[];
}

const statusStyles: Record<Enrollment["status"], string> = {
  approved:
    "bg-status-approved-bg text-status-approved border-status-approved/20",
  pending: "bg-status-pending-bg text-status-pending border-status-pending/20",
  rejected:
    "bg-status-rejected-bg text-status-rejected border-status-rejected/20",
};

export const LatestEnrollments = ({ enrollments }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Latest Enrollments
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 px-2 py-2 text-xs font-medium text-muted-foreground uppercase">
            <span>Student</span>
            <span>Course</span>
            <span className="text-right">Status</span>
          </div>

          {/* Rows */}
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="grid grid-cols-3 gap-4 px-2 py-3 rounded-lg hover:bg-muted items-center"
            >
              <span className="text-sm font-medium truncate">
                {enrollment.student}
              </span>
              <span className="text-sm text-muted-foreground truncate">
                {enrollment.course}
              </span>
              <div className="flex justify-end">
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize text-xs font-medium",
                    statusStyles[enrollment.status],
                  )}
                >
                  {enrollment.status}
                </Badge>
              </div>
            </div>
          ))}

          {enrollments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No recent enrollments
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
