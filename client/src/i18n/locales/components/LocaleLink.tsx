import { Link, type LinkProps } from "react-router-dom";
import { useLanguage } from "../../../hooks/useLanguage";

/**
 * Drop-in replacement for react-router's <Link> that automatically
 * prepends the current language prefix to the `to` prop.
 *
 * Usage:
 *   <LocaleLink to="/courses">Courses</LocaleLink>
 *   // → renders as <Link to="/ar/courses"> if current lang is "ar"
 *
 * Accepts all the same props as react-router's <Link>.
 */
interface LocaleLinkProps extends Omit<LinkProps, "to"> {
  to: string;
}

export function LocaleLink({ to, ...rest }: LocaleLinkProps) {
  const { localePath } = useLanguage();

  // Don't prefix external links or hash links
  const isExternal = to.startsWith("http") || to.startsWith("//");
  const isHash = to.startsWith("#");

  const href = isExternal || isHash ? to : localePath(to);

  return <Link to={href} {...rest} />;
}