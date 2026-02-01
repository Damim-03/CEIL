import { useState } from "react";
import {
  FileText,
  Image,
  FileIcon,
  Search,
  Trash2,
  Eye,
  Download,
  Filter,
  FolderOpen,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  File,
  User,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
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
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../lib/utils/utils";
import {
  useAdminDocuments,
  useDeleteDocument,
  useReviewDocument,
} from "../../../../hooks/admin/useAdminDocuments";
import type { AdminDocument } from "../../../../types/document";
import { toast } from "sonner";

// Type for grouped documents
type GroupedDocuments = {
  [studentId: string]: {
    student: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
    };
    documents: AdminDocument[];
  };
};

const AdminDocuments = () => {
  const {
    data: documents = [],
    isLoading,
    isError,
    error,
  } = useAdminDocuments();
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();
  const { mutate: reviewDocument, isPending: isReviewing } =
    useReviewDocument();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED">(
    "APPROVED"
  );
  const [documentToDelete, setDocumentToDelete] =
    useState<AdminDocument | null>(null);
  const [documentToReview, setDocumentToReview] =
    useState<AdminDocument | null>(null);

  // Get file type icon
  const getFileIcon = (fileType: AdminDocument["fileType"]) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "image":
        return <Image className="h-5 w-5 text-blue-500" />;
      case "doc":
        return <FileIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get file type badge
  const getFileTypeBadge = (fileType: AdminDocument["fileType"]) => {
    const variants = {
      pdf: "bg-red-50 text-red-700 border-red-200",
      image: "bg-blue-50 text-blue-700 border-blue-200",
      doc: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };

    return (
      <Badge
        variant="outline"
        className={cn("text-xs font-medium", variants[fileType])}
      >
        {fileType.toUpperCase()}
      </Badge>
    );
  };

  // Get status badge
  const getStatusBadge = (status?: "APPROVED" | "PENDING" | "REJECTED") => {
    const variants = {
      APPROVED: "bg-green-50 text-green-700 border-green-200",
      PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
      REJECTED: "bg-red-50 text-red-700 border-red-200",
    };

    const displayStatus = status || "PENDING";

    return (
      <Badge
        variant="outline"
        className={cn("text-xs font-medium", variants[displayStatus])}
      >
        {displayStatus}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get student initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Group documents by student
  const groupDocumentsByStudent = (docs: AdminDocument[]): GroupedDocuments => {
    return docs.reduce((acc, doc) => {
      const studentId = doc.student.id || doc.student.email;
      if (!acc[studentId]) {
        acc[studentId] = {
          student: doc.student,
          documents: [],
        };
      }
      acc[studentId].documents.push(doc);
      return acc;
    }, {} as GroupedDocuments);
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      doc.student.name.toLowerCase().includes(searchLower) ||
      doc.student.email.toLowerCase().includes(searchLower) ||
      doc.fileName.toLowerCase().includes(searchLower)
    );
  });

  // Group filtered documents by student
  const groupedDocuments = groupDocumentsByStudent(filteredDocuments);

  // Sort students by latest document upload date
  const sortedStudentIds = Object.keys(groupedDocuments).sort((a, b) => {
    const latestDateA = Math.max(
      ...groupedDocuments[a].documents.map((doc) =>
        new Date(doc.uploadDate).getTime()
      )
    );
    const latestDateB = Math.max(
      ...groupedDocuments[b].documents.map((doc) =>
        new Date(doc.uploadDate).getTime()
      )
    );
    return sortOrder === "newest"
      ? latestDateB - latestDateA
      : latestDateA - latestDateB;
  });

  // Handle view document
  const handleView = (document: AdminDocument) => {
    window.open(document.fileUrl, "_blank");
  };

  // Handle download document
  const handleDownload = (document: AdminDocument) => {
    const link = window.document.createElement("a");
    link.href = document.fileUrl;
    link.download = document.fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  // Handle review click
  const handleReviewClick = (
    document: AdminDocument,
    action: "APPROVED" | "REJECTED"
  ) => {
    setDocumentToReview(document);
    setReviewAction(action);
    setReviewDialogOpen(true);
  };

  // Handle review confirm
  const handleReviewConfirm = () => {
    if (!documentToReview) return;

    reviewDocument(
      { id: documentToReview.id, status: reviewAction },
      {
        onSuccess: () => {
          toast.success(
            `Document ${reviewAction === "APPROVED" ? "approved" : "rejected"} successfully`
          );
          setReviewDialogOpen(false);
          setDocumentToReview(null);
        },
        onError: (error: any) => {
          console.error("Error reviewing document:", error);
          toast.error(error?.message || "Failed to review document");
        },
      }
    );
  };

  // Handle delete click
  const handleDeleteClick = (document: AdminDocument) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = () => {
    if (!documentToDelete) return;

    deleteDocument(documentToDelete.id, {
      onSuccess: () => {
        toast.success("Document deleted successfully");
        setDeleteDialogOpen(false);
        setDocumentToDelete(null);
      },
      onError: (error: any) => {
        console.error("Error deleting document:", error);
        toast.error(error?.message || "Failed to delete document");
      },
    });
  };

  // Get document stats for a student
  const getDocumentStats = (docs: AdminDocument[]) => {
    return {
      total: docs.length,
      approved: docs.filter((d) => d.status === "APPROVED").length,
      pending: docs.filter((d) => d.status === "PENDING" || !d.status).length,
      rejected: docs.filter((d) => d.status === "REJECTED").length,
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        <main className="flex-1 p-6 space-y-6">
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading documents...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        <main className="flex-1 p-6 space-y-6">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-1 text-red-600">
              Error loading documents
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              {error instanceof Error
                ? error.message
                : "Failed to load documents. Please try again later."}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-6 space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Student Documents
          </h2>
          <p className="text-sm text-muted-foreground">
            View, review, and manage all uploaded student documents
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card border rounded-lg">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={sortOrder}
            onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}
          >
            <SelectTrigger className="w-full sm:w-45">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Two Column Layout */}
        {sortedStudentIds.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Students List */}
            <div className="lg:col-span-1 space-y-2">
              <div className="bg-card border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  STUDENTS ({sortedStudentIds.length})
                </h3>
                <div className="space-y-2 max-h-150 overflow-y-auto">
                  {sortedStudentIds.map((studentId) => {
                    const { student, documents: studentDocs } =
                      groupedDocuments[studentId];
                    const stats = getDocumentStats(studentDocs);
                    const isSelected = selectedStudent === studentId;

                    return (
                      <button
                        key={studentId}
                        onClick={() => setSelectedStudent(studentId)}
                        className={cn(
                          "w-full p-3 rounded-lg text-left transition-all hover:bg-muted/50",
                          isSelected
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-muted/30 border border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2">
                            <AvatarImage
                              src={student.avatar || undefined}
                              alt={student.name}
                            />
                            <AvatarFallback className="text-xs font-semibold">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {student.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {stats.total} {stats.total === 1 ? "File" : "Files"}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight
                            className={cn(
                              "h-5 w-5 text-muted-foreground transition-transform",
                              isSelected && "text-primary"
                            )}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Documents List */}
            <div className="lg:col-span-2">
              {selectedStudent ? (
                <div className="bg-card border rounded-lg">
                  {/* Student Header */}
                  <div className="p-6 border-b bg-muted/30">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2">
                        <AvatarImage
                          src={
                            groupedDocuments[selectedStudent].student.avatar ||
                            undefined
                          }
                          alt={groupedDocuments[selectedStudent].student.name}
                        />
                        <AvatarFallback className="text-lg font-bold">
                          {getInitials(
                            groupedDocuments[selectedStudent].student.name
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">
                          {groupedDocuments[selectedStudent].student.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {groupedDocuments[selectedStudent].student.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {(() => {
                            const stats = getDocumentStats(
                              groupedDocuments[selectedStudent].documents
                            );
                            return (
                              <>
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                  {stats.total} Total
                                </Badge>
                                {stats.approved > 0 && (
                                  <Badge className="bg-green-50 text-green-700 border-green-200">
                                    {stats.approved} Approved
                                  </Badge>
                                )}
                                {stats.pending > 0 && (
                                  <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    {stats.pending} Pending
                                  </Badge>
                                )}
                                {stats.rejected > 0 && (
                                  <Badge className="bg-red-50 text-red-700 border-red-200">
                                    {stats.rejected} Rejected
                                  </Badge>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="divide-y max-h-150 overflow-y-auto">
                    {groupedDocuments[selectedStudent].documents.map(
                      (document) => (
                        <div
                          key={document.id}
                          className="p-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            {/* Document Info */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="mt-1">
                                {getFileIcon(document.fileType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate mb-1">
                                  {document.fileName}
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                  {getFileTypeBadge(document.fileType)}
                                  {getStatusBadge(document.status)}
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(document.uploadDate)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleView(document)}
                                className="h-8 w-8"
                                title="View document"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownload(document)}
                                className="h-8 w-8"
                                title="Download document"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleReviewClick(document, "APPROVED")
                                }
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Approve document"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleReviewClick(document, "REJECTED")
                                }
                                className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                title="Reject document"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(document)}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete document"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                // No Student Selected
                <div className="bg-card border rounded-lg h-full flex items-center justify-center p-16">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4 mx-auto">
                      <File className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Select a Student
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Choose a student from the list to view their uploaded
                      documents
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16 px-4 border rounded-lg bg-card">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No documents found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {searchQuery
                ? "Try adjusting your search query"
                : "Student-uploaded documents will appear here"}
            </p>
          </div>
        )}
      </main>

      {/* Review Confirmation Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "APPROVED" ? "Approve" : "Reject"} Document
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {reviewAction === "APPROVED" ? "approve" : "reject"} this
              document?
            </DialogDescription>
          </DialogHeader>

          {documentToReview && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {getFileIcon(documentToReview.fileType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {documentToReview.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {documentToReview.student.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={isReviewing}
            >
              Cancel
            </Button>
            <Button
              variant={reviewAction === "APPROVED" ? "default" : "destructive"}
              onClick={handleReviewConfirm}
              disabled={isReviewing}
              className={
                reviewAction === "APPROVED"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
            >
              {isReviewing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>{reviewAction === "APPROVED" ? "Approve" : "Reject"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          {documentToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {getFileIcon(documentToDelete.fileType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {documentToDelete.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
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
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDocuments;