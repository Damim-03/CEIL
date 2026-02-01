import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";

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
  };
}

export function StudentIDCardFlip({ profile }: StudentIDCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const fullName =
    profile.first_name || profile.last_name
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : profile.email.split("@")[0];

  const initials = profile.email.split("@")[0].slice(0, 2).toUpperCase();

  const formattedDOB = profile.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString("en-GB")
    : "DD/MM/YYYY";

  const barcode = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        x: i * 10,
        width: i % 3 === 0 ? 3 : 1,
      })),
    [],
  );

  return (
    <div className="w-full max-w-md mx-auto" style={{ perspective: "1500px" }}>
      <motion.div
        className="relative w-full cursor-pointer"
        style={{
          aspectRatio: "1.586 / 1",
          transformStyle: "preserve-3d",
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 100,
          damping: 15,
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
            {/* Red Accent Strip */}
            <div className="absolute top-0 right-0 w-8 h-full bg-linear-to-b from-blue-500 to-red-600" />

            {/* Content */}
            <div className="relative h-full p-5 pr-12">
              {/* Header with Logo */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wide">
                    EduAdmin
                  </h3>
                  <p className="text-xs text-gray-500">Student ID Card</p>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex gap-4">
                {/* Left: Info */}
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Name/الاسم الكامل</p>
                    <p className="text-sm font-bold text-gray-900">
                      {fullName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium">Level of Study / المستوى الدراسي</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {profile.education_level || "University"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Date of Birth / تاريخ الميلاد
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formattedDOB}
                    </p>
                  </div>
                </div>

                {/* Right: Photo */}
                <div className="shrink-0">
                  <div className="w-24 h-32 rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-100">
                    {profile.google_avatar ? (
                      <img
                        src={profile.google_avatar}
                        alt="Student"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center text-2xl font-bold text-gray-500">
                        {initials}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom: Barcode */}
              <div className="mt-4 pt-1 border-t border-gray-200">
                <svg className="w-32 h-8 mx-auto" viewBox="0 0 200 40">
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
                <p className="text-center text-xs font-mono text-gray-600 mt-1">
                  ID: {profile.student_id || "0000000000"}
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
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center mb-4">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>

              <h3 className="text-xl font-bold text-blue-600 uppercase tracking-wide">
                EduAdmin
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Institute of Excellence
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Instruction Text */}
      <p className="text-center text-sm text-gray-500 mt-4">
        Click the card to see {isFlipped ? "front" : "back"} side
      </p>
    </div>
  );
}
