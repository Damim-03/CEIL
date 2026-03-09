// ================================================================
// 📌 src/controllers/owner/owner.controller.ts
// ✅ Refactored: Uses OwnerService + Shared Services
// 🔌 REAL-TIME: emitToAdminLevel + triggerDashboardRefresh after every mutation
// 🐛 BUG FIX: ownerRejectEnrollmentController now calls rejectEnrollment
// ================================================================

import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { JwtUser } from "../../middlewares/auth.middleware";
import { logAuditEvent } from "../../middlewares/auditLog.middleware";
import {
  UserRole,
  RegistrationStatus,
  StudentStatus,
} from "../../../generated/prisma/client";
import path from "path";
import fs from "fs";
import {
  emitToAdminLevel,
  emitToUser,
  triggerDashboardRefresh,
} from "../../services/socket.service";

// ─── Services ────────────────────────────────────────────
import * as OwnerService from "../../services/owner/Owner.service";
import * as StudentService from "../../services/admin/student.service";
import * as TeacherService from "../../services/admin/teacher.service";
import * as CourseService from "../../services/admin/course.service";
import * as DepartmentService from "../../services/admin/department.service";
import * as GroupService from "../../services/admin/group.service";
import * as FeeService from "../../services/admin/fee.service";
import * as EnrollmentService from "../../services/admin/enrollment.service";
import * as SessionService from "../../services/admin/session.service";
import * as AttendanceService from "../../services/admin/attendance.service";
import * as ExamService from "../../services/admin/exam.service";
import * as AnnouncementService from "../../services/announcement/Announcement.service";
import * as CourseProfileService from "../../services/admin/Courseprofile.service";
import * as NotificationService from "../../services/admin/Notification.service";
import * as RoomService from "../../services/admin/Room.service";
import * as DocumentService from "../../services/admin/Document.service";
import { getFeeAnalytics } from "../../services/owner/feeAnalytics.service";
import { uploadToCloudinary } from "../../middlewares/uploadToCloudinary";
import { Roles } from "../../enums/role.enum";
import { hashPassword } from "../../utils/password.util";
import { correctFeeAmount } from "../../services/admin/fee.service";

// ─── Helpers ──────────────────────────────────────────────
function handleServiceResult(res: Response, result: any, successStatus = 200) {
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

function isError(result: any): boolean {
  return result && "error" in result;
}

/* ═══ 1. SYSTEM OVERVIEW DASHBOARD ═══ */
export const getOwnerDashboardController = async (
  _: Request,
  res: Response,
) => {
  try {
    return res.json(await OwnerService.getOwnerDashboard());
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e.message || "Failed to fetch owner dashboard" });
  }
};

export const ownerGetFeeAnalyticsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      period = "monthly",
      date,
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;
    res.json(
      await getFeeAnalytics({
        period: period as any,
        date,
        page: parseInt(page),
        limit: parseInt(limit),
      }),
    );
  } catch (e: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch fee analytics", error: e.message });
  }
};

/* ═══ 2. MANAGE ADMINS ═══ */
export const getAllAdminsController = async (_: Request, res: Response) => {
  try {
    return res.json(await OwnerService.listAdmins());
  } catch {
    return res.status(500).json({ message: "Failed to fetch admins" });
  }
};

export const createAdminController = async (req: Request, res: Response) => {
  try {
    const result = await OwnerService.createAdmin((req as any).user, req.body);
    if (!isError(result)) {
      emitToAdminLevel("admin:created", { admin: result?.data ?? result });
      triggerDashboardRefresh("admin_created");
    }
    return handleServiceResult(res, result, 201);
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e.message || "Failed to create admin" });
  }
};

export const activateAdminController = async (req: Request, res: Response) => {
  try {
    const result = await OwnerService.activateAdmin(
      (req as any).user,
      req.params.userId,
    );
    if (!isError(result))
      emitToAdminLevel("admin:activated", { userId: req.params.userId });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed to activate admin" });
  }
};

export const deactivateAdminController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await OwnerService.deactivateAdmin(
      (req as any).user,
      req.params.userId,
    );
    if (!isError(result))
      emitToAdminLevel("admin:deactivated", { userId: req.params.userId });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed to deactivate admin" });
  }
};

export const deleteAdminController = async (req: Request, res: Response) => {
  try {
    const result = await OwnerService.deleteAdmin(
      (req as any).user,
      req.params.userId,
    );
    if (!isError(result)) {
      emitToAdminLevel("admin:deleted", { userId: req.params.userId });
      triggerDashboardRefresh("admin_deleted");
    }
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed to delete admin" });
  }
};

export const promoteToOwnerController = async (req: Request, res: Response) => {
  try {
    const result = await OwnerService.promoteToOwner(
      (req as any).user,
      req.params.userId,
    );
    if (!isError(result)) {
      emitToAdminLevel("admin:promoted", { userId: req.params.userId });
      triggerDashboardRefresh("admin_promoted");
    }
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed to promote admin" });
  }
};

export const ownerChangeUserRoleController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await OwnerService.changeUserRole(
      (req as any).user,
      req.params.userId,
      req.body.role,
    );
    if (!isError(result)) {
      emitToAdminLevel("user:roleChanged", {
        userId: req.params.userId,
        role: req.body.role,
      });
      triggerDashboardRefresh("role_changed");
    }
    return handleServiceResult(res, result);
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e.message || "Failed to change user role" });
  }
};

/* ═══ 3. AUDIT LOGS ═══ */
export const getAuditLogsController = async (req: Request, res: Response) => {
  try {
    return res.json(
      await OwnerService.listAuditLogs({
        page: Number(req.query.page) || undefined,
        limit: Number(req.query.limit) || undefined,
        action: req.query.action as string,
        entity_type: req.query.entity_type as string,
        user_id: req.query.user_id as string,
        from: req.query.from as string,
        to: req.query.to as string,
      }),
    );
  } catch {
    return res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};

export const getAuditLogStatsController = async (_: Request, res: Response) => {
  try {
    return res.json(await OwnerService.getAuditLogStats());
  } catch {
    return res.status(500).json({ message: "Failed to fetch audit log stats" });
  }
};

export const cleanupAuditLogsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const r = await OwnerService.cleanupAuditLogs(
      (req as any).user,
      req.body.days_to_keep,
    );
    emitToAdminLevel("system:auditCleanup", { deleted: r.deleted });
    return res.json({
      message: `Deleted ${r.deleted} entries older than ${r.days_kept} days`,
      deleted: r.deleted,
    });
  } catch {
    return res.status(500).json({ message: "Failed to cleanup audit logs" });
  }
};

