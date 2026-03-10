// ================================================================
// 📦 src/hooks/admin/useAdminGroups.ts
// ✅ React Query hooks — uses groupApi
// ✅ Fix: cross-invalidation with useAdmin.ts group keys
// ✅ Added: useRemoveStudentFromGroup
// ================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupApi, type GroupsParams } from "../../lib/api/admin/group.api";

// ─── Types (re-exported for use in components) ────────────────

export type GroupStatus = "OPEN" | "FULL" | "FINISHED";
export type RegistrationStatus =
  | "PENDING"
  | "VALIDATED"
  | "REJECTED"
  | "PAID"
  | "FINISHED";

export interface GroupTeacher {
  teacher_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
}

export interface GroupCourse {
  course_id: string;
  course_name: string;
  course_code: string;
  profile?: { flag_emoji?: string; image_url?: string } | null;
}

export interface Group {
  group_id: string;
  name: string;
  level: string;
  status: GroupStatus;
  max_students: number;
  enrolled_count: number;
  pending_count: number;
  capacity_pct: number;
  is_full: boolean;
  course: GroupCourse;
  teacher: GroupTeacher | null;
  department?: { department_id: string; name: string } | null;
  _count: { enrollments: number; sessions: number };
}

export interface GroupStudent {
  enrollment_id: string;
  registration_status: RegistrationStatus;
  enrollment_date: string;
  level?: string;
  student: {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    gender?: string;
    avatar_url?: string;
    status?: string;
    registrant_category?: string;
  };
  fees?: { fee_id: string; status: string; amount: number }[];
  pricing?: { status_fr: string; price: number; currency: string } | null;
}

// ─── Query Keys ───────────────────────────────────────────────

export const groupKeys = {
  all: () => ["admin", "groups"] as const,
  list: (p: GroupsParams) => ["admin", "groups", "list", p] as const,
  detail: (id: string) => ["admin", "groups", id, "details"] as const,
  students: (id: string, p?: any) =>
    ["admin", "groups", id, "students", p] as const,
  teacher: (id: string) => ["admin", "groups", id, "teacher"] as const,
  transfers: () => ["admin", "groups", "transfer-requests"] as const,
};

// ─── Keys from useAdmin.ts (for cross-invalidation) ──────────
// These mirror the constants in useAdmin.ts
const GROUPS_KEY_LEGACY = ["admin-groups"];
const groupKeyLegacy = (id: string) => ["admin-group", id];
const ENROLLMENTS_KEY_LEGACY = ["admin-enrollments"];
const DASHBOARD_KEY_LEGACY = ["admin-dashboard"];

// ─── GET GROUPS ───────────────────────────────────────────────

export function useAdminGroups(params: GroupsParams = {}) {
  return useQuery({
    queryKey: groupKeys.list(params),
    queryFn: () => groupApi.getGroups(params),
  });
}

// ─── GET GROUP DETAILS ────────────────────────────────────────

export function useAdminGroupDetails(groupId: string | null) {
  return useQuery({
    queryKey: groupKeys.detail(groupId!),
    queryFn: () => groupApi.getGroupDetails(groupId!),
    enabled: !!groupId,
    // ✅ Fix: always fetch fresh — groups list cache (no enrollments) must not bleed in
    staleTime: 0,
  });
}

// ─── GET GROUP STUDENTS ───────────────────────────────────────

export function useAdminGroupStudents(
  groupId: string | null,
  params: { status?: RegistrationStatus; page?: number; limit?: number } = {},
) {
  return useQuery({
    queryKey: groupKeys.students(groupId!, params),
    queryFn: () => groupApi.getGroupStudents(groupId!, params),
    enabled: !!groupId,
  });
}

// ─── GET TRANSFER REQUESTS ────────────────────────────────────

export function useTransferRequests() {
  return useQuery({
    queryKey: groupKeys.transfers(),
    queryFn: groupApi.getTransferRequests,
  });
}

// ─── CHANGE GROUP STATUS ──────────────────────────────────────

export function useChangeGroupStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      status,
    }: {
      groupId: string;
      status: GroupStatus;
    }) => groupApi.changeStatus(groupId, status),
    onSuccess: (_, { groupId }) => {
      qc.invalidateQueries({ queryKey: groupKeys.all() });
      qc.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      // ✅ cross-invalidate legacy keys used by useAdmin.ts
      qc.invalidateQueries({ queryKey: GROUPS_KEY_LEGACY });
      qc.invalidateQueries({ queryKey: groupKeyLegacy(groupId) });
    },
  });
}

// ─── ASSIGN TEACHER ───────────────────────────────────────────

export function useAssignGroupTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      teacher_id,
    }: {
      groupId: string;
      teacher_id: string | null;
    }) => groupApi.assignTeacher(groupId, teacher_id),
    onSuccess: (_, { groupId }) => {
      qc.invalidateQueries({ queryKey: groupKeys.all() });
      qc.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      // ✅ cross-invalidate legacy keys used by useAdmin.ts
      qc.invalidateQueries({ queryKey: GROUPS_KEY_LEGACY });
      qc.invalidateQueries({ queryKey: groupKeyLegacy(groupId) });
    },
  });
}

// ─── TRANSFER STUDENT ─────────────────────────────────────────

export function useTransferStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      fromGroupId,
      studentId,
      toGroupId,
    }: {
      fromGroupId: string;
      studentId: string;
      toGroupId: string;
    }) => groupApi.transferStudent(fromGroupId, studentId, toGroupId),
    onSuccess: (_, { fromGroupId, toGroupId }) => {
      qc.invalidateQueries({ queryKey: groupKeys.all() });
      qc.invalidateQueries({ queryKey: groupKeys.detail(fromGroupId) });
      qc.invalidateQueries({ queryKey: groupKeys.detail(toGroupId) });
      qc.invalidateQueries({ queryKey: groupKeys.students(fromGroupId) });
      qc.invalidateQueries({ queryKey: groupKeys.students(toGroupId) });
      // ✅ cross-invalidate legacy keys
      qc.invalidateQueries({ queryKey: GROUPS_KEY_LEGACY });
    },
  });
}

// ─── REMOVE STUDENT FROM GROUP ────────────────────────────────

export function useRemoveStudentFromGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      studentId,
    }: {
      groupId: string;
      studentId: string;
    }) => groupApi.removeStudent(groupId, studentId),
    onSuccess: (_, { groupId }) => {
      // ✅ invalidate students list for this group
      qc.invalidateQueries({ queryKey: groupKeys.students(groupId) });
      // ✅ invalidate group details (capacity updates)
      qc.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      qc.invalidateQueries({ queryKey: groupKeys.all() });
      // ✅ cross-invalidate legacy keys
      qc.invalidateQueries({ queryKey: GROUPS_KEY_LEGACY });
      qc.invalidateQueries({ queryKey: groupKeyLegacy(groupId) });
      qc.invalidateQueries({ queryKey: ENROLLMENTS_KEY_LEGACY });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY_LEGACY });
    },
  });
}

// ─── GET ALL TEACHERS (for assign modal) ──────────────────────

export function useAllTeachers() {
  return useQuery({
    queryKey: ["admin", "teachers", "all"],
    queryFn: groupApi.getAllTeachers,
  });
}
