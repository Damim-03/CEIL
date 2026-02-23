import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  AlertCircle,
  UserCheck,
  DoorOpen,
  DoorClosed,
  MapPin,
  Users,
  Timer,
} from "lucide-react";
import {
  useTeacherSchedule,
  useTeacherRoomsOverview,
} from "../../../../hooks/teacher/Useteacher";
import { useLanguage } from "../../../../hooks/useLanguage";

/* ═══ TYPES ═══ */
interface ScheduleSession {
  session_id: string;
  session_date: string;
  end_time: string | null;
  topic: string | null;
  group: {
    group_id: string;
    name: string;
    level: string;
    course: { course_id: string; course_name: string; course_code: string };
  };
  room?: { room_id: string; name: string } | null;
  _count: { attendance: number };
  enrolled_students: number;
  attendance_taken: number;
  attendance_complete: boolean;
}
interface RoomSession {
  session_id: string;
  session_date: string;
  end_time: string | null;
  topic: string | null;
  group_name: string;
  course_name: string;
  course_code: string;
  teacher_name: string | null;
  is_mine: boolean;
}
interface RoomOverview {
  room_id: string;
  name: string;
  capacity: number;
  location: string | null;
  sessions_count: number;
  sessions: RoomSession[];
  is_occupied: boolean;
}
interface RoomsData {
  date: string;
  total_rooms: number;
  occupied_now: number;
  free_now: number;
  rooms: RoomOverview[];
}
type ViewMode = "week" | "day" | "rooms";

/* ═══ HELPERS ═══ */
const getLocale = (lang: string) =>
  lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US";
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const isToday = (d: Date) => sameDay(d, new Date());
const toDateStr = (d: Date) => d.toISOString().split("T")[0];

const useLiveClock = (ms = 30_000) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
};
const isLiveAt = (
  s: { session_date: string; end_time: string | null },
  now: Date,
) => {
  const st = new Date(s.session_date);
  const en = s.end_time
    ? new Date(s.end_time)
    : new Date(st.getTime() + 90 * 60000);
  return now >= st && now <= en;
};
const isLive = (s: { session_date: string; end_time: string | null }) =>
  isLiveAt(s, new Date());
const minsUntilFree = (
  s: { session_date: string; end_time: string | null },
  now: Date,
) => {
  const st = new Date(s.session_date);
  const en = s.end_time
    ? new Date(s.end_time)
    : new Date(st.getTime() + 90 * 60000);
  return Math.max(0, Math.round((en.getTime() - now.getTime()) / 60000));
};

const getWeekDays = (base: Date): Date[] => {
  const day = base.getDay(),
    diff = day >= 6 ? day - 6 : day + 1;
  const sat = new Date(base);
  sat.setDate(base.getDate() - diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sat);
    d.setDate(sat.getDate() + i);
    return d;
  });
};

const GC = [
  {
    bg: "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10",
    border: "border-[#2B6F5E]/25 dark:border-[#4ADE80]/25",
    text: "text-[#2B6F5E] dark:text-[#4ADE80]",
    accent: "bg-[#2B6F5E] dark:bg-[#4ADE80]",
  },
  {
    bg: "bg-[#C4A035]/10 dark:bg-[#C4A035]/10",
    border: "border-[#C4A035]/25 dark:border-[#C4A035]/25",
    text: "text-[#C4A035] dark:text-[#C4A035]",
    accent: "bg-[#C4A035]",
  },
  {
    bg: "bg-[#8DB896]/12 dark:bg-[#4ADE80]/12",
    border: "border-[#8DB896]/30",
    text: "text-[#3D7A4A] dark:text-[#4ADE80]",
    accent: "bg-[#8DB896]",
  },
  {
    bg: "bg-purple-500/8",
    border: "border-purple-500/20",
    text: "text-purple-600",
    accent: "bg-purple-500",
  },
  {
    bg: "bg-blue-50 dark:bg-blue-950/200/8",
    border: "border-blue-500/20",
    text: "text-blue-600",
    accent: "bg-blue-50 dark:bg-blue-950/200",
  },
  {
    bg: "bg-rose-500/8",
    border: "border-rose-500/20",
    text: "text-rose-600",
    accent: "bg-rose-500",
  },
];

