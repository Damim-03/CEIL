// app/(student)/home.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, useStudent } from "../../src/context/AuthContext";
import { apiClient } from "../../src/api/client";
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from "../../src/constants/theme";

// ── API calls ────────────────────────────────────────────────────
const fetchDashboard = async () => {
  const { data } = await apiClient.get("/student/dashboard");
  return data;
};

const fetchNotifications = async () => {
  const { data } = await apiClient.get("/student/notifications?limit=3");
  return data;
};

// ── Quick link item ───────────────────────────────────────────────
interface QuickLink {
  emoji: string;
  label: string;
  route: string;
  color: string;
}

const QUICK_LINKS: QuickLink[] = [
  {
    emoji: "📚",
    label: "دوراتي",
    route: "/(student)/courses",
    color: Colors.primary,
  },
  {
    emoji: "📅",
    label: "الجدول",
    route: "/(student)/schedule",
    color: "#1565C0",
  },
  {
    emoji: "✅",
    label: "الحضور",
    route: "/(student)/attendance",
    color: "#2E7D32",
  },
  {
    emoji: "🔔",
    label: "الإشعارات",
    route: "/(student)/notifications",
    color: Colors.gold,
  },
];

// ── Greeting ─────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "صباح الخير";
  if (h < 17) return "مساء الخير";
  return "مساء النور";
}

