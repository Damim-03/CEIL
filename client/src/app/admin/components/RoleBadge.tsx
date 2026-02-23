import { Badge } from "../../../components/ui/badge";
import { ShieldCheck, Shield, User, Crown } from "lucide-react";
import type { UserRole } from "../../../lib/api/admin/admin.api";

const roleConfig: Record<
  string,
  { label: string; icon: typeof Shield; variant?: string }
> = {
  OWNER: { label: "Owner", icon: Crown },
  ADMIN: { label: "Admin", icon: ShieldCheck },
  TEACHER: { label: "Teacher", icon: Shield },
  STUDENT: { label: "Student", icon: User },
};

const fallback = { label: "Unknown", icon: User };

export const RoleBadge = ({ role }: { role: UserRole | string }) => {
  const config = roleConfig[role] ?? fallback;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};
