// app/(auth)/index.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  TextInputProps,
} from "react-native";
import { useRef, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "../../src/context/AuthContext";
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
} from "../../src/constants/theme";
import { StatusBar } from "expo-status-bar";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Tab = "login" | "register";
type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

// ══════════════════════════════════════════════════════════════════════════
// FLOATING LABEL INPUT
// ══════════════════════════════════════════════════════════════════════════
interface FloatInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  rightSlot?: React.ReactNode;
  hideSlotWhenBlur?: boolean;
}

function FloatInput({
  label,
  value,
  onChangeText,
  rightSlot,
  hideSlotWhenBlur = false,
  ...rest
}: FloatInputProps) {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(anim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };
  const onBlur = () => {
    setFocused(false);
    if (!value)
      Animated.timing(anim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
  };

  const labelTop = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, -4],
  });
  const labelSize = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 11],
  });
  const labelColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      "rgba(255,255,255,0.3)",
      focused ? "#C4A035" : "rgba(255,255,255,0.5)",
    ],
  });
  const borderColor = focused ? "#C4A035" : "rgba(255,255,255,0.1)";

  return (
    <View style={fiStyles.wrap}>
      <View style={[fiStyles.border, { borderBottomColor: borderColor }]} />
      {focused && <View style={fiStyles.glow} />}
      <Animated.Text
        style={[
          fiStyles.label,
          { top: labelTop, fontSize: labelSize, color: labelColor },
        ]}
      >
        {label}
      </Animated.Text>
      <View style={fiStyles.row}>
        <TextInput
          style={fiStyles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholderTextColor="transparent"
          textAlign="right"
          {...rest}
        />
        {rightSlot && (!hideSlotWhenBlur || focused) && (
          <View style={fiStyles.rightSlot}>{rightSlot}</View>
        )}
      </View>
    </View>
  );
}

const fiStyles = StyleSheet.create({
  wrap: { marginBottom: Spacing.lg, position: "relative" },
  border: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomWidth: 1.5,
  },
  glow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#C4A035",
    shadowColor: "#C4A035",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  label: {
    position: "absolute",
    right: 0,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 8,
  },
  input: { flex: 1, fontSize: 15, color: "#FFFFFF", padding: 0 },
  rightSlot: { marginLeft: 8 },
});

// ══════════════════════════════════════════════════════════════════════════
// GOOGLE ICON
// ══════════════════════════════════════════════════════════════════════════
function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <Path fill="none" d="M0 0h48v48H0z" />
    </Svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ══════════════════════════════════════════════════════════════════════════
export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const slideAnim = useRef(new Animated.Value(0)).current;
  const tabAnim = useRef(new Animated.Value(0)).current;
  const activeTabRef = useRef<Tab>("login");

  const goTo = (tab: Tab) => {
    activeTabRef.current = tab;
    setActiveTab(tab);
    Animated.spring(slideAnim, {
      toValue: tab === "login" ? 0 : -SCREEN_WIDTH,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
    Animated.spring(tabAnim, {
      toValue: tab === "login" ? 0 : 1,
      useNativeDriver: false,
      tension: 68,
      friction: 12,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 12 && Math.abs(g.dy) < 50,
      onPanResponderMove: (_, g) => {
        const base = activeTabRef.current === "login" ? 0 : -SCREEN_WIDTH;
        const next = Math.max(-SCREEN_WIDTH, Math.min(0, base + g.dx));
        slideAnim.setValue(next);
        tabAnim.setValue(-next / SCREEN_WIDTH);
      },
      onPanResponderRelease: (_, g) => {
        const THRESHOLD = SCREEN_WIDTH * 0.28;
        const cur = activeTabRef.current;
        if (cur === "login" && g.dx < -THRESHOLD) goTo("register");
        else if (cur === "register" && g.dx > THRESHOLD) goTo("login");
        else goTo(cur);
      },
    }),
  ).current;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.bgLayer1} />
      <View style={styles.bgAccent} />
      <View style={styles.bgAccent2} />
      <View style={styles.bgAccent3} />

      {/* Logo */}
      <View style={styles.logoSection}>
        <View style={styles.logoWrap}>
          <Image
            source={require("../../assets/logo-2.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.logoTextWrap}>
          <Text style={styles.logoTitle}>CEIL</Text>
          <Text style={styles.logoSubtitle}>مركز التعليم المكثّف للغات</Text>
          <Text style={styles.logoUniv}>جامعة الشهيد حمّه لخضر · الوادي</Text>
        </View>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabContainer}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => goTo("login")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "login" && styles.tabTextActive,
              ]}
            >
              تسجيل الدخول
            </Text>
            <Animated.View
              style={[
                styles.tabActiveSlider,
                {
                  opacity: tabAnim.interpolate({
                    inputRange: [0, 0.5],
                    outputRange: [1, 0],
                    extrapolate: "clamp",
                  }),
                },
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => goTo("register")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "register" && styles.tabTextActive,
              ]}
            >
              إنشاء حساب
            </Text>
            <Animated.View
              style={[
                styles.tabActiveSlider,
                {
                  opacity: tabAnim.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [0, 1],
                    extrapolate: "clamp",
                  }),
                },
              ]}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                left: tabAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["50%", "0%"],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Swipeable panels */}
      <Animated.View
        style={[
          styles.slidingWrapper,
          { transform: [{ translateX: slideAnim }] },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.panel, { width: SCREEN_WIDTH }]}>
          <LoginPanel />
        </View>
        <View style={[styles.panel, { width: SCREEN_WIDTH }]}>
          <RegisterPanel onGoToLogin={() => goTo("login")} />
        </View>
      </Animated.View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// LOGIN PANEL
