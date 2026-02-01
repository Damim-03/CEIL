import { Bell, Menu } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { useMe } from "../../../hooks/auth/auth.hooks";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  FileText,
  BookOpen,
  ClipboardList,
} from "lucide-react";

const STUDENT_NAVIGATION = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "My Profile", path: "/dashboard/profile", icon: User },
  { name: "My Documents", path: "/dashboard/documents", icon: FileText },
  { name: "My Courses", path: "/dashboard/courses", icon: BookOpen },
  {
    name: "My Enrollments",
    path: "/dashboard/enrollments",
    icon: ClipboardList,
  },
];

interface StudentNavbarProps {
  onMenuClick: () => void;
}

export default function StudentNavbar({ onMenuClick }: StudentNavbarProps) {
  const location = useLocation();
  const { data: user } = useMe();

  // Find current page
  const currentPage =
    STUDENT_NAVIGATION.find((n) => n.path === location.pathname) ||
    STUDENT_NAVIGATION.find((n) => location.pathname.startsWith(n.path)) ||
    STUDENT_NAVIGATION[0];

  // Safe initials: first letter of email
  const initials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "ST";

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
            <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
              {user.email.split("@")[0]}
            </span>
            <span className="text-xs text-muted-foreground">Student</span>
          </div>
        )}

        {/* Avatar */}
        <Avatar className="h-9 w-9 border">
          <AvatarImage src={avatarSrc} alt={user?.email || "Student avatar"} />
          <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
