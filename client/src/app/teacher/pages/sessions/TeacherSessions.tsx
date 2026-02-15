import { useState, useMemo, Fragment } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Clock,
  Users,
  ClipboardCheck,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronDown,
  Layers,
  DoorOpen,
} from "lucide-react";
import {
  useTeacherSessions,
  useTeacherGroups,
  useCreateSession,
  useUpdateSession,
  useDeleteSession,
} from "../../../../hooks/teacher/Useteacher";

/* ═══════════════════ TYPES ═══════════════════ */

interface SessionGroup {
  group_id: string;
  name: string;
  course: { course_id: string; course_name: string; course_code: string };
}

interface SessionData {
  session_id: string;
  session_date: string;
  end_time: string | null;
  topic: string | null;
  group_id: string;
  group: SessionGroup;
  room?: { room_id: string; name: string } | null;
  _count: { attendance: number };
  enrolled_students: number;
  attendance_taken: number;
  attendance_complete: boolean;
}

interface GroupOption {
  group_id: string;
  name: string;
  course: { course_id: string; course_name: string; course_code: string };
}

/* ═══════════════════ HELPERS ═══════════════════ */

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-DZ", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("ar-DZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

const isPast = (d: string) => new Date(d) < new Date();

const isToday = (d: string) =>
  new Date(d).toDateString() === new Date().toDateString();

const isLive = (s: { session_date: string; end_time: string | null }) => {
  const now = new Date();
  const start = new Date(s.session_date);
  const end = s.end_time
    ? new Date(s.end_time)
    : new Date(start.getTime() + 90 * 60000);
  return now >= start && now <= end;
};