// ══════════════════════════════════════════════════════════════════════════
function LoginPanel() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "حدث خطأ، حاول مرة أخرى",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid
      extraScrollHeight={24}
      enableAutomaticScroll
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>تسجيل الدخول</Text>
        <Text style={styles.cardSub}>أدخل بياناتك للوصول إلى حسابك</Text>

        <TouchableOpacity style={styles.googleBtn} onPress={loginWithGoogle}>
          <GoogleIcon size={20} />
          <Text style={styles.googleText}>المتابعة مع جوجل</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>أو الدخول بالبريد الإلكتروني</Text>
          <View style={styles.dividerLine} />
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <FloatInput
          label="البريد الإلكتروني"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <FloatInput
          label="كلمة المرور"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          hideSlotWhenBlur
          rightSlot={
            <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
              <Text style={styles.eyeIcon}>{showPassword ? "◉" : "◎"}</Text>
            </TouchableOpacity>
          }
        />

        <TouchableOpacity
          style={[styles.btn, isLoading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.btnText}>← تسجيل الدخول</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// REGISTER PANEL
// ══════════════════════════════════════════════════════════════════════════
function RegisterPanel({ onGoToLogin }: { onGoToLogin: () => void }) {
  const { register, loginWithGoogle } = useAuth();
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof FormState) => (val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const validate = (): string | null => {
    if (Object.values(form).some((v) => !v.trim()))
      return "يرجى ملء جميع الحقول";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "البريد الإلكتروني غير صحيح";
    if (!/^0[567]\d{8}$/.test(form.phone))
      return "رقم الهاتف غير صحيح (مثال: 0550123456)";
    if (form.password.length < 8)
      return "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    if (form.password !== form.confirmPassword)
      return "كلمتا المرور غير متطابقتين";
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      });
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "حدث خطأ، حاول مرة أخرى",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid
      extraScrollHeight={24}
      enableAutomaticScroll
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>إنشاء حساب</Text>
        <Text style={styles.cardSub}>أملأ بياناتك للبدء</Text>

        <TouchableOpacity
          style={styles.googleBtn}
          onPress={loginWithGoogle}
          activeOpacity={0.85}
        >
          <GoogleIcon size={20} />
          <Text style={styles.googleText}>التسجيل عبر جوجل</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>أو التسجيل بالبريد الإلكتروني</Text>
          <View style={styles.dividerLine} />
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.nameRow}>
          <View style={styles.nameHalf}>
            <FloatInput
              label="الاسم"
              value={form.firstName}
              onChangeText={set("firstName")}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.nameHalf}>
            <FloatInput
              label="اللقب"
              value={form.lastName}
              onChangeText={set("lastName")}
              autoCapitalize="words"
            />
          </View>
        </View>

        <FloatInput
          label="البريد الإلكتروني"
          value={form.email}
          onChangeText={set("email")}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.nameRow}>
          <View style={styles.nameHalf}>
            <FloatInput
              label="كلمة المرور"
              value={form.password}
              onChangeText={set("password")}
              secureTextEntry={!showPassword}
              hideSlotWhenBlur
              rightSlot={
                <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                  <Text style={styles.eyeIcon}>{showPassword ? "◉" : "◎"}</Text>
                </TouchableOpacity>
              }
            />
          </View>
          <View style={styles.nameHalf}>
            <FloatInput
              label="تأكيد كلمة المرور"
              value={form.confirmPassword}
              onChangeText={set("confirmPassword")}
              secureTextEntry={!showConfirm}
              hideSlotWhenBlur
              rightSlot={
                <TouchableOpacity onPress={() => setShowConfirm((p) => !p)}>
                  <Text style={styles.eyeIcon}>{showConfirm ? "◉" : "◎"}</Text>
                </TouchableOpacity>
              }
            />
          </View>
        </View>

        {form.password.length > 0 && (
          <PasswordStrength password={form.password} />
        )}

        <FloatInput
          label="رقم الهاتف"
          value={form.phone}
          onChangeText={set("phone")}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[styles.btn, isLoading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.btnText}>← إنشاء حساب</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          التسجيل مخصص للطلاب المقبولين في البرنامج فقط
        </Text>
      </View>
    </KeyboardAwareScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// PASSWORD STRENGTH
