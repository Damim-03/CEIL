import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { TooltipProvider } from "../components/ui/tooltip";
import Sidebar from "../app/admin/components/Sidebar";
import { Header } from "../app/admin/components/Header";

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Get the title based on the current route
  const getPageTitle = () => {
    // Extract segments from path
    const segments = location.pathname.split("/").filter(Boolean);

    // Get the last segment (e.g., "dashboard", "users", "students")
    const lastSegment = segments[segments.length - 1];

    // Capitalize first letter
    return lastSegment
      ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
      : "Admin";
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        {/* Main Area */}
        <div
          className={`flex flex-1 flex-col transition-all duration-300 ${
            sidebarCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          {/* Top Navbar */}
          <Header title={getPageTitle()} />

          {/* Page Content */}
          <main className="flex-1 p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AdminLayout;
