// src/pages/admin/TimetablePage.tsx
// صفحة التوزيع الزمني — مربوطة بالـ Backend عبر TanStack Query

import { useState, useCallback, useEffect } from "react";
import {
  useAdminTimetable,
  useCreateEntry,
  useDeleteEntry,
  useRooms,
  useTimetableConfig,
  useSaveConfig,
  useResetConfig,
} from "../../../hooks/admin/useTimetable";
import type { TimetableEntry } from "../../../lib/api/admin/timetable.api";

// ── Constants ─────────────────────────────────────────────────

const DAYS_AR: Record<number, string> = {
  0: "السبت",
  1: "الأحد",
  2: "الإثنين",
  3: "الثلاثاء",
  4: "الأربعاء",
  5: "الخميس",
};

const DAYS = [0, 1, 2, 3, 4, 5];

// الفترات الافتراضية — يمكن للأدمين تعديلها
const DEFAULT_SLOTS = [
  { id: "s1", start: "08:00", end: "09:30" },
  { id: "s2", start: "09:30", end: "11:00" },
  { id: "s3", start: "11:00", end: "12:30" },
  { id: "s4", start: "12:30", end: "14:00" },
  { id: "s5", start: "14:00", end: "15:30" },
  { id: "s6", start: "15:30", end: "17:00" },
  { id: "s7", start: "17:00", end: "19:00" },
];

type Slot = { id: string; start: string; end: string };

// ── Slot Manager Modal ────────────────────────────────────────

function SlotManagerModal({
  slots,
  onSave,
  onReset,
  onClose,
  isSaving = false,
}: {
  slots: Slot[];
  onSave: (slots: Slot[]) => void;
  onReset: () => void;
  onClose: () => void;
  isSaving?: boolean;
}) {
  const [draft, setDraft] = useState<Slot[]>(slots.map((s) => ({ ...s })));
  const [error, setError] = useState<string | null>(null);

  function timeToMinutes(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  function addSlot() {
    const last = draft[draft.length - 1];
    const newStart = last?.end ?? "08:00";
    const [h, m] = newStart.split(":").map(Number);
    const endMin = h * 60 + m + 90;
    const newEnd = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
    setDraft([
      ...draft,
      {
        id: `s${Date.now()}`,
        start: newStart,
        end: endMin <= 1440 ? newEnd : "23:59",
      },
    ]);
  }

  function removeSlot(id: string) {
    setDraft(draft.filter((s) => s.id !== id));
  }

  function updateSlot(id: string, field: "start" | "end", value: string) {
    setDraft(draft.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  function validate(): boolean {
    setError(null);
    for (const s of draft) {
      if (!/^\d{2}:\d{2}$/.test(s.start) || !/^\d{2}:\d{2}$/.test(s.end)) {
        setError("تأكد من صيغة الوقت HH:MM");
        return false;
      }
      if (timeToMinutes(s.start) >= timeToMinutes(s.end)) {
        setError(
          `الفترة ${s.start} - ${s.end}: وقت البداية يجب أن يكون قبل النهاية`,
        );
        return false;
      }
    }
    // check overlaps
    const sorted = [...draft].sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
    );
    for (let i = 0; i < sorted.length - 1; i++) {
      if (timeToMinutes(sorted[i].end) > timeToMinutes(sorted[i + 1].start)) {
        setError(
          `تعارض بين ${sorted[i].start}-${sorted[i].end} و ${sorted[i + 1].start}-${sorted[i + 1].end}`,
        );
        return false;
      }
    }
    return true;
  }

  function handleSave() {
    if (!validate()) return;
    const sorted = [...draft].sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
    );
    onSave(sorted);
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
          maxHeight: "85vh",
          overflowY: "auto",
          direction: "rtl",
          fontFamily: "'Tajawal', sans-serif",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
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
              تخصيص أوقات الحصص
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

        {/* Slots list */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {draft.map((slot, i) => (
            <div
              key={slot.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#f9fafb",
                borderRadius: 10,
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  minWidth: 24,
                  textAlign: "center",
                }}
              >
                {i + 1}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flex: 1,
                }}
              >
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
                    fontFamily: "'Tajawal', sans-serif",
                    outline: "none",
                    direction: "ltr",
                  }}
                />
                <span style={{ color: "#9ca3af", fontSize: 12 }}>←</span>
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
                    fontFamily: "'Tajawal', sans-serif",
                    outline: "none",
                    direction: "ltr",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  background: "#f0fdf4",
                  borderRadius: 6,
                  padding: "2px 6px",
                  whiteSpace: "nowrap",
                }}
              >
                {(() => {
                  const diff =
                    slot.end && slot.start
                      ? (() => {
                          const [sh, sm] = slot.start.split(":").map(Number);
                          const [eh, em] = slot.end.split(":").map(Number);
                          return eh * 60 + em - (sh * 60 + sm);
                        })()
                      : 0;
                  return diff > 0 ? `${diff} د` : "—";
                })()}
              </span>
              <button
                onClick={() => removeSlot(slot.id)}
                disabled={draft.length <= 1}
                style={{
                  background: "none",
                  border: "none",
                  cursor: draft.length > 1 ? "pointer" : "not-allowed",
                  color: draft.length > 1 ? "#ef4444" : "#d1d5db",
                  fontSize: 16,
                  padding: "2px 4px",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Error */}
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

        {/* Add slot */}
        <button
          onClick={addSlot}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: 10,
            border: "1.5px dashed #264230",
            background: "#f0fdf4",
            color: "#264230",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Tajawal', sans-serif",
            marginBottom: 16,
          }}
        >
          + إضافة فترة جديدة
        </button>

        {/* Reset + Save */}
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
            {isSaving ? "جارٍ الحفظ..." : "حفظ الفترات"}
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
  AR: { label: "عربية", color: "#064e3b", bg: "#f0fdf4", border: "#86efac" },
};

