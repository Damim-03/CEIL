import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import cloudinary from "../../middlewares/cloudinary";
import { uploadToCloudinary } from "../../middlewares/uploadToCloudinary";

/* ======================================================
   CREATE ANNOUNCEMENT
   POST /api/admin/announcements
====================================================== */
export const createAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      title,
      title_ar,
      content,
      content_ar,
      excerpt,
      excerpt_ar,
      category,
      is_published,
    } = req.body;

    let image_url: string | null = null;
    let image_public_id: string | null = null;

    // Upload image to Cloudinary if provided
    if (req.file) {
      const uploaded = await uploadToCloudinary(
        req.file,
        "announcements",
      );
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

    return res.status(201).json({
      message: "Announcement created successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ======================================================
   GET ALL ANNOUNCEMENTS
   GET /api/admin/announcements?page=1&limit=10&category=NEWS&is_published=true
====================================================== */
export const getAllAnnouncementsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { page = "1", limit = "10", category, is_published, search } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (category) {
      where.category = (category as string).toUpperCase();
    }

    if (is_published !== undefined) {
      where.is_published = is_published === "true";
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { title_ar: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.announcement.count({ where }),
    ]);

    return res.json({
      data: announcements,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ======================================================
   GET ANNOUNCEMENT BY ID
   GET /api/admin/announcements/:announcementId
====================================================== */
export const getAnnouncementByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { announcementId } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { announcement_id: announcementId },
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.json({ data: announcement });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ======================================================
   UPDATE ANNOUNCEMENT
   PUT /api/admin/announcements/:announcementId
====================================================== */
export const updateAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { announcementId } = req.params;
    const {
      title,
      title_ar,
      content,
      content_ar,
      excerpt,
      excerpt_ar,
      category,
    } = req.body;

    // Check if announcement exists
    const existing = await prisma.announcement.findUnique({
      where: { announcement_id: announcementId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const data: any = {
      title,
      title_ar,
      content,
      content_ar,
      excerpt,
      excerpt_ar,
      category,
    };

    // Upload new image if provided
    if (req.file) {
      // Delete old image from Cloudinary
      if (existing.image_public_id) {
        await cloudinary.uploader
          .destroy(existing.image_public_id)
          .catch((err: any) =>
            console.error("Error deleting old image:", err),
          );
      }

      const uploaded = await uploadToCloudinary(
        req.file,
        "announcements",
      );
      data.image_url = uploaded.secure_url;
      data.image_public_id = uploaded.public_id;
    }

    const announcement = await prisma.announcement.update({
      where: { announcement_id: announcementId },
      data,
    });

    return res.json({
      message: "Announcement updated successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ======================================================
   DELETE ANNOUNCEMENT
   DELETE /api/admin/announcements/:announcementId
====================================================== */
export const deleteAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { announcementId } = req.params;

    const existing = await prisma.announcement.findUnique({
      where: { announcement_id: announcementId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Delete image from Cloudinary
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

    return res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ======================================================
   PUBLISH ANNOUNCEMENT
   PATCH /api/admin/announcements/:announcementId/publish
====================================================== */
export const publishAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { announcementId } = req.params;

    const existing = await prisma.announcement.findUnique({
      where: { announcement_id: announcementId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (existing.is_published) {
      return res.status(400).json({ message: "Announcement is already published" });
    }

    const announcement = await prisma.announcement.update({
      where: { announcement_id: announcementId },
      data: {
        is_published: true,
        published_at: new Date(),
      },
    });

    return res.json({
      message: "Announcement published successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Error publishing announcement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ======================================================
   UNPUBLISH ANNOUNCEMENT
   PATCH /api/admin/announcements/:announcementId/unpublish
====================================================== */
export const unpublishAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { announcementId } = req.params;

    const existing = await prisma.announcement.findUnique({
      where: { announcement_id: announcementId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (!existing.is_published) {
      return res.status(400).json({ message: "Announcement is already unpublished" });
    }

    const announcement = await prisma.announcement.update({
      where: { announcement_id: announcementId },
      data: { is_published: false },
    });

    return res.json({
      message: "Announcement unpublished successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Error unpublishing announcement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};