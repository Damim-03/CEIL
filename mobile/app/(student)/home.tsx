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
  IconCheckupList,
  IconBell,
  IconBooks,
  IconChevronLeft,
  IconTrendingUp,
  IconFileCheck,
  IconCreditCard,
  IconCircleCheck,
  IconAlertCircle,
  IconClock,
} from "@tabler/icons-react-native";
import { useStudent } from "../../src/context/AuthContext";
import { useDashboard, useNotifications } from "../../src/hooks/useStudent";
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from "../../src/constants/theme";

const { width: SW } = Dimensions.get("window");

const TEAL   = "#264230";
const TEAL2  = "#3D6B55";
const GOLD   = "#C4A035";
const GOLD2  = "#E8C547";
const WHITE  = "#FFFFFF";
const CREAM  = "#F7F3EC";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "ليلة طيبة";
  if (h < 12) return "صباح الخير";
  if (h < 17) return "مساء الخير";
  return "مساء النور";
}

function getGreetingEn() {
  const h = new Date().getHours();
  if (h < 5)  return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─────────────────────────────────────────────
// Hero — full bleed dark card
// ─────────────────────────────────────────────

function HeroHeader({ student, onAvatarPress }: { student: any; onAvatarPress: () => void }) {
  const initials = (
    (student?.first_name?.[0] ?? "") + (student?.last_name?.[0] ?? "")
  ).toUpperCase() || "ط";

  const fullName = [student?.first_name, student?.last_name].filter(Boolean).join(" ") || "الطالب";

  // Support multiple possible avatar field names
  const avatarUrl: string | null =
    student?.avatar_url ||
    student?.photo ||
    student?.profile_picture ||
    student?.image_url ||
    null;

  return (
    <View style={h.card}>
      {/* Decorative rings */}
      <View style={h.ring1} />
      <View style={h.ring2} />
      <View style={h.ring3} />

      {/* Gold accent line */}
      <View style={h.goldLine} />

      {/* Top bar: avatar — center name — logo */}
      <View style={h.topBar}>
        {/* Avatar — right */}
        <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.85} style={h.avatarWrap}>
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

        {/* Center: CEIL + center name */}
        <View style={h.topBarCenter}>
          <Text style={h.topCeil}>CEIL</Text>
          <Text style={h.topCenterName}>مركز التعليم المكثّف للغات </Text>
        </View>

        {/* Logo — left */}
        <View style={h.logoWrap}>
          <Image
            source={require("@/assets/logo-2.png")}
            style={h.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content */}
      <View style={h.content}>
        <View style={h.greetingRow}>
          <Text style={h.greetingEn}>{getGreetingEn()}</Text>
          <Text style={h.greetingAr}>{getGreeting()} 👋</Text>
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
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: "hidden",
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  ring1: {
    position: "absolute", width: 220, height: 220, borderRadius: 110,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    top: -80, left: -60,
  },
  ring2: {
    position: "absolute", width: 160, height: 160, borderRadius: 80,
    borderWidth: 1, borderColor: "rgba(196,160,53,0.12)",
    bottom: -40, right: -40,
  },
  ring3: {
    position: "absolute", width: 90, height: 90, borderRadius: 45,
    backgroundColor: "rgba(196,160,53,0.07)",
    bottom: 20, left: 30,
  },
  goldLine: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: 2.5, backgroundColor: GOLD, opacity: 0.6,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
    marginTop: 4,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: GOLD,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.3)",
  },
  avatarImg: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: { fontSize: 16, fontWeight: FontWeight.bold, color: WHITE },
  onlineDot: {
    position: "absolute", bottom: 1, right: 1,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: "#4CAF50",
    borderWidth: 1.5, borderColor: TEAL,
  },
  topBarCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  topCeil: {
    fontSize: 11, fontWeight: FontWeight.bold,
    color: GOLD, letterSpacing: 2.5, marginBottom: 2,
  },
  topCenterName: {
    fontSize: 9, color: "rgba(255,255,255,0.50)",
    textAlign: "center", lineHeight: 13,
  },
  logoWrap: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  logo: { width: 38, height: 38 },
  content: { alignItems: "flex-end" },
  greetingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  greetingEn: { fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1 },
  greetingAr: { fontSize: FontSize.xs, color: "rgba(255,255,255,0.60)" },
  name: {
    fontSize: 26, fontWeight: FontWeight.bold, color: WHITE,
    textAlign: "right", marginBottom: 10, lineHeight: 32,
  },
});

