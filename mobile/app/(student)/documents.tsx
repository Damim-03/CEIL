import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, RefreshControl, Modal, Alert, Linking,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  FileText, Search, Plus, Upload, Eye, Trash2, AlertCircle,
  CheckCircle, Clock, XCircle, RefreshCw, GraduationCap, User,
  Briefcase, Calendar, Filter,
} from "lucide-react-native";
import { useStudentDocuments, type RegistrantCategory } from "@/src/hooks/student/Usestudent";
import { PageLoader, ErrorState, EmptyState, StatusBadge } from "@/src/components/ui";
import { COLORS, SPACING, RADIUS } from "@/src/constants/theme";

// ─── Constants ────────────────────────────────────────────────────────────────
const DOCUMENT_TYPES: Record<RegistrantCategory, { value: string; label: string }[]> = {
  STUDENT: [
    { value: "STUDENT_CARD", label: "Student Card" },
    { value: "SCHOOL_CERTIFICATE", label: "School Certificate" },
    { value: "REGISTRATION_CERTIFICATE", label: "Registration Certificate" },
  ],
  EXTERNAL: [{ value: "ID_CARD", label: "National ID Card" }],
  EMPLOYEE: [
    { value: "WORK_CERTIFICATE", label: "Work Certificate" },
    { value: "ADMIN_CERTIFICATE", label: "Administrative Certificate" },
  ],
};

const OPTIONAL_DOCS = [{ value: "PHOTO", label: "Personal Photo" }];

