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
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../src/api/client";
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from "../../src/constants/theme";

// ── API ──────────────────────────────────────────────────────────
const fetchSchedule = async () => {
  const { data } = await apiClient.get("/student/schedule");
  return data;
};

// ── Day config ───────────────────────────────────────────────────
const DAYS: { key: string; label: string; short: string }[] = [
  { key: "SATURDAY",  label: "السبت",    short: "س" },
  { key: "SUNDAY",    label: "الأحد",    short: "أ" },
  { key: "MONDAY",    label: "الإثنين",  short: "إ" },
  { key: "TUESDAY",   label: "الثلاثاء", short: "ث" },
  { key: "WEDNESDAY", label: "الأربعاء", short: "ر" },
  { key: "THURSDAY",  label: "الخميس",   short: "خ" },
];

const TODAY_KEY = (() => {
  const map: { [k: number]: string } = {
    0: "SUNDAY",
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    6: "SATURDAY",
  };
  return map[new Date().getDay()] ?? "SATURDAY";
})();

// ── Language colors ───────────────────────────────────────────────
const LANG_COLOR: { [key: string]: { bg: string; color: string } } = {
  FR:  { bg: "#1565C0" + "14", color: "#1565C0" },
  EN:  { bg: Colors.primary + "12", color: Colors.primary },
  ES:  { bg: Colors.gold + "14", color: "#854F0B" },
  TR:  { bg: "#993556" + "12", color: "#993556" },
  GR:  { bg: "#534AB7" + "12", color: "#534AB7" },
  DE:  { bg: "#534AB7" + "12", color: "#534AB7" },
};

const getLangColor = (lang?: string) =>
  LANG_COLOR[lang?.toUpperCase() ?? ""] ?? {
    bg: Colors.textMuted + "12",
    color: Colors.textMuted,
  };

// ── Slot Card ─────────────────────────────────────────────────────
function SlotCard({ slot }: { slot: any }) {
  const langColor = getLangColor(slot.language);

  return (
    <View style={styles.slotCard}>
      {/* Time column */}
      <View style={styles.slotTime}>
        <Text style={styles.slotTimeStart}>{slot.start_time}</Text>
        <View style={styles.slotTimeLine} />
        <Text style={styles.slotTimeEnd}>{slot.end_time}</Text>
      </View>

      {/* Content */}
      <View style={[styles.slotContent, { borderLeftColor: langColor.color }]}>
        <View style={styles.slotHeader}>
          {/* Language badge */}
          {slot.language && (
            <View style={[styles.langBadge, { backgroundColor: langColor.bg }]}>
              <Text style={[styles.langText, { color: langColor.color }]}>
                {slot.language}
              </Text>
            </View>
          )}
          {/* Level badge */}
          {slot.level && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{slot.level}</Text>
            </View>
          )}
        </View>

        {/* Group */}
        {slot.group_label && (
          <Text style={styles.slotGroup}>{slot.group_label}</Text>
        )}

        {/* Room */}
        {slot.room?.name && (
          <View style={styles.slotRoomRow}>
            <Text style={styles.slotRoomText}>{slot.room.name}</Text>
            <Text style={styles.slotRoomEmoji}>{"\uD83D\uDCCD"}</Text>
          </View>
        )}

        {/* Notes */}
        {slot.notes && (
          <Text style={styles.slotNotes} numberOfLines={2}>
            {slot.notes}
          </Text>
        )}
      </View>
    </View>
  );
}

