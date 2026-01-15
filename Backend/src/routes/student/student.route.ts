import { Router } from "express";
import {
  getMyDocumentsController,
  getMyProfile,
  updateMyStudentProfile,
  uploadDocumentController,
} from "../../controllers/student/student.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";

const studentRoutes: Router = Router();

/* ================= PROFILE ================= */

studentRoutes.get("/me/profile", getMyProfile);

studentRoutes.put("/profile", authMiddleware, updateMyStudentProfile);

studentRoutes.post(
  "/documents",
  authMiddleware,
  upload.single("file"),
  uploadDocumentController
);

studentRoutes.get("/documents", authMiddleware, getMyDocumentsController);

export default studentRoutes;
