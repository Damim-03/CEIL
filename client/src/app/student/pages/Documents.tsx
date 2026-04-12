import { useState, useEffect } from "react";
import PageLoader from "../../../components/PageLoader";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { AlertDialog, useAlert } from "../components/Alertdialog";
import type { Document } from "../../../types/Types";
import {
  FileText,
  Search,
  File,
  Image,
  Plus,
  X,
  Filter,
  Upload,
  Eye,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  ExternalLink,
  Trash2,
  AlertCircle,
  GraduationCap,
  User,
  Briefcase,
  RefreshCw,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { useStudentDocuments } from "../../../hooks/student/Usestudent";
import { useMe } from "../../../hooks/auth/auth.hooks";

/* ===============================================================
   TYPES & CONSTANTS
=============================================================== */

type RegistrantCategory = "STUDENT" | "EXTERNAL" | "EMPLOYEE";

interface DocumentTypeOption {
  value: string;
  label: string;
  label_ar: string;
}

const DOCUMENT_TYPES_BY_CATEGORY: Record<
  RegistrantCategory,
  DocumentTypeOption[]
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
      label: "Work Certificate / Professional Card",
      label_ar: "شهادة عمل / بطاقة مهنية",
    },
    {
      value: "ADMIN_CERTIFICATE",
      label: "Administrative Certificate",
      label_ar: "شهادة إدارية",
    },
  ],
};

const OPTIONAL_DOCUMENTS: DocumentTypeOption[] = [
  { value: "PHOTO", label: "Personal Photo", label_ar: "صورة شمسية" },
];

const CATEGORY_INFO: Record<
  RegistrantCategory,
  {
    label: string;
    label_ar: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    description: string;
  }
> = {
  STUDENT: {
    label: "Student",
    label_ar: "طالب",
    icon: GraduationCap,
    color: "text-blue-600 dark:text-blue-400",
    description:
      "يجب على الطالب رفع ملف واحد فقط من الملفات التالية: بطاقة الطالب أو شهادة مدرسية أو شهادة تسجيل.",
  },
  EXTERNAL: {
    label: "External",
    label_ar: "شخص خارجي",
    icon: User,
    color: "text-purple-600 dark:text-purple-400",
    description: "يجب رفع بطاقة التعريف الوطنية.",
  },
  EMPLOYEE: {
    label: "Employee",
    label_ar: "موظف / أستاذ",
    icon: Briefcase,
    color: "text-orange-600 dark:text-orange-400",
    description: "يجب رفع شهادة عمل أو بطاقة مهنية أو شهادة إدارية.",
  },
};

const CATEGORY_CARDS = [
  {
    value: "STUDENT" as RegistrantCategory,
    label: "Student",
    label_ar: "طالب",
    label_fr: "Étudiant",
    icon: GraduationCap,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200/60 dark:border-blue-800/20",
    activeBg: "bg-blue-50 dark:bg-blue-950/30",
    activeBorder: "border-blue-500 dark:border-blue-400",
    description_ar: "بطاقة طالب أو شهادة مدرسية",
  },
  {
    value: "EMPLOYEE" as RegistrantCategory,
    label: "Employee",
    label_ar: "موظف / أستاذ",
    label_fr: "Employé",
    icon: Briefcase,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-200/60 dark:border-orange-800/20",
    activeBg: "bg-orange-50 dark:bg-orange-950/30",
    activeBorder: "border-orange-500 dark:border-orange-400",
    description_ar: "بطاقة مهنية أو شهادة عمل",
  },
  {
    value: "EXTERNAL" as RegistrantCategory,
    label: "External",
    label_ar: "شخص خارجي",
    label_fr: "Externe",
    icon: User,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-200/60 dark:border-purple-800/20",
    activeBg: "bg-purple-50 dark:bg-purple-950/30",
    activeBorder: "border-purple-500 dark:border-purple-400",
    description_ar: "بطاقة التعريف الوطنية",
  },
];

/* ===============================================================
   SPOTLIGHT COMPONENTS
=============================================================== */

