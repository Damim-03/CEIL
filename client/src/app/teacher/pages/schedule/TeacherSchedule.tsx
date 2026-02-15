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

/* ═══════════════════ TYPES ═══════════════════ */

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

const AD = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
const ADS = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
const AM = [
  "جانفي",
  "فيفري",
  "مارس",
  "أفريل",
  "ماي",
  "جوان",
  "جويلية",
  "أوت",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const fT = (d: string) =>
  new Date(d).toLocaleTimeString("ar-DZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const isToday = (d: Date) => sameDay(d, new Date());
const toDateStr = (d: Date) => d.toISOString().split("T")[0];

/* ═══════════════════════════════════════════════════════════
   🕐 LIVE CLOCK — يحدّث كل 30 ثانية لتغيير حالة القاعات فوراً
═══════════════════════════════════════════════════════════ */
const useLiveClock = (intervalMs = 30_000) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};

/* client-side isLive — يستخدم الساعة الحية */
const isLiveAt = (
  s: { session_date: string; end_time: string | null },
  now: Date,
) => {
  const start = new Date(s.session_date);
  const end = s.end_time
    ? new Date(s.end_time)
    : new Date(start.getTime() + 90 * 60000);
  return now >= start && now <= end;
};

/* fallback isLive لما نستخدمها بدون clock */
const isLive = (s: { session_date: string; end_time: string | null }) =>
  isLiveAt(s, new Date());

/* حساب الدقائق المتبقية */
const minsUntilFree = (
  s: { session_date: string; end_time: string | null },
  now: Date,
) => {
  const start = new Date(s.session_date);
  const end = s.end_time
    ? new Date(s.end_time)
    : new Date(start.getTime() + 90 * 60000);
  return Math.max(0, Math.round((end.getTime() - now.getTime()) / 60000));
};

const formatMins = (m: number) => {
  if (m <= 0) return null;
  const h = Math.floor(m / 60),
    r = m % 60;
  if (h === 0) return `${r}د`;
  if (r === 0) return `${h}س`;
  return `${h}س ${r}د`;
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
    bg: "bg-[#2B6F5E]/10",
    border: "border-[#2B6F5E]/25",
    text: "text-[#2B6F5E]",
    accent: "bg-[#2B6F5E]",
  },
  {
    bg: "bg-[#C4A035]/10",
    border: "border-[#C4A035]/25",
    text: "text-[#C4A035]",
    accent: "bg-[#C4A035]",
  },
  {
    bg: "bg-[#8DB896]/12",
    border: "border-[#8DB896]/30",
    text: "text-[#3D7A4A]",
    accent: "bg-[#8DB896]",
  },
  {
    bg: "bg-purple-500/8",
    border: "border-purple-500/20",
    text: "text-purple-600",
    accent: "bg-purple-500",
  },
  {
    bg: "bg-blue-500/8",
    border: "border-blue-500/20",
    text: "text-blue-600",
    accent: "bg-blue-500",
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
  color = "bg-[#2B6F5E]",
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

const Skel = () => (
  <div className="space-y-6 animate-pulse" dir="rtl">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-7 w-40 bg-[#D8CDC0]/30 rounded-lg" />
        <div className="h-4 w-52 bg-[#D8CDC0]/20 rounded-lg mt-2" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 w-20 bg-[#D8CDC0]/20 rounded-xl" />
        <div className="h-10 w-20 bg-[#D8CDC0]/20 rounded-xl" />
      </div>
    </div>
    <div className="h-12 bg-white rounded-xl border border-[#D8CDC0]/40" />
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-[#D8CDC0]/40 h-[180px]"
        />
      ))}
    </div>
  </div>
);

/* ═══════ SESSION CHIP ═══════ */
const SessionChip = ({
  session,
  colorIdx,
  compact,
}: {
  session: ScheduleSession;
  colorIdx: number;
  compact: boolean;
}) => {
  const c = GC[colorIdx % GC.length],
    has = session.attendance_taken > 0,
    live = isLive(session);
  if (compact)
    return (
      <Link
        to={`/teacher/groups/${session.group.group_id}`}
        className={`block p-2 rounded-lg ${c.bg} border ${c.border} hover:shadow-sm transition-all relative ${live ? "ring-1 ring-[#2B6F5E]/30" : ""}`}
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
              <span className="opacity-50"> ← {fT(session.end_time)}</span>
            )}
          </span>
        </div>
        <p className="text-[10px] text-[#1B1B1B] font-medium truncate leading-tight">
          {session.group.course.course_name}
        </p>
        <p className="text-[9px] text-[#6B5D4F]/50 truncate">
          {session.group.name}
        </p>
        {session.room && (
          <p className="text-[8px] text-[#6B5D4F]/40 truncate flex items-center gap-0.5 mt-0.5">
            <DoorOpen className="w-2.5 h-2.5 shrink-0" />
            {session.room.name}
          </p>
        )}
      </Link>
    );
  return (
    <Link
      to={`/teacher/groups/${session.group.group_id}`}
      className={`block p-3.5 rounded-xl ${c.bg} border ${c.border} hover:shadow-md transition-all relative ${live ? "ring-2 ring-[#2B6F5E]/25" : ""}`}
    >
      {live && (
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <LiveDot />
          <span className="text-[9px] font-bold text-[#2B6F5E]">جارية</span>
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
              <span className="opacity-50"> ← {fT(session.end_time)}</span>
            )}
          </span>
        </div>
        {has && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#2B6F5E] bg-[#2B6F5E]/10 px-1.5 py-0.5 rounded">
            <UserCheck className="w-2.5 h-2.5" />
            {session.attendance_taken}
          </span>
        )}
      </div>
      <h4 className="text-sm font-semibold text-[#1B1B1B] truncate">
        {session.group.course.course_name}
      </h4>
      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#6B5D4F]/60 flex-wrap">
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3" />
          {session.group.name}
        </span>
        {session.group.level && (
          <span className="text-[#BEB29E]">· {session.group.level}</span>
        )}
        {session.room && (
          <span className="flex items-center gap-1">
            <DoorOpen className="w-3 h-3" />
            {session.room.name}
          </span>
        )}
      </div>
      {session.topic && (
        <p className="text-[10px] text-[#6B5D4F]/40 mt-1.5 truncate">
          {session.topic}
        </p>
      )}
    </Link>
  );
};

