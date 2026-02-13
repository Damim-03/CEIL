import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { useMe } from "../../../hooks/auth/auth.hooks";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { DashboardLanguageSwitcher } from "../components/Dashboardlanguageswitcher";
import NotificationBell from "../components/Notificationbell";
import {
  LayoutDashboard,
  User,
  FileText,
  BookOpen,
  ClipboardList,
  DollarSign,
  Calendar,
  Award,
  BellRing,
} from "lucide-react";

const STUDENT_NAVIGATION = [
  {
    labelKey: "student.nav.dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  { labelKey: "student.nav.profile", path: "/dashboard/profile", icon: User },
  {
    labelKey: "student.nav.documents",
    path: "/dashboard/documents",
    icon: FileText,
  },
  {
    labelKey: "student.nav.courses",
    path: "/dashboard/courses",
    icon: BookOpen,
  },
  {
    labelKey: "student.nav.enrollments",
    path: "/dashboard/enrollments",
    icon: ClipboardList,
  },
  { labelKey: "student.nav.fees", path: "/dashboard/fees", icon: DollarSign },
  {
    labelKey: "student.nav.attendance",
    path: "/dashboard/attendance",
    icon: Calendar,
  },
  { labelKey: "student.nav.results", path: "/dashboard/results", icon: Award },
  {
    labelKey: "student.nav.notifications",
    path: "/dashboard/notifications",
    icon: BellRing,
  },
];

export default function StudentNavbar() {
  const location = useLocation();
  const { data: user } = useMe();
  const { t } = useTranslation();

  const currentPage =
    STUDENT_NAVIGATION.find((n) => n.path === location.pathname) ||
    STUDENT_NAVIGATION.find((n) => location.pathname.startsWith(n.path)) ||
    STUDENT_NAVIGATION[0];

  const initials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "ST";

  const avatarSrc = user?.google_avatar || "";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between px-4 sm:px-6 border-b border-[#D8CDC0]/30 bg-white/80 backdrop-blur-sm">
      {/* Left: Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-base sm:text-lg font-semibold text-[#1B1B1B] truncate">
          {t(currentPage.labelKey)}
        </h1>
      </div>

      {/* Right: Language + Notifications + Avatar */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <DashboardLanguageSwitcher className="hidden sm:flex" />

        {/* ✅ Notification Bell with dropdown */}
        <NotificationBell
          role="student"
          notificationsPath="/dashboard/notifications"
        />

        {/* User Info */}
        {user && (
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-sm font-medium text-[#1B1B1B] truncate max-w-[150px]">
              {user.email.split("@")[0]}
            </span>
            <span className="text-[11px] text-[#BEB29E]">
              {t("common.student")}
            </span>
          </div>
        )}

        {/* Avatar */}
        <Avatar className="h-9 w-9 border-2 border-[#D8CDC0]/40">
          <AvatarImage src={avatarSrc} alt={user?.email || "Student avatar"} />
          <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-[#8DB896] to-[#2B6F5E] text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
