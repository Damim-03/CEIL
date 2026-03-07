// ================================================================
// src/screens/profile/ProfileScreen.tsx
//
// ✅ مسجّل دخول  → يعرض معلوماته الكاملة + بطاقته الطلابية
// ✅ ضيف (غير مسجّل) → شاشة ترحيب مع زر تسجيل الدخول
// ================================================================
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/lib/Context/AuthContext";
import { useTheme } from "@/src/lib/Context/ThemeContext";
import StudentIDCard from "@/src/components/StudentIDCard";
import BottomNavbar, { NavItem } from "@/src/components/BottomNavbar";

const { width } = Dimensions.get("window");

const TEAL = "#2B6F5E";
const TEAL2 = "#3D8B76";
const GOLD = "#C4A035";
const RED = "#EF4444";
const GREEN = "#22C55E";

// ── Mock student profile (replace with real API hook later) ──────
const MOCK_PROFILE = {
  student_id: "STU-2024-00142",
  first_name: "أيمن",
  last_name: "ريزو",
  email: "aymen@gmail.com",
  google_avatar: undefined as string | undefined,
  date_of_birth: "2003-07-31",
  education_level: "Master's Degree",
  phone_number: "+213 7 92989256",
  is_active: true,
};

// ── Shared nav config ───────────────────────────────────────────
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
  },
];
const NAV_ROUTES: Record<string, string> = {
  home: "/(public)/home",
  courses: "/(public)/courses",
  news: "/(public)/news",
  profile: "/(public)/profile",
};