/* ═══ 4. SYSTEM SETTINGS ═══ */
export const getSystemSettingsController = async (
  _: Request,
  res: Response,
) => {
  try {
    return res.json(await OwnerService.getSystemSettings());
  } catch {
    return res.status(500).json({ message: "Failed to fetch settings" });
  }
};

export const updateSystemSettingsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await OwnerService.updateSystemSettings(
      (req as any).user,
      req.body.settings,
    );
    if (!isError(result)) emitToAdminLevel("system:settingsUpdated", {});
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed to update settings" });
  }
};

/* ═══ 5. ALL USERS MANAGEMENT ═══ */
export const getAllUsersFullController = async (
  req: Request,
  res: Response,
) => {
  try {
    return res.json(
      await OwnerService.listAllUsers({
        page: Number(req.query.page) || undefined,
        limit: Number(req.query.limit) || undefined,
        role: req.query.role as string,
        search: req.query.search as string,
        is_active: req.query.is_active as string,
      }),
    );
  } catch {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const ownerGetUserByIdController = async (
  req: Request,
  res: Response,
) => {
  const user = await OwnerService.getUserById(req.params.userId);
  if (user == null) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

export const ownerEnableUserController = async (
  req: Request,
  res: Response,
) => {
  const user = await OwnerService.enableUser(req.params.userId);
  emitToAdminLevel("user:enabled", { userId: req.params.userId });
  res.json({ message: "User enabled", user });
};

export const ownerDisableUserController = async (
  req: Request,
  res: Response,
) => {
  const user = await OwnerService.disableUser(req.params.userId);
  emitToAdminLevel("user:disabled", { userId: req.params.userId });
  emitToUser(req.params.userId, "user:disabled", {});
  res.json({ message: "User disabled", user });
};

/* ═══ 6. SYSTEM HEALTH & STATS ═══ */
export const getSystemHealthController = async (_: Request, res: Response) => {
  try {
    return res.json(await OwnerService.getSystemHealth());
  } catch (e: any) {
    return res.status(503).json({
      status: "unhealthy",
      database: { connected: false },
      error: e.message,
    });
  }
};

export const getDetailedSystemStatsController = async (
  _: Request,
  res: Response,
) => {
  try {
    return res.json(await OwnerService.getDetailedSystemStats());
  } catch {
    return res.status(500).json({ message: "Failed to fetch system stats" });
  }
};

/* ═══ 7. FEES — Owner-specific CRUD + Revenue ═══ */
export const ownerGetAllFeesController = async (
  req: Request,
  res: Response,
) => {
  try {
    return res.json(
      await OwnerService.listOwnerFees({
        page: Number(req.query.page) || undefined,
        limit: Number(req.query.limit) || undefined,
        status: req.query.status as string,
        student_id: req.query.student_id as string,
      }),
    );
  } catch {
    return res.status(500).json({ message: "Failed to fetch fees" });
  }
};

export const ownerGetFeeByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const fee = (await FeeService.getFeeById(req.params.feeId)) as any;
    if (fee == null) return res.status(404).json({ message: "Fee not found" });
    return res.json(fee);
  } catch {
    return res.status(500).json({ message: "Failed to fetch fee" });
  }
};

export const ownerCreateFeeController = async (req: Request, res: Response) => {
  try {
    const result = await OwnerService.createOwnerFee(
      (req as any).user,
      req.body,
    );
    if (!isError(result)) {
      emitToAdminLevel("fee:created", { fee: result?.data ?? result });
      triggerDashboardRefresh("fee_created");
    }
    return handleServiceResult(res, result, 201);
  } catch {
    return res.status(500).json({ message: "Failed to create fee" });
  }
};

export const ownerUpdateFeeController = async (req: Request, res: Response) => {
  try {
    const result = await OwnerService.updateOwnerFee(
      (req as any).user,
      req.params.feeId,
      req.body,
    );
    if (!isError(result))
      emitToAdminLevel("fee:created", {
        feeId: req.params.feeId,
        action: "updated",
      });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed to update fee" });
  }
};

export const ownerMarkFeeAsPaidController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await FeeService.markFeeAsPaid(req.params.feeId, {
      payment_method: req.body.payment_method,
      reference_code: req.body.reference_code,
      adminUserId: (req as any).user.user_id,
    });
    if (!isError(result)) {
      emitToAdminLevel("fee:paid", { feeId: req.params.feeId });
      triggerDashboardRefresh("fee_paid");
    }
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed to mark fee as paid" });
  }
};

export const ownerDeleteFeeController = async (req: Request, res: Response) => {
  try {
    const result = await OwnerService.deleteOwnerFee(
      (req as any).user,
      req.params.feeId,
    );
    if (!isError(result)) {
      emitToAdminLevel("fee:deleted", { feeId: req.params.feeId });
      triggerDashboardRefresh("fee_deleted");
    }
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed to delete fee" });
  }
};

export const ownerGetRevenueController = async (_: Request, res: Response) => {
  try {
    return res.json(await OwnerService.getRevenue());
  } catch {
    return res.status(500).json({ message: "Failed to fetch revenue" });
  }
};

/* ═══ 8. ENROLLMENTS — Shared services ═══ */
export const ownerGetAllEnrollmentsController = async (
  req: Request,
  res: Response,
) => {
  try {
    return res.json(await EnrollmentService.listEnrollments());
  } catch {
    return res.status(500).json({ message: "Failed to fetch enrollments" });
  }
};

export const ownerGetEnrollmentByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const e = await EnrollmentService.getEnrollmentById(
      req.params.enrollmentId,
    );
    if (e == null)
      return res.status(404).json({ message: "Enrollment not found" });
    return res.json(e);
  } catch {
    return res.status(500).json({ message: "Failed to fetch enrollment" });
  }
};

export const ownerChangeEnrollmentStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const owner = (req as any).user as JwtUser;
    const { enrollmentId } = req.params;
    const { status } = req.body;
    if (!Object.values(RegistrationStatus).includes(status))
      return res.status(400).json({ message: "Invalid status" });
    const enrollment = await prisma.enrollment.findUnique({
      where: { enrollment_id: enrollmentId },
    });
    if (enrollment == null)
      return res.status(404).json({ message: "Enrollment not found" });
    const updated = await prisma.$transaction(async (tx) => {
      await tx.registrationHistory.create({
        data: {
          enrollment_id: enrollmentId,
          old_status: enrollment.registration_status,
          new_status: status,
          changed_by: owner.user_id,
        },
      });
      return tx.enrollment.update({
        where: { enrollment_id: enrollmentId },
        data: { registration_status: status },
        include: {
          student: { select: { first_name: true, last_name: true } },
          course: { select: { course_name: true } },
        },
      });
    });
    await logAuditEvent({
      user_id: owner.user_id,
      user_role: owner.role,
      action: "CHANGE_ENROLLMENT_STATUS",
      entity_type: "Enrollment",
      entity_id: enrollmentId,
      details: {
        old_status: enrollment.registration_status,
        new_status: status,
      },
    });
    // 🔌 Socket
    emitToAdminLevel("enrollment:statusChanged", {
      enrollmentId,
      oldStatus: enrollment.registration_status,
      newStatus: status,
    });
    if (updated.student_id) {
      const studentUser = await prisma.student.findUnique({
        where: { student_id: updated.student_id },
        select: { user_id: true },
      });
      if (studentUser?.user_id)
        emitToUser(studentUser.user_id, "enrollment:statusChanged", {
          enrollmentId,
          newStatus: status,
        });
    }
    triggerDashboardRefresh("enrollment_status_changed");
    return res.json({ message: "Status updated", enrollment: updated });
  } catch {
    return res.status(500).json({ message: "Failed to update enrollment" });
  }
};

export const ownerDeleteEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await EnrollmentService.rejectEnrollment(
      req.params.enrollmentId,
      req.body.reason || "Deleted by owner",
      (req as any).user.user_id,
    );
    if (!isError(result)) {
      emitToAdminLevel("enrollment:statusChanged", {
        enrollmentId: req.params.enrollmentId,
        action: "deleted",
      });
      triggerDashboardRefresh("enrollment_deleted");
    }
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed to delete enrollment" });
  }
};

export const ownerValidateEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await EnrollmentService.validateEnrollment(
      req.params.enrollmentId,
      {
        pricing_id_override: req.body.pricing_id,
        changedBy: (req as any).user.user_id,
      },
    );
    if (!isError(result)) {
      emitToAdminLevel("enrollment:statusChanged", {
        enrollmentId: req.params.enrollmentId,
        newStatus: "VALIDATED",
      });
      triggerDashboardRefresh("enrollment_validated");
    }
    return handleServiceResult(res, result);
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e.message || "Failed to validate enrollment" });
  }
};

// 🐛 BUG FIX: Was calling validateEnrollment instead of rejectEnrollment!
export const ownerRejectEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.body.reason?.trim())
      return res.status(400).json({ message: "Rejection reason is required" });
    const result = await EnrollmentService.rejectEnrollment(
      req.params.enrollmentId,
      req.body.reason,
      (req as any).user.user_id,
    );
    if (!isError(result)) {
      emitToAdminLevel("enrollment:statusChanged", {
        enrollmentId: req.params.enrollmentId,
        newStatus: "REJECTED",
      });
      triggerDashboardRefresh("enrollment_rejected");
    }
    return handleServiceResult(res, result);
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e.message || "Failed to reject enrollment" });
  }
};

export const ownerMarkEnrollmentPaidController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await EnrollmentService.markEnrollmentPaid(
      req.params.enrollmentId,
      (req as any).user.user_id,
    );
    if (!isError(result)) {
      emitToAdminLevel("fee:paid", { enrollmentId: req.params.enrollmentId });
      emitToAdminLevel("enrollment:statusChanged", {
        enrollmentId: req.params.enrollmentId,
        newStatus: "PAID",
      });
      triggerDashboardRefresh("enrollment_paid");
    }
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};

export const ownerFinishEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await EnrollmentService.finishEnrollment(
      req.params.enrollmentId,
      (req as any).user.user_id,
    );
    if (!isError(result)) {
      emitToAdminLevel("enrollment:statusChanged", {
        enrollmentId: req.params.enrollmentId,
        newStatus: "FINISHED",
      });
      triggerDashboardRefresh("enrollment_finished");
    }
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};

/* ═══ 9. STUDENTS — Uses StudentService ═══ */
export const ownerGetAllStudentsController = async (
  req: Request,
  res: Response,
) => {
  try {
    return res.json(
      await StudentService.listStudents({
        page: Number(req.query.page) || undefined,
        limit: Number(req.query.limit) || undefined,
        status: req.query.status as StudentStatus | undefined,
      }),
    );
  } catch {
    return res.status(500).json({ message: "Failed to fetch students" });
  }
};
export const ownerGetStudentByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const s = await StudentService.getStudentById(req.params.studentId);
    if (s == null)
      return res.status(404).json({ message: "Student not found" });
    return res.json(s);
  } catch {
    return res.status(500).json({ message: "Failed to fetch student" });
  }
};
export const ownerCreateStudentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await StudentService.createStudent(req.body);
    if (!isError(result)) {
      emitToAdminLevel("student:created", { student: result?.data ?? result });
      triggerDashboardRefresh("student_created");
    }
    return handleServiceResult(res, result, 201);
  } catch {
    return res.status(500).json({ message: "Failed to create student" });
  }
};
export const ownerUpdateStudentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await StudentService.updateStudent(
      req.params.studentId,
      req.body,
    );
    if (!isError(result))
      emitToAdminLevel("student:created", {
        studentId: req.params.studentId,
        action: "updated",
      });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed to update student" });
  }
};
export const ownerDeleteStudentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await StudentService.deleteStudent(req.params.studentId);
    if (!isError(result)) {
      emitToAdminLevel("student:deleted", { studentId: req.params.studentId });
      triggerDashboardRefresh("student_deleted");
    }
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed to delete student" });
  }
};
export const ownerUpdateStudentAvatarController = async (
  req: Request,
  res: Response,
) => {
  const file = req.file;
  if (!file)
    return res.status(400).json({ message: "Avatar image is required" });
  if (!file.mimetype.startsWith("image/"))
    return res.status(400).json({ message: "Only image files" });
  const student = await prisma.student.findUnique({
    where: { student_id: req.params.studentId },
    include: { user: true },
  });
  if (!student?.user)
    return res.status(404).json({ message: "Student or user not found" });
  const r = await uploadToCloudinary(file, `avatars/${student.user.user_id}`);
  await prisma.user.update({
    where: { user_id: student.user.user_id },
    data: { google_avatar: r.secure_url },
  });
  emitToAdminLevel("student:created", {
    studentId: req.params.studentId,
    action: "avatar_updated",
  });
  return res.json({ message: "Avatar updated", avatar: r.secure_url });
};

