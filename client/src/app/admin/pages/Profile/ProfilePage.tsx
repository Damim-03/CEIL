// pages/admin/profile/ProfilePage.tsx
import { useRef, useState } from "react";
import { useMe, useLogout } from "../../../../hooks/auth/auth.hooks";
import { useUpdateAdminAvatar } from "../../../../hooks/admin/useAdmin";
import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import {
  LogOut,
  Mail,
  Shield,
  Camera,
  Upload,
  Hash,
  Activity,
  Settings,
  ChevronRight,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { UserIDCardFlip } from "../../components/UserIDCardFlip";
import { useTranslation } from "react-i18next";

const ProfilePage = () => {
  const { t } = useTranslation();
  const { data: user, isLoading } = useMe();
  const logoutMutation = useLogout();
  const updateAvatarMutation = useUpdateAdminAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showIdCard, setShowIdCard] = useState(false);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert(t("admin.profile.alertImageOnly"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(t("admin.profile.alertFileSize"));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
    updateAvatarMutation.mutate(file, {
      onSuccess: () => setPreviewUrl(null),
      onError: () => setPreviewUrl(null),
    });
  };

  if (isLoading) return <PageLoader />;
  if (!user) return null;

  const currentAvatar = previewUrl || user.google_avatar || undefined;
  const userName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.email?.split("@")[0] || t("admin.profile.defaultUser");
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleConfig: Record<
    string,
    { bg: string; text: string; dot: string; labelKey: string }
  > = {
    ADMIN: {
      bg: "bg-[#2B6F5E]/10",
      text: "text-[#2B6F5E]",
      dot: "bg-[#2B6F5E]",
      labelKey: "admin.profile.roles.admin",
    },
    TEACHER: {
      bg: "bg-[#C4A035]/10",
      text: "text-[#C4A035]",
      dot: "bg-[#C4A035]",
      labelKey: "admin.profile.roles.teacher",
    },
    STUDENT: {
      bg: "bg-[#8DB896]/12",
      text: "text-[#3D7A4A]",
      dot: "bg-[#8DB896]",
      labelKey: "admin.profile.roles.student",
    },
  };
  const role = roleConfig[user.role || ""] || {
    bg: "bg-[#D8CDC0]/20",
    text: "text-[#6B5D4F]",
    dot: "bg-[#BEB29E]",
    labelKey: "",
  };
  const roleLabel = role.labelKey
    ? t(role.labelKey)
    : user.role || t("admin.profile.defaultUser");

  const infoItems = [
    {
      icon: Mail,
      label: t("admin.profile.info.email"),
      value: user.email,
      color: "#2B6F5E",
    },
    {
      icon: Shield,
      label: t("admin.profile.info.role"),
      value: roleLabel,
      color: "#C4A035",
    },
    {
      icon: Hash,
      label: t("admin.profile.info.userId"),
      value: user.user_id?.slice(0, 12) + "..." || "N/A",
      color: "#6B5D4F",
      mono: true,
    },
    {
      icon: Activity,
      label: t("admin.profile.info.status"),
      value: user.is_active
        ? t("admin.profile.active")
        : t("admin.profile.inactive"),
      color: user.is_active ? "#2B6F5E" : "#dc2626",
    },
  ];

  return (
    <div className="min-h-screen py-6 px-4 md:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ═══════════════ HERO PROFILE CARD ═══════════════ */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2B6F5E] via-[#2B6F5E]/90 to-[#1a4a3d]"></div>
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          ></div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C4A035]/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#8DB896]/15 rounded-full blur-3xl"></div>

          <div className="relative px-6 md:px-10 pt-10 pb-28 md:pb-24">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#C4A035] via-white/30 to-[#8DB896] rounded-full opacity-50 group-hover:opacity-80 blur-sm transition-all duration-500"></div>
                <div className="relative">
                  <Avatar className="h-28 w-28 md:h-32 md:w-32 border-[3px] border-white/90 shadow-2xl ring-4 ring-white/10">
                    <AvatarImage src={currentAvatar} className="object-cover" />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    disabled={updateAvatarMutation.isPending}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/40 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-75">
                      {updateAvatarMutation.isPending ? (
                        <Upload className="h-7 w-7 text-white animate-pulse" />
                      ) : (
                        <Camera className="h-7 w-7 text-white drop-shadow-lg" />
                      )}
                    </div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {user.is_active && (
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#8DB896] rounded-full border-[3px] border-[#2B6F5E] shadow-lg"></div>
                )}
              </div>

              {/* Name & Meta */}
              <div className="flex-1 text-center md:text-left space-y-2 pb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {userName}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${role.bg} ${role.text} backdrop-blur-sm border border-white/10`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${role.dot}`}
                    ></span>
                    {roleLabel}
                  </span>
                  <span className="text-white/50 text-sm">{user.email}</span>
                </div>
              </div>

              {/* Header Actions */}
              <div className="hidden md:flex items-center gap-2 pb-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/15 text-white hover:bg-white/20 backdrop-blur-sm rounded-xl gap-2 text-xs h-9"
                >
                  <Settings className="w-3.5 h-3.5" />{" "}
                  {t("admin.profile.settings")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="bg-white/10 border-white/15 text-white hover:bg-red-500/80 backdrop-blur-sm rounded-xl gap-2 text-xs h-9 border transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {logoutMutation.isPending ? "..." : t("admin.profile.logout")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ CONTENT AREA ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 -mt-20 md:-mt-16 relative z-10 px-2 md:px-4">
          {/* ── LEFT: Info Cards ── */}
          <div className="lg:col-span-3 space-y-4">
            {/* Info Grid */}
            <div className="bg-white rounded-2xl border border-[#D8CDC0]/50 shadow-lg shadow-black/[0.03] overflow-hidden">
              <div className="p-5 border-b border-[#D8CDC0]/30">
                <h2 className="text-sm font-semibold text-[#1B1B1B] tracking-wide uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C4A035]" />
                  {t("admin.profile.profileDetails")}
                </h2>
              </div>
              <div className="divide-y divide-[#D8CDC0]/20">
                {infoItems.map((item, i) => (
                  <div
                    key={i}
                    className="group flex items-center gap-4 px-5 py-4 hover:bg-[#D8CDC0]/5 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                      style={{ backgroundColor: `${item.color}10` }}
                    >
                      <item.icon
                        className="w-[18px] h-[18px]"
                        style={{ color: item.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-[#BEB29E] uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p
                        className={`text-sm font-semibold text-[#1B1B1B] truncate ${item.mono ? "font-mono text-xs mt-0.5" : ""}`}
                      >
                        {item.value}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#D8CDC0] group-hover:text-[#BEB29E] transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions - Mobile */}
            <div className="md:hidden bg-white rounded-2xl border border-[#D8CDC0]/50 shadow-lg shadow-black/[0.03] p-4 space-y-2">
              <Button
                variant="outline"
                className="w-full border-[#D8CDC0]/50 text-[#6B5D4F] hover:bg-[#D8CDC0]/10 rounded-xl justify-start gap-3 h-11"
              >
                <Settings className="w-4 h-4" />{" "}
                {t("admin.profile.securitySettings")}
              </Button>
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl justify-start gap-3 h-11"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4" />
                {logoutMutation.isPending
                  ? t("admin.profile.loggingOut")
                  : t("admin.profile.logout")}
              </Button>
            </div>

            {/* Account Insights */}
            <div className="bg-white rounded-2xl border border-[#D8CDC0]/50 shadow-lg shadow-black/[0.03] overflow-hidden">
              <div className="p-5 border-b border-[#D8CDC0]/30">
                <h2 className="text-sm font-semibold text-[#1B1B1B] tracking-wide uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#2B6F5E]" />
                  {t("admin.profile.accountOverview")}
                </h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: t("admin.profile.info.status"),
                      value: user.is_active
                        ? t("admin.profile.active")
                        : t("admin.profile.inactive"),
                      sub: user.is_active
                        ? t("admin.profile.allSystemsGo")
                        : t("admin.profile.accountDisabled"),
                      color: user.is_active ? "#2B6F5E" : "#dc2626",
                    },
                    {
                      label: t("admin.profile.auth"),
                      value: "Google",
                      sub: "OAuth 2.0",
                      color: "#C4A035",
                    },
                    {
                      label: t("admin.profile.access"),
                      value: roleLabel,
                      sub: t("admin.profile.fullPrivileges"),
                      color: "#6B5D4F",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="text-center p-4 rounded-xl bg-[#D8CDC0]/[0.06] border border-[#D8CDC0]/20"
                    >
                      <div
                        className="w-2 h-2 rounded-full mx-auto mb-2.5"
                        style={{ backgroundColor: stat.color }}
                      ></div>
                      <p className="text-sm font-bold text-[#1B1B1B]">
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-[#BEB29E] uppercase tracking-wider mt-0.5 font-medium">
                        {stat.label}
                      </p>
                      <p className="text-[10px] text-[#BEB29E]/70 mt-1">
                        {stat.sub}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: ID Card ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* ID Card */}
            <div className="bg-white rounded-2xl border border-[#D8CDC0]/50 shadow-lg shadow-black/[0.03] overflow-hidden">
              <button
                onClick={() => setShowIdCard(!showIdCard)}
                className="w-full p-5 border-b border-[#D8CDC0]/30 flex items-center justify-between hover:bg-[#D8CDC0]/5 transition-colors"
              >
                <h2 className="text-sm font-semibold text-[#1B1B1B] tracking-wide uppercase flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#2B6F5E]" />
                  {t("admin.profile.digitalIdCard")}
                </h2>
                <span className="text-[10px] font-medium text-[#BEB29E] uppercase tracking-wider">
                  {showIdCard
                    ? t("admin.profile.tapToHide")
                    : t("admin.profile.tapToFlip")}
                </span>
              </button>
              <div className="p-5">
                <UserIDCardFlip profile={user} />
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-2xl border border-[#D8CDC0]/50 shadow-lg shadow-black/[0.03] overflow-hidden">
              <div className="p-5 border-b border-[#D8CDC0]/30">
                <h2 className="text-sm font-semibold text-[#1B1B1B] tracking-wide uppercase flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#C4A035]" />
                  {t("admin.profile.security")}
                </h2>
              </div>
              <div className="p-5 space-y-3">
                {[
                  {
                    label: t("admin.profile.securityItems.twoFactor"),
                    status: t("admin.profile.securityItems.notEnabled"),
                    statusColor: "text-[#C4A035]",
                  },
                  {
                    label: t("admin.profile.securityItems.loginMethod"),
                    status: "Google OAuth",
                    statusColor: "text-[#2B6F5E]",
                  },
                  {
                    label: t("admin.profile.securityItems.accountVerification"),
                    status: user.is_active
                      ? t("admin.profile.securityItems.verified")
                      : t("admin.profile.securityItems.pending"),
                    statusColor: user.is_active
                      ? "text-[#2B6F5E]"
                      : "text-[#C4A035]",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#D8CDC0]/5 transition-colors"
                  >
                    <span className="text-xs font-medium text-[#6B5D4F]">
                      {item.label}
                    </span>
                    <span
                      className={`text-xs font-semibold ${item.statusColor}`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Support */}
            <div className="hidden md:block bg-gradient-to-br from-[#2B6F5E]/5 to-[#C4A035]/5 rounded-2xl border border-[#D8CDC0]/40 p-5">
              <p className="text-xs text-[#BEB29E] mb-3 font-medium">
                {t("admin.profile.supportText")}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-[#D8CDC0]/50 text-[#6B5D4F] hover:bg-white rounded-xl text-xs h-9"
              >
                {t("admin.profile.contactSupport")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
