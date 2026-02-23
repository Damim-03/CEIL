import { useState, useRef, useEffect } from "react";
import {
  User,
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
} from "lucide-react";
import {
  useTeacherProfile,
  useUpdateTeacherProfile,
  useUploadTeacherAvatar,
} from "../../../../hooks/teacher/Useteacher";
import { useLanguage } from "../../../../hooks/useLanguage";

/* ═══ TYPES ═══ */
interface ProfileData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  google_avatar: string | null;
  role: { role_id: string; role_name: string };
  teacher: {
    teacher_id: string;
    specialization: string | null;
    bio: string | null;
  } | null;
  created_at: string;
  _count?: { groups?: number; sessions?: number; exams?: number };
}

const getLocale = (lang: string) =>
  lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US";
const getInitials = (f: string, l: string) =>
  `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();

const ProfileSkeleton = ({ rtl }: { rtl: boolean }) => (
  <div className="space-y-6 animate-pulse" dir={rtl ? "rtl" : "ltr"}>
    <div>
      <div className="h-7 w-36 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded-lg" />
      <div className="h-4 w-52 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded-lg mt-2" />
    </div>
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[200px]" />
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[350px]" />
  </div>
);

const FieldRow = ({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0 py-4 border-b border-[#D8CDC0]/1 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/40 last:border-b-0">
    <div className="flex items-center gap-2 sm:w-40 shrink-0">
      <Icon className="w-4 h-4 text-[#BEB29E] dark:text-[#888888]" />
      <span className="text-xs font-medium text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
        {label}
      </span>
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

export default function TeacherProfile() {
  const { t, dir, isRTL, currentLang } = useLanguage();
  const locale = getLocale(currentLang);
  const { data, isLoading, isError } = useTeacherProfile();
  const updateMut = useUpdateTeacherProfile();
  const avatarMut = useUploadTeacherAvatar();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    specialization: "",
    bio: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const profile: ProfileData | undefined = data?.user ?? data;

  useEffect(() => {
    if (profile)
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        specialization: profile.teacher?.specialization || "",
        bio: profile.teacher?.bio || "",
      });
  }, [profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) await avatarMut.mutateAsync(f);
  };
  const handleSave = async () => {
    await updateMut.mutateAsync({
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone || null,
      specialization: formData.specialization || null,
      bio: formData.bio || null,
    });
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  const cancelEdit = () => {
    if (profile)
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        specialization: profile.teacher?.specialization || "",
        bio: profile.teacher?.bio || "",
      });
    setIsEditing(false);
  };

  const fJoin = (d: string) =>
    new Date(d).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const gradientDir = isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r";

  if (isLoading) return <ProfileSkeleton rtl={isRTL} />;
  if (isError || !profile)
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
          {t("teacher.profile.errorTitle")}
        </h3>
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {t("teacher.profile.errorDesc")}
        </p>
      </div>
    );

  const avatarSrc = profile.avatar_url || profile.google_avatar;
  return (
    <div dir={dir} className="space-y-6 pb-8 max-w-3xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("teacher.profile.title")}
          </h1>
          <p className="text-sm text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] mt-0.5">
            {t("teacher.profile.subtitle")}
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="h-10 px-5 text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 hover:bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/15 dark:hover:bg-[#4ADE80]/15 rounded-xl transition-colors flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            {t("teacher.profile.edit")}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={cancelEdit}
              className="h-10 px-4 text-sm font-medium text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:hover:bg-[#222222] rounded-xl transition-colors flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              {t("teacher.profile.cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={updateMut.isPending}
              className="h-10 px-5 text-sm font-medium text-white bg-[#2B6F5E] dark:bg-[#4ADE80] hover:bg-[#2B6F5E]/9 dark:bg-[#4ADE80]/90 dark:hover:bg-[#4ADE80]/90 disabled:opacity-40 rounded-xl transition-colors flex items-center gap-2"
            >
              {updateMut.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {t("teacher.profile.save")}
            </button>
          </div>
        )}
      </div>

      {showSuccess && (
        <div className="flex items-center gap-2 bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border border-[#2B6F5E]/1 dark:border-[#4ADE80]/15 dark:border-[#4ADE80]/15 rounded-xl px-4 py-3 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
          <span className="text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80]">
            {t("teacher.profile.savedSuccess")}
          </span>
        </div>
      )}

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
        <div
          className={`h-1.5 ${gradientDir} from-[#2B6F5E] dark:from-[#4ADE80] via-[#2B6F5E]/50 to-transparent`}
        />
        <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={`${profile.first_name} ${profile.last_name}`}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-[#D8CDC0]/30 dark:border-[#2A2A2A]"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/10 dark:bg-[#4ADE80]/10 border-2 border-[#D8CDC0]/3 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/80 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
                  {getInitials(profile.first_name, profile.last_name)}
                </span>
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarMut.isPending}
              className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
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
            <div
              className={`absolute -bottom-1 ${isRTL ? "-right-1" : "-left-1"} w-7 h-7 rounded-full bg-[#2B6F5E] dark:bg-[#4ADE80] border-2 border-white flex items-center justify-center shadow-sm`}
            >
              <Camera className="w-3 h-3 text-white" />
            </div>
          </div>
          <div
            className={`${isRTL ? "text-center sm:text-right" : "text-center sm:text-left"} flex-1`}
          >
            <h2 className="text-xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-sm text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] mt-0.5">
              {profile.email}
            </p>
            <div
              className={`flex items-center gap-3 mt-3 justify-center ${isRTL ? "sm:justify-start" : "sm:justify-start"} flex-wrap`}
            >
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3" />
                {profile.role?.role_name || t("teacher.profile.teacher")}
              </span>
              {profile.teacher?.specialization && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#C4A035] dark:text-[#C4A035] dark:text-[#C4A035] bg-[#C4A035]/8 dark:bg-[#C4A035]/10 dark:bg-[#C4A035]/10 px-3 py-1.5 rounded-full">
                  <Award className="w-3 h-3" />
                  {profile.teacher.specialization}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
                <Calendar className="w-3 h-3" />
                {t("teacher.profile.memberSince")} {fJoin(profile.created_at)}
              </span>
            </div>
          </div>
          {profile._count && (
            <div className="flex sm:flex-col gap-4 sm:gap-2 shrink-0">
              {[
                {
                  label: t("teacher.profile.group"),
                  value: profile._count.groups ?? 0,
                  icon: Layers,
                },
                {
                  label: t("teacher.profile.session"),
                  value: profile._count.sessions ?? 0,
                  icon: BookOpen,
                },
                {
                  label: t("teacher.profile.exam"),
                  value: profile._count.exams ?? 0,
                  icon: Award,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`flex items-center gap-2 text-center ${isRTL ? "sm:text-right" : "sm:text-left"}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/12 dark:bg-[#2A2A2A]/20 flex items-center justify-center">
                    <s.icon className="w-3.5 h-3.5 text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5] leading-tight">
                      {s.value}
                    </p>
                    <p className="text-[10px] text-[#6B5D4F]/40 dark:text-[#AAAAAA]/40">
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#D8CDC0]/25 dark:border-[#2A2A2A]">
          <div className="w-9 h-9 rounded-lg bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 flex items-center justify-center">
            <User className="w-[18px] h-[18px] text-[#2B6F5E] dark:text-[#4ADE80]" />
          </div>
          <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("teacher.profile.personalInfo")}
          </h3>
        </div>
        <div className="px-6 py-2">
          <FieldRow label={t("teacher.profile.firstName")} icon={User}>
            {isEditing ? (
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, first_name: e.target.value }))
                }
                className="w-full h-10 px-4 bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10"
              />
            ) : (
              <span className="text-sm text-[#1B1B1B] dark:text-[#E5E5E5]">
                {profile.first_name}
              </span>
            )}
          </FieldRow>
          <FieldRow label={t("teacher.profile.lastName")} icon={User}>
            {isEditing ? (
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, last_name: e.target.value }))
                }
                className="w-full h-10 px-4 bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10"
              />
            ) : (
              <span className="text-sm text-[#1B1B1B] dark:text-[#E5E5E5]">
                {profile.last_name}
              </span>
            )}
          </FieldRow>
          <FieldRow label={t("teacher.profile.email")} icon={Mail}>
            <span className="text-sm text-[#1B1B1B] dark:text-[#E5E5E5]">
              {profile.email}
            </span>
            {isEditing && (
              <span className="text-[10px] text-[#BEB29E] dark:text-[#888888] ms-2">
                ({t("teacher.profile.readOnly")})
              </span>
            )}
          </FieldRow>
          <FieldRow label={t("teacher.profile.phone")} icon={Phone}>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder={t("teacher.profile.phonePlaceholder")}
                className="w-full h-10 px-4 bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] placeholder:text-[#BEB29E] dark:text-[#888888] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10"
                dir="ltr"
              />
            ) : (
              <span
                className="text-sm text-[#1B1B1B] dark:text-[#E5E5E5]"
                dir="ltr"
              >
                {profile.phone || (
                  <span className="text-[#BEB29E] dark:text-[#888888]">—</span>
                )}
              </span>
            )}
          </FieldRow>
          <FieldRow label={t("teacher.profile.specialization")} icon={Award}>
            {isEditing ? (
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, specialization: e.target.value }))
                }
                placeholder={t("teacher.profile.specPlaceholder")}
                className="w-full h-10 px-4 bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] placeholder:text-[#BEB29E] dark:text-[#888888] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10"
              />
            ) : (
              <span className="text-sm text-[#1B1B1B] dark:text-[#E5E5E5]">
                {profile.teacher?.specialization || (
                  <span className="text-[#BEB29E] dark:text-[#888888]">—</span>
                )}
              </span>
            )}
          </FieldRow>
          <FieldRow label={t("teacher.profile.bio")} icon={BookOpen}>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, bio: e.target.value }))
                }
                placeholder={t("teacher.profile.bioPlaceholder")}
                rows={3}
                className="w-full px-4 py-3 bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] placeholder:text-[#BEB29E] dark:text-[#888888] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10 resize-none"
              />
            ) : (
              <span className="text-sm text-[#1B1B1B] dark:text-[#E5E5E5] leading-relaxed">
                {profile.teacher?.bio || (
                  <span className="text-[#BEB29E] dark:text-[#888888]">
                    {t("teacher.profile.noBio")}
                  </span>
                )}
              </span>
            )}
          </FieldRow>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#D8CDC0]/25 dark:border-[#2A2A2A]">
          <div className="w-9 h-9 rounded-lg bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center">
            <Shield className="w-[18px] h-[18px] text-[#6B5D4F] dark:text-[#AAAAAA]" />
          </div>
          <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("teacher.profile.accountInfo")}
          </h3>
        </div>
        <div className="px-6 py-2">
          <FieldRow label={t("teacher.profile.role")} icon={Shield}>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 px-3 py-1 rounded-full">
              {profile.role?.role_name || t("teacher.profile.teacher")}
            </span>
          </FieldRow>
          <FieldRow label={t("teacher.profile.joinDate")} icon={Calendar}>
            <span className="text-sm text-[#1B1B1B] dark:text-[#E5E5E5]">
              {fJoin(profile.created_at)}
            </span>
          </FieldRow>
          <FieldRow label={t("teacher.profile.userId")} icon={User}>
            <span className="text-xs font-mono text-[#BEB29E] dark:text-[#888888] bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/10 dark:bg-[#2A2A2A]/15 px-2.5 py-1 rounded-lg">
              {profile.user_id}
            </span>
          </FieldRow>
        </div>
      </div>
    </div>
  );
}
