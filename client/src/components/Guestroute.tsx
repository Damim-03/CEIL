/* ===============================================================
   GUEST ROUTE - For login/register pages ONLY
   
   1. Logged in → redirect to dashboard (can't see login page)
   2. Not logged in → show login/register page
   3. Supports return URL from ProtectedRoute
=============================================================== */

import { Navigate, useLocation } from "react-router-dom";
import { useMe } from "../hooks/auth/auth.hooks";
import PageLoader from "./PageLoader";
import type { JSX } from "react/jsx-runtime";

interface GuestRouteProps {
  children: JSX.Element;
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const { data: user, isLoading } = useMe();
  const location = useLocation();

  // ⏳ Still checking — don't flash login page
  if (isLoading) return <PageLoader />;

  // ✅ User is logged in — redirect away from login
  if (user) {
    // Check if ProtectedRoute saved a return URL
    const from = (location.state as { from?: string })?.from;

    if (from) {
      return <Navigate to={from} replace />;
    }

    // Default: go to role-based dashboard
    const roleHomeMap: Record<string, string> = {
      ADMIN: "/admin",
      TEACHER: "/admin",
      STUDENT: "/dashboard",
    };

    return <Navigate to={roleHomeMap[user.role] ?? "/"} replace />;
  }

  // 🚫 Not logged in — show login/register page
  return children;
}
