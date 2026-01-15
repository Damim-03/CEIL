import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { Roles, RoleType } from "../../enums/role.enum";
import { JwtUser } from "../../middlewares/auth.middleware";
import {
  AttendanceStatus,
  FeeStatus,
  RegistrationStatus,
  StudentStatus,
} from "../../../generated/prisma/client";
import path from "path";
import fs from "fs";

/* ================= STUDENTS ================= */

export const createStudentController = async (req: Request, res: Response) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    nationality,
    language,
    education_level,
    study_location,
  } = req.body;

  if (!first_name?.trim() || !last_name?.trim() || !email) {
    return res.status(400).json({
      message: "first_name, last_name and email are required",
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "User with this email already exists",
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1️⃣ Create USER
    const user = await tx.user.create({
      data: {
        email: email.toLowerCase(),
        password: null, // or temporary password
        role: Roles.STUDENT,
      },
    });

    // 2️⃣ Create STUDENT linked to USER
    const student = await tx.student.create({
      data: {
        user_id: user.user_id, // ✅ REQUIRED
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.toLowerCase(),
        phone_number,
        nationality,
        language,
        education_level,
        study_location,
      },
    });

    // 3️⃣ Link user → student
    await tx.user.update({
      where: { user_id: user.user_id },
      data: { student_id: student.student_id },
    });

    return student;
  });

  return res.status(201).json(result);
};

export const getAllStudentsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const students = await prisma.student.findMany({
    where: { status: StudentStatus.Active },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      group: true,
      enrollments: {
        include: { course: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const total = await prisma.student.count({
    where: { status: StudentStatus.Active },
  });

  return res.json({
    data: students,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

export const getStudentByIdController = async (req: Request, res: Response) => {
  const { studentId } = req.params;

  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
    include: {
      group: true,
      enrollments: { include: { course: true } },
      attendance: true,
      fees: true,
    },
  });

  if (!student || student.status === StudentStatus.Inactive) {
    return res.status(404).json({ message: "Student not found" });
  }

  return res.json(student);
};

export const updateStudentController = async (req: Request, res: Response) => {
  const { studentId } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty" });
  }

  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // ✅ Whitelist (Security)
  const allowedFields = [
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "nationality",
    "language",
    "education_level",
    "study_location",
    "group_id",
  ];

  const data = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  const updatedStudent = await prisma.student.update({
    where: { student_id: studentId },
    data,
  });

  return res.json(updatedStudent);
};

export const deleteStudentController = async (req: Request, res: Response) => {
  const { studentId } = req.params;

  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  await prisma.student.update({
    where: { student_id: studentId },
    data: { status: StudentStatus.Inactive },
  });

  return res.json({ message: "Student deactivated successfully" });
};

/* ================= TEACHERS ================= */

export const createTeacherController = async (req: Request, res: Response) => {
  const { first_name, last_name, email, phone_number } = req.body;

  // 1️⃣ Validation
  if (!first_name?.trim() || !last_name?.trim()) {
    return res.status(400).json({
      message: "first_name and last_name are required",
    });
  }

  // 2️⃣ Prevent duplicate email
  if (email) {
    const exists = await prisma.teacher.findFirst({
      where: { email },
    });

    if (exists) {
      return res.status(409).json({
        message: "Teacher with this email already exists",
      });
    }
  }

  // 3️⃣ Create
  const teacher = await prisma.teacher.create({
    data: {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email,
      phone_number,
    },
  });

  return res.status(201).json(teacher);
};

export const getAllTeachersController = async (_: Request, res: Response) => {
  const teachers = await prisma.teacher.findMany({
    include: {
      courses: true,
    },
    orderBy: { created_at: "desc" },
  });

  return res.json(teachers);
};

export const getTeacherByIdController = async (req: Request, res: Response) => {
  const teacher = await prisma.teacher.findUnique({
    where: { teacher_id: req.params.teacherId },
    include: {
      courses: true,
      sessions: true,
      user: true,
    },
  });

  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }

  return res.json(teacher);
};

export const updateTeacherController = async (req: Request, res: Response) => {
  const { teacherId } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty" });
  }

  const teacher = await prisma.teacher.findUnique({
    where: { teacher_id: teacherId },
  });

  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }

  // ✅ Whitelist
  const allowedFields = ["first_name", "last_name", "email", "phone_number"];

  const data = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  const updatedTeacher = await prisma.teacher.update({
    where: { teacher_id: teacherId },
    data,
  });

  return res.json(updatedTeacher);
};