// ── Empty day ─────────────────────────────────────────────────────
function EmptyDay() {
  return (
    <View style={styles.emptyDay}>
      <Text style={styles.emptyDayEmoji}>{"\uD83C\uDF1F"}</Text>
      <Text style={styles.emptyDayText}>لا توجد حصص هذا اليوم</Text>
    </View>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function Schedule() {
  const [selectedDay, setSelectedDay] = useState(TODAY_KEY);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["student-schedule"],
    queryFn: fetchSchedule,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Group slots by day
  const slots: any[] = data?.slots ?? data?.data ?? [];

  const slotsByDay = DAYS.reduce(
    (acc, day) => {
      acc[day.key] = slots.filter((s: any) => s.day === day.key);
      return acc;
    },
    {} as { [key: string]: any[] }
  );

  const currentSlots = slotsByDay[selectedDay] ?? [];

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            الجدول الزمني {"\uD83D\uDCC5"}
          </Text>
          <Text style={styles.headerSub}>
            {isLoading ? "جاري التحميل..." : `${slots.length} حصة`}
          </Text>
        </View>

        {/* ── Day selector ── */}
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
                  isSelected && styles.dayBtnActive,
                  isToday && !isSelected && styles.dayBtnToday,
                ]}
                onPress={() => setSelectedDay(day.key)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.dayShort,
                    isSelected && styles.dayShortActive,
                  ]}
                >
                  {day.short}
                </Text>
                <Text
                  style={[
                    styles.dayLabel,
                    isSelected && styles.dayLabelActive,
                  ]}
                >
                  {day.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.dayCount,
                      isSelected && styles.dayCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayCountText,
                        isSelected && styles.dayCountTextActive,
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

        {/* ── Selected day label ── */}
        <View style={styles.selectedDayRow}>
          <Text style={styles.selectedDayText}>
            {DAYS.find((d) => d.key === selectedDay)?.label}
            {selectedDay === TODAY_KEY && (
              <Text style={styles.todayTag}> · اليوم</Text>
            )}
          </Text>
          <Text style={styles.selectedDayCount}>
            {currentSlots.length} حصة
          </Text>
        </View>

        {/* ── Loading ── */}
        {isLoading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}

        {/* ── Error ── */}
        {isError && (
          <View style={styles.centerBox}>
            <Text style={styles.centerEmoji}>{"\u26A0\uFE0F"}</Text>
            <Text style={styles.centerText}>فشل تحميل الجدول</Text>
            <TouchableOpacity
              style={styles.retryBtn}
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
              currentSlots
                .sort((a: any, b: any) =>
                  a.start_time.localeCompare(b.start_time)
                )
                .map((slot: any, index: number) => (
                  <SlotCard key={slot.slot_id ?? index} slot={slot} />
                ))
            )}
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingTop: Platform.OS === "ios" ? 60 : 48,
  },

  // Header
  header: {
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Day selector
  dayScroll: { marginBottom: Spacing.md },
  dayRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  dayBtn: {
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    minWidth: 64,
    gap: 3,
    ...Shadow.sm,
  },
  dayBtnActive: {
    backgroundColor: Colors.primary,
  },
  dayBtnToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary + "40",
  },
  dayShort: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
  },
  dayShortActive: { color: "#fff" },
  dayLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  dayLabelActive: { color: "rgba(255,255,255,0.8)" },
  dayCount: {
    backgroundColor: Colors.primary + "18",
    borderRadius: Radius.full,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  dayCountActive: { backgroundColor: "rgba(255,255,255,0.25)" },
  dayCountText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  dayCountTextActive: { color: "#fff" },

  // Selected day row
  selectedDayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  selectedDayText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  todayTag: {
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  selectedDayCount: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },

  // Slots
  slotsList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  slotCard: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  // Time column
  slotTime: {
    width: 52,
    alignItems: "center",
    paddingTop: 4,
    gap: 4,
  },
  slotTimeStart: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  slotTimeLine: {
    width: 1,
    flex: 1,
    minHeight: 20,
    backgroundColor: Colors.borderLight,
  },
  slotTimeEnd: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: "center",
  },

  // Slot content
  slotContent: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderLeftWidth: 3,
    ...Shadow.sm,
  },
  slotHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 6,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  langBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  langText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  levelBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  levelText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  slotGroup: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: "right",
    marginBottom: 4,
  },
  slotRoomRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 4,
  },
  slotRoomEmoji: { fontSize: 12 },
  slotRoomText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  slotNotes: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: "right",
    marginTop: 4,
    lineHeight: 18,
  },

  // Empty day
  emptyDay: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    ...Shadow.sm,
  },
  emptyDayEmoji: { fontSize: 40 },
  emptyDayText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },

  // States
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  centerEmoji: { fontSize: 40 },
  centerText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  retryText: {
    fontSize: FontSize.sm,
    color: "#fff",
    fontWeight: FontWeight.medium,
  },

  bottomPad: {
    height: Platform.OS === "ios" ? 100 : 80,
  },
});