export const DOCUMENT_TYPES = [
  "PHOTO", // صورة شمسية
  "ID_CARD", // بطاقة تعريف
  "SCHOOL_CERTIFICATE", // شهادة مدرسية
  "PAYMENT_RECEIPT", // وصل الدفع
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

/**
 * الوثائق الإلزامية قبل التسجيل
 * (وصل الدفع عادة يكون بعد التسجيل)
 */
export const REQUIRED_DOCUMENTS: DocumentType[] = [
  "PHOTO",
  "ID_CARD",
  "SCHOOL_CERTIFICATE",
  "PAYMENT_RECEIPT",
];
