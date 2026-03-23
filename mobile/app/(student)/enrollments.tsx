// app/(student)/enrollments.tsx
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
import { useRouter } from "expo-router";
import {
  IconCircleCheck,
  IconClock,
  IconX,
  IconSchool,
  IconUsers,
  IconCalendar,
  IconAlertCircle,
  IconArrowRight,
  IconRefresh,
} from "@tabler/icons-react-native";
import { useEnrollments } from "../../src/hooks/useStudent";
import { useTheme } from "../../src/context/ThemeContext";
import { type AppColors } from "../../src/constants/theme";

// ── Static brand tokens (intentionally always dark — hero/banner) ─
const T = {
  teal: "#264230",
  teal2: "#3D6B55",
  teal3: "#1A2E22",
  gold: "#C4A035",
  white: "#FFFFFF",
};

type Status = "PENDING" | "VALIDATED" | "PAID" | "REJECTED" | "FINISHED";

const STATUS_CFG: Record<
  Status,
  {
    label: string;
    color: string;
    bg: string;
    bgDark: string;
    border: string;
    borderDark: string;
    dot: string;
    message: string;
    icon: any;
  }
> = {
  PENDING: {
    label: "قيد الانتظار",
    color: "#A16207",
    bg: "#FEF9C3",
    bgDark: "#2A2000",
    border: "#FDE047",
    borderDark: "#5A4500",
    dot: "#EAB308",
    message: "طلبك قيد المراجعة من الإدارة",
    icon: IconClock,
  },
  VALIDATED: {
    label: "مقبول",
    color: "#15803D",
    bg: "#DCFCE7",
    bgDark: "#0A2010",
    border: "#86EFAC",
    borderDark: "#1A5030",
    dot: "#22C55E",
    message: "تم قبولك. يمكنك الانضمام لمجموعة!",
    icon: IconCircleCheck,
  },
  PAID: {
    label: "مدفوع ونشط",
    color: "#15803D",
    bg: "#DCFCE7",
    bgDark: "#0A2010",
    border: "#86EFAC",
    borderDark: "#1A5030",
    dot: "#22C55E",
    message: "تم تأكيد الدفع. جاهز للتعلم!",
    icon: IconCircleCheck,
  },
  REJECTED: {
    label: "مرفوض",
    color: "#EF4444",
    bg: "#FEE2E2",
    bgDark: "#2A0808",
    border: "#FCA5A5",
    borderDark: "#6B1414",
    dot: "#EF4444",
    message: "تم رفض طلبك. تواصل مع الإدارة.",
    icon: IconX,
  },
  FINISHED: {
    label: "منتهي",
    color: "#6B7280",
    bg: "#F3F4F6",
    bgDark: "#1A1C1E",
    border: "#D1D5DB",
    borderDark: "#374151",
    dot: "#9CA3AF",
    message: "تهانينا! أتممت هذه الدورة.",
    icon: IconSchool,
  },
};

function getCount(enrollments: any[], statuses: Status[]) {
  return enrollments.filter((e) => statuses.includes(e.registration_status))
    .length;
}

// ── Hero — intentionally always dark ─────────────────────────────
function Hero() {
  return (
    <View style={hr.card}>
      <View style={hr.ring1} />
      <View style={hr.ring2} />
      <View style={hr.goldLine} />
      <View style={hr.row}>
        <View style={hr.iconWrap}>
          <IconSchool size={22} color={T.gold} strokeWidth={1.5} />
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={hr.label}>CEIL</Text>
          <Text style={hr.title}>تسجيلاتي</Text>
          <Text style={hr.sub}>تتبع حالة تسجيلاتك ومجموعاتك</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>
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
    width: 100,
    height: 100,
    borderRadius: 50,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  label: {
    fontSize: 9,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 2,
    marginBottom: 2,
  },
  title: { fontSize: 20, fontWeight: "800", color: T.white },
  sub: { fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 },
});

