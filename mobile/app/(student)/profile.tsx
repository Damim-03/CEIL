import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Shield,
  CheckCircle,
  Globe,
  GraduationCap,
  Languages,
  Users,
  Sparkles,
  ChevronRight,
} from "lucide-react-native";
import { useStudentProfile } from "@/src/hooks/student/Usestudent";
import { useMe } from "@/src/hooks/auth/auth.hooks";
import { PageLoader, ErrorState, CircularProgress } from "@/src/components/ui";
import { COLORS, SPACING, RADIUS } from "@/src/constants/theme";
import { useTranslation } from "react-i18next";

// ─── InfoTile ──────────────────────────────────────────────────────────────────
function InfoTile({
  icon: Icon,
  label,
  value,
  teal = false,
}: {
  icon: any;
  label: string;
  value: string;
  teal?: boolean;
}) {
  const color = teal ? COLORS.tealMid : COLORS.gold;
  return (
    <View style={[it.wrap, { borderColor: `${color}18` }]}>
      <View
        style={[
          it.iconBox,
          { backgroundColor: `${color}12`, borderColor: `${color}20` },
        ]}
      >
        <Icon size={16} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={it.label}>{label}</Text>
        <Text style={[it.value, value === "—" && it.valueMuted]}>{value}</Text>
      </View>
      <ChevronRight size={13} color="rgba(255,255,255,0.15)" />
    </View>
  );
}

const it = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.025)",
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  label: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "rgba(255,255,255,0.3)",
    marginBottom: 2,
  },
  value: { fontSize: 13, fontWeight: "500", color: "rgba(255,255,255,0.8)" },
  valueMuted: { color: "rgba(255,255,255,0.2)", fontStyle: "italic" },
});

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  teal = false,
}: {
  icon: any;
  title: string;
  teal?: boolean;
}) {
  const color = teal ? COLORS.tealMid : COLORS.gold;
  return (
    <View style={sh.wrap}>
      <View
        style={[
          sh.iconBox,
          { backgroundColor: `${color}12`, borderColor: `${color}20` },
        ]}
      >
        <Icon size={14} color={color} />
      </View>
      <Text style={[sh.label, { color }]}>{title}</Text>
      <View style={[sh.line, { backgroundColor: `${color}30` }]} />
    </View>
  );
}

const sh = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  line: { flex: 1, height: 1 },
});

// ─── Field Input ───────────────────────────────────────────────────────────────
function FieldInput({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <View style={fi.wrap}>
      <Text style={fi.label}>{label}</Text>
      <TextInput
        style={[fi.input, disabled && fi.inputDisabled]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.2)"
        editable={!disabled}
        autoCapitalize="none"
      />
    </View>
  );
}

