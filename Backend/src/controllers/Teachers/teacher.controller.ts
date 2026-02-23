// ================================================================
// 📌 src/controllers/teacher/teacher.controller.ts
// ✅ Refactored: Uses TeacherPortalService
// Before: 2121 lines | After: ~250 lines
// ================================================================

import { Request, Response } from "express";
import { JwtUser } from "../../middlewares/auth.middleware";
import * as Portal from "../../services/teacher/Teacherportal.service";

// ─── Helper ──────────────────────────────────────────────
function handleResult(res: Response, result: any, successStatus = 200) {
  if (result && "error" in result) {
    const map: Record<string, number> = {
      validation: 400,
      bad_request: 400,
      not_found: 404,
      duplicate: 409,
      forbidden: 403,
    };
    return res
      .status(map[result.error] || 500)
      .json({ message: result.message || result.error });
  }
  return res.status(successStatus).json(result?.data ?? result);
}

function getUser(req: Request): JwtUser {
  return (req as any).user as JwtUser;
}

// ═══ PROFILE ═══
export const getTeacherProfileController = async (
  req: Request,
  res: Response,
) => {
  const profile = await Portal.getProfile(getUser(req));
  if (!profile)
    return res.status(404).json({ message: "Teacher profile not found" });
  return res.json(profile);
};

export const updateTeacherProfileController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(res, await Portal.updateProfile(getUser(req), req.body));
};

export const updateTeacherAvatarController = async (
  req: Request,
  res: Response,
) => {
  const file = req.file;
  if (!file)
    return res.status(400).json({ message: "Avatar image is required" });
  if (!file.mimetype.startsWith("image/"))
    return res.status(400).json({ message: "Only image files are allowed" });
  const result = await Portal.updateAvatar(getUser(req), file);
  return res.json({
    message: "Avatar updated successfully",
    avatar: result.data.avatar,
  });
};

// ═══ DASHBOARD ═══
export const teacherDashboardController = async (
  req: Request,
  res: Response,
) => {
  const dashboard = await Portal.getDashboard(getUser(req));
  if (!dashboard)
    return res.status(404).json({ message: "Teacher profile not found" });
  return res.json(dashboard);
};

// ═══ GROUPS ═══
export const getAssignedGroupsController = async (
  req: Request,
  res: Response,
) => {
  const groups = await Portal.getAssignedGroups(getUser(req));
  if (!groups)
    return res.status(404).json({ message: "Teacher profile not found" });
  return res.json(groups);
};

export const getGroupStudentsController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(
    res,
    await Portal.getGroupStudents(getUser(req), req.params.groupId),
  );
};

export const getGroupDetailsController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(
    res,
    await Portal.getGroupDetails(getUser(req), req.params.groupId),
  );
};

// ═══ SESSIONS ═══
export const getTeacherSessionsController = async (
  req: Request,
  res: Response,
) => {
  const sessions = await Portal.getSessions(
    getUser(req),
    req.query.group_id as string,
  );
  if (!sessions)
    return res.status(404).json({ message: "Teacher profile not found" });
  return res.json(sessions);
};

export const createTeacherSessionController = async (
  req: Request,
  res: Response,
) => {
  const result = await Portal.createSession(getUser(req), req.body);
  if ("error" in result) return handleResult(res, result);
  return res.status(201).json(result.data);
};

export const updateTeacherSessionController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(
    res,
    await Portal.updateSession(getUser(req), req.params.sessionId, req.body),
  );
};

export const deleteTeacherSessionController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(
    res,
    await Portal.deleteSession(getUser(req), req.params.sessionId),
  );
};

// ═══ ATTENDANCE ═══
export const getSessionAttendanceController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(
    res,
    await Portal.getSessionAttendance(getUser(req), req.params.sessionId),
  );
};

export const markSessionAttendanceController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(
    res,
    await Portal.markAttendance(
      getUser(req),
      req.params.sessionId,
      req.body.student_id,
      req.body.status,
    ),
  );
};

export const markBulkAttendanceController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(
    res,
    await Portal.markBulkAttendance(
      getUser(req),
      req.params.sessionId,
      req.body.records,
    ),
  );
};

// ═══ EXAMS ═══
export const getTeacherExamsController = async (
  req: Request,
  res: Response,
) => {
  const exams = await Portal.getExams(getUser(req));
  if (!exams)
    return res.status(404).json({ message: "Teacher profile not found" });
  return res.json(exams);
};

export const createTeacherExamController = async (
  req: Request,
  res: Response,
) => {
  const result = await Portal.createExam(getUser(req), req.body);
  if ("error" in result) return handleResult(res, result);
  return res.status(201).json(result.data);
};

export const updateTeacherExamController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(
    res,
    await Portal.updateExam(getUser(req), req.params.examId, req.body),
  );
};

export const deleteTeacherExamController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(
    res,
    await Portal.deleteExam(getUser(req), req.params.examId),
  );
};

// ═══ RESULTS ═══
export const getExamResultsController = async (req: Request, res: Response) => {
  return handleResult(
    res,
    await Portal.getExamResults(getUser(req), req.params.examId),
  );
};

export const addExamResultController = async (req: Request, res: Response) => {
  return handleResult(
    res,
    await Portal.addExamResult(getUser(req), req.params.examId, req.body),
  );
};

export const addBulkExamResultsController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(
    res,
    await Portal.addBulkExamResults(
      getUser(req),
      req.params.examId,
      req.body.results,
    ),
  );
};

// ═══ STUDENT VIEWS ═══
export const getStudentAttendanceController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(
    res,
    await Portal.getStudentAttendance(
      getUser(req),
      req.params.studentId,
      req.query.groupId as string,
    ),
  );
};

export const getStudentResultsController = async (
  req: Request,
  res: Response,
) => {
  return handleResult(
    res,
    await Portal.getStudentResults(getUser(req), req.params.studentId),
  );
};

// ═══ GROUP STATS ═══
export const getGroupStatsController = async (req: Request, res: Response) => {
  return handleResult(
    res,
    await Portal.getGroupStats(getUser(req), req.params.groupId),
  );
};

// ═══ ANNOUNCEMENTS ═══
export const getTeacherAnnouncementsController = async (
  req: Request,
  res: Response,
) => {
  return res.json(
    await Portal.getAnnouncements({
      page: Number(req.query.page) || undefined,
      limit: Number(req.query.limit) || undefined,
      category: req.query.category as string,
    }),
  );
};

export const getTeacherAnnouncementByIdController = async (
  req: Request,
  res: Response,
) => {
  const a = await Portal.getAnnouncementById(req.params.announcementId);
  if (!a) return res.status(404).json({ message: "Announcement not found" });
  return res.json(a);
};

// ═══ SCHEDULE ═══
export const getTeacherScheduleController = async (
  req: Request,
  res: Response,
) => {
  const schedule = await Portal.getSchedule(
    getUser(req),
    Number(req.query.days) || undefined,
  );
  if (!schedule)
    return res.status(404).json({ message: "Teacher profile not found" });
  return res.json(schedule);
};

// ═══ ROOMS ═══
export const getTeacherRoomsOverviewController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await Portal.getRoomsOverview(
      getUser(req),
      req.query.date as string,
    );
    if ("error" in result) return handleResult(res, result);
    return res.json(result.data);
  } catch {
    return res.status(500).json({ message: "حدث خطأ أثناء جلب ملخص القاعات" });
  }
};
