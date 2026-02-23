import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import {
  UserCheck,
  UserX,
  Calendar,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
  Save,
  Printer,
} from "lucide-react";
import {
  useAdminSessionAttendance,
  useAdminMarkBulkAttendance,
} from "../../../hooks/admin/useAdmin";
import { printAttendanceSheet } from "./Attendanceprintview";
import type { Session } from "../../../types/Types";
import { toast } from "sonner";

/* ─── Types ─── */

interface AttendanceModalProps {
  open: boolean;
  onClose: () => void;
  session: Session | null;
}

interface AttendanceRecord {
  student_id: string;
  student_name: string;
  student_email: string;
  avatar_url: string | null;
  status: "PRESENT" | "ABSENT" | null;
  attendance_id: string | null;
  attended_at: string | null;
}

/* ─── Component ─── */

export default function AttendanceModal({
  open,
  onClose,
  session,
}: AttendanceModalProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "ar" | "fr" | "en";
  const locale = lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US";

  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const { data: sessionAttendance, isLoading } = useAdminSessionAttendance(
    open ? session?.session_id : undefined,
  );

  const bulkMutation = useAdminMarkBulkAttendance();

  // ── Build records from enriched data ──
  useEffect(() => {
    if (!open) return;

    if (sessionAttendance?.students) {
      setRecords(
        sessionAttendance.students.map((s: any) => ({
          student_id: s.student_id,
          student_name: `${s.first_name} ${s.last_name}`,
          student_email: s.email || "",
          avatar_url: s.avatar_url || null,
          status: s.status ?? null,
          attendance_id: s.attendance_id || null,
          attended_at: s.attended_at || null,
        })),
      );
      return;
    }

    if (!session?.group?.enrollments) {
      setRecords([]);
      return;
    }

    const validEnrollments = session.group.enrollments.filter(
      (e: any) =>
        e.registration_status === "VALIDATED" ||
        e.registration_status === "PAID" ||
        e.registration_status === "FINISHED",
    );

    const existingArr: any[] = Array.isArray(sessionAttendance)
      ? sessionAttendance
      : [];
    const existingMap = new Map(existingArr.map((a: any) => [a.student_id, a]));

    setRecords(
      validEnrollments
        .map((enrollment: any) => {
          const student = enrollment.student;
          if (!student) return null;
          const existing = existingMap.get(student.student_id);
          return {
            student_id: student.student_id,
            student_name: `${student.first_name} ${student.last_name}`,
            student_email: student.email || "",
            avatar_url: student.avatar_url || null,
            status: existing?.status ?? null,
            attendance_id: existing?.attendance_id || null,
            attended_at: existing?.attended_at || null,
          };
        })
        .filter((r): r is AttendanceRecord => r !== null),
    );
  }, [open, session, sessionAttendance]);

  // ── Actions ──
  const setStudentStatus = (
    studentId: string,
    status: "PRESENT" | "ABSENT",
  ) => {
    setRecords((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, status } : r)),
    );
  };

  const markAllPresent = () =>
    setRecords((prev) =>
      prev.map((r) => ({ ...r, status: "PRESENT" as const })),
    );

  const markAllAbsent = () =>
    setRecords((prev) =>
      prev.map((r) => ({ ...r, status: "ABSENT" as const })),
    );

  // ── 🖨️ Print ──
  const handlePrint = () => {
    if (!session || records.length === 0) return;
    printAttendanceSheet({
      session,
      records: records.map((r) => ({
        student_id: r.student_id,
        student_name: r.student_name,
        student_email: r.student_email,
        status: r.status,
        attended_at: r.attended_at,
      })),
      locale,
      lang,
    });
  };

  // ── Save ──
  const handleSave = async () => {
    if (!session) return;

    const entries = records
      .filter((r) => r.status !== null)
      .map((r) => ({
        student_id: r.student_id,
        status: r.status as "PRESENT" | "ABSENT",
      }));

    if (entries.length === 0) {
      toast.warning(
        t("admin.attendanceModal.noRecordsToSave", "لا يوجد حضور للحفظ"),
      );
      return;
    }

    try {
      await bulkMutation.mutateAsync({
        sessionId: session.session_id,
        entries,
      });
      toast.success(
        t("admin.attendanceModal.savedSuccess", "تم حفظ الحضور بنجاح"),
      );
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          t("admin.attendanceModal.savedError", "حدث خطأ أثناء حفظ الحضور"),
      );
    }
  };

  // ── Stats ──
  const stats = {
    total: records.length,
    present: records.filter((r) => r.status === "PRESENT").length,
    absent: records.filter((r) => r.status === "ABSENT").length,
    unmarked: records.filter((r) => r.status === null).length,
  };

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (ds: string) =>
    new Date(ds).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });

  const isSaving = bulkMutation.isPending;
  const hasRecords = records.length > 0;
  const hasMarked = records.some((r) => r.status !== null);

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1A1A1A] border-[#D8CDC0]/60 dark:border-[#2A2A2A]">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-[#1B1B1B] dark:text-[#E5E5E5]">
              <UserCheck className="w-6 h-6 text-[#2B6F5E] dark:text-[#4ADE80]" />
              {t("admin.attendanceModal.markAttendance")}
            </DialogTitle>
            {/* 🖨️ Print */}
            {hasRecords && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2 border-[#2B6F5E]/30 dark:border-[#4ADE80]/20 text-[#2B6F5E] dark:text-[#4ADE80] hover:bg-[#2B6F5E]/8 dark:hover:bg-[#4ADE80]/10"
              >
                <Printer className="w-4 h-4" />
                {t("admin.attendanceModal.print", "طباعة")}
              </Button>
            )}
          </div>
          <DialogDescription className="text-[#6B5D4F] dark:text-[#888888]">
            {t("admin.attendanceModal.markAttendanceDesc")}
          </DialogDescription>
        </DialogHeader>

        {/* Session Info */}
        <div className="bg-gradient-to-br from-[#2B6F5E]/5 to-[#8DB896]/5 dark:from-[#4ADE80]/5 dark:to-[#8DB896]/5 rounded-lg p-4 border border-[#2B6F5E]/15 dark:border-[#4ADE80]/15">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
              <span className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {session.group?.course?.course_name} - {session.group?.name}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#2B6F5E] dark:text-[#4ADE80]">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(session.session_date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(session.session_date)}</span>
              </div>
            </div>
            {session.topic && (
              <div className="text-sm text-[#2B6F5E]/80 dark:text-[#4ADE80]/70">
                <span className="font-medium">
                  {t("admin.attendanceModal.topic")}
                </span>{" "}
                {session.topic}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 rounded-lg p-3 border border-[#2B6F5E]/15 dark:border-[#4ADE80]/15">
            <p className="text-xs text-[#2B6F5E] dark:text-[#4ADE80] font-medium mb-1">
              {t("admin.attendanceModal.totalStudents")}
            </p>
            <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {stats.total}
            </p>
          </div>
          <div className="bg-[#8DB896]/8 dark:bg-[#8DB896]/10 rounded-lg p-3 border border-[#8DB896]/20 dark:border-[#8DB896]/15">
            <p className="text-xs text-[#3D7A4A] dark:text-[#8DB896] font-medium mb-1">
              {t("admin.attendanceModal.present")}
            </p>
            <p className="text-2xl font-bold text-[#3D7A4A] dark:text-[#8DB896]">
              {stats.present}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 border border-red-200 dark:border-red-800/40">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
              {t("admin.attendanceModal.absent")}
            </p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">
              {stats.absent}
            </p>
          </div>
          <div className="bg-[#C4A035]/5 dark:bg-[#D4A843]/5 rounded-lg p-3 border border-[#C4A035]/15 dark:border-[#D4A843]/15">
            <p className="text-xs text-[#C4A035] dark:text-[#D4A843] font-medium mb-1">
              {t("admin.attendanceModal.unmarked", "لم يسجل")}
            </p>
            <p className="text-2xl font-bold text-[#C4A035] dark:text-[#D4A843]">
              {stats.unmarked}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllPresent}
            disabled={isSaving}
            className="flex-1 gap-2 border-[#8DB896]/30 dark:border-[#8DB896]/20 text-[#3D7A4A] dark:text-[#8DB896] hover:bg-[#8DB896]/8 dark:hover:bg-[#8DB896]/10"
          >
            <UserCheck className="w-4 h-4" />
            {t("admin.attendanceModal.markAllPresent")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAbsent}
            disabled={isSaving}
            className="flex-1 gap-2 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <UserX className="w-4 h-4" />
            {t("admin.attendanceModal.markAllAbsent")}
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#2B6F5E] dark:text-[#4ADE80]" />
            <span className="ml-2 text-[#6B5D4F] dark:text-[#888888]">
              {t("admin.attendanceModal.loadingStudents")}
            </span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !hasRecords && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-12 h-12 text-[#D8CDC0] dark:text-[#555555] mb-3" />
            <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
              {t("admin.attendanceModal.noStudents")}
            </h3>
            <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
              {t("admin.attendanceModal.noStudentsDesc")}
            </p>
          </div>
        )}

        {/* Student List */}
        {!isLoading && hasRecords && (
          <div className="border border-[#D8CDC0]/40 dark:border-[#2A2A2A] rounded-lg overflow-hidden">
            <div className="bg-[#D8CDC0]/8 dark:bg-[#0F0F0F] px-4 py-2 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A] flex items-center justify-between">
              <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("admin.attendanceModal.studentsCount", {
                  count: records.length,
                })}
              </p>
              {stats.total > 0 && stats.unmarked === 0 && (
                <span className="text-xs font-medium text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 px-2 py-1 rounded-lg">
                  {Math.round((stats.present / stats.total) * 100)}%{" "}
                  {t("admin.attendanceModal.present")}
                </span>
              )}
            </div>

            <div className="divide-y divide-[#D8CDC0]/20 dark:divide-[#2A2A2A] max-h-96 overflow-y-auto">
              {records.map((record, index) => (
                <div
                  key={record.student_id}
                  className={`flex items-center justify-between p-4 hover:bg-[#D8CDC0]/5 dark:hover:bg-[#222222] transition-colors ${
                    record.status === null
                      ? "bg-[#C4A035]/[0.03] dark:bg-[#D4A843]/[0.03]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-mono text-[#BEB29E] dark:text-[#666666] w-6 text-center shrink-0">
                      {index + 1}
                    </span>
                    {record.avatar_url ? (
                      <img
                        src={record.avatar_url}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
                          {record.student_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                        {record.student_name}
                      </p>
                      {record.student_email && (
                        <p className="text-xs text-[#BEB29E] dark:text-[#666666] truncate">
                          {record.student_email}
                        </p>
                      )}
                    </div>
                  </div>

                  {record.attendance_id && (
                    <span className="text-[10px] text-[#BEB29E] dark:text-[#555555] mr-3 shrink-0">
                      {t("admin.attendanceModal.savedBefore", "مسجل مسبقاً")}
                    </span>
                  )}

                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant={
                        record.status === "PRESENT" ? "default" : "outline"
                      }
                      onClick={() =>
                        setStudentStatus(record.student_id, "PRESENT")
                      }
                      disabled={isSaving}
                      className={
                        record.status === "PRESENT"
                          ? "bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white gap-1.5 h-8 px-3"
                          : "border-[#8DB896]/30 dark:border-[#8DB896]/20 text-[#3D7A4A] dark:text-[#8DB896] hover:bg-[#8DB896]/8 dark:hover:bg-[#8DB896]/10 gap-1.5 h-8 px-3"
                      }
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      {t("admin.attendanceModal.present")}
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        record.status === "ABSENT" ? "default" : "outline"
                      }
                      onClick={() =>
                        setStudentStatus(record.student_id, "ABSENT")
                      }
                      disabled={isSaving}
                      className={
                        record.status === "ABSENT"
                          ? "bg-red-600 hover:bg-red-700 text-white gap-1.5 h-8 px-3"
                          : "border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 h-8 px-3"
                      }
                    >
                      <UserX className="w-3.5 h-3.5" />
                      {t("admin.attendanceModal.absent")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#6B5D4F] dark:text-[#AAAAAA] dark:hover:bg-[#222222]"
          >
            {t("admin.attendanceModal.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasRecords || !hasMarked}
            className="gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("admin.attendanceModal.saving")}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t("admin.attendanceModal.saveAttendance")}
                {stats.unmarked === 0 && stats.total > 0 && (
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                    {stats.total}
                  </span>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
