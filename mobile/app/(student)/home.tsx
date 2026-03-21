// app/(student)/home.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  RefreshControl,
  Dimensions,
  Image,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  IconCalendarEvent,
  IconBell,
  IconChevronLeft,
  IconTrendingUp,
  IconFileCheck,
  IconCreditCard,
  IconCircleCheck,
  IconAlertCircle,
  IconClock,
  IconFileText,
  IconBook2,
  IconSchool,
} from "@tabler/icons-react-native";
import { useAuth } from "../../src/context/AuthContext";
import {
  useDashboard,
  useNotifications,
  useProfile,
  useDocuments,
  useFees,
} from "../../src/hooks/useStudent";
import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
} from "../../src/constants/theme";

const { width: SW } = Dimensions.get("window");

const TEAL = "#264230";
const TEAL2 = "#3D6B55";
const GOLD = "#C4A035";
const WHITE = "#FFFFFF";
const CREAM = "#F7F3EC";
const CREAM2 = "#EDE8DF";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "ليلة طيبة";
  if (h < 12) return "صباح الخير";
  if (h < 17) return "مساء الخير";
  return "مساء النور";
}

function getGreetingEn() {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─────────────────────────────────────────────
// Hero Card
// ─────────────────────────────────────────────

function HeroHeader({
  student,
  avatarUrl,
  onAvatarPress,
}: {
  student: any;
  avatarUrl: string | null;
  onAvatarPress: () => void;
}) {
  const initials =
    (
      (student?.first_name?.[0] ?? "") + (student?.last_name?.[0] ?? "")
    ).toUpperCase() || "ط";
  const fullName =
    [student?.first_name, student?.last_name].filter(Boolean).join(" ") ||
    "الطالب";

  return (
    <View style={h.card}>
      {/* Decorative circles */}
      <View style={h.ring1} />
      <View style={h.ring2} />
      <View style={h.ring3} />
      <View style={h.goldLine} />

      {/* Top bar */}
      <View style={h.topBar}>
        <TouchableOpacity
          onPress={onAvatarPress}
          activeOpacity={0.85}
          style={h.avatarWrap}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={h.avatarImg}
              resizeMode="cover"
            />
          ) : (
            <View style={h.avatar}>
              <Text style={h.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={h.onlineDot} />
        </TouchableOpacity>

        <View style={h.topBarCenter}>
          <Text style={h.topCeil}>CEIL</Text>
          <Text style={h.topSubtitle}>مركز التعليم المكثّف للغات</Text>
        </View>

        <View style={h.logoWrap}>
          <Image
            source={require("@/assets/logo-2.png")}
            style={h.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Greeting + name */}
      <View style={h.content}>
        <View style={h.greetRow}>
          <Text style={h.greetEn}>{getGreetingEn()}</Text>
          <Text style={h.greetAr}>{getGreeting()} 👋</Text>
        </View>
        <Text style={h.name}>{fullName}</Text>
      </View>
    </View>
  );
}

const h = StyleSheet.create({
  card: {
    backgroundColor: TEAL,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  ring1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    top: -80,
    left: -60,
  },
  ring2: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: "rgba(196,160,53,0.12)",
    bottom: -40,
    right: -40,
  },
  ring3: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(196,160,53,0.07)",
    bottom: 20,
    left: 30,
  },
  goldLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: GOLD,
    opacity: 0.6,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 4,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: { fontSize: 16, fontWeight: "700", color: WHITE },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    borderWidth: 1.5,
    borderColor: TEAL,
  },
  topBarCenter: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
  topCeil: {
    fontSize: 11,
    fontWeight: "700",
    color: GOLD,
    letterSpacing: 2.5,
    marginBottom: 2,
  },
  topSubtitle: {
    fontSize: 9,
    color: "rgba(255,255,255,0.50)",
    textAlign: "center",
    lineHeight: 13,
  },
  logoWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  logo: { width: 38, height: 38 },
  content: { alignItems: "flex-end" },
  greetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  greetEn: { fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1 },
  greetAr: { fontSize: 12, color: "rgba(255,255,255,0.60)" },
  name: {
    fontSize: 26,
    fontWeight: "700",
    color: WHITE,
    textAlign: "right",
    marginBottom: 10,
    lineHeight: 32,
  },
});

// ─────────────────────────────────────────────
// Stats Row — attendance + 2 mini cards
// ─────────────────────────────────────────────

