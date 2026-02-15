/* ===============================================================
   AdminLayout.tsx — ✅ Dark Mode Support
   
   📁 src/layouts/AdminLayout.tsx
=============================================================== */

import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { TooltipProvider } from "../components/ui/tooltip";
import Sidebar from "../app/admin/components/Sidebar";
import { Header } from "../app/admin/components/Header";

const AdminLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // ✅ Collapse sidebar on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (collapsed) return;
      const target = e.target as HTMLElement;
      if (sidebarRef.current?.contains(target)) return;
      if (target.closest("[data-sidebar-toggle]")) return;
      setCollapsed(true);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [collapsed]);

  // ✅ Auto-collapse on mobile route change
  useEffect(() => {
    if (window.innerWidth < 768) setCollapsed(true);
  }, [location.pathname]);

  return (
    <TooltipProvider>
      {/* ✅ Dark mode: bg changes */}
      <div className="flex min-h-screen bg-[#FAFAF8] dark:bg-[#0F0F0F] transition-colors duration-300">
        <div ref={sidebarRef}>
          <Sidebar collapsed={collapsed} onExpand={() => setCollapsed(false)} />
        </div>

        <div
          className={`flex flex-1 flex-col transition-all duration-300 ${
            collapsed ? "ml-16" : "ml-64"
          }`}
        >
          <Header onMenuClick={() => setCollapsed((prev) => !prev)} />

          {/* ✅ Dark mode: main content bg */}
          <main className="flex-1 p-6 bg-[#FAFAF8] dark:bg-[#0F0F0F] transition-colors duration-300">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AdminLayout;
