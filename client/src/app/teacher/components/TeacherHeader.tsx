import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { DashboardLanguageSwitcher } from "../../student/components/Dashboardlanguageswitcher";
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
  {
    labelKey: "teacher.sidebar.dashboard",
    path: "/teacher",
    icon: LayoutDashboard,
  },
  {
    labelKey: "teacher.sidebar.myGroups",
    path: "/teacher/groups",
    icon: BookOpen,
  },
  {
    labelKey: "teacher.sidebar.sessions",
    path: "/teacher/sessions",
    icon: Calendar,
  },
  {
    labelKey: "teacher.sidebar.attendance",
    path: "/teacher/attendance",
    icon: ClipboardCheck,
  },
  { labelKey: "teacher.sidebar.exams", path: "/teacher/exams", icon: FileText },
  {
    labelKey: "teacher.sidebar.results",
    path: "/teacher/results",
    icon: BarChart3,
  },
  {
    labelKey: "teacher.sidebar.students",
    path: "/teacher/students",
    icon: Users,
  },
  {
    labelKey: "teacher.sidebar.myProfile",
    path: "/teacher/profile",
    icon: UserCircle,
  },
];

interface TeacherHeaderProps {
  onMenuClick: () => void;
}

export const TeacherHeader = ({ onMenuClick }: TeacherHeaderProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

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
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between px-4 sm:px-6 border-b border-[#D8CDC0]/30 bg-white/80 backdrop-blur-sm">
      {/* Left: Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-base sm:text-lg font-semibold text-[#1B1B1B] truncate">
          {t(currentPage.labelKey)}
        </h1>
      </div>

      {/* Right: Language + Avatar */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <DashboardLanguageSwitcher className="hidden sm:flex" />

        {/* User Info */}
        {user && (
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-sm font-medium text-[#1B1B1B] truncate max-w-[150px]">
              {user.email.split("@")[0]}
            </span>
            <span className="text-[11px] text-[#BEB29E]">
              {t("teacher.sidebar.teacher")}
            </span>
          </div>
        )}

        {/* Avatar */}
        <Avatar className="h-9 w-9 border-2 border-[#D8CDC0]/40">
          <AvatarImage src={avatarSrc} alt={user?.email || "Teacher avatar"} />
          <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-[#8DB896] to-[#2B6F5E] text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
