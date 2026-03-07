// ================================================================
// src/screens/notifications/NotificationsScreen.tsx
// mirrors web StudentNotificationsPage.tsx
// ================================================================
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/lib/Context/ThemeContext";
import BottomNavbar, { NavItem } from "@/src/components/BottomNavbar";

const TEAL = "#2B6F5E";
const TEAL2 = "#3D8B76";
const WHITE = "#FFFFFF";
const RED = "#EF4444";
const GREEN = "#22C55E";
const AMBER = "#F59E0B";
const BLUE = "#3B82F6";

type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

const PRIORITY_CFG: Record<
  Priority,
  { color: string; bg: string; border: string; dot: string; label: string }
> = {
  LOW: {
    color: "#888",
    bg: "#88888812",
    border: "#88888830",
    dot: "#888888",
    label: "",
  },
  NORMAL: {
    color: BLUE,
    bg: `${BLUE}12`,
    border: `${BLUE}30`,
    dot: BLUE,
    label: "",
  },
  HIGH: {
    color: AMBER,
    bg: `${AMBER}12`,
    border: `${AMBER}30`,
    dot: AMBER,
    label: "مهم",
  },
  URGENT: {
    color: RED,
    bg: `${RED}12`,
    border: `${RED}30`,
    dot: RED,
    label: "عاجل",
  },
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000),
    h = Math.floor(diff / 3600000),
    day = Math.floor(diff / 86400000);
  if (m < 1) return "الآن";
  if (m < 60) return `${m}د`;
  if (h < 24) return `${h}س`;
  if (day < 7) return `${day}ي`;
  return new Date(d).toLocaleDateString("ar-DZ", {
    day: "numeric",
    month: "short",
  });
}

const MOCK_NOTIFICATIONS = [
  {
    id: "n1",
    title: "بدء التسجيل في دورات الفصل الثاني",
    message:
      "نعلمكم بفتح باب التسجيل في دورات الفصل الثاني ابتداءً من يوم الإثنين القادم. يرجى التسجيل في أقرب وقت ممكن لضمان مكانك.",
    priority: "URGENT" as Priority,
    created_at: "2024-12-10T08:00:00",
    is_read: false,
    course: "الفرنسية",
  },
  {
    id: "n2",
    title: "تذكير بدفع الرسوم",
    message:
      "نذكركم بضرورة سداد رسوم الفصل الدراسي قبل نهاية الشهر الجاري تفادياً لأي إجراءات إدارية.",
    priority: "HIGH" as Priority,
    created_at: "2024-12-08T10:00:00",
    is_read: false,
    course: null,
  },
  {
    id: "n3",
    title: "تغيير موعد المحاضرة",
    message:
      "نعلمكم بتغيير موعد محاضرة يوم الخميس إلى الساعة 14:00 بدلاً من 10:00.",
    priority: "NORMAL" as Priority,
    created_at: "2024-12-06T14:00:00",
    is_read: true,
    course: "الإنجليزية B1",
  },
  {
    id: "n4",
    title: "نتائج الاختبار متاحة",
    message:
      "تم نشر نتائج اختبار نهاية الفصل. يمكنكم الاطلاع عليها من صفحة النتائج.",
    priority: "NORMAL" as Priority,
    created_at: "2024-12-04T09:00:00",
    is_read: true,
    course: "الفرنسية A2",
  },
  {
    id: "n5",
    title: "إعلان عطلة رأس السنة",
    message:
      "تعلمكم إدارة المركز بأن المركز سيكون مغلقاً بمناسبة عطلة رأس السنة الميلادية.",
    priority: "LOW" as Priority,
    created_at: "2024-12-01T12:00:00",
    is_read: true,
    course: null,
  },
];

