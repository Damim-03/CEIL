// app/(student)/courses.tsx
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
  TextInput,
  Modal,
} from "react-native";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  IconCalendar,
  IconCoin,
  IconUser,
  IconArrowLeft,
  IconAlertCircle,
  IconRefresh,
  IconInbox,
  IconSearch,
  IconLock,
  IconLockOpen,
  IconCircleCheck,
  IconSchool,
  IconX,
  IconCheck,
  IconTag,
  IconInfoCircle,
  IconChevronRight,
} from "@tabler/icons-react-native";
import {
  useCourses,
  useCourseGroups,
  useEnrollments,
  useEnroll,
  useCoursePricing,
} from "../../src/hooks/useStudent";
import { useAlert } from "../../src/hooks/useAlert";
import { useTheme } from "../../src/context/ThemeContext";
import { Colors } from "../../src/constants/theme";
import { router } from "expo-router";

const T = {
  teal: "#264230",
  teal2: "#3D6B55",
  teal3: "#1A2E22",
  gold: "#C4A035",
  cream: Colors.background,
  cream2: "#EDE8DF",
  white: "#FFFFFF",
  dark: "#111818",
  muted: "#8A9E94",
  border: "#DDD8CE",
  green: "#22C55E",
  red: "#EF4444",
  blue: "#1565C0",
  blueBg: "#DBEAFE",
};

type Step = "courses" | "levels" | "groups";
type Level = "PRE_A1" | "A1" | "A2" | "B1" | "B2" | "C1";
const LEVELS: Level[] = ["PRE_A1", "A1", "A2", "B1", "B2", "C1"];

const LEVEL_META: Record<
  Level,
  { desc: string; dots: number; color: string; bg: string; border: string }
> = {
  PRE_A1: {
    desc: "البداية من الصفر",
    dots: 1,
    color: "#6B7280",
    bg: "#F3F4F6",
    border: "#D1D5DB",
  },
  A1: {
    desc: "تواصل أساسي",
    dots: 2,
    color: "#15803D",
    bg: "#DCFCE7",
    border: "#86EFAC",
  },
  A2: {
    desc: "مواضيع يومية",
    dots: 3,
    color: "#0F6E56",
    bg: "#C8EEE0",
    border: "#5DCAA5",
  },
  B1: {
    desc: "متحدث مستقل",
    dots: 4,
    color: "#A16207",
    bg: "#FEF9C3",
    border: "#FDE047",
  },
  B2: {
    desc: "محادثات متقدمة",
    dots: 5,
    color: "#534AB7",
    bg: "#EEEDFE",
    border: "#AFA9EC",
  },
  C1: {
    desc: "إتقان شبه أصيل",
    dots: 5,
    color: "#B91C1C",
    bg: "#FEE2E2",
    border: "#FCA5A5",
  },
};

const ENROLLMENT_STATUS: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  PENDING: {
    label: "قيد الانتظار",
    color: "#A16207",
    bg: "#FEF9C3",
    dot: "#EAB308",
  },
  VALIDATED: {
    label: "مقبول",
    color: "#1565C0",
    bg: "#DBEAFE",
    dot: "#3B82F6",
  },
  PAID: { label: "مدفوع", color: "#15803D", bg: "#DCFCE7", dot: "#22C55E" },
  FINISHED: { label: "منتهي", color: "#6B7280", bg: "#F3F4F6", dot: "#9CA3AF" },
  REJECTED: { label: "مرفوض", color: "#B91C1C", bg: "#FEE2E2", dot: "#EF4444" },
};

