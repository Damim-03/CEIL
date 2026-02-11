import {
  Award, Users, Monitor, GraduationCap, Clock, FileText, BookOpen,
  Quote, CheckCircle2, ExternalLink, MapPin, Phone, Mail, Sparkles, 
  X, AlertTriangle, ShieldCheck, Info,
  ClipboardList, FileCheck, ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { useLanguage } from "../../hooks/useLanguage";
import { LocaleLink } from "../../i18n/locales/components/LocaleLink";

/* ═══════════════════════════════════════════════════════
   Shared scroll-trigger hook
   ═══════════════════════════════════════════════════════ */
function useScrollVisible(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ═══════════════════════════════════════════════════════
   Section 1 — Why Choose Us
   ═══════════════════════════════════════════════════════ */
function WhyChooseUsSection() {
  const { t, dir } = useLanguage();
  const { ref, visible } = useScrollVisible();

  const WHY_US = [
    { icon: Award, title: t("centerInfo.officialCertificate"), subtitle: t("centerInfo.officialCertificateDesc"), color: "from-amber-500/10 to-amber-600/[0.04]" },
    { icon: Users, title: t("centerInfo.qualifiedStaff"), subtitle: t("centerInfo.qualifiedStaffDesc"), color: "from-brand-teal-dark/10 to-brand-teal-dark/[0.03]" },
    { icon: Monitor, title: t("centerInfo.modernMethods"), subtitle: t("centerInfo.modernMethodsDesc"), color: "from-blue-500/10 to-blue-600/[0.04]" },
  ];

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-white relative overflow-hidden" dir={dir}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.012]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #264230 1px, transparent 0)",
          backgroundSize: "48px 48px",
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-teal-dark/5 border border-brand-teal-dark/10 px-4 py-1.5 text-xs font-semibold text-brand-teal-dark mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-mustard" />
            {t("centerInfo.whyChooseUs")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-black" style={{ fontFamily: "var(--font-sans)" }}>
            {t("centerInfo.whyChooseUs")}
          </h2>
          <div className="flex justify-center mt-3">
            <div className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${visible ? "w-16" : "w-0"}`} style={{ transitionDelay: "300ms" }} />
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3 max-w-5xl mx-auto">
          {WHY_US.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={`group text-center rounded-2xl border border-brand-beige/60 bg-white p-8 hover:shadow-xl hover:shadow-brand-teal-dark/[0.05] hover:-translate-y-1.5 transition-all duration-500 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${200 + i * 120}ms`, transitionDuration: "800ms" }}
              >
                <div className="relative mx-auto mb-6 w-20 h-20">
                  <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-10 h-10 text-brand-teal-dark" strokeWidth={1.5} />
                  </div>
                  {/* Subtle ring */}
                  <div className="absolute -inset-1.5 rounded-2xl border border-brand-beige/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-bold text-brand-black mb-2 group-hover:text-brand-teal-dark transition-colors" style={{ fontFamily: "var(--font-sans)" }}>
                  {item.title}
                </h3>
                <p className="text-brand-brown/70 text-sm leading-relaxed">{item.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   Section 2 — Testimonials
   ═══════════════════════════════════════════════════════ */
const TESTIMONIALS = [
  { quote: "La formation au CEIL m'a permis d'améliorer considérablement mon niveau en anglais académique.", name: "Dr. Ahmed M.", role: "Enseignant-chercheur" },
  { quote: "Excellente préparation au TOEFL avec des méthodes d'enseignement efficaces.", name: "Sarah B.", role: "Étudiante en Master" },
  { quote: "Les cours de français scientifique sont parfaitement adaptés aux besoins des chercheurs.", name: "Prof. Karim L.", role: "Professeur" },
];

function TestimonialsSection() {
  const { t, dir, isRTL } = useLanguage();
  const { ref, visible } = useScrollVisible();
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => setActive((p) => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const goTo = (idx: number) => {
    setActive(idx);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setActive((p) => (p + 1) % TESTIMONIALS.length), 5000);
  };

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-brand-gray/50 relative overflow-hidden" dir={dir}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[5%] w-72 h-72 rounded-full bg-brand-mustard/[0.025]" />
        <div className="absolute bottom-[10%] left-[5%] w-80 h-80 rounded-full bg-brand-teal-dark/[0.02]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-black" style={{ fontFamily: "var(--font-sans)" }}>
            {t("centerInfo.testimonials")}
          </h2>
          <div className="flex justify-center mt-3">
            <div className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${visible ? "w-16" : "w-0"}`} style={{ transitionDelay: "300ms" }} />
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:grid grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TESTIMONIALS.map((item, i) => (
            <div
              key={i}
              className={`relative bg-white rounded-2xl p-7 border border-brand-beige/60 hover:shadow-xl hover:shadow-brand-teal-dark/[0.04] hover:-translate-y-1 transition-all duration-500 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${300 + i * 120}ms`, transitionDuration: "800ms" }}
            >
              {/* Quote mark */}
              <div className="absolute top-5 left-5">
                <div className="w-10 h-10 rounded-xl bg-brand-mustard/[0.08] flex items-center justify-center">
                  <Quote className="w-5 h-5 text-brand-mustard/50" strokeWidth={1.5} />
                </div>
              </div>
              <div className="pt-12">
                <p className="text-brand-black/60 text-[14px] leading-[1.85] min-h-[80px]" dir="ltr" style={{ textAlign: "right" }}>
                  {item.quote}
                </p>
                <div className="pt-4 mt-4 border-t border-brand-beige/50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-teal-dark/[0.08] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-brand-teal-dark">
                      {item.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-brand-black font-semibold text-sm" dir="ltr">{item.name}</p>
                    <p className="text-brand-brown/50 text-[11px]" dir="ltr">{item.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile */}
        <div className="md:hidden max-w-md mx-auto">
          <div className="relative bg-white rounded-2xl p-7 border border-brand-beige/60 shadow-sm min-h-[220px]">
            <div className="absolute top-5 left-5">
              <div className="w-10 h-10 rounded-xl bg-brand-mustard/[0.08] flex items-center justify-center">
                <Quote className="w-5 h-5 text-brand-mustard/50" strokeWidth={1.5} />
              </div>
            </div>
            <div className="pt-12">
              <p className="text-brand-black/60 text-[14px] leading-[1.85]" dir="ltr" style={{ textAlign: "right" }}>
                {TESTIMONIALS[active].quote}
              </p>
              <div className="pt-4 mt-4 border-t border-brand-beige/50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-teal-dark/[0.08] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-brand-teal-dark">
                    {TESTIMONIALS[active].name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="text-brand-black font-semibold text-sm" dir="ltr">{TESTIMONIALS[active].name}</p>
                  <p className="text-brand-brown/50 text-[11px]" dir="ltr">{TESTIMONIALS[active].role}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active
                    ? "bg-brand-teal-dark w-8"
                    : "bg-brand-beige hover:bg-brand-brown/30 w-2"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   Section 3 — Presentation & Offers
   ═══════════════════════════════════════════════════════ */
function PresentationSection() {
  const { t, dir, isRTL } = useLanguage();
  const { ref, visible } = useScrollVisible();
  const AUDIENCE_KEYS = ["student", "employee", "professor", "external"] as const;
  const offerings = t("centerInfo.offerings", { returnObjects: true }) as string[];

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-white relative overflow-hidden" dir={dir}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-black" style={{ fontFamily: "var(--font-sans)" }}>
            {t("centerInfo.presentationTitle")}
          </h2>
          <div className="flex justify-center mt-3">
            <div className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${visible ? "w-16" : "w-0"}`} style={{ transitionDelay: "300ms" }} />
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Text */}
          <div className={`order-2 lg:order-1 space-y-8 transition-all duration-1000 ${visible ? "opacity-100 translate-x-0" : `opacity-0 ${isRTL ? "translate-x-8" : "-translate-x-8"}`}`} style={{ transitionDelay: "200ms" }}>
            <div>
              <h3 className="text-xl font-bold text-brand-black mb-4" style={{ fontFamily: "var(--font-sans)" }}>
                {t("centerInfo.youAre")}
              </h3>
              <div className="space-y-2.5">
                {AUDIENCE_KEYS.map((key, i) => (
                  <div
                    key={i}
                    className={`group flex items-center gap-3 p-4 rounded-xl border border-brand-beige/70 bg-white hover:border-brand-mustard/30 hover:shadow-md transition-all duration-300 cursor-default ${
                      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                    style={{ transitionDelay: `${400 + i * 80}ms`, transitionDuration: "600ms" }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-teal-dark/[0.08] flex items-center justify-center shrink-0 group-hover:bg-brand-teal-dark/[0.15] transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-brand-teal-dark" />
                    </div>
                    <span className="text-brand-black font-medium text-[15px]">{t(`centerInfo.audience.${key}`)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-brand-black mb-4" style={{ fontFamily: "var(--font-sans)" }}>
                {t("centerInfo.ourOfferings")}
              </h3>
              <div className="space-y-3">
                {Array.isArray(offerings) && offerings.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-mustard/[0.12] flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-brand-mustard" />
                    </div>
                    <p className="text-brand-black/60 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-gray/50 rounded-xl p-5 border border-brand-beige/50" style={{ borderRight: isRTL ? "3px solid" : "none", borderLeft: isRTL ? "none" : "3px solid", borderColor: "var(--color-brand-mustard, #C19A5E)" }}>
              <p className="text-brand-black/50 text-sm leading-relaxed">{t("centerInfo.cecrNote")}</p>
            </div>
          </div>

          {/* Image */}
          <div className={`order-1 lg:order-2 transition-all duration-1000 ${visible ? "opacity-100 translate-x-0" : `opacity-0 ${isRTL ? "-translate-x-8" : "translate-x-8"}`}`} style={{ transitionDelay: "400ms" }}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-brand-teal-dark/10 group">
              <div className="aspect-[4/3] bg-gradient-to-br from-brand-teal-dark/20 via-brand-teal-dark/[0.08] to-brand-mustard/[0.08] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-brand-teal-dark/[0.1] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                    <GraduationCap className="w-10 h-10 text-brand-teal-dark" strokeWidth={1.5} />
                  </div>
                  <p className="text-brand-teal-dark font-bold text-lg">CEIL – UHLO</p>
                  <p className="text-brand-brown/60 text-sm">{t("header.shortNameAr")}</p>
                </div>
              </div>
              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-brand-mustard/30 rounded-tl-lg" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-brand-mustard/30 rounded-br-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   Section 4 — Training Nature
   ═══════════════════════════════════════════════════════ */
function TrainingNatureSection() {
  const { t, dir } = useLanguage();
  const { ref, visible } = useScrollVisible();

  const TRAINING = [
    { icon: GraduationCap, title: t("centerInfo.adaptedProgram"), desc: t("centerInfo.adaptedProgramDesc"), accent: "bg-emerald-500" },
    { icon: Clock, title: t("centerInfo.hourlyVolume"), desc: t("centerInfo.hourlyVolumeDesc"), accent: "bg-blue-500" },
    { icon: Award, title: t("centerInfo.certifiedDiploma"), desc: t("centerInfo.certifiedDiplomaDesc"), accent: "bg-brand-mustard" },
  ];

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-brand-gray/40 relative" dir={dir}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-black" style={{ fontFamily: "var(--font-sans)" }}>
            {t("centerInfo.trainingNature")}
          </h2>
          <div className="flex justify-center mt-3">
            <div className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${visible ? "w-16" : "w-0"}`} style={{ transitionDelay: "300ms" }} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
          {TRAINING.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={`group relative bg-white rounded-2xl p-8 border border-brand-beige/60 text-center hover:shadow-xl hover:shadow-brand-teal-dark/[0.05] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${200 + i * 120}ms`, transitionDuration: "800ms" }}
              >
                {/* Top accent line */}
                <div className={`absolute top-0 inset-x-0 h-1 ${item.accent} opacity-60 group-hover:opacity-100 transition-opacity`} />
                <div className="w-16 h-16 rounded-2xl bg-brand-teal-dark/[0.07] flex items-center justify-center mx-auto mb-5 group-hover:bg-brand-teal-dark/[0.12] group-hover:scale-105 transition-all duration-300">
                  <Icon className="w-8 h-8 text-brand-teal-dark" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-brand-black mb-2 group-hover:text-brand-teal-dark transition-colors" style={{ fontFamily: "var(--font-sans)" }}>
                  {item.title}
                </h3>
                <p className="text-brand-brown/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   Section 5 — Educational Resources
   ═══════════════════════════════════════════════════════ */
function EducationalResourcesSection() {
  const { t, dir } = useLanguage();
  const { ref, visible } = useScrollVisible();
  const tags = [t("centerInfo.interactiveTeaching"), t("centerInfo.digitalResources"), t("centerInfo.continuousAssessment")];

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-white relative" dir={dir}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-10 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-black" style={{ fontFamily: "var(--font-sans)" }}>
            {t("centerInfo.educationalResources")}
          </h2>
          <div className="flex justify-center mt-3">
            <div className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${visible ? "w-16" : "w-0"}`} style={{ transitionDelay: "300ms" }} />
          </div>
        </div>

        <div className={`max-w-2xl mx-auto text-center transition-all duration-1000 ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-[0.97]"}`} style={{ transitionDelay: "200ms" }}>
          <div className="bg-brand-gray/40 rounded-2xl p-10 border border-brand-beige/50">
            <div className="w-16 h-16 rounded-2xl bg-white border border-brand-beige/60 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <BookOpen className="w-8 h-8 text-brand-teal-dark" strokeWidth={1.5} />
            </div>
            <p className="text-brand-black/60 text-lg leading-relaxed">{t("centerInfo.experiencedTrainers")}</p>
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-sm font-medium text-brand-teal-dark border border-brand-beige/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${400 + i * 100}ms`, transitionDuration: "600ms" }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-mustard" />{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   Section 6 — File Composition (Interactive + Modal)
   ═══════════════════════════════════════════════════════ */
function FileCompositionSection() {
  const { t, dir, isRTL } = useLanguage();
  const { ref, visible } = useScrollVisible();
  const [modalOpen, setModalOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [activeTab, setActiveTab] = useState<"docs" | "conditions" | "warnings" | "notes">("docs");
  const fileItems = t("centerInfo.fileItems", { returnObjects: true }) as string[];

  // Lock body when modal open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  // Close on Escape
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setModalOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [modalOpen]);

  const handleProceed = () => {
    if (!accepted) {
      setShowWarning(true);
      return;
    }
    setModalOpen(false);
    // Navigate to registration or scroll to courses
    window.location.hash = "languages";
  };

  const DOCS = [
    {
      icon: ClipboardList,
      title: t("centerInfo.enrollment.registrationForm"),
      desc: t("centerInfo.enrollment.registrationFormDesc"),
    },
    {
      icon: FileCheck,
      title: t("centerInfo.enrollment.commitmentContract"),
      desc: t("centerInfo.enrollment.commitmentContractDesc"),
    },
  ];

  const conditions = t("centerInfo.enrollment.conditionsList", { returnObjects: true }) as string[];
  const warnings = t("centerInfo.enrollment.warningsList", { returnObjects: true }) as string[];
  const notes = t("centerInfo.enrollment.notesList", { returnObjects: true }) as string[];

  const TABS = [
    { key: "docs" as const, label: t("centerInfo.enrollment.requiredDocs"), icon: FileText, count: DOCS.length },
    { key: "conditions" as const, label: t("centerInfo.enrollment.conditions"), icon: ShieldCheck, count: Array.isArray(conditions) ? conditions.length : 0 },
    { key: "warnings" as const, label: t("centerInfo.enrollment.warnings"), icon: AlertTriangle, count: Array.isArray(warnings) ? warnings.length : 0 },
    { key: "notes" as const, label: t("centerInfo.enrollment.importantNotes"), icon: Info, count: Array.isArray(notes) ? notes.length : 0 },
  ];

  return (
    <>
      <section ref={ref} className="py-20 lg:py-28 bg-brand-gray/40 relative" dir={dir}>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-10 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-teal-dark/5 border border-brand-teal-dark/10 px-4 py-1.5 text-xs font-semibold text-brand-teal-dark mb-4">
              <FileText className="w-3.5 h-3.5 text-brand-mustard" />
              {t("centerInfo.fileComposition")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-black" style={{ fontFamily: "var(--font-sans)" }}>
              {t("centerInfo.fileComposition")}
            </h2>
            <div className="flex justify-center mt-3">
              <div className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${visible ? "w-16" : "w-0"}`} style={{ transitionDelay: "300ms" }} />
            </div>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Description card */}
            <div className={`bg-white rounded-2xl p-8 border border-brand-beige/60 shadow-sm transition-all duration-800 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "200ms" }}>
              <p className="text-brand-black/60 leading-relaxed text-[15px]">{t("centerInfo.fileDesc")}</p>
            </div>

            {/* Clickable document cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.isArray(fileItems) && fileItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setModalOpen(true); setActiveTab("docs"); }}
                  className={`group flex items-start gap-4 bg-white rounded-xl p-5 border border-brand-beige/60 hover:border-brand-teal-dark/25 hover:shadow-xl hover:shadow-brand-teal-dark/[0.06] hover:-translate-y-1 transition-all duration-300 text-start w-full ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                  style={{ transitionDelay: `${350 + i * 100}ms`, transitionDuration: "700ms" }}
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-teal-dark/[0.07] flex items-center justify-center shrink-0 group-hover:bg-brand-teal-dark/[0.15] group-hover:scale-110 transition-all duration-300">
                    <FileText className="w-6 h-6 text-brand-teal-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-brand-brown/60 font-medium mb-1">{t("centerInfo.document", { num: i + 1 })}</p>
                    <p className="text-brand-black/70 text-sm font-semibold leading-relaxed">{item}</p>
                    <p className="text-brand-teal-dark/50 text-[11px] mt-2 flex items-center gap-1 group-hover:text-brand-teal-dark transition-colors">
                      <Info className="w-3 h-3" />
                      {t("centerInfo.enrollment.clickToView")}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-brand-brown/30 shrink-0 mt-1 group-hover:text-brand-teal-dark transition-all duration-300 ${isRTL ? "group-hover:-rotate-90" : "group-hover:-rotate-90"}`} />
                </button>
              ))}
            </div>

            {/* CTA to view full details */}
            <div className={`text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "550ms" }}>
              <Button
                onClick={() => { setModalOpen(true); setActiveTab("docs"); }}
                className="bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white rounded-xl h-12 px-8 gap-2.5 font-semibold shadow-lg shadow-brand-teal-dark/15 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <ShieldCheck className="w-4 h-4" />
                {t("centerInfo.enrollment.modalTitle")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ MODAL ═══════════ */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
          modalOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        dir={dir}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${modalOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setModalOpen(false)}
        />

        {/* Modal Card */}
        <div
          className={`relative bg-white rounded-2xl shadow-2xl shadow-black/20 w-full max-w-2xl max-h-[90vh] overflow-hidden transition-all duration-300 ${
            modalOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-brand-beige/50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-teal-dark/[0.08] flex items-center justify-center">
                <FileText className="w-5 h-5 text-brand-teal-dark" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-black" style={{ fontFamily: "var(--font-sans)" }}>
                  {t("centerInfo.enrollment.modalTitle")}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setModalOpen(false)}
              className="w-9 h-9 rounded-xl bg-brand-gray hover:bg-brand-beige flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-brand-black/50" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-brand-beige/40 bg-brand-gray/30 px-4 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-all duration-200 shrink-0 ${
                      isActive
                        ? "text-brand-teal-dark"
                        : "text-brand-brown/50 hover:text-brand-brown/80"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${tab.key === "warnings" && isActive ? "text-amber-500" : ""}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      isActive ? "bg-brand-teal-dark text-white" : "bg-brand-beige/60 text-brand-brown/50"
                    }`}>
                      {tab.count}
                    </span>
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-2 h-[2px] rounded-full bg-brand-teal-dark" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="overflow-y-auto px-6 py-5 space-y-4" style={{ maxHeight: "calc(90vh - 250px)" }}>
            {/* Documents Tab */}
            {activeTab === "docs" && (
              <div className="space-y-4">
                {DOCS.map((doc, i) => {
                  const Icon = doc.icon;
                  return (
                    <div key={i} className="bg-brand-gray/40 rounded-xl p-5 border border-brand-beige/40">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-brand-teal-dark/[0.08] flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-brand-teal-dark" />
                        </div>
                        <div>
                          <h4 className="font-bold text-brand-black text-[15px] mb-1.5" style={{ fontFamily: "var(--font-sans)" }}>
                            {doc.title}
                          </h4>
                          <p className="text-brand-black/55 text-[13px] leading-relaxed">
                            {doc.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Conditions Tab */}
            {activeTab === "conditions" && Array.isArray(conditions) && (
              <div className="space-y-3">
                {conditions.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-brand-gray/40 border border-brand-beige/40">
                    <div className="w-7 h-7 rounded-lg bg-brand-teal-dark/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-teal-dark" />
                    </div>
                    <p className="text-brand-black/65 text-[13px] leading-relaxed pt-0.5">{item}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Warnings Tab */}
            {activeTab === "warnings" && Array.isArray(warnings) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200/50">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-amber-700/70 text-[12px] font-medium">{t("centerInfo.enrollment.warnings")}</p>
                </div>
                {warnings.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-50/40 border border-red-200/30">
                    <div className="w-7 h-7 rounded-lg bg-red-500/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-red-500 text-[11px] font-bold">{i + 1}</span>
                    </div>
                    <p className="text-brand-black/60 text-[13px] leading-relaxed pt-0.5">{item}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === "notes" && Array.isArray(notes) && (
              <div className="space-y-3">
                {notes.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/40 border border-blue-200/30">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                      <Info className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-brand-black/60 text-[13px] leading-relaxed pt-0.5">{item}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer — Terms + Actions */}
          <div className="sticky bottom-0 bg-white border-t border-brand-beige/50 px-6 py-4 space-y-3">
            {/* Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => { setAccepted(e.target.checked); setShowWarning(false); }}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded-md border-2 border-brand-beige peer-checked:border-brand-teal-dark peer-checked:bg-brand-teal-dark transition-all duration-200 flex items-center justify-center">
                  {accepted && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className={`text-[13px] leading-relaxed transition-colors ${accepted ? "text-brand-black/70" : "text-brand-black/50 group-hover:text-brand-black/65"}`}>
                {t("centerInfo.enrollment.acceptTerms")}
              </span>
            </label>

            {/* Warning message */}
            {showWarning && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200/50">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <p className="text-amber-600 text-[12px] font-medium">{t("centerInfo.enrollment.mustAcceptTerms")}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="flex-1 border-brand-beige text-brand-brown/60 hover:bg-brand-gray rounded-xl h-11 font-medium"
              >
                {t("centerInfo.enrollment.close")}
              </Button>
              <Button
                onClick={handleProceed}
                disabled={!accepted}
                className={`flex-1 rounded-xl h-11 font-semibold gap-2 transition-all duration-300 ${
                  accepted
                    ? "bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white shadow-lg shadow-brand-teal-dark/20 hover:shadow-xl hover:-translate-y-0.5"
                    : "bg-brand-beige text-brand-brown/40 cursor-not-allowed"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                {t("centerInfo.enrollment.proceedToRegister")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   Section 7 — Useful Links
   ═══════════════════════════════════════════════════════ */
const USEFUL_LINKS = [
  { label: "mesrs", url: "https://www.mesrs.dz" },
  { label: "progres", url: "https://progres.mesrs.dz" },
  { label: "dgrsdt", url: "https://www.dgrsdt.dz" },
  { label: "universityPortal", url: "https://univ-eloued.dz" },
];

function UsefulLinksSection() {
  const { t, dir } = useLanguage();
  const { ref, visible } = useScrollVisible();

  return (
    <section ref={ref} className="py-16 lg:py-20 bg-brand-teal-dark relative overflow-hidden" dir={dir}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full border border-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full border border-white/5 translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-10 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-sans)" }}>
            {t("centerInfo.officialLinks")}
          </h2>
          <div className="flex justify-center mt-3">
            <div className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${visible ? "w-12" : "w-0"}`} style={{ transitionDelay: "300ms" }} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {USEFUL_LINKS.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-3 bg-white/[0.07] backdrop-blur-sm rounded-xl p-4 border border-white/[0.08] hover:bg-white/[0.14] hover:border-white/[0.16] hover:-translate-y-0.5 transition-all duration-300 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${200 + i * 80}ms`, transitionDuration: "700ms" }}
            >
              <div className="w-9 h-9 rounded-lg bg-brand-mustard/20 flex items-center justify-center shrink-0 group-hover:bg-brand-mustard/30 transition-colors">
                <ExternalLink className="w-4 h-4 text-brand-mustard" />
              </div>
              <span className="text-white/70 text-sm leading-snug group-hover:text-white transition-colors">
                {t(`footer.${link.label}`)}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   Section 8 — Location & Contact
   ═══════════════════════════════════════════════════════ */
function LocationContactSection() {
  const { t, dir } = useLanguage();
  const { ref, visible } = useScrollVisible();

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-white relative" dir={dir}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-10 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-teal-dark" style={{ fontFamily: "var(--font-sans)" }}>
            {t("centerInfo.ourLocation")}
          </h2>
          <div className="flex justify-center mt-3">
            <div className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${visible ? "w-16" : "w-0"}`} style={{ transitionDelay: "300ms" }} />
          </div>
        </div>

        <div className={`rounded-2xl overflow-hidden border border-brand-beige/60 shadow-lg mb-16 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "200ms" }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.5!2d6.8628!3d33.3683!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12830604e3e1eb71%3A0x7f22b0c1b25e84f7!2sUniversit%C3%A9%20Hamma%20Lakhdar%20El%20Oued!5e0!3m2!1sfr!2sdz!4v1"
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="CEIL Location"
            className="w-full"
          />
        </div>

        <div className={`text-center mb-10 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "400ms" }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-teal-dark" style={{ fontFamily: "var(--font-sans)" }}>
            {t("centerInfo.contactTitle")}
          </h2>
          <div className="flex justify-center mt-3"><div className="w-16 h-1 rounded-full bg-brand-mustard" /></div>
        </div>

        <div className="max-w-xl mx-auto text-center space-y-6">
          <p className="text-brand-black/50">{t("centerInfo.contactDesc")}</p>

          <Button
            asChild
            className="bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white rounded-xl h-12 px-8 gap-2 font-semibold shadow-lg shadow-brand-teal-dark/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <LocaleLink to="/contact">
              <Mail className="w-4 h-4" />
              {t("centerInfo.openContactForm")}
            </LocaleLink>
          </Button>

          <div className="grid gap-4 sm:grid-cols-3 mt-8">
            {[
              { icon: MapPin, text: t("footer.universityLabel"), dir: undefined },
              { icon: Phone, text: "+213 32 24 33 63", dir: "ltr" as const },
              { icon: Mail, text: "ceil@univ-eloued.dz", dir: "ltr" as const },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className={`group flex flex-col items-center gap-2.5 p-5 rounded-xl bg-brand-gray/40 border border-brand-beige/50 hover:shadow-lg hover:shadow-brand-teal-dark/[0.04] hover:-translate-y-0.5 transition-all duration-300 ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                  style={{ transitionDelay: `${600 + i * 100}ms`, transitionDuration: "700ms" }}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-teal-dark/[0.07] flex items-center justify-center group-hover:bg-brand-teal-dark/[0.12] transition-colors">
                    <Icon className="w-5 h-5 text-brand-teal-dark" />
                  </div>
                  <p className="text-sm text-brand-black/60 text-center" dir={item.dir}>
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════ */
export function CenterInfoPreview() {
  return (
    <>
      <WhyChooseUsSection />
      <TestimonialsSection />
      <PresentationSection />
      <TrainingNatureSection />
      <EducationalResourcesSection />
      <FileCompositionSection />
      <UsefulLinksSection />
      <LocationContactSection />
    </>
  );
}