import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import PageLoader from "../../../components/PageLoader";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Shield,
  CheckCircle,
  Globe,
  GraduationCap,
  MapPinned,
  Languages,
  Users,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useStudentProfile } from "../../../hooks/student/Usestudent";
import type { Profile } from "../../../types/Types";

/* ════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════ */

/** Rotating dashed ring around avatar when profile is complete */
function AvatarRing({ complete }: { complete: boolean }) {
  if (!complete) return null;
  return (
    <svg
      className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] animate-spin"
      style={{ animationDuration: "12s" }}
      viewBox="0 0 108 108"
    >
      <circle
        cx="54"
        cy="54"
        r="51"
        fill="none"
        stroke="rgba(193,150,90,0.25)"
        strokeWidth="1.5"
      />
      <circle
        cx="54"
        cy="54"
        r="51"
        fill="none"
        stroke="#C1965A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="7 17"
        opacity="0.65"
      />
    </svg>
  );
}

/** Section divider with icon + title + gradient line */
function SectionHeader({
  icon: Icon,
  title,
  teal = false,
}: {
  icon: LucideIcon;
  title: string;
  teal?: boolean;
}) {
  const color = teal
    ? "text-[#4A7066] dark:text-[#5e8a7e]"
    : "text-[#C1965A] dark:text-[#d4b07a]";
  const bg = teal
    ? "bg-[#4A7066]/10 border-[#4A7066]/20"
    : "bg-[#C1965A]/10 border-[#C1965A]/20";
  const line = teal
    ? "from-[#4A7066]/30 to-transparent"
    : "from-[#C1965A]/30 to-transparent";

  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className={`w-8 h-8 rounded-[10px] border flex items-center justify-center shrink-0 ${bg}`}
      >
        <Icon className={`w-3.75 h-3.75 ${color}`} />
      </div>
      <span
        className={`text-[0.65rem] font-bold tracking-[0.14em] uppercase ${color}`}
      >
        {title}
      </span>
      <div className={`flex-1 h-px bg-linear-to-r ${line}`} />
    </div>
  );
}

