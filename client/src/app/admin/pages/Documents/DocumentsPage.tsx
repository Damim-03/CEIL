import { useState, useMemo } from "react";
import {
  FileText,
  Image,
  FileIcon,
  Search,
  Trash2,
  Eye,
  Download,
  FolderOpen,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  File,
  User,
  ExternalLink,
  ShieldCheck,
  Star,
  ChevronRight,
  Clock,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { cn } from "../../../../lib/utils/utils";
import {
  useAdminDocuments,
  useDeleteDocument,
  useApproveDocument,
  useRejectDocument,
} from "../../../../hooks/admin/useAdmin";
import type { AdminDocument } from "../../../../types/Types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

type GroupedDocuments = {
  [studentId: string]: {
    student: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
    };
    documents: AdminDocument[];
    isComplete: boolean;
    hasRejected: boolean;
  };
};

const AdminDocuments = () => {
  const { t } = useTranslation();
  const { data: documents = [], isLoading, isError } = useAdminDocuments();
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();
  const { mutate: approveDocument, isPending: isApproving } =
    useApproveDocument();
  const { mutate: rejectDocument, isPending: isRejecting } =
    useRejectDocument();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "complete" | "pending" | "rejected"
  >("all");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] =
    useState<AdminDocument | null>(null);
  const [documentToApprove, setDocumentToApprove] =
    useState<AdminDocument | null>(null);
  const [documentToReject, setDocumentToReject] =
    useState<AdminDocument | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [documentToView, setDocumentToView] = useState<AdminDocument | null>(
    null,
  );

  const getFileIcon = (fileType: AdminDocument["fileType"]) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="h-4 w-4 text-rose-400" />;
      case "image":
        return <Image className="h-4 w-4 text-sky-400" />;
      default:
        return <FileIcon className="h-4 w-4 text-violet-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-DZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // Group + compute completeness
  const groupedDocuments = useMemo((): GroupedDocuments => {
    const filtered = documents.filter((doc) => {
      const sl = searchQuery.toLowerCase();
      return (
        doc.student.name.toLowerCase().includes(sl) ||
        doc.student.email.toLowerCase().includes(sl) ||
        doc.fileName.toLowerCase().includes(sl)
      );
    });

    const groups = filtered.reduce((acc, doc) => {
      const sid = doc.student.id || doc.student.email;
      if (!acc[sid])
        acc[sid] = {
          student: doc.student,
          documents: [],
          isComplete: false,
          hasRejected: false,
        };
      acc[sid].documents.push(doc);
      return acc;
    }, {} as GroupedDocuments);

    // Compute completeness and rejected status
    Object.values(groups).forEach((g) => {
      g.isComplete =
        g.documents.length > 0 &&
        g.documents.every((d) => d.status === "APPROVED");
      g.hasRejected = g.documents.some((d) => d.status === "REJECTED");
    });

    return groups;
  }, [documents, searchQuery]);

  const sortedStudentIds = useMemo(() => {
    return Object.keys(groupedDocuments)
      .filter((sid) => {
        if (filter === "complete") return groupedDocuments[sid].isComplete;
        if (filter === "pending")
          return (
            !groupedDocuments[sid].isComplete &&
            !groupedDocuments[sid].hasRejected
          );
        if (filter === "rejected") return groupedDocuments[sid].hasRejected;
        return true;
      })
      .sort((a, b) => {
        const aG = groupedDocuments[a];
        const bG = groupedDocuments[b];
        // rejected first, then pending, then complete
        const rank = (g: typeof aG) =>
          g.hasRejected ? 0 : g.isComplete ? 2 : 1;
        if (rank(aG) !== rank(bG)) return rank(aG) - rank(bG);
        const latestA = Math.max(
          ...aG.documents.map((d) => new Date(d.uploadDate).getTime()),
        );
        const latestB = Math.max(
          ...bG.documents.map((d) => new Date(d.uploadDate).getTime()),
        );
        return latestB - latestA;
      });
  }, [groupedDocuments, filter]);

  const stats = useMemo(
    () => ({
      total: Object.keys(groupedDocuments).length,
      complete: Object.values(groupedDocuments).filter((g) => g.isComplete)
        .length,
      pending: Object.values(groupedDocuments).filter(
        (g) => !g.isComplete && !g.hasRejected,
      ).length,
      rejected: Object.values(groupedDocuments).filter((g) => g.hasRejected)
        .length,
      totalDocs: documents.length,
      pendingDocs: documents.filter((d) => !d.status || d.status === "PENDING")
        .length,
      rejectedDocs: documents.filter((d) => d.status === "REJECTED").length,
    }),
    [groupedDocuments, documents],
  );

  const handleApproveConfirm = () => {
    if (!documentToApprove) return;
    approveDocument(documentToApprove.id, {
      onSuccess: () => {
        toast.success(t("admin.documents.toast.approveSuccess"));
        setApproveDialogOpen(false);
        setDocumentToApprove(null);
      },
      onError: (e: unknown) =>
        toast.error(
          (e as Error)?.message || t("admin.documents.toast.approveFailed"),
        ),
    });
  };

  const handleRejectConfirm = () => {
    if (!documentToReject || !rejectReason.trim()) {
      toast.error(t("admin.documents.toast.provideReason"));
      return;
    }

    // ✅ نرسل documentId + reason فقط — الـ backend يُرسل الإشعار
    rejectDocument(
      {
        documentId: documentToReject.id,
        reason: rejectReason.trim(),
      },
      {
        onSuccess: () => {
          toast.success(t("admin.documents.toast.rejectSuccess"));
          setRejectDialogOpen(false);
          setDocumentToReject(null);
          setRejectReason("");
        },
        onError: (error: unknown) => {
          toast.error(
            (error as Error)?.message ||
              t("admin.documents.toast.rejectFailed"),
          );
        },
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!documentToDelete) return;
    deleteDocument(documentToDelete.id, {
      onSuccess: () => {
        toast.success(t("admin.documents.toast.deleteSuccess"));
        setDeleteDialogOpen(false);
        setDocumentToDelete(null);
      },
      onError: (e: unknown) =>
        toast.error(
          (e as Error)?.message || t("admin.documents.toast.deleteFailed"),
        ),
    });
  };

  const handleDownload = (doc: AdminDocument) => {
    const link = window.document.createElement("a");
    link.href = doc.fileUrl;
    link.download = doc.fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-[#2B6F5E]/30 border-t-[#2B6F5E] animate-spin" />
          <p className="text-sm text-[#6B5D4F] dark:text-[#888]">
            {t("admin.documents.loading")}
          </p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-[#1B1B1B] dark:text-[#E5E5E5] font-semibold">
            {t("admin.documents.errorTitle")}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            {t("admin.documents.retry")}
          </Button>
        </div>
      </div>
    );

  const selectedGroup = selectedStudent
    ? groupedDocuments[selectedStudent]
    : null;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]" />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("admin.documents.title")}
              </h1>
              <p className="text-sm text-[#BEB29E] dark:text-[#666] mt-0.5">
                {t("admin.documents.subtitle")}
              </p>
            </div>
          </div>

          {/* Stats chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0EBE5] dark:bg-[#1E1E1E] text-xs font-semibold text-[#6B5D4F] dark:text-[#888]">
              <User className="w-3 h-3" />
              {stats.total} {t("admin.documents.students")}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Clock className="w-3 h-3" />
              {stats.pendingDocs} {t("admin.documents.statsPending")}
            </div>
            {stats.rejectedDocs > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-xs font-semibold text-red-600 dark:text-red-400">
                <XCircle className="w-3 h-3" />
                {stats.rejectedDocs}{" "}
                {t("admin.documents.statsRejected", "مرفوض")}
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              {stats.complete} {t("admin.documents.statsComplete", "حساب كامل")}
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + Filter ── */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#555]" />
            <Input
              placeholder={t("admin.documents.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222] dark:text-[#E5E5E5] focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "pending", "rejected", "complete"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                  filter === f
                    ? f === "complete"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : f === "rejected"
                        ? "bg-red-500 text-white shadow-sm"
                        : f === "pending"
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-[#2B6F5E] text-white shadow-sm"
                    : "bg-[#F0EBE5] dark:bg-[#1E1E1E] text-[#6B5D4F] dark:text-[#888] hover:bg-[#E8E0D8] dark:hover:bg-[#252525]",
                )}
              >
                {f === "all"
                  ? t("admin.documents.filterAll", "الكل")
                  : f === "pending"
                    ? t("admin.documents.filterPending", "قيد الانتظار")
                    : f === "rejected"
                      ? t("admin.documents.filterRejected", "مرفوض")
                      : t("admin.documents.filterComplete", "مكتمل")}
                <span className="ml-1.5 opacity-70">
                  {f === "all"
                    ? stats.total
                    : f === "complete"
                      ? stats.complete
                      : f === "rejected"
                        ? stats.rejected
                        : stats.pending}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      {sortedStudentIds.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left — Student list */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#D8CDC0]/40 dark:border-[#2A2A2A] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B5D4F] dark:text-[#888] uppercase tracking-wide flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                {t("admin.documents.students")} ({sortedStudentIds.length})
              </span>
            </div>

            <div className="divide-y divide-[#D8CDC0]/30 dark:divide-[#2A2A2A] max-h-[65vh] overflow-y-auto">
              {sortedStudentIds.map((sid) => {
                const {
                  student,
                  documents: sDocs,
                  isComplete,
                  hasRejected,
                } = groupedDocuments[sid];
                const pending = sDocs.filter(
                  (d) => !d.status || d.status === "PENDING",
                ).length;
                const rejected = sDocs.filter(
                  (d) => d.status === "REJECTED",
                ).length;
                const isSelected = selectedStudent === sid;

                return (
                  <button
                    key={sid}
                    onClick={() => setSelectedStudent(sid)}
                    className={cn(
                      "w-full px-4 py-3.5 text-left transition-all flex items-center gap-3",
                      isSelected
                        ? hasRejected
                          ? "bg-red-50/60 dark:bg-red-900/10 border-r-2 border-red-500"
                          : "bg-[#2B6F5E]/8 dark:bg-[#2B6F5E]/15 border-r-2 border-[#2B6F5E]"
                        : "hover:bg-[#F8F5F2] dark:hover:bg-[#1E1E1E]",
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar || undefined} />
                        <AvatarFallback
                          className={cn(
                            "text-xs font-bold text-white",
                            isComplete
                              ? "bg-emerald-500"
                              : hasRejected
                                ? "bg-red-500"
                                : "bg-[#2B6F5E]",
                          )}
                        >
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      {isComplete && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1A1A1A] flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      {!isComplete && hasRejected && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-[#1A1A1A] flex items-center justify-center">
                          <XCircle className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                          {student.name}
                        </p>
                        {isComplete && (
                          <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                            <Star className="w-2.5 h-2.5" />
                            {t("admin.documents.complete", "مكتمل")}
                          </span>
                        )}
                        {!isComplete && hasRejected && (
                          <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                            <XCircle className="w-2.5 h-2.5" />
                            {t("admin.documents.hasRejected", "مرفوض")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#BEB29E] dark:text-[#555] truncate mt-0.5">
                        {student.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[11px] text-[#6B5D4F] dark:text-[#888]">
                          {sDocs.length} {t("admin.documents.files")}
                        </span>
                        {pending > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                            <Clock className="w-2.5 h-2.5" />
                            {pending} {t("admin.documents.statsPending")}
                          </span>
                        )}
                        {rejected > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                            <XCircle className="w-2.5 h-2.5" />
                            {rejected}{" "}
                            {t("admin.documents.statsRejected", "مرفوض")}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isSelected
                          ? hasRejected
                            ? "text-red-500"
                            : "text-[#2B6F5E]"
                          : "text-[#D8CDC0] dark:text-[#333]",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right — Document panel */}
          <div className="lg:col-span-3">
            {selectedGroup ? (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] overflow-hidden">
                {/* Student header */}
                <div
                  className={cn(
                    "px-6 py-5 border-b border-[#D8CDC0]/40 dark:border-[#2A2A2A]",
                    selectedGroup.isComplete
                      ? "bg-gradient-to-r from-emerald-50/80 dark:from-emerald-900/10 to-transparent"
                      : selectedGroup.hasRejected
                        ? "bg-gradient-to-r from-red-50/80 dark:from-red-900/10 to-transparent"
                        : "bg-gradient-to-r from-[#2B6F5E]/5 dark:from-[#2B6F5E]/8 to-transparent",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-14 w-14 border-2 border-white dark:border-[#1A1A1A] shadow-md">
                        <AvatarImage
                          src={selectedGroup.student.avatar || undefined}
                        />
                        <AvatarFallback
                          className={cn(
                            "text-base font-bold text-white",
                            selectedGroup.isComplete
                              ? "bg-emerald-500"
                              : selectedGroup.hasRejected
                                ? "bg-red-500"
                                : "bg-[#2B6F5E]",
                          )}
                        >
                          {getInitials(selectedGroup.student.name)}
                        </AvatarFallback>
                      </Avatar>
                      {selectedGroup.isComplete && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1A1A1A] flex items-center justify-center shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      {!selectedGroup.isComplete &&
                        selectedGroup.hasRejected && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-500 border-2 border-white dark:border-[#1A1A1A] flex items-center justify-center shadow-sm">
                            <XCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                          {selectedGroup.student.name}
                        </h3>
                        {selectedGroup.isComplete && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
                            <ShieldCheck className="w-3 h-3" />
                            {t("admin.documents.completeAccount", "حساب كامل")}
                          </span>
                        )}
                        {!selectedGroup.isComplete &&
                          selectedGroup.hasRejected && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500 text-white shadow-sm shadow-red-500/30">
                              <XCircle className="w-3 h-3" />
                              {t(
                                "admin.documents.hasRejectedDocs",
                                "وثائق مرفوضة",
                              )}
                            </span>
                          )}
                      </div>
                      <p className="text-sm text-[#6B5D4F] dark:text-[#888] mt-0.5">
                        {selectedGroup.student.email}
                      </p>

                      {/* Doc stats */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {(() => {
                          const approved = selectedGroup.documents.filter(
                            (d) => d.status === "APPROVED",
                          ).length;
                          const pending = selectedGroup.documents.filter(
                            (d) => !d.status || d.status === "PENDING",
                          ).length;
                          const rejected = selectedGroup.documents.filter(
                            (d) => d.status === "REJECTED",
                          ).length;
                          return (
                            <>
                              <span className="text-xs px-2 py-0.5 rounded-md bg-[#F0EBE5] dark:bg-[#222] text-[#6B5D4F] dark:text-[#888] font-medium">
                                {selectedGroup.documents.length}{" "}
                                {t("admin.documents.statsTotal")}
                              </span>
                              {approved > 0 && (
                                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                                  ✓ {approved}{" "}
                                  {t("admin.documents.statsApproved")}
                                </span>
                              )}
                              {pending > 0 && (
                                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                                  ⏳ {pending}{" "}
                                  {t("admin.documents.statsPending")}
                                </span>
                              )}
                              {rejected > 0 && (
                                <span className="text-xs px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">
                                  ✕ {rejected}{" "}
                                  {t("admin.documents.statsRejected", "مرفوض")}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document rows */}
                <div className="divide-y divide-[#D8CDC0]/30 dark:divide-[#2A2A2A] max-h-[50vh] overflow-y-auto">
                  {selectedGroup.documents.map((doc) => {
                    const statusColor = {
                      APPROVED:
                        "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
                      REJECTED:
                        "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
                      PENDING:
                        "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
                    }[doc.status || "PENDING"];

                    return (
                      <div
                        key={doc.id}
                        className={cn(
                          "px-5 py-4 hover:bg-[#F8F5F2] dark:hover:bg-[#1E1E1E] transition-colors",
                          doc.status === "REJECTED" &&
                            "border-r-2 border-red-400 dark:border-red-600",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#F0EBE5] dark:bg-[#222] flex items-center justify-center shrink-0">
                            {getFileIcon(doc.fileType)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                              {doc.fileName}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span
                                className={cn(
                                  "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                                  statusColor,
                                )}
                              >
                                {t(
                                  `admin.documents.status.${(doc.status || "PENDING").toLowerCase()}`,
                                )}
                              </span>
                              <span className="text-xs text-[#BEB29E] dark:text-[#555]">
                                {formatDate(doc.uploadDate)}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setDocumentToView(doc);
                                setViewDialogOpen(true);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B5D4F] dark:text-[#888] hover:bg-[#2B6F5E]/10 hover:text-[#2B6F5E] dark:hover:text-[#4ADE80] transition-colors"
                              title={t("admin.documents.actions.view")}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDownload(doc)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B5D4F] dark:text-[#888] hover:bg-[#2B6F5E]/10 hover:text-[#2B6F5E] dark:hover:text-[#4ADE80] transition-colors"
                              title={t("admin.documents.actions.download")}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDocumentToApprove(doc);
                                setApproveDialogOpen(true);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B5D4F] dark:text-[#888] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                              title={t("admin.documents.actions.approve")}
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDocumentToReject(doc);
                                setRejectDialogOpen(true);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B5D4F] dark:text-[#888] hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                              title={t("admin.documents.actions.reject")}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDocumentToDelete(doc);
                                setDeleteDialogOpen(true);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B5D4F] dark:text-[#888] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              title={t("admin.documents.actions.delete")}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] h-full min-h-[300px] flex items-center justify-center">
                <div className="text-center px-8 py-12">
                  <div className="w-16 h-16 rounded-2xl bg-[#F0EBE5] dark:bg-[#1E1E1E] flex items-center justify-center mx-auto mb-4">
                    <File className="w-7 h-7 text-[#BEB29E] dark:text-[#444]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
                    {t("admin.documents.selectStudent")}
                  </h3>
                  <p className="text-sm text-[#BEB29E] dark:text-[#555] max-w-xs">
                    {t("admin.documents.selectStudentDesc")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#F0EBE5] dark:bg-[#1E1E1E] flex items-center justify-center mb-4">
            <FolderOpen className="w-7 h-7 text-[#BEB29E] dark:text-[#444]" />
          </div>
          <h3 className="text-base font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
            {t("admin.documents.noDocuments")}
          </h3>
          <p className="text-sm text-[#BEB29E] dark:text-[#555]">
            {searchQuery
              ? t("admin.documents.tryAdjustSearch")
              : t("admin.documents.docsWillAppear")}
          </p>
        </div>
      )}

      {/* ── Approve Dialog ── */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="dark:bg-[#1A1A1A] dark:border-[#2A2A2A]">
          <DialogHeader>
            <DialogTitle className="dark:text-[#E5E5E5]">
              {t("admin.documents.approveDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.documents.approveDialog.description")}
            </DialogDescription>
          </DialogHeader>
          {documentToApprove && (
            <div className="py-3">
              <div className="flex items-center gap-3 p-3 bg-[#F0EBE5] dark:bg-[#222] rounded-xl">
                {getFileIcon(documentToApprove.fileType)}
                <div>
                  <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {documentToApprove.fileName}
                  </p>
                  <p className="text-xs text-[#BEB29E] dark:text-[#666]">
                    {documentToApprove.student.name}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              disabled={isApproving}
              className="dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
            >
              {t("admin.documents.cancel")}
            </Button>
            <Button
              onClick={handleApproveConfirm}
              disabled={isApproving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isApproving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("admin.documents.approveDialog.approving")}
                </>
              ) : (
                t("admin.documents.approveDialog.approve")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Dialog ── */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="dark:bg-[#1A1A1A] dark:border-[#2A2A2A]">
          <DialogHeader>
            <DialogTitle className="dark:text-[#E5E5E5]">
              {t("admin.documents.rejectDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.documents.rejectDialog.description")}
            </DialogDescription>
          </DialogHeader>
          {documentToReject && (
            <div className="space-y-4 py-3">
              <div className="flex items-center gap-3 p-3 bg-[#F0EBE5] dark:bg-[#222] rounded-xl">
                {getFileIcon(documentToReject.fileType)}
                <div>
                  <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {documentToReject.fileName}
                  </p>
                  <p className="text-xs text-[#BEB29E] dark:text-[#666]">
                    {documentToReject.student.name}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {t("admin.documents.rejectDialog.reasonLabel")}
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t(
                    "admin.documents.rejectDialog.reasonPlaceholder",
                  )}
                  className="w-full p-3 border border-[#D8CDC0]/60 dark:border-[#2A2A2A] bg-white dark:bg-[#222] text-[#1B1B1B] dark:text-[#E5E5E5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6F5E]/20 resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason("");
              }}
              disabled={isRejecting}
              className="dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
            >
              {t("admin.documents.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={isRejecting || !rejectReason.trim()}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("admin.documents.rejectDialog.rejecting")}
                </>
              ) : (
                t("admin.documents.rejectDialog.rejectBtn")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="dark:bg-[#1A1A1A] dark:border-[#2A2A2A]">
          <DialogHeader>
            <DialogTitle className="dark:text-[#E5E5E5]">
              {t("admin.documents.deleteDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.documents.deleteDialog.description")}
            </DialogDescription>
          </DialogHeader>
          {documentToDelete && (
            <div className="py-3">
              <div className="flex items-center gap-3 p-3 bg-[#F0EBE5] dark:bg-[#222] rounded-xl">
                {getFileIcon(documentToDelete.fileType)}
                <div>
                  <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {documentToDelete.fileName}
                  </p>
                  <p className="text-xs text-[#BEB29E] dark:text-[#666]">
                    {documentToDelete.student.name}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
            >
              {t("admin.documents.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("admin.documents.deleteDialog.deleting")}
                </>
              ) : (
                t("admin.documents.deleteDialog.deleteBtn")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Dialog ── */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] dark:bg-[#1A1A1A] dark:border-[#2A2A2A]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-[#E5E5E5]">
              {documentToView && getFileIcon(documentToView.fileType)}
              {documentToView?.fileName}
            </DialogTitle>
            <DialogDescription>
              {documentToView?.student.name} —{" "}
              {formatDate(documentToView?.uploadDate || "")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto max-h-[65vh] bg-[#F0EBE5] dark:bg-[#111] rounded-xl p-2">
            {documentToView?.fileType === "image" &&
              documentToView?.fileUrl && (
                <img
                  src={documentToView.fileUrl}
                  alt={documentToView.fileName}
                  className="max-w-full max-h-full object-contain mx-auto rounded-lg"
                />
              )}
            {documentToView?.fileType === "pdf" &&
              documentToView?.fileUrl &&
              (() => {
                const imageUrl = documentToView.fileUrl.replace(
                  /\.pdf$/i,
                  ".jpg",
                );
                return (
                  <div className="w-full max-h-[60vh] overflow-auto rounded-lg bg-white p-2">
                    <img
                      src={imageUrl}
                      alt={documentToView.fileName}
                      className="w-full object-contain mx-auto"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const iframe = document.createElement("iframe");
                        iframe.src = `https://docs.google.com/gview?url=${encodeURIComponent(documentToView.fileUrl)}&embedded=true`;
                        iframe.className = "w-full rounded-lg";
                        iframe.style.height = "60vh";
                        target.parentElement!.appendChild(iframe);
                      }}
                    />
                  </div>
                );
              })()}
            {documentToView?.fileType === "doc" && (
              <div className="flex flex-col items-center justify-center py-16">
                <FileIcon className="h-16 w-16 text-[#BEB29E] dark:text-[#444] mb-4" />
                <p className="text-sm text-[#6B5D4F] dark:text-[#888]">
                  Preview not available
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => documentToView && handleDownload(documentToView)}
              className="gap-2 dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
            >
              <Download className="h-4 w-4" />{" "}
              {t("admin.documents.actions.download")}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(documentToView?.fileUrl, "_blank")}
              className="gap-2 dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
            >
              <ExternalLink className="h-4 w-4" /> Open in New Tab
            </Button>
            <Button
              onClick={() => setViewDialogOpen(false)}
              className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white"
            >
              {t("common.close", "إغلاق")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDocuments;
