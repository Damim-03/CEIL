import { Router } from "express";
import {
  createEnrollmentController,
  cancelEnrollmentController,
  getEnrollmentDetailsController,
  deleteMyDocumentController,
  reuploadDocumentController,
  getCourseGroupsForStudents,
  getCoursesForStudents,
  getMyDashboardController,
  getMyDocumentsController,
  getMyEnrollmentsController,
  getMyProfile,
  joinGroupController,
  leaveGroupController,
  updateMyStudentProfile,
  uploadDocumentsController,
  getMyFeesController,
  getMyAttendanceController,
  getMyResultsController,
} from "../../controllers/student/student.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { requireApprovedDocuments } from "../../middlewares/requireApprovedDocuments.middleware";
import { requireCompletedProfile } from "../../middlewares/requireCompletedProfile.middleware";

const studentRoutes: Router = Router();

/* ================= PROFILE ================= */

// ✅ FIXED: Added authMiddleware
studentRoutes.get("/me/profile", authMiddleware, getMyProfile);

studentRoutes.put("/profile", authMiddleware, updateMyStudentProfile);

studentRoutes.get("/me/dashboard", authMiddleware, getMyDashboardController);

/* ================= DOCUMENTS ================= */

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

studentRoutes.put(
  "/documents/:document_id/reupload",
  authMiddleware,
  upload.single("file"),
  reuploadDocumentController,
);

/* ================= ENROLLMENT ================= */

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

studentRoutes.get(
  "/me/enrollments/:enrollment_id",
  authMiddleware,
  getEnrollmentDetailsController,
);

studentRoutes.delete(
  "/me/enrollments/:enrollment_id",
  authMiddleware,
  cancelEnrollmentController,
);

/* ================= COURSES ================= */

studentRoutes.get("/courses", authMiddleware, getCoursesForStudents);

studentRoutes.get(
  "/courses/:courseId/groups",
  authMiddleware,
  getCourseGroupsForStudents,
);

/* ================= GROUPS ================= */

studentRoutes.post("/groups/join", authMiddleware, joinGroupController);

studentRoutes.post("/groups/leave", authMiddleware, leaveGroupController);

/* ================= FEES ================= */

studentRoutes.get("/me/fees", authMiddleware, getMyFeesController);

/* ================= ATTENDANCE ================= */

studentRoutes.get("/me/attendance", authMiddleware, getMyAttendanceController);

/* ================= RESULTS ================= */

studentRoutes.get("/me/results", authMiddleware, getMyResultsController);

export default studentRoutes;
