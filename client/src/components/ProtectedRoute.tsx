import { Navigate } from "react-router-dom";
import { useMe } from "../hooks/auth/auth.hooks";
import PageLoader from "./PageLoader";
import type { JSX } from "react/jsx-runtime";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles?: ("ADMIN" | "TEACHER" | "STUDENT")[];
}) {
  const { data: user, isLoading } = useMe();

  if (isLoading) return <PageLoader />;

  if (!user) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
