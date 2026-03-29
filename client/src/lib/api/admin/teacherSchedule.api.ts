// src/lib/api/admin/teacherSchedule.api.ts

import axiosInstance from "../../../lib/api/axios";

// ── Types ─────────────────────────────────────────────────────

export interface TeacherScheduleEntry {
  entry_id: string;
  teacher_id: string;
  group_id: string | null;
  room_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  language: string;
  level: string;
  group_label: string;
  notes: string | null;
  created_at: string;
  teacher?: {
    teacher_id: string;
    first_name: string;
    last_name: string;
    user?: { google_avatar?: string | null; email: string } | null;
  };
  group?: {
    group_id: string;
    name: string;
    level: string;
    course: { course_name: string; course_code: string };
  } | null;
  room?: { room_id: string; name: string } | null;
}

export interface TeacherSchedulePayload {
  teacher_id: string;
  group_id?: string | null;
  room_id?: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  language: string;
  level: string;
  group_label: string;
  notes?: string;
}

export interface TeacherScheduleResponse {
  success: boolean;
  teacher: any;
  weekly: Record<number, TeacherScheduleEntry[]>;
  entries: TeacherScheduleEntry[];
  total: number;
}

// ── API Functions ─────────────────────────────────────────────

export async function fetchTeacherSchedule(
  teacherId: string,
): Promise<TeacherScheduleResponse> {
  const { data } = await axiosInstance.get(
    `/admin/teacher-schedule/teacher/${teacherId}`,
  );
  return data;
}

export async function createTeacherScheduleEntry(
  payload: TeacherSchedulePayload,
): Promise<{ success: boolean; message: string; data: TeacherScheduleEntry }> {
  const { data } = await axiosInstance.post("/admin/teacher-schedule", payload);
  return data;
}

export async function deleteTeacherScheduleEntry(
  entryId: string,
): Promise<{ success: boolean; message: string }> {
  const { data } = await axiosInstance.delete(
    `/admin/teacher-schedule/${entryId}`,
  );
  return data;
}

export async function clearTeacherSchedule(
  teacherId: string,
): Promise<{ success: boolean; message: string; deleted: number }> {
  const { data } = await axiosInstance.delete(
    `/admin/teacher-schedule/teacher/${teacherId}/clear`,
  );
  return data;
}
