"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionByIdController = exports.getAllSessionsController = exports.createSessionController = exports.finishEnrollmentController = exports.markEnrollmentPaidController = exports.rejectEnrollmentController = exports.validateEnrollmentController = exports.getEnrollmentByIdController = exports.getAllEnrollmentsController = exports.deleteDocumentController = exports.getDocumentByIdController = exports.getAllDocumentsController = exports.deleteFeeController = exports.markFeeAsPaidController = exports.updateFeeController = exports.getFeeByIdController = exports.getAllFeesController = exports.createFeeController = exports.removeStudentFromGroupController = exports.addStudentToGroupController = exports.deleteGroupController = exports.updateGroupController = exports.getGroupByIdController = exports.getAllGroupsController = exports.createGroupController = exports.deleteDepartmentController = exports.updateDepartmentController = exports.getDepartmentByIdController = exports.getAllDepartmentsController = exports.createDepartmentController = exports.deleteCourseController = exports.updateCourseController = exports.getCourseByIdController = exports.getAllCoursesController = exports.createCourseController = exports.disableUserController = exports.enableUserController = exports.changeUserRoleController = exports.getUserByIdController = exports.getAllUsersController = exports.deleteTeacherController = exports.updateTeacherController = exports.getTeacherByIdController = exports.getAllTeachersController = exports.createTeacherController = exports.deleteStudentController = exports.updateStudentController = exports.getStudentByIdController = exports.getAllStudentsController = exports.createStudentController = void 0;
exports.getEnrollmentsReportController = exports.getAttendanceReportController = exports.getPaymentsReportController = exports.getGroupsReportController = exports.getStudentsReportController = exports.getAdminDashboardStatsController = exports.removePermissionFromStudentController = exports.assignPermissionToStudentController = exports.getAllPermissionsController = exports.createPermissionController = exports.updateResultController = exports.getResultsByStudentController = exports.getResultsByExamController = exports.addExamResultsController = exports.deleteExamController = exports.updateExamController = exports.getExamByIdController = exports.getAllExamsController = exports.createExamController = exports.updateAttendanceController = exports.getAttendanceByStudentController = exports.getAttendanceBySessionController = exports.markAttendanceController = exports.deleteSessionController = exports.updateSessionController = void 0;
const client_1 = require("../../prisma/client");
const role_enum_1 = require("../../enums/role.enum");
const client_2 = require("../../../generated/prisma/client");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/* ================= STUDENTS ================= */
const createStudentController = async (req, res) => {
    const { first_name, last_name, email, phone_number, nationality, language, education_level, study_location, } = req.body;
    if (!first_name?.trim() || !last_name?.trim() || !email) {
        return res.status(400).json({
            message: "first_name, last_name and email are required",
        });
    }
    const existingUser = await client_1.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });
    if (existingUser) {
        return res.status(409).json({
            message: "User with this email already exists",
        });
    }
    const result = await client_1.prisma.$transaction(async (tx) => {
        // 1️⃣ Create USER
        const user = await tx.user.create({
            data: {
                email: email.toLowerCase(),
                password: null, // or temporary password
                role: role_enum_1.Roles.STUDENT,
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
exports.createStudentController = createStudentController;
const getAllStudentsController = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const students = await client_1.prisma.student.findMany({
        where: { status: client_2.StudentStatus.Active },
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
    const total = await client_1.prisma.student.count({
        where: { status: client_2.StudentStatus.Active },
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
exports.getAllStudentsController = getAllStudentsController;
const getStudentByIdController = async (req, res) => {
    const { studentId } = req.params;
    const student = await client_1.prisma.student.findUnique({
        where: { student_id: studentId },
        include: {
            group: true,
            enrollments: { include: { course: true } },
            attendance: true,
            fees: true,
        },
    });
    if (!student || student.status === client_2.StudentStatus.Inactive) {
        return res.status(404).json({ message: "Student not found" });
    }
    return res.json(student);
};
exports.getStudentByIdController = getStudentByIdController;
const updateStudentController = async (req, res) => {
    const { studentId } = req.params;
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body is empty" });
    }
    const student = await client_1.prisma.student.findUnique({
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
    const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    const updatedStudent = await client_1.prisma.student.update({
        where: { student_id: studentId },
        data,
    });
    return res.json(updatedStudent);
};
exports.updateStudentController = updateStudentController;
const deleteStudentController = async (req, res) => {
    const { studentId } = req.params;
    const student = await client_1.prisma.student.findUnique({
        where: { student_id: studentId },
    });
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    await client_1.prisma.student.update({
        where: { student_id: studentId },
        data: { status: client_2.StudentStatus.Inactive },
    });
    return res.json({ message: "Student deactivated successfully" });
};
exports.deleteStudentController = deleteStudentController;
/* ================= TEACHERS ================= */
const createTeacherController = async (req, res) => {
    const { first_name, last_name, email, phone_number } = req.body;
    // 1️⃣ Validation
    if (!first_name?.trim() || !last_name?.trim()) {
        return res.status(400).json({
            message: "first_name and last_name are required",
        });
    }
    // 2️⃣ Prevent duplicate email
    if (email) {
        const exists = await client_1.prisma.teacher.findFirst({
            where: { email },
        });
        if (exists) {
            return res.status(409).json({
                message: "Teacher with this email already exists",
            });
        }
    }
    // 3️⃣ Create
    const teacher = await client_1.prisma.teacher.create({
        data: {
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email,
            phone_number,
        },
    });
    return res.status(201).json(teacher);
};
exports.createTeacherController = createTeacherController;
const getAllTeachersController = async (_, res) => {
    const teachers = await client_1.prisma.teacher.findMany({
        include: {
            courses: true,
        },
        orderBy: { created_at: "desc" },
    });
    return res.json(teachers);
};
exports.getAllTeachersController = getAllTeachersController;
const getTeacherByIdController = async (req, res) => {
    const teacher = await client_1.prisma.teacher.findUnique({
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
exports.getTeacherByIdController = getTeacherByIdController;
const updateTeacherController = async (req, res) => {
    const { teacherId } = req.params;
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body is empty" });
    }
    const teacher = await client_1.prisma.teacher.findUnique({
        where: { teacher_id: teacherId },
    });
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }
    // ✅ Whitelist
    const allowedFields = ["first_name", "last_name", "email", "phone_number"];
    const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    const updatedTeacher = await client_1.prisma.teacher.update({
        where: { teacher_id: teacherId },
        data,
    });
    return res.json(updatedTeacher);
};
exports.updateTeacherController = updateTeacherController;
const deleteTeacherController = async (req, res) => {
    const { teacherId } = req.params;
    const teacher = await client_1.prisma.teacher.findUnique({
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
    await client_1.prisma.teacher.delete({
        where: { teacher_id: teacherId },
    });
    return res.json({ message: "Teacher deleted successfully" });
};
exports.deleteTeacherController = deleteTeacherController;
/* ================= USER ROLES ================= */
const getAllUsersController = async (_, res) => {
    const users = await client_1.prisma.user.findMany({
        include: { student: true, teacher: true },
    });
    res.json(users);
};
exports.getAllUsersController = getAllUsersController;
const getUserByIdController = async (req, res) => {
    const user = await client_1.prisma.user.findUnique({
        where: { user_id: req.params.userId },
        include: { student: true, teacher: true },
    });
    res.json(user);
};
exports.getUserByIdController = getUserByIdController;
const changeUserRoleController = async (req, res) => {
    const { role } = req.body;
    const admin = req.user;
    const { userId } = req.params;
    if (!role || !Object.values(role_enum_1.Roles).includes(role)) {
        return res.status(400).json({ message: "Invalid role value" });
    }
    if (admin?.user_id === userId) {
        return res.status(403).json({
            message: "You cannot change your own role",
        });
    }
    const user = await client_1.prisma.user.findUnique({
        where: { user_id: userId },
        include: { student: true, teacher: true },
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    if (user.role === role) {
        return res.json({ message: "Role already assigned", user });
    }
    const updatedUser = await client_1.prisma.$transaction(async (tx) => {
        /**
         * ➜ TEACHER
         */
        if (role === role_enum_1.Roles.TEACHER) {
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
                    role: role_enum_1.Roles.TEACHER,
                    teacher_id: teacherId,
                },
            });
        }
        /**
         * ➜ STUDENT
         */
        if (role === role_enum_1.Roles.STUDENT) {
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
                    role: role_enum_1.Roles.STUDENT,
                    student_id: studentId,
                },
            });
        }
        /**
         * ➜ ADMIN
         */
        if (role === role_enum_1.Roles.ADMIN) {
            return tx.user.update({
                where: { user_id: userId },
                data: {
                    role: role_enum_1.Roles.ADMIN,
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
exports.changeUserRoleController = changeUserRoleController;
const enableUserController = async (req, res) => {
    const { userId } = req.params;
    const user = await client_1.prisma.user.update({
        where: { user_id: userId },
        data: { is_active: true },
    });
    res.json({ message: "User enabled", user });
};
exports.enableUserController = enableUserController;
const disableUserController = async (req, res) => {
    const { userId } = req.params;
    const user = await client_1.prisma.user.update({
        where: { user_id: userId },
        data: { is_active: false },
    });
    res.json({ message: "User disabled", user });
};
exports.disableUserController = disableUserController;
/* ================= COURSES ================= */
const createCourseController = async (req, res) => {
    const { course_name, course_code, credits, teacher_id } = req.body;
    if (!course_name?.trim()) {
        return res.status(400).json({
            message: "course_name is required",
        });
    }
    // منع تكرار course_code
    if (course_code) {
        const exists = await client_1.prisma.course.findFirst({
            where: { course_code },
        });
        if (exists) {
            return res.status(409).json({
                message: "Course with this code already exists",
            });
        }
    }
    const course = await client_1.prisma.course.create({
        data: {
            course_name: course_name.trim(),
            course_code,
            credits,
            teacher_id,
        },
    });
    return res.status(201).json(course);
};
exports.createCourseController = createCourseController;
const getAllCoursesController = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const courses = await client_1.prisma.course.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
            teacher: true,
        },
        orderBy: { course_name: "asc" },
    });
    const total = await client_1.prisma.course.count();
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
exports.getAllCoursesController = getAllCoursesController;
const getCourseByIdController = async (req, res) => {
    const { courseId } = req.params;
    const course = await client_1.prisma.course.findUnique({
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
exports.getCourseByIdController = getCourseByIdController;
const updateCourseController = async (req, res) => {
    const { courseId } = req.params;
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body is empty" });
    }
    const course = await client_1.prisma.course.findUnique({
        where: { course_id: courseId },
    });
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    // ✅ Whitelist (Security)
    const allowedFields = ["course_name", "course_code", "credits", "teacher_id"];
    const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    const updatedCourse = await client_1.prisma.course.update({
        where: { course_id: courseId },
        data,
    });
    return res.json(updatedCourse);
};
exports.updateCourseController = updateCourseController;
const deleteCourseController = async (req, res) => {
    await client_1.prisma.course.delete({
        where: { course_id: req.params.courseId },
    });
    return res.json({ message: "Course deleted successfully" });
};
exports.deleteCourseController = deleteCourseController;
/* ================= DEPARTMENTS ================= */
const createDepartmentController = async (req, res) => {
    const { name, description } = req.body;
    // 1️⃣ Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
            message: "Department name is required and must be at least 2 characters",
        });
    }
    // 2️⃣ Unique check (schema: name @unique)
    const exists = await client_1.prisma.department.findUnique({
        where: { name: name.trim() },
    });
    if (exists) {
        return res.status(409).json({
            message: "Department with this name already exists",
        });
    }
    // 3️⃣ Create
    const department = await client_1.prisma.department.create({
        data: {
            name: name.trim(),
            description: description?.trim() || null,
        },
    });
    return res.status(201).json(department);
};
exports.createDepartmentController = createDepartmentController;
const getAllDepartmentsController = async (_, res) => {
    const departments = await client_1.prisma.department.findMany({
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
exports.getAllDepartmentsController = getAllDepartmentsController;
const getDepartmentByIdController = async (req, res) => {
    const { departmentId } = req.params;
    // 1️⃣ Validate UUID
    if (!departmentId) {
        return res.status(400).json({ message: "departmentId is required" });
    }
    const department = await client_1.prisma.department.findUnique({
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
exports.getDepartmentByIdController = getDepartmentByIdController;
const updateDepartmentController = async (req, res) => {
    const { departmentId } = req.params;
    const { name, description } = req.body;
    // 1️⃣ Check existence
    const exists = await client_1.prisma.department.findUnique({
        where: { department_id: departmentId },
    });
    if (!exists) {
        return res.status(404).json({
            message: "Department not found",
        });
    }
    // 2️⃣ Prevent duplicate name
    if (name && name !== exists.name) {
        const duplicate = await client_1.prisma.department.findUnique({
            where: { name },
        });
        if (duplicate) {
            return res.status(409).json({
                message: "Another department with this name already exists",
            });
        }
    }
    // 3️⃣ Update safely
    const department = await client_1.prisma.department.update({
        where: { department_id: departmentId },
        data: {
            name: name?.trim(),
            description: description?.trim(),
        },
    });
    return res.json(department);
};
exports.updateDepartmentController = updateDepartmentController;
const deleteDepartmentController = async (req, res) => {
    const { departmentId } = req.params;
    // 1️⃣ Check existence
    const department = await client_1.prisma.department.findUnique({
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
            message: "Cannot delete department with existing groups. Remove groups first.",
        });
    }
    // 3️⃣ Delete
    await client_1.prisma.department.delete({
        where: { department_id: departmentId },
    });
    return res.json({
        message: "Department deleted successfully",
    });
};
exports.deleteDepartmentController = deleteDepartmentController;
/* ================= GROUPS ================= */
const createGroupController = async (req, res) => {
    const { name, department_id } = req.body;
    if (!name?.trim() || !department_id) {
        return res.status(400).json({
            message: "name and department_id are required",
        });
    }
    const departmentExists = await client_1.prisma.department.findUnique({
        where: { department_id },
    });
    if (!departmentExists) {
        return res.status(400).json({
            message: "Invalid department_id",
        });
    }
    const group = await client_1.prisma.group.create({ data: req.body });
    return res.status(201).json(group);
};
exports.createGroupController = createGroupController;
const getAllGroupsController = async (_, res) => {
    return res.json(await client_1.prisma.group.findMany({
        include: { department: true, students: true },
    }));
};
exports.getAllGroupsController = getAllGroupsController;
const getGroupByIdController = async (req, res) => {
    const group = await client_1.prisma.group.findUnique({
        where: { group_id: req.params.groupId },
        include: { department: true, students: true },
    });
    if (!group) {
        return res.status(404).json({ message: "Group not found" });
    }
    return res.json(group);
};
exports.getGroupByIdController = getGroupByIdController;
const updateGroupController = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body is empty" });
    }
    const group = await client_1.prisma.group.update({
        where: { group_id: req.params.groupId },
        data: req.body,
    });
    return res.json(group);
};
exports.updateGroupController = updateGroupController;
const deleteGroupController = async (req, res) => {
    await client_1.prisma.group.delete({
        where: { group_id: req.params.groupId },
    });
    return res.json({ message: "Group deleted successfully" });
};
exports.deleteGroupController = deleteGroupController;
const addStudentToGroupController = async (req, res) => {
    const { groupId, studentId } = req.params;
    // 1️⃣ تحقق من وجود Group
    const group = await client_1.prisma.group.findUnique({
        where: { group_id: groupId },
    });
    if (!group) {
        return res.status(404).json({ message: "Group not found" });
    }
    // 2️⃣ تحقق من وجود Student
    const student = await client_1.prisma.student.findUnique({
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
    const updatedStudent = await client_1.prisma.student.update({
        where: { student_id: studentId },
        data: { group_id: groupId },
    });
    return res.json({
        message: "Student added to group successfully",
        student: updatedStudent,
    });
};
exports.addStudentToGroupController = addStudentToGroupController;
const removeStudentFromGroupController = async (req, res) => {
    const { groupId, studentId } = req.params;
    // 1️⃣ تحقق من الطالب
    const student = await client_1.prisma.student.findUnique({
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
    const updatedStudent = await client_1.prisma.student.update({
        where: { student_id: studentId },
        data: { group_id: null },
    });
    return res.json({
        message: "Student removed from group successfully",
        student: updatedStudent,
    });
};
exports.removeStudentFromGroupController = removeStudentFromGroupController;
/* ================= FEES ================= */
const createFeeController = async (req, res) => {
    const { student_id, enrollment_id, amount, due_date } = req.body;
    if (!student_id || !amount || !due_date) {
        return res.status(400).json({
            message: "student_id, amount and due_date are required",
        });
    }
    const student = await client_1.prisma.student.findUnique({
        where: { student_id },
    });
    if (!student) {
        return res.status(400).json({ message: "Invalid student_id" });
    }
    // ربط اختياري مع Enrollment
    if (enrollment_id) {
        const enrollment = await client_1.prisma.enrollment.findUnique({
            where: { enrollment_id },
        });
        if (!enrollment) {
            return res.status(400).json({ message: "Invalid enrollment_id" });
        }
    }
    const fee = await client_1.prisma.fee.create({
        data: {
            student_id,
            enrollment_id,
            amount,
            due_date: new Date(due_date),
            status: client_2.FeeStatus.Unpaid,
        },
    });
    return res.status(201).json(fee);
};
exports.createFeeController = createFeeController;
const getAllFeesController = async (_, res) => {
    const fees = await client_1.prisma.fee.findMany({
        include: {
            student: true,
            enrollment: true,
        },
        orderBy: { due_date: "asc" },
    });
    res.json(fees);
};
exports.getAllFeesController = getAllFeesController;
const getFeeByIdController = async (req, res) => {
    const fee = await client_1.prisma.fee.findUnique({
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
exports.getFeeByIdController = getFeeByIdController;
const updateFeeController = async (req, res) => {
    const { feeId } = req.params;
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body is empty" });
    }
    const fee = await client_1.prisma.fee.findUnique({
        where: { fee_id: feeId },
    });
    if (!fee) {
        return res.status(404).json({ message: "Fee not found" });
    }
    // ❌ لا تعدّل Fee مدفوعة
    if (fee.status === client_2.FeeStatus.Paid) {
        return res.status(400).json({
            message: "Paid fee cannot be modified",
        });
    }
    // ✅ Whitelist
    const allowedFields = ["amount", "due_date"];
    const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    const updatedFee = await client_1.prisma.fee.update({
        where: { fee_id: feeId },
        data,
    });
    return res.json(updatedFee);
};
exports.updateFeeController = updateFeeController;
const markFeeAsPaidController = async (req, res) => {
    const admin = req.user;
    const { feeId } = req.params;
    const fee = await client_1.prisma.fee.findUnique({
        where: { fee_id: feeId },
    });
    if (!fee) {
        return res.status(404).json({ message: "Fee not found" });
    }
    if (fee.status === client_2.FeeStatus.Paid) {
        return res.status(400).json({
            message: "Fee already paid",
        });
    }
    const updatedFee = await client_1.prisma.fee.update({
        where: { fee_id: feeId },
        data: {
            status: client_2.FeeStatus.Paid,
            paid_at: new Date(),
            payment_method: "Cash", // أو من req.body
            reference_code: `PAY-${Date.now()}`,
        },
    });
    res.json(updatedFee);
};
exports.markFeeAsPaidController = markFeeAsPaidController;
const deleteFeeController = async (req, res) => {
    const fee = await client_1.prisma.fee.findUnique({
        where: { fee_id: req.params.feeId },
    });
    if (!fee) {
        return res.status(404).json({ message: "Fee not found" });
    }
    // ❌ لا تحذف Fee مدفوعة
    if (fee.status === client_2.FeeStatus.Paid) {
        return res.status(400).json({
            message: "Paid fee cannot be deleted",
        });
    }
    await client_1.prisma.fee.delete({
        where: { fee_id: req.params.feeId },
    });
    return res.json({ message: "Fee deleted successfully" });
};
exports.deleteFeeController = deleteFeeController;
/* ======================================================
   Documents
====================================================== */
const getAllDocumentsController = async (_, res) => {
    const documents = await client_1.prisma.document.findMany({
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
exports.getAllDocumentsController = getAllDocumentsController;
const getDocumentByIdController = async (req, res) => {
    const { documentId } = req.params;
    const document = await client_1.prisma.document.findUnique({
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
exports.getDocumentByIdController = getDocumentByIdController;
const deleteDocumentController = async (req, res) => {
    const { documentId } = req.params;
    const document = await client_1.prisma.document.findUnique({
        where: { document_id: documentId },
    });
    if (!document) {
        return res.status(404).json({ message: "Document not found" });
    }
    /**
     * 🗑️ حذف الملف من التخزين (local أو cloud)
     */
    const filePath = path_1.default.join(process.cwd(), document.file_path);
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
    /**
     * 🗑️ حذف السجل من DB
     */
    await client_1.prisma.document.delete({
        where: { document_id: documentId },
    });
    res.json({ message: "Document deleted successfully" });
};
exports.deleteDocumentController = deleteDocumentController;
/* ======================================================
   ENROLLMENTS
====================================================== */
const getAllEnrollmentsController = async (_, res) => {
    const enrollments = await client_1.prisma.enrollment.findMany({
        include: {
            student: true,
            course: true,
            fees: true,
        },
        orderBy: { enrollment_date: "desc" },
    });
    res.json(enrollments);
};
exports.getAllEnrollmentsController = getAllEnrollmentsController;
const getEnrollmentByIdController = async (req, res) => {
    const enrollment = await client_1.prisma.enrollment.findUnique({
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
exports.getEnrollmentByIdController = getEnrollmentByIdController;
const validateEnrollmentController = async (req, res) => {
    const admin = req.user;
    const { enrollmentId } = req.params;
    const enrollment = await client_1.prisma.enrollment.findUnique({
        where: { enrollment_id: enrollmentId },
    });
    if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
    }
    if (enrollment.registration_status !== client_2.RegistrationStatus.Pending) {
        return res.status(400).json({
            message: "Only pending enrollments can be validated",
        });
    }
    const updated = await client_1.prisma.$transaction(async (tx) => {
        await tx.registrationHistory.create({
            data: {
                enrollment_id: enrollmentId,
                old_status: enrollment.registration_status,
                new_status: client_2.RegistrationStatus.Validated,
                changed_by: admin?.user_id,
            },
        });
        return tx.enrollment.update({
            where: { enrollment_id: enrollmentId },
            data: { registration_status: client_2.RegistrationStatus.Validated },
        });
    });
    res.json(updated);
};
exports.validateEnrollmentController = validateEnrollmentController;
const rejectEnrollmentController = async (req, res) => {
    const admin = req.user;
    const { enrollmentId } = req.params;
    const enrollment = await client_1.prisma.enrollment.findUnique({
        where: { enrollment_id: enrollmentId },
    });
    if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
    }
    if (enrollment.registration_status !== client_2.RegistrationStatus.Pending) {
        return res.status(400).json({
            message: "Only pending enrollments can be rejected",
        });
    }
    const updated = await client_1.prisma.$transaction(async (tx) => {
        await tx.registrationHistory.create({
            data: {
                enrollment_id: enrollmentId,
                old_status: enrollment.registration_status,
                new_status: client_2.RegistrationStatus.Rejected,
                changed_by: admin?.user_id,
            },
        });
        return tx.enrollment.update({
            where: { enrollment_id: enrollmentId },
            data: { registration_status: client_2.RegistrationStatus.Rejected },
        });
    });
    res.json(updated);
};
exports.rejectEnrollmentController = rejectEnrollmentController;
const markEnrollmentPaidController = async (req, res) => {
    const admin = req.user;
    const { enrollmentId } = req.params;
    const enrollment = await client_1.prisma.enrollment.findUnique({
        where: { enrollment_id: enrollmentId },
    });
    if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
    }
    if (enrollment.registration_status !== client_2.RegistrationStatus.Validated) {
        return res.status(400).json({
            message: "Enrollment must be validated before payment",
        });
    }
    const updated = await client_1.prisma.$transaction(async (tx) => {
        await tx.registrationHistory.create({
            data: {
                enrollment_id: enrollmentId,
                old_status: enrollment.registration_status,
                new_status: client_2.RegistrationStatus.Paid,
                changed_by: admin?.user_id,
            },
        });
        return tx.enrollment.update({
            where: { enrollment_id: enrollmentId },
            data: { registration_status: client_2.RegistrationStatus.Paid },
        });
    });
    res.json(updated);
};
exports.markEnrollmentPaidController = markEnrollmentPaidController;
const finishEnrollmentController = async (req, res) => {
    const admin = req.user;
    const { enrollmentId } = req.params;
    const enrollment = await client_1.prisma.enrollment.findUnique({
        where: { enrollment_id: enrollmentId },
    });
    if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
    }
    if (enrollment.registration_status !== client_2.RegistrationStatus.Paid) {
        return res.status(400).json({
            message: "Only paid enrollments can be finished",
        });
    }
    const updated = await client_1.prisma.$transaction(async (tx) => {
        await tx.registrationHistory.create({
            data: {
                enrollment_id: enrollmentId,
                old_status: enrollment.registration_status,
                new_status: client_2.RegistrationStatus.Finished,
                changed_by: admin?.user_id,
            },
        });
        return tx.enrollment.update({
            where: { enrollment_id: enrollmentId },
            data: { registration_status: client_2.RegistrationStatus.Finished },
        });
    });
    res.json(updated);
};
exports.finishEnrollmentController = finishEnrollmentController;
/* ======================================================
   SESSIONS
====================================================== */
const createSessionController = async (req, res) => {
    const { course_id, teacher_id, group_id, session_date, topic } = req.body;
    // 1️⃣ Validation
    if (!course_id || !teacher_id || !group_id || !session_date) {
        return res.status(400).json({
            message: "course_id, teacher_id, group_id and session_date are required",
        });
    }
    // 2️⃣ Check relations
    const [course, teacher, group] = await Promise.all([
        client_1.prisma.course.findUnique({ where: { course_id } }),
        client_1.prisma.teacher.findUnique({ where: { teacher_id } }),
        client_1.prisma.group.findUnique({ where: { group_id } }),
    ]);
    if (!course || !teacher || !group) {
        return res.status(400).json({
            message: "Invalid course, teacher or group",
        });
    }
    // 3️⃣ Prevent schedule conflict (teacher)
    const conflict = await client_1.prisma.session.findFirst({
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
    const session = await client_1.prisma.session.create({
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
exports.createSessionController = createSessionController;
const getAllSessionsController = async (_req, res) => {
    const sessions = await client_1.prisma.session.findMany({
        include: {
            course: true,
            teacher: true,
            group: true,
        },
        orderBy: { session_date: "desc" },
    });
    res.json(sessions);
};
exports.getAllSessionsController = getAllSessionsController;
const getSessionByIdController = async (req, res) => {
    const session = await client_1.prisma.session.findUnique({
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
exports.getSessionByIdController = getSessionByIdController;
const updateSessionController = async (req, res) => {
    const { sessionId } = req.params;
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body is empty" });
    }
    const allowedFields = ["session_date", "topic"];
    const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    const session = await client_1.prisma.session.update({
        where: { session_id: sessionId },
        data,
    });
    res.json(session);
};
exports.updateSessionController = updateSessionController;
const deleteSessionController = async (req, res) => {
    const session = await client_1.prisma.session.findUnique({
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
    await client_1.prisma.session.delete({
        where: { session_id: req.params.sessionId },
    });
    res.json({ message: "Session deleted successfully" });
};
exports.deleteSessionController = deleteSessionController;
/* ======================================================
   ATTENDANCE
====================================================== */
const markAttendanceController = async (req, res) => {
    const { sessionId } = req.params;
    const { studentId, status } = req.body;
    if (!studentId || !status) {
        return res.status(400).json({
            message: "studentId and status are required",
        });
    }
    if (!Object.values(client_2.AttendanceStatus).includes(status)) {
        return res.status(400).json({
            message: "Invalid attendance status",
        });
    }
    const session = await client_1.prisma.session.findUnique({
        where: { session_id: sessionId },
    });
    if (!session) {
        return res.status(404).json({ message: "Session not found" });
    }
    const student = await client_1.prisma.student.findUnique({
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
    const attendance = await client_1.prisma.attendance.upsert({
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
exports.markAttendanceController = markAttendanceController;
const getAttendanceBySessionController = async (req, res) => {
    const attendance = await client_1.prisma.attendance.findMany({
        where: { session_id: req.params.sessionId },
        include: { student: true },
        orderBy: { student: { first_name: "asc" } },
    });
    res.json(attendance);
};
exports.getAttendanceBySessionController = getAttendanceBySessionController;
const getAttendanceByStudentController = async (req, res) => {
    const attendance = await client_1.prisma.attendance.findMany({
        where: { student_id: req.params.studentId },
        include: { session: true },
        orderBy: { session: { session_date: "desc" } },
    });
    res.json(attendance);
};
exports.getAttendanceByStudentController = getAttendanceByStudentController;
const updateAttendanceController = async (req, res) => {
    const { attendanceId } = req.params;
    if (!req.body.status) {
        return res.status(400).json({
            message: "status is required",
        });
    }
    if (!Object.values(client_2.AttendanceStatus).includes(req.body.status)) {
        return res.status(400).json({
            message: "Invalid attendance status",
        });
    }
    const attendance = await client_1.prisma.attendance.update({
        where: { attendance_id: attendanceId },
        data: {
            status: req.body.status,
        },
    });
    res.json(attendance);
};
exports.updateAttendanceController = updateAttendanceController;
/* ======================================================
   EXAMS
====================================================== */
const createExamController = async (req, res) => {
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
    const course = await client_1.prisma.course.findUnique({
        where: { course_id },
    });
    if (!course) {
        return res.status(400).json({ message: "Invalid course_id" });
    }
    const exam = await client_1.prisma.exam.create({
        data: {
            course_id,
            exam_name,
            exam_date: new Date(exam_date),
            max_marks,
        },
    });
    res.status(201).json(exam);
};
exports.createExamController = createExamController;
const getAllExamsController = async (_, res) => {
    const exams = await client_1.prisma.exam.findMany({
        include: { course: true },
        orderBy: { exam_date: "desc" },
    });
    res.json(exams);
};
exports.getAllExamsController = getAllExamsController;
const getExamByIdController = async (req, res) => {
    const exam = await client_1.prisma.exam.findUnique({
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
exports.getExamByIdController = getExamByIdController;
const updateExamController = async (req, res) => {
    const { examId } = req.params;
    const exam = await client_1.prisma.exam.findUnique({
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
    const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    const updated = await client_1.prisma.exam.update({
        where: { exam_id: examId },
        data,
    });
    res.json(updated);
};
exports.updateExamController = updateExamController;
const deleteExamController = async (req, res) => {
    const exam = await client_1.prisma.exam.findUnique({
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
    await client_1.prisma.exam.delete({
        where: { exam_id: req.params.examId },
    });
    res.json({ message: "Exam deleted successfully" });
};
exports.deleteExamController = deleteExamController;
/* ======================================================
   RESULTS
====================================================== */
const addExamResultsController = async (req, res) => {
    const { examId } = req.params;
    const { studentId, marks_obtained, grade } = req.body;
    if (!studentId || marks_obtained == null) {
        return res.status(400).json({
            message: "studentId and marks_obtained are required",
        });
    }
    const exam = await client_1.prisma.exam.findUnique({
        where: { exam_id: examId },
    });
    if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
    }
    const student = await client_1.prisma.student.findUnique({
        where: { student_id: studentId },
    });
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    // ✅ تحقق أن الطالب مسجل في الكورس
    const enrollment = await client_1.prisma.enrollment.findUnique({
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
    const result = await client_1.prisma.result.upsert({
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
exports.addExamResultsController = addExamResultsController;
const getResultsByExamController = async (req, res) => {
    const results = await client_1.prisma.result.findMany({
        where: { exam_id: req.params.examId },
        include: { student: true },
    });
    res.json(results);
};
exports.getResultsByExamController = getResultsByExamController;
const getResultsByStudentController = async (req, res) => {
    const results = await client_1.prisma.result.findMany({
        where: { student_id: req.params.studentId },
        include: { exam: true },
    });
    res.json(results);
};
exports.getResultsByStudentController = getResultsByStudentController;
const updateResultController = async (req, res) => {
    const { resultId } = req.params;
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body is empty" });
    }
    const allowedFields = ["marks_obtained", "grade"];
    const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    const result = await client_1.prisma.result.update({
        where: { result_id: resultId },
        data,
    });
    res.json(result);
};
exports.updateResultController = updateResultController;
/* ======================================================
   PERMISSIONS
====================================================== */
const createPermissionController = async (req, res) => {
    const { name, description } = req.body;
    if (!name?.trim()) {
        return res.status(400).json({
            message: "Permission name is required",
        });
    }
    const exists = await client_1.prisma.permission.findUnique({
        where: { name: name.trim() },
    });
    if (exists) {
        return res.status(409).json({
            message: "Permission already exists",
        });
    }
    const permission = await client_1.prisma.permission.create({
        data: {
            name: name.trim(),
            description: description?.trim() || null,
        },
    });
    res.status(201).json(permission);
};
exports.createPermissionController = createPermissionController;
const getAllPermissionsController = async (_req, res) => {
    const permissions = await client_1.prisma.permission.findMany({
        orderBy: { name: "asc" },
    });
    res.json(permissions);
};
exports.getAllPermissionsController = getAllPermissionsController;
const assignPermissionToStudentController = async (req, res) => {
    const { studentId } = req.params;
    const { permissionId } = req.body;
    if (!permissionId) {
        return res.status(400).json({
            message: "permissionId is required",
        });
    }
    const [student, permission] = await Promise.all([
        client_1.prisma.student.findUnique({ where: { student_id: studentId } }),
        client_1.prisma.permission.findUnique({ where: { permission_id: permissionId } }),
    ]);
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
    }
    // منع التكرار
    const exists = await client_1.prisma.studentPermission.findUnique({
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
    const assignment = await client_1.prisma.studentPermission.create({
        data: {
            student_id: studentId,
            permission_id: permissionId,
        },
    });
    res.status(201).json(assignment);
};
exports.assignPermissionToStudentController = assignPermissionToStudentController;
const removePermissionFromStudentController = async (req, res) => {
    const { studentId, permissionId } = req.params;
    const exists = await client_1.prisma.studentPermission.findUnique({
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
    await client_1.prisma.studentPermission.delete({
        where: {
            student_id_permission_id: {
                student_id: studentId,
                permission_id: permissionId,
            },
        },
    });
    res.json({ message: "Permission removed successfully" });
};
exports.removePermissionFromStudentController = removePermissionFromStudentController;
/* ======================================================
   DASHBOARD
====================================================== */
const getAdminDashboardStatsController = async (_, res) => {
    const [students, teachers, courses, unpaidFees, genderStats] = await Promise.all([
        client_1.prisma.student.count(),
        client_1.prisma.teacher.count(),
        client_1.prisma.course.count(),
        client_1.prisma.fee.aggregate({
            where: { status: "Unpaid" },
            _sum: { amount: true },
        }),
        client_1.prisma.student.groupBy({
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
exports.getAdminDashboardStatsController = getAdminDashboardStatsController;
const getStudentsReportController = async (_, res) => {
    const students = await client_1.prisma.student.findMany({
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
exports.getStudentsReportController = getStudentsReportController;
const getGroupsReportController = async (_, res) => {
    const groups = await client_1.prisma.group.findMany({
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
exports.getGroupsReportController = getGroupsReportController;
const getPaymentsReportController = async (_, res) => {
    const fees = await client_1.prisma.fee.findMany({
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
exports.getPaymentsReportController = getPaymentsReportController;
const getAttendanceReportController = async (_, res) => {
    const attendance = await client_1.prisma.attendance.groupBy({
        by: ["status"],
        _count: { status: true },
    });
    const data = {
        present: attendance.find((a) => a.status === "Present")?._count.status || 0,
        absent: attendance.find((a) => a.status === "Absent")?._count.status || 0,
    };
    res.json(data);
};
exports.getAttendanceReportController = getAttendanceReportController;
const getEnrollmentsReportController = async (_, res) => {
    const enrollments = await client_1.prisma.enrollment.groupBy({
        by: ["registration_status"],
        _count: { registration_status: true },
    });
    const data = {
        Pending: enrollments.find((e) => e.registration_status === "Pending")?._count
            .registration_status || 0,
        Validated: enrollments.find((e) => e.registration_status === "Validated")?._count
            .registration_status || 0,
        Paid: enrollments.find((e) => e.registration_status === "Paid")?._count
            .registration_status || 0,
        Finished: enrollments.find((e) => e.registration_status === "Finished")?._count
            .registration_status || 0,
        Rejected: enrollments.find((e) => e.registration_status === "Rejected")?._count
            .registration_status || 0,
    };
    res.json(data);
};
exports.getEnrollmentsReportController = getEnrollmentsReportController;
//# sourceMappingURL=admin.controller.js.map