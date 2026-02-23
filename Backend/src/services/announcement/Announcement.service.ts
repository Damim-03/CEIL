// ================================================================
// 📦 src/services/announcement/Announcement.service.ts
// ✅ Announcement CRUD — shared between Admin & Owner
// ✅ 📌 Pin/Unpin support — pinned announcements appear first
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
  file?: Express.Multer.File;
}

interface ListAnnouncementsParams {
  page?: number;
  limit?: number;
  category?: string;
  is_published?: boolean;
  search?: string;
}

interface UpdateAnnouncementInput {
  title?: string;
  title_ar?: string;
  content?: string;
  content_ar?: string;
  excerpt?: string;
  excerpt_ar?: string;
  category?: string;
  file?: Express.Multer.File;
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
  } = input;

  let image_url: string | null = null;
  let image_public_id: string | null = null;

  if (file) {
    const uploaded = await uploadToCloudinary(file, "announcements");
    image_url = uploaded.secure_url;
    image_public_id = uploaded.public_id;
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
      is_published: shouldPublish,
      published_at: shouldPublish ? new Date() : null,
    },
  });

  // 🔌 Socket — notify if published on creation
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

  if (params.category) {
    where.category = params.category.toUpperCase();
  }

  if (params.is_published !== undefined) {
    where.is_published = params.is_published;
  }

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
        { is_pinned: "desc" }, // 📌 Pinned first
        { pinned_at: "desc" }, // Most recently pinned on top
        { created_at: "desc" }, // Then newest
      ],
      skip,
      take: limit,
    }),
    prisma.announcement.count({ where }),
  ]);

  return {
    data: announcements,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
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

  if (existing.image_public_id) {
    await cloudinary.uploader
      .destroy(existing.image_public_id)
      .catch((err: any) =>
        console.error("Error deleting image from Cloudinary:", err),
      );
  }

  await prisma.announcement.delete({
    where: { announcement_id: announcementId },
  });

  // 🔌 Socket — notify public pages
  emitToAll("announcement:deleted", {
    announcement_id: announcementId,
  });

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
    data: {
      is_published: true,
      published_at: new Date(),
    },
  });

  // 🔌 Socket
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

  // 🔌 Socket
  emitToAll("announcement:unpublished", {
    announcement_id: announcementId,
  });

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
    data: {
      is_pinned: true,
      pinned_at: new Date(),
    },
  });

  // 🔌 Socket — notify public pages
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
    data: {
      is_pinned: false,
      pinned_at: null,
    },
  });

  // 🔌 Socket — notify public pages
  emitToAll("announcement:unpinned", {
    announcement_id: announcementId,
  });

  return { data: announcement };
}
