// ================================================================
// 📦 src/constants/document.constants.ts
// ✅ Updated: Category-based document requirements
// 🎓 STUDENT  → بطاقة طالب + شهادة مدرسية أو شهادة تسجيل
// 🧑 EXTERNAL → بطاقة التعريف فقط
// 💼 EMPLOYEE → بطاقة تعريف + شهادة عمل أو إدارية
// ================================================================

export const DOCUMENT_TYPES = [
  "STUDENT_CARD", // بطاقة طالب
  "SCHOOL_CERTIFICATE", // شهادة مدرسية
  "REGISTRATION_CERTIFICATE", // شهادة تسجيل (بديل عن الشهادة المدرسية)
  "ID_CARD", // بطاقة التعريف الوطنية
  "WORK_CERTIFICATE", // شهادة عمل
  "ADMIN_CERTIFICATE", // شهادة إدارية (بديل عن شهادة العمل)
  "PROFESSIONAL_CARD", // ✅ بطاقة مهنية (جديد)
  "PHOTO", // صورة شمسية (اختياري)
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

// ─── Registrant Categories ───────────────────────────────
export type RegistrantCategory = "STUDENT" | "EXTERNAL" | "EMPLOYEE";

// ─── Required documents per category ─────────────────────
// Each entry: array of alternatives (any one satisfies the requirement)
export const REQUIRED_DOCUMENTS_BY_CATEGORY: Record<
  RegistrantCategory,
  {
    label: string;
    label_ar: string;
    label_fr: string;
    alternatives: DocumentType[];
  }[]
> = {
  // 🎓 طالب: بطاقة طالب + (شهادة مدرسية أو شهادة تسجيل)
  STUDENT: [
    {
      label: "Student Card or School/Registration Certificate",
      label_ar: "بطاقة طالب أو شهادة مدرسية أو شهادة تسجيل",
      label_fr: "Carte d'étudiant ou certificat de scolarité ou d'inscription",
      alternatives: [
        "STUDENT_CARD",
        "SCHOOL_CERTIFICATE",
        "REGISTRATION_CERTIFICATE",
      ],
    },
  ],

  // 🧑 شخص خارجي: بطاقة التعريف فقط
  EXTERNAL: [
    {
      label: "National ID Card",
      label_ar: "بطاقة التعريف الوطنية",
      label_fr: "Carte d'identité nationale",
      alternatives: ["ID_CARD"],
    },
  ],

  // 💼 موظف: بطاقة تعريف + (شهادة عمل أو شهادة إدارية)
  EMPLOYEE: [
    {
      label: "Professional Card or Work Certificate",
      label_ar: "بطاقة مهنية أو شهادة عمل",
      label_fr: "Carte professionnelle ou attestation de travail",
      alternatives: ["PROFESSIONAL_CARD", "WORK_CERTIFICATE"],
    },
  ],
};

// ─── Helper: Get required docs for a category ────────────
export function getRequiredDocumentTypes(
  category: RegistrantCategory,
): DocumentType[][] {
  return REQUIRED_DOCUMENTS_BY_CATEGORY[category].map(
    (req) => req.alternatives,
  );
}

// ─── Helper: Check if documents are complete ─────────────
export function areDocumentsComplete(
  category: RegistrantCategory,
  uploadedTypes: DocumentType[],
  approvedTypes?: DocumentType[],
): { complete: boolean; missing: string[] } {
  const typesToCheck = approvedTypes || uploadedTypes;

  const hasAtLeastOneDocument = typesToCheck.length > 0;

  return {
    complete: hasAtLeastOneDocument,
    missing: hasAtLeastOneDocument ? [] : ["Upload at least one document"],
  };
}

// ─── Legacy: Flat list of all possible required types ────
// (kept for backward compatibility if needed)
export const REQUIRED_DOCUMENTS: DocumentType[] = [
  "STUDENT_CARD",
  "ID_CARD",
  "SCHOOL_CERTIFICATE",
];

// ─── Document type display names (trilingual) ────────────
export const DOCUMENT_TYPE_LABELS: Record<
  DocumentType,
  { en: string; ar: string; fr: string }
> = {
  STUDENT_CARD: {
    en: "Student Card",
    ar: "بطاقة طالب",
    fr: "Carte d'étudiant",
  },
  SCHOOL_CERTIFICATE: {
    en: "School Certificate",
    ar: "شهادة مدرسية",
    fr: "Certificat de scolarité",
  },
  PROFESSIONAL_CARD: {
    en: "Professional Card",
    ar: "بطاقة مهنية",
    fr: "Carte professionnelle",
  },
  REGISTRATION_CERTIFICATE: {
    en: "Registration Certificate",
    ar: "شهادة تسجيل",
    fr: "Certificat d'inscription",
  },
  ID_CARD: {
    en: "National ID Card",
    ar: "بطاقة التعريف الوطنية",
    fr: "Carte d'identité nationale",
  },
  WORK_CERTIFICATE: {
    en: "Work Certificate",
    ar: "شهادة عمل",
    fr: "Attestation de travail",
  },
  ADMIN_CERTIFICATE: {
    en: "Administrative Certificate",
    ar: "شهادة إدارية",
    fr: "Certificat administratif",
  },
  PHOTO: {
    en: "Photo",
    ar: "صورة شمسية",
    fr: "Photo d'identité",
  },
};