export const deleteTeacherController = async (req: Request, res: Response) => {
  const { teacherId } = req.params;

  const teacher = await prisma.teacher.findUnique({
    where: { teacher_id: teacherId },
    include: {
      courses: true,
      sessions: true,
    },
  });

  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }

  // ❌ Business rule
  if (teacher.courses.length > 0 || teacher.sessions.length > 0) {
    return res.status(400).json({
      message: "Cannot delete teacher assigned to courses or sessions",
    });
  }

  await prisma.teacher.delete({
    where: { teacher_id: teacherId },
  });

  return res.json({ message: "Teacher deleted successfully" });
};

/* ================= USER ROLES ================= */

export const getAllUsersController = async (_: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: { student: true, teacher: true },
  });
  res.json(users);
};

export const getUserByIdController = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { user_id: req.params.userId },
    include: { student: true, teacher: true },
  });
  res.json(user);
};

export const changeUserRoleController = async (req: Request, res: Response) => {
  const { role } = req.body as { role: RoleType };
  const admin = (req as Request & { user?: JwtUser }).user;
  const { userId } = req.params;

  if (!role || !Object.values(Roles).includes(role)) {
    return res.status(400).json({ message: "Invalid role value" });
  }

  if (admin?.user_id === userId) {
    return res.status(403).json({
      message: "You cannot change your own role",
    });
  }

  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    include: { student: true, teacher: true },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.role === role) {
    return res.json({ message: "Role already assigned", user });
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    /**
     * ➜ TEACHER
     */
    if (role === Roles.TEACHER) {
      let teacherId = user.teacher_id;

      if (!teacherId) {
        const teacher = await tx.teacher.create({
          data: {
            first_name: user.student?.first_name ?? "Teacher",
            last_name: user.student?.last_name ?? "User",
            email: user.email,
          },
        });

        teacherId = teacher.teacher_id;
      }

      return tx.user.update({
        where: { user_id: userId },
        data: {
          role: Roles.TEACHER,
          teacher_id: teacherId,
        },
      });
    }

    /**
     * ➜ STUDENT
     */
    if (role === Roles.STUDENT) {
      let studentId = user.student_id;

      if (!studentId) {
        const student = await tx.student.create({
          data: {
            user_id: user.user_id, // ✅ REQUIRED
            first_name: user.teacher?.first_name ?? "Student",
            last_name: user.teacher?.last_name ?? "User",
            email: user.email,
          },
        });

        studentId = student.student_id;
      }

      return tx.user.update({
        where: { user_id: userId },
        data: {
          role: Roles.STUDENT,
          student_id: studentId,
        },
      });
    }

    /**
     * ➜ ADMIN
     */
    if (role === Roles.ADMIN) {
      return tx.user.update({
        where: { user_id: userId },
        data: {
          role: Roles.ADMIN,
        },
      });
    }

    throw new Error("Unsupported role");
  });

  return res.json({
    message: "User role updated successfully",
    user: updatedUser,
  });
};

export const enableUserController = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await prisma.user.update({
    where: { user_id: userId },
    data: { is_active: true },
  });

  res.json({ message: "User enabled", user });
};

export const disableUserController = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await prisma.user.update({
    where: { user_id: userId },
    data: { is_active: false },
  });

  res.json({ message: "User disabled", user });
};

/* ================= COURSES ================= */

export const createCourseController = async (req: Request, res: Response) => {
  const { course_name, course_code, credits, teacher_id } = req.body;

  if (!course_name?.trim()) {
    return res.status(400).json({
      message: "course_name is required",
    });
  }

  // منع تكرار course_code
  if (course_code) {
    const exists = await prisma.course.findFirst({
      where: { course_code },
    });

    if (exists) {
      return res.status(409).json({
        message: "Course with this code already exists",
      });
    }
  }

  const course = await prisma.course.create({
    data: {
      course_name: course_name.trim(),
      course_code,
      credits,
      teacher_id,
    },
  });

  return res.status(201).json(course);
};

