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
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  BarChart3,
  Users,
  UserCircle,
} from "lucide-react";

const TEACHER_NAVIGATION = [
  { name: "Dashboard", path: "/teacher", icon: LayoutDashboard },
  { name: "My Groups", path: "/teacher/groups", icon: BookOpen },
  { name: "Sessions", path: "/teacher/sessions", icon: Calendar },
  { name: "Attendance", path: "/teacher/attendance", icon: ClipboardCheck },
  { name: "Exams", path: "/teacher/exams", icon: FileText },
  { name: "Results", path: "/teacher/results", icon: BarChart3 },
  { name: "Students", path: "/teacher/students", icon: Users },
  { name: "Profile", path: "/teacher/profile", icon: UserCircle },
];

interface TeacherHeaderProps {
  onMenuClick: () => void;
}

export const TeacherHeader = ({ onMenuClick }: TeacherHeaderProps) => {
  const location = useLocation();
  const { user } = useAuth();

  // Find current page — exact match first, then prefix match
  const currentPage =
    TEACHER_NAVIGATION.find((n) => n.path === location.pathname) ||
    TEACHER_NAVIGATION.find(
      (n) => n.path !== "/teacher" && location.pathname.startsWith(n.path),
    ) ||
    TEACHER_NAVIGATION[0];

  const initials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "TR";

  const avatarSrc = user?.google_avatar || "";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between px-4 sm:px-6 border-b bg-background shadow-sm">
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
          {currentPage.name}
        </h1>
      </div>

      {/* Right: Notifications + Avatar */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
        </Button>

        {user && (
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
              {user.email.split("@")[0]}
            </span>
            <span className="text-xs text-muted-foreground">Teacher</span>
          </div>
        )}

        <Avatar className="h-9 w-9 border">
          <AvatarImage src={avatarSrc} alt={user?.email || "Teacher avatar"} />
          <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};