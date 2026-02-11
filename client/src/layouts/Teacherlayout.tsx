import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { TooltipProvider } from "../components/ui/tooltip";
import TeacherSidebar from "../app/teacher/components/Teachersidebar";
import { TeacherHeader } from "../app/teacher/components/TeacherHeader";

const TeacherLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <TeacherSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Area */}
        <div className="flex flex-1 flex-col md:ml-64 transition-all duration-300">
          {/* Top Navbar */}
          <TeacherHeader onMenuClick={() => setSidebarOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </TooltipProvider>
  );
};

export default TeacherLayout;