/* ═══════ DAY COLUMN ═══════ */
const DayColumn = ({
  date,
  sessions,
  gcm,
}: {
  date: Date;
  sessions: ScheduleSession[];
  gcm: Map<string, number>;
}) => {
  const today = isToday(date),
    ds = sessions.filter((s) => sameDay(new Date(s.session_date), date)),
    hasLive = ds.some(isLive);
  return (
    <div
      className={`flex flex-col rounded-xl border transition-all min-h-[200px] ${hasLive ? "border-[#2B6F5E]/40 bg-[#2B6F5E]/[0.03] shadow-sm" : today ? "border-[#2B6F5E]/30 bg-[#2B6F5E]/[0.02] shadow-sm" : "border-[#D8CDC0]/30 bg-white"}`}
    >
      <div
        className={`px-2.5 py-2 border-b text-center ${hasLive ? "border-[#2B6F5E]/20" : today ? "border-[#2B6F5E]/15" : "border-[#D8CDC0]/20"}`}
      >
        <p
          className={`text-[10px] font-medium ${today || hasLive ? "text-[#2B6F5E]" : "text-[#6B5D4F]/50"}`}
        >
          {ADS[date.getDay()]}
        </p>
        <p
          className={`text-lg font-bold leading-tight ${today || hasLive ? "text-[#2B6F5E]" : "text-[#1B1B1B]"}`}
        >
          {date.getDate()}
        </p>
        {hasLive ? (
          <div className="flex justify-center mt-0.5">
            <LiveDot size="h-1.5 w-1.5" />
          </div>
        ) : today ? (
          <div className="w-1.5 h-1.5 rounded-full bg-[#2B6F5E] mx-auto mt-0.5" />
        ) : null}
      </div>
      <div className="flex-1 p-1.5 space-y-1.5">
        {ds.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[60px]">
            <span className="text-[10px] text-[#BEB29E]">—</span>
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

/* ═══════ DAY VIEW ═══════ */
const DayView = ({
  date,
  sessions,
  gcm,
}: {
  date: Date;
  sessions: ScheduleSession[];
  gcm: Map<string, number>;
}) => {
  const ds = sessions
    .filter((s) => sameDay(new Date(s.session_date), date))
    .sort(
      (a, b) =>
        new Date(a.session_date).getTime() - new Date(b.session_date).getTime(),
    );
  const lc = ds.filter(isLive).length;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 bg-white rounded-xl border border-[#D8CDC0]/30 px-5 py-3">
        <div
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${isToday(date) ? "bg-[#2B6F5E]/10" : "bg-[#D8CDC0]/10"}`}
        >
          <span
            className={`text-[10px] font-medium ${isToday(date) ? "text-[#2B6F5E]" : "text-[#6B5D4F]/50"}`}
          >
            {ADS[date.getDay()]}
          </span>
          <span
            className={`text-lg font-bold leading-tight ${isToday(date) ? "text-[#2B6F5E]" : "text-[#1B1B1B]"}`}
          >
            {date.getDate()}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1B1B1B]">
            {AD[date.getDay()]}
          </p>
          <p className="text-[11px] text-[#6B5D4F]/50">
            {date.getDate()} {AM[date.getMonth()]} {date.getFullYear()}
          </p>
        </div>
        <div className="mr-auto flex items-center gap-2">
          {lc > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2B6F5E] bg-[#2B6F5E]/10 px-2.5 py-1 rounded-full">
              <LiveDot size="h-1.5 w-1.5" />
              {lc} جارية
            </span>
          )}
          <span className="text-xs font-bold text-[#2B6F5E] bg-[#2B6F5E]/8 px-2.5 py-1 rounded-full">
            {ds.length} {ds.length === 1 ? "حصة" : "حصص"}
          </span>
        </div>
      </div>
      {ds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#D8CDC0]/15 flex items-center justify-center mb-3">
            <CalendarDays className="w-6 h-6 text-[#BEB29E]" />
          </div>
          <p className="text-sm text-[#6B5D4F]/60">لا توجد حصص في هذا اليوم</p>
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

/* ═══════════════════════════════════════════════════════════
   🏢 ROOMS TIMETABLE — مع ساعة حية + countdown
═══════════════════════════════════════════════════════════ */

const RoomCard = ({ room, now }: { room: RoomOverview; now: Date }) => {
  // ✅ client-side: نعيد حساب is_occupied + الحصة الجارية بناءً على الساعة الحية
  const activeSession = room.sessions.find((s) => isLiveAt(s, now));
  const occ = !!activeSession;

  // ✅ countdown: كم دقيقة تبقت حتى تتحرر
  const remaining = activeSession ? minsUntilFree(activeSession, now) : 0;
  const remainLabel = formatMins(remaining);

  // ✅ القادمة: أقرب حصة في المستقبل (لتحذير الأستاذ)
  const nextSession = room.sessions.find((s) => new Date(s.session_date) > now);
  const minsToNext = nextSession
    ? Math.round(
        (new Date(nextSession.session_date).getTime() - now.getTime()) / 60000,
      )
    : null;

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all hover:shadow-md ${occ ? "border-[#C4A035]/30 bg-white" : "border-[#2B6F5E]/20 bg-white"}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${occ ? "border-[#C4A035]/15 bg-[#C4A035]/5" : "border-[#2B6F5E]/10 bg-[#2B6F5E]/5"}`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${occ ? "bg-[#C4A035]/15" : "bg-[#2B6F5E]/15"}`}
          >
            {occ ? (
              <DoorClosed className="w-4 h-4 text-[#C4A035]" />
            ) : (
              <DoorOpen className="w-4 h-4 text-[#2B6F5E]" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#1B1B1B]">
              {room.name}
            </h4>
            <div className="flex items-center gap-2 text-[10px] text-[#6B5D4F]/50">
              {room.location && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {room.location}
                </span>
              )}
              <span className="flex items-center gap-0.5">
                <Users className="w-2.5 h-2.5" />
                {room.capacity} مقعد
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {occ ? (
            <div className="flex items-center gap-1.5">
              <LiveDot size="h-2 w-2" color="bg-[#C4A035]" />
              <span className="text-[10px] font-bold text-[#C4A035]">
                محجوزة
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-[#2B6F5E] bg-[#2B6F5E]/10 px-2 py-0.5 rounded-full">
              فارغة
            </span>
          )}

          {/* ✅ Countdown: تتحرر بعد */}
          {occ && remainLabel && (
            <span className="flex items-center gap-1 text-[9px] text-[#C4A035]/70">
              <Timer className="w-2.5 h-2.5" />
              تتحرر بعد {remainLabel}
            </span>
          )}

          {/* ✅ تحذير: ستُحجز قريباً */}
          {!occ &&
            minsToNext !== null &&
            minsToNext > 0 &&
            minsToNext <= 30 && (
              <span className="text-[9px] text-[#C4A035]/70">
                ⚠ تُحجز بعد {minsToNext}د
              </span>
            )}
        </div>
      </div>

      {/* Sessions list */}
      <div className="p-3">
        {room.sessions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-[#2B6F5E]/60 flex items-center justify-center gap-1.5">
              <DoorOpen className="w-3.5 h-3.5" />
              متاحة طوال اليوم
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    live
                      ? "bg-[#C4A035]/8 border border-[#C4A035]/15"
                      : past
                        ? "bg-[#D8CDC0]/5 border border-transparent opacity-50"
                        : s.is_mine
                          ? "bg-[#2B6F5E]/5 border border-[#2B6F5E]/10"
                          : "bg-[#D8CDC0]/8 border border-transparent"
                  }`}
                >
                  <div className="shrink-0 text-center w-16">
                    <p
                      className={`text-[11px] font-bold ${live ? "text-[#C4A035]" : past ? "text-[#BEB29E] line-through" : "text-[#1B1B1B]"}`}
                    >
                      {fT(s.session_date)}
                    </p>
                    {s.end_time && (
                      <p
                        className={`text-[9px] ${past ? "text-[#BEB29E]" : "text-[#6B5D4F]/40"}`}
                      >
                        ← {fT(s.end_time)}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-0.5 h-8 rounded-full shrink-0 ${live ? "bg-[#C4A035]" : past ? "bg-[#D8CDC0]" : s.is_mine ? "bg-[#2B6F5E]" : "bg-[#D8CDC0]"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={`text-xs font-medium truncate ${past ? "text-[#BEB29E]" : "text-[#1B1B1B]"}`}
                      >
                        {s.course_name}
                      </p>
                      {live && (
                        <span className="text-[8px] font-bold text-white bg-[#C4A035] px-1.5 py-0.5 rounded-full shrink-0">
                          الآن
                        </span>
                      )}
                      {past && (
                        <span className="text-[8px] font-medium text-[#BEB29E] bg-[#D8CDC0]/20 px-1 py-0.5 rounded shrink-0">
                          انتهت
                        </span>
                      )}
                      {s.is_mine && !live && !past && (
                        <span className="text-[8px] font-bold text-[#2B6F5E] bg-[#2B6F5E]/10 px-1 py-0.5 rounded shrink-0">
                          حصتي
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#6B5D4F]/50 mt-0.5">
                      <span>{s.group_name}</span>
                      {s.teacher_name && (
                        <>
                          <span className="text-[#BEB29E]">·</span>
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
  const dateStr = toDateStr(date);
  // ✅ Auto-refresh كل 30 ثانية
  const { data, isLoading } = useTeacherRoomsOverview(dateStr);
  const now = useLiveClock(30_000); // ← ساعة حية كل 30 ثانية
  const [filter, setFilter] = useState<"all" | "free" | "occupied">("all");

  // ✅ Client-side: نعيد حساب is_occupied بناءً على now الحية
  const roomsWithLiveStatus = useMemo(() => {
    if (!data) return null;
    const rd = data as RoomsData;
    const rooms = rd.rooms.map((r) => ({
      ...r,
      is_occupied: r.sessions.some((s) => isLiveAt(s, now)),
    }));
    return {
      ...rd,
      rooms,
      occupied_now: rooms.filter((r) => r.is_occupied).length,
      free_now: rooms.filter((r) => !r.is_occupied).length,
    };
  }, [data, now]);

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-[#D8CDC0]/40 h-[180px]"
          />
        ))}
      </div>
    );

  const rd = roomsWithLiveStatus;
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

  return (
    <div className="space-y-4">
      {/* Stats + live clock */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-[#D8CDC0]/30 px-4 py-3 flex-wrap">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#2B6F5E]" />
            <span className="text-xs text-[#6B5D4F]">
              <span className="font-bold text-[#2B6F5E]">{rd.free_now}</span>{" "}
              فارغة
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#C4A035]" />
            <span className="text-xs text-[#6B5D4F]">
              <span className="font-bold text-[#C4A035]">
                {rd.occupied_now}
              </span>{" "}
              محجوزة
            </span>
          </div>
          <span className="text-xs text-[#BEB29E]">
            من أصل {rd.total_rooms} قاعة
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* ✅ Live clock display */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#6B5D4F]/60 bg-[#D8CDC0]/10 px-2.5 py-1 rounded-lg">
            <LiveDot size="h-1.5 w-1.5" color="bg-[#2B6F5E]" />
            <span className="tabular-nums font-medium">
              {now.toLocaleTimeString("ar-DZ", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-[#D8CDC0]/10 p-0.5 rounded-lg">
            {[
              { key: "all" as const, label: "الكل" },
              { key: "free" as const, label: "فارغة" },
              { key: "occupied" as const, label: "محجوزة" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`h-7 px-3 text-[10px] font-medium rounded-md transition-all ${filter === f.key ? "bg-white text-[#2B6F5E] shadow-sm" : "text-[#6B5D4F]/50 hover:text-[#6B5D4F]"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Progress */}
      <div className="h-2 bg-[#D8CDC0]/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-l from-[#C4A035] to-[#C4A035]/70 rounded-full transition-all duration-500"
          style={{
            width: `${rd.total_rooms > 0 ? (rd.occupied_now / rd.total_rooms) * 100 : 0}%`,
          }}
        />
      </div>
      {/* Cards */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#D8CDC0]/15 flex items-center justify-center mb-3">
            <DoorOpen className="w-6 h-6 text-[#BEB29E]" />
          </div>
          <p className="text-sm text-[#6B5D4F]/60">
            {filter === "free"
              ? "لا توجد قاعات فارغة حالياً"
              : filter === "occupied"
                ? "لا توجد قاعات محجوزة حالياً"
                : "لا توجد قاعات"}
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

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */

export default function TeacherSchedule() {
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

  const nav = (dir: number) => {
    const n = new Date(cd);
    n.setDate(n.getDate() + dir * (vm === "week" ? 7 : 1));
    setCd(n);
  };
  const goToday = () => setCd(new Date());

  const hLabel = useMemo(() => {
    if (vm === "day" || vm === "rooms")
      return `${AD[cd.getDay()]} ${cd.getDate()} ${AM[cd.getMonth()]} ${cd.getFullYear()}`;
    const s = wd[0],
      e = wd[6];
    return s.getMonth() === e.getMonth()
      ? `${s.getDate()} – ${e.getDate()} ${AM[s.getMonth()]} ${s.getFullYear()}`
      : `${s.getDate()} ${AM[s.getMonth()]} – ${e.getDate()} ${AM[e.getMonth()]} ${e.getFullYear()}`;
  }, [vm, cd, wd]);

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

  if (isLoading) return <Skel />;
  if (isError)
    return (
      <div
        dir="rtl"
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">
          تعذّر تحميل الجدول
        </h3>
        <p className="text-sm text-[#6B5D4F]/70">يرجى المحاولة لاحقاً</p>
      </div>
    );

  return (
    <div dir="rtl" className="space-y-5 pb-8">
      {/* Header + 3-mode toggle */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B]">الجدول الزمني</h1>
          <p className="text-sm text-[#6B5D4F]/70 mt-0.5">
            عرض حصصك القادمة والمنجزة وتوفّر القاعات
          </p>
        </div>
        <div className="flex items-center gap-1 bg-[#D8CDC0]/15 p-1 rounded-xl self-start sm:self-auto">
          {[
            { k: "week" as const, l: "أسبوع" },
            { k: "day" as const, l: "يوم" },
            { k: "rooms" as const, l: "القاعات" },
          ].map((m) => (
            <button
              key={m.k}
              onClick={() => setVm(m.k)}
              className={`h-8 px-4 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${vm === m.k ? "bg-white text-[#2B6F5E] shadow-sm" : "text-[#6B5D4F]/60 hover:text-[#6B5D4F]"}`}
            >
              {m.k === "rooms" && <DoorOpen className="w-3.5 h-3.5" />}
              {m.l}
            </button>
          ))}
        </div>
      </div>

      {/* Nav bar */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-[#D8CDC0]/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => nav(1)}
            className="w-8 h-8 rounded-lg hover:bg-[#D8CDC0]/15 flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-[#6B5D4F]" />
          </button>
          <button
            onClick={() => nav(-1)}
            className="w-8 h-8 rounded-lg hover:bg-[#D8CDC0]/15 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-[#6B5D4F]" />
          </button>
          <button
            onClick={goToday}
            className="h-8 px-3 text-xs font-medium text-[#2B6F5E] bg-[#2B6F5E]/8 hover:bg-[#2B6F5E]/15 rounded-lg"
          >
            اليوم
          </button>
        </div>
        <h2 className="text-sm font-semibold text-[#1B1B1B]">{hLabel}</h2>
        <div className="flex items-center gap-3 text-[11px] text-[#6B5D4F]/60">
          {vm !== "rooms" ? (
            <>
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {wStats.total} حصة
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {wStats.groups} مجموعة
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1">
              <DoorOpen className="w-3 h-3" />
              جدول القاعات
            </span>
          )}
        </div>
      </div>

      {/* Group legend (week/day only) */}
      {vm !== "rooms" && gLeg.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {gLeg.map(([gid, info]) => {
            const i = gcm.get(gid) ?? 0,
              co = GC[i % GC.length];
            return (
              <div
                key={gid}
                className="flex items-center gap-1.5 shrink-0 text-[11px] text-[#6B5D4F]/70 bg-white border border-[#D8CDC0]/30 px-2.5 py-1.5 rounded-lg"
              >
                <div className={`w-2.5 h-2.5 rounded-sm ${co.accent}`} />
                <span className="font-medium">{info.name}</span>
                <span className="text-[#BEB29E]">·</span>
                <span className="text-[10px] text-[#BEB29E]">{info.cn}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Content */}
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

      {/* Upcoming (week/day only) */}
      {vm !== "rooms" && sessions.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#D8CDC0]/25">
            <div className="w-8 h-8 rounded-lg bg-[#C4A035]/8 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#C4A035]" />
            </div>
            <h3 className="text-sm font-semibold text-[#1B1B1B]">
              الحصص القادمة
            </h3>
            <span className="text-[11px] text-[#BEB29E] mr-auto">
              أقرب 10 حصص
            </span>
          </div>
          <div className="divide-y divide-[#D8CDC0]/8">
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
                return (
                  <Link
                    key={session.session_id}
                    to={`/teacher/groups/${session.group.group_id}`}
                    className={`flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAF8] transition-colors ${live ? "bg-[#2B6F5E]/[0.02]" : ""}`}
                  >
                    <div
                      className={`w-1 h-8 rounded-full ${co.accent} shrink-0`}
                    />
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-[#D8CDC0]/8 shrink-0">
                      <span className="text-[9px] font-medium text-[#6B5D4F]/50 leading-tight">
                        {ADS[new Date(session.session_date).getDay()]}
                      </span>
                      <span className="text-sm font-bold text-[#1B1B1B] leading-tight">
                        {new Date(session.session_date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#1B1B1B] truncate">
                          {session.group.course.course_name}
                        </p>
                        {live && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-white bg-[#2B6F5E] px-1.5 py-0.5 rounded-full shrink-0">
                            <LiveDot size="h-1 w-1" />
                            جارية
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#6B5D4F]/50 mt-0.5 flex-wrap">
                        <span>{session.group.name}</span>
                        <span className="text-[#BEB29E]">·</span>
                        <span>
                          {fT(session.session_date)}
                          {session.end_time && (
                            <span className="text-[#BEB29E]">
                              {" "}
                              ← {fT(session.end_time)}
                            </span>
                          )}
                        </span>
                        {session.room && (
                          <>
                            <span className="text-[#BEB29E]">·</span>
                            <span className="flex items-center gap-0.5">
                              <DoorOpen className="w-3 h-3" />
                              {session.room.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-[#BEB29E] shrink-0">
                      {ADS[new Date(session.session_date).getDay()]}{" "}
                      {new Date(session.session_date).getDate()}{" "}
                      {AM[new Date(session.session_date).getMonth()]}
                    </span>
                  </Link>
                );
              })}
            {sessions.filter((s) => new Date(s.session_date) >= new Date())
              .length === 0 && (
              <div className="py-10 text-center text-sm text-[#6B5D4F]/50">
                لا توجد حصص قادمة
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