const LEVELS = ["PRE_A1", "A1", "A1,1", "A2", "B1", "B2", "C1", "قاعدي"];
const LANGUAGES = Object.keys(LANG_META);

// ── Helpers ───────────────────────────────────────────────────

type GroupedData = Record<number, Record<string, TimetableEntry[]>>;

function groupEntries(entries: TimetableEntry[], slots: Slot[]): GroupedData {
  const result: GroupedData = {};
  for (const day of DAYS) {
    result[day] = {};
    for (const s of slots) {
      result[day][s.start] = [];
    }
  }
  for (const e of entries) {
    if (result[e.day_of_week]?.[e.start_time]) {
      result[e.day_of_week][e.start_time].push(e);
    } else if (result[e.day_of_week]) {
      // حصة بوقت خارج الفترات المعرّفة — نضيفها للأقرب
      result[e.day_of_week][e.start_time] = [e];
    }
  }
  return result;
}

// ── Sub-components ────────────────────────────────────────────

function EntryBadge({
  entry,
  onDelete,
}: {
  entry: TimetableEntry;
  onDelete: () => void;
}) {
  const meta = LANG_META[entry.language] ?? LANG_META["FR"];
  return (
    <div
      style={{
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        borderRadius: 6,
        padding: "3px 7px",
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontFamily: "'Tajawal', sans-serif",
        direction: "rtl",
      }}
    >
      <span
        style={{ color: meta.color, fontWeight: 700, whiteSpace: "nowrap" }}
      >
        {entry.group_label}
      </span>
      <span
        style={{
          background: meta.color,
          color: "#fff",
          borderRadius: 3,
          padding: "0 4px",
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {entry.language}
      </span>
      <button
        onClick={onDelete}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#9ca3af",
          padding: 0,
          fontSize: 14,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ── Add Modal ─────────────────────────────────────────────────

interface AddModalProps {
  day: number;
  slot: { start: string; end: string };
  rooms: { room_id: string; name: string }[];
  onClose: () => void;
  onCreate: (payload: {
    room_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    level: string;
    language: string;
    group_label: string;
  }) => void;
  isPending: boolean;
}

function AddModal({
  day,
  slot,
  rooms,
  onClose,
  onCreate,
  isPending,
}: AddModalProps) {
  const [roomId, setRoomId] = useState(rooms[0]?.room_id ?? "");
  const [level, setLevel] = useState("A1");
  const [lang, setLang] = useState("FR");
  const [groupNum, setGroupNum] = useState("01");

  function handleSubmit() {
    if (!roomId) return;
    onCreate({
      room_id: roomId,
      day_of_week: day,
      start_time: slot.start,
      end_time: slot.end,
      level,
      language: lang,
      group_label: `${level} ${groupNum}`.trim(),
    });
  }

  const meta = LANG_META[lang];

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
          minWidth: 360,
          maxWidth: 420,
          width: "90%",
          direction: "rtl",
          fontFamily: "'Tajawal', sans-serif",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
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
              {DAYS_AR[day]} · {slot.start} - {slot.end}
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

        {/* Room */}
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

        {/* Language */}
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

        {/* Level */}
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

        {/* Group number */}
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

        {/* Preview */}
        <div
          style={{
            background: meta.bg,
            border: `1.5px solid ${meta.border}`,
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 12, color: "#6b7280" }}>معاينة:</span>
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

        {/* Buttons */}
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

// ── Main Page ─────────────────────────────────────────────────

export default function TimetablePage() {
  // ── State ──────────────────────────────────────────────────
  const [activeDay, setActiveDay] = useState<number | "all">("all");
  const [filterLang, setFilterLang] = useState<string | null>(null);
  const [modal, setModal] = useState<{ day: number; slot: Slot } | null>(null);
  const [slots, setSlots] = useState<Slot[]>(DEFAULT_SLOTS);
  const [slotMgrOpen, setSlotMgrOpen] = useState(false);

  // ── Data ───────────────────────────────────────────────────
  const { data, isLoading, isError } = useAdminTimetable(
    filterLang ? { language: filterLang } : undefined,
  );

  const { mutate: createEntry, isPending: isCreating } = useCreateEntry();
  const { mutate: deleteEntry } = useDeleteEntry();
  const { mutate: saveConfig, isPending: isSaving } = useSaveConfig();
  const { mutate: resetConfig, isPending: isResetting } = useResetConfig();

  const entries = data?.data ?? [];
  const grouped = groupEntries(entries, slots);
  const displayDays = activeDay === "all" ? DAYS : [activeDay];

  // ── جلب الفترات من Backend ─────────────────────────────────
  const { data: savedSlots } = useTimetableConfig();
  useEffect(() => {
    if (savedSlots && savedSlots.length > 0) {
      setSlots(savedSlots);
    }
  }, [savedSlots]);

  // ── القاعات عبر hook ───────────────────────────────────────
  const { data: rooms = [] } = useRooms();

  // Stats par langue
  const langCounts: Record<string, number> = {};
  entries.forEach((e) => {
    langCounts[e.language] = (langCounts[e.language] ?? 0) + 1;
  });

  // ── Handlers ───────────────────────────────────────────────
  const handleCreate = useCallback(
    (payload: Parameters<typeof createEntry>[0]) => {
      createEntry(payload, { onSuccess: () => setModal(null) });
    },
    [createEntry],
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm("هل تريد حذف هذه الحصة؟")) deleteEntry(id);
    },
    [deleteEntry],
  );

  // ── Render ─────────────────────────────────────────────────
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
        {/* ── Top Bar ───────────────────────────────────────── */}
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
                التوزيع الزمني للقاعات
              </div>
              <div style={{ color: "#9dc9ad", fontSize: 12 }}>
                دورة فيفري 2026 · CEIL
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* زر إدارة الفترات */}
            <button
              onClick={() => setSlotMgrOpen(true)}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                borderRadius: 8,
                padding: "6px 14px",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Tajawal', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ⏱ إدارة الفترات ({slots.length})
            </button>
            <div
              style={{
                background: "rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "6px 14px",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {isLoading ? "..." : `${entries.length} حصة`}
            </div>
          </div>
        </div>

        {/* ── Language Stats Bar ────────────────────────────── */}
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
                  outline: active ? `2px solid ${m.color}` : "none",
                  outlineOffset: 2,
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
        </div>

        {/* ── Day Tabs ──────────────────────────────────────── */}
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
                  activeDay === d
                    ? "3px solid #264230"
                    : "3px solid transparent",
                color: activeDay === d ? "#264230" : "#6b7280",
                fontWeight: activeDay === d ? 700 : 500,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              {d === "all" ? "الكل" : DAYS_AR[d]}
            </button>
          ))}
        </div>

        {/* ── Grid ──────────────────────────────────────────── */}
        <div style={{ padding: "20px 16px", overflowX: "auto" }}>
          {/* Loading */}
          {isLoading && (
            <div
              style={{
                textAlign: "center",
                padding: 60,
                color: "#6b7280",
                fontSize: 14,
              }}
            >
              جارٍ التحميل...
            </div>
          )}

          {/* Error */}
          {isError && (
            <div
              style={{
                textAlign: "center",
                padding: 60,
                color: "#ef4444",
                fontSize: 14,
                background: "#fff",
                borderRadius: 12,
              }}
            >
              حدث خطأ في تحميل البيانات. تحقق من الاتصال بالخادم.
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && (
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                minWidth: 900,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      background: "#264230",
                      color: "#C4A035",
                      padding: "10px 14px",
                      fontWeight: 700,
                      fontSize: 12,
                      textAlign: "center",
                      borderRadius: "10px 0 0 0",
                      minWidth: 120,
                      whiteSpace: "nowrap",
                    }}
                  >
                    التوقيت
                  </th>
                  {displayDays.map((d, i) => (
                    <th
                      key={d}
                      style={{
                        background: "#264230",
                        color: "#fff",
                        padding: "10px 14px",
                        fontWeight: 700,
                        fontSize: 13,
                        textAlign: "center",
                        minWidth: 150,
                        borderLeft: "1px solid rgba(255,255,255,0.1)",
                        borderRadius:
                          i === displayDays.length - 1 ? "0 10px 0 0" : 0,
                      }}
                    >
                      {DAYS_AR[d]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map((slot, si) => (
                  <tr key={slot.start}>
                    <td
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #d1fae5",
                        padding: "8px 10px",
                        textAlign: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#264230",
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                      }}
                    >
                      {slot.start} - {slot.end}
                    </td>
                    {displayDays.map((day) => {
                      const cellEntries = grouped[day]?.[slot.start] ?? [];
                      const isEmpty = cellEntries.length === 0;

                      return (
                        <td
                          key={day}
                          style={{
                            border: "1px solid #e5e7eb",
                            padding: 6,
                            verticalAlign: "top",
                            background: si % 2 === 0 ? "#fff" : "#fafafa",
                            minWidth: 150,
                          }}
                        >
                          {/* Badges */}
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 4,
                              marginBottom: isEmpty ? 0 : 4,
                            }}
                          >
                            {cellEntries.map((e) => (
                              <EntryBadge
                                key={e.entry_id}
                                entry={e}
                                onDelete={() => handleDelete(e.entry_id)}
                              />
                            ))}
                          </div>

                          {/* Add button */}
                          <button
                            onClick={() => setModal({ day, slot })}
                            style={{
                              width: isEmpty ? "100%" : "auto",
                              padding: isEmpty ? "6px" : "2px 8px",
                              border: "1.5px dashed #d1d5db",
                              borderRadius: 6,
                              background: "transparent",
                              color: "#9ca3af",
                              cursor: "pointer",
                              fontSize: isEmpty ? 16 : 11,
                              fontFamily: "'Tajawal', sans-serif",
                              marginTop: isEmpty ? 0 : 2,
                              transition: "all 0.15s",
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
                            {isEmpty ? "+" : "+ إضافة"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Legend ────────────────────────────────────────── */}
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
      </div>

      {/* ── Modal ─────────────────────────────────────────── */}
      {modal && (
        <AddModal
          day={modal.day}
          slot={modal.slot}
          rooms={
            rooms.length ? rooms : [{ room_id: "", name: "لا توجد قاعات" }]
          }
          onClose={() => setModal(null)}
          onCreate={handleCreate}
          isPending={isCreating}
        />
      )}

      {/* ── Slot Manager Modal ────────────────────────────── */}
      {slotMgrOpen && (
        <SlotManagerModal
          slots={slots}
          onSave={(newSlots) => saveConfig(newSlots)}
          onReset={() => resetConfig()}
          onClose={() => setSlotMgrOpen(false)}
          isSaving={isSaving || isResetting}
        />
      )}
    </>
  );
}
