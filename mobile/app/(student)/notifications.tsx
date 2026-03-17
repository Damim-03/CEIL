// app/(student)/notifications.tsx
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
const fetchNotifications = async () => {
  const { data } = await apiClient.get("/student/notifications");
  return data;
};

const markAsRead = async (recipientId: string) => {
  const { data } = await apiClient.patch(
    `/student/notifications/${recipientId}/read`
  );
  return data;
};

const markAllAsRead = async () => {
  const { data } = await apiClient.patch("/student/notifications/read-all");
  return data;
};

// ── Priority config ───────────────────────────────────────────────
const PRIORITY_CONFIG: {
  [key: string]: { color: string; bg: string; label: string };
} = {
  LOW: {
    color: Colors.textMuted,
    bg: Colors.textMuted + "12",
    label: "منخفضة",
  },
  NORMAL: {
    color: Colors.primary,
    bg: Colors.primary + "10",
    label: "عادية",
  },
  HIGH: {
    color: Colors.gold,
    bg: Colors.gold + "12",
    label: "مهمة",
  },
  URGENT: {
    color: Colors.error,
    bg: Colors.error + "10",
    label: "عاجلة",
  },
};

const PRIORITY_EMOJI: { [key: string]: string } = {
  LOW: "\uD83D\uDD14",
  NORMAL: "\uD83D\uDD14",
  HIGH: "\u26A0\uFE0F",
  URGENT: "\uD83D\uDEA8",
};

// ── Helpers ──────────────────────────────────────────────────────
const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 7) return `منذ ${days} يوم`;
  return new Date(dateStr).toLocaleDateString("ar-DZ", {
    month: "short",
    day: "numeric",
  });
};

// ── Notification Card ─────────────────────────────────────────────
interface NotifCardProps {
  item: any;
  onRead: (id: string) => void;
}

function NotifCard({ item, onRead }: NotifCardProps) {
  const priority = item.notification?.priority ?? "NORMAL";
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.NORMAL;
  const emoji = PRIORITY_EMOJI[priority] ?? "\uD83D\uDD14";
  const isUnread = !item.is_read;

  return (
    <TouchableOpacity
      style={[styles.card, isUnread && styles.cardUnread]}
      onPress={() => isUnread && onRead(item.recipient_id)}
      activeOpacity={0.8}
    >
      {/* Unread indicator */}
      {isUnread && <View style={styles.unreadBar} />}

      <View style={styles.cardInner}>
        {/* Icon */}
        <View style={[styles.cardIcon, { backgroundColor: config.bg }]}>
          <Text style={styles.cardIconText}>{emoji}</Text>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTime}>
              {timeAgo(item.notification?.created_at)}
            </Text>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: config.bg },
              ]}
            >
              <Text style={[styles.priorityText, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
          </View>

          <Text
            style={[styles.cardTitle, isUnread && styles.cardTitleUnread]}
            numberOfLines={2}
          >
            {item.notification?.title_ar ?? item.notification?.title}
          </Text>

          <Text style={styles.cardMsg} numberOfLines={3}>
            {item.notification?.message_ar ?? item.notification?.message}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function Notifications() {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["student-notifications"],
    queryFn: fetchNotifications,
  });

  const readMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const notifications: any[] = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
          <View style={styles.headerLeft}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.readAllBtn}
                onPress={() => readAllMutation.mutate()}
                disabled={readAllMutation.isPending}
              >
                <Text style={styles.readAllText}>
                  {readAllMutation.isPending ? "..." : "قراءة الكل"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>
              الإشعارات {"\uD83D\uDD14"}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.unreadCount}>
                <Text style={styles.unreadCountText}>{unreadCount}</Text>
              </View>
            )}
          </View>
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
            <Text style={styles.centerText}>فشل تحميل الإشعارات</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => refetch()}
            >
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Empty ── */}
        {!isLoading && !isError && notifications.length === 0 && (
          <View style={styles.centerBox}>
            <Text style={styles.centerEmoji}>{"\uD83D\uDD14"}</Text>
            <Text style={styles.centerText}>لا توجد إشعارات</Text>
            <Text style={styles.centerSub}>
              ستظهر الإشعارات الجديدة هنا
            </Text>
          </View>
        )}

        {/* ── List ── */}
        {!isLoading && !isError && notifications.length > 0 && (
          <View style={styles.list}>
            {notifications.map((item: any) => (
              <NotifCard
                key={item.recipient_id}
                item={item}
                onRead={(id) => readMutation.mutate(id)}
              />
            ))}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === "ios" ? 60 : 48,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  unreadCount: {
    backgroundColor: Colors.error,
    borderRadius: Radius.full,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadCountText: {
    fontSize: FontSize.xs,
    color: "#fff",
    fontWeight: FontWeight.bold,
  },
  readAllBtn: {
    backgroundColor: Colors.primary + "14",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  readAllText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },

  // List
  list: { gap: Spacing.sm },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: "hidden",
    ...Shadow.sm,
  },
  cardUnread: {
    backgroundColor: Colors.primary + "06",
    borderWidth: 1,
    borderColor: Colors.primary + "20",
  },
  unreadBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xl,
  },
  cardInner: {
    flexDirection: "row",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardIconText: { fontSize: 22 },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
  },
  cardTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    textAlign: "right",
    marginBottom: 4,
    lineHeight: 20,
  },
  cardTitleUnread: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  cardMsg: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: "right",
    lineHeight: 18,
  },

  // States
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  centerEmoji: { fontSize: 48 },
  centerText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    textAlign: "center",
  },
  centerSub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
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