// ================================================================
// src/screens/news/NewsScreen.tsx  — public news & announcements
// ================================================================
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/lib/Context/ThemeContext";
import BottomNavbar, { NavItem } from "@/src/components/BottomNavbar";

const TEAL = "#2B6F5E";
const TEAL2 = "#3D8B76";
const GOLD = "#C4A035";
const WHITE = "#FFFFFF";
const RED = "#EF4444";
const GREEN = "#22C55E";
const AMBER = "#F59E0B";
const BLUE = "#3B82F6";
const PURPLE = "#8B5CF6";

type ArticleType = "ANNOUNCEMENT" | "NEWS" | "REMINDER" | "ALERT";

const TYPE_CFG: Record<
  ArticleType,
  { color: string; bg: string; label: string; icon: any }
> = {
  ANNOUNCEMENT: {
    color: TEAL,
    bg: `${TEAL}15`,
    label: "إعلان",
    icon: "megaphone-outline",
  },
  NEWS: {
    color: BLUE,
    bg: `${BLUE}15`,
    label: "خبر",
    icon: "newspaper-outline",
  },
  REMINDER: {
    color: AMBER,
    bg: `${AMBER}15`,
    label: "تذكير",
    icon: "alarm-outline",
  },
  ALERT: {
    color: RED,
    bg: `${RED}15`,
    label: "تنبيه",
    icon: "warning-outline",
  },
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000),
    day = Math.floor(diff / 86400000);
  if (h < 1) return "منذ قليل";
  if (h < 24) return `منذ ${h} ساعة`;
  if (day < 7) return `منذ ${day} أيام`;
  return new Date(d).toLocaleDateString("ar-DZ", {
    day: "numeric",
    month: "short",
  });
}