// ─────────────────────────────────────────────
// Stats row — attendance + 2 mini cards
// ─────────────────────────────────────────────

function StatsRow({ rate, feeStatus, docStatus, loading }: {
  rate: number; feeStatus: string; docStatus: string; loading: boolean;
}) {
  const pct      = Math.min(Math.max(rate, 0), 100);
  const rateColor = pct >= 80 ? "#22c55e" : pct >= 60 ? GOLD : "#ef4444";
  const rateMsg  = pct >= 80 ? "ممتاز" : pct >= 60 ? "جيد" : "منخفضة";

  const feeOk  = feeStatus === "PAID";
  const docOk  = docStatus === "APPROVED";
  const docBad = docStatus === "REJECTED";

  return (
    <View style={st.row}>

      {/* Attendance — big card */}
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

      {/* Mini cards column */}
      <View style={st.miniCol}>

        {/* Fee */}
        <View style={[st.miniCard, { borderColor: feeOk ? "#22c55e30" : GOLD + "30" }]}>
          <View style={[st.miniIcon, { backgroundColor: feeOk ? "#22c55e12" : GOLD + "12" }]}>
            <IconCreditCard size={15} color={feeOk ? "#22c55e" : GOLD} strokeWidth={1.8} />
          </View>
          <View style={st.miniText}>
            <Text style={st.miniLabel}>الرسوم</Text>
            <Text style={[st.miniValue, { color: feeOk ? "#22c55e" : GOLD }]}>
              {feeOk ? "مدفوعة" : "معلقة"}
            </Text>
          </View>
          {feeOk
            ? <IconCircleCheck size={14} color="#22c55e" strokeWidth={2} />
            : <IconClock size={14} color={GOLD} strokeWidth={2} />}
        </View>

        {/* Docs */}
        <View style={[st.miniCard, {
          borderColor: docOk ? "#22c55e30" : docBad ? "#ef444430" : GOLD + "30",
        }]}>
          <View style={[st.miniIcon, {
            backgroundColor: docOk ? "#22c55e12" : docBad ? "#ef444412" : GOLD + "12",
          }]}>
            <IconFileCheck size={15} color={docOk ? "#22c55e" : docBad ? "#ef4444" : GOLD} strokeWidth={1.8} />
          </View>
          <View style={st.miniText}>
            <Text style={st.miniLabel}>الوثائق</Text>
            <Text style={[st.miniValue, { color: docOk ? "#22c55e" : docBad ? "#ef4444" : GOLD }]}>
              {docOk ? "مقبولة" : docBad ? "مرفوضة" : "قيد المراجعة"}
            </Text>
          </View>
          {docOk
            ? <IconCircleCheck size={14} color="#22c55e" strokeWidth={2} />
            : docBad
            ? <IconAlertCircle size={14} color="#ef4444" strokeWidth={2} />
            : <IconClock size={14} color={GOLD} strokeWidth={2} />}
        </View>

      </View>
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.md },

  attCard: {
    width: SW * 0.36,
    backgroundColor: Colors.surface,
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
  attTop: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  attPct: { fontSize: 28, fontWeight: FontWeight.bold, lineHeight: 34 },
  attLabel: { fontSize: 10, color: Colors.textMuted },
  attBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  attBadgeText: { fontSize: 10, fontWeight: FontWeight.bold },

  miniCol: { flex: 1, gap: Spacing.sm },
  miniCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
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
  miniIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  miniText: { flex: 1 },
  miniLabel: { fontSize: 9, color: Colors.textMuted, textAlign: "right" },
  miniValue: { fontSize: 11, fontWeight: FontWeight.bold, textAlign: "right" },
});

