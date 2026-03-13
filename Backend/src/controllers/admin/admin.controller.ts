// ================================================================
// 📌 src/controllers/admin/admin.controller.ts
// ✅ Refactored: Uses Services for shared logic + Socket.IO
// ================================================================

import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { JwtUser } from "../../middlewares/auth.middleware";
import { FeeStatus, StudentStatus } from "../../../generated/prisma/client";
import path from "path";
import fs from "fs";
import { uploadToCloudinary } from "../../middlewares/uploadToCloudinary";

// 📦 Services
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
import * as SocketService from "../../services/socket.service";
import * as NotificationService from "../../services/admin/Notification.service";
import { emitToAdminLevel, emitToUser } from "../../services/socket.service";

/* ═══ STUDENTS — Using StudentService ✅ ═══ */

export const createStudentController = async (req: Request, res: Response) => {
  const result = await StudentService.createStudent(req.body);
  if ("error" in result) {
    if (result.error === "validation")
      return res
        .status(400)
        .json({ message: "first_name, last_name and email are required" });
    if (result.error === "duplicate_email")
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
  }
  return res.status(201).json(result.data);
};

export const getAllStudentsController = async (req: Request, res: Response) => {
  const result = await StudentService.listStudents({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  return res.json(result);
};

export const getStudentByIdController = async (req: Request, res: Response) => {
  const student = await StudentService.getStudentById(req.params.studentId);
  if (!student) return res.status(404).json({ message: "Student not found" });
  return res.json(student);
};

export const updateStudentController = async (req: Request, res: Response) => {
  const result = await StudentService.updateStudent(
    req.params.studentId,
    req.body,
  );
  if ("error" in result) {
    if (result.error === "empty_body")
      return res.status(400).json({ message: "Request body is empty" });
    if (result.error === "not_found")
      return res.status(404).json({ message: "Student not found" });
  }
  return res.json(result.data);
};

export const deleteStudentController = async (req: Request, res: Response) => {
  const result = await StudentService.deleteStudent(req.params.studentId);
  if ("error" in result)
    return res.status(404).json({ message: "Student not found" });
  return res.json({ message: "Student deactivated successfully" });
};

/* ═══ TEACHERS — Using TeacherService ✅ ═══ */

export const createTeacherController = async (req: Request, res: Response) => {
  const result = await TeacherService.createTeacher(req.body);
  if ("error" in result) {
    if (result.error === "validation")
      return res
        .status(400)
        .json({ message: "first_name, last_name and email are required" });
    if (result.error === "duplicate_email")
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
  }
  return res.status(201).json(result.data);
};

export const getAllTeachersController = async (_: Request, res: Response) => {
  return res.json(await TeacherService.listTeachers());
};

export const getTeacherByIdController = async (req: Request, res: Response) => {
  const teacher = await TeacherService.getTeacherById(req.params.teacherId);
  if (!teacher) return res.status(404).json({ message: "Teacher not found" });
  return res.json(teacher);
};

export const updateTeacherController = async (req: Request, res: Response) => {
  const result = await TeacherService.updateTeacher(
    req.params.teacherId,
    req.body,
  );
  if ("error" in result) {
    if (result.error === "empty_body")
      return res.status(400).json({ message: "Request body is empty" });
    if (result.error === "not_found")
      return res.status(404).json({ message: "Teacher not found" });
  }
  return res.json(result.data);
};

export const deleteTeacherController = async (req: Request, res: Response) => {
  const result = await TeacherService.deleteTeacher(req.params.teacherId);
  if ("error" in result) {
    if (result.error === "not_found")
      return res.status(404).json({ message: "Teacher not found" });
    if (result.error === "has_dependencies")
      return res.status(400).json({
        message: "Cannot delete teacher assigned to groups or sessions",
      });
  }
  return res.json({ message: "Teacher deleted successfully" });
};

/* ═══ USER ROLES ✅ (inline — admin-specific) ═══ */

export const getAllUsersController = async (_: Request, res: Response) => {
  res.json(
    await prisma.user.findMany({ include: { student: true, teacher: true } }),
  );
};

export const getUserByIdController = async (req: Request, res: Response) => {
  res.json(
    await prisma.user.findUnique({
      where: { user_id: req.params.userId },
      include: { student: true, teacher: true },
    }),
  );
};

export const enableUserController = async (req: Request, res: Response) => {
  const { emitToAdminLevel } = await import("../../services/socket.service.js");
  const user = await prisma.user.update({
    where: { user_id: req.params.userId },
    data: { is_active: true },
  });
  emitToAdminLevel("user:enabled", { user_id: req.params.userId });
  res.json({ message: "User enabled", user });
};

export const disableUserController = async (req: Request, res: Response) => {
  const { emitToAdminLevel, emitToUser } =
    await import("../../services/socket.service.js");
  const user = await prisma.user.update({
    where: { user_id: req.params.userId },
    data: { is_active: false },
  });
  emitToUser(req.params.userId, "user:disabled", {
    user_id: req.params.userId,
  });
  emitToAdminLevel("user:disabled", { user_id: req.params.userId });
  res.json({ message: "User disabled", user });
};

/* ═══ COURSES — Using CourseService ✅ ═══ */

// ================================================================
// 📌 PATCH — استبدل دوال الـ courses في admin_controller.ts بهذه
// أضف هذا الـ import في أعلى الملف إن لم يكن موجوداً:
//   import * as SocketService from "../../services/socket.service";
// ================================================================

export const createCourseController = async (req: Request, res: Response) => {
  const result = await CourseService.createCourse(req.body);

  if ("error" in result) {
    if (result.error === "validation")
      return res.status(400).json({ message: "course_name is required" });
    if (result.error === "duplicate_code")
      return res
        .status(409)
        .json({ message: "Course with this code already exists" });
  }

  // ✅ Realtime — إشعار لكل الأدمن بإنشاء دورة جديدة
  SocketService.emitToAdminLevel("course:created", {
    course: result.data,
  });

  return res.status(201).json(result.data);
};

export const getAllCoursesController = async (req: Request, res: Response) => {
  return res.json(
    await CourseService.listCourses({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    }),
  );
};

export const getCourseByIdController = async (req: Request, res: Response) => {
  const course = await CourseService.getCourseById(req.params.courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });
  return res.json(course);
};

export const updateCourseController = async (req: Request, res: Response) => {
  const result = await CourseService.updateCourse(
    req.params.courseId,
    req.body,
  );

  if ("error" in result) {
    if (result.error === "empty_body")
      return res.status(400).json({ message: "Request body is empty" });
    if (result.error === "not_found")
      return res.status(404).json({ message: "Course not found" });
    if (result.error === "invalid_course_type")
      // ✅ جديد
      return res
        .status(400)
        .json({ message: "Invalid course_type. Use NORMAL or INTENSIVE" });
    if (result.error === "invalid_session_duration")
      // ✅ جديد
      return res
        .status(400)
        .json({ message: "session_duration must be a positive number" });
  }

  // ✅ Realtime — إشعار بتحديث الدورة
  SocketService.emitToAdminLevel("course:updated", {
    course_id: req.params.courseId,
    changes: req.body,
    course: result.data,
  });

  return res.json(result.data);
};

export const deleteCourseController = async (req: Request, res: Response) => {
  await CourseService.deleteCourse(req.params.courseId);

  // ✅ Realtime — إشعار بحذف الدورة
  SocketService.emitToAdminLevel("course:deleted", {
    course_id: req.params.courseId,
  });

  return res.json({ message: "Course deleted successfully" });
};

/* ═══ DEPARTMENTS — Using DepartmentService ✅ ═══ */

export const createDepartmentController = async (
  req: Request,
  res: Response,
) => {
  const result = await DepartmentService.createDepartment(req.body);
  if ("error" in result) {
    if (result.error === "validation")
      return res.status(400).json({
        message:
          "Department name is required and must be at least 2 characters",
      });
    if (result.error === "duplicate_name")
      return res
        .status(409)
        .json({ message: "Department with this name already exists" });
  }
  return res.status(201).json(result.data);
};

export const getAllDepartmentsController = async (
  _: Request,
  res: Response,
) => {
  return res.json(await DepartmentService.listDepartments());
};

export const getDepartmentByIdController = async (
  req: Request,
  res: Response,
) => {
  const dept = await DepartmentService.getDepartmentById(
    req.params.departmentId,
  );
  if (!dept) return res.status(404).json({ message: "Department not found" });
  return res.json(dept);
};

export const updateDepartmentController = async (
  req: Request,
  res: Response,
) => {
  const result = await DepartmentService.updateDepartment(
    req.params.departmentId,
    req.body,
  );
  if ("error" in result) {
    if (result.error === "not_found")
      return res.status(404).json({ message: "Department not found" });
    if (result.error === "duplicate_name")
      return res
        .status(409)
        .json({ message: "Another department with this name already exists" });
  }
  return res.json(result.data);
};

export const deleteDepartmentController = async (
  req: Request,
  res: Response,
) => {
  const result = await DepartmentService.deleteDepartment(
    req.params.departmentId,
  );
  if ("error" in result) {
    if (result.error === "not_found")
      return res.status(404).json({ message: "Department not found" });
    if (result.error === "has_groups")
      return res.status(400).json({
        message:
          "Cannot delete department with existing groups. Remove groups first.",
      });
  }
  return res.json({ message: "Department deleted successfully" });
};

/* ═══ GROUPS — Using GroupService ✅ ═══ */

export const createGroupController = async (req: Request, res: Response) => {
  const result = await GroupService.createGroup(req.body);
  if ("error" in result) {
    if (result.error === "validation")
      return res
        .status(400)
        .json({ message: "name, course_id and level are required" });
    if (result.error === "invalid_level")
      return res.status(400).json({ message: "Invalid level value" });
    if (result.error === "invalid_department")
      return res.status(400).json({ message: "Invalid department_id" });
    if (result.error === "invalid_course")
      return res.status(400).json({ message: "Invalid course_id" });
    if (result.error === "invalid_teacher")
      return res.status(400).json({ message: "Invalid teacher_id" });
  }
  return res.status(201).json(result.data);
};

export const getAllGroupsController = async (_: Request, res: Response) => {
  return res.json(await GroupService.listGroups());
};

export const getGroupByIdController = async (req: Request, res: Response) => {
  const group = await GroupService.getGroupById(req.params.groupId);
  if (!group) return res.status(404).json({ message: "Group not found" });
  return res.json(group);
};

export const updateGroupController = async (req: Request, res: Response) => {
  const result = await GroupService.updateGroup(req.params.groupId, req.body);
  if ("error" in result)
    return res.status(400).json({ message: "Request body is empty" });
  return res.json(result.data);
};

export const deleteGroupController = async (req: Request, res: Response) => {
  await GroupService.deleteGroup(req.params.groupId);
  return res.json({ message: "Group deleted successfully" });
};

export const addStudentToGroupController = async (
  req: Request,
  res: Response,
) => {
  const result = await GroupService.addStudentToGroup(
    req.params.groupId,
    req.params.studentId,
  );
  if ("error" in result) {
    if (result.error === "group_not_found")
      return res.status(404).json({ message: "Group not found" });
    if (result.error === "group_full")
      return res.status(400).json({ message: "Group is full" });
    if (result.error === "student_not_found")
      return res.status(404).json({ message: "Student not found" });
    if (result.error === "not_enrolled")
      return res
        .status(400)
        .json({ message: "Student must be enrolled in this course first" });
    if (result.error === "already_in_group")
      return res.status(400).json({
        message: "Student already assigned to a group for this course",
      });
  }
  return res.json({ message: "Student added successfully" });
};

export const assignInstructorToGroupController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await GroupService.assignInstructor(
      req.params.groupId,
      req.body.teacher_id,
    );
    if ("error" in result) {
      if (result.error === "group_not_found")
        return res
          .status(404)
          .json({ success: false, message: "Group not found" });
      if (result.error === "teacher_not_found")
        return res
          .status(404)
          .json({ success: false, message: "Teacher not found" });
    }
    return res.json({
      success: true,
      message: req.body.teacher_id
        ? "Instructor assigned successfully"
        : "Instructor removed successfully",
      data: result.data,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to assign instructor" });
  }
};

export const removeStudentFromGroupController = async (
  req: Request,
  res: Response,
) => {
  const result = await GroupService.removeStudentFromGroup(
    req.params.groupId,
    req.params.studentId,
  );
  if ("error" in result)
    return res
      .status(400)
      .json({ message: "Student is not assigned to this group" });
  return res.json({ message: "Student removed from group successfully" });
};

/* ═══ FEES — Using FeeService ✅ ═══ */

export const getAllFeesController = async (req: Request, res: Response) => {
  res.json(
    await FeeService.listFees({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 50,
      excludePaid: true,
    }),
  );
};

export const getFeeByIdController = async (req: Request, res: Response) => {
  const fee = await FeeService.getFeeById(req.params.feeId);
  if (!fee) return res.status(404).json({ message: "Fee not found" });
  return res.json(fee);
};

export const updateFeeController = async (req: Request, res: Response) => {
  const admin = (req as Request & { user?: JwtUser }).user;
  const result = await FeeService.updateFee(
    req.params.feeId,
    req.body,
    admin?.user_id,
  );
  if ("error" in result) {
    if (result.error === "empty_body")
      return res.status(400).json({ message: "Request body is empty" });
    if (result.error === "not_found")
      return res.status(404).json({ message: "Fee not found" });
    if (result.error === "already_paid")
      return res.status(400).json({ message: "Paid fee cannot be modified" });
  }
  return res.json(result.data);
};

export const markFeeAsPaidController = async (req: Request, res: Response) => {
  const admin = (req as Request & { user?: JwtUser }).user;
  try {
    const result = await FeeService.markFeeAsPaid(req.params.feeId, {
      payment_method: req.body.payment_method,
      reference_code: req.body.reference_code,
      adminUserId: admin?.user_id,
    });
    if ("error" in result) {
      if (result.error === "not_found")
        return res.status(404).json({ message: "Fee not found" });
      if (result.error === "already_paid")
        return res.status(400).json({ message: "Fee already paid" });
    }
    return res.json({
      message: result.data!.enrollment
        ? "Fee paid & enrollment advanced to PAID status"
        : "Fee marked as paid",
      fee: result.data!.fee,
      enrollment: result.data!.enrollment,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to mark fee as paid" });
  }
};

/* ═══ ENROLLMENTS — Using EnrollmentService ✅ ═══ */

export const getAllEnrollmentsController = async (
  _: Request,
  res: Response,
) => {
  res.json(await EnrollmentService.listEnrollments());
};

export const getEnrollmentByIdController = async (
  req: Request,
  res: Response,
) => {
  const enrollment = await EnrollmentService.getEnrollmentById(
    req.params.enrollmentId,
  );
  if (!enrollment)
    return res.status(404).json({ message: "Enrollment not found" });
  res.json(enrollment);
};

export const validateEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const admin = (req as Request & { user?: JwtUser }).user;
    const result = await EnrollmentService.validateEnrollment(
      req.params.enrollmentId,
      { pricing_id_override: req.body.pricing_id, changedBy: admin?.user_id },
    );
    if ("error" in result) {
      if (result.error === "not_found")
        return res.status(404).json({ message: "Enrollment not found" });
      if (result.error === "not_pending")
        return res
          .status(400)
          .json({ message: "Only pending enrollments can be validated" });
      if (result.error === "invalid_pricing")
        return res.status(400).json({ message: "Invalid pricing_id." });
      if (result.error === "invalid_amount")
        return res.status(400).json({ message: "Invalid pricing amount." });
      if (result.error === "no_pricing")
        return res.status(400).json({
          message: "This course has no pricing configured.",
          details: (result as any).details,
        });
    }
    return res.json({
      message:
        result.feeAmount! > 0
          ? "Enrollment validated. Fee created."
          : "Enrollment validated (no fee required).",
      enrollment: result.data!.enrollment,
      fee: result.data!.fee,
      pricing_used: result.pricing_used,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to validate enrollment" });
  }
};

export const rejectEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const admin = (req as Request & { user?: JwtUser }).user;
    const result = await EnrollmentService.rejectEnrollment(
      req.params.enrollmentId,
      req.body.reason,
      admin?.user_id,
    );
    if ("error" in result) {
      if (result.error === "reason_required")
        return res
          .status(400)
          .json({ message: "Rejection reason is required" });
      if (result.error === "not_found")
        return res.status(404).json({ message: "Enrollment not found" });
      if (result.error === "not_pending")
        return res
          .status(400)
          .json({ message: "Only pending enrollments can be rejected" });
    }
    return res.json({
      success: true,
      message: "Enrollment rejected and deleted successfully",
      rejection_reason: result.data!.reason,
      student: result.data!.student,
      course: result.data!.course,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to reject enrollment" });
  }
};

export const markEnrollmentPaidController = async (
  req: Request,
  res: Response,
) => {
  const admin = (req as Request & { user?: JwtUser }).user;
  const result = await EnrollmentService.markEnrollmentPaid(
    req.params.enrollmentId,
    admin?.user_id,
  );
  if ("error" in result) {
    if (result.error === "not_found")
      return res.status(404).json({ message: "Enrollment not found" });
    if (result.error === "not_validated")
      return res
        .status(400)
        .json({ message: "Enrollment must be validated before payment" });
  }
  res.json(result.data);
};

export const finishEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  const admin = (req as Request & { user?: JwtUser }).user;
  const result = await EnrollmentService.finishEnrollment(
    req.params.enrollmentId,
    admin?.user_id,
  );
  if ("error" in result) {
    if (result.error === "not_found")
      return res.status(404).json({ message: "Enrollment not found" });
    if (result.error === "not_paid")
      return res
        .status(400)
        .json({ message: "Only paid enrollments can be finished" });
  }
  res.json(result.data);
};

export const deleteEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const admin = (req as Request & { user?: JwtUser }).user;

    const enrollment = await prisma.enrollment.findUnique({
      where: { enrollment_id: req.params.enrollmentId },
      include: {
        student: true,
        course: true,
        fees: true,
      },
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // حذف cascade: fees أولاً ثم التسجيل
    await prisma.$transaction([
      prisma.fee.deleteMany({
        where: { enrollment_id: req.params.enrollmentId },
      }),
      prisma.enrollment.delete({
        where: { enrollment_id: req.params.enrollmentId },
      }),
    ]);

    // Socket event
    emitToAdminLevel("enrollment:deleted", {
      enrollment_id: req.params.enrollmentId,
      student_id: enrollment.student_id,
      deleted_by: admin?.user_id,
    });

    return res.json({
      message: "Enrollment deleted successfully",
      deleted: {
        enrollment_id: req.params.enrollmentId,
        student:
          `${enrollment.student?.first_name ?? ""} ${enrollment.student?.last_name ?? ""}`.trim(),
        course: enrollment.course?.course_name ?? "",
        status: enrollment.registration_status,
        fees_deleted: enrollment.fees.length,
      },
    });
  } catch (error: any) {
    console.error("deleteEnrollment error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to delete enrollment" });
  }
};

/* ═══ SESSIONS — Using SessionService ✅ ═══ */

export const createSessionController = async (req: Request, res: Response) => {
  try {
    const result = await SessionService.createSession(req.body);
    if ("error" in result) {
      if (result.error === "validation")
        return res
          .status(400)
          .json({ message: "group_id and session_date are required" });
      if (result.error === "invalid_group")
        return res.status(400).json({ message: "Invalid group_id" });
      if (result.error === "invalid_end_time")
        return res
          .status(400)
          .json({ message: "وقت الانتهاء يجب أن يكون بعد وقت البداية" });
      if (result.error === "room_not_found")
        return res.status(400).json({ message: "القاعة غير موجودة" });
      if (result.error === "room_inactive")
        return res.status(400).json({ message: "القاعة معطّلة" });
      if (result.error === "room_conflict")
        return res.status(409).json({
          message: "القاعة محجوزة في هذا الوقت",
          conflicts: (result as any).conflicts,
        });
    }
    res.status(201).json(result.data);
  } catch (error) {
    return res.status(500).json({ message: "حدث خطأ أثناء إنشاء الحصة" });
  }
};

export const getAllSessionsController = async (_: Request, res: Response) => {
  res.json(await SessionService.listSessions());
};

export const getSessionByIdController = async (req: Request, res: Response) => {
  const session = await SessionService.getSessionById(req.params.sessionId);
  if (!session) return res.status(404).json({ message: "Session not found" });
  res.json(session);
};

// ✅ الجديد — يرجع enriched object مع students
export const getSessionAttendanceController = async (
  req: Request,
  res: Response,
) => {
  const result = await AttendanceService.getAttendanceBySession(
    req.params.sessionId,
  );
  if (!result) return res.status(404).json({ message: "Session not found" });
  res.json(result);
};

export const updateSessionController = async (req: Request, res: Response) => {
  try {
    const result = await SessionService.updateSession(
      req.params.sessionId,
      req.body,
    );
    if ("error" in result) {
      if (result.error === "not_found")
        return res.status(404).json({ message: "الحصة غير موجودة" });
      if (result.error === "invalid_end_time")
        return res
          .status(400)
          .json({ message: "وقت الانتهاء يجب أن يكون بعد وقت البداية" });
      if (result.error === "room_not_found")
        return res.status(400).json({ message: "القاعة غير موجودة" });
      if (result.error === "room_inactive")
        return res.status(400).json({ message: "القاعة معطّلة" });
      if (result.error === "room_conflict")
        return res.status(409).json({
          message: "القاعة محجوزة في هذا الوقت",
          conflicts: (result as any).conflicts,
        });
    }
    return res.json(result.data);
  } catch (error) {
    return res.status(500).json({ message: "حدث خطأ أثناء تحديث الحصة" });
  }
};

export const deleteSessionController = async (req: Request, res: Response) => {
  try {
    const result = await SessionService.deleteSession(req.params.sessionId);
    if ("error" in result) {
      if (result.error === "has_attendance")
        return res.status(400).json({
          success: false,
          message: "Cannot delete session with attendance records",
        });
      if (result.error === "not_found")
        return res
          .status(404)
          .json({ success: false, message: "Session not found" });
    }
    return res.json({ success: true, message: "Session deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2003")
      return res.status(400).json({
        success: false,
        message: "Cannot delete session due to related data",
      });
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete session" });
  }
};

/* ═══ ATTENDANCE — Using AttendanceService ✅ ═══ */

export const markAttendanceController = async (req: Request, res: Response) => {
  const result = await AttendanceService.markAttendance(
    req.params.sessionId,
    req.body.student_id,
    req.body.status,
  );
  if ("error" in result) {
    if (result.error === "validation")
      return res
        .status(400)
        .json({ message: "student_id and status are required" });
    if (result.error === "invalid_status")
      return res.status(400).json({ message: "Invalid attendance status" });
    if (result.error === "session_not_found")
      return res.status(404).json({ message: "Session not found" });
    if (result.error === "student_not_found")
      return res.status(404).json({ message: "Student not found" });
    if (result.error === "not_enrolled")
      return res
        .status(400)
        .json({ message: "Student is not enrolled in this session's group" });
  }
  res.status(201).json(result.data);
};

export const getAttendanceBySessionController = async (
  req: Request,
  res: Response,
) => {
  res.json(
    await AttendanceService.getAttendanceBySession(req.params.sessionId),
  );
};
export const getAttendanceByStudentController = async (
  req: Request,
  res: Response,
) => {
  res.json(
    await AttendanceService.getAttendanceByStudent(req.params.studentId),
  );
};

export const updateAttendanceController = async (
  req: Request,
  res: Response,
) => {
  const result = await AttendanceService.updateAttendance(
    req.params.attendanceId,
    req.body.status,
  );
  if ("error" in result) {
    if (result.error === "validation")
      return res.status(400).json({ message: "status is required" });
    if (result.error === "invalid_status")
      return res.status(400).json({ message: "Invalid attendance status" });
  }
  res.json(result.data);
};

/* ═══ EXAMS — Using ExamService ✅ ═══ */

export const createExamController = async (req: Request, res: Response) => {
  const result = await ExamService.createExam(req.body);
  if ("error" in result) {
    if (result.error === "validation")
      return res
        .status(400)
        .json({ message: "course_id, exam_date and max_marks are required" });
    if (result.error === "invalid_marks")
      return res
        .status(400)
        .json({ message: "max_marks must be greater than 0" });
    if (result.error === "invalid_course")
      return res.status(400).json({ message: "Invalid course_id" });
  }
  res.status(201).json(result.data);
};

export const getAllExamsController = async (_: Request, res: Response) => {
  res.json(await ExamService.listExams());
};

export const getExamByIdController = async (req: Request, res: Response) => {
  const exam = await ExamService.getExamById(req.params.examId);
  if (!exam) return res.status(404).json({ message: "Exam not found" });
  res.json(exam);
};

export const updateExamController = async (req: Request, res: Response) => {
  const result = await ExamService.updateExam(req.params.examId, req.body);
  if ("error" in result) {
    if (result.error === "not_found")
      return res.status(404).json({ message: "Exam not found" });
    if (result.error === "has_results")
      return res
        .status(400)
        .json({ message: "Cannot update exam after results are added" });
  }
  res.json(result.data);
};

export const deleteExamController = async (req: Request, res: Response) => {
  const result = await ExamService.deleteExam(req.params.examId);
  if ("error" in result) {
    if (result.error === "not_found")
      return res.status(404).json({ message: "Exam not found" });
    if (result.error === "has_results")
      return res
        .status(400)
        .json({ message: "Cannot delete exam with existing results" });
  }
  res.json({ message: "Exam deleted successfully" });
};

/* ═══ RESULTS — Using ExamService ✅ ═══ */

export const addExamResultsController = async (req: Request, res: Response) => {
  const result = await ExamService.addExamResult(req.params.examId, req.body);
  if ("error" in result) {
    if (result.error === "validation")
      return res
        .status(400)
        .json({ message: "studentId and marks_obtained are required" });
    if (result.error === "exam_not_found")
      return res.status(404).json({ message: "Exam not found" });
    if (result.error === "student_not_found")
      return res.status(404).json({ message: "Student not found" });
    if (result.error === "not_enrolled")
      return res
        .status(400)
        .json({ message: "Student is not enrolled in this course" });
    if (result.error === "marks_out_of_range")
      return res.status(400).json({
        message: `Marks must be between 0 and ${(result as any).max}`,
      });
  }
  res.status(201).json(result.data);
};

export const getResultsByExamController = async (
  req: Request,
  res: Response,
) => {
  res.json(await ExamService.getResultsByExam(req.params.examId));
};
export const getResultsByStudentController = async (
  req: Request,
  res: Response,
) => {
  res.json(await ExamService.getResultsByStudent(req.params.studentId));
};

export const updateResultController = async (req: Request, res: Response) => {
  const result = await ExamService.updateResult(req.params.resultId, req.body);
  if ("error" in result)
    return res.status(400).json({ message: "Request body is empty" });
  res.json(result.data);
};
/* ================= DOCUMENTS - PART 2 ================= */

export const getAllDocumentsController = async (
  req: Request,
  res: Response,
) => {
  const documents = await prisma.document.findMany({
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

  const mapped = documents.map((doc) => {
    const fileExtension = doc.file_path.split(".").pop()?.toLowerCase();

    const fileType =
      fileExtension === "pdf"
        ? "pdf"
        : ["jpg", "jpeg", "png", "webp"].includes(fileExtension ?? "")
          ? "image"
          : "doc";

    return {
      id: doc.document_id,
      fileName: `${doc.type}.${fileExtension ?? "file"}`,
      fileUrl: doc.file_path,
      fileType,
      uploadDate: doc.uploaded_at,
      status: doc.status,
      student: {
        name: `${doc.student.first_name} ${doc.student.last_name}`,
        email: doc.student.email ?? "",
        avatar: doc.student.avatar_url ?? undefined,
      },
    };
  });

  return res.json(mapped);
};

export const approveDocumentController = async (
  req: Request,
  res: Response,
) => {
  const admin = (req as Request & { user?: JwtUser }).user;
  const { documentId } = req.params;

  const document = await prisma.document.findUnique({
    where: { document_id: documentId },
    include: {
      student: true,
    },
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  if (document.status === "APPROVED") {
    return res.status(400).json({
      message: "Document already approved",
    });
  }

  const updatedDocument = await prisma.document.update({
    where: { document_id: documentId },
    data: {
      status: "APPROVED",
      reviewed_at: new Date(),
      reviewed_by: admin?.user_id,
    },
  });

  // 🔌 Socket
  emitToAdminLevel("document:approved", {
    document_id: documentId,
    student_id: document.student_id,
  });
  const docApprUser = await prisma.user.findFirst({
    where: { student_id: document.student_id },
    select: { user_id: true },
  });
  if (docApprUser) {
    emitToUser(docApprUser.user_id, "document:approved", {
      document_id: documentId,
      student_id: document.student_id,
    });
  }

  return res.json({
    message: "Document approved successfully",
    document: updatedDocument,
  });
};

export const rejectDocumentController = async (req: Request, res: Response) => {
  const admin = (req as Request & { user?: JwtUser }).user;
  const { documentId } = req.params;
  const { reason } = req.body;

  // ✅ السبب مطلوب
  if (!reason?.trim()) {
    return res.status(400).json({ message: "Rejection reason is required" });
  }

  const document = await prisma.document.findUnique({
    where: { document_id: documentId },
    include: { student: true },
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  const fileName = document.file_path?.split("/").pop() ?? "الوثيقة";

  // ✅ يحفظ rejection_reason
  const updatedDocument = await prisma.document.update({
    where: { document_id: documentId },
    data: {
      status: "REJECTED",
      reviewed_at: new Date(),
      reviewed_by: admin?.user_id,
      rejection_reason: reason.trim(),
    },
  });

  // 🔌 Socket
  emitToAdminLevel("document:rejected", {
    document_id: documentId,
    student_id: document.student_id,
  });

  const studentUser = await prisma.user.findFirst({
    where: { student_id: document.student_id },
    select: { user_id: true },
  });

  if (studentUser) {
    emitToUser(studentUser.user_id, "document:rejected", {
      document_id: documentId,
      student_id: document.student_id,
      rejection_reason: reason.trim(),
    });

    // 📢 Notification في DB — يصل حتى لو كان offline ويحتوي على السبب
    try {
      await NotificationService.sendNotificationWithRecipients(
        {
          title: "Document Rejected ❌",
          title_ar: `تم رفض وثيقتك ❌`,
          message: `Your document "${fileName}" was rejected.\nReason: ${reason.trim()}\nPlease upload a new document.`,
          message_ar: `تم رفض وثيقتك "${fileName}".\nالسبب: ${reason.trim()}\nيرجى رفع وثيقة جديدة.`,
          target_type: "SPECIFIC_STUDENTS",
          priority: "HIGH",
          created_by: admin?.user_id,
        },
        [studentUser.user_id],
      );
    } catch (notifErr) {
      console.warn("⚠️ Reject notification failed:", notifErr);
    }
  }

  return res.json({
    message: "Document rejected successfully",
    document: updatedDocument,
  });
};

export const getDocumentByIdController = async (
  req: Request,
  res: Response,
) => {
  const { documentId } = req.params;

  const document = await prisma.document.findUnique({
    where: { document_id: documentId },
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

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  res.json(document);
};

export const deleteDocumentController = async (req: Request, res: Response) => {
  const { documentId } = req.params;

  const document = await prisma.document.findUnique({
    where: { document_id: documentId },
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  const filePath = path.join(process.cwd(), document.file_path);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await prisma.document.delete({
    where: { document_id: documentId },
  });

  res.json({ message: "Document deleted successfully" });
};
/* ================= PERMISSIONS ================= */

export const createPermissionController = async (
  req: Request,
  res: Response,
) => {
  const { name, description } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({
      message: "Permission name is required",
    });
  }

  const exists = await prisma.permission.findUnique({
    where: { name: name.trim() },
  });

  if (exists) {
    return res.status(409).json({
      message: "Permission already exists",
    });
  }

  const permission = await prisma.permission.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
    },
  });

  res.status(201).json(permission);
};

export const getAllPermissionsController = async (
  _req: Request,
  res: Response,
) => {
  const permissions = await prisma.permission.findMany({
    orderBy: { name: "asc" },
  });

  res.json(permissions);
};

export const assignPermissionToStudentController = async (
  req: Request,
  res: Response,
) => {
  const { studentId } = req.params;
  const { permissionId } = req.body;

  if (!permissionId) {
    return res.status(400).json({
      message: "permissionId is required",
    });
  }

  const [student, permission] = await Promise.all([
    prisma.student.findUnique({ where: { student_id: studentId } }),
    prisma.permission.findUnique({ where: { permission_id: permissionId } }),
  ]);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  if (!permission) {
    return res.status(404).json({ message: "Permission not found" });
  }

  const exists = await prisma.studentPermission.findUnique({
    where: {
      student_id_permission_id: {
        student_id: studentId,
        permission_id: permissionId,
      },
    },
  });

  if (exists) {
    return res.status(409).json({
      message: "Permission already assigned to this student",
    });
  }

  const assignment = await prisma.studentPermission.create({
    data: {
      student_id: studentId,
      permission_id: permissionId,
    },
  });

  res.status(201).json(assignment);
};

export const removePermissionFromStudentController = async (
  req: Request,
  res: Response,
) => {
  const { studentId, permissionId } = req.params;

  const exists = await prisma.studentPermission.findUnique({
    where: {
      student_id_permission_id: {
        student_id: studentId,
        permission_id: permissionId,
      },
    },
  });

  if (!exists) {
    return res.status(404).json({
      message: "Permission assignment not found",
    });
  }

  await prisma.studentPermission.delete({
    where: {
      student_id_permission_id: {
        student_id: studentId,
        permission_id: permissionId,
      },
    },
  });

  res.json({ message: "Permission removed successfully" });
};

/* ================= DASHBOARD ================= */

export const getAdminDashboardStatsController = async (
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
      prisma.student.groupBy({
        by: ["gender"],
        _count: { gender: true },
      }),
      // ✅ Enrollment breakdown by status
      prisma.enrollment.groupBy({
        by: ["registration_status"],
        _count: { registration_status: true },
      }),
      // ✅ Recent enrollments (last 10)
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
            select: {
              course_id: true,
              course_name: true,
              course_code: true,
            },
          },
          pricing: {
            select: {
              status_fr: true,
              price: true,
              currency: true,
            },
          },
        },
      }),
      // ✅ Recent fees (last 5 paid)
      prisma.fee.findMany({
        take: 5,
        where: { status: "PAID" },
        orderBy: { paid_at: "desc" },
        include: {
          student: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      }),
      // ✅ Total fees count
      prisma.fee.count(),
    ]);

    const gender = {
      Male: genderStats.find((g) => g.gender === "MALE")?._count.gender || 0,
      Female:
        genderStats.find((g) => g.gender === "FEMALE")?._count.gender || 0,
      Other: genderStats.find((g) => g.gender === "OTHER")?._count.gender || 0,
    };

    // ✅ Enrollment stats breakdown
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
      total: 0,
    };
    enrollments.total =
      enrollments.pending +
      enrollments.validated +
      enrollments.paid +
      enrollments.finished;

    // ✅ Revenue stats
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
      unpaidFees: unpaidFees._sum.amount || 0,
      gender,
      // ✅ New fields
      enrollments,
      revenue,
      recentEnrollments,
      recentFees,
    });
  } catch (error: any) {
    console.error("❌ Dashboard stats error:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch dashboard stats",
    });
  }
};

