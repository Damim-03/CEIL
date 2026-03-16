// ================================================================
// 📦 src/services/announcement/Announcement.service.ts
// ✅ Announcement CRUD — shared between Admin & Owner
// ✅ 📌 Pin/Unpin support
// ✅ 📎 Attachment support (PDF, Word, images) via Cloudinary
// 🔌 Socket.IO events: published, unpublished, pinned, unpinned, deleted
// ================================================================

import { prisma } from "../../prisma/client";
import cloudinary from "../../middlewares/cloudinary";
import { uploadToCloudinary } from "../../middlewares/uploadToCloudinary";
import { emitToAll } from "../socket.service";

// ─── Types ───────────────────────────────────────────────

interface CreateAnnouncementInput {
  title: string;
  title_ar?: string;
  content: string;
  content_ar?: string;
  excerpt?: string;
  excerpt_ar?: string;
  category?: string;
  is_published?: boolean | string;
  file?: Express.Multer.File; // cover image
  attachmentFile?: Express.Multer.File; // PDF / Word / any file
}

interface UpdateAnnouncementInput {
  title?: string;
  title_ar?: string;
  content?: string;
  content_ar?: string;
  excerpt?: string;
  excerpt_ar?: string;
  category?: string;
  file?: Express.Multer.File; // replace cover image
  attachmentFile?: Express.Multer.File; // replace attachment
  remove_attachment?: boolean | string; // set true to delete existing attachment
}

interface ListAnnouncementsParams {
  page?: number;
  limit?: number;
  category?: string;
  is_published?: boolean;
  search?: string;
}

// ─── Helpers ─────────────────────────────────────────────

/** Derive a short type label from MIME type */
function getMimeLabel(mimetype: string): string {
  const map: Record<string, string> = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "image/jpeg": "image",
    "image/jpg": "image",
    "image/png": "image",
    "image/webp": "image",
    "image/gif": "image",
  };
  return map[mimetype] ?? mimetype.split("/")[1] ?? "file";
}

/** Upload attachment to Cloudinary — raw resource type for non-images */
async function uploadAttachment(file: Express.Multer.File) {
  const isImage = file.mimetype.startsWith("image/");
  const isPdf = file.mimetype === "application/pdf";

  // الاسم الأصلي للملف — يُحفظ في DB فقط، لا يُرسل لـ Cloudinary
  const originalName = Buffer.from(file.originalname, "latin1").toString(
    "utf8",
  );

  // public_id نظيف بدون أحرف عربية
  const safeId = `attachment_${Date.now()}`;

  if (isImage) {
    // صور — uploadToCloudinary العادي
    const result = await uploadToCloudinary(file, "announcement_attachments");
    return {
      url: result.secure_url,
      public_id: result.public_id,
      name: originalName,
      type: getMimeLabel(file.mimetype),
    };
  }

  if (isPdf) {
    // ✅ PDF كـ "image" resource_type — يتيح Cloudinary تحويله لصورة
    return new Promise<{
      url: string;
      public_id: string;
      name: string;
      type: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "announcement_attachments",
          resource_type: "image", // ✅ مش "raw" — يخلّي .pdf→.jpg يشتغل
          public_id: safeId,
          format: "pdf", // يحفظه كـ PDF لكن بـ resource_type=image
          access_mode: "public",
        },
        (error, result) => {
          if (error || !result)
            return reject(error ?? new Error("Upload failed"));
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            name: originalName, // ✅ الاسم العربي الصحيح من DB
            type: "pdf",
          });
        },
      );
      stream.end(file.buffer);
    });
  }

  // Word / PPT — raw لا يزال مناسب لها
  return new Promise<{
    url: string;
    public_id: string;
    name: string;
    type: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "announcement_attachments",
        resource_type: "raw",
        public_id: safeId,
      },
      (error, result) => {
        if (error || !result)
          return reject(error ?? new Error("Upload failed"));
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          name: originalName, // ✅ الاسم الصحيح
          type: getMimeLabel(file.mimetype),
        });
      },
    );
    stream.end(file.buffer);
  });
}

