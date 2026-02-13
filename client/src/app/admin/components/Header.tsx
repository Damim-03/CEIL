import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { DashboardLanguageSwitcher } from "../../student/components/Dashboardlanguageswitcher";
import NotificationBell from "../../student/components/Notificationbell";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  Building2,
  Calendar,
  DollarSign,
  ClipboardList,
  FileText,
  UserCircle,
  Globe,
  Megaphone,
  BellRing,
} from "lucide-react";

const ADMIN_NAVIGATION = [
  {
    labelKey: "admin.nav.dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  { labelKey: "admin.nav.users", path: "/admin/users", icon: Users },
  {
    labelKey: "admin.nav.students",
    path: "/admin/students",
    icon: GraduationCap,
  },
  { labelKey: "admin.nav.teachers", path: "/admin/teachers", icon: Briefcase },
  { labelKey: "admin.nav.courses", path: "/admin/courses", icon: BookOpen },
  {
    labelKey: "admin.nav.departments",
    path: "/admin/departments",
    icon: Building2,
  },
  { labelKey: "admin.nav.sessions", path: "/admin/sessions", icon: Calendar },
  { labelKey: "admin.nav.fees", path: "/admin/fees", icon: DollarSign },
  {
    labelKey: "admin.nav.enrollments",
    path: "/admin/enrollments",
    icon: ClipboardList,
  },
  { labelKey: "admin.nav.documents", path: "/admin/documents", icon: FileText },
  {
    labelKey: "admin.nav.notifications",
    path: "/admin/notifications",
    icon: BellRing,
  },
  { labelKey: "admin.nav.formations", path: "/admin/formations", icon: Globe },
  {
    labelKey: "admin.nav.announcements",
    path: "/admin/announcements",
    icon: Megaphone,
  },
  { labelKey: "admin.nav.profile", path: "/admin/profile", icon: UserCircle },
];

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Find current page
  const currentPage =
    ADMIN_NAVIGATION.find((n) => n.path === location.pathname) ||
    ADMIN_NAVIGATION.find((n) => location.pathname.startsWith(n.path)) ||
    ADMIN_NAVIGATION[0];

  // Safe initials
  const initials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "AD";

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

        {/* Notification Bell */}
        <NotificationBell
          role="admin"
          notificationsPath="/admin/notifications"
        />

        {/* User Info */}
        {user && (
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-sm font-medium text-[#1B1B1B] truncate max-w-[150px]">
              {user.email.split("@")[0]}
            </span>
            <span className="text-[11px] text-[#BEB29E]">
              {t("admin.role")}
            </span>
          </div>
        )}

        {/* Avatar */}
        <Avatar className="h-9 w-9 border-2 border-[#D8CDC0]/40">
          <AvatarImage src={avatarSrc} alt={user?.email || "Admin avatar"} />
          <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-[#8DB896] to-[#2B6F5E] text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
