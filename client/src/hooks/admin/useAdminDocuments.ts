import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminDocumentsApi } from "../../lib/api/admin/adminDocuments.api";
import type {
  AdminDocument,
  AdminDocumentResponse,
} from "../../types/document";

/* ================= QUERY KEYS ================= */

const DOCUMENTS_KEY = ["admin-documents"];

/* ================= HELPER FUNCTIONS ================= */

const getFileType = (path: string): "pdf" | "image" | "doc" => {
  const ext = path.split(".").pop()?.toLowerCase();

  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext ?? ""))
    return "image";
  if (["doc", "docx", "txt", "rtf"].includes(ext ?? "")) return "doc";
  return "doc";
};

const transformDocument = (doc: AdminDocumentResponse): AdminDocument => {
  try {
    return {
      id: doc.document_id,
      fileName: doc.file_path.split("/").pop() ?? "document",
      fileUrl: doc.file_path,
      fileType: getFileType(doc.file_path),
      uploadDate: doc.uploaded_at,
      status: doc.status || "PENDING",
      student: {
        id: doc.student.student_id,
        name: `${doc.student.first_name} ${doc.student.last_name}`,
        email: doc.student.email,
        avatar: null,
      },
    };
  } catch (error) {
    console.error("Error transforming document:", error, doc);
    throw new Error("Failed to transform document data");
  }
};

/* ================= QUERIES ================= */

// 🔹 Get all documents
export const useAdminDocuments = () =>
  useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: async () => {
      try {
        const res = await adminDocumentsApi.getAll();

        // Validate response
        if (!res) {
          console.warn("Empty response from API");
          return [];
        }

        if (!Array.isArray(res)) {
          console.error("Invalid response format:", res);
          throw new Error("Invalid response format from server");
        }

        // Check if data is already transformed (has 'fileName' instead of 'file_path')
        if (res.length > 0 && "fileName" in res[0]) {
          console.log("Data already transformed by backend");
          // Map to ensure status field exists
          return res.map((doc: any) => ({
            ...doc,
            status: doc.status || "PENDING",
          })) as AdminDocument[];
        }

        // Transform documents if needed
        return res.map(transformDocument);
      } catch (error) {
        console.error("Error fetching documents:", error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 30000, // 30 seconds
  });

// 🔹 Get single document
export const useAdminDocument = (documentId?: string) =>
  useQuery<AdminDocument>({
    queryKey: ["admin-document", documentId],
    queryFn: async () => {
      try {
        const res: AdminDocumentResponse = await adminDocumentsApi.getById(
          documentId!,
        );
        return transformDocument(res);
      } catch (error) {
        console.error("Error fetching document:", error);
        throw error;
      }
    },
    enabled: !!documentId,
    retry: 2,
  });

/* ================= MUTATIONS ================= */

// 🔹 Delete document
export const useDeleteDocument = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      try {
        return await adminDocumentsApi.delete(documentId);
      } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
    onError: (error) => {
      console.error("Delete mutation error:", error);
    },
  });
};

// 🔹 Review document (Approve/Reject)
export const useReviewDocument = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => {
      try {
        return await adminDocumentsApi.review(id, status);
      } catch (error) {
        console.error("Error reviewing document:", error);
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
    onError: (error) => {
      console.error("Review mutation error:", error);
    },
  });
};
