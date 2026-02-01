import { cn } from "../../../lib/utils/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  variant: "blue" | "yellow" | "green" | "teal";
}

const variantStyles = {
  blue: {
    iconBg: "bg-stat-blue-bg",
    iconColor: "text-stat-blue",
  },
  yellow: {
    iconBg: "bg-stat-yellow-bg",
    iconColor: "text-stat-yellow",
  },
  green: {
    iconBg: "bg-stat-green-bg",
    iconColor: "text-stat-green",
  },
  teal: {
    iconBg: "bg-stat-teal-bg",
    iconColor: "text-stat-teal",
  },
};

export const StatsCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  variant,
}: StatsCardProps) => {
  const styles = variantStyles[variant];

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-xl", styles.iconBg)}>
          <Icon className={cn("h-6 w-6", styles.iconColor)} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          <p
            className={cn(
              "text-sm mt-2 font-medium",
              changeType === "positive" && "text-stat-green",
              changeType === "negative" && "text-stat-red",
              changeType === "neutral" && "text-muted-foreground",
            )}
          >
            {change}
          </p>
        </div>
      </div>
    </div>
  );
};