/* ═══ 10. TEACHERS ═══ */
export const ownerGetAllTeachersController = async (
  _: Request,
  res: Response,
) => {
  try {
    return res.json(await TeacherService.listTeachers());
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerGetTeacherByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const t = await TeacherService.getTeacherById(req.params.teacherId);
    if (t == null)
      return res.status(404).json({ message: "Teacher not found" });
    return res.json(t);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerCreateTeacherController = async (
  req: Request,
  res: Response,
) => {
  const { first_name, last_name, email, phone_number, password } = req.body;
  //                                                    ^^^^^^^^ أضف هذا
  if (!first_name?.trim() || !last_name?.trim() || !email) {
    return res
      .status(400)
      .json({ message: "first_name, last_name and email are required" });
  }
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existingUser)
    return res
      .status(409)
      .json({ message: "User with this email already exists" });
  const result = await prisma.$transaction(async (tx) => {
    const teacher = await tx.teacher.create({
      data: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.toLowerCase(),
        phone_number: phone_number || null,
      },
    });
    await tx.user.create({
      data: {
        email: email.toLowerCase(),
        password: password ? await hashPassword(password) : null, // ← نفس طريقة الأدمن
        role: Roles.TEACHER,
        teacher_id: teacher.teacher_id,
      },
    });
    return teacher;
  });
  return res.status(201).json(result);
};
export const ownerUpdateTeacherController = async (
  req: Request,
  res: Response,
) => {
  const { teacherId } = req.params;
  if (Object.keys(req.body).length === 0)
    return res.status(400).json({ message: "Request body is empty" });

  const teacher = await prisma.teacher.findUnique({
    where: { teacher_id: teacherId },
    include: { user: true },
  });
  if (!teacher) return res.status(404).json({ message: "Teacher not found" });

  const allowedFields = ["first_name", "last_name", "email", "phone_number"];
  const data = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
  );

  const updatedTeacher = await prisma.teacher.update({
    where: { teacher_id: teacherId },
    data,
  });

  // ✅ Update user record if password or email changed
  if (teacher.user) {
    const userUpdate: any = {};
    if (req.body.password?.trim())
      userUpdate.password = await hashPassword(req.body.password.trim());
    if (req.body.email) userUpdate.email = req.body.email.toLowerCase();
    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { user_id: teacher.user.user_id },
        data: userUpdate,
      });
    }
  }

  return res.json(updatedTeacher);
};
export const ownerDeleteTeacherController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await TeacherService.deleteTeacher(req.params.teacherId);
    if (!isError(result)) {
      emitToAdminLevel("teacher:deleted", { teacherId: req.params.teacherId });
      triggerDashboardRefresh("teacher_deleted");
    }
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};

