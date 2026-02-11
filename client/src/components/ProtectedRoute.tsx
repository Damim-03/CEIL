/* ===============================================================
   PROTECTED ROUTE - Enhanced Security (v3)
   
   1. Not logged in → /login (saves original URL for after login)
   2. Wrong role → redirect to own dashboard (cleans browser history)
   3. Disabled account → /unauthorized
   4. Loading → PageLoader (no flash)
   5. ✅ Back-button protection after logout
=============================================================== */

import { Navigate, useLocation } from "react-router-dom";
import { useMe } from "../hooks/auth/auth.hooks";
import PageLoader from "./PageLoader";
import { useEffect } from "react";
import type { JSX } from "react/jsx-runtime";

type AllowedRole = "ADMIN" | "TEACHER" | "STUDENT";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: AllowedRole[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { data: user, isLoading, isError, refetch } = useMe();
  const location = useLocation();

  // 🔒 Back-button protection: re-check auth when page restored from cache
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page restored from bfcache (back/forward navigation after logout)
        refetch();
      }
    };

    const handlePopState = () => {
      refetch();
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [refetch]);

  // 🚫 Wrong role → hard redirect (prevents back-button loop)
  useEffect(() => {
    if (isLoading || !user || isError) return;
    if (!allowedRoles) return;

    if (!allowedRoles.includes(user.role as AllowedRole)) {
      const roleHomeMap: Record<string, string> = {
        ADMIN: "/admin",
        TEACHER: "/admin",
        STUDENT: "/dashboard",
      };

      const target = roleHomeMap[user.role] ?? "/";
      window.location.replace(target);
    }
  }, [user, isLoading, isError, allowedRoles]);

  // ⏳ Still checking auth
  if (isLoading) return <PageLoader />;

  // 🚫 Not authenticated → login (save return URL)
  if (!user || isError) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // 🚫 Account disabled
  if (user.is_active === false) {
    return (
      <Navigate to="/unauthorized" replace state={{ reason: "disabled" }} />
    );
  }

  // 🚫 Wrong role → show loader while redirecting
  if (allowedRoles && !allowedRoles.includes(user.role as AllowedRole)) {
    return <PageLoader />;
  }

  // ✅ Authorized
  return children;
}