/** Delete a Cloudinary asset */
async function deleteCloudinaryAsset(public_id: string, type: string | null) {
  // PDF الآن resource_type=image، Word/PPT لا تزال raw
  const resource_type = type === "pdf" || type === "image" ? "image" : "raw";
  await cloudinary.uploader
    .destroy(public_id, { resource_type })
    .catch((err: any) => console.error("Cloudinary delete error:", err));
}

// ─── CREATE ──────────────────────────────────────────────

export async function createAnnouncement(input: CreateAnnouncementInput) {
  const {
    title,
    title_ar,
    content,
    content_ar,
    excerpt,
    excerpt_ar,
    category,
    is_published,
    file,
    attachmentFile,
  } = input;

  // Cover image
  let image_url: string | null = null;
  let image_public_id: string | null = null;
  if (file) {
    const uploaded = await uploadToCloudinary(file, "announcements");
    image_url = uploaded.secure_url;
    image_public_id = uploaded.public_id;
  }

  // Attachment
  let attachment_url: string | null = null;
  let attachment_public_id: string | null = null;
  let attachment_name: string | null = null;
  let attachment_type: string | null = null;
  if (attachmentFile) {
    const uploaded = await uploadAttachment(attachmentFile);
    attachment_url = uploaded.url;
    attachment_public_id = uploaded.public_id;
    attachment_name = uploaded.name;
    attachment_type = uploaded.type;
  }

  const shouldPublish = is_published === true || is_published === "true";

  const announcement = await prisma.announcement.create({
    data: {
      title,
      title_ar,
      content,
      content_ar,
      excerpt,
      excerpt_ar,
      category,
      image_url,
      image_public_id,
      attachment_url,
      attachment_public_id,
      attachment_name,
      attachment_type,
      is_published: shouldPublish,
      published_at: shouldPublish ? new Date() : null,
    },
  });

  if (shouldPublish) {
    emitToAll("announcement:published", {
      announcement_id: announcement.announcement_id,
      title: announcement.title,
    });
  }

  return announcement;
}

// ─── LIST (📌 pinned first) ─────────────────────────────

