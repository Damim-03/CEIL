// src/pages/public/PublicTimetablePage.tsx
// صفحة التوزيع الزمني العامة — جدول أسبوعي كامل بدون تسجيل دخول

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/api/axios"; // ← عدّل المسار
import type { TimetableEntry } from "../../lib/api/admin/timetable.api";

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
const LANG_FLAGS: Record<string, string> = {
  FR: "🇫🇷",
  EN: "🇬🇧",
  ES: "🇪🇸",
  DE: "🇩🇪",
  TR: "🇹🇷",
  GR: "🇬🇷",
  IT: "🇮🇹",
  AR: "🇩🇿",
};

// ── Helpers ───────────────────────────────────────────────────

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatDuration(s: string, e: string) {
  const d = timeToMinutes(e) - timeToMinutes(s);
  if (d <= 0) return "";
  const h = Math.floor(d / 60),
    m = d % 60;
  return h > 0 ? `${h}س${m > 0 ? `${m}د` : ""}` : `${m}د`;
}

function getCurrentDayIndex() {
  const map: Record<number, number> = { 6: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 };
  return map[new Date().getDay()] ?? 0;
}

// يجمع كل الفترات الزمنية الفريدة من الحصص
function extractSlots(entries: TimetableEntry[]): string[] {
  const set = new Set<string>();
  for (const e of entries) set.add(e.start_time);
  return Array.from(set).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
}

// ── Cell — حصة واحدة في الجدول ───────────────────────────────

