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
  Animated,
  Modal,
  Pressable,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import {
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from "../../src/constants/theme";
import { useTheme } from "../../src/context/ThemeContext";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "../../src/hooks/useStudent";
import { useSocket } from "../../src/hooks/useSocket";

// ── Priority config ───────────────────────────────────────────────
function getPriorityConfig(colors: any) {
  return {
    LOW: {
      color: colors.textMuted,
      bg: colors.textMuted + "18",
      label: "منخفضة",
      dot: colors.textMuted,
    },
    NORMAL: {
      color: colors.teal,
      bg: colors.teal + "15",
      label: "عادية",
      dot: colors.teal,
    },
    HIGH: {
      color: colors.gold,
      bg: colors.gold + "18",
      label: "مهمة",
      dot: colors.gold,
    },
    URGENT: {
      color: colors.error,
      bg: colors.error + "15",
      label: "عاجلة",
      dot: colors.error,
    },
  };
}

const PRIORITY_EMOJI: Record<string, string> = {
  LOW: "🔔",
  NORMAL: "🔔",
  HIGH: "⚠️",
  URGENT: "🚨",
};

const timeAgo = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 7) return `منذ ${days} يوم`;
  return date.toLocaleDateString("ar-DZ", { month: "long", day: "numeric" });
};

// ── Detail Modal ─────────────────────────────────────────────────
function NotifDetailModal({
  item,
  visible,
  onClose,
}: {
  item: any | null;
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const slideY = useRef(new Animated.Value(600)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // ✅ FIX: cache last valid item in a ref so content stays visible
  // during the close animation (item becomes null before animation ends)
  const lastItem = useRef<any>(null);
  if (item) lastItem.current = item;
  const d = item ?? lastItem.current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideY, {
          toValue: 0,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideY, {
          toValue: 600,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [opacity, slideY, visible]);

  if (!d) return null;

  const PRIORITY_CONFIG = getPriorityConfig(colors);
  const priority = getNotifPriority(d);
  const config =
    PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] ??
    PRIORITY_CONFIG.NORMAL;
  const emoji = PRIORITY_EMOJI[priority] ?? "🔔";
  const title =
    getNotifField(d, "title_ar") || getNotifField(d, "title") || "إشعار";
  const message = getNotifField(d, "message_ar") || getNotifField(d, "message");
  const time = timeAgo(getNotifDate(d));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[dm.backdrop, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          dm.sheet,
          {
            backgroundColor: colors.surface,
            transform: [{ translateY: slideY }],
          },
        ]}
      >
        <View style={[dm.handle, { backgroundColor: colors.border }]} />

        <View style={[dm.priorityBar, { backgroundColor: config.bg }]}>
          <Text style={dm.priorityEmoji}>{emoji}</Text>
          <View style={[dm.priorityDot, { backgroundColor: config.dot }]} />
          <Text style={[dm.priorityText, { color: config.color }]}>
            {config.label}
          </Text>
          <Text style={[dm.timeText, { color: config.color + "99" }]}>
            {time}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={dm.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[dm.title, { color: colors.text }]}>{title}</Text>
          <View style={[dm.divider, { backgroundColor: colors.borderLight }]} />
          <Text style={[dm.message, { color: colors.textMuted }]}>
            {message}
          </Text>
        </ScrollView>

        <View style={[dm.footer, { borderTopColor: colors.borderLight }]}>
          <TouchableOpacity
            style={[dm.closeBtn, { backgroundColor: colors.teal }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={dm.closeBtnText}>إغلاق</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const dm = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    maxHeight: "80%",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  priorityBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: 4,
  },
  priorityEmoji: { fontSize: 18 },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  priorityText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, flex: 1 },
  timeText: { fontSize: FontSize.xs },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    textAlign: "right",
    lineHeight: 30,
    marginBottom: Spacing.md,
  },
  divider: { height: 1, marginBottom: Spacing.md },
  message: { fontSize: FontSize.md, textAlign: "right", lineHeight: 26 },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  closeBtn: {
    paddingVertical: 14,
    borderRadius: Radius.lg,
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
});

