/* ===============================================================
   SESSIONS PAGE - OPTIMIZED FOR ACTUAL API RESPONSE
   
   ✅ Based on actual API response structure
   ✅ Handles null teacher gracefully
   ✅ Correct enrollment filtering
   ✅ Fixed student count logic
=============================================================== */

import { useState } from "react";
import {
  Plus,
  Calendar,
  User,
  FileText,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  UserCheck,
  Clock,
  Users,
  UserX,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  useAdminSessions,
  useDeleteSession,
} from "../../../../hooks/admin/useAdmin";
import SessionFormModal from "../../components/SessionFormModal";
import AttendanceModal from "../../components/AttendanceModal";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import type { Session } from "../../../../types/Types";
import { toast } from "sonner";

const SessionsPage = () => {
  // State for modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Fetch sessions
  const { data: sessions = [], isLoading, error, refetch } = useAdminSessions();
  const deleteSession = useDeleteSession();

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Time";
    }
  };

  // Handle actions
  const handleViewAttendance = (session: Session) => {
    setSelectedSession(session);
    setIsAttendanceOpen(true);
  };

  const handleEdit = (session: Session) => {
    setSelectedSession(session);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (session: Session) => {
    setSelectedSession(session);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSession) return;

    try {
      await deleteSession.mutateAsync(selectedSession.session_id);
      toast.success("✅ Session deleted successfully");
      setIsDeleteOpen(false);
      setSelectedSession(null);
    } catch (error: any) {
      console.error("Delete error:", error);

      const message =
        error?.response?.data?.message || "Failed to delete session";
      const details = error?.response?.data?.details;

      // ✅ Show specific error messages
      if (message.includes("attendance records")) {
        toast.error("❌ Cannot delete: This session has attendance records", {
          description: `${details?.attendance_count} students' attendance will be lost if deleted`,
          duration: 5000,
        });
      } else if (message.includes("past session")) {
        toast.error("❌ Cannot delete past sessions", {
          description: "Past sessions should be kept for historical records",
          duration: 5000,
        });
      } else {
        toast.error(message);
      }
    }
  };

  const handleSuccess = () => {
    refetch();
    toast.success("✅ Operation completed successfully");
  };

  // ✅ Check if session has attendance records
  const hasAttendanceRecords = (session: Session) => {
    return session._count && session._count.attendance > 0;
  };

  // ✅ FIXED: Get student count from enrollments with FINISHED status
  const getStudentCount = (session: Session) => {
    if (!session.group?.enrollments) return 0;

    return session.group.enrollments.filter(
      (e: any) =>
        e.registration_status === "VALIDATED" ||
        e.registration_status === "PAID" ||
        e.registration_status === "FINISHED",
    ).length;
  };

  // ✅ Get session display data
  const getSessionData = (session: Session) => {
    const group = session.group;

    return {
      // Course info
      courseName: group?.course?.course_name || "Unknown Course",
      courseCode: group?.course?.course_code || null,

      // Group info
      groupName: group?.name || "Unknown Group",
      groupLevel: group?.level || null,
      groupId: group?.group_id || null,

      // Teacher info (can be null)
      teacherName: group?.teacher
        ? `${group.teacher.first_name} ${group.teacher.last_name}`
        : null,
      teacherEmail: group?.teacher?.email || null,
      hasTeacher: !!group?.teacher,

      // Session info
      topic: session.topic || null,
      sessionDate: session.session_date,

      // Counts
      studentCount: getStudentCount(session),
      attendanceCount: session._count?.attendance || 0,
      maxStudents: group?.max_students || 0,

      // Status
      groupStatus: group?.status || "UNKNOWN",
    };
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse"
              >
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-8 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse"
              >
                <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-8 border border-red-200 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Failed to load sessions
            </h3>
            <p className="text-gray-600 mb-4">
              {(error as any)?.message || "Something went wrong"}
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Calculate statistics
  const stats = {
    total: sessions.length,
    today: sessions.filter((s) => {
      const today = new Date();
      const sessionDate = new Date(s.session_date);
      return (
        sessionDate.getDate() === today.getDate() &&
        sessionDate.getMonth() === today.getMonth() &&
        sessionDate.getFullYear() === today.getFullYear()
      );
    }).length,
    withAttendance: sessions.filter((s) => hasAttendanceRecords(s)).length,
    upcoming: sessions.filter((s) => new Date(s.session_date) > new Date())
      .length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Sessions Management
            </h1>
            <p className="text-gray-600 mt-1">
              Schedule and track academic sessions and attendance
            </p>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Session
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Total Sessions
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Today's Sessions
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.today}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  With Attendance
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.withAttendance}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Upcoming
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.upcoming}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No sessions found
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first session to get started with attendance tracking
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Create Session
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => {
              const data = getSessionData(session);
              const hasAttendance = hasAttendanceRecords(session);
              const isPast = new Date(session.session_date) < new Date();

              return (
                <div
                  key={session.session_id}
                  className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group ${
                    isPast ? "opacity-75" : ""
                  }`}
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-5 text-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1 line-clamp-2">
                          {data.courseName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-indigo-100 truncate">
                            {data.groupName}
                          </span>
                          {data.groupLevel && (
                            <>
                              <span className="text-indigo-200">•</span>
                              <span className="text-indigo-100">
                                {data.groupLevel}
                              </span>
                            </>
                          )}
                          {data.courseCode && (
                            <>
                              <span className="text-indigo-200">•</span>
                              <span className="text-indigo-100">
                                {data.courseCode}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {hasAttendance && (
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 ml-2">
                          <UserCheck className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Date/Time */}
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(data.sessionDate)}</span>
                      <span className="text-indigo-200">•</span>
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(data.sessionDate)}</span>
                    </div>

                    {/* Past indicator */}
                    {isPast && (
                      <div className="mt-2 text-xs bg-white/20 rounded px-2 py-1 inline-block">
                        Completed
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    {/* Teacher - Handle null gracefully */}
                    {data.hasTeacher ? (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {data.teacherName}
                          </p>
                          {data.teacherEmail && (
                            <p className="text-xs text-gray-500 truncate">
                              {data.teacherEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm p-2 bg-amber-50 rounded-lg border border-amber-200">
                        <UserX className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-amber-700 text-xs font-medium">
                          No teacher assigned
                        </span>
                      </div>
                    )}

                    {/* Topic */}
                    {data.topic && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                        <p className="text-gray-700 line-clamp-2 flex-1">
                          {data.topic}
                        </p>
                      </div>
                    )}

                    {/* Students Enrolled */}
                    {data.studentCount > 0 && (
                      <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="text-gray-700 font-medium">
                            {data.studentCount} student
                            {data.studentCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          / {data.maxStudents} max
                        </span>
                      </div>
                    )}

                    {/* Attendance Stats */}
                    {hasAttendance && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-500">
                            Attendance Recorded
                          </span>
                          <span className="text-sm font-bold text-indigo-600">
                            {data.attendanceCount}
                            {data.studentCount > 0 && ` / ${data.studentCount}`}
                          </span>
                        </div>
                        {data.studentCount > 0 && (
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all"
                              style={{
                                width: `${Math.min(
                                  (data.attendanceCount / data.studentCount) *
                                    100,
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="px-5 pb-5 flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewAttendance(session)}
                      className="flex-1 gap-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-0"
                    >
                      <Eye className="w-4 h-4" />
                      Attendance
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleEdit(session)}
                      className="gap-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleDeleteClick(session)}
                      disabled={hasAttendance}
                      className="gap-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={
                        hasAttendance
                          ? "Cannot delete session with attendance records"
                          : "Delete session"
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <SessionFormModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleSuccess}
      />

      <SessionFormModal
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onSuccess={handleSuccess}
      />

      <AttendanceModal
        open={isAttendanceOpen}
        onClose={() => {
          setIsAttendanceOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedSession(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteSession.isPending}
        sessionInfo={
          selectedSession
            ? `${getSessionData(selectedSession).courseName} - ${getSessionData(selectedSession).groupName} - ${formatDate(selectedSession.session_date)}`
            : ""
        }
      />
    </div>
  );
};

export default SessionsPage;
