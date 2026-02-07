import { Router } from "express";
import { getPublicHomeStatsController, getPublicAnnouncementsController, getPublicAnnouncementByIdController, getPublicCoursesController, getPublicCourseByIdController } from "../../controllers/announcement/announcement.controller"



const publicRoutes = Router();

// ─── No authMiddleware! Anyone can access these ───

// Home page stats
publicRoutes.get("/home/stats", getPublicHomeStatsController);

// Announcements (published only)
publicRoutes.get("/announcements", getPublicAnnouncementsController);
publicRoutes.get("/announcements/:announcementId", getPublicAnnouncementByIdController);

// Courses (published only)
publicRoutes.get("/courses", getPublicCoursesController);
publicRoutes.get("/courses/:courseId", getPublicCourseByIdController);

export default publicRoutes;