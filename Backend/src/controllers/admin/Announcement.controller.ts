// ================================================================
// 📌 src/controllers/admin/Announcement.controller.ts
// ✅ Refactored: Uses AnnouncementService (Socket.IO inside service)
// ✅ 📌 Pin/Unpin support
// ✅ 📎 Attachment support (PDF, Word, images)
// ================================================================

import { Request, Response } from "express";
import * as AnnouncementService from "../../services/announcement/Announcement.service";

// Helper: extract named files from upload.fields()
function getFiles(req: Request) {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  return {
    imageFile: files?.["image"]?.[0],
    attachmentFile: files?.["attachment"]?.[0],
  };
}

/* ══════════════════════════════════════════════════════════
   CREATE ANNOUNCEMENT
   POST /api/admin/announcements
   Content-Type: multipart/form-data
   Fields: image (optional), attachment (optional)
══════════════════════════════════════════════════════════ */
export const createAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { imageFile, attachmentFile } = getFiles(req);

    const announcement = await AnnouncementService.createAnnouncement({
      ...req.body,
      file: imageFile,
      attachmentFile: attachmentFile,
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

/* ══════════════════════════════════════════════════════════
   GET ALL ANNOUNCEMENTS
   GET /api/admin/announcements?page=1&limit=10&category=NEWS&is_published=true
══════════════════════════════════════════════════════════ */
export const getAllAnnouncementsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { page, limit, category, is_published, search } = req.query;

    const result = await AnnouncementService.listAnnouncements({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      category: category as string,
      is_published:
        is_published !== undefined ? is_published === "true" : undefined,
      search: search as string,
    });

    return res.json(result);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ══════════════════════════════════════════════════════════
   GET ANNOUNCEMENT BY ID
   GET /api/admin/announcements/:announcementId
══════════════════════════════════════════════════════════ */
export const getAnnouncementByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const announcement = await AnnouncementService.getAnnouncementById(
      req.params.announcementId,
    );

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.json({ data: announcement });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ══════════════════════════════════════════════════════════
   UPDATE ANNOUNCEMENT
   PUT /api/admin/announcements/:announcementId
   Content-Type: multipart/form-data
   Fields: image (optional), attachment (optional)
   Body:   remove_attachment=true  → deletes existing attachment
══════════════════════════════════════════════════════════ */
export const updateAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { imageFile, attachmentFile } = getFiles(req);

    const announcement = await AnnouncementService.updateAnnouncement(
      req.params.announcementId,
      {
        ...req.body,
        file: imageFile,
        attachmentFile: attachmentFile,
        remove_attachment: req.body.remove_attachment,
      },
    );

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.json({
      message: "Announcement updated successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ══════════════════════════════════════════════════════════
   DELETE ANNOUNCEMENT
   DELETE /api/admin/announcements/:announcementId
══════════════════════════════════════════════════════════ */
export const deleteAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await AnnouncementService.deleteAnnouncement(
      req.params.announcementId,
    );

    if (!result) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ══════════════════════════════════════════════════════════
   PUBLISH / UNPUBLISH / PIN / UNPIN
   (unchanged — no file handling needed)
══════════════════════════════════════════════════════════ */

export const publishAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await AnnouncementService.publishAnnouncement(
      req.params.announcementId,
    );
    if ("error" in result) {
      if (result.error === "not_found")
        return res.status(404).json({ message: "Announcement not found" });
      if (result.error === "already_published")
        return res
          .status(400)
          .json({ message: "Announcement is already published" });
    }
    return res.json({
      message: "Announcement published successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error publishing announcement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const unpublishAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await AnnouncementService.unpublishAnnouncement(
      req.params.announcementId,
    );
    if ("error" in result) {
      if (result.error === "not_found")
        return res.status(404).json({ message: "Announcement not found" });
      if (result.error === "already_unpublished")
        return res
          .status(400)
          .json({ message: "Announcement is already unpublished" });
    }
    return res.json({
      message: "Announcement unpublished successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error unpublishing announcement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const pinAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await AnnouncementService.pinAnnouncement(
      req.params.announcementId,
    );
    if ("error" in result) {
      if (result.error === "not_found")
        return res.status(404).json({ message: "Announcement not found" });
      if (result.error === "already_pinned")
        return res
          .status(400)
          .json({ message: "Announcement is already pinned" });
    }
    return res.json({
      message: "Announcement pinned successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error pinning announcement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const unpinAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await AnnouncementService.unpinAnnouncement(
      req.params.announcementId,
    );
    if ("error" in result) {
      if (result.error === "not_found")
        return res.status(404).json({ message: "Announcement not found" });
      if (result.error === "not_pinned")
        return res.status(400).json({ message: "Announcement is not pinned" });
    }
    return res.json({
      message: "Announcement unpinned successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error unpinning announcement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
