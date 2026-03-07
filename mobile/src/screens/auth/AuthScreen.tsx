// ================================================================
// src/screens/auth/AuthScreen.tsx — REDESIGNED
// Luxury dark Arabic auth — cinematic hero + glass card
// ================================================================
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  I18nManager,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth, AuthUser } from "@/src/lib/Context/AuthContext";

const { width, height } = Dimensions.get("window");

// ── Palette ──────────────────────────────────────────────────────
const C = {
  bg: "#080A0C",
  bg2: "#0D1117",
  surface: "#111820",
  surface2: "#16202E",
  border: "#1E2D3D",
  border2: "#243347",
  teal: "#2B6F5E",
  teal2: "#3D8B76",
  teal3: "#52A891",
  gold: "#C4A035",
  gold2: "#E2BC52",
  gold3: "#F5D878",
  white: "#FFFFFF",
  g1: "#EEF0F4",
  g2: "#A8B4C0",
  g3: "#5A6B7A",
  g4: "#2A3845",
  red: "#FF4757",
  glow: "rgba(61,139,118,0.12)",
  goldGlow: "rgba(196,160,53,0.15)",
};

const API_BASE = "https://your-api.com/api";

async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "خطأ في تسجيل الدخول");
  return json;
}

async function apiRegister(data: object) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "خطأ في إنشاء الحساب");
  return json;
}

const USER_TYPES = [
  {
    value: "STUDENT_UNIVERSITY",
    label: "طالب جامعي",
    icon: "school-outline",
    color: C.teal2,
  },
  {
    value: "STUDENT_OTHER",
    label: "طالب آخر",
    icon: "book-outline",
    color: "#3B82F6",
  },
  { value: "TEACHER", label: "أستاذ", icon: "person-outline", color: C.gold },
  {
    value: "EMPLOYEE",
    label: "موظف",
    icon: "briefcase-outline",
    color: "#8B5CF6",
  },
  {
    value: "EXTERNAL",
    label: "خارجي",
    icon: "globe-outline",
    color: "#EC4899",
  },
];

// ── Decorative dots ──────────────────────────────────────────────
const DOTS = [
  { x: 0.08, y: 0.06, size: 3, opacity: 0.6 },
  { x: 0.82, y: 0.03, size: 2, opacity: 0.4 },
  { x: 0.92, y: 0.15, size: 4, opacity: 0.3 },
  { x: 0.15, y: 0.22, size: 2, opacity: 0.5 },
  { x: 0.75, y: 0.28, size: 3, opacity: 0.4 },
  { x: 0.45, y: 0.08, size: 2, opacity: 0.3 },
  { x: 0.6, y: 0.18, size: 5, opacity: 0.15 },
  { x: 0.3, y: 0.14, size: 2, opacity: 0.5 },
];

// ── Pulsing orb component ────────────────────────────────────────
function PulseOrb({ style }: { style: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  });
  return <Animated.View style={[style, { opacity, transform: [{ scale }] }]} />;
}

// ── Animated counter for stats ───────────────────────────────────
function StatBadge({
  icon,
  label,
  delay = 0,
}: {
  icon: string;
  label: string;
  delay?: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    setTimeout(
      () =>
        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start(),
      delay,
    );
  }, []);
  return (
    <Animated.View
      style={[
        sb.wrap,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Ionicons name={icon as any} size={14} color={C.teal3} />
      <Text style={sb.label}>{label}</Text>
    </Animated.View>
  );
}
const sb = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(43,111,94,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(43,111,94,0.25)",
  },
  label: { color: C.teal3, fontSize: 11, fontWeight: "700" },
});

