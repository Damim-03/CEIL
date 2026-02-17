import { Award, Heart, Target, GraduationCap } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";

const TEAM = [
  {
    name: "د. أحمد م.",
    nameEn: "Dr. Ahmed M.",
    nameFr: "Dr. Ahmed M.",
    role: "مدير المركز",
    roleEn: "Center Director",
    roleFr: "Directeur du centre",
    initials: "أم",
  },
  {
    name: "أ. سارة ب.",
    nameEn: "Ms. Sara B.",
    nameFr: "Mme. Sara B.",
    role: "رئيسة قسم الإنجليزية",
    roleEn: "Head of English Dept.",
    roleFr: "Cheffe du dpt. d'anglais",
    initials: "سب",
  },
  {
    name: "أ. كريم ل.",
    nameEn: "Mr. Karim L.",
    nameFr: "M. Karim L.",
    role: "رئيس قسم الفرنسية",
    roleEn: "Head of French Dept.",
    roleFr: "Chef du dpt. de français",
    initials: "كل",
  },
  {
    name: "أ. نادية ر.",
    nameEn: "Ms. Nadia R.",
    nameFr: "Mme. Nadia R.",
    role: "مسؤولة الشؤون الإدارية",
    roleEn: "Admin Manager",
    roleFr: "Responsable administrative",
    initials: "نر",
  },
];

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

  const getMemberName = (m: (typeof TEAM)[0]) =>
    currentLang === "en" ? m.nameEn : currentLang === "fr" ? m.nameFr : m.name;
  const getMemberRole = (m: (typeof TEAM)[0]) =>
    currentLang === "en" ? m.roleEn : currentLang === "fr" ? m.roleFr : m.role;

  return (
    <div className="min-h-screen bg-brand-gray dark:bg-[#0F0F0F] flex flex-col" dir={dir}>
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

        <section>
          <h2
            className="text-2xl font-bold text-brand-black dark:text-[#E5E5E5] mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("about.ourTeam")}
          </h2>
          <div className="flex mt-2 mb-8">
            <div className="w-12 h-1 rounded-full bg-brand-mustard" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="text-center bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige dark:border-[#2A2A2A] p-6 hover:shadow-lg dark:hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-20 h-20 rounded-full bg-brand-teal-dark/10 dark:bg-[#4ADE80]/[0.1] flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-brand-teal-dark dark:text-[#4ADE80]">
                    {member.initials}
                  </span>
                </div>
                <h3
                  className="text-lg font-semibold text-brand-black dark:text-[#E5E5E5]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {getMemberName(member)}
                </h3>
                <p className="text-sm text-brand-brown dark:text-[#888888]">
                  {getMemberRole(member)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;