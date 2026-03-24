/* ===============================================================
   OwnerHeader.tsx — ✅ Dark Mode Support
   
   📁 src/app/owner/components/OwnerHeader.tsx
=============================================================== */

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { useAuth } from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { DashboardLanguageSwitcher } from "../../student/components/Dashboardlanguageswitcher";
import ThemeToggle from "../../../components/Themetoggle";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  ScrollText,
  Settings,
  Activity,
  UserCircle,
  Crown,
} from "lucide-react";

const OWNER_NAVIGATION = [
  {
    labelKey: "owner.nav.dashboard",
    path: "/owner/dashboard",
    icon: LayoutDashboard,
  },
  {
    labelKey: "owner.nav.admins",
    path: "/owner/admins",
    icon: ShieldCheck,
  },
  {
    labelKey: "owner.nav.users",
    path: "/owner/users",
    icon: Users,
  },
  {
    labelKey: "owner.nav.auditLogs",
    path: "/owner/audit-logs",
    icon: ScrollText,
  },
  {
    labelKey: "owner.nav.settings",
    path: "/owner/settings",
    icon: Settings,
  },
  {
    labelKey: "owner.nav.systemHealth",
    path: "/owner/system",
    icon: Activity,
  },
  {
    labelKey: "owner.nav.profile",
    path: "/owner/profile",
    icon: UserCircle,
  },
];

interface HeaderProps {
  onMenuClick: () => void;
}

export const OwnerHeader = ({ onMenuClick }: HeaderProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const currentPage =
    OWNER_NAVIGATION.find((n) => n.path === location.pathname) ||
    OWNER_NAVIGATION.find((n) => location.pathname.startsWith(n.path)) ||
    OWNER_NAVIGATION[0];

  const initials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "OW";

  const avatarSrc = user?.google_avatar || "";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between px-4 sm:px-6 border-b border-brand-beige/30 dark:border-[#2A2A2A] bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-sm transition-colors duration-300">
      {/* Left: Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-base sm:text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
          {t(currentPage.labelKey)}
        </h1>
      </div>

      {/* Right: Theme + Language + Avatar */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DashboardLanguageSwitcher className="hidden sm:flex" />

        {/* User Info */}
        {user && (
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] truncate max-w-37.5">
              {user.email.split("@")[0]}
            </span>
            <div className="flex items-center gap-1">
              <Crown className="h-3 w-3 text-[#D4A843]" />
              <span className="text-[11px] text-[#D4A843] font-medium">
                {t("owner.role", "Owner")}
              </span>
            </div>
          </div>
        )}

        {/* Avatar */}
        <Avatar className="h-9 w-9 border-2 border-[#D4A843]/40 dark:border-[#D4A843]/20">
          <AvatarImage src={avatarSrc} alt={user?.email || "Owner avatar"} />
          <AvatarFallback className="text-xs font-semibold bg-linear-to-br from-[#D4A843] to-[#B8912E] text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
