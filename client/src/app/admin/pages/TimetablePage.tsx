// src/pages/admin/TimetablePage.tsx

import {
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
} from "react";
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
import { useTheme } from "../../../context/Themecontext";
import { useTranslation } from "react-i18next";

// ══════════════════════════════════════════════════════════════
// i18n
// ══════════════════════════════════════════════════════════════

type Locale = "ar" | "fr" | "en";

// ══════════════════════════════════════════════════════════════
// CONTEXT
// ══════════════════════════════════════════════════════════════

interface PageCtx {
  dark: boolean;
  locale: Locale;
  t: (k: string) => string;
  dir: "rtl" | "ltr";
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
}
const Ctx = createContext<PageCtx>({} as PageCtx);
const useCtx = () => useContext(Ctx);

function makeCtx(
  dark: boolean,
  locale: Locale,
  tFn: (k: string) => string,
): PageCtx {
  const t = (k: string) => tFn(`admin.timetable.${k}`);
  const dir: "rtl" | "ltr" = locale === "ar" ? "rtl" : "ltr";
  return {
    dark,
    locale,
    t,
    dir,
    bg: dark ? "#0f1a13" : "#f8f9fa",
    surface: dark ? "#1a2820" : "#ffffff",
    border: dark ? "#2d4035" : "#e5e7eb",
    text: dark ? "#e8f0ea" : "#111827",
    muted: dark ? "#7a9b83" : "#6b7280",
  };
}

// ══════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════

const DAYS_LABELS: Record<Locale, Record<number, string>> = {
  ar: {
    0: "السبت",
    1: "الأحد",
    2: "الإثنين",
    3: "الثلاثاء",
    4: "الأربعاء",
    5: "الخميس",
  },
  fr: {
    0: "Samedi",
    1: "Dimanche",
    2: "Lundi",
    3: "Mardi",
    4: "Mercredi",
    5: "Jeudi",
  },
  en: {
    0: "Saturday",
    1: "Sunday",
    2: "Monday",
    3: "Tuesday",
    4: "Wednesday",
    5: "Thursday",
  },
};
const DAYS = [0, 1, 2, 3, 4, 5];