const LiveDot = ({
  size = "h-2 w-2",
  color = "bg-[#2B6F5E] dark:bg-[#4ADE80]",
}: {
  size?: string;
  color?: string;
}) => (
  <span className={`relative flex ${size}`}>
    <span
      className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}
    />
    <span className={`relative inline-flex rounded-full ${size} ${color}`} />
  </span>
);

/* ═══ FORMATTERS HOOK ═══ */
const useFormatters = () => {
  const { t, currentLang } = useLanguage();
  const locale = getLocale(currentLang);
  const fT = (d: string) =>
    new Date(d).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  const fWS = (d: Date) => d.toLocaleDateString(locale, { weekday: "short" });
  const fWL = (d: Date) => d.toLocaleDateString(locale, { weekday: "long" });
  const fML = (d: Date) => d.toLocaleDateString(locale, { month: "long" });
  const fMS = (d: Date) => d.toLocaleDateString(locale, { month: "short" });
  const formatMins = (m: number) => {
    if (m <= 0) return null;
    const h = Math.floor(m / 60),
      r = m % 60;
    if (h === 0) return `${r}${t("teacher.schedule.minUnit")}`;
    if (r === 0) return `${h}${t("teacher.schedule.hrUnit")}`;
    return `${h}${t("teacher.schedule.hrUnit")} ${r}${t("teacher.schedule.minUnit")}`;
  };
  return { fT, fWS, fWL, fML, fMS, formatMins, locale };
};

/* ═══ SKELETON ═══ */
const Skel = ({ rtl }: { rtl: boolean }) => (
  <div className="space-y-6 animate-pulse" dir={rtl ? "rtl" : "ltr"}>
    <div className="flex items-center justify-between">
      <div>
        <div className="h-7 w-40 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded-lg" />
        <div className="h-4 w-52 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded-lg mt-2" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 w-20 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded-xl" />
        <div className="h-10 w-20 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded-xl" />
      </div>
    </div>
    <div className="h-12 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A]" />
    <div className="grid grid-cols-7 gap-2">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[180px]"
        />
      ))}
    </div>
  </div>
);