// ════════════════════════════════════════════════════════════════
export default function AuthScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [userType, setUserType] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 900,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const shake = () =>
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

  const err = (msg: string) => {
    setError(msg);
    shake();
  };
  const clearErr = () => setError("");

  const tabAnim = useRef(new Animated.Value(tab === "login" ? 1 : 0)).current;
  const switchTab = (t: "login" | "register") => {
    Animated.spring(tabAnim, {
      toValue: t === "login" ? 1 : 0,
      useNativeDriver: false,
      tension: 140,
      friction: 11,
    }).start();
    setTab(t);
    setStep(0);
    clearErr();
  };
  const pillRight = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["2%", "50%"],
  });

  const handleLogin = async () => {
    if (!loginEmail.trim()) return err("أدخل البريد الإلكتروني");
    if (!loginPass) return err("أدخل كلمة المرور");
    setLoading(true);
    clearErr();
    try {
      if (__DEV__) {
        // ── DEV: mock login (no real API needed) ────────────────
        const mockRole: Record<string, string> = {
          "student@test.com": "STUDENT",
          "teacher@test.com": "TEACHER",
          "admin@test.com": "ADMIN",
        };
        await login(
          {
            id: "dev-001",
            email: loginEmail.trim(),
            first_name: "مستخدم",
            last_name: "تجريبي",
            role: (mockRole[loginEmail.toLowerCase()] ?? "STUDENT") as any,
          },
          "dev-token",
        );
      } else {
        // ── PRODUCTION: real API ─────────────────────────────────
        const data = await apiLogin(loginEmail.trim(), loginPass);
        await login(data.user as AuthUser, data.token);
      }
    } catch (e: any) {
      err(e.message);
    } finally {
      setLoading(false);
    } // ✅ always runs — no stale loading state
  };

  const nextStep = () => {
    if (step === 0 && !userType) return err("اختر نوع الحساب");
    if (step === 1 && !firstName.trim()) return err("الاسم الأول مطلوب");
    if (step === 1 && !lastName.trim()) return err("اسم العائلة مطلوب");
    clearErr();
    setStep((s) => s + 1);
  };

  const handleRegister = async () => {
    if (!regEmail.trim()) return err("البريد الإلكتروني مطلوب");
    if (regPass.length < 6) return err("كلمة المرور 6 أحرف على الأقل");
    setLoading(true);
    clearErr();
    try {
      const data = await apiRegister({
        email: regEmail.trim(),
        password: regPass,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        user_type: userType,
      });
      await login(data.user as AuthUser, data.token);
    } catch (e: any) {
      err(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => [
    s.input,
    focusedField === field && s.inputWrapFocused,
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} translucent />

      {/* ── Background layers ── */}
      <LinearGradient
        colors={[C.bg, C.bg2, "#0A1520"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient orbs */}
      <PulseOrb
        style={[
          s.orb,
          {
            top: -60,
            left: -60,
            width: 250,
            height: 250,
            borderRadius: 125,
            backgroundColor: C.glow,
          },
        ]}
      />
      <PulseOrb
        style={[
          s.orb,
          {
            top: height * 0.25,
            right: -80,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: C.goldGlow,
          },
        ]}
      />
      <PulseOrb
        style={[
          s.orb,
          {
            bottom: 100,
            left: -40,
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: C.glow,
          },
        ]}
      />

      {/* Decorative dots */}
      {DOTS.map((d, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: d.x * width,
            top: d.y * height,
            width: d.size,
            height: d.size,
            borderRadius: d.size / 2,
            backgroundColor: C.teal3,
            opacity: d.opacity,
          }}
        />
      ))}

      {/* Diagonal accent line */}
      <View style={s.diagonalLine} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingTop: insets.top }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ══════════ HERO ══════════ */}
          <Animated.View
            style={[
              s.hero,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Top bar */}
            <View style={s.topBar}>
              {/* Language pills */}
              <View style={s.langRow}>
                {["FR", "EN", "AR"].map((l, i) => (
                  <View
                    key={l}
                    style={[s.langPill, i === 2 && s.langPillActive]}
                  >
                    <Text
                      style={[s.langPillTxt, i === 2 && s.langPillTxtActive]}
                    >
                      {l}
                    </Text>
                  </View>
                ))}
              </View>
              {/* Brand */}
              <View style={s.brand}>
                <View style={s.brandTextWrap}>
                  <Text style={s.brandName}>CEIL</Text>
                  <Text style={s.brandSub}>جامعة الشهيد حمه لخضر</Text>
                </View>
                <View style={s.logoWrap}>
                  <LinearGradient colors={[C.teal, C.teal2]} style={s.logoGrad}>
                    <Ionicons name="school" size={18} color="#fff" />
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* ── Gold accent bar ── */}
            <View style={s.goldBar}>
              <View style={s.goldBarInner} />
              <Text style={s.goldBarText}>مركز تعليم اللغات</Text>
            </View>

            {/* Main title */}
            <View style={s.titleWrap}>
              <Text style={s.titleSub}>مرحباً بك في</Text>
              <Text style={s.titleMain}>رحلة{"\n"}التعلّم</Text>
              <Text style={s.titleGold}>اللغوي</Text>
            </View>

            {/* Desc */}
            <Text style={s.desc}>
              ادخل إلى دوراتك · تابع تقدمك{"\n"}طوّر مهاراتك اللغوية مع CEIL
            </Text>

            {/* Stats row */}
            <View style={s.statsRow}>
              <StatBadge icon="book-outline" label="+6 لغات" delay={200} />
              <StatBadge icon="people-outline" label="+500 طالب" delay={350} />
              <StatBadge icon="ribbon-outline" label="معتمد" delay={500} />
            </View>

            {/* Testimonial */}
            <View style={s.testimonial}>
              <View style={s.testimonialBorder} />
              <Text style={s.testimonialTxt}>
                "المنصة سهّلت عليّ متابعة تقدمي في دورة الفرنسية"
              </Text>
              <View style={s.testimonialAuthor}>
                <View style={s.testimonialAvatar}>
                  <LinearGradient
                    colors={[C.teal, C.teal2]}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={s.testimonialInitial}>س</Text>
                </View>
                <View>
                  <Text style={s.testimonialName}>سارة م.</Text>
                  <Text style={s.testimonialRole}>طالبة فرنسية — B1</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* ══════════ AUTH CARD ══════════ */}
          <Animated.View
            style={[
              s.cardOuter,
              {
                opacity: cardAnim,
                transform: [
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [60, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.View
              style={[s.card, { transform: [{ translateX: shakeAnim }] }]}
            >
              {/* Card glow border */}
              <LinearGradient
                colors={[
                  "rgba(61,139,118,0.3)",
                  "rgba(196,160,53,0.15)",
                  "rgba(61,139,118,0.1)",
                ]}
                style={s.cardGlowBorder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />

              {/* Tab switcher */}
              <View style={s.tabWrap}>
                <Animated.View style={[s.tabPill, { right: pillRight }]} />
                <TouchableOpacity
                  style={s.tabBtn}
                  onPress={() => switchTab("register")}
                >
                  <Text
                    style={[s.tabTxt, tab === "register" && s.tabTxtActive]}
                  >
                    إنشاء حساب
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.tabBtn}
                  onPress={() => switchTab("login")}
                >
                  <Text style={[s.tabTxt, tab === "login" && s.tabTxtActive]}>
                    الدخول
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Error */}
              {!!error && (
                <View style={s.errorBox}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={16}
                    color="#FF8A8A"
                  />
                  <Text style={s.errorTxt}>{error}</Text>
                </View>
              )}

              {/* ══ LOGIN ══ */}
              {tab === "login" && (
                <View style={s.form}>
                  <Text style={s.formTitle}>تسجيل الدخول</Text>
                  <Text style={s.formSub}>أدخل بياناتك للوصول إلى حسابك</Text>

                  {/* Google */}
                  <TouchableOpacity style={s.googleBtn} activeOpacity={0.85}>
                    <View style={s.googleIconWrap}>
                      <Text style={s.googleG}>G</Text>
                    </View>
                    <Text style={s.googleTxt}>المتابعة مع Google</Text>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={s.divider}>
                    <View style={s.dividerLine} />
                    <Text style={s.dividerTxt}>أو بالبريد</Text>
                    <View style={s.dividerLine} />
                  </View>

                  {/* Email */}
                  <View style={s.fieldWrap}>
                    <Text style={s.fieldLabel}>البريد الإلكتروني</Text>
                    <View
                      style={[
                        s.inputWrap,
                        focusedField === "email" && s.inputWrapFocused,
                      ]}
                    >
                      <TextInput
                        style={s.inputInner}
                        value={loginEmail}
                        onChangeText={setLoginEmail}
                        placeholder="you@example.com"
                        placeholderTextColor={C.g3}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        textAlign="right"
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField("")}
                      />
                      <Ionicons
                        name="mail-outline"
                        size={16}
                        color={focusedField === "email" ? C.teal2 : C.g3}
                        style={{ marginLeft: 10 }}
                      />
                    </View>
                  </View>

                  {/* Password */}
                  <View style={s.fieldWrap}>
                    <View style={s.fieldLabelRow}>
                      <TouchableOpacity>
                        <Text style={s.forgotTxt}>نسيت كلمة المرور؟</Text>
                      </TouchableOpacity>
                      <Text style={s.fieldLabel}>كلمة المرور</Text>
                    </View>
                    <View
                      style={[
                        s.inputWrap,
                        focusedField === "pass" && s.inputWrapFocused,
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => setShowPass((v) => !v)}
                        style={s.eyeBtn}
                      >
                        <Ionicons
                          name={showPass ? "eye-off-outline" : "eye-outline"}
                          size={16}
                          color={C.g3}
                        />
                      </TouchableOpacity>
                      <TextInput
                        style={s.inputInner}
                        value={loginPass}
                        onChangeText={setLoginPass}
                        placeholder="••••••••"
                        placeholderTextColor={C.g3}
                        secureTextEntry={!showPass}
                        textAlign="right"
                        onFocus={() => setFocusedField("pass")}
                        onBlur={() => setFocusedField("")}
                      />
                      <Ionicons
                        name="lock-closed-outline"
                        size={16}
                        color={focusedField === "pass" ? C.teal2 : C.g3}
                        style={{ marginLeft: 10 }}
                      />
                    </View>
                  </View>

                  {/* Login button */}
                  <TouchableOpacity
                    style={[s.primaryBtn, loading && { opacity: 0.7 }]}
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={[C.teal, C.teal2, C.teal3]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={s.primaryBtnGrad}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Ionicons
                            name="arrow-back-outline"
                            size={18}
                            color="#fff"
                          />
                          <Text style={s.primaryBtnTxt}>دخول</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* DEV quick login */}
                  {__DEV__ && (
                    <View style={s.devBox}>
                      <View style={s.devBoxHeader}>
                        <Ionicons
                          name="flash-outline"
                          size={12}
                          color={C.gold}
                        />
                        <Text style={s.devBoxTitle}>وضع التطوير</Text>
                      </View>
                      <View style={s.devRow}>
                        {[
                          {
                            label: "طالب",
                            email: "student@test.com",
                            color: C.teal2,
                          },
                          {
                            label: "أستاذ",
                            email: "teacher@test.com",
                            color: "#3B82F6",
                          },
                          {
                            label: "مدير",
                            email: "admin@test.com",
                            color: "#8B5CF6",
                          },
                        ].map((d) => (
                          <TouchableOpacity
                            key={d.label}
                            style={[
                              s.devBtn,
                              {
                                borderColor: `${d.color}50`,
                                backgroundColor: `${d.color}12`,
                              },
                            ]}
                            onPress={async () => {
                              setLoading(true);
                              try {
                                await login(
                                  {
                                    id: `dev-${d.label}`,
                                    email: d.email,
                                    first_name: d.label,
                                    last_name: "تجريبي",
                                    role:
                                      d.label === "طالب"
                                        ? "STUDENT"
                                        : d.label === "أستاذ"
                                          ? "TEACHER"
                                          : "ADMIN",
                                  } as any,
                                  "dev-token",
                                );
                              } catch (_) {
                              } finally {
                                setLoading(false);
                              }
                            }}
                          >
                            <Text style={[s.devBtnTxt, { color: d.color }]}>
                              {d.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* ══ REGISTER ══ */}
              {tab === "register" && (
                <View style={s.form}>
                  <Text style={s.formTitle}>إنشاء حساب</Text>

                  {/* Steps indicator */}
                  <View style={s.stepsWrap}>
                    {[0, 1, 2].map((i) => (
                      <View
                        key={i}
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <View
                          style={[
                            s.stepDot,
                            step === i && s.stepDotActive,
                            step > i && s.stepDotDone,
                          ]}
                        >
                          {step > i ? (
                            <Ionicons name="checkmark" size={12} color="#fff" />
                          ) : (
                            <Text
                              style={[
                                s.stepDotTxt,
                                step >= i && { color: "#fff" },
                              ]}
                            >
                              {i + 1}
                            </Text>
                          )}
                        </View>
                        {i < 2 && (
                          <View
                            style={[s.stepLine, step > i && s.stepLineDone]}
                          />
                        )}
                      </View>
                    ))}
                  </View>

                  {/* Step 0 */}
                  {step === 0 && (
                    <>
                      <Text style={s.stepTitle}>نوع الحساب</Text>
                      <View style={s.typeGrid}>
                        {USER_TYPES.map((ut) => (
                          <TouchableOpacity
                            key={ut.value}
                            style={[
                              s.typeCard,
                              userType === ut.value && {
                                borderColor: ut.color,
                                backgroundColor: `${ut.color}12`,
                              },
                            ]}
                            onPress={() => {
                              setUserType(ut.value);
                              clearErr();
                            }}
                            activeOpacity={0.8}
                          >
                            <View
                              style={[
                                s.typeIconWrap,
                                { backgroundColor: `${ut.color}18` },
                              ]}
                            >
                              <Ionicons
                                name={ut.icon as any}
                                size={20}
                                color={ut.color}
                              />
                            </View>
                            <Text
                              style={[
                                s.typeLabel,
                                userType === ut.value && { color: ut.color },
                              ]}
                            >
                              {ut.label}
                            </Text>
                            {userType === ut.value && (
                              <View
                                style={[
                                  s.typeCheck,
                                  { backgroundColor: ut.color },
                                ]}
                              >
                                <Ionicons
                                  name="checkmark"
                                  size={10}
                                  color="#fff"
                                />
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TouchableOpacity
                        style={s.primaryBtn}
                        onPress={nextStep}
                        activeOpacity={0.85}
                      >
                        <LinearGradient
                          colors={[C.teal, C.teal2]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={s.primaryBtnGrad}
                        >
                          <Ionicons
                            name="arrow-back-outline"
                            size={18}
                            color="#fff"
                          />
                          <Text style={s.primaryBtnTxt}>التالي</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Step 1 */}
                  {step === 1 && (
                    <>
                      <Text style={s.stepTitle}>بياناتك الشخصية</Text>
                      <View style={s.row2}>
                        <View style={{ flex: 1 }}>
                          <Text style={s.fieldLabel}>اسم العائلة</Text>
                          <View
                            style={[
                              s.inputWrap,
                              focusedField === "ln" && s.inputWrapFocused,
                            ]}
                          >
                            <TextInput
                              style={s.inputInner}
                              value={lastName}
                              onChangeText={setLastName}
                              placeholder="العائلة"
                              placeholderTextColor={C.g3}
                              textAlign="right"
                              onFocus={() => setFocusedField("ln")}
                              onBlur={() => setFocusedField("")}
                            />
                          </View>
                        </View>
                        <View style={{ width: 10 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={s.fieldLabel}>الاسم</Text>
                          <View
                            style={[
                              s.inputWrap,
                              focusedField === "fn" && s.inputWrapFocused,
                            ]}
                          >
                            <TextInput
                              style={s.inputInner}
                              value={firstName}
                              onChangeText={setFirstName}
                              placeholder="الاسم"
                              placeholderTextColor={C.g3}
                              textAlign="right"
                              onFocus={() => setFocusedField("fn")}
                              onBlur={() => setFocusedField("")}
                            />
                          </View>
                        </View>
                      </View>
                      <Text style={s.fieldLabel}>رقم الهاتف</Text>
                      <View
                        style={[
                          s.inputWrap,
                          focusedField === "ph" && s.inputWrapFocused,
                          { marginBottom: 4 },
                        ]}
                      >
                        <Ionicons
                          name="call-outline"
                          size={15}
                          color={focusedField === "ph" ? C.teal2 : C.g3}
                          style={{ marginLeft: 10 }}
                        />
                        <TextInput
                          style={s.inputInner}
                          value={phone}
                          onChangeText={setPhone}
                          placeholder="0555 00 00 00"
                          placeholderTextColor={C.g3}
                          keyboardType="phone-pad"
                          textAlign="right"
                          onFocus={() => setFocusedField("ph")}
                          onBlur={() => setFocusedField("")}
                        />
                      </View>
                      <View style={s.rowBtns}>
                        <TouchableOpacity
                          style={[s.primaryBtn, { flex: 1 }]}
                          onPress={nextStep}
                          activeOpacity={0.85}
                        >
                          <LinearGradient
                            colors={[C.teal, C.teal2]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.primaryBtnGrad}
                          >
                            <Ionicons
                              name="arrow-back-outline"
                              size={18}
                              color="#fff"
                            />
                            <Text style={s.primaryBtnTxt}>التالي</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={s.outlineBtn}
                          onPress={() => {
                            setStep(0);
                            clearErr();
                          }}
                        >
                          <Text style={s.outlineBtnTxt}>رجوع</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <>
                      <Text style={s.stepTitle}>بيانات الوصول</Text>
                      <View style={s.summaryCard}>
                        <LinearGradient
                          colors={[
                            "rgba(43,111,94,0.15)",
                            "rgba(43,111,94,0.05)",
                          ]}
                          style={s.summaryGrad}
                        >
                          <View style={s.summaryRow}>
                            <Ionicons
                              name="person-outline"
                              size={14}
                              color={C.teal2}
                            />
                            <Text style={s.summaryTxt}>
                              {firstName} {lastName}
                            </Text>
                          </View>
                          <View style={s.summaryRow}>
                            <Ionicons
                              name="pricetag-outline"
                              size={14}
                              color={C.gold}
                            />
                            <Text style={[s.summaryTxt, { color: C.gold }]}>
                              {
                                USER_TYPES.find((u) => u.value === userType)
                                  ?.label
                              }
                            </Text>
                          </View>
                        </LinearGradient>
                      </View>
                      <Text style={s.fieldLabel}>البريد الإلكتروني</Text>
                      <View
                        style={[
                          s.inputWrap,
                          focusedField === "re" && s.inputWrapFocused,
                        ]}
                      >
                        <Ionicons
                          name="mail-outline"
                          size={15}
                          color={focusedField === "re" ? C.teal2 : C.g3}
                          style={{ marginLeft: 10 }}
                        />
                        <TextInput
                          style={s.inputInner}
                          value={regEmail}
                          onChangeText={setRegEmail}
                          placeholder="you@example.com"
                          placeholderTextColor={C.g3}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          textAlign="right"
                          onFocus={() => setFocusedField("re")}
                          onBlur={() => setFocusedField("")}
                        />
                      </View>
                      <Text style={s.fieldLabel}>كلمة المرور</Text>
                      <View
                        style={[
                          s.inputWrap,
                          focusedField === "rp" && s.inputWrapFocused,
                          { marginBottom: 4 },
                        ]}
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={15}
                          color={focusedField === "rp" ? C.teal2 : C.g3}
                          style={{ marginLeft: 10 }}
                        />
                        <TextInput
                          style={s.inputInner}
                          value={regPass}
                          onChangeText={setRegPass}
                          placeholder="6 أحرف على الأقل"
                          placeholderTextColor={C.g3}
                          secureTextEntry
                          textAlign="right"
                          onFocus={() => setFocusedField("rp")}
                          onBlur={() => setFocusedField("")}
                        />
                      </View>
                      <View style={s.rowBtns}>
                        <TouchableOpacity
                          style={[
                            s.primaryBtn,
                            { flex: 1 },
                            loading && { opacity: 0.7 },
                          ]}
                          onPress={handleRegister}
                          disabled={loading}
                          activeOpacity={0.85}
                        >
                          <LinearGradient
                            colors={[C.teal, C.teal2]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.primaryBtnGrad}
                          >
                            {loading ? (
                              <ActivityIndicator color="#fff" />
                            ) : (
                              <>
                                <Ionicons
                                  name="school-outline"
                                  size={17}
                                  color="#fff"
                                />
                                <Text style={s.primaryBtnTxt}>
                                  إنشاء الحساب
                                </Text>
                              </>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={s.outlineBtn}
                          onPress={() => {
                            setStep(1);
                            clearErr();
                          }}
                        >
                          <Text style={s.outlineBtnTxt}>رجوع</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              )}
            </Animated.View>
          </Animated.View>

          {/* Bottom padding */}
          <View style={{ height: 48 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1 },
  orb: { position: "absolute" },

  // Diagonal accent
  diagonalLine: {
    position: "absolute",
    top: 0,
    right: "25%",
    width: 1,
    height: height * 0.45,
    backgroundColor: "rgba(61,139,118,0.08)",
    transform: [{ rotate: "15deg" }],
  },

  // ── Hero ──
  hero: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 32 },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  langRow: { flexDirection: "row", gap: 6 },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  langPillActive: { backgroundColor: C.teal, borderColor: C.teal },
  langPillTxt: { color: C.g3, fontSize: 10, fontWeight: "800" },
  langPillTxtActive: { color: C.white },

  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandTextWrap: { alignItems: "flex-end" },
  brandName: {
    color: C.white,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
  },
  brandSub: { color: C.g3, fontSize: 9, textAlign: "right", marginTop: 1 },
  logoWrap: { borderRadius: 12, overflow: "hidden" },
  logoGrad: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  goldBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  goldBarInner: {
    width: 32,
    height: 2,
    backgroundColor: C.gold,
    borderRadius: 2,
  },
  goldBarText: {
    color: C.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  titleWrap: { marginBottom: 16 },
  titleSub: {
    color: C.g2,
    fontSize: 15,
    fontWeight: "500",
    textAlign: "right",
    marginBottom: 4,
  },
  titleMain: {
    color: C.white,
    fontSize: 46,
    fontWeight: "900",
    textAlign: "right",
    lineHeight: 52,
  },
  titleGold: {
    color: C.gold,
    fontSize: 46,
    fontWeight: "900",
    textAlign: "right",
    lineHeight: 52,
  },

  desc: {
    color: C.g3,
    fontSize: 13,
    textAlign: "right",
    lineHeight: 22,
    marginBottom: 22,
  },

  statsRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
    marginBottom: 24,
  },

  testimonial: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    position: "relative",
    overflow: "hidden",
  },
  testimonialBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: C.gold,
    borderRadius: 2,
  },
  testimonialTxt: {
    color: C.g2,
    fontSize: 13,
    lineHeight: 22,
    textAlign: "right",
    fontStyle: "italic",
    marginBottom: 14,
  },
  testimonialAuthor: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  testimonialAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  testimonialInitial: { color: "#fff", fontSize: 14, fontWeight: "800" },
  testimonialName: {
    color: C.g1,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },
  testimonialRole: { color: C.g3, fontSize: 11, textAlign: "right" },

  // ── Card ──
  cardOuter: { paddingHorizontal: 14 },
  card: {
    borderRadius: 24,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border2,
    overflow: "hidden",
    padding: 20,
    shadowColor: C.teal,
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
  },
  cardGlowBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  // Tab
  tabWrap: {
    flexDirection: "row",
    backgroundColor: "#0A1118",
    borderRadius: 14,
    padding: 4,
    position: "relative",
    marginBottom: 22,
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabPill: {
    position: "absolute",
    top: 4,
    width: "48%",
    height: 40,
    backgroundColor: "rgba(43,111,94,0.3)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${C.teal}50`,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  tabTxt: { fontSize: 13, fontWeight: "600", color: C.g3 },
  tabTxtActive: { color: C.white, fontWeight: "800" },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,71,87,0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,71,87,0.25)",
  },
  errorTxt: {
    color: "#FF8A8A",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },

  // Form
  form: { gap: 2 },
  formTitle: {
    color: C.white,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "right",
    marginBottom: 4,
  },
  formSub: { color: C.g3, fontSize: 12, textAlign: "right", marginBottom: 16 },

  // Google
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.surface2,
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: C.border2,
    marginBottom: 16,
  },
  googleIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: { fontSize: 14, fontWeight: "900", color: "#4285F4" },
  googleTxt: { color: C.g1, fontSize: 14, fontWeight: "600" },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerTxt: { color: C.g3, fontSize: 11 },

  // Field
  fieldWrap: { marginBottom: 6 },
  fieldLabel: {
    color: C.g2,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 7,
    marginTop: 6,
  },
  fieldLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 7,
  },
  forgotTxt: { color: C.teal2, fontSize: 11, fontWeight: "600" },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0C1621",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginBottom: 4,
  },
  inputWrapFocused: {
    borderColor: C.teal2,
    backgroundColor: "#0E1E2C",
    shadowColor: C.teal,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  inputInner: {
    flex: 1,
    fontSize: 14,
    color: C.g1,
    paddingVertical: 12,
    textAlign: "right",
  },
  eyeBtn: { padding: 6 },
  input: {}, // legacy compat

  // Primary button
  primaryBtn: { borderRadius: 14, overflow: "hidden", marginTop: 12 },
  primaryBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  primaryBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "800" },

  // Outline button
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border2,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: C.surface2,
  },
  outlineBtnTxt: { color: C.g2, fontSize: 13, fontWeight: "700" },
  rowBtns: { flexDirection: "row", gap: 10 },
  row2: { flexDirection: "row", marginBottom: 4 },

  // Steps
  stepsWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border2,
  },
  stepDotActive: {
    backgroundColor: C.teal,
    borderColor: C.teal,
    shadowColor: C.teal,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  stepDotDone: { backgroundColor: C.gold, borderColor: C.gold },
  stepDotTxt: { color: C.g3, fontSize: 12, fontWeight: "700" },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: C.border2,
    marginHorizontal: 4,
  },
  stepLineDone: { backgroundColor: C.gold },
  stepTitle: {
    color: C.white,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 14,
  },

  // Type cards
  typeGrid: { gap: 8, marginBottom: 4 },
  typeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface2,
    position: "relative",
  },
  typeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  typeLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: C.g2,
    textAlign: "right",
  },
  typeCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  // Summary
  summaryCard: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: `${C.teal}30`,
  },
  summaryGrad: { padding: 14, gap: 6 },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-end",
  },
  summaryTxt: {
    color: C.teal3,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
  },

  // Dev box
  devBox: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${C.gold}30`,
    borderStyle: "dashed",
    padding: 12,
    gap: 10,
  },
  devBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  devBoxTitle: { color: C.gold, fontSize: 11, fontWeight: "700" },
  devRow: { flexDirection: "row", gap: 8 },
  devBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  devBtnTxt: { fontSize: 12, fontWeight: "700" },
});
