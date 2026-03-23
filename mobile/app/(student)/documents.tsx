// app/(student)/documents.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Image,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { useState, useCallback, useRef, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import {
  IconFileText,
  IconCheck,
  IconClock,
  IconX,
  IconUpload,
  IconTrash,
  IconRefresh,
  IconCircleCheck,
  IconCamera,
  IconFolder,
  IconChevronRight,
  IconUser,
  IconBriefcase,
  IconSchool,
  IconShield,
  IconAlertTriangle,
  IconPlus,
  IconId,
} from "@tabler/icons-react-native";
import { useDocuments, useDeleteDocument } from "../../src/hooks/useStudent";
import { useAlert } from "../../src/hooks/useAlert";
import { useTheme } from "../../src/context/ThemeContext";
import { Colors } from "../../src/constants/theme";

const API_BASE = "https://www.ceil-eloued.com/api";
const { width: SW, height: SH } = Dimensions.get("window");

const T = {
  teal: "#264230",
  teal2: "#3D6B55",
  teal3: "#1A2E22",
  gold: "#C4A035",
  cream: Colors.background,
  cream2: "#EDE8DF",
  white: "#FFFFFF",
  red: "#EF4444",
  green: "#22C55E",
  dark: "#111818",
  muted: "#8A9E94",
  border: "#DDD8CE",
};

type RegistrantCategory = "STUDENT" | "EXTERNAL" | "EMPLOYEE";

// ── أنواع الوثائق وحجمها المناسب ─────────────────────────────────
type DocFrameType = "card" | "a4" | "photo";

const DOC_FRAME_TYPE: Record<string, DocFrameType> = {
  STUDENT_CARD: "card", // بطاقة طالب — portrait صغير
  ID_CARD: "card", // بطاقة التعريف — portrait صغير
  WORK_CERTIFICATE: "card", // بطاقة مهنية — portrait صغير
  SCHOOL_CERTIFICATE: "a4", // شهادة مدرسية — A4
  REGISTRATION_CERTIFICATE: "a4", // شهادة تسجيل — A4
  ADMIN_CERTIFICATE: "a4", // شهادة إدارية — A4
  PHOTO: "photo", // صورة شمسية — مربع
};

// أبعاد كل نوع
const FRAME_SIZES: Record<
  DocFrameType,
  { w: number; h: number; label: string; labelEn: string }
> = {
  card: {
    w: SW * 0.75,
    h: SW * 0.75 * 1.42,
    label: "بطاقة — أمسك الهاتف عمودياً",
    labelEn: "Card — Hold phone vertically",
  },
  a4: {
    w: SW * 0.85,
    h: SW * 0.85 * 1.41,
    label: "وثيقة A4 — أمسك الهاتف عمودياً",
    labelEn: "A4 Document — Hold phone vertically",
  },
  photo: {
    w: SW * 0.65,
    h: SW * 0.65,
    label: "صورة — أمسك الهاتف عمودياً",
    labelEn: "Photo — Hold phone vertically",
  },
};

const DOCUMENT_TYPES: Record<
  RegistrantCategory,
  { value: string; label: string; label_ar: string }[]
> = {
  STUDENT: [
    { value: "STUDENT_CARD", label: "Student Card", label_ar: "بطاقة طالب" },
    {
      value: "SCHOOL_CERTIFICATE",
      label: "School Certificate",
      label_ar: "شهادة مدرسية",
    },
    {
      value: "REGISTRATION_CERTIFICATE",
      label: "Registration Certificate",
      label_ar: "شهادة تسجيل",
    },
  ],
  EXTERNAL: [
    {
      value: "ID_CARD",
      label: "National ID Card",
      label_ar: "بطاقة التعريف الوطنية",
    },
  ],
  EMPLOYEE: [
    {
      value: "WORK_CERTIFICATE",
      label: "Work Certificate",
      label_ar: "شهادة عمل / بطاقة مهنية",
    },
    {
      value: "ADMIN_CERTIFICATE",
      label: "Administrative Certificate",
      label_ar: "شهادة إدارية",
    },
  ],
};
const OPTIONAL_TYPES = [
  { value: "PHOTO", label: "Personal Photo", label_ar: "صورة شمسية" },
];

const DOC_LABELS: Record<string, string> = {
  STUDENT_CARD: "بطاقة طالب",
  SCHOOL_CERTIFICATE: "شهادة مدرسية",
  REGISTRATION_CERTIFICATE: "شهادة تسجيل",
  ID_CARD: "بطاقة التعريف",
  WORK_CERTIFICATE: "شهادة عمل",
  ADMIN_CERTIFICATE: "شهادة إدارية",
  PHOTO: "صورة شمسية",
  PAYMENT_RECEIPT: "وصل الدفع",
};

function formatDocType(type: string) {
  return (
    DOC_LABELS[type] ||
    type
      .split("_")
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" ")
  );
}

const STATUS_CFG: Record<
  string,
  { bg: string; text: string; border: string; label: string; Icon: any }