// ── Component ────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const student = useStudent();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: dashboard,
    isLoading: dashLoading,
    refetch: refetchDash,
  } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: fetchDashboard,
  });

  const {
    data: notifData,
    isLoading: notifLoading,
    refetch: refetchNotif,
  } = useQuery({
    queryKey: ["student-notifications-preview"],
    queryFn: fetchNotifications,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchDash(), refetchNotif()]);
    setRefreshing(false);
  };

  const notifications = notifData?.data?.slice(0, 3) ?? [];
  const attendanceRate = dashboard?.attendance_rate ?? 0;
  const feeStatus = dashboard?.fee_status ?? "UNPAID";
  const docStatus = dashboard?.document_status ?? "PENDING";

  const rateColor =
    attendanceRate >= 80
      ? Colors.primaryLight
      : attendanceRate >= 60
        ? Colors.gold
        : Colors.error;

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
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()} 👋</Text>
              <Text style={styles.studentName}>
                {student?.first_name} {student?.last_name}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => router.push("/(student)/profile")}
            >
              <Text style={styles.avatarEmoji}>
                {student?.first_name?.[0]?.toUpperCase() ?? "ط"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSub}>
            مركز التعليم المكثّف للغات · الوادي
          </Text>
        </View>

        {/* ── Attendance card ── */}
        <View style={[styles.card, styles.attendanceCard]}>
          <View style={styles.attendanceLeft}>
            <Text style={styles.attendanceLabel}>نسبة الحضور</Text>
            <Text style={[styles.attendanceRate, { color: rateColor }]}>
              {dashLoading ? "—" : `${attendanceRate.toFixed(0)}%`}
            </Text>
            <Text style={styles.attendanceSub}>
              {attendanceRate >= 80
                ? "ممتاز، واصل!"
                : attendanceRate >= 60
                  ? "جيد، حاول التحسين"
                  : "تحذير: نسبة منخفضة"}
            </Text>
          </View>
          <View style={styles.attendanceRight}>
            <View style={styles.rateCircle}>
              <View
                style={[styles.rateCircleInner, { borderColor: rateColor }]}
              >
                <Text style={[styles.rateCircleText, { color: rateColor }]}>
                  {dashLoading ? "…" : `${attendanceRate.toFixed(0)}`}
                </Text>
                <Text style={[styles.rateCirclePercent, { color: rateColor }]}>
                  %
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Status row (fees + docs) ── */}
        <View style={styles.statusRow}>
          {/* Fees */}
          <View style={[styles.statusCard, styles.flex1]}>
            <Text style={styles.statusEmoji}>
              {feeStatus === "PAID" ? "✅" : "⏳"}
            </Text>
            <Text style={styles.statusLabel}>الرسوم</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    feeStatus === "PAID"
                      ? Colors.primary + "15"
                      : Colors.gold + "18",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color: feeStatus === "PAID" ? Colors.primary : Colors.gold,
                  },
                ]}
              >
                {feeStatus === "PAID" ? "مدفوعة" : "معلقة"}
              </Text>
            </View>
          </View>

          {/* Docs */}
          <View style={[styles.statusCard, styles.flex1]}>
            <Text style={styles.statusEmoji}>
              {docStatus === "APPROVED"
                ? "✅"
                : docStatus === "REJECTED"
                  ? "❌"
                  : "📋"}
            </Text>
            <Text style={styles.statusLabel}>الوثائق</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    docStatus === "APPROVED"
                      ? Colors.primary + "15"
                      : docStatus === "REJECTED"
                        ? Colors.error + "12"
                        : Colors.gold + "18",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color:
                      docStatus === "APPROVED"
                        ? Colors.primary
                        : docStatus === "REJECTED"
                          ? Colors.error
                          : Colors.gold,
                  },
                ]}
              >
                {docStatus === "APPROVED"
                  ? "مقبولة"
                  : docStatus === "REJECTED"
                    ? "مرفوضة"
                    : "قيد المراجعة"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Quick links ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>روابط سريعة</Text>
          <View style={styles.quickGrid}>
            {QUICK_LINKS.map((link) => (
              <TouchableOpacity
                key={link.route}
                style={styles.quickItem}
                onPress={() => router.push(link.route as any)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.quickIcon,
                    { backgroundColor: link.color + "14" },
                  ]}
                >
                  <Text style={styles.quickEmoji}>{link.emoji}</Text>
                </View>
                <Text style={styles.quickLabel}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Notifications preview ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>آخر الإشعارات</Text>
            <TouchableOpacity
              onPress={() => router.push("/(student)/notifications")}
            >
              <Text style={styles.seeAll}>عرض الكل</Text>
            </TouchableOpacity>
          </View>

          {notifLoading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>جاري التحميل...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyText}>لا توجد إشعارات</Text>
            </View>
          ) : (
            <View style={styles.notifList}>
              {notifications.map((n: any) => (
                <TouchableOpacity
                  key={n.recipient_id}
                  style={[styles.notifItem, !n.is_read && styles.notifUnread]}
                  onPress={() => router.push("/(student)/notifications")}
                  activeOpacity={0.75}
                >
                  <View style={styles.notifDot}>
                    {!n.is_read && <View style={styles.unreadDot} />}
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={styles.notifTitle} numberOfLines={1}>
                      {n.notification?.title_ar || n.notification?.title}
                    </Text>
                    <Text style={styles.notifMsg} numberOfLines={2}>
                      {n.notification?.message_ar || n.notification?.message}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

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
  flex1: { flex: 1 },

  // Header
  header: {
    marginBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: "right",
  },
  studentName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: "right",
    marginTop: 2,
  },
  headerSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: "right",
    marginTop: 4,
  },
  avatarBtn: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.sm,
  },
  avatarEmoji: {
    fontSize: FontSize.lg,
    color: "#fff",
    fontWeight: FontWeight.bold,
  },

  // Attendance card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
    marginBottom: Spacing.md,
  },
  attendanceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  attendanceLeft: { flex: 1 },
  attendanceLabel: {
    fontSize: FontSize.sm,
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
  attendanceRate: {
    fontSize: 40,
    fontWeight: FontWeight.bold,
    color: "#fff",
    textAlign: "right",
    lineHeight: 48,
  },
  attendanceSub: {
    fontSize: FontSize.xs,
    color: "rgba(255,255,255,0.6)",
    textAlign: "right",
    marginTop: 2,
  },
  attendanceRight: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
  rateCircle: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  rateCircleInner: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
  },
  rateCircleText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
  rateCirclePercent: {
    fontSize: FontSize.xs,
    color: "#fff",
    marginTop: 4,
  },

  // Status row
  statusRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: "center",
    ...Shadow.sm,
  },
  statusEmoji: { fontSize: 24, marginBottom: 4 },
  statusLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },

  // Section
  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: "right",
    marginBottom: Spacing.sm,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },

  // Quick links
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  quickItem: {
    width: "22%",
    alignItems: "center",
    gap: 6,
  },
  quickIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  quickEmoji: { fontSize: 26 },
  quickLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // Notifications
  notifList: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: "hidden",
    ...Shadow.sm,
  },
  notifItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  notifUnread: {
    backgroundColor: Colors.primary + "06",
  },
  notifDot: {
    width: 8,
    paddingTop: 6,
    alignItems: "center",
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  notifContent: { flex: 1 },
  notifTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: "right",
  },
  notifMsg: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: "right",
    marginTop: 2,
    lineHeight: 18,
  },

  // Empty
  emptyBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  emptyEmoji: { fontSize: 32 },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },

  bottomPad: {
    height: Platform.OS === "ios" ? 100 : 80,
  },
});
