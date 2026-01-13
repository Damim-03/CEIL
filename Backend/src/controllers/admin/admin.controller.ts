import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { Roles, RoleType } from "../../enums/role.enum";
import { JwtUser } from "../../middlewares/auth.middleware";

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

  if (!first_name?.trim() || !last_name?.trim()) {
    return res.status(400).json({
      message: "first_name and last_name are required",
    });
  }

  if (email) {
    const exists = await prisma.student.findFirst({ where: { email } });
    if (exists) {
      return res.status(409).json({
        message: "Student with this email already exists",
      });
    }
  }

  const student = await prisma.student.create({
    data: {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email,
      phone_number,
      nationality,
      language,
      education_level,
      study_location,
    },
  });

  return res.status(201).json(student);
};

export const getAllStudentsController = async (_: Request, res: Response) => {
  return res.json(
    await prisma.student.findMany({
      include: {
        group: true,
        enrollments: { include: { course: true } },
      },
    })
  );
};

export const getStudentByIdController = async (req: Request, res: Response) => {
  const student = await prisma.student.findUnique({
    where: { student_id: req.params.studentId },
    include: {
      group: true,
      enrollments: true,
      attendance: true,
      fees: true,
    },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  return res.json(student);
};

export const updateStudentController = async (req: Request, res: Response) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty" });
  }

  const exists = await prisma.student.findUnique({
    where: { student_id: req.params.studentId },
  });

  if (!exists) {
    return res.status(404).json({ message: "Student not found" });
  }

  const student = await prisma.student.update({
    where: { student_id: req.params.studentId },
    data: req.body,
  });

  return res.json(student);
};

export const deleteStudentController = async (req: Request, res: Response) => {
  await prisma.student.delete({
    where: { student_id: req.params.studentId },
  });

  return res.json({ message: "Student deleted successfully" });
};

/* ================= TEACHERS ================= */

export const createTeacherController = async (req: Request, res: Response) => {
  if (!req.body.first_name || !req.body.last_name) {
    return res.status(400).json({
      message: "first_name and last_name are required",
    });
  }

  const teacher = await prisma.teacher.create({ data: req.body });
  return res.status(201).json(teacher);
};

export const getAllTeachersController = async (_: Request, res: Response) => {
  return res.json(await prisma.teacher.findMany());
};

export const getTeacherByIdController = async (req: Request, res: Response) => {
  const teacher = await prisma.teacher.findUnique({
    where: { teacher_id: req.params.teacherId },
  });

  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }

  return res.json(teacher);
};

export const updateTeacherController = async (req: Request, res: Response) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty" });
  }

  const teacher = await prisma.teacher.update({
    where: { teacher_id: req.params.teacherId },
    data: req.body,
  });

  return res.json(teacher);
};