> = {
  APPROVED: {
    bg: "#DCFCE7",
    text: "#15803D",
    border: "#86EFAC",
    label: "مقبولة",
    Icon: IconCircleCheck,
  },
  PENDING: {
    bg: "#FEF9C3",
    text: "#A16207",
    border: "#FDE047",
    label: "قيد المراجعة",
    Icon: IconClock,
  },
  REJECTED: {
    bg: "#FEE2E2",
    text: "#B91C1C",
    border: "#FCA5A5",
    label: "مرفوضة",
    Icon: IconAlertTriangle,
  },
};

const FLEX_TOP = 1.0;
const FLEX_BOTTOM = 1.2;

// ── Camera Modal ──────────────────────────────────────────────────
function CameraModal({
  visible,
  onClose,
  onCapture,
  docType,
}: {
  visible: boolean;
  onClose: () => void;
  docType: string;
  onCapture: (file: { uri: string; name: string; type: string }) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  // تحديد حجم الإطار حسب نوع الوثيقة
  const frameType = DOC_FRAME_TYPE[docType] ?? "a4";
  const frameSize = FRAME_SIZES[frameType];
  const FRAME_W = frameSize.w;
  const FRAME_H = frameSize.h;

  useEffect(() => {
    if (visible && permission?.granted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      scanAnim.stopAnimation();
      scanAnim.setValue(0);
    }
  }, [visible, permission?.granted, frameType]);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.95 });
      if (!photo?.uri) return;

      const photoW = photo.width ?? SW;
      const photoH = photo.height ?? SH;

      const remainingH = SH - FRAME_H;
      const frameTopPx = remainingH * (FLEX_TOP / (FLEX_TOP + FLEX_BOTTOM));
      const frameLeftPx = (SW - FRAME_W) / 2;

      const scaleX = photoW / SW;
      const scaleY = photoH / SH;

      const originX = Math.max(0, frameLeftPx * scaleX);
      const originY = Math.max(0, frameTopPx * scaleY);
      const width = Math.min(FRAME_W * scaleX, photoW - originX);
      const height = Math.min(FRAME_H * scaleY, photoH - originY);

      const cropped = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop: { originX, originY, width, height } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG },
      );

      onCapture({
        uri: cropped.uri,
        name: `doc_${Date.now()}.jpg`,
        type: "image/jpeg",
      });
      onClose();
    } catch {
      // ignore
    } finally {
      setCapturing(false);
    }
  };

  if (!visible) return null;

  if (!permission?.granted) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <View style={cm.permScreen}>
          <View style={cm.permCard}>
            <View style={cm.permIconWrap}>
              <IconCamera size={40} color={T.gold} strokeWidth={1.3} />
            </View>
            <Text style={cm.permTitle}>إذن الكاميرا مطلوب</Text>
            <Text style={cm.permSub}>
              يحتاج التطبيق إذن الكاميرا لالتقاط صور الوثائق
            </Text>
            <TouchableOpacity
              style={cm.permBtn}
              onPress={requestPermission}
              activeOpacity={0.85}
            >
              <Text style={cm.permBtnText}>السماح بالكاميرا</Text>
            </TouchableOpacity>
            <TouchableOpacity style={cm.permCancel} onPress={onClose}>
              <Text style={cm.permCancelText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  const scanTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_H - 2],
  });

  // لون الإطار حسب النوع
  const frameColor =
    frameType === "card" ? T.gold : frameType === "a4" ? "#60A5FA" : T.green;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          {/* Overlay */}
          <View style={cm.overlay}>
            <View style={[cm.darkZone, { flex: FLEX_TOP }]} />
            <View style={cm.middleRow}>
              <View style={[cm.darkSide, { height: FRAME_H }]} />
              <View
                style={{
                  width: FRAME_W,
                  height: FRAME_H,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* زوايا الإطار بلون النوع */}
                <View
                  style={[cm.corner, cm.cTL, { borderColor: frameColor }]}
                />
                <View
                  style={[cm.corner, cm.cTR, { borderColor: frameColor }]}
                />
                <View
                  style={[cm.corner, cm.cBL, { borderColor: frameColor }]}
                />
                <View
                  style={[cm.corner, cm.cBR, { borderColor: frameColor }]}
                />
                {/* خط المسح */}
                <Animated.View
                  style={[
                    cm.scanLine,
                    {
                      backgroundColor: frameColor,
                      transform: [{ translateY: scanTranslateY }],
                    },
                  ]}
                />
              </View>
              <View style={[cm.darkSide, { height: FRAME_H }]} />
            </View>
            <View
              style={[
                cm.darkZone,
                {
                  flex: FLEX_BOTTOM,
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingTop: 16,
                  gap: 6,
                },
              ]}
            >
              {/* badge نوع الوثيقة */}
              <View
                style={[
                  cm.typeBadge,
                  {
                    borderColor: frameColor + "60",
                    backgroundColor: frameColor + "18",
                  },
                ]}
              >
                {frameType === "card" ? (
                  <IconId size={13} color={frameColor} strokeWidth={2} />
                ) : frameType === "a4" ? (
                  <IconFileText size={13} color={frameColor} strokeWidth={2} />
                ) : (
                  <IconCamera size={13} color={frameColor} strokeWidth={2} />
                )}
                <Text style={[cm.typeBadgeText, { color: frameColor }]}>
                  {frameSize.label}
                </Text>
              </View>
              <Text style={cm.hintSub}>ضع الوثيقة داخل الإطار بالكامل</Text>
              <View style={[cm.cropNote, { borderColor: T.gold + "40" }]}>
                <IconCircleCheck size={12} color={T.gold} strokeWidth={2.5} />
                <Text style={cm.cropNoteText}>سيتم اقتصاص الصورة تلقائياً</Text>
              </View>
            </View>
          </View>

          {/* Header */}
          <View style={cm.header}>
            <TouchableOpacity style={cm.closeBtn} onPress={onClose}>
              <IconX size={20} color={T.white} strokeWidth={2.5} />
            </TouchableOpacity>
            <View
              style={[
                cm.headerBadge,
                {
                  backgroundColor: frameColor + "22",
                  borderColor: frameColor + "50",
                },
              ]}
            >
              <Text style={[cm.headerTitle, { color: T.white }]}>
                التقاط وثيقة
              </Text>
            </View>
            <View style={{ width: 44 }} />
          </View>

          {/* Capture Button */}
          <View style={cm.footer}>
            <TouchableOpacity
              style={[cm.captureBtn, capturing && { opacity: 0.5 }]}
              onPress={handleCapture}
              disabled={capturing}
              activeOpacity={0.9}
            >
              {capturing ? (
                <ActivityIndicator color={T.teal} size="small" />
              ) : (
                <View
                  style={[cm.captureInner, { backgroundColor: frameColor }]}
                />
              )}
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const CORNER_SIZE = 24;
const cm = StyleSheet.create({
  permScreen: {
    flex: 1,
    backgroundColor: T.teal3,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  permCard: {
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  permIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: T.teal + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  permTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: T.dark,
    textAlign: "center",
  },
  permSub: {
    fontSize: 13,
    color: T.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  permBtn: {
    backgroundColor: T.gold,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
  },
  permBtnText: { fontSize: 15, fontWeight: "800", color: T.teal },
  permCancel: { paddingVertical: 8 },
  permCancelText: { fontSize: 13, color: T.muted, fontWeight: "600" },

  overlay: { ...StyleSheet.absoluteFillObject },
  darkZone: { width: "100%", backgroundColor: "rgba(0,0,0,0.65)" },
  middleRow: { flexDirection: "row" },
  darkSide: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)" },

  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderWidth: 3,
  },
  cTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  cTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  cBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  cBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },

  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.75,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },

  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typeBadgeText: { fontSize: 12, fontWeight: "700" },
  hintSub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    textAlign: "center",
  },
  cropNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(196,160,53,0.15)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  cropNoteText: { fontSize: 11, color: T.gold, fontWeight: "600" },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 16,
  },
  headerBadge: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 15, fontWeight: "800" },

  footer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 52 : 36,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: T.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.35)",
  },
  captureInner: { width: 58, height: 58, borderRadius: 29 },
});

