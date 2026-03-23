// app/(student)/settings.tsx
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Switch,
  Linking,
  Animated,
  Alert,
  Modal,
  Pressable,
  ScrollView as RNScrollView,
} from "react-native";
import { useRef, useEffect, useState } from "react";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import {
  IconBell,
  IconSchool,
  IconWorld,
  IconFileText,
  IconShieldLock,
  IconLogout,
  IconChevronRight,
  IconMoon,
  IconSun,
  IconDeviceMobile,
} from "@tabler/icons-react-native";

// ── Terms & Privacy Data ──────────────────────────────────────────
const TERMS_SECTIONS = [
  {
    icon: "📋",
    title: "شروط الالتحاق",
    items: [
      "يجب أن يكون المتقدم طالباً مسجلاً في الجامعة أو موظفاً رسمياً.",
      "يُشترط تقديم ملف كامل يضم جميع الوثائق المطلوبة.",
      "لا يُسمح بالتسجيل في أكثر من دورة واحدة في نفس الوقت.",
      "يحق للمركز رفض الطلب في حال عدم استيفاء الشروط دون إبداء الأسباب.",
    ],
  },
  {
    icon: "⚠️",
    title: "الالتزامات والتحذيرات",
    items: [
      "الغياب بدون عذر مقبول يؤدي إلى الاستبعاد من الدورة.",
      "نسبة الحضور الدنيا المطلوبة هي 75% من مجموع الحصص.",
      "لا تُردّ الرسوم في حال الانسحاب بعد بدء الدورة.",
      "أي تصرف مخالف لنظام المركز يستوجب المساءلة الإدارية.",
    ],
  },
  {
    icon: "📝",
    title: "ملاحظات مهمة",
    items: [
      "يتحمل الطالب مسؤولية متابعة الجدول الزمني والإعلانات.",
      "يجب الحفاظ على وثيقة التسجيل طوال فترة الدورة.",
      "يخضع النظام للتعديل من قِبَل إدارة المركز دون إشعار مسبق.",
    ],
  },
];

const PRIVACY_SECTIONS = [
  {
    icon: "🔒",
    title: "جمع البيانات",
    items: [
      "نجمع المعلومات الشخصية الضرورية فقط لتقديم خدمات المركز.",
      "تشمل البيانات: الاسم، رقم التسجيل، البريد الإلكتروني، الهاتف.",
      "لا نجمع أي بيانات حساسة تتجاوز نطاق الخدمة التعليمية.",
    ],
  },
  {
    icon: "🛡️",
    title: "حماية البيانات",
    items: [
      "تُخزَّن بياناتك بأمان وفق معايير حماية المعلومات المعتمدة.",
      "لا نشارك بياناتك مع أطراف ثالثة إلا بموافقتك الصريحة.",
      "يمكنك طلب حذف بياناتك في أي وقت عبر التواصل مع الإدارة.",
    ],
  },
  {
    icon: "📱",
    title: "استخدام التطبيق",
    items: [
      "يجمع التطبيق بيانات الاستخدام لتحسين تجربة المستخدم فقط.",
      "لا يُستخدم التطبيق لأغراض تجارية أو دعائية.",
      "بيانات الجلسة تُحذف تلقائياً عند تسجيل الخروج.",
    ],
  },
];

