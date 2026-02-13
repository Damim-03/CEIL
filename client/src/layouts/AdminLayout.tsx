import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { TooltipProvider } from "../components/ui/tooltip";
import Sidebar from "../app/admin/components/Sidebar";
import { Header } from "../app/admin/components/Header";

const AdminLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // ✅ Collapse sidebar on click outside (all screen sizes)
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
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, [location.pathname]);

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-[#FAFAF8]">
        <div ref={sidebarRef}>
          <Sidebar collapsed={collapsed} onExpand={() => setCollapsed(false)} />
        </div>

        <div
          className={`flex flex-1 flex-col transition-all duration-300 ${
            collapsed ? "ml-16" : "ml-64"
          }`}
        >
          <Header
            onMenuClick={() => setCollapsed((prev) => !prev)}
          />

          <main className="flex-1 p-6 bg-[#FAFAF8]">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AdminLayout;