// ── Hero Header ───────────────────────────────────────────────────
function HeroHeader({
  isComplete,
  stats,
  onUpload,
}: {
  isComplete: boolean;
  stats: any;
  onUpload: () => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isComplete) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.06,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isComplete, pulse]);

  return (
    <View style={hh.card}>
      <View style={hh.geo1} />
      <View style={hh.geo2} />
      <View style={hh.geo3} />
      <View style={hh.topRow}>
        <TouchableOpacity
          style={hh.uploadPill}
          onPress={onUpload}
          activeOpacity={0.85}
        >
          <IconPlus size={14} color={T.teal} strokeWidth={2.5} />
          <Text style={hh.uploadPillText}>رفع وثيقة</Text>
        </TouchableOpacity>
        <View style={hh.titleWrap}>
          <Text style={hh.sub}>مركز التعليم المكثّف للغات</Text>
          <Text style={hh.title}>وثائقي</Text>
        </View>
        <View style={hh.iconWrap}>
          <IconShield size={22} color={T.gold} strokeWidth={1.5} />
        </View>
      </View>
      <Animated.View
        style={[
          hh.statusPill,
          {
            transform: [{ scale: isComplete ? 1 : pulse }],
            backgroundColor: isComplete ? T.green + "20" : T.gold + "20",
            borderColor: isComplete ? T.green + "60" : T.gold + "60",
          },
        ]}
      >
        {isComplete ? (
          <IconCircleCheck size={14} color={T.green} strokeWidth={2.5} />
        ) : (
          <IconClock size={14} color={T.gold} strokeWidth={2.5} />
        )}
        <Text style={[hh.statusText, { color: isComplete ? T.green : T.gold }]}>
          {isComplete ? "جميع الوثائق مقبولة ✓" : "الوثائق قيد المراجعة"}
        </Text>
      </Animated.View>
      <View style={hh.statsStrip}>
        {[
          { v: stats.total, l: "المجموع", c: T.white },
          { v: stats.approved, l: "مقبولة", c: T.green },
          { v: stats.pending, l: "معلقة", c: T.gold },
          { v: stats.rejected, l: "مرفوضة", c: T.red },
        ].map((s, i) => (
          <View key={i} style={[hh.statItem, i < 3 && hh.statBorder]}>
            <Text style={[hh.statNum, { color: s.c }]}>{s.v}</Text>
            <Text style={hh.statLabel}>{s.l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const hh = StyleSheet.create({
  card: {
    backgroundColor: T.teal3,
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: T.teal3,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 14,
  },
  geo1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: T.teal2,
    opacity: 0.3,
    top: -60,
    left: -40,
  },
  geo2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: T.gold,
    opacity: 0.06,
    bottom: -20,
    right: 20,
  },
  geo3: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: T.gold,
    opacity: 0.12,
    top: 30,
    right: 60,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  titleWrap: { alignItems: "center", flex: 1 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: T.white,
    letterSpacing: 0.5,
  },
  sub: {
    fontSize: 9,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  uploadPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: T.gold,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  uploadPillText: { fontSize: 12, fontWeight: "700", color: T.teal },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  statsStrip: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    overflow: "hidden",
  },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 12 },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.08)",
  },
  statNum: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 },
});