export const getAllCoursesController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const courses = await prisma.course.findMany({
    skip: (page - 1) * limit,
    take: limit,
    include: {
      teacher: true,
    },
    orderBy: { course_name: "asc" },
  });

  const total = await prisma.course.count();

  return res.json({
    data: courses,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

export const getCourseByIdController = async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const course = await prisma.course.findUnique({
    where: { course_id: courseId },
    include: {
      teacher: true,
      enrollments: true,
      sessions: true,
    },
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  return res.json(course);
};

export const updateCourseController = async (req: Request, res: Response) => {
  const { courseId } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty" });
  }

  const course = await prisma.course.findUnique({
    where: { course_id: courseId },
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  // ✅ Whitelist (Security)
  const allowedFields = ["course_name", "course_code", "credits", "teacher_id"];

  const data = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  const updatedCourse = await prisma.course.update({
    where: { course_id: courseId },
    data,
  });

  return res.json(updatedCourse);
};

export const deleteCourseController = async (req: Request, res: Response) => {
  await prisma.course.delete({
    where: { course_id: req.params.courseId },
  });

  return res.json({ message: "Course deleted successfully" });
};

/* ================= DEPARTMENTS ================= */

export const createDepartmentController = async (
  req: Request,
  res: Response
) => {
  const { name, description } = req.body;

  // 1️⃣ Validation
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({
      message: "Department name is required and must be at least 2 characters",
    });
  }

  // 2️⃣ Unique check (schema: name @unique)
  const exists = await prisma.department.findUnique({
    where: { name: name.trim() },
  });

  if (exists) {
    return res.status(409).json({
      message: "Department with this name already exists",
    });
  }

  // 3️⃣ Create
  const department = await prisma.department.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
    },
  });

  return res.status(201).json(department);
};

export const getAllDepartmentsController = async (
  _: Request,
  res: Response
) => {
  const departments = await prisma.department.findMany({
    orderBy: { created_at: "desc" },
    include: {
      groups: {
        select: {
          group_id: true,
          name: true,
          academic_year: true,
        },
      },
    },
  });

  return res.json(departments);
};

export const getDepartmentByIdController = async (
  req: Request,
  res: Response
) => {
  const { departmentId } = req.params;

  // 1️⃣ Validate UUID
  if (!departmentId) {
    return res.status(400).json({ message: "departmentId is required" });
  }

  const department = await prisma.department.findUnique({
    where: { department_id: departmentId },
    include: {
      groups: {
        include: {
          students: {
            select: {
              student_id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      },
    },
  });

  if (!department) {
    return res.status(404).json({
      message: "Department not found",
    });
  }

  return res.json(department);
};

export const updateDepartmentController = async (
  req: Request,
  res: Response
) => {
  const { departmentId } = req.params;
  const { name, description } = req.body;

  // 1️⃣ Check existence
  const exists = await prisma.department.findUnique({
    where: { department_id: departmentId },
  });

  if (!exists) {
    return res.status(404).json({
      message: "Department not found",
    });
  }

  // 2️⃣ Prevent duplicate name
  if (name && name !== exists.name) {
    const duplicate = await prisma.department.findUnique({
      where: { name },
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Another department with this name already exists",
      });
    }
  }

  // 3️⃣ Update safely
  const department = await prisma.department.update({
    where: { department_id: departmentId },
    data: {
      name: name?.trim(),
      description: description?.trim(),
    },
  });

  return res.json(department);
};

export const deleteDepartmentController = async (
  req: Request,
  res: Response
) => {
  const { departmentId } = req.params;

  // 1️⃣ Check existence
  const department = await prisma.department.findUnique({
    where: { department_id: departmentId },
    include: { groups: true },
  });

  if (!department) {
    return res.status(404).json({
      message: "Department not found",
    });
  }

  // 2️⃣ Business rule: prevent deleting if groups exist
  if (department.groups.length > 0) {
    return res.status(400).json({
      message:
        "Cannot delete department with existing groups. Remove groups first.",
    });
  }

  // 3️⃣ Delete
  await prisma.department.delete({
    where: { department_id: departmentId },
  });

  return res.json({
    message: "Department deleted successfully",
  });
};

/* ================= GROUPS ================= */

export const createGroupController = async (req: Request, res: Response) => {
  const { name, department_id } = req.body;

  if (!name?.trim() || !department_id) {
    return res.status(400).json({
      message: "name and department_id are required",
    });
  }

  const departmentExists = await prisma.department.findUnique({
    where: { department_id },
  });

  if (!departmentExists) {
    return res.status(400).json({
      message: "Invalid department_id",
    });
  }

  const group = await prisma.group.create({ data: req.body });
  return res.status(201).json(group);
};

export const getAllGroupsController = async (_: Request, res: Response) => {
  return res.json(
    await prisma.group.findMany({
      include: { department: true, students: true },
    })
  );
};

export const getGroupByIdController = async (req: Request, res: Response) => {
  const group = await prisma.group.findUnique({
    where: { group_id: req.params.groupId },
    include: { department: true, students: true },
  });

  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  return res.json(group);
};

export const updateGroupController = async (req: Request, res: Response) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty" });
  }

  const group = await prisma.group.update({
    where: { group_id: req.params.groupId },
    data: req.body,
  });

  return res.json(group);
};