// ══════════════════════════════════════════════════════════════════════════
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["ضعيفة جدًا", "ضعيفة", "متوسطة", "قوية", "قوية جدًا"];
  const barColors = ["#FF4D4D", "#FF8C00", "#FFC300", "#4CAF50", "#2E7D32"];
  return (
    <View style={pwStyles.wrap}>
      <View style={pwStyles.bars}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              pwStyles.bar,
              {
                backgroundColor:
                  i < score ? barColors[score] : "rgba(255,255,255,0.1)",
              },
            ]}
          />
        ))}
      </View>
      <Text style={[pwStyles.label, { color: barColors[score] ?? "#666" }]}>
        {labels[score]}
      </Text>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D1F1A" },
  flex: { flex: 1 },

  bgLayer1: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0D1F1A" },
  bgAccent: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.primary,
    opacity: 0.12,
  },
  bgAccent2: {
    position: "absolute",
    top: 60,
    left: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#C4A035",
    opacity: 0.06,
  },
  bgAccent3: {
    position: "absolute",
    bottom: 100,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.primary,
    opacity: 0.07,
  },

  logoSection: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: 44,
    paddingBottom: 0,
  },
  logoWrap: {
    width: 70,
    height: 70,
    borderRadius: Radius.xl,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: Spacing.sm,
  },
  logo: { width: 84, height: 84 },
  logoTextWrap: { alignItems: "center" },
  logoTitle: {
    fontSize: 26,
    fontWeight: FontWeight.bold,
    color: "#FFFFFF",
    letterSpacing: 8,
  },
  logoSubtitle: {
    fontSize: FontSize.sm,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
    textAlign: "center",
  },
  logoUniv: {
    fontSize: FontSize.xs,
    color: "rgba(255,255,255,0.3)",
    marginTop: 3,
    letterSpacing: 0.3,
    textAlign: "center",
  },

  tabContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 0,
  },
  tabRow: { flexDirection: "row" },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    paddingHorizontal: Spacing.lg,
    position: "relative",
  },
  tabText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  tabActiveSlider: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#C4A035",
    shadowColor: "#C4A035",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  progressTrack: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    position: "relative",
    overflow: "hidden",
  },
  progressFill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: "rgba(196,160,53,0.15)",
  },

  slidingWrapper: {
    flex: 1,
    flexDirection: "row",
    width: SCREEN_WIDTH * 2,
    overflow: "hidden",
  },
  panel: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.sm,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: "#FFFFFF",
    textAlign: "right",
    marginBottom: 4,
  },
  cardSub: {
    fontSize: FontSize.sm,
    color: "rgba(255,255,255,0.35)",
    textAlign: "right",
    marginBottom: Spacing.lg,
  },

  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: Radius.md,
    height: 50,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: Spacing.md,
  },
  googleText: {
    fontSize: FontSize.md,
    color: "#BBBBBB",
    fontWeight: FontWeight.medium,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  dividerText: { fontSize: FontSize.xs, color: "rgba(255,255,255,0.25)" },

  errorBox: {
    backgroundColor: "rgba(255,77,77,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,77,77,0.25)",
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: { fontSize: FontSize.sm, color: "#FF6B6B", textAlign: "right" },

  nameRow: { flexDirection: "row", gap: Spacing.lg },
  nameHalf: { flex: 1 },
  eyeIcon: { fontSize: 15, color: "rgba(255,255,255,0.5)" },

  btn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(196,160,53,0.3)",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  note: {
    fontSize: FontSize.xs,
    color: "rgba(255,255,255,0.2)",
    textAlign: "center",
    marginTop: Spacing.md,
    lineHeight: 18,
  },
});

const pwStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    justifyContent: "flex-end",
  },
  bars: { flexDirection: "row", gap: 4 },
  bar: { width: 28, height: 3, borderRadius: 2 },
  label: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
});
