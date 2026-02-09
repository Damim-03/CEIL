/**
 * useAuthRedirect — Auth-aware registration hook.
 *
 * Uses `useMe()` (cookie-based auth via httpOnly cookies).
 * Works on public pages — returns null user if not authenticated.
 *
 * Place in: src/hooks/useAuthRedirect.ts
 */

import { useMe } from "../../hooks/auth/auth.hooks";


export function useAuthRedirect() {
  const { data: user, isLoading } = useMe();

  const isLoggedIn = !!user;
  const role = user?.role?.toUpperCase() || null;

  /** Where should the "Register" button navigate? */
  const getRegisterHref = (courseId?: string): string => {
    if (!isLoggedIn) {
      const redirect = courseId ? `/courses/${courseId}` : "/courses";
      return `/login?redirect=${encodeURIComponent(redirect)}`;
    }
    switch (role) {
      case "STUDENT":
        return courseId ? `/register?course=${courseId}` : "/register";
      case "ADMIN":
        return "/admin";
      case "TEACHER":
        return "/admin";
      default:
        return "/dashboard";
    }
  };

  /** Button label */
  const getRegisterLabel = (): string => {
    if (!isLoggedIn || role === "STUDENT") return "Register Now";
    return "Go to Dashboard";
  };

  /** Can this user enroll? Only students. */
  const canRegister = (): boolean => {
    if (!isLoggedIn) return true;
    return role === "STUDENT";
  };

  /** Dashboard path for current user */
  const getDashboardHref = (): string => {
    if (role === "ADMIN" || role === "TEACHER") return "/admin";
    return "/dashboard";
  };

  return {
    user,
    isLoggedIn,
    isLoading,
    role,
    getRegisterHref,
    getRegisterLabel,
    canRegister,
    getDashboardHref,
  };
}
