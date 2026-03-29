// src/pages/teacher/schedule/TeacherSchedule.tsx
//
// يعرض الجدول الزمني الثابت للأستاذ (TeacherScheduleEntry)
// بدلاً من الحصص اليومية — يستخدم GET /teacher/me/timetable
//
import { useState, useMemo } from "react";
import {
  CalendarDays,
  Clock,
  Layers,
  AlertCircle,
  DoorOpen,
  DoorClosed,
  MapPin,
  Users,
} from "lucide-react";
import {
  useMyTimetable,
  useTeacherRoomsOverview,
  type TeacherTimetableEntry,
} from "../../../../hooks/teacher/Useteacher";
import { useLanguage } from "../../../../hooks/useLanguage";

/* ═══ TYPES ═══ */
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

/* ═══ CONSTANTS ═══ */
const DAYS_COUNT = 6; // السبت=0 … الخميس=5
const DAYS: Record<number, Record<string, string>> = {
  0: { ar: "السبت", fr: "Samedi", en: "Saturday" },
  1: { ar: "الأحد", fr: "Dimanche", en: "Sunday" },
  2: { ar: "الإثنين", fr: "Lundi", en: "Monday" },
  3: { ar: "الثلاثاء", fr: "Mardi", en: "Tuesday" },
  4: { ar: "الأربعاء", fr: "Mercredi", en: "Wednesday" },
  5: { ar: "الخميس", fr: "Jeudi", en: "Thursday" },
};
const DAY_NUMS = [0, 1, 2, 3, 4, 5];

const LANG_META: Record<
  string,
  { color: string; bg: string; darkBg: string; border: string }
> = {
  FR: { color: "#1a56db", bg: "#eff6ff", darkBg: "#1e2d4a", border: "#bfdbfe" },
  EN: { color: "#047857", bg: "#ecfdf5", darkBg: "#0f2d20", border: "#a7f3d0" },
  ES: { color: "#b45309", bg: "#fffbeb", darkBg: "#2d2010", border: "#fde68a" },
  DE: { color: "#6d28d9", bg: "#f5f3ff", darkBg: "#1e1535", border: "#ddd6fe" },
  TR: { color: "#be123c", bg: "#fff1f2", darkBg: "#2d0f18", border: "#fecdd3" },
  GR: { color: "#0e7490", bg: "#ecfeff", darkBg: "#0a2030", border: "#a5f3fc" },
  IT: { color: "#9d174d", bg: "#fdf2f8", darkBg: "#2d0f20", border: "#f9a8d4" },
  ZH: { color: "#991b1b", bg: "#fef2f2", darkBg: "#2d0f0f", border: "#fecaca" },
};
const LANG_FLAGS: Record<string, string> = {
  FR: "🇫🇷",
  EN: "🇬🇧",
  ES: "🇪🇸",
  DE: "🇩🇪",
  TR: "🇹🇷",
  GR: "🇬🇷",
  IT: "🇮🇹",
  ZH: "🇨🇳",
};

/* ═══ HELPERS ═══ */
function getLangKey(lang: string): string {
  return lang === "ar" ? "ar" : lang === "fr" ? "fr" : "en";
}

function dayLabel(dayNum: number, lang: string) {
  return DAYS[dayNum]?.[getLangKey(lang)] ?? `يوم ${dayNum}`;
}

function fmtTime(t: string) {
  // t = "08:00"
  return t.slice(0, 5);
}

function duration(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) return "";
  const h = Math.floor(diff / 60),
    m = diff % 60;
  return h > 0 ? `${h}h${m > 0 ? m : ""}` : `${m}min`;
}

function isNowInSlot(dayOfWeek: number, start: string, end: string): boolean {
  const now = new Date();
  const nowDay = now.getDay(); // 0=Sun,6=Sat
  // convert JS day to our day (0=Sat)
  const ourDay = nowDay === 0 ? 1 : nowDay === 6 ? 0 : nowDay + 1;
  if (ourDay !== dayOfWeek) return false;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= sh * 60 + sm && nowMin < eh * 60 + em;
}

function isToday(dayOfWeek: number): boolean {
  const now = new Date();
  const nowDay = now.getDay();
  const ourDay = nowDay === 0 ? 1 : nowDay === 6 ? 0 : nowDay + 1;
  return ourDay === dayOfWeek;
}

// Live dot component
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

