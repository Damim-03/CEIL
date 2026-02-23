// ================================================================
// 📌 src/controllers/admin/Announcement.controller.ts
// ✅ Refactored: Uses AnnouncementService (Socket.IO inside service)
// ✅ 📌 Pin/Unpin support
// ================================================================

import { Request, Response } from "express";
import * as AnnouncementService from "../../services/announcement/Announcement.service";

/* ══════════════════════════════════════════════════════════
   CREATE ANNOUNCEMENT
   POST /api/admin/announcements
══════════════════════════════════════════════════════════ */
export const createAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const announcement = await AnnouncementService.createAnnouncement({
      ...req.body,
      file: req.file,
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
══════════════════════════════════════════════════════════ */
export const updateAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const announcement = await AnnouncementService.updateAnnouncement(
      req.params.announcementId,
      { ...req.body, file: req.file },
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
   PUBLISH ANNOUNCEMENT
   PATCH /api/admin/announcements/:announcementId/publish
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

/* ══════════════════════════════════════════════════════════
   UNPUBLISH ANNOUNCEMENT
   PATCH /api/admin/announcements/:announcementId/unpublish
══════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════
   📌 PIN ANNOUNCEMENT
   PATCH /api/admin/announcements/:announcementId/pin
══════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════
   📌 UNPIN ANNOUNCEMENT
   PATCH /api/admin/announcements/:announcementId/unpin
══════════════════════════════════════════════════════════ */
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
