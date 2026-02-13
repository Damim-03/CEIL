import { useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import logo from "../../../assets/logo.jpg";

interface StudentIDCardProps {
  profile: {
    student_id?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    google_avatar?: string;
    date_of_birth?: string;
    education_level?: string;
    phone_number?: string;
    is_active?: boolean;
  };
}

export function StudentIDCardFlip({ profile }: StudentIDCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const fullName =
    profile.first_name || profile.last_name
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : profile.email.split("@")[0];

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedDOB = profile.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString("en-GB")
    : "DD/MM/YYYY";

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
      className="w-full max-w-100 mx-auto"
      style={{ perspective: "1500px" }}
    >
      <div
        className="relative w-full aspect-86/54 cursor-pointer"
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
          <div className="relative w-full h-full bg-white rounded-xl overflow-hidden border border-brand-beige/50 shadow-xl shadow-black/6">
            {/* Top accent band */}
            <div className="h-1 bg-linear-to-r from-[#8DB896] via-[#C4A035] to-[#8DB896]"></div>

            {/* Side accent */}
            <div className="absolute top-0 right-0 w-0.5 h-full bg-linear-to-b from-[#8DB896] to-[#2B6F5E] opacity-30"></div>

            {/* Watermark */}
            <div className="absolute bottom-2 right-2 opacity-[0.025]">
              <img src={logo} alt="logo" />
            </div>

            <div className="relative h-[calc(100%-4px)] p-3 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#8DB896] to-[#2B6F5E] flex items-center justify-center shadow-sm">
                  <img src={logo} alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[10px] font-bold text-[#1B1B1B] uppercase tracking-widest leading-none">
                    CEIL · El-Oued
                  </h3>
                  <p className="text-[7px] text-brand-brown font-medium tracking-wide leading-none mt-0.5">
                    Centre d'Enseignement Intensif des Langues
                  </p>
                </div>
                {/* Role tag */}
                <div className="px-1.5 py-0.5 rounded bg-[#8DB896]/10">
                  <p className="text-[7px] font-bold text-[#3D7A4A] uppercase tracking-wider">
                    Student
                  </p>
                </div>
              </div>

              {/* Thin divider */}
              <div className="h-px bg-linear-to-r from-transparent via-brand-beige/40 to-transparent mb-2"></div>

              {/* Main Content */}
              <div className="flex gap-3 flex-1 min-h-0">
                {/* Photo */}
                <div className="shrink-0">
                  <div className="w-25 h-35 rounded-lg overflow-hidden border border-[#8DB896]/25 shadow-sm">
                    {profile.google_avatar ? (
                      <img
                        src={profile.google_avatar}
                        alt="Student"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-[#8DB896] to-[#2B6F5E] flex items-center justify-center text-sm font-bold text-white">
                        {initials}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div className="space-y-1.5">
                    <InfoField label="Name / الاسم" value={fullName} bold />
                    <InfoField
                      label="Level / المستوى"
                      value={profile.education_level || "University"}
                    />
                    <InfoField
                      label="DOB / تاريخ الميلاد"
                      value={formattedDOB}
                    />
                  </div>
                  {/* Status */}
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${profile.is_active !== false ? "bg-[#8DB896]" : "bg-red-500"}`}
                    />
                    <p className="text-[8px] font-semibold text-[#1B1B1B]">
                      {profile.is_active !== false ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer: Barcode */}
              <div className="mt-auto pt-1.5 border-t border-brand-beige/25 flex items-end justify-between">
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
                  <p className="text-[7px] font-mono text-brand-brown tracking-[0.12em] mt-px">
                    {profile.student_id?.toUpperCase().slice(0, 16) ||
                      "0000-0000-0000-0000"}
                  </p>
                </div>
                <div className="w-5 h-5 rounded bg-[#8DB896]/10 flex items-center justify-center">
                  <GraduationCap className="w-3 h-3 text-[#3D7A4A]" />
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
          <div className="relative w-full h-full bg-white rounded-xl overflow-hidden border border-brand-beige/50 shadow-xl shadow-black/[0.06]">
            {/* Top band */}
            <div className="h-1 bg-linear-to-r from-[#8DB896] via-[#C4A035] to-[#8DB896]"></div>

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
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#8DB896] to-[#2B6F5E] flex items-center justify-center mb-2 shadow-md mt-6">
                <img src={logo} alt="Logo" />
              </div>

              <h3 className="text-xs font-bold text-[#1B1B1B] tracking-wide">
                CEIL · El-Oued
              </h3>
              <p className="text-[8px] text-brand-brown font-medium mt-0.5 leading-relaxed">
                Centre d'Enseignement Intensif des Langues
              </p>
              <p className="text-[8px] text-brand-brown font-medium" dir="rtl">
                مركز التعليم المكثف للغات
              </p>

              {/* Divider */}
              <div className="w-10 h-px bg-linear-to-r from-transparent via-brand-beige to-transparent my-2"></div>

              <div className="space-y-0.5 text-[7px] text-brand-brown leading-relaxed">
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
      <p className="text-center text-[10px] text-brand-brown mt-2.5 font-medium">
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
      <p className="text-[7px] text-brand-brown font-medium uppercase tracking-wider leading-none">
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