export const deleteGroupController = async (req: Request, res: Response) => {
  await prisma.group.delete({
    where: { group_id: req.params.groupId },
  });

  return res.json({ message: "Group deleted successfully" });
};

export const addStudentToGroupController = async (
  req: Request,
  res: Response
) => {
  const { groupId, studentId } = req.params;

  // 1️⃣ تحقق من وجود Group
  const group = await prisma.group.findUnique({
    where: { group_id: groupId },
  });

  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  // 2️⃣ تحقق من وجود Student
  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // 3️⃣ منع إضافة الطالب إذا كان بالفعل في Group
  if (student.group_id === groupId) {
    return res.status(400).json({
      message: "Student already assigned to this group",
    });
  }

  // 4️⃣ إذا كان الطالب في Group آخر (اختياري حسب نظامك)
  if (student.group_id && student.group_id !== groupId) {
    return res.status(400).json({
      message: "Student already assigned to another group",
    });
  }

  // 5️⃣ ربط الطالب بالمجموعة
  const updatedStudent = await prisma.student.update({
    where: { student_id: studentId },
    data: { group_id: groupId },
  });

  return res.json({
    message: "Student added to group successfully",
    student: updatedStudent,
  });
};

export const removeStudentFromGroupController = async (
  req: Request,
  res: Response
) => {
  const { groupId, studentId } = req.params;

  // 1️⃣ تحقق من الطالب
  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // 2️⃣ تحقق أن الطالب في هذه المجموعة
  if (student.group_id !== groupId) {
    return res.status(400).json({
      message: "Student is not assigned to this group",
    });
  }

  // 3️⃣ إزالة الربط
  const updatedStudent = await prisma.student.update({
    where: { student_id: studentId },
    data: { group_id: null },
  });

  return res.json({
    message: "Student removed from group successfully",
    student: updatedStudent,
  });
};

/* ================= FEES ================= */

export const createFeeController = async (req: Request, res: Response) => {
  const { student_id, enrollment_id, amount, due_date } = req.body;

  if (!student_id || !amount || !due_date) {
    return res.status(400).json({
      message: "student_id, amount and due_date are required",
    });
  }

  const student = await prisma.student.findUnique({
    where: { student_id },
  });

  if (!student) {
    return res.status(400).json({ message: "Invalid student_id" });
  }

  // ربط اختياري مع Enrollment
  if (enrollment_id) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { enrollment_id },
    });

    if (!enrollment) {
      return res.status(400).json({ message: "Invalid enrollment_id" });
    }
  }

  const fee = await prisma.fee.create({
    data: {
      student_id,
      enrollment_id,
      amount,
      due_date: new Date(due_date),
      status: FeeStatus.Unpaid,
    },
  });

  return res.status(201).json(fee);
};

export const getAllFeesController = async (_: Request, res: Response) => {
  const fees = await prisma.fee.findMany({
    include: {
      student: true,
      enrollment: true,
    },
    orderBy: { due_date: "asc" },
  });

  res.json(fees);
};

export const getFeeByIdController = async (req: Request, res: Response) => {
  const fee = await prisma.fee.findUnique({
    where: { fee_id: req.params.feeId },
    include: {
      student: true,
      enrollment: true,
    },
  });

  if (!fee) {
    return res.status(404).json({ message: "Fee not found" });
  }

  return res.json(fee);
};

export const updateFeeController = async (req: Request, res: Response) => {
  const { feeId } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty" });
  }

  const fee = await prisma.fee.findUnique({
    where: { fee_id: feeId },
  });

  if (!fee) {
    return res.status(404).json({ message: "Fee not found" });
  }

  // ❌ لا تعدّل Fee مدفوعة
  if (fee.status === FeeStatus.Paid) {
    return res.status(400).json({
      message: "Paid fee cannot be modified",
    });
  }

  // ✅ Whitelist
  const allowedFields = ["amount", "due_date"];

  const data = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  const updatedFee = await prisma.fee.update({
    where: { fee_id: feeId },
    data,
  });

  return res.json(updatedFee);
};