// ── Docs Modal ────────────────────────────────────────────────────
function DocsModal({
  visible,
  onClose,
  title,
  sections,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  sections: { icon: string; title: string; items: string[] }[];
}) {
  const { colors } = useTheme();
  const slideY = useRef(new Animated.Value(800)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideY, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideY, {
          toValue: 800,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View style={[dm.backdrop, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          dm.sheet,
          {
            backgroundColor: colors.background,
            transform: [{ translateY: slideY }],
          },
        ]}
      >
        {/* Header */}
        <View
          style={[
            dm.header,
            {
              borderBottomColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <TouchableOpacity
            style={[dm.closeBtn, { backgroundColor: colors.cream2 }]}
            onPress={onClose}
            activeOpacity={0.75}
          >
            <Text style={[dm.closeBtnText, { color: colors.textMuted }]}>
              ✕
            </Text>
          </TouchableOpacity>
          <View style={dm.headerCenter}>
            <Text style={[dm.headerTitle, { color: colors.text }]}>
              {title}
            </Text>
            <Text style={[dm.headerSub, { color: colors.textMuted }]}>
              CEIL El-Oued · {sections.length} أقسام
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Content */}
        <RNScrollView
          style={{ flex: 1 }}
          contentContainerStyle={dm.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section, si) => (
            <View
              key={si}
              style={[
                dm.section,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {/* Section header */}
              <View style={dm.sectionHeader}>
                <View
                  style={[
                    dm.sectionIconWrap,
                    { backgroundColor: colors.teal + "15" },
                  ]}
                >
                  <Text style={{ fontSize: 18 }}>{section.icon}</Text>
                </View>
                <Text style={[dm.sectionTitle, { color: colors.text }]}>
                  {section.title}
                </Text>
              </View>
              {/* Items */}
              {section.items.map((item, ii) => (
                <View
                  key={ii}
                  style={[
                    dm.item,
                    ii < section.items.length - 1 && {
                      borderBottomColor: colors.borderLight,
                      borderBottomWidth: 1,
                    },
                  ]}
                >
                  <View
                    style={[dm.itemDot, { backgroundColor: colors.teal }]}
                  />
                  <Text style={[dm.itemText, { color: colors.textMuted }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          {/* Footer note */}
          <View
            style={[
              dm.footerNote,
              {
                backgroundColor: colors.teal + "10",
                borderColor: colors.teal + "25",
              },
            ]}
          >
            <Text style={{ fontSize: 16 }}>ℹ️</Text>
            <Text style={[dm.footerNoteText, { color: colors.teal }]}>
              للاستفسار أو الاعتراض على أي بند، تواصل مع إدارة المركز مباشرةً.
            </Text>
          </View>

          <View style={{ height: Platform.OS === "ios" ? 34 : 16 }} />
        </RNScrollView>
      </Animated.View>
    </Modal>
  );
}

const dm = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  headerSub: { fontSize: 10, marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: { fontSize: 14, fontWeight: "600" },
  scrollContent: { padding: 16, gap: 12 },
  section: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    justifyContent: "flex-end",
  },
  sectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
    flex: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "flex-end",
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  itemText: { fontSize: 13, textAlign: "right", lineHeight: 20, flex: 1 },
  footerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  footerNoteText: { fontSize: 12, lineHeight: 18, flex: 1, textAlign: "right" },
});

// ── Hero ──────────────────────────────────────────────────────────
function Hero() {
  const { colors } = useTheme();
  return (
    <View style={[hr.card, { backgroundColor: colors.teal3 }]}>
      <View style={hr.ring1} />
      <View style={hr.ring2} />
      <View style={[hr.goldLine, { backgroundColor: colors.gold }]} />
      <View style={hr.row}>
        <View style={hr.iconWrap}>
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={hr.label}>CEIL</Text>
          <Text style={hr.title}>الإعدادات</Text>
          <Text style={hr.sub}>تخصيص التطبيق وإدارة الحساب</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>
    </View>
  );
}
const hr = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 24,
    overflow: "hidden",
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
    backgroundColor: "#3D6B55",
    opacity: 0.25,
    top: -60,
    left: -50,
  },
  ring2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#C4A035",
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
  title: { fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
  sub: { fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 },
});

// ── Theme Selector ────────────────────────────────────────────────
function ThemeSelector() {
  const { colors, mode, setMode, isDark } = useTheme();

  const options: {
    key: "light" | "dark" | "system";
    Icon: any;
    label: string;
  }[] = [
    { key: "light", Icon: IconSun, label: "فاتح" },
    { key: "dark", Icon: IconMoon, label: "داكن" },
    { key: "system", Icon: IconDeviceMobile, label: "تلقائي" },
  ];

  return (
    <View
      style={[
        ts.wrap,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={ts.headerRow}>
        <View style={[ts.iconWrap, { backgroundColor: colors.teal + "15" }]}>
          {isDark ? (
            <IconMoon size={18} color={colors.teal} strokeWidth={1.8} />
          ) : (
            <IconSun size={18} color={colors.teal} strokeWidth={1.8} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[ts.label, { color: colors.text }]}>مظهر التطبيق</Text>
          <Text style={[ts.sub, { color: colors.textMuted }]}>
            {mode === "light"
              ? "الوضع الفاتح"
              : mode === "dark"
                ? "الوضع الداكن"
                : "يتبع إعداد الهاتف"}
          </Text>
        </View>
      </View>

      <View style={ts.pills}>
        {options.map((o) => {
          const active = mode === o.key;
          return (
            <TouchableOpacity
              key={o.key}
              style={[
                ts.pill,
                { borderColor: active ? colors.teal : colors.border },
                active && { backgroundColor: colors.teal + "12" },
              ]}
              onPress={() => setMode(o.key)}
              activeOpacity={0.75}
            >
              <o.Icon
                size={14}
                color={active ? colors.teal : colors.textMuted}
                strokeWidth={2}
              />
              <Text
                style={[
                  ts.pillText,
                  { color: active ? colors.teal : colors.textMuted },
                ]}
              >
                {o.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
const ts = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 14, fontWeight: "600", textAlign: "right" },
  sub: { fontSize: 11, textAlign: "right", marginTop: 2 },
  pills: { flexDirection: "row", gap: 8 },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  pillText: { fontSize: 12, fontWeight: "600" },
});

// ── Section ───────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={sc.wrap}>
      <Text style={[sc.title, { color: colors.textMuted }]}>{title}</Text>
      <View
        style={[
          sc.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {children}
      </View>
    </View>
  );
}
const sc = StyleSheet.create({
  wrap: { marginBottom: 20 },
  title: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "right",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});

// ── Setting Row ───────────────────────────────────────────────────
function SettingRow({
  Icon,
  iconBg,
  iconColor,
  label,
  subtitle,
  onPress,
  showArrow = true,
  danger = false,
  right,
}: {
  Icon: any;
  iconBg: string;
  iconColor: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
  right?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[sr.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[sr.iconWrap, { backgroundColor: iconBg }]}>
        <Icon size={20} color={iconColor} strokeWidth={1.8} />
      </View>
      <View style={sr.textWrap}>
        <Text
          style={[sr.label, { color: danger ? colors.error : colors.text }]}
        >
          {label}
        </Text>
        {subtitle && (
          <Text style={[sr.sub, { color: colors.textMuted }]}>{subtitle}</Text>
        )}
      </View>
      {right ??
        (showArrow && onPress && (
          <IconChevronRight
            size={16}
            color={colors.textMuted}
            strokeWidth={2}
          />
        ))}
    </TouchableOpacity>
  );
}
const sr = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1 },
  label: { fontSize: 14, fontWeight: "600", textAlign: "right" },
  sub: { fontSize: 11, textAlign: "right", marginTop: 2 },
});

// ── About Card ────────────────────────────────────────────────────
function AboutCard() {
  const { colors } = useTheme();
  const fadeIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        ab.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: fadeIn,
        },
      ]}
    >
      <View style={ab.topRow}>
        <View
          style={[
            ab.schoolIcon,
            {
              backgroundColor: colors.teal + "12",
              borderColor: colors.teal + "20",
            },
          ]}
        >
          <IconSchool size={28} color={colors.gold} strokeWidth={1.4} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[ab.name, { color: colors.text }]}>CEIL El-Oued</Text>
          <Text style={[ab.desc, { color: colors.textMuted }]}>
            Centre d&apos;Enseignement Intensif des Langues. مركز التعليم
            المكثّف للغات بجامعة الشهيد حمّه لخضر.
          </Text>
        </View>
      </View>
      <View style={ab.grid}>
        <View style={[ab.gridItem, { backgroundColor: colors.cream2 }]}>
          <Text style={[ab.gridLabel, { color: colors.textMuted }]}>
            الإصدار
          </Text>
          <Text style={[ab.gridVal, { color: colors.teal }]}>v1.0.0</Text>
        </View>
        <View style={[ab.gridItem, { backgroundColor: colors.cream2 }]}>
          <Text style={[ab.gridLabel, { color: colors.textMuted }]}>
            الحالة
          </Text>
          <Text style={[ab.gridVal, { color: colors.teal2 }]}>موثّق ✓</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          ab.webBtn,
          { backgroundColor: colors.cream2, borderColor: colors.border },
        ]}
        onPress={() => Linking.openURL("https://ceil-eloued.com")}
        activeOpacity={0.8}
      >
        <IconWorld size={16} color={colors.teal} strokeWidth={2} />
        <Text style={[ab.webText, { color: colors.text }]}>
          زيارة الموقع الرسمي
        </Text>
        <IconChevronRight size={14} color={colors.textMuted} strokeWidth={2} />
      </TouchableOpacity>
    </Animated.View>
  );
}
const ab = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    padding: 16,
    gap: 14,
  },
  topRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  schoolIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 4,
  },
  desc: { fontSize: 11, textAlign: "right", lineHeight: 17 },
  grid: { flexDirection: "row", gap: 10 },
  gridItem: { flex: 1, borderRadius: 12, padding: 12 },
  gridLabel: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "right",
    marginBottom: 4,
  },
  gridVal: { fontSize: 14, fontWeight: "700", textAlign: "right" },
  webBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
  },
  webText: { flex: 1, fontSize: 13, fontWeight: "600", textAlign: "right" },
});