// ── Stats Row ─────────────────────────────────────────────────────
function StatsRow({
  enrollments,
  colors,
}: {
  enrollments: any[];
  colors: AppColors;
}) {
  const stats = [
    {
      label: "نشط",
      value: getCount(enrollments, ["VALIDATED", "PAID"]),
      color: colors.teal2,
      bg: colors.teal2 + "20",
      bc: colors.teal2 + "35",
    },
    {
      label: "انتظار",
      value: getCount(enrollments, ["PENDING"]),
      color: "#A16207",
      bg: colors.isDark ? "#2A200010" : "#FEF9C380",
      bc: "#A1620730",
    },
    {
      label: "مدفوع",
      value: getCount(enrollments, ["PAID"]),
      color: colors.teal,
      bg: colors.teal + "18",
      bc: colors.teal + "30",
    },
    {
      label: "مرفوض",
      value: getCount(enrollments, ["REJECTED"]),
      color: colors.error,
      bg: colors.error + "18",
      bc: colors.error + "30",
    },
  ];
  return (
    <View style={st.row}>
      {stats.map((s, i) => (
        <View
          key={i}
          style={[st.card, { backgroundColor: s.bg, borderColor: s.bc }]}
        >
          <Text style={[st.val, { color: s.color }]}>{s.value}</Text>
          <Text style={[st.lbl, { color: s.color }]}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}
const st = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, marginBottom: 16 },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    gap: 4,
  },
  val: { fontSize: 22, fontWeight: "800" },
  lbl: { fontSize: 9, fontWeight: "700" },
});

// ── Ready Banner — intentionally always dark ──────────────────────
function ReadyBanner({
  count,
  onPress,
}: {
  count: number;
  onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse]);

  return (
    <Animated.View style={[rb.card, { transform: [{ scale: pulse }] }]}>
      <View style={rb.ring} />
      <View style={rb.inner}>
        <View style={rb.iconWrap}>
          <IconUsers size={24} color={T.white} strokeWidth={1.8} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={rb.title}>جاهز للانضمام لمجموعة!</Text>
          <Text style={rb.sub}>لديك {count} تسجيل جاهز لاختيار المجموعة</Text>
        </View>
        <TouchableOpacity style={rb.btn} onPress={onPress} activeOpacity={0.85}>
          <Text style={rb.btnText}>اختر</Text>
          <IconArrowRight size={14} color={T.teal} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
const rb = StyleSheet.create({
  card: {
    backgroundColor: T.teal3,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: T.teal3,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  ring: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: T.gold,
    opacity: 0.06,
    top: -40,
    right: -20,
  },
  inner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 14, fontWeight: "800", color: T.white, marginBottom: 2 },
  sub: { fontSize: 11, color: "rgba(255,255,255,0.55)" },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.gold,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnText: { fontSize: 12, fontWeight: "800", color: T.teal },
});

