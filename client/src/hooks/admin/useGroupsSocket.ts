// ================================================================
// 📦 src/hooks/admin/useGroupsSocket.ts
// ✅ Realtime group updates via Socket.IO
// ✅ Auto-invalidates React Query cache on events
// ================================================================

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { groupKeys } from "./useAdminGroups";

// ─── Socket events we listen to ──────────────────────────────
// group:updated           → فوج تغير (طالب، أستاذ، حالة...)
// group:statusChanged     → حالة فوج تغيرت
// group:studentTransferred → طالب انتقل بين فوجين
// group:teacherAssigned   → أستاذ عُيِّن أو أُلغي

export interface GroupSocketOptions {
  /** مصفوفة group_id للأفواج التي نريد متابعتها (اختياري) */
  watchGroupIds?: string[];
  /** callback اختياري عند وصول أي event */
  onEvent?: (event: string, payload: any) => void;
}

export function useGroupsSocket(options: GroupSocketOptions = {}) {
  const qc              = useQueryClient();
  const socketRef       = useRef<Socket | null>(null);
  const { watchGroupIds = [], onEvent } = options;

  useEffect(() => {
    // ─── Connect ──────────────────────────────────────────────
    const socket: Socket = io(import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL ?? "", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    // ─── Join group rooms ─────────────────────────────────────
    socket.on("connect", () => {
      watchGroupIds.forEach(id => {
        socket.emit("join:group", id);
      });
    });

    // ─── Helper: invalidate everything groups-related ─────────
    const invalidateAll = () => {
      qc.invalidateQueries({ queryKey: groupKeys.all() });
    };

    const invalidateGroup = (group_id: string) => {
      qc.invalidateQueries({ queryKey: groupKeys.all() });
      qc.invalidateQueries({ queryKey: groupKeys.detail(group_id) });
      qc.invalidateQueries({ queryKey: groupKeys.students(group_id) });
    };

    // ─── Event handlers ───────────────────────────────────────

    // فوج تحدّث (طاقة، أستاذ، حالة)
    socket.on("group:updated", (payload: { group_id: string }) => {
      invalidateGroup(payload.group_id);
      onEvent?.("group:updated", payload);
    });

    // حالة فوج تغيرت
    socket.on("group:statusChanged", (payload: { group_id: string }) => {
      invalidateGroup(payload.group_id);
      invalidateAll();
      onEvent?.("group:statusChanged", payload);
    });

    // طالب انتقل بين فوجين → نحدّث كلا الفوجين
    socket.on(
      "group:studentTransferred",
      (payload: { from_group_id: string; to_group_id: string }) => {
        invalidateGroup(payload.from_group_id);
        invalidateGroup(payload.to_group_id);
        qc.invalidateQueries({ queryKey: groupKeys.transfers() });
        onEvent?.("group:studentTransferred", payload);
      },
    );

    // أستاذ عُيِّن أو أُلغي
    socket.on("group:teacherAssigned", (payload: { group_id: string }) => {
      invalidateGroup(payload.group_id);
      onEvent?.("group:teacherAssigned", payload);
    });

    // ─── Cleanup ──────────────────────────────────────────────
    return () => {
      watchGroupIds.forEach(id => {
        socket.emit("leave:group", id);
      });
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchGroupIds)]);

  return socketRef;
}