// ── Doc Card ──────────────────────────────────────────────────────
function DocCard({
  doc,
  onDelete,
  onReupload,
  index,
}: {
  doc: any;
  onDelete: () => void;
  onReupload: () => void;
  index: number;
}) {
  const { colors: C } = useTheme();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 320,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 320,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeIn, index, slideY]);

  const cfg = STATUS_CFG[doc.status] ?? STATUS_CFG.PENDING;
  const canDelete = doc.status === "PENDING" || doc.status === "REJECTED";
  const canReupload = doc.status === "REJECTED";
  const isImage = doc.file_path?.match(/\.(jpg|jpeg|png)$/i);

  return (
    <Animated.View
      style={[
        dc.wrap,
        { opacity: fadeIn, transform: [{ translateY: slideY }] },
      ]}
    >
      <View style={[dc.card, { backgroundColor: C.surface }]}>
        <View
          style={[
            dc.topBar,
            { backgroundColor: cfg.bg, borderBottomColor: cfg.border },
          ]}
        >
          <cfg.Icon size={12} color={cfg.text} strokeWidth={2.5} />
          <Text style={[dc.statusLabel, { color: cfg.text }]}>{cfg.label}</Text>
          {doc.uploaded_at && (
            <Text style={[dc.date, { color: C.textMuted }]}>
              {new Date(doc.uploaded_at).toLocaleDateString("ar-DZ")}
            </Text>
          )}
        </View>
        <View style={dc.body}>
          <View style={[dc.thumb, { borderColor: cfg.border }]}>
            {isImage && doc.file_path ? (
              <Image source={{ uri: doc.file_path }} style={dc.thumbImg} />
            ) : (
              <IconFileText size={26} color={T.teal} strokeWidth={1.4} />
            )}
          </View>
          <View style={dc.info}>
            <Text style={[dc.docTitle, { color: C.text }]} numberOfLines={1}>
              {formatDocType(doc.type)}
            </Text>
            {doc.rejection_reason && (
              <View style={dc.reasonWrap}>
                <IconAlertTriangle size={10} color={T.red} strokeWidth={2} />
                <Text style={dc.reason} numberOfLines={2}>
                  {doc.rejection_reason}
                </Text>
              </View>
            )}
          </View>
          <View style={dc.actions}>
            {canReupload && (
              <TouchableOpacity
                style={dc.btnGold}
                onPress={onReupload}
                activeOpacity={0.8}
              >
                <IconRefresh size={15} color={T.teal} strokeWidth={2.2} />
              </TouchableOpacity>
            )}
            {canDelete && (
              <TouchableOpacity
                style={dc.btnRed}
                onPress={onDelete}
                activeOpacity={0.8}
              >
                <IconTrash size={15} color={T.white} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const dc = StyleSheet.create({
  wrap: { marginBottom: 12 },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  statusLabel: { fontSize: 11, fontWeight: "700", flex: 1 },
  date: { fontSize: 10, color: T.muted },
  body: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: T.teal + "10",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1.5,
  },
  thumbImg: { width: 52, height: 52 },
  info: { flex: 1 },
  docTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: T.dark,
    textAlign: "right",
    marginBottom: 4,
  },
  reasonWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    justifyContent: "flex-end",
  },
  reason: { fontSize: 10, color: T.red, textAlign: "right", flex: 1 },
  actions: { gap: 8 },
  btnGold: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: T.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  btnRed: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: T.red,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ── Empty State ───────────────────────────────────────────────────
function EmptyState({ onUpload }: { onUpload: () => void }) {
  const { colors: C } = useTheme();
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -8,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [float]);
  return (
    <View style={es.wrap}>
      <Animated.View
        style={[es.iconWrap, { transform: [{ translateY: float }] }]}
      >
        <IconFileText size={48} color={T.teal2} strokeWidth={1.2} />
      </Animated.View>
      <Text style={[es.title, { color: C.text }]}>لا توجد وثائق بعد</Text>
      <Text style={[es.sub, { color: C.textMuted }]}>
        ارفع وثائقك المطلوبة لإتمام تسجيلك في البرنامج
      </Text>
      <TouchableOpacity style={es.btn} onPress={onUpload} activeOpacity={0.85}>
        <IconUpload size={18} color={T.teal} strokeWidth={2} />
        <Text style={es.btnText}>ارفع أول وثيقة</Text>
      </TouchableOpacity>
    </View>
  );
}

const es = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 56 },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: T.teal + "12",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: T.teal + "20",
  },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  sub: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: T.gold,
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  btnText: { fontSize: 15, fontWeight: "800", color: T.teal },
});