export const deleteTeacherController = async (req: Request, res: Response) => {
  await prisma.teacher.delete({
    where: { teacher_id: req.params.teacherId },
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

  // 1️⃣ تحقق من الدور
  if (!role || !Object.values(Roles).includes(role)) {
    return res.status(400).json({ message: "Invalid role value" });
  }

  // 2️⃣ منع تغيير دور النفس
  if (admin?.user_id === userId) {
    return res.status(403).json({
      message: "You cannot change your own role",
    });
  }

  // 3️⃣ جلب المستخدم مع العلاقات
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    include: {
      student: true,
      teacher: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // 4️⃣ إذا لم يتغير الدور
  if (user.role === role) {
    return res.json({
      message: "Role is already set",
      user,
    });
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    /**
     * =============================
     * STUDENT ➜ TEACHER
     * =============================
     */
    if (role === Roles.TEACHER) {
      // حذف الطالب إن وُجد
      if (user.student_id) {
        await tx.student.delete({
          where: { student_id: user.student_id },
        });
      }

      // إنشاء Teacher
      const teacher = await tx.teacher.create({
        data: {
          first_name: user.student?.first_name ?? "Teacher",
          last_name: user.student?.last_name ?? "User",
          email: user.email,
        },
      });

      return await tx.user.update({
        where: { user_id: userId },
        data: {
          role: Roles.TEACHER,
          teacher_id: teacher.teacher_id,
          student_id: null,
        },
      });
    }

    /**
     * =============================
     * TEACHER ➜ STUDENT
     * =============================
     */
    if (role === Roles.STUDENT) {
      // حذف الأستاذ إن وُجد
      if (user.teacher_id) {
        await tx.teacher.delete({
          where: { teacher_id: user.teacher_id },
        });
      }

      // إنشاء Student جديد
      const student = await tx.student.create({
        data: {
          first_name: user.teacher?.first_name ?? "Student",
          last_name: user.teacher?.last_name ?? "User",
          email: user.email,
        },
      });

      return await tx.user.update({
        where: { user_id: userId },
        data: {
          role: Roles.STUDENT,
          student_id: student.student_id,
          teacher_id: null,
        },
      });
    }

    /**
     * =============================
     * TEACHER ➜ ADMIN
     * =============================
     */
    if (user.teacher_id && role === Roles.ADMIN) {
      await tx.teacher.delete({
        where: { teacher_id: user.teacher_id },
      });
    }

    /**
     * =============================
     * أي تغيير آخر
     * =============================
     */
    return await tx.user.update({
      where: { user_id: userId },
      data: {
        role,
        teacher_id: role === Roles.ADMIN ? null : user.teacher_id,
      },
    });
  });

  return res.json({
    message: "User role updated successfully",
    user: updatedUser,
  });
};

export const enableUserController = async (req: Request, res: Response) => {
  const user = await prisma.user.update({
    where: { user_id: req.params.userId },
    data: { is_active: true },
  });

  res.json({
    message: "User enabled successfully",
    data: user,
  });
};

export const disableUserController = async (req: Request, res: Response) => {
  const user = await prisma.user.update({
    where: { user_id: req.params.userId },
    data: { is_active: false },
  });

  res.json({
    message: "User disabled successfully",
    data: user,
  });
};

/* ================= COURSES ================= */

export const createCourseController = async (req: Request, res: Response) => {
  if (!req.body.course_name?.trim()) {
    return res.status(400).json({
      message: "course_name is required",
    });
  }

  const course = await prisma.course.create({ data: req.body });
  return res.status(201).json(course);
};

export const getAllCoursesController = async (_: Request, res: Response) => {
  return res.json(await prisma.course.findMany({ include: { teacher: true } }));
};

export const getCourseByIdController = async (req: Request, res: Response) => {
  const course = await prisma.course.findUnique({
    where: { course_id: req.params.courseId },
    include: { teacher: true },
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  return res.json(course);
};

export const updateCourseController = async (req: Request, res: Response) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty" });
  }

  const course = await prisma.course.update({
    where: { course_id: req.params.courseId },
    data: req.body,
  });

  return res.json(course);
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

/* ================= FEES ================= */

export const createFeeController = async (req: Request, res: Response) => {
  const { student_id, amount, due_date } = req.body;

  if (!student_id || !amount || !due_date) {
    return res.status(400).json({
      message: "student_id, amount and due_date are required",
    });
  }

  const studentExists = await prisma.student.findUnique({
    where: { student_id },
  });

  if (!studentExists) {
    return res.status(400).json({
      message: "Invalid student_id",
    });
  }

  const fee = await prisma.fee.create({ data: req.body });
  return res.status(201).json(fee);
};

export const getAllFeesController = async (_: Request, res: Response) => {
  return res.json(await prisma.fee.findMany({ include: { student: true } }));
};

export const getFeeByIdController = async (req: Request, res: Response) => {
  const fee = await prisma.fee.findUnique({
    where: { fee_id: req.params.feeId },
    include: { student: true },
  });

  if (!fee) {
    return res.status(404).json({ message: "Fee not found" });
  }

  return res.json(fee);
};

export const updateFeeController = async (req: Request, res: Response) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty" });
  }

  const fee = await prisma.fee.update({
    where: { fee_id: req.params.feeId },
    data: req.body,
  });

  return res.json(fee);
};

export const deleteFeeController = async (req: Request, res: Response) => {
  await prisma.fee.delete({
    where: { fee_id: req.params.feeId },
  });

  return res.json({ message: "Fee deleted successfully" });
};

export const markFeeAsPaidController = async (req: Request, res: Response) => {
  res.json(
    await prisma.fee.update({
      where: { fee_id: req.params.feeId },
      data: { status: "Paid" },
    })
  );
};

/* ======================================================
   ENROLLMENTS
====================================================== */

export const createEnrollmentController = async (
  req: Request,
  res: Response
) => {
  res.status(201).json(await prisma.enrollment.create({ data: req.body }));
};

export const getAllEnrollmentsController = async (
  _: Request,
  res: Response
) => {
  res.json(
    await prisma.enrollment.findMany({
      include: { student: true, course: true },
    })
  );
};

export const getEnrollmentsByStudentController = async (
  req: Request,
  res: Response
) => {
  res.json(
    await prisma.enrollment.findMany({
      where: { student_id: req.params.studentId },
    })
  );
};

export const updateEnrollmentController = async (
  req: Request,
  res: Response
) => {
  res.json(
    await prisma.enrollment.update({
      where: { enrollment_id: req.params.enrollmentId },
      data: req.body,
    })
  );
};

export const deleteEnrollmentController = async (
  req: Request,
  res: Response
) => {
  await prisma.enrollment.delete({
    where: { enrollment_id: req.params.enrollmentId },
  });
  res.status(204).send();
};

/* ======================================================
   SESSIONS
====================================================== */

export const createSessionController = async (req: Request, res: Response) => {
  const session = await prisma.session.create({
    data: req.body,
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
  res.json(session);
};

export const updateSessionController = async (req: Request, res: Response) => {
  const session = await prisma.session.update({
    where: { session_id: req.params.sessionId },
    data: req.body,
  });
  res.json(session);
};

export const deleteSessionController = async (req: Request, res: Response) => {
  await prisma.session.delete({
    where: { session_id: req.params.sessionId },
  });
  res.status(204).send();
};

/* ======================================================
   ATTENDANCE
====================================================== */

export const markAttendanceController = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { studentId, status } = req.body;

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
  });
  res.json(attendance);
};

