// app/(student)/courses.tsx
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
const fetchEnrollments = async () => {
  const { data } = await apiClient.get("/student/enrollments");
  return data;
};

// ── Status config ────────────────────────────────────────────────
interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  emoji: string;
}

const STATUS_CONFIG: { [key: string]: StatusConfig } = {
  PENDING: {
    label: "قيد الانتظار",
    color: Colors.gold,
    bg: Colors.gold + "15",
    emoji: "\u23F3",
  },
  VALIDATED: {
    label: "مقبول",
    color: "#1565C0",
    bg: "#1565C0" + "12",
    emoji: "\u2705",
  },
  PAID: {
    label: "مدفوع",
    color: Colors.primary,
    bg: Colors.primary + "12",
    emoji: "\uD83D\uDCB3",
  },
  FINISHED: {
    label: "منتهي",
    color: Colors.textMuted,
    bg: Colors.textMuted + "15",
    emoji: "\uD83C\uDF93",
  },
  REJECTED: {
    label: "مرفوض",
    color: Colors.error,
    bg: Colors.error + "12",
    emoji: "\u274C",
  },
};
// ── Helpers ──────────────────────────────────────────────────────
const formatDate = (d?: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const LEVEL_LABELS: Record<string, string> = {
  PRE_A1: "Pre A1",
  A1: "A1",
  A2: "A2",
  B1: "B1",
  B2: "B2",
  C1: "C1",
};

// ── Enrollment Card ───────────────────────────────────────────────
function EnrollmentCard({ enrollment }: { enrollment: any }) {
  const [expanded, setExpanded] = useState(false);

  const status =
    STATUS_CONFIG[enrollment.registration_status] ?? STATUS_CONFIG.PENDING;
  const course = enrollment.course;
  const group = enrollment.group;
  const teacher = group?.teacher;
  const profile = course?.profile;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpanded((p) => !p)}
      activeOpacity={0.85}
    >
      {/* ── Top row ── */}
      <View style={styles.cardTop}>
        {/* Flag + name */}
        <View style={styles.cardLeft}>
          <View style={styles.flagWrap}>
            <Text style={styles.flag}>{profile?.flag_emoji ?? "🌐"}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.courseName} numberOfLines={1}>
              {course?.course_name ?? "—"}
            </Text>
            {course?.course_code && (
              <Text style={styles.courseCode}>{course.course_code}</Text>
            )}
          </View>
        </View>

        {/* Status badge */}
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>
            {status.emoji} {status.label}
          </Text>
        </View>
      </View>

      {/* ── Quick info ── */}
      <View style={styles.quickRow}>
        {group && (
          <View style={styles.chip}>
            <Text style={styles.chipText}>👥 {group.name}</Text>
          </View>
        )}
        {group?.level && (
          <View style={styles.chip}>
            <Text style={styles.chipText}>
              📊 {LEVEL_LABELS[group.level] ?? group.level}
            </Text>
          </View>
        )}
        {course?.course_type && (
          <View style={styles.chip}>
            <Text style={styles.chipText}>
              {course.course_type === "INTENSIVE" ? "⚡ مكثّف" : "📖 عادي"}
            </Text>
          </View>
        )}
      </View>

      {/* ── Expanded details ── */}
      {expanded && (
        <View style={styles.details}>
          <View style={styles.divider} />

          {/* Teacher */}
          {teacher && (
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>
                {teacher.first_name} {teacher.last_name}
              </Text>
              <Text style={styles.detailLabel}>الأستاذ</Text>
            </View>
          )}

          {/* Dates */}
          {(profile?.start_date || profile?.end_date) && (
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>
                {formatDate(profile?.start_date)} ←{" "}
                {formatDate(profile?.end_date)}
              </Text>
              <Text style={styles.detailLabel}>مدة الدورة</Text>
            </View>
          )}

          {/* Session name */}
          {profile?.session_name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>{profile.session_name}</Text>
              <Text style={styles.detailLabel}>الدورة</Text>
            </View>
          )}

          {/* Enrollment date */}
          <View style={styles.detailRow}>
            <Text style={styles.detailValue}>
              {formatDate(enrollment.enrollment_date)}
            </Text>
            <Text style={styles.detailLabel}>تاريخ التسجيل</Text>
          </View>

          {/* Pricing */}
          {enrollment.pricing && (
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>
                {Number(enrollment.pricing.price).toLocaleString()}{" "}
                {enrollment.pricing.currency}
              </Text>
              <Text style={styles.detailLabel}>الرسوم</Text>
            </View>
          )}

          {/* Group max students */}
          {group && (
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>{group.max_students} طالب</Text>
              <Text style={styles.detailLabel}>سعة المجموعة</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Expand hint ── */}
      <View style={styles.expandHint}>
        <Text style={styles.expandText}>
          {expanded ? "▲ إخفاء التفاصيل" : "▼ عرض التفاصيل"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function Courses() {
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["student-enrollments"],
    queryFn: fetchEnrollments,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const enrollments: any[] = data?.data ?? data ?? [];

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
          <Text style={styles.headerTitle}>دوراتي 📚</Text>
          <Text style={styles.headerSub}>
            {isLoading ? "جاري التحميل..." : `${enrollments.length} تسجيل`}
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
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>فشل تحميل البيانات</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Empty ── */}
        {!isLoading && !isError && enrollments.length === 0 && (
          <View style={styles.centerBox}>
            <Text style={styles.errorEmoji}>📭</Text>
            <Text style={styles.errorText}>لا توجد تسجيلات بعد</Text>
          </View>
        )}

        {/* ── List ── */}
        {!isLoading &&
          !isError &&
          enrollments.map((enrollment: any) => (
            <EnrollmentCard
              key={enrollment.enrollment_id}
              enrollment={enrollment}
            />
          ))}

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
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === "ios" ? 60 : 48,
  },

  // Header
  header: {
    marginBottom: Spacing.lg,
    alignItems: "flex-end",
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

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  flagWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  flag: { fontSize: 26 },
  cardInfo: { flex: 1 },
  courseName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: "right",
  },
  courseCode: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: "right",
    marginTop: 2,
  },

  // Badge
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },

  // Chips
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "flex-end",
  },
  chip: {
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chipText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  // Details
  details: { marginTop: Spacing.sm },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  detailLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  detailValue: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    textAlign: "right",
    flex: 1,
    marginLeft: Spacing.sm,
  },

  // Expand
  expandHint: {
    alignItems: "center",
    paddingTop: Spacing.sm,
  },
  expandText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },

  // States
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  errorEmoji: { fontSize: 40 },
  errorText: {
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
