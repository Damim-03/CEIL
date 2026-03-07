// ================================================================
// src/screens/enrollments/EnrollmentsScreen.tsx
// Student Enrollments — mirrors web Enrollments.tsx
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
const PURPLE = "#8B5CF6";

type Status = "PENDING" | "VALIDATED" | "PAID" | "REJECTED" | "FINISHED";

const STATUS_CONFIG: Record<
  Status,
  {
    color: string;
    bg: string;
    border: string;
    label: string;
    icon: any;
    msg: string;
  }
> = {
  PENDING: {
    color: AMBER,
    bg: `${AMBER}12`,
    border: `${AMBER}30`,
    label: "بانتظار الموافقة",
    icon: "time-outline",
    msg: "طلبك قيد المراجعة من الإدارة",
  },
  VALIDATED: {
    color: BLUE,
    bg: `${BLUE}12`,
    border: `${BLUE}30`,
    label: "معتمد",
    icon: "checkmark-circle-outline",
    msg: "تم قبول التسجيل، يرجى إكمال الدفع",
  },
  PAID: {
    color: GREEN,
    bg: `${GREEN}12`,
    border: `${GREEN}30`,
    label: "مدفوع",
    icon: "card-outline",
    msg: "تم التسجيل والدفع بنجاح ✓",
  },
  REJECTED: {
    color: RED,
    bg: `${RED}12`,
    border: `${RED}30`,
    label: "مرفوض",
    icon: "close-circle-outline",
    msg: "تم رفض طلب التسجيل",
  },
  FINISHED: {
    color: "#888",
    bg: "#88888812",
    border: "#88888830",
    label: "منتهي",
    icon: "archive-outline",
    msg: "انتهت الدورة",
  },
};