// ── Pricing Modal (unchanged logic, refreshed UI) ─────────────────
function PricingModal({
  visible,
  onClose,
  courseId,
  courseName,
  groupName,
  onConfirm,
  isEnrolling,
}: {
  visible: boolean;
  onClose: () => void;
  courseId: string | null;
  courseName: string;
  groupName: string;
  onConfirm: (pricingId: string) => void;
  isEnrolling: boolean;
}) {
  const {
    data: profile,
    isLoading,
    isError,
  } = useCoursePricing(courseId ?? "");
  const { colors: C } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const slideY = useRef(new Animated.Value(700)).current;

  useEffect(() => {
    if (visible) {
      setSelectedId(null);
      setShowWarning(false);
      Animated.spring(slideY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else {
      Animated.timing(slideY, {
        toValue: 700,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const pricing: any[] = profile?.pricing ?? [];
  const selected = pricing.find((p) => p.pricing_id === selectedId);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={pm.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          activeOpacity={1}
        />
        <Animated.View
          style={[
            pm.sheet,
            {
              backgroundColor: C.background,
              transform: [{ translateY: slideY }],
            },
          ]}
        >
          <View style={pm.handle} />
          <View style={[pm.header, { borderBottomColor: C.border }]}>
            <TouchableOpacity
              style={[pm.closeBtn, { backgroundColor: C.cream2 }]}
              onPress={onClose}
            >
              <IconX size={18} color={T.muted} strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={[pm.title, { color: C.text }]}>
                التسعيرة والمعلومات
              </Text>
              <Text style={[pm.sub, { color: C.textMuted }]} numberOfLines={1}>
                {courseName} — {groupName}
              </Text>
            </View>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={pm.scroll}
          >
            {isLoading && (
              <View style={pm.center}>
                <ActivityIndicator size="large" color={T.teal} />
              </View>
            )}
            {isError && !isLoading && (
              <View style={pm.center}>
                <IconAlertCircle size={44} color={T.red} strokeWidth={1.2} />
                <Text style={pm.errorText}>فشل تحميل التسعيرات</Text>
              </View>
            )}
            {!isLoading && !isError && profile && (
              <>
                <View style={pm.courseCard}>
                  {profile.flag_emoji && (
                    <Text style={pm.flag}>{profile.flag_emoji}</Text>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={pm.courseName}>
                      {profile.title_ar || profile.course?.course_name}
                    </Text>
                    {(profile.start_date || profile.end_date) && (
                      <View style={pm.dateRow}>
                        <IconCalendar
                          size={12}
                          color={T.gold}
                          strokeWidth={2}
                        />
                        <Text style={pm.dateText}>
                          {profile.start_date
                            ? new Date(profile.start_date).toLocaleDateString(
                                "ar-DZ",
                              )
                            : "—"}
                          {" — "}
                          {profile.end_date
                            ? new Date(profile.end_date).toLocaleDateString(
                                "ar-DZ",
                              )
                            : "—"}
                        </Text>
                      </View>
                    )}
                    {profile.description_ar && (
                      <Text style={pm.desc} numberOfLines={2}>
                        {profile.description_ar}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={pm.sectionRow}>
                  <IconCoin size={18} color={T.teal2} strokeWidth={2} />
                  <Text style={[pm.sectionTitle, { color: C.text }]}>
                    اختر فئتك
                  </Text>
                </View>
                {showWarning && (
                  <View style={pm.warning}>
                    <IconAlertCircle
                      size={14}
                      color="#A16207"
                      strokeWidth={2}
                    />
                    <Text style={pm.warningText}>
                      يرجى اختيار فئة قبل المتابعة
                    </Text>
                  </View>
                )}
                {pricing.length === 0 ? (
                  <View style={[pm.noPricing, { backgroundColor: C.cream2 }]}>
                    <IconCoin size={36} color={T.gold} strokeWidth={1.3} />
                    <Text style={[pm.noPricingTitle, { color: C.text }]}>
                      لا توجد تسعيرات متاحة
                    </Text>
                  </View>
                ) : (
                  pricing.map((p: any, i: number) => {
                    const isSelected = selectedId === p.pricing_id;
                    return (
                      <TouchableOpacity
                        key={p.pricing_id}
                        style={[
                          pm.pricingCard,
                          { backgroundColor: C.surface, borderColor: C.border },
                          isSelected && pm.pricingCardSelected,
                        ]}
                        onPress={() => {
                          setSelectedId(p.pricing_id);
                          setShowWarning(false);
                        }}
                        activeOpacity={0.85}
                      >
                        <View
                          style={[pm.radio, isSelected && pm.radioSelected]}
                        >
                          {isSelected && <View style={pm.radioDot} />}
                        </View>
                        <View
                          style={[
                            pm.numBadge,
                            { backgroundColor: C.cream2 },
                            isSelected && pm.numBadgeSelected,
                          ]}
                        >
                          <Text
                            style={[
                              pm.numText,
                              { color: C.textMuted },
                              isSelected && { color: T.white },
                            ]}
                          >
                            {i + 1}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              pm.pricingName,
                              { color: C.text },
                              isSelected && { color: T.blue },
                            ]}
                          >
                            {p.status_fr}
                          </Text>
                          {p.status_ar && (
                            <Text
                              style={[pm.pricingNameAr, { color: C.textMuted }]}
                            >
                              {p.status_ar}
                            </Text>
                          )}
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text
                            style={[
                              pm.price,
                              { color: C.text },
                              isSelected && { color: T.blue },
                            ]}
                          >
                            {Number(p.price).toLocaleString()} {p.currency}
                          </Text>
                          {p.discount && p.discount !== "Aucune" && (
                            <View style={pm.discountBadge}>
                              <IconTag
                                size={10}
                                color={T.white}
                                strokeWidth={2}
                              />
                              <Text style={pm.discountText}>{p.discount}</Text>
                            </View>
                          )}
                        </View>
                        {isSelected && (
                          <View style={pm.selectedCheck}>
                            <IconCheck
                              size={10}
                              color={T.white}
                              strokeWidth={3}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
                {selected && (
                  <View style={pm.summary}>
                    <IconCircleCheck
                      size={16}
                      color={T.green}
                      strokeWidth={2.5}
                    />
                    <Text style={pm.summaryText}>
                      {selected.status_fr}
                      {selected.status_ar ? ` — ${selected.status_ar}` : ""}
                    </Text>
                    <Text style={pm.summaryPrice}>
                      {Number(selected.price).toLocaleString()}{" "}
                      {selected.currency}
                    </Text>
                  </View>
                )}
                <View style={pm.note}>
                  <IconInfoCircle size={16} color={T.blue} strokeWidth={2} />
                  <Text style={pm.noteText}>
                    بعد التسجيل، ستتم مراجعة فئتك من قِبَل الإدارة وتأكيد
                    المبلغ.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          <View style={[pm.footer, { borderTopColor: C.border }]}>
            <TouchableOpacity
              style={[pm.cancelBtn, { borderColor: C.border }]}
              onPress={onClose}
              disabled={isEnrolling}
            >
              <Text style={[pm.cancelText, { color: C.textMuted }]}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                pm.confirmBtn,
                (!selectedId || isEnrolling || pricing.length === 0) &&
                  pm.confirmBtnDisabled,
              ]}
              onPress={() => {
                if (!selectedId) {
                  setShowWarning(true);
                  return;
                }
                onConfirm(selectedId);
              }}
              disabled={!selectedId || isEnrolling || pricing.length === 0}
              activeOpacity={0.85}
            >
              {isEnrolling ? (
                <ActivityIndicator size="small" color={T.teal} />
              ) : (
                <>
                  <IconCircleCheck size={16} color={T.teal} strokeWidth={2.5} />
                  <Text style={pm.confirmText}>
                    {selectedId && selected
                      ? `تأكيد — ${Number(selected.price).toLocaleString()} ${selected.currency}`
                      : "اختر فئة أولاً"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const pm = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "92%",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.border,
    alignSelf: "center",
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "800" },
  sub: { fontSize: 11, marginTop: 2 },
  scroll: { padding: 20, gap: 12, paddingBottom: 8 },
  center: { alignItems: "center", paddingVertical: 40, gap: 12 },
  errorText: { fontSize: 14, color: T.red, fontWeight: "700" },
  courseCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: T.teal3 + "EE",
    borderRadius: 18,
    padding: 14,
    marginBottom: 4,
  },
  flag: { fontSize: 32 },
  courseName: {
    fontSize: 15,
    fontWeight: "800",
    color: T.white,
    textAlign: "right",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "flex-end",
    marginTop: 4,
  },
  dateText: { fontSize: 10, color: "rgba(255,255,255,0.6)" },
  desc: {
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    textAlign: "right",
    marginTop: 4,
    lineHeight: 16,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800" },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF9C3",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FDE047",
  },
  warningText: { fontSize: 12, color: "#A16207", fontWeight: "600", flex: 1 },
  noPricing: {
    alignItems: "center",
    borderRadius: 18,
    padding: 24,
    gap: 8,
  },
  noPricingTitle: { fontSize: 15, fontWeight: "800" },
  pricingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    position: "relative",
  },
  pricingCardSelected: {
    borderColor: T.blue,
    backgroundColor: T.blueBg + "40",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: T.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: T.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.blue },
  numBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  numBadgeSelected: { backgroundColor: T.blue },
  numText: { fontSize: 14, fontWeight: "800" },
  pricingName: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },
  pricingNameAr: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 1,
  },
  price: { fontSize: 16, fontWeight: "800" },
  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: T.red,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  discountText: { fontSize: 9, fontWeight: "700", color: T.white },
  selectedCheck: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: T.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#DCFCE7",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  summaryText: { fontSize: 12, fontWeight: "600", color: "#15803D", flex: 1 },
  summaryPrice: { fontSize: 14, fontWeight: "800", color: "#15803D" },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: T.blueBg + "60",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#93C5FD",
  },
  noteText: {
    fontSize: 11,
    color: T.blue,
    lineHeight: 18,
    flex: 1,
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
  },
  cancelText: { fontSize: 14, fontWeight: "700" },
  confirmBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: T.gold,
    borderRadius: 16,
    paddingVertical: 14,
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmText: { fontSize: 13, fontWeight: "800", color: T.teal },
});

// ── Hero Header (Step indicator) ──────────────────────────────────
function HeroHeader({
  step,
  courseName,
  level,
  onBack,
}: {
  step: Step;
  courseName?: string;
  level?: Level;
  onBack?: () => void;
}) {
  const steps = ["courses", "levels", "groups"];
  const stepIdx = steps.indexOf(step);
  const stepLabels = ["الدورات", "المستوى", "المجموعة"];
  const titles: Record<Step, string> = {
    courses: "تصفح الدورات",
    levels: "اختر المستوى",
    groups: "اختر المجموعة",
  };

  return (
    <View style={hh.card}>
      <View style={hh.geo1} />
      <View style={hh.geo2} />

      {/* Step breadcrumb */}
      <View style={hh.breadcrumb}>
        {stepLabels.map((l, i) => (
          <View key={l} style={hh.breadcrumbItem}>
            <View style={[hh.stepDot, i <= stepIdx && hh.stepDotActive]}>
              <Text style={[hh.stepNum, i <= stepIdx && hh.stepNumActive]}>
                {i + 1}
              </Text>
            </View>
            <Text style={[hh.stepLabel, i <= stepIdx && hh.stepLabelActive]}>
              {l}
            </Text>
            {i < 2 && (
              <View style={[hh.stepLine, i < stepIdx && hh.stepLineActive]} />
            )}
          </View>
        ))}
      </View>

      {/* Title row */}
      <View style={hh.row}>
        {step !== "courses" ? (
          <TouchableOpacity
            style={hh.backBtn}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <IconArrowLeft size={18} color={T.gold} strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <View style={hh.iconWrap}>
            <IconSchool size={22} color={T.gold} strokeWidth={1.5} />
          </View>
        )}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={hh.label}>CEIL — مركز التعليم المكثّف</Text>
          <Text style={hh.title}>{titles[step]}</Text>
          {step === "levels" && courseName && (
            <Text style={hh.sub}>{courseName}</Text>
          )}
          {step === "groups" && level && (
            <Text style={hh.sub}>
              {level} • {LEVEL_META[level].desc}
            </Text>
          )}
        </View>
        <View style={{ width: 44 }} />
      </View>
    </View>
  );
}

const hh = StyleSheet.create({
  card: {
    backgroundColor: T.teal3,
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: T.teal3,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  geo1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: T.teal2,
    opacity: 0.25,
    top: -60,
    left: -50,
  },
  geo2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: T.gold,
    opacity: 0.05,
    bottom: -20,
    right: 10,
  },

  breadcrumb: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  breadcrumbItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  stepDotActive: { backgroundColor: T.gold },
  stepNum: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.4)" },
  stepNumActive: { color: T.teal3 },
  stepLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.35)",
    fontWeight: "600",
  },
  stepLabelActive: { color: "rgba(255,255,255,0.75)" },
  stepLine: {
    width: 20,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 2,
  },
  stepLineActive: { backgroundColor: T.gold + "60" },

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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 9,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: T.white,
    letterSpacing: 0.3,
  },
  sub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    marginTop: 2,
    fontWeight: "600",
  },
});

// ── Course Card (Bento style from HTML) ───────────────────────────
function CourseCard({
  course,
  onPress,
  index,
  enrolled,
}: {
  course: any;
  onPress: () => void;
  index: number;
  enrolled?: any;
}) {
  const { colors: C } = useTheme();
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
  }, []);

  const status = enrolled
    ? (ENROLLMENT_STATUS[enrolled.registration_status] ??
      ENROLLMENT_STATUS.PENDING)
    : null;

  return (
    <Animated.View
      style={{
        opacity: fadeIn,
        transform: [{ translateY: slideY }],
        marginBottom: 12,
      }}
    >
      <TouchableOpacity
        style={[cc.card, { backgroundColor: C.surface, borderColor: C.border }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Left accent bar */}
        <View style={cc.accent} />

        <View style={cc.body}>
          {/* Flag + info */}
          <View style={cc.top}>
            <View
              style={[
                cc.flagWrap,
                { backgroundColor: C.background, borderColor: C.border },
              ]}
            >
              <Text style={cc.flag}>{course?.profile?.flag_emoji ?? "🌐"}</Text>
            </View>
            <View style={cc.info}>
              <Text style={[cc.name, { color: C.text }]} numberOfLines={1}>
                {course.course_name}
              </Text>
              {course.course_code && (
                <Text style={[cc.code, { color: C.textMuted }]}>
                  {course.course_code}
                </Text>
              )}
            </View>
            <View style={cc.right}>
              {status && (
                <View style={[cc.statusBadge, { backgroundColor: status.bg }]}>
                  <View style={[cc.dot, { backgroundColor: status.dot }]} />
                  <Text style={[cc.statusText, { color: status.color }]}>
                    {status.label}
                  </Text>
                </View>
              )}
              <IconChevronRight size={16} color={T.muted} strokeWidth={2} />
            </View>
          </View>
          {course.description && (
            <Text style={[cc.desc, { color: C.textMuted }]} numberOfLines={1}>
              {course.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const cc = StyleSheet.create({
  card: {
    borderRadius: 20,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: T.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  accent: { width: 4, backgroundColor: T.teal2 },
  body: { flex: 1, padding: 14, gap: 8 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  flagWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  flag: { fontSize: 26 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "800", textAlign: "right" },
  code: { fontSize: 10, textAlign: "right", marginTop: 2 },
  right: { alignItems: "flex-end", gap: 6 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: "700" },
  desc: { fontSize: 11, textAlign: "right", lineHeight: 16 },
});

// ── Level Grid (square tiles inspired by HTML) ────────────────────
function LevelGrid({ onSelect }: { onSelect: (l: Level) => void }) {
  return (
    <View style={lg.grid}>
      {LEVELS.map((level, i) => {
        const meta = LEVEL_META[level];
        const fadeIn = new Animated.Value(0);
        return (
          <TouchableOpacity
            key={level}
            style={[
              lg.tile,
              { backgroundColor: meta.bg, borderColor: meta.border },
            ]}
            onPress={() => onSelect(level)}
            activeOpacity={0.82}
          >
            {/* Level badge */}
            <View style={[lg.badge, { backgroundColor: meta.color + "15" }]}>
              <Text style={[lg.badgeText, { color: meta.color }]}>{level}</Text>
            </View>
            {/* Desc */}
            <Text style={[lg.desc, { color: meta.color }]}>{meta.desc}</Text>
            {/* Dots */}
            <View style={lg.dots}>
              {[1, 2, 3, 4, 5].map((d) => (
                <View
                  key={d}
                  style={[
                    lg.dot,
                    { backgroundColor: d <= meta.dots ? meta.color : T.border },
                  ]}
                />
              ))}
            </View>
            {/* Arrow */}
            <View style={lg.arrow}>
              <IconChevronRight
                size={14}
                color={meta.color}
                strokeWidth={2.5}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const lg = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    width: "47%",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    gap: 8,
    position: "relative",
    minHeight: 120,
  },
  badge: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: { fontSize: 15, fontWeight: "800" },
  desc: { fontSize: 11, fontWeight: "600", textAlign: "right" },
  dots: { flexDirection: "row", gap: 4, justifyContent: "flex-end" },
  dot: { width: 5, height: 5, borderRadius: 3 },
  arrow: { position: "absolute", top: 10, left: 10 },
});

// ── Group Card (list style from HTML) ─────────────────────────────
function GroupCard({
  group,
  onEnroll,
  enrolling,
  index,
}: {
  group: any;
  onEnroll: () => void;
  enrolling: boolean;
  index: number;
}) {
  const { colors: C } = useTheme();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideX = useRef(new Animated.Value(-20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideX, {
        toValue: 0,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isFull = group.current_capacity >= group.max_students;
  const isClosed = group.status === "CLOSED";
  const isOpen = !isFull && !isClosed;
  const pct = Math.min(
    (group.current_capacity / group.max_students) * 100,
    100,
  );
  const available = group.max_students - group.current_capacity;
  const barColor = pct >= 100 ? T.red : pct >= 80 ? T.gold : T.teal2;

  return (
    <Animated.View
      style={{
        opacity: fadeIn,
        transform: [{ translateX: slideX }],
        marginBottom: 12,
      }}
    >
      <View
        style={[
          gc.card,
          { backgroundColor: C.surface, borderColor: C.border },
          !isOpen && { opacity: 0.72 },
        ]}
      >
        {/* Left color bar */}
        <View
          style={[
            gc.bar,
            { backgroundColor: isOpen ? T.teal : isFull ? T.red : T.muted },
          ]}
        />

        <View style={gc.body}>
          {/* Header */}
          <View style={gc.header}>
            <View style={gc.nameRow}>
              <Text style={[gc.name, { color: C.text }]} numberOfLines={1}>
                {group.name}
              </Text>
              <View
                style={[
                  gc.statusPill,
                  {
                    backgroundColor: isClosed
                      ? "#F3F4F6"
                      : isFull
                        ? "#FEE2E2"
                        : "#DCFCE7",
                  },
                ]}
              >
                {isClosed ? (
                  <IconLock size={9} color="#6B7280" strokeWidth={2} />
                ) : isFull ? (
                  <IconLock size={9} color={T.red} strokeWidth={2} />
                ) : (
                  <IconLockOpen size={9} color={T.green} strokeWidth={2} />
                )}
                <Text
                  style={[
                    gc.statusText,
                    {
                      color: isClosed ? "#6B7280" : isFull ? T.red : "#15803D",
                    },
                  ]}
                >
                  {isClosed ? "مغلق" : isFull ? "ممتلئ" : "مفتوح"}
                </Text>
              </View>
            </View>
            <View style={gc.teacher}>
              <IconUser size={12} color={T.teal2} strokeWidth={2} />
              <Text style={[gc.teacherText, { color: C.textMuted }]}>
                {group.teacher
                  ? `${group.teacher.first_name} ${group.teacher.last_name}`
                  : "غير محدد"}
              </Text>
            </View>
          </View>

          {/* Capacity */}
          <View style={[gc.cap, { backgroundColor: C.background }]}>
            <View style={gc.capRow}>
              <Text style={[gc.capVal, { color: C.text }]}>
                {group.current_capacity} / {group.max_students}
              </Text>
              <Text style={[gc.capLabel, { color: C.textMuted }]}>السعة</Text>
            </View>
            <View style={gc.barBg}>
              <View
                style={[
                  gc.barFill,
                  { width: `${pct}%`, backgroundColor: barColor },
                ]}
              />
            </View>
            <Text
              style={[gc.seats, { color: available <= 0 ? T.red : T.muted }]}
            >
              {available <= 0
                ? "لا توجد مقاعد متاحة"
                : `${available} مقعد متاح`}
            </Text>
          </View>

          {/* Enroll button */}
          <TouchableOpacity
            style={[gc.btn, !isOpen && gc.btnDisabled]}
            onPress={onEnroll}
            disabled={!isOpen || enrolling}
            activeOpacity={0.85}
          >
            {enrolling ? (
              <ActivityIndicator size="small" color={T.white} />
            ) : isOpen ? (
              <>
                <IconCircleCheck size={15} color={T.white} strokeWidth={2.2} />
                <Text style={gc.btnText}>التسجيل في هذه المجموعة</Text>
              </>
            ) : (
              <>
                <IconLock size={15} color={T.muted} strokeWidth={2} />
                <Text style={[gc.btnText, { color: T.muted }]}>
                  {isClosed ? "المجموعة مغلقة" : "المجموعة ممتلئة"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const gc = StyleSheet.create({
  card: {
    borderRadius: 20,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: T.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  bar: { width: 4 },
  body: { flex: 1, padding: 14, gap: 10 },
  header: { gap: 4 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
    textAlign: "right",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    marginLeft: 8,
  },
  statusText: { fontSize: 9, fontWeight: "700" },
  teacher: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "flex-end",
  },
  teacherText: { fontSize: 11, fontWeight: "600" },
  cap: { borderRadius: 12, padding: 10, gap: 5 },
  capRow: { flexDirection: "row", justifyContent: "space-between" },
  capLabel: { fontSize: 10, fontWeight: "600" },
  capVal: { fontSize: 13, fontWeight: "800" },
  barBg: {
    height: 5,
    backgroundColor: T.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: { height: 5, borderRadius: 3 },
  seats: { fontSize: 10, fontWeight: "600", textAlign: "right" },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.teal,
    borderRadius: 14,
    paddingVertical: 12,
  },
  btnDisabled: { backgroundColor: T.cream2 },
  btnText: { fontSize: 13, fontWeight: "800", color: T.white },
});

// ── Search bar ────────────────────────────────────────────────────
function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (t: string) => void;
  placeholder: string;
}) {
  const { colors: C } = useTheme();
  return (
    <View
      style={[sb.wrap, { backgroundColor: C.surface, borderColor: C.border }]}
    >
      <IconSearch size={16} color={T.muted} strokeWidth={2} />
      <TextInput
        style={[sb.input, { color: C.text }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.textMuted}
      />
    </View>
  );
}
const sb = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 0.5,
    borderColor: T.border,
    marginBottom: 14,
  },
  input: { flex: 1, fontSize: 13, textAlign: "right" },
});

function SectionLabel({ text, count }: { text: string; count: number }) {
  const { colors: C } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 14,
      }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          backgroundColor: C.cream2,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 20,
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: "700", color: C.textMuted }}>
          {text}
        </Text>
        <View
          style={{
            backgroundColor: T.teal2,
            borderRadius: 10,
            paddingHorizontal: 6,
            paddingVertical: 1,
          }}
        >
          <Text style={{ fontSize: 9, fontWeight: "800", color: T.white }}>
            {count}
          </Text>
        </View>
      </View>
      <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
    </View>
  );
}

function EmptyState({ title, sub }: { title: string; sub: string }) {
  const { colors: C } = useTheme();
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
  }, []);
  return (
    <View style={{ alignItems: "center", paddingVertical: 48 }}>
      <Animated.View
        style={[
          {
            width: 88,
            height: 88,
            borderRadius: 24,
            backgroundColor: T.teal + "10",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            borderWidth: 1.5,
            borderColor: T.teal + "18",
          },
          { transform: [{ translateY: float }] },
        ]}
      >
        <IconInbox size={42} color={T.teal2} strokeWidth={1.2} />
      </Animated.View>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "800",
          color: C.text,
          marginBottom: 6,
        }}
      >
        {title}
      </Text>
      <Text style={{ fontSize: 12, color: C.textMuted, textAlign: "center" }}>
        {sub}
      </Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────
export default function CoursesScreen() {
  const { colors } = useTheme();
  const alert = useAlert();
  const [step, setStep] = useState<Step>("courses");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [pricingVisible, setPricingVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: coursesRaw,
    isLoading: cLoading,
    isError: cError,
    refetch: cRefetch,
  } = useCourses();
  const {
    data: enrollments,
    isLoading: eLoading,
    refetch: eRefetch,
  } = useEnrollments();
  const { data: groupsRaw, isLoading: gLoading } = useCourseGroups(
    selectedCourse?.course_id ?? "",
  );
  const enrollMutation = useEnroll();

  const courses: any[] = Array.isArray(coursesRaw) ? coursesRaw : [];
  const enrolled: any[] = Array.isArray(enrollments) ? enrollments : [];
  const groups: any[] = Array.isArray(groupsRaw) ? groupsRaw : [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([cRefetch(), eRefetch()]);
    setRefreshing(false);
  }, [cRefetch, eRefetch]);

  const handleSelectCourse = (course: any) => {
    const existing = enrolled.find(
      (e: any) => e.course_id === course.course_id,
    );
    if (existing) {
      router.push("/(student)/enrollments");
      return;
    }
    setSelectedCourse(course);
    setStep("levels");
    setSearch("");
  };

  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    setStep("groups");
    setSearch("");
  };

  const handleBack = () => {
    if (step === "groups") {
      setStep("levels");
      setSelectedLevel(null);
    } else if (step === "levels") {
      setStep("courses");
      setSelectedCourse(null);
    }
    setSearch("");
  };

  const handleGroupPress = (group: any) => {
    setSelectedGroup(group);
    setPricingVisible(true);
  };

  const handleConfirmEnroll = (pricingId: string) => {
    if (!selectedCourse || !selectedGroup) return;
    setEnrollingId(selectedGroup.group_id);
    enrollMutation.mutate(
      {
        course_id: selectedCourse.course_id,
        group_id: selectedGroup.group_id,
        pricing_id: pricingId,
      },
      {
        onSuccess: () => {
          setEnrollingId(null);
          setPricingVisible(false);
          setStep("courses");
          setSelectedCourse(null);
          setSelectedLevel(null);
          setSelectedGroup(null);
          eRefetch();
          alert.success(
            "تم التسجيل بنجاح! 🎉",
            `تم تسجيلك في ${selectedGroup.name}`,
          );
          setTimeout(() => router.push("/(student)/enrollments"), 800);
        },
        onError: (e: any) => {
          setEnrollingId(null);
          alert.error(
            "فشل التسجيل",
            e?.response?.data?.message || "حاول مرة أخرى",
          );
        },
      },
    );
  };

  const filteredCourses = courses.filter((c) =>
    c.course_name?.toLowerCase().includes(search.toLowerCase()),
  );
  const levelGroups = groups.filter((g: any) => g.level === selectedLevel);
  const filteredGroups = levelGroups.filter((g: any) =>
    g.name?.toLowerCase().includes(search.toLowerCase()),
  );

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
        <HeroHeader
          step={step}
          courseName={selectedCourse?.course_name}
          level={selectedLevel ?? undefined}
          onBack={handleBack}
        />

        {step === "courses" && (
          <>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="ابحث عن دورة..."
            />
            {(cLoading || eLoading) && (
              <ActivityIndicator
                size="large"
                color={T.teal}
                style={{ marginTop: 40 }}
              />
            )}
            {cError && !cLoading && (
              <View
                style={{ alignItems: "center", gap: 12, paddingVertical: 40 }}
              >
                <IconAlertCircle size={44} color={T.muted} strokeWidth={1.2} />
                <Text
                  style={{ color: T.muted, fontWeight: "600", fontSize: 14 }}
                >
                  فشل تحميل الدورات
                </Text>
                <TouchableOpacity style={s.retryBtn} onPress={() => cRefetch()}>
                  <IconRefresh size={15} color={T.white} strokeWidth={2} />
                  <Text style={s.retryText}>إعادة المحاولة</Text>
                </TouchableOpacity>
              </View>
            )}
            {!cLoading &&
              !eLoading &&
              !cError &&
              filteredCourses.length === 0 && (
                <EmptyState
                  title="لا توجد دورات"
                  sub="لا توجد دورات متاحة حالياً"
                />
              )}
            {!cLoading &&
              !eLoading &&
              !cError &&
              filteredCourses.length > 0 && (
                <>
                  <SectionLabel
                    text="الدورات المتاحة"
                    count={filteredCourses.length}
                  />
                  {filteredCourses.map((course: any, i: number) => (
                    <CourseCard
                      key={course.course_id}
                      course={course}
                      index={i}
                      onPress={() => handleSelectCourse(course)}
                      enrolled={enrolled.find(
                        (e: any) => e.course_id === course.course_id,
                      )}
                    />
                  ))}
                </>
              )}
          </>
        )}

        {step === "levels" && (
          <>
            <SectionLabel text="المستويات" count={LEVELS.length} />
            <LevelGrid onSelect={handleSelectLevel} />
          </>
        )}

        {step === "groups" && (
          <>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="ابحث عن مجموعة..."
            />
            {gLoading && (
              <ActivityIndicator
                size="large"
                color={T.teal}
                style={{ marginTop: 40 }}
              />
            )}
            {!gLoading && filteredGroups.length === 0 && (
              <EmptyState
                title="لا توجد مجموعات"
                sub="لا توجد مجموعات لهذا المستوى"
              />
            )}
            {!gLoading && filteredGroups.length > 0 && (
              <>
                <SectionLabel
                  text="المجموعات المتاحة"
                  count={filteredGroups.length}
                />
                {filteredGroups.map((group: any, i: number) => (
                  <GroupCard
                    key={group.group_id}
                    group={group}
                    index={i}
                    enrolling={enrollingId === group.group_id}
                    onEnroll={() => handleGroupPress(group)}
                  />
                ))}
              </>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <PricingModal
        visible={pricingVisible}
        onClose={() => {
          setPricingVisible(false);
          setSelectedGroup(null);
        }}
        courseId={selectedCourse?.course_id ?? null}
        courseName={selectedCourse?.course_name ?? ""}
        groupName={selectedGroup?.name ?? ""}
        onConfirm={handleConfirmEnroll}
        isEnrolling={!!enrollingId}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 20,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: T.teal,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: { fontSize: 14, fontWeight: "700", color: T.white },
});
