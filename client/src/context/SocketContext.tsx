// ================================================================
// 📌 src/context/SocketContext.tsx
// ✅ Socket.IO provider — wraps entire app
// ✅ Authenticated mode: connects with cookies when user is logged in
// ✅ Public mode: connects without auth for public pages (read-only)
// ✅ Auto-reconnects on login/logout transition
// ✅ FIXED: socket in state (not ref) so hooks get updated instance
// ================================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useMe } from "../hooks/auth/auth.hooks";

/* ── Types ── */

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

/* ── Provider ── */

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "";

export function SocketProvider({ children }: { children: ReactNode }) {
  const { data: user } = useMe();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const userId = user?.user_id || null;
    const prevUserId = prevUserIdRef.current;

    // ── User changed (login/logout) → disconnect old socket ──
    if (
      prevUserId !== undefined &&
      prevUserId !== userId &&
      socketRef.current
    ) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }

    prevUserIdRef.current = userId;

    // Avoid duplicate connections
    if (socketRef.current?.connected) return;

    // Disconnect stale socket if exists
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // ── Connect socket ──
    // Authenticated: cookies sent automatically (httpOnly accessToken)
    // Public: connects without auth — server allows broadcast events
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      auth: {
        type: userId ? "authenticated" : "public",
      },
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.log(
        `🔌 Socket connected [${userId ? "authenticated" : "public"}]:`,
        newSocket.id,
      );
      setSocket(newSocket); // ✅ Trigger re-render so hooks get socket
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.warn("🔌 Socket connection error:", err.message);
      setIsConnected(false);
    });

    // ✅ Set socket immediately (for hooks that run before "connect" event)
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [user?.user_id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

/* ── Hook ── */

export function useSocket() {
  return useContext(SocketContext);
}