// ── Logout Button ─────────────────────────────────────────────────
function LogoutButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[
        lb.btn,
        { backgroundColor: colors.surface, borderColor: colors.error + "25" },
      ]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={[lb.iconWrap, { backgroundColor: colors.error + "10" }]}>
        <IconLogout size={20} color={colors.error} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[lb.label, { color: colors.error }]}>تسجيل الخروج</Text>
        <Text style={[lb.sub, { color: colors.textMuted }]}>
          إنهاء الجلسة الحالية
        </Text>
      </View>
      <IconChevronRight size={16} color={colors.error + "60"} strokeWidth={2} />
    </TouchableOpacity>
  );
}
const lb = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 14, fontWeight: "700", textAlign: "right" },
  sub: { fontSize: 11, textAlign: "right", marginTop: 2 },
});

// ── Main ──────────────────────────────────────────────────────────
export default function Settings() {
  const { logout } = useAuth();
  const { colors } = useTheme();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [termsVisible, setTermsVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد أنك تريد الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "خروج",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch {}
        },
      },
    ]);
  };

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <Hero />

        {/* ── المظهر ── */}
        <View style={{ marginBottom: 20 }}>
          <Text style={[s.sectionTitle, { color: colors.textMuted }]}>
            المظهر
          </Text>
          <ThemeSelector />
        </View>

        {/* ── الإشعارات ── */}
        <Section title="الإشعارات">
          <SettingRow
            Icon={IconBell}
            iconBg={notifEnabled ? colors.teal + "12" : colors.textMuted + "15"}
            iconColor={notifEnabled ? colors.teal2 : colors.textMuted}
            label="الإشعارات الفورية"
            subtitle={
              notifEnabled ? "متابعة حالة الوثائق والتسجيل" : "الإشعارات معطّلة"
            }
            showArrow={false}
            right={
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: colors.border, true: colors.teal + "80" }}
                thumbColor={notifEnabled ? colors.teal : colors.textMuted}
              />
            }
          />
        </Section>

        {/* ── حول التطبيق ── */}
        <View style={{ marginBottom: 20 }}>
          <Text style={[s.sectionTitle, { color: colors.textMuted }]}>
            حول التطبيق
          </Text>
          <AboutCard />
        </View>

        {/* ── الدعم ── */}
        <Section title="الدعم والمساعدة">
          <SettingRow
            Icon={IconFileText}
            iconBg={colors.gold + "12"}
            iconColor={colors.gold}
            label="الشروط والأحكام"
            onPress={() => setTermsVisible(true)}
          />
          <SettingRow
            Icon={IconShieldLock}
            iconBg={colors.teal + "12"}
            iconColor={colors.teal2}
            label="سياسة الخصوصية"
            onPress={() => setPrivacyVisible(true)}
          />
        </Section>

        {/* ── الحساب ── */}
        <View style={{ marginBottom: 20 }}>
          <Text style={[s.sectionTitle, { color: colors.textMuted }]}>
            الحساب
          </Text>
          <LogoutButton onPress={handleLogout} />
        </View>

        <Text style={[s.footer, { color: colors.textMuted }]}>
          CEIL Mobile v1.0.0 · جامعة الشهيد حمّه لخضر · El-Oued
        </Text>

        <View style={{ height: Platform.OS === "ios" ? 110 : 90 }} />
      </ScrollView>

      <DocsModal
        visible={termsVisible}
        onClose={() => setTermsVisible(false)}
        title="الشروط والأحكام"
        sections={TERMS_SECTIONS}
      />
      <DocsModal
        visible={privacyVisible}
        onClose={() => setPrivacyVisible(false)}
        title="سياسة الخصوصية"
        sections={PRIVACY_SECTIONS}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "right",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  footer: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 16,
  },
});
