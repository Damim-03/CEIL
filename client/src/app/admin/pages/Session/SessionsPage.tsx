import { useState } from "react";
import { useTranslation } from "react-i18next";
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

/* ─── Quick Attendance Modal ─── */
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
  const { t } = useTranslation();
  const { data: groups = [], isLoading: groupsLoading } = useAdminGroups();
  const createSession = useCreateSession();
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  if (!open) return null;

  const filteredGroups = groups.filter((g) => {
    const s = search.toLowerCase();
    return (
      (g.name?.toLowerCase() || "").includes(s) ||
      ((g as any).course?.course_name?.toLowerCase() || "").includes(s)
    );
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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-[#D8CDC0]/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#D8CDC0]/30 bg-gradient-to-r from-[#C4A035] to-[#C4A035]/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {t("admin.sessions.quickAttendanceTitle")}
                </h3>
                <p className="text-sm text-white/80">
                  {t("admin.sessions.quickAttendanceDesc")}
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E]" />
              <Input
                placeholder={t("admin.sessions.searchGroupsCourses")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20"
                autoFocus
              />
            </div>
          </div>
          <div className="px-6 py-4 max-h-80 overflow-y-auto">
            {groupsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#2B6F5E]" />
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
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#D8CDC0]/40 hover:border-[#2B6F5E]/30 hover:bg-[#2B6F5E]/3 transition-all text-left disabled:opacity-50"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1B1B1B] truncate">
                          {group.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[#6B5D4F]">
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
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#8DB896]/15 border border-[#8DB896]/30 text-xs font-semibold text-[#2B6F5E]">
                            <UserCheck className="w-3 h-3" />{" "}
                            {t("admin.sessions.today")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#C4A035]/10 border border-[#C4A035]/20 text-xs font-semibold text-[#C4A035]">
                            <Plus className="w-3 h-3" />{" "}
                            {t("admin.sessions.new")}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-[#D8CDC0] mb-3" />
                <p className="font-medium text-[#6B5D4F]">
                  {t("admin.sessions.noGroupsFound")}
                </p>
                <p className="text-sm text-[#BEB29E] mt-1">
                  {search
                    ? t("admin.sessions.noGroupsSearchDesc")
                    : t("admin.sessions.noGroupsEmptyDesc")}
                </p>
              </div>
            )}
          </div>
          <div className="px-6 py-3 border-t border-[#D8CDC0]/30 bg-[#D8CDC0]/8 flex items-center justify-between">
            <p className="text-xs text-[#BEB29E]">
              {creating
                ? t("admin.sessions.creatingSession")
                : `${filteredGroups.length} ${t("admin.sessions.groups")}`}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={creating}
              className="text-[#6B5D4F] hover:bg-[#D8CDC0]/15"
            >
              {t("admin.sessions.cancel")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── Main Page ─── */
const SessionsPage = () => {
  const { t, i18n } = useTranslation();
  const locale =
    i18n.language === "ar"
      ? "ar-DZ"
      : i18n.language === "fr"
        ? "fr-FR"
        : "en-US";

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
      return new Date(dateString).toLocaleDateString(locale, {
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
      return new Date(dateString).toLocaleTimeString(locale, {
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
      toast.success("Session deleted successfully");
      setIsDeleteOpen(false);
      setSelectedSession(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete session");
    }
  };

  const handleSuccess = () => refetch();
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

  if (isLoading)
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <div className="h-8 w-48 bg-[#D8CDC0]/30 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-[#D8CDC0]/20 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-[#D8CDC0]/60 animate-pulse"
            >
              <div className="h-4 w-24 bg-[#D8CDC0]/30 rounded mb-2" />
              <div className="h-8 w-16 bg-[#D8CDC0]/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="bg-white rounded-2xl p-8 border border-red-200 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[#1B1B1B] mb-2">
          {t("admin.sessions.failedToLoad")}
        </h3>
        <p className="text-[#6B5D4F] mb-4">
          {(error as any)?.message || "Something went wrong"}
        </p>
        <Button
          onClick={() => refetch()}
          className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white"
        >
          {t("admin.sessions.tryAgain")}
        </Button>
      </div>
    );

  const stats = {
    total: sessions.length,
    today: sessions.filter((s) => {
      const td = new Date();
      const sd = new Date(s.session_date);
      return (
        sd.getDate() === td.getDate() &&
        sd.getMonth() === td.getMonth() &&
        sd.getFullYear() === td.getFullYear()
      );
    }).length,
    withAttendance: sessions.filter((s) => hasAttendanceRecords(s)).length,
    upcoming: sessions.filter((s) => new Date(s.session_date) > new Date())
      .length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B1B1B]">
                {t("admin.sessions.title")}
              </h1>
              <p className="text-sm text-[#BEB29E] mt-0.5">
                {t("admin.sessions.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsQuickAttendanceOpen(true)}
              className="gap-2 bg-[#C4A035] hover:bg-[#C4A035]/90 text-white shadow-md shadow-[#C4A035]/20"
            >
              <Zap className="w-4 h-4" />
              {t("admin.sessions.quickAttendance")}
            </Button>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white shadow-md shadow-[#2B6F5E]/20"
            >
              <Plus className="w-4 h-4" />
              {t("admin.sessions.createSession")}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: t("admin.sessions.totalSessions"),
            value: stats.total,
            icon: Calendar,
            color: "teal" as const,
          },
          {
            label: t("admin.sessions.todaySessions"),
            value: stats.today,
            icon: Clock,
            color: "mustard" as const,
          },
          {
            label: t("admin.sessions.withAttendance"),
            value: stats.withAttendance,
            icon: UserCheck,
            color: "green" as const,
          },
          {
            label: t("admin.sessions.upcoming"),
            value: stats.upcoming,
            icon: Calendar,
            color: "beige" as const,
          },
        ].map((stat) => {
          const colors = {
            teal: {
              bar: "from-[#2B6F5E] to-[#2B6F5E]/70",
              bg: "bg-[#2B6F5E]/8",
              icon: "text-[#2B6F5E]",
            },
            mustard: {
              bar: "from-[#C4A035] to-[#C4A035]/70",
              bg: "bg-[#C4A035]/8",
              icon: "text-[#C4A035]",
            },
            green: {
              bar: "from-[#8DB896] to-[#8DB896]/70",
              bg: "bg-[#8DB896]/12",
              icon: "text-[#3D7A4A]",
            },
            beige: {
              bar: "from-[#BEB29E] to-[#BEB29E]/70",
              bg: "bg-[#D8CDC0]/20",
              icon: "text-[#6B5D4F]",
            },
          };
          const c = colors[stat.color];
          return (
            <div
              key={stat.label}
              className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md transition-all"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${c.bar} opacity-60 group-hover:opacity-100 transition-opacity`}
              ></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#6B5D4F] uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-[#1B1B1B] mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 ${c.icon}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-[#D8CDC0]/60 text-center">
          <Calendar className="w-16 h-16 text-[#D8CDC0] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#1B1B1B] mb-2">
            {t("admin.sessions.noSessions")}
          </h3>
          <p className="text-[#6B5D4F] mb-6">
            {t("admin.sessions.noSessionsDesc")}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={() => setIsQuickAttendanceOpen(true)}
              className="gap-2 bg-[#C4A035] hover:bg-[#C4A035]/90 text-white"
            >
              <Zap className="w-4 h-4" /> {t("admin.sessions.quickAttendance")}
            </Button>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white"
            >
              <Plus className="w-4 h-4" /> {t("admin.sessions.createSession")}
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
                className={`bg-white rounded-2xl border border-[#D8CDC0]/60 overflow-hidden hover:shadow-lg transition-all group ${isPast ? "opacity-75" : ""}`}
              >
                <div className="bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/90 p-5 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1 line-clamp-2">
                        {data.courseName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-white/70">{data.groupName}</span>
                        {data.groupLevel && (
                          <>
                            <span className="text-white/40">•</span>
                            <span className="text-white/70">
                              {data.groupLevel}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {hasAttendance && (
                      <div className="w-8 h-8 rounded-lg bg-[#C4A035]/30 flex items-center justify-center shrink-0 ml-2">
                        <UserCheck className="w-4 h-4 text-[#C4A035]" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm flex-wrap text-white/80">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(data.sessionDate)}</span>
                    <span className="text-white/40">•</span>
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(data.sessionDate)}</span>
                  </div>
                  {isPast && (
                    <div className="mt-2 text-xs bg-white/15 rounded px-2 py-1 inline-block">
                      {t("admin.sessions.completed")}
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-3">
                  {data.hasTeacher ? (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-[#2B6F5E] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1B1B1B] truncate">
                          {data.teacherName}
                        </p>
                        {data.teacherEmail && (
                          <p className="text-xs text-[#BEB29E] truncate">
                            {data.teacherEmail}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm p-2 bg-[#C4A035]/8 rounded-lg border border-[#C4A035]/20">
                      <UserX className="w-4 h-4 text-[#C4A035] shrink-0" />
                      <span className="text-[#C4A035] text-xs font-medium">
                        {t("admin.sessions.noTeacher")}
                      </span>
                    </div>
                  )}
                  {data.topic && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="w-4 h-4 text-[#2B6F5E] mt-0.5 shrink-0" />
                      <p className="text-[#6B5D4F] line-clamp-2 flex-1">
                        {data.topic}
                      </p>
                    </div>
                  )}
                  {data.studentCount > 0 && (
                    <div className="flex items-center justify-between text-sm p-2 bg-[#D8CDC0]/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#2B6F5E] shrink-0" />
                        <span className="text-[#6B5D4F] font-medium">
                          {data.studentCount}{" "}
                          {data.studentCount !== 1
                            ? t("admin.sessions.students_plural")
                            : t("admin.sessions.students")}
                        </span>
                      </div>
                      <span className="text-xs text-[#BEB29E]">
                        / {data.maxStudents} {t("admin.sessions.max")}
                      </span>
                    </div>
                  )}
                  {hasAttendance && (
                    <div className="pt-3 border-t border-[#D8CDC0]/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#6B5D4F]">
                          {t("admin.sessions.attendance")}
                        </span>
                        <span className="text-sm font-bold text-[#2B6F5E]">
                          {data.attendanceCount}
                          {data.studentCount > 0 && ` / ${data.studentCount}`}
                        </span>
                      </div>
                      {data.studentCount > 0 && (
                        <div className="h-2 bg-[#D8CDC0]/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#2B6F5E] to-[#8DB896] rounded-full transition-all"
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
                    className="flex-1 gap-2 rounded-xl bg-[#2B6F5E]/8 text-[#2B6F5E] hover:bg-[#2B6F5E]/15 border-0"
                  >
                    <Eye className="w-4 h-4" /> {t("admin.sessions.attendance")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleEdit(session)}
                    className="gap-2 rounded-xl bg-[#D8CDC0]/15 text-[#6B5D4F] hover:bg-[#D8CDC0]/25 border-0"
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
                        ? t("admin.sessions.cannotDelete")
                        : t("admin.sessions.deleteSession")
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
