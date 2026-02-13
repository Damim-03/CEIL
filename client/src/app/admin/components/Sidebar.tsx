import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useLogout } from "../../../hooks/auth/auth.hooks";
import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/utils/utils";
import logo from "../../../assets/logo.jpg";
import {
  Users,
  Briefcase,
  FileText,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  ClipboardList,
  Megaphone,
  UserCircle,
  LayoutDashboard,
  LogOut,
  Building2,
  Globe,
  BellRing,
} from "lucide-react";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  href: string;
}

const navItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    labelKey: "admin.nav.dashboard",
    href: "/admin/dashboard",
  },
  { icon: Users, labelKey: "admin.nav.users", href: "/admin/users" },
  {
    icon: GraduationCap,
    labelKey: "admin.nav.students",
    href: "/admin/students",
  },
  { icon: Briefcase, labelKey: "admin.nav.teachers", href: "/admin/teachers" },
  { icon: BookOpen, labelKey: "admin.nav.courses", href: "/admin/courses" },
  {
    icon: Building2,
    labelKey: "admin.nav.departments",
    href: "/admin/departments",
  },
  { icon: Calendar, labelKey: "admin.nav.sessions", href: "/admin/sessions" },
  { icon: DollarSign, labelKey: "admin.nav.fees", href: "/admin/fees" },
  {
    icon: ClipboardList,
    labelKey: "admin.nav.enrollments",
    href: "/admin/enrollments",
  },
  { icon: FileText, labelKey: "admin.nav.documents", href: "/admin/documents" },
  {
    icon: BellRing,
    labelKey: "admin.nav.notifications",
    href: "/admin/notifications",
  },
];

const publicNavItems: NavItem[] = [
  { icon: Globe, labelKey: "admin.nav.formations", href: "/admin/formations" },
  {
    icon: Megaphone,
    labelKey: "admin.nav.announcements",
    href: "/admin/announcements",
  },
];

const bottomNavItems: NavItem[] = [
  { icon: UserCircle, labelKey: "admin.nav.profile", href: "/admin/profile" },
];

interface SidebarProps {
  collapsed: boolean;
  onExpand: () => void;
}

const Sidebar = ({ collapsed, onExpand }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const { t } = useTranslation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const initials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "AD";

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
              ? "bg-[#2B6F5E]/8 text-[#2B6F5E] font-semibold"
              : "text-[#6B5D4F] hover:bg-[#D8CDC0]/10 hover:text-[#1B1B1B]",
          )}
        >
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0",
              active
                ? "bg-[#2B6F5E]/10"
                : "bg-transparent group-hover:bg-[#D8CDC0]/15",
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5",
                active
                  ? "text-[#2B6F5E]"
                  : "text-[#BEB29E] group-hover:text-[#6B5D4F]",
              )}
            />
          </div>
          {!collapsed && <span className="text-sm">{label}</span>}
          {active && !collapsed && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2B6F5E] shrink-0" />
          )}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#1B1B1B] text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
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
        "bg-white border-r border-brand-beige/40",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* ═══════════ HEADER ═══════════ */}
      <div
        className={cn(
          "flex items-center border-b border-[#D8CDC0]/30 shrink-0",
          collapsed ? "justify-center p-3.5" : "justify-between p-4",
        )}
      >
        <Link
          to="/admin/dashboard"
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
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-md shadow-[#2B6F5E]/15">
            <Link to="/">
              <img
                src={logo}
                alt="CEIL Logo"
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
          {!collapsed && (
            <div>
              <span className="text-base font-bold text-[#1B1B1B] block leading-tight">
                {t("admin.portal")}
              </span>
              <span className="text-[10px] font-medium text-[#BEB29E] uppercase tracking-wider">
                {t("admin.ceil")}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ═══════════ NAVIGATION ═══════════ */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className={cn("space-y-1.5", collapsed ? "px-2" : "px-3")}>
          {navItems.map((item) => (
            <NavLink key={item.labelKey} item={item} />
          ))}
        </ul>

        {/* Public / Website */}
        <div className="mt-4 pt-4 border-t border-[#D8CDC0]/30">
          {!collapsed && (
            <p className="px-4 mb-2 text-[10px] font-semibold text-[#BEB29E] uppercase tracking-wider">
              {t("admin.nav.publicSection")}
            </p>
          )}
          <ul className={cn("space-y-1.5", collapsed ? "px-2" : "px-3")}>
            {publicNavItems.map((item) => (
              <NavLink key={item.labelKey} item={item} />
            ))}
          </ul>
        </div>

        {/* Profile */}
        <div className="mt-4 pt-4 border-t border-[#D8CDC0]/30">
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
            "border-t border-[#D8CDC0]/30 space-y-3",
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
                "rounded-full overflow-hidden shrink-0 border-2 border-[#D8CDC0]/40",
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
                <div className="h-full w-full bg-gradient-to-br from-[#8DB896] to-[#2B6F5E] flex items-center justify-center text-white font-semibold text-xs">
                  {initials}
                </div>
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#1B1B1B]">
                  {user.email}
                </p>
                <p className="text-xs text-[#BEB29E]">{t("admin.role")}</p>
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
              "text-[#6B5D4F] hover:bg-red-50 hover:text-red-600",
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
              <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#1B1B1B] text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                {t("common.logout")}
              </span>
            )}
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;