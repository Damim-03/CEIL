import { useMemo, useState } from "react";
import { ShieldCheck, User, GraduationCap, BookOpen } from "lucide-react";
import logo from "../../../assets/logo.jpg";

interface UserIDCardProps {
  profile: {
    user_id?: string;
    email: string;
    first_name?: string;
    last_name?: string;
    google_avatar?: string | null;
    role?: "ADMIN" | "TEACHER" | "STUDENT";
    is_active?: boolean;
  };
}

export function UserIDCardFlip({ profile }: UserIDCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const fullName =
    profile.first_name && profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile.email.split("@")[0];
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const getRoleConfig = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return {
          label: "Administrator",
          labelAr: "مدير",
          gradient: "from-[#2B6F5E] to-[#1a4a3d]",
          bgColor: "bg-[#2B6F5E]",
          textColor: "text-[#2B6F5E]",
          borderColor: "border-[#2B6F5E]/20",
          lightBg: "bg-[#2B6F5E]/8",
          icon: ShieldCheck,
          accentGradient: "from-[#2B6F5E] via-[#C4A035] to-[#2B6F5E]",
        };
      case "TEACHER":
        return {
          label: "Teacher",
          labelAr: "أستاذ",
          gradient: "from-[#C4A035] to-[#8B6914]",
          bgColor: "bg-[#C4A035]",
          textColor: "text-[#C4A035]",
          borderColor: "border-[#C4A035]/20",
          lightBg: "bg-[#C4A035]/8",
          icon: BookOpen,
          accentGradient: "from-[#C4A035] via-[#2B6F5E] to-[#C4A035]",
        };
      case "STUDENT":
        return {
          label: "Student",
          labelAr: "طالب",
          gradient: "from-[#8DB896] to-[#2B6F5E]",
          bgColor: "bg-[#8DB896]",
          textColor: "text-[#3D7A4A]",
          borderColor: "border-[#8DB896]/25",
          lightBg: "bg-[#8DB896]/10",
          icon: GraduationCap,
          accentGradient: "from-[#8DB896] via-[#C4A035] to-[#8DB896]",
        };
      default:
        return {
          label: "User",
          labelAr: "مستخدم",
          gradient: "from-[#6B5D4F] to-[#4a3f36]",
          bgColor: "bg-[#6B5D4F]",
          textColor: "text-[#6B5D4F]",
          borderColor: "border-[#D8CDC0]/40",
          lightBg: "bg-[#D8CDC0]/15",
          icon: User,
          accentGradient: "from-[#6B5D4F] via-[#BEB29E] to-[#6B5D4F]",
        };
    }
  };

  const roleConfig = getRoleConfig(profile.role);
  const RoleIcon = roleConfig.icon;

  const barcode = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        x: i * 6.5,
        width: [0, 3, 7, 11, 15, 19, 23, 27].includes(i)
          ? 3.5
          : i % 2 === 0
            ? 2
            : 1,
      })),
    [],
  );

  return (
    <div
      className="w-full max-w-[400px] mx-auto"
      style={{ perspective: "1500px" }}
    >
      {/* 
        Standard ID/credit card ratio: 85.6 × 53.98 mm ≈ 1.586:1
        Using aspect-[86/54] which is very close
      */}
      <div
        className="relative w-full aspect-[86/54] cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* ═══════ FRONT SIDE ═══════ */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div className="relative w-full h-full bg-white rounded-xl overflow-hidden border border-[#D8CDC0]/50 shadow-xl shadow-black/[0.06]">
            {/* Top accent band */}
            <div
              className={`h-1 bg-gradient-to-r ${roleConfig.accentGradient}`}
            ></div>

            {/* Side accent */}
            <div
              className={`absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b ${roleConfig.gradient} opacity-30`}
            ></div>

            {/* Watermark */}
            <div className="absolute bottom-2 right-2 opacity-[0.025]">
              <RoleIcon className="w-20 h-20" />
            </div>

            <div className="relative h-[calc(100%-4px)] p-3 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center shadow-sm`}
                >
                  <img src={logo} alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[10px] font-bold text-[#1B1B1B] uppercase tracking-[0.1em] leading-none">
                    CEIL · El-Oued
                  </h3>
                  <p className="text-[7px] text-[#BEB29E] font-medium tracking-wide leading-none mt-0.5">
                    Centre d'Enseignement Intensif des Langues
                  </p>
                </div>
                {/* Role tag */}
                <div className={`px-1.5 py-0.5 rounded ${roleConfig.lightBg}`}>
                  <p
                    className={`text-[7px] font-bold ${roleConfig.textColor} uppercase tracking-wider`}
                  >
                    {roleConfig.label}
                  </p>
                </div>
              </div>

              {/* Thin divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#D8CDC0]/40 to-transparent mb-2"></div>

              {/* Main Content */}
              <div className="flex gap-3 flex-1 min-h-0">
                {/* Photo */}
                <div className="shrink-0">
                  <div
                    className={`w-20 h-25 rounded-lg overflow-hidden border ${roleConfig.borderColor} shadow-sm`}
                  >
                    {profile.google_avatar ? (
                      <img
                        src={profile.google_avatar}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center text-sm font-bold text-white`}
                      >
                        {initials}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div className="space-y-1.5">
                    <InfoField label="Name / الاسم" value={fullName} bold />
                    <InfoField label="Email / البريد" value={profile.email} />
                    <InfoField
                      label="Role / الدور"
                      value={`${roleConfig.label} / ${roleConfig.labelAr}`}
                    />
                  </div>
                  {/* Status */}
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${profile.is_active ? "bg-[#8DB896]" : "bg-red-500"}`}
                    />
                    <p className="text-[8px] font-semibold text-[#1B1B1B]">
                      {profile.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer: Barcode */}
              <div className="mt-auto pt-1.5 border-t border-[#D8CDC0]/25 flex items-end justify-between">
                <div>
                  <svg className="w-32 h-4" viewBox="0 0 200 25">
                    {barcode.map((bar, i) => (
                      <rect
                        key={i}
                        x={bar.x}
                        y="1"
                        width={bar.width}
                        height="23"
                        fill="#1B1B1B"
                        opacity={0.6}
                        rx="0.3"
                      />
                    ))}
                  </svg>
                  <p className="text-[7px] font-mono text-[#BEB29E] tracking-[0.12em] mt-px">
                    {profile.user_id?.toUpperCase().slice(0, 16) ||
                      "0000-0000-0000-0000"}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded ${roleConfig.lightBg} flex items-center justify-center`}
                >
                  <RoleIcon className={`w-3 h-3 ${roleConfig.textColor}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ BACK SIDE ═══════ */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="relative w-full h-full bg-white rounded-xl overflow-hidden border border-[#D8CDC0]/50 shadow-xl shadow-black/[0.06]">
            {/* Top band */}
            <div
              className={`h-1 bg-linear-to-r ${roleConfig.accentGradient}`}
            ></div>

            {/* Dot pattern */}
            <div
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #1B1B1B 0.5px, transparent 0)`,
                backgroundSize: "12px 12px",
              }}
            ></div>

            <div className="relative h-[calc(100%-4px)] p-4 flex flex-col items-center justify-center text-center">

              {/* Logo */}
              <div
                className={`w-12 h-12 rounded-xl bg-linear-to-br ${roleConfig.gradient} flex items-center justify-center mb-2 shadow-md mt-6`}
              >
                <img src={logo} alt="Logo" />
              </div>

              <h3 className="text-xs font-bold text-[#1B1B1B] tracking-wide">
                CEIL · El-Oued
              </h3>
              <p className="text-[8px] text-[#BEB29E] font-medium mt-0.5 leading-relaxed">
                Centre d'Enseignement Intensif des Langues
              </p>
              <p className="text-[8px] text-[#BEB29E] font-medium" dir="rtl">
                مركز التعليم المكثف للغات
              </p>

              {/* Divider */}
              <div className="w-10 h-px bg-gradient-to-r from-transparent via-[#D8CDC0] to-transparent my-2"></div>

              <div className="space-y-0.5 text-[7px] text-[#BEB29E] leading-relaxed">
                <p>This card is the property of CEIL - Univ. Hamma Lakhdar</p>
                <p dir="rtl">هذه البطاقة ملك لمركز التعليم المكثف للغات</p>
              </div>

              {/* Bottom barcode */}
              <div className="mt-auto">
                <svg className="w-20 h-3.5 mx-auto" viewBox="0 0 200 25">
                  {barcode.map((bar, i) => (
                    <rect
                      key={i}
                      x={bar.x}
                      y="1"
                      width={bar.width}
                      height="23"
                      fill="#BEB29E"
                      opacity={0.4}
                      rx="0.3"
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flip hint */}
      <p className="text-center text-[10px] text-[#BEB29E] mt-2.5 font-medium">
        Click to see {isFlipped ? "front" : "back"} side
      </p>
    </div>
  );
}

/* ── Info Field ── */
function InfoField({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div>
      <p className="text-[7px] text-[#BEB29E] font-medium uppercase tracking-wider leading-none">
        {label}
      </p>
      <p
        className={`text-[9px] text-[#1B1B1B] truncate leading-tight mt-px ${bold ? "font-bold" : "font-semibold"}`}
      >
        {value}
      </p>
    </div>
  );
}