// ── Spotlight 1: زر Upload ──────────────────────────────────────
function UploadSpotlight({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);
  const dismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 250);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={dismiss} />
      <div
        className={`absolute top-full mt-3 right-0 z-50 w-72 transition-all duration-300 ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"}`}
      >
        {/* Arrow */}
        <div className="absolute -top-1.5 right-5 w-3 h-3 bg-white dark:bg-[#1A1A1A] rotate-45 border-l border-t border-[#D8CDC0]/60 dark:border-[#2A2A2A]" />
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#2B6F5E] via-[#C4A035] to-[#2B6F5E]" />
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#1a4a3a] flex items-center justify-center shadow-lg shadow-[#2B6F5E]/25">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-[#2B6F5E]/30 animate-ping" />
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C4A035] border-2 border-white dark:border-[#1A1A1A] flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#C4A035] uppercase tracking-widest mb-0.5">
                  ابدأ من هنا ✨
                </p>
                <h3 className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  ارفع وثيقتك الأولى
                </h3>
              </div>
            </div>
            <p className="text-xs text-[#6B5D4F] dark:text-[#888888] leading-relaxed mb-3">
              لإتمام تسجيلك، انقر على هذا الزر لرفع الوثائق المطلوبة. خطوة واحدة
              فقط تفصلك عن اكتمال ملفك.
            </p>
            <button
              onClick={dismiss}
              className="w-full h-8 rounded-xl bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 text-[#2B6F5E] dark:text-[#4ADE80] text-xs font-semibold hover:bg-[#2B6F5E]/15 transition-colors"
            >
              فهمت، شكراً!
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Spotlight 2: Category Banner ────────────────────────────────
function BannerSpotlight({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);
  const dismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 250);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={dismiss} />
      <div
        className={`absolute -top-2 left-1/2 z-50 w-80 transition-all duration-300 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        style={{
          transform: visible
            ? "translateX(-50%) translateY(-100%)"
            : "translateX(-50%) translateY(-90%)",
        }}
      >
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#C4A035]/40 dark:border-[#D4A843]/20 shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#C4A035] to-[#C4A035]/60" />
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#C4A035]/10 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 text-[#C4A035]" />
              </div>
              <p className="text-xs font-bold text-[#C4A035] uppercase tracking-widest">
                مهم — اقرأ هذا أولاً
              </p>
            </div>
            <p className="text-xs text-[#6B5D4F] dark:text-[#888888] leading-relaxed mb-3">
              هذا القسم يُخبرك بالوثائق المطلوبة منك تحديداً حسب فئتك (طالب /
              موظف / خارجي). تأكد من قراءته قبل الرفع.
            </p>
            <button
              onClick={dismiss}
              className="w-full h-8 rounded-xl bg-[#C4A035]/10 text-[#C4A035] text-xs font-semibold hover:bg-[#C4A035]/20 transition-colors"
            >
              فهمت ✓
            </button>
          </div>
        </div>
        {/* Arrow لأسفل */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#1A1A1A] rotate-45 border-r border-b border-[#C4A035]/40 dark:border-[#D4A843]/20" />
      </div>
    </>
  );
}

// ── Spotlight 3: Re-upload ───────────────────────────────────────
function ReuploadSpotlight({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);
  const dismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 250);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={dismiss} />
      <div
        className={`absolute bottom-full mb-2 right-0 z-50 w-64 transition-all duration-300 ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"}`}
      >
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-red-200 dark:border-red-800/40 shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-500 to-red-400" />
          <div className="p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center shrink-0">
                <RefreshCw className="w-3.5 h-3.5 text-red-500" />
              </div>
              <p className="text-xs font-bold text-red-600 dark:text-red-400">
                وثيقتك مرفوضة!
              </p>
            </div>
            <p className="text-[11px] text-[#6B5D4F] dark:text-[#888888] leading-relaxed mb-2">
              انقر على "Re-upload" لرفع وثيقة جديدة بدلاً من المرفوضة.
            </p>
            <button
              onClick={dismiss}
              className="w-full h-7 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-[11px] font-semibold hover:bg-red-100 transition-colors"
            >
              فهمت
            </button>
          </div>
        </div>
        {/* Arrow */}
        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-[#1A1A1A] rotate-45 border-r border-b border-red-200 dark:border-red-800/40" />
      </div>
    </>
  );
}

// ── Spotlight 4: Category داخل Modal ────────────────────────────
function CategorySpotlight({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);
  const dismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 250);
  };

  return (
    <div
      className={`transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}
    >
      <div className="bg-[#1B1B1B] dark:bg-[#E5E5E5] rounded-xl px-4 py-3 flex items-start gap-2.5 shadow-lg mb-3">
        <Lightbulb className="w-4 h-4 text-[#C4A035] shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-white dark:text-[#1B1B1B] flex-1 leading-relaxed">
          اختر فئتك بدقة — هذا يحدد الوثائق المطلوبة منك تحديداً
        </p>
        <button
          onClick={dismiss}
          className="text-white/40 dark:text-[#1B1B1B]/40 hover:text-white/80 dark:hover:text-[#1B1B1B]/80 transition-colors mt-0.5 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Arrow لأسفل */}
      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1B1B1B] dark:border-t-[#E5E5E5] mx-8" />
    </div>
  );
}

/* ===============================================================
   MAIN PAGE
=============================================================== */

export default function Documents() {
  const {
    documents = [],
    registrantCategory,
    requiredDocuments,
    isDocumentsComplete,
    missingDocuments,
    isLoading,
    uploadDocuments,
    uploadWithCategory,
    deleteDocument,
    reuploadDocument,
  } = useStudentDocuments();

  const { data: me } = useMe();
  const { alertState, hideAlert, showConfirm, showSuccess, showError } =
    useAlert();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [reuploadDoc, setReuploadDoc] = useState<Document | null>(null);

  // ── Spotlight states ──────────────────────────────────────────
  const [showUploadSpotlight, setShowUploadSpotlight] = useState(false);
  const [showBannerSpotlight, setShowBannerSpotlight] = useState(false);
  const [reuploadSpotlightDocId, setReuploadSpotlightDocId] = useState<
    string | null
  >(null);

  // ── Spotlight 1: Upload button — طالب جديد بدون وثائق ────────
  useEffect(() => {
    if (!me || isLoading || documents.length > 0) return;
    const key = `sp_upload_${me.user_id}`;
    if (!localStorage.getItem(key)) {
      const t = setTimeout(() => {
        setShowUploadSpotlight(true);
        localStorage.setItem(key, "true");
      }, 900);
      return () => clearTimeout(t);
    }
  }, [me, isLoading, documents.length]);

  // ── Spotlight 2: Banner — بعد الـ upload spotlight ───────────
  useEffect(() => {
    if (!me || isLoading || documents.length > 0) return;
    const key = `sp_banner_${me.user_id}`;
    if (!localStorage.getItem(key)) {
      const t = setTimeout(() => {
        setShowBannerSpotlight(true);
        localStorage.setItem(key, "true");
      }, 2600);
      return () => clearTimeout(t);
    }
  }, [me, isLoading, documents.length]);

  // ── Spotlight 3: Re-upload — أول وثيقة مرفوضة جديدة ─────────
  useEffect(() => {
    if (!me || isLoading) return;
    const rejected = documents.filter((d: Document) => d.status === "REJECTED");
    for (const doc of rejected) {
      const key = `sp_reupload_${me.user_id}_${doc.document_id}`;
      if (!localStorage.getItem(key)) {
        const t = setTimeout(() => {
          setReuploadSpotlightDocId(doc.document_id);
          localStorage.setItem(key, "true");
        }, 800);
        return () => clearTimeout(t);
      }
    }
  }, [me, isLoading, documents]);

  if (isLoading) return <PageLoader />;

  const category = (registrantCategory || "STUDENT") as RegistrantCategory;

  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch =
      doc.type?.toLowerCase().includes(search.toLowerCase()) ?? false;
    const matchesType = filterType === "all" || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const documentTypes = Array.from(
    new Set<string>(documents.map((d: Document) => d.type)),
  );

  const stats = {
    total: documents.length,
    approved: documents.filter((d: Document) => d.status === "APPROVED").length,
    pending: documents.filter((d: Document) => d.status === "PENDING").length,
    rejected: documents.filter((d: Document) => d.status === "REJECTED").length,
  };

  const handleDeleteClick = (documentId: string, documentType: string) => {
    setDocumentToDelete(documentId);
    showConfirm(
      "Delete Document",
      `Are you sure you want to delete "${formatDocumentType(documentType)}"? This action cannot be undone.`,
      () => {
        deleteDocument.mutate(documentId, {
          onSuccess: () => {
            showSuccess(
              "Document Deleted",
              "Your document has been successfully deleted.",
            );
            setDocumentToDelete(null);
          },
          onError: (err: Error) => {
            const msg =
              (err as any)?.response?.data?.message ||
              "Failed to delete document. Please try again.";
            showError("Delete Failed", msg);
            setDocumentToDelete(null);
          },
        });
      },
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-visible">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035] rounded-l-2xl" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-lg shadow-[#C4A035]/20 dark:shadow-black/30">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  My Documents
                </h1>
                <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-0.5">
                  Upload and manage your required documents
                </p>
              </div>
            </div>

            {/* ✅ Spotlight 1 — Upload Button */}
            <div className="relative">
              <Button
                onClick={() => {
                  setShowUploadSpotlight(false);
                  setUploadModalOpen(true);
                }}
                className={`relative gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl transition-all overflow-visible ${
                  showUploadSpotlight
                    ? "shadow-[0_0_0_4px_rgba(43,111,94,0.3),0_0_25px_rgba(43,111,94,0.25)] scale-105"
                    : "shadow-md shadow-[#2B6F5E]/20"
                }`}
              >
                {showUploadSpotlight && (
                  <span className="absolute inset-0 rounded-xl bg-[#2B6F5E]/20 animate-ping pointer-events-none" />
                )}
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Upload Document</span>
              </Button>

              {showUploadSpotlight && (
                <UploadSpotlight
                  onDismiss={() => setShowUploadSpotlight(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* ✅ Spotlight 2 — Category Banner */}
        <div className="relative">
          {showBannerSpotlight && (
            <BannerSpotlight onDismiss={() => setShowBannerSpotlight(false)} />
          )}
          <div
            className={
              showBannerSpotlight
                ? "ring-2 ring-[#C4A035]/50 ring-offset-2 ring-offset-[#FAFAF8] dark:ring-offset-[#0F0F0F] rounded-2xl"
                : ""
            }
          >
            <CategoryBanner
              category={category}
              isComplete={isDocumentsComplete}
              missingDocuments={missingDocuments}
              requiredDocuments={requiredDocuments}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total Documents"
            value={stats.total}
            color="teal"
          />
          <StatCard
            icon={CheckCircle}
            label="Approved"
            value={stats.approved}
            color="green"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            color="mustard"
          />
          <StatCard
            icon={XCircle}
            label="Rejected"
            value={stats.rejected}
            color="red"
          />
        </div>

        {/* Search & Filter */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#555555]" />
              <Input
                placeholder="Search documents by type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/30 focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/10 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#BEB29E] dark:text-[#555555]" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/10 focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/30"
              >
                <option value="all">All Types</option>
                {documentTypes.map((type, i) => (
                  <option key={`${type}-${i}`} value={type}>
                    {formatDocumentType(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 text-sm text-[#6B5D4F] dark:text-[#888888]">
            Showing{" "}
            <span className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {filteredDocuments.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {documents.length}
            </span>{" "}
            documents
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/60 dark:border-[#2A2A2A] rounded-2xl overflow-visible">
          {filteredDocuments.length > 0 ? (
            <div className="divide-y divide-[#D8CDC0]/30 dark:divide-[#2A2A2A]">
              {filteredDocuments.map((doc: Document) => (
                <DocumentCard
                  key={doc.document_id}
                  document={doc}
                  onView={setViewDocument}
                  onDelete={handleDeleteClick}
                  onReupload={(d) => setReuploadDoc(d)}
                  isDeleting={
                    deleteDocument.isPending &&
                    documentToDelete === doc.document_id
                  }
                  showReuploadSpotlight={
                    reuploadSpotlightDocId === doc.document_id
                  }
                  onDismissReuploadSpotlight={() =>
                    setReuploadSpotlightDocId(null)
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              hasDocuments={documents.length > 0}
              onUpload={() => setUploadModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {uploadModalOpen && (
        <UploadModal
          category={category}
          onClose={() => setUploadModalOpen(false)}
          uploadWithCategory={uploadWithCategory}
          onSuccess={(newCat) => {
            setUploadModalOpen(false);
            showSuccess(
              "Upload Successful",
              newCat !== category
                ? `Category updated to ${newCat} and document uploaded. Pending review.`
                : "Document uploaded successfully and is pending review.",
            );
          }}
          onError={(msg) => showError("Upload Failed", msg)}
        />
      )}

      {reuploadDoc && (
        <ReuploadModal
          document={reuploadDoc}
          onClose={() => setReuploadDoc(null)}
          reuploadDocument={reuploadDocument}
          onSuccess={() => {
            setReuploadDoc(null);
            showSuccess(
              "Re-upload Successful",
              "Your document has been re-uploaded and is pending review.",
            );
          }}
          onError={(msg) => showError("Re-upload Failed", msg)}
        />
      )}

      {viewDocument && (
        <ViewDocumentModal
          document={viewDocument}
          onClose={() => setViewDocument(null)}
        />
      )}

      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        onConfirm={alertState.onConfirm}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        confirmText={alertState.type === "confirm" ? "Delete" : "OK"}
        cancelText="Cancel"
      />
    </>
  );
}

/* ===============================================================
   CATEGORY BANNER
=============================================================== */

function CategoryBanner({
  category,
  isComplete,
  missingDocuments,
  requiredDocuments,
}: {
  category: RegistrantCategory;
  isComplete: boolean;
  missingDocuments: string[];
  requiredDocuments: any[];
}) {
  const info = CATEGORY_INFO[category];
  const Icon = info.icon;
  return (
    <div
      className={`relative bg-white dark:bg-[#1A1A1A] rounded-2xl border overflow-hidden ${
        isComplete
          ? "border-[#8DB896]/60 dark:border-[#4ADE80]/20"
          : "border-[#C4A035]/40 dark:border-[#D4A843]/20"
      }`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          isComplete
            ? "bg-gradient-to-b from-[#8DB896] to-[#2B6F5E]"
            : "bg-gradient-to-b from-[#C4A035] to-[#C4A035]/60"
        }`}
      />
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isComplete
                ? "bg-[#8DB896]/12 dark:bg-[#4ADE80]/10"
                : "bg-[#C4A035]/8 dark:bg-[#D4A843]/10"
            }`}
          >
            {isComplete ? (
              <CheckCircle className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[#C4A035] dark:text-[#D4A843]" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${info.color}`} />
              <span className={`text-sm font-medium ${info.color}`}>
                {info.label} — {info.label_ar}
              </span>
            </div>
            {isComplete ? (
              <p className="text-sm text-[#2B6F5E] dark:text-[#4ADE80] font-medium">
                All required documents are approved ✓
              </p>
            ) : (
              <>
                <p className="text-sm text-[#6B5D4F] dark:text-[#888888] mb-2">
                  Required documents for your category:
                </p>
                <p className="text-sm text-[#6B5D4F] dark:text-[#888888] mt-2">
                  {info.description}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   STAT CARD
=============================================================== */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, { bar: string; bg: string; icon: string }> = {
    teal: {
      bar: "from-[#2B6F5E] to-[#2B6F5E]/70",
      bg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/[0.08]",
      icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
    },
    green: {
      bar: "from-[#8DB896] to-[#8DB896]/70",
      bg: "bg-[#8DB896]/12 dark:bg-[#4ADE80]/10",
      icon: "text-[#3D7A4A] dark:text-[#4ADE80]",
    },
    mustard: {
      bar: "from-[#C4A035] to-[#C4A035]/70",
      bg: "bg-[#C4A035]/8 dark:bg-[#D4A843]/[0.08]",
      icon: "text-[#C4A035] dark:text-[#D4A843]",
    },
    red: {
      bar: "from-red-500 to-red-500/70",
      bg: "bg-red-50 dark:bg-red-950/20",
      icon: "text-red-600 dark:text-red-400",
    },
  };
  const c = colors[color] || colors.teal;
  return (
    <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-4 overflow-hidden group hover:shadow-md dark:hover:shadow-black/20 transition-all">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${c.bar} opacity-60 group-hover:opacity-100 transition-opacity`}
      />
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div>
          <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">{label}</p>
          <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   DOCUMENT CARD
=============================================================== */

function DocumentCard({
  document,
  onView,
  onDelete,
  onReupload,
  isDeleting,
  showReuploadSpotlight = false,
  onDismissReuploadSpotlight,
}: {
  document: Document;
  onView: (d: Document) => void;
  onDelete: (id: string, type: string) => void;
  onReupload: (d: Document) => void;
  isDeleting: boolean;
  showReuploadSpotlight?: boolean;
  onDismissReuploadSpotlight?: () => void;
}) {
  const getIcon = () => {
    if (document.file_path?.endsWith(".pdf"))
      return <FileText className="w-6 h-6" />;
    if (document.file_path?.match(/\.(jpg|png|jpeg)$/))
      return <Image className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const getStatusBadge = () => {
    if (document.status === "APPROVED")
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8DB896]/12 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]">
          <CheckCircle className="w-3 h-3 mr-1" /> Approved
        </span>
      );
    if (document.status === "PENDING")
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#C4A035]/8 dark:bg-[#D4A843]/10 text-[#C4A035] dark:text-[#D4A843]">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </span>
      );
    if (document.status === "REJECTED")
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400">
          <XCircle className="w-3 h-3 mr-1" /> Rejected
        </span>
      );
    return null;
  };

  const handleDownload = () => {
    if (document.file_path) {
      const link = window.document.createElement("a");
      link.href = document.file_path;
      link.download = document.file_path.split("/").pop() || "download";
      link.click();
    }
  };

  const uploadedAt = document.uploaded_at || (document as any).created_at;
  const canDelete =
    document.status === "PENDING" || document.status === "REJECTED";
  const canReupload = document.status === "REJECTED";

  return (
    <div
      className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 transition-colors gap-4 ${
        showReuploadSpotlight
          ? "bg-red-50/40 dark:bg-red-950/10"
          : "hover:bg-[#D8CDC0]/5 dark:hover:bg-[#222222]"
      }`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center text-white shrink-0 shadow-md shadow-[#2B6F5E]/15 dark:shadow-black/30">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] text-base">
            {formatDocumentType(document.type)}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {getStatusBadge()}
            {uploadedAt && (
              <span className="flex items-center gap-1 text-sm text-[#BEB29E] dark:text-[#666666]">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(uploadedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          {document.rejection_reason && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              Reason: {document.rejection_reason}
            </p>
          )}
        </div>
      </div>

      {document.file_path && (
        <div className="flex items-center gap-2 lg:shrink-0 flex-wrap">
          <Button
            onClick={() => onView(document)}
            size="sm"
            variant="outline"
            className="gap-1 border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#6B5D4F] dark:text-[#888888] hover:bg-[#2B6F5E]/5 dark:hover:bg-[#4ADE80]/5 hover:border-[#2B6F5E]/30 dark:hover:border-[#4ADE80]/20 rounded-xl"
          >
            <Eye className="h-4 w-4" /> View
          </Button>
          <Button
            onClick={handleDownload}
            size="sm"
            variant="outline"
            className="gap-1 border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#6B5D4F] dark:text-[#888888] hover:bg-[#C4A035]/5 dark:hover:bg-[#D4A843]/5 hover:border-[#C4A035]/30 dark:hover:border-[#D4A843]/20 rounded-xl"
          >
            <Download className="h-4 w-4" /> Download
          </Button>

          {/* ✅ Spotlight 3 — Re-upload */}
          {canReupload && (
            <div className="relative">
              {showReuploadSpotlight && (
                <span className="absolute inset-0 rounded-xl bg-red-400/25 animate-ping pointer-events-none" />
              )}
              <Button
                onClick={() => {
                  onDismissReuploadSpotlight?.();
                  onReupload(document);
                }}
                size="sm"
                variant="outline"
                className={`gap-1 rounded-xl relative z-10 transition-all ${
                  showReuploadSpotlight
                    ? "border-red-400 dark:border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 shadow-[0_0_0_3px_rgba(239,68,68,0.2)]"
                    : "border-[#C4A035]/40 dark:border-[#D4A843]/20 text-[#C4A035] dark:text-[#D4A843] hover:bg-[#C4A035]/5 dark:hover:bg-[#D4A843]/5"
                }`}
              >
                <RefreshCw className="h-4 w-4" /> Re-upload
              </Button>
              {showReuploadSpotlight && (
                <ReuploadSpotlight
                  onDismiss={() => onDismissReuploadSpotlight?.()}
                />
              )}
            </div>
          )}

          {canDelete && (
            <Button
              onClick={() => onDelete(document.document_id, document.type)}
              size="sm"
              variant="outline"
              disabled={isDeleting}
              className="gap-1 border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
            >
              <Trash2 className="h-4 w-4" /> {isDeleting ? "..." : "Delete"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* ===============================================================
   VIEW DOCUMENT MODAL
=============================================================== */

function ViewDocumentModal({
  document,
  onClose,
}: {
  document: Document;
  onClose: () => void;
}) {
  const isPDF = document.file_path?.endsWith(".pdf");
  const isImage = document.file_path?.match(/\.(jpg|png|jpeg)$/);
  const openNew = () => {
    if (document.file_path) window.open(document.file_path, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl dark:shadow-black/50 w-full max-w-4xl max-h-[90vh] flex flex-col border border-[#D8CDC0]/60 dark:border-[#2A2A2A]">
        <div className="flex items-center justify-between p-5 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A] shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {formatDocumentType(document.type)}
            </h2>
            <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-1">
              {document.file_path?.split("/").pop()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={openNew}
              size="sm"
              variant="outline"
              className="gap-2 border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#6B5D4F] dark:text-[#888888] rounded-xl"
            >
              <ExternalLink className="w-4 h-4" /> Open in New Tab
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#D8CDC0]/15 dark:hover:bg-[#222222] rounded-xl transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-[#BEB29E] dark:text-[#666666]" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-[#D8CDC0]/5 dark:bg-[#151515]">
          {isImage && document.file_path && (
            <div className="flex items-center justify-center min-h-full">
              <img
                src={document.file_path}
                alt={formatDocumentType(document.type)}
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg dark:shadow-black/40"
              />
            </div>
          )}
          {isPDF && document.file_path && (
            <div className="w-full h-[600px]">
              <iframe
                src={document.file_path}
                title={formatDocumentType(document.type)}
                className="w-full h-full rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A]"
              />
            </div>
          )}
          {!isImage && !isPDF && (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <File className="w-16 h-16 text-[#D8CDC0] dark:text-[#333333] mb-4" />
              <p className="text-[#1B1B1B] dark:text-[#E5E5E5] font-medium mb-2">
                Preview not available
              </p>
              <p className="text-[#BEB29E] dark:text-[#666666] text-sm mb-4">
                This file type cannot be previewed in the browser
              </p>
              <Button
                onClick={openNew}
                className="gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl"
              >
                <ExternalLink className="w-4 h-4" /> Open in New Tab
              </Button>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-[#D8CDC0]/30 dark:border-[#2A2A2A] bg-[#D8CDC0]/5 dark:bg-[#151515] shrink-0 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[#6B5D4F] dark:text-[#888888]">
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${
                  document.status === "APPROVED"
                    ? "bg-[#8DB896]/12 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]"
                    : document.status === "PENDING"
                      ? "bg-[#C4A035]/8 dark:bg-[#D4A843]/10 text-[#C4A035] dark:text-[#D4A843]"
                      : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                }`}
              >
                {document.status}
              </span>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#6B5D4F] dark:text-[#888888] rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   EMPTY STATE