// ── Data accessor — handles both nested and flat API responses ────
function getNotifField(item: any, field: string): string {
  return item?.notification?.[field] ?? item?.[field] ?? "";
}
function getNotifPriority(item: any): string {
  return item?.notification?.priority ?? item?.priority ?? "NORMAL";
}
function getNotifDate(item: any): string | null {
  return item?.notification?.created_at ?? item?.created_at ?? null;
}
// ── Notification Card ─────────────────────────────────────────────
function NotifCard({
  item,
  onPress,
  index,
}: {
  item: any;
  onPress: () => void;
  index: number;
}) {
  const { colors } = useTheme();
  const PRIORITY_CONFIG = getPriorityConfig(colors);
  const priority = getNotifPriority(item);
  const config =
    PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] ??
    PRIORITY_CONFIG.NORMAL;
  const emoji = PRIORITY_EMOJI[priority] ?? "🔔";
  const isUnread = !item.is_read;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, index, slideAnim]);

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      <TouchableOpacity
        style={[
          s.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          isUnread && {
            backgroundColor: colors.teal + "0D",
            borderColor: colors.teal + "30",
            borderWidth: 1,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {isUnread && (
          <View style={[s.accentLine, { backgroundColor: colors.teal }]} />
        )}

        <View style={s.cardBody}>
          <View style={s.cardTop}>
            <Text style={[s.timeText, { color: colors.textMuted }]}>
              {timeAgo(getNotifDate(item))}
            </Text>
            <View style={[s.priorityPill, { backgroundColor: config.bg }]}>
              <View style={[s.priorityDot, { backgroundColor: config.dot }]} />
              <Text style={[s.priorityLabel, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
          </View>

          <View style={s.cardMain}>
            <View style={[s.iconWrap, { backgroundColor: config.bg }]}>
              <Text style={s.iconEmoji}>{emoji}</Text>
            </View>
            <View style={s.cardContent}>
              <Text
                style={[
                  s.cardTitle,
                  { color: isUnread ? colors.text : colors.textMuted },
                  isUnread && { fontWeight: FontWeight.bold },
                ]}
                numberOfLines={1}
              >
                {getNotifField(item, "title_ar") ||
                  getNotifField(item, "title") ||
                  "إشعار"}
              </Text>
              <Text
                style={[s.cardMsg, { color: colors.textMuted }]}
                numberOfLines={2}
              >
                {getNotifField(item, "message_ar") ||
                  getNotifField(item, "message")}
              </Text>
            </View>
          </View>

          {isUnread && (
            <View style={[s.unreadDot, { backgroundColor: colors.teal }]} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Section Divider ───────────────────────────────────────────────
function SectionDivider({
  label,
  color,
  bg,
  borderColor,
}: {
  label: string;
  color: string;
  bg: string;
  borderColor: string;
}) {
  return (
    <View style={s.sectionHeader}>
      <View style={[s.sectionLine, { backgroundColor: borderColor }]} />
      <View style={[s.sectionPill, { backgroundColor: bg }]}>
        <Text style={[s.sectionLabel, { color }]}>{label}</Text>
      </View>
      <View style={[s.sectionLine, { backgroundColor: borderColor }]} />
    </View>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function Notifications() {
  useSocket();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data, isLoading, isError, refetch } = useNotifications(1, false);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCardPress = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
    if (!item.is_read) markAsRead.mutate(item.recipient_id);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    // Clear after close animation finishes (200ms)
    setTimeout(() => setSelectedItem(null), 300);
  };

  const notifications: any[] = data?.data ?? [];
  // DEBUG: uncomment to inspect API response shape
  // if (__DEV__ && notifications.length > 0) console.log("notif[0]:", JSON.stringify(notifications[0], null, 2));
  const unreadList = notifications.filter((n) => !n.is_read);
  const readList = notifications.filter((n) => n.is_read);
  const unreadCount = unreadList.length;

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.teal}
          />
        }
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={[
                  s.readAllBtn,
                  {
                    backgroundColor: colors.teal + "15",
                    borderColor: colors.teal + "30",
                  },
                ]}
                onPress={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
              >
                <Text style={[s.readAllText, { color: colors.teal }]}>
                  {markAllAsRead.isPending ? "..." : "قراءة الكل"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={s.headerRight}>
            <Text style={[s.headerTitle, { color: colors.text }]}>
              الإشعارات
            </Text>
            {unreadCount > 0 && (
              <View style={[s.badge, { backgroundColor: colors.error }]}>
                <Text style={s.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[s.divider, { backgroundColor: colors.border }]} />

        {isLoading && (
          <View style={s.centerBox}>
            <ActivityIndicator size="large" color={colors.teal} />
          </View>
        )}

        {isError && (
          <View style={s.centerBox}>
            <Text style={s.centerEmoji}>⚠️</Text>
            <Text style={[s.centerText, { color: colors.textMuted }]}>
              فشل تحميل الإشعارات
            </Text>
            <TouchableOpacity
              style={[s.retryBtn, { backgroundColor: colors.teal }]}
              onPress={() => refetch()}
            >
              <Text style={s.retryText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <View style={s.centerBox}>
            <Text style={s.centerEmoji}>🔔</Text>
            <Text style={[s.centerText, { color: colors.text }]}>
              لا توجد إشعارات
            </Text>
            <Text style={[s.centerSub, { color: colors.textMuted }]}>
              ستظهر الإشعارات الجديدة هنا
            </Text>
          </View>
        )}

        {!isLoading && !isError && notifications.length > 0 && (
          <View style={s.list}>
            {unreadList.length > 0 && (
              <>
                <SectionDivider
                  label="غير مقروءة"
                  color={colors.teal}
                  bg={colors.teal + "15"}
                  borderColor={colors.border}
                />
                {unreadList.map((item, i) => (
                  <NotifCard
                    key={item.recipient_id}
                    item={item}
                    index={i}
                    onPress={() => handleCardPress(item)}
                  />
                ))}
              </>
            )}
            {readList.length > 0 && (
              <>
                <SectionDivider
                  label="مقروءة"
                  color={colors.textMuted}
                  bg={colors.cream2}
                  borderColor={colors.border}
                />
                {readList.map((item, i) => (
                  <NotifCard
                    key={item.recipient_id}
                    item={item}
                    index={i}
                    onPress={() => handleCardPress(item)}
                  />
                ))}
              </>
            )}
          </View>
        )}

        <View style={s.bottomPad} />
      </ScrollView>

      <NotifDetailModal
        item={selectedItem}
        visible={modalVisible}
        onClose={handleCloseModal}
      />
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === "ios" ? 60 : 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  badge: {
    borderRadius: Radius.full,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: FontSize.xs,
    color: "#fff",
    fontWeight: FontWeight.bold,
  },
  readAllBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  readAllText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  divider: { height: 1, marginBottom: Spacing.lg, opacity: 0.5 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionLine: { flex: 1, height: 1 },
  sectionPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  list: { gap: Spacing.sm },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    overflow: "hidden",
    position: "relative",
    ...Shadow.sm,
  },
  accentLine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xl,
  },
  cardBody: { padding: Spacing.md, paddingLeft: Spacing.md + 6 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  timeText: { fontSize: FontSize.xs },
  priorityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  priorityDot: { width: 5, height: 5, borderRadius: 3 },
  priorityLabel: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
  cardMain: { flexDirection: "row", gap: Spacing.sm, alignItems: "flex-start" },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 20 },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textAlign: "right",
    marginBottom: 4,
    lineHeight: 20,
  },
  cardMsg: { fontSize: FontSize.xs, textAlign: "right", lineHeight: 18 },
  unreadDot: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  centerEmoji: { fontSize: 48 },
  centerText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    textAlign: "center",
  },
  centerSub: { fontSize: FontSize.sm, textAlign: "center" },
  retryBtn: {
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
  bottomPad: { height: Platform.OS === "ios" ? 100 : 80 },
});