// ── Section Label ─────────────────────────────────────────────────
function SectionLabel({ count }: { count: number }) {
  const { colors: C } = useTheme();
  return (
    <View style={sl.wrap}>
      <View style={[sl.line, { backgroundColor: C.border }]} />
      <Text style={[sl.text, { color: C.textMuted }]}>
        الوثائق المرفوعة ({count})
      </Text>
      <View style={[sl.line, { backgroundColor: C.border }]} />
    </View>
  );
}
const sl = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  line: { flex: 1, height: 1 },
  text: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
});

// ── Upload Sheet ──────────────────────────────────────────────────
function UploadSheet({
  visible,
  onClose,
  initialCategory,
  reuploadDoc,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  initialCategory: RegistrantCategory;
  reuploadDoc?: any;
  onSuccess: () => void;
}) {
  const { colors: C } = useTheme();
  const queryClient = useQueryClient();
  const alert = useAlert();

  const [category, setCategory] = useState<RegistrantCategory>(initialCategory);
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [step, setStep] = useState<"category" | "type" | "file">(
    reuploadDoc ? "file" : "category",
  );
  const [loading, setLoading] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);

  const isReupload = !!reuploadDoc;
  // نوع الوثيقة الفعلي — للـ reupload نأخذه من الوثيقة الأصلية
  const effectiveDocType = isReupload ? (reuploadDoc?.type ?? "") : docType;

  useEffect(() => {
    if (visible) {
      setStep(reuploadDoc ? "file" : "category");
      setFile(null);
      setDocType("");
    }
  }, [visible, reuploadDoc]);

  const resetState = () => {
    setCategory(initialCategory);
    setDocType("");
    setFile(null);
    setStep("category");
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("ceil_access_token");
      const fieldName = isReupload ? "file" : docType;
      const fd = new FormData();
      fd.append(fieldName, {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
      const url = isReupload
        ? `${API_BASE}/students/documents/${reuploadDoc.document_id}/reupload`
        : `${API_BASE}/students/documents`;
      const res = await fetch(url, {
        method: isReupload ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = await res.json();
      if (json?.skipped?.length > 0 && json?.documents?.length === 0) {
        alert.warning(
          "مرفوعة مسبقاً",
          "هذه الوثيقة موجودة بالفعل\nاحذفها أولاً إذا أردت استبدالها",
        );
        onClose();
        resetState();
        return;
      }
      if (!res.ok) {
        alert.error(
          "فشل الرفع",
          json?.message || json?.error || `خطأ ${res.status}`,
        );
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["student-documents"] });
      onSuccess();
      onClose();
      resetState();
    } catch (e: any) {
      alert.error("خطأ في الاتصال", e?.message || "تحقق من اتصالك بالإنترنت");
    } finally {
      setLoading(false);
    }
  };

  const frameType = DOC_FRAME_TYPE[effectiveDocType] ?? "a4";
  const aspectRatio: [number, number] =
    frameType === "card" ? [3, 4] : frameType === "photo" ? [1, 1] : [3, 4];

  const pickFromGallery = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      quality: 0.85,
      allowsEditing: true,
      aspect: aspectRatio,
    });
    if (!r.canceled && r.assets[0]) {
      const a = r.assets[0];
      setFile({
        uri: a.uri,
        name: a.uri.split("/").pop() || "photo.jpg",
        type: a.mimeType || "image/jpeg",
      });
    }
  };

  const pickFromCamera = () => setCameraVisible(true);

  const pickDocument = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
    });
    if (!r.canceled && r.assets[0]) {
      const a = r.assets[0];
      setFile({
        uri: a.uri,
        name: a.name,
        type: a.mimeType || "application/octet-stream",
      });
    }
  };

  const cats = [
    {
      value: "STUDENT" as RegistrantCategory,
      label: "Student",
      label_ar: "طالب",
      Icon: IconSchool,
      color: "#2563EB",
    },
    {
      value: "EMPLOYEE" as RegistrantCategory,
      label: "Employee",
      label_ar: "موظف / أستاذ",
      Icon: IconBriefcase,
      color: "#D97706",
    },
    {
      value: "EXTERNAL" as RegistrantCategory,
      label: "External",
      label_ar: "شخص خارجي",
      Icon: IconUser,
      color: "#7C3AED",
    },
  ];
  const allTypes = [...(DOCUMENT_TYPES[category] || []), ...OPTIONAL_TYPES];

  // badge نوع الإطار لعرضه في خطوة الملف
  const frameColor =
    frameType === "card" ? T.gold : frameType === "a4" ? "#60A5FA" : T.green;
  const frameLabel = FRAME_SIZES[frameType]?.label ?? "";

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <View style={sh.overlay}>
          <TouchableOpacity
            style={sh.backdrop}
            onPress={onClose}
            activeOpacity={1}
          />
          <View style={[sh.sheet, { backgroundColor: C.background }]}>
            <View style={[sh.handle, { backgroundColor: C.border }]} />
            <View style={[sh.header, { borderBottomColor: C.border }]}>
              <TouchableOpacity
                onPress={onClose}
                style={[sh.closeBtn, { backgroundColor: C.cream2 }]}
              >
                <IconX size={18} color={T.muted} strokeWidth={2.5} />
              </TouchableOpacity>
              <Text style={[sh.title, { color: C.text }]}>
                {isReupload ? "إعادة رفع وثيقة" : "رفع وثيقة جديدة"}
              </Text>
              {!isReupload && (
                <View style={sh.steps}>
                  {["category", "type", "file"].map((s, i) => (
                    <View
                      key={i}
                      style={[
                        sh.step,
                        step === s && sh.stepActive,
                        (step === "type" && i === 0) ||
                        (step === "file" && i <= 1)
                          ? sh.stepDone
                          : null,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Step 1 */}
              {!isReupload && step === "category" && (
                <View style={sh.section}>
                  <Text style={[sh.sectionTitle, { color: C.text }]}>
                    من أنت؟
                  </Text>
                  <View style={sh.catGrid}>
                    {cats.map((c) => {
                      const active = category === c.value;
                      return (
                        <TouchableOpacity
                          key={c.value}
                          style={[
                            sh.catCard,
                            active && {
                              borderColor: c.color,
                              backgroundColor: c.color + "0D",
                            },
                          ]}
                          onPress={() => {
                            setCategory(c.value);
                            setDocType("");
                            setFile(null);
                          }}
                          activeOpacity={0.8}
                        >
                          {active && (
                            <View
                              style={[sh.catDot, { backgroundColor: c.color }]}
                            >
                              <IconCheck
                                size={9}
                                color={T.white}
                                strokeWidth={3}
                              />
                            </View>
                          )}
                          <View
                            style={[
                              sh.catIconBox,
                              { backgroundColor: c.color + "15" },
                            ]}
                          >
                            <c.Icon
                              size={24}
                              color={active ? c.color : T.muted}
                              strokeWidth={1.5}
                            />
                          </View>
                          <Text
                            style={[sh.catLabel, active && { color: c.color }]}
                          >
                            {c.label}
                          </Text>
                          <Text style={sh.catAr}>{c.label_ar}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <TouchableOpacity
                    style={sh.primaryBtn}
                    onPress={() => setStep("type")}
                    activeOpacity={0.85}
                  >
                    <Text style={sh.primaryBtnText}>التالي</Text>
                    <IconChevronRight
                      size={18}
                      color={T.teal}
                      strokeWidth={2.5}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Step 2 */}
              {!isReupload && step === "type" && (
                <View style={sh.section}>
                  <Text style={[sh.sectionTitle, { color: C.text }]}>
                    نوع الوثيقة
                  </Text>
                  {allTypes.map((t) => {
                    const fType = DOC_FRAME_TYPE[t.value] ?? "a4";
                    const fColor =
                      fType === "card"
                        ? T.gold
                        : fType === "a4"
                          ? "#60A5FA"
                          : T.green;
                    const fLabel =
                      fType === "card"
                        ? "بطاقة"
                        : fType === "a4"
                          ? "A4"
                          : "صورة";
                    return (
                      <TouchableOpacity
                        key={t.value}
                        style={[
                          sh.typeRow,
                          docType === t.value && sh.typeRowActive,
                        ]}
                        onPress={() => setDocType(t.value)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            sh.radio,
                            docType === t.value && sh.radioActive,
                          ]}
                        >
                          {docType === t.value && <View style={sh.radioDot} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              sh.typeLabel,
                              { color: C.text },
                              docType === t.value && { color: C.teal },
                            ]}
                          >
                            {t.label_ar}
                          </Text>
                          <Text style={[sh.typeEn, { color: C.textMuted }]}>
                            {t.label}
                          </Text>
                        </View>
                        {/* badge حجم الوثيقة */}
                        <View
                          style={[
                            sh.sizeBadge,
                            {
                              backgroundColor: fColor + "18",
                              borderColor: fColor + "50",
                            },
                          ]}
                        >
                          <Text style={[sh.sizeBadgeText, { color: fColor }]}>
                            {fLabel}
                          </Text>
                        </View>
                        {docType === t.value && (
                          <IconCheck
                            size={16}
                            color={T.teal}
                            strokeWidth={2.5}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                  <View style={sh.row}>
                    <TouchableOpacity
                      style={sh.ghostBtn}
                      onPress={() => setStep("category")}
                      activeOpacity={0.8}
                    >
                      <Text style={sh.ghostBtnText}>رجوع</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        sh.primaryBtn,
                        { flex: 1 },
                        !docType && sh.btnDisabled,
                      ]}
                      onPress={() => docType && setStep("file")}
                      disabled={!docType}
                      activeOpacity={0.85}
                    >
                      <Text style={sh.primaryBtnText}>التالي</Text>
                      <IconChevronRight
                        size={18}
                        color={T.teal}
                        strokeWidth={2.5}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Step 3 */}
              {step === "file" && (
                <View style={sh.section}>
                  <Text style={[sh.sectionTitle, { color: C.text }]}>
                    {isReupload ? "اختر الملف الجديد" : "اختر الملف"}
                  </Text>
                  {/* badge حجم الوثيقة المختارة */}
                  {effectiveDocType && (
                    <View
                      style={[
                        sh.frameHintBadge,
                        {
                          backgroundColor: frameColor + "12",
                          borderColor: frameColor + "40",
                        },
                      ]}
                    >
                      {frameType === "card" ? (
                        <IconId size={14} color={frameColor} strokeWidth={2} />
                      ) : frameType === "a4" ? (
                        <IconFileText
                          size={14}
                          color={frameColor}
                          strokeWidth={2}
                        />
                      ) : (
                        <IconCamera
                          size={14}
                          color={frameColor}
                          strokeWidth={2}
                        />
                      )}
                      <Text style={[sh.frameHintText, { color: frameColor }]}>
                        {frameLabel}
                      </Text>
                    </View>
                  )}
                  {file ? (
                    <View
                      style={[sh.previewCard, { backgroundColor: C.cream2 }]}
                    >
                      {file.type.startsWith("image/") ? (
                        <Image
                          source={{ uri: file.uri }}
                          style={sh.previewImg}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={sh.previewDocBox}>
                          <IconFileText
                            size={40}
                            color={T.teal}
                            strokeWidth={1.3}
                          />
                          <Text
                            style={[sh.previewFileName, { color: C.text }]}
                            numberOfLines={2}
                          >
                            {file.name}
                          </Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={sh.removeBtn}
                        onPress={() => setFile(null)}
                      >
                        <IconX size={15} color={T.white} strokeWidth={2.5} />
                      </TouchableOpacity>
                      <View style={sh.previewBadge}>
                        <IconCircleCheck
                          size={12}
                          color={T.green}
                          strokeWidth={2.5}
                        />
                        <Text style={sh.previewBadgeText}>جاهز للرفع</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={sh.pickerGrid}>
                      {[
                        {
                          label: "الكاميرا",
                          sub: "اقتصاص تلقائي",
                          Icon: IconCamera,
                          color: T.teal,
                          fn: pickFromCamera,
                        },
                        {
                          label: "المعرض",
                          sub: "من الجهاز",
                          Icon: IconFolder,
                          color: "#2563EB",
                          fn: pickFromGallery,
                        },
                        {
                          label: "ملف PDF",
                          sub: "أو صورة",
                          Icon: IconFileText,
                          color: T.gold,
                          fn: pickDocument,
                        },
                      ].map((p, i) => (
                        <TouchableOpacity
                          key={i}
                          style={sh.pickerCard}
                          onPress={p.fn}
                          activeOpacity={0.8}
                        >
                          <View
                            style={[
                              sh.pickerIconBox,
                              { backgroundColor: p.color + "15" },
                            ]}
                          >
                            <p.Icon
                              size={26}
                              color={p.color}
                              strokeWidth={1.4}
                            />
                          </View>
                          <Text style={[sh.pickerLabel, { color: C.text }]}>
                            {p.label}
                          </Text>
                          <Text style={[sh.pickerSub, { color: C.textMuted }]}>
                            {p.sub}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <View style={sh.row}>
                    {!isReupload && (
                      <TouchableOpacity
                        style={[sh.ghostBtn, { borderColor: C.border }]}
                        onPress={() => setStep("type")}
                        activeOpacity={0.8}
                      >
                        <Text style={sh.ghostBtnText}>رجوع</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[
                        sh.uploadBtn,
                        { flex: 1 },
                        (!file || loading) && sh.btnDisabled,
                      ]}
                      onPress={handleSubmit}
                      disabled={!file || loading}
                      activeOpacity={0.85}
                    >
                      {loading ? (
                        <ActivityIndicator color={T.teal} size="small" />
                      ) : (
                        <>
                          <IconUpload
                            size={18}
                            color={T.teal}
                            strokeWidth={2.2}
                          />
                          <Text style={sh.uploadBtnText}>
                            {isReupload ? "إعادة الرفع" : "رفع الوثيقة"}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ✅ كاميرا مخصصة — الإطار يتغير حسب نوع الوثيقة */}
      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={(f) => {
          setFile(f);
          setCameraVisible(false);
        }}
        docType={effectiveDocType}
      />
    </>
  );
}

const sh = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "92%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.border,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    gap: 8,
  },
  closeBtn: {
    alignSelf: "flex-end",
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: T.dark,
    textAlign: "center",
    marginTop: -32,
  },
  steps: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 8,
  },
  step: { width: 24, height: 4, borderRadius: 2, backgroundColor: T.border },
  stepActive: { backgroundColor: T.teal, width: 32 },
  stepDone: { backgroundColor: T.green },
  section: { padding: 20, gap: 14, flex: 1 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: T.dark,
    textAlign: "right",
  },
  catGrid: { flexDirection: "row", gap: 10 },
  catCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    position: "relative",
  },
  catDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  catIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  catLabel: { fontSize: 11, fontWeight: "700", color: T.muted },
  catAr: { fontSize: 9, color: T.muted, textAlign: "center", opacity: 0.7 },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  typeRowActive: { borderColor: T.teal, backgroundColor: T.teal + "06" },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: T.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: T.teal },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.teal },
  typeLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: T.dark,
    textAlign: "right",
  },
  typeEn: { fontSize: 10, color: T.muted, textAlign: "right" },
  sizeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  sizeBadgeText: { fontSize: 10, fontWeight: "700" },
  frameHintBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  frameHintText: { fontSize: 12, fontWeight: "700" },
  pickerGrid: { flexDirection: "row", gap: 10 },
  pickerCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  pickerIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerLabel: { fontSize: 12, fontWeight: "700", color: T.dark },
  pickerSub: { fontSize: 9, color: T.muted, textAlign: "center" },
  previewCard: {
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    minHeight: 180,
  },
  previewImg: { width: "100%", height: 220 },
  previewDocBox: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  previewFileName: {
    fontSize: 13,
    fontWeight: "600",
    color: T.dark,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  removeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  previewBadgeText: { fontSize: 11, fontWeight: "600", color: T.green },
  row: { flexDirection: "row", gap: 10 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: T.gold,
    borderRadius: 16,
    paddingVertical: 15,
  },
  primaryBtnText: { fontSize: 15, fontWeight: "800", color: T.teal },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.gold,
    borderRadius: 16,
    paddingVertical: 15,
  },
  uploadBtnText: { fontSize: 15, fontWeight: "800", color: T.teal },
  ghostBtn: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: T.border,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostBtnText: { fontSize: 14, fontWeight: "600", color: T.muted },
  btnDisabled: { opacity: 0.35 },
});

// ── Main Screen ───────────────────────────────────────────────────
export default function DocumentsScreen() {
  const { colors: C } = useTheme();
  const { data, isLoading, refetch } = useDocuments();
  const deleteDoc = useDeleteDocument();
  const alert = useAlert();
  const [refreshing, setRefreshing] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [reuploadDoc, setReuploadDoc] = useState<any>(null);

  const documents: any[] = data?.documents ?? (Array.isArray(data) ? data : []);
  const category: RegistrantCategory = (data?.registrant_category ??
    "STUDENT") as RegistrantCategory;
  const isComplete = data?.is_complete ?? false;

  const stats = {
    total: documents.length,
    approved: documents.filter((d) => d.status === "APPROVED").length,
    pending: documents.filter((d) => d.status === "PENDING").length,
    rejected: documents.filter((d) => d.status === "REJECTED").length,
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDelete = (docId: string, docType: string) => {
    alert.confirm(
      "حذف الوثيقة",
      `هل تريد حذف "${formatDocType(docType)}"؟\nلا يمكن التراجع عن هذا الإجراء`,
      () =>
        deleteDoc.mutate(docId, {
          onSuccess: () => alert.success("تم الحذف", "تم حذف الوثيقة بنجاح"),
          onError: () => alert.error("فشل الحذف", "حاول مرة أخرى"),
        }),
      { confirmText: "حذف", cancelText: "إلغاء" },
    );
  };

  if (isLoading) {
    return (
      <View style={[s.center, { backgroundColor: C.background }]}>
        <ActivityIndicator size="large" color={T.teal} />
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: C.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={T.teal}
          />
        }
      >
        <HeroHeader
          isComplete={isComplete}
          stats={stats}
          onUpload={() => setUploadVisible(true)}
        />

        {documents.length === 0 ? (
          <EmptyState onUpload={() => setUploadVisible(true)} />
        ) : (
          <>
            <SectionLabel count={documents.length} />
            {documents.map((doc, i) => (
              <DocCard
                key={doc.document_id}
                doc={doc}
                index={i}
                onDelete={() => handleDelete(doc.document_id, doc.type)}
                onReupload={() => setReuploadDoc(doc)}
              />
            ))}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <UploadSheet
        visible={uploadVisible || !!reuploadDoc}
        onClose={() => {
          setUploadVisible(false);
          setReuploadDoc(null);
        }}
        initialCategory={category}
        reuploadDoc={reuploadDoc}
        onSuccess={() =>
          alert.success(
            reuploadDoc ? "تمت إعادة الرفع" : "تم رفع الوثيقة",
            reuploadDoc
              ? "تمت إعادة الرفع بنجاح وهي قيد المراجعة"
              : "تمت إضافة الوثيقة وهي قيد المراجعة",
          )
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 20,
  },
});
