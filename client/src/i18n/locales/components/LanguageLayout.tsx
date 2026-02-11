import { useEffect } from "react";
import { useParams, Outlet, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, DEFAULT_LANG, getLangDir, type LangCode } from "../../i18n";

/**
 * Wrapper layout that:
 * 1. Reads :lang from the URL params
 * 2. Syncs i18n language
 * 3. Sets <html lang="..." dir="...">
 * 4. Redirects invalid lang codes to the default
 *
 * Usage in router:
 *   <Route path="/:lang" element={<LanguageLayout />}>
 *     <Route index element={<HomePage />} />
 *     <Route path="courses" element={<CoursesPage />} />
 *     ...
 *   </Route>
 *   <Route path="*" element={<Navigate to={`/${DEFAULT_LANG}`} replace />} />
 */
export function LanguageLayout() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  const isValid = lang && SUPPORTED_LANGS.includes(lang as LangCode);

  useEffect(() => {
    if (!isValid) return;

    const langCode = lang as LangCode;

    // Sync i18n if needed
    if (i18n.language !== langCode) {
      i18n.changeLanguage(langCode);
    }

    // Sync HTML attributes
    document.documentElement.lang = langCode;
    document.documentElement.dir = getLangDir(langCode);
  }, [lang, isValid, i18n]);

  // Redirect invalid lang codes
  if (!isValid) {
    return <Navigate to={`/${DEFAULT_LANG}`} replace />;
  }

  return <Outlet />;
}