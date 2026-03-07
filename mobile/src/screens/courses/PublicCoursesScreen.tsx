// ================================================================
// src/screens/courses/PublicCoursesScreen.tsx
// ✅ مسجّل دخول → يُعاد توجيهه لـ /(student)/courses
// ✅ ضيف        → يرى قائمة الدورات المتاحة بدون تسجيل
// ================================================================
import React, { useState, useEffect, useRef } from "react";
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
import { useAuth } from "@/src/lib/Context/AuthContext";
import { useTheme } from "@/src/lib/Context/ThemeContext";
import BottomNavbar, { NavItem } from "@/src/components/BottomNavbar";

const TEAL = "#2B6F5E";
const TEAL2 = "#3D8B76";
const GOLD = "#C4A035";
const WHITE = "#FFFFFF";

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
  },
];
const ROUTES: Record<string, string> = {
  home: "/(public)/home",
  courses: "/(public)/courses",
  news: "/(public)/news",
  profile: "/(public)/profile",
};

// Mock public courses data
const PUBLIC_COURSES = [
  {
    id: "1",
    name: "اللغة الفرنسية",
    levels: 6,
    students: 120,
    icon: "🇫🇷",
    color: "#3B82F6",
    tags: ["A1→C1"],
  },
  {
    id: "2",
    name: "اللغة الإنجليزية",
    levels: 6,
    students: 200,
    icon: "🇬🇧",
    color: "#10B981",
    tags: ["A1→C1"],
  },
  {
    id: "3",
    name: "اللغة الإسبانية",
    levels: 4,
    students: 60,
    icon: "🇪🇸",
    color: "#F59E0B",
    tags: ["A1→B2"],
  },
  {
    id: "4",
    name: "اللغة الألمانية",
    levels: 4,
    students: 45,
    icon: "🇩🇪",
    color: "#6B7280",
    tags: ["A1→B2"],
  },
  {
    id: "5",
    name: "اللغة الإيطالية",
    levels: 3,
    students: 30,
    icon: "🇮🇹",
    color: "#EF4444",
    tags: ["A1→B1"],
  },
  {
    id: "6",
    name: "اللغة العربية",
    levels: 5,
    students: 80,
    icon: "🇩🇿",
    color: TEAL2,
    tags: ["مبتدئ→متقدم"],
  },
];

export default function PublicCoursesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { theme: t } = useTheme();
  const NAV_H = 68 + insets.bottom;

  // If authenticated → push to student courses immediately
  useEffect(() => {
    if (user) {
      router.replace("/(student)/courses" as any);
    }
  }, [user]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNav = (key: string) => {
    if (key === "courses") return; // already here
    router.push(ROUTES[key] as any);
  };

  const handleEnroll = () => router.push("/(auth)/login" as any);

  return (
    <View style={[s.root, { backgroundColor: t.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={t.bg} />

      {/* Header */}
      <View
        style={[
          s.header,
          { paddingTop: insets.top + 12, backgroundColor: t.bg },
        ]}
      >
        <Text style={[s.headerTitle, { color: t.text1 }]}>الدورات المتاحة</Text>
        <View
          style={[
            s.headerBadge,
            { backgroundColor: `${TEAL}20`, borderColor: `${TEAL}40` },
          ]}
        >
          <Text style={[s.headerBadgeTxt, { color: TEAL2 }]}>
            {PUBLIC_COURSES.length} دورة
          </Text>
        </View>
      </View>

      {/* Guest banner */}
      <Animated.View
        style={[
          s.guestBanner,
          {
            backgroundColor: `${GOLD}12`,
            borderColor: `${GOLD}30`,
            opacity: fadeAnim,
          },
        ]}
      >
        <Ionicons name="information-circle-outline" size={18} color={GOLD} />
        <Text style={s.guestBannerTxt}>سجّل دخولك للتسجيل في أي دورة</Text>
        <TouchableOpacity style={s.guestBannerBtn} onPress={handleEnroll}>
          <Text style={s.guestBannerBtnTxt}>دخول</Text>
        </TouchableOpacity>
      </Animated.View>

      <FlatList
        data={PUBLIC_COURSES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: NAV_H + 20 }}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              s.courseCard,
              { backgroundColor: t.surface, borderColor: t.border, flex: 1 },
            ]}
            onPress={handleEnroll}
            activeOpacity={0.85}
          >
            {/* Color top bar */}
            <View style={[s.courseTop, { backgroundColor: item.color }]}>
              <Text style={s.courseEmoji}>{item.icon}</Text>
            </View>

            <View style={s.courseBody}>
              <Text style={[s.courseName, { color: t.text1 }]}>
                {item.name}
              </Text>

              <View style={s.courseMeta}>
                <View style={s.courseMetaRow}>
                  <Ionicons name="layers-outline" size={12} color={t.text3} />
                  <Text style={[s.courseMetaTxt, { color: t.text3 }]}>
                    {item.levels} مستويات
                  </Text>
                </View>
                <View style={s.courseMetaRow}>
                  <Ionicons name="people-outline" size={12} color={t.text3} />
                  <Text style={[s.courseMetaTxt, { color: t.text3 }]}>
                    {item.students}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  s.courseTag,
                  {
                    backgroundColor: `${item.color}18`,
                    borderColor: `${item.color}40`,
                  },
                ]}
              >
                <Text style={[s.courseTagTxt, { color: item.color }]}>
                  {item.tags[0]}
                </Text>
              </View>

              <TouchableOpacity
                style={[s.enrollBtn, { backgroundColor: item.color }]}
                onPress={handleEnroll}
                activeOpacity={0.85}
              >
                <Text style={s.enrollBtnTxt}>سجّل الآن</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      <BottomNavbar items={NAV_ITEMS} activeKey="courses" onPress={handleNav} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "900" },
  headerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  headerBadgeTxt: { fontSize: 12, fontWeight: "700" },

  guestBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  guestBannerTxt: {
    flex: 1,
    color: GOLD,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },
  guestBannerBtn: {
    backgroundColor: GOLD,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  guestBannerBtnTxt: { color: "#000", fontSize: 11, fontWeight: "800" },

  courseCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  courseTop: { height: 70, alignItems: "center", justifyContent: "center" },
  courseEmoji: { fontSize: 32 },
  courseBody: { padding: 12, gap: 8 },
  courseName: { fontSize: 13, fontWeight: "800", textAlign: "right" },
  courseMeta: { gap: 4 },
  courseMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "flex-end",
  },
  courseMetaTxt: { fontSize: 11 },
  courseTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-end",
  },
  courseTagTxt: { fontSize: 10, fontWeight: "700" },
  enrollBtn: { borderRadius: 10, paddingVertical: 9, alignItems: "center" },
  enrollBtnTxt: { color: "#fff", fontSize: 12, fontWeight: "800" },
});
