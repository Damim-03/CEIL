import { Award, Heart, Target, GraduationCap } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import Nacer from "../../assets/nacer.jpg";

// ── Team member photos — place images in src/assets/team/
// If no photo provided, falls back to initials with gradient
const TEAM = [
  {
    name: "نصر دحدة",
    nameEn: "Prof. Nacer Dehda",
    nameFr: "Prof. Nacer Dehda",
    role: "مدير المركز",
    roleEn: "Center Director",
    roleFr: "Directeur du centre",
    initials: "ن.د",
    photo: Nacer, // e.g. "/src/assets/team/director.jpg"
    gradient: "from-[#2B6F5E] to-[#1a3528]",
    accentColor: "#C4A035",
    badge: "director",
  },
  {
    name: "بدر الدين عكيشي",
    nameEn: "Mr. Badreddine Akichi",
    nameFr: "M. Badreddine Akichi",
    role: "مسؤول إداري",
    roleEn: "Administrative Officer",
    roleFr: "Responsable administratif",
    initials: "ب.ع",
    photo: null as string | null,
    gradient: "from-[#264230] to-[#2B6F5E]",
    accentColor: "#2B6F5E",
    badge: "admin",
  },
  {
    name: "كرشو زكريا",
    nameEn: "Mr. Karchou Zakaria",
    nameFr: "M. Karchou Zakaria",
    role: "مسؤول إداري",
    roleEn: "Administrative Officer",
    roleFr: "Responsable administratif",
    initials: "ك.ز",
    photo: null as string | null,
    gradient: "from-[#264230] to-[#2B6F5E]",
    accentColor: "#2B6F5E",
    badge: "admin",
  },
  {
    name: "مصباحي حسن",
    nameEn: "Mr. Mesbahi Hassan",
    nameFr: "M. Mesbahi Hassan",
    role: "مسؤول تسيير حالات الطلبة",
    roleEn: "Student Affairs Manager",
    roleFr: "Responsable de la gestion des étudiants",
    initials: "م.ح",
    photo: null as string | null,
    gradient: "from-[#5B4A1E] to-[#C4A035]",
    accentColor: "#C4A035",
    badge: "student-affairs",
  },
  {
    name: "قادي سليمان",
    nameEn: "Mr. Gadi Slimane",
    nameFr: "M. Gadi Slimane",
    role: "مسؤول إداري",
    roleEn: "Administrative Officer",
    roleFr: "Responsable administratif",
    initials: "ق.س",
    photo: null as string | null,
    gradient: "from-[#1a3528] to-[#3A8C75]",
    accentColor: "#3A8C75",
    badge: "teacher",
  },
  {
    name: "عياطي معتز بالله",
    nameEn: "Mr. Ayati Mouatez Billah",
    nameFr: "M. Ayati Mouatez Billah",
    role: "أستاذ اللغة الإنجليزية",
    roleEn: "English Language Teacher",
    roleFr: "Enseignant d'anglais",
    initials: "ع.م",
    photo: null as string | null,
    gradient: "from-[#1a3528] to-[#3A8C75]",
    accentColor: "#3A8C75",
    badge: "teacher",
  },
];

// ── Badge labels
const BADGE_LABELS: Record<
  string,
  { ar: string; fr: string; en: string; color: string }
> = {
  director: { ar: "المدير", fr: "Directeur", en: "Director", color: "#C4A035" },
  admin: { ar: "إداري", fr: "Administratif", en: "Admin", color: "#2B6F5E" },
  "student-affairs": {
    ar: "شؤون طلبة",
    fr: "Vie étudiante",
    en: "Student Life",
    color: "#7C8FA6",
  },
  teacher: { ar: "أستاذ", fr: "Enseignant", en: "Teacher", color: "#3A8C75" },
};

