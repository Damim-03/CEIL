// app/(student)/schedule.tsx
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useSchedule } from "../../src/hooks/useStudent";
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from "../../src/constants/theme";
import { useTheme } from "../../src/context/ThemeContext";

// ── Day config ────────────────────────────────────────────────
const DAYS: { key: string; label: string; short: string }[] = [
  { key: "SATURDAY", label: "السبت", short: "س" },
  { key: "SUNDAY", label: "الأحد", short: "أ" },
  { key: "MONDAY", label: "الإثنين", short: "إ" },
  { key: "TUESDAY", label: "الثلاثاء", short: "ث" },
  { key: "WEDNESDAY", label: "الأربعاء", short: "ر" },
  { key: "THURSDAY", label: "الخميس", short: "خ" },
];

const TODAY_KEY = (() => {
  const map: Record<number, string> = {
    0: "SUNDAY",
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    6: "SATURDAY",
  };
  return map[new Date().getDay()] ?? "SATURDAY";
})();

// ── Language config ───────────────────────────────────────────
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
const LANG_LABELS: Record<string, string> = {
  FR: "فرنسية",
  EN: "إنجليزية",
  ES: "إسبانية",
  DE: "ألمانية",
  TR: "تركية",
  GR: "يونانية",
  IT: "إيطالية",
  AR: "عربية",
};
const LANG_COLORS: Record<string, { bg: string; color: string }> = {
  FR: { bg: "#1a56db18", color: "#1a56db" },
  EN: { bg: "#04785718", color: "#047857" },
  ES: { bg: "#b4530918", color: "#b45309" },
  DE: { bg: "#6d28d918", color: "#6d28d9" },
  TR: { bg: "#be123c18", color: "#be123c" },
  GR: { bg: "#0e749018", color: "#0e7490" },
  IT: { bg: "#9d174d18", color: "#9d174d" },
  AR: { bg: "#064e3b18", color: "#064e3b" },
};
const getLangStyle = (lang?: string) =>
  LANG_COLORS[lang?.toUpperCase() ?? ""] ?? {
    bg: "#6b728018",
    color: "#6b7280",
  };