export async function listAnnouncements(params: ListAnnouncementsParams = {}) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.category) where.category = params.category.toUpperCase();
  if (params.is_published !== undefined)
    where.is_published = params.is_published;
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { title_ar: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: [
        { is_pinned: "desc" },
        { pinned_at: "desc" },
        { created_at: "desc" },
      ],
      skip,
      take: limit,
    }),
    prisma.announcement.count({ where }),
  ]);

  return {
    data: announcements,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

// ─── GET BY ID ───────────────────────────────────────────

export async function getAnnouncementById(announcementId: string) {
  return prisma.announcement.findUnique({
    where: { announcement_id: announcementId },
  });
}

// ─── UPDATE ──────────────────────────────────────────────

export async function updateAnnouncement(
  announcementId: string,
  input: UpdateAnnouncementInput,
) {
  const existing = await prisma.announcement.findUnique({
    where: { announcement_id: announcementId },
  });
  if (!existing) return null;

  const data: any = {
    title: input.title,
    title_ar: input.title_ar,
    content: input.content,
    content_ar: input.content_ar,
    excerpt: input.excerpt,
    excerpt_ar: input.excerpt_ar,
    category: input.category,
  };

  // Replace cover image
  if (input.file) {
    if (existing.image_public_id) {
      await cloudinary.uploader
        .destroy(existing.image_public_id)
        .catch((err: any) => console.error("Error deleting old image:", err));
    }
    const uploaded = await uploadToCloudinary(input.file, "announcements");
    data.image_url = uploaded.secure_url;
    data.image_public_id = uploaded.public_id;
  }

  // Remove attachment explicitly
  const shouldRemoveAttachment =
    input.remove_attachment === true || input.remove_attachment === "true";

  if (shouldRemoveAttachment && existing.attachment_public_id) {
    await deleteCloudinaryAsset(
      existing.attachment_public_id,
      existing.attachment_type,
    );
    data.attachment_url = null;
    data.attachment_public_id = null;
    data.attachment_name = null;
    data.attachment_type = null;
  }

  // Replace attachment
  if (input.attachmentFile) {
    // Delete old attachment first
    if (existing.attachment_public_id) {
      await deleteCloudinaryAsset(
        existing.attachment_public_id,
        existing.attachment_type,
      );
    }
    const uploaded = await uploadAttachment(input.attachmentFile);
    data.attachment_url = uploaded.url;
    data.attachment_public_id = uploaded.public_id;
    data.attachment_name = uploaded.name;
    data.attachment_type = uploaded.type;
  }

  return prisma.announcement.update({
    where: { announcement_id: announcementId },
    data,
  });
}

// ─── DELETE ──────────────────────────────────────────────

export async function deleteAnnouncement(announcementId: string) {
  const existing = await prisma.announcement.findUnique({
    where: { announcement_id: announcementId },
  });
  if (!existing) return null;

  // Delete cover image
  if (existing.image_public_id) {
    await cloudinary.uploader
      .destroy(existing.image_public_id)
      .catch((err: any) => console.error("Error deleting image:", err));
  }

  // Delete attachment
  if (existing.attachment_public_id) {
    await deleteCloudinaryAsset(
      existing.attachment_public_id,
      existing.attachment_type,
    );
  }

  await prisma.announcement.delete({
    where: { announcement_id: announcementId },
  });

  emitToAll("announcement:deleted", { announcement_id: announcementId });
  return true;
}

// ─── PUBLISH ─────────────────────────────────────────────

export async function publishAnnouncement(announcementId: string) {
  const existing = await prisma.announcement.findUnique({
    where: { announcement_id: announcementId },
  });
  if (!existing) return { error: "not_found" as const };
  if (existing.is_published) return { error: "already_published" as const };

  const announcement = await prisma.announcement.update({
    where: { announcement_id: announcementId },
    data: { is_published: true, published_at: new Date() },
  });

  emitToAll("announcement:published", {
    announcement_id: announcementId,
    title: announcement.title,
  });

  return { data: announcement };
}

// ─── UNPUBLISH ───────────────────────────────────────────

export async function unpublishAnnouncement(announcementId: string) {
  const existing = await prisma.announcement.findUnique({
    where: { announcement_id: announcementId },
  });
  if (!existing) return { error: "not_found" as const };
  if (!existing.is_published) return { error: "already_unpublished" as const };

  const announcement = await prisma.announcement.update({
    where: { announcement_id: announcementId },
    data: { is_published: false },
  });

  emitToAll("announcement:unpublished", { announcement_id: announcementId });
  return { data: announcement };
}

// ─── 📌 PIN ─────────────────────────────────────────────

export async function pinAnnouncement(announcementId: string) {
  const existing = await prisma.announcement.findUnique({
    where: { announcement_id: announcementId },
  });
  if (!existing) return { error: "not_found" as const };
  if (existing.is_pinned) return { error: "already_pinned" as const };

  const announcement = await prisma.announcement.update({
    where: { announcement_id: announcementId },
    data: { is_pinned: true, pinned_at: new Date() },
  });

  emitToAll("announcement:pinned", {
    announcement_id: announcementId,
    title: announcement.title,
  });

  return { data: announcement };
}

// ─── 📌 UNPIN ───────────────────────────────────────────

export async function unpinAnnouncement(announcementId: string) {
  const existing = await prisma.announcement.findUnique({
    where: { announcement_id: announcementId },
  });
  if (!existing) return { error: "not_found" as const };
  if (!existing.is_pinned) return { error: "not_pinned" as const };

  const announcement = await prisma.announcement.update({
    where: { announcement_id: announcementId },
    data: { is_pinned: false, pinned_at: null },
  });

  emitToAll("announcement:unpinned", { announcement_id: announcementId });
  return { data: announcement };
}
