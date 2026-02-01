import { useMemo, useState } from "react";
import { ShieldCheck, User } from "lucide-react";

interface UserIDCardProps {
  profile: {
    user_id?: string;
    email: string;
    google_avatar?: string;
    role?: "ADMIN" | "TEACHER" | "STUDENT";
    is_active?: boolean;
  };
}

export function UserIDCardFlip({ profile }: UserIDCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const fullName = profile.email.split("@")[0];
  const initials = profile.email.split("@")[0].slice(0, 2).toUpperCase();

  // Get role display and colors
  const getRoleConfig = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return {
          label: "Administrator",
          gradient: "from-purple-500 to-indigo-600",
          bgColor: "bg-purple-500",
          textColor: "text-purple-600",
          borderColor: "border-purple-200",
        };
      case "TEACHER":
        return {
          label: "Teacher",
          gradient: "from-emerald-500 to-teal-600",
          bgColor: "bg-emerald-500",
          textColor: "text-emerald-600",
          borderColor: "border-emerald-200",
        };
      case "STUDENT":
        return {
          label: "Student",
          gradient: "from-blue-500 to-cyan-600",
          bgColor: "bg-blue-500",
          textColor: "text-blue-600",
          borderColor: "border-blue-200",
        };
      default:
        return {
          label: "User",
          gradient: "from-gray-500 to-slate-600",
          bgColor: "bg-gray-500",
          textColor: "text-gray-600",
          borderColor: "border-gray-200",
        };
    }
  };

  const roleConfig = getRoleConfig(profile.role);

  const barcode = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        x: i * 10,
        width: i % 3 === 0 ? 3 : 1,
      })),
    [],
  );

  return (
    <div className="w-full" style={{ perspective: "1500px" }}>
      <div
        className="relative w-full cursor-pointer transition-transform duration-600"
        style={{
          minHeight: "280px",
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT SIDE */}
        <div
          className="absolute inset-0 rounded-2xl shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div className="relative h-full bg-white rounded-2xl overflow-hidden border-2 border-gray-200">
            {/* Accent Strip */}
            <div
              className={`absolute top-0 right-0 w-6 h-full bg-linear-to-b ${roleConfig.gradient}`}
            />

            {/* Content */}
            <div className="relative h-full p-4 pr-10">
              {/* Header with Logo */}
              <div className="flex items-start gap-2 mb-3">
                <div
                  className={`w-9 h-9 rounded-lg ${roleConfig.bgColor} flex items-center justify-center shrink-0`}
                >
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-xs font-bold ${roleConfig.textColor} uppercase tracking-wide`}
                  >
                    EduAdmin
                  </h3>
                  <p className="text-[10px] text-gray-500">User ID Card</p>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex gap-3">
                {/* Left: Info */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium">
                      Name/الاسم
                    </p>
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {fullName}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 font-medium">
                      Email/البريد
                    </p>
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {profile.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 font-medium">
                      Role/الدور
                    </p>
                    <p className="text-xs font-semibold text-gray-800">
                      {roleConfig.label}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 font-medium">
                      Status/الحالة
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          profile.is_active ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <p className="text-xs font-semibold text-gray-800">
                        {profile.is_active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Photo */}
                <div className="shrink-0">
                  <div
                    className={`w-20 h-28 rounded-lg overflow-hidden border-2 ${roleConfig.borderColor} bg-gray-100`}
                  >
                    {profile.google_avatar ? (
                      <img
                        src={profile.google_avatar}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-linear-to-br ${roleConfig.gradient} flex items-center justify-center text-xl font-bold text-white`}
                      >
                        {initials}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom: Barcode */}
              <div className="mt-3 pt-2 border-t border-gray-200">
                <svg className="w-28 h-7 mx-auto" viewBox="0 0 200 40">
                  {barcode.map((bar, i) => (
                    <rect
                      key={i}
                      x={bar.x}
                      y="5"
                      width={bar.width}
                      height="30"
                      fill="black"
                    />
                  ))}
                </svg>
                <p className="text-center text-[10px] font-mono text-gray-600 mt-0.5">
                  ID: {profile.user_id || "0000000000"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          className="absolute inset-0 rounded-2xl shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="relative h-full bg-white rounded-2xl overflow-hidden border-2 border-gray-200">
            <div className="relative h-full p-6 flex flex-col items-center justify-center text-center">
              <div
                className={`w-16 h-16 rounded-full ${roleConfig.bgColor} flex items-center justify-center mb-3`}
              >
                {profile.role === "ADMIN" ? (
                  <ShieldCheck className="w-10 h-10 text-white" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>

              <h3
                className={`text-lg font-bold ${roleConfig.textColor} uppercase tracking-wide`}
              >
                EduAdmin
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Institute of Excellence
              </p>

              <div className="mt-4 space-y-1 text-[10px] text-gray-600">
                <p>This card is property of EduAdmin</p>
                <p>If found, please return to administration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instruction Text */}
      <p className="text-center text-xs text-gray-500 mt-3">
        Click the card to see {isFlipped ? "front" : "back"} side
      </p>
    </div>
  );
}
