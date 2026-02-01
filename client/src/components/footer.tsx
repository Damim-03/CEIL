import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                LTC Platform
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your gateway to mastering new languages with professional
              instruction and flexible schedules.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Languages
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/languages/english" className="hover:text-foreground">English</Link></li>
              <li><Link to="/languages/french" className="hover:text-foreground">French</Link></li>
              <li><Link to="/languages/german" className="hover:text-foreground">German</Link></li>
              <li><Link to="/languages/spanish" className="hover:text-foreground">Spanish</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/auth/register" className="hover:text-foreground">Create Account</Link></li>
              <li><Link to="/auth/login" className="hover:text-foreground">Sign In</Link></li>
              <li><Link to="/student" className="hover:text-foreground">Student Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>123 Education Street</li>
              <li>Learning City, LC 12345</li>
              <li>contact@ltc-platform.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Language Training Center. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