// ================================================================
// GUEST VIEW
// ================================================================
function GuestView() {
  const router = useRouter();
  const { theme: t } = useTheme();
  const insets = useSafeAreaInsets();
  const handleNav = (k: string) => {
    if (k !== "profile") router.push(NAV_ROUTES[k] as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View
        style={[
          gv.root,
          { backgroundColor: t.bg, paddingBottom: 80 + insets.bottom },
        ]}
      >
        <View style={gv.blob} />

        <View
          style={[
            gv.iconWrap,
            { backgroundColor: `${TEAL}18`, borderColor: `${TEAL}30` },
          ]}
        >
          <Ionicons name="person-circle-outline" size={72} color={TEAL2} />
        </View>

        <Text style={[gv.title, { color: t.text1 }]}>مرحباً بك في CEIL</Text>
        <Text style={[gv.subtitle, { color: t.text3 }]}>
          سجّل دخولك للوصول إلى ملفك الشخصي،{"\n"}
          بطاقتك الطلابية، ونتائجك
        </Text>

        <View
          style={[
            gv.featuresCard,
            { backgroundColor: t.surface, borderColor: t.border },
          ]}
        >
          {[
            {
              icon: "id-card-outline",
              label: "بطاقة طالب رقمية",
              color: TEAL2,
            },
            { icon: "ribbon-outline", label: "نتائج وشهادات", color: GOLD },
            {
              icon: "calendar-outline",
              label: "جداول ومواعيد",
              color: "#3B82F6",
            },
            {
              icon: "notifications-outline",
              label: "إشعارات فورية",
              color: "#8B5CF6",
            },
          ].map((f, i, arr) => (
            <View key={f.label}>
              <View style={gv.featRow}>
                <View
                  style={[gv.featIcon, { backgroundColor: `${f.color}15` }]}
                >
                  <Ionicons name={f.icon as any} size={18} color={f.color} />
                </View>
                <Text style={[gv.featLabel, { color: t.text2 }]}>
                  {f.label}
                </Text>
                <Ionicons name="checkmark-circle" size={16} color={GREEN} />
              </View>
              {i < arr.length - 1 && (
                <View style={[gv.sep, { backgroundColor: t.border }]} />
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={gv.loginBtn}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.85}
        >
          <Ionicons name="log-in-outline" size={19} color="#fff" />
          <Text style={gv.loginTxt}>تسجيل الدخول</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[gv.registerBtn, { borderColor: `${TEAL}40` }]}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.8}
        >
          <Text style={[gv.registerTxt, { color: TEAL2 }]}>
            ليس لديك حساب؟ سجّل الآن
          </Text>
        </TouchableOpacity>
      </View>
      <BottomNavbar items={NAV_ITEMS} activeKey="profile" onPress={handleNav} />
    </View>
  );
}

// ================================================================
// AUTHENTICATED VIEW
// ================================================================
function AuthenticatedView() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme: t } = useTheme();

  const profile = {
    ...MOCK_PROFILE,
    first_name: user?.first_name ?? MOCK_PROFILE.first_name,
    last_name: user?.last_name ?? MOCK_PROFILE.last_name,
    email: user?.email ?? MOCK_PROFILE.email,
    google_avatar: user?.google_avatar ?? undefined,
  };

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const initials =
    `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();

  const roleLabel = (role?: string) => {
    switch (role) {
      case "STUDENT":
        return "طالب";
      case "TEACHER":
        return "أستاذ";
      case "ADMIN":
        return "مدير";
      case "OWNER":
        return "مالك";
      default:
        return "مستخدم";
    }
  };

  return (
    <View style={[s.root, { backgroundColor: t.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={t.bg} />

      {/* Top bar */}
      <View
        style={[
          s.topBar,
          { paddingTop: insets.top + 10, backgroundColor: t.bg },
        ]}
      >
        <TouchableOpacity
          style={[
            s.topBtn,
            { backgroundColor: t.surface, borderColor: t.border },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-outline" size={20} color={t.text2} />
        </TouchableOpacity>
        <Text style={[s.topTitle, { color: t.text1 }]}>الملف الشخصي</Text>
        <TouchableOpacity
          style={[
            s.topBtn,
            { backgroundColor: t.surface, borderColor: t.border },
          ]}
        >
          <Ionicons name="qr-code-outline" size={20} color={t.text2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingBottom: 110 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={s.hero}>
          <View style={[s.avatarGlow, { backgroundColor: `${TEAL}12` }]} />
          <View style={[s.avatarRing, { borderColor: TEAL2 }]}>
            {profile.google_avatar ? (
              <Image
                source={{ uri: profile.google_avatar }}
                style={s.avatarImg}
              />
            ) : (
              <View style={[s.avatar, { backgroundColor: TEAL }]}>
                <Text style={s.avatarTxt}>{initials}</Text>
              </View>
            )}
          </View>
          <View
            style={[s.onlineDot, { backgroundColor: GREEN, borderColor: t.bg }]}
          />
          <Text style={[s.name, { color: t.text1 }]}>{fullName}</Text>
          <View style={s.onlineRow}>
            <View style={[s.greenDot, { backgroundColor: GREEN }]} />
            <Text style={[s.onlineTxt, { color: t.text3 }]}>متصل الآن</Text>
          </View>
          <View
            style={[
              s.rolePill,
              { backgroundColor: `${TEAL}18`, borderColor: `${TEAL}40` },
            ]}
          >
            <Text style={[s.roleTxt, { color: TEAL2 }]}>
              {roleLabel(user?.role)}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={s.actionRow}>
          {[
            { icon: "camera-outline", label: "الصورة", onPress: () => {} },
            { icon: "create-outline", label: "تعديل", onPress: () => {} },
            {
              icon: "settings-outline",
              label: "الإعدادات",
              //onPress: () => router.push("/(student)/settings"),
            },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[
                s.actionBtn,
                { backgroundColor: t.surface, borderColor: t.border },
              ]}
              onPress={a.onPress}
              activeOpacity={0.75}
            >
              <Ionicons name={a.icon as any} size={19} color={t.text1} />
              <Text style={[s.actionLbl, { color: t.text1 }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info list */}
        <View
          style={[
            s.infoCard,
            { backgroundColor: t.surface, borderColor: t.border },
          ]}
        >
          {[
            {
              value: profile.phone_number,
              label: "رقم الهاتف",
              icon: "call-outline",
            },
            {
              value: profile.email,
              label: "البريد الإلكتروني",
              icon: "mail-outline",
            },
            {
              value: profile.date_of_birth,
              label: "تاريخ الميلاد",
              icon: "calendar-outline",
            },
            {
              value: profile.education_level,
              label: "المستوى الدراسي",
              icon: "school-outline",
            },
            {
              value: profile.student_id,
              label: "رقم الطالب",
              icon: "barcode-outline",
            },
          ].map((row, i, arr) => (
            <View key={row.label}>
              <TouchableOpacity style={s.infoRow} activeOpacity={0.7}>
                <View style={[s.infoIconBox, { backgroundColor: `${TEAL}12` }]}>
                  <Ionicons name={row.icon as any} size={16} color={TEAL2} />
                </View>
                <View style={s.infoText}>
                  <Text style={[s.infoVal, { color: t.text1 }]}>
                    {row.value}
                  </Text>
                  <Text style={[s.infoLbl, { color: t.text3 }]}>
                    {row.label}
                  </Text>
                </View>
              </TouchableOpacity>
              {i < arr.length - 1 && (
                <View style={[s.infoLine, { backgroundColor: t.border }]} />
              )}
            </View>
          ))}
        </View>

        {/* Student ID Card — STUDENT role only */}
        {user?.role === "STUDENT" && (
          <>
            <View style={s.secHead}>
              <Text style={[s.secTitle, { color: t.text1 }]}>
                بطاقتك الطلابية
              </Text>
              <Text style={[s.secHint, { color: t.text3 }]}>اضغط لقلبها ↩</Text>
            </View>
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <StudentIDCard profile={profile} />
            </View>
          </>
        )}

        {/* Logout */}
        <TouchableOpacity
          style={[
            s.logoutBtn,
            { backgroundColor: `${RED}10`, borderColor: `${RED}25` },
          ]}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={17} color={RED} />
          <Text style={[s.logoutTxt, { color: RED }]}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ================================================================
// ROOT — smart switcher: مسجّل → معلوماته | ضيف → دعوة
// ================================================================
export default function ProfileScreen() {
  const { user } = useAuth();
  return user ? <AuthenticatedView /> : <GuestView />;
}

// ── Authenticated styles ─────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingTop: 8 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  topTitle: { fontSize: 16, fontWeight: "800" },
  hero: { alignItems: "center", paddingVertical: 20, position: "relative" },
  avatarGlow: {
    position: "absolute",
    top: 10,
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    padding: 3,
    marginBottom: 12,
  },
  avatar: {
    flex: 1,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: "100%" as any, height: "100%" as any, borderRadius: 40 },
  avatarTxt: { color: "#fff", fontSize: 26, fontWeight: "900" },
  onlineDot: {
    position: "absolute",
    top: 72,
    right: width / 2 - 50,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2.5,
  },
  name: { fontSize: 21, fontWeight: "800", marginBottom: 5 },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 9,
  },
  greenDot: { width: 7, height: 7, borderRadius: 4 },
  onlineTxt: { fontSize: 12 },
  rolePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleTxt: { fontSize: 12, fontWeight: "700" },
  actionRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 18,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
  },
  actionLbl: { fontSize: 11, fontWeight: "600" },
  infoCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: { flex: 1, alignItems: "flex-end" },
  infoVal: { fontSize: 14, fontWeight: "700", textAlign: "right" },
  infoLbl: { fontSize: 11, textAlign: "right", marginTop: 1 },
  infoLine: { height: 1, marginHorizontal: 14 },
  secHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  secTitle: { fontSize: 16, fontWeight: "800" },
  secHint: { fontSize: 11 },
  logoutBtn: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoutTxt: { fontSize: 14, fontWeight: "700" },
});

// ── Guest styles ─────────────────────────────────────────────────
const gv = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  blob: {
    position: "absolute",
    top: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${TEAL}08`,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  featuresCard: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 4,
    marginBottom: 28,
  },
  featRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  featIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featLabel: { flex: 1, fontSize: 14, fontWeight: "600", textAlign: "right" },
  sep: { height: 1, marginHorizontal: 14 },
  loginBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: TEAL,
    marginBottom: 12,
  },
  loginTxt: { color: "#fff", fontSize: 15, fontWeight: "800" },
  registerBtn: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  registerTxt: { fontSize: 14, fontWeight: "700" },
});
