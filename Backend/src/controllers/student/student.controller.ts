// ================================================================
// 📌 src/controllers/student/student.controller.ts
// ✅ FIXED: uploadDocumentsController wrapped in try/catch
// ================================================================

import { Request, Response } from "express";
import {
  AuthenticatedRequest,
  JwtUser,
} from "../../middlewares/auth.middleware";
import * as Portal from "../../services/student/Studentportal.service";

// ─── Helper ──────────────────────────────────────────────
function handleResult(res: Response, result: any, successStatus = 200) {
  if (result && "error" in result) {
    const statusMap: Record<string, number> = {
      validation: 400,
      bad_request: 400,
      not_found: 404,
      duplicate: 409,
      forbidden: 403,
    };
    return res
      .status(statusMap[result.error] || 500)
      .json({ message: result.message || result.error });
  }
  return res.status(successStatus).json(result?.data ?? result);
}

// ═══ PROFILE ═══
export const getMyProfile = async (req: Request, res: Response) => {
  const profile = await Portal.getProfile(req.user!.user_id);
  if (!profile) return res.status(404).json({ message: "Student not found" });
  return res.json(profile);
};

export const updateMyStudentProfile = async (req: Request, res: Response) => {
  const user = (req as Request & { user?: JwtUser }).user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  const student = await Portal.updateProfile(user.user_id, req.body);
  return res.json({ message: "Profile updated successfully", student });
};

// ═══ DOCUMENTS ═══
// ✅ FIXED: wrapped in try/catch to expose real error instead of silent 500
export const uploadDocumentsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const files = req.files as Record<string, Express.Multer.File[]>;
    if (!files || Object.keys(files).length === 0)
      return res.status(400).json({ message: "No documents uploaded" });

    console.log("🔵 uploadDocuments - user:", user.user_id);
    console.log("🔵 uploadDocuments - files:", Object.keys(files));

    const result = await Portal.uploadDocuments(user.user_id, files);
    if ("error" in result) return handleResult(res, result);

    return res.status(201).json({
      message: "Documents uploaded successfully",
      documents: result.data.documents,
      skipped: result.data.skipped,
    });
  } catch (err: any) {
    console.error("❌ uploadDocumentsController ERROR:", err?.message || err);
    return res.status(500).json({
      message: err?.message || "Internal Server Error",
    });
  }
};

export const getMyDocumentsController = async (req: Request, res: Response) => {
  const result = await Portal.getDocuments(
    (req as AuthenticatedRequest).user.user_id,
  );
  if ("error" in result) return handleResult(res, result);
  return res.json(result.data);
};

export const deleteMyDocumentController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(
    res,
    await Portal.deleteDocument(
      (req as AuthenticatedRequest).user.user_id,
      req.params.document_id,
    ),
  );
};

export const reuploadDocumentController = async (
  req: Request,
  res: Response,
) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file uploaded" });
  const result = await Portal.reuploadDocument(
    (req as AuthenticatedRequest).user.user_id,
    req.params.document_id,
    file,
  );
  if (result && "error" in result) return handleResult(res, result);
  return res.json({
    message: "Document re-uploaded successfully",
    document: result.data,
  });
};

// ═══ ENROLLMENT ═══
export const createEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as AuthenticatedRequest).user;
  const { course_id, group_id, level, pricing_id } = req.body;
  const result = await Portal.createEnrollment(user.user_id, {
    course_id,
    group_id,
    level,
    pricing_id,
  });
  if ("error" in result) return handleResult(res, result);
  return res
    .status(201)
    .json({ message: "Enrollment request sent", enrollment: result.data });
};

export const getMyEnrollmentsController = async (
  req: Request,
  res: Response,
) => {
  const result = await Portal.getEnrollments(
    (req as AuthenticatedRequest).user.user_id,
  );
  if ("error" in result) return handleResult(res, result);
  return res.json(result.data);
};

export const cancelEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(
    res,
    await Portal.cancelEnrollment(
      (req as AuthenticatedRequest).user.user_id,
      req.params.enrollment_id,
    ),
  );
};

export const getEnrollmentDetailsController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(
    res,
    await Portal.getEnrollmentDetails(
      (req as AuthenticatedRequest).user.user_id,
      req.params.enrollment_id,
    ),
  );
};

// ═══ GROUPS ═══
export const joinGroupController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    return handleResult(
      res,
      await Portal.joinGroup(user.user_id, req.body.groupId),
    );
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const leaveGroupController = async (req: Request, res: Response) => {
  try {
    return handleResult(
      res,
      await Portal.leaveGroup((req as AuthenticatedRequest).user.user_id),
    );
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ═══ COURSES ═══
export const getCourseGroupsForStudents = async (
  req: Request,
  res: Response,
) => {
  const { courseId } = req.params;
  if (!courseId)
    return res.status(400).json({ message: "courseId is required" });
  return res.json(await Portal.getCourseGroups(courseId));
};

export const getCoursesForStudents = async (_req: Request, res: Response) => {
  try {
    return res.json(await Portal.getCoursesWithGroups());
  } catch {
    return res.status(500).json({ message: "Failed to fetch courses" });
  }
};

// ═══ DASHBOARD ═══
export const getMyDashboardController = async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user?.user_id) return res.status(401).json({ message: "Unauthorized" });
  const dashboard = await Portal.getDashboard(user.user_id);
  if (!dashboard) return res.status(404).json({ message: "Student not found" });
  return res.json(dashboard);
};

// ═══ FEES ═══
export const getMyFeesController = async (req: Request, res: Response) => {
  const result = await Portal.getMyFees(
    (req as AuthenticatedRequest).user.user_id,
  );
  if ("error" in result) return handleResult(res, result);
  return res.json(result.data);
};

// ═══ ATTENDANCE ═══
export const getMyAttendanceController = async (
  req: Request,
  res: Response,
) => {
  const result = await Portal.getMyAttendance(
    (req as AuthenticatedRequest).user.user_id,
  );
  if ("error" in result) return handleResult(res, result);
  return res.json(result.data);
};

// ═══ RESULTS ═══
export const getMyResultsController = async (req: Request, res: Response) => {
  const result = await Portal.getMyResults(
    (req as AuthenticatedRequest).user.user_id,
  );
  if ("error" in result) return handleResult(res, result);
  return res.json(result.data);
};

// ═══ COURSE PRICING ═══
export const getCourseProfileWithPricing = async (
  req: Request,
  res: Response,
) => {
  try {
    const { courseId } = req.params;
    if (!courseId)
      return res.status(400).json({ message: "Course ID is required" });
    const result = await Portal.getCourseProfileWithPricing(courseId);
    if ("error" in result) {
      const statusMap: Record<string, number> = {
        not_found: 404,
        forbidden: 403,
      };
      const code = result.error ? statusMap[result.error] || 500 : 500;
      return res
        .status(code)
        .json({ message: result.message, error: result.message });
    }
    return res.json(result.data);
  } catch {
    return res.status(500).json({
      message: "Internal server error",
      error: "An error occurred while fetching course information.",
    });
  }
};
