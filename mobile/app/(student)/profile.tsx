// app/(student)/profile.tsx
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, useStudent } from "../../src/context/AuthContext";
import { apiClient } from "../../src/api/client";
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from "../../src/constants/theme";

// ── API ──────────────────────────────────────────────────────────
const fetchProfile = async () => {
  const { data } = await apiClient.get("/student/profile");
  return data;
};

// ── Helpers ──────────────────────────────────────────────────────
const GENDER_LABEL: { [key: string]: string } = {
  MALE: "ذكر",
  FEMALE: "أنثى",
  OTHER: "آخر",
};

const CATEGORY_LABEL: { [key: string]: string } = {
  STUDENT: "طالب",
  EXTERNAL: "خارجي",
  EMPLOYEE: "موظف",
};

const STATUS_LABEL: { [key: string]: { label: string; color: string } } = {
  ACTIVE: { label: "نشط", color: Colors.primary },
  INACTIVE: { label: "غير نشط", color: Colors.error },
};

// ── Info Row ─────────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  emoji,
}: {
  label: string;
  value?: string | null;
  emoji: string;
}) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoValue}>{value}</Text>
      <View style={styles.infoLeft}>
        <Text style={styles.infoEmoji}>{emoji}</Text>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
    </View>
  );
}

// ── Section ──────────────────────────────────────────────────────
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
export default function Profile() {
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();
  const student = useStudent();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["student-profile"],
    queryFn: fetchProfile,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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

  const profile = data ?? student;
  const initials =
    `${profile?.first_name?.[0] ?? ""}${profile?.last_name?.[0] ?? ""}`.toUpperCase() ||
    "ط";
  const status = STATUS_LABEL[profile?.status ?? "ACTIVE"];

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            الملف الشخصي {"\uD83D\uDC64"}
          </Text>
        </View>

        {/* ── Loading ── */}
        {isLoading && !profile && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}

        {/* ── Error ── */}
        {isError && !profile && (
          <View style={styles.centerBox}>
            <Text style={styles.centerEmoji}>{"\u26A0\uFE0F"}</Text>
            <Text style={styles.centerText}>فشل تحميل البيانات</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => refetch()}
            >
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}

        {profile && (
          <>
            {/* ── Avatar card ── */}
            <View style={styles.avatarCard}>
              {/* Background decoration */}
              <View style={styles.avatarBg} />

              <View style={styles.avatarContent}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>

                <Text style={styles.profileName}>
                  {profile.first_name} {profile.last_name}
                </Text>

                {profile.email && (
                  <Text style={styles.profileEmail}>{profile.email}</Text>
                )}

                <View style={styles.profileBadges}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: status.color + "15" },
                    ]}
                  >
                    <Text
                      style={[styles.badgeText, { color: status.color }]}
                    >
                      {status.label}
                    </Text>
                  </View>

                  {profile.registrant_category && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: Colors.gold + "15" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: Colors.gold },
                        ]}
                      >
                        {CATEGORY_LABEL[profile.registrant_category] ??
                          profile.registrant_category}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* ── Personal info ── */}
            <Section title="المعلومات الشخصية">
              <InfoRow
                emoji={"\uD83D\uDCDE"}
                label="رقم الهاتف"
                value={profile.phone_number}
              />
              <InfoRow
                emoji={"\uD83C\uDF0D"}
                label="الجنسية"
                value={profile.nationality}
              />
              <InfoRow
                emoji={"\uD83D\uDCC5"}
                label="تاريخ الميلاد"
                value={
                  profile.date_of_birth
                    ? new Date(profile.date_of_birth).toLocaleDateString(
                        "ar-DZ",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : null
                }
              />
              <InfoRow
                emoji={"\uD83D\uDC64"}
                label="الجنس"
                value={
                  profile.gender
                    ? GENDER_LABEL[profile.gender] ?? profile.gender
                    : null
                }
              />
              <InfoRow
                emoji={"\uD83D\uDDE3\uFE0F"}
                label="اللغة"
                value={profile.language}
              />
            </Section>

            {/* ── Academic info ── */}
            <Section title="المعلومات الأكاديمية">
              <InfoRow
                emoji={"\uD83C\uDF93"}
                label="المستوى التعليمي"
                value={profile.education_level}
              />
              <InfoRow
                emoji={"\uD83C\uDFEB"}
                label="مكان الدراسة"
                value={profile.study_location}
              />
              <InfoRow
                emoji={"\uD83D\uDCCB"}
                label="فئة المسجل"
                value={
                  profile.registrant_category
                    ? CATEGORY_LABEL[profile.registrant_category] ??
                      profile.registrant_category
                    : null
                }
              />
            </Section>

            {/* ── Account info ── */}
            <Section title="معلومات الحساب">
              <InfoRow
                emoji={"\uD83D\uDCE7"}
                label="البريد الإلكتروني"
                value={profile.email}
              />
              <InfoRow
                emoji={"\uD83D\uDCC5"}
                label="تاريخ التسجيل"
                value={
                  profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString(
                        "ar-DZ",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : null
                }
              />
            </Section>

            {/* ── Logout ── */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <Text style={styles.logoutEmoji}>{"\uD83D\uDEAA"}</Text>
              <Text style={styles.logoutText}>تسجيل الخروج</Text>
            </TouchableOpacity>

            <Text style={styles.version}>CEIL Mobile v1.0.0</Text>
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === "ios" ? 60 : 48,
  },

  // Header
  header: {
    marginBottom: Spacing.lg,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },

  // Avatar card
  avatarCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  avatarBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: Colors.primary,
  },
  avatarContent: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.surface,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  avatarInitials: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
  profileName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  profileEmail: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
  profileBadges: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },

  // Section
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: "right",
    marginBottom: Spacing.sm,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    ...Shadow.sm,
  },

  // Info row
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoEmoji: { fontSize: 16 },
  infoLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  infoValue: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
    textAlign: "right",
    flex: 1,
    marginLeft: Spacing.sm,
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.error + "10",
    borderWidth: 1,
    borderColor: Colors.error + "25",
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  logoutEmoji: { fontSize: 20 },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.error,
  },

  // Version
  version: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },

  // States
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  centerEmoji: { fontSize: 40 },
  centerText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  retryText: {
    fontSize: FontSize.sm,
    color: "#fff",
    fontWeight: FontWeight.medium,
  },

  bottomPad: {
    height: Platform.OS === "ios" ? 100 : 80,
  },
});