// app/(student)/attendance.tsx
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
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from "../../src/constants/theme";
import { useTheme } from "../../src/context/ThemeContext";
import { useAttendance } from "../../src/hooks/useStudent";

// ── Helpers ──────────────────────────────────────────────────────
const formatDate = (d?: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (d?: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("ar-DZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ── Stat Card ─────────────────────────────────────────────────────
interface StatCardProps {
  emoji: string;
  value: string | number;
  label: string;
  color: string;
  bg: string;
}

function StatCard({ emoji, value, label, color, bg }: StatCardProps) {
  const { colors: C } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: C.textMuted }]}>{label}</Text>
    </View>
  );
}

// ── Record Row ────────────────────────────────────────────────────
function RecordRow({ record }: { record: any }) {
  const { colors: C } = useTheme();
  const isPresent = record.status === "PRESENT";
  return (
    <View style={[styles.recordRow, { borderBottomColor: C.borderLight }]}>
      <View
        style={[
          styles.recordIcon,
          {
            backgroundColor: isPresent ? C.teal + "15" : C.error + "10",
          },
        ]}
      >
        <Text style={styles.recordIconText}>
          {isPresent ? "\u2705" : "\u274C"}
        </Text>
      </View>

      <View style={styles.recordInfo}>
        <Text style={[styles.recordTopic, { color: C.text }]} numberOfLines={1}>
          {record.session?.topic ?? "حصة دراسية"}
        </Text>
        <Text style={[styles.recordMeta, { color: C.textMuted }]}>
          {formatDate(record.session?.session_date)}
          {"  ·  "}
          {formatTime(record.session?.session_date)}
        </Text>
        {record.session?.group?.name && (
          <Text style={[styles.recordGroup, { color: C.textMuted }]}>
            {"\uD83D\uDC65"} {record.session.group.name}
          </Text>
        )}
      </View>

      <View
        style={[
          styles.recordBadge,
          {
            backgroundColor: isPresent ? C.teal + "15" : C.error + "10",
          },
        ]}
      >
        <Text
          style={[
            styles.recordBadgeText,
            { color: isPresent ? C.teal : C.error },
          ]}
        >
          {isPresent ? "حاضر" : "غائب"}
        </Text>
      </View>
    </View>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function Attendance() {
  const { colors } = useTheme();
  const C = colors;
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Hook داخل الـ component
  const { data, isLoading, isError, refetch } = useAttendance();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const records: any[] = data?.records ?? [];
  const summary = data?.summary ?? {
    total_sessions: 0,
    present: 0,
    absent: 0,
    attendance_rate: 0,
  };

  const rate: number = summary.attendance_rate ?? 0;

  const rateColor =
    rate >= 80 ? Colors.primary : rate >= 60 ? Colors.gold : Colors.error;

  const rateLabel =
    rate >= 80
      ? "ممتاز، واصل!"
      : rate >= 60
        ? "جيد، حاول التحسين"
        : "تحذير: نسبة منخفضة";

  const rateEmoji =
    rate >= 80 ? "\uD83C\uDF1F" : rate >= 60 ? "\uD83D\uDCC8" : "\u26A0\uFE0F";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.teal}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            الحضور {"\uD83D\uDCC5"}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            {isLoading ? "جاري التحميل..." : `${records.length} سجل`}
          </Text>
        </View>

        {/* ── Loading ── */}
        {isLoading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.teal} />
          </View>
        )}

        {/* ── Error ── */}
        {isError && (
          <View style={styles.centerBox}>
            <Text style={styles.centerEmoji}>{"\u26A0\uFE0F"}</Text>
            <Text style={[styles.centerText, { color: C.textMuted }]}>
              فشل تحميل البيانات
            </Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.teal }]}
              onPress={() => refetch()}
            >
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && (
          <>
            {/* ── Rate banner ── */}
            <View
              style={[
                styles.rateBanner,
                {
                  backgroundColor: rateColor + "14",
                  borderColor: rateColor + "30",
                },
              ]}
            >
              <View style={styles.rateBannerLeft}>
                <Text style={styles.rateBannerEmoji}>{rateEmoji}</Text>
                <View>
                  <Text style={[styles.rateBannerTitle, { color: rateColor }]}>
                    {rateLabel}
                  </Text>
                  <Text style={[styles.rateBannerSub, { color: C.textMuted }]}>
                    نسبة الحضور الإجمالية
                  </Text>
                </View>
              </View>
              <Text style={[styles.rateBannerValue, { color: rateColor }]}>
                {rate.toFixed(0)}%
              </Text>
            </View>

            {/* ── Stats ── */}
            <View style={styles.statsRow}>
              <StatCard
                emoji={"\uD83D\uDCC6"}
                value={summary.total_sessions}
                label="الكل"
                color={Colors.textPrimary}
                bg={colors.surface}
              />
              <StatCard
                emoji={"\u2705"}
                value={summary.present}
                label="حاضر"
                color={Colors.primary}
                bg={Colors.primary + "10"}
              />
              <StatCard
                emoji={"\u274C"}
                value={summary.absent}
                label="غائب"
                color={Colors.error}
                bg={Colors.error + "10"}
              />
              <StatCard
                emoji={"\uD83D\uDCCA"}
                value={`${rate.toFixed(0)}%`}
                label="النسبة"
                color={rateColor}
                bg={rateColor + "12"}
              />
            </View>

            {/* ── Progress bar ── */}
            <View style={styles.progressWrap}>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: C.borderLight },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(rate, 100)}%` as any,
                      backgroundColor: rateColor,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressLabel, { color: rateColor }]}>
                {rate.toFixed(1)}%
              </Text>
            </View>

            {/* ── Records ── */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                سجل الحضور
              </Text>
              {records.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.centerEmoji}>{"\uD83D\uDCC5"}</Text>
                  <Text style={[styles.centerText, { color: C.textMuted }]}>
                    لا توجد سجلات بعد
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.recordsList,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  {records.map((record: any, index: number) => (
                    <RecordRow
                      key={record.attendance_id ?? index}
                      record={record}
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === "ios" ? 60 : 48,
  },
  header: { marginBottom: Spacing.lg, alignItems: "flex-end" },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  headerSub: { fontSize: FontSize.sm, marginTop: 2 },
  rateBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  rateBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  rateBannerEmoji: { fontSize: 28 },
  rateBannerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  rateBannerSub: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  rateBannerValue: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold },
  statsRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    alignItems: "center",
    gap: 3,
  },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: Radius.full },
  progressLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    minWidth: 45,
    textAlign: "right",
  },
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: "right",
    marginBottom: Spacing.sm,
  },
  recordsList: {
    borderRadius: Radius.xl,
    overflow: "hidden",
    ...Shadow.sm,
  },
  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE8DF",
    gap: Spacing.sm,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  recordIconText: { fontSize: 18 },
  recordInfo: { flex: 1, alignItems: "flex-end" },
  recordTopic: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: "right",
  },
  recordMeta: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: "right",
  },
  recordGroup: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: "right",
  },
  recordBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  recordBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  centerEmoji: { fontSize: 40 },
  centerText: {
    fontSize: FontSize.md,
    textAlign: "center",
  },
  retryBtn: {
    borderRadius: Radius.md,
  },
  retryText: {
    fontSize: FontSize.sm,
    color: "#fff",
    fontWeight: FontWeight.medium,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
    borderRadius: Radius.xl,
  },
  bottomPad: { height: Platform.OS === "ios" ? 100 : 80 },
});
