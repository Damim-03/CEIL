import { Bell, Menu } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../context/AuthContext";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  Calendar,
  DollarSign,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  UserCircle,
} from "lucide-react";

const ADMIN_NAVIGATION = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Students", path: "/admin/students", icon: GraduationCap },
  { name: "Teachers", path: "/admin/teachers", icon: Briefcase },
  { name: "Courses", path: "/admin/courses", icon: BookOpen },
  { name: "Sessions", path: "/admin/sessions", icon: Calendar },
  { name: "Fees", path: "/admin/fees", icon: DollarSign },
  { name: "Enrollments", path: "/admin/enrollments", icon: ClipboardList },
  { name: "Documents", path: "/admin/documents", icon: FileText },
  { name: "Reports", path: "/admin/reports", icon: BarChart3 },
  { name: "Settings", path: "/admin/settings", icon: Settings },
  { name: "Profile", path: "/admin/profile", icon: UserCircle },
];

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const location = useLocation();
  const { user } = useAuth();

  // Find current page
  const currentPage =
    ADMIN_NAVIGATION.find((n) => n.path === location.pathname) ||
    ADMIN_NAVIGATION.find((n) => location.pathname.startsWith(n.path)) ||
    ADMIN_NAVIGATION[0];

  // Safe initials: first letter of email
  const initials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "AD";

  const avatarSrc = user?.google_avatar || "";
  const hasNotifications = false; // Replace with real state later

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between px-4 sm:px-6 border-b bg-background shadow-sm">
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page Title */}
        <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
          {currentPage.name}
        </h1>
      </div>

      {/* Right: Notifications + Avatar */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {hasNotifications && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>

        {/* User Info - Hidden on small screens */}
        {user && (
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-foreground truncate max-w-37.5">
              {user.email.split("@")[0]}
            </span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </div>
        )}

        {/* Avatar */}
        <Avatar className="h-9 w-9 border">
          <AvatarImage src={avatarSrc} alt={user?.email || "Admin avatar"} />
          <AvatarFallback className="text-xs font-medium bg-linear-to-br from-blue-500 to-indigo-600 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};