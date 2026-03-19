// components/student/StudentIDCard.tsx
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { useRef, useState, useCallback } from "react";
import { Radius, FontWeight, Shadow } from "../../../src/constants/theme";

// ── update this path to wherever your logo lives ──
import logo from "../../../assets/logo.jpg";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface StudentIDCardProps {
  profile: {
    student_id?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    google_avatar?: string;
    date_of_birth?: string;
    education_level?: string;
    phone_number?: string;
    status?: string;
  };
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const SCREEN_W = Dimensions.get("window").width;
const PADDING = 5;
const CARD_W = SCREEN_W - PADDING; // portrait width  → landscape height after rotate
const CARD_H = 248; // portrait height → landscape width after rotate

const TEAL_DARK = "#2B6F5E";
const TEAL_LIGHT = "#8DB896";
const GOLD = "#C4A035";
const INK = "#1B1B1B";
const BROWN = "#8A7A6A";
const BEIGE = "#BEB29E";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getFullName(p: StudentIDCardProps["profile"]): string {
  const full = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
  return full || p.email.split("@")[0];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─────────────────────────────────────────────
// Barcode
// ─────────────────────────────────────────────

const BARS = Array.from({ length: 30 }, (_, i) => ({
  width: [0, 3, 7, 11, 15, 19, 23, 27].includes(i) ? 3.5 : i % 2 === 0 ? 2 : 1,
  height: i % 5 === 0 ? 22 : i % 3 === 0 ? 16 : 12,
}));

function Barcode({
  color = INK,
  opacity = 0.6,
}: {
  color?: string;
  opacity?: number;
}) {
  return (
    <View style={bc.row}>
      {BARS.map((bar, i) => (
        <View
          key={i}
          style={[
            bc.bar,
            {
              width: bar.width,
              height: bar.height,
              backgroundColor: color,
              opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const bc = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: 1.5 },
  bar: { borderRadius: 0.5 },
});

// ─────────────────────────────────────────────
// Info field
// ─────────────────────────────────────────────

function InfoField({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <Text style={[f.value, bold && f.bold]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const f = StyleSheet.create({
  wrap: { marginBottom: 5 },
  label: {
    fontSize: 7,
    color: BROWN,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 1,
  },
  value: { fontSize: 11, color: INK, fontWeight: FontWeight.semibold },
  bold: { fontWeight: FontWeight.bold },
});

// ─────────────────────────────────────────────
// Accent bar
// ─────────────────────────────────────────────

function AccentBar() {
  return (
    <View style={ab.row}>
      <View style={[ab.seg, { backgroundColor: TEAL_LIGHT }]} />
      <View style={[ab.seg, { backgroundColor: GOLD }]} />
      <View style={[ab.seg, { backgroundColor: TEAL_LIGHT }]} />
    </View>
  );
}

const ab = StyleSheet.create({
  row: { flexDirection: "row", height: 4 },
  seg: { flex: 1 },
});

// ─────────────────────────────────────────────
// FRONT face
// ─────────────────────────────────────────────

function FrontFace({ profile }: { profile: StudentIDCardProps["profile"] }) {
  const fullName = getFullName(profile);
  const initials = getInitials(fullName);
  const formattedDOB = profile.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString("en-GB")
    : "DD/MM/YYYY";
  const isActive = profile.status !== "INACTIVE";
  const shortId =
    profile.student_id?.toUpperCase().slice(0, 16) ?? "0000-0000-0000";

  return (
    <View style={front.card}>
      <AccentBar />

      {/* ── Watermark logo (background) ── */}
      <View style={front.watermarkWrap} pointerEvents="none">
        <Image source={logo} style={front.watermark} resizeMode="contain" />
      </View>

      <View style={front.body}>
        {/* ── Header ── */}
        <View style={front.header}>
          {/* Logo in header */}
          <View style={front.logoBox}>
            <Image source={logo} style={front.logoImg} resizeMode="contain" />
          </View>
          <View style={front.headerText}>
            <Text style={front.headerTitle}>CEIL · El-Oued</Text>
            <Text style={front.headerSub}>
              Centre d&apos;Enseignement Intensif des Langues
            </Text>
          </View>
          <View style={front.rolePill}>
            <Text style={front.roleText}>Student</Text>
          </View>
        </View>

        {/* ── Divider ── */}
        <View style={front.divider} />

        {/* ── Main content ── */}
        <View style={front.main}>
          {/* Photo */}
          <View style={front.photoBox}>
            {profile.google_avatar ? (
              <Image
                source={{ uri: profile.google_avatar }}
                style={front.photo}
              />
            ) : (
              <View style={front.photoFallback}>
                <Text style={front.photoInitials}>{initials}</Text>
              </View>
            )}
          </View>

          {/* Info */}
          <View style={front.infoCol}>
            <View style={front.fields}>
              <InfoField label="Name / الاسم" value={fullName} bold />
              <InfoField
                label="Level / المستوى"
                value={profile.education_level ?? "University"}
              />
              <InfoField label="DOB / تاريخ الميلاد" value={formattedDOB} />
            </View>
            <View style={front.statusRow}>
              <View
                style={[
                  front.statusDot,
                  { backgroundColor: isActive ? TEAL_LIGHT : "#ef4444" },
                ]}
              />
              <Text style={front.statusText}>
                {isActive ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Footer barcode ── */}
        <View style={front.footer}>
          <View>
            <Barcode />
            <Text style={front.barcodeId}>{shortId}</Text>
          </View>
          <View style={front.gradIcon}>
            <Text style={{ fontSize: 11, color: TEAL_DARK }}>🎓</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const front = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: "#fff",
    borderRadius: Radius.xl,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: BEIGE + "80",
    ...Shadow.md,
  },

  // Watermark — centered, large
  watermarkWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 180,
    height: 180,
    marginTop: -90,
    marginLeft: -90,
    opacity: 0.06,
  },
  watermark: {
    width: "100%",
    height: "100%",
  },

  body: { flex: 1, padding: 13, flexDirection: "column" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 7,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f0f7f4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: TEAL_LIGHT + "40",
    overflow: "hidden",
  },
  logoImg: { width: 28, height: 28 },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: INK,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerSub: {
    fontSize: 6.5,
    color: BROWN,
    fontWeight: FontWeight.medium,
    marginTop: 1,
  },
  rolePill: {
    backgroundColor: TEAL_LIGHT + "1A",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 6.5,
    fontWeight: FontWeight.bold,
    color: TEAL_DARK,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  divider: { height: 0.5, backgroundColor: BEIGE + "66", marginBottom: 8 },

  // Main
  main: { flexDirection: "row", gap: 10, flex: 1 },

  // Photo
  photoBox: {
    width: 86,
    borderRadius: Radius.md,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: TEAL_LIGHT + "40",
  },
  photo: { width: "100%", height: "100%", resizeMode: "cover" },
  photoFallback: {
    flex: 1,
    backgroundColor: TEAL_DARK,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitials: { fontSize: 26, fontWeight: FontWeight.bold, color: "#fff" },

  // Info
  infoCol: { flex: 1, justifyContent: "space-between", paddingVertical: 2 },
  fields: { gap: 0 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 9, fontWeight: FontWeight.semibold, color: INK },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: BEIGE + "40",
  },
  barcodeId: {
    fontSize: 8,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: BROWN,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  gradIcon: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: TEAL_LIGHT + "1A",
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─────────────────────────────────────────────
// BACK face
// ─────────────────────────────────────────────

function BackFace({ profile }: { profile: StudentIDCardProps["profile"] }) {
  return (
    <View style={back.card}>
      <AccentBar />

      {/* Watermark */}
      <View style={back.watermarkWrap} pointerEvents="none">
        <Image source={logo} style={back.watermark} resizeMode="contain" />
      </View>

      <View style={back.body}>
        {/* Logo */}
        <View style={back.logoWrap}>
          <View style={back.logoBox}>
            <Image source={logo} style={back.logoImg} resizeMode="contain" />
          </View>
          <Text style={back.title}>CEIL · El-Oued</Text>
          <Text style={back.subEn}>
            Centre d&apos;Enseignement Intensif des Langues
          </Text>
          <Text style={back.subAr}>مركز التعليم المكثف للغات</Text>
        </View>

        <View style={back.divider} />

        <View style={back.noticeWrap}>
          <Text style={back.noticeEn}>
            This card is the property of CEIL - Univ. Hamma Lakhdar
          </Text>
          <Text style={back.noticeAr}>
            هذه البطاقة ملك لمركز التعليم المكثف للغات
          </Text>
        </View>

        <View style={back.barcodeWrap}>
          <Barcode color={BEIGE} opacity={0.5} />
        </View>
      </View>
    </View>
  );
}

const back = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: "#fff",
    borderRadius: Radius.xl,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: BEIGE + "80",
    ...Shadow.md,
  },

  // Watermark — centered, larger on back
  watermarkWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 140,
    height: 140,
    marginTop: -70,
    marginLeft: -70,
    opacity: 0.04,
  },
  watermark: { width: "100%", height: "100%" },

  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },

  logoWrap: { alignItems: "center", gap: 3 },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#f0f7f4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: TEAL_LIGHT + "40",
    overflow: "hidden",
    marginBottom: 4,
  },
  logoImg: { width: 46, height: 46 },

  title: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: INK,
    letterSpacing: 0.5,
  },
  subEn: {
    fontSize: 7.5,
    color: BROWN,
    fontWeight: FontWeight.medium,
    textAlign: "center",
  },
  subAr: { fontSize: 7.5, color: BROWN, fontWeight: FontWeight.medium },

  divider: {
    width: 40,
    height: 0.5,
    backgroundColor: BEIGE,
    marginVertical: 8,
  },

  noticeWrap: { alignItems: "center", gap: 2 },
  noticeEn: { fontSize: 7.5, color: BROWN, textAlign: "center" },
  noticeAr: { fontSize: 7.5, color: BROWN },

  barcodeWrap: { marginTop: 10 },
});

// ─────────────────────────────────────────────
// Main flip card
// ─────────────────────────────────────────────

export default function StudentIDCard({ profile }: StudentIDCardProps) {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleFlip = useCallback(() => {
    const toValue = flipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start(() => setFlipped(!flipped));
  }, [flipped, flipAnim]);

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <View style={wrap.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleFlip}
        style={wrap.touchArea}
      >
        {/* Front */}
        <Animated.View
          style={[
            wrap.face,
            {
              opacity: frontOpacity,
              transform: [
                { perspective: 1500 },
                { rotateY: frontRotate },
                { rotate: "90deg" },
              ],
            },
          ]}
        >
          <FrontFace profile={profile} />
        </Animated.View>

        {/* Back */}
        <Animated.View
          style={[
            wrap.face,
            {
              opacity: backOpacity,
              transform: [
                { perspective: 1500 },
                { rotateY: backRotate },
                { rotate: "90deg" },
              ],
            },
          ]}
        >
          <BackFace profile={profile} />
        </Animated.View>
      </TouchableOpacity>

      <Text style={wrap.hint}>
        {flipped ? "اضغط لرؤية الوجه الأمامي" : "اضغط لرؤية الوجه الخلفي"}
      </Text>
    </View>
  );
}

const wrap = StyleSheet.create({
  container: { alignItems: "center" },
  touchArea: {
    width: CARD_H,
    height: CARD_W,
    alignItems: "center",
    justifyContent: "center",
  },
  face: {
    position: "absolute",
    width: CARD_H,
    height: CARD_W,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    marginTop: 10,
    fontSize: 10,
    color: BROWN,
    fontWeight: FontWeight.medium,
  },
});