// ── Slot Card ─────────────────────────────────────────────────
function SlotCard({ slot }: { slot: any }) {
  const { colors: themeColors } = useTheme();
  const langStyle = getLangStyle(slot.language);
  const flag = LANG_FLAGS[slot.language] ?? "🌐";
  const langLabel = LANG_LABELS[slot.language] ?? slot.language;

  return (
    <View style={styles.slotCard}>
      {/* عمود الوقت */}
      <View style={styles.slotTime}>
        <Text style={[styles.slotTimeStart, { color: themeColors.text }]}>
          {slot.start_time}
        </Text>
        <View
          style={[
            styles.slotTimeLine,
            { backgroundColor: themeColors.borderLight },
          ]}
        />
        <Text style={[styles.slotTimeEnd, { color: themeColors.textMuted }]}>
          {slot.end_time}
        </Text>
      </View>

      {/* بطاقة الحصة */}
      <View
        style={[
          styles.slotContent,
          {
            backgroundColor: themeColors.surface,
            borderLeftColor: langStyle.color,
          },
        ]}
      >
        {/* الصف الأول: اللغة + المستوى */}
        <View style={styles.slotHeader}>
          <View style={[styles.langBadge, { backgroundColor: langStyle.bg }]}>
            <Text style={styles.langFlag}>{flag}</Text>
            <Text style={[styles.langCode, { color: langStyle.color }]}>
              {slot.language}
            </Text>
            <Text style={[styles.langLabel, { color: langStyle.color }]}>
              {langLabel}
            </Text>
          </View>
          {slot.level && (
            <View
              style={[
                styles.levelBadge,
                {
                  borderColor: themeColors.borderLight,
                  backgroundColor: themeColors.background,
                },
              ]}
            >
              <Text
                style={[styles.levelText, { color: themeColors.textSecondary }]}
              >
                {slot.level}
              </Text>
            </View>
          )}
        </View>

        {/* الفوج */}
        {slot.group_label && (
          <Text style={[styles.slotGroup, { color: themeColors.text }]}>
            {slot.group_label}
          </Text>
        )}

        {/* القاعة */}
        {slot.room?.name && (
          <View style={styles.slotRoomRow}>
            <Text
              style={[styles.slotRoomText, { color: themeColors.textMuted }]}
            >
              {slot.room.name}
            </Text>
            <Text style={styles.slotRoomEmoji}>🚪</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function EmptyDay() {
  const { colors: themeColors } = useTheme();
  return (
    <View style={[styles.emptyDay, { backgroundColor: themeColors.surface }]}>
      <Text style={styles.emptyDayEmoji}>📭</Text>
      <Text style={[styles.emptyDayText, { color: themeColors.textMuted }]}>
        لا توجد حصص هذا اليوم
      </Text>
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function Schedule() {
  const { colors: themeColors } = useTheme();
  const [selectedDay, setSelectedDay] = useState(TODAY_KEY);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useSchedule();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const slots: any[] = data?.slots ?? [];

  // تجميع حسب اليوم
  const slotsByDay = DAYS.reduce(
    (acc, day) => {
      acc[day.key] = slots
        .filter((s: any) => s.day === day.key)
        .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
      return acc;
    },
    {} as Record<string, any[]>,
  );

  const currentSlots = slotsByDay[selectedDay] ?? [];

  // ملخص اللغات في اليوم المختار
  const dayLangs = Array.from(
    new Set(currentSlots.map((s: any) => s.language)),
  );

  return (
    <View style={[styles.root, { backgroundColor: themeColors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.teal}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            الجدول الزمني 🗓
          </Text>
          <Text style={[styles.headerSub, { color: themeColors.textMuted }]}>
            {isLoading
              ? "جاري التحميل..."
              : `${slots.length} حصة · دورة فيفري 2026`}
          </Text>
        </View>

        {/* ── Day Selector ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayRow}
          style={styles.dayScroll}
        >
          {DAYS.map((day) => {
            const isSelected = selectedDay === day.key;
            const isToday = day.key === TODAY_KEY;
            const count = slotsByDay[day.key]?.length ?? 0;
            return (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayBtn,
                  { backgroundColor: themeColors.surface },
                  isSelected && { backgroundColor: themeColors.teal },
                  isToday &&
                    !isSelected && {
                      borderWidth: 1.5,
                      borderColor: themeColors.teal + "50",
                    },
                ]}
                onPress={() => setSelectedDay(day.key)}
                activeOpacity={0.75}
              >
                <Text
                  style={[styles.dayShort, isSelected && styles.dayShortActive]}
                >
                  {day.short}
                </Text>
                <Text
                  style={[
                    styles.dayLabel,
                    { color: themeColors.textMuted },
                    isSelected && styles.dayLabelActive,
                  ]}
                >
                  {day.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.dayCount,
                      { backgroundColor: themeColors.primary + "20" },
                      isSelected && {
                        backgroundColor: "rgba(255,255,255,0.25)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayCountText,
                        { color: themeColors.primary },
                        isSelected && { color: "#fff" },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Day Header ── */}
        <View style={styles.selectedDayRow}>
          <View>
            <Text style={[styles.selectedDayText, { color: themeColors.text }]}>
              {DAYS.find((d) => d.key === selectedDay)?.label}
              {selectedDay === TODAY_KEY && (
                <Text style={{ color: themeColors.teal }}> · اليوم</Text>
              )}
            </Text>
            {/* pills اللغات */}
            {dayLangs.length > 0 && (
              <View style={styles.langPillsRow}>
                {dayLangs.map((lang) => {
                  const ls = getLangStyle(lang as string);
                  return (
                    <View
                      key={lang as string}
                      style={[styles.langPill, { backgroundColor: ls.bg }]}
                    >
                      <Text style={styles.langPillFlag}>
                        {LANG_FLAGS[lang as string] ?? "🌐"}
                      </Text>
                      <Text style={[styles.langPillText, { color: ls.color }]}>
                        {lang as string}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
          <Text
            style={[styles.selectedDayCount, { color: themeColors.textMuted }]}
          >
            {currentSlots.length} حصة
          </Text>
        </View>

        {/* ── States ── */}
        {isLoading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={themeColors.teal} />
            <Text style={[styles.centerText, { color: themeColors.textMuted }]}>
              جارٍ تحميل الجدول...
            </Text>
          </View>
        )}

        {isError && (
          <View style={styles.centerBox}>
            <Text style={styles.centerEmoji}>⚠️</Text>
            <Text style={[styles.centerText, { color: themeColors.textMuted }]}>
              فشل تحميل الجدول
            </Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: themeColors.teal }]}
              onPress={() => refetch()}
            >
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Slots ── */}
        {!isLoading && !isError && (
          <View style={styles.slotsList}>
            {currentSlots.length === 0 ? (
              <EmptyDay />
            ) : (
              currentSlots.map((slot: any, i: number) => (
                <SlotCard key={slot.entry_id ?? i} slot={slot} />
              ))
            )}
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingTop: Platform.OS === "ios" ? 60 : 48 },

  // Header
  header: {
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  headerSub: { fontSize: FontSize.sm, marginTop: 2 },

  // Days
  dayScroll: { marginBottom: Spacing.md },
  dayRow: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  dayBtn: {
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    minWidth: 64,
    gap: 3,
    ...Shadow.sm,
  },
  dayShort: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
  },
  dayShortActive: { color: "#fff" },
  dayLabel: { fontSize: 10, fontWeight: FontWeight.medium },
  dayLabelActive: { color: "rgba(255,255,255,0.85)" },
  dayCount: {
    borderRadius: Radius.full,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  dayCountText: { fontSize: 10, fontWeight: FontWeight.bold },

  // Selected day row
  selectedDayRow: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  selectedDayText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  selectedDayCount: { fontSize: FontSize.sm, marginTop: 2 },

  // Language pills
  langPillsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
    flexWrap: "wrap",
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  langPillFlag: { fontSize: 12 },
  langPillText: { fontSize: 11, fontWeight: FontWeight.bold },

  // Slot card
  slotsList: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  slotCard: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.sm },
  slotTime: { width: 52, alignItems: "center", paddingTop: 4, gap: 4 },
  slotTimeStart: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textAlign: "center",
  },
  slotTimeLine: { width: 1, flex: 1, minHeight: 20 },
  slotTimeEnd: { fontSize: FontSize.xs, textAlign: "center" },
  slotContent: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderLeftWidth: 3,
    ...Shadow.sm,
  },

  // Slot header
  slotHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 6,
    marginBottom: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  langBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  langFlag: { fontSize: 14 },
  langCode: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold as any,
    letterSpacing: 0.5,
  },
  langLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium as any },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  levelText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium as any },

  // Slot details
  slotGroup: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    textAlign: "right",
    marginBottom: 4,
  },
  slotRoomRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  slotRoomEmoji: { fontSize: 12 },
  slotRoomText: { fontSize: FontSize.xs },

  // Empty / Error
  emptyDay: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
    borderRadius: Radius.xl,
    ...Shadow.sm,
  },
  emptyDayEmoji: { fontSize: 40 },
  emptyDayText: { fontSize: FontSize.md },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  centerEmoji: { fontSize: 40 },
  centerText: { fontSize: FontSize.md, textAlign: "center" },
  retryBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  retryText: {
    fontSize: FontSize.sm,
    color: "#fff",
    fontWeight: FontWeight.medium as any,
  },

  bottomPad: { height: Platform.OS === "ios" ? 100 : 80 },
});