const formatDocType = (type: string) =>
  type?.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase()) || type;

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const statusVariant = (status: string) => {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "error";
  return "warning";
};

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({
  visible, onClose, onUpload, category, currentCategory,
}: {
  visible: boolean;
  onClose: () => void;
  onUpload: (formData: FormData, newCategory: RegistrantCategory, currentCategory: RegistrantCategory) => void;
  category: RegistrantCategory;
  currentCategory: RegistrantCategory;
}) {
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<RegistrantCategory>(category);
  const [selectedFile, setSelectedFile] = useState<{ name: string; uri: string; type: string } | null>(null);

  const allTypes = [...(DOCUMENT_TYPES[selectedCategory] || []), ...OPTIONAL_DOCS];

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedFile({ name: asset.name, uri: asset.uri, type: asset.mimeType || "application/octet-stream" });
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedType) {
      Alert.alert("Error", "Please select a document type and file");
      return;
    }
    const formData = new FormData();
    formData.append("file", { uri: selectedFile.uri, name: selectedFile.name, type: selectedFile.type } as any);
    formData.append("type", selectedType);
    onUpload(formData, selectedCategory, currentCategory);
    onClose();
    setSelectedFile(null);
    setSelectedType("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={um.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
        <View style={um.sheet}>
          {/* Header */}
          <View style={um.header}>
            <Text style={um.headerTitle}>Upload Document</Text>
            <TouchableOpacity onPress={onClose} style={um.closeBtn}>
              <Text style={um.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.md }}>
            {/* Category selector */}
            <Text style={um.sectionLabel}>Registrant Category</Text>
            <View style={um.categoryRow}>
              {(["STUDENT", "EXTERNAL", "EMPLOYEE"] as RegistrantCategory[]).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[um.categoryBtn, selectedCategory === cat && um.categoryBtnActive]}
                  onPress={() => { setSelectedCategory(cat); setSelectedType(""); }}
                  activeOpacity={0.8}
                >
                  <Text style={[um.categoryBtnText, selectedCategory === cat && um.categoryBtnTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Doc type selector */}
            <Text style={um.sectionLabel}>Document Type</Text>
            {allTypes.map((dt) => (
              <TouchableOpacity
                key={dt.value}
                style={[um.typeBtn, selectedType === dt.value && um.typeBtnActive]}
                onPress={() => setSelectedType(dt.value)}
                activeOpacity={0.8}
              >
                <View style={[um.typeRadio, selectedType === dt.value && um.typeRadioActive]} />
                <Text style={[um.typeBtnText, selectedType === dt.value && um.typeBtnTextActive]}>{dt.label}</Text>
              </TouchableOpacity>
            ))}

            {/* File picker */}
            <Text style={um.sectionLabel}>File</Text>
            <TouchableOpacity style={um.filePicker} onPress={pickFile} activeOpacity={0.8}>
              <Upload size={20} color={COLORS.tealMid} />
              <Text style={um.filePickerText}>
                {selectedFile ? selectedFile.name : "Choose file (PDF or Image)"}
              </Text>
            </TouchableOpacity>

            {/* Upload btn */}
            <TouchableOpacity
              style={[um.uploadBtn, (!selectedFile || !selectedType) && um.uploadBtnDisabled]}
              onPress={handleUpload}
              disabled={!selectedFile || !selectedType}
              activeOpacity={0.85}
            >
              <Upload size={16} color="#fff" />
              <Text style={um.uploadBtnText}>Upload Document</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const um = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "85%", overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  headerTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  closeBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" },
  closeBtnText: { fontSize: 14, color: COLORS.textMuted, fontWeight: "600" },
  sectionLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, color: COLORS.textMuted, marginBottom: SPACING.sm },
  categoryRow: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.md },
  categoryBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: COLORS.borderLight, alignItems: "center" },
  categoryBtnActive: { backgroundColor: COLORS.tealMid, borderColor: COLORS.tealMid },
  categoryBtnText: { fontSize: 11, fontWeight: "600", color: COLORS.textMuted },
  categoryBtnTextActive: { color: "#fff" },
  typeBtn: { flexDirection: "row", alignItems: "center", gap: SPACING.md, padding: SPACING.md, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderLight, marginBottom: SPACING.sm },
  typeBtnActive: { borderColor: COLORS.tealMid, backgroundColor: `${COLORS.tealMid}06` },
  typeRadio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.borderLight },
  typeRadioActive: { borderColor: COLORS.tealMid, backgroundColor: COLORS.tealMid },
  typeBtnText: { fontSize: 13, color: COLORS.textMuted, fontWeight: "500" },
  typeBtnTextActive: { color: COLORS.text, fontWeight: "600" },
  filePicker: { borderWidth: 2, borderColor: COLORS.borderLight, borderStyle: "dashed", borderRadius: 14, paddingVertical: SPACING.xl, alignItems: "center", gap: SPACING.sm },
  filePickerText: { fontSize: 13, color: COLORS.textMuted, textAlign: "center" },
  uploadBtn: { backgroundColor: COLORS.tealMid, borderRadius: 14, height: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm, marginTop: SPACING.sm },
  uploadBtnDisabled: { opacity: 0.5 },
  uploadBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function DocumentsScreen() {
  const {
    documents, registrantCategory, isDocumentsComplete, missingDocuments,
    isLoading, isError, error, refetch, isRefetching,
    uploadWithCategory, deleteDocument, reuploadDocument,
  } = useStudentDocuments();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reuploadDoc, setReuploadDoc] = useState<any>(null);

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState message={(error as any)?.message} onRetry={refetch} />;

  const category = (registrantCategory || "STUDENT") as RegistrantCategory;

  const filtered = documents.filter((doc: any) => {
    const matchSearch = formatDocType(doc.type).toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || doc.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: documents.length,
    approved: documents.filter((d: any) => d.status === "APPROVED").length,
    pending: documents.filter((d: any) => d.status === "PENDING").length,
    rejected: documents.filter((d: any) => d.status === "REJECTED").length,
  };

  const handleDelete = (doc: any) => {
    Alert.alert(
      "Delete Document",
      `Delete "${formatDocType(doc.type)}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteDocument.mutate(doc.document_id) },
      ]
    );
  };

  const handleReupload = async (doc: any) => {
    const result = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/*"], copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("file", { uri: asset.uri, name: asset.name, type: asset.mimeType || "application/octet-stream" } as any);
      reuploadDocument.mutate({ documentId: doc.document_id, formData: formData as any });
    }
  };

  return (
    <>
      <ScrollView
        style={s.root}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.tealMid} />}
      >
        {/* ── Header ── */}
        <View style={s.headerCard}>
          <View style={s.headerAccent} />
          <View style={s.headerIcon}>
            <FileText size={24} color="#fff" />
          </View>
          <View style={s.headerText}>
            <Text style={s.headerTitle}>My Documents</Text>
            <Text style={s.headerSub}>Upload and manage your required documents</Text>
          </View>
          <TouchableOpacity style={s.uploadBtn} onPress={() => setUploadOpen(true)} activeOpacity={0.85}>
            <Plus size={16} color="#fff" />
            <Text style={s.uploadBtnText}>Upload</Text>
          </TouchableOpacity>
        </View>

        {/* ── Completeness banner ── */}
        {!isDocumentsComplete && missingDocuments?.length > 0 && (
          <View style={s.missingBanner}>
            <AlertCircle size={16} color={COLORS.gold} />
            <View style={{ flex: 1 }}>
              <Text style={s.missingTitle}>Missing Required Documents</Text>
              <Text style={s.missingSub}>{missingDocuments.join(", ")}</Text>
            </View>
          </View>
        )}
        {isDocumentsComplete && (
          <View style={s.completeBanner}>
            <CheckCircle size={16} color={COLORS.tealMid} />
            <Text style={s.completeText}>All required documents uploaded ✓</Text>
          </View>
        )}

        {/* ── Stats ── */}
        <View style={s.statsRow}>
          {[
            { label: "Total", value: stats.total, color: COLORS.tealMid },
            { label: "Approved", value: stats.approved, color: COLORS.tealMid },
            { label: "Pending", value: stats.pending, color: COLORS.gold },
            { label: "Rejected", value: stats.rejected, color: COLORS.red },
          ].map((stat) => (
            <View key={stat.label} style={[s.statCard, { borderColor: `${stat.color}20` }]}>
              <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Search & Filter ── */}
        <View style={s.searchRow}>
          <View style={s.searchWrap}>
            <Search size={16} color={COLORS.textMuted} />
            <TextInput
              style={s.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search documents..."
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
          {["all", "APPROVED", "PENDING", "REJECTED"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[s.filterBtn, filterStatus === f && s.filterBtnActive]}
              onPress={() => setFilterStatus(f)}
              activeOpacity={0.8}
            >
              <Text style={[s.filterBtnText, filterStatus === f && s.filterBtnTextActive]}>
                {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Documents list ── */}
        {filtered.length > 0 ? filtered.map((doc: any) => (
          <View key={doc.document_id} style={s.docCard}>
            {/* Status accent */}
            <View style={[s.docAccent, {
              backgroundColor: doc.status === "APPROVED" ? COLORS.tealMid : doc.status === "REJECTED" ? COLORS.red : COLORS.gold
            }]} />

            <View style={s.docPad}>
              {/* header */}
              <View style={s.docHeader}>
                <View style={s.docIconWrap}>
                  <FileText size={20} color={COLORS.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.docType}>{formatDocType(doc.type)}</Text>
                  {doc.created_at && (
                    <View style={s.docDateRow}>
                      <Calendar size={11} color={COLORS.textMuted} />
                      <Text style={s.docDate}>{formatDate(doc.created_at)}</Text>
                    </View>
                  )}
                </View>
                <StatusBadge
                  label={doc.status}
                  variant={statusVariant(doc.status)}
                />
              </View>

              {/* Rejection reason */}
              {doc.status === "REJECTED" && doc.rejection_reason && (
                <View style={s.rejectionWrap}>
                  <XCircle size={13} color={COLORS.red} />
                  <Text style={s.rejectionText}>{doc.rejection_reason}</Text>
                </View>
              )}

              {/* Actions */}
              <View style={s.docActions}>
                {doc.file_url && (
                  <TouchableOpacity style={s.docActionBtn} onPress={() => Linking.openURL(doc.file_url)} activeOpacity={0.8}>
                    <Eye size={14} color={COLORS.tealMid} />
                    <Text style={[s.docActionText, { color: COLORS.tealMid }]}>View</Text>
                  </TouchableOpacity>
                )}
                {doc.status === "REJECTED" && (
                  <TouchableOpacity style={s.docActionBtn} onPress={() => handleReupload(doc)} activeOpacity={0.8}>
                    <RefreshCw size={14} color={COLORS.gold} />
                    <Text style={[s.docActionText, { color: COLORS.gold }]}>Reupload</Text>
                  </TouchableOpacity>
                )}
                {doc.status !== "APPROVED" && (
                  <TouchableOpacity style={s.docActionBtn} onPress={() => handleDelete(doc)} activeOpacity={0.8}>
                    <Trash2 size={14} color={COLORS.red} />
                    <Text style={[s.docActionText, { color: COLORS.red }]}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )) : (
          <EmptyState
            icon={<FileText size={24} color={COLORS.textMuted} />}
            title="No Documents Found"
            subtitle={search ? "Try adjusting your search" : "Upload your first document to get started"}
          />
        )}
      </ScrollView>

      <UploadModal
        visible={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={(formData, newCat, curCat) => uploadWithCategory.mutate({ formData, newCategory: newCat, currentCategory: curCat })}
        category={category}
        currentCategory={category}
      />
    </>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F4F0" },
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: 32 },

  headerCard: { backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, padding: SPACING.lg, flexDirection: "row", alignItems: "center", gap: SPACING.md, overflow: "hidden" },
  headerAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: COLORS.tealMid },
  headerIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.gold, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  uploadBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: SPACING.md, paddingVertical: 9, backgroundColor: COLORS.tealMid, borderRadius: 12 },
  uploadBtnText: { fontSize: 13, color: "#fff", fontWeight: "600" },

  missingBanner: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md, backgroundColor: `${COLORS.gold}08`, borderWidth: 1, borderColor: `${COLORS.gold}25`, borderRadius: RADIUS.lg, padding: SPACING.md },
  missingTitle: { fontSize: 12, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  missingSub: { fontSize: 11, color: COLORS.textMuted },
  completeBanner: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, backgroundColor: `${COLORS.tealMid}06`, borderWidth: 1, borderColor: `${COLORS.tealMid}20`, borderRadius: RADIUS.lg, padding: SPACING.md },
  completeText: { fontSize: 13, fontWeight: "600", color: COLORS.tealMid },

  statsRow: { flexDirection: "row", gap: SPACING.sm },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: "500", marginTop: 2 },

  searchRow: { flexDirection: "row", gap: SPACING.sm },
  searchWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: SPACING.sm, backgroundColor: "#fff", borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight, paddingHorizontal: SPACING.md, height: 44 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  filterScroll: { maxHeight: 40 },
  filterContent: { gap: SPACING.sm, paddingHorizontal: 2 },
  filterBtn: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: COLORS.borderLight, backgroundColor: "#fff" },
  filterBtnActive: { backgroundColor: COLORS.tealMid, borderColor: COLORS.tealMid },
  filterBtnText: { fontSize: 12, color: COLORS.textMuted, fontWeight: "500" },
  filterBtnTextActive: { color: "#fff", fontWeight: "600" },

  docCard: { backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, overflow: "hidden" },
  docAccent: { height: 3, width: "100%" },
  docPad: { padding: SPACING.lg },
  docHeader: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md, marginBottom: SPACING.md },
  docIconWrap: { width: 40, height: 40, borderRadius: 14, backgroundColor: `${COLORS.gold}12`, alignItems: "center", justifyContent: "center" },
  docType: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  docDateRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  docDate: { fontSize: 11, color: COLORS.textMuted },
  rejectionWrap: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm, backgroundColor: "rgba(239,68,68,0.06)", borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  rejectionText: { flex: 1, fontSize: 12, color: COLORS.red, lineHeight: 18 },
  docActions: { flexDirection: "row", gap: SPACING.sm, flexWrap: "wrap" },
  docActionBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: COLORS.borderLight },
  docActionText: { fontSize: 12, fontWeight: "500" },
});
