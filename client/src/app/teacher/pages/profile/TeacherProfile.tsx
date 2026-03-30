import { useState, useRef, useEffect } from "react";
import {
  Mail,
  Phone,
  Camera,
  Save,
  AlertCircle,
  CheckCircle,
  Pencil,
  X,
  BookOpen,
  Layers,
  Award,
  Shield,
  Calendar,
  Loader2,
  Hash,
  Activity,
} from "lucide-react";
import {
  useTeacherProfile,
  useUpdateTeacherProfile,
  useUploadTeacherAvatar,
} from "../../../../hooks/teacher/Useteacher";
import { useLanguage } from "../../../../hooks/useLanguage";
import { UserIDCardFlip } from "../../../admin/components/UserIDCardFlip";

/* ═══ TYPES ═══ */
interface ProfileData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  google_avatar: string | null;
  role: { role_id: string; role_name: string };
  teacher: { teacher_id: string } | null;
  created_at: string;
  _count?: { groups?: number; sessions?: number; exams?: number };
}

const getLocale = (lang: string) =>
  lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US";

const getInitials = (f: string, l: string) =>
  `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();

/* ═══ SKELETON ═══ */
const ProfileSkeleton = ({ rtl }: { rtl: boolean }) => (
  <div className="space-y-5 animate-pulse" dir={rtl ? "rtl" : "ltr"}>
    <div className="h-[200px] bg-[#2B6F5E]/20 dark:bg-[#1a3326] rounded-2xl" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] h-64" />
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] h-48" />
      </div>
      <div className="space-y-4">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] h-64" />
      </div>
    </div>
  </div>
);

/* ═══ DETAIL ROW ═══ */
const DetailRow = ({
  icon: Icon,
  label,
  value,
  iconColor = "text-[#2B6F5E] dark:text-[#4ADE80]",
  iconBg = "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8",
  children,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  iconColor?: string;
  iconBg?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}) => (
  <div
    className={`flex items-center gap-4 px-5 py-4 border-b border-[#D8CDC0]/15 dark:border-[#2A2A2A]/60 last:border-0 ${onClick ? "cursor-pointer hover:bg-[#FAFAF8] dark:hover:bg-[#222222] transition-colors" : ""}`}
    onClick={onClick}
  >
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
    >
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60 font-medium mb-0.5">
        {label}
      </p>
      {children ?? (
        <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
          {value || "—"}
        </p>
      )}
    </div>
    {onClick && (
      <span className="text-[#BEB29E] dark:text-[#888888] text-xs">›</span>
    )}
  </div>
);

