// ================================================================
// 📌 src/controllers/public/public.controller.ts
// ✅ Refactored: Uses PublicService
// ================================================================

import { Request, Response } from "express";
import * as PublicService from "../../services/announcement/public.service";

/* ══════ HOME STATS ══════ */
export const getPublicHomeStatsController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const stats = await PublicService.getHomeStats();
    return res.json(stats);
  } catch (error) {
    console.error("Error fetching home stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ══════ PUBLIC ANNOUNCEMENTS ══════ */
export const getPublicAnnouncementsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await PublicService.listPublicAnnouncements({
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined,
      category: req.query.category as string,
    });
    return res.json(result);
  } catch (error) {
    console.error("Error fetching public announcements:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ══════ PUBLIC ANNOUNCEMENT DETAIL ══════ */
export const getPublicAnnouncementByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const announcement = await PublicService.getPublicAnnouncementById(
      req.params.announcementId,
    );
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    return res.json(announcement);
  } catch (error) {
    console.error("Error fetching public announcement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ══════ PUBLIC COURSES ══════ */
export const getPublicCoursesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await PublicService.listPublicCourses({
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined,
      language: req.query.language as string,
    });
    return res.json(result);
  } catch (error) {
    console.error("Error fetching public courses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ══════ PUBLIC COURSE DETAIL ══════ */
export const getPublicCourseByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const course = await PublicService.getPublicCourseById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.json(course);
  } catch (error) {
    console.error("Error fetching public course:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
