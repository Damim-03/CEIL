// ================================================================
// src/screens/fees/FeesScreen.tsx  — mirrors web Fees.tsx
// ================================================================
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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

type FeeStatus = "PAID" | "PENDING" | "OVERDUE";

const MOCK_SUMMARY = {
  total: 12000,
  paid: 8000,
  remaining: 4000,
  is_fully_paid: false,
};

const MOCK_FEES = [
  {
    id: "f1",
    course: "الفرنسية A2",
    amount: 6000,
    status: "PAID" as FeeStatus,
    due: "2024-10-01",
    paid_at: "2024-09-28",
    method: "CCP",
    ref: "FR-2024-001",
    emoji: "🇫🇷",
  },
  {
    id: "f2",
    course: "الإنجليزية B1",
    amount: 4000,
    status: "PENDING" as FeeStatus,
    due: "2024-12-01",
    paid_at: null,
    method: null,
    ref: null,
    emoji: "🇬🇧",
  },
  {
    id: "f3",
    course: "الروسية A1",
    amount: 2000,
    status: "OVERDUE" as FeeStatus,
    due: "2024-11-01",
    paid_at: null,
    method: null,
    ref: null,
    emoji: "🇷🇺",
  },
];

const STATUS_CFG: Record<
  FeeStatus,
  { color: string; bg: string; border: string; label: string; icon: any }
> = {
  PAID: {
    color: GREEN,
    bg: `${GREEN}15`,
    border: `${GREEN}35`,
    label: "مدفوع",
    icon: "checkmark-circle",
  },
  PENDING: {
    color: AMBER,
    bg: `${AMBER}15`,
    border: `${AMBER}35`,
    label: "بانتظار",
    icon: "time",
  },
  OVERDUE: {
    color: RED,
    bg: `${RED}15`,
    border: `${RED}35`,
    label: "متأخر",
    icon: "alert-circle",
  },
};

const fmt = (n: number) => `${n.toLocaleString()} DA`;

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