/* ═══ 11. COURSES ═══ */
export const ownerGetAllCoursesController = async (
  _: Request,
  res: Response,
) => {
  try {
    return res.json(await CourseService.listCourses());
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerGetCourseByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const c = await CourseService.getCourseById(req.params.courseId);
    if (c == null) return res.status(404).json({ message: "Course not found" });
    return res.json(c);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerCreateCourseController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await CourseService.createCourse(req.body);
    if (!isError(result)) triggerDashboardRefresh("course_created");
    return handleServiceResult(res, result, 201);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerUpdateCourseController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await CourseService.updateCourse(req.params.courseId, req.body),
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerDeleteCourseController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await CourseService.deleteCourse(req.params.courseId);
    if (!isError(result)) triggerDashboardRefresh("course_deleted");
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};

/* ═══ 12. DEPARTMENTS ═══ */
export const ownerGetAllDepartmentsController = async (
  _: Request,
  res: Response,
) => {
  try {
    return res.json(await DepartmentService.listDepartments());
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerGetDepartmentByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const d = await DepartmentService.getDepartmentById(
      req.params.departmentId,
    );
    if (d == null)
      return res.status(404).json({ message: "Department not found" });
    return res.json(d);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerCreateDepartmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await DepartmentService.createDepartment(req.body);
    if (!isError(result)) triggerDashboardRefresh("department_created");
    return handleServiceResult(res, result, 201);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerUpdateDepartmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await DepartmentService.updateDepartment(
        req.params.departmentId,
        req.body,
      ),
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerDeleteDepartmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await DepartmentService.deleteDepartment(
      req.params.departmentId,
    );
    if (!isError(result)) triggerDashboardRefresh("department_deleted");
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};

/* ═══ 13. GROUPS ═══ */
export const ownerGetAllGroupsController = async (
  req: Request,
  res: Response,
) => {
  try {
    return res.json(await GroupService.listGroups());
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerGetGroupByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const g = await GroupService.getGroupById(req.params.groupId);
    if (g == null) return res.status(404).json({ message: "Group not found" });
    return res.json(g);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerCreateGroupController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await GroupService.createGroup(req.body);
    if (!isError(result)) triggerDashboardRefresh("group_created");
    return handleServiceResult(res, result, 201);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerUpdateGroupController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await GroupService.updateGroup(req.params.groupId, req.body),
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerDeleteGroupController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await GroupService.deleteGroup(req.params.groupId);
    if (!isError(result)) triggerDashboardRefresh("group_deleted");
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerAddStudentToGroupController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await GroupService.addStudentToGroup(
      req.params.groupId,
      req.params.studentId,
    );
    if (!isError(result))
      emitToAdminLevel("group:studentAdded", {
        groupId: req.params.groupId,
        studentId: req.params.studentId,
      });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerRemoveStudentFromGroupController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await GroupService.removeStudentFromGroup(
      req.params.groupId,
      req.params.studentId,
    );
    if (!isError(result))
      emitToAdminLevel("group:studentRemoved", {
        groupId: req.params.groupId,
        studentId: req.params.studentId,
      });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerAssignInstructorToGroupController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await GroupService.assignInstructor(
      req.params.groupId,
      req.body.teacher_id,
    );
    if (!isError(result))
      emitToAdminLevel("group:instructorAssigned", {
        groupId: req.params.groupId,
        teacherId: req.body.teacher_id,
      });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};

/* ═══ 14. SESSIONS ═══ */
export const ownerGetAllSessionsController = async (
  _: Request,
  res: Response,
) => {
  try {
    return res.json(await SessionService.listSessions());
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerGetSessionByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const s = await SessionService.getSessionById(req.params.sessionId);
    if (s == null)
      return res.status(404).json({ message: "Session not found" });
    return res.json(s);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerCreateSessionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await SessionService.createSession(req.body);
    if (!isError(result))
      emitToAdminLevel("session:created", { session: result?.data ?? result });
    return handleServiceResult(res, result, 201);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerUpdateSessionController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await SessionService.updateSession(req.params.sessionId, req.body),
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerDeleteSessionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await SessionService.deleteSession(req.params.sessionId);
    if (!isError(result))
      emitToAdminLevel("session:deleted", { sessionId: req.params.sessionId });
    return handleServiceResult(res, result);
  } catch (e: any) {
    if (e.code === "P2003")
      return res.status(400).json({ message: "Cannot delete" });
    return res.status(500).json({ message: "Failed" });
  }
};

/* ═══ 15. ATTENDANCE ═══ */
export const ownerMarkAttendanceController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await AttendanceService.markAttendance(
      req.params.sessionId,
      req.body.student_id,
      req.body.status,
    );
    if (!isError(result))
      emitToAdminLevel("attendance:marked", {
        sessionId: req.params.sessionId,
        studentId: req.body.student_id,
        status: req.body.status,
      });
    return handleServiceResult(res, result, 201);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerGetAttendanceBySessionController = async (
  req: Request,
  res: Response,
) => {
  res.json(
    await AttendanceService.getAttendanceBySession(req.params.sessionId),
  );
};
export const ownerGetAttendanceByStudentController = async (
  req: Request,
  res: Response,
) => {
  res.json(
    await AttendanceService.getAttendanceByStudent(req.params.studentId),
  );
};
export const ownerUpdateAttendanceController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await AttendanceService.updateAttendance(
      req.params.attendanceId,
      req.body.status,
    );
    if (!isError(result))
      emitToAdminLevel("attendance:updated", {
        attendanceId: req.params.attendanceId,
        status: req.body.status,
      });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};

/* ═══ 16. EXAMS & RESULTS ═══ */
export const ownerGetAllExamsController = async (_: Request, res: Response) => {
  res.json(await ExamService.listExams());
};
export const ownerGetExamByIdController = async (
  req: Request,
  res: Response,
) => {
  const e = await ExamService.getExamById(req.params.examId);
  if (e == null) return res.status(404).json({ message: "Exam not found" });
  res.json(e);
};
export const ownerCreateExamController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await ExamService.createExam(req.body),
      201,
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerUpdateExamController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await ExamService.updateExam(req.params.examId, req.body),
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerDeleteExamController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await ExamService.deleteExam(req.params.examId),
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerAddExamResultsController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await ExamService.addExamResult(req.params.examId, {
        studentId: req.body.student_id,
        marks_obtained: req.body.marks_obtained,
        grade: req.body.grade,
      }),
      201,
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerGetResultsByExamController = async (
  req: Request,
  res: Response,
) => {
  res.json(await ExamService.getResultsByExam(req.params.examId));
};
export const ownerGetResultsByStudentController = async (
  req: Request,
  res: Response,
) => {
  res.json(await ExamService.getResultsByStudent(req.params.studentId));
};
export const ownerUpdateResultController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await ExamService.updateResult(req.params.resultId, req.body),
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};

/* ═══ 17. DOCUMENTS ═══ */
export const ownerGetAllDocumentsController = async (
  _: Request,
  res: Response,
) => {
  const docs = await prisma.document.findMany({
    include: {
      student: {
        select: {
          first_name: true,
          last_name: true,
          email: true,
          avatar_url: true,
        },
      },
    },
    orderBy: { uploaded_at: "desc" },
  });
  return res.json(
    docs.map((d) => {
      const ext = d.file_path.split(".").pop()?.toLowerCase();
      return {
        id: d.document_id,
        fileName: `${d.type}.${ext ?? "file"}`,
        fileUrl: d.file_path,
        fileType:
          ext === "pdf"
            ? "pdf"
            : ["jpg", "jpeg", "png", "webp"].includes(ext ?? "")
              ? "image"
              : "doc",
        uploadDate: d.uploaded_at,
        status: d.status,
        student: {
          name: `${d.student.first_name} ${d.student.last_name}`,
          email: d.student.email ?? "",
          avatar: d.student.avatar_url ?? undefined,
        },
      };
    }),
  );
};
export const ownerGetDocumentByIdController = async (
  req: Request,
  res: Response,
) => {
  const d = await prisma.document.findUnique({
    where: { document_id: req.params.documentId },
    include: {
      student: {
        select: {
          student_id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
  });
  if (d == null) return res.status(404).json({ message: "Document not found" });
  res.json(d);
};
export const ownerApproveDocumentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await DocumentService.reviewDocument(
      req.params.documentId,
      "APPROVED",
      (req as any).user?.user_id,
    );
    if (!isError(result))
      emitToAdminLevel("document:approved", {
        documentId: req.params.documentId,
      });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerRejectDocumentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await DocumentService.reviewDocument(
      req.params.documentId,
      "REJECTED",
      (req as any).user?.user_id,
    );
    if (!isError(result))
      emitToAdminLevel("document:rejected", {
        documentId: req.params.documentId,
      });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerDeleteDocumentController = async (
  req: Request,
  res: Response,
) => {
  const d = await prisma.document.findUnique({
    where: { document_id: req.params.documentId },
  });
  if (d == null) return res.status(404).json({ message: "Document not found" });
  const fp = path.join(process.cwd(), d.file_path);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
  await prisma.document.delete({
    where: { document_id: req.params.documentId },
  });
  res.json({ message: "Document deleted" });
};

/* ═══ 18. PERMISSIONS ═══ */
export const ownerCreatePermissionController = async (
  req: Request,
  res: Response,
) => {
  const { name, description } = req.body;
  if (!name?.trim())
    return res.status(400).json({ message: "Permission name required" });
  const ex = await prisma.permission.findUnique({
    where: { name: name.trim() },
  });
  if (ex) return res.status(409).json({ message: "Permission exists" });
  res.status(201).json(
    await prisma.permission.create({
      data: { name: name.trim(), description: description?.trim() || null },
    }),
  );
};
export const ownerGetAllPermissionsController = async (
  _: Request,
  res: Response,
) => {
  res.json(await prisma.permission.findMany({ orderBy: { name: "asc" } }));
};
export const ownerAssignPermissionToStudentController = async (
  req: Request,
  res: Response,
) => {
  const { studentId } = req.params;
  const { permissionId } = req.body;
  if (!permissionId)
    return res.status(400).json({ message: "permissionId required" });
  const [s, p] = await Promise.all([
    prisma.student.findUnique({ where: { student_id: studentId } }),
    prisma.permission.findUnique({ where: { permission_id: permissionId } }),
  ]);
  if (s == null) return res.status(404).json({ message: "Student not found" });
  if (p == null)
    return res.status(404).json({ message: "Permission not found" });
  const ex = await prisma.studentPermission.findUnique({
    where: {
      student_id_permission_id: {
        student_id: studentId,
        permission_id: permissionId,
      },
    },
  });
  if (ex) return res.status(409).json({ message: "Already assigned" });
  res.status(201).json(
    await prisma.studentPermission.create({
      data: { student_id: studentId, permission_id: permissionId },
    }),
  );
};
export const ownerRemovePermissionFromStudentController = async (
  req: Request,
  res: Response,
) => {
  const { studentId, permissionId } = req.params;
  const ex = await prisma.studentPermission.findUnique({
    where: {
      student_id_permission_id: {
        student_id: studentId,
        permission_id: permissionId,
      },
    },
  });
  if (ex == null) return res.status(404).json({ message: "Not found" });
  await prisma.studentPermission.delete({
    where: {
      student_id_permission_id: {
        student_id: studentId,
        permission_id: permissionId,
      },
    },
  });
  res.json({ message: "Permission removed" });
};

/* ═══ 19. ANNOUNCEMENTS ═══ */
export const ownerCreateAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await AnnouncementService.createAnnouncement({
      ...req.body,
      file: req.file,
    });
    emitToAdminLevel("announcement:published", { announcement: data });
    return res.status(201).json({ message: "Announcement created", data });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const ownerGetAllAnnouncementsController = async (
  req: Request,
  res: Response,
) => {
  try {
    return res.json(
      await AnnouncementService.listAnnouncements({
        page: Number(req.query.page) || undefined,
        limit: Number(req.query.limit) || undefined,
        category: req.query.category as string,
        is_published:
          req.query.is_published === "true"
            ? true
            : req.query.is_published === "false"
              ? false
              : undefined,
        search: req.query.search as string,
      }),
    );
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const ownerGetAnnouncementByIdController = async (
  req: Request,
  res: Response,
) => {
  const a = await AnnouncementService.getAnnouncementById(
    req.params.announcementId,
  );
  if (a == null) return res.status(404).json({ message: "Not found" });
  return res.json({ data: a });
};
export const ownerUpdateAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await AnnouncementService.updateAnnouncement(
      req.params.announcementId,
      { ...req.body, file: req.file },
    );
    if (!isError(result))
      emitToAdminLevel("announcement:published", {
        announcementId: req.params.announcementId,
        action: "updated",
      });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const ownerDeleteAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await AnnouncementService.deleteAnnouncement(
      req.params.announcementId,
    );
    if (!isError(result))
      emitToAdminLevel("announcement:deleted", {
        announcementId: req.params.announcementId,
      });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const ownerPublishAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await AnnouncementService.publishAnnouncement(
      req.params.announcementId,
    );
    if (!isError(result))
      emitToAdminLevel("announcement:published", {
        announcementId: req.params.announcementId,
      });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const ownerUnpublishAnnouncementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await AnnouncementService.unpublishAnnouncement(
      req.params.announcementId,
    );
    if (!isError(result))
      emitToAdminLevel("announcement:unpublished", {
        announcementId: req.params.announcementId,
      });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ═══ 20. COURSE PROFILES & PRICING ═══ */
export const ownerCreateOrUpdateCourseProfileController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await CourseProfileService.upsertCourseProfile({
        courseId: req.params.courseId,
        ...req.body,
        file: req.file,
      }),
    );
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const ownerGetCourseProfileController = async (
  req: Request,
  res: Response,
) => {
  const p = await CourseProfileService.getCourseProfile(req.params.courseId);
  if (p == null) return res.status(404).json({ message: "Profile not found" });
  return res.json(p);
};
export const ownerPublishCourseProfileController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await CourseProfileService.publishCourseProfile(req.params.courseId),
    );
  } catch {
    return res.status(404).json({ message: "Profile not found" });
  }
};
export const ownerUnpublishCourseProfileController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await CourseProfileService.unpublishCourseProfile(req.params.courseId),
    );
  } catch {
    return res.status(404).json({ message: "Profile not found" });
  }
};
export const ownerGetCoursePricingController = async (
  req: Request,
  res: Response,
) => {
  const p = await CourseProfileService.getCoursePricing(req.params.courseId);
  if (p == null) return res.status(404).json({ message: "Profile not found" });
  return res.json(p);
};
export const ownerAddCoursePricingController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await CourseProfileService.addCoursePricing(
        req.params.courseId,
        req.body,
      ),
      201,
    );
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const ownerUpdateCoursePricingController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await CourseProfileService.updateCoursePricing(
        req.params.pricingId,
        req.body,
      ),
    );
  } catch {
    return res.status(404).json({ message: "Pricing not found" });
  }
};
export const ownerDeleteCoursePricingController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await CourseProfileService.deleteCoursePricing(req.params.pricingId),
    );
  } catch {
    return res.status(404).json({ message: "Pricing not found" });
  }
};

