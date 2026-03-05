// ================================================================
// 📌 src/middlewares/upload.middleware.ts
// ✅ Multer with file type + size validation
// ✅ Separate configs for avatars vs documents vs images
// ✅ uploadAnnouncement: per-field validation (image vs attachment)
// ================================================================

import multer, { FileFilterCallback } from "multer";
import { Request, Response, NextFunction } from "express";

// ─── Allowed MIME types ──────────────────────────────────

const IMAGE_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const DOCUMENT_MIMES = [
  ...IMAGE_MIMES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ANNOUNCEMENT_ATTACHMENT_MIMES = [
  ...IMAGE_MIMES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

// ─── File filter factories ───────────────────────────────

function createFileFilter(allowedMimes: string[], label: string) {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      (req as any).__uploadError =
        `Invalid file type for ${label}. Allowed: ${allowedMimes.map((m) => m.split("/")[1]).join(", ")}`;
      cb(
        new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname) as any,
      );
    }
  };
}

// ─── Storage (memory for Cloudinary) ─────────────────────

const storage = multer.memoryStorage();

// ─── Upload configurations ───────────────────────────────

/** Avatar upload: images only, max 2MB */
export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: createFileFilter(IMAGE_MIMES, "avatar"),
});

/** Announcement/Course image upload: images only, max 5MB */
export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: createFileFilter(IMAGE_MIMES, "image"),
});

/** Document upload: images + PDF + Word, max 10MB */
export const uploadDocument = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: createFileFilter(DOCUMENT_MIMES, "document"),
});

/** General upload (backward-compatible): images + PDF, max 5MB */
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: createFileFilter([...IMAGE_MIMES, "application/pdf"], "file"),
});

/**
 * Announcement upload — per-field validation:
 *   image      → images only,            max 5MB
 *   attachment → images + PDF + Word + PPT, max 20MB
 *
 * Usage:
 *   uploadAnnouncement.fields([
 *     { name: "image",      maxCount: 1 },
 *     { name: "attachment", maxCount: 1 },
 *   ])
 */
export const uploadAnnouncement = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB ceiling (per file)
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (file.fieldname === "image") {
      if (IMAGE_MIMES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        (req as any).__uploadError =
          "Cover image must be JPEG, PNG, WebP, or GIF";
        cb(
          new multer.MulterError(
            "LIMIT_UNEXPECTED_FILE",
            file.fieldname,
          ) as any,
        );
      }
    } else if (file.fieldname === "attachment") {
      if (ANNOUNCEMENT_ATTACHMENT_MIMES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        (req as any).__uploadError =
          "Attachment must be an image, PDF, Word (.doc/.docx), or PowerPoint (.ppt/.pptx)";
        cb(
          new multer.MulterError(
            "LIMIT_UNEXPECTED_FILE",
            file.fieldname,
          ) as any,
        );
      }
    } else {
      // Unknown field — silently ignore
      cb(null, false);
    }
  },
});

// ─── Error handler middleware ─────────────────────────────

/**
 * Place AFTER any upload middleware to catch Multer errors.
 *
 * Usage:
 *   router.post("/path", uploadAnnouncement.fields([...]), handleUploadError, controller)
 */
export function handleUploadError(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof multer.MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: "File is too large",
      LIMIT_FILE_COUNT: "Too many files",
      LIMIT_FIELD_KEY: "Field name too long",
      LIMIT_FIELD_VALUE: "Field value too long",
      LIMIT_UNEXPECTED_FILE: (req as any).__uploadError || "Invalid file type",
    };
    return res.status(400).json({
      message: messages[err.code] || "Upload error",
      code: err.code,
    });
  }

  if (err) {
    return res.status(400).json({ message: err.message || "Upload failed" });
  }

  next();
}
