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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
            <p className="text-gray-600 mt-1">
              Upload and manage your academic documents
            </p>
          </div>
          <Button onClick={() => setUploadModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Upload Document
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total Documents"
            value={stats.total}
            color="blue"
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
            color="yellow"
          />
          <StatCard
            icon={XCircle}
            label="Rejected"
            value={stats.rejected}
            color="red"
          />
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search documents by type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredDocuments.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {documents.length}
            </span>{" "}
            documents
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {filteredDocuments.length > 0 ? (
            <div className="divide-y divide-gray-200">
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

      {/* Modals - Rendered outside main container for proper z-index */}
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

      {/* Alert Dialog */}
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
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color] || colorClasses.blue}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>
      );
    }

    if (document.status === "PENDING") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    }

    if (document.status === "REJECTED") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
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
    <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
          {getIcon()}
        </div>

        {/* Document Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-base">
            {formatDocumentType(document.type)}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {getStatusBadge()}
            {uploadedAt && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
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

      {/* Actions */}
      {document.file_path && (
        <div className="flex items-center gap-2 lg:shrink-0">
          <Button
            onClick={() => onView(document)}
            size="sm"
            variant="outline"
            className="gap-1"
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
          <Button
            onClick={handleDownload}
            size="sm"
            variant="outline"
            className="gap-1"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          {canDelete && (
            <Button
              onClick={() => onDelete(document.document_id, document.type)}
              size="sm"
              variant="destructive"
              className="gap-1"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
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
    if (document.file_path) {
      window.open(document.file_path, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {formatDocumentType(document.type)}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {document.file_path?.split("/").pop()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenInNewTab}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          {isImage && document.file_path && (
            <div className="flex items-center justify-center min-h-full">
              <img
                src={document.file_path}
                alt={formatDocumentType(document.type)}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          )}

          {isPDF && document.file_path && (
            <div className="flex items-center justify-center">
              <img
                src={document.file_path.replace(".pdf", ".jpg")}
                alt={formatDocumentType(document.type)}
                className="max-w-full rounded-lg shadow-lg"
              />
            </div>
          )}

          {!isImage && !isPDF && (
            <div className="flex flex-col items-center justify-center min-h-100 text-center">
              <File className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-900 font-medium mb-2">
                Preview not available
              </p>
              <p className="text-gray-600 text-sm mb-4">
                This file type cannot be previewed in the browser
              </p>
              <Button onClick={handleOpenInNewTab} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${
                  document.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : document.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {document.status}
              </span>
            </div>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= EMPTY STATE ================= */

interface EmptyStateProps {
  hasDocuments: boolean;
  onUpload: () => void;
}

function EmptyState({ hasDocuments, onUpload }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {hasDocuments ? "No documents found" : "No documents uploaded"}
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        {hasDocuments
          ? "Try adjusting your search or filters"
          : "Upload your required documents to complete your account"}
      </p>
      {!hasDocuments && (
        <Button onClick={onUpload} className="gap-2">
          <Plus className="w-4 h-4" />
          Upload Document
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
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    console.log("=== HANDLEUPLOAD START ===");

    if (!file || !type) {
      console.log("❌ Missing file or type:", { file, type });
      onError("Please select both a file and document type");
      return;
    }

    console.log("✅ File selected:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });
    console.log("✅ Document type:", type);

    // Create FormData
    const formData = new FormData();
    formData.append(type, file);

    // ✅ CRITICAL DEBUG: Verify FormData
    console.log("FormData created, checking entries:");
    let hasEntries = false;
    for (const pair of formData.entries()) {
      console.log(`  ${pair[0]}:`, pair[1]);
      hasEntries = true;
    }

    if (!hasEntries) {
      console.log("❌ FormData is empty!");
      onError("FormData creation failed");
      return;
    }

    console.log("✅ FormData ready, calling mutate...");

    uploadDocuments.mutate(formData, {
      onSuccess: () => {
        console.log("✅ Upload successful!");
        onSuccess();
      },
      onError: (err: Error) => {
        console.error("❌ Upload error:", err);
        const errorMessage =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Upload failed. Please try again.";
        onError(errorMessage);
      },
    });

    console.log("=== HANDLEUPLOAD END ===");
  };

  const isUploading = uploadDocuments.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Upload Document
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isUploading}
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isUploading}
            >
              <option value="">Select document type</option>
              <option value="PHOTO">Personal Photo</option>
              <option value="ID_CARD">ID Card</option>
              <option value="SCHOOL_CERTIFICATE">School Certificate</option>
              <option value="PAYMENT_RECEIPT">Payment Receipt</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
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
                className={`cursor-pointer flex flex-col items-center ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                {file ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, JPG, PNG (max 10MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button onClick={onClose} variant="outline" disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !file || !type}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
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