export const markFeeAsPaidController = async (req: Request, res: Response) => {
  const admin = (req as Request & { user?: JwtUser }).user;
  const { feeId } = req.params;

  const fee = await prisma.fee.findUnique({
    where: { fee_id: feeId },
  });

  if (!fee) {
    return res.status(404).json({ message: "Fee not found" });
  }

  if (fee.status === FeeStatus.Paid) {
    return res.status(400).json({
      message: "Fee already paid",
    });
  }

  const updatedFee = await prisma.fee.update({
    where: { fee_id: feeId },
    data: {
      status: FeeStatus.Paid,
      paid_at: new Date(),
      payment_method: "Cash", // أو من req.body
      reference_code: `PAY-${Date.now()}`,
    },
  });

  res.json(updatedFee);
};

export const deleteFeeController = async (req: Request, res: Response) => {
  const fee = await prisma.fee.findUnique({
    where: { fee_id: req.params.feeId },
  });

  if (!fee) {
    return res.status(404).json({ message: "Fee not found" });
  }

  // ❌ لا تحذف Fee مدفوعة
  if (fee.status === FeeStatus.Paid) {
    return res.status(400).json({
      message: "Paid fee cannot be deleted",
    });
  }

  await prisma.fee.delete({
    where: { fee_id: req.params.feeId },
  });

  return res.json({ message: "Fee deleted successfully" });
};

/* ======================================================
   Documents
====================================================== */

export const getAllDocumentsController = async (_: Request, res: Response) => {
  const documents = await prisma.document.findMany({
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
    orderBy: { uploaded_at: "desc" },
  });

  res.json(documents);
};

export const getDocumentByIdController = async (
  req: Request,
  res: Response
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

  /**
   * 🗑️ حذف الملف من التخزين (local أو cloud)
   */
  const filePath = path.join(process.cwd(), document.file_path);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  /**
   * 🗑️ حذف السجل من DB
   */
  await prisma.document.delete({
    where: { document_id: documentId },
  });

  res.json({ message: "Document deleted successfully" });
};

/* ======================================================
   ENROLLMENTS
====================================================== */

export const getAllEnrollmentsController = async (
  _: Request,
  res: Response
) => {
  const enrollments = await prisma.enrollment.findMany({
    include: {
      student: true,
      course: true,
      fees: true,
    },
    orderBy: { enrollment_date: "desc" },
  });

  res.json(enrollments);
};

export const getEnrollmentByIdController = async (
  req: Request,
  res: Response
) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { enrollment_id: req.params.enrollmentId },
    include: {
      student: true,
      course: true,
      fees: true,
      history: true,
    },
  });

  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  res.json(enrollment);
};

export const validateEnrollmentController = async (
  req: Request,
  res: Response
) => {
  const admin = (req as Request & { user?: JwtUser }).user;
  const { enrollmentId } = req.params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { enrollment_id: enrollmentId },
  });

  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  if (enrollment.registration_status !== RegistrationStatus.Pending) {
    return res.status(400).json({
      message: "Only pending enrollments can be validated",
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.registrationHistory.create({
      data: {
        enrollment_id: enrollmentId,
        old_status: enrollment.registration_status,
        new_status: RegistrationStatus.Validated,
        changed_by: admin?.user_id,
      },
    });

    return tx.enrollment.update({
      where: { enrollment_id: enrollmentId },
      data: { registration_status: RegistrationStatus.Validated },
    });
  });

  res.json(updated);
};

export const rejectEnrollmentController = async (
  req: Request,
  res: Response
) => {
  const admin = (req as Request & { user?: JwtUser }).user;
  const { enrollmentId } = req.params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { enrollment_id: enrollmentId },
  });

  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  if (enrollment.registration_status !== RegistrationStatus.Pending) {
    return res.status(400).json({
      message: "Only pending enrollments can be rejected",
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.registrationHistory.create({
      data: {
        enrollment_id: enrollmentId,
        old_status: enrollment.registration_status,
        new_status: RegistrationStatus.Rejected,
        changed_by: admin?.user_id,
      },
    });

    return tx.enrollment.update({
      where: { enrollment_id: enrollmentId },
      data: { registration_status: RegistrationStatus.Rejected },
    });
  });

  res.json(updated);
};

export const markEnrollmentPaidController = async (
  req: Request,
  res: Response
) => {
  const admin = (req as Request & { user?: JwtUser }).user;
  const { enrollmentId } = req.params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { enrollment_id: enrollmentId },
  });

  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  if (enrollment.registration_status !== RegistrationStatus.Validated) {
    return res.status(400).json({
      message: "Enrollment must be validated before payment",
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.registrationHistory.create({
      data: {
        enrollment_id: enrollmentId,
        old_status: enrollment.registration_status,
        new_status: RegistrationStatus.Paid,
        changed_by: admin?.user_id,
      },
    });

    return tx.enrollment.update({
      where: { enrollment_id: enrollmentId },
      data: { registration_status: RegistrationStatus.Paid },
    });
  });

  res.json(updated);
};

