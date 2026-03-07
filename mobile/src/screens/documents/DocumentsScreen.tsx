// ================================================================
// src/screens/documents/DocumentsScreen.tsx
// Student Documents — upload, view, status
// ================================================================
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  Modal,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/lib/Context/ThemeContext";
import BottomNavbar, { NavItem } from "@/src/components/BottomNavbar";

const TEAL = "#2B6F5E";
const TEAL2 = "#3D8B76";
const WHITE = "#FFFFFF";
const RED = "#EF4444";
const GREEN = "#22C55E";
const AMBER = "#F59E0B";
const BLUE = "#3B82F6";

type DocStatus = "APPROVED" | "PENDING" | "REJECTED";

const STATUS_CONFIG: Record<
  DocStatus,
  { color: string; bg: string; label: string; icon: any }
> = {
  APPROVED: {
    color: GREEN,
    bg: `${GREEN}18`,
    label: "معتمد",
    icon: "checkmark-circle",
  },
  PENDING: { color: AMBER, bg: `${AMBER}18`, label: "بالانتظار", icon: "time" },
  REJECTED: {
    color: RED,
    bg: `${RED}18`,
    label: "مرفوض",
    icon: "close-circle",
  },
};

const MOCK_DOCS = [
  {
    id: "1",
    type: "STUDENT_CARD",
    type_ar: "بطاقة الطالب",
    status: "APPROVED" as DocStatus,
    uploaded: "2024-10-01",
    size: "1.2 MB",
    ext: "pdf",
  },
  {
    id: "2",
    type: "SCHOOL_CERTIFICATE",
    type_ar: "شهادة التسجيل",
    status: "PENDING" as DocStatus,
    uploaded: "2024-10-05",
    size: "800 KB",
    ext: "jpg",
  },
  {
    id: "3",
    type: "REGISTRATION_CERTIFICATE",
    type_ar: "شهادة مدرسية",
    status: "REJECTED" as DocStatus,
    uploaded: "2024-09-20",
    size: "500 KB",
    ext: "pdf",
    note: "الصورة غير واضحة",
  },
  {
    id: "4",
    type: "NATIONAL_ID",
    type_ar: "بطاقة التعريف الوطنية",
    status: "APPROVED" as DocStatus,
    uploaded: "2024-10-01",
    size: "650 KB",
    ext: "jpg",
  },
];

const NAV_ITEMS: NavItem[] = [
  { key: "home", label: "الرئيسية", icon: "home-outline", iconActive: "home" },
  {
    key: "courses",
    label: "الدورات",
    icon: "book-outline",
    iconActive: "book",
  },
  {
    key: "news",
    label: "الأخبار",
    icon: "notifications-outline",
    iconActive: "notifications",
    badge: 2,
  },
  {
    key: "profile",
    label: "حسابي",
    icon: "person-outline",
    iconActive: "person",
    avatar: "أ",
  },
];
const ROUTES: Record<string, string> = {
  home: "/(public)/home",
  courses: "/(public)/courses",
  news: "/(public)/news",
  profile: "/(public)/profile",
};

