import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import {
  useAdminUser,
  useToggleUserStatus,
} from "../../../../hooks/admin/useAdmin";
import { RoleBadge } from "../../components/RoleBadge";
import { StatusBadge } from "../../components/StatusBadge";
import { UserIDCardFlip } from "../../components/UserIDCardFlip";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  User,
  Clock,
  Activity,
  UserCog,
  Star,
  Award,
} from "lucide-react";

const UserDetailsPage = () => {
  const { t, i18n } = useTranslation();
  const { userId } = useParams();
  const { data: user, isLoading } = useAdminUser(userId!);
  const toggleStatus = useToggleUserStatus();

  const locale =
    i18n.language === "ar"
      ? "ar-DZ"
      : i18n.language === "fr"
        ? "fr-FR"
        : "en-US";

  if (isLoading) return <PageLoader />;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 p-8 bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl dark:shadow-black/30 max-w-md border border-[#D8CDC0]/40 dark:border-[#2A2A2A]">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] flex items-center justify-center">
            <User className="w-12 h-12 text-[#BEB29E] dark:text-[#666666]" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
              {t("admin.userDetails.userNotFound")}
            </h2>
            <p className="text-[#6B5D4F] dark:text-[#888888] text-lg">
              {t("admin.userDetails.userNotFoundDesc")}
            </p>
          </div>
          <Link to="/admin/users">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 mt-4 border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#6B5D4F] dark:text-[#AAAAAA] dark:hover:bg-[#222222]"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("admin.userDetails.backToUsers")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getRoleGradient = () => {
    switch (user.role) {
      case "ADMIN":
        return "from-[#2B6F5E] via-[#2B6F5E]/90 to-[#1a4a3d]";
      case "TEACHER":
        return "from-[#C4A035] via-[#C4A035]/90 to-[#8B6914]";
      case "STUDENT":
        return "from-[#8DB896] via-[#3D7A4A] to-[#2B6F5E]";
      default:
        return "from-[#6B5D4F] via-[#6B5D4F]/90 to-[#4A3F36]";
    }
  };

  const getRoleAccentColor = () => {
    switch (user.role) {
      case "ADMIN":
        return {
          light: "#2B6F5E",
          dark: "#4ADE80",
          bgLight: "from-[#2B6F5E]/10 to-[#2B6F5E]/5",
          bgDark: "dark:from-[#4ADE80]/10 dark:to-[#4ADE80]/5",
        };
      case "TEACHER":
        return {
          light: "#C4A035",
          dark: "#D4A843",
          bgLight: "from-[#C4A035]/10 to-[#C4A035]/5",
          bgDark: "dark:from-[#D4A843]/10 dark:to-[#D4A843]/5",
        };
      case "STUDENT":
        return {
          light: "#3D7A4A",
          dark: "#8DB896",
          bgLight: "from-[#8DB896]/10 to-[#8DB896]/5",
          bgDark: "dark:from-[#8DB896]/10 dark:to-[#8DB896]/5",
        };
      default:
        return {
          light: "#6B5D4F",
          dark: "#AAAAAA",
          bgLight: "from-[#D8CDC0]/10 to-[#D8CDC0]/5",
          bgDark: "dark:from-[#555555]/10 dark:to-[#555555]/5",
        };
    }
  };

  const getRoleDesc = () => {
    switch (user.role) {
      case "ADMIN":
        return t("admin.userDetails.roleDescAdmin");
      case "TEACHER":
        return t("admin.userDetails.roleDescTeacher");
      default:
        return t("admin.userDetails.roleDescStudent");
    }
  };

  const daysSinceCreated = user.created_at
    ? Math.floor(
        (new Date().getTime() - new Date(user.created_at).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;
  const accent = getRoleAccentColor();

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/admin/users">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/15 dark:hover:bg-[#222222] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("admin.userDetails.backToUsers")}
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl dark:shadow-black/30 border border-[#D8CDC0]/40 dark:border-[#2A2A2A] overflow-hidden hover:shadow-3xl dark:hover:shadow-black/40 transition-all duration-300">
          <div
            className={`h-40 bg-gradient-to-r ${getRoleGradient()} relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20 dark:to-[#1A1A1A]/30"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 top-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-20 relative">
              <div className="relative group">
                {user.google_avatar ? (
                  <img
                    src={user.google_avatar}
                    alt={user.email}
                    className="w-36 h-36 rounded-3xl object-cover border-4 border-white dark:border-[#1A1A1A] shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div
                    className={`w-36 h-36 rounded-3xl bg-gradient-to-br ${getRoleGradient()} flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white dark:border-[#1A1A1A] group-hover:scale-105 transition-transform duration-300`}
                  >
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white dark:bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-[#1A1A1A]">
                  {user.is_active ? (
                    <div className="w-5 h-5 bg-[#8DB896] dark:bg-[#4ADE80] rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-5 h-5 bg-[#BEB29E] dark:bg-[#555555] rounded-full"></div>
                  )}
                </div>
              </div>

              <div className="flex-1 sm:mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-4xl sm:text-5xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                        {user.email.split("@")[0]}
                      </h1>
                      {user.role === "ADMIN" && (
                        <Award className="w-8 h-8 text-[#C4A035] dark:text-[#D4A843]" />
                      )}
                    </div>
                    <p className="text-[#6B5D4F] dark:text-[#888888] text-lg mb-4">
                      {user.email}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <RoleBadge role={user.role} />
                      <StatusBadge isActive={user.is_active} />
                    </div>

                    {user.created_at && (
                      <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#2B6F5E]/5 to-[#8DB896]/5 dark:from-[#4ADE80]/5 dark:to-[#8DB896]/5 backdrop-blur-sm rounded-2xl px-5 py-3 border border-[#2B6F5E]/15 dark:border-[#4ADE80]/15 shadow-sm hover:shadow-md transition-all">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#8DB896] flex items-center justify-center shrink-0 shadow-md">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#2B6F5E] dark:text-[#4ADE80] uppercase tracking-wide">
                            {t("admin.userDetails.memberSince")}
                          </p>
                          <p className="text-base font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                            {new Date(user.created_at).toLocaleDateString(
                              locale,
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-xs text-[#2B6F5E]/80 dark:text-[#4ADE80]/70 font-medium">
                            {t("admin.userDetails.daysAgo", {
                              count: daysSinceCreated,
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant={user.is_active ? "destructive" : "default"}
                    size="lg"
                    onClick={() =>
                      toggleStatus.mutate({
                        userId: user.user_id,
                        isActive: user.is_active,
                      })
                    }
                    disabled={toggleStatus.isPending}
                    className="gap-2 shadow-xl hover:shadow-2xl transition-all px-8 py-6 text-base"
                  >
                    <UserCog className="w-5 h-5" />
                    {toggleStatus.isPending
                      ? t("admin.userDetails.processing")
                      : user.is_active
                        ? t("admin.userDetails.disableUser")
                        : t("admin.userDetails.enableUser")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Information */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-xl dark:shadow-black/20 border border-[#D8CDC0]/40 dark:border-[#2A2A2A] p-6 sm:p-10 hover:shadow-2xl dark:hover:shadow-black/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("admin.userDetails.accountInfo")}
              </h2>
            </div>

            <div className="space-y-6">
              <div className="group hover:bg-gradient-to-r hover:from-[#2B6F5E]/5 hover:to-[#8DB896]/5 dark:hover:from-[#4ADE80]/5 dark:hover:to-[#8DB896]/5 -mx-6 px-6 py-5 rounded-2xl transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    <Mail className="w-7 h-7 text-[#2B6F5E] dark:text-[#4ADE80]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#2B6F5E] dark:text-[#4ADE80] uppercase tracking-wider mb-2">
                      {t("admin.userDetails.emailAddress")}
                    </p>
                    <p className="text-xl font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] break-all">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group hover:bg-gradient-to-r hover:from-[#C4A035]/5 hover:to-[#C4A035]/3 dark:hover:from-[#D4A843]/5 dark:hover:to-[#D4A843]/3 -mx-6 px-6 py-5 rounded-2xl transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#C4A035]/10 dark:bg-[#D4A843]/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    <Shield className="w-7 h-7 text-[#C4A035] dark:text-[#D4A843]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#C4A035] dark:text-[#D4A843] uppercase tracking-wider mb-2">
                      {t("admin.userDetails.userId")}
                    </p>
                    <p className="text-xl font-mono font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                      {user.user_id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t-2 border-[#D8CDC0]/20 dark:border-[#2A2A2A]">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#C4A035] via-[#C4A035]/80 to-[#8B6914] mb-5 shadow-2xl hover:scale-110 transition-transform duration-300">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5] mb-3">
                    {t("admin.userDetails.digitalIdCard")}
                  </h3>
                  <p className="text-base text-[#6B5D4F] dark:text-[#888888] max-w-md mx-auto leading-relaxed">
                    {t("admin.userDetails.digitalIdCardDesc")}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="h-1.5 w-12 bg-gradient-to-r from-[#C4A035] to-[#C4A035]/70 rounded-full"></div>
                    <div className="h-1.5 w-1.5 bg-[#C4A035]/60 rounded-full"></div>
                    <div className="h-1.5 w-1.5 bg-[#C4A035]/60 rounded-full"></div>
                  </div>
                </div>
                <div className="max-w-md mx-auto">
                  <UserIDCardFlip profile={user} />
                </div>
              </div>
            </div>
          </div>

          {/* Status & Role Cards */}
          <div className="space-y-6">
            <div
              className={`bg-gradient-to-br ${getRoleGradient()} rounded-3xl shadow-2xl p-6 text-white hover:shadow-3xl hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">
                  {t("admin.userDetails.userRole")}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 shadow-lg">
                  <p className="text-sm opacity-90 mb-2 font-medium">
                    {t("admin.userDetails.currentRole")}
                  </p>
                  <p className="text-3xl font-bold">{user.role}</p>
                </div>
                <div className="text-sm opacity-95 leading-relaxed bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  {getRoleDesc()}
                </div>
              </div>
            </div>

            <div
              className={`rounded-3xl shadow-2xl p-6 text-white hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 ${user.is_active ? "bg-gradient-to-br from-[#2B6F5E] via-[#3D7A4A] to-[#8DB896]" : "bg-gradient-to-br from-[#6B5D4F] via-[#6B5D4F]/90 to-[#4A3F36]"}`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">
                  {t("admin.userDetails.accountStatus")}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 shadow-lg">
                  <p className="text-sm opacity-90 mb-2 font-medium">
                    {t("admin.userDetails.currentStatus")}
                  </p>
                  <p className="text-3xl font-bold">
                    {user.is_active
                      ? t("admin.userDetails.statusActive")
                      : t("admin.userDetails.statusInactive")}
                  </p>
                </div>
                <div className="text-sm opacity-95 leading-relaxed bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  {user.is_active
                    ? t("admin.userDetails.statusDescActive")
                    : t("admin.userDetails.statusDescInactive")}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-xl dark:shadow-black/20 border border-[#D8CDC0]/40 dark:border-[#2A2A2A] p-6 hover:shadow-2xl dark:hover:shadow-black/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {t("admin.userDetails.quickInfo")}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b-2 border-[#D8CDC0]/20 dark:border-[#2A2A2A]">
                  <span className="text-sm text-[#6B5D4F] dark:text-[#888888] font-medium">
                    {t("admin.userDetails.accountType")}
                  </span>
                  <span className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5] bg-[#D8CDC0]/15 dark:bg-[#2A2A2A] px-3 py-1 rounded-lg">
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b-2 border-[#D8CDC0]/20 dark:border-[#2A2A2A]">
                  <span className="text-sm text-[#6B5D4F] dark:text-[#888888] font-medium">
                    {t("admin.userDetails.status")}
                  </span>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-lg ${user.is_active ? "text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10" : "text-[#6B5D4F] dark:text-[#AAAAAA] bg-[#D8CDC0]/15 dark:bg-[#2A2A2A]"}`}
                  >
                    {user.is_active
                      ? t("admin.userDetails.statusActive")
                      : t("admin.userDetails.statusInactive")}
                  </span>
                </div>
                {user.created_at && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-[#6B5D4F] dark:text-[#888888] font-medium">
                      {t("admin.userDetails.accountAge")}
                    </span>
                    <span className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5] bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 px-3 py-1 rounded-lg">
                      {t("admin.userDetails.days", { count: daysSinceCreated })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Banner */}
        <div className="bg-gradient-to-r from-[#2B6F5E] via-[#2B6F5E]/90 to-[#C4A035] rounded-3xl shadow-2xl dark:shadow-black/30 p-8 text-white hover:shadow-3xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-6 h-6" />
                <h3 className="text-2xl font-bold">
                  {t("admin.userDetails.accountManagement")}
                </h3>
              </div>
              <p className="text-white/80 leading-relaxed text-base">
                {user.is_active
                  ? t("admin.userDetails.disableDesc")
                  : t("admin.userDetails.enableDesc")}
              </p>
            </div>
            <Button
              variant={user.is_active ? "destructive" : "default"}
              size="lg"
              onClick={() =>
                toggleStatus.mutate({
                  userId: user.user_id,
                  isActive: user.is_active,
                })
              }
              disabled={toggleStatus.isPending}
              className="gap-2 shadow-2xl hover:shadow-3xl transition-all whitespace-nowrap px-8 py-6 text-base font-bold"
            >
              <UserCog className="w-5 h-5" />
              {toggleStatus.isPending
                ? t("admin.userDetails.processing")
                : user.is_active
                  ? t("admin.userDetails.disableUser")
                  : t("admin.userDetails.enableUser")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