function StatsRow({
  rate,
  feeStatus,
  docStatus,
  loading,
}: {
  rate: number;
  feeStatus: string;
  docStatus: string;
  loading: boolean;
}) {
  const pct = Math.min(Math.max(rate, 0), 100);
  const rateColor = pct >= 80 ? "#22c55e" : pct >= 60 ? GOLD : "#ef4444";
  const rateMsg = pct >= 80 ? "ممتاز" : pct >= 60 ? "جيد" : "منخفضة";
  const feeOk = feeStatus === "PAID";
  const docOk = docStatus === "APPROVED";
  const docBad = docStatus === "REJECTED";

  // ── وثائق مقبولة: مربعان متساويان جنباً إلى جنب ──────────────
  if (docOk) {
    return (
      <View style={st.row}>
        <View style={[st.halfCard, { borderColor: rateColor + "30" }]}>
          <View style={[st.halfTop, { backgroundColor: rateColor + "12" }]}>
            <IconTrendingUp size={14} color={rateColor} strokeWidth={2} />
            <Text style={st.halfTopLabel}>الحضور</Text>
          </View>
          <View style={st.halfBody}>
            <Text style={[st.halfPct, { color: rateColor }]}>
              {loading ? "—" : `${pct.toFixed(0)}%`}
            </Text>
            <View style={[st.halfBadge, { backgroundColor: rateColor + "15" }]}>
              <Text style={[st.halfBadgeText, { color: rateColor }]}>
                {rateMsg}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            st.halfCard,
            { borderColor: feeOk ? "#22c55e30" : GOLD + "30" },
          ]}
        >
          <View
            style={[
              st.halfTop,
              { backgroundColor: feeOk ? "#22c55e12" : GOLD + "12" },
            ]}
          >
            <IconCreditCard
              size={14}
              color={feeOk ? "#22c55e" : GOLD}
              strokeWidth={1.8}
            />
            <Text style={st.halfTopLabel}>الرسوم</Text>
          </View>
          <View style={st.halfBody}>
            <Text style={[st.halfPct, { color: feeOk ? "#22c55e" : GOLD }]}>
              {feeOk ? "✓" : "!"}
            </Text>
            <View
              style={[
                st.halfBadge,
                { backgroundColor: feeOk ? "#22c55e15" : GOLD + "15" },
              ]}
            >
              <Text
                style={[st.halfBadgeText, { color: feeOk ? "#22c55e" : GOLD }]}
              >
                {feeOk ? "مدفوعة" : "معلقة"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ── الحالة العادية: حضور + عمود مربعين ───────────────────────
  return (
    <View style={st.row}>
      <View style={[st.attCard, { borderColor: rateColor + "30" }]}>
        <View style={[st.attTop, { backgroundColor: rateColor + "12" }]}>
          <IconTrendingUp size={16} color={rateColor} strokeWidth={2} />
        </View>
        <Text style={[st.attPct, { color: rateColor }]}>
          {loading ? "—" : `${pct.toFixed(0)}%`}
        </Text>
        <Text style={st.attLabel}>الحضور</Text>
        <View style={[st.attBadge, { backgroundColor: rateColor + "15" }]}>
          <Text style={[st.attBadgeText, { color: rateColor }]}>{rateMsg}</Text>
        </View>
      </View>

      <View style={st.miniCol}>
        <View
          style={[
            st.miniCard,
            { borderColor: feeOk ? "#22c55e30" : GOLD + "30" },
          ]}
        >
          <View
            style={[
              st.miniIcon,
              { backgroundColor: feeOk ? "#22c55e12" : GOLD + "12" },
            ]}
          >
            <IconCreditCard
              size={15}
              color={feeOk ? "#22c55e" : GOLD}
              strokeWidth={1.8}
            />
          </View>
          <View style={st.miniText}>
            <Text style={st.miniLabel}>الرسوم</Text>
            <Text style={[st.miniValue, { color: feeOk ? "#22c55e" : GOLD }]}>
              {feeOk ? "مدفوعة" : "معلقة"}
            </Text>
          </View>
          {feeOk ? (
            <IconCircleCheck size={14} color="#22c55e" strokeWidth={2} />
          ) : (
            <IconClock size={14} color={GOLD} strokeWidth={2} />
          )}
        </View>

        <View
          style={[
            st.miniCard,
            { borderColor: docBad ? "#ef444430" : GOLD + "30" },
          ]}
        >
          <View
            style={[
              st.miniIcon,
              { backgroundColor: docBad ? "#ef444412" : GOLD + "12" },
            ]}
          >
            <IconFileCheck
              size={15}
              color={docBad ? "#ef4444" : GOLD}
              strokeWidth={1.8}
            />
          </View>
          <View style={st.miniText}>
            <Text style={st.miniLabel}>الوثائق</Text>
            <Text style={[st.miniValue, { color: docBad ? "#ef4444" : GOLD }]}>
              {docBad ? "مرفوضة" : "قيد المراجعة"}
            </Text>
          </View>
          {docBad ? (
            <IconAlertCircle size={14} color="#ef4444" strokeWidth={2} />
          ) : (
            <IconClock size={14} color={GOLD} strokeWidth={2} />
          )}
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, marginBottom: 16 },

  // مربعان متساويان عند docOk
  halfCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  halfTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  halfTopLabel: { fontSize: 10, fontWeight: "600", color: "#8A9E94" },
  halfBody: { paddingHorizontal: 12, paddingBottom: 14, gap: 6 },
  halfPct: { fontSize: 28, fontWeight: "800", lineHeight: 34 },
  halfBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  halfBadgeText: { fontSize: 10, fontWeight: "700" },

  // الحالة العادية
  attCard: {
    width: SW * 0.36,
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  attTop: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  attPct: { fontSize: 28, fontWeight: "700", lineHeight: 34 },
  attLabel: { fontSize: 10, color: "#8A9E94" },
  attBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  attBadgeText: { fontSize: 10, fontWeight: "700" },
  miniCol: { flex: 1, gap: 12 },
  miniCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  miniIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  miniText: { flex: 1 },
  miniLabel: { fontSize: 9, color: "#8A9E94", textAlign: "right" },
  miniValue: { fontSize: 11, fontWeight: "700", textAlign: "right" },
});

// ─────────────────────────────────────────────
// Quick Links
// ─────────────────────────────────────────────

const LINKS = [
  {
    Icon: IconBook2,
    label: "دوراتي",
    route: "/(student)/courses",
    color: TEAL,
    bg: TEAL + "12",
  },
  {
    Icon: IconCalendarEvent,
    label: "الجدول",
    route: "/(student)/schedule",
    color: "#1565C0",
    bg: "#1565C012",
  },
  {
    Icon: IconFileText,
    label: "وثائقي",
    route: "/(student)/documents",
    color: GOLD,
    bg: GOLD + "15",
  },
  {
    Icon: IconBell,
    label: "إشعارات",
    route: "/(student)/notifications",
    color: "#C04A15",
    bg: "#C04A1512",
  },
];

function QuickLinks({ onPress }: { onPress: (r: string) => void }) {
  return (
    <View style={ql.wrap}>
      <Text style={ql.title}>روابط سريعة</Text>
      <View style={ql.row}>
        {LINKS.map((l) => (
          <TouchableOpacity
            key={l.route}
            style={ql.btn}
            onPress={() => onPress(l.route)}
            activeOpacity={0.72}
          >
            <View style={[ql.icon, { backgroundColor: l.bg }]}>
              <l.Icon size={22} color={l.color} strokeWidth={1.8} />
            </View>
            <Text style={ql.label}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const ql = StyleSheet.create({
  wrap: { marginBottom: 24 },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: TEAL,
    textAlign: "right",
    marginBottom: 12,
  },
  row: { flexDirection: "row", gap: 10 },
  btn: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    backgroundColor: WHITE,
    borderRadius: 18,
    paddingVertical: 14,
    borderWidth: 0.5,
    borderColor: "#DDD8CE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 10, color: "#4A7065", fontWeight: "500" },
});

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────

function Notifications({
  items,
  loading,
  onSeeAll,
}: {
  items: any[];
  loading: boolean;
  onSeeAll: () => void;
}) {
  return (
    <View style={nf.wrap}>
      <View style={nf.header}>
        <TouchableOpacity onPress={onSeeAll} style={nf.seeAll}>
          <Text style={nf.seeAllText}>كل الإشعارات</Text>
          <IconChevronLeft size={13} color={TEAL} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={nf.title}>آخر الإشعارات</Text>
      </View>

      <View style={nf.card}>
        {loading ? (
          <View style={nf.empty}>
            <Text style={nf.emptyText}>جاري التحميل...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={nf.empty}>
            <Text style={{ fontSize: 28, marginBottom: 6 }}>🔔</Text>
            <Text style={nf.emptyText}>لا توجد إشعارات جديدة</Text>
          </View>
        ) : (
          items.map((n: any, i: number) => (
            <TouchableOpacity
              key={n.recipient_id ?? i}
              style={[
                nf.item,
                !n.is_read && nf.unread,
                i === items.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={onSeeAll}
              activeOpacity={0.7}
            >
              <View style={nf.indicatorWrap}>
                {!n.is_read && <View style={nf.unreadBar} />}
              </View>
              <View style={nf.itemBody}>
                <Text style={nf.itemTitle} numberOfLines={1}>
                  {n.notification?.title_ar || n.notification?.title || "إشعار"}
                </Text>
                <Text style={nf.itemMsg} numberOfLines={1}>
                  {n.notification?.message_ar || n.notification?.message || ""}
                </Text>
              </View>
              <IconChevronLeft size={14} color="#8A9E94" strokeWidth={1.5} />
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
}

const nf = StyleSheet.create({
  wrap: { marginBottom: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 14, fontWeight: "600", color: TEAL },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: { fontSize: 12, color: TEAL, fontWeight: "500" },
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#DDD8CE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingRight: 16,
    paddingLeft: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EDE8DF",
    gap: 10,
  },
  unread: { backgroundColor: TEAL + "05" },
  indicatorWrap: { width: 14, alignItems: "center" },
  unreadBar: { width: 3, height: 28, borderRadius: 2, backgroundColor: TEAL },
  itemBody: { flex: 1 },
  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C1C18",
    textAlign: "right",
  },
  itemMsg: { fontSize: 11, color: "#8A9E94", textAlign: "right", marginTop: 2 },
  empty: { padding: 28, alignItems: "center" },
  emptyText: { fontSize: 13, color: "#8A9E94" },
});

// ─────────────────────────────────────────────
// Bento Stats Section (from HTML — big grid)
// ─────────────────────────────────────────────

function BentoSection({ rate, loading }: { rate: number; loading: boolean }) {
  const pct = Math.min(Math.max(rate, 0), 100);
  const rateColor = pct >= 80 ? "#22c55e" : pct >= 60 ? GOLD : "#ef4444";
  // SVG circle params
  const R = 44;
  const CIRCUM = 2 * Math.PI * R;
  const offset = CIRCUM * (1 - pct / 100);

  return (
    <View style={bn.wrap}>
      <Text style={bn.sectionTitle}>نظرة عامة</Text>

      {/* Attendance large card */}
      <View style={bn.attCard}>
        <View style={bn.attHeader}>
          <IconSchool size={24} color={TEAL} strokeWidth={1.8} />
          <View>
            <Text style={bn.attTitle}>الحضور</Text>
            <Text style={bn.attSub}>السنة الدراسية 2024</Text>
          </View>
        </View>

        <View style={bn.attBody}>
          {/* SVG circle progress */}
          <View style={bn.circleWrap}>
            <View style={bn.circleContainer}>
              {/* Background circle */}
              <View style={[bn.circleTrack]} />
              {/* We use a View-based indicator since SVG isn't in RN */}
              <View
                style={[
                  bn.circleFill,
                  {
                    borderColor: rateColor,
                    // Simulate progress via borderWidth trick
                  },
                ]}
              />
              <View style={bn.circleCenter}>
                <Text style={[bn.circlePct, { color: rateColor }]}>
                  {loading ? "—" : `${pct.toFixed(0)}%`}
                </Text>
              </View>
            </View>
          </View>

          <View style={bn.attStats}>
            <View style={bn.statRow}>
              <View style={[bn.statDot, { backgroundColor: rateColor }]} />
              <Text style={bn.statLabel}>نسبة الحضور</Text>
              <Text style={[bn.statVal, { color: rateColor }]}>
                {loading ? "—" : `${pct.toFixed(0)}%`}
              </Text>
            </View>
            <View style={bn.progressBg}>
              <View
                style={[
                  bn.progressFill,
                  { width: `${pct}%` as any, backgroundColor: rateColor },
                ]}
              />
            </View>
            <Text style={bn.statHint}>
              {pct >= 80
                ? "أداء ممتاز، استمر!"
                : pct >= 60
                  ? "جيد، يمكن التحسين"
                  : "الحضور منخفض"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const bn = StyleSheet.create({
  wrap: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: TEAL,
    textAlign: "right",
    marginBottom: 12,
  },
  attCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 18,
    borderWidth: 0.5,
    borderColor: "#DDD8CE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  attHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  attTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEAL,
    textAlign: "right",
  },
  attSub: { fontSize: 11, color: "#8A9E94", textAlign: "right" },
  attBody: { flexDirection: "row", alignItems: "center", gap: 16 },

  circleWrap: { width: 90, height: 90 },
  circleContainer: {
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  circleTrack: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderColor: CREAM2,
  },
  circleFill: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderColor: "#22c55e",
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    transform: [{ rotate: "-45deg" }],
  },
  circleCenter: { alignItems: "center", justifyContent: "center" },
  circlePct: { fontSize: 20, fontWeight: "700" },

  attStats: { flex: 1 },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    justifyContent: "flex-end",
  },
  statDot: { width: 6, height: 6, borderRadius: 3 },
  statLabel: { fontSize: 11, color: "#8A9E94" },
  statVal: { fontSize: 12, fontWeight: "700" },
  progressBg: {
    height: 6,
    backgroundColor: CREAM2,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: { height: 6, borderRadius: 3 },
  statHint: { fontSize: 10, color: "#8A9E94", textAlign: "right" },
});

// ─────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  // ✅ useProfile يجلب أحدث بيانات الطالب من الـ API
  const { data: profileData, refetch: refetchProfile } = useProfile();

  // الأولوية: profile API → auth context student
  const student = (profileData as any) ?? user?.student ?? null;

  // الأولوية: avatar رفعه الطالب → google avatar → null (يظهر الحروف)
  const avatarUrl: string | null =
    student?.avatar_url || user?.google_avatar || null;

  const [refreshing, setRefreshing] = useState(false);

  const {
    data: dashboard,
    isLoading: dashLoading,
    refetch: refetchDash,
  } = useDashboard();
  const {
    data: notifData,
    isLoading: notifLoading,
    refetch: refetchNotif,
  } = useNotifications();
  const { data: docsData, refetch: refetchDocs } = useDocuments();
  const { data: feesData, refetch: refetchFees } = useFees();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchDash(),
      refetchNotif(),
      refetchProfile(),
      refetchDocs(),
      refetchFees(),
    ]);
    setRefreshing(false);
  };

  const notifications = notifData?.data?.slice(0, 3) ?? [];
  const attendanceRate = dashboard?.attendance_rate ?? 0;

  // ✅ احسب حالة الرسوم من البيانات الحقيقية
  const fees: any[] =
    (feesData as any)?.fees ?? (Array.isArray(feesData) ? feesData : []);
  const feeStatus = (() => {
    if (fees.length === 0) return dashboard?.fee_status ?? "UNPAID";
    const summary = (feesData as any)?.summary;
    if (summary?.is_fully_paid) return "PAID";
    if (summary?.remaining === 0) return "PAID";
    return "UNPAID";
  })();

  // ✅ احسب حالة الوثائق من البيانات الحقيقية — أدق من dashboard
  const documents: any[] =
    docsData?.documents ?? (Array.isArray(docsData) ? docsData : []);
  const docStatus = (() => {
    if (documents.length === 0) return "PENDING";
    const allApproved = documents.every((d) => d.status === "APPROVED");
    if (allApproved) return "APPROVED";
    const hasRejected = documents.some((d) => d.status === "REJECTED");
    if (hasRejected) return "REJECTED";
    return "PENDING";
  })();

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={CREAM} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={TEAL}
          />
        }
      >
        <HeroHeader
          student={student}
          avatarUrl={avatarUrl}
          onAvatarPress={() => router.push("/(student)/profile")}
        />

        <StatsRow
          rate={attendanceRate}
          feeStatus={feeStatus}
          docStatus={docStatus}
          loading={dashLoading}
        />

        <QuickLinks onPress={(r) => router.push(r as any)} />

        <BentoSection rate={attendanceRate} loading={dashLoading} />

        <Notifications
          items={notifications}
          loading={notifLoading}
          onSeeAll={() => router.push("/(student)/notifications")}
        />

        <View style={s.pad} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: CREAM },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
  },
  pad: { height: Platform.OS === "ios" ? 110 : 90 },
});
