import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { useMe, useLogout } from "../hooks/auth/auth.hooks";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/languages", label: "Languages" },
  { to: "/announcements", label: "Announcements" },
  { to: "/about-us", label: "About Us" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const { data: user } = useMe();

  const logoutMutation = useLogout();

  const dashboardPath =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "TEACHER"
        ? "/teacher"
        : "/dashboard";

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-beige/60 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal-dark transition-transform group-hover:scale-105">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span
              className="text-lg font-bold tracking-tight text-brand-black"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              LTC Platform
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-brown -mt-0.5">
              Language Center
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                isActive(link.to)
                  ? "text-brand-teal-dark bg-brand-beige-light"
                  : "text-brand-black/70 hover:text-brand-teal-dark hover:bg-brand-beige-light/50"
              }`}
            >
              {link.label}
              {isActive(link.to) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-mustard rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {!user && (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex text-sm font-medium text-brand-black/70 hover:text-brand-teal-dark transition-colors px-3 py-2"
              >
                Login
              </Link>
              <Button
                asChild
                className="bg-brand-mustard hover:bg-brand-mustard-dark text-white border-0 shadow-sm"
              >
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}

          {user && (
            <div className="flex items-center gap-3">
              <Link
                to={dashboardPath}
                className="flex items-center gap-2 rounded-full border border-brand-beige p-1 pr-3 hover:bg-brand-beige-light/50 transition-colors"
              >
                <img
                  src={user.google_avatar || "/avatar-placeholder.png"}
                  className="h-8 w-8 rounded-full border border-brand-beige object-cover"
                  alt="Avatar"
                />
                <span className="text-sm font-medium text-brand-black/80 hidden sm:inline">
                  Dashboard
                </span>
              </Link>

              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-xs font-medium text-brand-brown hover:text-brand-mustard-dark transition-colors"
              >
                {logoutMutation.isPending ? "..." : "Logout"}
              </button>
            </div>
          )}

          {/* Mobile Toggle */}
          <button
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg hover:bg-brand-beige-light/50 transition-colors"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-brand-black" />
            ) : (
              <Menu className="h-5 w-5 text-brand-black" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-brand-beige/60 bg-white md:hidden animate-fade-in">
          <nav className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.to)
                    ? "text-brand-teal-dark bg-brand-beige-light"
                    : "text-brand-black/70 hover:bg-brand-beige-light/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="pt-3 border-t border-brand-beige/60 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-brand-black/70 rounded-lg hover:bg-brand-beige-light/50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-white bg-brand-mustard rounded-lg text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
