/* ===============================================================
   TeacherSidebar.tsx — ✅ Fixed Border Issue in Dark Mode
   
   📁 src/app/teacher/components/TeacherSidebar.tsx
=============================================================== */

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useLogout } from "../../../hooks/auth/auth.hooks";
import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/utils/utils";
import logo from "../../../assets/logo.jpg";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  BarChart3,
  UserCircle,
  LogOut,
  Megaphone,
  CalendarClock,
} from "lucide-react";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  href: string;
}

const navItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    labelKey: "teacher.sidebar.dashboard",
    href: "/teacher",
  },
  {
    icon: BookOpen,
    labelKey: "teacher.sidebar.myGroups",
    href: "/teacher/groups",
  },
  {
    icon: Calendar,
    labelKey: "teacher.sidebar.sessions",
    href: "/teacher/sessions",
  },
  {
    icon: CalendarClock,
    labelKey: "teacher.sidebar.schedule",
    href: "/teacher/schedule",
  },
  {
    icon: ClipboardCheck,
    labelKey: "teacher.sidebar.attendance",
    href: "/teacher/attendance",
  },
  { icon: FileText, labelKey: "teacher.sidebar.exams", href: "/teacher/exams" },
  {
    icon: BarChart3,
    labelKey: "teacher.sidebar.results",
    href: "/teacher/results",
  },
  {
    icon: Users,
    labelKey: "teacher.sidebar.students",
    href: "/teacher/students",
  },
  {
    icon: Megaphone,
    labelKey: "teacher.sidebar.announcements",
    href: "/teacher/announcements",
  },
];

const bottomNavItems: NavItem[] = [
  {
    icon: UserCircle,
    labelKey: "teacher.sidebar.myProfile",
    href: "/teacher/profile",
  },
];

interface TeacherSidebarProps {
  collapsed: boolean;
  onExpand: () => void;
}

const TeacherSidebar = ({ collapsed, onExpand }: TeacherSidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const { t } = useTranslation();

  const isActive = (path: string) => {
    if (path === "/teacher") return location.pathname === "/teacher";
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const handleIconClick = (e: React.MouseEvent) => {
    if (collapsed) {
      e.preventDefault();
      onExpand();
    }
  };

  const initials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "TR";

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
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
            active
              ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80] font-semibold"
              : "text-[#6B5D4F] dark:text-[#888888] hover:bg-brand-beige/10 dark:hover:bg-[#222222] hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5]",
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
              active
                ? "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/8"
                : "bg-transparent group-hover:bg-brand-beige/15 dark:group-hover:bg-[#2A2A2A]",
            )}
          >
            <item.icon
              className={cn(
                "h-4.5 w-4.5",
                active
                  ? "text-[#2B6F5E] dark:text-[#4ADE80]"
                  : "text-brand-brown dark:text-[#888888] group-hover:text-[#6B5D4F] dark:group-hover:text-[#AAAAAA]",
              )}
            />
          </div>
          {!collapsed && <span className="text-sm">{label}</span>}
          {active && !collapsed && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2B6F5E] dark:bg-[#4ADE80] shrink-0" />
          )}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#1B1B1B] dark:bg-[#2A2A2A] text-white dark:text-[#E5E5E5] text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg dark:shadow-black/40">
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
        // ✅ FIXED: Removed border-r completely - no border in dark mode
        "bg-white dark:bg-[#1A1A1A]",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* ═══ HEADER ═══ */}
      <div
        className={cn(
          "flex items-center border-b border-brand-beige/30 dark:border-[#2A2A2A] shrink-0",
          collapsed ? "justify-center p-3" : "justify-between p-4",
        )}
      >
        <Link
          to="/"
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
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-md shadow-[#2B6F5E]/15 dark:shadow-black/30">
            <img
              src={logo}
              alt="CEIL Logo"
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <div>
              <span className="text-base font-bold text-[#1B1B1B] dark:text-[#E5E5E5] block leading-tight">
                {t("teacher.sidebar.title")}
              </span>
              <span className="text-[10px] font-medium text-brand-brown dark:text-[#888888] uppercase tracking-wider">
                {t("teacher.sidebar.ceil")}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ═══ NAVIGATION ═══ */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
          {navItems.map((item) => (
            <NavLink key={item.labelKey} item={item} />
          ))}
        </ul>

        <div className="mt-4 pt-4 border-t border-brand-beige/30 dark:border-[#2A2A2A]">
          <ul className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
            {bottomNavItems.map((item) => (
              <NavLink key={item.labelKey} item={item} />
            ))}
          </ul>
        </div>
      </nav>

      {/* ═══ USER FOOTER ═══ */}
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
                "rounded-full overflow-hidden shrink-0 border-2 border-brand-beige/40 dark:border-[#2A2A2A]",
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
                <div className="h-full w-full bg-linear-to-br from-[#8DB896] to-[#2B6F5E] dark:from-[#4ADE80]/30 dark:to-[#2B6F5E] flex items-center justify-center text-white font-semibold text-xs">
                  {initials}
                </div>
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {user.email}
                </p>
                <p className="text-xs text-brand-brown dark:text-[#888888]">
                  {t("teacher.sidebar.teacher")}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={collapsed ? onExpand : () => logoutMutation.mutate()}
            disabled={!collapsed && logoutMutation.isPending}
            title={collapsed ? t("teacher.sidebar.logout") : undefined}
            className={cn(
              "w-full flex items-center rounded-xl transition-colors relative group",
              collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
              "text-[#6B5D4F] dark:text-[#888888] hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400",
              !collapsed &&
                logoutMutation.isPending &&
                "opacity-50 cursor-not-allowed",
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">
                {logoutMutation.isPending
                  ? t("teacher.sidebar.loggingOut")
                  : t("teacher.sidebar.logout")}
              </span>
            )}
            {collapsed && (
              <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#1B1B1B] dark:bg-[#2A2A2A] text-white dark:text-[#E5E5E5] text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg dark:shadow-black/40">
                {t("teacher.sidebar.logout")}
              </span>
            )}
          </button>
        </div>
      )}
    </aside>
  );
};

export default TeacherSidebar;
