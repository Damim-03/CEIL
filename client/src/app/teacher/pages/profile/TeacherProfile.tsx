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

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */

interface ProfileData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  google_avatar: string | null;
  role: {
    role_id: string;
    role_name: string;
  };
  teacher: {
    teacher_id: string;
    specialization: string | null;
    bio: string | null;
  } | null;
  created_at: string;
  _count?: {
    groups?: number;
    sessions?: number;
    exams?: number;
  };
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

const getInitials = (first: string, last: string) =>
  `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();

const formatJoinDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/* ═══════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════ */

const ProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse" dir="rtl">
    <div>
      <div className="h-7 w-36 bg-[#D8CDC0]/30 rounded-lg" />
      <div className="h-4 w-52 bg-[#D8CDC0]/20 rounded-lg mt-2" />
    </div>
    <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 h-[200px]" />
    <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 h-[350px]" />
  </div>
);

/* ═══════════════════════════════════════════════════════════
   FIELD ROW
═══════════════════════════════════════════════════════════ */

const FieldRow = ({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0 py-4 border-b border-[#D8CDC0]/10 last:border-b-0">
    <div className="flex items-center gap-2 sm:w-40 shrink-0">
      <Icon className="w-4 h-4 text-[#BEB29E]" />
      <span className="text-xs font-medium text-[#6B5D4F]/70">{label}</span>
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

export default function TeacherProfile() {
  const { data, isLoading, isError } = useTeacherProfile();
  const updateMutation = useUpdateTeacherProfile();
  const avatarMutation = useUploadTeacherAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  /* ── Sync form with profile data ── */
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        specialization: profile.teacher?.specialization || "",
        bio: profile.teacher?.bio || "",
      });
    }
  }, [profile]);

  /* ── Handle avatar upload ── */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await avatarMutation.mutateAsync(file);
  };

  /* ── Handle save ── */
  const handleSave = async () => {
    await updateMutation.mutateAsync({
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

  /* ── Cancel editing ── */
  const cancelEdit = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        specialization: profile.teacher?.specialization || "",
        bio: profile.teacher?.bio || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) return <ProfileSkeleton />;

  if (isError || !profile) {
    return (
      <div
        dir="rtl"
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">
          تعذّر تحميل الملف الشخصي
        </h3>
        <p className="text-sm text-[#6B5D4F]/70">يرجى المحاولة لاحقاً</p>
      </div>
    );
  }

  const avatarSrc = profile.avatar_url || profile.google_avatar;

  return (
    <div dir="rtl" className="space-y-6 pb-8 max-w-3xl">
      {/* ══════════════════════════════════════════
         HEADER
      ══════════════════════════════════════════ */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B]">الملف الشخصي</h1>
          <p className="text-sm text-[#6B5D4F]/70 mt-0.5">
            عرض وتعديل بياناتك الشخصية
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="h-10 px-5 text-sm font-medium text-[#2B6F5E] bg-[#2B6F5E]/8 hover:bg-[#2B6F5E]/15 rounded-xl transition-colors flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            تعديل
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={cancelEdit}
              className="h-10 px-4 text-sm font-medium text-[#6B5D4F] hover:bg-[#D8CDC0]/20 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="h-10 px-5 text-sm font-medium text-white bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 disabled:opacity-40 rounded-xl transition-colors flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              حفظ
            </button>
          </div>
        )}
      </div>

      {/* Success toast */}
      {showSuccess && (
        <div className="flex items-center gap-2 bg-[#2B6F5E]/5 border border-[#2B6F5E]/15 rounded-xl px-4 py-3 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#2B6F5E]" />
          <span className="text-sm font-medium text-[#2B6F5E]">
            تم حفظ التعديلات بنجاح
          </span>
        </div>
      )}

      {/* ══════════════════════════════════════════
         AVATAR + NAME CARD
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-l from-[#2B6F5E] via-[#2B6F5E]/50 to-transparent" />

        <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={`${profile.first_name} ${profile.last_name}`}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-[#D8CDC0]/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-[#2B6F5E]/10 border-2 border-[#D8CDC0]/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#2B6F5E]">
                  {getInitials(profile.first_name, profile.last_name)}
                </span>
              </div>
            )}

            {/* Upload overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarMutation.isPending}
              className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
            >
              {avatarMutation.isPending ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            {/* Small camera badge */}
            <div className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-[#2B6F5E] border-2 border-white flex items-center justify-center shadow-sm">
              <Camera className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Name + role */}
          <div className="text-center sm:text-right flex-1">
            <h2 className="text-xl font-bold text-[#1B1B1B]">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-sm text-[#6B5D4F]/60 mt-0.5">{profile.email}</p>
            <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#2B6F5E] bg-[#2B6F5E]/8 px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3" />
                {profile.role?.role_name || "أستاذ"}
              </span>
              {profile.teacher?.specialization && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#C4A035] bg-[#C4A035]/8 px-3 py-1.5 rounded-full">
                  <Award className="w-3 h-3" />
                  {profile.teacher.specialization}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#6B5D4F]/50">
                <Calendar className="w-3 h-3" />
                عضو منذ {formatJoinDate(profile.created_at)}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          {profile._count && (
            <div className="flex sm:flex-col gap-4 sm:gap-2 shrink-0">
              {[
                {
                  label: "مجموعة",
                  value: profile._count.groups ?? 0,
                  icon: Layers,
                },
                {
                  label: "حصة",
                  value: profile._count.sessions ?? 0,
                  icon: BookOpen,
                },
                {
                  label: "امتحان",
                  value: profile._count.exams ?? 0,
                  icon: Award,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 text-center sm:text-right"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#D8CDC0]/12 flex items-center justify-center">
                    <s.icon className="w-3.5 h-3.5 text-[#6B5D4F]/50" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1B1B1B] leading-tight">
                      {s.value}
                    </p>
                    <p className="text-[10px] text-[#6B5D4F]/40">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
         PROFILE FIELDS
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#D8CDC0]/25">
          <div className="w-9 h-9 rounded-lg bg-[#2B6F5E]/8 flex items-center justify-center">
            <User className="w-[18px] h-[18px] text-[#2B6F5E]" />
          </div>
          <h3 className="text-sm font-semibold text-[#1B1B1B]">
            المعلومات الشخصية
          </h3>
        </div>

        <div className="px-6 py-2">
          {/* First name */}
          <FieldRow label="الاسم" icon={User}>
            {isEditing ? (
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, first_name: e.target.value }))
                }
                className="w-full h-10 px-4 bg-[#FAFAF8] border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10"
              />
            ) : (
              <span className="text-sm text-[#1B1B1B]">
                {profile.first_name}
              </span>
            )}
          </FieldRow>

          {/* Last name */}
          <FieldRow label="اللقب" icon={User}>
            {isEditing ? (
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, last_name: e.target.value }))
                }
                className="w-full h-10 px-4 bg-[#FAFAF8] border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10"
              />
            ) : (
              <span className="text-sm text-[#1B1B1B]">
                {profile.last_name}
              </span>
            )}
          </FieldRow>

          {/* Email (read-only) */}
          <FieldRow label="البريد الإلكتروني" icon={Mail}>
            <span className="text-sm text-[#1B1B1B]">{profile.email}</span>
            {isEditing && (
              <span className="text-[10px] text-[#BEB29E] mr-2">
                (غير قابل للتغيير)
              </span>
            )}
          </FieldRow>

          {/* Phone */}
          <FieldRow label="رقم الهاتف" icon={Phone}>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="مثال: 0550000000"
                className="w-full h-10 px-4 bg-[#FAFAF8] border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] placeholder:text-[#BEB29E] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10"
                dir="ltr"
              />
            ) : (
              <span className="text-sm text-[#1B1B1B]" dir="ltr">
                {profile.phone || <span className="text-[#BEB29E]">—</span>}
              </span>
            )}
          </FieldRow>

          {/* Specialization */}
          <FieldRow label="التخصص" icon={Award}>
            {isEditing ? (
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, specialization: e.target.value }))
                }
                placeholder="مثال: اللغة الإنجليزية"
                className="w-full h-10 px-4 bg-[#FAFAF8] border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] placeholder:text-[#BEB29E] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10"
              />
            ) : (
              <span className="text-sm text-[#1B1B1B]">
                {profile.teacher?.specialization || (
                  <span className="text-[#BEB29E]">—</span>
                )}
              </span>
            )}
          </FieldRow>

          {/* Bio */}
          <FieldRow label="نبذة" icon={BookOpen}>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, bio: e.target.value }))
                }
                placeholder="اكتب نبذة قصيرة عنك..."
                rows={3}
                className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] placeholder:text-[#BEB29E] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10 resize-none"
              />
            ) : (
              <span className="text-sm text-[#1B1B1B] leading-relaxed">
                {profile.teacher?.bio || (
                  <span className="text-[#BEB29E]">لم تتم إضافة نبذة بعد</span>
                )}
              </span>
            )}
          </FieldRow>
        </div>
      </div>

      {/* ══════════════════════════════════════════
         ACCOUNT INFO (read-only)
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#D8CDC0]/25">
          <div className="w-9 h-9 rounded-lg bg-[#D8CDC0]/15 flex items-center justify-center">
            <Shield className="w-[18px] h-[18px] text-[#6B5D4F]" />
          </div>
          <h3 className="text-sm font-semibold text-[#1B1B1B]">
            معلومات الحساب
          </h3>
        </div>

        <div className="px-6 py-2">
          <FieldRow label="الدور" icon={Shield}>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2B6F5E] bg-[#2B6F5E]/8 px-3 py-1 rounded-full">
              {profile.role?.role_name || "أستاذ"}
            </span>
          </FieldRow>

          <FieldRow label="تاريخ الانضمام" icon={Calendar}>
            <span className="text-sm text-[#1B1B1B]">
              {formatJoinDate(profile.created_at)}
            </span>
          </FieldRow>

          <FieldRow label="معرّف المستخدم" icon={User}>
            <span className="text-xs font-mono text-[#BEB29E] bg-[#D8CDC0]/10 px-2.5 py-1 rounded-lg">
              {profile.user_id}
            </span>
          </FieldRow>
        </div>
      </div>
    </div>
  );
}
