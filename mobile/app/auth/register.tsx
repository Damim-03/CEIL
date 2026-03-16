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
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, ArrowRight } from "lucide-react-native";
import { useRegister } from "@/src/hooks/auth/auth.hooks";
import { COLORS, SPACING, RADIUS } from "@/src/constants/theme";

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const registerMutation = useRegister();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    phone_number: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = () => {
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError(t("auth.passwordsNoMatch"));
      return;
    }
    const { confirmPassword, ...payload } = form;
    registerMutation.mutate(payload as any, {
      onSuccess: () => {
        router.replace("/auth/login");
      },
      onError: (err: any) => {
        setError(err.response?.data?.message ?? "Registration failed");
      },
    });
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
        {/* Header */}
        <View style={s.header}>
          <View style={s.logoWrap}>
            <View>
              <Text style={s.logoTitle}>CEIL</Text>
              <Text style={s.logoSub}>مركز التعليم المكثف للغات</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          <TouchableOpacity
            style={s.tabInactive}
            onPress={() => router.push("/auth/login")}
            activeOpacity={0.7}
          >
            <Text style={s.tabInactiveText}>{t("auth.signIn")}</Text>
          </TouchableOpacity>
          <View style={s.tabActive}>
            <Text style={s.tabActiveText}>{t("auth.createAccount")}</Text>
          </View>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t("auth.createAccount")}</Text>
          <Text style={s.cardSubtitle}>{t("auth.createAccountSubtitle")}</Text>

          {error && (
            <View style={s.errorBanner}>
              <Text style={s.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Name row */}
          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>{t("auth.firstName")}</Text>
              <TextInput
                style={s.input}
                value={form.first_name}
                onChangeText={(v) => update("first_name", v)}
                placeholder={t("auth.firstName")}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>{t("auth.lastName")}</Text>
              <TextInput
                style={s.input}
                value={form.last_name}
                onChangeText={(v) => update("last_name", v)}
                placeholder={t("auth.lastName")}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          {/* Email */}
          <View style={s.field}>
            <Text style={s.label}>{t("auth.email")}</Text>
            <TextInput
              style={s.input}
              value={form.email}
              onChangeText={(v) => update("email", v)}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password row */}
          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>{t("auth.password")}</Text>
              <View style={s.passwordWrap}>
                <TextInput
                  style={[s.input, s.inputPR]}
                  value={form.password}
                  onChangeText={(v) => update("password", v)}
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
                    <EyeOff size={16} color={COLORS.textMuted} />
                  ) : (
                    <Eye size={16} color={COLORS.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>{t("auth.confirmPassword")}</Text>
              <TextInput
                style={s.input}
                value={form.confirmPassword}
                onChangeText={(v) => update("confirmPassword", v)}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Gender row */}
          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>{t("auth.gender")}</Text>
              <View style={s.genderRow}>
                {["Male", "Female"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      s.genderBtn,
                      form.gender === g && s.genderBtnActive,
                    ]}
                    onPress={() => update("gender", g)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        s.genderBtnText,
                        form.gender === g && s.genderBtnTextActive,
                      ]}
                    >
                      {g === "Male" ? t("auth.male") : t("auth.female")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>{t("auth.phone")}</Text>
              <TextInput
                style={s.input}
                value={form.phone_number}
                onChangeText={(v) => update("phone_number", v)}
                placeholder="+213..."
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              s.submitBtn,
              registerMutation.isPending && s.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={registerMutation.isPending}
            activeOpacity={0.85}
          >
            {registerMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={s.submitBtnRow}>
                <Text style={s.submitBtnText}>{t("auth.createAccount")}</Text>
                <ArrowRight size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
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
  row: { flexDirection: "row", gap: SPACING.md },
  field: { marginBottom: SPACING.lg },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    height: 44,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: "#fff",
  },
  inputPR: { paddingRight: 44 },
  passwordWrap: { position: "relative" },
  eyeBtn: { position: "absolute", right: 12, top: 12 },
  genderRow: { flexDirection: "row", gap: SPACING.sm },
  genderBtn: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  genderBtnActive: {
    backgroundColor: COLORS.tealMid,
    borderColor: COLORS.tealMid,
  },
  genderBtnText: { fontSize: 13, color: COLORS.textMuted, fontWeight: "500" },
  genderBtnTextActive: { color: "#fff" },
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
    marginBottom: SPACING.md,
    backgroundColor: "rgba(239,68,68,0.06)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  errorBannerText: { fontSize: 13, color: COLORS.red, textAlign: "center" },
});
