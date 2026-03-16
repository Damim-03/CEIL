import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { NativeModules, Platform } from "react-native";
import ar from "./locales/ar.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export const LANGUAGES = [
  { code: "ar", label: "العربية", labelShort: "AR", dir: "rtl" as const },
  { code: "en", label: "English", labelShort: "EN", dir: "ltr" as const },
  { code: "fr", label: "Français", labelShort: "FR", dir: "ltr" as const },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];
export const DEFAULT_LANG: LangCode = "ar";
export const SUPPORTED_LANGS: LangCode[] = LANGUAGES.map((l) => l.code);

export function getLangDir(lang: LangCode): "rtl" | "ltr" {
  return LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";
}

// Detect device language without expo-localization dependency
function detectLang(): LangCode {
  try {
    const locale: string =
      Platform.OS === "ios"
        ? NativeModules.SettingsManager?.settings?.AppleLocale ||
          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
          ""
        : NativeModules.I18nManager?.localeIdentifier || "";
    const code = locale.substring(0, 2).toLowerCase();
    if (SUPPORTED_LANGS.includes(code as LangCode)) return code as LangCode;
  } catch {}
  return DEFAULT_LANG;
}

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: detectLang(),
  fallbackLng: DEFAULT_LANG,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
