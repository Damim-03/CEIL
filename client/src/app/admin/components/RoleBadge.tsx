import { Badge } from "../../../components/ui/badge";
import { ShieldCheck, Shield, User } from "lucide-react";
import type { UserRole } from "../../../lib/api/admin/adminUsers.api";

const roleConfig = {
  ADMIN: { label: "Admin", icon: ShieldCheck },
  TEACHER: { label: "Teacher", icon: Shield },
  STUDENT: { label: "Student", icon: User },
};

export const RoleBadge = ({ role }: { role: UserRole }) => {
  const Icon = roleConfig[role].icon;

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {roleConfig[role].label}
    </Badge>
  );
};