/* ═══ ENTRY CARD ═══ */
function EntryCard({
  entry,
  compact = false,
}: {
  entry: TeacherTimetableEntry;
  compact?: boolean;
}) {
  const live = isNowInSlot(entry.day_of_week, entry.start_time, entry.end_time);
  const meta = LANG_META[entry.language] ?? LANG_META["FR"];
  const flag = LANG_FLAGS[entry.language] ?? "🌐";
  const dur = duration(entry.start_time, entry.end_time);

  if (compact) {
    return (
      <div
        className={`rounded-lg p-2 border transition-all ${live ? "ring-1 ring-[#2B6F5E] dark:ring-[#4ADE80]/40" : ""}`}
        style={{
          background: `color-mix(in srgb, ${meta.color} 8%, transparent)`,
          borderColor: `color-mix(in srgb, ${meta.color} 25%, transparent)`,
          borderRightWidth: 3,
          borderRightColor: meta.color,
          position: "relative",
        }}
      >
        {live && (
          <div className="absolute top-1.5 left-1.5">
            <LiveDot size="h-1.5 w-1.5" />
          </div>
        )}
        <div className="flex items-center gap-1 mb-1">
          <span
            className="text-[9px] font-mono font-bold"
            style={{ color: meta.color }}
          >
            {fmtTime(entry.start_time)}
          </span>
          {dur && (
            <span
              className="text-[8px] opacity-50"
              style={{ color: meta.color }}
            >
              · {dur}
            </span>
          )}
        </div>
        <p className="text-[10px] font-bold truncate text-[#1B1B1B] dark:text-[#E5E5E5]">
          {entry.group?.course?.course_name ?? entry.group_label}
        </p>
        {entry.group && (
          <p className="text-[9px] truncate text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
            {entry.group.name}
          </p>
        )}
        <div className="flex items-center gap-1 mt-1">
          <span
            className="text-[8px] font-bold text-white px-1 py-0.5 rounded"
            style={{ background: meta.color }}
          >
            {flag} {entry.language}
          </span>
          <span className="text-[8px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
            {entry.level}
          </span>
        </div>
        {entry.room && (
          <p className="text-[8px] text-[#6B5D4F]/40 dark:text-[#AAAAAA]/40 flex items-center gap-0.5 mt-0.5">
            <DoorOpen className="w-2 h-2 shrink-0" />
            {entry.room.name}
          </p>
        )}
      </div>
    );
  }

  // full card for day view
  return (
    <div
      className={`rounded-xl p-4 border transition-all ${live ? "ring-2 ring-[#2B6F5E]/50 dark:ring-[#4ADE80]/30" : ""}`}
      style={{
        background: `color-mix(in srgb, ${meta.color} 6%, white)`,
        borderColor: `color-mix(in srgb, ${meta.color} 20%, transparent)`,
        borderRightWidth: 4,
        borderRightColor: meta.color,
      }}
    >
      {live && (
        <div className="flex items-center gap-1.5 mb-3">
          <LiveDot />
          <span className="text-[10px] font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
            جارية الآن
          </span>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
            {entry.group?.course?.course_name ?? entry.group_label}
          </h4>
          {entry.group && (
            <div className="flex items-center gap-2 mt-1 text-[11px] text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60 flex-wrap">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {entry.group.name}
              </span>
              <span>· {entry.level}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
            style={{ background: meta.color }}
          >
            {flag} {entry.language}
          </span>
          <span
            className="text-[10px] font-mono font-bold"
            style={{ color: meta.color }}
          >
            {fmtTime(entry.start_time)} ← {fmtTime(entry.end_time)}
          </span>
          {dur && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-medium"
              style={{
                background: `color-mix(in srgb, ${meta.color} 10%, transparent)`,
                color: meta.color,
              }}
            >
              ⏱ {dur}
            </span>
          )}
        </div>
      </div>
      {entry.room && (
        <div className="flex items-center gap-1 mt-2.5 text-[11px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
          <DoorOpen className="w-3.5 h-3.5" />
          <span>{entry.room.name}</span>
        </div>
      )}
      {entry.notes && (
        <p className="text-[10px] text-[#6B5D4F]/40 dark:text-[#AAAAAA]/40 mt-2 truncate">
          {entry.notes}
        </p>
      )}
    </div>
  );
}

/* ═══ DAY COLUMN (Week view) ═══ */
function DayColumn({
  dayNum,
  entries,
  lang,
}: {
  dayNum: number;
  entries: TeacherTimetableEntry[];
  lang: string;
}) {
  const today = isToday(dayNum);
  const hasLive = entries.some((e) =>
    isNowInSlot(e.day_of_week, e.start_time, e.end_time),
  );
  const sorted = [...entries].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );

  return (
    <div
      className={`flex flex-col rounded-xl border min-h-[200px] transition-all
      ${
        hasLive
          ? "border-[#2B6F5E]/40 dark:border-[#4ADE80]/40 bg-[#2B6F5E]/[0.03] shadow-sm"
          : today
            ? "border-[#2B6F5E]/25 dark:border-[#4ADE80]/20 bg-[#2B6F5E]/[0.02]"
            : "border-[#D8CDC0]/30 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A]"
      }`}
    >
      {/* Header */}
      <div
        className={`px-2.5 py-2 border-b text-center
        ${
          hasLive
            ? "border-[#2B6F5E]/20 dark:border-[#4ADE80]/20"
            : today
              ? "border-[#2B6F5E]/15 dark:border-[#4ADE80]/15"
              : "border-[#D8CDC0]/20 dark:border-[#2A2A2A]"
        }`}
      >
        <p
          className={`text-[11px] font-bold
          ${today || hasLive ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60"}`}
        >
          {dayLabel(dayNum, lang)}
        </p>
        {hasLive ? (
          <div className="flex justify-center mt-0.5">
            <LiveDot size="h-1.5 w-1.5" />
          </div>
        ) : today ? (
          <div className="w-1.5 h-1.5 rounded-full bg-[#2B6F5E] dark:bg-[#4ADE80] mx-auto mt-0.5" />
        ) : null}
      </div>
      {/* Entries */}
      <div className="flex-1 p-1.5 space-y-1.5">
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[60px]">
            <span className="text-[10px] text-[#BEB29E] dark:text-[#888888]">
              —
            </span>
          </div>
        ) : (
          sorted.map((e) => <EntryCard key={e.entry_id} entry={e} compact />)
        )}
      </div>
    </div>
  );
}

