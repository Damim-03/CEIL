// ================================================================
// src/screens/settings/SettingsScreen.tsx
// ================================================================
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
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

type Lang = "ar" | "fr" | "en";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme: t, toggleTheme } = useTheme();
  const NAV_H = 68 + insets.bottom;

  const [lang, setLang] = useState<Lang>("ar");
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [biometric, setBiometric] = useState(false);

  const handleNav = (k: string) => router.push(ROUTES[k] as any);

  const LANGS: { code: Lang; label: string; flag: string }[] = [
    { code: "ar", label: "العربية", flag: "🇩🇿" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
  ];

  const Section = ({ title }: { title: string }) => (
    <Text style={[s.sectionTitle, { color: t.text3 }]}>{title}</Text>
  );

  const Row = ({
    icon,
    iconColor = TEAL2,
    label,
    sub,
    right,
    danger = false,
    onPress,
  }: {
    icon: string;
    iconColor?: string;
    label: string;
    sub?: string;
    right?: React.ReactNode;
    danger?: boolean;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[s.row, { backgroundColor: t.surface, borderColor: t.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.78 : 1}
    >
      <View style={[s.rowIcon, { backgroundColor: `${iconColor}18` }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.rowLabel, { color: danger ? RED : t.text1 }]}>
          {label}
        </Text>
        {sub && <Text style={[s.rowSub, { color: t.text3 }]}>{sub}</Text>}
      </View>
      {right ?? <Ionicons name="chevron-back" size={15} color={t.text3} />}
    </TouchableOpacity>
  );

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
        <Text style={[s.headerTitle, { color: t.text1 }]}>الإعدادات</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: NAV_H + 24,
          gap: 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Appearance ── */}
        <Section title="المظهر" />

        <View
          style={[
            s.card,
            { backgroundColor: t.surface, borderColor: t.border },
          ]}
        >
          <View style={s.cardRow}>
            <View style={[s.rowIcon, { backgroundColor: `${TEAL}18` }]}>
              <Ionicons
                name={t.isDark ? "moon" : "sunny"}
                size={18}
                color={TEAL2}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: t.text1 }]}>الوضع الداكن</Text>
              <Text style={[s.rowSub, { color: t.text3 }]}>
                {t.isDark ? "مُفعّل" : "معطّل"}
              </Text>
            </View>
            <Switch
              value={t.isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#3A3A3A", true: `${TEAL}80` }}
              thumbColor={t.isDark ? TEAL2 : "#f4f3f4"}
            />
          </View>
        </View>

        {/* ── Language ── */}
        <Section title="اللغة" />

        <View
          style={[
            s.card,
            { backgroundColor: t.surface, borderColor: t.border, padding: 4 },
          ]}
        >
          {LANGS.map((l, i) => (
            <TouchableOpacity
              key={l.code}
              style={[
                s.langRow,
                {
                  backgroundColor:
                    lang === l.code ? `${TEAL}12` : "transparent",
                  borderRadius: 12,
                },
              ]}
              onPress={() => setLang(l.code)}
            >
              <Text style={{ fontSize: 20 }}>{l.flag}</Text>
              <Text style={[s.langLabel, { color: t.text1 }]}>{l.label}</Text>
              {lang === l.code && (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={TEAL2}
                  style={{ marginLeft: "auto" }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Notifications ── */}
        <Section title="الإشعارات" />

        <View
          style={[
            s.card,
            { backgroundColor: t.surface, borderColor: t.border },
          ]}
        >
          <View
            style={[
              s.cardRow,
              { borderBottomWidth: 1, borderBottomColor: t.border },
            ]}
          >
            <View style={[s.rowIcon, { backgroundColor: `${GOLD}18` }]}>
              <Ionicons name="notifications-outline" size={18} color={GOLD} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: t.text1 }]}>
                إشعارات الجوال
              </Text>
              <Text style={[s.rowSub, { color: t.text3 }]}>
                تلقّي إشعارات فورية
              </Text>
            </View>
            <Switch
              value={notifPush}
              onValueChange={setNotifPush}
              trackColor={{ false: "#3A3A3A", true: `${GOLD}80` }}
              thumbColor={notifPush ? GOLD : "#f4f3f4"}
            />
          </View>
          <View style={s.cardRow}>
            <View style={[s.rowIcon, { backgroundColor: `#3B82F618` }]}>
              <Ionicons name="mail-outline" size={18} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: t.text1 }]}>
                إشعارات البريد
              </Text>
              <Text style={[s.rowSub, { color: t.text3 }]}>
                إرسال ملخص بالبريد الإلكتروني
              </Text>
            </View>
            <Switch
              value={notifEmail}
              onValueChange={setNotifEmail}
              trackColor={{ false: "#3A3A3A", true: `#3B82F680` }}
              thumbColor={notifEmail ? "#3B82F6" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* ── Security ── */}
        <Section title="الأمان" />

        <View
          style={[
            s.card,
            { backgroundColor: t.surface, borderColor: t.border },
          ]}
        >
          <View
            style={[
              s.cardRow,
              { borderBottomWidth: 1, borderBottomColor: t.border },
            ]}
          >
            <View style={[s.rowIcon, { backgroundColor: `${TEAL}18` }]}>
              <Ionicons name="finger-print-outline" size={18} color={TEAL2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: t.text1 }]}>
                البصمة / Face ID
              </Text>
              <Text style={[s.rowSub, { color: t.text3 }]}>
                تسجيل الدخول بالبيومتري
              </Text>
            </View>
            <Switch
              value={biometric}
              onValueChange={setBiometric}
              trackColor={{ false: "#3A3A3A", true: `${TEAL}80` }}
              thumbColor={biometric ? TEAL2 : "#f4f3f4"}
            />
          </View>
          <TouchableOpacity style={s.cardRow}>
            <View style={[s.rowIcon, { backgroundColor: `#8B5CF618` }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: t.text1 }]}>
                تغيير كلمة المرور
              </Text>
            </View>
            <Ionicons name="chevron-back" size={15} color={t.text3} />
          </TouchableOpacity>
        </View>

        {/* ── About ── */}
        <Section title="حول التطبيق" />

        <View
          style={[
            s.card,
            { backgroundColor: t.surface, borderColor: t.border },
          ]}
        >
          {[
            {
              icon: "information-circle-outline",
              label: "إصدار التطبيق",
              sub: "1.0.0",
              iconColor: "#3B82F6",
            },
            {
              icon: "globe-outline",
              label: "الموقع الإلكتروني",
              sub: "ceil.univ-eloued.dz",
              iconColor: TEAL2,
            },
            {
              icon: "mail-outline",
              label: "تواصل معنا",
              sub: "ceil@univ-eloued.dz",
              iconColor: GOLD,
            },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={item.label}
              style={[
                s.cardRow,
                i < arr.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: t.border,
                },
              ]}
            >
              <View
                style={[s.rowIcon, { backgroundColor: `${item.iconColor}18` }]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={item.iconColor}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.rowLabel, { color: t.text1 }]}>
                  {item.label}
                </Text>
                <Text style={[s.rowSub, { color: t.text3 }]}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-back" size={15} color={t.text3} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={[
            s.logoutBtn,
            { backgroundColor: `${RED}12`, borderColor: `${RED}30` },
          ]}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Ionicons name="log-out-outline" size={18} color={RED} />
          <Text style={[s.logoutTxt, { color: RED }]}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavbar items={NAV_ITEMS} activeKey="profile" onPress={handleNav} />
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { fontSize: 14, fontWeight: "600" },
  rowSub: { fontSize: 11, marginTop: 1 },
  langRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  langLabel: { fontSize: 14, fontWeight: "600" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    marginTop: 8,
  },
  logoutTxt: { fontSize: 14, fontWeight: "700" },
});