export const finishEnrollmentController = async (
  req: Request,
  res: Response
) => {
  const admin = (req as Request & { user?: JwtUser }).user;
  const { enrollmentId } = req.params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { enrollment_id: enrollmentId },
  });

  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  if (enrollment.registration_status !== RegistrationStatus.Paid) {
    return res.status(400).json({
      message: "Only paid enrollments can be finished",
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.registrationHistory.create({
      data: {
        enrollment_id: enrollmentId,
        old_status: enrollment.registration_status,
        new_status: RegistrationStatus.Finished,
        changed_by: admin?.user_id,
      },
    });

    return tx.enrollment.update({
      where: { enrollment_id: enrollmentId },
      data: { registration_status: RegistrationStatus.Finished },
    });
  });

  res.json(updated);
};

/* ======================================================
   SESSIONS
====================================================== */

export const createSessionController = async (req: Request, res: Response) => {
  const { course_id, teacher_id, group_id, session_date, topic } = req.body;

  // 1️⃣ Validation
  if (!course_id || !teacher_id || !group_id || !session_date) {
    return res.status(400).json({
      message: "course_id, teacher_id, group_id and session_date are required",
    });
  }

  // 2️⃣ Check relations
  const [course, teacher, group] = await Promise.all([
    prisma.course.findUnique({ where: { course_id } }),
    prisma.teacher.findUnique({ where: { teacher_id } }),
    prisma.group.findUnique({ where: { group_id } }),
  ]);

  if (!course || !teacher || !group) {
    return res.status(400).json({
      message: "Invalid course, teacher or group",
    });
  }

  // 3️⃣ Prevent schedule conflict (teacher)
  const conflict = await prisma.session.findFirst({
    where: {
      teacher_id,
      session_date: new Date(session_date),
    },
  });

  if (conflict) {
    return res.status(400).json({
      message: "Teacher already has a session at this time",
    });
  }

  const session = await prisma.session.create({
    data: {
      course_id,
      teacher_id,
      group_id,
      session_date: new Date(session_date),
      topic,
    },
  });

  res.status(201).json(session);
};

export const getAllSessionsController = async (
  _req: Request,
  res: Response
) => {
  const sessions = await prisma.session.findMany({
    include: {
      course: true,
      teacher: true,
      group: true,
    },
    orderBy: { session_date: "desc" },
  });

  res.json(sessions);
};

export const getSessionByIdController = async (req: Request, res: Response) => {
  const session = await prisma.session.findUnique({
    where: { session_id: req.params.sessionId },
    include: {
      attendance: { include: { student: true } },
      course: true,
      teacher: true,
      group: true,
    },
  });

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  res.json(session);
};

export const updateSessionController = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty" });
  }

  const allowedFields = ["session_date", "topic"];

  const data = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  const session = await prisma.session.update({
    where: { session_id: sessionId },
    data,
  });

  res.json(session);
};

export const deleteSessionController = async (req: Request, res: Response) => {
  const session = await prisma.session.findUnique({
    where: { session_id: req.params.sessionId },
    include: { attendance: true },
  });

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  if (session.attendance.length > 0) {
    return res.status(400).json({
      message: "Cannot delete session with attendance records",
    });
  }

  await prisma.session.delete({
    where: { session_id: req.params.sessionId },
  });

  res.json({ message: "Session deleted successfully" });
};

/* ======================================================
   ATTENDANCE
====================================================== */

export const markAttendanceController = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { studentId, status } = req.body;

  if (!studentId || !status) {
    return res.status(400).json({
      message: "studentId and status are required",
    });
  }

  if (!Object.values(AttendanceStatus).includes(status)) {
    return res.status(400).json({
      message: "Invalid attendance status",
    });
  }

  const session = await prisma.session.findUnique({
    where: { session_id: sessionId },
  });

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // ✅ تحقق أن الطالب ينتمي لنفس Group
  if (student.group_id !== session.group_id) {
    return res.status(400).json({
      message: "Student does not belong to this session group",
    });
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      session_id_student_id: {
        session_id: sessionId,
        student_id: studentId,
      },
    },
    update: { status },
    create: {
      session_id: sessionId,
      student_id: studentId,
      status,
    },
  });

  res.status(201).json(attendance);
};

