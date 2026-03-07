// ================================================================
// src/screens/courses/CoursesScreen.tsx
// Student Courses — enroll flow: Courses → Levels → Groups
// ================================================================
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  StatusBar,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/lib/Context/ThemeContext";
import BottomNavbar, { NavItem } from "@/src/components/BottomNavbar";

const { width } = Dimensions.get("window");
const TEAL = "#2B6F5E";
const TEAL2 = "#3D8B76";
const GOLD = "#C4A035";
const WHITE = "#FFFFFF";
const RED = "#EF4444";
const GREEN = "#22C55E";
const AMBER = "#F59E0B";
const BLUE = "#3B82F6";
const PURPLE = "#8B5CF6";

const LEVEL_COLORS: Record<string, string> = {
  PRE_A1: "#7C8FA6",
  A1: "#8DB896",
  A2: "#2B6F5E",
  B1: "#C4A035",
  B2: "#6B5D4F",
  C1: "#1B1B1B",
};

const MOCK_COURSES = [
  {
    id: "1",
    name: "الفرنسية",
    code: "FR",
    emoji: "🇫🇷",
    levels: ["A1", "A2", "B1", "B2"],
    status: "OPEN",
  },
  {
    id: "2",
    name: "الإنجليزية",
    code: "EN",
    emoji: "🇬🇧",
    levels: ["A1", "A2", "B1", "B2", "C1"],
    status: "OPEN",
  },
  {
    id: "3",
    name: "الروسية",
    code: "RU",
    emoji: "🇷🇺",
    levels: ["A1", "A2"],
    status: "OPEN",
  },
  {
    id: "4",
    name: "الألمانية",
    code: "DE",
    emoji: "🇩🇪",
    levels: ["A1", "A2", "B1"],
    status: "CLOSED",
  },
  {
    id: "5",
    name: "الإيطالية",
    code: "IT",
    emoji: "🇮🇹",
    levels: ["A1", "A2"],
    status: "OPEN",
  },
  {
    id: "6",
    name: "الإسبانية",
    code: "ES",
    emoji: "🇪🇸",
    levels: ["A1"],
    status: "OPEN",
  },
];

const MOCK_GROUPS: Record<string, Record<string, any[]>> = {
  "1": {
    A1: [
      {
        id: "g1",
        name: "مجموعة أ",
        max_students: 20,
        enrolled: 12,
        status: "OPEN",
        schedule: "أحد - ثلاثاء 09:00",
      },
      {
        id: "g2",
        name: "مجموعة ب",
        max_students: 20,
        enrolled: 20,
        status: "FULL",
        schedule: "اثنين - أربعاء 14:00",
      },
    ],
    A2: [
      {
        id: "g3",
        name: "مجموعة أ",
        max_students: 20,
        enrolled: 8,
        status: "OPEN",
        schedule: "سبت 10:00",
      },
    ],
    B1: [
      {
        id: "g4",
        name: "مجموعة أ",
        max_students: 15,
        enrolled: 15,
        status: "FULL",
        schedule: "أحد - ثلاثاء 16:00",
      },
    ],
    B2: [
      {
        id: "g5",
        name: "مجموعة أ",
        max_students: 18,
        enrolled: 6,
        status: "OPEN",
        schedule: "خميس 11:00",
      },
    ],
  },
  "2": {
    A1: [
      {
        id: "g6",
        name: "مجموعة أ",
        max_students: 25,
        enrolled: 10,
        status: "OPEN",
        schedule: "أحد - ثلاثاء 08:00",
      },
    ],
    B1: [
      {
        id: "g7",
        name: "مجموعة أ",
        max_students: 15,
        enrolled: 10,
        status: "OPEN",
        schedule: "اثنين - أربعاء 16:00",
      },
    ],
  },
};

type Step = "courses" | "levels" | "groups";

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

