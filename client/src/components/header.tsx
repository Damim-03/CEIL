import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { useMe, useLogout } from "../hooks/auth/auth.hooks";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isProtectedRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/teacher") ||
    location.pathname.startsWith("/dashboard");

  const { data: user } = useMe({
    enabled: isProtectedRoute,
  });

  const logoutMutation = useLogout();

  const dashboardPath =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "TEACHER"
      ? "/teacher"
      : "/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4">
        {/* LEFT */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">LTC Platform</span>
        </Link>

        {/* CENTER */}
        <nav className="mx-auto hidden gap-10 md:flex">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
          <Link to="/languages" className="text-sm text-muted-foreground hover:text-foreground">Languages</Link>
          <Link to="/announcements" className="text-sm text-muted-foreground hover:text-foreground">Announcements</Link>
          <Link to="/about-us" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link>
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* Guest */}
          {!user && (
            <>
              <Link to="/login" className="text-sm text-muted-foreground">
                Login
              </Link>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}

          {/* Authenticated */}
          {user && (
            <>
              <Link to={dashboardPath}>
                <img
                  src={user.google_avatar || "/avatar-placeholder.png"}
                  className="h-9 w-9 rounded-full border"
                />
              </Link>

              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-xs text-muted-foreground hover:underline"
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </button>
            </>
          )}

          {/* Mobile */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