/* ═══ 21. NOTIFICATIONS ═══ */
export const ownerBroadcastNotificationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await OwnerService.broadcastNotification(
      (req as any).user,
      req.body,
    );
    if (!isError(result))
      emitToAdminLevel("dashboard:refresh", {
        reason: "notification_broadcast",
      });
    return handleServiceResult(res, result, 201);
  } catch (e: any) {
    return res.status(500).json({ message: e.message || "Failed" });
  }
};
export const ownerGetAllNotificationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    return res.json(
      await NotificationService.listNotifications({
        page: Number(req.query.page) || undefined,
        limit: Number(req.query.limit) || undefined,
      }),
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerGetNotificationTargetsController = async (
  _: Request,
  res: Response,
) => {
  try {
    return res.json(await NotificationService.getNotificationTargets());
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
// ✅ الجديد — يرسل الإشعار فعلياً
export const ownerSendNotificationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const owner = (req as any).user as JwtUser;
    const resolved = await NotificationService.resolveRecipients(
      req.body.target_type,
      {
        user_ids: req.body.user_ids,
        group_id: req.body.group_id,
        course_id: req.body.course_id,
      },
    );

    if (resolved.error) {
      return res.status(400).json({ message: resolved.error });
    }
    if (!resolved.userIds || resolved.userIds.length === 0) {
      return res.status(400).json({ message: "No recipients found" });
    }

    const notification =
      await NotificationService.sendNotificationWithRecipients(
        {
          title: req.body.title,
          title_ar: req.body.title_ar,
          message: req.body.message,
          message_ar: req.body.message_ar,
          target_type: req.body.target_type,
          priority: req.body.priority,
          course_id: req.body.course_id,
          group_id: req.body.group_id,
          created_by: owner.user_id,
        },
        resolved.userIds,
      );

    emitToAdminLevel("dashboard:refresh", { reason: "notification_sent" });

    return res.status(201).json({
      message: `Notification sent to ${resolved.userIds.length} recipients`,
      notification,
      recipients_count: resolved.userIds.length,
    });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: e.message || "Failed to send notification" });
  }
};
export const ownerGetNotificationByIdController = async (
  req: Request,
  res: Response,
) => {
  const n = await NotificationService.getNotificationById(
    req.params.notificationId,
  );
  if (n == null) return res.status(404).json({ message: "Not found" });
  return res.json(n);
};
export const ownerDeleteNotificationController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await NotificationService.deleteNotification(req.params.notificationId),
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerSearchStudentsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const q = String(req.query.q || "").trim();
    const targetType = String(req.query.target_type || "").trim();

    // Use new universal search if target_type is provided
    if (
      targetType === "SPECIFIC_TEACHERS" ||
      targetType === "SPECIFIC_ADMINS"
    ) {
      return res.json(
        await NotificationService.searchUsersForNotification(q, targetType),
      );
    }

    // Default: search students (backward compatible)
    return res.json(await NotificationService.searchStudentsForNotification(q));
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};

