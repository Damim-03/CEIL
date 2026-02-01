/* =======================
   ENUMS
======================= */

export type DocumentStatus = "APPROVED" | "PENDING" | "REJECTED";

/* =======================
   BASE DOCUMENT (GENERIC)
======================= */

export interface Document {
  document_id: string;
  type: string;
  status: DocumentStatus;
  file_path: string;
  uploaded_at?: string;
}

/* =======================
   UPLOAD (STUDENT SIDE)
======================= */

export interface UploadMutation {
  mutate: (
    formData: FormData,
    options: {
      onSuccess: () => void;
      onError: (err: Error) => void;
    },
  ) => void;
  isPending: boolean;
}

export interface DocumentUploadProps {
  documentTypes: string[];
}

/* =======================
   ADMIN SIDE
======================= */

/**
 * 🔹 Raw response from backend
 * (matches getAllDocumentsController)
 */
export interface AdminDocumentResponse {
  document_id: string;
  file_path: string;
  uploaded_at: string;
  status: DocumentStatus;
  student: {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string | null;
  };
}

/**
 * 🔹 Transformed shape for UI usage
 */
export interface AdminDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: "pdf" | "image" | "doc";
  uploadDate: string;
  status: DocumentStatus;
  student: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}
