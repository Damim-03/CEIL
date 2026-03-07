import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  FlatList,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import logo from "@/assets/logo.jpg";
import BottomNavbar, { NavItem } from "@/src/components/BottomNavbar";
import { useTheme } from "@/src/lib/Context/ThemeContext";

const { width } = Dimensions.get("window");
const CARD_W = width * 0.7;

// ── Brand Colors ──────────────────────────────────────────────────
const TEAL = "#2B6F5E";
const TEAL2 = "#3D8B76";
const GOLD = "#C4A035";
const GOLD2 = "#D4B04A";
const WHITE = "#FFFFFF";
const RED = "#EF4444";
const BLUE = "#3B82F6";
const PURPLE = "#8B5CF6";
const AMBER = "#F59E0B";
const GREEN = "#22C55E";
const PINK = "#EC4899";

// ── Data ─────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: "person-outline",
    label: "ملفي",
    color: TEAL2,
    route: "/(student)/profile",
  },
  {
    icon: "document-text-outline",
    label: "وثائقي",
    color: BLUE,
    route: "/(student)/documents",
  },
  {
    icon: "book-outline",
    label: "دوراتي",
    color: PURPLE,
    route: "/(student)/courses",
  },
  {
    icon: "receipt-outline",
    label: "تسجيلاتي",
    color: GOLD,
    route: "/(student)/enrollments",
  },
  {
    icon: "cash-outline",
    label: "رسومي",
    color: GREEN,
    route: "/(student)/fees",
  },
  {
    icon: "calendar-outline",
    label: "حضوري",
    color: AMBER,
    route: "/(student)/attendance",
  },
  {
    icon: "ribbon-outline",
    label: "نتائجي",
    color: PINK,
    route: "/(student)/results",
  },
  {
    icon: "settings-outline",
    label: "الإعدادات",
    color: "#888",
    route: "/(student)/settings",
  },
];

const COURSES = [
  {
    id: "1",
    level: "A1→B2",
    title: "الفرنسية الشاملة",
    color: TEAL,
    emoji: "🇫🇷",
    students: 124,
    sessions: 24,
  },
  {
    id: "2",
    level: "B1→C1",
    title: "الإنجليزية المتقدمة",
    color: BLUE,
    emoji: "🇬🇧",
    students: 89,
    sessions: 20,
  },
  {
    id: "3",
    level: "A1→A2",
    title: "الروسية للمبتدئين",
    color: RED,
    emoji: "🇷🇺",
    students: 45,
    sessions: 18,
  },
  {
    id: "4",
    level: "A1→B1",
    title: "الألمانية الأساسية",
    color: AMBER,
    emoji: "🇩🇪",
    students: 62,
    sessions: 22,
  },
];

const NEWS = [
  {
    id: "1",
    type: "إعلان",
    tc: TEAL,
    title: "انطلاق التسجيلات للفصل الربيعي 2025",
    desc: "يسر مركز التعليم المكثف للغات الإعلان عن فتح باب التسجيل للدورات الربيعية",
    time: "منذ ساعتين",
    pinned: true,
  },
  {
    id: "2",
    type: "فعالية",
    tc: GOLD,
    title: "يوم اللغات العالمي — ورشة عمل مفتوحة",
    desc: "ورشة تفاعلية مجانية بمناسبة اليوم العالمي للغات مع أساتذة متخصصين",
    time: "أمس",
    pinned: false,
  },
  {
    id: "3",
    type: "نتائج",
    tc: PURPLE,
    title: "نتائج الفصل الخريفي — الفرنسية B2",
    desc: "تم الإعلان عن نتائج الاختبارات، يمكن الاطلاع عليها من الحساب الشخصي",
    time: "منذ 3 أيام",
    pinned: false,
  },
  {
    id: "4",
    type: "تذكير",
    tc: BLUE,
    title: "موعد الامتحانات التكميلية",
    desc: "يُذكّر المركز جميع الطلاب بأن الامتحانات التكميلية ستُعقد خلال الأسبوع القادم",
    time: "منذ 5 أيام",
    pinned: false,
  },
];

