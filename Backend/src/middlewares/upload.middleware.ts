// ================================================================
// 📌 src/middlewares/upload.middleware.ts
// ✅ Multer with file type + size validation
// ✅ Separate configs for avatars vs documents vs images
// ================================================================

import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";

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

// ─── File filter factories ───────────────────────────────

function createFileFilter(allowedMimes: string[], label: string) {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname) as any,
      );
      // Also attach a readable message
      (req as any).__uploadError =
        `Invalid file type for ${label}. Allowed: ${allowedMimes.map((m) => m.split("/")[1]).join(", ")}`;
    }
  };
}

// ─── Storage (memory for Cloudinary) ─────────────────────

const storage = multer.memoryStorage();

// ─── Upload configurations ───────────────────────────────

/**
 * Avatar upload: images only, max 2MB
 */
export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: createFileFilter(IMAGE_MIMES, "avatar"),
});

/**
 * Announcement/Course image upload: images only, max 5MB
 */
export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: createFileFilter(IMAGE_MIMES, "image"),
});

/**
 * Document upload: images + PDF + Word, max 10MB
 */
export const uploadDocument = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: createFileFilter(DOCUMENT_MIMES, "document"),
});

/**
 * General upload (backward-compatible): images + docs, max 5MB
 * This is the default `upload` that existing routes use.
 */
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: createFileFilter([...IMAGE_MIMES, "application/pdf"], "file"),
});

// ─── Error handler middleware ────────────────────────────

import { Response, NextFunction } from "express";

/**
 * Place AFTER upload middleware to catch Multer errors.
 *
 * Usage:
 *   router.post("/avatar", uploadAvatar.single("avatar"), handleUploadError, controller)
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