const NAV_ITEMS: NavItem[] = [
  { key: "home", label: "الرئيسية", icon: "home-outline", iconActive: "home" },
  {
    key: "courses",
    label: "الدورات",
    icon: "book-outline",
    iconActive: "book",
  },
  {
    key: "news",
    label: "الأخبار",
    icon: "notifications-outline",
    iconActive: "notifications",
  },
  {
    key: "profile",
    label: "حسابي",
    icon: "person-outline",
    iconActive: "person",
    avatar: "أ",
  },
];
const ROUTES: Record<string, string> = {
  home: "/(public)/home",
  courses: "/(student)/courses",
  news: "/(public)/news",
  profile: "/(student)/profile",
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme: t } = useTheme();
  const NAV_H = 68 + insets.bottom;

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);

  const handleNav = (k: string) => router.push(ROUTES[k] as any);

  const isRead = (id: string, orig: boolean) => orig || readIds.includes(id);

  const handleExpand = (id: string, origRead: boolean) => {
    setExpandedId((prev) => (prev === id ? null : id));
    if (!origRead && !readIds.includes(id)) setReadIds((prev) => [...prev, id]);
  };

  const allNotifs = MOCK_NOTIFICATIONS;
  const shown =
    filter === "unread"
      ? allNotifs.filter((n) => !isRead(n.id, n.is_read))
      : allNotifs;

  const unreadCount = allNotifs.filter((n) => !isRead(n.id, n.is_read)).length;

  const markAllRead = () => setReadIds(allNotifs.map((n) => n.id));

  return (
    <View style={[s.root, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={t.isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View
        style={[
          s.header,
          {
            paddingTop: insets.top + 12,
            backgroundColor: t.surface,
            borderBottomColor: t.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.surface2 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-forward" size={18} color={t.text2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={[s.headerTitle, { color: t.text1 }]}>الإشعارات</Text>
            {unreadCount > 0 && (
              <View style={s.unreadBadge}>
                <Text style={s.unreadBadgeTxt}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <Text style={[s.headerSub, { color: t.text3 }]}>
            {allNotifs.length} إشعار
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={markAllRead}
            style={[s.markAllBtn, { borderColor: t.border }]}
          >
            <Ionicons name="checkmark-done-outline" size={14} color={TEAL2} />
            <Text style={[s.markAllTxt, { color: TEAL2 }]}>قراءة الكل</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <View
        style={[
          s.filterRow,
          { backgroundColor: t.surface, borderBottomColor: t.border },
        ]}
      >
        <View style={[s.filterPill, { backgroundColor: t.surface2 }]}>
          {(["all", "unread"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                s.filterTab,
                filter === f && { backgroundColor: t.surface },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  s.filterTxt,
                  {
                    color: filter === f ? TEAL2 : t.text3,
                    fontWeight: filter === f ? "700" : "500",
                  },
                ]}
              >
                {f === "all" ? "الكل" : "غير مقروء"}
              </Text>
              {f === "unread" && unreadCount > 0 && (
                <View style={[s.filterBadge, { backgroundColor: `${RED}20` }]}>
                  <Text style={[s.filterBadgeTxt, { color: RED }]}>
                    {unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={shown}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          padding: 12,
          paddingBottom: NAV_H + 20,
          gap: 8,
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons
              name="notifications-off-outline"
              size={44}
              color={t.text3}
            />
            <Text style={[s.emptyTitle, { color: t.text1 }]}>
              لا توجد إشعارات
            </Text>
            <Text style={[s.emptyTxt, { color: t.text3 }]}>
              {filter === "unread"
                ? "جميع الإشعارات مقروءة"
                : "لم يتم إرسال إشعارات بعد"}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = PRIORITY_CFG[item.priority];
          const read = isRead(item.id, item.is_read);
          const expanded = expandedId === item.id;

          return (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => handleExpand(item.id, item.is_read)}
              style={[
                s.notifCard,
                {
                  backgroundColor: t.surface,
                  borderColor: read ? t.border : cfg.border,
                  borderWidth: read ? 1 : 1.5,
                },
              ]}
            >
              {/* Unread dot */}
              <View style={s.dotCol}>
                <View
                  style={[
                    s.dot,
                    { backgroundColor: read ? t.border : cfg.dot },
                  ]}
                />
              </View>

              <View style={{ flex: 1, gap: 5 }}>
                {/* Title row */}
                <View style={s.titleRow}>
                  <Text style={[s.timeText, { color: t.text3 }]}>
                    {timeAgo(item.created_at)}
                  </Text>
                  {cfg.label !== "" && (
                    <View
                      style={[
                        s.priorityBadge,
                        { backgroundColor: cfg.bg, borderColor: cfg.border },
                      ]}
                    >
                      <Text style={[s.priorityTxt, { color: cfg.color }]}>
                        {cfg.label}
                      </Text>
                    </View>
                  )}
                  <Text
                    style={[
                      s.notifTitle,
                      { color: t.text1, fontWeight: read ? "600" : "800" },
                    ]}
                    numberOfLines={expanded ? undefined : 1}
                  >
                    {item.title}
                  </Text>
                </View>

                {/* Message */}
                <Text
                  style={[s.notifMsg, { color: t.text2 }]}
                  numberOfLines={expanded ? undefined : 2}
                >
                  {item.message}
                </Text>

                {/* Expanded: course tag */}
                {expanded && item.course && (
                  <View style={s.tagRow}>
                    <View
                      style={[
                        s.courseTag,
                        { backgroundColor: t.surface2, borderColor: t.border },
                      ]}
                    >
                      <Ionicons name="book-outline" size={11} color={t.text3} />
                      <Text style={[s.courseTagTxt, { color: t.text2 }]}>
                        {item.course}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Collapsed: course inline */}
                {!expanded && item.course && (
                  <View style={s.tagRow}>
                    <Ionicons name="book-outline" size={11} color={t.text3} />
                    <Text style={[s.inlineCourse, { color: t.text3 }]}>
                      {item.course}
                    </Text>
                  </View>
                )}
              </View>

              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={14}
                color={t.text3}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          );
        }}
      />

      <BottomNavbar items={NAV_ITEMS} activeKey="news" onPress={handleNav} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  headerSub: { fontSize: 11, marginTop: 1 },
  unreadBadge: {
    backgroundColor: RED,
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadBadgeTxt: { color: "#fff", fontSize: 10, fontWeight: "800" },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  markAllTxt: { fontSize: 11, fontWeight: "600" },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterPill: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    alignSelf: "flex-start",
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  filterTxt: { fontSize: 13 },
  filterBadge: { borderRadius: 20, paddingHorizontal: 5, paddingVertical: 1 },
  filterBadgeTxt: { fontSize: 9, fontWeight: "800" },
  notifCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 16,
    padding: 14,
  },
  dotCol: { paddingTop: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap-reverse",
  },
  notifTitle: { fontSize: 13, flex: 1, textAlign: "right" },
  timeText: { fontSize: 10 },
  priorityBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  priorityTxt: { fontSize: 9, fontWeight: "700" },
  notifMsg: { fontSize: 12, lineHeight: 18, textAlign: "right" },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "flex-end",
  },
  courseTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  courseTagTxt: { fontSize: 11 },
  inlineCourse: { fontSize: 11 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptyTxt: { fontSize: 13 },
});
