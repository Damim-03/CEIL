// ================================================================
// src/screens/attendance/AttendanceScreen.tsx — mirrors web Attendance.tsx
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
const GOLD = "#C4A035";
const WHITE = "#FFFFFF";
const RED = "#EF4444";
const GREEN = "#22C55E";
const AMBER = "#F59E0B";

const MOCK_SUMMARY = {
  total_sessions: 24,
  present: 20,
  absent: 4,
  attendance_rate: 83.3,
};

const MOCK_RECORDS = [
  {
    id: "a1",
    topic: "مقدمة في القواعد",
    date: "2024-12-10T09:00:00",
    group: "مجموعة أ",
    status: "PRESENT",
  },
  {
    id: "a2",
    topic: "المفردات الأساسية",
    date: "2024-12-08T09:00:00",
    group: "مجموعة أ",
    status: "ABSENT",
  },
  {
    id: "a3",
    topic: "التعبير الشفهي",
    date: "2024-12-06T09:00:00",
    group: "مجموعة أ",
    status: "PRESENT",
  },
  {
    id: "a4",
    topic: "الكتابة والإملاء",
    date: "2024-12-04T09:00:00",
    group: "مجموعة أ",
    status: "PRESENT",
  },
  {
    id: "a5",
    topic: "الاستماع والفهم",
    date: "2024-12-02T09:00:00",
    group: "مجموعة أ",
    status: "PRESENT",
  },
  {
    id: "a6",
    topic: "القراءة المعمقة",
    date: "2024-11-30T09:00:00",
    group: "مجموعة أ",
    status: "ABSENT",
  },
  {
    id: "a7",
    topic: "مراجعة شاملة",
    date: "2024-11-28T09:00:00",
    group: "مجموعة أ",
    status: "PRESENT",
  },
  {
    id: "a8",
    topic: "تمارين تطبيقية",
    date: "2024-11-26T09:00:00",
    group: "مجموعة أ",
    status: "PRESENT",
  },
];

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString("ar-DZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

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
  courses: "/(student)/courses",
  news: "/(public)/news",
  profile: "/(student)/profile",
};

