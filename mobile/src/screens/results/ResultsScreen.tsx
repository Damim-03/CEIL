// ================================================================
// src/screens/results/ResultsScreen.tsx
// Student Results — mirrors web Results.tsx
// ================================================================
import React from "react";
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

const MOCK_RESULTS = [
  {
    id: "r1",
    course: "الفرنسية A2",
    date: "2024-11-15",
    score: 87,
    grade: "B+",
    emoji: "🇫🇷",
    passed: true,
  },
  {
    id: "r2",
    course: "الإنجليزية B1",
    date: "2024-10-20",
    score: 94,
    grade: "A",
    emoji: "🇬🇧",
    passed: true,
  },
  {
    id: "r3",
    course: "الروسية A1",
    date: "2024-09-05",
    score: 52,
    grade: "D",
    emoji: "🇷🇺",
    passed: false,
  },
  {
    id: "r4",
    course: "الفرنسية A1",
    date: "2024-06-12",
    score: 78,
    grade: "C+",
    emoji: "🇫🇷",
    passed: true,
  },
];

const GRADE_COLOR = (grade: string) => {
  const g = grade.toUpperCase();
  if (g.startsWith("A")) return GREEN;
  if (g.startsWith("B")) return TEAL2;
  if (g.startsWith("C")) return AMBER;
  return RED;
};

const avg = MOCK_RESULTS.reduce((s, r) => s + r.score, 0) / MOCK_RESULTS.length;

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

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme: t } = useTheme();
  const NAV_H = 68 + insets.bottom;

  const handleNav = (key: string) => router.push(ROUTES[key] as any);
  const passed = MOCK_RESULTS.filter((r) => r.passed).length;

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
          <Text style={[s.headerTitle, { color: t.text1 }]}>نتائجي</Text>
          <Text style={[s.headerSub, { color: t.text3 }]}>
            {MOCK_RESULTS.length} اختبار
          </Text>
        </View>
      </View>

      {/* Summary card */}
      <View
        style={[
          s.summaryCard,
          { backgroundColor: TEAL, marginHorizontal: 16, marginTop: 14 },
        ]}
      >
        <View
          style={[
            s.blob,
            {
              width: 120,
              height: 120,
              top: -40,
              left: -30,
              backgroundColor: "rgba(255,255,255,0.06)",
            },
          ]}
        />
        <View
          style={[
            s.blob,
            {
              width: 60,
              height: 60,
              bottom: 10,
              left: 80,
              backgroundColor: "rgba(196,160,53,0.15)",
            },
          ]}
        />
        <View style={s.summaryRow}>
          <View style={s.sumItem}>
            <Text style={s.sumVal}>{MOCK_RESULTS.length}</Text>
            <Text style={s.sumLbl}>اختبار</Text>
          </View>
          <View style={[s.sumDivider]} />
          <View style={s.sumItem}>
            <Text style={s.sumVal}>{avg.toFixed(1)}%</Text>
            <Text style={s.sumLbl}>المعدل</Text>
          </View>
          <View style={s.sumDivider} />
          <View style={s.sumItem}>
            <Text style={s.sumVal}>
              {passed}/{MOCK_RESULTS.length}
            </Text>
            <Text style={s.sumLbl}>ناجح</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={MOCK_RESULTS}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: NAV_H + 20,
          gap: 10,
        }}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const gc = GRADE_COLOR(item.grade);
          return (
            <View
              style={[
                s.card,
                { backgroundColor: t.surface, borderColor: t.border },
              ]}
            >
              <View style={[s.cardLeft, { backgroundColor: `${gc}15` }]}>
                <Text style={[s.grade, { color: gc }]}>{item.grade}</Text>
                <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[s.courseName, { color: t.text1 }]}>
                  {item.course}
                </Text>
                <Text style={[s.dateText, { color: t.text3 }]}>
                  {item.date}
                </Text>

                {/* Score bar */}
                <View style={s.barRow}>
                  <View style={[s.barBg, { backgroundColor: t.surface2 }]}>
                    <View
                      style={[
                        s.barFill,
                        { width: `${item.score}%`, backgroundColor: gc },
                      ]}
                    />
                  </View>
                  <Text style={[s.scoreText, { color: t.text2 }]}>
                    {item.score}%
                  </Text>
                </View>
              </View>

              <View
                style={[
                  s.passBadge,
                  {
                    backgroundColor: item.passed ? `${GREEN}15` : `${RED}15`,
                    borderColor: item.passed ? `${GREEN}40` : `${RED}40`,
                  },
                ]}
              >
                <Ionicons
                  name={item.passed ? "checkmark-circle" : "close-circle"}
                  size={13}
                  color={item.passed ? GREEN : RED}
                />
                <Text style={[s.passTxt, { color: item.passed ? GREEN : RED }]}>
                  {item.passed ? "ناجح" : "راسب"}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <BottomNavbar items={NAV_ITEMS} activeKey="home" onPress={handleNav} />
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
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 4,
    overflow: "hidden",
    position: "relative",
  },
  blob: { position: "absolute", borderRadius: 999 },
  summaryRow: { flexDirection: "row", justifyContent: "space-around" },
  sumItem: { alignItems: "center" },
  sumVal: { color: "#fff", fontSize: 22, fontWeight: "900" },
  sumLbl: { color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 3 },
  sumDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  cardLeft: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  grade: { fontSize: 16, fontWeight: "900" },
  courseName: { fontSize: 13, fontWeight: "700", textAlign: "right" },
  dateText: { fontSize: 11, marginTop: 2, textAlign: "right" },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  barBg: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  barFill: { height: 5, borderRadius: 3 },
  scoreText: {
    fontSize: 11,
    fontWeight: "700",
    minWidth: 35,
    textAlign: "right",
  },
  passBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  passTxt: { fontSize: 10, fontWeight: "700" },
});