export const getAttendanceBySessionController = async (
  req: Request,
  res: Response
) => {
  const attendance = await prisma.attendance.findMany({
    where: { session_id: req.params.sessionId },
    include: { student: true },
    orderBy: { student: { first_name: "asc" } },
  });

  res.json(attendance);
};

export const getAttendanceByStudentController = async (
  req: Request,
  res: Response
) => {
  const attendance = await prisma.attendance.findMany({
    where: { student_id: req.params.studentId },
    include: { session: true },
    orderBy: { session: { session_date: "desc" } },
  });

  res.json(attendance);
};

export const updateAttendanceController = async (
  req: Request,
  res: Response
) => {
  const { attendanceId } = req.params;

  if (!req.body.status) {
    return res.status(400).json({
      message: "status is required",
    });
  }

  if (!Object.values(AttendanceStatus).includes(req.body.status)) {
    return res.status(400).json({
      message: "Invalid attendance status",
    });
  }

  const attendance = await prisma.attendance.update({
    where: { attendance_id: attendanceId },
    data: {
      status: req.body.status,
    },
  });

  res.json(attendance);
};

/* ======================================================
   EXAMS
====================================================== */

export const createExamController = async (req: Request, res: Response) => {
  const { course_id, exam_name, exam_date, max_marks } = req.body;

  if (!course_id || !exam_date || !max_marks) {
    return res.status(400).json({
      message: "course_id, exam_date and max_marks are required",
    });
  }

  if (max_marks <= 0) {
    return res.status(400).json({
      message: "max_marks must be greater than 0",
    });
  }

  const course = await prisma.course.findUnique({
    where: { course_id },
  });

  if (!course) {
    return res.status(400).json({ message: "Invalid course_id" });
  }

  const exam = await prisma.exam.create({
    data: {
      course_id,
      exam_name,
      exam_date: new Date(exam_date),
      max_marks,
    },
  });

  res.status(201).json(exam);
};

export const getAllExamsController = async (_: Request, res: Response) => {
  const exams = await prisma.exam.findMany({
    include: { course: true },
    orderBy: { exam_date: "desc" },
  });

  res.json(exams);
};

export const getExamByIdController = async (req: Request, res: Response) => {
  const exam = await prisma.exam.findUnique({
    where: { exam_id: req.params.examId },
    include: {
      course: true,
      results: { include: { student: true } },
    },
  });

  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  res.json(exam);
};

export const updateExamController = async (req: Request, res: Response) => {
  const { examId } = req.params;

  const exam = await prisma.exam.findUnique({
    where: { exam_id: examId },
    include: { results: true },
  });

  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  if (exam.results.length > 0) {
    return res.status(400).json({
      message: "Cannot update exam after results are added",
    });
  }

  const allowedFields = ["exam_name", "exam_date", "max_marks"];

  const data = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  const updated = await prisma.exam.update({
    where: { exam_id: examId },
    data,
  });

  res.json(updated);
};

export const deleteExamController = async (req: Request, res: Response) => {
  const exam = await prisma.exam.findUnique({
    where: { exam_id: req.params.examId },
    include: { results: true },
  });

  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  if (exam.results.length > 0) {
    return res.status(400).json({
      message: "Cannot delete exam with existing results",
    });
  }

  await prisma.exam.delete({
    where: { exam_id: req.params.examId },
  });

  res.json({ message: "Exam deleted successfully" });
};

/* ======================================================
   RESULTS
====================================================== */

export const addExamResultsController = async (req: Request, res: Response) => {
  const { examId } = req.params;
  const { studentId, marks_obtained, grade } = req.body;

  if (!studentId || marks_obtained == null) {
    return res.status(400).json({
      message: "studentId and marks_obtained are required",
    });
  }

  const exam = await prisma.exam.findUnique({
    where: { exam_id: examId },
  });

  if (!exam) {
    return res.status(404).json({ message: "Exam not found" });
  }

  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // ✅ تحقق أن الطالب مسجل في الكورس
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      student_id_course_id: {
        student_id: studentId,
        course_id: exam.course_id,
      },
    },
  });

  if (!enrollment) {
    return res.status(400).json({
      message: "Student is not enrolled in this course",
    });
  }

  if (marks_obtained < 0 || marks_obtained > exam.max_marks) {
    return res.status(400).json({
      message: `Marks must be between 0 and ${exam.max_marks}`,
    });
  }

  const result = await prisma.result.upsert({
    where: {
      exam_id_student_id: {
        exam_id: examId,
        student_id: studentId,
      },
    },
    update: { marks_obtained, grade },
    create: {
      exam_id: examId,
      student_id: studentId,
      marks_obtained,
      grade,
    },
  });

  res.status(201).json(result);
};

