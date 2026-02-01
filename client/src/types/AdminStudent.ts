/* =======================
   ENUMS
======================= */

import type { Gender, StudentStatus } from "./enums";

export type DocumentStatus = "APPROVED" | "PENDING" | "REJECTED";

/* =======================
   BASE DOCUMENT (GENERIC)
   (matches Prisma)
======================= */

export interface Document {
  document_id: string; // ✅ uuid from backend
  type: string;
  status: DocumentStatus;
  file_path: string; // ✅ required in Prisma
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

export interface Props {
  documentTypes: string[];
}

/* =======================
   ADMIN TYPES
======================= */

/**
 * 🔹 Raw API response from backend
 * (getAllDocumentsController)
 */
export interface AdminDocumentResponse {
  document_id: string;
  file_path: string;
  uploaded_at: string;
  status: DocumentStatus;
  student: {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string | null;
  };
}

/**
 * 🔹 Transformed type for frontend UI
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

export interface AdminStudent {
  emergency_contact: string | null | undefined;
  student_id: string;

  first_name: string;
  last_name: string;

  email?: string | null;
  secondary_email?: string | null;
  phone_number?: string | null;

  date_of_birth?: string | null;
  gender?: Gender | null;

  address?: string | null;
  nationality?: string | null;
  language?: string | null;

  education_level?: string | null;
  study_location?: string | null;

  avatar_url?: string | null;

  status: StudentStatus;

  created_at: string;
  updated_at: string;

  user?: {
    google_avatar?: string | null;
  };

  documents?: {
    document_id: string;
    type: string;
    file_path: string;
    status: DocumentStatus;
    uploaded_at: string;
  }[];
}
