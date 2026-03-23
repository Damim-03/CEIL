// app/(student)/fees.tsx
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useRef, useEffect, useState } from "react";
import {
  IconCreditCard,
  IconCircleCheck,
  IconAlertCircle,
  IconCalendar,
  IconCoin,
  IconRefresh,
  IconBuildingBank,
} from "@tabler/icons-react-native";
import { useFees } from "../../src/hooks/useStudent";
import { useTheme } from "../../src/context/ThemeContext";

const T = {
  teal: "#264230",
  teal2: "#3D6B55",
  teal3: "#1A2E22",
  gold: "#C4A035",
  cream: "#F7F3EC",
  cream2: "#EDE8DF",
  white: "#FFFFFF",
  dark: "#111818",
  muted: "#8A9E94",
  border: "#DDD8CE",
  green: "#22C55E",
  red: "#EF4444",
};

const fmt = (n: number) => `${n.toLocaleString("ar-DZ")} دج`;
const fmtD = (d: string) =>
  new Date(d).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
const isOverdue = (due: string, status: string) =>
  status !== "PAID" && new Date(due) < new Date();

// ── Hero ──────────────────────────────────────────────────────────
function Hero({ summary }: { summary: any }) {
  const pct =
    summary.total > 0 ? Math.round((summary.paid / summary.total) * 100) : 0;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [barWidth, pct]);

  return (
    <View style={hr.card}>
      <View style={hr.ring1} />
      <View style={hr.ring2} />
      <View style={hr.goldLine} />

      <View style={hr.topRow}>
        <View style={hr.iconWrap}>
          <IconCreditCard size={22} color={T.gold} strokeWidth={1.5} />
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={hr.labelTop}>CEIL — المالية</Text>
          <Text style={hr.title}>رسومي</Text>
          <Text style={hr.sub}>إدارة رسوم التسجيل والدورات</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Progress bar */}
      {summary.total > 0 && (
        <View style={hr.progressWrap}>
          <View style={hr.progressRow}>
            <Text style={hr.progressPct}>{pct}%</Text>
            <Text style={hr.progressLabel}>نسبة الدفع</Text>
          </View>
          <View style={hr.barBg}>
            <Animated.View
              style={[
                hr.barFill,
                {
                  width: barWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
}
const hr = StyleSheet.create({
  card: {
    backgroundColor: T.teal3,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: T.teal3,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  ring1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: T.teal2,
    opacity: 0.25,
    top: -60,
    left: -50,
  },
  ring2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: T.gold,
    opacity: 0.06,
    bottom: -20,
    right: 20,
  },
  goldLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: T.gold,
    opacity: 0.6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  labelTop: {
    fontSize: 9,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  title: { fontSize: 20, fontWeight: "800", color: T.white },
  sub: { fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 },
  progressWrap: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 12,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressPct: { fontSize: 18, fontWeight: "800", color: T.gold },
  progressLabel: { fontSize: 10, color: "rgba(255,255,255,0.5)" },
  barBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: { height: 6, backgroundColor: T.gold, borderRadius: 3 },
});

// ── Summary Cards ─────────────────────────────────────────────────
function SummaryCards({ summary, colors }: { summary: any; colors: any }) {
  const cards = [
    {
      label: "الإجمالي",
      value: fmt(summary.total),
      color: T.teal,
      bg: T.teal + "12",
      Icon: IconBuildingBank,
    },
    {
      label: "المدفوع",
      value: fmt(summary.paid),
      color: T.green,
      bg: T.green + "12",
      Icon: IconCircleCheck,
    },
    {
      label: "المتبقي",
      value: fmt(summary.remaining),
      color: summary.remaining > 0 ? T.red : T.muted,
      bg: summary.remaining > 0 ? T.red + "10" : T.cream2,
      Icon: IconCreditCard,
    },
  ];
  return (
    <View style={sc.row}>
      {cards.map((c, i) => (
        <View
          key={i}
          style={[
            sc.card,
            { borderColor: c.color + "25", backgroundColor: colors.surface },
          ]}
        >
          <View style={[sc.iconWrap, { backgroundColor: c.bg }]}>
            <c.Icon size={16} color={c.color} strokeWidth={1.8} />
          </View>
          <Text style={[sc.amount, { color: c.color }]}>{c.value}</Text>
          <Text style={sc.label}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}
const sc = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, marginBottom: 16 },
  card: {
    flex: 1,
    backgroundColor: T.white,
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  amount: { fontSize: 13, fontWeight: "800", textAlign: "center" },
  label: { fontSize: 9, color: T.muted, fontWeight: "600" },
});

// ── Status Banner ─────────────────────────────────────────────────
function StatusBanner({ summary }: { summary: any }) {
  const ok = summary.is_fully_paid;
  return (
    <View
      style={[
        sb.wrap,
        {
          backgroundColor: ok ? T.green + "10" : T.gold + "10",
          borderColor: ok ? T.green + "30" : T.gold + "30",
        },
      ]}
    >
      <View
        style={[
          sb.icon,
          { backgroundColor: ok ? T.green + "18" : T.gold + "18" },
        ]}
      >
        {ok ? (
          <IconCircleCheck size={18} color={T.green} strokeWidth={2.2} />
        ) : (
          <IconAlertCircle size={18} color={T.gold} strokeWidth={2.2} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[sb.title, { color: ok ? T.green : "#A16207" }]}>
          {ok ? "جميع الرسوم مدفوعة ✓" : "يوجد رسوم متبقية"}
        </Text>
        <Text style={sb.sub}>
          {ok
            ? "لا توجد رسوم متأخرة. أحسنت!"
            : `المتبقي: ${fmt(summary.remaining)}`}
        </Text>
      </View>
      <View
        style={[
          sb.badge,
          { backgroundColor: ok ? T.green + "15" : T.gold + "15" },
        ]}
      >
        <Text style={[sb.badgeText, { color: ok ? T.green : "#A16207" }]}>
          {ok
            ? "✓ مسوّى"
            : `${Math.round((summary.paid / summary.total) * 100)}%`}
        </Text>
      </View>
    </View>
  );
}
const sb = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 13, fontWeight: "700" },
  sub: { fontSize: 11, color: T.muted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: "800" },
});

// ── Fee Card ──────────────────────────────────────────────────────
function FeeCard({
  fee,
  index,
  colors: C,
}: {
  fee: any;
  index: number;
  colors: any;
}) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 320,
        delay: index * 70,
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 320,
        delay: index * 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeIn, index, slideY]);

  const isPaid = fee.status === "PAID";
  const overdue = isOverdue(fee.due_date, fee.status);
  const accentColor = isPaid ? T.green : overdue ? T.red : T.gold;
  const statusLabel = isPaid ? "مدفوع" : overdue ? "متأخر" : "معلق";
  const statusBg = isPaid
    ? T.green + "12"
    : overdue
      ? T.red + "10"
      : T.gold + "10";

  return (
    <Animated.View
      style={{
        opacity: fadeIn,
        transform: [{ translateY: slideY }],
        marginBottom: 12,
      }}
    >
      <View
        style={[fc.card, { backgroundColor: C.surface, borderColor: C.border }]}
      >
        {/* Accent line top */}
        {!isPaid && (
          <View style={[fc.accentLine, { backgroundColor: accentColor }]} />
        )}

        <View style={fc.body}>
          {/* Header */}
          <View style={fc.header}>
            <View style={[fc.iconBox, { backgroundColor: accentColor + "15" }]}>
              <IconCoin size={20} color={accentColor} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[fc.courseName, { color: C.text }]}
                numberOfLines={1}
              >
                {fee.enrollment?.course?.course_name || "رسوم التسجيل"}
              </Text>
              {fee.enrollment?.level && (
                <Text style={fc.level}>المستوى {fee.enrollment.level}</Text>
              )}
            </View>
            <View style={[fc.statusBadge, { backgroundColor: statusBg }]}>
              <View style={[fc.statusDot, { backgroundColor: accentColor }]} />
              <Text style={[fc.statusText, { color: accentColor }]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* Details grid */}
          <View style={[fc.grid, { backgroundColor: C.cream2 }]}>
            <View style={fc.gridItem}>
              <Text style={fc.gridLabel}>المبلغ</Text>
              <Text style={[fc.gridVal, { color: accentColor }]}>
                {fmt(fee.amount)}
              </Text>
            </View>
            <View style={fc.gridItem}>
              <Text style={fc.gridLabel}>تاريخ الاستحقاق</Text>
              <View style={fc.gridDateRow}>
                <IconCalendar
                  size={11}
                  color={overdue && !isPaid ? T.red : T.muted}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    fc.gridVal,
                    {
                      color: overdue && !isPaid ? T.red : T.dark,
                      fontSize: 11,
                    },
                  ]}
                >
                  {fmtD(fee.due_date)}
                </Text>
              </View>
            </View>
            {isPaid && fee.paid_at && (
              <View style={fc.gridItem}>
                <Text style={fc.gridLabel}>تاريخ الدفع</Text>
                <Text style={[fc.gridVal, { color: T.green, fontSize: 11 }]}>
                  {fmtD(fee.paid_at)}
                </Text>
              </View>
            )}
            {isPaid && fee.reference_code && (
              <View style={fc.gridItem}>
                <Text style={fc.gridLabel}>المرجع</Text>
                <View style={[fc.refWrap, { backgroundColor: C.borderLight }]}>
                  <Text style={fc.refText} numberOfLines={1}>
                    {fee.reference_code}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Payment method */}
          {isPaid && fee.payment_method && (
            <View style={fc.methodRow}>
              <IconCreditCard size={13} color={T.teal2} strokeWidth={2} />
              <Text style={fc.methodText}>
                دُفع عبر{" "}
                <Text style={{ fontWeight: "700" }}>{fee.payment_method}</Text>
              </Text>
            </View>
          )}

          {/* Overdue warning */}
          {overdue && !isPaid && (
            <View style={fc.overdueWarn}>
              <IconAlertCircle size={13} color={T.red} strokeWidth={2} />
              <Text style={fc.overdueText}>
                الدفع متأخر — يرجى التسوية في أقرب وقت
              </Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
const fc = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  accentLine: { height: 3 },
  body: { padding: 14, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  courseName: {
    fontSize: 14,
    fontWeight: "700",
    color: T.dark,
    textAlign: "right",
  },
  level: { fontSize: 10, color: T.muted, textAlign: "right", marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: "700" },
  grid: {
    backgroundColor: T.cream,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: { width: "47%" },
  gridLabel: {
    fontSize: 9,
    color: T.muted,
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 3,
  },
  gridVal: {
    fontSize: 13,
    fontWeight: "700",
    color: T.dark,
    textAlign: "right",
  },
  gridDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "flex-end",
  },
  refWrap: {
    backgroundColor: T.cream2,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  refText: {
    fontSize: 9,
    color: T.dark,
    fontWeight: "600",
    textAlign: "right",
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: T.teal2 + "10",
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: T.teal2 + "20",
  },
  methodText: { fontSize: 11, color: T.teal2 },
  overdueWarn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: T.red + "08",
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: T.red + "25",
  },
  overdueText: {
    fontSize: 11,
    color: T.red,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
});

// ── Empty State ───────────────────────────────────────────────────
function EmptyState() {
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -8,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [float]);
  return (
    <View style={{ alignItems: "center", paddingVertical: 56, gap: 14 }}>
      <Animated.View
        style={[
          {
            width: 90,
            height: 90,
            borderRadius: 24,
            backgroundColor: T.teal + "10",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: T.teal + "18",
          },
          { transform: [{ translateY: float }] },
        ]}
      >
        <IconCoin size={42} color={T.teal2} strokeWidth={1.2} />
      </Animated.View>
      <Text style={{ fontSize: 16, fontWeight: "800", color: T.dark }}>
        لا توجد رسوم بعد
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: T.muted,
          textAlign: "center",
          lineHeight: 18,
        }}
      >
        ستظهر رسومك هنا بعد التسجيل في دورة
      </Text>
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function FeesScreen() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, isError, refetch } = useFees();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Normalize data
  const fees: any[] = (data as any)?.fees ?? (Array.isArray(data) ? data : []);
  const summary: any = (data as any)?.summary ?? {
    total: 0,
    paid: 0,
    remaining: 0,
    is_fully_paid: true,
  };

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={T.teal}
          />
        }
      >
        <Hero summary={summary} />

        {isLoading && (
          <View style={{ alignItems: "center", paddingVertical: 48, gap: 12 }}>
            <ActivityIndicator size="large" color={T.teal} />
            <Text style={{ fontSize: 13, color: T.muted }}>
              جاري تحميل الرسوم...
            </Text>
          </View>
        )}

        {isError && !isLoading && (
          <View style={{ alignItems: "center", paddingVertical: 40, gap: 14 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: T.red + "10",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconAlertCircle size={28} color={T.red} strokeWidth={1.5} />
            </View>
            <Text style={{ fontSize: 14, fontWeight: "700", color: T.dark }}>
              فشل تحميل الرسوم
            </Text>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: T.teal,
                borderRadius: 14,
                paddingHorizontal: 20,
                paddingVertical: 12,
              }}
              onPress={() => refetch()}
            >
              <IconRefresh size={16} color={T.white} strokeWidth={2} />
              <Text style={{ fontSize: 13, fontWeight: "700", color: T.white }}>
                إعادة المحاولة
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && (
          <>
            {fees.length > 0 && (
              <SummaryCards summary={summary} colors={colors} />
            )}
            {fees.length > 0 && <StatusBanner summary={summary} />}

            {/* Section label */}
            {fees.length > 0 && (
              <View style={s.sectionRow}>
                <View
                  style={{ flex: 1, height: 1, backgroundColor: T.border }}
                />
                <View style={s.sectionBadge}>
                  <Text style={s.sectionText}>كشف الرسوم</Text>
                  <View style={s.countBadge}>
                    <Text style={s.countText}>{fees.length}</Text>
                  </View>
                </View>
                <View
                  style={{ flex: 1, height: 1, backgroundColor: T.border }}
                />
              </View>
            )}

            {fees.length === 0 ? (
              <EmptyState />
            ) : (
              fees.map((fee: any, i: number) => (
                <FeeCard
                  key={fee.fee_id ?? i}
                  fee={fee}
                  index={i}
                  colors={colors}
                />
              ))
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: T.cream2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sectionText: { fontSize: 10, fontWeight: "700", color: T.muted },
  countBadge: {
    backgroundColor: T.teal2,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countText: { fontSize: 9, fontWeight: "800", color: T.white },
});
