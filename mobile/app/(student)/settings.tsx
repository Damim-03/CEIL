// app/(student)/settings.tsx
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useState } from "react";
import { useAuth } from "../../src/context/AuthContext";
import { Alert } from "react-native";
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from "../../src/constants/theme";

// ── Setting Row ───────────────────────────────────────────────────
function SettingRow({
  emoji,
  label,
  subtitle,
  onPress,
  showArrow = true,
  danger = false,
}: {
  emoji: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingRight}>
        <View
          style={[
            styles.settingIconWrap,
            { backgroundColor: danger ? Colors.error + "12" : Colors.primary + "12" },
          ]}
        >
          <Text style={styles.settingEmoji}>{emoji}</Text>
        </View>
        <View>
          <Text
            style={[
              styles.settingLabel,
              danger && { color: Colors.error },
            ]}
          >
            {label}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {showArrow && (
        <Text style={styles.settingArrow}>›</Text>
      )}
    </TouchableOpacity>
  );
}

// ── Section ───────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function Settings() {
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "تسجيل الخروج",
      "هل أنت متأكد أنك تريد الخروج؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "خروج",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch {
              // silent
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>الإعدادات ⚙️</Text>
        </View>

        {/* ── Notifications ── */}
        <Section title="الإشعارات">
          <View style={styles.settingRow}>
            <View style={styles.settingRight}>
              <View style={[styles.settingIconWrap, { backgroundColor: Colors.gold + "12" }]}>
                <Text style={styles.settingEmoji}>🔔</Text>
              </View>
              <View>
                <Text style={styles.settingLabel}>الإشعارات</Text>
                <Text style={styles.settingSubtitle}>
                  {notificationsEnabled ? "مفعّلة" : "معطّلة"}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.borderLight, true: Colors.primary + "60" }}
              thumbColor={notificationsEnabled ? Colors.primary : Colors.textMuted}
            />
          </View>
        </Section>

        {/* ── About ── */}
        <Section title="حول التطبيق">
          <SettingRow
            emoji="🏫"
            label="مركز التعليم المكثف للغات"
            subtitle="CEIL · El-Oued"
            showArrow={false}
          />
          <SettingRow
            emoji="📱"
            label="إصدار التطبيق"
            subtitle="v1.0.0"
            showArrow={false}
          />
          <SettingRow
            emoji="🌐"
            label="الموقع الإلكتروني"
            subtitle="ceil-eloued.com"
            showArrow={false}
          />
        </Section>

        {/* ── Support ── */}
        <Section title="الدعم">
          <SettingRow
            emoji="📞"
            label="تواصل معنا"
            subtitle="للاستفسارات والمساعدة"
          />
          <SettingRow
            emoji="📋"
            label="الشروط والأحكام"
          />
          <SettingRow
            emoji="🔒"
            label="سياسة الخصوصية"
          />
        </Section>

        {/* ── Logout ── */}
        <Section title="الحساب">
          <SettingRow
            emoji="🚪"
            label="تسجيل الخروج"
            onPress={handleLogout}
            showArrow={false}
            danger
          />
        </Section>

        <Text style={styles.version}>
          CEIL Mobile v1.0.0 · جامعة الشهيد حمّه لخضر
        </Text>

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === "ios" ? 60 : 48,
  },
  header: { marginBottom: Spacing.lg, alignItems: "flex-end" },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    textAlign: "right",
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    ...Shadow.sm,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  settingEmoji: { fontSize: 18 },
  settingLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 20,
    color: Colors.textMuted,
    fontWeight: FontWeight.light,
  },
  version: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  bottomPad: { height: Platform.OS === "ios" ? 100 : 80 },
});