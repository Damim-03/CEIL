/* ===============================================================
   OwnerSidebar.tsx — ✅ Dark Mode Support
   
   📁 src/app/owner/components/OwnerSidebar.tsx
   
   Same pattern as Admin Sidebar with OWNER-specific nav items
   Accent: Gold (#D4A843) to distinguish from Admin green
=============================================================== */

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useLogout } from "../../../hooks/auth/auth.hooks";
import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/utils/utils";
import logo from "../../../assets/logo.jpg";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  ScrollText,
  Activity,
  UserCircle,
  LogOut,
  Crown,
  DollarSign,
  Bell,
} from "lucide-react";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  href: string;
}

const navItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    labelKey: "owner.nav.dashboard",
    href: "/owner/dashboard",
  },
  {
    icon: ShieldCheck,
    labelKey: "owner.nav.admins",
    href: "/owner/admins",
  },
  {
    icon: Users,
    labelKey: "owner.nav.users",
    href: "/owner/users",
  },
  {
    icon: DollarSign,
    labelKey: "owner.nav.fees",
    href: "/owner/fee-analytics",
  },
  {
    icon: ScrollText,
    labelKey: "owner.nav.auditLogs",
    href: "/owner/teachers",
  },
  { icon: Activity, labelKey: "owner.nav.activity", href: "/owner/activity" },

  {
    icon: Bell,
    labelKey: "owner.nav.notifications",
    href: "/owner/notifications",
  },
];

const bottomNavItems: NavItem[] = [
  {
    icon: UserCircle,
    labelKey: "owner.nav.profile",
    href: "/owner/profile",
  },
];

interface SidebarProps {
  collapsed: boolean;
  onExpand: () => void;
}

const OwnerSidebar = ({ collapsed, onExpand }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const { t } = useTranslation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const initials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "OW";

  const handleIconClick = (e: React.MouseEvent) => {
    if (collapsed) {
      e.preventDefault();
      onExpand();
    }
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    const label = t(item.labelKey);
    return (
      <li>
        <Link
          to={item.href}
          onClick={handleIconClick}
          title={collapsed ? label : undefined}
          className={cn(
            "relative group flex items-center rounded-xl transition-all duration-200",
            collapsed ? "justify-center px-2.5 py-3" : "gap-3 px-3 py-2.5",
            active
              ? "bg-[#D4A843]/8 dark:bg-[#D4A843]/10 text-[#B8912E] dark:text-[#D4A843] font-semibold"
              : "text-[#6B5D4F] dark:text-[#888888] hover:bg-brand-beige/10 dark:hover:bg-[#2A2A2A] hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5]",
          )}
        >
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0",
              active
                ? "bg-[#D4A843]/10 dark:bg-[#D4A843]/15"
                : "bg-transparent group-hover:bg-brand-beige/15 dark:group-hover:bg-[#2A2A2A]",
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5",
                active
                  ? "text-[#B8912E] dark:text-[#D4A843]"
                  : "text-brand-brown dark:text-[#666666] group-hover:text-[#6B5D4F] dark:group-hover:text-[#AAAAAA]",
              )}
            />
          </div>
          {!collapsed && <span className="text-sm">{label}</span>}
          {active && !collapsed && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4A843] shrink-0" />
          )}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#1B1B1B] dark:bg-[#2A2A2A] text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg dark:shadow-black/40">
              {label}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-300",
        "bg-white dark:bg-[#1A1A1A] border-r border-brand-beige/40 dark:border-[#2A2A2A]",
        collapsed ? "w-18" : "w-64",
      )}
    >
      {/* ═══════════ HEADER ═══════════ */}
      <div
        className={cn(
          "flex items-center border-b border-brand-beige/30 dark:border-[#2A2A2A] shrink-0",
          collapsed ? "justify-center p-3.5" : "justify-between p-4",
        )}
      >
        <Link
          to="/owner/dashboard"
          className={cn(
            "flex items-center gap-2.5",
            collapsed && "cursor-pointer",
          )}
          onClick={
            collapsed
              ? (e) => {
                  e.preventDefault();
                  onExpand();
                }
              : undefined
          }
        >
          {/* ✅ FIX: Removed nested <Link to="/"> — was causing <a> inside <a> */}
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-md shadow-[#D4A843]/15 dark:shadow-black/30">
            <img
              src={logo}
              alt="CEIL Logo"
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-[#1B1B1B] dark:text-[#E5E5E5] leading-tight">
                  {t("owner.portal", "Owner Portal")}
                </span>
                <Crown className="h-3.5 w-3.5 text-[#D4A843]" />
              </div>
              <span className="text-[10px] font-medium text-brand-brown dark:text-[#666666] uppercase tracking-wider">
                {t("owner.systemControl", "System Control")}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ═══════════ NAVIGATION ═══════════ */}
      <nav className="flex-1 overflow-y-auto py-3">
        {/* Main Navigation */}
        <ul className={cn("space-y-1.5", collapsed ? "px-2" : "px-3")}>
          {navItems.map((item) => (
            <NavLink key={item.labelKey} item={item} />
          ))}
        </ul>
        {/* Profile */}
        <div className="mt-4 pt-4 border-t border-brand-beige/30 dark:border-[#2A2A2A]">
          <ul className={cn("space-y-1.5", collapsed ? "px-2" : "px-3")}>
            {bottomNavItems.map((item) => (
              <NavLink key={item.labelKey} item={item} />
            ))}
          </ul>
        </div>
      </nav>

      {/* ═══════════ USER FOOTER ═══════════ */}
      {user && (
        <div
          className={cn(
            "border-t border-brand-beige/30 dark:border-[#2A2A2A] space-y-3",
            collapsed ? "p-2" : "p-4",
          )}
        >
          <div
            className={cn(
              "flex items-center",
              collapsed ? "justify-center cursor-pointer" : "gap-3",
            )}
            onClick={collapsed ? onExpand : undefined}
          >
            <div
              className={cn(
                "rounded-full overflow-hidden shrink-0 border-2 border-[#D4A843]/40 dark:border-[#D4A843]/20",
                collapsed ? "h-8 w-8" : "h-10 w-10",
              )}
            >
              {user.google_avatar ? (
                <img
                  src={user.google_avatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-[#D4A843] to-[#B8912E] flex items-center justify-center text-white font-semibold text-xs">
                  {initials}
                </div>
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {user.email}
                </p>
                <div className="flex items-center gap-1">
                  <Crown className="h-3 w-3 text-[#D4A843]" />
                  <p className="text-xs text-[#D4A843] font-medium">
                    {t("owner.role", "Owner")}
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={collapsed ? onExpand : () => logoutMutation.mutate()}
            disabled={!collapsed && logoutMutation.isPending}
            title={collapsed ? t("common.logout") : undefined}
            className={cn(
              "w-full flex items-center rounded-xl transition-colors relative group",
              collapsed ? "justify-center px-2.5 py-3" : "gap-3 px-3 py-2.5",
              "text-[#6B5D4F] dark:text-[#888888] hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400",
              !collapsed &&
                logoutMutation.isPending &&
                "opacity-50 cursor-not-allowed",
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">
                {logoutMutation.isPending
                  ? t("common.loading")
                  : t("common.logout")}
              </span>
            )}
            {collapsed && (
              <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#1B1B1B] dark:bg-[#2A2A2A] text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg dark:shadow-black/40">
                {t("common.logout")}
              </span>
            )}
          </button>
        </div>
      )}
    </aside>
  );
};

export default OwnerSidebar;
