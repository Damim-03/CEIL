import { Quote, Sparkles, GraduationCap } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";
import { useState, useEffect, useRef } from "react";

import directorPhoto from "../../assets/logo.jpg";

export function DirectorMessage() {
  const { t, dir, isRTL } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28 bg-white relative overflow-hidden"
      dir={dir}
    >
      {/* ═══ Background ═══ */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[8%] left-[5%] w-80 h-80 rounded-full bg-brand-teal-dark/[0.025]"
          style={{ animation: "directorFloat 20s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[10%] right-[3%] w-96 h-96 rounded-full bg-brand-mustard/[0.03]"
          style={{
            animation: "directorFloat 25s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute top-[40%] right-[15%] w-48 h-48 rounded-full bg-brand-teal-dark/[0.02]"
          style={{ animation: "directorFloat 18s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #264230 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-brand-beige/40 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ═══ Header ═══ */}
        <div
          className={`text-center mb-14 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2
            className="text-3xl font-bold text-brand-black sm:text-4xl"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("director.sectionTitle")}
          </h2>
          <div className="flex justify-center mt-3">
            <div
              className={`h-1 rounded-full bg-brand-mustard transition-all duration-1000 ease-out ${
                isVisible ? "w-16" : "w-0"
              }`}
              style={{ transitionDelay: "300ms" }}
            />
          </div>
        </div>

        {/* ═══ Content ═══ */}
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[400px_1fr] items-center max-w-6xl mx-auto">
          {/* ── Photo ── */}
          <div
            className={`lg:order-1 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : `opacity-0 ${isRTL ? "translate-x-12" : "-translate-x-12"}`
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="relative group">
              {/* Decorative frames */}
              <div
                className={`absolute -top-4 w-full h-full rounded-2xl border-2 border-brand-mustard/20 -z-10 transition-all duration-500 group-hover:scale-[1.02] group-hover:border-brand-mustard/35 ${
                  isRTL ? "-right-4" : "-left-4"
                }`}
              />
              <div
                className={`absolute -bottom-4 w-full h-full rounded-2xl border-2 border-brand-teal-dark/10 -z-10 transition-all duration-500 group-hover:scale-[1.02] group-hover:border-brand-teal-dark/20 ${
                  isRTL ? "-left-4" : "-right-4"
                }`}
              />

              {/* Photo */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-brand-teal-dark/15 group-hover:shadow-brand-teal-dark/25 transition-shadow duration-500">
                <img
                  src={directorPhoto}
                  alt={t("director.name")}
                  className="w-full aspect-[4/5] object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-500" />

                {/* Hover badge */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              {/* Name Card */}
              <div
                className={`absolute -bottom-6 group-hover:-bottom-5 transition-all duration-500 ${
                  isRTL ? "right-4 left-6" : "left-4 right-6"
                }`}
              >
                <div className="relative bg-gradient-to-r from-brand-mustard to-brand-mustard/90 backdrop-blur-sm rounded-xl px-6 py-4 shadow-xl shadow-brand-mustard/20 group-hover:shadow-brand-mustard/35 transition-shadow duration-500 overflow-hidden">
                  {/* Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  <p
                    className="relative text-white font-bold text-base leading-snug"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {t("director.welcomeLabel")}
                  </p>
                  <p className="relative text-white/80 text-sm mt-1">
                    {t("director.name")}
                  </p>
                </div>
              </div>

              {/* Corner dots */}
              <div
                className={`absolute -top-6 grid grid-cols-3 gap-1.5 opacity-30 ${
                  isRTL ? "-right-6" : "-left-6"
                }`}
              >
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-brand-mustard"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Text ── */}
          <div
            className={`lg:order-2 pt-6 lg:pt-0 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : `opacity-0 ${isRTL ? "-translate-x-12" : "translate-x-12"}`
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            {/* Quote icon */}
            <div className="mb-6 relative w-fit">
              <div className="w-14 h-14 rounded-2xl bg-brand-teal-dark/[0.08] flex items-center justify-center hover:bg-brand-teal-dark/[0.12] transition-colors duration-300">
                <Quote
                  className="w-7 h-7 text-brand-teal-dark"
                  strokeWidth={1.5}
                />
              </div>
              {/* Slow gentle pulse */}
              <div
                className="absolute inset-0 w-14 h-14 rounded-2xl border border-brand-teal-dark/10"
                style={{ animation: "quotePulse 4s ease-in-out infinite" }}
              />
            </div>

            {/* Title */}
            <h3
              className="text-xl lg:text-2xl font-bold text-brand-black mb-6 leading-snug"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {t("director.title")}
            </h3>

            {/* Paragraphs */}
            <div className="space-y-4">
              {["message1", "message2", "message3"].map((key, i) => (
                <p
                  key={key}
                  className={`text-brand-black/60 leading-[1.9] text-[15px] transition-all duration-700 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${600 + i * 150}ms` }}
                >
                  {t(`director.${key}`)}
                </p>
              ))}
            </div>

            {/* Highlight quote */}
            <div
              className={`mt-6 p-4 rounded-xl bg-brand-gray/60 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                transitionDelay: "1050ms",
                borderRight: isRTL ? "4px solid" : "none",
                borderLeft: isRTL ? "none" : "4px solid",
                borderColor: "var(--color-brand-mustard, #C19A5E)",
              }}
            >
              <p className="text-brand-teal-dark font-semibold text-sm italic leading-relaxed">
                "{t("director.highlightQuote")}"
              </p>
            </div>

            {/* Signature */}
            <div
              className={`mt-8 pt-6 border-t border-brand-beige/80 flex items-center gap-4 group/sig transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "1200ms" }}
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-teal-dark/10 to-brand-teal-dark/[0.04] flex items-center justify-center shrink-0 group-hover/sig:from-brand-teal-dark/[0.15] group-hover/sig:to-brand-teal-dark/[0.08] transition-all duration-300">
                  <span className="text-xl font-bold text-brand-teal-dark">
                    {t("director.initials")}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-mustard border-2 border-white shadow-sm" />
              </div>
              <div>
                <p
                  className="font-bold text-brand-black group-hover/sig:text-brand-teal-dark transition-colors duration-300"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {t("director.fullName")}
                </p>
                <p className="text-sm text-brand-brown">{t("director.role")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Keyframes ═══ */}
      <style>{`
        @keyframes directorFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }
        @keyframes quotePulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.3); }
        }
      `}</style>
    </section>
  );
}