const EXT_ICON: Record<string, any> = {
  pdf: "document-text-outline",
  jpg: "image-outline",
  png: "image-outline",
};

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme: t } = useTheme();
  const NAV_H = 68 + insets.bottom;

  const [uploadModal, setUploadModal] = useState(false);

  const approved = MOCK_DOCS.filter((d) => d.status === "APPROVED").length;
  const pending = MOCK_DOCS.filter((d) => d.status === "PENDING").length;
  const rejected = MOCK_DOCS.filter((d) => d.status === "REJECTED").length;

  const handleNav = (key: string) => router.push(ROUTES[key] as any);

  return (
    <View style={[s.root, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={t.isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View
        style={[
          s.header,
          {
            paddingTop: insets.top + 12,
            backgroundColor: t.surface,
            borderBottomColor: t.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: t.surface2 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-forward" size={18} color={t.text2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[s.headerTitle, { color: t.text1 }]}>وثائقي</Text>
          <Text style={[s.headerSub, { color: t.text3 }]}>
            {MOCK_DOCS.length} وثيقة
          </Text>
        </View>
        <TouchableOpacity
          style={[s.uploadBtn, { backgroundColor: TEAL }]}
          onPress={() => setUploadModal(true)}
        >
          <Ionicons name="cloud-upload-outline" size={16} color={WHITE} />
          <Text style={s.uploadBtnTxt}>رفع</Text>
        </TouchableOpacity>
      </View>

      {/* Stats strip */}
      <View
        style={[
          s.statsRow,
          { backgroundColor: t.surface, borderBottomColor: t.border },
        ]}
      >
        {[
          { label: "معتمد", value: approved, color: GREEN },
          { label: "بالانتظار", value: pending, color: AMBER },
          { label: "مرفوض", value: rejected, color: RED },
        ].map((st) => (
          <View key={st.label} style={s.statItem}>
            <Text style={[s.statVal, { color: st.color }]}>{st.value}</Text>
            <Text style={[s.statLbl, { color: t.text3 }]}>{st.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={MOCK_DOCS}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: NAV_H + 20,
          gap: 10,
        }}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status];
          const hasNote = item.status === "REJECTED" && (item as any).note;
          return (
            <View
              style={[
                s.docCard,
                { backgroundColor: t.surface, borderColor: t.border },
              ]}
            >
              {/* Left accent */}
              <View style={[s.accent, { backgroundColor: cfg.color }]} />

              <View style={[s.docIcon, { backgroundColor: `${BLUE}15` }]}>
                <Ionicons
                  name={EXT_ICON[item.ext] ?? "document-outline"}
                  size={22}
                  color={BLUE}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[s.docType, { color: t.text1 }]}>
                  {item.type_ar}
                </Text>
                <Text style={[s.docMeta, { color: t.text3 }]}>
                  {item.size} · {item.uploaded}
                </Text>
                {hasNote && (
                  <View style={[s.noteRow, { backgroundColor: `${RED}12` }]}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={11}
                      color={RED}
                    />
                    <Text style={[s.noteTxt, { color: RED }]}>
                      {(item as any).note}
                    </Text>
                  </View>
                )}
              </View>

              <View style={[s.statusPill, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon} size={12} color={cfg.color} />
                <Text style={[s.statusTxt, { color: cfg.color }]}>
                  {cfg.label}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Upload Modal */}
      <Modal visible={uploadModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { backgroundColor: t.surface }]}>
            <View style={[s.modalHandle, { backgroundColor: t.border }]} />
            <Text style={[s.modalTitle, { color: t.text1 }]}>
              رفع وثيقة جديدة
            </Text>

            <TouchableOpacity
              style={[
                s.uploadZone,
                { borderColor: TEAL2, backgroundColor: `${TEAL}08` },
              ]}
            >
              <Ionicons name="cloud-upload-outline" size={40} color={TEAL2} />
              <Text style={[s.uploadZoneTxt, { color: t.text2 }]}>
                اضغط لاختيار ملف
              </Text>
              <Text style={[s.uploadZoneSub, { color: t.text3 }]}>
                PDF, JPG, PNG · حد أقصى 5MB
              </Text>
            </TouchableOpacity>

            <View style={s.docTypeList}>
              {[
                "بطاقة الطالب",
                "شهادة التسجيل",
                "شهادة مدرسية",
                "بطاقة التعريف",
              ].map((tp) => (
                <TouchableOpacity
                  key={tp}
                  style={[
                    s.docTypeItem,
                    { backgroundColor: t.surface2, borderColor: t.border },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={16}
                    color={t.text2}
                  />
                  <Text style={[s.docTypeItemTxt, { color: t.text2 }]}>
                    {tp}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[s.modalClose, { borderColor: t.border }]}
              onPress={() => setUploadModal(false)}
            >
              <Text style={[s.modalCloseTxt, { color: t.text2 }]}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNavbar items={NAV_ITEMS} activeKey="home" onPress={handleNav} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  headerSub: { fontSize: 11, marginTop: 1 },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  uploadBtnTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
  statsRow: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1 },
  statItem: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 20, fontWeight: "900" },
  statLbl: { fontSize: 10, marginTop: 2 },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    padding: 12,
  },
  accent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  docIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  docType: { fontSize: 13, fontWeight: "700" },
  docMeta: { fontSize: 11, marginTop: 2 },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 5,
  },
  noteTxt: { fontSize: 10, fontWeight: "600" },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusTxt: { fontSize: 10, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 18,
  },
  uploadZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  uploadZoneTxt: { fontSize: 14, fontWeight: "600" },
  uploadZoneSub: { fontSize: 11 },
  docTypeList: { gap: 8, marginBottom: 16 },
  docTypeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  docTypeItemTxt: { fontSize: 13, fontWeight: "600" },
  modalClose: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCloseTxt: { fontSize: 14, fontWeight: "600" },
});