const getDurationLabel = (start: string, end: string | null) => {
  if (!end) return null;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  if (diff <= 0) return null;
  const mins = Math.round(diff / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}د`;
  if (m === 0) return `${h}س`;
  return `${h}س ${m}د`;
};

const groupByDate = (sessions: SessionData[]) => {
  const map: Record<string, SessionData[]> = {};
  sessions.forEach((s) => {
    const key = new Date(s.session_date).toISOString().split("T")[0];
    if (!map[key]) map[key] = [];
    map[key].push(s);
  });
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
};

/* ═══════════════════ SKELETON ═══════════════════ */

const SessionsSkeleton = () => (
  <div className="space-y-6 animate-pulse" dir="rtl">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-7 w-32 bg-[#D8CDC0]/30 rounded-lg" />
        <div className="h-4 w-48 bg-[#D8CDC0]/20 rounded-lg mt-2" />
      </div>
      <div className="h-10 w-32 bg-[#D8CDC0]/30 rounded-xl" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-[#D8CDC0]/40 h-[76px]"
        />
      ))}
    </div>
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl border border-[#D8CDC0]/40 h-[90px]"
      />
    ))}
  </div>
);

/* ═══════════════════ CREATE / EDIT MODAL ═══════════════════ */

interface SessionModalProps {
  groups: GroupOption[];
  initial?: {
    session_id: string;
    group_id: string;
    session_date: string;
    end_time: string | null;
    topic: string | null;
  };
  onClose: () => void;
}

const SessionModal = ({ groups, initial, onClose }: SessionModalProps) => {
  const isEdit = !!initial;
  const createMutation = useCreateSession();
  const updateMutation = useUpdateSession();

  const [groupId, setGroupId] = useState(initial?.group_id || "");
  const [date, setDate] = useState(
    initial ? new Date(initial.session_date).toISOString().slice(0, 16) : "",
  );
  const [endTime, setEndTime] = useState(
    initial?.end_time
      ? new Date(initial.end_time).toISOString().slice(0, 16)
      : "",
  );
  const [topic, setTopic] = useState(initial?.topic || "");

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const durationMinutes = useMemo(() => {
    if (!date || !endTime) return null;
    const diff = new Date(endTime).getTime() - new Date(date).getTime();
    return diff > 0 ? Math.round(diff / 60000) : null;
  }, [date, endTime]);

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} دقيقة`;
    if (m === 0) return `${h} ساعة`;
    return `${h} ساعة و ${m} دقيقة`;
  };

  const endTimeValid = !endTime || !date || new Date(endTime) > new Date(date);

  const handleSubmit = async () => {
    if (!isEdit && (!groupId || !date)) return;
    if (isEdit && !date) return;
    if (!endTimeValid) return;

    if (isEdit && initial) {
      await updateMutation.mutateAsync({
        sessionId: initial.session_id,
        session_date: new Date(date).toISOString(),
        end_time: endTime ? new Date(endTime).toISOString() : null,
        topic: topic || undefined,
      });
    } else {
      await createMutation.mutateAsync({
        group_id: groupId,
        session_date: new Date(date).toISOString(),
        end_time: endTime ? new Date(endTime).toISOString() : undefined,
        topic: topic || undefined,
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/40 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/25">
          <h2 className="text-base font-semibold text-[#1B1B1B]">
            {isEdit ? "تعديل الحصة" : "إنشاء حصة جديدة"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#D8CDC0]/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#6B5D4F]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-[#6B5D4F] mb-1.5">
                المجموعة
              </label>
              <div className="relative">
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full h-11 pr-4 pl-8 bg-[#FAFAF8] border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10 appearance-none cursor-pointer"
                >
                  <option value="">اختر المجموعة</option>
                  {groups.map((g) => (
                    <option key={g.group_id} value={g.group_id}>
                      {g.name} — {g.course.course_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] pointer-events-none" />
              </div>
            </div>
          )}

          {/* Start time */}
          <div>
            <label className="block text-xs font-medium text-[#6B5D4F] mb-1.5">
              <Clock className="w-3.5 h-3.5 inline ml-1 text-[#2B6F5E]" />
              وقت البداية
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 px-4 bg-[#FAFAF8] border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10"
            />
          </div>

          {/* End time */}
          <div>
            <label className="block text-xs font-medium text-[#6B5D4F] mb-1.5">
              <Clock className="w-3.5 h-3.5 inline ml-1 text-[#C4A035]" />
              وقت الانتهاء{" "}
              <span className="text-[#BEB29E] font-normal mr-1">(اختياري)</span>
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              min={date || undefined}
              disabled={!date}
              className="w-full h-11 px-4 bg-[#FAFAF8] border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] focus:outline-none focus:border-[#C4A035]/40 focus:ring-2 focus:ring-[#C4A035]/10 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {!date && (
              <p className="text-[10px] text-[#BEB29E] mt-1">
                حدد وقت البداية أولاً
              </p>
            )}
            {durationMinutes && durationMinutes > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#C4A035] font-medium">
                <Clock className="w-3 h-3" />
                المدة: {formatDuration(durationMinutes)}
              </div>
            )}
            {endTime && date && !endTimeValid && (
              <p className="text-[10px] text-red-500 font-medium mt-1">
                وقت الانتهاء يجب أن يكون بعد البداية
              </p>
            )}
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-medium text-[#6B5D4F] mb-1.5">
              الموضوع{" "}
              <span className="text-[#BEB29E] font-normal">(اختياري)</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: الوحدة الثالثة - المحادثة"
              className="w-full h-11 px-4 bg-[#FAFAF8] border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] placeholder:text-[#BEB29E] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#D8CDC0]/25 bg-[#FAFAF8]/50">
          <button
            onClick={onClose}
            className="h-10 px-5 text-sm font-medium text-[#6B5D4F] hover:bg-[#D8CDC0]/20 rounded-xl transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (!isEdit && (!groupId || !date)) ||
              (isEdit && !date) ||
              !endTimeValid
            }
            className="h-10 px-6 text-sm font-medium text-white bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isEdit ? "حفظ التعديلات" : "إنشاء الحصة"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════ DELETE CONFIRM ═══════════════════ */

const DeleteConfirmModal = ({
  sessionId,
  onClose,
}: {
  sessionId: string;
  onClose: () => void;
}) => {
  const deleteMutation = useDeleteSession();
  const handleDelete = async () => {
    await deleteMutation.mutateAsync(sessionId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/40 shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-[#1B1B1B] mb-1">
            حذف الحصة
          </h3>
          <p className="text-sm text-[#6B5D4F]/70">
            هل أنت متأكد من حذف هذه الحصة؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>
        <div className="flex items-center gap-2 px-5 py-4 border-t border-[#D8CDC0]/25 bg-[#FAFAF8]/50">
          <button
            onClick={onClose}
            className="flex-1 h-10 text-sm font-medium text-[#6B5D4F] hover:bg-[#D8CDC0]/20 rounded-xl transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex-1 h-10 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {deleteMutation.isPending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════ SESSION CARD ═══════════════════ */

const SessionCard = ({
  session,
  onEdit,
  onDelete,
}: {
  session: SessionData;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const past = isPast(session.session_date);
  const today = isToday(session.session_date);
  const live = isLive(session);
  const hasAttendance = session.attendance_taken > 0;
  const complete = session.attendance_complete;
  const duration = getDurationLabel(session.session_date, session.end_time);

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl bg-white border transition-all group/sess ${
        live
          ? "border-[#2B6F5E]/30 ring-1 ring-[#2B6F5E]/10 shadow-sm"
          : "border-[#D8CDC0]/30 hover:border-[#D8CDC0]/50 hover:shadow-md"
      }`}
    >
      {/* Date box */}
      <div
        className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 ${
          live
            ? "bg-[#2B6F5E]/12 ring-2 ring-[#2B6F5E]/25"
            : today
              ? "bg-[#C4A035]/10 ring-2 ring-[#C4A035]/30"
              : past
                ? "bg-[#D8CDC0]/12"
                : "bg-[#2B6F5E]/8"
        }`}
      >
        <span
          className={`text-[11px] font-medium leading-tight ${
            live
              ? "text-[#2B6F5E]"
              : today
                ? "text-[#C4A035]"
                : past
                  ? "text-[#6B5D4F]/50"
                  : "text-[#2B6F5E]/70"
          }`}
        >
          {new Date(session.session_date).toLocaleDateString("ar-DZ", {
            weekday: "short",
          })}
        </span>
        <span
          className={`text-lg font-bold leading-tight ${
            live
              ? "text-[#2B6F5E]"
              : today
                ? "text-[#C4A035]"
                : past
                  ? "text-[#6B5D4F]/70"
                  : "text-[#2B6F5E]"
          }`}
        >
          {new Date(session.session_date).getDate()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <h3 className="text-sm font-semibold text-[#1B1B1B] truncate">
            {session.group.course.course_name}
          </h3>
          {live && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#2B6F5E] px-2 py-0.5 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              جارية
            </span>
          )}
          {today && !live && (
            <span className="text-[10px] font-bold text-[#C4A035] bg-[#C4A035]/10 px-2 py-0.5 rounded-full">
              اليوم
            </span>
          )}
          {duration && (
            <span className="text-[9px] font-semibold text-[#6B5D4F]/50 bg-[#D8CDC0]/15 px-1.5 py-0.5 rounded">
              {duration}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#6B5D4F]/60 flex-wrap">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {session.group.name}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(session.session_date)}
            {session.end_time && (
              <span className="text-[#6B5D4F]/40">
                {" "}
                ← {formatTime(session.end_time)}
              </span>
            )}
          </span>
          {session.room && (
            <span className="flex items-center gap-1">
              <DoorOpen className="w-3 h-3" />
              {session.room.name}
            </span>
          )}
          {session.topic && (
            <span className="truncate max-w-[160px]">{session.topic}</span>
          )}
        </div>
      </div>

      {/* Attendance badge */}
      <div className="shrink-0">
        {hasAttendance ? (
          <Link
            to="/teacher/sessions"
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full transition-colors ${
              complete
                ? "text-[#2B6F5E] bg-[#2B6F5E]/8 hover:bg-[#2B6F5E]/15"
                : "text-[#C4A035] bg-[#C4A035]/8 hover:bg-[#C4A035]/15"
            }`}
          >
            <UserCheck className="w-3 h-3" />
            {session.attendance_taken}/{session.enrolled_students}
          </Link>
        ) : past ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500/80 bg-red-500/8 px-2.5 py-1.5 rounded-full">
            <UserX className="w-3 h-3" />
            لم يُسجل
          </span>
        ) : live ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2B6F5E] bg-[#2B6F5E]/10 px-2.5 py-1.5 rounded-full">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2B6F5E] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2B6F5E]" />
            </span>
            جارية
          </span>
        ) : (
          <span className="text-[11px] text-[#BEB29E] bg-[#D8CDC0]/10 px-2.5 py-1.5 rounded-full">
            قادمة
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover/sess:opacity-100 transition-opacity shrink-0">
        <button
          onClick={onEdit}
          className="w-8 h-8 rounded-lg hover:bg-[#2B6F5E]/8 flex items-center justify-center transition-colors"
          title="تعديل"
        >
          <Pencil className="w-3.5 h-3.5 text-[#2B6F5E]" />
        </button>
        {!hasAttendance && (
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
            title="حذف"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */

export default function TeacherSessions() {
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editSession, setEditSession] = useState<SessionData | null>(null);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

  const queryGroupId = groupFilter === "all" ? undefined : groupFilter;
  const {
    data: sessions,
    isLoading,
    isError,
  } = useTeacherSessions(queryGroupId);
  const { data: groupsData } = useTeacherGroups();

  const groups: GroupOption[] = groupsData ?? [];
  const allSessions: SessionData[] = sessions ?? [];

  const stats = useMemo(() => {
    const total = allSessions.length;
    const todayCount = allSessions.filter((s) =>
      isToday(s.session_date),
    ).length;
    const withAttendance = allSessions.filter(
      (s) => s.attendance_taken > 0,
    ).length;
    const upcoming = allSessions.filter((s) => !isPast(s.session_date)).length;
    const liveCount = allSessions.filter((s) => isLive(s)).length;
    return { total, todayCount, withAttendance, upcoming, liveCount };
  }, [allSessions]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allSessions;
    const q = search.trim().toLowerCase();
    return allSessions.filter(
      (s) =>
        s.topic?.toLowerCase().includes(q) ||
        s.group.name.toLowerCase().includes(q) ||
        s.group.course.course_name.toLowerCase().includes(q) ||
        s.room?.name?.toLowerCase().includes(q),
    );
  }, [allSessions, search]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);
  const hasFilters = search.trim() !== "" || groupFilter !== "all";

  if (isLoading) return <SessionsSkeleton />;

  if (isError) {
    return (
      <div
        dir="rtl"
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">
          حدث خطأ أثناء تحميل الحصص
        </h3>
        <p className="text-sm text-[#6B5D4F]/70">
          يرجى تحديث الصفحة أو المحاولة لاحقاً
        </p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6 pb-8">
      {/* Modals */}
      {(showModal || editSession) && (
        <SessionModal
          groups={groups}
          initial={
            editSession
              ? {
                  session_id: editSession.session_id,
                  group_id: editSession.group_id,
                  session_date: editSession.session_date,
                  end_time: editSession.end_time,
                  topic: editSession.topic,
                }
              : undefined
          }
          onClose={() => {
            setShowModal(false);
            setEditSession(null);
          }}
        />
      )}
      {deleteSessionId && (
        <DeleteConfirmModal
          sessionId={deleteSessionId}
          onClose={() => setDeleteSessionId(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B]">الحصص</h1>
          <p className="text-sm text-[#6B5D4F]/70 mt-0.5">
            إدارة حصصك وتسجيل الحضور
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-10 px-5 text-sm font-medium text-white bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 rounded-xl transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          حصة جديدة
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "إجمالي الحصص",
            value: stats.total,
            icon: CalendarDays,
            color: "teal" as const,
          },
          {
            label: "حصص اليوم",
            value: stats.todayCount,
            icon: Clock,
            color: "gold" as const,
          },
          {
            label: "تم تسجيل الحضور",
            value: stats.withAttendance,
            icon: ClipboardCheck,
            color: "green" as const,
          },
          {
            label: "قادمة",
            value: stats.upcoming,
            icon: Users,
            color: "beige" as const,
          },
        ].map((stat) => {
          const colors = {
            teal: {
              bg: "bg-[#2B6F5E]/8",
              icon: "text-[#2B6F5E]",
              val: "text-[#2B6F5E]",
            },
            gold: {
              bg: "bg-[#C4A035]/8",
              icon: "text-[#C4A035]",
              val: "text-[#C4A035]",
            },
            green: {
              bg: "bg-[#8DB896]/12",
              icon: "text-[#3D7A4A]",
              val: "text-[#3D7A4A]",
            },
            beige: {
              bg: "bg-[#D8CDC0]/20",
              icon: "text-[#6B5D4F]",
              val: "text-[#6B5D4F]",
            },
          };
          const c = colors[stat.color];
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-[#D8CDC0]/40 px-4 py-3 flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}
              >
                <stat.icon className={`w-[18px] h-[18px] ${c.icon}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl font-bold leading-tight ${c.val}`}>
                  {stat.value}
                </p>
                <p className="text-[11px] text-[#6B5D4F]/60 truncate">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث بالموضوع، المجموعة، المادة، القاعة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pr-10 pl-9 bg-white border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] placeholder:text-[#BEB29E] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#D8CDC0]/30 hover:bg-[#D8CDC0]/50 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-[#6B5D4F]" />
            </button>
          )}
        </div>
        <div className="relative shrink-0">
          <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] pointer-events-none" />
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="h-11 pr-10 pl-8 bg-white border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10 appearance-none cursor-pointer transition-all min-w-[160px]"
          >
            <option value="all">جميع المجموعات</option>
            {groups.map((g) => (
              <option key={g.group_id} value={g.group_id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters */}
      {hasFilters && (
        <div className="flex items-center justify-between bg-[#2B6F5E]/5 border border-[#2B6F5E]/10 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-[#6B5D4F]/70">النتائج:</span>
            <span className="font-semibold text-[#2B6F5E]">
              {filtered.length}
            </span>
          </div>
          <button
            onClick={() => {
              setSearch("");
              setGroupFilter("all");
            }}
            className="text-xs font-medium text-[#2B6F5E] hover:text-[#2B6F5E]/70 flex items-center gap-1 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            مسح
          </button>
        </div>
      )}

      {/* Sessions List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/15 flex items-center justify-center mb-4">
            <CalendarDays className="w-7 h-7 text-[#BEB29E]" />
          </div>
          <h3 className="text-base font-semibold text-[#1B1B1B] mb-1">
            {allSessions.length === 0 ? "لا توجد حصص" : "لا توجد نتائج مطابقة"}
          </h3>
          <p className="text-sm text-[#6B5D4F]/60 max-w-xs">
            {allSessions.length === 0
              ? "ابدأ بإنشاء حصة جديدة بالضغط على الزر أعلاه"
              : "جرّب تغيير البحث أو الفلتر"}
          </p>
          {allSessions.length === 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 h-10 px-5 text-sm font-medium text-white bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إنشاء حصة
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([dateKey, dateSessions]) => {
            const dateObj = new Date(dateKey);
            const isTodayGroup = isToday(dateKey + "T12:00:00");
            const hasLive = dateSessions.some(isLive);
            const label = isTodayGroup
              ? "اليوم"
              : dateObj.toLocaleDateString("ar-DZ", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                });

            return (
              <Fragment key={dateKey}>
                <div className="flex items-center gap-3">
                  <div
                    className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                      hasLive
                        ? "bg-[#2B6F5E]/10 text-[#2B6F5E]"
                        : isTodayGroup
                          ? "bg-[#C4A035]/10 text-[#C4A035]"
                          : "bg-[#D8CDC0]/15 text-[#6B5D4F]/60"
                    }`}
                  >
                    {hasLive && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2B6F5E] opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2B6F5E]" />
                      </span>
                    )}
                    {label}
                  </div>
                  <div className="flex-1 h-px bg-[#D8CDC0]/20" />
                  <span className="text-[11px] text-[#BEB29E]">
                    {dateSessions.length}{" "}
                    {dateSessions.length === 1 ? "حصة" : "حصص"}
                  </span>
                </div>
                <div className="space-y-2">
                  {dateSessions.map((session) => (
                    <SessionCard
                      key={session.session_id}
                      session={session}
                      onEdit={() => setEditSession(session)}
                      onDelete={() => setDeleteSessionId(session.session_id)}
                    />
                  ))}
                </div>
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
