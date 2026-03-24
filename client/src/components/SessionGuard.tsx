// ================================================================
// 📦 src/components/SessionGuard.tsx
// ✅ يُغلّف التطبيق بأكمله:
//    - يراقب الخمول عبر useIdleTimer
//    - يستمع لحدث SESSION_EXPIRED_EVENT من axiosInstance
//    - يعرض SessionExpiredModal عند الحاجة
//
// الاستخدام في AdminLayout.tsx:
//   <SessionGuard isAuthenticated={isAuthenticated}>
//     <Outlet />
//   </SessionGuard>
// ================================================================

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { SessionExpiredModal } from "./SessionExpiredModal";
import { SESSION_EXPIRED_EVENT } from "../lib/api/axios"; // ← من axiosInstance
import { useAuth } from "../hooks/useAuth";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 دقيقة

interface SessionGuardProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

export function SessionGuard({
  children,
  isAuthenticated = true,
}: SessionGuardProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState<"idle" | "token">("idle");
  const shownRef = useRef(false);

  function showExpired(r: "idle" | "token") {
    if (shownRef.current) return;
    shownRef.current = true;
    setReason(r);
    setModalOpen(true);
    logout(false); // ❌ بدون redirect
  }

  // ─── 1. خمول ──────────────────────────────────────────────
  useIdleTimer({
    timeout: IDLE_TIMEOUT_MS,
    onIdle: () => showExpired("idle"),
    enabled: isAuthenticated,
  });

  // ─── 2. axios 401 → refresh فشل ───────────────────────────
  useEffect(() => {
    const handler = () => showExpired("token");
    window.addEventListener(SESSION_EXPIRED_EVENT, handler);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
  }, []);

  function handleLogin() {
    setModalOpen(false);
    shownRef.current = false;
    navigate("/login", { replace: true });
  }

  return (
    <>
      {children}
      <SessionExpiredModal
        open={modalOpen}
        reason={reason}
        onLogin={handleLogin}
        autoRedirectSeconds={15}
      />
    </>
  );
}

export default SessionGuard;