function SessionCell({ entry }: { entry: TimetableEntry }) {
  const meta = LANG_META[entry.language] ?? LANG_META["FR"];
  const flag = LANG_FLAGS[entry.language] ?? "🌐";
  const dur = formatDuration(entry.start_time, entry.end_time);

  return (
    <div
      style={{
        background: meta.bg,
        border: `1.5px solid ${meta.border}`,
        borderRight: `3px solid ${meta.color}`,
        borderRadius: 8,
        padding: "6px 8px 6px 6px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontFamily: "'Tajawal', sans-serif",
        direction: "rtl",
      }}
    >
      {/* اللغة */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: 13 }}>{flag}</span>
        <span
          style={{
            background: meta.color,
            color: "#fff",
            borderRadius: 5,
            padding: "1px 6px",
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          {entry.language}
        </span>
        <span style={{ fontSize: 11, color: meta.color, fontWeight: 700 }}>
          {meta.label}
        </span>
      </div>
      {/* الفوج */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#111827",
          background: "rgba(0,0,0,0.05)",
          borderRadius: 5,
          padding: "1px 6px",
          display: "inline-block",
          alignSelf: "flex-start",
        }}
      >
        {entry.group_label}
      </div>
      {/* الوقت + القاعة */}
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
            fontSize: 10,
            color: "#6b7280",
            fontFamily: "monospace",
            direction: "ltr",
          }}
        >
          {entry.start_time}–{entry.end_time}
        </span>
        {dur && (
          <span style={{ fontSize: 10, color: meta.color, fontWeight: 600 }}>
            {dur}
          </span>
        )}
        {entry.room?.name && (
          <span
            style={{
              background: "#264230",
              color: "#C4A035",
              borderRadius: 4,
              padding: "1px 5px",
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            🚪 {entry.room.name}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

export default function PublicTimetablePage() {
  const todayIdx = getCurrentDayIndex();
  const [filterLang, setFilterLang] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-timetable"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/public/timetable");
      return data as { success: boolean; data: TimetableEntry[] };
    },
    staleTime: 1000 * 60 * 5,
  });

  const allEntries = data?.data ?? [];

  // فلترة حسب اللغة
  const filtered = filterLang
    ? allEntries.filter((e) => e.language === filterLang)
    : allEntries;

  // تجميع: day → startTime → entries[]
  const grid: Record<number, Record<string, TimetableEntry[]>> = {};
  for (const d of DAYS) grid[d] = {};
  for (const e of filtered) {
    if (!grid[e.day_of_week][e.start_time]) {
      grid[e.day_of_week][e.start_time] = [];
    }
    grid[e.day_of_week][e.start_time].push(e);
  }

  const slots = extractSlots(filtered);
  const availableLangs = Array.from(new Set(allEntries.map((e) => e.language)));

  // إحصاءات
  const totalSessions = filtered.length;
  const totalLangs = Array.from(
    new Set(filtered.map((e) => e.language)),
  ).length;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          minHeight: "100vh",
          background: "#f0f4f8",
          fontFamily: "'Tajawal', sans-serif",
          direction: "rtl",
        }}
      >
        {/* ══ Header ══════════════════════════════════════════ */}
        <div
          style={{
            background:
              "linear-gradient(160deg, #264230 0%, #1a2e22 60%, #0f1e16 100%)",
            padding: "28px 24px 20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {/* Logo + Title */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: "#C4A035",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  boxShadow: "0 4px 12px rgba(196,160,53,0.4)",
                }}
              >
                🗓
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>
                  التوزيع الزمني للقاعات
                </div>
                <div style={{ color: "#9dc9ad", fontSize: 13, marginTop: 2 }}>
                  مركز التعليم المكثف للغات · دورة فيفري 2026
                </div>
              </div>

              {/* Stats */}
              {!isLoading && totalSessions > 0 && (
                <div style={{ marginRight: "auto", display: "flex", gap: 10 }}>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      padding: "8px 16px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        color: "#C4A035",
                        fontWeight: 800,
                        fontSize: 18,
                      }}
                    >
                      {totalSessions}
                    </div>
                    <div
                      style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}
                    >
                      حصة
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      padding: "8px 16px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        color: "#C4A035",
                        fontWeight: 800,
                        fontSize: 18,
                      }}
                    >
                      {totalLangs}
                    </div>
                    <div
                      style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}
                    >
                      لغة
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Filter */}
            {availableLangs.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                  فلترة:
                </span>
                <button
                  onClick={() => setFilterLang(null)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: !filterLang
                      ? "2px solid #C4A035"
                      : "2px solid rgba(255,255,255,0.2)",
                    background: !filterLang ? "#C4A035" : "transparent",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                >
                  الكل ({allEntries.length})
                </button>

                {availableLangs.map((lang) => {
                  const meta = LANG_META[lang];
                  const flag = LANG_FLAGS[lang] ?? "🌐";
                  const count = allEntries.filter(
                    (e) => e.language === lang,
                  ).length;
                  const active = filterLang === lang;
                  return (
                    <button
                      key={lang}
                      onClick={() => setFilterLang(active ? null : lang)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 20,
                        border: active
                          ? `2px solid ${meta?.color}`
                          : "2px solid rgba(255,255,255,0.2)",
                        background: active ? meta?.color : "transparent",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "'Tajawal', sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        transition: "all 0.15s",
                      }}
                    >
                      <span>{flag}</span>
                      <span>{meta?.label ?? lang}</span>
                      <span style={{ opacity: 0.8, fontSize: 11 }}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══ Table ═══════════════════════════════════════════ */}
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "20px 16px 60px",
          }}
        >
          {/* Loading */}
          {isLoading && (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: "#6b7280",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
              <div style={{ fontSize: 15 }}>جارٍ تحميل التوزيع الزمني...</div>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                background: "#fef2f2",
                borderRadius: 14,
                color: "#dc2626",
                fontSize: 14,
                margin: "20px 0",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
              تعذّر تحميل التوزيع الزمني
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && slots.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: "#9ca3af",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {filterLang ? "لا توجد حصص لهذه اللغة" : "لا توجد حصص مسجلة"}
              </div>
            </div>
          )}

          {/* الجدول */}
          {!isLoading && !isError && slots.length > 0 && (
            <div
              style={{
                overflowX: "auto",
                borderRadius: 16,
                boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: 820,
                  background: "#fff",
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <thead>
                  <tr>
                    {/* الفترة */}
                    <th
                      style={{
                        background: "#264230",
                        color: "#C4A035",
                        padding: "14px 16px",
                        fontSize: 13,
                        fontWeight: 700,
                        textAlign: "center",
                        width: 130,
                        whiteSpace: "nowrap",
                        borderBottom: "3px solid #1a2e22",
                      }}
                    >
                      الفترة الزمنية
                    </th>

                    {/* الأيام */}
                    {DAYS.map((d, i) => {
                      const isToday = d === todayIdx;
                      const count = Object.values(grid[d]).flat().length;
                      return (
                        <th
                          key={d}
                          style={{
                            background: isToday ? "#1a3a28" : "#264230",
                            color: isToday ? "#C4A035" : "#fff",
                            padding: "10px 12px",
                            fontSize: 13,
                            fontWeight: 700,
                            textAlign: "center",
                            borderBottom: `3px solid ${isToday ? "#C4A035" : "#1a2e22"}`,
                            borderRight:
                              i < DAYS.length - 1
                                ? "1px solid rgba(255,255,255,0.08)"
                                : "none",
                            minWidth: 130,
                          }}
                        >
                          <div>{DAYS_AR[d]}</div>
                          {isToday && (
                            <div
                              style={{
                                fontSize: 10,
                                background: "#C4A035",
                                color: "#264230",
                                borderRadius: 8,
                                padding: "1px 8px",
                                marginTop: 4,
                                display: "inline-block",
                                fontWeight: 800,
                              }}
                            >
                              اليوم
                            </div>
                          )}
                          {count > 0 && !isToday && (
                            <div
                              style={{
                                fontSize: 10,
                                opacity: 0.7,
                                marginTop: 2,
                              }}
                            >
                              {count} حصة
                            </div>
                          )}
                          {isToday && count > 0 && (
                            <div
                              style={{
                                fontSize: 10,
                                color: "rgba(255,255,255,0.6)",
                                marginTop: 2,
                              }}
                            >
                              {count} حصة
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {slots.map((slot, si) => {
                    // نجد end_time من أول حصة تملك هذا الـ start_time
                    const sampleEntry = allEntries.find(
                      (e) => e.start_time === slot,
                    );
                    const endTime = sampleEntry?.end_time ?? "";
                    const dur = endTime ? formatDuration(slot, endTime) : "";

                    return (
                      <tr
                        key={slot}
                        style={{
                          background: si % 2 === 0 ? "#fff" : "#fafafa",
                        }}
                      >
                        {/* عمود الفترة */}
                        <td
                          style={{
                            padding: "10px 14px",
                            textAlign: "center",
                            verticalAlign: "middle",
                            borderBottom: "1px solid #f0f0f0",
                            borderLeft: "3px solid #e5e7eb",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "monospace",
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#264230",
                              direction: "ltr",
                            }}
                          >
                            {slot}
                          </div>
                          {endTime && (
                            <div
                              style={{
                                fontFamily: "monospace",
                                fontSize: 11,
                                color: "#9ca3af",
                                direction: "ltr",
                              }}
                            >
                              {endTime}
                            </div>
                          )}
                          {dur && (
                            <div
                              style={{
                                fontSize: 10,
                                color: "#C4A035",
                                fontWeight: 700,
                                marginTop: 2,
                              }}
                            >
                              ⏱ {dur}
                            </div>
                          )}
                        </td>

                        {/* خلايا الأيام */}
                        {DAYS.map((d, di) => {
                          const cellEntries = grid[d][slot] ?? [];
                          const isToday = d === todayIdx;

                          return (
                            <td
                              key={d}
                              style={{
                                padding: 8,
                                verticalAlign: "top",
                                borderBottom: "1px solid #f0f0f0",
                                borderRight:
                                  di < DAYS.length - 1
                                    ? "1px solid #f0f0f0"
                                    : "none",
                                background: isToday
                                  ? si % 2 === 0
                                    ? "#f8fdf9"
                                    : "#f3fbf5"
                                  : "inherit",
                                minWidth: 130,
                              }}
                            >
                              {cellEntries.length === 0 ? (
                                <div
                                  style={{
                                    height: 40,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 20,
                                      height: 2,
                                      background: "#e5e7eb",
                                      borderRadius: 2,
                                    }}
                                  />
                                </div>
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 5,
                                  }}
                                >
                                  {cellEntries.map((e) => (
                                    <SessionCell key={e.entry_id} entry={e} />
                                  ))}
                                </div>
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
          )}

          {/* دليل اللغات */}
          {!isLoading && availableLangs.length > 0 && (
            <div
              style={{
                marginTop: 20,
                background: "#fff",
                borderRadius: 12,
                padding: "14px 20px",
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                دليل اللغات:
              </span>
              {availableLangs.map((lang) => {
                const meta = LANG_META[lang];
                const flag = LANG_FLAGS[lang] ?? "🌐";
                return (
                  <div
                    key={lang}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        background: meta?.color,
                      }}
                    />
                    <span style={{ fontSize: 12, color: "#374151" }}>
                      {flag} {meta?.label} ({lang})
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
