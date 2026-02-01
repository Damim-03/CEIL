import { Badge } from "../../../components/ui/badge";

export const StatusBadge = ({ isActive }: { isActive: boolean }) => {
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "text-emerald-600 border-emerald-500"
          : "text-gray-500 border-gray-400"
      }
    >
      {isActive ? "Active" : "Disabled"}
    </Badge>
  );
};