const STATS = [
  { label: "طالب", value: "+500", icon: "people", color: TEAL },
  { label: "لغة", value: "6+", icon: "language", color: GOLD },
  { label: "أستاذ", value: "12", icon: "school", color: BLUE },
  { label: "دورة", value: "8", icon: "book", color: PURPLE },
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
  courses: "/(public)/courses",
  news: "/(public)/news",
  profile: "/(public)/profile",
};

// ════════════════════════════════════════════════════════════════
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme: t, toggleTheme } = useTheme(); // ← مشترك مع كل الشاشات
  const isDark = t.isDark;
  const scrollY = useRef(new Animated.Value(0)).current;
  const NAV_H = 68 + insets.bottom;

  const handleNav = (key: string) => router.push(ROUTES[key] as any);

  const headerBg = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [`${t.bg}00`, `${t.bg}F8`],
    extrapolate: "clamp",
  });

  const headerBorder = scrollY.interpolate({
    inputRange: [60, 90],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={[s.root, { backgroundColor: t.bg }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={t.bg}
      />

      {/* ══ Sticky Header ══ */}
      <Animated.View
        style={[
          s.header,
          {
            backgroundColor: headerBg,
            paddingTop: insets.top + 8,
            borderBottomColor: t.border,
          },
          { borderBottomWidth: headerBorder as any },
        ]}
      >
        <View style={s.headerRow}>
          {/* Logo */}
          <View style={s.headerLeft}>
            <View style={s.logoCircle}>
              <Image source={logo} style={s.logoImg} resizeMode="contain" />
              <View style={s.logoDot} />
            </View>
            <View>
              <Text style={[s.headerTitle, { color: t.text1 }]}>CEIL</Text>
              <Text style={[s.headerSub, { color: t.text3 }]}>
                El-Oued · الوادي
              </Text>
            </View>
          </View>
          {/* Actions */}
          <View style={s.headerRight}>
            <TouchableOpacity
              style={[
                s.iconBtn,
                { backgroundColor: t.surface2, borderColor: t.border },
              ]}
              onPress={toggleTheme}
            >
              <Ionicons
                name={isDark ? "sunny-outline" : "moon-outline"}
                size={18}
                color={t.text2}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.iconBtn,
                { backgroundColor: t.surface2, borderColor: t.border },
              ]}
            >
              <Ionicons name="search-outline" size={18} color={t.text2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.iconBtn,
                { backgroundColor: t.surface2, borderColor: t.border },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={18}
                color={t.text2}
              />
              <View style={s.notifBadge} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* ══ Scroll ══ */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 62,
          paddingBottom: NAV_H + 24,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {/* ══ HERO ══ */}
        <View style={[s.hero, { backgroundColor: TEAL }]}>
          {/* Decorative blobs */}
          <View style={[s.heroBlob1, { backgroundColor: t.heroTint }]} />
          <View style={[s.heroBlob2, { backgroundColor: `${GOLD}22` }]} />
          <View
            style={[s.heroBlob3, { backgroundColor: "rgba(255,255,255,0.04)" }]}
          />

          <View style={s.heroInner}>
            {/* Badge */}
            <View style={s.heroBadge}>
              <View style={s.heroBadgeDot} />
              <Text style={s.heroBadgeText}>التسجيل مفتوح الآن</Text>
            </View>

            <Text style={s.heroTitle}>ابدأ رحلتك{"\n"}اللغوية اليوم</Text>
            <Text style={s.heroSub}>اكتشف أكثر من 6 لغات مع أفضل الأساتذة</Text>

            <View style={s.heroActions}>
              <TouchableOpacity
                style={s.heroBtnPrimary}
                onPress={() => handleNav("courses")}
                activeOpacity={0.85}
              >
                <Text style={s.heroBtnPrimaryTxt}>استعرض الدورات</Text>
                <Ionicons name="arrow-back" size={14} color={TEAL} />
              </TouchableOpacity>
              <TouchableOpacity style={s.heroBtnSecondary} activeOpacity={0.85}>
                <Text style={s.heroBtnSecondaryTxt}>تواصل معنا</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats strip inside hero */}
          <View
            style={[s.heroStats, { borderTopColor: "rgba(255,255,255,0.12)" }]}
          >
            {STATS.map((st, i) => (
              <React.Fragment key={st.label}>
                <View style={s.heroStatItem}>
                  <Text style={s.heroStatVal}>{st.value}</Text>
                  <Text style={s.heroStatLbl}>{st.label}</Text>
                </View>
                {i < STATS.length - 1 && <View style={s.heroStatDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ══ SERVICES ══ */}
        <View style={[s.block, { marginTop: 24 }]}>
          <View style={s.blockHead}>
            <Text style={[s.blockTitle, { color: t.text1 }]}>خدماتي</Text>
          </View>
          <View
            style={[
              s.servCard,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <View style={s.servGrid}>
              {SERVICES.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={s.servItem}
                  activeOpacity={0.7}
                  onPress={() => item.route && router.push(item.route as any)}
                >
                  <View
                    style={[
                      s.servIconBox,
                      { backgroundColor: `${item.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <Text style={[s.servLabel, { color: t.text2 }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ══ COURSES ══ */}
        <View style={[s.block, { marginTop: 28 }]}>
          <View style={s.blockHead}>
            <TouchableOpacity
              onPress={() => handleNav("courses")}
              style={s.seeAllBtn}
            >
              <Text style={s.seeAllTxt}>عرض الكل</Text>
              <Ionicons name="chevron-back" size={13} color={TEAL2} />
            </TouchableOpacity>
            <Text style={[s.blockTitle, { color: t.text1 }]}>
              الدورات المتاحة
            </Text>
          </View>

          <FlatList
            data={COURSES}
            horizontal
            inverted
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  s.courseCard,
                  {
                    width: CARD_W,
                    backgroundColor: t.surface,
                    borderColor: t.border,
                  },
                ]}
                activeOpacity={0.88}
              >
                {/* Color band with emoji */}
                <View style={[s.courseBand, { backgroundColor: item.color }]}>
                  {/* Shimmer overlay */}
                  <View style={s.courseBandShimmer} />
                  <Text style={s.courseEmoji}>{item.emoji}</Text>
                  <View style={s.courseLevelPill}>
                    <Text style={s.courseLevelTxt}>{item.level}</Text>
                  </View>
                </View>

                <View style={s.courseBody}>
                  <Text style={[s.courseName, { color: t.text1 }]}>
                    {item.title}
                  </Text>
                  <View style={s.courseMeta}>
                    <View
                      style={[
                        s.metaChip,
                        { backgroundColor: t.surface2, borderColor: t.border },
                      ]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={10}
                        color={t.text3}
                      />
                      <Text style={[s.metaChipTxt, { color: t.text3 }]}>
                        {item.sessions} حصة
                      </Text>
                    </View>
                    <View
                      style={[
                        s.metaChip,
                        { backgroundColor: t.surface2, borderColor: t.border },
                      ]}
                    >
                      <Ionicons
                        name="people-outline"
                        size={10}
                        color={t.text3}
                      />
                      <Text style={[s.metaChipTxt, { color: t.text3 }]}>
                        {item.students} طالب
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[s.enrollBtn, { backgroundColor: item.color }]}
                    activeOpacity={0.85}
                  >
                    <Text style={s.enrollTxt}>سجّل الآن</Text>
                    <Ionicons name="arrow-back" size={13} color={WHITE} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ══ NEWS ══ */}
        <View style={[s.block, { marginTop: 28 }]}>
          <View style={s.blockHead}>
            <TouchableOpacity
              onPress={() => handleNav("news")}
              style={s.seeAllBtn}
            >
              <Text style={s.seeAllTxt}>عرض الكل</Text>
              <Ionicons name="chevron-back" size={13} color={TEAL2} />
            </TouchableOpacity>
            <Text style={[s.blockTitle, { color: t.text1 }]}>
              الأخبار والإعلانات
            </Text>
          </View>

          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            {NEWS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  s.newsCard,
                  { backgroundColor: t.surface, borderColor: t.border },
                ]}
                activeOpacity={0.82}
              >
                {/* Left color accent */}
                <View style={[s.newsAccent, { backgroundColor: item.tc }]} />

                <View style={s.newsContent}>
                  {item.pinned && (
                    <View style={s.pinnedRow}>
                      <Ionicons name="pin" size={10} color={GOLD2} />
                      <Text style={[s.pinnedTxt, { color: GOLD2 }]}>مثبّت</Text>
                    </View>
                  )}
                  <View style={s.newsTopRow}>
                    <Text style={[s.newsTime, { color: t.text3 }]}>
                      {item.time}
                    </Text>
                    <View
                      style={[
                        s.newsTypePill,
                        {
                          backgroundColor: `${item.tc}18`,
                          borderColor: `${item.tc}40`,
                        },
                      ]}
                    >
                      <Text style={[s.newsTypeTxt, { color: item.tc }]}>
                        {item.type}
                      </Text>
                    </View>
                  </View>
                  <Text style={[s.newsTitle, { color: t.text1 }]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[s.newsDesc, { color: t.text2 }]}
                    numberOfLines={2}
                  >
                    {item.desc}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* ══ Navbar ══ */}
      <BottomNavbar items={NAV_ITEMS} activeKey="home" onPress={handleNav} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerRight: { flexDirection: "row", gap: 8 },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  logoImg: { width: 32, height: 32 },
  logoDot: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: GOLD,
    borderWidth: 1.5,
    borderColor: TEAL,
  },
  headerTitle: { fontSize: 15, fontWeight: "800" },
  headerSub: { fontSize: 9, marginTop: 1 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: RED,
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  // Hero
  hero: {
    marginHorizontal: 18,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  heroBlob1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -80,
    left: -60,
  },
  heroBlob2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    bottom: 40,
    left: 20,
  },
  heroBlob3: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    top: 20,
    right: -40,
  },
  heroInner: { padding: 24, paddingBottom: 20 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
  },
  heroBadgeText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 10,
    fontWeight: "700",
  },
  heroTitle: {
    color: WHITE,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "right",
    lineHeight: 38,
    marginBottom: 8,
  },
  heroSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    textAlign: "right",
    marginBottom: 20,
    lineHeight: 20,
  },
  heroActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  heroBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: WHITE,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  heroBtnPrimaryTxt: { color: TEAL, fontSize: 13, fontWeight: "800" },
  heroBtnSecondary: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroBtnSecondaryTxt: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "600",
  },

  // Hero stats strip
  heroStats: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 14,
    paddingBottom: 18,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  heroStatItem: { alignItems: "center", flex: 1 },
  heroStatVal: { color: WHITE, fontSize: 18, fontWeight: "900" },
  heroStatLbl: { color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 2 },
  heroStatDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 4,
  },

  // Block layout
  block: { marginBottom: 4 },
  blockHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  blockTitle: { fontSize: 17, fontWeight: "800" },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllTxt: { color: TEAL2, fontSize: 12, fontWeight: "700" },

  // Services
  servCard: {
    marginHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  servGrid: { flexDirection: "row", flexWrap: "wrap" },
  servItem: { width: "25%", alignItems: "center", paddingVertical: 16, gap: 6 },
  servIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  servLabel: { fontSize: 10, fontWeight: "600", textAlign: "center" },

  // Course card
  courseCard: { borderRadius: 18, overflow: "hidden", borderWidth: 1 },
  courseBand: {
    height: 100,
    position: "relative",
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: 14,
    flexDirection: "row-reverse",
  },
  courseBandShimmer: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  courseEmoji: { fontSize: 38 },
  courseLevelPill: {
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  courseLevelTxt: { color: WHITE, fontSize: 10, fontWeight: "700" },
  courseBody: { padding: 14, gap: 10 },
  courseName: { fontSize: 15, fontWeight: "800", textAlign: "right" },
  courseMeta: { flexDirection: "row", justifyContent: "flex-end", gap: 6 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  metaChipTxt: { fontSize: 10, fontWeight: "600" },
  enrollBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 11,
  },
  enrollTxt: { color: WHITE, fontSize: 13, fontWeight: "700" },

  // News
  newsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
  },
  newsAccent: { width: 4 },
  newsContent: { flex: 1, padding: 14 },
  pinnedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 5,
    justifyContent: "flex-end",
  },
  pinnedTxt: { fontSize: 10, fontWeight: "700" },
  newsTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  newsTime: { fontSize: 11 },
  newsTypePill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  newsTypeTxt: { fontSize: 10, fontWeight: "700" },
  newsTitle: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 4,
    lineHeight: 22,
  },
  newsDesc: { fontSize: 12, textAlign: "right", lineHeight: 18 },
});