export const getStudentsReportController = async (
  _: Request,
  res: Response,
) => {
  const students = await prisma.student.findMany({
    include: {
      // ✅ FIXED: Get groups via enrollments
      enrollments: {
        where: {
          registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
          group_id: { not: null },
        },
        include: {
          group: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  res.json({
    total: students.length,
    students,
  });
};

export const getGroupsReportController = async (_: Request, res: Response) => {
  const groups = await prisma.group.findMany({
    include: {
      department: true,
      // ✅ FIXED: Count students via enrollments
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

  const data = groups.map((g) => ({
    group_id: g.group_id,
    name: g.name,
    department: g.department?.name ?? null,
    total_students: g._count.enrollments,
  }));

  res.json(data);
};

export const getPaymentsReportController = async (
  _: Request,
  res: Response,
) => {
  const fees = await prisma.fee.findMany({
    include: { student: true },
  });

  const summary = {
    total: fees.length,
    paid: fees.filter((f) => f.status === "PAID").length,
    unpaid: fees.filter((f) => f.status === "UNPAID").length,
    totalAmount: fees.reduce((sum, f) => sum + Number(f.amount), 0),
    paidAmount: fees
      .filter((f) => f.status === "PAID")
      .reduce((sum, f) => sum + Number(f.amount), 0),
  };

  res.json(summary);
};

export const getAttendanceReportController = async (
  _: Request,
  res: Response,
) => {
  const attendance = await prisma.attendance.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const data = {
    present: attendance.find((a) => a.status === "PRESENT")?._count.status || 0,
    absent: attendance.find((a) => a.status === "ABSENT")?._count.status || 0,
  };

  res.json(data);
};

export const getEnrollmentsReportController = async (
  _: Request,
  res: Response,
) => {
  const enrollments = await prisma.enrollment.groupBy({
    by: ["registration_status"],
    _count: { registration_status: true },
  });

  const data = {
    Pending:
      enrollments.find((e) => e.registration_status === "PENDING")?._count
        .registration_status || 0,
    Validated:
      enrollments.find((e) => e.registration_status === "VALIDATED")?._count
        .registration_status || 0,
    Paid:
      enrollments.find((e) => e.registration_status === "PAID")?._count
        .registration_status || 0,
    Finished:
      enrollments.find((e) => e.registration_status === "FINISHED")?._count
        .registration_status || 0,
    Rejected:
      enrollments.find((e) => e.registration_status === "REJECTED")?._count
        .registration_status || 0,
  };

  res.json(data);
};

/* ================= AVATAR UPDATES ================= */

export const updateStudentAvatarController = async (
  req: Request,
  res: Response,
) => {
  const { studentId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "Avatar image is required" });
  }

  if (!file.mimetype.startsWith("image/")) {
    return res.status(400).json({ message: "Only image files are allowed" });
  }

  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
    include: { user: true },
  });

  if (!student || !student.user) {
    return res.status(404).json({ message: "Student or user not found" });
  }

  const uploadResult = await uploadToCloudinary(
    file,
    `avatars/${student.user.user_id}`,
  );

  await prisma.user.update({
    where: { user_id: student.user.user_id },
    data: {
      google_avatar: uploadResult.secure_url,
    },
  });

  return res.json({
    message: "Avatar updated successfully",
    avatar: uploadResult.secure_url,
  });
};

export const updateAdminAvatarController = async (
  req: Request,
  res: Response,
) => {
  try {
    const admin = (req as Request & { user?: JwtUser }).user;
    const file = req.file;

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (admin.role !== "ADMIN" && admin.role !== "OWNER") {
      return res.status(403).json({
        message: "Only admin or owner can update this profile",
      });
    }

    if (!file) {
      return res.status(400).json({ message: "Avatar image is required" });
    }

    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        message: "Only image files are allowed",
      });
    }

    if (!file.buffer) {
      return res.status(400).json({
        message: "Invalid file upload (buffer missing)",
      });
    }

    const uploadResult = await uploadToCloudinary(
      file,
      `avatars/admins/${admin.user_id}`,
    );

    const updatedAdmin = await prisma.user.update({
      where: { user_id: admin.user_id },
      data: {
        google_avatar: uploadResult.secure_url,
      },
      select: {
        user_id: true,
        email: true,
        role: true,
        google_avatar: true,
      },
    });

    return res.json({
      message: "Admin avatar updated successfully",
      user: updatedAdmin,
    });
  } catch (error) {
    console.error("Update admin avatar error:", error);
    return res.status(500).json({
      message: "Failed to update admin avatar",
    });
  }
};

export const markBulkAttendanceController = async (
  req: Request,
  res: Response,
) => {
  const { sessionId } = req.params;
  const { entries } = req.body;

  if (!entries || !Array.isArray(entries)) {
    return res.status(400).json({ message: "entries array is required" });
  }

  const result = await AttendanceService.markBulkAttendance(sessionId, entries);

  if ("error" in result) {
    if (result.error === "empty_entries")
      return res.status(400).json({ message: "No entries provided" });
    if (result.error === "invalid_status")
      return res.status(400).json({
        message: "Invalid attendance status",
        student_id: (result as any).student_id,
      });
    if (result.error === "session_not_found")
      return res.status(404).json({ message: "Session not found" });
    if (result.error === "some_not_enrolled")
      return res.status(400).json({
        message: "Some students are not enrolled in this group",
        student_ids: (result as any).student_ids,
      });
  }

  return res.json(result.data);
};

export const getAttendanceByDateController = async (
  req: Request,
  res: Response,
) => {
  const { groupId, date } = req.params;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res
      .status(400)
      .json({ message: "Invalid date format. Use YYYY-MM-DD" });
  }

  const result = await AttendanceService.getAttendanceByDate(groupId, date);
  return res.json(result);
};

export const getStudentAttendanceSummaryController = async (
  req: Request,
  res: Response,
) => {
  const { studentId } = req.params;
  const groupId = req.query.group_id as string | undefined;

  const result = await AttendanceService.getStudentAttendanceSummary(
    studentId,
    groupId,
  );
  return res.json(result);
};
