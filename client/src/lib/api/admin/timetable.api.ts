// src/api/timetable.api.ts  (Frontend)
// استخدم نفس axiosInstance الموجود في مشروعك

import axiosInstance from "../axios"; // ← عدّل المسار

// ── Types ─────────────────────────────────────────────────────

export interface TimetableEntry {
  entry_id: string;
  room_id: string;
  group_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  level: string;
  language: string;
  group_label: string;
  session_name: string | null;
  created_at: string;
  room?: { name: string };
  group?: { name: string } | null;
}

export interface Room {
  room_id: string;
  name: string;
  capacity: number;
  is_active: boolean;
}

export interface CreateEntryPayload {
  room_id: string;
  group_id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  level: string;
  language: string;
  group_label: string;
  session_name?: string;
}

export interface TimetableFilters {
  room_id?: string;
  day_of_week?: number;
  language?: string;
  level?: string;
  group_id?: string;
}

// ── API calls ─────────────────────────────────────────────────

/** الحصول على كل الحصص (Admin) */
export async function fetchAllEntries(filters?: TimetableFilters) {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.set(k, String(v));
    });
  }
  const { data } = await axiosInstance.get(`/api/admin/timetable?${params}`);
  return data as {
    success: boolean;
    total: number;
    data: TimetableEntry[];
    grouped: Record<string, TimetableEntry[]>;
  };
}

/** توقيت قاعة معينة */
export async function fetchRoomTimetable(roomId: string) {
  const { data } = await axiosInstance.get(
    `/api/admin/timetable/room/${roomId}`,
  );
  return data as {
    success: boolean;
    room: { room_id: string; name: string; capacity: number };
    weekly: Record<number, TimetableEntry[]>;
    entries: TimetableEntry[];
  };
}

/** التوقيت العام للطلاب */
export async function fetchPublicTimetable(filters?: {
  language?: string;
  level?: string;
}) {
  const params = new URLSearchParams(filters as any);
  const { data } = await axiosInstance.get(`/api/timetable?${params}`);
  return data as { success: boolean; data: TimetableEntry[] };
}

/** إنشاء حصة جديدة */
export async function createTimetableEntry(payload: CreateEntryPayload) {
  const { data } = await axiosInstance.post("/api/admin/timetable", payload);
  return data as { success: boolean; message: string; data: TimetableEntry };
}

/** تعديل حصة */
export async function updateTimetableEntry(
  id: string,
  payload: Partial<CreateEntryPayload>,
) {
  const { data } = await axiosInstance.put(
    `/api/admin/timetable/${id}`,
    payload,
  );
  return data as { success: boolean; message: string; data: TimetableEntry };
}

/** حذف حصة */
export async function deleteTimetableEntry(id: string) {
  const { data } = await axiosInstance.delete(`/api/admin/timetable/${id}`);
  return data as { success: boolean; message: string };
}

/** حذف جماعي */
export async function bulkDeleteEntries(ids: string[]) {
  const { data } = await axiosInstance.delete("/api/admin/timetable/bulk", {
    data: { ids },
  });
  return data as { success: boolean; message: string; deleted: number };
}

/** التحقق من تعارض (قبل الحفظ) */
export async function checkTimetableConflict(params: {
  room_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  exclude_id?: string;
}) {
  const q = new URLSearchParams(params as any);
  const { data } = await axiosInstance.get(
    `/api/admin/timetable/check-conflict?${q}`,
  );
  return data as {
    success: boolean;
    conflict: boolean;
    conflicting_entry?: {
      group_label: string;
      language: string;
      day: string;
      slot: string;
    };
  };
}

/** جلب كل القاعات النشطة */
export async function fetchRooms() {
  const { data } = await axiosInstance.get("/admin/rooms");
  // يدعم كلا الشكلين: { data: [...] } أو { rooms: [...] }
  const list: Room[] = data?.data ?? data?.rooms ?? [];
  return list.filter((r) => r.is_active !== false);
}
