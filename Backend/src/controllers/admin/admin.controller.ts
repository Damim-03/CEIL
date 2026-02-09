import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { Roles, RoleType } from "../../enums/role.enum";
import { JwtUser } from "../../middlewares/auth.middleware";
import {
  AttendanceStatus,
  FeeStatus,
  RegistrationStatus,
  StudentStatus,
  UserRole,
  GroupStatus,
  Level,
} from "../../../generated/prisma/client";
import path from "path";
import fs from "fs";
import { uploadToCloudinary } from "../../middlewares/uploadToCloudinary";

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
        password: null,
        role: Roles.STUDENT,
      },
    });

    // 2️⃣ Create STUDENT linked to USER
    const student = await tx.student.create({
      data: {
        user_id: user.user_id,
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
    where: { status: StudentStatus.ACTIVE },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      user: {
        select: {
          user_id: true,
          email: true,
          google_avatar: true,
        },
      },
      // ✅ FIXED: Get groups via enrollments
      enrollments: {
        where: {
          registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
          group_id: { not: null },
        },
        include: {
          group: true,
          course: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const total = await prisma.student.count({
    where: { status: StudentStatus.ACTIVE },
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
      user: {
        select: {
          user_id: true,
          email: true,
          google_avatar: true,
        },
      },
      // ✅ FIXED: Get groups via enrollments
      enrollments: {
        include: {
          course: true,
          group: {
            include: {
              teacher: true,
            },
          },
        },
      },
      attendance: true,
      fees: true,
    },
  });

  if (!student || student.status === StudentStatus.INACTIVE) {
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

  // ✅ FIXED: Removed group_id from allowed fields
  const allowedFields = [
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "nationality",
    "language",
    "education_level",
    "study_location",
  ];

  const data = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
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
    data: { status: StudentStatus.INACTIVE },
  });

  return res.json({ message: "Student deactivated successfully" });
};

/* ================= TEACHERS ================= */

export const createTeacherController = async (req: Request, res: Response) => {
  const { first_name, last_name, email, phone_number } = req.body;

  if (!first_name?.trim() || !last_name?.trim()) {
    return res.status(400).json({
      message: "first_name and last_name are required",
    });
  }

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
      groups: {
        include: {
          course: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return res.json(teachers);
};

export const getTeacherByIdController = async (req: Request, res: Response) => {
  const teacher = await prisma.teacher.findUnique({
    where: { teacher_id: req.params.teacherId },
    include: {
      groups: {
        include: {
          course: true,
          sessions: true,
        },
      },
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

  const allowedFields = ["first_name", "last_name", "email", "phone_number"];

  const data = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
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
      groups: {
        include: {
          sessions: true,
        },
      },
    },
  });

  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }

  const hasGroups = teacher.groups.length > 0;
  const hasSessions = teacher.groups.some((group) => group.sessions.length > 0);

  if (hasGroups || hasSessions) {
    return res.status(400).json({
      message: "Cannot delete teacher assigned to groups or sessions",
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
  try {
    const { role } = req.body as { role: UserRole };
    const { userId } = req.params;
    const admin = (req as Request & { user?: JwtUser }).user;

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    if (admin?.user_id === userId) {
      return res.status(403).json({
        message: "You cannot change your own role",
      });
    }

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

    if (user.role === role) {
      return res.json({
        message: "Role already assigned",
        user,
      });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      let first_name = "Unknown";
      let last_name = "User";

      if (user.student) {
        first_name = user.student.first_name || "Unknown";
        last_name = user.student.last_name || "User";
      } else if (user.teacher) {
        first_name = user.teacher.first_name || "Unknown";
        last_name = user.teacher.last_name || "User";
      }

      if (user.student && role !== UserRole.STUDENT) {
        await tx.attendance.deleteMany({
          where: { student_id: user.student.student_id },
        });
        await tx.result.deleteMany({
          where: { student_id: user.student.student_id },
        });
        await tx.fee.deleteMany({
          where: { student_id: user.student.student_id },
        });
        await tx.enrollment.deleteMany({
          where: { student_id: user.student.student_id },
        });
        await tx.document.deleteMany({
          where: { student_id: user.student.student_id },
        });
        await tx.studentPermission.deleteMany({
          where: { student_id: user.student.student_id },
        });

        await tx.student.delete({
          where: { student_id: user.student.student_id },
        });
      }

      if (user.teacher && role !== UserRole.TEACHER) {
        const hasGroups = await tx.group.findFirst({
          where: { teacher_id: user.teacher.teacher_id },
        });

        if (hasGroups) {
          throw new Error(
            "Cannot change role: Teacher is assigned to groups. Remove groups first.",
          );
        }

        await tx.teacher.delete({
          where: { teacher_id: user.teacher.teacher_id },
        });
      }

      if (role === UserRole.STUDENT) {
        const student = await tx.student.create({
          data: {
            user_id: user.user_id,
            first_name,
            last_name,
            email: user.email,
          },
        });

        await tx.user.update({
          where: { user_id: userId },
          data: {
            role: UserRole.STUDENT,
            student_id: student.student_id,
            teacher_id: null,
          },
        });
      } else if (role === UserRole.TEACHER) {
        const teacher = await tx.teacher.create({
          data: {
            first_name,
            last_name,
            email: user.email,
          },
        });

        await tx.user.update({
          where: { user_id: userId },
          data: {
            role: UserRole.TEACHER,
            teacher_id: teacher.teacher_id,
            student_id: null,
          },
        });
      } else if (role === UserRole.ADMIN) {
        await tx.user.update({
          where: { user_id: userId },
          data: {
            role: UserRole.ADMIN,
            student_id: null,
            teacher_id: null,
          },
        });
      }

      return tx.user.findUnique({
        where: { user_id: userId },
        include: {
          student: true,
          teacher: true,
        },
      });
    });

    return res.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Change role error:", error);

    return res.status(500).json({
      message: error.message || "Failed to change user role",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
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
  const { course_name, course_code, credits } = req.body;

  if (!course_name?.trim()) {
    return res.status(400).json({
      message: "course_name is required",
    });
  }

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
      profile: true,
      groups: {
        include: {
          teacher: true,
        },
      },
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
      groups: {
        include: {
          sessions: true,
          teacher: true,
          _count: {
            select: {
              enrollments: {
                where: {
                  registration_status: {
                    in: ["VALIDATED", "PAID", "FINISHED"],
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  // Transform groups to include current_capacity
  const transformed = {
    ...course,
    groups: course.groups.map((group) => ({
      ...group,
      current_capacity: group._count.enrollments,
    })),
  };

  return res.json(transformed);
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

  const allowedFields = ["course_name", "course_code", "credits"];

  const data = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
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
  res: Response,
) => {
  const { name, description } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({
      message: "Department name is required and must be at least 2 characters",
    });
  }

  const exists = await prisma.department.findUnique({
    where: { name: name.trim() },
  });

  if (exists) {
    return res.status(409).json({
      message: "Department with this name already exists",
    });
  }

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
  res: Response,
) => {
  const departments = await prisma.department.findMany({
    orderBy: { created_at: "desc" },
    include: {
      groups: {
        select: {
          group_id: true,
          name: true,
        },
      },
    },
  });

  return res.json(departments);
};

export const getDepartmentByIdController = async (
  req: Request,
  res: Response,
) => {
  const { departmentId } = req.params;

  if (!departmentId) {
    return res.status(400).json({ message: "departmentId is required" });
  }

  const department = await prisma.department.findUnique({
    where: { department_id: departmentId },
    include: {
      groups: {
        include: {
          // ✅ FIXED: Get students via enrollments
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
            include: {
              student: {
                select: {
                  student_id: true,
                  first_name: true,
                  last_name: true,
                },
              },
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
  res: Response,
) => {
  const { departmentId } = req.params;
  const { name, description } = req.body;

  const exists = await prisma.department.findUnique({
    where: { department_id: departmentId },
  });

  if (!exists) {
    return res.status(404).json({
      message: "Department not found",
    });
  }

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
  res: Response,
) => {
  const { departmentId } = req.params;

  const department = await prisma.department.findUnique({
    where: { department_id: departmentId },
    include: { groups: true },
  });

  if (!department) {
    return res.status(404).json({
      message: "Department not found",
    });
  }

  if (department.groups.length > 0) {
    return res.status(400).json({
      message:
        "Cannot delete department with existing groups. Remove groups first.",
    });
  }

  await prisma.department.delete({
    where: { department_id: departmentId },
  });

  return res.json({
    message: "Department deleted successfully",
  });
};

/* ================= GROUPS ================= */

export const createGroupController = async (req: Request, res: Response) => {
  const { name, department_id, course_id, level, max_students, teacher_id } =
    req.body;

  if (!name?.trim() || !course_id || !level) {
    return res.status(400).json({
      message: "name, course_id and level are required",
    });
  }

  if (!Object.values(Level).includes(level)) {
    return res.status(400).json({
      message: "Invalid level value",
    });
  }

  const [department, course] = await Promise.all([
    department_id
      ? prisma.department.findUnique({ where: { department_id } })
      : Promise.resolve(null),
    prisma.course.findUnique({ where: { course_id } }),
  ]);

  if (department_id && !department) {
    return res.status(400).json({
      message: "Invalid department_id",
    });
  }

  if (!course) {
    return res.status(400).json({
      message: "Invalid course_id",
    });
  }

  if (teacher_id) {
    const teacher = await prisma.teacher.findUnique({
      where: { teacher_id },
    });

    if (!teacher) {
      return res.status(400).json({
        message: "Invalid teacher_id",
      });
    }
  }

  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      course_id,
      department_id,
      level,
      max_students: max_students ?? 25,
      teacher_id,
      status: GroupStatus.OPEN,
    },
  });

  return res.status(201).json(group);
};

export const getAllGroupsController = async (_: Request, res: Response) => {
  const groups = await prisma.group.findMany({
    include: {
      department: true,
      course: true, // ✅ هل هذا موجود؟
      teacher: true,
      enrollments: {
        where: {
          registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
        },
        include: {
          student: true,
        },
      },
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

  // Transform for backward compatibility
  const transformed = groups.map((group) => ({
    ...group,
    students: group.enrollments.map((e) => e.student),
    current_capacity: group._count.enrollments,
  }));

  return res.json(transformed);
};

export const getGroupByIdController = async (req: Request, res: Response) => {
  const group = await prisma.group.findUnique({
    where: { group_id: req.params.groupId },
    include: {
      department: true,
      // ✅ FIXED: Get students via enrollments
      enrollments: {
        where: {
          registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
        },
        include: {
          student: true,
        },
      },
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

  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  // Transform for backward compatibility
  const transformed = {
    ...group,
    students: group.enrollments.map((e) => e.student),
    current_capacity: group._count.enrollments,
  };

  return res.json(transformed);
};

export const updateGroupController = async (req: Request, res: Response) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty" });
  }

  const allowedFields = ["name", "teacher_id", "max_students", "status"];

  const data = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
  );

  const group = await prisma.group.update({
    where: { group_id: req.params.groupId },
    data,
  });

  return res.json(group);
};

export const deleteGroupController = async (req: Request, res: Response) => {
  await prisma.group.delete({
    where: { group_id: req.params.groupId },
  });

  return res.json({ message: "Group deleted successfully" });
};

// ✅ FIXED: Add/Remove student to/from group now uses Enrollment
export const addStudentToGroupController = async (
  req: Request,
  res: Response,
) => {
  const { groupId, studentId } = req.params;

  const group = await prisma.group.findUnique({
    where: { group_id: groupId },
    include: {
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

  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  const currentCapacity = group._count.enrollments;

  if (
    group.status === GroupStatus.FULL ||
    currentCapacity >= group.max_students
  ) {
    return res.status(400).json({
      message: "Group is full",
    });
  }

  const student = await prisma.student.findUnique({
    where: { student_id: studentId },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // ✅ Find enrollment for this course
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      student_id: studentId,
      course_id: group.course_id,
      registration_status: { in: ["VALIDATED", "PAID"] },
    },
  });

  if (!enrollment) {
    return res.status(400).json({
      message: "Student must be enrolled in this course first",
    });
  }

  if (enrollment.group_id) {
    return res.status(400).json({
      message: "Student already assigned to a group for this course",
    });
  }

  // ✅ Update enrollment with group_id
  await prisma.enrollment.update({
    where: { enrollment_id: enrollment.enrollment_id },
    data: { group_id: groupId },
  });

  // Update group status if full
  if (currentCapacity + 1 >= group.max_students) {
    await prisma.group.update({
      where: { group_id: groupId },
      data: { status: GroupStatus.FULL },
    });
  }

  return res.json({ message: "Student added successfully" });
};

export const assignInstructorToGroupController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { groupId } = req.params;
    const { teacher_id } = req.body;

    // Validate group exists
    const group = await prisma.group.findUnique({
      where: { group_id: groupId },
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // If teacher_id is provided, validate teacher exists
    if (teacher_id) {
      const teacher = await prisma.teacher.findUnique({
        where: { teacher_id },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }
    }

    // Update group with new teacher (or null to remove)
    const updatedGroup = await prisma.group.update({
      where: { group_id: groupId },
      data: {
        teacher_id: teacher_id || null,
      },
      include: {
        course: true,
        teacher: true,
        department: true,
        enrollments: {
          include: {
            student: true,
          },
        },
        sessions: true,
        _count: {
          select: {
            enrollments: true,
            sessions: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: teacher_id
        ? "Instructor assigned successfully"
        : "Instructor removed successfully",
      data: updatedGroup,
    });
  } catch (error: any) {
    console.error("Error assigning instructor:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign instructor",
      error: error.message,
    });
  }
};

export const removeStudentFromGroupController = async (
  req: Request,
  res: Response,
) => {
  const { groupId, studentId } = req.params;

  // ✅ Find enrollment
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      student_id: studentId,
      group_id: groupId,
      registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
    },
  });

  if (!enrollment) {
    return res.status(400).json({
      message: "Student is not assigned to this group",
    });
  }

  // ✅ Remove student from group
  await prisma.enrollment.update({
    where: { enrollment_id: enrollment.enrollment_id },
    data: { group_id: null },
  });

  // Update group status
  const group = await prisma.group.findUnique({
    where: { group_id: groupId },
    include: {
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

  if (
    group &&
    group.status === GroupStatus.FULL &&
    group._count.enrollments < group.max_students
  ) {
    await prisma.group.update({
      where: { group_id: groupId },
      data: { status: GroupStatus.OPEN },
    });
  }

  return res.json({
    message: "Student removed from group successfully",
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
      status: FeeStatus.UNPAID,
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

  if (fee.status === FeeStatus.PAID) {
    return res.status(400).json({
      message: "Paid fee cannot be modified",
    });
  }

  const allowedFields = ["amount", "due_date"];

  const data = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
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

  if (fee.status === FeeStatus.PAID) {
    return res.status(400).json({
      message: "Fee already paid",
    });
  }

  const updatedFee = await prisma.fee.update({
    where: { fee_id: feeId },
    data: {
      status: FeeStatus.PAID,
      paid_at: new Date(),
      payment_method: "Cash",
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

  if (fee.status === FeeStatus.PAID) {
    return res.status(400).json({
      message: "Paid fee cannot be deleted",
    });
  }

  await prisma.fee.delete({
    where: { fee_id: req.params.feeId },
  });

  return res.json({ message: "Fee deleted successfully" });
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

  return res.json({
    message: "Document approved successfully",
    document: updatedDocument,
  });
};

export const rejectDocumentController = async (req: Request, res: Response) => {
  const admin = (req as Request & { user?: JwtUser }).user;
  const { documentId } = req.params;
  const { reason } = req.body;

  const document = await prisma.document.findUnique({
    where: { document_id: documentId },
    include: {
      student: true,
    },
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  if (document.status === "REJECTED") {
    return res.status(400).json({
      message: "Document already rejected",
    });
  }

  const updatedDocument = await prisma.document.update({
    where: { document_id: documentId },
    data: {
      status: "REJECTED",
      reviewed_at: new Date(),
      reviewed_by: admin?.user_id,
    },
  });

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

/* ================= ENROLLMENTS ================= */

export const getAllEnrollmentsController = async (
  _: Request,
  res: Response,
) => {
  const enrollments = await prisma.enrollment.findMany({
    include: {
      student: {
        include: {
          documents: true,
        },
      },
      course: {
        include: {
          groups: {
            include: {
              _count: {
                select: {
                  enrollments: {
                    where: {
                      registration_status: {
                        in: ["VALIDATED", "PAID", "FINISHED"],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      fees: true,
      group: true,
    },
    orderBy: { enrollment_date: "desc" },
  });

  res.json(enrollments);
};

export const getEnrollmentByIdController = async (
  req: Request,
  res: Response,
) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { enrollment_id: req.params.enrollmentId },
    include: {
      student: true,
      course: true,
      fees: true,
      history: true,
      group: true,
    },
  });

  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  res.json(enrollment);
};

/* ===============================================================
   VALIDATE ENROLLMENT CONTROLLER - COMPLETE FIXED VERSION
   
   This controller:
   1. Validates enrollment status
   2. Optionally assigns group
   3. Creates registration history
   4. ✅ CREATES FEE RECORD (FIXED!)
   5. Updates enrollment to VALIDATED status
   
   All operations in a single transaction for data integrity.
=============================================================== */

export const validateEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  const { enrollmentId } = req.params;

  try {
    // 1. Get enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { enrollment_id: enrollmentId },
      include: {
        course: true,
        student: true,
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        message: "Enrollment not found",
      });
    }

    // 2. Check status
    if (enrollment.registration_status !== "PENDING") {
      return res.status(400).json({
        message: "Only pending enrollments can be validated",
      });
    }

    // 3. Update enrollment + Create fee (MINIMAL)
    const result = await prisma.$transaction(async (tx) => {
      // Update enrollment
      const updatedEnrollment = await tx.enrollment.update({
        where: { enrollment_id: enrollmentId },
        data: {
          registration_status: "VALIDATED",
        },
      });

      // Create fee (MINIMAL FIELDS ONLY)
      const fee = await tx.fee.create({
        data: {
          student_id: enrollment.student_id,
          enrollment_id: enrollmentId,
          amount: 1000,
          status: "UNPAID",
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return { enrollment: updatedEnrollment, fee };
    });

    // 4. Return success
    return res.json({
      message: "Enrollment validated successfully",
      enrollment: result.enrollment,
      fee: result.fee,
    });
  } catch (error: any) {
    console.error("❌ Validation error:", error);

    return res.status(500).json({
      message: error.message || "Failed to validate enrollment",
    });
  }
};

export const rejectEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  const admin = (req as Request & { user?: JwtUser }).user;
  const { enrollmentId } = req.params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { enrollment_id: enrollmentId },
  });

  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  if (enrollment.registration_status !== RegistrationStatus.PENDING) {
    return res.status(400).json({
      message: "Only pending enrollments can be rejected",
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.registrationHistory.create({
      data: {
        enrollment_id: enrollmentId,
        old_status: enrollment.registration_status,
        new_status: RegistrationStatus.REJECTED,
        changed_by: admin?.user_id,
      },
    });

    return tx.enrollment.update({
      where: { enrollment_id: enrollmentId },
      data: { registration_status: RegistrationStatus.REJECTED },
    });
  });

  res.json(updated);
};

export const markEnrollmentPaidController = async (
  req: Request,
  res: Response,
) => {
  const admin = (req as Request & { user?: JwtUser }).user;
  const { enrollmentId } = req.params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { enrollment_id: enrollmentId },
  });

  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  if (enrollment.registration_status !== RegistrationStatus.VALIDATED) {
    return res.status(400).json({
      message: "Enrollment must be validated before payment",
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.registrationHistory.create({
      data: {
        enrollment_id: enrollmentId,
        old_status: enrollment.registration_status,
        new_status: RegistrationStatus.PAID,
        changed_by: admin?.user_id,
      },
    });

    return tx.enrollment.update({
      where: { enrollment_id: enrollmentId },
      data: { registration_status: RegistrationStatus.PAID },
    });
  });

  res.json(updated);
};

export const finishEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  const admin = (req as Request & { user?: JwtUser }).user;
  const { enrollmentId } = req.params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { enrollment_id: enrollmentId },
  });

  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  if (enrollment.registration_status !== RegistrationStatus.PAID) {
    return res.status(400).json({
      message: "Only paid enrollments can be finished",
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.registrationHistory.create({
      data: {
        enrollment_id: enrollmentId,
        old_status: enrollment.registration_status,
        new_status: RegistrationStatus.FINISHED,
        changed_by: admin?.user_id,
      },
    });

    return tx.enrollment.update({
      where: { enrollment_id: enrollmentId },
      data: { registration_status: RegistrationStatus.FINISHED },
    });
  });

  res.json(updated);
};

/* ================= SESSIONS ================= */

export const createSessionController = async (req: Request, res: Response) => {
  const { group_id, session_date, topic } = req.body;

  if (!group_id || !session_date) {
    return res.status(400).json({
      message: "group_id and session_date are required",
    });
  }

  // ✅ findUnique بدل findMany
  const group = await prisma.group.findUnique({
    where: { group_id },
  });

  // ✅ الآن group معرّف
  if (!group) {
    return res.status(400).json({
      message: "Invalid group_id",
    });
  }

  const session = await prisma.session.create({
    data: {
      group_id,
      session_date: new Date(session_date),
      topic: topic || null,
    },
    include: {
      group: {
        include: {
          course: true,
          teacher: true,
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
            include: {
              student: true,
            },
          },
        },
      },
      _count: { select: { attendance: true } },
    },
  });

  res.status(201).json(session);
};

export const getAllSessionsController = async (
  _req: Request,
  res: Response,
) => {
  const sessions = await prisma.session.findMany({
    include: {
      group: {
        include: {
          course: {
            select: {
              course_id: true,
              course_name: true,
              course_code: true,
            },
          },
          teacher: {
            select: {
              teacher_id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          // ✅ FIXED: Get students via enrollments
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
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
            },
          },
        },
      },
      _count: {
        select: {
          attendance: true,
        },
      },
    },
    orderBy: { session_date: "desc" },
  });

  res.json(sessions);
};

export const getSessionByIdController = async (req: Request, res: Response) => {
  const session = await prisma.session.findUnique({
    where: { session_id: req.params.sessionId },
    include: {
      attendance: {
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
      },
      group: {
        include: {
          course: {
            select: {
              course_id: true,
              course_name: true,
              course_code: true,
            },
          },
          teacher: {
            select: {
              teacher_id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          // ✅ FIXED: Get students via enrollments
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
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
            },
          },
        },
      },
      _count: {
        select: {
          attendance: true,
        },
      },
    },
  });

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  res.json(session);
};

export const getSessionAttendanceController = async (
  req: Request,
  res: Response,
) => {
  const { sessionId } = req.params;

  const attendance = await prisma.attendance.findMany({
    where: { session_id: sessionId },
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
    },
    orderBy: {
      student: {
        first_name: "asc",
      },
    },
  });

  res.json(attendance);
};

export const updateSessionController = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty" });
  }

  const allowedFields = ["session_date", "topic"];

  const data = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
  );

  const session = await prisma.session.update({
    where: { session_id: sessionId },
    data,
  });

  res.json(session);
};

export const deleteSessionController = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const attendanceCount = await prisma.attendance.count({
      where: { session_id: sessionId },
    });

    if (attendanceCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete session with attendance records",
      });
    }

    const session = await prisma.session.findUnique({
      where: { session_id: sessionId },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // ✅ حذف مباشر بدون شرط التاريخ
    await prisma.session.delete({
      where: { session_id: sessionId },
    });

    return res.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error: any) {
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete session due to related data",
      });
    }
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to delete session",
    });
  }
};

/* ================= ATTENDANCE ================= */

export const markAttendanceController = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { student_id, status } = req.body;

  if (!student_id || !status) {
    return res.status(400).json({
      message: "student_id and status are required",
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
    where: { student_id: student_id },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // ✅ FIXED: Check if student is enrolled in the group
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      student_id: student_id,
      group_id: session.group_id,
      registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
    },
  });

  if (!enrollment) {
    return res.status(400).json({
      message: "Student is not enrolled in this session's group",
    });
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      session_id_student_id: {
        session_id: sessionId,
        student_id: student_id,
      },
    },
    update: { status },
    create: {
      session_id: sessionId,
      student_id: student_id,
      status,
    },
  });

  res.status(201).json(attendance);
};

export const getAttendanceBySessionController = async (
  req: Request,
  res: Response,
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
  res: Response,
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
  res: Response,
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

/* ================= EXAMS - PART 3 ================= */

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
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
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

/* ================= RESULTS ================= */

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
  res: Response,
) => {
  const results = await prisma.result.findMany({
    where: { exam_id: req.params.examId },
    include: { student: true },
  });
  res.json(results);
};

export const getResultsByStudentController = async (
  req: Request,
  res: Response,
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
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
  );

  const result = await prisma.result.update({
    where: { result_id: resultId },
    data,
  });

  res.json(result);
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
  const [students, teachers, courses, unpaidFees, genderStats] =
    await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.course.count(),
      prisma.fee.aggregate({
        where: { status: "UNPAID" },
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
    Male: genderStats.find((g) => g.gender === "MALE")?._count.gender || 0,
    Female: genderStats.find((g) => g.gender === "FEMALE")?._count.gender || 0,
    Other: genderStats.find((g) => g.gender === "OTHER")?._count.gender || 0,
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

    if (admin.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admin can update this profile",
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
