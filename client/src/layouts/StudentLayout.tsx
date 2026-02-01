import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import StudentNavbar from "../app/student/components/StudentNavbar";
import StudentSidebar from "../app/student/components/StudentSidebar";
import PageLoader from "../components/PageLoader";
import { useMe } from "../hooks/auth/auth.hooks";

const StudentLayout = () => {
  const [open, setOpen] = useState(false);
  const { data: user, isLoading } = useMe();

  // Close sidebar when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <StudentSidebar open={open} onClose={() => setOpen(false)} />

      {/* Backdrop overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 md:ml-64">
        {/* Navbar */}
        <StudentNavbar onMenuClick={() => setOpen(!open)} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