/* ═══ SESSION CHIP ═══ */
const SessionChip = ({
  session,
  colorIdx,
  compact,
}: {
  session: ScheduleSession;
  colorIdx: number;
  compact: boolean;
}) => {
  const { t } = useLanguage();
  const { fT } = useFormatters();
  const c = GC[colorIdx % GC.length],
    has = session.attendance_taken > 0,
    live = isLive(session);
  const arrow = "←";
  if (compact)
    return (
      <Link
        to={`/teacher/groups/${session.group.group_id}`}
        className={`block p-2 rounded-lg ${c.bg} border ${c.border} hover:shadow-sm transition-all relative ${live ? "ring-1 ring-[#2B6F5E] dark:ring-[#4ADE80]/30" : ""}`}
      >
        {live && (
          <div className="absolute top-1 left-1">
            <LiveDot size="h-1.5 w-1.5" />
          </div>
        )}
        <div className="flex items-center gap-1.5 mb-0.5">
          <div className={`w-1.5 h-1.5 rounded-full ${c.accent} shrink-0`} />
          <span className={`text-[10px] font-bold ${c.text} truncate`}>
            {fT(session.session_date)}
            {session.end_time && (
              <span className="opacity-50">
                {" "}
                {arrow} {fT(session.end_time)}
              </span>
            )}
          </span>
        </div>
        <p className="text-[10px] text-[#1B1B1B] dark:text-[#E5E5E5] font-medium truncate leading-tight">
          {session.group.course.course_name}
        </p>
        <p className="text-[9px] text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] truncate">
          {session.group.name}
        </p>
        {session.room && (
          <p className="text-[8px] text-[#6B5D4F]/4 dark:text-[#AAAAAA]/40 dark:text-[#666666] truncate flex items-center gap-0.5 mt-0.5">
            <DoorOpen className="w-2.5 h-2.5 shrink-0" />
            {session.room.name}
          </p>
        )}
      </Link>
    );
  return (
    <Link
      to={`/teacher/groups/${session.group.group_id}`}
      className={`block p-3.5 rounded-xl ${c.bg} border ${c.border} hover:shadow-md transition-all relative ${live ? "ring-2 ring-[#2B6F5E] dark:ring-[#4ADE80]/25" : ""}`}
    >
      {live && (
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <LiveDot />
          <span className="text-[9px] font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
            {t("teacher.schedule.ongoing")}
          </span>
        </div>
      )}
      <div
        className={`flex items-center justify-between mb-2 ${live ? "mt-4" : ""}`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${c.accent}`} />
          <span className={`text-xs font-bold ${c.text}`}>
            {fT(session.session_date)}
            {session.end_time && (
              <span className="opacity-50">
                {" "}
                {arrow} {fT(session.end_time)}
              </span>
            )}
          </span>
        </div>
        {has && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/10 dark:bg-[#4ADE80]/10 px-1.5 py-0.5 rounded">
            <UserCheck className="w-2.5 h-2.5" />
            {session.attendance_taken}
          </span>
        )}
      </div>
      <h4 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
        {session.group.course.course_name}
      </h4>
      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] flex-wrap">
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3" />
          {session.group.name}
        </span>
        {session.group.level && (
          <span className="text-[#BEB29E] dark:text-[#888888]">
            · {session.group.level}
          </span>
        )}
        {session.room && (
          <span className="flex items-center gap-1">
            <DoorOpen className="w-3 h-3" />
            {session.room.name}
          </span>
        )}
      </div>
      {session.topic && (
        <p className="text-[10px] text-[#6B5D4F]/4 dark:text-[#AAAAAA]/40 dark:text-[#666666] mt-1.5 truncate">
          {session.topic}
        </p>
      )}
    </Link>
  );
};

/* ═══ DAY COLUMN ═══ */
const DayColumn = ({
  date,
  sessions,
  gcm,
}: {
  date: Date;
  sessions: ScheduleSession[];
  gcm: Map<string, number>;
}) => {
  const { fWS } = useFormatters();
  const today = isToday(date),
    ds = sessions.filter((s) => sameDay(new Date(s.session_date), date)),
    hasLive = ds.some(isLive);
  return (
    <div
      className={`flex flex-col rounded-xl border transition-all min-h-[200px] ${hasLive ? "border-[#2B6F5E]/40 dark:border-[#4ADE80]/40 bg-[#2B6F5E]/[0.03] shadow-sm" : today ? "border-[#2B6F5E]/30 dark:border-[#4ADE80]/30 bg-[#2B6F5E]/[0.02] shadow-sm" : "border-[#D8CDC0]/30 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A]"}`}
    >
      <div
        className={`px-2.5 py-2 border-b text-center ${hasLive ? "border-[#2B6F5E]/20 dark:border-[#4ADE80]/20" : today ? "border-[#2B6F5E]/15 dark:border-[#4ADE80]/15" : "border-[#D8CDC0]/20 dark:border-[#2A2A2A]"}`}
      >
        <p
          className={`text-[10px] font-medium ${today || hasLive ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50"}`}
        >
          {fWS(date)}
        </p>
        <p
          className={`text-lg font-bold leading-tight ${today || hasLive ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
        >
          {date.getDate()}
        </p>
        {hasLive ? (
          <div className="flex justify-center mt-0.5">
            <LiveDot size="h-1.5 w-1.5" />
          </div>
        ) : today ? (
          <div className="w-1.5 h-1.5 rounded-full bg-[#2B6F5E] dark:bg-[#4ADE80] mx-auto mt-0.5" />
        ) : null}
      </div>
      <div className="flex-1 p-1.5 space-y-1.5">
        {ds.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[60px]">
            <span className="text-[10px] text-[#BEB29E] dark:text-[#888888]">
              —
            </span>
          </div>
        ) : (
          ds
            .sort(
              (a, b) =>
                new Date(a.session_date).getTime() -
                new Date(b.session_date).getTime(),
            )
            .map((s) => (
              <SessionChip
                key={s.session_id}
                session={s}
                colorIdx={gcm.get(s.group.group_id) ?? 0}
                compact
              />
            ))
        )}
      </div>
    </div>
  );
};

/* ═══ DAY VIEW ═══ */
const DayView = ({
  date,
  sessions,
  gcm,
}: {
  date: Date;
  sessions: ScheduleSession[];
  gcm: Map<string, number>;
}) => {
  const { t } = useLanguage();
  const { fWS, fWL, locale } = useFormatters();
  const ds = sessions
    .filter((s) => sameDay(new Date(s.session_date), date))
    .sort(
      (a, b) =>
        new Date(a.session_date).getTime() - new Date(b.session_date).getTime(),
    );
  const lc = ds.filter(isLive).length;
  const fDate = date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/3 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/80 px-5 py-3">
        <div
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${isToday(date) ? "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10" : "bg-[#D8CDC0]/10 dark:bg-[#2A2A2A]/10"}`}
        >
          <span
            className={`text-[10px] font-medium ${isToday(date) ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50"}`}
          >
            {fWS(date)}
          </span>
          <span
            className={`text-lg font-bold leading-tight ${isToday(date) ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
          >
            {date.getDate()}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {fWL(date)}
          </p>
          <p className="text-[11px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
            {fDate}
          </p>
        </div>
        <div className="ms-auto flex items-center gap-2">
          {lc > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/10 dark:bg-[#4ADE80]/10 px-2.5 py-1 rounded-full">
              <LiveDot size="h-1.5 w-1.5" />
              {lc} {t("teacher.schedule.ongoing")}
            </span>
          )}
          <span className="text-xs font-bold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 px-2.5 py-1 rounded-full">
            {ds.length}{" "}
            {ds.length === 1
              ? t("teacher.schedule.sessionSingular")
              : t("teacher.schedule.sessionPlural")}
          </span>
        </div>
      </div>
      {ds.length === 0 ? (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center mb-3">
            <CalendarDays className="w-6 h-6 text-[#BEB29E] dark:text-[#888888]" />
          </div>
          <p className="text-sm text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
            {t("teacher.schedule.noSessionsDay")}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {ds.map((s) => (
            <SessionChip
              key={s.session_id}
              session={s}
              colorIdx={gcm.get(s.group.group_id) ?? 0}
              compact={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══ ROOMS VIEW ═══ */
const RoomCard = ({ room, now }: { room: RoomOverview; now: Date }) => {
  const { t } = useLanguage();
  const { fT, formatMins } = useFormatters();
  const active = room.sessions.find((s) => isLiveAt(s, now));
  const occ = !!active;
  const remain = active ? formatMins(minsUntilFree(active, now)) : null;
  const next = room.sessions.find((s) => new Date(s.session_date) > now);
  const minsNext = next
    ? Math.round(
        (new Date(next.session_date).getTime() - now.getTime()) / 60000,
      )
    : null;

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all hover:shadow-md ${occ ? "border-[#C4A035]/30 dark:border-[#C4A035]/30 bg-white dark:bg-[#1A1A1A]" : "border-[#2B6F5E]/20 dark:border-[#4ADE80]/20 bg-white dark:bg-[#1A1A1A]"}`}
    >
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${occ ? "border-[#C4A035]/15 dark:border-[#C4A035]/15 bg-[#C4A035]/5 dark:bg-[#C4A035]/5" : "border-[#2B6F5E]/10 dark:border-[#4ADE80]/10 bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5"}`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${occ ? "bg-[#C4A035]/15 dark:bg-[#C4A035]/15" : "bg-[#2B6F5E]/15 dark:bg-[#4ADE80]/15"}`}
          >
            {occ ? (
              <DoorClosed className="w-4 h-4 text-[#C4A035] dark:text-[#C4A035]" />
            ) : (
              <DoorOpen className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {room.name}
            </h4>
            <div className="flex items-center gap-2 text-[10px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
              {room.location && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {room.location}
                </span>
              )}
              <span className="flex items-center gap-0.5">
                <Users className="w-2.5 h-2.5" />
                {room.capacity} {t("teacher.schedule.seat")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {occ ? (
            <div className="flex items-center gap-1.5">
              <LiveDot size="h-2 w-2" color="bg-[#C4A035]" />
              <span className="text-[10px] font-bold text-[#C4A035] dark:text-[#C4A035]">
                {t("teacher.schedule.occupied")}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/10 dark:bg-[#4ADE80]/10 px-2 py-0.5 rounded-full">
              {t("teacher.schedule.free")}
            </span>
          )}
          {occ && remain && (
            <span className="flex items-center gap-1 text-[9px] text-[#C4A035]/70 dark:text-[#C4A035]/70">
              <Timer className="w-2.5 h-2.5" />
              {t("teacher.schedule.freeIn", { time: remain })}
            </span>
          )}
          {!occ && minsNext !== null && minsNext > 0 && minsNext <= 30 && (
            <span className="text-[9px] text-[#C4A035]/70 dark:text-[#C4A035]/70">
              ⚠ {t("teacher.schedule.bookedIn", { mins: minsNext })}
            </span>
          )}
        </div>
      </div>
      <div className="p-3">
        {room.sessions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-[#2B6F5E]/6 dark:text-[#4ADE80]/60 dark:text-[#4ADE80]/60 flex items-center justify-center gap-1.5">
              <DoorOpen className="w-3.5 h-3.5" />
              {t("teacher.schedule.availableAllDay")}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {room.sessions.map((s) => {
              const live = isLiveAt(s, now);
              const past =
                new Date(
                  s.end_time || new Date(s.session_date).getTime() + 90 * 60000,
                ) < now;
              return (
                <div
                  key={s.session_id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${live ? "bg-[#C4A035]/8 dark:bg-[#C4A035]/8 border border-[#C4A035]/15 dark:border-[#C4A035]/15" : past ? "bg-[#D8CDC0]/5 dark:bg-[#2A2A2A]/5 border border-transparent opacity-50" : s.is_mine ? "bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border border-[#2B6F5E]/10 dark:border-[#4ADE80]/10" : "bg-[#D8CDC0]/8 dark:bg-[#2A2A2A]/8 border border-transparent"}`}
                >
                  <div className="shrink-0 text-center w-16">
                    <p
                      className={`text-[11px] font-bold ${live ? "text-[#C4A035] dark:text-[#C4A035]" : past ? "text-[#BEB29E] dark:text-[#888888] line-through" : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
                    >
                      {fT(s.session_date)}
                    </p>
                    {s.end_time && (
                      <p
                        className={`text-[9px] ${past ? "text-[#BEB29E] dark:text-[#888888]" : "text-[#6B5D4F]/40 dark:text-[#AAAAAA]/40"}`}
                      >
                        ← {fT(s.end_time)}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-0.5 h-8 rounded-full shrink-0 ${live ? "bg-[#C4A035]" : past ? "bg-[#D8CDC0]" : s.is_mine ? "bg-[#2B6F5E] dark:bg-[#4ADE80]" : "bg-[#D8CDC0]"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={`text-xs font-medium truncate ${past ? "text-[#BEB29E] dark:text-[#888888]" : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
                      >
                        {s.course_name}
                      </p>
                      {live && (
                        <span className="text-[8px] font-bold text-white bg-[#C4A035] dark:bg-[#C4A035] px-1.5 py-0.5 rounded-full shrink-0">
                          {t("teacher.schedule.now")}
                        </span>
                      )}
                      {past && (
                        <span className="text-[8px] font-medium text-[#BEB29E] dark:text-[#888888] bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 px-1 py-0.5 rounded shrink-0">
                          {t("teacher.schedule.ended")}
                        </span>
                      )}
                      {s.is_mine && !live && !past && (
                        <span className="text-[8px] font-bold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/10 dark:bg-[#4ADE80]/10 px-1 py-0.5 rounded shrink-0">
                          {t("teacher.schedule.mySession")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] mt-0.5">
                      <span>{s.group_name}</span>
                      {s.teacher_name && (
                        <>
                          <span className="text-[#BEB29E] dark:text-[#888888]">
                            ·
                          </span>
                          <span>{s.teacher_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const RoomsView = ({ date }: { date: Date }) => {
  const { t } = useLanguage();
  const { locale } = useFormatters();
  const dateStr = toDateStr(date);
  const { data, isLoading } = useTeacherRoomsOverview(dateStr);
  const now = useLiveClock(30_000);
  const [filter, setFilter] = useState<"all" | "free" | "occupied">("all");

  const rd = useMemo(() => {
    if (!data) return null;
    const d = data as RoomsData;
    const rooms = d.rooms.map((r) => ({
      ...r,
      is_occupied: r.sessions.some((s) => isLiveAt(s, now)),
    }));
    return {
      ...d,
      rooms,
      occupied_now: rooms.filter((r) => r.is_occupied).length,
      free_now: rooms.filter((r) => !r.is_occupied).length,
    };
  }, [data, now]);

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[180px]"
          />
        ))}
      </div>
    );
  if (!rd) return null;

  const filtered = rd.rooms.filter((r) =>
    filter === "free"
      ? !r.is_occupied
      : filter === "occupied"
        ? r.is_occupied
        : true,
  );
  const sorted = [...filtered].sort((a, b) =>
    a.is_occupied === b.is_occupied
      ? a.name.localeCompare(b.name)
      : a.is_occupied
        ? 1
        : -1,
  );
  const filters = [
    { key: "all" as const, label: t("teacher.schedule.filterAll") },
    { key: "free" as const, label: t("teacher.schedule.free") },
    { key: "occupied" as const, label: t("teacher.schedule.occupied") },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/3 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/80 px-4 py-3 flex-wrap">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#2B6F5E] dark:bg-[#4ADE80]" />
            <span className="text-xs text-[#6B5D4F] dark:text-[#AAAAAA]">
              <span className="font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
                {rd.free_now}
              </span>{" "}
              {t("teacher.schedule.free")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#C4A035]" />
            <span className="text-xs text-[#6B5D4F] dark:text-[#AAAAAA]">
              <span className="font-bold text-[#C4A035] dark:text-[#C4A035]">
                {rd.occupied_now}
              </span>{" "}
              {t("teacher.schedule.occupied")}
            </span>
          </div>
          <span className="text-xs text-[#BEB29E] dark:text-[#888888]">
            {t("teacher.schedule.outOf", { total: rd.total_rooms })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/10 dark:bg-[#2A2A2A]/15 px-2.5 py-1 rounded-lg">
            <LiveDot
              size="h-1.5 w-1.5"
              color="bg-[#2B6F5E] dark:bg-[#4ADE80]"
            />
            <span className="tabular-nums font-medium">
              {now.toLocaleTimeString(locale, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/10 dark:bg-[#2A2A2A]/15 p-0.5 rounded-lg">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`h-7 px-3 text-[10px] font-medium rounded-md transition-all ${filter === f.key ? "bg-white dark:bg-[#1A1A1A] text-[#2B6F5E] dark:text-[#4ADE80] shadow-sm" : "text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50 hover:text-[#6B5D4F] dark:text-[#AAAAAA]"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="h-2 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-l from-[#C4A035] dark:from-[#C4A035] to-[#C4A035] dark:to-[#C4A035]/70 rounded-full transition-all duration-500"
          style={{
            width: `${rd.total_rooms > 0 ? (rd.occupied_now / rd.total_rooms) * 100 : 0}%`,
          }}
        />
      </div>
      {sorted.length === 0 ? (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center mb-3">
            <DoorOpen className="w-6 h-6 text-[#BEB29E] dark:text-[#888888]" />
          </div>
          <p className="text-sm text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
            {filter === "free"
              ? t("teacher.schedule.noFreeRooms")
              : filter === "occupied"
                ? t("teacher.schedule.noOccupiedRooms")
                : t("teacher.schedule.noRooms")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {sorted.map((r) => (
            <RoomCard key={r.room_id} room={r} now={now} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══ MAIN ═══ */
export default function TeacherSchedule() {
  const { t, dir, isRTL, currentLang } = useLanguage();
  const { fWS, fWL, locale } = useFormatters();
  const { data, isLoading, isError } = useTeacherSchedule(60);
  const [vm, setVm] = useState<ViewMode>("week");
  const [cd, setCd] = useState(new Date());

  const sessions: ScheduleSession[] = Array.isArray(data)
    ? data
    : (data?.sessions ?? data?.schedule ?? []);
  const gcm = useMemo(() => {
    const m = new Map<string, number>();
    Array.from(new Set(sessions.map((s) => s.group.group_id))).forEach((g, i) =>
      m.set(g, i),
    );
    return m;
  }, [sessions]);
  const wd = useMemo(() => getWeekDays(cd), [cd]);
  const nav = (d: number) => {
    const n = new Date(cd);
    n.setDate(n.getDate() + d * (vm === "week" ? 7 : 1));
    setCd(n);
  };

  const hLabel = useMemo(() => {
    if (vm === "day" || vm === "rooms")
      return cd.toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    const s = wd[0],
      e = wd[6];
    return s.getMonth() === e.getMonth()
      ? `${s.getDate()} – ${e.getDate()} ${s.toLocaleDateString(locale, { month: "long" })} ${s.getFullYear()}`
      : `${s.getDate()} ${s.toLocaleDateString(locale, { month: "long" })} – ${e.getDate()} ${e.toLocaleDateString(locale, { month: "long" })} ${e.getFullYear()}`;
  }, [vm, cd, wd, locale]);

  const wStats = useMemo(() => {
    if (vm === "day" || vm === "rooms") {
      const d = sessions.filter((s) => sameDay(new Date(s.session_date), cd));
      return {
        total: d.length,
        groups: new Set(d.map((s) => s.group.group_id)).size,
      };
    }
    const s = wd[0],
      e = new Date(wd[6]);
    e.setHours(23, 59, 59);
    const w = sessions.filter((x) => {
      const d = new Date(x.session_date);
      return d >= s && d <= e;
    });
    return {
      total: w.length,
      groups: new Set(w.map((x) => x.group.group_id)).size,
    };
  }, [sessions, vm, cd, wd]);

  const gLeg = useMemo(() => {
    const m = new Map<string, { name: string; cn: string }>();
    sessions.forEach((s) => {
      if (!m.has(s.group.group_id))
        m.set(s.group.group_id, {
          name: s.group.name,
          cn: s.group.course.course_name,
        });
    });
    return Array.from(m.entries());
  }, [sessions]);

  const NavChevR = isRTL ? ChevronRight : ChevronLeft;
  const NavChevL = isRTL ? ChevronLeft : ChevronRight;

  if (isLoading) return <Skel rtl={isRTL} />;
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
          {t("teacher.schedule.errorTitle")}
        </h3>
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {t("teacher.schedule.errorDesc")}
        </p>
      </div>
    );

  return (
    <div dir={dir} className="space-y-5 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("teacher.schedule.title")}
          </h1>
          <p className="text-sm text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] mt-0.5">
            {t("teacher.schedule.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 p-1 rounded-xl self-start sm:self-auto">
          {[
            { k: "week" as const, l: t("teacher.schedule.week") },
            { k: "day" as const, l: t("teacher.schedule.day") },
            { k: "rooms" as const, l: t("teacher.schedule.rooms") },
          ].map((m) => (
            <button
              key={m.k}
              onClick={() => setVm(m.k)}
              className={`h-8 px-4 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${vm === m.k ? "bg-white dark:bg-[#1A1A1A] text-[#2B6F5E] dark:text-[#4ADE80] shadow-sm" : "text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60 hover:text-[#6B5D4F] dark:text-[#AAAAAA]"}`}
            >
              {m.k === "rooms" && <DoorOpen className="w-3.5 h-3.5" />}
              {m.l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => nav(1)}
            className="w-8 h-8 rounded-lg hover:bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:hover:bg-[#222222] flex items-center justify-center"
          >
            <NavChevR className="w-4 h-4 text-[#6B5D4F] dark:text-[#AAAAAA]" />
          </button>
          <button
            onClick={() => nav(-1)}
            className="w-8 h-8 rounded-lg hover:bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:hover:bg-[#222222] flex items-center justify-center"
          >
            <NavChevL className="w-4 h-4 text-[#6B5D4F] dark:text-[#AAAAAA]" />
          </button>
          <button
            onClick={() => setCd(new Date())}
            className="h-8 px-3 text-xs font-medium text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 hover:bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/15 dark:hover:bg-[#4ADE80]/15 rounded-lg"
          >
            {t("teacher.schedule.today")}
          </button>
        </div>
        <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
          {hLabel}
        </h2>
        <div className="flex items-center gap-3 text-[11px] text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
          {vm !== "rooms" ? (
            <>
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {wStats.total} {t("teacher.schedule.sessionUnit")}
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {wStats.groups} {t("teacher.schedule.groupUnit")}
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1">
              <DoorOpen className="w-3 h-3" />
              {t("teacher.schedule.roomSchedule")}
            </span>
          )}
        </div>
      </div>

      {vm !== "rooms" && gLeg.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {gLeg.map(([gid, info]) => {
            const i = gcm.get(gid) ?? 0,
              co = GC[i % GC.length];
            return (
              <div
                key={gid}
                className="flex items-center gap-1.5 shrink-0 text-[11px] text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/3 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/80 px-2.5 py-1.5 rounded-lg"
              >
                <div className={`w-2.5 h-2.5 rounded-sm ${co.accent}`} />
                <span className="font-medium">{info.name}</span>
                <span className="text-[#BEB29E] dark:text-[#888888]">·</span>
                <span className="text-[10px] text-[#BEB29E] dark:text-[#888888]">
                  {info.cn}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {vm === "week" && (
        <div className="grid grid-cols-7 gap-2">
          {wd.map((d) => (
            <DayColumn
              key={d.toISOString()}
              date={d}
              sessions={sessions}
              gcm={gcm}
            />
          ))}
        </div>
      )}
      {vm === "day" && <DayView date={cd} sessions={sessions} gcm={gcm} />}
      {vm === "rooms" && <RoomsView date={cd} />}

      {vm !== "rooms" && sessions.length > 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#D8CDC0]/25 dark:border-[#2A2A2A]">
            <div className="w-8 h-8 rounded-lg bg-[#C4A035]/8 dark:bg-[#C4A035]/10 dark:bg-[#C4A035]/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#C4A035] dark:text-[#C4A035]" />
            </div>
            <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {t("teacher.schedule.upcomingSessions")}
            </h3>
            <span className="text-[11px] text-[#BEB29E] dark:text-[#888888] ms-auto">
              {t("teacher.schedule.next10")}
            </span>
          </div>
          <div className="divide-y divide-[#D8CDC0] dark:divide-[#2A2A2A]/8">
            {sessions
              .filter((s) => new Date(s.session_date) >= new Date())
              .sort(
                (a, b) =>
                  new Date(a.session_date).getTime() -
                  new Date(b.session_date).getTime(),
              )
              .slice(0, 10)
              .map((session) => {
                const co =
                    GC[(gcm.get(session.group.group_id) ?? 0) % GC.length],
                  live = isLive(session);
                const sd = new Date(session.session_date);
                return (
                  <Link
                    key={session.session_id}
                    to={`/teacher/groups/${session.group.group_id}`}
                    className={`flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAF8] dark:hover:bg-[#222222] transition-colors ${live ? "bg-[#2B6F5E]/[0.02]" : ""}`}
                  >
                    <div
                      className={`w-1 h-8 rounded-full ${co.accent} shrink-0`}
                    />
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-[#D8CDC0]/8 dark:bg-[#2A2A2A]/10 shrink-0">
                      <span className="text-[9px] font-medium text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] leading-tight">
                        {fWS(sd)}
                      </span>
                      <span className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5] leading-tight">
                        {sd.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                          {session.group.course.course_name}
                        </p>
                        {live && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-white bg-[#2B6F5E] dark:bg-[#4ADE80] px-1.5 py-0.5 rounded-full shrink-0">
                            <LiveDot size="h-1 w-1" />
                            {t("teacher.schedule.ongoing")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] mt-0.5 flex-wrap">
                        <span>{session.group.name}</span>
                        <span className="text-[#BEB29E] dark:text-[#888888]">
                          ·
                        </span>
                        <span>
                          {new Date(session.session_date).toLocaleTimeString(
                            locale,
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                          {session.end_time && (
                            <span className="text-[#BEB29E] dark:text-[#888888]">
                              {" "}
                              ←{" "}
                              {new Date(session.end_time).toLocaleTimeString(
                                locale,
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          )}
                        </span>
                        {session.room && (
                          <>
                            <span className="text-[#BEB29E] dark:text-[#888888]">
                              ·
                            </span>
                            <span className="flex items-center gap-0.5">
                              <DoorOpen className="w-3 h-3" />
                              {session.room.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-[#BEB29E] dark:text-[#888888] shrink-0">
                      {sd.toLocaleDateString(locale, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </Link>
                );
              })}
            {sessions.filter((s) => new Date(s.session_date) >= new Date())
              .length === 0 && (
              <div className="py-10 text-center text-sm text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
                {t("teacher.schedule.noUpcoming")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