export default function CoursesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme: t } = useTheme();
  const NAV_H = 68 + insets.bottom;

  const [step, setStep] = useState<Step>("courses");
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<
    (typeof MOCK_COURSES)[0] | null
  >(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);

  const filtered = MOCK_COURSES.filter(
    (c) =>
      c.name.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  const handleBack = () => {
    if (step === "groups") {
      setStep("levels");
      setSelectedLevel(null);
      return;
    }
    if (step === "levels") {
      setStep("courses");
      setSelectedCourse(null);
      return;
    }
    router.back();
  };

  const groups =
    selectedCourse && selectedLevel
      ? (MOCK_GROUPS[selectedCourse.id]?.[selectedLevel] ?? [])
      : [];

  const handleEnroll = (groupId: string) => {
    setEnrollingId(groupId);
    setTimeout(() => {
      setEnrollingId(null);
      setEnrolledIds((prev) => [...prev, groupId]);
    }, 1200);
  };

  const handleNav = (key: string) => router.push(ROUTES[key] as any);

  return (
    <View style={[s.root, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={t.isDark ? "light-content" : "dark-content"} />

      {/* ── Header ── */}
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
          onPress={handleBack}
        >
          <Ionicons name="chevron-forward" size={18} color={t.text2} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={[s.headerTitle, { color: t.text1 }]}>
            {step === "courses"
              ? "الدورات المتاحة"
              : step === "levels"
                ? (selectedCourse?.name ?? "المستويات")
                : `${selectedCourse?.emoji} ${selectedCourse?.name} — ${selectedLevel}`}
          </Text>
          <Text style={[s.headerSub, { color: t.text3 }]}>
            {step === "courses"
              ? `${filtered.length} دورة`
              : step === "levels"
                ? "اختر مستواك"
                : "اختر مجموعتك"}
          </Text>
        </View>
      </View>

      {/* ── Search bar (courses step only) ── */}
      {step === "courses" && (
        <View
          style={[
            s.searchWrap,
            { backgroundColor: t.surface, borderBottomColor: t.border },
          ]}
        >
          <View
            style={[
              s.searchBox,
              { backgroundColor: t.surface2, borderColor: t.border },
            ]}
          >
            <Ionicons name="search-outline" size={15} color={t.text3} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="ابحث عن دورة..."
              placeholderTextColor={t.text3}
              style={[s.searchInput, { color: t.text1 }]}
              textAlign="right"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={16} color={t.text3} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ══════════ STEP: COURSES ══════════ */}
      {step === "courses" && (
        <FlatList
          data={filtered}
          numColumns={2}
          contentContainerStyle={[s.grid, { paddingBottom: NAV_H + 20 }]}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => {
            const isOpen = item.status === "OPEN";
            return (
              <TouchableOpacity
                style={[
                  s.courseCard,
                  {
                    backgroundColor: t.surface,
                    borderColor: t.border,
                    opacity: isOpen ? 1 : 0.6,
                  },
                ]}
                activeOpacity={0.82}
                disabled={!isOpen}
                onPress={() => {
                  setSelectedCourse(item);
                  setStep("levels");
                }}
              >
                <Text style={s.courseEmoji}>{item.emoji}</Text>
                <Text style={[s.courseName, { color: t.text1 }]}>
                  {item.name}
                </Text>
                <Text style={[s.courseCode, { color: t.text3 }]}>
                  {item.code}
                </Text>

                <View
                  style={[
                    s.pill,
                    {
                      backgroundColor: isOpen ? `${GREEN}18` : `${RED}18`,
                      borderColor: isOpen ? `${GREEN}40` : `${RED}40`,
                    },
                  ]}
                >
                  <View
                    style={[
                      s.pillDot,
                      { backgroundColor: isOpen ? GREEN : RED },
                    ]}
                  />
                  <Text style={[s.pillTxt, { color: isOpen ? GREEN : RED }]}>
                    {isOpen ? "مفتوح" : "مغلق"}
                  </Text>
                </View>

                <Text style={[s.levelCount, { color: t.text3 }]}>
                  {item.levels.length} مستويات
                </Text>

                {isOpen && (
                  <View
                    style={[s.arrowCircle, { backgroundColor: `${TEAL}15` }]}
                  >
                    <Ionicons name="chevron-back" size={14} color={TEAL2} />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* ══════════ STEP: LEVELS ══════════ */}
      {step === "levels" && selectedCourse && (
        <ScrollView
          contentContainerStyle={[s.list, { paddingBottom: NAV_H + 20 }]}
        >
          {selectedCourse.levels.map((level) => {
            const available = (
              MOCK_GROUPS[selectedCourse.id]?.[level] ?? []
            ).filter((g) => g.status === "OPEN").length;
            const color = LEVEL_COLORS[level] ?? TEAL;
            return (
              <TouchableOpacity
                key={level}
                style={[
                  s.levelCard,
                  { backgroundColor: t.surface, borderColor: t.border },
                ]}
                activeOpacity={0.82}
                onPress={() => {
                  setSelectedLevel(level);
                  setStep("groups");
                }}
              >
                <View style={[s.levelBadge, { backgroundColor: color }]}>
                  <Text style={s.levelBadgeTxt}>{level}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.levelName, { color: t.text1 }]}>
                    مستوى {level}
                  </Text>
                  <Text style={[s.levelSub, { color: t.text3 }]}>
                    {available > 0
                      ? `${available} مجموعة متاحة`
                      : "لا توجد مجموعات متاحة"}
                  </Text>
                </View>
                <Ionicons name="chevron-back" size={18} color={t.text3} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* ══════════ STEP: GROUPS ══════════ */}
      {step === "groups" && (
        <ScrollView
          contentContainerStyle={[s.list, { paddingBottom: NAV_H + 20 }]}
        >
          {groups.length === 0 ? (
            <View style={s.empty}>
              <Text style={{ fontSize: 40 }}>📭</Text>
              <Text style={[s.emptyTitle, { color: t.text1 }]}>
                لا توجد مجموعات
              </Text>
              <Text style={[s.emptyTxt, { color: t.text3 }]}>
                لم يتم إضافة مجموعات لهذا المستوى بعد
              </Text>
            </View>
          ) : (
            groups.map((group) => {
              const isEnrolled = enrolledIds.includes(group.id);
              const canEnroll = group.status === "OPEN" && !isEnrolled;
              const statusColor =
                group.status === "OPEN"
                  ? GREEN
                  : group.status === "FULL"
                    ? AMBER
                    : RED;
              const statusLabel =
                group.status === "OPEN"
                  ? "مفتوح"
                  : group.status === "FULL"
                    ? "ممتلئ"
                    : "مغلق";
              const fillPct = Math.round(
                (group.enrolled / group.max_students) * 100,
              );

              return (
                <View
                  key={group.id}
                  style={[
                    s.groupCard,
                    { backgroundColor: t.surface, borderColor: t.border },
                  ]}
                >
                  {/* Top */}
                  <View style={s.groupTop}>
                    <Text style={[s.groupName, { color: t.text1 }]}>
                      {group.name}
                    </Text>
                    <View
                      style={[
                        s.pill,
                        {
                          backgroundColor: `${statusColor}18`,
                          borderColor: `${statusColor}40`,
                        },
                      ]}
                    >
                      <View
                        style={[s.pillDot, { backgroundColor: statusColor }]}
                      />
                      <Text style={[s.pillTxt, { color: statusColor }]}>
                        {statusLabel}
                      </Text>
                    </View>
                  </View>

                  {/* Meta */}
                  <View style={[s.groupMeta, { borderTopColor: t.border }]}>
                    <View style={s.metaRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={13}
                        color={t.text3}
                      />
                      <Text style={[s.metaTxt, { color: t.text2 }]}>
                        {group.schedule}
                      </Text>
                    </View>
                    <View style={s.metaRow}>
                      <Ionicons
                        name="people-outline"
                        size={13}
                        color={t.text3}
                      />
                      <Text style={[s.metaTxt, { color: t.text2 }]}>
                        {group.enrolled}/{group.max_students} طالب
                      </Text>
                    </View>
                  </View>

                  {/* Capacity bar */}
                  <View
                    style={[
                      s.barWrap,
                      { marginHorizontal: 14, marginBottom: 12 },
                    ]}
                  >
                    <View style={[s.barBg, { backgroundColor: t.surface2 }]}>
                      <View
                        style={[
                          s.barFill,
                          {
                            width: `${fillPct}%`,
                            backgroundColor:
                              fillPct >= 100
                                ? RED
                                : fillPct > 70
                                  ? AMBER
                                  : GREEN,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[s.barTxt, { color: t.text3 }]}>
                      {fillPct}%
                    </Text>
                  </View>

                  {/* Button */}
                  <TouchableOpacity
                    style={[
                      s.enrollBtn,
                      {
                        backgroundColor: isEnrolled
                          ? `${GREEN}20`
                          : canEnroll
                            ? TEAL
                            : t.surface2,
                        borderColor: isEnrolled
                          ? `${GREEN}50`
                          : canEnroll
                            ? "transparent"
                            : t.border,
                        borderWidth: isEnrolled ? 1 : 0,
                        marginHorizontal: 14,
                        marginBottom: 14,
                      },
                    ]}
                    disabled={!canEnroll || enrollingId === group.id}
                    onPress={() => handleEnroll(group.id)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={
                        isEnrolled
                          ? "checkmark-circle"
                          : canEnroll
                            ? "add-circle-outline"
                            : "lock-closed-outline"
                      }
                      size={16}
                      color={isEnrolled ? GREEN : canEnroll ? WHITE : t.text3}
                    />
                    <Text
                      style={[
                        s.enrollTxt,
                        {
                          color: isEnrolled
                            ? GREEN
                            : canEnroll
                              ? WHITE
                              : t.text3,
                        },
                      ]}
                    >
                      {enrollingId === group.id
                        ? "جارٍ التسجيل..."
                        : isEnrolled
                          ? "تم التسجيل ✓"
                          : canEnroll
                            ? "سجّل في هذه المجموعة"
                            : "غير متاح للتسجيل"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <BottomNavbar items={NAV_ITEMS} activeKey="courses" onPress={handleNav} />
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
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 13, padding: 0 },
  grid: { padding: 12 },
  courseCard: {
    flex: 1,
    margin: 5,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
  },
  courseEmoji: { fontSize: 34 },
  courseName: { fontSize: 14, fontWeight: "800", textAlign: "center" },
  courseCode: { fontSize: 11 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillDot: { width: 5, height: 5, borderRadius: 3 },
  pillTxt: { fontSize: 10, fontWeight: "700" },
  levelCount: { fontSize: 10, marginTop: 2 },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  list: { padding: 16, gap: 10 },
  levelCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  levelBadge: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadgeTxt: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  levelName: { fontSize: 14, fontWeight: "700" },
  levelSub: { fontSize: 11, marginTop: 3 },
  groupCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  groupTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  groupName: { fontSize: 15, fontWeight: "800" },
  groupMeta: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    justifyContent: "flex-end",
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaTxt: { fontSize: 12 },
  barWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  barBg: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  barFill: { height: 5, borderRadius: 3 },
  barTxt: { fontSize: 10, minWidth: 30, textAlign: "right" },
  enrollBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 12,
    paddingVertical: 12,
  },
  enrollTxt: { fontSize: 13, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptyTxt: { fontSize: 13 },
});