// ── Enrollment Card ───────────────────────────────────────────────
function EnrollmentCard({
  enrollment,
  index,
  onJoinGroup,
  isNew,
}: {
  enrollment: any;
  index: number;
  onJoinGroup: () => void;
  isNew?: boolean;
}) {
  const { colors, isDark } = useTheme();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 320,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 320,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeIn, index, slideY]);

  const status = enrollment.registration_status as Status;
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.PENDING;
  const StatusIcon = cfg.icon;
  const hasGroup = !!enrollment.group_id;
  const canJoin = (status === "VALIDATED" || status === "PAID") && !hasGroup;

  // ── dark-aware status colors ──────────────────────────────────
  const statusBg = isDark ? cfg.bgDark : cfg.bg;
  const statusBorder = isDark ? cfg.borderDark : cfg.border;

  const enrollDate = enrollment.enrollment_date
    ? new Date(enrollment.enrollment_date).toLocaleDateString("ar-DZ", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Animated.View
      style={{
        opacity: fadeIn,
        transform: [{ translateY: slideY }],
        marginBottom: 12,
      }}
    >
      <View
        style={[
          ec.card,
          {
            backgroundColor: colors.surface,
            borderColor: isNew ? colors.teal : colors.border,
            borderWidth: isNew ? 2 : 0.5,
          },
        ]}
      >
        {/* Status header */}
        <View
          style={[
            ec.statusBar,
            { backgroundColor: statusBg, borderBottomColor: statusBorder },
          ]}
        >
          <View style={ec.statusLeft}>
            <StatusIcon size={15} color={cfg.color} strokeWidth={2.2} />
            <Text style={[ec.statusLabel, { color: cfg.color }]}>
              {cfg.label}
            </Text>
          </View>
          <Text style={[ec.enrollId, { color: colors.textMuted }]}>
            #{enrollment.enrollment_id?.slice(0, 8)}
          </Text>
        </View>

        <View style={ec.body}>
          {/* Course name */}
          <Text
            style={[ec.courseName, { color: colors.text }]}
            numberOfLines={1}
          >
            {enrollment.course?.course_name || "دورة غير محددة"}
          </Text>
          {enrollment.course?.course_code && (
            <Text style={[ec.courseCode, { color: colors.textMuted }]}>
              {enrollment.course.course_code}
            </Text>
          )}

          {/* Status message */}
          <View
            style={[
              ec.msgBox,
              { backgroundColor: statusBg, borderColor: statusBorder },
            ]}
          >
            <Text style={[ec.msgText, { color: cfg.color }]}>
              {cfg.message}
            </Text>
          </View>

          {/* Group info */}
          {hasGroup && enrollment.group && (
            <View
              style={[
                ec.groupBox,
                {
                  backgroundColor: colors.teal2 + "12",
                  borderColor: colors.teal2 + "25",
                },
              ]}
            >
              <View style={ec.groupRow}>
                <IconUsers size={14} color={colors.teal2} strokeWidth={2} />
                <Text style={[ec.groupLabel, { color: colors.text }]}>
                  {status === "PENDING"
                    ? "مجموعة مخصصة (انتظار الموافقة)"
                    : "مسجل في مجموعة"}
                </Text>
              </View>
              <Text style={[ec.groupName, { color: colors.textMuted }]}>
                المستوى {enrollment.level || enrollment.group.level} —{" "}
                {enrollment.group.name}
              </Text>
            </View>
          )}

          {/* Meta row */}
          <View style={ec.metaRow}>
            {enrollDate && (
              <View style={ec.metaItem}>
                <IconCalendar
                  size={12}
                  color={colors.textMuted}
                  strokeWidth={2}
                />
                <Text style={[ec.metaText, { color: colors.textMuted }]}>
                  {enrollDate}
                </Text>
              </View>
            )}
            {enrollment.level && (
              <View style={ec.metaItem}>
                <IconSchool
                  size={12}
                  color={colors.textMuted}
                  strokeWidth={2}
                />
                <Text style={[ec.metaText, { color: colors.textMuted }]}>
                  {enrollment.level}
                </Text>
              </View>
            )}
          </View>

          {/* Join button */}
          {canJoin && (
            <TouchableOpacity
              style={[ec.joinBtn, { backgroundColor: colors.teal }]}
              onPress={onJoinGroup}
              activeOpacity={0.85}
            >
              <IconUsers size={15} color={T.white} strokeWidth={2} />
              <Text style={ec.joinText}>انضم لمجموعة</Text>
              <IconArrowRight size={14} color={T.white} strokeWidth={2.5} />
            </TouchableOpacity>
          )}

          {status === "PENDING" && (
            <View style={ec.waitRow}>
              <IconClock size={12} color="#A16207" strokeWidth={2} />
              <Text style={ec.waitText}>في انتظار موافقة الإدارة</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const ec = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  statusLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusLabel: { fontSize: 12, fontWeight: "700" },
  enrollId: { fontSize: 10 },
  body: { padding: 14, gap: 10 },
  courseName: { fontSize: 16, fontWeight: "800", textAlign: "right" },
  courseCode: { fontSize: 11, textAlign: "right" },
  msgBox: { borderRadius: 12, padding: 10, borderWidth: 1 },
  msgText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    lineHeight: 18,
  },
  groupBox: { borderRadius: 12, padding: 10, borderWidth: 1, gap: 4 },
  groupRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  groupLabel: { fontSize: 12, fontWeight: "700" },
  groupName: { fontSize: 11, textAlign: "right" },
  metaRow: { flexDirection: "row", gap: 16, justifyContent: "flex-end" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11 },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 12,
  },
  joinText: { fontSize: 13, fontWeight: "800", color: T.white },
  waitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  waitText: { fontSize: 11, color: "#A16207", fontWeight: "600" },
});

// ── Empty State ───────────────────────────────────────────────────
function EmptyState({
  onBrowse,
  colors,
}: {
  onBrowse: () => void;
  colors: AppColors;
}) {
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [float]);

  return (
    <View style={{ alignItems: "center", paddingVertical: 56, gap: 16 }}>
      <Animated.View
        style={[
          {
            width: 110,
            height: 110,
            borderRadius: 30,
            backgroundColor: colors.teal + "15",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: colors.teal + "25",
          },
          { transform: [{ translateY: float }] },
        ]}
      >
        <IconSchool size={52} color={colors.teal2} strokeWidth={1.1} />
      </Animated.View>

      <View style={{ alignItems: "center", gap: 6 }}>
        <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
          لا توجد تسجيلات بعد
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: colors.textMuted,
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          لم تسجل في أي دورة بعد. ابدأ رحلتك التعليمية اليوم!
        </Text>
      </View>

      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: colors.teal,
          borderRadius: 16,
          paddingHorizontal: 24,
          paddingVertical: 14,
          shadowColor: colors.teal,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 6,
        }}
        onPress={onBrowse}
        activeOpacity={0.85}
      >
        <IconSchool size={18} color={T.white} strokeWidth={2} />
        <Text style={{ fontSize: 14, fontWeight: "800", color: T.white }}>
          تصفح الدورات
        </Text>
        <IconArrowRight size={16} color={colors.gold} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const jb = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  title: { fontSize: 14, fontWeight: "800" },
  sub: { fontSize: 11, marginTop: 2 },
});

