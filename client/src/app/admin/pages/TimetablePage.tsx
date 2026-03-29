// src/pages/admin/TimetablePage.tsx

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  useAdminTimetable,
  useCreateEntry,
  useDeleteEntry,
  useRooms,
  useTimetableConfig,
  useSaveConfig,
  useResetConfig,
} from "../../../hooks/admin/useTimetable";
import {
  useTeacherSchedule,
  useCreateTeacherEntry,
  useDeleteTeacherEntry,
  useTeachers,
  useTeacherGroups,
} from "../../../hooks/admin/useTeacherSchedule";
import type {
  TimetableEntry,
  SlotConfig,
} from "../../../lib/api/admin/timetable.api";
import type { TeacherScheduleEntry } from "../../../lib/api/admin/teacherSchedule.api";

// ══════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════

const DAYS_AR: Record<number, string> = {
  0: "السبت",
  1: "الأحد",
  2: "الإثنين",
  3: "الثلاثاء",
  4: "الأربعاء",
  5: "الخميس",
};
const DAYS = [0, 1, 2, 3, 4, 5];

const LANG_META: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  FR: { label: "فرنسية", color: "#1a56db", bg: "#eff6ff", border: "#bfdbfe" },
  EN: { label: "إنجليزية", color: "#047857", bg: "#ecfdf5", border: "#a7f3d0" },
  ES: { label: "إسبانية", color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  DE: { label: "ألمانية", color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
  TR: { label: "تركية", color: "#be123c", bg: "#fff1f2", border: "#fecdd3" },
  GR: { label: "يونانية", color: "#0e7490", bg: "#ecfeff", border: "#a5f3fc" },
  IT: { label: "إيطالية", color: "#9d174d", bg: "#fdf2f8", border: "#f9a8d4" },
  ZH: { label: "صينية", color: "#991b1b", bg: "#fef2f2", border: "#fecaca" },
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
const LANGUAGES = Object.keys(LANG_META);
const LEVELS = ["PRE_A1", "A1", "A1,1", "A2", "B1", "B2", "C1", "قاعدي"];
type Slot = SlotConfig;
const DEFAULT_SLOTS: Slot[] = [
  { id: "s1", start: "08:00", end: "09:30" },
  { id: "s2", start: "09:30", end: "11:00" },
  { id: "s3", start: "11:00", end: "12:30" },
  { id: "s4", start: "12:30", end: "14:00" },
  { id: "s5", start: "14:00", end: "15:30" },
  { id: "s6", start: "15:30", end: "17:00" },
  { id: "s7", start: "17:00", end: "19:00" },
];

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function formatDuration(start: string, end: string) {
  const diff = timeToMinutes(end) - timeToMinutes(start);
  if (diff <= 0) return "";
  const h = Math.floor(diff / 60),
    m = diff % 60;
  return h > 0 ? `${h}س${m > 0 ? ` ${m}د` : ""}` : `${m}د`;
}

// ══════════════════════════════════════════════════════════════
// SHARED — EntryBadge (القاعات)
// ══════════════════════════════════════════════════════════════

function EntryBadge({
  entry,
  onDelete,
}: {
  entry: TimetableEntry;
  onDelete: () => void;
}) {
  const meta = LANG_META[entry.language] ?? LANG_META["FR"];
  const flag = LANG_FLAGS[entry.language] ?? "🌐";
  const dur = formatDuration(entry.start_time, entry.end_time);
  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${meta.border}`,
        borderRight: `4px solid ${meta.color}`,
        borderRadius: 10,
        padding: "8px 10px 8px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        fontFamily: "'Tajawal', sans-serif",
        direction: "rtl",
        position: "relative",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 15, lineHeight: 1 }}>{flag}</span>
        <span
          style={{
            background: meta.color,
            color: "#fff",
            borderRadius: 6,
            padding: "2px 8px",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {entry.language}
        </span>
        <span style={{ color: meta.color, fontSize: 12, fontWeight: 700 }}>
          {meta.label}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            background: "#f3f4f6",
            color: "#111827",
            borderRadius: 6,
            padding: "2px 8px",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {entry.group_label}
        </span>
        {entry.room?.name && (
          <span
            style={{
              background: "#264230",
              color: "#C4A035",
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            🚪 {entry.room.name}
          </span>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          direction: "ltr",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "#6b7280",
            fontFamily: "monospace",
            fontWeight: 600,
          }}
        >
          {entry.start_time} – {entry.end_time}
        </span>
        {dur && (
          <span
            style={{
              background: meta.bg,
              color: meta.color,
              borderRadius: 4,
              padding: "1px 6px",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            ⏱ {dur}
          </span>
        )}
      </div>
      <button
        onClick={onDelete}
        title="حذف الحصة"
        style={{
          position: "absolute",
          top: 6,
          left: 6,
          background: "#fef2f2",
          border: "none",
          borderRadius: 6,
          width: 20,
          height: 20,
          cursor: "pointer",
          color: "#ef4444",
          fontSize: 12,
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.6,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0.6";
        }}
      >
        ×
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SHARED — TeacherEntryBadge (الأساتذة)
// ══════════════════════════════════════════════════════════════

function TeacherEntryBadge({
  entry,
  onDelete,
}: {
  entry: TeacherScheduleEntry;
  onDelete: () => void;
}) {
  const meta = LANG_META[entry.language] ?? LANG_META["FR"];
  const flag = LANG_FLAGS[entry.language] ?? "🌐";
  const dur = formatDuration(entry.start_time, entry.end_time);
  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${meta.border}`,
        borderRight: `4px solid ${meta.color}`,
        borderRadius: 10,
        padding: "8px 10px 8px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontFamily: "'Tajawal', sans-serif",
        direction: "rtl",
        position: "relative",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: 14 }}>{flag}</span>
        <span
          style={{
            background: meta.color,
            color: "#fff",
            borderRadius: 5,
            padding: "1px 7px",
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          {entry.language}
        </span>
        <span style={{ color: meta.color, fontSize: 11, fontWeight: 700 }}>
          {meta.label}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            background: "#f3f4f6",
            color: "#111827",
            borderRadius: 5,
            padding: "1px 7px",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {entry.group?.name ?? entry.group_label}
        </span>
        {entry.group?.course?.course_name && (
          <span
            style={{
              background: "#eff6ff",
              color: "#1a56db",
              borderRadius: 5,
              padding: "1px 7px",
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            {entry.group.course.course_name}
          </span>
        )}
        {entry.room?.name && (
          <span
            style={{
              background: "#264230",
              color: "#C4A035",
              borderRadius: 5,
              padding: "1px 7px",
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            🚪 {entry.room.name}
          </span>
        )}
      </div>
      <div
        style={{
          direction: "ltr",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: "#6b7280",
            fontFamily: "monospace",
            fontWeight: 600,
          }}
        >
          {entry.start_time} – {entry.end_time}
        </span>
        {dur && (
          <span
            style={{
              background: meta.bg,
              color: meta.color,
              borderRadius: 4,
              padding: "0 5px",
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            ⏱ {dur}
          </span>
        )}
      </div>
      <button
        onClick={onDelete}
        style={{
          position: "absolute",
          top: 6,
          left: 6,
          background: "#fef2f2",
          border: "none",
          borderRadius: 5,
          width: 18,
          height: 18,
          cursor: "pointer",
          color: "#ef4444",
          fontSize: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.6,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0.6";
        }}
      >
        ×
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SLOT MANAGER MODAL
// ══════════════════════════════════════════════════════════════

function SlotManagerModal({
  slots,
  onSave,
  onReset,
  onClose,
  isSaving = false,
}: {
  slots: Slot[];
  onSave: (s: Slot[]) => void;
  onReset: () => void;
  onClose: () => void;
  isSaving?: boolean;
}) {
  const [draft, setDraft] = useState<Slot[]>(slots.map((s) => ({ ...s })));
  const [error, setError] = useState<string | null>(null);

  function addSlot() {
    const last = draft[draft.length - 1];
    const startMin = last ? timeToMinutes(last.end) : 8 * 60;
    const endMin = startMin + 90;
    const fmt = (m: number) =>
      `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    setDraft([
      ...draft,
      {
        id: `s${Date.now()}`,
        start: fmt(startMin),
        end: fmt(Math.min(endMin, 23 * 60)),
      },
    ]);
    setError(null);
  }
  function removeSlot(id: string) {
    if (draft.length <= 1) return;
    setDraft(draft.filter((s) => s.id !== id));
    setError(null);
  }
  function updateSlot(id: string, field: "start" | "end", value: string) {
    setDraft(draft.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    setError(null);
  }
  function validate(): Slot[] | null {
    for (const s of draft) {
      if (!/^\d{2}:\d{2}$/.test(s.start) || !/^\d{2}:\d{2}$/.test(s.end)) {
        setError("تأكد من صيغة الوقت HH:MM");
        return null;
      }
      if (timeToMinutes(s.start) >= timeToMinutes(s.end)) {
        setError(`${s.start} - ${s.end}: البداية قبل النهاية`);
        return null;
      }
    }
    const sorted = [...draft].sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
    );
    for (let i = 0; i < sorted.length - 1; i++) {
      if (timeToMinutes(sorted[i].end) > timeToMinutes(sorted[i + 1].start)) {
        setError(`تعارض: ${sorted[i].start}-${sorted[i].end}`);
        return null;
      }
    }
    return sorted;
  }
  function handleSave() {
    const s = validate();
    if (!s) return;
    onSave(s);
    onClose();
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 28,
          width: 460,
          maxHeight: "88vh",
          overflowY: "auto",
          direction: "rtl",
          fontFamily: "'Tajawal', sans-serif",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
              إدارة الفترات الزمنية
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              {draft.length} فترة · تُحفظ في قاعدة البيانات
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: 8,
              padding: "4px 10px",
              cursor: "pointer",
              fontSize: 18,
              color: "#374151",
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {draft.map((slot, i) => {
            const dur = timeToMinutes(slot.end) - timeToMinutes(slot.start);
            return (
              <div
                key={slot.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#f9fafb",
                  borderRadius: 10,
                  padding: "10px 12px",
                  border: "1.5px solid #e5e7eb",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#264230",
                    background: "#d1fae5",
                    borderRadius: 6,
                    padding: "2px 7px",
                    minWidth: 22,
                    textAlign: "center",
                  }}
                >
                  {i + 1}
                </span>
                <input
                  type="time"
                  value={slot.start}
                  onChange={(e) => updateSlot(slot.id, "start", e.target.value)}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    borderRadius: 8,
                    border: "1.5px solid #d1d5db",
                    fontSize: 13,
                    outline: "none",
                    direction: "ltr",
                  }}
                />
                <span style={{ color: "#9ca3af", fontSize: 14 }}>←</span>
                <input
                  type="time"
                  value={slot.end}
                  onChange={(e) => updateSlot(slot.id, "end", e.target.value)}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    borderRadius: 8,
                    border: "1.5px solid #d1d5db",
                    fontSize: 13,
                    outline: "none",
                    direction: "ltr",
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: dur > 0 ? "#264230" : "#ef4444",
                    background: dur > 0 ? "#f0fdf4" : "#fef2f2",
                    borderRadius: 6,
                    padding: "2px 7px",
                    minWidth: 36,
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  {dur > 0 ? `${dur}د` : "!"}
                </span>
                <button
                  onClick={() => removeSlot(slot.id)}
                  disabled={draft.length <= 1}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 18,
                    lineHeight: 1,
                    color: draft.length > 1 ? "#ef4444" : "#d1d5db",
                    cursor: draft.length > 1 ? "pointer" : "not-allowed",
                    padding: "0 2px",
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 12,
              fontSize: 12,
              color: "#dc2626",
            }}
          >
            ⚠️ {error}
          </div>
        )}
        <button
          onClick={addSlot}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: 10,
            marginBottom: 16,
            border: "1.5px dashed #264230",
            background: "#f0fdf4",
            color: "#264230",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Tajawal', sans-serif",
          }}
        >
          + إضافة فترة جديدة
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: isSaving ? "#9ca3af" : "#264230",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: isSaving ? "not-allowed" : "pointer",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            {isSaving ? "جارٍ الحفظ..." : "💾 حفظ الفترات"}
          </button>
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            disabled={isSaving}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1.5px solid #fecaca",
              background: "#fef2f2",
              color: "#dc2626",
              fontWeight: 600,
              fontSize: 13,
              cursor: isSaving ? "not-allowed" : "pointer",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            إعادة تعيين
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ADD MODAL — القاعات
// ══════════════════════════════════════════════════════════════

function AddModal({
  day,
  rooms,
  onClose,
  onCreate,
  isPending,
}: {
  day: number;
  rooms: { room_id: string; name: string }[];
  onClose: () => void;
  onCreate: (payload: any) => void;
  isPending: boolean;
}) {
  const [roomId, setRoomId] = useState(rooms[0]?.room_id ?? "");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("09:30");
  const [level, setLevel] = useState("A1");
  const [lang, setLang] = useState("FR");
  const [groupNum, setGroupNum] = useState("01");
  const [timeErr, setTimeErr] = useState<string | null>(null);
  const meta = LANG_META[lang];
  const duration = formatDuration(start, end);

  function handleSubmit() {
    setTimeErr(null);
    if (!roomId) return;
    if (timeToMinutes(start) >= timeToMinutes(end)) {
      setTimeErr("وقت البداية يجب أن يكون قبل وقت النهاية");
      return;
    }
    onCreate({
      room_id: roomId,
      day_of_week: day,
      start_time: start,
      end_time: end,
      level,
      language: lang,
      group_label: `${level} ${groupNum}`.trim(),
    });
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 28,
          minWidth: 380,
          maxWidth: 440,
          width: "90%",
          direction: "rtl",
          fontFamily: "'Tajawal', sans-serif",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
              إضافة حصة
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              {DAYS_AR[day]}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: 8,
              padding: "4px 10px",
              cursor: "pointer",
              fontSize: 16,
              color: "#374151",
            }}
          >
            ×
          </button>
        </div>
        {/* الوقت */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              display: "block",
              marginBottom: 8,
            }}
          >
            الفترة الزمنية
          </label>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>
                من
              </div>
              <input
                type="time"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  setTimeErr(null);
                }}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: 8,
                  border: `1.5px solid ${timeErr ? "#fca5a5" : "#d1d5db"}`,
                  fontSize: 15,
                  fontFamily: "monospace",
                  outline: "none",
                  boxSizing: "border-box",
                  direction: "ltr",
                }}
              />
            </div>
            <div style={{ paddingTop: 18, color: "#9ca3af", fontSize: 18 }}>
              ←
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>
                إلى
              </div>
              <input
                type="time"
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value);
                  setTimeErr(null);
                }}
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  borderRadius: 8,
                  border: `1.5px solid ${timeErr ? "#fca5a5" : "#d1d5db"}`,
                  fontSize: 15,
                  fontFamily: "monospace",
                  outline: "none",
                  boxSizing: "border-box",
                  direction: "ltr",
                }}
              />
            </div>
          </div>
          {duration && !timeErr && (
            <div
              style={{
                marginTop: 8,
                background: "#f0fdf4",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 12,
                color: "#264230",
                fontWeight: 600,
                display: "inline-block",
              }}
            >
              ⏱ مدة الحصة: {duration}
            </div>
          )}
          {timeErr && (
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "#dc2626",
                background: "#fef2f2",
                borderRadius: 6,
                padding: "4px 10px",
              }}
            >
              ⚠️ {timeErr}
            </div>
          )}
        </div>
        {/* القاعة */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              display: "block",
              marginBottom: 6,
            }}
          >
            القاعة
          </label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1.5px solid #d1d5db",
              fontSize: 13,
              fontFamily: "'Tajawal', sans-serif",
              background: "#fff",
              color: "#111827",
              outline: "none",
              boxSizing: "border-box",
            }}
          >
            {rooms.map((r) => (
              <option key={r.room_id} value={r.room_id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        {/* اللغة */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              display: "block",
              marginBottom: 6,
            }}
          >
            اللغة
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {LANGUAGES.map((l) => {
              const m = LANG_META[l];
              const active = lang === l;
              return (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    border: `2px solid ${active ? m.color : "#e5e7eb"}`,
                    background: active ? m.bg : "#f9fafb",
                    color: active ? m.color : "#374151",
                    fontWeight: active ? 700 : 500,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* المستوى */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              display: "block",
              marginBottom: 6,
            }}
          >
            المستوى
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {LEVELS.map((lv) => (
              <button
                key={lv}
                onClick={() => setLevel(lv)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 8,
                  border: `2px solid ${level === lv ? "#264230" : "#e5e7eb"}`,
                  background: level === lv ? "#264230" : "#f9fafb",
                  color: level === lv ? "#fff" : "#374151",
                  fontWeight: level === lv ? 700 : 500,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'Tajawal', sans-serif",
                }}
              >
                {lv}
              </button>
            ))}
          </div>
        </div>
        {/* رقم الفوج */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              display: "block",
              marginBottom: 6,
            }}
          >
            رقم الفوج
          </label>
          <input
            value={groupNum}
            onChange={(e) => setGroupNum(e.target.value)}
            placeholder="01"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1.5px solid #d1d5db",
              fontSize: 14,
              fontFamily: "'Tajawal', sans-serif",
              outline: "none",
              boxSizing: "border-box",
              direction: "ltr",
              textAlign: "center",
            }}
          />
        </div>
        {/* معاينة */}
        <div
          style={{
            background: meta.bg,
            border: `1.5px solid ${meta.border}`,
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>
            معاينة الحصة:
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#374151",
                fontFamily: "monospace",
              }}
            >
              {start} - {end}
            </span>
            {duration && (
              <span style={{ fontSize: 11, color: "#6b7280" }}>
                ({duration})
              </span>
            )}
            <span style={{ fontWeight: 700, color: meta.color, fontSize: 13 }}>
              {level} {groupNum}
            </span>
            <span
              style={{
                background: meta.color,
                color: "#fff",
                borderRadius: 4,
                padding: "1px 6px",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {lang}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleSubmit}
            disabled={isPending || !roomId}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: isPending ? "#9ca3af" : "#264230",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: isPending ? "not-allowed" : "pointer",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            {isPending ? "جارٍ الحفظ..." : "إضافة الحصة"}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ADD TEACHER MODAL — الأساتذة
// ══════════════════════════════════════════════════════════════

interface TeacherGroup {
  group_id: string;
  name: string;
  level: string;
  course: { course_id: string; course_name: string };
}

function AddTeacherModal({
  day,
  rooms,
  teacherId,
  teacherGroups,
  onClose,
  onCreate,
  isPending,
}: {
  day: number;
  rooms: { room_id: string; name: string }[];
  teacherId: string;
  teacherGroups: TeacherGroup[];
  onClose: () => void;
  onCreate: (payload: any) => void;
  isPending: boolean;
}) {
  const [roomId, setRoomId] = useState("");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("09:30");
  const [lang, setLang] = useState("FR");
  const [level, setLevel] = useState("A1");
  const [groupId, setGroupId] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const meta = LANG_META[lang];
  const dur = formatDuration(start, end);
  const selectedGroup = teacherGroups.find((g) => g.group_id === groupId);

  function handleSubmit() {
    setErr(null);
    if (timeToMinutes(start) >= timeToMinutes(end)) {
      setErr("وقت البداية يجب أن يكون قبل النهاية");
      return;
    }
    onCreate({
      teacher_id: teacherId,
      day_of_week: day,
      start_time: start,
      end_time: end,
      language: lang,
      level: selectedGroup?.level ?? level,
      group_label: selectedGroup?.name ?? `${level} 01`,
      room_id: roomId || null,
      group_id: groupId || null,
    });
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 28,
          width: 420,
          maxHeight: "90vh",
          overflowY: "auto",
          direction: "rtl",
          fontFamily: "'Tajawal', sans-serif",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
              إضافة حصة
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              {DAYS_AR[day]}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: 8,
              padding: "4px 10px",
              cursor: "pointer",
              fontSize: 16,
              color: "#374151",
            }}
          >
            ×
          </button>
        </div>
        {/* الوقت */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#374151",
              display: "block",
              marginBottom: 6,
            }}
          >
            الفترة الزمنية
          </label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="time"
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                setErr(null);
              }}
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 8,
                border: `1.5px solid ${err ? "#fca5a5" : "#e5e7eb"}`,
                fontSize: 14,
                outline: "none",
                direction: "ltr",
              }}
            />
            <span style={{ color: "#9ca3af" }}>←</span>
            <input
              type="time"
              value={end}
              onChange={(e) => {
                setEnd(e.target.value);
                setErr(null);
              }}
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 8,
                border: `1.5px solid ${err ? "#fca5a5" : "#e5e7eb"}`,
                fontSize: 14,
                outline: "none",
                direction: "ltr",
              }}
            />
          </div>
          {dur && !err && (
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                color: "#264230",
                background: "#f0fdf4",
                borderRadius: 6,
                padding: "3px 10px",
                display: "inline-block",
                fontWeight: 600,
              }}
            >
              ⏱ {dur}
            </div>
          )}
          {err && (
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                color: "#dc2626",
                background: "#fef2f2",
                borderRadius: 6,
                padding: "3px 10px",
              }}
            >
              ⚠️ {err}
            </div>
          )}
        </div>
        {/* الفوج */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#374151",
              display: "block",
              marginBottom: 6,
            }}
          >
            الفوج
          </label>
          {teacherGroups.length === 0 ? (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "#fffbeb",
                border: "1px solid #fde68a",
                fontSize: 12,
                color: "#92400e",
              }}
            >
              ⚠️ لا توجد أفواج مرتبطة بهذا الأستاذ
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {teacherGroups.map((g) => {
                const active = groupId === g.group_id;
                return (
                  <button
                    key={g.group_id}
                    onClick={() => {
                      setGroupId(active ? "" : g.group_id);
                      setLevel(g.level);
                    }}
                    style={{
                      padding: "9px 12px",
                      borderRadius: 10,
                      textAlign: "right",
                      border: `2px solid ${active ? "#264230" : "#e5e7eb"}`,
                      background: active ? "#f0fdf4" : "#fff",
                      cursor: "pointer",
                      fontFamily: "'Tajawal', sans-serif",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: active ? "#264230" : "#111827",
                        }}
                      >
                        {g.name}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}
                      >
                        {g.course.course_name} · {g.level}
                      </div>
                    </div>
                    {active && (
                      <span style={{ color: "#264230", fontWeight: 700 }}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {/* القاعة */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#374151",
              display: "block",
              marginBottom: 6,
            }}
          >
            القاعة{" "}
            <span style={{ color: "#9ca3af", fontWeight: 400 }}>(اختياري)</span>
          </label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1.5px solid #e5e7eb",
              fontSize: 13,
              fontFamily: "'Tajawal', sans-serif",
              background: "#fff",
              outline: "none",
            }}
          >
            <option value="">— بدون قاعة —</option>
            {rooms.map((r) => (
              <option key={r.room_id} value={r.room_id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        {/* اللغة */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#374151",
              display: "block",
              marginBottom: 6,
            }}
          >
            اللغة
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {LANGUAGES.map((l) => {
              const m = LANG_META[l];
              const active = lang === l;
              return (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 8,
                    border: `2px solid ${active ? m.color : "#e5e7eb"}`,
                    background: active ? m.bg : "#f9fafb",
                    color: active ? m.color : "#374151",
                    fontWeight: active ? 700 : 500,
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                >
                  {LANG_FLAGS[l]} {m.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* المستوى — فقط بدون فوج */}
        {!selectedGroup && (
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#374151",
                display: "block",
                marginBottom: 6,
              }}
            >
              المستوى
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {LEVELS.map((lv) => (
                <button
                  key={lv}
                  onClick={() => setLevel(lv)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 8,
                    border: `2px solid ${level === lv ? "#264230" : "#e5e7eb"}`,
                    background: level === lv ? "#264230" : "#f9fafb",
                    color: level === lv ? "#fff" : "#374151",
                    fontWeight: level === lv ? 700 : 500,
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* معاينة */}
        <div
          style={{
            background: meta.bg,
            border: `1.5px solid ${meta.border}`,
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>
            معاينة:
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontFamily: "monospace",
                color: "#374151",
              }}
            >
              {start} – {end}
            </span>
            {dur && (
              <span style={{ fontSize: 10, color: "#6b7280" }}>({dur})</span>
            )}
            <span style={{ fontWeight: 700, color: meta.color }}>
              {LANG_FLAGS[lang]} {lang}
            </span>
            <span
              style={{
                background: "#f3f4f6",
                color: "#111827",
                borderRadius: 5,
                padding: "1px 7px",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {selectedGroup?.name ?? `${level} 01`}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: isPending ? "#9ca3af" : "#264230",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: isPending ? "not-allowed" : "pointer",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            {isPending ? "جارٍ الحفظ..." : "إضافة الحصة"}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 1 — ROOMS TIMETABLE
// ══════════════════════════════════════════════════════════════

function RoomsTimetableTab() {
  const [activeDay, setActiveDay] = useState<number | "all">("all");
  const [filterLang, setFilterLang] = useState<string | null>(null);
  const [modal, setModal] = useState<number | null>(null);
  const [slots, setSlots] = useState<Slot[]>(DEFAULT_SLOTS);
  const [slotMgrOpen, setSlotMgrOpen] = useState(false);

  const { data, isLoading, isError } = useAdminTimetable(
    filterLang ? { language: filterLang } : undefined,
  );
  const { mutate: createEntry, isPending: isCreating } = useCreateEntry();
  const { mutate: deleteEntry } = useDeleteEntry();
  const { data: rooms = [] } = useRooms();
  const { data: savedSlots } = useTimetableConfig();
  const { mutate: saveConfig, isPending: isSaving } = useSaveConfig();
  const { mutate: resetConfig, isPending: isResetting } = useResetConfig();

  useEffect(() => {
    if (savedSlots && savedSlots.length > 0) setSlots(savedSlots);
  }, [savedSlots]);

  const entries = data?.data ?? [];
  const displayDays = activeDay === "all" ? DAYS : [activeDay];
  const byDay: Record<number, TimetableEntry[]> = {};
  for (const d of DAYS) byDay[d] = [];
  for (const e of entries) byDay[e.day_of_week]?.push(e);
  for (const d of DAYS)
    byDay[d].sort(
      (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time),
    );
  const langCounts: Record<string, number> = {};
  entries.forEach((e) => {
    langCounts[e.language] = (langCounts[e.language] ?? 0) + 1;
  });

  const handleCreate = useCallback(
    (payload: any) => {
      createEntry(payload, {
        onSuccess: () => {
          setModal(null);
          toast.success("تمت إضافة الحصة بنجاح");
        },
        onError: (err: any) => {
          const status = err?.response?.status;
          const msg = err?.response?.data?.message ?? "حدث خطأ غير متوقع";
          const conflict = err?.response?.data?.conflict;
          if (status === 409) {
            toast.error(
              conflict
                ? `تعارض في القاعة · ${conflict.day} · ${conflict.slot} · ${conflict.group_label}`
                : "تعارض: القاعة محجوزة في هذا الوقت",
              { duration: 6000 },
            );
          } else if (status === 404) {
            toast.error("القاعة أو الفوج غير موجود");
          } else if (status === 400) {
            toast.error(`خطأ في البيانات: ${msg}`);
          } else {
            toast.error(`خطأ في الخادم: ${msg}`);
          }
        },
      });
    },
    [createEntry],
  );
  const handleDelete = useCallback(
    (id: string) => {
      if (confirm("هل تريد حذف هذه الحصة؟")) {
        deleteEntry(id, {
          onSuccess: () => toast.success("تم حذف الحصة بنجاح"),
          onError: () => toast.error("فشل حذف الحصة، حاول مرة أخرى"),
        });
      }
    },
    [deleteEntry],
  );

  return (
    <>
      {/* Filter Bar */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "10px 28px",
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
          فلترة:
        </span>
        {Object.entries(langCounts).map(([l, count]) => {
          const m = LANG_META[l];
          if (!m) return null;
          const active = filterLang === l;
          return (
            <button
              key={l}
              onClick={() => setFilterLang(active ? null : l)}
              style={{
                background: active ? m.color : m.bg,
                border: `1px solid ${m.border}`,
                borderRadius: 20,
                padding: "2px 10px",
                fontSize: 11,
                color: active ? "#fff" : m.color,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              {m.label} ({count})
            </button>
          );
        })}
        {filterLang && (
          <button
            onClick={() => setFilterLang(null)}
            style={{
              fontSize: 11,
              color: "#6b7280",
              background: "#f3f4f6",
              border: "none",
              borderRadius: 20,
              padding: "2px 10px",
              cursor: "pointer",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            إلغاء الفلتر ×
          </button>
        )}
        <div style={{ marginRight: "auto" }}>
          <button
            onClick={() => setSlotMgrOpen(true)}
            style={{
              background: "#f0fdf4",
              border: "1.5px solid #264230",
              borderRadius: 8,
              padding: "5px 14px",
              color: "#264230",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            ⏱ الفترات ({slots.length})
          </button>
        </div>
      </div>
      {/* Day Tabs */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 28px",
          display: "flex",
          overflowX: "auto",
        }}
      >
        {(["all", ...DAYS] as const).map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            style={{
              padding: "12px 18px",
              border: "none",
              background: "none",
              borderBottom:
                activeDay === d ? "3px solid #264230" : "3px solid transparent",
              color: activeDay === d ? "#264230" : "#6b7280",
              fontWeight: activeDay === d ? 700 : 500,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            {d === "all" ? "الكل" : DAYS_AR[d]}
            {d !== "all" && byDay[d]?.length > 0 && (
              <span
                style={{
                  marginRight: 6,
                  background: "#264230",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "1px 6px",
                  fontSize: 10,
                }}
              >
                {byDay[d].length}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* Grid */}
      <div style={{ padding: "20px 16px", overflowX: "auto" }}>
        {isLoading && (
          <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>
            جارٍ التحميل...
          </div>
        )}
        {isError && (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: "#ef4444",
              background: "#fff",
              borderRadius: 12,
            }}
          >
            حدث خطأ في تحميل البيانات.
          </div>
        )}
        {!isLoading && !isError && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${displayDays.length}, 1fr)`,
              gap: 12,
              minWidth: displayDays.length > 1 ? 700 : "auto",
            }}
          >
            {displayDays.map((day) => (
              <div
                key={day}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#264230",
                    color: "#fff",
                    padding: "10px 14px",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{DAYS_AR[day]}</span>
                    {byDay[day].length > 0 && (
                      <span
                        style={{
                          background: "#C4A035",
                          color: "#fff",
                          borderRadius: 10,
                          padding: "1px 8px",
                          fontSize: 11,
                        }}
                      >
                        {byDay[day].length} حصة
                      </span>
                    )}
                  </div>
                  {byDay[day].length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                        marginTop: 8,
                      }}
                    >
                      {Array.from(
                        new Set(byDay[day].map((e) => e.language)),
                      ).map((lang) => {
                        const m = LANG_META[lang];
                        const cnt = byDay[day].filter(
                          (e) => e.language === lang,
                        ).length;
                        return (
                          <span
                            key={lang}
                            style={{
                              background: m?.color,
                              color: "#fff",
                              borderRadius: 20,
                              padding: "2px 8px",
                              fontSize: 11,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            {LANG_FLAGS[lang]} {lang}
                            {cnt > 1 && (
                              <span style={{ opacity: 0.8, fontSize: 10 }}>
                                ×{cnt}
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    minHeight: 120,
                  }}
                >
                  {byDay[day].length === 0 ? (
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#d1d5db",
                        fontSize: 12,
                        padding: "20px 0",
                      }}
                    >
                      لا توجد حصص
                    </div>
                  ) : (
                    byDay[day].map((e) => (
                      <EntryBadge
                        key={e.entry_id}
                        entry={e}
                        onDelete={() => handleDelete(e.entry_id)}
                      />
                    ))
                  )}
                  <button
                    onClick={() => setModal(day)}
                    style={{
                      width: "100%",
                      padding: "7px",
                      border: "1.5px dashed #d1d5db",
                      borderRadius: 8,
                      background: "transparent",
                      color: "#9ca3af",
                      cursor: "pointer",
                      fontSize: 13,
                      fontFamily: "'Tajawal', sans-serif",
                      marginTop: "auto",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#264230";
                      e.currentTarget.style.color = "#264230";
                      e.currentTarget.style.background = "#f0fdf4";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.color = "#9ca3af";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    + إضافة حصة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Legend */}
      <div style={{ padding: "0 28px 40px" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: "14px 20px",
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
            دليل اللغات:
          </span>
          {Object.entries(LANG_META).map(([l, m]) => (
            <div
              key={l}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: m.color,
                }}
              />
              <span style={{ fontSize: 11, color: "#374151" }}>
                {m.label} ({l})
              </span>
            </div>
          ))}
        </div>
      </div>
      {modal !== null && (
        <AddModal
          day={modal}
          rooms={
            rooms.length ? rooms : [{ room_id: "", name: "لا توجد قاعات" }]
          }
          onClose={() => setModal(null)}
          onCreate={handleCreate}
          isPending={isCreating}
        />
      )}
      {slotMgrOpen && (
        <SlotManagerModal
          slots={slots}
          onSave={(s) =>
            saveConfig(s, { onSuccess: () => setSlotMgrOpen(false) })
          }
          onReset={() => resetConfig()}
          onClose={() => setSlotMgrOpen(false)}
          isSaving={isSaving || isResetting}
        />
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 2 — TEACHER SCHEDULES
// ══════════════════════════════════════════════════════════════

interface Teacher {
  teacher_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  user?: { google_avatar?: string | null } | null;
}

function TeacherTimetableTab() {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [activeDay, setActiveDay] = useState<number | "all">("all");
  const [modal, setModal] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const { data: rooms = [] } = useRooms();

  // جلب الأساتذة
  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers();

  // جلب مجموعات الأستاذ
  const { data: teacherGroups = [] } = useTeacherGroups(
    selectedTeacher?.teacher_id ?? null,
  );

  // جلب جدول الأستاذ — من useTeacherSchedule hook
  const { data: scheduleData, isLoading: loadingSchedule } = useTeacherSchedule(
    selectedTeacher?.teacher_id ?? null,
  );

  const entries = scheduleData?.entries ?? [];
  const byDay: Record<number, TeacherScheduleEntry[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };
  for (const e of entries) byDay[e.day_of_week]?.push(e);
  for (const d of DAYS)
    byDay[d].sort(
      (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time),
    );
  const displayDays = activeDay === "all" ? DAYS : [activeDay];

  const { mutate: createEntry, isPending: isCreating } =
    useCreateTeacherEntry();
  const { mutate: deleteEntry } = useDeleteTeacherEntry();

  const filteredTeachers = teachers.filter(
    (t) =>
      `${t.first_name} ${t.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()),
  );
  const tName = (t: Teacher) => `${t.first_name} ${t.last_name}`;
  const tInit = (t: Teacher) =>
    `${t.first_name[0] ?? "?"}${t.last_name[0] ?? ""}`.toUpperCase();
  const tAvatar = (t: Teacher) => t.user?.google_avatar ?? null;

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 73px)",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 268,
          flexShrink: 0,
          background: "#fff",
          borderLeft: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "12px 12px 6px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "#f9fafb",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              padding: "7px 10px",
            }}
          >
            <span style={{ color: "#9ca3af", fontSize: 13 }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث عن أستاذ..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 12,
                fontFamily: "'Tajawal', sans-serif",
                color: "#111827",
              }}
            />
          </div>
        </div>
        <div
          style={{
            padding: "4px 12px 8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280" }}>
            الأساتذة
          </span>
          <span
            style={{
              fontSize: 10,
              background: "#f3f4f6",
              color: "#6b7280",
              borderRadius: 6,
              padding: "1px 6px",
              fontWeight: 700,
            }}
          >
            {filteredTeachers.length}
          </span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
          {loadingTeachers ? (
            <div
              style={{
                textAlign: "center",
                padding: 20,
                color: "#9ca3af",
                fontSize: 12,
              }}
            >
              جارٍ التحميل...
            </div>
          ) : (
            filteredTeachers.map((t) => {
              const isSelected = selectedTeacher?.teacher_id === t.teacher_id;
              return (
                <button
                  key={t.teacher_id}
                  onClick={() => {
                    setSelectedTeacher(t);
                    setActiveDay("all");
                  }}
                  style={{
                    width: "100%",
                    textAlign: "right",
                    padding: "9px 10px",
                    marginBottom: 5,
                    borderRadius: 11,
                    border: `${isSelected ? "2px" : "1.5px"} solid ${isSelected ? "#264230" : "#e5e7eb"}`,
                    background: isSelected ? "#f0fdf4" : "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    boxShadow: isSelected
                      ? "0 1px 8px rgba(38,66,48,0.1)"
                      : "none",
                    fontFamily: "'Tajawal', sans-serif",
                    direction: "rtl",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.borderColor = "#264230";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  {tAvatar(t) ? (
                    <img
                      src={tAvatar(t)!}
                      alt=""
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 9,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 9,
                        background: isSelected ? "#264230" : "#e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: isSelected ? "#C4A035" : "#6b7280",
                        flexShrink: 0,
                      }}
                    >
                      {tInit(t)}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: isSelected ? "#264230" : "#111827",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tName(t)}
                    </div>
                    {t.email && (
                      <div
                        style={{
                          fontSize: 10,
                          color: "#9ca3af",
                          marginTop: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.email}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#264230",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", background: "#f8f9fa" }}>
        {!selectedTeacher ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: "#9ca3af",
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 16,
                background: "#fff",
                border: "2px dashed #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              👨‍🏫
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>
                اختر أستاذاً
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>
                اختر من القائمة لعرض وإنشاء جدوله
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Teacher Header */}
            <div
              style={{
                background: "#fff",
                borderBottom: "1px solid #e5e7eb",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {tAvatar(selectedTeacher) ? (
                <img
                  src={tAvatar(selectedTeacher)!}
                  alt=""
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    background: "#264230",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#C4A035",
                  }}
                >
                  {tInit(selectedTeacher)}
                </div>
              )}
              <div>
                <div
                  style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}
                >
                  {tName(selectedTeacher)}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>
                  {teacherGroups.length} فوج ·
                  <span
                    style={{
                      color: "#264230",
                      fontWeight: 600,
                      marginRight: 4,
                    }}
                  >
                    {entries.length} حصة في الجدول
                  </span>
                </div>
              </div>
              {teacherGroups.length > 0 && (
                <div
                  style={{
                    marginRight: "auto",
                    display: "flex",
                    gap: 5,
                    flexWrap: "wrap",
                  }}
                >
                  {teacherGroups.slice(0, 4).map((g) => (
                    <span
                      key={g.group_id}
                      style={{
                        background: "#f0fdf4",
                        color: "#264230",
                        border: "1px solid #a7f3d0",
                        borderRadius: 20,
                        padding: "2px 9px",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      {g.name} · {g.level}
                    </span>
                  ))}
                  {teacherGroups.length > 4 && (
                    <span style={{ fontSize: 10, color: "#9ca3af" }}>
                      +{teacherGroups.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
            {/* Day Tabs */}
            <div
              style={{
                background: "#fff",
                borderBottom: "1px solid #e5e7eb",
                padding: "0 20px",
                display: "flex",
                overflowX: "auto",
              }}
            >
              {(["all", ...DAYS] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveDay(d)}
                  style={{
                    padding: "11px 15px",
                    border: "none",
                    background: "none",
                    borderBottom:
                      activeDay === d
                        ? "3px solid #264230"
                        : "3px solid transparent",
                    color: activeDay === d ? "#264230" : "#6b7280",
                    fontWeight: activeDay === d ? 700 : 500,
                    fontSize: 12,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                >
                  {d === "all" ? "كل الأيام" : DAYS_AR[d]}
                  {d !== "all" && byDay[d]?.length > 0 && (
                    <span
                      style={{
                        marginRight: 4,
                        background: activeDay === d ? "#264230" : "#f3f4f6",
                        color: activeDay === d ? "#fff" : "#6b7280",
                        borderRadius: 8,
                        padding: "0 5px",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {byDay[d].length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {/* Grid */}
            <div style={{ padding: "16px", overflowX: "auto" }}>
              {loadingSchedule ? (
                <div
                  style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}
                >
                  جارٍ تحميل الجدول...
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${displayDays.length}, 1fr)`,
                    gap: 10,
                    minWidth: displayDays.length > 3 ? 700 : "auto",
                  }}
                >
                  {displayDays.map((day) => (
                    <div
                      key={day}
                      style={{
                        background: "#fff",
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          background: "#264230",
                          color: "#fff",
                          padding: "9px 12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontWeight: 700, fontSize: 13 }}>
                            {DAYS_AR[day]}
                          </span>
                          {byDay[day].length > 0 && (
                            <span
                              style={{
                                background: "#C4A035",
                                color: "#fff",
                                borderRadius: 8,
                                padding: "1px 7px",
                                fontSize: 10,
                                fontWeight: 700,
                              }}
                            >
                              {byDay[day].length} حصة
                            </span>
                          )}
                        </div>
                        {byDay[day].length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              gap: 3,
                              flexWrap: "wrap",
                              marginTop: 6,
                            }}
                          >
                            {Array.from(
                              new Set(byDay[day].map((e) => e.language)),
                            ).map((lang) => {
                              const m = LANG_META[lang];
                              return (
                                <span
                                  key={lang}
                                  style={{
                                    background: m?.color,
                                    color: "#fff",
                                    borderRadius: 20,
                                    padding: "1px 7px",
                                    fontSize: 10,
                                    fontWeight: 700,
                                  }}
                                >
                                  {LANG_FLAGS[lang]} {lang}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          padding: 8,
                          display: "flex",
                          flexDirection: "column",
                          gap: 7,
                          minHeight: 100,
                        }}
                      >
                        {byDay[day].length === 0 ? (
                          <div
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#d1d5db",
                              fontSize: 11,
                              padding: "14px 0",
                            }}
                          >
                            لا توجد حصص
                          </div>
                        ) : (
                          byDay[day].map((e) => (
                            <TeacherEntryBadge
                              key={e.entry_id}
                              entry={e}
                              onDelete={() => {
                                if (confirm("حذف الحصة؟"))
                                  deleteEntry({
                                    entryId: e.entry_id,
                                    teacherId: e.teacher_id,
                                  });
                              }}
                            />
                          ))
                        )}
                        <button
                          onClick={() => setModal(day)}
                          style={{
                            width: "100%",
                            padding: "6px",
                            border: "1.5px dashed #d1d5db",
                            borderRadius: 8,
                            background: "transparent",
                            color: "#9ca3af",
                            cursor: "pointer",
                            fontSize: 11,
                            fontFamily: "'Tajawal', sans-serif",
                            marginTop: "auto",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#264230";
                            e.currentTarget.style.color = "#264230";
                            e.currentTarget.style.background = "#f0fdf4";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#d1d5db";
                            e.currentTarget.style.color = "#9ca3af";
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          + إضافة حصة
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {modal !== null && selectedTeacher && (
        <AddTeacherModal
          day={modal}
          rooms={rooms}
          teacherId={selectedTeacher.teacher_id}
          teacherGroups={teacherGroups}
          onClose={() => setModal(null)}
          onCreate={(payload) =>
            createEntry(payload, { onSuccess: () => setModal(null) })
          }
          isPending={isCreating}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════

type Tab = "rooms" | "teachers";

export default function TimetablePage() {
  const [tab, setTab] = useState<Tab>("rooms");

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          minHeight: "100vh",
          background: "#f8f9fa",
          fontFamily: "'Tajawal', sans-serif",
          direction: "rtl",
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            background: "#264230",
            padding: "16px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "#C4A035",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              🗓
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>
                التوزيع الزمني
              </div>
              <div style={{ color: "#9dc9ad", fontSize: 12 }}>
                دورة فيفري 2026 · CEIL
              </div>
            </div>
          </div>
          {/* Tab Switcher */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: 4,
              gap: 4,
            }}
          >
            {[
              { key: "rooms" as Tab, label: "🏫 القاعات" },
              { key: "teachers" as Tab, label: "👨‍🏫 الأساتذة" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "7px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: tab === t.key ? "#fff" : "transparent",
                  color: tab === t.key ? "#264230" : "rgba(255,255,255,0.8)",
                  fontWeight: tab === t.key ? 700 : 500,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "'Tajawal', sans-serif",
                  transition: "all 0.15s",
                  boxShadow:
                    tab === t.key ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {/* Content */}
        {tab === "rooms" && <RoomsTimetableTab />}
        {tab === "teachers" && <TeacherTimetableTab />}
      </div>
    </>
  );
}