export default function FeesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme: t } = useTheme();
  const NAV_H = 68 + insets.bottom;
  const handleNav = (key: string) => router.push(ROUTES[key] as any);
  const pct = Math.round((MOCK_SUMMARY.paid / MOCK_SUMMARY.total) * 100);

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
          <Text style={[s.headerTitle, { color: t.text1 }]}>رسوم الدراسة</Text>
          <Text style={[s.headerSub, { color: t.text3 }]}>
            {MOCK_FEES.length} فواتير
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: NAV_H + 24,
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Summary hero card ── */}
        <View
          style={[
            s.heroCard,
            { backgroundColor: MOCK_SUMMARY.is_fully_paid ? TEAL : "#1C1410" },
          ]}
        >
          <View
            style={[
              s.heroBlob,
              {
                backgroundColor: "rgba(255,255,255,0.05)",
                width: 140,
                height: 140,
                top: -50,
                left: -40,
              },
            ]}
          />
          <View
            style={[
              s.heroBlob,
              {
                backgroundColor: "rgba(196,160,53,0.12)",
                width: 80,
                height: 80,
                bottom: 0,
                right: 20,
              },
            ]}
          />

          <View style={s.heroTop}>
            <View>
              <Text style={s.heroLabel}>إجمالي الرسوم</Text>
              <Text style={s.heroValue}>{fmt(MOCK_SUMMARY.total)}</Text>
            </View>
            <View
              style={[
                s.heroBadge,
                {
                  backgroundColor: MOCK_SUMMARY.is_fully_paid
                    ? `${GREEN}25`
                    : `${RED}20`,
                  borderColor: MOCK_SUMMARY.is_fully_paid
                    ? `${GREEN}40`
                    : `${RED}40`,
                },
              ]}
            >
              <Ionicons
                name={
                  MOCK_SUMMARY.is_fully_paid
                    ? "checkmark-circle"
                    : "alert-circle"
                }
                size={13}
                color={MOCK_SUMMARY.is_fully_paid ? GREEN : RED}
              />
              <Text
                style={[
                  s.heroBadgeTxt,
                  { color: MOCK_SUMMARY.is_fully_paid ? GREEN : RED },
                ]}
              >
                {MOCK_SUMMARY.is_fully_paid
                  ? "مدفوع بالكامل"
                  : "يوجد رصيد مستحق"}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={s.heroProgress}>
            <View style={[s.progBg]}>
              <View
                style={[
                  s.progFill,
                  {
                    width: `${pct}%`,
                    backgroundColor: pct === 100 ? GREEN : GOLD,
                  },
                ]}
              />
            </View>
            <Text style={s.progTxt}>{pct}%</Text>
          </View>

          <View style={s.heroRow}>
            <View style={s.heroItem}>
              <Text style={s.heroItemVal}>{fmt(MOCK_SUMMARY.paid)}</Text>
              <Text style={s.heroItemLbl}>مدفوع</Text>
            </View>
            <View style={[s.heroDivider]} />
            <View style={s.heroItem}>
              <Text
                style={[
                  s.heroItemVal,
                  { color: MOCK_SUMMARY.remaining > 0 ? RED : GREEN },
                ]}
              >
                {fmt(MOCK_SUMMARY.remaining)}
              </Text>
              <Text style={s.heroItemLbl}>المتبقي</Text>
            </View>
          </View>
        </View>

        {/* ── Alert banner ── */}
        {!MOCK_SUMMARY.is_fully_paid && (
          <View
            style={[
              s.alertBanner,
              { backgroundColor: `${AMBER}12`, borderColor: `${AMBER}30` },
            ]}
          >
            <Ionicons name="warning-outline" size={18} color={AMBER} />
            <Text style={[s.alertTxt, { color: AMBER }]}>
              لديك {fmt(MOCK_SUMMARY.remaining)} رسوم غير مدفوعة
            </Text>
          </View>
        )}

        {/* ── Fee cards ── */}
        {MOCK_FEES.map((fee) => {
          const cfg = STATUS_CFG[fee.status];
          return (
            <View
              key={fee.id}
              style={[
                s.feeCard,
                { backgroundColor: t.surface, borderColor: cfg.border },
              ]}
            >
              {/* Left accent */}
              <View style={[s.accent, { backgroundColor: cfg.color }]} />

              <View style={[s.feeIcon, { backgroundColor: `${cfg.color}15` }]}>
                <Text style={{ fontSize: 22 }}>{fee.emoji}</Text>
              </View>

              <View style={{ flex: 1, gap: 6 }}>
                {/* Top row */}
                <View style={s.feeTopRow}>
                  <View
                    style={[
                      s.statusPill,
                      { backgroundColor: cfg.bg, borderColor: cfg.border },
                    ]}
                  >
                    <Ionicons name={cfg.icon} size={11} color={cfg.color} />
                    <Text style={[s.statusTxt, { color: cfg.color }]}>
                      {cfg.label}
                    </Text>
                  </View>
                  <Text style={[s.feeCourse, { color: t.text1 }]}>
                    {fee.course}
                  </Text>
                </View>

                {/* Amount */}
                <Text style={[s.feeAmount, { color: t.text1 }]}>
                  {fmt(fee.amount)}
                </Text>

                {/* Meta grid */}
                <View
                  style={[
                    s.metaGrid,
                    {
                      backgroundColor: t.surface2,
                      borderRadius: 10,
                      padding: 10,
                      gap: 6,
                    },
                  ]}
                >
                  <View style={s.metaRow}>
                    <Text style={[s.metaVal, { color: t.text2 }]}>
                      {fee.due}
                    </Text>
                    <Text style={[s.metaKey, { color: t.text3 }]}>
                      تاريخ الاستحقاق
                    </Text>
                  </View>
                  {fee.paid_at && (
                    <View style={s.metaRow}>
                      <Text style={[s.metaVal, { color: t.text2 }]}>
                        {fee.paid_at}
                      </Text>
                      <Text style={[s.metaKey, { color: t.text3 }]}>
                        تاريخ الدفع
                      </Text>
                    </View>
                  )}
                  {fee.method && (
                    <View style={s.metaRow}>
                      <Text style={[s.metaVal, { color: t.text2 }]}>
                        {fee.method}
                      </Text>
                      <Text style={[s.metaKey, { color: t.text3 }]}>
                        طريقة الدفع
                      </Text>
                    </View>
                  )}
                  {fee.ref && (
                    <View style={s.metaRow}>
                      <Text
                        style={[
                          s.metaVal,
                          { color: t.text2, fontFamily: "monospace" },
                        ]}
                      >
                        {fee.ref}
                      </Text>
                      <Text style={[s.metaKey, { color: t.text3 }]}>
                        المرجع
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                {fee.status === "PAID" && (
                  <TouchableOpacity
                    style={[s.actionBtn, { borderColor: t.border }]}
                  >
                    <Ionicons
                      name="download-outline"
                      size={14}
                      color={t.text2}
                    />
                    <Text style={[s.actionTxt, { color: t.text2 }]}>
                      تحميل الوصل
                    </Text>
                  </TouchableOpacity>
                )}
                {(fee.status === "PENDING" || fee.status === "OVERDUE") && (
                  <TouchableOpacity
                    style={[
                      s.payNowBtn,
                      {
                        backgroundColor: fee.status === "OVERDUE" ? RED : TEAL,
                      },
                    ]}
                  >
                    <Ionicons name="card-outline" size={14} color={WHITE} />
                    <Text style={s.payNowTxt}>
                      {fee.status === "OVERDUE"
                        ? "دفع فوري (متأخر)"
                        : "إتمام الدفع"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

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
  heroCard: {
    borderRadius: 20,
    padding: 18,
    overflow: "hidden",
    position: "relative",
  },
  heroBlob: { position: "absolute", borderRadius: 999 },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  heroLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
  heroValue: { color: "#fff", fontSize: 24, fontWeight: "900", marginTop: 2 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  heroBadgeTxt: { fontSize: 10, fontWeight: "700" },
  heroProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  progBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  progFill: { height: 6, borderRadius: 3 },
  progTxt: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "700",
    minWidth: 30,
    textAlign: "right",
  },
  heroRow: { flexDirection: "row" },
  heroItem: { flex: 1, alignItems: "center" },
  heroItemVal: { color: "#fff", fontSize: 16, fontWeight: "800" },
  heroItemLbl: { color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 2 },
  heroDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 4,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  alertTxt: { fontSize: 13, fontWeight: "600", flex: 1, textAlign: "right" },
  feeCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 12,
  },
  accent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  feeIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  feeTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feeCourse: { fontSize: 14, fontWeight: "700" },
  feeAmount: { fontSize: 20, fontWeight: "900" },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusTxt: { fontSize: 10, fontWeight: "700" },
  metaGrid: {},
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  metaKey: { fontSize: 11 },
  metaVal: { fontSize: 11, fontWeight: "600" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 9,
  },
  actionTxt: { fontSize: 12, fontWeight: "600" },
  payNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 10,
  },
  payNowTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
