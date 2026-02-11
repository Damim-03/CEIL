import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useLogout } from "../../../hooks/auth/auth.hooks";
import { cn } from "../../../lib/utils/utils";
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
  X,
  GraduationCap,
} from "lucide-react";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/teacher" },
  { icon: BookOpen, label: "My Groups", href: "/teacher/groups" },
  { icon: Calendar, label: "Sessions", href: "/teacher/sessions" },
  { icon: ClipboardCheck, label: "Attendance", href: "/teacher/attendance" },
  { icon: FileText, label: "Exams", href: "/teacher/exams" },
  { icon: BarChart3, label: "Results", href: "/teacher/results" },
  { icon: Users, label: "Students", href: "/teacher/students" },
];

const bottomNavItems: NavItem[] = [
  { icon: UserCircle, label: "My Profile", href: "/teacher/profile" },
];

interface TeacherSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const TeacherSidebar = ({ open, onClose }: TeacherSidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const isActive = (path: string) => {
    if (path === "/teacher") return location.pathname === "/teacher";
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  const initials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "TR";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 w-64",
        "md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-foreground">
            Teacher Portal
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive(item.href)
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Profile */}
        <div className="mt-4 pt-4 border-t border-sidebar-border">
          <ul className="space-y-1 px-3">
            {bottomNavItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive(item.href)
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User Footer */}
      {user && (
        <div className="border-t border-sidebar-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 border border-sidebar-border bg-gray-100">
              {user.google_avatar ? (
                <img
                  src={user.google_avatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                  {initials}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground">Teacher</p>
            </div>
          </div>

          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
              logoutMutation.isPending && "opacity-50 cursor-not-allowed",
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default TeacherSidebar;