import React, { useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Rect } from "react-native-svg";
import logo from "@/assets/logo.jpg";

const { width } = Dimensions.get("window");
const CARD_W = Math.min(width - 40, 380);
const CARD_H = CARD_W * (54 / 86);

const WHITE = "#FFFFFF";
const TEAL = "#2B6F5E";
const TEAL2 = "#8DB896";
const BROWN = "#7A6A55";
const DARK = "#1B1B1B";
const BEIGE = "#E8E0D0";
const RED = "#EF4444";
const GREEN = "#8DB896";

export interface StudentProfile {
  student_id?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  google_avatar?: string;
  date_of_birth?: string;
  education_level?: string;
  phone_number?: string;
  is_active?: boolean;
}

export default function StudentIDCard({
  profile,
}: {
  profile: StudentProfile;
}) {
  const [flipped, setFlipped] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const flip = () => {
    Animated.spring(anim, {
      toValue: flipped ? 0 : 1,
      useNativeDriver: true,
      tension: 55,
      friction: 8,
    }).start();
    setFlipped(!flipped);
  };

  const fullName =
    profile.first_name || profile.last_name
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : profile.email.split("@")[0];

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const formattedDOB = profile.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString("en-GB")
    : "DD/MM/YYYY";
  const studentId =
    profile.student_id?.toUpperCase().slice(0, 16) || "0000-0000-0000-0000";

  const bars = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        x: i * 6.5,
        width: [0, 3, 7, 11, 15, 19, 23, 27].includes(i)
          ? 3.5
          : i % 2 === 0
            ? 2
            : 1,
      })),
    [],
  );

  const frontRotY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backRotY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });
  const frontOp = anim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backOp = anim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <View style={s.wrapper}>
      <TouchableOpacity onPress={flip} activeOpacity={0.95} style={s.scene}>
        {/* FRONT */}
        <Animated.View
          style={[
            s.card,
            {
              opacity: frontOp,
              transform: [{ perspective: 1500 }, { rotateY: frontRotY }],
            },
          ]}
        >
          <View style={s.topBand} />
          <View style={s.sideAccent} />
          <View style={s.cardInner}>
            <View style={s.cardHeader}>
              {/* ✅ بدون خلفية — فقط الصورة */}
              <Image source={logo} style={s.logoImg} resizeMode="contain" />
              <View style={{ flex: 1 }}>
                <Text style={s.orgName}>CEIL · El-Oued</Text>
                <Text style={s.orgSub}>
                  Centre d'Enseignement Intensif des Langues
                </Text>
              </View>
              <View style={s.roleBadge}>
                <Text style={s.roleText}>STUDENT</Text>
              </View>
            </View>

            <View style={s.divider} />

            <View style={s.cardBody}>
              <View style={s.photoWrap}>
                {profile.google_avatar ? (
                  <Image
                    source={{ uri: profile.google_avatar }}
                    style={s.photo}
                  />
                ) : (
                  <View style={s.photoFallback}>
                    <Text style={s.photoInitials}>{initials}</Text>
                  </View>
                )}
              </View>
              <View style={s.infoCol}>
                <InfoField label="Name / الاسم" value={fullName} bold />
                <InfoField
                  label="Level / المستوى"
                  value={profile.education_level || "University"}
                />
                <InfoField label="DOB / تاريخ الميلاد" value={formattedDOB} />
                <View style={s.statusRow}>
                  <View
                    style={[
                      s.statusDot,
                      {
                        backgroundColor:
                          profile.is_active !== false ? GREEN : RED,
                      },
                    ]}
                  />
                  <Text style={s.statusText}>
                    {profile.is_active !== false ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={s.cardFooter}>
              <View>
                <Svg width={130} height={18} viewBox="0 0 200 25">
                  {bars.map((bar, i) => (
                    <Rect
                      key={i}
                      x={bar.x}
                      y={1}
                      width={bar.width}
                      height={23}
                      fill={DARK}
                      opacity={0.6}
                      rx={0.3}
                    />
                  ))}
                </Svg>
                <Text style={s.barcodeId}>{studentId}</Text>
              </View>
              <View style={s.gradCapBox}>
                <Ionicons name="school-outline" size={11} color={TEAL} />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* BACK */}
        <Animated.View
          style={[
            s.card,
            s.cardBack,
            {
              opacity: backOp,
              transform: [{ perspective: 1500 }, { rotateY: backRotY }],
            },
          ]}
        >
          <View style={s.topBand} />
          <View style={s.backInner}>
            {/* ✅ بدون خلفية — فقط الصورة */}
            <Image source={logo} style={s.backLogoImg} resizeMode="contain" />
            <Text style={s.backOrgName}>CEIL · El-Oued</Text>
            <Text style={s.backOrgSub}>
              Centre d'Enseignement Intensif des Langues
            </Text>
            <Text style={s.backOrgAr}>مركز التعليم المكثف للغات</Text>
            <View style={s.backDivider} />
            <Text style={s.backNote}>
              This card is the property of CEIL - Univ. Hamma Lakhdar
            </Text>
            <Text style={s.backNoteAr}>
              هذه البطاقة ملك لمركز التعليم المكثف للغات
            </Text>
            <View style={{ marginTop: "auto" as any, paddingTop: 10 }}>
              <Svg width={80} height={14} viewBox="0 0 200 25">
                {bars.map((bar, i) => (
                  <Rect
                    key={i}
                    x={bar.x}
                    y={1}
                    width={bar.width}
                    height={23}
                    fill={BEIGE}
                    opacity={0.5}
                    rx={0.3}
                  />
                ))}
              </Svg>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
      <Text style={s.hint}>
        اضغط لعرض {flipped ? "الوجه الأمامي" : "الوجه الخلفي"} ↩
      </Text>
    </View>
  );
}

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
    <View style={{ marginBottom: 5 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text
        style={[s.fieldValue, bold && { fontWeight: "700" }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { width: CARD_W, alignSelf: "center" },
  scene: { width: CARD_W, height: CARD_H, position: "relative" },
  card: {
    position: "absolute",
    width: CARD_W,
    height: CARD_H,
    backgroundColor: WHITE,
    borderRadius: 14,
    overflow: "hidden",
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: `${BEIGE}80`,
  },
  cardBack: { backgroundColor: WHITE },
  topBand: { height: 4, backgroundColor: TEAL2 },
  sideAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 2,
    height: "100%",
    backgroundColor: TEAL,
    opacity: 0.15,
  },
  cardInner: { flex: 1, padding: 10 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 7,
  },

  // ✅ logoImg مباشرة بدون مربع خلفية
  logoImg: { width: 36, height: 26 },

  orgName: {
    fontSize: 9,
    fontWeight: "800",
    color: DARK,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  orgSub: { fontSize: 6, color: BROWN, fontWeight: "500", letterSpacing: 0.3 },
  roleBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: `${TEAL2}20`,
  },
  roleText: { fontSize: 6, fontWeight: "700", color: TEAL, letterSpacing: 0.8 },
  divider: { height: 1, backgroundColor: `${BEIGE}60`, marginBottom: 7 },
  cardBody: { flex: 1, flexDirection: "row", gap: 10 },
  photoWrap: {
    width: CARD_W * 0.23,
    height: CARD_H * 0.52,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: `${TEAL2}40`,
  },
  photo: { width: "100%", height: "100%" },
  photoFallback: {
    flex: 1,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitials: { color: WHITE, fontSize: 16, fontWeight: "900" },
  infoCol: { flex: 1, justifyContent: "space-between", paddingVertical: 2 },
  fieldLabel: {
    fontSize: 6,
    color: BROWN,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  fieldValue: { fontSize: 8.5, color: DARK, fontWeight: "600" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 7, fontWeight: "600", color: DARK },
  cardFooter: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: `${BEIGE}40`,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  barcodeId: { fontSize: 6, color: BROWN, letterSpacing: 1.5, marginTop: 2 },
  gradCapBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: `${TEAL2}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  backInner: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  // ✅ backLogoImg مباشرة بدون مربع خلفية
  backLogoImg: { width: 52, height: 52, marginBottom: 7, marginTop: 6 },

  backOrgName: {
    fontSize: 11,
    fontWeight: "800",
    color: DARK,
    letterSpacing: 0.5,
  },
  backOrgSub: {
    fontSize: 7,
    color: BROWN,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "center",
  },
  backOrgAr: { fontSize: 7, color: BROWN, fontWeight: "500", marginTop: 1 },
  backDivider: {
    width: 40,
    height: 1,
    backgroundColor: BEIGE,
    marginVertical: 8,
  },
  backNote: {
    fontSize: 6.5,
    color: BROWN,
    textAlign: "center",
    lineHeight: 10,
  },
  backNoteAr: {
    fontSize: 6.5,
    color: BROWN,
    textAlign: "center",
    marginTop: 2,
  },
  hint: {
    textAlign: "center",
    fontSize: 10,
    color: BROWN,
    marginTop: 8,
    fontWeight: "500",
  },
});
