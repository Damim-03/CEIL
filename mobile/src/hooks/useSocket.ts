// src/hooks/useSocket.ts
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = "https://www.ceil-eloued.com";

export function useSocket() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let socket: Socket;

    const connect = async () => {
      const token = await AsyncStorage.getItem("ceil_access_token");
      if (!token) return;

      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 5,
      });

      socket.on("connect", () => {
        console.log("🟢 Socket connected:", socket.id);
      });

      socket.on("disconnect", (reason) => {
        console.log("🔴 Socket disconnected:", reason);
      });

      // ── الوثائق ────────────────────────────────────────────────
      // يُطلق من backend عند رفع وثيقة ناجح
      socket.on("document:uploadComplete", () => {
        queryClient.invalidateQueries({ queryKey: ["student-documents"] });
        queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      });

      // يُطلق من backend عند قبول وثيقة من الأدمن
      socket.on("document:approved", () => {
        queryClient.invalidateQueries({ queryKey: ["student-documents"] });
        queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      });

      // يُطلق من backend عند رفض وثيقة من الأدمن
      socket.on("document:rejected", () => {
        queryClient.invalidateQueries({ queryKey: ["student-documents"] });
        queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      });
      // يُطلق من backend عند إنشاء enrollment
      socket.on("enrollment:created", () => {
        queryClient.invalidateQueries({ queryKey: ["student-enrollments"] });
        queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      });

      // يُطلق من backend عند إلغاء enrollment
      socket.on("enrollment:cancelled", () => {
        queryClient.invalidateQueries({ queryKey: ["student-enrollments"] });
        queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      });

      // ── المجموعات ──────────────────────────────────────────────
      // يُطلق من backend عند الانضمام لمجموعة
      socket.on("group:joined", () => {
        queryClient.invalidateQueries({ queryKey: ["student-enrollments"] });
        queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      });

      // يُطلق من backend عند مغادرة مجموعة
      socket.on("group:left", () => {
        queryClient.invalidateQueries({ queryKey: ["student-enrollments"] });
        queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      });

      // ── أحداث من الأدمن تصل للطالب ────────────────────────────
      // إذا الأدمن قبل/رفض وثيقة — يحتاج emitToUser في admin service
      socket.on("document:statusChanged", () => {
        queryClient.invalidateQueries({ queryKey: ["student-documents"] });
        queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      });

      // إذا الأدمن غيّر حالة enrollment
      socket.on("enrollment:statusChanged", () => {
        queryClient.invalidateQueries({ queryKey: ["student-enrollments"] });
        queryClient.invalidateQueries({ queryKey: ["student-fees"] });
        queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      });

      // إذا الأدمن أضاف رسوم أو غيّر حالة دفع
      socket.on("fee:updated", () => {
        queryClient.invalidateQueries({ queryKey: ["student-fees"] });
        queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      });

      // إشعارات عامة
      socket.on("notification", () => {
        queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
        queryClient.invalidateQueries({ queryKey: ["student-unread-count"] });
      });

      socketRef.current = socket;
    };

    connect();

    return () => {
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, queryClient]);

  return socketRef;
}