export const updateAttendanceController = async (
  req: Request,
  res: Response
) => {
  const attendance = await prisma.attendance.update({
    where: { attendance_id: req.params.attendanceId },
    data: req.body,
  });
  res.json(attendance);
};

/* ======================================================
   EXAMS
====================================================== */

export const createExamController = async (req: Request, res: Response) => {
  const exam = await prisma.exam.create({
    data: req.body,
  });
  res.status(201).json(exam);
};

export const getAllExamsController = async (_req: Request, res: Response) => {
  const exams = await prisma.exam.findMany({
    include: { course: true },
  });
  res.json(exams);
};

export const getExamByIdController = async (req: Request, res: Response) => {
  const exam = await prisma.exam.findUnique({
    where: { exam_id: req.params.examId },
    include: { results: { include: { student: true } } },
  });
  res.json(exam);
};

export const updateExamController = async (req: Request, res: Response) => {
  const exam = await prisma.exam.update({
    where: { exam_id: req.params.examId },
    data: req.body,
  });
  res.json(exam);
};

export const deleteExamController = async (req: Request, res: Response) => {
  await prisma.exam.delete({
    where: { exam_id: req.params.examId },
  });
  res.status(204).send();
};

/* ======================================================
   RESULTS
====================================================== */

export const addExamResultsController = async (req: Request, res: Response) => {
  const { examId } = req.params;
  const { studentId, marks_obtained, grade } = req.body;

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
  const result = await prisma.result.update({
    where: { result_id: req.params.resultId },
    data: req.body,
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
  const permission = await prisma.permission.create({
    data: req.body,
  });
  res.status(201).json(permission);
};

export const getAllPermissionsController = async (
  _req: Request,
  res: Response
) => {
  const permissions = await prisma.permission.findMany();
  res.json(permissions);
};

export const assignPermissionToStudentController = async (
  req: Request,
  res: Response
) => {
  const { studentId } = req.params;
  const { permissionId } = req.body;

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

  await prisma.studentPermission.delete({
    where: {
      student_id_permission_id: {
        student_id: studentId,
        permission_id: permissionId,
      },
    },
  });

  res.status(204).send();
};

/* ======================================================
   DASHBOARD
====================================================== */

export const getAdminDashboardStatsController = async (
  _: Request,
  res: Response
) => {
  const [
    students,
    teachers,
    courses,
    unpaidFees,
    genderStats,
  ] = await Promise.all([
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

