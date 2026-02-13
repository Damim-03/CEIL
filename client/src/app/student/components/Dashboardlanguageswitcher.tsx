import { useTranslation } from "react-i18next";
import { LANGUAGES, type LangCode, getLangDir } from "../../../i18n/i18n";
import { cn } from "../../../lib/utils/utils";

/**
 * Language switcher for dashboard pages (no URL prefix).
 * Simply changes i18n language + HTML dir attribute.
 */
export function DashboardLanguageSwitcher({ className = "" }: { className?: string }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const switchLanguage = (lang: LangCode) => {
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = getLangDir(lang);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className={cn(
            "px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors",
            currentLang === lang.code
              ? "bg-[#2B6F5E] text-white border-[#2B6F5E]"
              : "text-[#6B5D4F] border-[#D8CDC0]/30 hover:bg-[#D8CDC0]/15",
          )}
        >
          {lang.labelShort}
        </button>
      ))}
    </div>
  );
}