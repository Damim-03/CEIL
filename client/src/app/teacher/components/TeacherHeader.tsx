/* ===============================================================
   TeacherHeader.tsx — ✅ Simplified (No collapsed prop needed)
   
   📁 src/app/teacher/components/TeacherHeader.tsx
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
import { Menu } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CalendarClock,
  ClipboardCheck,
  FileText,
  BarChart3,
  Users,
  UserCircle,
  Megaphone,
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
    labelKey: "teacher.sidebar.schedule",
    path: "/teacher/schedule",
    icon: CalendarClock,
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
    labelKey: "teacher.sidebar.announcements",
    path: "/teacher/announcements",
    icon: Megaphone,
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
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between px-4 sm:px-6 border-b border-brand-beige/30 dark:border-[#2A2A2A] bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-sm transition-colors duration-300">
      {/* Left: Menu Button (Mobile) + Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          data-sidebar-toggle
          className="md:hidden p-2 hover:bg-brand-beige/10 dark:hover:bg-[#222222] rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-[#6B5D4F] dark:text-[#888888]" />
        </button>

        <h1 className="text-base sm:text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
          {t(currentPage.labelKey)}
        </h1>
      </div>

      {/* Right: Theme + Language + Avatar */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Language Switcher */}
        <DashboardLanguageSwitcher className="hidden sm:flex" />

        {/* User Info */}
        {user && (
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] truncate max-w-37.5">
              {user.email.split("@")[0]}
            </span>
            <span className="text-[11px] text-brand-brown dark:text-[#666666]">
              {t("teacher.sidebar.teacher")}
            </span>
          </div>
        )}

        {/* Avatar */}
        <Avatar className="h-9 w-9 border-2 border-brand-beige/40 dark:border-[#2A2A2A]">
          <AvatarImage src={avatarSrc} alt={user?.email || "Teacher avatar"} />
          <AvatarFallback className="text-xs font-semibold bg-linear-to-br from-[#8DB896] to-[#2B6F5E] dark:from-[#4ADE80]/30 dark:to-[#2B6F5E] text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
