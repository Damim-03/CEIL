// src/hooks/useTimetable.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // نفس مكتبة الـ toast الموجودة في مشروعك
import {
  fetchAllEntries,
  fetchRoomTimetable,
  fetchRooms,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  bulkDeleteEntries,
  checkTimetableConflict,
  fetchTimetableConfig,
  saveTimetableConfig,
  resetTimetableConfig,
  type SlotConfig,
  type TimetableFilters,
  type CreateEntryPayload,
} from "../../lib/api/admin/timetable.api";

// ── Query Keys ────────────────────────────────────────────────

export const timetableKeys = {
  all: ["timetable"] as const,
  list: (filters?: TimetableFilters) => ["timetable", "list", filters] as const,
  room: (roomId: string) => ["timetable", "room", roomId] as const,
  conflict: (params: object) => ["timetable", "conflict", params] as const,
};

// ══════════════════════════════════════════════════════════════
//  useAdminTimetable — كل الحصص مع فلترة
// ══════════════════════════════════════════════════════════════
export function useAdminTimetable(filters?: TimetableFilters) {
  return useQuery({
    queryKey: timetableKeys.list(filters),
    queryFn: () => fetchAllEntries(filters),
    staleTime: 0, // يُعيد الجلب فوراً عند invalidate
  });
}

// ══════════════════════════════════════════════════════════════
//  useRooms — قائمة القاعات النشطة
// ══════════════════════════════════════════════════════════════
export function useRooms() {
  return useQuery({
    queryKey: ["admin-rooms"],
    queryFn: fetchRooms,
    staleTime: 1000 * 60 * 10, // 10 دقائق — القاعات لا تتغير كثيراً
  });
}

// ══════════════════════════════════════════════════════════════
//  useRoomTimetable — توقيت قاعة معينة
// ══════════════════════════════════════════════════════════════
export function useRoomTimetable(roomId: string | null) {
  return useQuery({
    queryKey: timetableKeys.room(roomId ?? ""),
    queryFn: () => fetchRoomTimetable(roomId!),
    enabled: !!roomId,
    staleTime: 1000 * 60 * 5,
  });
}

// ══════════════════════════════════════════════════════════════
//  useCheckConflict — فحص تعارض (lazy: يُشغَّل يدوياً)
// ══════════════════════════════════════════════════════════════
export function useCheckConflict(
  params: {
    room_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    exclude_id?: string;
  } | null,
) {
  return useQuery({
    queryKey: timetableKeys.conflict(params ?? {}),
    queryFn: () => checkTimetableConflict(params!),
    enabled: !!params?.room_id && !!params?.start_time && !!params?.end_time,
    staleTime: 0, // دائماً fresh لأن التعارض يتغير
  });
}

// ══════════════════════════════════════════════════════════════
//  useCreateEntry
// ══════════════════════════════════════════════════════════════
export function useCreateEntry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEntryPayload) => createTimetableEntry(payload),

    onSuccess: (data) => {
      // إعادة جلب كل queries التي تبدأ بـ "timetable"
      qc.invalidateQueries({
        queryKey: timetableKeys.all,
        refetchType: "active",
        exact: false,
      });
      toast.success(data.message ?? "تمت إضافة الحصة بنجاح");
    },

    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ??
        error?.response?.data?.errors?.[0] ??
        "حدث خطأ أثناء الإضافة";

      // تعارض → رسالة خاصة
      if (error?.response?.status === 409) {
        const conflict = error.response.data?.conflict;
        toast.error(
          conflict
            ? `تعارض مع: ${conflict.group_label} — ${conflict.day} ${conflict.slot}`
            : msg,
        );
      } else {
        toast.error(msg);
      }
    },
  });
}

// ══════════════════════════════════════════════════════════════
//  useUpdateEntry
// ══════════════════════════════════════════════════════════════
export function useUpdateEntry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateEntryPayload>;
    }) => updateTimetableEntry(id, payload),

    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: timetableKeys.all });
      toast.success(data.message ?? "تم التحديث بنجاح");
    },

    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? "حدث خطأ أثناء التحديث";
      if (error?.response?.status === 409) {
        const conflict = error.response.data?.conflict;
        toast.error(
          conflict
            ? `تعارض مع: ${conflict.group_label} — ${conflict.day} ${conflict.slot}`
            : msg,
        );
      } else {
        toast.error(msg);
      }
    },
  });
}

// ══════════════════════════════════════════════════════════════
//  useDeleteEntry
// ══════════════════════════════════════════════════════════════
export function useDeleteEntry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTimetableEntry(id),

    // Optimistic update — احذف من الـ cache فوراً
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: timetableKeys.all });

      const previousData = qc.getQueriesData({ queryKey: timetableKeys.all });

      qc.setQueriesData({ queryKey: timetableKeys.all }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((e: any) => e.entry_id !== id),
          total: old.total - 1,
        };
      });

      return { previousData };
    },

    onSuccess: () => {
      toast.success("تم حذف الحصة");
    },

    onError: (error: any, _id, context) => {
      // استعادة البيانات عند الخطأ
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          qc.setQueryData(queryKey, data);
        });
      }
      toast.error(error?.response?.data?.message ?? "حدث خطأ أثناء الحذف");
    },

    onSettled: () => {
      qc.invalidateQueries({
        queryKey: timetableKeys.all,
        refetchType: "active",
        exact: false,
      });
    },
  });
}

// ══════════════════════════════════════════════════════════════
//  useBulkDelete
// ══════════════════════════════════════════════════════════════
export function useBulkDelete() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteEntries(ids),

    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: timetableKeys.all });
      toast.success(data.message ?? `تم حذف ${data.deleted} حصة`);
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? "حدث خطأ أثناء الحذف الجماعي",
      );
    },
  });
}

export function useTimetableConfig() {
  return useQuery({
    queryKey: ["timetable-config"],
    queryFn: fetchTimetableConfig,
    staleTime: 1000 * 60 * 30,
  });
}

export function useSaveConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slots: SlotConfig[]) => saveTimetableConfig(slots),
    onSuccess: (data) => {
      qc.setQueryData(["timetable-config"], data.slots);
      toast.success(data.message ?? "تم حفظ الفترات");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "خطأ في الحفظ");
    },
  });
}

export function useResetConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resetTimetableConfig,
    onSuccess: (data) => {
      qc.setQueryData(["timetable-config"], data.slots);
      toast.success(data.message ?? "تمت إعادة التعيين");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "خطأ");
    },
  });
}