/** Info tile — view mode */
function InfoTile({
  icon: Icon,
  label,
  value,
  teal = false,
  full = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  teal?: boolean;
  full?: boolean;
}) {
  const iconBg = teal
    ? "bg-[#4A7066]/10 border-[#4A7066]/15"
    : "bg-[#C1965A]/10 border-[#C1965A]/15";
  const iconCol = teal
    ? "text-[#4A7066] dark:text-[#5e8a7e]"
    : "text-[#C1965A] dark:text-[#d4b07a]";

  return (
    <div
      className={`
        group flex items-start gap-3 p-3.5 rounded-2xl cursor-default
        bg-white/2.5 dark:bg-white/2.5
        border border-white/5.5 dark:border-white/5.5
        hover:bg-white/5 hover:border-white/10
        hover:-translate-x-0.5
        transition-all duration-200
        ${full ? "col-span-full" : ""}
      `}
    >
      <div
        className={`w-9 h-9 rounded-[10px] border flex items-center justify-center shrink-0 ${iconBg}`}
      >
        <Icon className={`w-4 h-4 ${iconCol}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[0.6rem] font-bold uppercase tracking-widest text-white/30 mb-0.75">
          {label}
        </p>
        <p
          className={`text-[0.855rem] font-medium wrap-break-wordword leading-snug ${
            value === "—" ? "text-white/20 italic" : "text-white/80"
          }`}
        >
          {value}
        </p>
      </div>
      <ChevronRight className="w-3.25 h-3.25 text-white/10 shrink-0 mt-0.5 group-hover:text-white/20 transition-colors" />
    </div>
  );
}

/** Styled input for edit mode */
function FieldInput({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder,
  helpText,
  full = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-full" : ""}>
      <label className="block text-[0.65rem] font-bold uppercase tracking-[0.09em] text-white/35 mb-1.75">
        {label}
      </label>
      <div className="rounded-xl border border-white/9 bg-white/4 focus-within:border-brand-mustard/45 focus-within:shadow-[0_0_0_3px_rgba(193,150,90,0.07)] transition-all duration-200">
        <input
          type={type}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className={`
            w-full px-3.5 py-2.75 bg-transparent border-none outline-none
            text-[0.875rem] font-medium font-body
            placeholder:text-white/20
            ${disabled ? "text-white/22 cursor-not-allowed" : "text-white/82"}
          `}
        />
      </div>
      {helpText && (
        <p className="text-[0.62rem] text-white/22 mt-1.25">{helpText}</p>
      )}
    </div>
  );
}

/** Styled select for edit mode */
function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-[0.65rem] font-bold uppercase tracking-[0.09em] text-white/35 mb-1.75">
        {label}
      </label>
      <div className="rounded-xl border border-white/9 bg-white/4 focus-within:border-brand-mustard/45 focus-within:shadow-[0_0_0_3px_rgba(193,150,90,0.07)] transition-all duration-200">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2.75 bg-transparent border-none outline-none text-[0.875rem] font-medium text-white/82 font-body cursor-pointer [&>option]:bg-[#1a2e25] [&>option]:text-white"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════ */
export default function Profile() {
  const { data: profile, isLoading, updateProfile } = useStudentProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    educationLevel: "",
    studyLocation: "",
    language: "",
    secondaryEmail: "",
  });

  if (isLoading) return <PageLoader />;

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-90">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-brand-teal-dark/30 flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7 text-brand-teal" />
          </div>
          <p className="text-white/30 font-body">Profile not found</p>
        </div>
      </div>
    );
  }

  const set = (k: keyof typeof formData) => (v: string) =>
    setFormData((f) => ({ ...f, [k]: v }));

  const handleEdit = () => {
    setFormData({
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      email: profile.email || "",
      phone: profile.phone_number || "",
      address: profile.address || "",
      dateOfBirth: profile.date_of_birth
        ? profile.date_of_birth.split("T")[0]
        : "",
      gender: profile.gender || "",
      nationality: profile.nationality || "",
      educationLevel: profile.education_level || "",
      studyLocation: profile.study_location || "",
      language: profile.language || "",
      secondaryEmail: profile.secondary_email || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile.mutate(
      {
        first_name: formData.firstName || null,
        last_name: formData.lastName || null,
        phone_number: formData.phone || null,
        address: formData.address || null,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        nationality: formData.nationality || null,
        education_level: formData.educationLevel || null,
        study_location: formData.studyLocation || null,
        language: formData.language || null,
        secondary_email: formData.secondaryEmail || null,
      },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const isSaving = updateProfile.isPending;
  const isComplete = profile.is_profile_complete;
  const fullName =
    profile.first_name || profile.last_name
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : profile.email?.split("@")[0] || "Student";
  const initials = profile.email
    ? profile.email.split("@")[0].slice(0, 2).toUpperCase()
    : "ST";

  return (
    <div className="max-w-215 mx-auto pb-12 space-y-4 font-body">
      {/* ══ HERO CARD ═══════════════════════════════════════════ */}
      <div
        className="animate-fade-up relative overflow-hidden rounded-[28px]
        bg-linear-to-br from-[#0c1e17] via-[#122a1f] to-[#0a1710]
        border border-brand-mustard/13
        shadow-[0_32px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]"
      >
        {/* Ambient orbs */}
        <div
          className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(193,150,90,0.1) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-16 -left-12 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(38,66,48,0.22) 0%, transparent 70%)",
          }}
        />
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.022] pointer-events-none">
          <defs>
            <pattern
              id="hg"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M32 0L0 0 0 32"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hg)" />
        </svg>
        {/* Gold top line */}
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{
            background:
              "linear-gradient(90deg,transparent,rgba(193,150,90,0.55),transparent)",
          }}
        />

        {/* Main content */}
        <div className="relative px-8 pt-9 pb-6 flex flex-wrap gap-7 items-center">
          {/* Avatar */}
          <div className="relative w-24 h-24 shrink-0">
            <AvatarRing complete={isComplete} />
            {profile.google_avatar ? (
              <img
                src={profile.google_avatar}
                alt="avatar"
                className="w-full h-full rounded-full object-cover border-[2.5px] border-brand-mustard/28"
              />
            ) : (
              <div
                className="w-full h-full rounded-full border-[2.5px] border-brand-mustard/28
                  bg-linear-to-br from-[#1a3028] to-brand-teal-dark
                  flex items-center justify-center
                  font-sans text-[1.5rem] font-black text-brand-mustard tracking-wider"
              >
                {initials}
              </div>
            )}
            {isComplete && (
              <div
                className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full
                bg-linear-to-br from-brand-mustard to-brand-mustard-light
                border-[2.5px] border-[#0c1e17]
                flex items-center justify-center
                shadow-[0_2px_8px_rgba(193,150,90,0.4)]"
              >
                <CheckCircle className="w-3 h-3 text-[#0c1e17]" />
              </div>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-45">
            <p className="text-[0.58rem] font-bold tracking-[0.18em] uppercase text-brand-teal dark:text-brand-teal-light mb-1">
              CEIL · Student Portal
            </p>
            <h1 className="font-sans text-[clamp(1.55rem,4vw,2.1rem)] font-black text-white leading-[1.12] mb-1.5">
              {fullName}
            </h1>
            <p className="text-[0.78rem] text-white/30 mb-3.5">
              {profile.email}
            </p>
            <div className="flex flex-wrap gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-0.75 rounded-full text-[0.65rem] font-bold
                bg-brand-teal/14 text-brand-teal dark:text-brand-teal-light border border-brand-teal/28"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                Student
              </span>
              {profile.student_id && (
                <span
                  className="px-3 py-0.75 rounded-full text-[0.65rem] font-semibold
                  bg-white/5 text-white/40 border border-white/8"
                >
                  ID: {profile.student_id}
                </span>
              )}
              {profile.status === "active" && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-0.75 rounded-full text-[0.65rem] font-semibold
                  bg-white/5 text-white/45 border border-white/8"
                >
                  <CheckCircle className="w-2.5 h-2.5" /> Active
                </span>
              )}
              {isComplete && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-0.75 rounded-full text-[0.65rem] font-bold
                  bg-brand-mustard/10 text-brand-mustard dark:text-brand-mustard-light border border-brand-mustard/25"
                >
                  <Sparkles className="w-2.5 h-2.5" /> Enrollment Ready
                </span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5 shrink-0 flex-wrap">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[14px]
                  border border-brand-mustard/35 bg-brand-mustard/8 text-brand-mustard dark:text-brand-mustard-light
                  text-[0.82rem] font-bold font-body cursor-pointer
                  hover:bg-brand-mustard/18 hover:border-brand-mustard/55
                  transition-all duration-200"
              >
                <Edit className="w-3.75 h-3.75" /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[14px]
                    border border-white/9 bg-white/4 text-white/45
                    text-[0.8rem] font-semibold font-body cursor-pointer
                    hover:bg-white/8 transition-all duration-200 disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[14px]
                    bg-linear-to-r from-brand-mustard to-brand-mustard-light text-[#0c1e17]
                    text-[0.82rem] font-extrabold font-body cursor-pointer border-none
                    shadow-[0_4px_20px_rgba(193,150,90,0.28)]
                    hover:shadow-[0_6px_28px_rgba(193,150,90,0.4)] hover:-translate-y-px
                    transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  <Save className="w-3.75 h-3.75" />{" "}
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative px-8 pb-7 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
          {[
            {
              icon: Shield as LucideIcon,
              label: "Status",
              value:
                profile.status === "active"
                  ? "Active"
                  : profile.status || "Unknown",
              teal: true,
            },
            {
              icon: CheckCircle as LucideIcon,
              label: "Eligibility",
              value: isComplete ? "Eligible" : "Not Eligible",
              gold: true,
            },
            ...(profile.created_at
              ? [
                  {
                    icon: Calendar as LucideIcon,
                    label: "Member Since",
                    value: new Date(profile.created_at).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "short" },
                    ),
                  },
                ]
              : []),
          ].map(
            (
              s: {
                icon: LucideIcon;
                label: string;
                value: string;
                teal?: boolean;
                gold?: boolean;
              },
              i,
            ) => {
              const iconBg = s.teal
                ? "bg-[#4A7066]/12 border-[#4A7066]/20"
                : "bg-[#C1965A]/12 border-[#C1965A]/20";
              const iconCol = s.teal
                ? "text-[#4A7066] dark:text-[#5e8a7e]"
                : "text-[#C1965A] dark:text-[#d4b07a]";
              return (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-3 rounded-[14px] bg-white/[0.035] border border-white/7"
                >
                  <div
                    className={`w-8 h-8 rounded-[9px] border flex items-center justify-center shrink-0 ${iconBg}`}
                  >
                    <s.icon className={`w-3.5 h-3.5 ${iconCol}`} />
                  </div>
                  <div>
                    <p className="text-[0.57rem] font-bold uppercase tracking-widest text-white/28 mb-0.5">
                      {s.label}
                    </p>
                    <p className="text-[0.76rem] font-semibold text-white/72">
                      {s.value}
                    </p>
                  </div>
                </div>
              );
            },
          )}
        </div>

        {/* Bottom line */}
        <div
          className="absolute bottom-0 inset-x-0 h-px"
          style={{
            background:
              "linear-gradient(90deg,transparent,rgba(193,150,90,0.18),transparent)",
          }}
        />
      </div>

      {/* ══ PERSONAL INFO CARD ══════════════════════════════════ */}
      <div
        className="animate-fade-up delay-100 relative overflow-hidden rounded-3xl
        bg-linear-to-br from-[#0e1d16] via-[#111e18] to-[#0c1a13]
        border border-white/6.5
        shadow-[0_20px_56px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.04)]"
      >
        <div className="p-7">
          <SectionHeader icon={User} title="Personal Information" teal />

          {isEditing ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3.5">
              <FieldInput
                label="First Name"
                placeholder="First name"
                value={formData.firstName}
                onChange={set("firstName")}
              />
              <FieldInput
                label="Last Name"
                placeholder="Last name"
                value={formData.lastName}
                onChange={set("lastName")}
              />
              <FieldInput
                label="Email Address"
                value={formData.email}
                disabled
                helpText="Cannot be changed"
              />
              <FieldInput
                label="Secondary Email"
                type="email"
                placeholder="Optional"
                value={formData.secondaryEmail}
                onChange={set("secondaryEmail")}
              />
              <FieldInput
                label="Phone Number"
                type="tel"
                placeholder="+213 …"
                value={formData.phone}
                onChange={set("phone")}
              />
              <FieldInput
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={set("dateOfBirth")}
              />
              <FieldSelect
                label="Gender"
                value={formData.gender}
                onChange={set("gender")}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                ]}
              />
              <FieldInput
                label="Nationality"
                placeholder="Optional"
                value={formData.nationality}
                onChange={set("nationality")}
              />
              <FieldSelect
                label="Education Level"
                value={formData.educationLevel}
                onChange={set("educationLevel")}
                options={[
                  { value: "", label: "Optional" },
                  { value: "High School", label: "High School" },
                  { value: "Bachelor's Degree", label: "Bachelor's" },
                  { value: "Master's Degree", label: "Master's" },
                  { value: "Doctorate", label: "Doctorate" },
                  { value: "Other", label: "Other" },
                ]}
              />
              <FieldInput
                label="Study Location"
                placeholder="Optional"
                value={formData.studyLocation}
                onChange={set("studyLocation")}
              />
              <FieldInput
                label="Language"
                placeholder="Optional"
                value={formData.language}
                onChange={set("language")}
              />
              <FieldInput
                label="Address"
                placeholder="Optional"
                value={formData.address}
                onChange={set("address")}
                full
              />
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-2.5">
              <InfoTile
                icon={User}
                label="Full Name"
                value={
                  profile.first_name || profile.last_name
                    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                    : "—"
                }
                teal
              />
              <InfoTile icon={Mail} label="Email" value={profile.email} />
              {profile.secondary_email && (
                <InfoTile
                  icon={Mail}
                  label="Secondary Email"
                  value={profile.secondary_email}
                />
              )}
              <InfoTile
                icon={Phone}
                label="Phone"
                value={profile.phone_number || "—"}
                teal
              />
              <InfoTile
                icon={Calendar}
                label="Date of Birth"
                value={
                  profile.date_of_birth
                    ? new Date(profile.date_of_birth).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )
                    : "—"
                }
              />
              <InfoTile
                icon={Users}
                label="Gender"
                value={profile.gender || "—"}
              />
              <InfoTile
                icon={Globe}
                label="Nationality"
                value={profile.nationality || "—"}
                teal
              />
              <InfoTile
                icon={GraduationCap}
                label="Education Level"
                value={profile.education_level || "—"}
              />
              <InfoTile
                icon={MapPinned}
                label="Study Location"
                value={profile.study_location || "—"}
                teal
              />
              <InfoTile
                icon={Languages}
                label="Language"
                value={profile.language || "—"}
              />
              <InfoTile
                icon={MapPin}
                label="Address"
                value={profile.address || "—"}
                full
              />
            </div>
          )}
        </div>
      </div>

      {/* ══ ACCOUNT INFO CARD ═══════════════════════════════════ */}
      <div
        className="animate-fade-up delay-200 relative overflow-hidden rounded-3xl
        bg-linear-to-br from-[#0e1d16] via-[#111e18] to-[#0c1a13]
        border border-white/6.5
        shadow-[0_20px_56px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.04)]"
      >
        {/* Gold left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-0.75 rounded-l-3xl"
          style={{
            background: "linear-gradient(180deg,#C1965A,rgba(193,150,90,0.1))",
          }}
        />

        <div className="p-7 pl-9">
          <SectionHeader icon={Shield} title="Account Information" />

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            {/* Status */}
            <div className="p-4 rounded-2xl bg-white/2.5 border border-white/6">
              <p className="text-[0.6rem] font-bold uppercase tracking-widest text-white/28 mb-2.5">
                Account Status
              </p>
              <span
                className={`px-3 py-0.75 rounded-full text-[0.72rem] font-bold ${
                  profile.status === "active"
                    ? "bg-brand-teal/14 text-brand-teal dark:text-brand-teal-light border border-brand-teal/28"
                    : "bg-white/5 text-white/40 border border-white/8"
                }`}
              >
                {profile.status === "active"
                  ? "● Active"
                  : profile.status || "Unknown"}
              </span>
            </div>

            {/* Member Since */}
            {profile.created_at && (
              <div className="p-4 rounded-2xl bg-white/2.5 border border-white/6">
                <p className="text-[0.6rem] font-bold uppercase tracking-widest text-white/28 mb-2">
                  Member Since
                </p>
                <p className="text-[0.875rem] font-semibold text-white/72">
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            {/* Eligibility */}
            <div
              className={`p-4 rounded-2xl border ${
                isComplete
                  ? "bg-brand-mustard/6 border-brand-mustard/22"
                  : "bg-red-500/4 border-red-500/18"
              }`}
            >
              <p className="text-[0.6rem] font-bold uppercase tracking-widest text-white/28 mb-2.5">
                Enrollment Eligibility
              </p>
              <div className="flex items-center gap-1.5">
                {isComplete ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-brand-mustard" />
                    <span className="text-[0.78rem] font-bold text-brand-mustard dark:text-brand-mustard-light">
                      Eligible to Enroll
                    </span>
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[0.78rem] font-bold text-red-400">
                      Upload a document first
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-9 py-3.5 flex items-center justify-between">
          <p className="text-[0.6rem] text-white/14 tracking-[0.08em]">
            CEIL · Centre d'Enseignement Intensif des Langues · El Oued
          </p>
          <Sparkles className="w-3 h-3 text-brand-mustard/25" />
        </div>
      </div>
    </div>
  );
}
