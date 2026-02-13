import { useState } from "react";
import PageLoader from "../../../components/PageLoader";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { AlertDialog, useAlert } from "../components/Alertdialog";
import type { Document, UploadMutation } from "../../../types/Types";
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
} from "lucide-react";
import { useStudentDocuments } from "../../../hooks/student/Usestudent";

/* ================= PAGE ================= */

export default function Documents() {
  const {
    data: documents = [],
    isLoading,
    uploadDocuments,
    deleteDocument,
  } = useStudentDocuments();

  const { alertState, hideAlert, showConfirm, showSuccess, showError } =
    useAlert();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

  if (isLoading) return <PageLoader />;

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

  const handleDeleteClick = (documentId: number, documentType: string) => {
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
            const errorMessage =
              (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ||
              "Failed to delete document. Please try again.";
            showError("Delete Failed", errorMessage);
            setDocumentToDelete(null);
          },
        });
      },
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-lg shadow-[#C4A035]/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1B1B1B]">
                  My Documents
                </h1>
                <p className="text-sm text-[#BEB29E] mt-0.5">
                  Upload and manage your academic documents
                </p>
              </div>
            </div>
            <Button
              onClick={() => setUploadModalOpen(true)}
              className="gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl shadow-md shadow-[#2B6F5E]/20"
            >
              <Plus className="w-4 h-4" /> Upload Document
            </Button>
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

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E]" />
              <Input
                placeholder="Search documents by type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#BEB29E]" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-[#D8CDC0]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6F5E]/20 focus:border-[#2B6F5E]"
              >
                <option value="all">All Types</option>
                {documentTypes.map((type, index) => (
                  <option key={`${type}-${index}`} value={type}>
                    {formatDocumentType(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 text-sm text-[#6B5D4F]">
            Showing{" "}
            <span className="font-semibold text-[#1B1B1B]">
              {filteredDocuments.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#1B1B1B]">
              {documents.length}
            </span>{" "}
            documents
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white border border-[#D8CDC0]/60 rounded-2xl overflow-hidden">
          {filteredDocuments.length > 0 ? (
            <div className="divide-y divide-[#D8CDC0]/30">
              {filteredDocuments.map((doc: Document) => (
                <DocumentCard
                  key={doc.document_id}
                  document={doc}
                  onView={setViewDocument}
                  onDelete={handleDeleteClick}
                  isDeleting={
                    deleteDocument.isPending &&
                    documentToDelete === doc.document_id
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

      {uploadModalOpen && (
        <UploadModal
          onClose={() => setUploadModalOpen(false)}
          uploadDocuments={uploadDocuments}
          onSuccess={() => {
            setUploadModalOpen(false);
            showSuccess(
              "Upload Successful",
              "Your document has been uploaded successfully and is pending review.",
            );
          }}
          onError={(message: string) => {
            showError("Upload Failed", message);
          }}
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

/* ================= STAT CARD ================= */

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colors: Record<string, { bar: string; bg: string; icon: string }> = {
    teal: {
      bar: "from-[#2B6F5E] to-[#2B6F5E]/70",
      bg: "bg-[#2B6F5E]/8",
      icon: "text-[#2B6F5E]",
    },
    green: {
      bar: "from-[#8DB896] to-[#8DB896]/70",
      bg: "bg-[#8DB896]/12",
      icon: "text-[#3D7A4A]",
    },
    mustard: {
      bar: "from-[#C4A035] to-[#C4A035]/70",
      bg: "bg-[#C4A035]/8",
      icon: "text-[#C4A035]",
    },
    red: {
      bar: "from-red-500 to-red-500/70",
      bg: "bg-red-50",
      icon: "text-red-600",
    },
  };
  const c = colors[color] || colors.teal;

  return (
    <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-4 overflow-hidden group hover:shadow-md transition-all">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${c.bar} opacity-60 group-hover:opacity-100 transition-opacity`}
      ></div>
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div>
          <p className="text-sm text-[#6B5D4F]">{label}</p>
          <p className="text-2xl font-bold text-[#1B1B1B]">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ================= DOCUMENT CARD ================= */

interface DocumentCardProps {
  document: Document;
  onView: (doc: Document) => void;
  onDelete: (documentId: number, documentType: string) => void;
  isDeleting: boolean;
}

function DocumentCard({
  document,
  onView,
  onDelete,
  isDeleting,
}: DocumentCardProps) {
  const getIcon = () => {
    if (document.file_path?.endsWith(".pdf"))
      return <FileText className="w-6 h-6" />;
    if (document.file_path?.match(/\.(jpg|png|jpeg)$/))
      return <Image className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const getStatusBadge = () => {
    if (document.status === "APPROVED") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8DB896]/12 text-[#2B6F5E]">
          <CheckCircle className="w-3 h-3 mr-1" /> Approved
        </span>
      );
    }
    if (document.status === "PENDING") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#C4A035]/8 text-[#C4A035]">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </span>
      );
    }
    if (document.status === "REJECTED") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
          <XCircle className="w-3 h-3 mr-1" /> Rejected
        </span>
      );
    }
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

  const uploadedAt = document.uploaded_at || document.created_at;
  const canDelete =
    document.status === "PENDING" || document.status === "REJECTED";

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 hover:bg-[#D8CDC0]/5 transition-colors gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center text-white shrink-0 shadow-md shadow-[#2B6F5E]/15">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1B1B1B] text-base">
            {formatDocumentType(document.type)}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {getStatusBadge()}
            {uploadedAt && (
              <span className="flex items-center gap-1 text-sm text-[#BEB29E]">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(uploadedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          {document.rejection_reason && (
            <p className="text-sm text-red-600 mt-1">
              Reason: {document.rejection_reason}
            </p>
          )}
        </div>
      </div>

      {document.file_path && (
        <div className="flex items-center gap-2 lg:shrink-0">
          <Button
            onClick={() => onView(document)}
            size="sm"
            variant="outline"
            className="gap-1 border-[#D8CDC0]/60 text-[#6B5D4F] hover:bg-[#2B6F5E]/5 hover:border-[#2B6F5E]/30 rounded-xl"
          >
            <Eye className="h-4 w-4" /> View
          </Button>
          <Button
            onClick={handleDownload}
            size="sm"
            variant="outline"
            className="gap-1 border-[#D8CDC0]/60 text-[#6B5D4F] hover:bg-[#C4A035]/5 hover:border-[#C4A035]/30 rounded-xl"
          >
            <Download className="h-4 w-4" /> Download
          </Button>
          {canDelete && (
            <Button
              onClick={() => onDelete(document.document_id, document.type)}
              size="sm"
              variant="outline"
              className="gap-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" /> {isDeleting ? "..." : "Delete"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= VIEW DOCUMENT MODAL ================= */

interface ViewDocumentModalProps {
  document: Document;
  onClose: () => void;
}

function ViewDocumentModal({ document, onClose }: ViewDocumentModalProps) {
  const isPDF = document.file_path?.endsWith(".pdf");
  const isImage = document.file_path?.match(/\.(jpg|png|jpeg)$/);

  const handleOpenInNewTab = () => {
    if (document.file_path) window.open(document.file_path, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[#D8CDC0]/60">
        <div className="flex items-center justify-between p-5 border-b border-[#D8CDC0]/30 shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-[#1B1B1B]">
              {formatDocumentType(document.type)}
            </h2>
            <p className="text-sm text-[#BEB29E] mt-1">
              {document.file_path?.split("/").pop()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenInNewTab}
              size="sm"
              variant="outline"
              className="gap-2 border-[#D8CDC0]/60 text-[#6B5D4F] rounded-xl"
            >
              <ExternalLink className="w-4 h-4" /> Open in New Tab
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#D8CDC0]/15 rounded-xl transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-[#BEB29E]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-[#D8CDC0]/5">
          {isImage && document.file_path && (
            <div className="flex items-center justify-center min-h-full">
              <img
                src={document.file_path}
                alt={formatDocumentType(document.type)}
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
              />
            </div>
          )}
          {isPDF && document.file_path && (
            <div className="flex items-center justify-center">
              <img
                src={document.file_path.replace(".pdf", ".jpg")}
                alt={formatDocumentType(document.type)}
                className="max-w-full rounded-xl shadow-lg"
              />
            </div>
          )}
          {!isImage && !isPDF && (
            <div className="flex flex-col items-center justify-center min-h-100 text-center">
              <File className="w-16 h-16 text-[#D8CDC0] mb-4" />
              <p className="text-[#1B1B1B] font-medium mb-2">
                Preview not available
              </p>
              <p className="text-[#BEB29E] text-sm mb-4">
                This file type cannot be previewed in the browser
              </p>
              <Button
                onClick={handleOpenInNewTab}
                className="gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl"
              >
                <ExternalLink className="w-4 h-4" /> Open in New Tab
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#D8CDC0]/30 bg-[#D8CDC0]/5 shrink-0 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[#6B5D4F]">
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${
                  document.status === "APPROVED"
                    ? "bg-[#8DB896]/12 text-[#2B6F5E]"
                    : document.status === "PENDING"
                      ? "bg-[#C4A035]/8 text-[#C4A035]"
                      : "bg-red-50 text-red-700"
                }`}
              >
                {document.status}
              </span>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-[#D8CDC0]/60 text-[#6B5D4F] rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= EMPTY STATE ================= */

function EmptyState({
  hasDocuments,
  onUpload,
}: {
  hasDocuments: boolean;
  onUpload: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[#D8CDC0]/20 flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-[#BEB29E]" />
      </div>
      <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">
        {hasDocuments ? "No documents found" : "No documents uploaded"}
      </h3>
      <p className="text-[#6B5D4F] text-sm mb-4">
        {hasDocuments
          ? "Try adjusting your search or filters"
          : "Upload your required documents to complete your account"}
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

/* ================= UPLOAD MODAL ================= */

interface UploadModalProps {
  onClose: () => void;
  uploadDocuments: UploadMutation;
  onSuccess: () => void;
  onError: (message: string) => void;
}

function UploadModal({
  onClose,
  uploadDocuments,
  onSuccess,
  onError,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file || !type) {
      onError("Please select both a file and document type");
      return;
    }

    const formData = new FormData();
    formData.append(type, file);

    uploadDocuments.mutate(formData, {
      onSuccess: () => onSuccess(),
      onError: (err: Error) => {
        const errorMessage =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Upload failed. Please try again.";
        onError(errorMessage);
      },
    });
  };

  const isUploading = uploadDocuments.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-[#D8CDC0]/60">
        <div className="flex items-center justify-between p-6 border-b border-[#D8CDC0]/30">
          <h2 className="text-xl font-semibold text-[#1B1B1B]">
            Upload Document
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#D8CDC0]/15 rounded-xl transition-colors"
            disabled={isUploading}
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[#BEB29E]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1B1B1B] mb-2">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={isUploading}
              className="w-full px-3 py-2.5 border border-[#D8CDC0]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6F5E]/20 focus:border-[#2B6F5E]"
            >
              <option value="">Select document type</option>
              <option value="PHOTO">Personal Photo</option>
              <option value="ID_CARD">ID Card</option>
              <option value="SCHOOL_CERTIFICATE">School Certificate</option>
              <option value="PAYMENT_RECEIPT">Payment Receipt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1B1B1B] mb-2">
              Select File <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-[#D8CDC0]/60 rounded-xl p-6 text-center hover:border-[#2B6F5E]/40 transition-colors bg-[#D8CDC0]/5">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer flex flex-col items-center ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Upload className="w-8 h-8 text-[#BEB29E] mb-2" />
                {file ? (
                  <div>
                    <p className="text-sm font-medium text-[#1B1B1B]">
                      {file.name}
                    </p>
                    <p className="text-xs text-[#BEB29E] mt-1">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-[#6B5D4F]">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-[#BEB29E] mt-1">
                      PDF, JPG, PNG (max 10MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#D8CDC0]/30 bg-[#D8CDC0]/5 rounded-b-2xl">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isUploading}
            className="border-[#D8CDC0]/60 text-[#6B5D4F] rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !file || !type}
            className="gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl"
          >
            <Upload className="w-4 h-4" />{" "}
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ================= UTILITIES ================= */

function formatDocumentType(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