// ─────────────────────────────────────────────
// Quick links — horizontal pill buttons
// ─────────────────────────────────────────────

const LINKS = [
  { Icon: IconBooks,         label: "دوراتي",    route: "/(student)/courses",       color: TEAL,      bg: TEAL + "12"   },
  { Icon: IconCalendarEvent, label: "الجدول",    route: "/(student)/schedule",      color: "#1565C0", bg: "#1565C012"   },
  { Icon: IconCheckupList,   label: "الحضور",    route: "/(student)/attendance",    color: "#2E7D32", bg: "#2E7D3212"   },
  { Icon: IconBell,          label: "إشعارات",   route: "/(student)/notifications", color: GOLD,      bg: GOLD + "15"   },
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
  wrap:  { marginBottom: Spacing.lg },
  title: {
    fontSize: FontSize.sm, fontWeight: FontWeight.semibold,
    color: Colors.textPrimary, textAlign: "right", marginBottom: 12,
  },
  row:   { flexDirection: "row", gap: 10 },
  btn:   {
    flex: 1, alignItems: "center", gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 18, paddingVertical: 14,
    borderWidth: 0.5, borderColor: Colors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  icon:  { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 10, color: Colors.textSecondary, fontWeight: FontWeight.medium },
});

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────

function Notifications({ items, loading, onSeeAll }: {
  items: any[]; loading: boolean; onSeeAll: () => void;
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
              style={[nf.item, !n.is_read && nf.unread, i === items.length - 1 && { borderBottomWidth: 0 }]}
              onPress={onSeeAll}
              activeOpacity={0.7}
            >
              {/* Unread indicator */}
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
              <IconChevronLeft size={14} color={Colors.textMuted} strokeWidth={1.5} />
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
}

const nf = StyleSheet.create({
  wrap:      { marginBottom: Spacing.lg },
  header:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title:     { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  seeAll:    { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText:{ fontSize: FontSize.xs, color: TEAL, fontWeight: FontWeight.medium },
  card:      {
    backgroundColor: Colors.surface, borderRadius: 20,
    overflow: "hidden", borderWidth: 0.5, borderColor: Colors.borderLight,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  item: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14, paddingRight: 16, paddingLeft: 12,
    borderBottomWidth: 0.5, borderBottomColor: Colors.borderLight,
    gap: 10,
  },
  unread:    { backgroundColor: TEAL + "05" },
  indicatorWrap: { width: 14, alignItems: "center" },
  unreadBar: { width: 3, height: 28, borderRadius: 2, backgroundColor: TEAL },
  itemBody:  { flex: 1 },
  itemTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, textAlign: "right" },
  itemMsg:   { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: "right", marginTop: 2 },
  empty:     { padding: 28, alignItems: "center" },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted },
});

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

export default function Home() {
  const router  = useRouter();
  const student = useStudent();
  const [refreshing, setRefreshing] = useState(false);

  const { data: dashboard, isLoading: dashLoading, refetch: refetchDash }   = useDashboard();
  const { data: notifData, isLoading: notifLoading, refetch: refetchNotif } = useNotifications();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchDash(), refetchNotif()]);
    setRefreshing(false);
  };

  const notifications  = notifData?.data?.slice(0, 3) ?? [];
  const attendanceRate = dashboard?.attendance_rate ?? 0;
  const feeStatus      = dashboard?.fee_status      ?? "UNPAID";
  const docStatus      = dashboard?.document_status ?? "PENDING";

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />}
      >
        <HeroHeader student={student} onAvatarPress={() => router.push("/(student)/profile")} />

        <StatsRow
          rate={attendanceRate}
          feeStatus={feeStatus}
          docStatus={docStatus}
          loading={dashLoading}
        />

        <QuickLinks onPress={(r) => router.push(r as any)} />

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
  root:   { flex: 1, backgroundColor: CREAM },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Platform.OS === "ios" ? 56 : 40 },
  pad:    { height: Platform.OS === "ios" ? 110 : 90 },
});