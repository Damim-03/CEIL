import axiosInstance from "../../lib/api/axios";
// src/hooks/admin/useTeacherSchedule.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchTeacherSchedule,
  createTeacherScheduleEntry,
  deleteTeacherScheduleEntry,
  clearTeacherSchedule,
  type TeacherSchedulePayload,
} from "../../lib/api/admin/teacherSchedule.api";

// ── جلب جدول أستاذ ────────────────────────────────────────────

export function useTeacherSchedule(teacherId: string | null) {
  return useQuery({
    queryKey: ["teacher-schedule", teacherId],
    queryFn: () => fetchTeacherSchedule(teacherId!),
    enabled: !!teacherId,
    staleTime: 0,
  });
}

// ── إضافة حصة ────────────────────────────────────────────────

export function useCreateTeacherEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TeacherSchedulePayload) =>
      createTeacherScheduleEntry(payload),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({
        queryKey: ["teacher-schedule", variables.teacher_id],
      });
      toast.success(data.message ?? "تمت إضافة الحصة بنجاح");
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message ?? "حدث خطأ غير متوقع";
      const conflict = error?.response?.data?.conflict;
      if (status === 409) {
        toast.error(
          conflict
            ? `تعارض في جدول الأستاذ · ${conflict.day} · ${conflict.slot}`
            : "تعارض: الأستاذ لديه حصة في هذا الوقت",
          { duration: 6000 },
        );
      } else if (status === 404) {
        toast.error("الأستاذ أو الفوج غير موجود");
      } else if (status === 400) {
        toast.error(`خطأ في البيانات: ${msg}`);
      } else {
        toast.error(`خطأ في الخادم: ${msg}`);
      }
    },
  });
}

// ── حذف حصة ──────────────────────────────────────────────────

export function useDeleteTeacherEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId }: { entryId: string; teacherId: string }) =>
      deleteTeacherScheduleEntry(entryId),
    onSuccess: (_, { teacherId }) => {
      qc.invalidateQueries({ queryKey: ["teacher-schedule", teacherId] });
      toast.success("تم حذف الحصة بنجاح");
    },
    onError: (error: any) => {
      toast.error("فشل حذف الحصة، حاول مرة أخرى");
    },
  });
}

// ── مسح كل جدول أستاذ ────────────────────────────────────────

export function useClearTeacherSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teacherId: string) => clearTeacherSchedule(teacherId),
    onSuccess: (data, teacherId) => {
      qc.invalidateQueries({ queryKey: ["teacher-schedule", teacherId] });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "حدث خطأ");
    },
  });
}

// ── جلب قائمة الأساتذة ───────────────────────────────────────

export function useTeachers() {
  return useQuery({
    queryKey: ["admin-teachers-list"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/teachers?limit=200");
      return (data?.data ?? data ?? []) as {
        teacher_id: string;
        first_name: string;
        last_name: string;
        email?: string | null;
        user?: { google_avatar?: string | null } | null;
      }[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ── جلب مجموعات أستاذ معين ────────────────────────────────────

export function useTeacherGroups(teacherId: string | null) {
  return useQuery({
    queryKey: ["teacher-groups", teacherId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/admin/groups?teacher_id=${teacherId}&limit=100`,
      );
      return (data?.data ?? data ?? []) as {
        group_id: string;
        name: string;
        level: string;
        status: string;
        course: { course_id: string; course_name: string };
        teacher_id: string | null;
      }[];
    },
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 5,
  });
}
