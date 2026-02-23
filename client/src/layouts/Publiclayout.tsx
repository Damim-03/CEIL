// ================================================================
// 📦 src/layouts/PublicLayout.tsx
// ✅ Public pages layout (no auth required)
// 🔌 Real-time announcements via Socket.IO
// ================================================================

import { Outlet } from "react-router-dom";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useLanguage } from "../hooks/useLanguage";
import { useAnnouncementRealtime } from "../hooks/announce/Usepublic";

export default function PublicLayout() {
  const { dir } = useLanguage();

  // 🔌 Listen for announcement changes (pin/unpin/publish/delete)
  // Auto-invalidates React Query cache → UI refreshes instantly
  useAnnouncementRealtime();

  return (
    <div className="flex min-h-screen flex-col" dir={dir}>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}