import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LANGUAGES,
  SUPPORTED_LANGS,
  getLangDir,
  type LangCode,
} from "../i18n";

/**
 * Hook to manage language switching with URL prefix.
 *
 * URL structure:  /:lang/rest-of-path
 *   /ar/courses   → Arabic
 *   /en/courses   → English
 *   /fr/courses   → French
 *   /courses      → Defaults to Arabic (DEFAULT_LANG)
 */
export function useLanguage() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLang = i18n.language as LangCode;
  const dir = getLangDir(currentLang);
  const isRTL = dir === "rtl";

  /**
   * Extract the path WITHOUT the language prefix.
   * "/ar/courses" → "/courses"
   * "/en/about-us" → "/about-us"
   * "/courses" → "/courses"
   */
  const getPathWithoutLang = useCallback(
    (pathname: string): string => {
      const segments = pathname.split("/").filter(Boolean);
      if (
        segments.length > 0 &&
        SUPPORTED_LANGS.includes(segments[0] as LangCode)
      ) {
        return "/" + segments.slice(1).join("/") || "/";
      }
      return pathname;
    },
    []
  );

  /**
   * Build a localized path: addLangPrefix("/courses", "fr") → "/fr/courses"
   * For the default language (ar), we can optionally skip the prefix.
   */
  const addLangPrefix = useCallback(
    (path: string, lang?: LangCode): string => {
      const l = lang ?? currentLang;
      const cleanPath = getPathWithoutLang(path);
      // Always add prefix for clarity (even for default)
      return `/${l}${cleanPath === "/" ? "" : cleanPath}`;
    },
    [currentLang, getPathWithoutLang]
  );

  /**
   * Switch language: updates i18n, HTML attributes, and navigates to the new URL.
   */
  const switchLanguage = useCallback(
    (lang: LangCode) => {
      if (lang === currentLang) return;

      // Update i18next
      i18n.changeLanguage(lang);

      // Update <html> attributes
      document.documentElement.lang = lang;
      document.documentElement.dir = getLangDir(lang);

      // Navigate to new URL with lang prefix
      const cleanPath = getPathWithoutLang(
        location.pathname
      );
      const newPath = `/${lang}${cleanPath === "/" ? "" : cleanPath}`;
      navigate(newPath + location.search + location.hash, { replace: true });
    },
    [currentLang, i18n, navigate, location, getPathWithoutLang]
  );

  /**
   * Get a localized link href. Use this in <Link to={localePath("/courses")}>.
   */
  const localePath = useCallback(
    (path: string): string => addLangPrefix(path),
    [addLangPrefix]
  );

  return {
    /** Current language code: "ar" | "en" | "fr" */
    currentLang,
    /** Current direction: "rtl" | "ltr" */
    dir,
    /** Is current language RTL? */
    isRTL,
    /** All available languages */
    languages: LANGUAGES,
    /** Translation function */
    t,
    /** Switch to a different language */
    switchLanguage,
    /** Get a localized path string */
    localePath,
    /** Get path without lang prefix */
    getPathWithoutLang,
    /** Add lang prefix to a path */
    addLangPrefix,
  };
}