export default function AttendanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme: t } = useTheme();
  const NAV_H = 68 + insets.bottom;
  const handleNav = (k: string) => router.push(ROUTES[k] as any);

  const rate = MOCK_SUMMARY.attendance_rate;
  const rateColor = rate >= 80 ? GREEN : rate >= 60 ? AMBER : RED;
  const rateLabel = rate >= 80 ? "ممتاز 🌟" : rate >= 60 ? "جيد" : "تحذير ⚠️";

  // circular progress helpers
  const R = 42;
  const CIRC = 2 * Math.PI * R;
  const dash = (rate / 100) * CIRC;

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
          <Text style={[s.headerTitle, { color: t.text1 }]}>سجل الحضور</Text>
          <Text style={[s.headerSub, { color: t.text3 }]}>
            {MOCK_RECORDS.length} جلسة
          </Text>
        </View>
      </View>

      <FlatList
        data={MOCK_RECORDS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: NAV_H + 20 }}
        ListHeaderComponent={
          <View style={{ padding: 16, gap: 14 }}>
            {/* ── Hero card with circular rate ── */}
            <View
              style={[
                s.heroCard,
                { backgroundColor: t.surface, borderColor: t.border },
              ]}
            >
              <View style={[s.accentBar, { backgroundColor: TEAL }]} />

              {/* Circular progress (SVG-like with border trick) */}
              <View style={s.heroInner}>
                <View style={s.circleWrap}>
                  <View
                    style={[
                      s.circleOuter,
                      {
                        borderColor: `${rateColor}30`,
                        backgroundColor: `${rateColor}08`,
                      },
                    ]}
                  >
                    <View
                      style={[
                        s.circleFill,
                        {
                          borderColor: rateColor,
                          // rotation trick: use border to simulate fill
                        },
                      ]}
                    />
                    <View style={s.circleCenter}>
                      <Text style={[s.circleVal, { color: rateColor }]}>
                        {rate.toFixed(0)}%
                      </Text>
                      <Text style={[s.circleLabel, { color: t.text3 }]}>
                        معدل الحضور
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={s.statsGrid}>
                  {[
                    {
                      label: "إجمالي الجلسات",
                      value: MOCK_SUMMARY.total_sessions,
                      color: TEAL,
                    },
                    {
                      label: "حضور",
                      value: MOCK_SUMMARY.present,
                      color: GREEN,
                    },
                    { label: "غياب", value: MOCK_SUMMARY.absent, color: RED },
                  ].map((st) => (
                    <View
                      key={st.label}
                      style={[s.statItem, { borderColor: t.border }]}
                    >
                      <Text style={[s.statVal, { color: st.color }]}>
                        {st.value}
                      </Text>
                      <Text style={[s.statLbl, { color: t.text3 }]}>
                        {st.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Rate banner */}
              <View
                style={[
                  s.rateBanner,
                  {
                    backgroundColor: `${rateColor}12`,
                    borderColor: `${rateColor}25`,
                  },
                ]}
              >
                <Ionicons
                  name={
                    rate >= 80
                      ? "checkmark-circle"
                      : rate >= 60
                        ? "time"
                        : "alert-circle"
                  }
                  size={16}
                  color={rateColor}
                />
                <Text style={[s.rateTxt, { color: rateColor }]}>
                  {rateLabel}
                </Text>
                <Text style={[s.rateSub, { color: t.text3 }]}>
                  {rate >= 80
                    ? "استمر في المواظبة!"
                    : rate >= 60
                      ? "حاول تحسين حضورك"
                      : "معدل الحضور منخفض جداً"}
                </Text>
              </View>
            </View>

            {/* Section title */}
            <Text style={[s.sectionTitle, { color: t.text1 }]}>
              سجل التفصيلي
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isPresent = item.status === "PRESENT";
          const color = isPresent ? GREEN : RED;
          return (
            <View
              style={[
                s.record,
                {
                  backgroundColor: t.surface,
                  borderColor: t.border,
                  marginHorizontal: 16,
                  marginBottom: 8,
                },
              ]}
            >
              {/* Left accent line */}
              <View style={[s.recordAccent, { backgroundColor: color }]} />

              <View style={[s.recordIcon, { backgroundColor: `${color}15` }]}>
                <Ionicons
                  name={isPresent ? "checkmark-circle" : "close-circle"}
                  size={22}
                  color={color}
                />
              </View>

              <View style={{ flex: 1, gap: 4 }}>
                <View style={s.recordTopRow}>
                  <View
                    style={[
                      s.statusBadge,
                      {
                        backgroundColor: `${color}15`,
                        borderColor: `${color}35`,
                      },
                    ]}
                  >
                    <Text style={[s.statusBadgeTxt, { color }]}>
                      {isPresent ? "حاضر" : "غائب"}
                    </Text>
                  </View>
                  <Text
                    style={[s.recordTopic, { color: t.text1 }]}
                    numberOfLines={1}
                  >
                    {item.topic}
                  </Text>
                </View>

                <View style={s.recordMeta}>
                  <View style={s.metaChip}>
                    <Ionicons
                      name="calendar-outline"
                      size={11}
                      color={t.text3}
                    />
                    <Text style={[s.metaTxt, { color: t.text3 }]}>
                      {fmtDate(item.date)}
                    </Text>
                  </View>
                  <View style={s.metaChip}>
                    <Ionicons name="time-outline" size={11} color={t.text3} />
                    <Text style={[s.metaTxt, { color: t.text3 }]}>
                      {fmtTime(item.date)}
                    </Text>
                  </View>
                  <View style={s.metaChip}>
                    <Ionicons name="people-outline" size={11} color={t.text3} />
                    <Text style={[s.metaTxt, { color: t.text3 }]}>
                      {item.group}
                    </Text>
                  </View>
                </View>
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
  heroCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  accentBar: { height: 3 },
  heroInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  circleWrap: { alignItems: "center", justifyContent: "center" },
  circleOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  circleFill: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 5,
    borderColor: "transparent",
  },
  circleCenter: { alignItems: "center" },
  circleVal: { fontSize: 18, fontWeight: "900" },
  circleLabel: { fontSize: 9, marginTop: 2 },
  statsGrid: { flex: 1, gap: 8 },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  statVal: { fontSize: 18, fontWeight: "900" },
  statLbl: { fontSize: 11 },
  rateBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  rateTxt: { fontSize: 13, fontWeight: "700" },
  rateSub: { fontSize: 11, flex: 1, textAlign: "right" },
  sectionTitle: { fontSize: 15, fontWeight: "800" },
  record: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    overflow: "hidden",
  },
  recordAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  recordTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recordTopic: { fontSize: 13, fontWeight: "700", flex: 1, textAlign: "right" },
  recordMeta: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaTxt: { fontSize: 10 },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeTxt: { fontSize: 10, fontWeight: "700" },
});
