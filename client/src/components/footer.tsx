import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ChevronUp,
  Facebook,
  Youtube,
} from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import { LocaleLink } from "../i18n/locales/components/LocaleLink";
import logo from "../assets/download.png";
import ceillogo from "../assets/logo.jpg";

export function Footer() {
  const { t, dir, isRTL, currentLang } = useLanguage();

  const NAV_LINKS = [
    { to: "/", label: t("common.home") },
    { to: "/courses", label: t("common.courses") },
    { to: "/about-us", label: t("common.features") },
    { to: "/announcements", label: t("common.announcements") },
    { to: "/contact", label: t("common.contact") },
  ];

  const LANG_LINKS = [
    { label: t("footer.french"), to: "/courses" },
    { label: t("footer.english"), to: "/courses" },
    { label: t("footer.german"), to: "/courses" },
    { label: t("footer.spanish"), to: "/courses" },
    { label: t("footer.italian"), to: "/courses" },
  ];

  const OFFICIAL_LINKS = [
    { label: t("footer.mesrs"), url: "https://www.mesrs.dz" },
    { label: t("footer.progres"), url: "https://progres.mesrs.dz" },
    { label: t("footer.dgrsdt"), url: "https://www.dgrsdt.dz" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative" dir={dir}>
      {/* ═══ Wave divider ═══ */}
      <div className="relative h-16 bg-white overflow-hidden">
        <svg
          className="absolute bottom-0 w-full text-brand-teal-dark"
          viewBox="0 0 1440 64"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0,32 C360,64 720,0 1080,32 C1260,48 1380,56 1440,56 L1440,64 L0,64 Z" />
        </svg>
      </div>

      {/* ═══ Main footer ═══ */}
      <div className="relative bg-brand-teal-dark overflow-hidden">
        {/* Noise */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Decorative circles */}
        <div className="absolute top-10 right-[5%] w-72 h-72 rounded-full border border-white/[0.03] pointer-events-none" />
        <div className="absolute bottom-20 left-[8%] w-48 h-48 rounded-full border border-white/[0.02] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          {/* ── Top: Identity + Back to top ── */}
          <div className="flex items-start justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img src={logo} alt="University" className="h-12 w-12 object-contain opacity-90" />
                <div className="w-px h-8 bg-white/10" />
                <img src={ceillogo} alt="CEIL" className="h-10 w-10 object-contain rounded-md opacity-90" />
              </div>
              <div className={isRTL ? "mr-2" : "ml-2"}>
                <p className="text-white font-bold text-sm tracking-tight" style={{ fontFamily: "var(--font-sans)" }}>
                  {t("header.universityName")}
                </p>
                <p className="text-white/40 text-[11px] mt-0.5">
                  {t("header.centerName")}
                </p>
              </div>
            </div>
            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all duration-200 shrink-0"
              aria-label="Back to top"
            >
              <span className="text-[11px] font-medium hidden sm:inline">{t("footer.backToTop")}</span>
              <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>
          </div>

          {/* ── Grid ── */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-14">
            {/* Col 1: About */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-brand-mustard" />
                {t("footer.aboutCenter")}
              </h3>
              <p className="text-white/35 text-[13px] leading-relaxed mb-5">
                {t("footer.aboutDesc")}
              </p>
              <div className="flex items-center gap-2">
                {[
                  { icon: Facebook, href: "https://www.facebook.com" },
                  { icon: Youtube, href: "https://www.youtube.com" },
                  { icon: Mail, href: "mailto:ceil@univ-eloued.dz" },
                ].map(({ icon: Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.1] hover:border-white/[0.12] transition-all duration-200"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-brand-mustard" />
                {t("footer.quickLinks")}
              </h3>
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.to}>
                    <LocaleLink
                      to={link.to}
                      className="group flex items-center gap-2 text-[13px] text-white/35 hover:text-white transition-colors duration-200"
                    >
                      <span className="w-1 h-1 rounded-full bg-white/15 group-hover:bg-brand-mustard transition-colors duration-200" />
                      {link.label}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Languages + Official */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-brand-mustard" />
                {t("footer.languages")}
              </h3>
              <ul className="space-y-2">
                {LANG_LINKS.map((link, i) => (
                  <li key={i}>
                    <LocaleLink
                      to={link.to}
                      className="group flex items-center gap-2 text-[13px] text-white/35 hover:text-white transition-colors duration-200"
                    >
                      <span className="w-1 h-1 rounded-full bg-white/15 group-hover:bg-brand-mustard transition-colors duration-200" />
                      {link.label}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.1em] mb-2.5">
                  {t("footer.officialPlatforms")}
                </p>
                {OFFICIAL_LINKS.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1.5 text-[12px] text-white/25 hover:text-brand-mustard transition-colors duration-200 mb-1.5"
                  >
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 4: Contact */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-brand-mustard" />
                {t("footer.contact")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-mustard/60" />
                  </div>
                  <p className="text-white/50 text-[13px] leading-relaxed">{t("footer.address")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5 text-brand-mustard/60" />
                  </div>
                  <p className="text-white/50 text-[13px]" dir="ltr">+213 29 71 19 61</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-brand-mustard/60" />
                  </div>
                  <a href="mailto:ceil@univ-eloued.dz" className="text-white/50 text-[13px] hover:text-brand-mustard transition-colors" dir="ltr">
                    ceil@univ-eloued.dz
                  </a>
                </div>
              </div>
              <LocaleLink
                to="/contact"
                className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-brand-mustard/10 border border-brand-mustard/15 text-brand-mustard text-[12px] font-semibold hover:bg-brand-mustard/[0.15] hover:border-brand-mustard/25 transition-all duration-200"
              >
                <Mail className="w-3 h-3" />
                {t("footer.contactUs")}
              </LocaleLink>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div className="pt-6 border-t border-white/[0.06]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-white/20 text-[11px] text-center sm:text-start">
                © {new Date().getFullYear()} {t("footer.copyright")}
              </p>
              <div className="flex items-center gap-4">
                <p className="text-white/15 text-[10px]">{t("footer.madeWith")}</p>
                <div className="flex items-center gap-1.5">
                  {[
                    { code: "عر", lang: "ar" },
                    { code: "EN", lang: "en" },
                    { code: "FR", lang: "fr" },
                  ].map(({ code, lang }) => (
                    <span
                      key={lang}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        currentLang === lang
                          ? "bg-brand-mustard/20 text-brand-mustard"
                          : "bg-white/[0.04] text-white/15"
                      }`}
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}