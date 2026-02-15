import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  DoorClosed,
  AlertCircle,
  Users,
  Clock,
  ArrowRight,
  Loader2,
  MapPin,
  CalendarDays,
  LayoutGrid,
  List,
  GraduationCap,
  BookOpen,
  Activity,
  Timer,
} from "lucide-react";
import { useRoomsScheduleOverview } from "../../../hooks/admin/useAdmin";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */

interface SessionSlot {
  session_id: string;
  session_date: string;
  end_time?: string | null;
  topic: string | null;
  group_name: string;
  course_name: string;
  teacher_name: string | null;
}

interface RoomOverview {
  room_id: string;
  name: string;
  capacity: number;
  location: string | null;
  sessions_today: number;
  sessions: SessionSlot[];
  is_occupied: boolean;
}

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */

const ARABIC_DAYS = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
const ARABIC_MONTHS = [
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

const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const THEMES = [
  {
    id: "emerald",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50/80",
    border: "border-emerald-200/50",
    text: "text-emerald-700",
    light: "bg-emerald-500/6",
    ring: "ring-emerald-400/30",
    badge: "bg-emerald-100/80 text-emerald-700",
    accent: "#10b981",
    glow: "shadow-emerald-500/15",
  },
  {
    id: "amber",
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50/80",
    border: "border-amber-200/50",
    text: "text-amber-700",
    light: "bg-amber-500/6",
    ring: "ring-amber-400/30",
    badge: "bg-amber-100/80 text-amber-700",
    accent: "#f59e0b",
    glow: "shadow-amber-500/15",
  },
  {
    id: "violet",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50/80",
    border: "border-violet-200/50",
    text: "text-violet-700",
    light: "bg-violet-500/6",
    ring: "ring-violet-400/30",
    badge: "bg-violet-100/80 text-violet-700",
    accent: "#8b5cf6",
    glow: "shadow-violet-500/15",
  },
  {
    id: "sky",
    gradient: "from-sky-500 to-blue-600",
    bg: "bg-sky-50/80",
    border: "border-sky-200/50",
    text: "text-sky-700",
    light: "bg-sky-500/6",
    ring: "ring-sky-400/30",
    badge: "bg-sky-100/80 text-sky-700",
    accent: "#0ea5e9",
    glow: "shadow-sky-500/15",
  },
  {
    id: "rose",
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-50/80",
    border: "border-rose-200/50",
    text: "text-rose-700",
    light: "bg-rose-500/6",
    ring: "ring-rose-400/30",
    badge: "bg-rose-100/80 text-rose-700",
    accent: "#f43f5e",
    glow: "shadow-rose-500/15",
  },
  {
    id: "cyan",
    gradient: "from-cyan-500 to-teal-500",
    bg: "bg-cyan-50/80",
    border: "border-cyan-200/50",
    text: "text-cyan-700",
    light: "bg-cyan-500/6",
    ring: "ring-cyan-400/30",
    badge: "bg-cyan-100/80 text-cyan-700",
    accent: "#06b6d4",
    glow: "shadow-cyan-500/15",
  },
  {
    id: "indigo",
    gradient: "from-indigo-500 to-blue-700",
    bg: "bg-indigo-50/80",
    border: "border-indigo-200/50",
    text: "text-indigo-700",
    light: "bg-indigo-500/6",
    ring: "ring-indigo-400/30",
    badge: "bg-indigo-100/80 text-indigo-700",
    accent: "#6366f1",
    glow: "shadow-indigo-500/15",
  },
  {
    id: "lime",
    gradient: "from-lime-500 to-green-600",
    bg: "bg-lime-50/80",
    border: "border-lime-200/50",
    text: "text-lime-700",
    light: "bg-lime-500/6",
    ring: "ring-lime-400/30",
    badge: "bg-lime-100/80 text-lime-700",
    accent: "#84cc16",
    glow: "shadow-lime-500/15",
  },
];

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

const toDateStr = (d: Date) => d.toISOString().split("T")[0];
const isTodayCheck = (d: Date) => toDateStr(d) === toDateStr(new Date());
const formatDateLabel = (d: Date) =>
  `${ARABIC_DAYS[d.getDay()]} ${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const fmt = (d: string) =>
  new Date(d).toLocaleTimeString("ar-DZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
const hm = (d: string) => {
  const x = new Date(d);
  return `${String(x.getHours()).padStart(2, "0")}:${String(x.getMinutes()).padStart(2, "0")}`;
};
const toMins = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const closest = (hm: string) =>
  TIME_SLOTS.reduce((p, c) =>
    Math.abs(toMins(c) - toMins(hm)) < Math.abs(toMins(p) - toMins(hm)) ? c : p,
  );

/* ═══════════════════════════════════════════════════════════
   🕐 LIVE CLOCK + SESSION STATUS HELPERS
═══════════════════════════════════════════════════════════ */

const useLiveClock = (ms = 30_000) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
};

const getEnd = (s: { session_date: string; end_time?: string | null }) =>
  s.end_time
    ? new Date(s.end_time)
    : new Date(new Date(s.session_date).getTime() + 90 * 60000);

const isLiveAt = (
  s: { session_date: string; end_time?: string | null },
  now: Date,
) => {
  const start = new Date(s.session_date);
  return now >= start && now <= getEnd(s);
};

const isPastAt = (
  s: { session_date: string; end_time?: string | null },
  now: Date,
) => now > getEnd(s);

const minsLeft = (
  s: { session_date: string; end_time?: string | null },
  now: Date,
) => Math.max(0, Math.round((getEnd(s).getTime() - now.getTime()) / 60000));

const fmtMins = (m: number) => {
  if (m <= 0) return null;
  const h = Math.floor(m / 60),
    r = m % 60;
  if (h === 0) return `${r}د`;
  if (r === 0) return `${h}س`;
  return `${h}س ${r}د`;
};

/* ═══════════════════════════════════════════════════════════
   LIVE DOT
═══════════════════════════════════════════════════════════ */

const LiveDot = ({
  size = "h-2 w-2",
  color = "bg-emerald-500",
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

/* ═══════════════════════════════════════════════════════════
   SESSION CARD — live / past / upcoming states
═══════════════════════════════════════════════════════════ */

const SessionCard = ({
  session,
  theme,
  delay,
  now,
}: {
  session: SessionSlot;
  theme: (typeof THEMES)[0];
  delay: number;
  now: Date;
}) => {
  const [hovered, setHovered] = useState(false);
  const live = isLiveAt(session, now);
  const past = isPastAt(session, now);
  const remainLabel = live ? fmtMins(minsLeft(session, now)) : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        group relative overflow-hidden rounded-[14px] p-3 h-full min-h-[80px]
        border ${past ? "border-[#D8CDC0]/30" : live ? "border-[#C4A035]/40 ring-1 ring-[#C4A035]/20" : theme.border}
        backdrop-blur-sm transition-all duration-500 ease-out cursor-default
        animate-[cardReveal_0.45s_cubic-bezier(0.16,1,0.3,1)_both]
        ${past ? "bg-[#D8CDC0]/5 opacity-50" : hovered ? `${theme.bg} shadow-xl ${theme.glow} -translate-y-1 scale-[1.03]` : live ? "bg-[#C4A035]/5 shadow-md" : "bg-white/60 shadow-sm hover:shadow-md"}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`absolute top-0 right-0 left-0 h-[3px] ${past ? "bg-[#D8CDC0]/30" : live ? "bg-gradient-to-l from-[#C4A035] to-[#C4A035]/70" : `bg-gradient-to-l ${theme.gradient}`} opacity-90`}
      />
      <div
        className={`absolute -top-6 -left-6 w-24 h-24 rounded-full bg-gradient-to-br ${theme.gradient} blur-2xl transition-opacity duration-700 ${hovered && !past ? "opacity-[0.08]" : "opacity-0"}`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${past ? "bg-[#D8CDC0]/15" : live ? "bg-[#C4A035]/10" : theme.light}`}
          >
            <Clock
              className={`w-2.5 h-2.5 ${past ? "text-[#BEB29E]" : live ? "text-[#C4A035]" : theme.text}`}
            />
            <span
              className={`text-[10px] font-bold tabular-nums ${past ? "text-[#BEB29E] line-through" : live ? "text-[#C4A035]" : theme.text}`}
            >
              {fmt(session.session_date)}
              {session.end_time && (
                <span className="opacity-60"> ← {fmt(session.end_time)}</span>
              )}
            </span>
          </div>
          {live && (
            <span className="flex items-center gap-1">
              <LiveDot size="h-1.5 w-1.5" color="bg-[#C4A035]" />
              <span className="text-[8px] font-bold text-[#C4A035]">الآن</span>
            </span>
          )}
          {past && (
            <span className="text-[8px] font-medium text-[#BEB29E] bg-[#D8CDC0]/15 px-1.5 py-0.5 rounded">
              انتهت
            </span>
          )}
        </div>

        {live && remainLabel && (
          <div className="flex items-center gap-1 mb-1.5 text-[9px] text-[#C4A035]/70">
            <Timer className="w-2.5 h-2.5" />
            <span>تنتهي بعد {remainLabel}</span>
          </div>
        )}

        <p
          className={`text-[12px] font-extrabold leading-snug line-clamp-2 mb-1 ${past ? "text-[#BEB29E]" : "text-[#1B1B1B]"}`}
        >
          {session.course_name}
        </p>
        <div
          className={`flex items-center gap-1 text-[10px] ${past ? "text-[#BEB29E]" : "text-[#6B5D4F]/60"}`}
        >
          <Users className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate">{session.group_name}</span>
        </div>

        {session.teacher_name && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <div
              className={`w-[18px] h-[18px] rounded-full ${past ? "bg-[#D8CDC0]/30" : `bg-gradient-to-br ${theme.gradient}`} flex items-center justify-center shadow-sm`}
            >
              <span className="text-[8px] font-bold text-white">
                {session.teacher_name.charAt(0)}
              </span>
            </div>
            <span
              className={`text-[10px] font-semibold truncate ${past ? "text-[#BEB29E]" : theme.text}`}
            >
              {session.teacher_name}
            </span>
          </div>
        )}

        {session.topic && (
          <p className="text-[9px] text-[#BEB29E] truncate mt-1.5 leading-relaxed border-t border-[#D8CDC0]/15 pt-1">
            {session.topic}
          </p>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ROOM HEADER — live occupancy + countdown
═══════════════════════════════════════════════════════════ */

const RoomColHeader = ({
  room,
  theme,
  index,
  isOccupied,
  remainLabel,
}: {
  room: RoomOverview;
  theme: (typeof THEMES)[0];
  index: number;
  isOccupied: boolean;
  remainLabel: string | null;
}) => (
  <th className="px-1 py-0 text-center min-w-[165px] align-bottom">
    <div
      className="relative rounded-2xl overflow-hidden mx-0.5 mb-1.5 shadow-md animate-[headerDrop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div
        className={`bg-gradient-to-br ${theme.gradient} px-3 pt-4 pb-3 relative overflow-hidden`}
      >
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/[0.07]" />
        <div className="absolute -bottom-3 -left-3 w-12 h-12 rounded-full bg-white/[0.05]" />
        <div className="relative z-10">
          <div className="w-10 h-10 mx-auto rounded-xl bg-white/[0.15] backdrop-blur-sm border border-white/[0.15] flex items-center justify-center mb-2 shadow-inner">
            {isOccupied ? (
              <DoorClosed className="w-5 h-5 text-white drop-shadow-sm" />
            ) : (
              <DoorOpen className="w-5 h-5 text-white drop-shadow-sm" />
            )}
          </div>
          <p className="text-[14px] font-bold text-white tracking-wide">
            {room.name}
          </p>
          {room.location && (
            <p className="text-[10px] text-white/60 flex items-center justify-center gap-0.5 mt-0.5">
              <MapPin className="w-2.5 h-2.5" /> {room.location}
            </p>
          )}
        </div>
      </div>
      <div
        className={`${theme.bg} backdrop-blur-sm px-2.5 py-2 flex items-center justify-between text-[10px] border-t border-white/30`}
      >
        <span className={`flex items-center gap-1 font-bold ${theme.text}`}>
          <Users className="w-3 h-3" /> {room.capacity}
        </span>
        <span
          className={`font-extrabold px-2 py-0.5 rounded-lg ${room.sessions_today > 0 ? theme.badge : "bg-[#D8CDC0]/20 text-[#BEB29E]"}`}
        >
          {room.sessions_today} حصة
        </span>
        {isOccupied ? (
          <span className="flex flex-col items-end gap-0.5">
            <span className="flex items-center gap-1">
              <LiveDot size="h-2 w-2" />
              <span className={`${theme.text} font-extrabold`}>الآن</span>
            </span>
            {remainLabel && (
              <span className="text-[8px] text-[#6B5D4F]/40">
                {remainLabel}
              </span>
            )}
          </span>
        ) : (
          <span className="text-[9px] font-bold text-emerald-600">فارغة</span>
        )}
      </div>
    </div>
  </th>
);

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */

export default function RoomsTimetablePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const dateStr = toDateStr(currentDate);
  const now = useLiveClock(30_000);
  const isToday = isTodayCheck(currentDate);

  const { data, isLoading, isError } = useRoomsScheduleOverview(dateStr);

  const nav = useCallback((dir: number) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + dir);
      return d;
    });
  }, []);

  /* ── Client-side live status recalc ── */
  const liveData = useMemo(() => {
    if (!data?.rooms)
      return { rooms: [] as RoomOverview[], occupiedNow: 0, freeNow: 0 };
    const rooms: RoomOverview[] = data.rooms.map((r: RoomOverview) => ({
      ...r,
      is_occupied: r.sessions.some((s) => isLiveAt(s, now)),
    }));
    return {
      rooms,
      occupiedNow: rooms.filter((r) => r.is_occupied).length,
      freeNow: rooms.filter((r) => !r.is_occupied).length,
    };
  }, [data, now]);

  /* ── Build grid ── */
  const grid = useMemo(() => {
    if (!liveData.rooms.length)
      return {
        rooms: [] as RoomOverview[],
        slotMap: new Map<string, Map<string, SessionSlot>>(),
      };
    const rooms = liveData.rooms;
    const sm = new Map<string, Map<string, SessionSlot>>();
    TIME_SLOTS.forEach((s) => sm.set(s, new Map()));
    rooms.forEach((r) =>
      r.sessions.forEach((sess) => {
        sm.get(closest(hm(sess.session_date)))?.set(r.room_id, sess);
      }),
    );
    return { rooms, slotMap: sm };
  }, [liveData]);

  const activeSlots = useMemo(() => {
    const a = TIME_SLOTS.filter((s) => {
      const m = grid.slotMap.get(s);
      return m && m.size > 0;
    });
    return a.length > 0 ? a : TIME_SLOTS.filter((_, i) => i % 2 === 0);
  }, [grid]);

  const totalSessions = liveData.rooms.reduce(
    (s, r) => s + r.sessions_today,
    0,
  );
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const getRoomCountdown = (room: RoomOverview): string | null => {
    const active = room.sessions.find((s) => isLiveAt(s, now));
    return active ? fmtMins(minsLeft(active, now)) : null;
  };

  if (isError)
    return (
      <div
        dir="rtl"
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center mb-5 shadow-lg shadow-red-100">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-[#1B1B1B] mb-2">
          حدث خطأ في تحميل الجدول
        </h3>
        <p className="text-sm text-[#6B5D4F]/50">
          تحقق من الاتصال وحاول مجدداً
        </p>
      </div>
    );

  return (
    <div dir="rtl" className="space-y-5 pb-10">
      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden rounded-[20px]">
        <div className="absolute inset-0 bg-gradient-to-bl from-[#1a3c33] via-[#2B6F5E] to-[#1a3c33]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(196,160,53,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(141,184,150,0.12),transparent_50%)]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-[#C4A035]/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/6 w-48 h-48 rounded-full bg-[#8DB896]/10 blur-3xl" />
        <div className="relative px-7 py-7 flex items-center justify-between flex-wrap gap-5">
          <div>
            <Link
              to="/admin/rooms"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white/80 transition-colors mb-3 group"
            >
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              العودة للقاعات
            </Link>
            <h1 className="text-[28px] font-black text-white tracking-tight flex items-center gap-3">
              <div className="w-12 h-12 rounded-[14px] bg-white/[0.08] backdrop-blur-sm border border-white/[0.08] flex items-center justify-center shadow-xl">
                <CalendarDays className="w-6 h-6 text-white/90" />
              </div>
              الجدول الزمني للقاعات
            </h1>
            <p className="text-[13px] text-white/35 mt-1.5 font-medium">
              عرض بصري شامل لاستخدام القاعات وتوزيع الحصص خلال اليوم
            </p>
          </div>
          {data && (
            <div className="flex items-center gap-3">
              {[
                {
                  icon: DoorOpen,
                  val: data.total_rooms,
                  lbl: "قاعة",
                  color: "from-white/[0.12] to-white/[0.06]",
                },
                {
                  icon: BookOpen,
                  val: totalSessions,
                  lbl: "حصة",
                  color: "from-[#C4A035]/20 to-[#C4A035]/10",
                },
                {
                  icon: Activity,
                  val: liveData.occupiedNow,
                  lbl: "مشغولة الآن",
                  color: "from-emerald-400/20 to-emerald-400/10",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`bg-gradient-to-b ${s.color} backdrop-blur-md rounded-2xl px-5 py-3.5 text-center min-w-[80px] border border-white/[0.08] shadow-lg animate-[fadeUp_0.5s_ease-out_both]`}
                  style={{ animationDelay: `${200 + i * 100}ms` }}
                >
                  <s.icon className="w-4.5 h-4.5 mx-auto mb-1.5 text-white/50" />
                  <p className="text-2xl font-black text-white leading-none">
                    {s.val}
                  </p>
                  <p className="text-[10px] text-white/30 mt-1 font-semibold">
                    {s.lbl}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ NAV ═══ */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-[#D8CDC0]/25 px-5 py-3.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => nav(1)}
            className="w-10 h-10 rounded-xl bg-[#FAFAF8] hover:bg-[#2B6F5E]/8 border border-[#D8CDC0]/25 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <ChevronRight className="w-4 h-4 text-[#6B5D4F]" />
          </button>
          <button
            onClick={() => nav(-1)}
            className="w-10 h-10 rounded-xl bg-[#FAFAF8] hover:bg-[#2B6F5E]/8 border border-[#D8CDC0]/25 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 text-[#6B5D4F]" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className={`h-10 px-5 text-xs font-bold rounded-xl transition-all ${isToday ? "bg-gradient-to-r from-[#2B6F5E] to-[#3D8B6E] text-white shadow-lg shadow-[#2B6F5E]/25" : "bg-[#2B6F5E]/8 text-[#2B6F5E] hover:bg-[#2B6F5E]/15"}`}
          >
            اليوم
          </button>
        </div>
        <div className="text-center">
          <h2 className="text-[15px] font-bold text-[#1B1B1B]">
            {formatDateLabel(currentDate)}
          </h2>
          {isToday && (
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <LiveDot size="h-1.5 w-1.5" color="bg-[#C4A035]" />
              <span className="text-[11px] font-bold text-[#C4A035] tabular-nums">
                {now.toLocaleTimeString("ar-DZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-0.5 bg-[#F5F3EF] rounded-xl p-1 border border-[#D8CDC0]/20">
          {[
            { m: "grid" as const, icon: LayoutGrid, tip: "شبكة" },
            { m: "list" as const, icon: List, tip: "قائمة" },
          ].map(({ m, icon: Icon, tip }) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              title={tip}
              className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-300 ${viewMode === m ? "bg-white shadow-md text-[#2B6F5E] scale-105" : "text-[#BEB29E] hover:text-[#6B5D4F]"}`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* ═══ LEGEND ═══ */}
      {grid.rooms.length > 0 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {grid.rooms.map((room, idx) => {
            const t = THEMES[idx % THEMES.length];
            const occ = room.is_occupied;
            const cd = getRoomCountdown(room);
            return (
              <div
                key={room.room_id}
                className={`flex items-center gap-2 shrink-0 bg-white border ${t.border} px-4 py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${occ ? `ring-2 ${t.ring}` : ""} animate-[fadeUp_0.3s_ease-out_both]`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-[5px] bg-gradient-to-br ${t.gradient} shadow-sm`}
                />
                <span className="text-[12px] font-bold text-[#1B1B1B]">
                  {room.name}
                </span>
                {room.location && (
                  <span className="text-[10px] text-[#BEB29E] flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" /> {room.location}
                  </span>
                )}
                <div
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${t.badge}`}
                >
                  {room.sessions_today}
                </div>
                {occ ? (
                  <div className="flex items-center gap-1.5">
                    <LiveDot size="h-2 w-2" />
                    {cd && (
                      <span className="text-[9px] text-[#6B5D4F]/50">{cd}</span>
                    )}
                  </div>
                ) : (
                  room.sessions_today > 0 && (
                    <span className="text-[9px] font-bold text-emerald-600">
                      فارغة
                    </span>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ LOADING ═══ */}
      {isLoading && (
        <div className="bg-white rounded-[20px] border border-[#D8CDC0]/25 h-[500px] flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2B6F5E]/10 to-[#2B6F5E]/5 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#2B6F5E] animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping bg-[#2B6F5E]/5" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1B1B1B]/60 text-center">
              جارٍ تحميل الجدول...
            </p>
          </div>
        </div>
      )}

      {/* ═══ EMPTY ═══ */}
      {!isLoading && grid.rooms.length === 0 && (
        <div className="bg-white rounded-[20px] border border-[#D8CDC0]/25 flex flex-col items-center justify-center py-28 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#D8CDC0]/20 to-[#D8CDC0]/5 flex items-center justify-center mb-5 shadow-inner">
            <DoorOpen className="w-10 h-10 text-[#BEB29E]" />
          </div>
          <h3 className="text-xl font-bold text-[#1B1B1B] mb-1">
            لا توجد قاعات بعد
          </h3>
          <p className="text-sm text-[#6B5D4F]/40 mb-5">
            أضف قاعات لتظهر في الجدول الزمني
          </p>
          <Link
            to="/admin/rooms"
            className="h-11 px-7 bg-gradient-to-r from-[#2B6F5E] to-[#3D8B6E] text-white text-sm font-bold rounded-xl inline-flex items-center gap-2 shadow-lg shadow-[#2B6F5E]/20"
          >
            <DoorOpen className="w-4 h-4" /> إضافة قاعات
          </Link>
        </div>
      )}

      {/* ═══ GRID VIEW ═══ */}
      {!isLoading && grid.rooms.length > 0 && viewMode === "grid" && (
        <div className="bg-white rounded-[20px] border border-[#D8CDC0]/25 overflow-hidden shadow-sm">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr>
                  <th className="sticky right-0 z-20 bg-white w-[78px] p-0">
                    <div className="bg-gradient-to-b from-[#FAFAF8] to-[#F5F3EF] rounded-tl-xl m-0.5 px-2 py-4 border-l border-[#D8CDC0]/12">
                      <Clock className="w-4.5 h-4.5 mx-auto text-[#BEB29E]" />
                      <p className="text-[8px] text-[#BEB29E] font-bold mt-1 tracking-wider">
                        الوقت
                      </p>
                    </div>
                  </th>
                  {grid.rooms.map((room, idx) => (
                    <RoomColHeader
                      key={room.room_id}
                      room={room}
                      theme={THEMES[idx % THEMES.length]}
                      index={idx}
                      isOccupied={room.is_occupied}
                      remainLabel={getRoomCountdown(room)}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeSlots.map((slot, si) => {
                  const sm = grid.slotMap.get(slot);
                  const hasAny = sm && sm.size > 0;
                  const slotMins = toMins(slot);
                  const isCurrent =
                    isToday && Math.abs(nowMins - slotMins) < 15;
                  return (
                    <tr
                      key={slot}
                      className={`transition-all duration-300 ${isCurrent ? "bg-gradient-to-l from-[#2B6F5E]/[0.04] via-[#2B6F5E]/[0.02] to-transparent" : hasAny ? "hover:bg-[#FAFAF8]/50" : ""}`}
                    >
                      <td
                        className={`sticky right-0 z-10 px-2 py-2 text-center border-l border-[#D8CDC0]/8 transition-colors ${isCurrent ? "bg-[#2B6F5E]/[0.04]" : "bg-white"}`}
                      >
                        <div
                          className={`relative inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all duration-500 ${isCurrent ? "bg-gradient-to-r from-[#2B6F5E] to-[#3D8B6E] text-white shadow-lg shadow-[#2B6F5E]/30 scale-110" : hasAny ? "text-[#1B1B1B] font-semibold bg-[#FAFAF8] border border-[#D8CDC0]/15" : "text-[#D8CDC0]"}`}
                        >
                          {isCurrent && (
                            <LiveDot size="h-1.5 w-1.5" color="bg-white" />
                          )}
                          <span className="text-[11px] tabular-nums font-mono font-bold">
                            {slot}
                          </span>
                        </div>
                      </td>
                      {grid.rooms.map((room, idx) => {
                        const session = sm?.get(room.room_id);
                        const t = THEMES[idx % THEMES.length];
                        return (
                          <td
                            key={room.room_id}
                            className="px-1 py-1 border-l border-[#D8CDC0]/5 last:border-l-0"
                          >
                            {session ? (
                              <SessionCard
                                session={session}
                                theme={t}
                                delay={si * 25 + idx * 45}
                                now={now}
                              />
                            ) : (
                              <div
                                className={`h-[80px] rounded-[14px] transition-all duration-300 ${isCurrent ? "bg-[#2B6F5E]/[0.015] border border-dashed border-[#2B6F5E]/8" : "hover:bg-[#FAFAF8]/40"}`}
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3.5 border-t border-[#D8CDC0]/12 bg-gradient-to-l from-[#FAFAF8] to-white flex items-center justify-between">
            <span className="text-[11px] text-[#6B5D4F]/40 font-medium">
              {data?.total_rooms} قاعة · {totalSessions} حصة
            </span>
            <div
              className={`flex items-center gap-2 text-[11px] font-bold ${liveData.occupiedNow ? "text-emerald-600" : "text-[#BEB29E]"}`}
            >
              {liveData.occupiedNow ? (
                <>
                  <LiveDot size="h-2 w-2" color="bg-emerald-500" />
                  {liveData.occupiedNow} مشغولة حالياً
                </>
              ) : (
                "لا توجد قاعات مشغولة"
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ LIST VIEW ═══ */}
      {!isLoading && grid.rooms.length > 0 && viewMode === "list" && (
        <div className="space-y-4">
          {grid.rooms.map((room, idx) => {
            const t = THEMES[idx % THEMES.length];
            const occ = room.is_occupied;
            const countdown = getRoomCountdown(room);
            return (
              <div
                key={room.room_id}
                className="bg-white rounded-[20px] border border-[#D8CDC0]/25 overflow-hidden shadow-sm animate-[slideUp_0.45s_cubic-bezier(0.16,1,0.3,1)_both]"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div
                  className={`bg-gradient-to-l ${t.gradient} px-6 py-4 relative overflow-hidden`}
                >
                  <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/[0.06]" />
                  <div className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full bg-white/[0.04]" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.15] backdrop-blur-sm border border-white/[0.12] flex items-center justify-center">
                        {occ ? (
                          <DoorClosed className="w-5 h-5 text-white" />
                        ) : (
                          <DoorOpen className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-white">
                          {room.name}
                        </p>
                        {room.location && (
                          <p className="text-[10px] text-white/50 flex items-center gap-0.5 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {room.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-white/70 text-xs">
                      <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                        <Users className="w-3.5 h-3.5" /> {room.capacity} مقعد
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg font-bold border border-white/10">
                        {room.sessions_today} حصة
                      </div>
                      {occ ? (
                        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                          <LiveDot size="h-2 w-2" color="bg-white" />
                          <span className="font-bold">
                            مشغولة{countdown ? ` · ${countdown}` : ""}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-emerald-400/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-300/20">
                          <span className="font-bold text-emerald-100">
                            فارغة
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {room.sessions.length > 0 ? (
                  <div className="divide-y divide-[#D8CDC0]/8">
                    {room.sessions.map((session) => {
                      const live = isLiveAt(session, now);
                      const past = isPastAt(session, now);
                      const remain = live
                        ? fmtMins(minsLeft(session, now))
                        : null;
                      return (
                        <div
                          key={session.session_id}
                          className={`px-6 py-4 flex items-center gap-5 transition-all group ${past ? "opacity-50" : live ? "bg-[#C4A035]/[0.03]" : "hover:bg-[#FAFAF8]/60"}`}
                        >
                          <div
                            className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center shrink-0 transition-all group-hover:shadow-md group-hover:scale-105 ${past ? "bg-[#D8CDC0]/10 border-[#D8CDC0]/20" : live ? "bg-[#C4A035]/10 border-[#C4A035]/30" : `${t.light} ${t.border}`}`}
                          >
                            <Clock
                              className={`w-3.5 h-3.5 mb-0.5 ${past ? "text-[#BEB29E]" : live ? "text-[#C4A035]" : t.text}`}
                            />
                            <span
                              className={`text-[11px] font-bold tabular-nums ${past ? "text-[#BEB29E] line-through" : live ? "text-[#C4A035]" : t.text}`}
                            >
                              {fmt(session.session_date)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-sm font-bold truncate ${past ? "text-[#BEB29E]" : "text-[#1B1B1B]"}`}
                              >
                                {session.course_name}
                              </p>
                              {live && (
                                <span className="flex items-center gap-1 text-[9px] font-bold text-white bg-[#C4A035] px-1.5 py-0.5 rounded-full shrink-0">
                                  <LiveDot size="h-1 w-1" color="bg-white" />
                                  الآن
                                </span>
                              )}
                              {past && (
                                <span className="text-[9px] font-medium text-[#BEB29E] bg-[#D8CDC0]/15 px-1.5 py-0.5 rounded shrink-0">
                                  انتهت
                                </span>
                              )}
                            </div>
                            <div
                              className={`flex items-center gap-3 mt-1 text-xs ${past ? "text-[#BEB29E]" : "text-[#6B5D4F]/50"}`}
                            >
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />{" "}
                                {session.group_name}
                              </span>
                              {session.teacher_name && (
                                <span className="flex items-center gap-1">
                                  <GraduationCap className="w-3 h-3" />{" "}
                                  {session.teacher_name}
                                </span>
                              )}
                              {session.end_time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> ←{" "}
                                  {fmt(session.end_time)}
                                </span>
                              )}
                            </div>
                            {remain && (
                              <p className="text-[10px] text-[#C4A035]/60 mt-1 flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                تنتهي بعد {remain}
                              </p>
                            )}
                            {session.topic && (
                              <p className="text-[11px] text-[#BEB29E] truncate mt-1">
                                {session.topic}
                              </p>
                            )}
                          </div>
                          <div
                            className={`w-8 h-8 rounded-lg ${t.light} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
                          >
                            <ChevronLeft className={`w-4 h-4 ${t.text}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-[#D8CDC0]/10 flex items-center justify-center mb-2">
                      <CalendarDays className="w-5 h-5 text-[#BEB29E]" />
                    </div>
                    <p className="text-sm font-medium text-[#BEB29E]">
                      لا توجد حصص اليوم
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes headerDrop { from { opacity:0; transform:translateY(-12px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes cardReveal { from { opacity:0; transform:scale(0.92) translateY(4px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </div>
  );
}