const LANG_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; darkBg: string }
> = {
  FR: {
    label: "Français",
    color: "#1a56db",
    bg: "#eff6ff",
    border: "#bfdbfe",
    darkBg: "#1e2d4a",
  },
  EN: {
    label: "English",
    color: "#047857",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    darkBg: "#0f2d20",
  },
  ES: {
    label: "Español",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
    darkBg: "#2d2010",
  },
  DE: {
    label: "Deutsch",
    color: "#6d28d9",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    darkBg: "#1e1535",
  },
  TR: {
    label: "Türkçe",
    color: "#be123c",
    bg: "#fff1f2",
    border: "#fecdd3",
    darkBg: "#2d0f18",
  },
  GR: {
    label: "Ελληνικά",
    color: "#0e7490",
    bg: "#ecfeff",
    border: "#a5f3fc",
    darkBg: "#0a2030",
  },
  IT: {
    label: "Italiano",
    color: "#9d174d",
    bg: "#fdf2f8",
    border: "#f9a8d4",
    darkBg: "#2d0f20",
  },
  ZH: {
    label: "中文",
    color: "#991b1b",
    bg: "#fef2f2",
    border: "#fecaca",
    darkBg: "#2d0f0f",
  },
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

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function formatDuration(start: string, end: string) {
  const diff = timeToMinutes(end) - timeToMinutes(start);
  if (diff <= 0) return "";
  const h = Math.floor(diff / 60),
    m = diff % 60;
  return h > 0 ? `${h}h${m > 0 ? `${m}` : ""}` : `${m}min`;
}

// ══════════════════════════════════════════════════════════════
// ANIMATED MODAL WRAPPER
// ══════════════════════════════════════════════════════════════

function AnimatedModal({
  onClose,
  renderContent,
  wide = false,
}: {
  onClose: () => void;
  renderContent: (handleClose: () => void) => React.ReactNode;
  wide?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // mount → trigger open animation on next frame
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 220);
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: visible ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: visible ? "blur(4px)" : "blur(0px)",
        transition: "background 0.22s ease, backdrop-filter 0.22s ease",
      }}
    >
      <div
        style={{
          width: wide ? "min(900px, 95vw)" : "min(460px, 92vw)",
          maxHeight: "90vh",
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(24px) scale(0.96)",
          transition:
            "opacity 0.22s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {renderContent(handleClose)}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// EntryBadge
// ══════════════════════════════════════════════════════════════

function EntryBadge({
  entry,
  onDelete,
}: {
  entry: TimetableEntry;
  onDelete: () => void;
}) {
  const { dark } = useCtx();
  const meta = LANG_META[entry.language] ?? LANG_META["FR"];
  const flag = LANG_FLAGS[entry.language] ?? "🌐";
  const dur = formatDuration(entry.start_time, entry.end_time);
  return (
    <div
      style={{
        background: dark ? meta.darkBg : "#fff",
        border: `1.5px solid ${dark ? meta.color + "55" : meta.border}`,
        borderRight: `4px solid ${meta.color}`,
        borderRadius: 10,
        padding: "8px 10px 8px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        fontFamily: "'Tajawal', sans-serif",
        direction: "rtl",
        position: "relative",
        boxShadow: dark
          ? "0 1px 6px rgba(0,0,0,0.3)"
          : "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 15 }}>{flag}</span>
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
            background: dark ? "#1f2d22" : "#f3f4f6",
            color: dark ? "#d1fae5" : "#111827",
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
            color: dark ? "#7a9b83" : "#6b7280",
            fontFamily: "monospace",
            fontWeight: 600,
          }}
        >
          {entry.start_time} – {entry.end_time}
        </span>
        {dur && (
          <span
            style={{
              background: dark ? meta.darkBg : meta.bg,
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
        style={{
          position: "absolute",
          top: 6,
          left: 6,
          background: dark ? "#3d1515" : "#fef2f2",
          border: "none",
          borderRadius: 6,
          width: 20,
          height: 20,
          cursor: "pointer",
          color: "#ef4444",
          fontSize: 12,
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

function TeacherEntryBadge({
  entry,
  onDelete,
}: {
  entry: TeacherScheduleEntry;
  onDelete: () => void;
}) {
  const { dark } = useCtx();
  const meta = LANG_META[entry.language] ?? LANG_META["FR"];
  const flag = LANG_FLAGS[entry.language] ?? "🌐";
  const dur = formatDuration(entry.start_time, entry.end_time);
  return (
    <div
      style={{
        background: dark ? meta.darkBg : "#fff",
        border: `1.5px solid ${dark ? meta.color + "55" : meta.border}`,
        borderRight: `4px solid ${meta.color}`,
        borderRadius: 10,
        padding: "8px 10px 8px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontFamily: "'Tajawal', sans-serif",
        direction: "rtl",
        position: "relative",
        boxShadow: dark
          ? "0 1px 6px rgba(0,0,0,0.3)"
          : "0 1px 4px rgba(0,0,0,0.06)",
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
            background: dark ? "#1f2d22" : "#f3f4f6",
            color: dark ? "#d1fae5" : "#111827",
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
              background: dark ? "#1e2d4a" : "#eff6ff",
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
            color: dark ? "#7a9b83" : "#6b7280",
            fontFamily: "monospace",
            fontWeight: 600,
          }}
        >
          {entry.start_time} – {entry.end_time}
        </span>
        {dur && (
          <span
            style={{
              background: dark ? meta.darkBg : meta.bg,
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
          background: dark ? "#3d1515" : "#fef2f2",
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
  const { t, dark, surface, border, text, muted } = useCtx();
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
        setError(t("timeFormat"));
        return null;
      }
      if (timeToMinutes(s.start) >= timeToMinutes(s.end)) {
        setError(`${s.start} - ${s.end}: ${t("startBeforeEnd")}`);
        return null;
      }
    }
    const sorted = [...draft].sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
    );
    for (let i = 0; i < sorted.length - 1; i++) {
      if (timeToMinutes(sorted[i].end) > timeToMinutes(sorted[i + 1].start)) {
        setError(`${t("conflict")} ${sorted[i].start}-${sorted[i].end}`);
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
    <AnimatedModal
      onClose={onClose}
      renderContent={(handleClose) => (
        <div
          style={{
            background: surface,
            borderRadius: 16,
            padding: 28,
            maxHeight: "88vh",
            overflowY: "auto",
            direction: "rtl",
            fontFamily: "'Tajawal', sans-serif",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            border: `1px solid ${border}`,
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
              <div style={{ fontSize: 17, fontWeight: 700, color: text }}>
                {t("slotTitle")}
              </div>
              <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>
                {draft.length} {t("slotSub")}
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: dark ? "#2d4035" : "#f3f4f6",
                border: "none",
                borderRadius: 8,
                padding: "4px 10px",
                cursor: "pointer",
                fontSize: 18,
                color: text,
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
                    background: dark ? "#132018" : "#f9fafb",
                    borderRadius: 10,
                    padding: "10px 12px",
                    border: `1.5px solid ${border}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#264230",
                      background: dark ? "#1a3326" : "#d1fae5",
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
                    onChange={(e) =>
                      updateSlot(slot.id, "start", e.target.value)
                    }
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      borderRadius: 8,
                      border: `1.5px solid ${border}`,
                      fontSize: 13,
                      outline: "none",
                      direction: "ltr",
                      background: dark ? "#1a2820" : "#fff",
                      color: text,
                    }}
                  />
                  <span style={{ color: muted, fontSize: 14 }}>←</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateSlot(slot.id, "end", e.target.value)}
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      borderRadius: 8,
                      border: `1.5px solid ${border}`,
                      fontSize: 13,
                      outline: "none",
                      direction: "ltr",
                      background: dark ? "#1a2820" : "#fff",
                      color: text,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: dur > 0 ? "#264230" : "#ef4444",
                      background:
                        dur > 0
                          ? dark
                            ? "#1a3326"
                            : "#f0fdf4"
                          : dark
                            ? "#3d1515"
                            : "#fef2f2",
                      borderRadius: 6,
                      padding: "2px 7px",
                      minWidth: 36,
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    {dur > 0 ? `${dur}m` : "!"}
                  </span>
                  <button
                    onClick={() => removeSlot(slot.id)}
                    disabled={draft.length <= 1}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: 18,
                      color:
                        draft.length > 1
                          ? "#ef4444"
                          : dark
                            ? "#3d4d42"
                            : "#d1d5db",
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
                background: dark ? "#3d1515" : "#fef2f2",
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
              background: dark ? "#1a3326" : "#f0fdf4",
              color: dark ? "#86efac" : "#264230",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            {t("slotAdd")}
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
              {isSaving ? t("saving") : t("slotSave")}
            </button>
            <button
              onClick={() => {
                onReset();
                handleClose();
              }}
              disabled={isSaving}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1.5px solid #fecaca",
                background: dark ? "#3d1515" : "#fef2f2",
                color: "#dc2626",
                fontWeight: 600,
                fontSize: 13,
                cursor: isSaving ? "not-allowed" : "pointer",
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              {t("slotReset")}
            </button>
            <button
              onClick={handleClose}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: `1.5px solid ${border}`,
                background: surface,
                color: text,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
    />
  );
}

// ══════════════════════════════════════════════════════════════
// ADD MODAL — Rooms
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
  const { t, dark, surface, border, text, muted, locale } = useCtx();
  const dayLabel = DAYS_LABELS[locale][day];
  const [roomId, setRoomId] = useState(rooms[0]?.room_id ?? "");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("09:30");
  const [level, setLevel] = useState("A1");
  const [lang, setLang] = useState("FR");
  const [groupNum, setGroupNum] = useState("01");
  const [timeErr, setTimeErr] = useState<string | null>(null);
  const meta = LANG_META[lang];
  const duration = formatDuration(start, end);
  const inputBase = {
    borderRadius: 8,
    border: `1.5px solid ${border}`,
    outline: "none",
    background: dark ? "#132018" : "#fff",
    color: text,
  } as const;

  function handleSubmit() {
    setTimeErr(null);
    if (!roomId) return;
    if (timeToMinutes(start) >= timeToMinutes(end)) {
      setTimeErr(t("startBeforeEndErr"));
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
    <AnimatedModal
      onClose={onClose}
      renderContent={(handleClose) => (
        <div
          style={{
            background: surface,
            borderRadius: 16,
            padding: 28,
            direction: "rtl",
            fontFamily: "'Tajawal', sans-serif",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            maxHeight: "90vh",
            overflowY: "auto",
            border: `1px solid ${border}`,
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
              <div style={{ fontSize: 17, fontWeight: 700, color: text }}>
                {t("addLessonTitle")}
              </div>
              <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>
                {dayLabel}
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: dark ? "#2d4035" : "#f3f4f6",
                border: "none",
                borderRadius: 8,
                padding: "4px 10px",
                cursor: "pointer",
                fontSize: 16,
                color: text,
              }}
            >
              ×
            </button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: text,
                display: "block",
                marginBottom: 8,
              }}
            >
              {t("timePeriod")}
            </label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: muted, marginBottom: 4 }}>
                  {t("from")}
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
                    fontSize: 15,
                    fontFamily: "monospace",
                    boxSizing: "border-box" as const,
                    direction: "ltr" as const,
                    ...inputBase,
                    border: `1.5px solid ${timeErr ? "#fca5a5" : border}`,
                  }}
                />
              </div>
              <div style={{ paddingTop: 18, color: muted, fontSize: 18 }}>
                ←
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: muted, marginBottom: 4 }}>
                  {t("to")}
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
                    fontSize: 15,
                    fontFamily: "monospace",
                    boxSizing: "border-box" as const,
                    direction: "ltr" as const,
                    ...inputBase,
                    border: `1.5px solid ${timeErr ? "#fca5a5" : border}`,
                  }}
                />
              </div>
            </div>
            {duration && !timeErr && (
              <div
                style={{
                  marginTop: 8,
                  background: dark ? "#1a3326" : "#f0fdf4",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 12,
                  color: dark ? "#86efac" : "#264230",
                  fontWeight: 600,
                  display: "inline-block",
                }}
              >
                {t("durationLabel")} {duration}
              </div>
            )}
            {timeErr && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: "#dc2626",
                  background: dark ? "#3d1515" : "#fef2f2",
                  borderRadius: 6,
                  padding: "4px 10px",
                }}
              >
                ⚠️ {timeErr}
              </div>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: text,
                display: "block",
                marginBottom: 6,
              }}
            >
              {t("room")}
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: 13,
                fontFamily: "'Tajawal', sans-serif",
                boxSizing: "border-box" as const,
                ...inputBase,
              }}
            >
              {rooms.map((r) => (
                <option key={r.room_id} value={r.room_id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: text,
                display: "block",
                marginBottom: 6,
              }}
            >
              {t("language")}
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
                      border: `2px solid ${active ? m.color : border}`,
                      background: active
                        ? dark
                          ? m.darkBg
                          : m.bg
                        : dark
                          ? "#1a2820"
                          : "#f9fafb",
                      color: active ? m.color : text,
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
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: text,
                display: "block",
                marginBottom: 6,
              }}
            >
              {t("level")}
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {LEVELS.map((lv) => (
                <button
                  key={lv}
                  onClick={() => setLevel(lv)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    border: `2px solid ${level === lv ? "#264230" : border}`,
                    background:
                      level === lv ? "#264230" : dark ? "#1a2820" : "#f9fafb",
                    color: level === lv ? "#fff" : text,
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
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: text,
                display: "block",
                marginBottom: 6,
              }}
            >
              {t("groupNum")}
            </label>
            <input
              value={groupNum}
              onChange={(e) => setGroupNum(e.target.value)}
              placeholder="01"
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: 14,
                fontFamily: "'Tajawal', sans-serif",
                boxSizing: "border-box" as const,
                direction: "ltr" as const,
                textAlign: "center" as const,
                ...inputBase,
              }}
            />
          </div>
          <div
            style={{
              background: dark ? meta.darkBg : meta.bg,
              border: `1.5px solid ${dark ? meta.color + "55" : meta.border}`,
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 11, color: muted, marginBottom: 4 }}>
              {t("preview")}
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
                style={{ fontSize: 12, color: text, fontFamily: "monospace" }}
              >
                {start} - {end}
              </span>
              {duration && (
                <span style={{ fontSize: 11, color: muted }}>({duration})</span>
              )}
              <span
                style={{ fontWeight: 700, color: meta.color, fontSize: 13 }}
              >
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
              {isPending ? t("saving") : t("add")}
            </button>
            <button
              onClick={handleClose}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: `1.5px solid ${border}`,
                background: surface,
                color: text,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
    />
  );
}

// ══════════════════════════════════════════════════════════════
// ADD TEACHER MODAL — Wide rectangular with group list
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
  const { t, dark, surface, border, text, muted, locale } = useCtx();
  const dayLabel = DAYS_LABELS[locale][day];
  const [roomId, setRoomId] = useState("");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("09:30");
  const [lang, setLang] = useState("FR");
  const [level, setLevel] = useState("A1");
  const [groupId, setGroupId] = useState("");
  const [search, setSearch] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const meta = LANG_META[lang];
  const dur = formatDuration(start, end);
  const selectedGroup = teacherGroups.find((g) => g.group_id === groupId);
  const inputBase = {
    borderRadius: 8,
    border: `1.5px solid ${border}`,
    outline: "none",
    background: dark ? "#132018" : "#fff",
    color: text,
  } as const;

  const filteredGroups = teacherGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.course.course_name.toLowerCase().includes(search.toLowerCase()) ||
      g.level.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSubmit() {
    setErr(null);
    if (timeToMinutes(start) >= timeToMinutes(end)) {
      setErr(t("startBeforeEndErr"));
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
    <AnimatedModal
      onClose={onClose}
      wide
      renderContent={(handleClose) => (
        <div
          style={{
            background: surface,
            borderRadius: 18,
            direction: "rtl",
            fontFamily: "'Tajawal', sans-serif",
            boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
            border: `1px solid ${border}`,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh",
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              background: "#264230",
              padding: "16px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>
                {t("addLessonTitle")}
              </div>
              <div style={{ fontSize: 12, color: "#9dc9ad", marginTop: 2 }}>
                {dayLabel}
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: 8,
                padding: "5px 12px",
                cursor: "pointer",
                fontSize: 18,
                color: "#fff",
              }}
            >
              ×
            </button>
          </div>

          {/* ── Body: two columns ── */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* LEFT — Group list */}
            <div
              style={{
                width: 320,
                flexShrink: 0,
                borderLeft: `1px solid ${border}`,
                display: "flex",
                flexDirection: "column",
                background: dark ? "#132018" : "#f9fafb",
              }}
            >
              <div
                style={{
                  padding: "14px 14px 8px",
                  borderBottom: `1px solid ${border}`,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: text,
                    marginBottom: 8,
                  }}
                >
                  {t("group")}
                  <span
                    style={{
                      marginRight: 6,
                      background: dark ? "#2d4035" : "#e5e7eb",
                      color: muted,
                      borderRadius: 10,
                      padding: "1px 7px",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {filteredGroups.length}
                  </span>
                </div>
                {/* Search */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: dark ? "#1a2820" : "#fff",
                    borderRadius: 8,
                    border: `1.5px solid ${border}`,
                    padding: "6px 10px",
                  }}
                >
                  <span style={{ fontSize: 12, color: muted }}>🔍</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("searchTeacher")}
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: 12,
                      fontFamily: "'Tajawal', sans-serif",
                      color: text,
                    }}
                  />
                </div>
              </div>

              {/* Group items */}
              <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                {teacherGroups.length === 0 ? (
                  <div
                    style={{
                      padding: "16px 12px",
                      borderRadius: 8,
                      background: dark ? "#2d2010" : "#fffbeb",
                      border: `1px solid ${dark ? "#5c4010" : "#fde68a"}`,
                      fontSize: 12,
                      color: dark ? "#fbbf24" : "#92400e",
                      marginTop: 4,
                    }}
                  >
                    {t("noGroups")}
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 20,
                      color: muted,
                      fontSize: 12,
                    }}
                  >
                    —
                  </div>
                ) : (
                  filteredGroups.map((g) => {
                    const active = groupId === g.group_id;
                    return (
                      <button
                        key={g.group_id}
                        onClick={() => {
                          setGroupId(active ? "" : g.group_id);
                          setLevel(g.level);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "right",
                          padding: "10px 12px",
                          marginBottom: 5,
                          borderRadius: 10,
                          border: `2px solid ${active ? "#264230" : border}`,
                          background: active
                            ? dark
                              ? "#1a3326"
                              : "#f0fdf4"
                            : surface,
                          cursor: "pointer",
                          fontFamily: "'Tajawal', sans-serif",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "border-color 0.15s, background 0.15s",
                          boxShadow: active
                            ? "0 1px 8px rgba(38,66,48,0.18)"
                            : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (!active)
                            e.currentTarget.style.borderColor = "#264230";
                        }}
                        onMouseLeave={(e) => {
                          if (!active)
                            e.currentTarget.style.borderColor = border;
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: active
                                ? dark
                                  ? "#86efac"
                                  : "#264230"
                                : text,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {g.name}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: muted,
                              marginTop: 2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {g.course.course_name}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: 3,
                            marginRight: 8,
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              background: active
                                ? "#264230"
                                : dark
                                  ? "#2d4035"
                                  : "#f3f4f6",
                              color: active ? "#C4A035" : muted,
                              borderRadius: 6,
                              padding: "1px 7px",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            {g.level}
                          </span>
                        </div>
                        {active && (
                          <span
                            style={{
                              color: dark ? "#86efac" : "#264230",
                              fontWeight: 900,
                              fontSize: 16,
                              flexShrink: 0,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Selected group preview */}
              {selectedGroup && (
                <div
                  style={{
                    padding: "12px 14px",
                    borderTop: `1px solid ${border}`,
                    background: dark ? "#1a3326" : "#f0fdf4",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: dark ? "#86efac" : "#264230",
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    ✓ {t("group")} مختار
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: dark ? "#86efac" : "#264230",
                    }}
                  >
                    {selectedGroup.name}
                  </div>
                  <div style={{ fontSize: 11, color: muted }}>
                    {selectedGroup.course.course_name} · {selectedGroup.level}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Settings */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {/* Time */}
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: text,
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  {t("timePeriod")}
                </label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 11, color: muted, marginBottom: 4 }}
                    >
                      {t("from")}
                    </div>
                    <input
                      type="time"
                      value={start}
                      onChange={(e) => {
                        setStart(e.target.value);
                        setErr(null);
                      }}
                      style={{
                        width: "100%",
                        padding: "9px 10px",
                        fontSize: 14,
                        direction: "ltr" as const,
                        boxSizing: "border-box" as const,
                        ...inputBase,
                        border: `1.5px solid ${err ? "#fca5a5" : border}`,
                      }}
                    />
                  </div>
                  <div style={{ paddingTop: 18, color: muted, fontSize: 20 }}>
                    ←
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 11, color: muted, marginBottom: 4 }}
                    >
                      {t("to")}
                    </div>
                    <input
                      type="time"
                      value={end}
                      onChange={(e) => {
                        setEnd(e.target.value);
                        setErr(null);
                      }}
                      style={{
                        width: "100%",
                        padding: "9px 10px",
                        fontSize: 14,
                        direction: "ltr" as const,
                        boxSizing: "border-box" as const,
                        ...inputBase,
                        border: `1.5px solid ${err ? "#fca5a5" : border}`,
                      }}
                    />
                  </div>
                  {dur && !err && (
                    <div style={{ paddingTop: 18 }}>
                      <span
                        style={{
                          fontSize: 12,
                          color: dark ? "#86efac" : "#264230",
                          background: dark ? "#1a3326" : "#f0fdf4",
                          borderRadius: 6,
                          padding: "4px 10px",
                          fontWeight: 700,
                        }}
                      >
                        ⏱ {dur}
                      </span>
                    </div>
                  )}
                </div>
                {err && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: "#dc2626",
                      background: dark ? "#3d1515" : "#fef2f2",
                      borderRadius: 6,
                      padding: "4px 10px",
                    }}
                  >
                    ⚠️ {err}
                  </div>
                )}
              </div>

              {/* Room (optional) */}
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: text,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  {t("room")}{" "}
                  <span style={{ color: muted, fontWeight: 400, fontSize: 11 }}>
                    ({t("optRoom")})
                  </span>
                </label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    fontSize: 13,
                    fontFamily: "'Tajawal', sans-serif",
                    boxSizing: "border-box" as const,
                    ...inputBase,
                  }}
                >
                  <option value="">{t("noRoom")}</option>
                  {rooms.map((r) => (
                    <option key={r.room_id} value={r.room_id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: text,
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  {t("language")}
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
                          padding: "6px 12px",
                          borderRadius: 8,
                          border: `2px solid ${active ? m.color : border}`,
                          background: active
                            ? dark
                              ? m.darkBg
                              : m.bg
                            : dark
                              ? "#1a2820"
                              : "#f9fafb",
                          color: active ? m.color : text,
                          fontWeight: active ? 700 : 500,
                          fontSize: 12,
                          cursor: "pointer",
                          fontFamily: "'Tajawal', sans-serif",
                          transition: "all 0.12s",
                        }}
                      >
                        {LANG_FLAGS[l]} {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Level (only if no group selected) */}
              {!selectedGroup && (
                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: text,
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    {t("level")}
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {LEVELS.map((lv) => (
                      <button
                        key={lv}
                        onClick={() => setLevel(lv)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          border: `2px solid ${level === lv ? "#264230" : border}`,
                          background:
                            level === lv
                              ? "#264230"
                              : dark
                                ? "#1a2820"
                                : "#f9fafb",
                          color: level === lv ? "#fff" : text,
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
              )}

              {/* Preview */}
              <div
                style={{
                  background: dark ? meta.darkBg : meta.bg,
                  border: `1.5px solid ${dark ? meta.color + "55" : meta.border}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 22,
                }}
              >
                <div style={{ fontSize: 10, color: muted, marginBottom: 6 }}>
                  {t("previewLabel")}
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
                      fontSize: 13,
                      fontFamily: "monospace",
                      color: text,
                      fontWeight: 600,
                    }}
                  >
                    {start} – {end}
                  </span>
                  {dur && (
                    <span style={{ fontSize: 11, color: muted }}>({dur})</span>
                  )}
                  <span
                    style={{ fontWeight: 800, color: meta.color, fontSize: 14 }}
                  >
                    {LANG_FLAGS[lang]} {lang}
                  </span>
                  <span
                    style={{
                      background: dark ? "#1f2d22" : "#f3f4f6",
                      color: dark ? "#d1fae5" : "#111827",
                      borderRadius: 6,
                      padding: "2px 9px",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {selectedGroup?.name ?? `${level} 01`}
                  </span>
                  {selectedGroup?.level && (
                    <span
                      style={{
                        background: "#264230",
                        color: "#C4A035",
                        borderRadius: 6,
                        padding: "2px 9px",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {selectedGroup.level}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleSubmit}
                  disabled={isPending}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 10,
                    border: "none",
                    background: isPending ? "#9ca3af" : "#264230",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: isPending ? "not-allowed" : "pointer",
                    fontFamily: "'Tajawal', sans-serif",
                    transition: "background 0.15s",
                  }}
                >
                  {isPending ? t("saving") : t("add")}
                </button>
                <button
                  onClick={handleClose}
                  style={{
                    padding: "11px 20px",
                    borderRadius: 10,
                    border: `1.5px solid ${border}`,
                    background: surface,
                    color: text,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    />
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 1 — ROOMS
// ══════════════════════════════════════════════════════════════

function RoomsTimetableTab() {
  const { t, dark, surface, border, text, muted, bg, locale } = useCtx();
  const DAYS_AR = DAYS_LABELS[locale];
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
          if (status === 409)
            toast.error(
              conflict
                ? `تعارض في القاعة · ${conflict.day} · ${conflict.slot}`
                : "تعارض: القاعة محجوزة في هذا الوقت",
              { duration: 6000 },
            );
          else if (status === 404) toast.error("القاعة أو الفوج غير موجود");
          else if (status === 400) toast.error(`خطأ في البيانات: ${msg}`);
          else toast.error(`خطأ في الخادم: ${msg}`);
        },
      });
    },
    [createEntry],
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm(t("deleteLesson"))) {
        deleteEntry(id, {
          onSuccess: () => toast.success("تم حذف الحصة بنجاح"),
          onError: () => toast.error("فشل حذف الحصة، حاول مرة أخرى"),
        });
      }
    },
    [deleteEntry, t],
  );

  const activeGreen = dark ? "#86efac" : "#264230";

  return (
    <>
      {/* Filter bar */}
      <div
        style={{
          background: surface,
          borderBottom: `1px solid ${border}`,
          padding: "10px 28px",
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 12, color: muted, fontWeight: 600 }}>
          {t("filter")}
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
                background: active ? m.color : dark ? m.darkBg : m.bg,
                border: `1px solid ${dark ? m.color + "55" : m.border}`,
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
              color: muted,
              background: dark ? "#2d4035" : "#f3f4f6",
              border: "none",
              borderRadius: 20,
              padding: "2px 10px",
              cursor: "pointer",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            {t("cancelFilter")}
          </button>
        )}
        <div style={{ marginRight: "auto" }}>
          <button
            onClick={() => setSlotMgrOpen(true)}
            style={{
              background: dark ? "#1a3326" : "#f0fdf4",
              border: `1.5px solid ${dark ? "#3d6b50" : "#264230"}`,
              borderRadius: 8,
              padding: "5px 14px",
              color: activeGreen,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            {t("slotBtn")} ({slots.length})
          </button>
        </div>
      </div>

      {/* Day tabs */}
      <div
        style={{
          background: surface,
          borderBottom: `1px solid ${border}`,
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
                  ? `3px solid ${activeGreen}`
                  : "3px solid transparent",
              color: activeDay === d ? activeGreen : muted,
              fontWeight: activeDay === d ? 700 : 500,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            {d === "all" ? t("all") : DAYS_AR[d]}
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
          <div style={{ textAlign: "center", padding: 60, color: muted }}>
            {t("loading")}
          </div>
        )}
        {isError && (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: "#ef4444",
              background: surface,
              borderRadius: 12,
            }}
          >
            {t("errorLoading")}
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
                  background: surface,
                  borderRadius: 12,
                  border: `1px solid ${border}`,
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
                        {byDay[day].length} {t("lesson")}
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
                        color: dark ? "#3d6b50" : "#d1d5db",
                        fontSize: 12,
                        padding: "20px 0",
                      }}
                    >
                      {t("noLessons")}
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
                      border: `1.5px dashed ${dark ? "#3d6b50" : "#d1d5db"}`,
                      borderRadius: 8,
                      background: "transparent",
                      color: dark ? "#3d6b50" : "#9ca3af",
                      cursor: "pointer",
                      fontSize: 13,
                      fontFamily: "'Tajawal', sans-serif",
                      marginTop: "auto",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#264230";
                      e.currentTarget.style.color = activeGreen;
                      e.currentTarget.style.background = dark
                        ? "#1a3326"
                        : "#f0fdf4";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = dark
                        ? "#3d6b50"
                        : "#d1d5db";
                      e.currentTarget.style.color = dark
                        ? "#3d6b50"
                        : "#9ca3af";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {t("addLesson")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lang guide */}
      <div style={{ padding: "0 28px 40px" }}>
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 12,
            padding: "14px 20px",
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: text }}>
            {t("langGuide")}
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
              <span style={{ fontSize: 11, color: text }}>
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
// TAB 2 — TEACHERS
// ══════════════════════════════════════════════════════════════

interface Teacher {
  teacher_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  user?: { google_avatar?: string | null } | null;
}

function TeacherTimetableTab() {
  const { t, dark, surface, border, text, muted, bg, locale } = useCtx();
  const DAYS_AR = DAYS_LABELS[locale];
  const activeGreen = dark ? "#86efac" : "#264230";

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [activeDay, setActiveDay] = useState<number | "all">("all");
  const [modal, setModal] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data: rooms = [] } = useRooms();
  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers();
  const { data: teacherGroups = [] } = useTeacherGroups(
    selectedTeacher?.teacher_id ?? null,
  );
  const { data: scheduleData, isLoading: loadingSchedule } = useTeacherSchedule(
    selectedTeacher?.teacher_id ?? null,
  );
  const { mutate: createEntry, isPending: isCreating } =
    useCreateTeacherEntry();
  const { mutate: deleteEntry } = useDeleteTeacherEntry();

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

  const filteredTeachers = teachers.filter(
    (t2) =>
      `${t2.first_name} ${t2.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      t2.email?.toLowerCase().includes(search.toLowerCase()),
  );
  const tName = (t2: Teacher) => `${t2.first_name} ${t2.last_name}`;
  const tInit = (t2: Teacher) =>
    `${t2.first_name[0] ?? "?"}${t2.last_name[0] ?? ""}`.toUpperCase();
  const tAvatar = (t2: Teacher) => t2.user?.google_avatar ?? null;

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
          background: surface,
          borderLeft: `1px solid ${border}`,
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
              background: dark ? "#132018" : "#f9fafb",
              borderRadius: 10,
              border: `1.5px solid ${border}`,
              padding: "7px 10px",
            }}
          >
            <span style={{ color: muted, fontSize: 13 }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchTeacher")}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 12,
                fontFamily: "'Tajawal', sans-serif",
                color: text,
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
          <span style={{ fontSize: 11, fontWeight: 700, color: muted }}>
            {t("teachers")}
          </span>
          <span
            style={{
              fontSize: 10,
              background: dark ? "#2d4035" : "#f3f4f6",
              color: muted,
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
                color: muted,
                fontSize: 12,
              }}
            >
              {t("loading")}
            </div>
          ) : (
            filteredTeachers.map((teacher) => {
              const isSelected =
                selectedTeacher?.teacher_id === teacher.teacher_id;
              return (
                <button
                  key={teacher.teacher_id}
                  onClick={() => {
                    setSelectedTeacher(teacher);
                    setActiveDay("all");
                  }}
                  style={{
                    width: "100%",
                    textAlign: "right",
                    padding: "9px 10px",
                    marginBottom: 5,
                    borderRadius: 11,
                    border: `${isSelected ? "2px" : "1.5px"} solid ${isSelected ? "#264230" : border}`,
                    background: isSelected
                      ? dark
                        ? "#1a3326"
                        : "#f0fdf4"
                      : surface,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    boxShadow: isSelected
                      ? "0 1px 8px rgba(38,66,48,0.15)"
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
                    if (!isSelected) e.currentTarget.style.borderColor = border;
                  }}
                >
                  {tAvatar(teacher) ? (
                    <img
                      src={tAvatar(teacher)!}
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
                        background: isSelected
                          ? "#264230"
                          : dark
                            ? "#2d4035"
                            : "#e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: isSelected ? "#C4A035" : muted,
                        flexShrink: 0,
                      }}
                    >
                      {tInit(teacher)}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: isSelected ? activeGreen : text,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tName(teacher)}
                    </div>
                    {teacher.email && (
                      <div
                        style={{
                          fontSize: 10,
                          color: muted,
                          marginTop: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {teacher.email}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: activeGreen,
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

      {/* Main area */}
      <div style={{ flex: 1, overflowY: "auto", background: bg }}>
        {!selectedTeacher ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 16,
                background: surface,
                border: `2px dashed ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              👨‍🏫
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: text }}>
                {t("chooseTeacher")}
              </div>
              <div style={{ fontSize: 12, color: muted, marginTop: 3 }}>
                {t("chooseTeacherSub")}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Teacher header */}
            <div
              style={{
                background: surface,
                borderBottom: `1px solid ${border}`,
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
                <div style={{ fontSize: 15, fontWeight: 800, color: text }}>
                  {tName(selectedTeacher)}
                </div>
                <div style={{ fontSize: 11, color: muted, marginTop: 1 }}>
                  {teacherGroups.length} {t("groups")} ·{" "}
                  <span style={{ color: activeGreen, fontWeight: 600 }}>
                    {entries.length} {t("inSchedule")}
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
                        background: dark ? "#1a3326" : "#f0fdf4",
                        color: activeGreen,
                        border: `1px solid ${dark ? "#3d6b50" : "#a7f3d0"}`,
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
                    <span style={{ fontSize: 10, color: muted }}>
                      +{teacherGroups.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Day tabs */}
            <div
              style={{
                background: surface,
                borderBottom: `1px solid ${border}`,
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
                        ? `3px solid ${activeGreen}`
                        : "3px solid transparent",
                    color: activeDay === d ? activeGreen : muted,
                    fontWeight: activeDay === d ? 700 : 500,
                    fontSize: 12,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                >
                  {d === "all" ? t("allDays") : DAYS_AR[d]}
                  {d !== "all" && byDay[d]?.length > 0 && (
                    <span
                      style={{
                        marginRight: 4,
                        background:
                          activeDay === d
                            ? "#264230"
                            : dark
                              ? "#2d4035"
                              : "#f3f4f6",
                        color: activeDay === d ? "#fff" : muted,
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

            {/* Schedule grid */}
            <div style={{ padding: "16px", overflowX: "auto" }}>
              {loadingSchedule ? (
                <div style={{ textAlign: "center", padding: 40, color: muted }}>
                  {t("loadingSchedule")}
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
                        background: surface,
                        borderRadius: 12,
                        border: `1px solid ${border}`,
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
                              {byDay[day].length} {t("lesson")}
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
                              color: dark ? "#3d6b50" : "#d1d5db",
                              fontSize: 11,
                              padding: "14px 0",
                            }}
                          >
                            {t("noLessons")}
                          </div>
                        ) : (
                          byDay[day].map((e) => (
                            <TeacherEntryBadge
                              key={e.entry_id}
                              entry={e}
                              onDelete={() => {
                                if (confirm(t("deleteLessonShort")))
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
                            border: `1.5px dashed ${dark ? "#3d6b50" : "#d1d5db"}`,
                            borderRadius: 8,
                            background: "transparent",
                            color: dark ? "#3d6b50" : "#9ca3af",
                            cursor: "pointer",
                            fontSize: 11,
                            fontFamily: "'Tajawal', sans-serif",
                            marginTop: "auto",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#264230";
                            e.currentTarget.style.color = activeGreen;
                            e.currentTarget.style.background = dark
                              ? "#1a3326"
                              : "#f0fdf4";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = dark
                              ? "#3d6b50"
                              : "#d1d5db";
                            e.currentTarget.style.color = dark
                              ? "#3d6b50"
                              : "#9ca3af";
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {t("addLesson")}
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
  const { t: tFn, i18n } = useTranslation();
  const locale: Locale = i18n.language.startsWith("fr")
    ? "fr"
    : i18n.language.startsWith("en")
      ? "en"
      : "ar";
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const ctx = makeCtx(dark, locale, tFn);
  const { t, dir, bg } = ctx;

  return (
    <Ctx.Provider value={ctx}>
      <link
        href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          minHeight: "100vh",
          background: bg,
          fontFamily: "'Tajawal', sans-serif",
          direction: dir,
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            background: "#264230",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
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
                {t("title")}
              </div>
              <div style={{ color: "#9dc9ad", fontSize: 12 }}>
                {t("subtitle")}
              </div>
            </div>
          </div>
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
              { key: "rooms" as Tab, label: t("tabRooms") },
              { key: "teachers" as Tab, label: t("tabTeachers") },
            ].map((tb) => (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: tab === tb.key ? "#fff" : "transparent",
                  color: tab === tb.key ? "#264230" : "rgba(255,255,255,0.85)",
                  fontWeight: tab === tb.key ? 700 : 500,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "'Tajawal', sans-serif",
                  transition: "all 0.15s",
                  boxShadow:
                    tab === tb.key ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
                }}
              >
                {tb.label}
              </button>
            ))}
          </div>
        </div>
        {tab === "rooms" && <RoomsTimetableTab />}
        {tab === "teachers" && <TeacherTimetableTab />}
      </div>
    </Ctx.Provider>
  );
}
