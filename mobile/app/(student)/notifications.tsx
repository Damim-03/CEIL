import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl,
} from "react-native";
import { Bell, CheckCheck, Filter, Megaphone, Info, AlertTriangle, BookOpen } from "lucide-react-native";
import {
  useStudentNotifications,
  useMarkStudentNotificationRead,
  useMarkAllStudentNotificationsRead,
} from "@/src/hooks/student/Usestudent";
import { PageLoader, ErrorState, EmptyState } from "@/src/components/ui";
import { COLORS, SPACING, RADIUS } from "@/src/constants/theme";
import { useTranslation } from "react-i18next";

const categoryIcon = (cat: string) => {
  switch (cat?.toUpperCase()) {
    case "ANNOUNCEMENT": return Megaphone;
    case "ALERT": return AlertTriangle;
    case "ACADEMIC": return BookOpen;
    default: return Info;
  }
};

const categoryColor = (cat: string) => {
  switch (cat?.toUpperCase()) {
    case "ANNOUNCEMENT": return COLORS.tealMid;
    case "ALERT": return COLORS.red;
    case "ACADEMIC": return COLORS.gold;
    default: return COLORS.textMuted;
  }
};

const formatRelative = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page] = useState(1);

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useStudentNotifications(page, unreadOnly);

  const markRead = useMarkStudentNotificationRead();
  const markAll = useMarkAllStudentNotificationsRead();

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState message={(error as any)?.message} onRetry={refetch} />;

  const notifications = data?.notifications || data || [];
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.tealMid} />}
    >
      {/* ── Header ── */}
      <View style={s.headerCard}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}>
            <Bell size={22} color="#fff" />
          </View>
          <View>
            <Text style={s.headerTitle}>{t("student.nav.notifications")}</Text>
            {unreadCount > 0 && (
              <Text style={s.headerSub}>{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</Text>
            )}
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={s.markAllBtn}
            onPress={() => markAll.mutate()}
            disabled={markAll.isPending}
            activeOpacity={0.8}
          >
            <CheckCheck size={14} color={COLORS.tealMid} />
            <Text style={s.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filter ── */}
      <View style={s.filterRow}>
        <Filter size={14} color={COLORS.textMuted} />
        <TouchableOpacity
          style={[s.filterBtn, !unreadOnly && s.filterBtnActive]}
          onPress={() => setUnreadOnly(false)}
          activeOpacity={0.8}
        >
          <Text style={[s.filterBtnText, !unreadOnly && s.filterBtnTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.filterBtn, unreadOnly && s.filterBtnActive]}
          onPress={() => setUnreadOnly(true)}
          activeOpacity={0.8}
        >
          <Text style={[s.filterBtnText, unreadOnly && s.filterBtnTextActive]}>Unread</Text>
          {unreadCount > 0 && (
            <View style={s.filterBadge}>
              <Text style={s.filterBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Notifications list ── */}
      {notifications.length > 0 ? (
        <View style={s.listCard}>
          {notifications.map((notif: any, index: number) => {
            const Icon = categoryIcon(notif.announcement?.category || notif.category);
            const color = categoryColor(notif.announcement?.category || notif.category);
            const isUnread = !notif.is_read;

            return (
              <TouchableOpacity
                key={notif.recipient_id || notif.id || index}
                style={[s.notifRow, index < notifications.length - 1 && s.notifRowBorder, isUnread && s.notifRowUnread]}
                onPress={() => {
                  if (isUnread) markRead.mutate(notif.recipient_id || notif.id);
                }}
                activeOpacity={0.75}
              >
                {/* unread dot */}
                {isUnread && <View style={s.unreadDot} />}

                <View style={[s.notifIcon, { backgroundColor: `${color}12` }]}>
                  <Icon size={18} color={color} />
                </View>

                <View style={s.notifBody}>
                  <View style={s.notifTitleRow}>
                    <Text style={[s.notifTitle, isUnread && s.notifTitleUnread]} numberOfLines={1}>
                      {notif.announcement?.title || notif.title || "Notification"}
                    </Text>
                    <Text style={s.notifTime}>
                      {formatRelative(notif.created_at || notif.announcement?.created_at)}
                    </Text>
                  </View>
                  {(notif.announcement?.content || notif.content) && (
                    <Text style={s.notifContent} numberOfLines={2}>
                      {notif.announcement?.content || notif.content}
                    </Text>
                  )}
                  {(notif.announcement?.category || notif.category) && (
                    <View style={[s.catBadge, { backgroundColor: `${color}10` }]}>
                      <Text style={[s.catBadgeText, { color }]}>
                        {notif.announcement?.category || notif.category}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <EmptyState
          icon={<Bell size={24} color={COLORS.textMuted} />}
          title={unreadOnly ? "No unread notifications" : "No notifications yet"}
          subtitle="You'll see your notifications here"
        />
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F4F0" },
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: 32 },

  headerCard: { backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, padding: SPACING.lg, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  headerIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.tealMid, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  markAllBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: `${COLORS.tealMid}30` },
  markAllText: { fontSize: 12, color: COLORS.tealMid, fontWeight: "500" },

  filterRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  filterBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: 10 },
  filterBtnActive: { backgroundColor: `${COLORS.tealMid}12` },
  filterBtnText: { fontSize: 13, color: COLORS.textMuted, fontWeight: "500" },
  filterBtnTextActive: { color: COLORS.tealMid, fontWeight: "600" },
  filterBadge: { backgroundColor: COLORS.red, borderRadius: 8, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  filterBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  listCard: { backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, overflow: "hidden" },
  notifRow: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, position: "relative" },
  notifRowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(232,221,212,0.3)" },
  notifRowUnread: { backgroundColor: "rgba(43,111,94,0.02)" },
  unreadDot: { position: "absolute", top: SPACING.lg + 8, left: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.tealMid },
  notifIcon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  notifBody: { flex: 1 },
  notifTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: SPACING.sm, marginBottom: 4 },
  notifTitle: { flex: 1, fontSize: 13, fontWeight: "500", color: COLORS.text },
  notifTitleUnread: { fontWeight: "700" },
  notifTime: { fontSize: 10, color: COLORS.textMuted, flexShrink: 0 },
  notifContent: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, marginBottom: 6 },
  catBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  catBadgeText: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
});
