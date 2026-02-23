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
import { useLanguage } from "../../../../hooks/useLanguage";

/* ═══ TYPES ═══ */
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

/* ═══ HELPERS ═══ */
const getLocale = (lang: string) =>
  lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US";
const isPast = (d: string) => new Date(d) < new Date();
const isToday = (d: string) =>
  new Date(d).toDateString() === new Date().toDateString();
const isLive = (s: { session_date: string; end_time: string | null }) => {
  const now = Date.now(),
    start = new Date(s.session_date).getTime();
  return (
    now >= start &&
    now <= (s.end_time ? new Date(s.end_time).getTime() : start + 5400000)
  );
};

const groupByDate = (sessions: SessionData[]) => {
  const map: Record<string, SessionData[]> = {};
  sessions.forEach((s) => {
    const k = new Date(s.session_date).toISOString().split("T")[0];
    if (!map[k]) map[k] = [];
    map[k].push(s);
  });
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
};

/* ═══ SKELETON ═══ */
const SessionsSkeleton = ({ rtl }: { rtl: boolean }) => (
  <div className="space-y-6 animate-pulse" dir={rtl ? "rtl" : "ltr"}>
    <div className="flex items-center justify-between">
      <div>
        <div className="h-7 w-32 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded-lg" />
        <div className="h-4 w-48 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded-lg mt-2" />
      </div>
      <div className="h-10 w-32 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded-xl" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[76px]"
        />
      ))}
    </div>
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[90px]"
      />
    ))}
  </div>
);

