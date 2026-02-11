import { useLanguage } from "../../../hooks/useLanguage";
import type { LangCode } from "../../i18n";

interface LanguageSwitcherProps {
  /** "header" = compact buttons, "menu" = full labels (mobile) */
  variant?: "header" | "menu";
  className?: string;
}

export function LanguageSwitcher({
  variant = "header",
  className = "",
}: LanguageSwitcherProps) {
  const { currentLang, languages, switchLanguage } = useLanguage();

  if (variant === "menu") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => switchLanguage(lang.code as LangCode)}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              currentLang === lang.code
                ? "bg-white text-brand-teal-dark"
                : "text-white/50 hover:text-white border border-white/15"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    );
  }

  // Header variant: compact
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code as LangCode)}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
            currentLang === lang.code
              ? "bg-white text-brand-teal-dark"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          {lang.labelShort}
        </button>
      ))}
    </div>
  );
}