// ── Individual card with 3D tilt + reveal overlay
function TeamCard({
  member,
  index,
  lang,
}: {
  member: (typeof TEAM)[0];
  index: number;
  lang: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  const getName = () =>
    lang === "en" ? member.nameEn : lang === "fr" ? member.nameFr : member.name;
  const getRole = () =>
    lang === "en" ? member.roleEn : lang === "fr" ? member.roleFr : member.role;
  const badge = BADGE_LABELS[member.badge];
  const badgeLabel =
    lang === "en" ? badge.en : lang === "fr" ? badge.fr : badge.ar;

  // Always visible in marquee context
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -10, y: dx * 10 });
  };

  return (
    <div
      ref={cardRef}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
      }}
    >
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setTilt({ x: 0, y: 0 });
        }}
        style={{
          transform: hovered
            ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.04)`
            : "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)",
          transition: "transform 0.2s ease",
          transformStyle: "preserve-3d",
        }}
        className="relative group cursor-default w-[200px]"
      >
        {/* Glow halo */}
        <div
          className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
          style={{
            background: `radial-gradient(circle, ${member.accentColor}40 0%, transparent 70%)`,
          }}
        />

        {/* Card body */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 dark:border-white/5 bg-white dark:bg-[#161616] shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
          {/* Photo / Initials area */}
          <div className="relative h-52 overflow-hidden">
            {/* Gradient bg always present behind photo */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${member.gradient}`}
            />

            {/* Noise texture overlay */}
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Geometric accent lines */}
            <svg
              className="absolute inset-0 w-full h-full opacity-10"
              viewBox="0 0 200 208"
            >
              <circle
                cx="160"
                cy="30"
                r="60"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
              <circle
                cx="160"
                cy="30"
                r="40"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1="208"
                x2="200"
                y2="0"
                stroke="white"
                strokeWidth="0.4"
              />
            </svg>

            {/* Photo or initials */}
            {member.photo ? (
              <img
                src={member.photo}
                alt={getName()}
                className="absolute inset-0 w-full h-full object-cover object-top"
                style={{
                  filter: hovered
                    ? "brightness(1)"
                    : "brightness(0.9) saturate(0.95)",
                  transition: "filter 0.4s ease",
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-white/20"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span
                    className="text-3xl font-bold text-white"
                    style={{ fontFamily: "serif" }}
                  >
                    {member.initials}
                  </span>
                </div>
              </div>
            )}

            {/* Hover reveal overlay with shimmer */}
            <div
              className="absolute inset-0 transition-opacity duration-400"
              style={{
                background: `linear-gradient(135deg, ${member.accentColor}22 0%, transparent 60%)`,
                opacity: hovered ? 1 : 0,
              }}
            />

            {/* Shimmer sweep on hover */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%)",
                transform: hovered ? "translateX(200%)" : "translateX(-200%)",
                transition: hovered ? "transform 0.6s ease" : "none",
              }}
            />

            {/* Badge */}
            <div className="absolute top-3 right-3">
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: `${badge.color}22`,
                  color: badge.color === "#C4A035" ? "#C4A035" : "white",
                  border: `1px solid ${badge.color}44`,
                  backdropFilter: "blur(8px)",
                }}
              >
                {badgeLabel}
              </span>
            </div>

            {/* Bottom gradient fade into card */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white dark:from-[#161616] to-transparent" />
          </div>

          {/* Info section */}
          <div className="px-4 pt-1 pb-4">
            <h3
              className="font-bold text-[#1B1B1B] dark:text-[#E5E5E5] text-[14px] leading-snug"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {getName()}
            </h3>
            <p
              className="text-[12px] mt-0.5"
              style={{ color: member.accentColor }}
            >
              {getRole()}
            </p>

            {/* Thin accent line */}
            <div
              className="mt-3 h-[1.5px] rounded-full transition-all duration-500"
              style={{
                background: `linear-gradient(90deg, ${member.accentColor}, transparent)`,
                width: hovered ? "100%" : "30%",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component
const AboutUs = () => {
  const { t, dir, currentLang } = useLanguage();

  const VALUES = [
    {
      icon: Target,
      title: t("about.mission"),
      description: t("about.missionDesc"),
    },
    {
      icon: Heart,
      title: t("about.values"),
      description: t("about.valuesDesc"),
    },
    {
      icon: Award,
      title: t("about.excellence"),
      description: t("about.excellenceDesc"),
    },
  ];

  return (
    <div
      className="min-h-screen bg-brand-gray dark:bg-[#0F0F0F] flex flex-col"
      dir={dir}
    >
      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-teal-dark via-brand-teal-dark to-brand-teal dark:from-[#0A1A10] dark:via-[#0F1F15] dark:to-[#0A1A10]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-[10%] w-64 h-64 rounded-full border border-white/10 dark:border-white/5" />
          <div className="absolute -bottom-20 right-[5%] w-80 h-80 rounded-full border border-white/5 dark:border-white/[0.03]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1
            className="text-4xl font-bold text-white"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("about.title")}
          </h1>
          <p className="mx-auto text-lg text-white/70 max-w-2xl mt-4">
            {t("about.subtitle")}
          </p>
        </div>
      </div>

      <div className="flex-1 mx-auto max-w-7xl px-4 py-12 w-full">
        {/* ── Story ── */}
        <section className="mb-16">
          <h2
            className="text-2xl font-bold text-brand-black dark:text-[#E5E5E5] mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("about.ourStory")}
          </h2>
          <div className="flex mt-2 mb-6">
            <div className="w-12 h-1 rounded-full bg-brand-mustard" />
          </div>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige dark:border-[#2A2A2A] p-8 shadow-sm dark:shadow-black/20">
            <p className="mb-4 text-brand-black/70 dark:text-[#CCCCCC] leading-relaxed text-[15px]">
              {t("about.storyP1")}
            </p>
            <p className="text-brand-black/70 dark:text-[#CCCCCC] leading-relaxed text-[15px]">
              {t("about.storyP2")}
            </p>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="mb-16">
          <h2
            className="text-2xl font-bold text-brand-black dark:text-[#E5E5E5] mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("about.whatDrivesUs")}
          </h2>
          <div className="flex mt-2 mb-8">
            <div className="w-12 h-1 rounded-full bg-brand-mustard" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige dark:border-[#2A2A2A] p-6 hover:shadow-lg dark:hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="bg-brand-teal-dark/8 dark:bg-[#4ADE80]/[0.08] p-3 rounded-xl w-fit mb-4">
                    <Icon className="h-6 w-6 text-brand-teal-dark dark:text-[#4ADE80]" />
                  </div>
                  <h3
                    className="text-xl font-semibold text-brand-black dark:text-[#E5E5E5] mb-2"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {value.title}
                  </h3>
                  <p className="text-brand-brown dark:text-[#888888] text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Team ── */}
        <section>
          <div className="flex items-end justify-between mb-2">
            <h2
              className="text-2xl font-bold text-brand-black dark:text-[#E5E5E5]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {t("about.ourTeam")}
            </h2>
            {/* Photo instructions hint */}
            <p className="text-[11px] text-brand-brown/40 dark:text-[#555555] hidden md:block">
              {currentLang === "ar"
                ? "لإضافة صورة: member.photo = '/src/assets/team/name.jpg'"
                : "Add photo: member.photo = '/src/assets/team/name.jpg'"}
            </p>
          </div>
          <div className="flex mt-2 mb-10">
            <div className="w-12 h-1 rounded-full bg-brand-mustard" />
          </div>

          {/* ── Infinite scroll carousel ── */}
          <div
            className="relative overflow-hidden"
            dir="ltr"
            style={{
              maskImage:
                "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)",
              paddingBottom: "8px",
            }}
          >
            {/* Track — 2 copies for seamless loop */}
            <div
              className="flex gap-6 team-marquee hover:[animation-play-state:paused]"
              style={{ width: "max-content", willChange: "transform" }}
            >
              {[...TEAM, ...TEAM].map((member, i) => (
                <TeamCard
                  key={`${member.name}-${i}`}
                  member={member}
                  index={i % TEAM.length}
                  lang={currentLang}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes card-in {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes team-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-1344px); }
        }
        .team-marquee {
          animation: team-scroll 28s linear infinite;
          animation-fill-mode: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .team-marquee { animation: none; }
        }
      `}</style>
    </div>
  );
};

export default AboutUs;