const MOCK_ENROLLMENTS = [
  {
    id: "e1",
    course_name: "الفرنسية",
    course_code: "FR-A1",
    group_name: "مجموعة أ",
    level: "A1",
    status: "PAID" as Status,
    date: "2024-10-01",
    start: "2024-10-10",
    end: "2025-01-10",
    emoji: "🇫🇷",
  },
  {
    id: "e2",
    course_name: "الإنجليزية",
    course_code: "EN-B1",
    group_name: "مجموعة ب",
    level: "B1",
    status: "VALIDATED" as Status,
    date: "2024-11-01",
    start: "2024-11-15",
    end: "2025-02-15",
    emoji: "🇬🇧",
  },
  {
    id: "e3",
    course_name: "الروسية",
    course_code: "RU-A1",
    group_name: "مجموعة أ",
    level: "A1",
    status: "PENDING" as Status,
    date: "2024-12-01",
    start: null,
    end: null,
    emoji: "🇷🇺",
  },
  {
    id: "e4",
    course_name: "الألمانية",
    course_code: "DE-A2",
    group_name: "مجموعة أ",
    level: "A2",
    status: "REJECTED" as Status,
    date: "2024-09-01",
    start: null,
    end: null,
    emoji: "🇩🇪",
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
  courses: "/(public)/courses",
  news: "/(public)/news",
  profile: "/(public)/profile",
};

export default function EnrollmentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme: t } = useTheme();
  const NAV_H = 68 + insets.bottom;

  const handleNav = (key: string) => router.push(ROUTES[key] as any);

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
          <Text style={[s.headerTitle, { color: t.text1 }]}>تسجيلاتي</Text>
          <Text style={[s.headerSub, { color: t.text3 }]}>
            {MOCK_ENROLLMENTS.length} تسجيلات
          </Text>
        </View>
      </View>

      {/* Summary chips */}
      <View
        style={[
          s.summary,
          { borderBottomColor: t.border, backgroundColor: t.surface },
        ]}
      >
        {(["PAID", "VALIDATED", "PENDING", "REJECTED"] as Status[]).map(
          (st) => {
            const cfg = STATUS_CONFIG[st];
            const count = MOCK_ENROLLMENTS.filter(
              (e) => e.status === st,
            ).length;
            return (
              <View
                key={st}
                style={[
                  s.chip,
                  { backgroundColor: cfg.bg, borderColor: cfg.border },
                ]}
              >
                <Text style={[s.chipVal, { color: cfg.color }]}>{count}</Text>
                <Text style={[s.chipLbl, { color: cfg.color }]}>
                  {cfg.label}
                </Text>
              </View>
            );
          },
        )}
      </View>

      <FlatList
        data={MOCK_ENROLLMENTS}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: NAV_H + 20,
          gap: 12,
        }}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status];
          return (
            <View
              style={[
                s.card,
                { backgroundColor: t.surface, borderColor: cfg.border },
              ]}
            >
              {/* Top bar */}
              <View style={[s.cardTop, { borderBottomColor: t.border }]}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
                  <View>
                    <Text style={[s.courseName, { color: t.text1 }]}>
                      {item.course_name}
                    </Text>
                    <Text style={[s.courseCode, { color: t.text3 }]}>
                      {item.course_code}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    s.statusBadge,
                    { backgroundColor: cfg.bg, borderColor: cfg.border },
                  ]}
                >
                  <Ionicons name={cfg.icon} size={11} color={cfg.color} />
                  <Text style={[s.statusTxt, { color: cfg.color }]}>
                    {cfg.label}
                  </Text>
                </View>
              </View>

              {/* Info */}
              <View style={s.cardBody}>
                <View style={s.infoRow}>
                  <Text style={[s.infoVal, { color: t.text2 }]}>
                    {item.group_name}
                  </Text>
                  <Text style={[s.infoKey, { color: t.text3 }]}>المجموعة</Text>
                </View>
                <View style={s.infoRow}>
                  <Text style={[s.infoVal, { color: t.text2 }]}>
                    {item.level}
                  </Text>
                  <Text style={[s.infoKey, { color: t.text3 }]}>المستوى</Text>
                </View>
                <View style={s.infoRow}>
                  <Text style={[s.infoVal, { color: t.text2 }]}>
                    {item.date}
                  </Text>
                  <Text style={[s.infoKey, { color: t.text3 }]}>
                    تاريخ التسجيل
                  </Text>
                </View>
                {item.start && (
                  <View style={s.infoRow}>
                    <Text style={[s.infoVal, { color: t.text2 }]}>
                      {item.start} → {item.end}
                    </Text>
                    <Text style={[s.infoKey, { color: t.text3 }]}>الفترة</Text>
                  </View>
                )}
              </View>

              {/* Message */}
              <View
                style={[
                  s.msgRow,
                  { backgroundColor: cfg.bg, borderTopColor: t.border },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={13}
                  color={cfg.color}
                />
                <Text style={[s.msgTxt, { color: cfg.color }]}>{cfg.msg}</Text>
              </View>

              {/* Action: show "pay" button if VALIDATED */}
              {item.status === "VALIDATED" && (
                <TouchableOpacity style={[s.payBtn, { backgroundColor: TEAL }]}>
                  <Ionicons name="card-outline" size={15} color={WHITE} />
                  <Text style={s.payBtnTxt}>إتمام الدفع</Text>
                </TouchableOpacity>
              )}
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
  summary: { flexDirection: "row", gap: 8, padding: 12, borderBottomWidth: 1 },
  chip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipVal: { fontSize: 16, fontWeight: "900" },
  chipLbl: { fontSize: 9, fontWeight: "600", marginTop: 2 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
  },
  courseName: { fontSize: 14, fontWeight: "800" },
  courseCode: { fontSize: 11, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusTxt: { fontSize: 10, fontWeight: "700" },
  cardBody: { padding: 14, gap: 8 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoKey: { fontSize: 11 },
  infoVal: { fontSize: 12, fontWeight: "600" },
  msgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 12,
    borderTopWidth: 1,
  },
  msgTxt: { fontSize: 11, fontWeight: "600", flex: 1, textAlign: "right" },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    margin: 12,
    marginTop: 0,
    borderRadius: 12,
    paddingVertical: 11,
  },
  payBtnTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
