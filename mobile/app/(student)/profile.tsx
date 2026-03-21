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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  Dimensions,
  StatusBar,
  Animated,
  PanResponder,
  Image,
} from "react-native";
import { useState, useRef } from "react";
import { useAuth, useStudent } from "../../src/context/AuthContext";
import {
  useProfile,
  useUpdateProfile,
  useDocuments,
} from "../../src/hooks/useStudent";
import StudentIDCard from "../../src/components/student/StudentIDCard";
import { FontWeight } from "../../src/constants/theme";

const TEAL = "#264230";
const TEAL2 = "#4A7065";
const GOLD = "#C4A035";
const CREAM = "#F5F0E8";
const MUTED = "#8A7A6A";
const INK = "#1B1B1B";
const WHITE = "#FFFFFF";
const ERR = "#C0392B";

type TabKey = "account" | "card";

interface EditForm {
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
  nationality: string;
  education_level: string;
  study_location: string;
}

function getInitials(p: any): string {
  const f = p?.first_name?.[0] ?? "";
  const l = p?.last_name?.[0] ?? "";
  return (f + l).toUpperCase() || p?.email?.[0]?.toUpperCase() || "؟";
}

function getFullName(p: any): string {
  const full = `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim();
  return full || p?.email?.split("@")[0] || "—";
}

function formatDate(d?: string | null): string | null {
  if (!d) return null;
  return new Date(d).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Edit Modal (unchanged) ────────────────────────────────────────
const EDIT_FIELDS: {
  key: keyof EditForm;
  label: string;
  icon: string;
  placeholder: string;
  keyboard?: "default" | "phone-pad";
}[] = [
  {
    key: "first_name",
    icon: "◈",
    label: "الاسم الأول",
    placeholder: "أدخل الاسم الأول",
  },
  {
    key: "last_name",
    icon: "◈",
    label: "اسم العائلة",
    placeholder: "أدخل اسم العائلة",
  },
  {
    key: "phone_number",
    icon: "◎",
    label: "رقم الهاتف",
    placeholder: "05XXXXXXXX",
    keyboard: "phone-pad",
  },
  {
    key: "date_of_birth",
    icon: "◷",
    label: "تاريخ الميلاد",
    placeholder: "YYYY-MM-DD",
  },
  { key: "nationality", icon: "◉", label: "الجنسية", placeholder: "الجزائرية" },
  {
    key: "education_level",
    icon: "◑",
    label: "المستوى التعليمي",
    placeholder: "ماستر 1",
  },
  {
    key: "study_location",
    icon: "◐",
    label: "مكان الدراسة",
    placeholder: "جامعة الشهيد حمة لخضر",
  },
];

const SH = Dimensions.get("window").height;
const SHEET_MIN_H = SH * 0.5;
const SHEET_MAX_H = SH * 0.92;
const CLOSE_THRESHOLD = 80;
const EXPAND_THRESHOLD = 60;

function EditProfileModal({
  visible,
  profile,
  onClose,
}: {
  visible: boolean;
  profile: any;
  onClose: () => void;
}) {
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const sheetH = useRef(new Animated.Value(SHEET_MIN_H)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const currentH = useRef(SHEET_MIN_H);
  const scrollAtTop = useRef(true);

  const [form, setForm] = useState<EditForm>({
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    phone_number: profile?.phone_number ?? "",
    date_of_birth: profile?.date_of_birth?.slice(0, 10) ?? "",
    nationality: profile?.nationality ?? "",
    education_level: profile?.education_level ?? "",
    study_location: profile?.study_location ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EditForm, string>>>(
    {},
  );

  const prevVisible = useRef(false);
  if (visible && !prevVisible.current) {
    currentH.current = SHEET_MIN_H;
    sheetH.setValue(SHEET_MIN_H);
    translateY.setValue(0);
  }
  prevVisible.current = visible;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 4,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) {
          if (!scrollAtTop.current) return;
          translateY.setValue(gs.dy);
        } else {
          sheetH.setValue(Math.min(SHEET_MAX_H, currentH.current - gs.dy));
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > CLOSE_THRESHOLD || gs.vy > 0.8) {
          Animated.timing(translateY, {
            toValue: SH,
            duration: 280,
            useNativeDriver: false,
          }).start(onClose);
        } else if (gs.dy < -EXPAND_THRESHOLD) {
          Animated.spring(sheetH, {
            toValue: SHEET_MAX_H,
            useNativeDriver: false,
            tension: 65,
            friction: 11,
          }).start();
          currentH.current = SHEET_MAX_H;
          translateY.setValue(0);
        } else {
          Animated.parallel([
            Animated.spring(sheetH, {
              toValue: currentH.current,
              useNativeDriver: false,
              tension: 80,
              friction: 12,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: false,
              tension: 80,
              friction: 12,
            }),
          ]).start();
        }
      },
    }),
  ).current;

  function validate() {
    const e: typeof errors = {};
    if (!form.first_name.trim()) e.first_name = "مطلوب";
    if (!form.last_name.trim()) e.last_name = "مطلوب";
    if (form.phone_number && !/^0[5-7]\d{8}$/.test(form.phone_number))
      e.phone_number = "رقم غير صحيح";
    if (form.date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(form.date_of_birth))
      e.date_of_birth = "الصيغة: YYYY-MM-DD";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSave() {
    if (!validate()) return;
    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v.trim() !== ""),
      );
      await updateProfile(payload);
      onClose();
    } catch (err: any) {
      Alert.alert("خطأ", err?.response?.data?.message ?? "فشل الحفظ");
    }
  }

  const overlayOpacity = translateY.interpolate({
    inputRange: [0, SH * 0.5],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Animated.View style={[em.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[em.sheet, { height: sheetH, transform: [{ translateY }] }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={em.dragZone} {...panResponder.panHandlers}>
            <View style={em.drag} />
            <View style={em.hdr}>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Text style={em.cancel}>إلغاء</Text>
              </TouchableOpacity>
              <View style={em.hdrCenter}>
                <Text style={em.hdrTitle}>تعديل الملف الشخصي</Text>
                <Text style={em.hdrHint}>↕ اسحب للتوسيع أو الإغلاق</Text>
              </View>
              <TouchableOpacity
                onPress={handleSave}
                style={[em.saveBtn, isPending && { opacity: 0.55 }]}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color={WHITE} />
                ) : (
                  <Text style={em.saveTxt}>حفظ</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            contentContainerStyle={em.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            onScroll={(e) => {
              scrollAtTop.current = e.nativeEvent.contentOffset.y <= 2;
            }}
          >
            {EDIT_FIELDS.map((f, i) => (
              <View key={f.key} style={em.row}>
                <View style={em.labelRow}>
                  <Text style={em.icon}>{f.icon}</Text>
                  <Text style={em.lbl}>{f.label}</Text>
                </View>
                <TextInput
                  style={[em.inp, errors[f.key] ? em.inpErr : null]}
                  value={form[f.key]}
                  onChangeText={(v) => {
                    setForm((p) => ({ ...p, [f.key]: v }));
                    if (errors[f.key])
                      setErrors((p) => ({ ...p, [f.key]: undefined }));
                  }}
                  placeholder={f.placeholder}
                  placeholderTextColor={MUTED + "60"}
                  keyboardType={f.keyboard ?? "default"}
                  returnKeyType={i < EDIT_FIELDS.length - 1 ? "next" : "done"}
                  textAlign="right"
                />
                {errors[f.key] && (
                  <Text style={em.errTxt}>{errors[f.key]}</Text>
                )}
              </View>
            ))}
            <View style={{ height: 48 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const em = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.52)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: WHITE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 24,
    overflow: "hidden",
  },
  dragZone: { paddingBottom: 4 },
  drag: {
    width: 40,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: "#C8BEB4",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  hdr: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: CREAM,
  },
  hdrCenter: { alignItems: "center", flex: 1 },
  hdrTitle: { fontSize: 15, fontWeight: FontWeight.bold, color: INK },
  hdrHint: { fontSize: 10, color: MUTED + "90", marginTop: 2 },
  cancel: { fontSize: 14, color: MUTED, fontWeight: FontWeight.medium },
  saveBtn: {
    backgroundColor: TEAL,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
  },
  saveTxt: { fontSize: 13, fontWeight: FontWeight.bold, color: WHITE },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  row: { marginBottom: 18 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    justifyContent: "flex-end",
  },
  icon: { fontSize: 13, color: TEAL2 },
  lbl: { fontSize: 13, fontWeight: FontWeight.semibold, color: INK },
  inp: {
    backgroundColor: CREAM,
    borderWidth: 1.5,
    borderColor: "transparent",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    color: INK,
  },
  inpErr: { borderColor: ERR, backgroundColor: "#FEF2F2" },
  errTxt: { fontSize: 11, color: ERR, textAlign: "right", marginTop: 5 },
});

// ── Info Item ─────────────────────────────────────────────────────
function InfoItem({
  label,
  value,
  last,
}: {
  label: string;
  value?: string | null;
  last?: boolean;
}) {
  if (!value) return null;
  return (
    <View style={[ii.row, last && { borderBottomWidth: 0 }]}>
      <Text style={ii.val}>{value}</Text>
      <Text style={ii.lbl}>{label}</Text>
    </View>
  );
}
const ii = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: CREAM,
  },
  lbl: { fontSize: 12, color: MUTED, fontWeight: FontWeight.medium },
  val: {
    fontSize: 14,
    color: INK,
    fontWeight: FontWeight.semibold,
    flex: 1,
    textAlign: "left",
    marginLeft: 12,
  },
});

// ── Block ─────────────────────────────────────────────────────────
function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={bl.wrap}>
      <Text style={bl.title}>{title}</Text>
      <View style={bl.card}>{children}</View>
    </View>
  );
}
const bl = StyleSheet.create({
  wrap: { marginBottom: 20 },
  title: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: TEAL2,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    textAlign: "right",
    marginBottom: 10,
    paddingRight: 4,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CREAM,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
});

// ── Hero Banner — ✅ يعرض صورة حقيقية ────────────────────────────
function HeroBanner({
  profile,
  avatarUrl,
  activeTab,
  onTabChange,
  onEdit,
}: {
  profile: any;
  avatarUrl: string | null;
  activeTab: TabKey;
  onTabChange: (t: TabKey) => void;
  onEdit: () => void;
}) {
  const initials = getInitials(profile);
  const fullName = getFullName(profile);
  const isActive = profile?.status === "ACTIVE";

  return (
    <View style={hb.root}>
      <View style={hb.bgBase} />
      <View style={hb.bgAccent} />
      <View style={hb.goldLine} />

      <View style={hb.content}>
        {/* ✅ Avatar — صورة حقيقية أو أحرف */}
        <View style={hb.avatarShell}>
          <View style={hb.avatarRing}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={hb.avatarImg}
                resizeMode="cover"
              />
            ) : (
              <View style={hb.avatar}>
                <Text style={hb.avatarTxt}>{initials}</Text>
              </View>
            )}
          </View>
          <View
            style={[
              hb.statusDot,
              { backgroundColor: isActive ? "#4CAF50" : ERR },
            ]}
          />
        </View>

        <Text style={hb.name}>{fullName}</Text>
        <Text style={hb.email}>{profile?.email ?? ""}</Text>

        <TouchableOpacity
          style={hb.editPill}
          onPress={onEdit}
          activeOpacity={0.8}
        >
          <Text style={hb.editPillTxt}>✦ تعديل الملف</Text>
        </TouchableOpacity>
      </View>

      <View style={hb.tabs}>
        {(
          [
            { key: "account", label: "الحساب" },
            { key: "card", label: "بطاقتي" },
          ] as { key: TabKey; label: string }[]
        ).map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => onTabChange(t.key)}
            style={[hb.tab, activeTab === t.key && hb.tabActive]}
            activeOpacity={0.7}
          >
            <Text style={[hb.tabTxt, activeTab === t.key && hb.tabTxtActive]}>
              {t.label}
            </Text>
            {activeTab === t.key && <View style={hb.tabBar} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const hb = StyleSheet.create({
  root: { overflow: "hidden" },
  bgBase: { ...StyleSheet.absoluteFillObject, backgroundColor: TEAL },
  bgAccent: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: TEAL2,
    opacity: 0.35,
  },
  goldLine: {
    position: "absolute",
    bottom: 44,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.25,
  },
  content: {
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 48,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },

  avatarShell: { position: "relative", marginBottom: 14 },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: GOLD + "80",
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  // ✅ صورة حقيقية
  avatarImg: { width: 82, height: 82, borderRadius: 41 },
  // fallback حروف
  avatar: {
    flex: 1,
    width: "100%",
    borderRadius: 999,
    backgroundColor: TEAL2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { fontSize: 26, fontWeight: FontWeight.bold, color: WHITE },
  statusDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: TEAL,
  },

  name: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: WHITE,
    marginBottom: 4,
  },
  email: { fontSize: 12, color: WHITE + "99", marginBottom: 16 },
  editPill: {
    backgroundColor: WHITE + "18",
    borderWidth: 1,
    borderColor: WHITE + "30",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  editPillTxt: { fontSize: 12, color: WHITE, fontWeight: FontWeight.semibold },

  tabs: {
    flexDirection: "row",
    backgroundColor: TEAL + "CC",
    borderTopWidth: 1,
    borderTopColor: WHITE + "15",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 13,
    position: "relative",
  },
  tabActive: {},
  tabTxt: { fontSize: 13, color: WHITE + "80", fontWeight: FontWeight.medium },
  tabTxtActive: { color: WHITE, fontWeight: FontWeight.bold },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: GOLD,
    borderRadius: 1,
  },
});

// ── Tabs content ──────────────────────────────────────────────────
function AccountTab({ profile }: { profile: any }) {
  return (
    <>
      <Block title="معلومات الحساب">
        <InfoItem label="البريد الإلكتروني" value={profile.email} />
        <InfoItem
          label="تاريخ التسجيل"
          value={formatDate(profile.created_at)}
        />
        <InfoItem
          label="رقم التعريف"
          value={profile.student_id?.toUpperCase().slice(0, 16)}
          last
        />
      </Block>
      <Block title="المعلومات الشخصية">
        <InfoItem label="رقم الهاتف" value={profile.phone_number} />
        <InfoItem label="الجنسية" value={profile.nationality} />
        <InfoItem
          label="تاريخ الميلاد"
          value={formatDate(profile.date_of_birth)}
        />
        <InfoItem label="المستوى" value={profile.education_level} />
        <InfoItem label="مكان الدراسة" value={profile.study_location} last />
      </Block>
    </>
  );
}

function CardTab({ profile }: { profile: any }) {
  const { data: docsData } = useDocuments();
  const documents: any[] =
    docsData?.documents ?? (Array.isArray(docsData) ? docsData : []);
  const hasApproved = documents.some((d) => d.status === "APPROVED");

  if (!hasApproved) {
    return (
      <View style={ct.wrap}>
        {/* Icon */}
        <View style={ct.iconWrap}>
          <Text style={ct.iconEmoji}>🪪</Text>
        </View>

        {/* Title */}
        <Text style={ct.title}>البطاقة غير متاحة بعد</Text>
        <Text style={ct.sub}>يجب قبول وثائقك أولاً لعرض البطاقة الشخصية</Text>

        {/* Steps */}
        <View style={ct.stepsCard}>
          {[
            { num: "١", text: "ارفع الوثائق المطلوبة من صفحة «وثائقي»" },
            { num: "٢", text: "انتظر مراجعة الإدارة وقبول الوثائق" },
            { num: "٣", text: "ستظهر بطاقتك تلقائياً بعد القبول" },
          ].map((s, i) => (
            <View key={i} style={[ct.step, i < 2 && ct.stepBorder]}>
              <View style={ct.stepNum}>
                <Text style={ct.stepNumText}>{s.num}</Text>
              </View>
              <Text style={ct.stepText}>{s.text}</Text>
            </View>
          ))}
        </View>

        {/* Status pill */}
        <View style={ct.statusPill}>
          <View style={ct.statusDot} />
          <Text style={ct.statusText}>
            {documents.length === 0
              ? "لم يتم رفع أي وثيقة بعد"
              : "الوثائق قيد المراجعة"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ alignItems: "center", paddingTop: 8 }}>
      <StudentIDCard profile={profile} />
    </View>
  );
}

const ct = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#26423010",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#26423018",
    marginBottom: 4,
  },
  iconEmoji: { fontSize: 38 },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1B1B1B",
    textAlign: "center",
  },
  sub: {
    fontSize: 12,
    color: "#8A7A6A",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 260,
    marginBottom: 8,
  },
  stepsCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F5F0E8",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  stepBorder: { borderBottomWidth: 1, borderBottomColor: "#F5F0E8" },
  stepNum: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#26423012",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { fontSize: 13, fontWeight: "700", color: "#264230" },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: "#1B1B1B",
    textAlign: "right",
    lineHeight: 19,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#C4A03512",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#C4A03525",
    marginTop: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#C4A035",
  },
  statusText: { fontSize: 11, fontWeight: "600", color: "#8A6A00" },
});

function LogoutButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={lo.btn} onPress={onPress} activeOpacity={0.8}>
      <Text style={lo.icon}>→</Text>
      <Text style={lo.txt}>تسجيل الخروج</Text>
    </TouchableOpacity>
  );
}
const lo = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: ERR + "35",
    backgroundColor: ERR + "08",
    borderRadius: 20,
    paddingVertical: 14,
    marginBottom: 10,
  },
  icon: { fontSize: 16, color: ERR, fontWeight: FontWeight.bold },
  txt: { fontSize: 14, fontWeight: FontWeight.bold, color: ERR },
});

// ── Main ──────────────────────────────────────────────────────────
export default function Profile() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("account");
  const [editVisible, setEditVisible] = useState(false);

  const { logout, user } = useAuth();
  const student = useStudent();
  const { data, isLoading, isError, refetch } = useProfile();
  const profile = data ?? student;

  // ✅ الأولوية: avatar_url من الـ profile → google_avatar من الـ user
  const avatarUrl: string | null =
    (profile as any)?.avatar_url || user?.google_avatar || null;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleLogout = () =>
    Alert.alert("تسجيل الخروج", "هل أنت متأكد؟", [
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

  return (
    <View style={pg.root}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={pg.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={TEAL}
          />
        }
        stickyHeaderIndices={profile ? [0] : undefined}
      >
        {profile ? (
          <HeroBanner
            profile={profile}
            avatarUrl={avatarUrl}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onEdit={() => setEditVisible(true)}
          />
        ) : (
          <View />
        )}

        {isLoading && !profile && (
          <View style={pg.center}>
            <ActivityIndicator size="large" color={TEAL} />
          </View>
        )}

        {isError && !profile && (
          <View style={pg.center}>
            <Text style={pg.errIcon}>⚠</Text>
            <Text style={pg.errTxt}>تعذّر تحميل البيانات</Text>
            <TouchableOpacity style={pg.retryBtn} onPress={() => refetch()}>
              <Text style={pg.retryTxt}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}

        {profile && (
          <View style={pg.body}>
            {activeTab === "account" && <AccountTab profile={profile} />}
            {activeTab === "card" && <CardTab profile={profile} />}
            {activeTab === "account" && <LogoutButton onPress={handleLogout} />}
            <Text style={pg.version}>CEIL Mobile v1.0.0</Text>
          </View>
        )}

        <View style={pg.pad} />
      </ScrollView>

      {profile && (
        <EditProfileModal
          visible={editVisible}
          profile={profile}
          onClose={() => {
            setEditVisible(false);
            refetch();
          }}
        />
      )}
    </View>
  );
}

const pg = StyleSheet.create({
  root: { flex: 1, backgroundColor: CREAM },
  scroll: {},
  body: { paddingHorizontal: 18, paddingTop: 22 },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  errIcon: { fontSize: 36, color: MUTED },
  errTxt: { fontSize: 15, color: MUTED, textAlign: "center" },
  retryBtn: {
    backgroundColor: TEAL,
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 20,
  },
  retryTxt: { fontSize: 13, color: WHITE, fontWeight: FontWeight.semibold },
  version: {
    fontSize: 11,
    color: MUTED + "80",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 4,
  },
  pad: { height: Platform.OS === "ios" ? 100 : 80 },
});
