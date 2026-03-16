import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, ArrowRight } from "lucide-react-native";
import { useLogin } from "@/src/hooks/auth/auth.hooks";
import { COLORS, SPACING, RADIUS } from "@/src/constants/theme";

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = t("auth.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = t("auth.emailInvalid");
    if (!password) e.password = t("auth.passwordRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    loginMutation.mutate({ email, password });
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.logoWrap}>
            
            <View>
              <Text style={s.logoTitle}>CEIL</Text>
              <Text style={s.logoSub}>مركز التعليم المكثف للغات</Text>
            </View>
          </View>
        </View>

        {/* ── Tabs ── */}
        <View style={s.tabs}>
          <View style={s.tabActive}>
            <Text style={s.tabActiveText}>{t("auth.signIn")}</Text>
          </View>
          <TouchableOpacity
            style={s.tabInactive}
            onPress={() => router.push("/auth/register")}
            activeOpacity={0.7}
          >
            <Text style={s.tabInactiveText}>{t("auth.createAccount")}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Form Card ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t("auth.signIn")}</Text>
          <Text style={s.cardSubtitle}>{t("auth.signInSubtitle")}</Text>

          {/* Email */}
          <View style={s.field}>
            <Text style={s.label}>{t("auth.email")}</Text>
            <TextInput
              style={[s.input, errors.email && s.inputError]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={s.fieldError}>{errors.email}</Text>}
          </View>

          {/* Password */}
          <View style={s.field}>
            <View style={s.labelRow}>
              <Text style={s.label}>{t("auth.password")}</Text>
              <TouchableOpacity>
                <Text style={s.forgotText}>{t("auth.forgot")}</Text>
              </TouchableOpacity>
            </View>
            <View style={s.passwordWrap}>
              <TextInput
                style={[s.input, s.inputPR, errors.password && s.inputError]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={s.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={18} color={COLORS.textMuted} />
                ) : (
                  <Eye size={18} color={COLORS.textMuted} />
                )}
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={s.fieldError}>{errors.password}</Text>
            )}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              s.submitBtn,
              loginMutation.isPending && s.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loginMutation.isPending}
            activeOpacity={0.85}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={s.submitBtnRow}>
                <Text style={s.submitBtnText}>{t("auth.signIn")}</Text>
                <ArrowRight size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {loginMutation.isError && (
            <View style={s.errorBanner}>
              <Text style={s.errorBannerText}>
                {(loginMutation.error as any)?.response?.data?.message ??
                  t("auth.dialog.invalidCredentials")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F4F0" },
  scroll: { flexGrow: 1, padding: SPACING.lg, paddingTop: 60 },
  header: { alignItems: "center", marginBottom: SPACING.xl },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  logoTitle: { fontSize: 20, fontWeight: "700", color: COLORS.teal },
  logoSub: { fontSize: 11, color: COLORS.textMuted },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 6,
    marginBottom: SPACING.lg,
  },
  tabActive: {
    flex: 1,
    backgroundColor: COLORS.tealMid,
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabActiveText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  tabInactive: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabInactiveText: { color: COLORS.textMuted, fontWeight: "500", fontSize: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.xxl,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
  },
  field: { marginBottom: SPACING.lg },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  forgotText: { fontSize: 12, color: COLORS.tealMid, fontWeight: "500" },
  input: {
    height: 48,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: "#fff",
  },
  inputPR: { paddingRight: 44 },
  inputError: { borderColor: COLORS.red },
  passwordWrap: { position: "relative" },
  eyeBtn: { position: "absolute", right: 14, top: 14 },
  fieldError: { fontSize: 11, color: COLORS.red, marginTop: 4 },
  submitBtn: {
    backgroundColor: COLORS.tealMid,
    borderRadius: RADIUS.lg,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.sm,
    shadowColor: COLORS.tealMid,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  submitBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  errorBanner: {
    marginTop: SPACING.md,
    backgroundColor: "rgba(239,68,68,0.06)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  errorBannerText: { fontSize: 13, color: COLORS.red, textAlign: "center" },
});