/* ═══ DAY VIEW ═══ */
function DayView({
  dayNum,
  entries,
  lang,
}: {
  dayNum: number;
  entries: TeacherTimetableEntry[];
  lang: string;
}) {
  const today = isToday(dayNum);
  const sorted = [...entries].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );
  const liveCount = sorted.filter((e) =>
    isNowInSlot(e.day_of_week, e.start_time, e.end_time),
  ).length;

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] px-5 py-3">
        <div
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0
          ${today ? "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10" : "bg-[#D8CDC0]/10 dark:bg-[#2A2A2A]/20"}`}
        >
          <span
            className={`text-[10px] font-bold ${today ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50"}`}
          >
            {dayLabel(dayNum, lang).slice(0, 3)}
          </span>
          {today && (
            <div className="w-1.5 h-1.5 rounded-full bg-[#2B6F5E] dark:bg-[#4ADE80] mt-1" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {dayLabel(dayNum, lang)}
          </p>
          <p className="text-[11px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
            {today ? "اليوم" : "يوم الأسبوع"}
          </p>
        </div>
        <div className="ms-auto flex items-center gap-2">
          {liveCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 px-2.5 py-1 rounded-full">
              <LiveDot size="h-1.5 w-1.5" />
              {liveCount} جارية
            </span>
          )}
          <span className="text-xs font-bold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 px-2.5 py-1 rounded-full">
            {sorted.length} حصة
          </span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] flex flex-col items-center justify-center py-16 text-center">
          <CalendarDays className="w-8 h-8 text-[#BEB29E] dark:text-[#888888] mb-3" />
          <p className="text-sm text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
            لا توجد حصص هذا اليوم
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sorted.map((e) => (
            <EntryCard key={e.entry_id} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══ ROOMS VIEW (unchanged logic) ═══ */
function isLiveAt(
  s: { session_date: string; end_time: string | null },
  now: Date,
) {
  const st = new Date(s.session_date);
  const en = s.end_time
    ? new Date(s.end_time)
    : new Date(st.getTime() + 90 * 60000);
  return now >= st && now <= en;
}

function RoomsView({ date }: { date: Date }) {
  const dateStr = date.toISOString().split("T")[0];
  const { data, isLoading } = useTeacherRoomsOverview(dateStr);
  const [now, setNow] = useState(() => new Date());
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
            className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] h-[180px]"
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] px-4 py-3 flex-wrap">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <span className="text-xs text-[#6B5D4F] dark:text-[#AAAAAA]">
            <span className="font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
              {rd.free_now}
            </span>{" "}
            متاحة
          </span>
          <span className="text-xs text-[#6B5D4F] dark:text-[#AAAAAA]">
            <span className="font-bold text-[#C4A035]">{rd.occupied_now}</span>{" "}
            مشغولة
          </span>
          <span className="text-xs text-[#BEB29E] dark:text-[#888888]">
            من أصل {rd.total_rooms}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-[#D8CDC0]/10 dark:bg-[#2A2A2A]/20 p-0.5 rounded-lg">
          {(["all", "free", "occupied"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-7 px-3 text-[10px] font-medium rounded-md transition-all
                ${filter === f ? "bg-white dark:bg-[#1A1A1A] text-[#2B6F5E] dark:text-[#4ADE80] shadow-sm" : "text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50"}`}
            >
              {f === "all" ? "الكل" : f === "free" ? "متاحة" : "مشغولة"}
            </button>
          ))}
        </div>
      </div>
      {sorted.length === 0 ? (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] flex flex-col items-center justify-center py-16 text-center">
          <DoorOpen className="w-8 h-8 text-[#BEB29E] dark:text-[#888888] mb-3" />
          <p className="text-sm text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60">
            لا توجد قاعات
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {sorted.map((r) => {
            const occ = r.is_occupied;
            const active = r.sessions.find((s) => isLiveAt(s, now));
            return (
              <div
                key={r.room_id}
                className={`rounded-xl border overflow-hidden bg-white dark:bg-[#1A1A1A] transition-all hover:shadow-md ${occ ? "border-[#C4A035]/30" : "border-[#2B6F5E]/20 dark:border-[#4ADE80]/20"}`}
              >
                <div
                  className={`flex items-center justify-between px-4 py-3 border-b ${occ ? "border-[#C4A035]/15 bg-[#C4A035]/5" : "border-[#2B6F5E]/10 bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${occ ? "bg-[#C4A035]/15" : "bg-[#2B6F5E]/15 dark:bg-[#4ADE80]/15"}`}
                    >
                      {occ ? (
                        <DoorClosed className="w-4 h-4 text-[#C4A035]" />
                      ) : (
                        <DoorOpen className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                        {r.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
                        {r.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {r.location}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <Users className="w-2.5 h-2.5" />
                          {r.capacity}
                        </span>
                      </div>
                    </div>
                  </div>
                  {occ ? (
                    <div className="flex items-center gap-1.5">
                      <LiveDot size="h-2 w-2" color="bg-[#C4A035]" />
                      <span className="text-[10px] font-bold text-[#C4A035]">
                        مشغولة
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 px-2 py-0.5 rounded-full">
                      متاحة
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-1.5">
                  {r.sessions.length === 0 ? (
                    <p className="text-xs text-center py-3 text-[#2B6F5E]/60 dark:text-[#4ADE80]/60 flex items-center justify-center gap-1">
                      <DoorOpen className="w-3.5 h-3.5" />
                      متاحة طول اليوم
                    </p>
                  ) : (
                    r.sessions.map((s) => {
                      const live = isLiveAt(s, now);
                      const past =
                        new Date(
                          s.end_time ||
                            new Date(s.session_date).getTime() + 90 * 60000,
                        ) < now;
                      return (
                        <div
                          key={s.session_id}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg ${live ? "bg-[#C4A035]/8 border border-[#C4A035]/15" : past ? "opacity-40 border border-transparent bg-[#D8CDC0]/5 dark:bg-[#2A2A2A]/5" : s.is_mine ? "bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border border-[#2B6F5E]/10 dark:border-[#4ADE80]/10" : "bg-[#D8CDC0]/8 dark:bg-[#2A2A2A]/8 border border-transparent"}`}
                        >
                          <div className="shrink-0 text-center w-16">
                            <p
                              className={`text-[11px] font-bold ${live ? "text-[#C4A035]" : past ? "text-[#BEB29E] line-through" : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
                            >
                              {new Date(s.session_date).toLocaleTimeString(
                                "ar-DZ",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                          <div
                            className={`w-0.5 h-8 rounded-full shrink-0 ${live ? "bg-[#C4A035]" : s.is_mine ? "bg-[#2B6F5E] dark:bg-[#4ADE80]" : "bg-[#D8CDC0]"}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-medium truncate ${past ? "text-[#BEB29E]" : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
                            >
                              {s.course_name}
                            </p>
                            <p className="text-[10px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50 truncate">
                              {s.group_name}
                            </p>
                          </div>
                          {live && (
                            <span className="text-[8px] font-bold text-white bg-[#C4A035] px-1.5 py-0.5 rounded-full shrink-0">
                              الآن
                            </span>
                          )}
                          {s.is_mine && !live && !past && (
                            <span className="text-[8px] font-bold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 px-1 py-0.5 rounded shrink-0">
                              حصتي
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══ MAIN ═══ */
export default function TeacherSchedule() {
  const { t, dir, currentLang } = useLanguage();
  const { data, isLoading, isError } = useMyTimetable();
  const [vm, setVm] = useState<ViewMode>("week");
  const [day, setDay] = useState<number>(() => {
    // detect today's day (our 0=Sat convention)
    const d = new Date().getDay();
    return d === 0 ? 1 : d === 6 ? 0 : d + 1;
  });

  const entries: TeacherTimetableEntry[] = data?.entries ?? [];

  // group entries by day
  const byDay = useMemo(() => {
    const m: Record<number, TeacherTimetableEntry[]> = {};
    for (let i = 0; i < DAYS_COUNT; i++) m[i] = [];
    entries.forEach((e) => {
      (m[e.day_of_week] ??= []).push(e);
    });
    return m;
  }, [entries]);

  const totalThisDay = byDay[day]?.length ?? 0;
  const totalAll = entries.length;
  const todayDayNum = (() => {
    const d = new Date().getDay();
    return d === 0 ? 1 : d === 6 ? 0 : d + 1;
  })();
  const hasAnyLive = entries.some((e) =>
    isNowInSlot(e.day_of_week, e.start_time, e.end_time),
  );

  if (isLoading)
    return (
      <div className="space-y-6 animate-pulse" dir={dir}>
        <div className="h-8 w-48 bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/30 rounded-lg" />
        <div className="h-12 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A]" />
        <div className="grid grid-cols-6 gap-2">
          {DAY_NUMS.map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] h-[200px]"
            />
          ))}
        </div>
      </div>
    );

  if (isError)
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
          تعذّر تحميل الجدول
        </h3>
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          حاول مرة أخرى أو تواصل مع الإدارة
        </p>
      </div>
    );

  return (
    <div dir={dir} className="space-y-5 pb-8">
      {/* ── Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("teacher.schedule.title")}
          </h1>
          <p className="text-sm text-[#6B5D4F]/70 dark:text-[#999999] mt-0.5 flex items-center gap-2">
            {t("teacher.schedule.subtitle")}
            {hasAnyLive && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 px-2 py-0.5 rounded-full">
                <LiveDot size="h-1.5 w-1.5" /> جارية الآن
              </span>
            )}
          </p>
        </div>
        {/* View switcher */}
        <div className="flex items-center gap-1 bg-[#D8CDC0]/10 dark:bg-[#2A2A2A]/30 p-1 rounded-xl self-start sm:self-auto">
          {[
            { k: "week" as const, l: t("teacher.schedule.week") },
            { k: "day" as const, l: t("teacher.schedule.day") },
            { k: "rooms" as const, l: t("teacher.schedule.rooms") },
          ].map((m) => (
            <button
              key={m.k}
              onClick={() => setVm(m.k)}
              className={`h-8 px-4 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5
                ${vm === m.k ? "bg-white dark:bg-[#1A1A1A] text-[#2B6F5E] dark:text-[#4ADE80] shadow-sm" : "text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60"}`}
            >
              {m.k === "rooms" && <DoorOpen className="w-3.5 h-3.5" />}
              {m.l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Nav bar (day selector for week/day, date for rooms) ── */}
      {vm !== "rooms" && (
        <div className="flex items-center bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] px-4 py-2.5 gap-2 overflow-x-auto">
          {/* Today button */}
          <button
            onClick={() => setDay(todayDayNum)}
            className="h-8 px-3 text-xs font-medium text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 hover:bg-[#2B6F5E]/15 rounded-lg shrink-0"
          >
            اليوم
          </button>
          <div className="w-px h-5 bg-[#D8CDC0] dark:bg-[#2A2A2A] shrink-0" />
          {/* Day pills */}
          {DAY_NUMS.map((d) => {
            const cnt = byDay[d]?.length ?? 0;
            const todayD = d === todayDayNum;
            const selD = d === day;
            const hasLiveD = (byDay[d] ?? []).some((e) =>
              isNowInSlot(e.day_of_week, e.start_time, e.end_time),
            );
            return (
              <button
                key={d}
                onClick={() => setDay(d)}
                className={`h-8 px-3 text-[11px] font-medium rounded-lg transition-all shrink-0 flex items-center gap-1.5
                  ${selD ? "bg-[#264230] text-white shadow-sm" : todayD ? "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70 hover:bg-[#D8CDC0]/10 dark:hover:bg-[#2A2A2A]/20"}`}
              >
                {hasLiveD && !selD && <LiveDot size="h-1.5 w-1.5" />}
                {dayLabel(d, currentLang)}
                {cnt > 0 && (
                  <span
                    className={`text-[9px] font-bold px-1 py-0.5 rounded-full ${selD ? "bg-white/20 text-white" : "bg-[#264230]/10 text-[#264230] dark:bg-[#4ADE80]/10 dark:text-[#4ADE80]"}`}
                  >
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
          {/* Stats */}
          <div className="ms-auto flex items-center gap-3 text-[11px] text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60 shrink-0">
            {vm === "week" ? (
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {totalAll} حصة / أسبوع
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {totalThisDay} حصة
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {vm === "week" && (
        <div className="grid grid-cols-6 gap-2">
          {DAY_NUMS.map((d) => (
            <DayColumn
              key={d}
              dayNum={d}
              entries={byDay[d] ?? []}
              lang={currentLang}
            />
          ))}
        </div>
      )}

      {vm === "day" && (
        <DayView dayNum={day} entries={byDay[day] ?? []} lang={currentLang} />
      )}

      {vm === "rooms" && <RoomsView date={new Date()} />}

      {/* ── Weekly summary table ── */}
      {vm !== "rooms" && entries.length > 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#D8CDC0]/25 dark:border-[#2A2A2A]">
            <div className="w-8 h-8 rounded-lg bg-[#C4A035]/8 dark:bg-[#C4A035]/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#C4A035]" />
            </div>
            <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              كل الحصص
            </h3>
            <span className="text-[11px] text-[#BEB29E] dark:text-[#888888] ms-auto">
              {totalAll} حصة
            </span>
          </div>
          <div className="divide-y divide-[#D8CDC0]/20 dark:divide-[#2A2A2A]">
            {[...entries]
              .sort(
                (a, b) =>
                  a.day_of_week - b.day_of_week ||
                  a.start_time.localeCompare(b.start_time),
              )
              .map((e) => {
                const live = isNowInSlot(
                  e.day_of_week,
                  e.start_time,
                  e.end_time,
                );
                const meta = LANG_META[e.language] ?? LANG_META["FR"];
                const flag = LANG_FLAGS[e.language] ?? "🌐";
                return (
                  <div
                    key={e.entry_id}
                    className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[#FAFAF8] dark:hover:bg-[#222222] ${live ? "bg-[#2B6F5E]/[0.02]" : ""}`}
                  >
                    <div
                      className="w-1 h-8 rounded-full shrink-0"
                      style={{ background: meta.color }}
                    />
                    <div className="flex flex-col items-center justify-center w-14 h-10 rounded-lg bg-[#D8CDC0]/8 dark:bg-[#2A2A2A]/10 shrink-0">
                      <span className="text-[9px] font-medium text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50 leading-tight">
                        {dayLabel(e.day_of_week, currentLang).slice(0, 4)}
                      </span>
                      <span className="text-[10px] font-bold text-[#1B1B1B] dark:text-[#E5E5E5] leading-tight font-mono">
                        {fmtTime(e.start_time)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                          {e.group?.course?.course_name ?? e.group_label}
                        </p>
                        {live && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-white bg-[#2B6F5E] dark:bg-[#4ADE80] px-1.5 py-0.5 rounded-full shrink-0">
                            <LiveDot size="h-1 w-1" color="bg-white" /> الآن
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50 mt-0.5 flex-wrap">
                        {e.group && (
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {e.group.name}
                          </span>
                        )}
                        <span>
                          · {fmtTime(e.start_time)} ← {fmtTime(e.end_time)}
                        </span>
                        {e.room && (
                          <span className="flex items-center gap-1">
                            <DoorOpen className="w-3 h-3" />
                            {e.room.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: meta.color }}
                    >
                      {flag} {e.language}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