/* ═══ MAIN ═══ */
export default function TeacherProfile() {
  const { t, dir, isRTL, currentLang } = useLanguage();
  const locale = getLocale(currentLang);
  const { data, isLoading, isError } = useTeacherProfile();
  const updateMut = useUpdateTeacherProfile();
  const avatarMut = useUploadTeacherAvatar();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  // getProfile يرجع flat shape مباشرة:
  // { user_id, first_name, last_name, email, phone,
  //   google_avatar, avatar_url, role, teacher, _count, created_at }
  const profile: ProfileData | undefined = data ?? undefined;

  useEffect(() => {
    if (profile)
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
      });
  }, [profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) await avatarMut.mutateAsync(f);
  };

  const handleSave = async () => {
    try {
      await updateMut.mutateAsync({
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        phone: formData.phone || null,
      });
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("[TeacherProfile] save error:", err);
    }
  };

  const cancelEdit = () => {
    if (profile)
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
      });
    setIsEditing(false);
  };

  const fDate = (d: string) =>
    new Date(d).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (isLoading) return <ProfileSkeleton rtl={isRTL} />;
  if (isError || !profile)
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
          {t("teacher.profile.errorTitle")}
        </h3>
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {t("teacher.profile.errorDesc")}
        </p>
      </div>
    );

  const avatarSrc = profile.avatar_url || profile.google_avatar || null;
  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim();

  const idCardProfile = {
    user_id: profile.user_id,
    email: profile.email ?? "",
    first_name: profile.first_name,
    last_name: profile.last_name,
    google_avatar: avatarSrc,
    role: "TEACHER" as const,
    is_active: true,
  };

  const inputCls =
    "w-full h-10 px-4 bg-[#F5F5F3] dark:bg-[#111111] border border-[#D8CDC0]/50 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E]/10 dark:focus:ring-[#4ADE80]/10 transition-all";

  return (
    <div dir={dir} className="space-y-5 pb-10">
      {/* ══════════════════════════════════════════
          HERO HEADER — خلفية خضراء كالأدمن
      ══════════════════════════════════════════ */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#2B6F5E] via-[#264230] to-[#1a3326] dark:from-[#1a3326] dark:via-[#132018] dark:to-[#0f1a13]">
        {/* dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="relative px-8 py-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Avatar */}
          <div className="relative group shrink-0">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={fullName}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-white/15 border-4 border-white/20 shadow-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {getInitials(profile.first_name, profile.last_name)}
                </span>
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarMut.isPending}
              className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              {avatarMut.isPending ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            {/* online dot */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#4ADE80] border-2 border-[#1a3326]" />
          </div>

          {/* Name + meta */}
          <div className="flex-1 text-center sm:text-start">
            <h1 className="text-2xl font-bold text-white leading-tight">
              {fullName || profile.email?.split("@")[0] || ""}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/90 bg-white/15 backdrop-blur px-3 py-1 rounded-full border border-white/20">
                <Shield className="w-3 h-3" />
                {profile.role?.role_name || "TEACHER"}
              </span>
              <span className="text-sm text-white/70">
                {profile.email ?? ""}
              </span>
            </div>
          </div>

          {/* Edit / Save buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="h-9 px-4 text-sm font-medium text-white bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl transition-all flex items-center gap-2 backdrop-blur"
              >
                <Pencil className="w-3.5 h-3.5" />
                {t("teacher.profile.edit")}
              </button>
            ) : (
              <>
                <button
                  onClick={cancelEdit}
                  className="h-9 px-4 text-sm font-medium text-white/80 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  {t("teacher.profile.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateMut.isPending}
                  className="h-9 px-4 text-sm font-medium text-[#1a3326] bg-white hover:bg-white/90 disabled:opacity-50 rounded-xl transition-all flex items-center gap-2 font-semibold"
                >
                  {updateMut.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {t("teacher.profile.save")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Success toast ── */}
      {showSuccess && (
        <div className="flex items-center gap-2 bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 border border-[#2B6F5E]/15 dark:border-[#4ADE80]/15 rounded-xl px-4 py-3 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
          <span className="text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80]">
            {t("teacher.profile.savedSuccess")}
          </span>
        </div>
      )}

      {/* ══════════════════════════════════════════
          BODY — عمودان: تفاصيل | بطاقة الهوية
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left/Main column ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* تفاصيل الملف الشخصي */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#D8CDC0]/20 dark:border-[#2A2A2A]">
              <div className="w-8 h-8 rounded-lg bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 flex items-center justify-center">
                <Activity className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
              </div>
              <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("teacher.profile.personalInfo")}
              </h3>
            </div>

            <DetailRow
              icon={Mail}
              label={t("teacher.profile.email")}
              iconColor="text-[#2B6F5E] dark:text-[#4ADE80]"
              iconBg="bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8"
            >
              <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {profile.email ?? "—"}
              </p>
            </DetailRow>

            <DetailRow
              icon={Phone}
              label={t("teacher.profile.phone")}
              iconColor="text-[#C4A035]"
              iconBg="bg-[#C4A035]/8"
            >
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder={t("teacher.profile.phonePlaceholder")}
                  className={inputCls}
                  dir="ltr"
                />
              ) : (
                <p
                  className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]"
                  dir="ltr"
                >
                  {profile.phone || (
                    <span className="text-[#BEB29E] dark:text-[#888888] font-normal">
                      —
                    </span>
                  )}
                </p>
              )}
            </DetailRow>
          </div>

          {/* نظرة عامة */}
          {
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#D8CDC0]/20 dark:border-[#2A2A2A]">
                <div className="w-8 h-8 rounded-lg bg-[#C4A035]/8 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-[#C4A035]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  نظرة عامة على الحساب
                </h3>
              </div>
              <div className="grid grid-cols-3 divide-x dark:divide-[#2A2A2A] divide-[#D8CDC0]/20 rtl:divide-x-reverse">
                {[
                  {
                    label: t("teacher.profile.group"),
                    value: profile._count?.groups ?? 0,
                    icon: Layers,
                    color: "text-[#2B6F5E] dark:text-[#4ADE80]",
                    bg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8",
                    sub: "المجموعات",
                  },
                  {
                    label: t("teacher.profile.session"),
                    value: profile._count?.sessions ?? 0,
                    icon: BookOpen,
                    color: "text-[#C4A035]",
                    bg: "bg-[#C4A035]/8",
                    sub: "الحصص",
                  },
                  {
                    label: t("teacher.profile.exam"),
                    value: profile._count?.exams ?? 0,
                    icon: Award,
                    color: "text-purple-500",
                    bg: "bg-purple-500/8",
                    sub: "الاختبارات",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col items-center justify-center py-6 gap-2"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}
                    >
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[11px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
                      {s.sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          }

          {/* معلومات الحساب */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#D8CDC0]/20 dark:border-[#2A2A2A]">
              <div className="w-8 h-8 rounded-lg bg-[#D8CDC0]/15 dark:bg-[#2A2A2A]/40 flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#6B5D4F] dark:text-[#AAAAAA]" />
              </div>
              <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("teacher.profile.accountInfo")}
              </h3>
            </div>
            <DetailRow
              icon={Shield}
              label={t("teacher.profile.role")}
              iconColor="text-[#2B6F5E] dark:text-[#4ADE80]"
              iconBg="bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8"
            >
              <span className="inline-flex items-center text-xs font-bold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 px-3 py-1 rounded-full">
                {profile.role?.role_name || "TEACHER"}
              </span>
            </DetailRow>
            <DetailRow
              icon={Hash}
              label={t("teacher.profile.userId")}
              iconColor="text-[#6B5D4F] dark:text-[#AAAAAA]"
              iconBg="bg-[#D8CDC0]/15 dark:bg-[#2A2A2A]/40"
            >
              <p className="text-xs font-mono text-[#BEB29E] dark:text-[#888888] bg-[#D8CDC0]/10 dark:bg-[#2A2A2A]/20 px-2.5 py-1 rounded-lg inline-block">
                {profile.user_id?.slice(0, 14)}…
              </p>
            </DetailRow>
            <DetailRow
              icon={Calendar}
              label={t("teacher.profile.joinDate")}
              iconColor="text-blue-500"
              iconBg="bg-blue-500/8"
              value={fDate(profile.created_at)}
            />
          </div>
        </div>

        {/* ── Right column: ID card ── */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/20 dark:border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#C4A035]/8 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#C4A035]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {t("teacher.profile.idCard") || "بطاقة الهوية الرقمية"}
                </h3>
              </div>
              <span className="text-[10px] text-[#BEB29E] dark:text-[#888888]">
                اضغط للقلب
              </span>
            </div>
            <div className="p-5">
              <UserIDCardFlip profile={idCardProfile} />
            </div>
          </div>

          {/* Edit name fields — only when editing */}
          {isEditing && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#2B6F5E]/30 dark:border-[#4ADE80]/20 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2B6F5E]/15 dark:border-[#4ADE80]/10">
                <div className="w-8 h-8 rounded-lg bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
                </div>
                <h3 className="text-sm font-semibold text-[#2B6F5E] dark:text-[#4ADE80]">
                  تعديل الاسم
                </h3>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="text-[11px] text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70 font-medium mb-1.5 block">
                    {t("teacher.profile.firstName")}
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, first_name: e.target.value }))
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70 font-medium mb-1.5 block">
                    {t("teacher.profile.lastName")}
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, last_name: e.target.value }))
                    }
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