// ── Main ──────────────────────────────────────────────────────────
export default function EnrollmentsScreen({
  onNavigateCourses,
}: {
  onNavigateCourses?: () => void;
}) {
  const router = useRouter();
  const { colors } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [justEnrolled, setJustEnrolled] = useState(false);

  useEffect(() => {
    setJustEnrolled(true);
    const t = setTimeout(() => setJustEnrolled(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const { data, isLoading, isError, refetch } = useEnrollments();
  const enrollments: any[] = Array.isArray(data) ? data : [];

  const readyForGroup = enrollments.filter(
    (e) =>
      (e.registration_status === "VALIDATED" ||
        e.registration_status === "PAID") &&
      !e.group_id,
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
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
            tintColor={colors.teal}
          />
        }
      >
        <Hero />

        {/* Loading */}
        {isLoading && (
          <View style={{ alignItems: "center", paddingVertical: 60, gap: 16 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                backgroundColor: colors.teal + "18",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="large" color={colors.teal} />
            </View>
            <Text
              style={{
                fontSize: 13,
                color: colors.textMuted,
                fontWeight: "600",
              }}
            >
              جاري تحميل التسجيلات...
            </Text>
          </View>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <View style={{ alignItems: "center", paddingVertical: 48, gap: 16 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                backgroundColor: colors.error + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconAlertCircle
                size={32}
                color={colors.error}
                strokeWidth={1.5}
              />
            </View>
            <Text
              style={{ fontSize: 15, fontWeight: "700", color: colors.text }}
            >
              فشل تحميل التسجيلات
            </Text>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: colors.teal,
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

        {/* Content */}
        {!isLoading && !isError && (
          <>
            {enrollments.length === 0 ? (
              <EmptyState
                onBrowse={() => router.push("/(student)/courses")}
                colors={colors}
              />
            ) : (
              <>
                {justEnrolled && (
                  <View
                    style={[
                      jb.banner,
                      {
                        backgroundColor: colors.teal + "15",
                        borderColor: colors.teal + "30",
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 20 }}>🎉</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[jb.title, { color: colors.teal }]}>
                        تم التسجيل بنجاح!
                      </Text>
                      <Text style={[jb.sub, { color: colors.textMuted }]}>
                        يمكنك متابعة حالة تسجيلك هنا
                      </Text>
                    </View>
                  </View>
                )}

                <StatsRow enrollments={enrollments} colors={colors} />

                {readyForGroup.length > 0 && (
                  <ReadyBanner
                    count={readyForGroup.length}
                    onPress={() => router.push("/(student)/courses")}
                  />
                )}

                {/* Section header */}
                <View style={s.listHeader}>
                  <View
                    style={[s.divider, { backgroundColor: colors.border }]}
                  />
                  <View
                    style={[
                      s.listBadge,
                      {
                        backgroundColor: colors.surfaceHigh,
                        borderColor: colors.border,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text
                      style={[s.listBadgeText, { color: colors.textMuted }]}
                    >
                      جميع التسجيلات
                    </Text>
                    <View
                      style={[s.countBadge, { backgroundColor: colors.teal2 }]}
                    >
                      <Text style={s.countText}>{enrollments.length}</Text>
                    </View>
                  </View>
                  <View
                    style={[s.divider, { backgroundColor: colors.border }]}
                  />
                </View>

                {enrollments.map((e: any, i: number) => (
                  <EnrollmentCard
                    key={e.enrollment_id}
                    enrollment={e}
                    index={i}
                    isNew={justEnrolled && i === 0}
                    onJoinGroup={() => router.push("/(student)/courses")}
                  />
                ))}
              </>
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
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  divider: { flex: 1, height: 1 },
  listBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  listBadgeText: { fontSize: 10, fontWeight: "700" },
  countBadge: { borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  countText: { fontSize: 9, fontWeight: "800", color: T.white },
});
