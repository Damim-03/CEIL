import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import StudentNavbar from "../app/student/components/StudentNavbar";
import StudentSidebar from "../app/student/components/StudentSidebar";
import PageLoader from "../components/PageLoader";
import { useMe } from "../hooks/auth/auth.hooks";
import { useLanguage } from "../hooks/useLanguage";

// 🔌 Socket.IO — real-time auto-invalidation
import { useSocketEvents } from "../hooks/useSocketEvents";

const StudentLayout = () => {
  const location = useLocation();
  const { dir } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { isLoading } = useMe();

  // 🔌 Socket: listen to student events → auto-refresh React Query
  useSocketEvents("STUDENT");

  // Auto-collapse on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, [location.pathname]);

  // Click outside sidebar → collapse it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (collapsed) return;

      if (sidebarRef.current?.contains(e.target as Node)) return;

      const target = e.target as HTMLElement;
      if (target.closest("[data-sidebar-toggle]")) return;

      setCollapsed(true);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [collapsed]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex min-h-screen bg-[#FAFAF8] dark:bg-[#0F0F0F]" dir={dir}>
      {/* Sidebar */}
      <div ref={sidebarRef}>
        <StudentSidebar
          collapsed={collapsed}
          onExpand={() => setCollapsed(false)}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex flex-1 flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Navbar */}
        <StudentNavbar onMenuClick={() => setCollapsed((prev) => !prev)} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