/* ═══ CREATE/EDIT MODAL ═══ */
const SessionModal = ({
  groups,
  initial,
  onClose,
}: {
  groups: GroupOption[];
  initial?: {
    session_id: string;
    group_id: string;
    session_date: string;
    end_time: string | null;
    topic: string | null;
  };
  onClose: () => void;
}) => {
  const { t, dir, isRTL } = useLanguage();
  const isEdit = !!initial;
  const createMut = useCreateSession();
  const updateMut = useUpdateSession();
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
  const busy = createMut.isPending || updateMut.isPending;
  const dur = useMemo(() => {
    if (!date || !endTime) return null;
    const d = new Date(endTime).getTime() - new Date(date).getTime();
    return d > 0 ? Math.round(d / 60000) : null;
  }, [date, endTime]);
  const fmtDur = (m: number) => {
    const h = Math.floor(m / 60),
      mm = m % 60;
    return h === 0
      ? t("teacher.sessions.minutes", { count: mm })
      : mm === 0
        ? t("teacher.sessions.hours", { count: h })
        : t("teacher.sessions.hoursMinutes", { h, m: mm });
  };
  const endValid = !endTime || !date || new Date(endTime) > new Date(date);

  const submit = async () => {
    if (!isEdit && (!groupId || !date)) return;
    if (isEdit && !date) return;
    if (!endValid) return;
    if (isEdit && initial)
      await updateMut.mutateAsync({
        sessionId: initial.session_id,
        session_date: new Date(date).toISOString(),
        end_time: endTime ? new Date(endTime).toISOString() : null,
        topic: topic || undefined,
      });
    else
      await createMut.mutateAsync({
        group_id: groupId,
        session_date: new Date(date).toISOString(),
        end_time: endTime ? new Date(endTime).toISOString() : undefined,
        topic: topic || undefined,
      });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir={dir}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/25 dark:border-[#2A2A2A]">
          <h2 className="text-base font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {isEdit
              ? t("teacher.sessions.editSession")
              : t("teacher.sessions.createSession")}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:hover:bg-[#222222] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#6B5D4F] dark:text-[#AAAAAA]" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-[#6B5D4F] dark:text-[#AAAAAA] mb-1.5">
                {t("teacher.sessions.group")}
              </label>
              <div className="relative">
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className={`w-full h-11 ${isRTL ? "pr-4 pl-8" : "pl-4 pr-8"} bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10 appearance-none cursor-pointer`}
                >
                  <option value="">{t("teacher.sessions.selectGroup")}</option>
                  {groups.map((g) => (
                    <option key={g.group_id} value={g.group_id}>
                      {g.name} — {g.course.course_name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-[#6B5D4F] dark:text-[#AAAAAA] mb-1.5">
              <Clock className="w-3.5 h-3.5 inline me-1 text-[#2B6F5E] dark:text-[#4ADE80]" />
              {t("teacher.sessions.startTime")}
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 px-4 bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B5D4F] dark:text-[#AAAAAA] mb-1.5">
              <Clock className="w-3.5 h-3.5 inline me-1 text-[#C4A035] dark:text-[#C4A035]" />
              {t("teacher.sessions.endTime")}{" "}
              <span className="text-[#BEB29E] dark:text-[#888888] font-normal ms-1">
                ({t("teacher.sessions.optional")})
              </span>
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              min={date || undefined}
              disabled={!date}
              className="w-full h-11 px-4 bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:border-[#C4A035]/40 dark:border-[#C4A035]/40 focus:ring-2 focus:ring-[#C4A035] dark:ring-[#C4A035]/10 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {!date && (
              <p className="text-[10px] text-[#BEB29E] dark:text-[#888888] mt-1">
                {t("teacher.sessions.setStartFirst")}
              </p>
            )}
            {dur && dur > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#C4A035] dark:text-[#C4A035] dark:text-[#C4A035] font-medium">
                <Clock className="w-3 h-3" />
                {t("teacher.sessions.duration")}: {fmtDur(dur)}
              </div>
            )}
            {endTime && date && !endValid && (
              <p className="text-[10px] text-red-500 dark:text-red-400 font-medium mt-1">
                {t("teacher.sessions.endAfterStart")}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B5D4F] dark:text-[#AAAAAA] mb-1.5">
              {t("teacher.sessions.topic")}{" "}
              <span className="text-[#BEB29E] dark:text-[#888888] font-normal">
                ({t("teacher.sessions.optional")})
              </span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("teacher.sessions.topicPlaceholder")}
              className="w-full h-11 px-4 bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] placeholder:text-[#BEB29E] dark:text-[#888888] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#D8CDC0]/2 dark:border-[#2A2A2A]5 dark:border-[#2A2A2A]/70 bg-[#FAFAF8]/50 dark:bg-[#1A1A1A]/50">
          <button
            onClick={onClose}
            className="h-10 px-5 text-sm font-medium text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:hover:bg-[#222222] rounded-xl transition-colors"
          >
            {t("teacher.sessions.cancel")}
          </button>
          <button
            onClick={submit}
            disabled={
              busy ||
              (!isEdit && (!groupId || !date)) ||
              (isEdit && !date) ||
              !endValid
            }
            className="h-10 px-6 text-sm font-medium text-white bg-[#2B6F5E] dark:bg-[#4ADE80] hover:bg-[#2B6F5E]/9 dark:bg-[#4ADE80]/90 dark:hover:bg-[#4ADE80]/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
          >
            {busy ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isEdit
              ? t("teacher.sessions.saveChanges")
              : t("teacher.sessions.createBtn")}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══ DELETE MODAL ═══ */
const DeleteConfirmModal = ({
  sessionId,
  onClose,
}: {
  sessionId: string;
  onClose: () => void;
}) => {
  const { t, dir } = useLanguage();
  const del = useDeleteSession();
  const handleDel = async () => {
    await del.mutateAsync(sessionId);
    onClose();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir={dir}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
            {t("teacher.sessions.deleteSession")}
          </h3>
          <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
            {t("teacher.sessions.deleteConfirm")}
          </p>
        </div>
        <div className="flex items-center gap-2 px-5 py-4 border-t border-[#D8CDC0]/2 dark:border-[#2A2A2A]5 dark:border-[#2A2A2A]/70 bg-[#FAFAF8]/50 dark:bg-[#1A1A1A]/50">
          <button
            onClick={onClose}
            className="flex-1 h-10 text-sm font-medium text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:hover:bg-[#222222] rounded-xl transition-colors"
          >
            {t("teacher.sessions.cancel")}
          </button>
          <button
            onClick={handleDel}
            disabled={del.isPending}
            className="flex-1 h-10 text-sm font-medium text-white bg-red-50 dark:bg-red-950/200 hover:bg-red-600 disabled:opacity-40 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {del.isPending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {t("teacher.sessions.delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══ SESSION CARD ═══ */
const SessionCard = ({
  session,
  onEdit,
  onDelete,
}: {
  session: SessionData;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { t, isRTL, currentLang } = useLanguage();
  const locale = getLocale(currentLang);
  const past = isPast(session.session_date),
    today = isToday(session.session_date),
    live = isLive(session);
  const hasAtt = session.attendance_taken > 0,
    complete = session.attendance_complete;
  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  const dur = (() => {
    if (!session.end_time) return null;
    const d =
      new Date(session.end_time).getTime() -
      new Date(session.session_date).getTime();
    if (d <= 0) return null;
    const m = Math.round(d / 60000),
      h = Math.floor(m / 60),
      mm = m % 60;
    return h === 0
      ? `${mm}${t("teacher.sessions.minShort")}`
      : mm === 0
        ? `${h}${t("teacher.sessions.hrShort")}`
        : `${h}${t("teacher.sessions.hrShort")} ${mm}${t("teacher.sessions.minShort")}`;
  })();

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#1A1A1A] border transition-all group/sess ${live ? "border-[#2B6F5E]/30 dark:border-[#4ADE80]/30 ring-1 ring-[#2B6F5E] dark:ring-[#4ADE80]/10 shadow-sm" : "border-[#D8CDC0]/30 dark:border-[#2A2A2A] hover:border-[#D8CDC0]/50 dark:border-[#2A2A2A] hover:shadow-md"}`}
    >
      <div
        className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 ${live ? "bg-[#2B6F5E]/12 dark:bg-[#4ADE80]/12 ring-2 ring-[#2B6F5E] dark:ring-[#4ADE80]/25" : today ? "bg-[#C4A035]/10 dark:bg-[#C4A035]/10 ring-2 ring-[#C4A035] dark:ring-[#C4A035]/30" : past ? "bg-[#D8CDC0]/12 dark:bg-[#2A2A2A]/12" : "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8"}`}
      >
        <span
          className={`text-[11px] font-medium leading-tight ${live ? "text-[#2B6F5E] dark:text-[#4ADE80]" : today ? "text-[#C4A035] dark:text-[#C4A035]" : past ? "text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50" : "text-[#2B6F5E]/70 dark:text-[#4ADE80]/70"}`}
        >
          {new Date(session.session_date).toLocaleDateString(locale, {
            weekday: "short",
          })}
        </span>
        <span
          className={`text-lg font-bold leading-tight ${live ? "text-[#2B6F5E] dark:text-[#4ADE80]" : today ? "text-[#C4A035] dark:text-[#C4A035]" : past ? "text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70" : "text-[#2B6F5E] dark:text-[#4ADE80]"}`}
        >
          {new Date(session.session_date).getDate()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
            {session.group.course.course_name}
          </h3>
          {live && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#2B6F5E] dark:bg-[#4ADE80] px-2 py-0.5 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white dark:bg-[#1A1A1A] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white dark:bg-[#1A1A1A]" />
              </span>
              {t("teacher.sessions.live")}
            </span>
          )}
          {today && !live && (
            <span className="text-[10px] font-bold text-[#C4A035] dark:text-[#C4A035] dark:text-[#C4A035] bg-[#C4A035]/1 dark:bg-[#C4A035]/10 dark:bg-[#C4A035]/15 dark:bg-[#C4A035]/15 px-2 py-0.5 rounded-full">
              {t("teacher.sessions.today")}
            </span>
          )}
          {dur && (
            <span className="text-[9px] font-semibold text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 px-1.5 py-0.5 rounded">
              {dur}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] flex-wrap">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {session.group.name}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {fmtTime(session.session_date)}
            {session.end_time && (
              <span className="text-[#6B5D4F]/40 dark:text-[#AAAAAA]/40">
                {" "}
                {isRTL ? "←" : "→"} {fmtTime(session.end_time)}
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
      <div className="shrink-0">
        {hasAtt ? (
          <Link
            to="/teacher/sessions"
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full transition-colors ${complete ? "text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 hover:bg-[#2B6F5E]/1 dark:hover:bg-[#4ADE80]/15 dark:bg-[#4ADE80]/15" : "text-[#C4A035] dark:text-[#C4A035] bg-[#C4A035]/8 dark:bg-[#C4A035]/10 dark:bg-[#C4A035]/10 hover:bg-[#C4A035]/15 dark:bg-[#C4A035]/15"}`}
          >
            <UserCheck className="w-3 h-3" />
            {session.attendance_taken}/{session.enrolled_students}
          </Link>
        ) : past ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 dark:text-red-400/80 bg-red-50 dark:bg-red-950/200/8 px-2.5 py-1.5 rounded-full">
            <UserX className="w-3 h-3" />
            {t("teacher.sessions.notRecorded")}
          </span>
        ) : live ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/10 dark:bg-[#4ADE80]/10 px-2.5 py-1.5 rounded-full">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2B6F5E] dark:bg-[#4ADE80] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2B6F5E] dark:bg-[#4ADE80]" />
            </span>
            {t("teacher.sessions.live")}
          </span>
        ) : (
          <span className="text-[11px] text-[#BEB29E] dark:text-[#888888] bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/10 dark:bg-[#2A2A2A]/15 px-2.5 py-1.5 rounded-full">
            {t("teacher.sessions.upcoming")}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover/sess:opacity-100 transition-opacity shrink-0">
        <button
          onClick={onEdit}
          className="w-8 h-8 rounded-lg hover:bg-[#2B6F5E]/8 dark:hover:bg-[#4ADE80]/8 flex items-center justify-center transition-colors"
          title={t("teacher.sessions.edit")}
        >
          <Pencil className="w-3.5 h-3.5 text-[#2B6F5E] dark:text-[#4ADE80]" />
        </button>
        {!hasAtt && (
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg hover:bg-red-50 dark:bg-red-950/20 flex items-center justify-center transition-colors"
            title={t("teacher.sessions.delete")}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function TeacherSessions() {
  const { t, dir, isRTL, currentLang } = useLanguage();
  const locale = getLocale(currentLang);
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editSession, setEditSession] = useState<SessionData | null>(null);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

  const qGroupId = groupFilter === "all" ? undefined : groupFilter;
  const { data: sessions, isLoading, isError } = useTeacherSessions(qGroupId);
  const { data: groupsData } = useTeacherGroups();
  const groups: GroupOption[] = groupsData ?? [];
  const allSessions: SessionData[] = sessions ?? [];

  const stats = useMemo(
    () => ({
      total: allSessions.length,
      todayCount: allSessions.filter((s) => isToday(s.session_date)).length,
      withAttendance: allSessions.filter((s) => s.attendance_taken > 0).length,
      upcoming: allSessions.filter((s) => !isPast(s.session_date)).length,
    }),
    [allSessions],
  );

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

  if (isLoading) return <SessionsSkeleton rtl={isRTL} />;

  if (isError)
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
          {t("teacher.sessions.errorTitle")}
        </h3>
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {t("teacher.sessions.errorDesc")}
        </p>
      </div>
    );

  const PILL_COLORS = {
    teal: {
      bg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8",
      icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
      val: "text-[#2B6F5E] dark:text-[#4ADE80]",
    },
    gold: {
      bg: "bg-[#C4A035]/8 dark:bg-[#C4A035]/8",
      icon: "text-[#C4A035] dark:text-[#C4A035]",
      val: "text-[#C4A035] dark:text-[#C4A035]",
    },
    green: {
      bg: "bg-[#8DB896]/12 dark:bg-[#4ADE80]/12",
      icon: "text-[#3D7A4A] dark:text-[#4ADE80]",
      val: "text-[#3D7A4A] dark:text-[#4ADE80]",
    },
    beige: {
      bg: "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20",
      icon: "text-[#6B5D4F] dark:text-[#AAAAAA]",
      val: "text-[#6B5D4F] dark:text-[#AAAAAA]",
    },
  };

  return (
    <div dir={dir} className="space-y-6 pb-8">
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

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("teacher.sessions.title")}
          </h1>
          <p className="text-sm text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] mt-0.5">
            {t("teacher.sessions.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-10 px-5 text-sm font-medium text-white bg-[#2B6F5E] dark:bg-[#4ADE80] hover:bg-[#2B6F5E]/9 dark:bg-[#4ADE80]/90 dark:hover:bg-[#4ADE80]/90 rounded-xl transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t("teacher.sessions.newSession")}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: t("teacher.sessions.totalSessions"),
            value: stats.total,
            icon: CalendarDays,
            color: "teal" as const,
          },
          {
            label: t("teacher.sessions.todaySessions"),
            value: stats.todayCount,
            icon: Clock,
            color: "gold" as const,
          },
          {
            label: t("teacher.sessions.attendanceRecorded"),
            value: stats.withAttendance,
            icon: ClipboardCheck,
            color: "green" as const,
          },
          {
            label: t("teacher.sessions.upcoming"),
            value: stats.upcoming,
            icon: Users,
            color: "beige" as const,
          },
        ].map((stat) => {
          const c = PILL_COLORS[stat.color];
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] px-4 py-3 flex items-center gap-3"
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
                <p className="text-[11px] text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] truncate">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
          />
          <input
            type="text"
            placeholder={t("teacher.sessions.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full h-11 ${isRTL ? "pr-10 pl-9" : "pl-10 pr-9"} bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] placeholder:text-[#BEB29E] dark:text-[#888888] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10 transition-all`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 hover:bg-[#D8CDC0]/5 dark:hover:bg-[#222222]0 dark:bg-[#2A2A2A]/50 flex items-center justify-center transition-colors`}
            >
              <X className="w-3 h-3 text-[#6B5D4F] dark:text-[#AAAAAA]" />
            </button>
          )}
        </div>
        <div className="relative shrink-0">
          <Filter
            className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
          />
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className={`h-11 ${isRTL ? "pr-10 pl-8" : "pl-10 pr-8"} bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10 appearance-none cursor-pointer transition-all min-w-[160px]`}
          >
            <option value="all">{t("teacher.sessions.allGroups")}</option>
            {groups.map((g) => (
              <option key={g.group_id} value={g.group_id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasFilters && (
        <div className="flex items-center justify-between bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border border-[#2B6F5E]/1 dark:border-[#4ADE80]/10 dark:border-[#4ADE80]/10 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
              {t("teacher.sessions.results")}:
            </span>
            <span className="font-semibold text-[#2B6F5E] dark:text-[#4ADE80]">
              {filtered.length}
            </span>
          </div>
          <button
            onClick={() => {
              setSearch("");
              setGroupFilter("all");
            }}
            className="text-xs font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:text-[#2B6F5E] dark:hover:text-[#4ADE80]/70 dark:text-[#4ADE80]/70 flex items-center gap-1 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            {t("teacher.sessions.clear")}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center mb-4">
            <CalendarDays className="w-7 h-7 text-[#BEB29E] dark:text-[#888888]" />
          </div>
          <h3 className="text-base font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
            {allSessions.length === 0
              ? t("teacher.sessions.noSessions")
              : t("teacher.sessions.noResults")}
          </h3>
          <p className="text-sm text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] max-w-xs">
            {allSessions.length === 0
              ? t("teacher.sessions.noSessionsDesc")
              : t("teacher.sessions.noResultsDesc")}
          </p>
          {allSessions.length === 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 h-10 px-5 text-sm font-medium text-white bg-[#2B6F5E] dark:bg-[#4ADE80] hover:bg-[#2B6F5E]/9 dark:bg-[#4ADE80]/90 dark:hover:bg-[#4ADE80]/90 rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("teacher.sessions.createBtn")}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([dateKey, dateSessions]) => {
            const isTodayG = isToday(dateKey + "T12:00:00"),
              hasLive = dateSessions.some(isLive);
            const label = isTodayG
              ? t("teacher.sessions.today")
              : new Date(dateKey).toLocaleDateString(locale, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                });
            return (
              <Fragment key={dateKey}>
                <div className="flex items-center gap-3">
                  <div
                    className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${hasLive ? "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]" : isTodayG ? "bg-[#C4A035]/10 dark:bg-[#C4A035]/10 text-[#C4A035] dark:text-[#C4A035]" : "bg-[#D8CDC0]/15 dark:bg-[#2A2A2A]/15 text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60"}`}
                  >
                    {hasLive && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2B6F5E] dark:bg-[#4ADE80] opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2B6F5E] dark:bg-[#4ADE80]" />
                      </span>
                    )}
                    {label}
                  </div>
                  <div className="flex-1 h-px bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20" />
                  <span className="text-[11px] text-[#BEB29E] dark:text-[#888888]">
                    {dateSessions.length}{" "}
                    {dateSessions.length === 1
                      ? t("teacher.sessions.sessionSingular")
                      : t("teacher.sessions.sessionPlural")}
                  </span>
                </div>
                <div className="space-y-2">
                  {dateSessions.map((s) => (
                    <SessionCard
                      key={s.session_id}
                      session={s}
                      onEdit={() => setEditSession(s)}
                      onDelete={() => setDeleteSessionId(s.session_id)}
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
