import {
  Award,
  Users,
  Monitor,
  GraduationCap,
  Clock,
  FileText,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Mail,
  Sparkles,
  X,
  AlertTriangle,
  ShieldCheck,
  Info,
  ClipboardList,
  FileCheck,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Zap,
  Facebook,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { useLanguage } from "../../hooks/useLanguage";
import { LocaleLink } from "../../i18n/locales/components/LocaleLink";

import ceil1 from "../../assets/ceil-1.jpg";
import ceil2 from "../../assets/ceil-2.jpg";
import ceil3 from "../../assets/ceil-3.jpg";
import ceil4 from "../../assets/ceil-4.jpg";
import ceil5 from "../../assets/ceil-5.jpg";
import ceil6 from "../../assets/ceil6.jpg";
import ceil7 from "../../assets/ceil7.jpg";
import ceil8 from "../../assets/ceil8.jpg";
import ceil9 from "../../assets/ceil9.jpg";
import ceil10 from "../../assets/ceil10.jpg";

const SLIDESHOW_IMAGES = [
  { src: ceil1, alt: "CEIL Campus" },
  { src: ceil2, alt: "Language Classes" },
  { src: ceil3, alt: "Students Learning" },
  { src: ceil4, alt: "Certificate Ceremony" },
  { src: ceil5, alt: "Library Resources" },
  { src: ceil6, alt: "CEIL Campus" },
  { src: ceil7, alt: "Language Classes" },
  { src: ceil8, alt: "Students Learning" },
  { src: ceil9, alt: "Certificate Ceremony" },
  { src: ceil10, alt: "Library Resources" },
];

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
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
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
    {
      icon: Award,
      title: t("centerInfo.officialCertificate"),
      subtitle: t("centerInfo.officialCertificateDesc"),
      color:
        "from-amber-500/10 to-amber-600/[0.04] dark:from-amber-500/15 dark:to-amber-600/[0.06]",
    },
    {
      icon: Users,
      title: t("centerInfo.qualifiedStaff"),
      subtitle: t("centerInfo.qualifiedStaffDesc"),
      color:
        "from-brand-teal-dark/10 to-brand-teal-dark/[0.03] dark:from-[#4ADE80]/10 dark:to-[#4ADE80]/[0.04]",
    },
    {
      icon: Monitor,
      title: t("centerInfo.modernMethods"),
      subtitle: t("centerInfo.modernMethodsDesc"),
      color:
        "from-blue-500/10 to-blue-600/[0.04] dark:from-blue-500/15 dark:to-blue-600/[0.06]",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-20 lg:py-28 bg-white dark:bg-[#121212] relative overflow-hidden"
      dir={dir}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.012] dark:opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #264230 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-teal-dark/5 dark:bg-[#4ADE80]/10 border border-brand-teal-dark/10 dark:border-[#4ADE80]/15 px-4 py-1.5 text-xs font-semibold text-brand-teal-dark dark:text-[#4ADE80] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-mustard dark:text-[#D4A843]" />
            {t("centerInfo.whyChooseUs")}
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold text-brand-black dark:text-[#E5E5E5]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("centerInfo.whyChooseUs")}
          </h2>
          <div className="flex justify-center mt-3">
            <div
              className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${visible ? "w-16" : "w-0"}`}
              style={{ transitionDelay: "300ms" }}
            />
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3 max-w-5xl mx-auto">
          {WHY_US.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={`group text-center rounded-2xl border border-brand-beige/60 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] p-8 hover:shadow-xl hover:shadow-brand-teal-dark/[0.05] dark:hover:shadow-black/30 hover:-translate-y-1.5 transition-all duration-500 ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{
                  transitionDelay: `${200 + i * 120}ms`,
                  transitionDuration: "800ms",
                }}
              >
                <div className="relative mx-auto mb-6 w-20 h-20">
                  <div
                    className={`w-full h-full rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
                  >
                    <Icon
                      className="w-10 h-10 text-brand-teal-dark dark:text-[#4ADE80]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="absolute -inset-1.5 rounded-2xl border border-brand-beige/40 dark:border-[#2A2A2A]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3
                  className="text-xl font-bold text-brand-black dark:text-[#E5E5E5] mb-2 group-hover:text-brand-teal-dark dark:group-hover:text-[#4ADE80] transition-colors"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {item.title}
                </h3>
                <p className="text-brand-brown/70 dark:text-[#888888] text-sm leading-relaxed">
                  {item.subtitle}
                </p>
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

/* ═══════════════════════════════════════════════════════
   Section 3 — Presentation & Offers
   ═══════════════════════════════════════════════════════ */
function ImageSlideshow({ visible }: { visible: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [isTransitioning],
  );

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % SLIDESHOW_IMAGES.length);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(
      (currentIndex - 1 + SLIDESHOW_IMAGES.length) % SLIDESHOW_IMAGES.length,
    );
  }, [currentIndex, goToSlide]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (isPaused || !visible) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused, visible]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer"
      style={{
        boxShadow:
          "0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Image Container */}
      <div className="aspect-[4/3] relative bg-[#1a1a1a]">
        {SLIDESHOW_IMAGES.map((image, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-all duration-[800ms] ease-out"
            style={{
              opacity: currentIndex === index ? 1 : 0,
              transform: currentIndex === index ? "scale(1)" : "scale(1.08)",
              zIndex: currentIndex === index ? 2 : 1,
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          </div>
        ))}

        {/* Bottom Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
          <div className="flex items-end justify-between">
            {/* Text */}
            <div>
              <p className="text-white/90 font-bold text-lg tracking-wide drop-shadow-lg">
                CEIL
              </p>
              <p className="text-white/60 text-sm mt-0.5 drop-shadow">
                مركز التعليم المكثف للغات
              </p>
            </div>

            {/* Slide Counter */}
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
              <span className="text-white/90 text-xs font-bold">
                {String(currentIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-white/40 text-xs">/</span>
              <span className="text-white/40 text-xs">
                {String(SLIDESHOW_IMAGES.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex gap-1.5 mt-3">
            {SLIDESHOW_IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
                className="relative h-1 rounded-full overflow-hidden transition-all duration-500"
                style={{
                  width: currentIndex === index ? "2rem" : "0.75rem",
                  backgroundColor:
                    currentIndex === index
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.3)",
                }}
              >
                {/* Animated fill for active dot */}
                {currentIndex === index && !isPaused && (
                  <div
                    className="absolute inset-0 bg-[#C4A035] rounded-full origin-left"
                    style={{
                      animation: "progressFill 5s linear forwards",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Arrows (show on hover) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/25 hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/25 hover:scale-110"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Corner Decorations */}
        <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-[#C4A035]/40 rounded-tl-lg z-10" />
        <div className="absolute bottom-16 right-3 w-10 h-10 border-b-2 border-r-2 border-[#C4A035]/40 rounded-br-lg z-10" />

        {/* Pause Indicator */}
        {isPaused && (
          <div className="absolute top-3 right-3 z-10 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-3 bg-white/80 rounded-full" />
              <div className="w-0.5 h-3 bg-white/80 rounded-full" />
            </div>
            <span className="text-white/70 text-[10px] font-medium uppercase tracking-wider">
              Paused
            </span>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes progressFill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}

// ─── Main PresentationSection ────────────────────────────────
export default function PresentationSection() {
  const { t, dir, isRTL } = useLanguage();
  const { ref, visible } = useScrollVisible();
  const AUDIENCE_KEYS = [
    "student",
    "employee",
    "professor",
    "external",
  ] as const;
  const offerings = t("centerInfo.offerings", {
    returnObjects: true,
  }) as string[];

  return (
    <section
      ref={ref}
      className="py-20 lg:py-28 bg-white dark:bg-[#121212] relative overflow-hidden"
      dir={dir}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-14 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-brand-black dark:text-[#E5E5E5]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("centerInfo.presentationTitle")}
          </h2>
          <div className="flex justify-center mt-3">
            <div
              className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${visible ? "w-16" : "w-0"}`}
              style={{ transitionDelay: "300ms" }}
            />
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Text */}
          <div
            className={`order-2 lg:order-1 space-y-8 transition-all duration-1000 ${visible ? "opacity-100 translate-x-0" : `opacity-0 ${isRTL ? "translate-x-8" : "-translate-x-8"}`}`}
            style={{ transitionDelay: "200ms" }}
          >
            <div>
              <h3
                className="text-xl font-bold text-brand-black dark:text-[#E5E5E5] mb-4"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {t("centerInfo.youAre")}
              </h3>
              <div className="space-y-2.5">
                {AUDIENCE_KEYS.map((key, i) => (
                  <div
                    key={i}
                    className={`group flex items-center gap-3 p-4 rounded-xl border border-brand-beige/70 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] hover:border-brand-mustard/30 dark:hover:border-[#D4A843]/20 hover:shadow-md dark:hover:shadow-black/20 transition-all duration-300 cursor-default ${
                      visible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                    style={{
                      transitionDelay: `${400 + i * 80}ms`,
                      transitionDuration: "600ms",
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-teal-dark/[0.08] dark:bg-[#4ADE80]/[0.1] flex items-center justify-center shrink-0 group-hover:bg-brand-teal-dark/[0.15] dark:group-hover:bg-[#4ADE80]/[0.15] transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-brand-teal-dark dark:text-[#4ADE80]" />
                    </div>
                    <span className="text-brand-black dark:text-[#E5E5E5] font-medium text-[15px]">
                      {t(`centerInfo.audience.${key}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3
                className="text-xl font-bold text-brand-black dark:text-[#E5E5E5] mb-4"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {t("centerInfo.ourOfferings")}
              </h3>
              <div className="space-y-3">
                {Array.isArray(offerings) &&
                  offerings.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-mustard/[0.12] dark:bg-brand-mustard/[0.15] flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-brand-mustard" />
                      </div>
                      <p className="text-brand-black/60 dark:text-[#AAAAAA] text-sm leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            <div
              className="bg-brand-gray/50 dark:bg-[#1A1A1A] rounded-xl p-5 border border-brand-beige/50 dark:border-[#2A2A2A]"
              style={{
                borderRight: isRTL ? "3px solid" : "none",
                borderLeft: isRTL ? "none" : "3px solid",
                borderColor: "var(--color-brand-mustard, #C19A5E)",
              }}
            >
              <p className="text-brand-black/50 dark:text-[#888888] text-sm leading-relaxed">
                {t("centerInfo.cecrNote")}
              </p>
            </div>
          </div>

          {/* ✅ Image Slideshow (بدل الـ placeholder القديم) */}
          <div
            className={`order-1 lg:order-2 transition-all duration-1000 ${visible ? "opacity-100 translate-x-0" : `opacity-0 ${isRTL ? "-translate-x-8" : "translate-x-8"}`}`}
            style={{ transitionDelay: "400ms" }}
          >
            <ImageSlideshow visible={visible} />
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
    {
      icon: GraduationCap,
      title: t("centerInfo.adaptedProgram"),
      desc: t("centerInfo.adaptedProgramDesc"),
      accent: "bg-emerald-500",
    },
    {
      icon: Clock,
      title: t("centerInfo.hourlyVolume"),
      desc: t("centerInfo.hourlyVolumeDesc"),
      accent: "bg-blue-500",
    },
    {
      icon: Zap,
      title: t("centerInfo.intensiveCourse"),
      desc: t("centerInfo.intensiveCourseDesc"),
      accent: "bg-amber-500",
    },
    {
      icon: Award,
      title: t("centerInfo.certifiedDiploma"),
      desc: t("centerInfo.certifiedDiplomaDesc"),
      accent: "bg-brand-mustard",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-20 lg:py-28 bg-brand-gray/40 dark:bg-[#0F0F0F] relative"
      dir={dir}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-14 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-brand-black dark:text-[#E5E5E5]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("centerInfo.trainingNature")}
          </h2>
          <div className="flex justify-center mt-3">
            <div
              className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${visible ? "w-16" : "w-0"}`}
              style={{ transitionDelay: "300ms" }}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {TRAINING.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={`group relative bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 border border-brand-beige/60 dark:border-[#2A2A2A] text-center hover:shadow-xl hover:shadow-brand-teal-dark/[0.05] dark:hover:shadow-black/30 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{
                  transitionDelay: `${200 + i * 120}ms`,
                  transitionDuration: "800ms",
                }}
              >
                <div
                  className={`absolute top-0 inset-x-0 h-1 ${item.accent} opacity-60 group-hover:opacity-100 transition-opacity`}
                />
                <div className="w-16 h-16 rounded-2xl bg-brand-teal-dark/[0.07] dark:bg-[#4ADE80]/[0.08] flex items-center justify-center mx-auto mb-5 group-hover:bg-brand-teal-dark/[0.12] dark:group-hover:bg-[#4ADE80]/[0.12] group-hover:scale-105 transition-all duration-300">
                  <Icon
                    className="w-8 h-8 text-brand-teal-dark dark:text-[#4ADE80]"
                    strokeWidth={1.5}
                  />
                </div>
                <h3
                  className="text-lg font-bold text-brand-black dark:text-[#E5E5E5] mb-2 group-hover:text-brand-teal-dark dark:group-hover:text-[#4ADE80] transition-colors"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {item.title}
                </h3>
                <p className="text-brand-brown/60 dark:text-[#888888] text-sm leading-relaxed">
                  {item.desc}
                </p>
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
  const tags = [
    t("centerInfo.interactiveTeaching"),
    t("centerInfo.digitalResources"),
    t("centerInfo.continuousAssessment"),
  ];

  return (
    <section
      ref={ref}
      className="py-20 lg:py-28 bg-white dark:bg-[#121212] relative"
      dir={dir}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-10 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-brand-black dark:text-[#E5E5E5]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("centerInfo.educationalResources")}
          </h2>
          <div className="flex justify-center mt-3">
            <div
              className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${visible ? "w-16" : "w-0"}`}
              style={{ transitionDelay: "300ms" }}
            />
          </div>
        </div>

        <div
          className={`max-w-2xl mx-auto text-center transition-all duration-1000 ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-[0.97]"}`}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="bg-brand-gray/40 dark:bg-[#1A1A1A] rounded-2xl p-10 border border-brand-beige/50 dark:border-[#2A2A2A]">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#222222] border border-brand-beige/60 dark:border-[#2A2A2A] flex items-center justify-center mx-auto mb-6 shadow-sm">
              <BookOpen
                className="w-8 h-8 text-brand-teal-dark dark:text-[#4ADE80]"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-brand-black/60 dark:text-[#AAAAAA] text-lg leading-relaxed">
              {t("centerInfo.experiencedTrainers")}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#222222] text-sm font-medium text-brand-teal-dark dark:text-[#4ADE80] border border-brand-beige/50 dark:border-[#2A2A2A] shadow-sm hover:shadow-md dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300 ${
                    visible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                  style={{
                    transitionDelay: `${400 + i * 100}ms`,
                    transitionDuration: "600ms",
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-mustard dark:text-[#D4A843]" />
                  {tag}
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
  const [activeTab, setActiveTab] = useState<
    "docs" | "conditions" | "warnings" | "notes"
  >("docs");
  const fileItems = t("centerInfo.fileItems", {
    returnObjects: true,
  }) as string[];

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [modalOpen]);

  const handleProceed = () => {
    if (!accepted) {
      setShowWarning(true);
      return;
    }
    setModalOpen(false);
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

  const conditions = t("centerInfo.enrollment.conditionsList", {
    returnObjects: true,
  }) as string[];
  const warnings = t("centerInfo.enrollment.warningsList", {
    returnObjects: true,
  }) as string[];
  const notes = t("centerInfo.enrollment.notesList", {
    returnObjects: true,
  }) as string[];

  const TABS = [
    {
      key: "docs" as const,
      label: t("centerInfo.enrollment.requiredDocs"),
      icon: FileText,
      count: DOCS.length,
    },
    {
      key: "conditions" as const,
      label: t("centerInfo.enrollment.conditions"),
      icon: ShieldCheck,
      count: Array.isArray(conditions) ? conditions.length : 0,
    },
    {
      key: "warnings" as const,
      label: t("centerInfo.enrollment.warnings"),
      icon: AlertTriangle,
      count: Array.isArray(warnings) ? warnings.length : 0,
    },
    {
      key: "notes" as const,
      label: t("centerInfo.enrollment.importantNotes"),
      icon: Info,
      count: Array.isArray(notes) ? notes.length : 0,
    },
  ];

  return (
    <>
      <section
        ref={ref}
        className="py-20 lg:py-28 bg-brand-gray/40 dark:bg-[#0F0F0F] relative"
        dir={dir}
      >
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-10 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-teal-dark/5 dark:bg-[#4ADE80]/10 border border-brand-teal-dark/10 dark:border-[#4ADE80]/15 px-4 py-1.5 text-xs font-semibold text-brand-teal-dark dark:text-[#4ADE80] mb-4">
              <FileText className="w-3.5 h-3.5 text-brand-mustard dark:text-[#D4A843]" />
              {t("centerInfo.fileComposition")}
            </div>
            <h2
              className="text-3xl sm:text-4xl font-bold text-brand-black dark:text-[#E5E5E5]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {t("centerInfo.fileComposition")}
            </h2>
            <div className="flex justify-center mt-3">
              <div
                className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${visible ? "w-16" : "w-0"}`}
                style={{ transitionDelay: "300ms" }}
              />
            </div>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div
              className={`bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 border border-brand-beige/60 dark:border-[#2A2A2A] shadow-sm transition-all duration-800 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "200ms" }}
            >
              <p className="text-brand-black/60 dark:text-[#AAAAAA] leading-relaxed text-[15px]">
                {t("centerInfo.fileDesc")}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {Array.isArray(fileItems) &&
                fileItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setModalOpen(true);
                      setActiveTab("docs");
                    }}
                    className={`group flex items-start gap-4 bg-white dark:bg-[#1A1A1A] rounded-xl p-5 border border-brand-beige/60 dark:border-[#2A2A2A] hover:border-brand-teal-dark/25 dark:hover:border-[#4ADE80]/20 hover:shadow-xl hover:shadow-brand-teal-dark/[0.06] dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300 text-start w-full ${
                      visible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-6"
                    }`}
                    style={{
                      transitionDelay: `${350 + i * 100}ms`,
                      transitionDuration: "700ms",
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-teal-dark/[0.07] dark:bg-[#4ADE80]/[0.08] flex items-center justify-center shrink-0 group-hover:bg-brand-teal-dark/[0.15] dark:group-hover:bg-[#4ADE80]/[0.15] group-hover:scale-110 transition-all duration-300">
                      <FileText className="w-6 h-6 text-brand-teal-dark dark:text-[#4ADE80]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-brand-brown/60 dark:text-[#666666] font-medium mb-1">
                        {t("centerInfo.document", { num: i + 1 })}
                      </p>
                      <p className="text-brand-black/70 dark:text-[#CCCCCC] text-sm font-semibold leading-relaxed">
                        {item}
                      </p>
                      <p className="text-brand-teal-dark/50 dark:text-[#4ADE80]/40 text-[11px] mt-2 flex items-center gap-1 group-hover:text-brand-teal-dark dark:group-hover:text-[#4ADE80] transition-colors">
                        <Info className="w-3 h-3" />
                        {t("centerInfo.enrollment.clickToView")}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-brand-brown/30 dark:text-[#555555] shrink-0 mt-1 group-hover:text-brand-teal-dark dark:group-hover:text-[#4ADE80] transition-all duration-300 ${isRTL ? "group-hover:-rotate-90" : "group-hover:-rotate-90"}`}
                    />
                  </button>
                ))}
            </div>

            <div
              className={`text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "550ms" }}
            >
              <Button
                onClick={() => {
                  setModalOpen(true);
                  setActiveTab("docs");
                }}
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
          modalOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        dir={dir}
      >
        <div
          className={`absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${modalOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setModalOpen(false)}
        />

        <div
          className={`relative bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 w-full max-w-2xl max-h-[90vh] overflow-hidden transition-all duration-300 ${
            modalOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-[#1A1A1A] border-b border-brand-beige/50 dark:border-[#2A2A2A] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-teal-dark/[0.08] dark:bg-[#4ADE80]/[0.1] flex items-center justify-center">
                <FileText className="w-5 h-5 text-brand-teal-dark dark:text-[#4ADE80]" />
              </div>
              <div>
                <h3
                  className="text-lg font-bold text-brand-black dark:text-[#E5E5E5]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {t("centerInfo.enrollment.modalTitle")}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setModalOpen(false)}
              className="w-9 h-9 rounded-xl bg-brand-gray dark:bg-[#222222] hover:bg-brand-beige dark:hover:bg-[#333333] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-brand-black/50 dark:text-[#888888]" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-brand-beige/40 dark:border-[#2A2A2A] bg-brand-gray/30 dark:bg-[#151515] px-4 overflow-x-auto">
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
                        ? "text-brand-teal-dark dark:text-[#4ADE80]"
                        : "text-brand-brown/50 dark:text-[#666666] hover:text-brand-brown/80 dark:hover:text-[#AAAAAA]"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${tab.key === "warnings" && isActive ? "text-amber-500 dark:text-amber-400" : ""}`}
                    />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        isActive
                          ? "bg-brand-teal-dark dark:bg-[#4ADE80] text-white dark:text-[#0F0F0F]"
                          : "bg-brand-beige/60 dark:bg-[#2A2A2A] text-brand-brown/50 dark:text-[#666666]"
                      }`}
                    >
                      {tab.count}
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-2 h-[2px] rounded-full bg-brand-teal-dark dark:bg-[#4ADE80]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div
            className="overflow-y-auto px-6 py-5 space-y-4"
            style={{ maxHeight: "calc(90vh - 250px)" }}
          >
            {activeTab === "docs" && (
              <div className="space-y-4">
                {DOCS.map((doc, i) => {
                  const Icon = doc.icon;
                  return (
                    <div
                      key={i}
                      className="bg-brand-gray/40 dark:bg-[#222222] rounded-xl p-5 border border-brand-beige/40 dark:border-[#2A2A2A]"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-brand-teal-dark/[0.08] dark:bg-[#4ADE80]/[0.1] flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-brand-teal-dark dark:text-[#4ADE80]" />
                        </div>
                        <div>
                          <h4
                            className="font-bold text-brand-black dark:text-[#E5E5E5] text-[15px] mb-1.5"
                            style={{ fontFamily: "var(--font-sans)" }}
                          >
                            {doc.title}
                          </h4>
                          <p className="text-brand-black/55 dark:text-[#AAAAAA] text-[13px] leading-relaxed">
                            {doc.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "conditions" && Array.isArray(conditions) && (
              <div className="space-y-3">
                {conditions.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-xl bg-brand-gray/40 dark:bg-[#222222] border border-brand-beige/40 dark:border-[#2A2A2A]"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-teal-dark/[0.08] dark:bg-[#4ADE80]/[0.1] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-teal-dark dark:text-[#4ADE80]" />
                    </div>
                    <p className="text-brand-black/65 dark:text-[#AAAAAA] text-[13px] leading-relaxed pt-0.5">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "warnings" && Array.isArray(warnings) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
                  <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                  <p className="text-amber-700/70 dark:text-amber-400/70 text-[12px] font-medium">
                    {t("centerInfo.enrollment.warnings")}
                  </p>
                </div>
                {warnings.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-xl bg-red-50/40 dark:bg-red-950/20 border border-red-200/30 dark:border-red-800/20"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-500/[0.08] dark:bg-red-500/[0.12] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-red-500 dark:text-red-400 text-[11px] font-bold">
                        {i + 1}
                      </span>
                    </div>
                    <p className="text-brand-black/60 dark:text-[#AAAAAA] text-[13px] leading-relaxed pt-0.5">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "notes" && Array.isArray(notes) && (
              <div className="space-y-3">
                {notes.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/20"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/[0.08] dark:bg-blue-500/[0.12] flex items-center justify-center shrink-0 mt-0.5">
                      <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    </div>
                    <p className="text-brand-black/60 dark:text-[#AAAAAA] text-[13px] leading-relaxed pt-0.5">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-[#1A1A1A] border-t border-brand-beige/50 dark:border-[#2A2A2A] px-6 py-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => {
                    setAccepted(e.target.checked);
                    setShowWarning(false);
                  }}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded-md border-2 border-brand-beige dark:border-[#444444] peer-checked:border-brand-teal-dark dark:peer-checked:border-[#4ADE80] peer-checked:bg-brand-teal-dark dark:peer-checked:bg-[#4ADE80] transition-all duration-200 flex items-center justify-center">
                  {accepted && (
                    <svg
                      className="w-3 h-3 text-white dark:text-[#0F0F0F]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span
                className={`text-[13px] leading-relaxed transition-colors ${accepted ? "text-brand-black/70 dark:text-[#CCCCCC]" : "text-brand-black/50 dark:text-[#888888] group-hover:text-brand-black/65 dark:group-hover:text-[#AAAAAA]"}`}
              >
                {t("centerInfo.enrollment.acceptTerms")}
              </span>
            </label>

            {showWarning && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <p className="text-amber-600 dark:text-amber-400 text-[12px] font-medium">
                  {t("centerInfo.enrollment.mustAcceptTerms")}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="flex-1 border-brand-beige dark:border-[#2A2A2A] text-brand-brown/60 dark:text-[#888888] hover:bg-brand-gray dark:hover:bg-[#222222] rounded-xl h-11 font-medium"
              >
                {t("centerInfo.enrollment.close")}
              </Button>
              <Button
                onClick={handleProceed}
                disabled={!accepted}
                className={`flex-1 rounded-xl h-11 font-semibold gap-2 transition-all duration-300 ${
                  accepted
                    ? "bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white shadow-lg shadow-brand-teal-dark/20 hover:shadow-xl hover:-translate-y-0.5"
                    : "bg-brand-beige dark:bg-[#222222] text-brand-brown/40 dark:text-[#555555] cursor-not-allowed"
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
    <section
      ref={ref}
      className="py-16 lg:py-20 bg-brand-teal-dark dark:bg-[#0A0A0A] relative overflow-hidden"
      dir={dir}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full border border-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full border border-white/5 translate-y-1/3 -translate-x-1/4" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-10 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <h2
            className="text-2xl sm:text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("centerInfo.officialLinks")}
          </h2>
          <div className="flex justify-center mt-3">
            <div
              className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${visible ? "w-12" : "w-0"}`}
              style={{ transitionDelay: "300ms" }}
            />
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
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{
                transitionDelay: `${200 + i * 80}ms`,
                transitionDuration: "700ms",
              }}
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
    <section
      ref={ref}
      className="py-20 lg:py-28 bg-white dark:bg-[#121212] relative"
      dir={dir}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-10 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-brand-teal-dark dark:text-[#4ADE80]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("centerInfo.ourLocation")}
          </h2>
          <div className="flex justify-center mt-3">
            <div
              className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${visible ? "w-16" : "w-0"}`}
              style={{ transitionDelay: "300ms" }}
            />
          </div>
        </div>

        <div
          className={`rounded-2xl overflow-hidden border border-brand-beige/60 dark:border-[#2A2A2A] shadow-lg dark:shadow-black/30 mb-16 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: "200ms" }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d906.2739290721481!2d6.85836637739475!3d33.39644648821209!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e1!3m2!1sfr!2sdz!4v1772443521691!5m2!1sfr!2sdz"
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

        <div
          className={`text-center mb-10 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "400ms" }}
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-brand-teal-dark dark:text-[#4ADE80]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("centerInfo.contactTitle")}
          </h2>
          <div className="flex justify-center mt-3">
            <div className="w-16 h-1 rounded-full bg-brand-mustard" />
          </div>
        </div>

        <div className="max-w-xl mx-auto text-center space-y-6">
          <p className="text-brand-black/50 dark:text-[#888888]">
            {t("centerInfo.contactDesc")}
          </p>

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
              {
                icon: MapPin,
                text: t("footer.universityLabel"),
                href: "https://maps.app.goo.gl/6Er2h85M9BPXovvW6",
                dir: undefined,
              },
              {
                icon: Facebook,
                text: "Facebook",
                href: "https://www.facebook.com/share/1C1T8Ru8K9/",
                dir: "ltr" as const,
              },
              {
                icon: Mail,
                text: "ceil@univ-eloued.dz",
                href: "mailto:ceil@univ-eloued.dz",
                dir: "ltr" as const,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex flex-col items-center gap-2.5 p-5 rounded-xl bg-brand-gray/40 dark:bg-[#1A1A1A] border border-brand-beige/50 dark:border-[#2A2A2A] hover:shadow-lg hover:shadow-brand-teal-dark/[0.04] dark:hover:shadow-black/20 hover:-translate-y-0.5 cursor-pointer transition-all duration-300 ${
                    visible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                  }`}
                  style={{
                    transitionDelay: `${600 + i * 100}ms`,
                    transitionDuration: "700ms",
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-teal-dark/[0.07] dark:bg-[#4ADE80]/[0.08] flex items-center justify-center group-hover:bg-brand-teal-dark/[0.12] dark:group-hover:bg-[#4ADE80]/[0.12] transition-colors">
                    <Icon className="w-5 h-5 text-brand-teal-dark dark:text-[#4ADE80]" />
                  </div>
                  <p
                    className="text-sm text-brand-black/60 dark:text-[#AAAAAA] text-center"
                    dir={item.dir}
                  >
                    {item.text}
                  </p>
                </a>
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
      <PresentationSection />
      <TrainingNatureSection />
      <EducationalResourcesSection />
      <FileCompositionSection />
      <UsefulLinksSection />
      <LocationContactSection />
    </>
  );
}
