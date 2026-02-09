/* ===============================================================
   SESSIONS PAGE - WITH QUICK ATTENDANCE (FIXED)
   
   ✅ Quick Attendance: pick group → auto-create session → mark attendance
   ✅ createSession only needs group_id + session_date + topic
   ✅ Detects if today's session already exists
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
  Zap,
  Search,
  Loader2,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  useAdminSessions,
  useDeleteSession,
  useCreateSession,
  useAdminGroups,
} from "../../../../hooks/admin/useAdmin";
import SessionFormModal from "../../components/SessionFormModal";
import AttendanceModal from "../../components/AttendanceModal";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog";
import type { Session } from "../../../../types/Types";
import { toast } from "sonner";

/* ===============================================================
   QUICK ATTENDANCE MODAL
=============================================================== */

const QuickAttendanceModal = ({
  open,
  onClose,
  onSessionReady,
  sessions,
}: {
  open: boolean;
  onClose: () => void;
  onSessionReady: (session: Session) => void;
  sessions: Session[];
}) => {
  const { data: groups = [], isLoading: groupsLoading } = useAdminGroups();
  const createSession = useCreateSession();

  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  if (!open) return null;

  const filteredGroups = groups.filter((g) => {
    const s = search.toLowerCase();
    const name = g.name?.toLowerCase() || "";
    const course = (g as any).course?.course_name?.toLowerCase() || "";
    return name.includes(s) || course.includes(s);
  });

  const getTodaySession = (groupId: string): Session | undefined => {
    const today = new Date();
    return sessions.find((s) => {
      const sd = new Date(s.session_date);
      return (
        s.group?.group_id === groupId &&
        sd.getDate() === today.getDate() &&
        sd.getMonth() === today.getMonth() &&
        sd.getFullYear() === today.getFullYear()
      );
    });
  };

  const handleGroupClick = async (group: any) => {
    const existing = getTodaySession(group.group_id);

    if (existing) {
      onSessionReady(existing);
      onClose();
      return;
    }

    setCreating(true);
    try {
      const now = new Date();
      const newSession = await createSession.mutateAsync({
        group_id: group.group_id,
        session_date: now.toISOString(),
        topic: `Session - ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      });

      toast.success("Session created for today");
      onSessionReady(newSession);
      onClose();
    } catch (err: any) {
      console.error("Quick session error:", err);
      toast.error(err?.response?.data?.message || "Failed to create session");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-violet-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Quick Attendance
                </h3>
                <p className="text-sm text-white/80">
                  Select a group to take today's attendance
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search groups or courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10"
                autoFocus
              />
            </div>
          </div>

          <div className="px-6 py-4 max-h-80 overflow-y-auto">
            {groupsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            ) : filteredGroups.length > 0 ? (
              <div className="space-y-2">
                {filteredGroups.map((group) => {
                  const todaySession = getTodaySession(group.group_id);
                  const courseName =
                    (group as any).course?.course_name || "No course";
                  const teacher = (group as any).teacher;
                  const teacherName = teacher
                    ? `${teacher.first_name} ${teacher.last_name}`
                    : null;

                  return (
                    <button
                      key={group.group_id}
                      onClick={() => handleGroupClick(group)}
                      disabled={creating}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left disabled:opacity-50"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {group.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{courseName}</span>
                          {group.level && (
                            <>
                              <span>•</span>
                              <span>{group.level}</span>
                            </>
                          )}
                          {teacherName && (
                            <>
                              <span>•</span>
                              <span>{teacherName}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {todaySession ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 border border-green-200 text-xs font-semibold text-green-700">
                            <UserCheck className="w-3 h-3" />
                            Today
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700">
                            <Plus className="w-3 h-3" />
                            New
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                <p className="font-medium text-gray-500">No groups found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {search ? "Try a different search" : "Create groups first"}
                </p>
              </div>
            )}
          </div>

          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {creating
                ? "Creating session..."
                : `${filteredGroups.length} groups`}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ===============================================================
   MAIN PAGE
=============================================================== */

const SessionsPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isQuickAttendanceOpen, setIsQuickAttendanceOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const { data: sessions = [], isLoading, error, refetch } = useAdminSessions();
  const deleteSession = useDeleteSession();

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
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
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Time";
    }
  };

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
      toast.error(error?.response?.data?.message || "Failed to delete session");
    }
  };

  const handleSuccess = () => {
    refetch();
  };

  const handleQuickSessionReady = (session: Session) => {
    refetch().then(() => {
      setSelectedSession(session);
      setIsAttendanceOpen(true);
    });
  };

  const hasAttendanceRecords = (session: Session) =>
    session._count && session._count.attendance > 0;

  const getStudentCount = (session: Session) => {
    if (!session.group?.enrollments) return 0;
    return session.group.enrollments.filter(
      (e: any) =>
        e.registration_status === "VALIDATED" ||
        e.registration_status === "PAID" ||
        e.registration_status === "FINISHED",
    ).length;
  };

  const getSessionData = (session: Session) => {
    const group = session.group;
    return {
      courseName: group?.course?.course_name || "Unknown Course",
      courseCode: group?.course?.course_code || null,
      groupName: group?.name || "Unknown Group",
      groupLevel: group?.level || null,
      teacherName: group?.teacher
        ? `${group.teacher.first_name} ${group.teacher.last_name}`
        : null,
      teacherEmail: group?.teacher?.email || null,
      hasTeacher: !!group?.teacher,
      topic: session.topic || null,
      sessionDate: session.session_date,
      studentCount: getStudentCount(session),
      attendanceCount: session._count?.attendance || 0,
      maxStudents: group?.max_students || 0,
    };
  };

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
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse"
              >
                <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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

  const stats = {
    total: sessions.length,
    today: sessions.filter((s) => {
      const t = new Date();
      const sd = new Date(s.session_date);
      return (
        sd.getDate() === t.getDate() &&
        sd.getMonth() === t.getMonth() &&
        sd.getFullYear() === t.getFullYear()
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
              Sessions
            </h1>
            <p className="text-gray-600 mt-1">
              Schedule and track sessions and attendance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsQuickAttendanceOpen(true)}
              className="gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all"
            >
              <Zap className="w-5 h-5" />
              Quick Attendance
            </Button>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Session
            </Button>
          </div>
        </div>

        {/* Stats */}
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
              Create your first session to get started
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={() => setIsQuickAttendanceOpen(true)}
                className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Zap className="w-4 h-4" />
                Quick Attendance
              </Button>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Create Session
              </Button>
            </div>
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
                  className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group ${isPast ? "opacity-75" : ""}`}
                >
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
                        </div>
                      </div>
                      {hasAttendance && (
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 ml-2">
                          <UserCheck className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(data.sessionDate)}</span>
                      <span className="text-indigo-200">•</span>
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(data.sessionDate)}</span>
                    </div>
                    {isPast && (
                      <div className="mt-2 text-xs bg-white/20 rounded px-2 py-1 inline-block">
                        Completed
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
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
                    {data.topic && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                        <p className="text-gray-700 line-clamp-2 flex-1">
                          {data.topic}
                        </p>
                      </div>
                    )}
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
                    {hasAttendance && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-500">
                            Attendance
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
                                width: `${Math.min((data.attendanceCount / data.studentCount) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

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
          refetch();
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
      <QuickAttendanceModal
        open={isQuickAttendanceOpen}
        onClose={() => setIsQuickAttendanceOpen(false)}
        onSessionReady={handleQuickSessionReady}
        sessions={sessions}
      />
    </div>
  );
};

export default SessionsPage;