=============================================================== */

function EmptyState({
  hasDocuments,
  onUpload,
}: {
  hasDocuments: boolean;
  onUpload: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-[#BEB29E] dark:text-[#555555]" />
      </div>
      <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
        {hasDocuments ? "No documents found" : "No documents uploaded"}
      </h3>
      <p className="text-[#6B5D4F] dark:text-[#888888] text-sm mb-4">
        {hasDocuments
          ? "Try adjusting your search or filters"
          : "Upload your required documents to complete your registration"}
      </p>
      {!hasDocuments && (
        <Button
          onClick={onUpload}
          className="gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl"
        >
          <Plus className="w-4 h-4" /> Upload Document
        </Button>
      )}
    </div>
  );
}

/* ===============================================================
   UPLOAD MODAL
=============================================================== */

function UploadModal({
  category: initialCategory,
  onClose,
  uploadWithCategory,
  onSuccess,
  onError,
}: {
  category: RegistrantCategory;
  onClose: () => void;
  uploadWithCategory: any;
  onSuccess: (c: RegistrantCategory) => void;
  onError: (m: string) => void;
}) {
  const { data: me } = useMe();
  const [selectedCategory, setSelectedCategory] =
    useState<RegistrantCategory>(initialCategory);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("");
  const [showCategorySpotlight, setShowCategorySpotlight] = useState(false);

  // ✅ Spotlight 4 — Category Step داخل الـ Modal
  useEffect(() => {
    if (!me) return;
    const key = `sp_modal_cat_${me.user_id}`;
    if (!localStorage.getItem(key)) {
      const t = setTimeout(() => {
        setShowCategorySpotlight(true);
        localStorage.setItem(key, "true");
      }, 500);
      return () => clearTimeout(t);
    }
  }, [me]);

  const handleCategoryChange = (cat: RegistrantCategory) => {
    setSelectedCategory(cat);
    setShowCategorySpotlight(false);
    setType("");
    setFile(null);
  };

  const handleUpload = () => {
    if (!file || !type) {
      onError("Please select both a file and document type");
      return;
    }
    const formData = new FormData();
    formData.append(type, file);
    uploadWithCategory.mutate(
      {
        formData,
        newCategory: selectedCategory,
        currentCategory: initialCategory,
      },
      {
        onSuccess: () => onSuccess(selectedCategory),
        onError: (err: Error) => {
          onError(
            (err as any)?.response?.data?.message ||
              "Upload failed. Please try again.",
          );
        },
      },
    );
  };

  const isUploading = uploadWithCategory.isPending;
  const categoryTypes = DOCUMENT_TYPES_BY_CATEGORY[selectedCategory] || [];

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl dark:shadow-black/50 max-w-lg w-full border border-[#D8CDC0]/60 dark:border-[#2A2A2A] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A] sticky top-0 bg-white dark:bg-[#1A1A1A] z-10">
          <div>
            <h2 className="text-xl font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              Upload Document
            </h2>
            <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-0.5">
              اختر فئتك ثم نوع الوثيقة
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 hover:bg-[#D8CDC0]/15 dark:hover:bg-[#222222] rounded-xl transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[#BEB29E] dark:text-[#666666]" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* ── Step 1: Category ── */}
          <div>
            {/* ✅ Spotlight 4 */}
            {showCategorySpotlight && (
              <CategorySpotlight
                onDismiss={() => setShowCategorySpotlight(false)}
              />
            )}

            <label className="block text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] mb-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#2B6F5E] text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Who are you?
              </span>
            </label>

            <div
              className={`grid grid-cols-3 gap-3 transition-all ${
                showCategorySpotlight
                  ? "ring-2 ring-[#C4A035]/50 ring-offset-2 ring-offset-white dark:ring-offset-[#1A1A1A] rounded-xl p-1"
                  : ""
              }`}
            >
              {CATEGORY_CARDS.map((card) => {
                const Icon = card.icon;
                const isActive = selectedCategory === card.value;
                return (
                  <button
                    key={card.value}
                    onClick={() => handleCategoryChange(card.value)}
                    disabled={isUploading}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center
                      ${isActive ? `${card.activeBg} ${card.activeBorder} shadow-sm` : `${card.bg} ${card.border} hover:border-opacity-60`}
                      ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {isActive && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#2B6F5E] dark:bg-[#4ADE80] flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white dark:text-[#1A1A1A]" />
                      </span>
                    )}
                    <div
                      className={`w-9 h-9 rounded-xl ${isActive ? card.activeBg : card.bg} flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div>
                      <p
                        className={`text-xs font-semibold ${isActive ? card.color : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
                      >
                        {card.label}
                      </p>
                      <p className="text-[10px] text-[#BEB29E] dark:text-[#666666] mt-0.5 leading-tight">
                        {card.label_ar}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Hint */}
            <div
              className={`mt-3 px-3 py-2 rounded-xl text-xs text-right flex items-center gap-2 justify-end
              ${CATEGORY_CARDS.find((c) => c.value === selectedCategory)?.bg}
              border ${CATEGORY_CARDS.find((c) => c.value === selectedCategory)?.border}`}
            >
              <span
                className={`font-medium ${CATEGORY_CARDS.find((c) => c.value === selectedCategory)?.color}`}
              >
                {CATEGORY_INFO[selectedCategory].description}
              </span>
              <AlertCircle
                className={`w-3.5 h-3.5 shrink-0 ${CATEGORY_CARDS.find((c) => c.value === selectedCategory)?.color}`}
              />
            </div>
          </div>

          {/* ── Step 2: Type ── */}
          <div>
            <label className="block text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#2B6F5E] text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Document Type <span className="text-red-500 ml-0.5">*</span>
              </span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={isUploading}
              className="w-full px-3 py-2.5 border border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/10 focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/30"
            >
              <option value="">Select document type — اختر نوع الوثيقة</option>
              {categoryTypes.length > 0 && (
                <optgroup label="📋 Required Documents — الوثائق المطلوبة">
                  {categoryTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} — {t.label_ar}
                    </option>
                  ))}
                </optgroup>
              )}
              {OPTIONAL_DOCUMENTS.length > 0 && (
                <optgroup label="📎 Optional Documents — الوثائق الاختيارية">
                  {OPTIONAL_DOCUMENTS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} — {t.label_ar}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* ── Step 3: File ── */}
          <div>
            <label className="block text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#2B6F5E] text-white text-xs flex items-center justify-center font-bold">
                  3
                </span>
                Select File <span className="text-red-500 ml-0.5">*</span>
              </span>
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                file
                  ? "border-[#2B6F5E]/60 dark:border-[#4ADE80]/30 bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5"
                  : "border-[#D8CDC0]/60 dark:border-[#2A2A2A] hover:border-[#2B6F5E]/40 dark:hover:border-[#4ADE80]/20 bg-[#D8CDC0]/5 dark:bg-[#151515]"
              }`}
            >
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
                }}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
                accept=".jpg,.jpeg,.png,.pdf"
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer flex flex-col items-center ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {file ? (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 flex items-center justify-center mb-2">
                      <CheckCircle className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80]" />
                    </div>
                    <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                      {file.name}
                    </p>
                    <p className="text-xs text-[#BEB29E] dark:text-[#666666] mt-1">
                      {formatFileSize(file.size)} — click to change
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#BEB29E] dark:text-[#555555] mb-2" />
                    <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-[#BEB29E] dark:text-[#666666] mt-1">
                      PDF, JPG, PNG (max 10MB)
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#D8CDC0]/30 dark:border-[#2A2A2A] bg-[#D8CDC0]/5 dark:bg-[#151515] rounded-b-2xl sticky bottom-0">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isUploading}
            className="border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#6B5D4F] dark:text-[#888888] rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !file || !type}
            className="gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl min-w-[100px]"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   REUPLOAD MODAL
=============================================================== */

function ReuploadModal({
  document,
  onClose,
  reuploadDocument,
  onSuccess,
  onError,
}: {
  document: Document;
  onClose: () => void;
  reuploadDocument: any;
  onSuccess: () => void;
  onError: (m: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const isUploading = reuploadDocument.isPending;

  const handleReupload = () => {
    if (!file) {
      onError("Please select a file");
      return;
    }
    reuploadDocument.mutate(
      { documentId: document.document_id, file },
      {
        onSuccess: () => onSuccess(),
        onError: (err: Error) => {
          onError(
            (err as any)?.response?.data?.message ||
              "Re-upload failed. Please try again.",
          );
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl dark:shadow-black/50 max-w-md w-full border border-[#D8CDC0]/60 dark:border-[#2A2A2A]">
        <div className="flex items-center justify-between p-6 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
          <div>
            <h2 className="text-xl font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              Re-upload Document
            </h2>
            <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-1">
              {formatDocumentType(document.type)}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 hover:bg-[#D8CDC0]/15 dark:hover:bg-[#222222] rounded-xl transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[#BEB29E] dark:text-[#666666]" />
          </button>
        </div>
        <div className="p-6">
          {document.rejection_reason && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-400">
                <span className="font-medium">Rejection reason:</span>{" "}
                {document.rejection_reason}
              </p>
            </div>
          )}
          <div className="border-2 border-dashed border-[#D8CDC0]/60 dark:border-[#2A2A2A] rounded-xl p-6 text-center hover:border-[#2B6F5E]/40 dark:hover:border-[#4ADE80]/20 transition-colors bg-[#D8CDC0]/5 dark:bg-[#151515]">
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) setFile(e.target.files[0]);
              }}
              className="hidden"
              id="reupload-file"
              disabled={isUploading}
              accept=".jpg,.jpeg,.png,.pdf"
            />
            <label
              htmlFor="reupload-file"
              className={`cursor-pointer flex flex-col items-center ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <RefreshCw className="w-8 h-8 text-[#BEB29E] dark:text-[#555555] mb-2" />
              {file ? (
                <div>
                  <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {file.name}
                  </p>
                  <p className="text-xs text-[#BEB29E] dark:text-[#666666] mt-1">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                    Select a new file to replace the rejected one
                  </p>
                  <p className="text-xs text-[#BEB29E] dark:text-[#666666] mt-1">
                    PDF, JPG, PNG (max 10MB)
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#D8CDC0]/30 dark:border-[#2A2A2A] bg-[#D8CDC0]/5 dark:bg-[#151515] rounded-b-2xl">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isUploading}
            className="border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#6B5D4F] dark:text-[#888888] rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReupload}
            disabled={isUploading || !file}
            className="gap-2 bg-[#C4A035] hover:bg-[#C4A035]/90 text-white rounded-xl"
          >
            <RefreshCw className="w-4 h-4" />{" "}
            {isUploading ? "Re-uploading..." : "Re-upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   UTILITIES
=============================================================== */

function formatDocumentType(type: string): string {
  const labels: Record<string, string> = {
    STUDENT_CARD: "Student Card — بطاقة طالب",
    SCHOOL_CERTIFICATE: "School Certificate — شهادة مدرسية",
    REGISTRATION_CERTIFICATE: "Registration Certificate — شهادة تسجيل",
    ID_CARD: "National ID Card — بطاقة التعريف",
    WORK_CERTIFICATE:
      "Work Certificate / Professional Card — شهادة عمل / بطاقة مهنية",
    ADMIN_CERTIFICATE: "Administrative Certificate — شهادة إدارية",
    PHOTO: "Personal Photo — صورة شمسية",
    PAYMENT_RECEIPT: "Payment Receipt — وصل الدفع",
  };
  return (
    labels[type] ||
    type
      .split("_")
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" ")
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