export const getResultsByExamController = async (
  req: Request,
  res: Response
) => {
  const results = await prisma.result.findMany({
    where: { exam_id: req.params.examId },
    include: { student: true },
  });
  res.json(results);
};

export const getResultsByStudentController = async (
  req: Request,
  res: Response
) => {
  const results = await prisma.result.findMany({
    where: { student_id: req.params.studentId },
    include: { exam: true },
  });
  res.json(results);
};

export const updateResultController = async (req: Request, res: Response) => {
  const { resultId } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty" });
  }

  const allowedFields = ["marks_obtained", "grade"];

  const data = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  const result = await prisma.result.update({
    where: { result_id: resultId },
    data,
  });

  res.json(result);
};

/* ======================================================
   PERMISSIONS
====================================================== */

export const createPermissionController = async (
  req: Request,
  res: Response
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
  res: Response
) => {
  const permissions = await prisma.permission.findMany({
    orderBy: { name: "asc" },
  });

  res.json(permissions);
};

export const assignPermissionToStudentController = async (
  req: Request,
  res: Response
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

  // منع التكرار
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
  res: Response
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

/* ======================================================
   DASHBOARD
====================================================== */

export const getAdminDashboardStatsController = async (
  _: Request,
  res: Response
) => {
  const [students, teachers, courses, unpaidFees, genderStats] =
    await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.course.count(),
      prisma.fee.aggregate({
        where: { status: "Unpaid" },
        _sum: { amount: true },
      }),
      prisma.student.groupBy({
        by: ["gender"],
        _count: {
          gender: true,
        },
      }),
    ]);

  const gender = {
    Male: genderStats.find((g) => g.gender === "Male")?._count.gender || 0,
    Female: genderStats.find((g) => g.gender === "Female")?._count.gender || 0,
    Other: genderStats.find((g) => g.gender === "Other")?._count.gender || 0,
  };

  res.json({
    students,
    teachers,
    courses,
    unpaidFees: unpaidFees._sum.amount || 0,
    gender,
  });
};

export const getStudentsReportController = async (
  _: Request,
  res: Response
) => {
  const students = await prisma.student.findMany({
    include: {
      group: true,
      enrollments: true,
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
      students: true,
    },
  });

  const data = groups.map((g) => ({
    group_id: g.group_id,
    name: g.name,
    department: g.department.name,
    total_students: g.students.length,
  }));

  res.json(data);
};

export const getPaymentsReportController = async (
  _: Request,
  res: Response
) => {
  const fees = await prisma.fee.findMany({
    include: { student: true },
  });

  const summary = {
    total: fees.length,
    paid: fees.filter((f) => f.status === "Paid").length,
    unpaid: fees.filter((f) => f.status === "Unpaid").length,
    totalAmount: fees.reduce((sum, f) => sum + Number(f.amount), 0),
    paidAmount: fees
      .filter((f) => f.status === "Paid")
      .reduce((sum, f) => sum + Number(f.amount), 0),
  };

  res.json(summary);
};

export const getAttendanceReportController = async (
  _: Request,
  res: Response
) => {
  const attendance = await prisma.attendance.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const data = {
    present: attendance.find((a) => a.status === "Present")?._count.status || 0,
    absent: attendance.find((a) => a.status === "Absent")?._count.status || 0,
  };

  res.json(data);
};

export const getEnrollmentsReportController = async (
  _: Request,
  res: Response
) => {
  const enrollments = await prisma.enrollment.groupBy({
    by: ["registration_status"],
    _count: { registration_status: true },
  });

  const data = {
    Pending:
      enrollments.find((e) => e.registration_status === "Pending")?._count
        .registration_status || 0,
    Validated:
      enrollments.find((e) => e.registration_status === "Validated")?._count
        .registration_status || 0,
    Paid:
      enrollments.find((e) => e.registration_status === "Paid")?._count
        .registration_status || 0,
    Finished:
      enrollments.find((e) => e.registration_status === "Finished")?._count
        .registration_status || 0,
    Rejected:
      enrollments.find((e) => e.registration_status === "Rejected")?._count
        .registration_status || 0,
  };

  res.json(data);
};
