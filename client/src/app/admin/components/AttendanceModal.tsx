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
} from "lucide-react";
import {
  useAdminSessionAttendance,
  useAdminMarkAttendance,
} from "../../../hooks/admin/useAdmin";
import type { Session } from "../../../types/Types";
import { toast } from "sonner";

interface AttendanceModalProps {
  open: boolean;
  onClose: () => void;
  session: Session | null;
}
interface AttendanceRecord {
  student_id: string;
  student_name: string;
  student_email: string;
  status: "PRESENT" | "ABSENT";
}

export default function AttendanceModal({
  open,
  onClose,
  session,
}: AttendanceModalProps) {
  const { t, i18n } = useTranslation();
  const locale =
    i18n.language === "ar"
      ? "ar-DZ"
      : i18n.language === "fr"
        ? "fr-FR"
        : "en-US";
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const { data: existingAttendance, isLoading } = useAdminSessionAttendance(
    session?.session_id,
  );
  const markAttendance = useAdminMarkAttendance();

  useEffect(() => {
    if (!session?.group?.enrollments) {
      setAttendanceRecords([]);
      return;
    }
    const validEnrollments = session.group.enrollments.filter(
      (enrollment: any) =>
        enrollment.registration_status === "VALIDATED" ||
        enrollment.registration_status === "PAID" ||
        enrollment.registration_status === "FINISHED",
    );
    const records: AttendanceRecord[] = validEnrollments
      .map((enrollment: any) => {
        const student = enrollment.student;
        if (!student) return null;
        const existingRecord = existingAttendance?.find(
          (a: any) => a.student_id === student.student_id,
        );
        return {
          student_id: student.student_id,
          student_name: `${student.first_name} ${student.last_name}`,
          student_email: student.email || "",
          status: existingRecord?.status || "ABSENT",
        };
      })
      .filter((record): record is AttendanceRecord => record !== null);
    setAttendanceRecords(records);
  }, [session, existingAttendance]);

  const toggleAttendance = (studentId: string) => {
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.student_id === studentId
          ? { ...r, status: r.status === "PRESENT" ? "ABSENT" : "PRESENT" }
          : r,
      ),
    );
  };

  const handleSave = async () => {
    if (!session) return;
    setIsSaving(true);
    try {
      await Promise.all(
        attendanceRecords.map((record) =>
          markAttendance.mutateAsync({
            session_id: session.session_id,
            student_id: record.student_id,
            status: record.status,
          }),
        ),
      );
      toast.success("Attendance saved successfully");
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to save attendance",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const markAllPresent = () =>
    setAttendanceRecords((prev) =>
      prev.map((r) => ({ ...r, status: "PRESENT" })),
    );
  const markAllAbsent = () =>
    setAttendanceRecords((prev) =>
      prev.map((r) => ({ ...r, status: "ABSENT" })),
    );

  const stats = {
    total: attendanceRecords.length,
    present: attendanceRecords.filter((r) => r.status === "PRESENT").length,
    absent: attendanceRecords.filter((r) => r.status === "ABSENT").length,
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600" />
            {t("admin.attendanceModal.markAttendance")}
          </DialogTitle>
          <DialogDescription>
            {t("admin.attendanceModal.markAttendanceDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-linear-to-br from-indigo-50 to-violet-50 rounded-lg p-4 border border-indigo-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-indigo-900">
                {session.group?.course?.course_name} - {session.group?.name}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-indigo-700">
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
              <div className="text-sm text-indigo-700">
                <span className="font-medium">
                  {t("admin.attendanceModal.topic")}
                </span>{" "}
                {session.topic}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-600 font-medium mb-1">
              {t("admin.attendanceModal.totalStudents")}
            </p>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-xs text-green-600 font-medium mb-1">
              {t("admin.attendanceModal.present")}
            </p>
            <p className="text-2xl font-bold text-green-900">{stats.present}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <p className="text-xs text-red-600 font-medium mb-1">
              {t("admin.attendanceModal.absent")}
            </p>
            <p className="text-2xl font-bold text-red-900">{stats.absent}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllPresent}
            className="flex-1 gap-2 border-green-200 text-green-700 hover:bg-green-50"
          >
            <UserCheck className="w-4 h-4" />
            {t("admin.attendanceModal.markAllPresent")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAbsent}
            className="flex-1 gap-2 border-red-200 text-red-700 hover:bg-red-50"
          >
            <UserX className="w-4 h-4" />
            {t("admin.attendanceModal.markAllAbsent")}
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="ml-2 text-gray-600">
              {t("admin.attendanceModal.loadingStudents")}
            </span>
          </div>
        )}

        {!isLoading && attendanceRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {t("admin.attendanceModal.noStudents")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("admin.attendanceModal.noStudentsDesc")}
            </p>
          </div>
        )}

        {!isLoading && attendanceRecords.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700">
                {t("admin.attendanceModal.studentsCount", {
                  count: attendanceRecords.length,
                })}
              </p>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {attendanceRecords.map((record) => (
                <div
                  key={record.student_id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {record.student_name}
                    </p>
                    {record.student_email && (
                      <p className="text-sm text-gray-500">
                        {record.student_email}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={
                        record.status === "PRESENT" ? "default" : "outline"
                      }
                      onClick={() => toggleAttendance(record.student_id)}
                      className={
                        record.status === "PRESENT"
                          ? "bg-green-600 hover:bg-green-700 text-white gap-2"
                          : "border-green-300 text-green-700 hover:bg-green-50 gap-2"
                      }
                    >
                      <UserCheck className="w-4 h-4" />
                      {t("admin.attendanceModal.present")}
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        record.status === "ABSENT" ? "default" : "outline"
                      }
                      onClick={() => toggleAttendance(record.student_id)}
                      className={
                        record.status === "ABSENT"
                          ? "bg-red-600 hover:bg-red-700 text-white gap-2"
                          : "border-red-300 text-red-700 hover:bg-red-50 gap-2"
                      }
                    >
                      <UserX className="w-4 h-4" />
                      {t("admin.attendanceModal.absent")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {t("admin.attendanceModal.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || attendanceRecords.length === 0}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("admin.attendanceModal.saving")}
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                {t("admin.attendanceModal.saveAttendance")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
