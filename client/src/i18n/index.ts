// ── i18n System ──
// Import this file once in your app entry (main.tsx)
export { default as i18n } from "./i18n";
export {
  LANGUAGES,
  SUPPORTED_LANGS,
  DEFAULT_LANG,
  getLangDir,
  type LangCode,
} from "./i18n";

// ── Hooks ──
export { useLanguage } from "../hooks/useLanguage";

// ── Components ──
export { LanguageLayout } from "../i18n/locales/components/LanguageLayout";
export { LanguageSwitcher } from "../i18n/locales/components/LanguageSwitcher";
export { LocaleLink } from "../i18n/locales/components/LocaleLink";