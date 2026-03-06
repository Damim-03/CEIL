// ================================================================
// 📦 src/hooks/admin/useCoursesSocket.ts
// ✅ Realtime course updates via Socket.IO
// ✅ نفس نمط useGroupsSocket تماماً
// ✅ Auto-invalidates React Query cache on events:
//    course:created  → تُحدَّث قائمة الدورات
//    course:updated  → تُحدَّث الدورة المحددة + القائمة
//    course:deleted  → تُحدَّث القائمة + تُزال الدورة من الـ cache
// ================================================================

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";

// ─── Query Keys ──────────────────────────────────────────────
// يجب أن تتطابق مع مفاتيح useAdminCourses و useAdminCourse في useAdmin.ts
// عدّلها إن كانت مختلفة في مشروعك
// ✅ Matches COURSES_KEY and courseKey in useAdmin.ts exactly
export const courseKeys = {
  all: () => ["admin-courses"] as const,
  list: () => ["admin-courses"] as const,
  detail: (id: string) => ["admin-course", id] as const,
};

// ─── Hook Options ─────────────────────────────────────────────
export interface CoursesSocketOptions {
  /** course_id الدورة الحالية لمتابعتها (في CourseDetailsPage) */
  watchCourseId?: string | null;
  /** callback اختياري عند وصول أي event — لإظهار visual feedback */
  onEvent?: (event: string, payload: any) => void;
}

// ─── Main Hook ────────────────────────────────────────────────
export function useCoursesSocket(options: CoursesSocketOptions = {}) {
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const { watchCourseId, onEvent } = options;

  useEffect(() => {
    // ── Connect ───────────────────────────────────────────────
    const socket: Socket = io(
      import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL ?? "",
      {
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      },
    );

    socketRef.current = socket;

    // ── Join course room if watching a specific course ────────
    socket.on("connect", () => {
      if (watchCourseId) {
        socket.emit("join:course", watchCourseId);
      }
    });

    // ── Helpers ───────────────────────────────────────────────
    const invalidateList = () => {
      qc.invalidateQueries({ queryKey: courseKeys.all() });
    };

    const invalidateCourse = (course_id: string) => {
      qc.invalidateQueries({ queryKey: courseKeys.all() });
      qc.invalidateQueries({ queryKey: courseKeys.detail(course_id) });
    };

    // ── course:created — دورة جديدة أُنشئت ──────────────────
    socket.on("course:created", (payload: { course: any }) => {
      invalidateList();
      onEvent?.("course:created", payload);
    });

    // ── course:updated — دورة تحدّثت ────────────────────────
    socket.on(
      "course:updated",
      (payload: { course_id: string; course: any }) => {
        invalidateCourse(payload.course_id);
        onEvent?.("course:updated", payload);
      },
    );

    // ── course:deleted — دورة حُذفت ─────────────────────────
    socket.on("course:deleted", (payload: { course_id: string }) => {
      // أزل من الـ cache فوراً ثم أعد جلب القائمة
      qc.removeQueries({ queryKey: courseKeys.detail(payload.course_id) });
      invalidateList();
      onEvent?.("course:deleted", payload);
    });

    // ── Cleanup ───────────────────────────────────────────────
    return () => {
      if (watchCourseId) {
        socket.emit("leave:course", watchCourseId);
      }
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchCourseId]);

  return socketRef;
}