/* ═══ 22. ROOMS ═══ */
export const ownerCreateRoomController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await RoomService.createRoom(req.body);
    if (!isError(result))
      emitToAdminLevel("room:created", { room: result?.data ?? result });
    return handleServiceResult(res, result, 201);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerGetAllRoomsController = async (
  req: Request,
  res: Response,
) => {
  try {
    return res.json(
      await RoomService.listRooms({
        include_sessions: req.query.include_sessions === "true",
        active_only: req.query.active_only === "true",
      }),
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerGetRoomByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const r = await RoomService.getRoomById(req.params.roomId);
    if (r == null) return res.status(404).json({ message: "Room not found" });
    return res.json(r);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerUpdateRoomController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await RoomService.updateRoom(req.params.roomId, req.body);
    if (!isError(result))
      emitToAdminLevel("room:updated", { roomId: req.params.roomId });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerDeleteRoomController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await RoomService.deleteRoom(req.params.roomId);
    if (!isError(result))
      emitToAdminLevel("room:deleted", { roomId: req.params.roomId });
    return handleServiceResult(res, result);
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerGetRoomScheduleController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await RoomService.getRoomSchedule(
        req.params.roomId,
        req.query.from as string,
        req.query.to as string,
      ),
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerGetRoomsScheduleOverviewController = async (
  req: Request,
  res: Response,
) => {
  try {
    return res.json(
      await RoomService.getRoomsScheduleOverview(req.query.date as string),
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerCheckRoomAvailabilityController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await RoomService.checkRoomAvailability(
        req.params.roomId,
        req.query.date as string,
        req.query.end_time as string,
      ),
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};

/* ═══ 23. ACTIVITY TRACKING ═══ */
export const ownerGetUserActivityController = async (
  req: Request,
  res: Response,
) => {
  try {
    return res.json(
      await OwnerService.getUserActivity({
        page: Number(req.query.page) || undefined,
        limit: Number(req.query.limit) || undefined,
        user_id: req.query.user_id as string,
        role: req.query.role as string,
        action: req.query.action as string,
        entity_type: req.query.entity_type as string,
        from: req.query.from as string,
        to: req.query.to as string,
      }),
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};
export const ownerGetUserActivityByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    return handleServiceResult(
      res,
      await OwnerService.getUserActivityById(req.params.userId, {
        page: Number(req.query.page) || undefined,
        limit: Number(req.query.limit) || undefined,
      }),
    );
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};

/* ═══ 24. DASHBOARD STATS & REPORTS ═══ */
export const ownerGetDashboardStatsController = async (
  _: Request,
  res: Response,
) => {
  try {
    const [
      students,
      teachers,
      courses,
      groups,
      unpaidFees,
      paidFees,
      genderStats,
      enrollmentStats,
      recentEnrollments,
      recentFees,
      totalFees,
      departments,
      rooms,
      documents,
      sessions,
      totalUsers,
      activeUsers,
      usersByRole,
    ] = await Promise.all([
      prisma.student.count({ where: { status: StudentStatus.ACTIVE } }),
      prisma.teacher.count(),
      prisma.course.count(),
      prisma.group.count(),
      prisma.fee.aggregate({
        where: { status: "UNPAID" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.fee.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.student.groupBy({ by: ["gender"], _count: { gender: true } }),
      prisma.enrollment.groupBy({
        by: ["registration_status"],
        _count: { registration_status: true },
      }),
      prisma.enrollment.findMany({
        take: 10,
        orderBy: { enrollment_date: "desc" },
        include: {
          student: {
            select: {
              student_id: true,
              first_name: true,
              last_name: true,
              email: true,
              avatar_url: true,
            },
          },
          course: {
            select: { course_id: true, course_name: true, course_code: true },
          },
          pricing: { select: { status_fr: true, price: true, currency: true } },
        },
      }),
      prisma.fee.findMany({
        take: 5,
        where: { status: "PAID" },
        orderBy: { paid_at: "desc" },
        include: { student: { select: { first_name: true, last_name: true } } },
      }),
      prisma.fee.count(),
      prisma.department.count(),
      prisma.room.count(),
      prisma.document.count(),
      prisma.session.count(),
      prisma.user.count(),
      prisma.user.count({ where: { is_active: true } }),
      prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
    ]);
    const gender = {
      Male: genderStats.find((g) => g.gender === "MALE")?._count.gender || 0,
      Female:
        genderStats.find((g) => g.gender === "FEMALE")?._count.gender || 0,
      Other: genderStats.find((g) => g.gender === "OTHER")?._count.gender || 0,
    };
    const enrollments = {
      pending:
        enrollmentStats.find((e) => e.registration_status === "PENDING")?._count
          .registration_status || 0,
      validated:
        enrollmentStats.find((e) => e.registration_status === "VALIDATED")
          ?._count.registration_status || 0,
      paid:
        enrollmentStats.find((e) => e.registration_status === "PAID")?._count
          .registration_status || 0,
      finished:
        enrollmentStats.find((e) => e.registration_status === "FINISHED")
          ?._count.registration_status || 0,
      rejected:
        enrollmentStats.find((e) => e.registration_status === "REJECTED")
          ?._count.registration_status || 0,
      total: 0,
    };
    enrollments.total =
      enrollments.pending +
      enrollments.validated +
      enrollments.paid +
      enrollments.finished +
      enrollments.rejected;
    const revenue = {
      collected: Number(paidFees._sum.amount || 0),
      pending: Number(unpaidFees._sum.amount || 0),
      total:
        Number(paidFees._sum.amount || 0) + Number(unpaidFees._sum.amount || 0),
      paidCount: paidFees._count || 0,
      unpaidCount: unpaidFees._count || 0,
      totalCount: totalFees,
    };
    res.json({
      students,
      teachers,
      courses,
      groups,
      departments,
      rooms,
      documents,
      sessions,
      unpaidFees: unpaidFees._sum.amount || 0,
      gender,
      enrollments,
      revenue,
      recentEnrollments,
      recentFees,
      system: {
        total_users: totalUsers,
        active_users: activeUsers,
        users_by_role: usersByRole.map((u) => ({
          role: u.role,
          count: u._count.role,
        })),
      },
    });
  } catch (e: any) {
    return res.status(500).json({ message: e.message || "Failed" });
  }
};
export const ownerGetStudentsReportController = async (
  _: Request,
  res: Response,
) => {
  const s = await prisma.student.findMany({
    include: {
      enrollments: {
        where: {
          registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
          group_id: { not: null },
        },
        include: { group: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
  res.json({ total: s.length, students: s });
};
export const ownerGetGroupsReportController = async (
  _: Request,
  res: Response,
) => {
  const g = await prisma.group.findMany({
    include: {
      department: true,
      _count: {
        select: {
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
          },
        },
      },
    },
  });
  res.json(
    g.map((x) => ({
      group_id: x.group_id,
      name: x.name,
      department: x.department?.name ?? null,
      total_students: x._count.enrollments,
    })),
  );
};
export const ownerGetPaymentsReportController = async (
  _: Request,
  res: Response,
) => {
  const f = await prisma.fee.findMany({ include: { student: true } });
  res.json({
    total: f.length,
    paid: f.filter((x) => x.status === "PAID").length,
    unpaid: f.filter((x) => x.status === "UNPAID").length,
    totalAmount: f.reduce((s, x) => s + Number(x.amount), 0),
    paidAmount: f
      .filter((x) => x.status === "PAID")
      .reduce((s, x) => s + Number(x.amount), 0),
  });
};
export const ownerGetAttendanceReportController = async (
  _: Request,
  res: Response,
) => {
  const a = await prisma.attendance.groupBy({
    by: ["status"],
    _count: { status: true },
  });
  res.json({
    present: a.find((x) => x.status === "PRESENT")?._count.status || 0,
    absent: a.find((x) => x.status === "ABSENT")?._count.status || 0,
  });
};
export const ownerGetEnrollmentsReportController = async (
  _: Request,
  res: Response,
) => {
  const e = await prisma.enrollment.groupBy({
    by: ["registration_status"],
    _count: { registration_status: true },
  });
  res.json({
    Pending:
      e.find((x) => x.registration_status === "PENDING")?._count
        .registration_status || 0,
    Validated:
      e.find((x) => x.registration_status === "VALIDATED")?._count
        .registration_status || 0,
    Paid:
      e.find((x) => x.registration_status === "PAID")?._count
        .registration_status || 0,
    Finished:
      e.find((x) => x.registration_status === "FINISHED")?._count
        .registration_status || 0,
    Rejected:
      e.find((x) => x.registration_status === "REJECTED")?._count
        .registration_status || 0,
  });
};

/* ═══ 25. AVATAR ═══ */
export const ownerUpdateAvatarController = async (
  req: Request,
  res: Response,
) => {
  try {
    const owner = (req as any).user as JwtUser;
    const file = req.file;
    if (!owner) return res.status(401).json({ message: "Unauthorized" });
    if (!file)
      return res.status(400).json({ message: "Avatar image is required" });
    if (!file.mimetype.startsWith("image/"))
      return res.status(400).json({ message: "Only image files" });
    const r = await uploadToCloudinary(file, `avatars/owner/${owner.user_id}`);
    const u = await prisma.user.update({
      where: { user_id: owner.user_id },
      data: { google_avatar: r.secure_url },
      select: { user_id: true, email: true, role: true, google_avatar: true },
    });
    return res.json({ message: "Avatar updated", user: u });
  } catch {
    return res.status(500).json({ message: "Failed to update avatar" });
  }
};

export const ownerCorrectFeeAmountController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { feeId } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ message: "المبلغ يجب أن يكون رقماً موجباً" });
    }

    const result = await correctFeeAmount(
      feeId,
      Number(amount),
      (req as any).user?.user_id, // ✅ fixed: was req.user?.user_id
    );

    if ("error" in result) {
      const messages: Record<string, string> = {
        not_found: "الرسم غير موجود",
        same_amount: "المبلغ الجديد مساوٍ للحالي",
        invalid_amount: "مبلغ غير صالح",
      };
      const errKey = result.error as string;
      return res.status(400).json({ message: messages[errKey] ?? errKey });
    }

    emitToAdminLevel("fee:corrected", { feeId, correction: result.correction });
    triggerDashboardRefresh("fee_corrected");

    return res.json({
      message: "تم تعديل المبلغ بنجاح",
      data: result.data,
      correction: result.correction,
    });
  } catch (err) {
    console.error("ownerCorrectFeeAmountController:", err);
    return res.status(500).json({ message: "خطأ في الخادم" });
  }
};