const fi = StyleSheet.create({
  wrap: { marginBottom: SPACING.md },
  label: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "rgba(255,255,255,0.35)",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 11,
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.82)",
  },
  inputDisabled: { color: "rgba(255,255,255,0.22)", opacity: 0.7 },
});

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { t } = useTranslation();
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    updateProfile,
    uploadAvatar,
  } = useStudentProfile();
  const { data: me } = useMe();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  if (isLoading) return <PageLoader />;
  if (isError)
    return <ErrorState message={(error as any)?.message} onRetry={refetch} />;

  const p = profile || {};
  const displayName =
    p.first_name && p.last_name
      ? `${p.first_name} ${p.last_name}`
      : me?.email?.split("@")[0] || "Student";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const completionPct = p.completionPercentage ?? 0;
  const isComplete = completionPct >= 100;

  const startEdit = () => {
    setForm({
      first_name: p.first_name || "",
      last_name: p.last_name || "",
      phone_number: p.phone_number || "",
      date_of_birth: p.date_of_birth
        ? String(p.date_of_birth).slice(0, 10)
        : "",
      address: p.address || "",
      city: p.city || "",
      nationality: p.nationality || "",
      education_level: p.education_level || "",
    });
    setEditing(true);
  };

  const saveEdit = () => {
    updateProfile.mutate(form, {
      onSuccess: () => setEditing(false),
    });
  };

  const handleAvatarPick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant photo library access");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("avatar", {
        uri: asset.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);
      uploadAvatar.mutate(formData as any);
    }
  };

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.gold}
        />
      }
    >
      {/* ── Hero Section (dark bg) ── */}
      <View style={s.hero}>
        {/* decorative circles */}
        <View style={[s.deco1]} />
        <View style={[s.deco2]} />

        {/* Edit / Save / Cancel buttons */}
        <View style={s.heroActions}>
          {editing ? (
            <>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => setEditing(false)}
                activeOpacity={0.8}
              >
                <X size={16} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
              <TouchableOpacity
                style={s.saveBtn}
                onPress={saveEdit}
                disabled={updateProfile.isPending}
                activeOpacity={0.85}
              >
                <Save size={16} color="#fff" />
                <Text style={s.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={s.editBtn}
              onPress={startEdit}
              activeOpacity={0.8}
            >
              <Edit size={16} color={COLORS.gold} />
              <Text style={s.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Avatar */}
        <View style={s.avatarSection}>
          <TouchableOpacity
            onPress={handleAvatarPick}
            activeOpacity={0.85}
            style={s.avatarTouch}
          >
            {p.avatar_url || me?.google_avatar ? (
              <Image
                source={{ uri: p.avatar_url || me?.google_avatar }}
                style={s.avatar}
              />
            ) : (
              <View style={s.avatarFallback}>
                <Text style={s.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={s.avatarEditBadge}>
              <Edit size={10} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Completion ring */}
          <View style={s.completionWrap}>
            <CircularProgress
              percentage={completionPct}
              size={100}
              strokeWidth={7}
              color={isComplete ? COLORS.gold : COLORS.tealMid}
              label={isComplete ? "Complete" : "Profile"}
            />
          </View>
        </View>

        <Text style={s.heroName}>{displayName}</Text>
        <Text style={s.heroEmail}>{me?.email}</Text>

        {/* Role & status pills */}
        <View style={s.pillsRow}>
          <View style={s.rolePill}>
            <GraduationCap size={12} color={COLORS.gold} />
            <Text style={s.rolePillText}>Student</Text>
          </View>
          <View style={[s.rolePill, isComplete && s.rolePillGreen]}>
            {isComplete ? (
              <CheckCircle size={12} color={COLORS.tealLight} />
            ) : (
              <Sparkles size={12} color="rgba(255,255,255,0.4)" />
            )}
            <Text
              style={[
                s.rolePillText,
                isComplete && { color: COLORS.tealLight },
              ]}
            >
              {isComplete ? "Profile Complete" : `${completionPct}% Complete`}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Info / Edit Section ── */}
      <View style={s.infoSection}>
        {editing ? (
          /* Edit Mode */
          <>
            <SectionHeader icon={User} title="Personal Information" />
            <View style={s.fieldRow}>
              <View style={{ flex: 1 }}>
                <FieldInput
                  label="First Name"
                  value={form.first_name}
                  onChange={(v) => setForm((f) => ({ ...f, first_name: v }))}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FieldInput
                  label="Last Name"
                  value={form.last_name}
                  onChange={(v) => setForm((f) => ({ ...f, last_name: v }))}
                />
              </View>
            </View>
            <FieldInput label="Email" value={me?.email || ""} disabled />
            <FieldInput
              label="Phone"
              value={form.phone_number}
              onChange={(v) => setForm((f) => ({ ...f, phone_number: v }))}
              placeholder="+213..."
            />
            <FieldInput
              label="Date of Birth"
              value={form.date_of_birth}
              onChange={(v) => setForm((f) => ({ ...f, date_of_birth: v }))}
              placeholder="YYYY-MM-DD"
            />

            <SectionHeader icon={MapPin} title="Location & Education" teal />
            <FieldInput
              label="Address"
              value={form.address}
              onChange={(v) => setForm((f) => ({ ...f, address: v }))}
            />
            <FieldInput
              label="City"
              value={form.city}
              onChange={(v) => setForm((f) => ({ ...f, city: v }))}
            />
            <FieldInput
              label="Nationality"
              value={form.nationality}
              onChange={(v) => setForm((f) => ({ ...f, nationality: v }))}
            />
            <FieldInput
              label="Education Level"
              value={form.education_level}
              onChange={(v) => setForm((f) => ({ ...f, education_level: v }))}
            />
          </>
        ) : (
          /* View Mode */
          <>
            <SectionHeader icon={User} title="Personal Information" />
            <InfoTile icon={User} label="Full Name" value={displayName} />
            <InfoTile icon={Mail} label="Email" value={me?.email || "—"} />
            <InfoTile
              icon={Phone}
              label="Phone"
              value={p.phone_number || "—"}
            />
            <InfoTile
              icon={Calendar}
              label="Date of Birth"
              value={
                p.date_of_birth ? String(p.date_of_birth).slice(0, 10) : "—"
              }
            />
            <InfoTile icon={Users} label="Gender" value={p.gender || "—"} />

            <SectionHeader icon={Globe} title="Location & Education" teal />
            <InfoTile
              icon={MapPin}
              label="Address"
              value={p.address || "—"}
              teal
            />
            <InfoTile icon={MapPin} label="City" value={p.city || "—"} teal />
            <InfoTile
              icon={Globe}
              label="Nationality"
              value={p.nationality || "—"}
              teal
            />
            <InfoTile
              icon={Languages}
              label="Education Level"
              value={p.education_level || "—"}
              teal
            />

            <SectionHeader icon={Shield} title="Account" teal />
            <InfoTile icon={Shield} label="Role" value="Student" teal />
            <InfoTile
              icon={CheckCircle}
              label="Account Status"
              value="Active"
              teal
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0D0D" },
  content: { paddingBottom: 40 },

  // Hero
  hero: {
    backgroundColor: "#111111",
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  deco1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${COLORS.tealMid}15`,
  },
  deco2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.gold}10`,
  },
  heroActions: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    gap: SPACING.sm,
    zIndex: 10,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "rgba(196,160,53,0.12)",
    borderWidth: 1,
    borderColor: "rgba(196,160,53,0.25)",
  },
  editBtnText: { fontSize: 12, color: COLORS.gold, fontWeight: "600" },
  cancelBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
  },
  saveBtnText: { fontSize: 12, color: "#fff", fontWeight: "600" },

  // Avatar
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  avatarTouch: { position: "relative" },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: "rgba(196,160,53,0.4)",
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${COLORS.tealMid}25`,
    borderWidth: 3,
    borderColor: "rgba(196,160,53,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { fontSize: 28, fontWeight: "700", color: COLORS.gold },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#111111",
  },
  completionWrap: { alignItems: "center" },

  heroName: {
    fontSize: 22,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  heroEmail: {
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
    marginTop: 4,
    textAlign: "center",
  },
  pillsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  rolePillGreen: {
    backgroundColor: "rgba(74,222,128,0.08)",
    borderColor: "rgba(74,222,128,0.15)",
  },
  rolePillText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
  },

  // Info Section
  infoSection: {
    margin: SPACING.lg,
    backgroundColor: "rgba(255,255,255,0.015)",
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: SPACING.xl,
  },
  fieldRow: { flexDirection: "row", gap: SPACING.md },
});
