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
} from "react-native";
import { useRef, useEffect, useState } from "react";
import { useAuth } from "../../src/context/AuthContext";
import {
  IconBell,
  IconSchool,
  IconWorld,
  IconHeadset,
  IconFileText,
  IconShieldLock,
  IconLogout,
  IconChevronRight,
} from "@tabler/icons-react-native";

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
  red: "#EF4444",
};

// ── Hero ──────────────────────────────────────────────────────────
function Hero() {
  return (
    <View style={hr.card}>
      <View style={hr.ring1} />
      <View style={hr.ring2} />
      <View style={hr.goldLine} />
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
    backgroundColor: T.teal3,
    borderRadius: 28,
    padding: 20,
    marginBottom: 24,
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
  sub: { fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 },
});

// ── Section ───────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={sc.wrap}>
      <Text style={sc.title}>{title}</Text>
      <View style={sc.card}>{children}</View>
    </View>
  );
}
const sc = StyleSheet.create({
  wrap: { marginBottom: 20 },
  title: {
    fontSize: 10,
    fontWeight: "700",
    color: T.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "right",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: T.white,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: T.border,
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
  return (
    <TouchableOpacity
      style={sr.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[sr.iconWrap, { backgroundColor: iconBg }]}>
        <Icon size={20} color={iconColor} strokeWidth={1.8} />
      </View>
      <View style={sr.textWrap}>
        <Text style={[sr.label, danger && { color: T.red }]}>{label}</Text>
        {subtitle && <Text style={sr.sub}>{subtitle}</Text>}
      </View>
      {right ??
        (showArrow && onPress && (
          <IconChevronRight size={16} color={T.muted} strokeWidth={2} />
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
    borderBottomColor: T.border,
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
  label: { fontSize: 14, fontWeight: "600", color: T.dark, textAlign: "right" },
  sub: { fontSize: 11, color: T.muted, textAlign: "right", marginTop: 2 },
});

// ── About Card ────────────────────────────────────────────────────
function AboutCard() {
  const fadeIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeIn]);
  return (
    <Animated.View style={[ab.card, { opacity: fadeIn }]}>
      <View style={ab.topRow}>
        <View style={ab.schoolIcon}>
          <IconSchool size={28} color={T.gold} strokeWidth={1.4} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ab.name}>CEIL El-Oued</Text>
          <Text style={ab.desc}>
            Centre d&apos;Enseignement Intensif des Langues. مركز التعليم
            المكثّف للغات بجامعة الشهيد حمّه لخضر.
          </Text>
        </View>
      </View>
      <View style={ab.grid}>
        <View style={ab.gridItem}>
          <Text style={ab.gridLabel}>الإصدار</Text>
          <Text style={ab.gridVal}>v1.0.0</Text>
        </View>
        <View style={ab.gridItem}>
          <Text style={ab.gridLabel}>الحالة</Text>
          <Text style={[ab.gridVal, { color: T.teal2 }]}>موثّق ✓</Text>
        </View>
      </View>
      <TouchableOpacity
        style={ab.webBtn}
        onPress={() => Linking.openURL("https://ceil-eloued.com")}
        activeOpacity={0.8}
      >
        <IconWorld size={16} color={T.teal} strokeWidth={2} />
        <Text style={ab.webText}>زيارة الموقع الرسمي</Text>
        <IconChevronRight size={14} color={T.muted} strokeWidth={2} />
      </TouchableOpacity>
    </Animated.View>
  );
}
const ab = StyleSheet.create({
  card: {
    backgroundColor: T.white,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: T.border,
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
    backgroundColor: T.teal + "12",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.teal + "20",
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: T.dark,
    textAlign: "right",
    marginBottom: 4,
  },
  desc: { fontSize: 11, color: T.muted, textAlign: "right", lineHeight: 17 },
  grid: { flexDirection: "row", gap: 10 },
  gridItem: {
    flex: 1,
    backgroundColor: T.cream,
    borderRadius: 12,
    padding: 12,
  },
  gridLabel: {
    fontSize: 9,
    color: T.muted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "right",
    marginBottom: 4,
  },
  gridVal: {
    fontSize: 14,
    fontWeight: "700",
    color: T.teal,
    textAlign: "right",
  },
  webBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: T.cream,
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: T.border,
  },
  webText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: T.dark,
    textAlign: "right",
  },
});

// ── Logout Button ─────────────────────────────────────────────────
function LogoutButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={lb.btn} onPress={onPress} activeOpacity={0.82}>
      <View style={lb.iconWrap}>
        <IconLogout size={20} color={T.red} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={lb.label}>تسجيل الخروج</Text>
        <Text style={lb.sub}>إنهاء الجلسة الحالية</Text>
      </View>
      <IconChevronRight size={16} color={T.red + "60"} strokeWidth={2} />
    </TouchableOpacity>
  );
}
const lb = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: T.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: T.red + "25",
    shadowColor: T.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: T.red + "10",
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 14, fontWeight: "700", color: T.red, textAlign: "right" },
  sub: { fontSize: 11, color: T.muted, textAlign: "right", marginTop: 2 },
});

// ── Main ──────────────────────────────────────────────────────────
export default function Settings() {
  const { logout } = useAuth();
  const [notifEnabled, setNotifEnabled] = useState(true);

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
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <Hero />

        {/* Notifications */}
        <Section title="الإشعارات">
          <SettingRow
            Icon={IconBell}
            iconBg={notifEnabled ? T.teal + "12" : T.muted + "15"}
            iconColor={notifEnabled ? T.teal2 : T.muted}
            label="الإشعارات الفورية"
            subtitle={
              notifEnabled ? "متابعة حالة الوثائق والتسجيل" : "الإشعارات معطّلة"
            }
            showArrow={false}
            right={
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: T.border, true: T.teal + "80" }}
                thumbColor={notifEnabled ? T.teal : T.muted}
              />
            }
          />
        </Section>

        {/* About */}
        <View style={{ marginBottom: 20 }}>
          <Text style={s.sectionTitle}>حول التطبيق</Text>
          <AboutCard />
        </View>

        {/* Support */}
        <Section title="الدعم والمساعدة">
          <SettingRow
            Icon={IconHeadset}
            iconBg="#1565C012"
            iconColor="#1565C0"
            label="تواصل معنا"
            subtitle="للاستفسارات والمساعدة"
            onPress={() => {}}
          />
          <SettingRow
            Icon={IconFileText}
            iconBg={T.gold + "12"}
            iconColor={T.gold}
            label="الشروط والأحكام"
            onPress={() => {}}
          />
          <View style={{ borderBottomWidth: 0 }}>
            <SettingRow
              Icon={IconShieldLock}
              iconBg={T.teal + "12"}
              iconColor={T.teal2}
              label="سياسة الخصوصية"
              onPress={() => {}}
            />
          </View>
        </Section>

        {/* Logout */}
        <View style={{ marginBottom: 20 }}>
          <Text style={s.sectionTitle}>الحساب</Text>
          <LogoutButton onPress={handleLogout} />
        </View>

        {/* Footer */}
        <Text style={s.footer}>
          CEIL Mobile v1.0.0 · جامعة الشهيد حمّه لخضر · El-Oued
        </Text>

        <View style={{ height: Platform.OS === "ios" ? 110 : 90 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.cream },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: T.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "right",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  footer: {
    fontSize: 10,
    color: T.muted,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 16,
  },
});
