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
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center space-y-6 p-8 bg-white rounded-3xl shadow-2xl max-w-md">
          <div className="w-24 h-24 mx-auto rounded-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <User className="w-12 h-12 text-gray-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t("admin.userDetails.userNotFound")}
            </h2>
            <p className="text-gray-600 text-lg">
              {t("admin.userDetails.userNotFoundDesc")}
            </p>
          </div>
          <Link to="/admin/users">
            <Button variant="outline" size="lg" className="gap-2 mt-4">
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
        return "from-red-600 via-rose-600 to-pink-600";
      case "TEACHER":
        return "from-blue-600 via-indigo-600 to-purple-600";
      case "STUDENT":
        return "from-green-600 via-emerald-600 to-teal-600";
      default:
        return "from-gray-600 via-slate-600 to-zinc-600";
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

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pb-12">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/admin/users">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-zinc-950/80 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("admin.userDetails.backToUsers")}
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <div
            className={`h-40 bg-linear-to-r ${getRoleGradient()} relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-white/30"></div>
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
                    className="w-36 h-36 rounded-3xl object-cover border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div
                    className={`w-36 h-36 rounded-3xl bg-linear-to-br ${getRoleGradient()} flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white group-hover:scale-105 transition-transform duration-300`}
                  >
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                  {user.is_active ? (
                    <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
                  )}
                </div>
              </div>

              <div className="flex-1 sm:mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                        {user.email.split("@")[0]}
                      </h1>
                      {user.role === "ADMIN" && (
                        <Award className="w-8 h-8 text-amber-500" />
                      )}
                    </div>
                    <p className="text-gray-600 text-lg mb-4">{user.email}</p>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <RoleBadge role={user.role} />
                      <StatusBadge isActive={user.is_active} />
                    </div>

                    {user.created_at && (
                      <div className="inline-flex items-center gap-3 bg-linear-to-r from-emerald-50 to-teal-50 backdrop-blur-sm rounded-2xl px-5 py-3 border border-emerald-200/50 shadow-sm hover:shadow-md transition-all">
                        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-md">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                            {t("admin.userDetails.memberSince")}
                          </p>
                          <p className="text-base font-bold text-gray-900">
                            {new Date(user.created_at).toLocaleDateString(
                              locale,
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-xs text-emerald-600 font-medium">
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
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-200/50 p-6 sm:p-10 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {t("admin.userDetails.accountInfo")}
              </h2>
            </div>

            <div className="space-y-6">
              <div className="group hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 -mx-6 px-6 py-5 rounded-2xl transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    <Mail className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                      {t("admin.userDetails.emailAddress")}
                    </p>
                    <p className="text-xl font-semibold text-gray-900 break-all">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group hover:bg-linear-to-r hover:from-purple-50 hover:to-pink-50 -mx-6 px-6 py-5 rounded-2xl transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-purple-100 to-purple-200 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    <Shield className="w-7 h-7 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">
                      {t("admin.userDetails.userId")}
                    </p>
                    <p className="text-xl font-mono font-semibold text-gray-900">
                      {user.user_id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t-2 border-gradient-to-r from-gray-100 via-gray-200 to-gray-100">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-amber-400 via-orange-500 to-pink-600 mb-5 shadow-2xl hover:scale-110 transition-transform duration-300">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                    {t("admin.userDetails.digitalIdCard")}
                  </h3>
                  <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed">
                    {t("admin.userDetails.digitalIdCardDesc")}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="h-1.5 w-12 bg-linear-to-r from-amber-500 to-orange-500 rounded-full"></div>
                    <div className="h-1.5 w-1.5 bg-orange-400 rounded-full"></div>
                    <div className="h-1.5 w-1.5 bg-orange-400 rounded-full"></div>
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
              className={`bg-linear-to-br ${getRoleGradient()} rounded-3xl shadow-2xl p-6 text-white hover:shadow-3xl hover:scale-105 transition-all duration-300`}
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
              className={`rounded-3xl shadow-2xl p-6 text-white hover:shadow-3xl hover:scale-105 transition-all duration-300 ${user.is_active ? "bg-linear-to-br from-green-500 via-emerald-600 to-teal-600" : "bg-linear-to-br from-gray-500 via-slate-600 to-zinc-600"}`}
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

            <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t("admin.userDetails.quickInfo")}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b-2 border-gray-100">
                  <span className="text-sm text-gray-600 font-medium">
                    {t("admin.userDetails.accountType")}
                  </span>
                  <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b-2 border-gray-100">
                  <span className="text-sm text-gray-600 font-medium">
                    {t("admin.userDetails.status")}
                  </span>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-lg ${user.is_active ? "text-green-700 bg-green-100" : "text-gray-700 bg-gray-100"}`}
                  >
                    {user.is_active
                      ? t("admin.userDetails.statusActive")
                      : t("admin.userDetails.statusInactive")}
                  </span>
                </div>
                {user.created_at && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-600 font-medium">
                      {t("admin.userDetails.accountAge")}
                    </span>
                    <span className="text-sm font-bold text-gray-900 bg-blue-100 px-3 py-1 rounded-lg">
                      {t("admin.userDetails.days", { count: daysSinceCreated })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Banner */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white hover:shadow-3xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-6 h-6" />
                <h3 className="text-2xl font-bold">
                  {t("admin.userDetails.accountManagement")}
                </h3>
              </div>
              <p className="text-blue-100 leading-relaxed text-base">
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
