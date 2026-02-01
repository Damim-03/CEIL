import { Router } from "express";
import {
  createEnrollmentController,
  deleteMyDocumentController,
  getMyDashboardController,
  getMyDocumentsController,
  getMyEnrollmentsController,
  getMyProfile,
  updateMyStudentProfile,
  uploadDocumentsController,
} from "../../controllers/student/student.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { requireApprovedDocuments } from "../../middlewares/requireApprovedDocuments.middleware";
import { requireCompletedProfile } from "../../middlewares/requireCompletedProfile.middleware";

const studentRoutes: Router = Router();

/* ================= PROFILE ================= */

studentRoutes.get("/me/profile", getMyProfile);

studentRoutes.put("/profile", authMiddleware, updateMyStudentProfile);

studentRoutes.get("/me/dashboard", authMiddleware, getMyDashboardController);

studentRoutes.post(
  "/documents",
  authMiddleware,
  upload.fields([
    { name: "PHOTO", maxCount: 1 },
    { name: "ID_CARD", maxCount: 1 },
    { name: "SCHOOL_CERTIFICATE", maxCount: 1 },
    { name: "PAYMENT_RECEIPT", maxCount: 1 },
  ]),
  uploadDocumentsController,
);

studentRoutes.delete(
  "/documents/:document_id",
  authMiddleware,
  deleteMyDocumentController,
);

studentRoutes.get("/documents", authMiddleware, getMyDocumentsController);

studentRoutes.post(
  "/enroll",
  authMiddleware,
  requireCompletedProfile,
  requireApprovedDocuments,
  createEnrollmentController,
);

studentRoutes.get(
  "/me/enrollments",
  authMiddleware,
  getMyEnrollmentsController,
);

export default studentRoutes;