const MOCK_NEWS = [
  {
    id: "news1",
    type: "ANNOUNCEMENT" as ArticleType,
    pinned: true,
    title: "فتح باب التسجيل — الفصل الثاني 2025",
    body: "يسر المركز أن يعلن عن فتح باب التسجيل في دورات الفصل الثاني لعام 2025. تشمل الدورات المتاحة: الفرنسية، الإنجليزية، الإسبانية، والروسية بمختلف المستويات من PRE-A1 إلى C1.",
    date: "2024-12-10T08:00:00",
  },
  {
    id: "news2",
    type: "REMINDER" as ArticleType,
    pinned: false,
    title: "آخر أجل لدفع رسوم الفصل الأول",
    body: "نذكر جميع الطلاب بأن آخر أجل لدفع رسوم الفصل الأول هو 31 ديسمبر 2024. لتجنب أي إشكاليات يرجى الدفع في أقرب وقت.",
    date: "2024-12-08T10:30:00",
  },
  {
    id: "news3",
    type: "NEWS" as ArticleType,
    pinned: false,
    title: "نتائج الطلاب المتميزين — الفصل الأول",
    body: "نبارك لطلاب المركز المتميزين الذين حصلوا على أعلى الدرجات في اختبارات الفصل الأول. سيتم الإعلان عن القائمة الكاملة قريباً.",
    date: "2024-12-05T12:00:00",
  },
  {
    id: "news4",
    type: "ALERT" as ArticleType,
    pinned: false,
    title: "تعليق الدراسة — إجازة الأضحى",
    body: "تعلمكم إدارة المركز بأن الدراسة ستكون معلقة بمناسبة عيد الأضحى المبارك من 15 إلى 19 ديسمبر. سيستأنف الدرس يوم 22 ديسمبر.",
    date: "2024-12-03T09:00:00",
  },
  {
    id: "news5",
    type: "ANNOUNCEMENT" as ArticleType,
    pinned: false,
    title: "توفر كتب مستوى B2 و C1",
    body: "نعلمكم بتوفر الكتب الدراسية الخاصة بمستويات B2 وC1 في مكتب الإدارة. يرجى اقتناؤها في أقرب وقت.",
    date: "2024-12-01T14:00:00",
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
    badge: 2,
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
  courses: "/(public)/courses", // ✅ smart redirect based on auth
  news: "/(public)/news",
  profile: "/(public)/profile", // ✅ smart: shows guest or user info
};

export default function NewsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme: t } = useTheme();
  const NAV_H = 68 + insets.bottom;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<ArticleType | "ALL">("ALL");

  const handleNav = (k: string) => router.push(ROUTES[k] as any);

  const shown =
    activeType === "ALL"
      ? MOCK_NEWS
      : MOCK_NEWS.filter((n) => n.type === activeType);

  const FILTERS: (ArticleType | "ALL")[] = [
    "ALL",
    "ANNOUNCEMENT",
    "NEWS",
    "REMINDER",
    "ALERT",
  ];
  const FILTER_LABELS: Record<string, string> = {
    ALL: "الكل",
    ANNOUNCEMENT: "إعلانات",
    NEWS: "أخبار",
    REMINDER: "تذكيرات",
    ALERT: "تنبيهات",
  };

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
        <View>
          <Text style={[s.headerTitle, { color: t.text1 }]}>
            الأخبار والإعلانات
          </Text>
          <Text style={[s.headerSub, { color: t.text3 }]}>
            {MOCK_NEWS.length} إعلان
          </Text>
        </View>
      </View>

      {/* Filter chips */}
      <View style={[s.filterBar, { borderBottomColor: t.border }]}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
          keyExtractor={(i) => i}
          renderItem={({ item }) => {
            const active = activeType === item;
            const cfg = item !== "ALL" ? TYPE_CFG[item as ArticleType] : null;
            return (
              <TouchableOpacity
                onPress={() => setActiveType(item)}
                style={[
                  s.filterChip,
                  {
                    backgroundColor: active
                      ? (cfg?.bg ?? `${TEAL}15`)
                      : t.surface2,
                    borderColor: active ? (cfg?.color ?? TEAL) : t.border,
                  },
                ]}
              >
                {cfg && (
                  <Ionicons
                    name={cfg.icon}
                    size={12}
                    color={active ? cfg.color : t.text3}
                  />
                )}
                <Text
                  style={[
                    s.filterChipTxt,
                    {
                      color: active ? (cfg?.color ?? TEAL) : t.text3,
                      fontWeight: active ? "700" : "500",
                    },
                  ]}
                >
                  {FILTER_LABELS[item]}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={shown}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          padding: 12,
          paddingBottom: NAV_H + 20,
          gap: 10,
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="newspaper-outline" size={44} color={t.text3} />
            <Text style={[s.emptyTitle, { color: t.text1 }]}>
              لا توجد إعلانات
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = TYPE_CFG[item.type];
          const expanded = expandedId === item.id;
          return (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() =>
                setExpandedId((prev) => (prev === item.id ? null : item.id))
              }
              style={[
                s.card,
                { backgroundColor: t.surface, borderColor: t.border },
              ]}
            >
              {/* Left accent */}
              <View style={[s.accent, { backgroundColor: cfg.color }]} />

              <View style={{ flex: 1, paddingLeft: 12 }}>
                {/* Top row */}
                <View style={s.topRow}>
                  <Text style={[s.timeText, { color: t.text3 }]}>
                    {timeAgo(item.date)}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {item.pinned && (
                      <View
                        style={[
                          s.pinnedBadge,
                          { backgroundColor: `${GOLD}20` },
                        ]}
                      >
                        <Ionicons name="pin" size={10} color={GOLD} />
                        <Text style={[s.pinnedTxt, { color: GOLD }]}>مثبت</Text>
                      </View>
                    )}
                    <View style={[s.typeBadge, { backgroundColor: cfg.bg }]}>
                      <Ionicons name={cfg.icon} size={11} color={cfg.color} />
                      <Text style={[s.typeTxt, { color: cfg.color }]}>
                        {cfg.label}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Title */}
                <Text
                  style={[s.newsTitle, { color: t.text1 }]}
                  numberOfLines={expanded ? undefined : 2}
                >
                  {item.title}
                </Text>

                {/* Body */}
                <Text
                  style={[s.newsBody, { color: t.text2 }]}
                  numberOfLines={expanded ? undefined : 2}
                >
                  {item.body}
                </Text>

                {/* Expand indicator */}
                <View style={s.readMore}>
                  <Text style={[s.readMoreTxt, { color: TEAL2 }]}>
                    {expanded ? "إخفاء" : "قراءة المزيد"}
                  </Text>
                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={12}
                    color={TEAL2}
                  />
                </View>
              </View>
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
  filterBar: { borderBottomWidth: 1 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipTxt: { fontSize: 12 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden", padding: 14 },
  accent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  timeText: { fontSize: 10 },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  typeTxt: { fontSize: 10, fontWeight: "700" },
  pinnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 20,
  },
  pinnedTxt: { fontSize: 9, fontWeight: "700" },
  newsTitle: {
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 6,
  },
  newsBody: {
    fontSize: 12,
    lineHeight: 19,
    textAlign: "right",
    marginBottom: 8,
  },
  readMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    justifyContent: "flex-end",
  },
  readMoreTxt: { fontSize: 11, fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
});
