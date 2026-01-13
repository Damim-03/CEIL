"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAttendanceController = exports.getAttendanceByStudentController = exports.getAttendanceBySessionController = exports.markAttendanceController = exports.deleteSessionController = exports.updateSessionController = exports.getSessionByIdController = exports.getAllSessionsController = exports.createSessionController = exports.deleteEnrollmentController = exports.updateEnrollmentController = exports.getEnrollmentsByStudentController = exports.getAllEnrollmentsController = exports.createEnrollmentController = exports.markFeeAsPaidController = exports.deleteFeeController = exports.updateFeeController = exports.getFeeByIdController = exports.getAllFeesController = exports.createFeeController = exports.deleteGroupController = exports.updateGroupController = exports.getGroupByIdController = exports.getAllGroupsController = exports.createGroupController = exports.deleteDepartmentController = exports.updateDepartmentController = exports.getDepartmentByIdController = exports.getAllDepartmentsController = exports.createDepartmentController = exports.deleteCourseController = exports.updateCourseController = exports.getCourseByIdController = exports.getAllCoursesController = exports.createCourseController = exports.disableUserController = exports.enableUserController = exports.changeUserRoleController = exports.getUserByIdController = exports.getAllUsersController = exports.deleteTeacherController = exports.updateTeacherController = exports.getTeacherByIdController = exports.getAllTeachersController = exports.createTeacherController = exports.deleteStudentController = exports.updateStudentController = exports.getStudentByIdController = exports.getAllStudentsController = exports.createStudentController = void 0;
exports.getAdminDashboardStatsController = exports.removePermissionFromStudentController = exports.assignPermissionToStudentController = exports.getAllPermissionsController = exports.createPermissionController = exports.updateResultController = exports.getResultsByStudentController = exports.getResultsByExamController = exports.addExamResultsController = exports.deleteExamController = exports.updateExamController = exports.getExamByIdController = exports.getAllExamsController = exports.createExamController = void 0;
const client_1 = require("../../prisma/client");
const role_enum_1 = require("../../enums/role.enum");
/* ================= STUDENTS ================= */
const createStudentController = async (req, res) => {
    const { first_name, last_name, email, phone_number, nationality, language, education_level, study_location, } = req.body;
    if (!first_name?.trim() || !last_name?.trim()) {
        return res.status(400).json({
            message: "first_name and last_name are required",
        });
    }
    if (email) {
        const exists = await client_1.prisma.student.findFirst({ where: { email } });
        if (exists) {
            return res.status(409).json({
                message: "Student with this email already exists",
            });
        }
    }
    const student = await client_1.prisma.student.create({
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
exports.createStudentController = createStudentController;
const getAllStudentsController = async (_, res) => {
    return res.json(await client_1.prisma.student.findMany({
        include: {
            group: true,
            enrollments: { include: { course: true } },
        },
    }));
};
exports.getAllStudentsController = getAllStudentsController;
const getStudentByIdController = async (req, res) => {
    const student = await client_1.prisma.student.findUnique({
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
exports.getStudentByIdController = getStudentByIdController;
const updateStudentController = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body is empty" });
    }
    const exists = await client_1.prisma.student.findUnique({
        where: { student_id: req.params.studentId },
    });
    if (!exists) {
        return res.status(404).json({ message: "Student not found" });
    }
    const student = await client_1.prisma.student.update({
        where: { student_id: req.params.studentId },
        data: req.body,
    });
    return res.json(student);
};
exports.updateStudentController = updateStudentController;
const deleteStudentController = async (req, res) => {
    await client_1.prisma.student.delete({
        where: { student_id: req.params.studentId },
    });
    return res.json({ message: "Student deleted successfully" });
};
exports.deleteStudentController = deleteStudentController;
/* ================= TEACHERS ================= */
const createTeacherController = async (req, res) => {
    if (!req.body.first_name || !req.body.last_name) {
        return res.status(400).json({
            message: "first_name and last_name are required",
        });
    }
    const teacher = await client_1.prisma.teacher.create({ data: req.body });
    return res.status(201).json(teacher);
};
exports.createTeacherController = createTeacherController;
const getAllTeachersController = async (_, res) => {
    return res.json(await client_1.prisma.teacher.findMany());
};
exports.getAllTeachersController = getAllTeachersController;
const getTeacherByIdController = async (req, res) => {
    const teacher = await client_1.prisma.teacher.findUnique({
        where: { teacher_id: req.params.teacherId },
    });
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }
    return res.json(teacher);
};
exports.getTeacherByIdController = getTeacherByIdController;
const updateTeacherController = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body is empty" });
    }
    const teacher = await client_1.prisma.teacher.update({
        where: { teacher_id: req.params.teacherId },
        data: req.body,
    });
    return res.json(teacher);
};
exports.updateTeacherController = updateTeacherController;
const deleteTeacherController = async (req, res) => {
    await client_1.prisma.teacher.delete({
        where: { teacher_id: req.params.teacherId },
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
    // 1️⃣ تحقق من الدور
    if (!role || !Object.values(role_enum_1.Roles).includes(role)) {
        return res.status(400).json({ message: "Invalid role value" });
    }
    // 2️⃣ منع تغيير دور النفس
    if (admin?.user_id === userId) {
        return res.status(403).json({
            message: "You cannot change your own role",
        });
    }
    // 3️⃣ جلب المستخدم مع العلاقات
    const user = await client_1.prisma.user.findUnique({
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
    const updatedUser = await client_1.prisma.$transaction(async (tx) => {
        /**
         * =============================
         * STUDENT ➜ TEACHER
         * =============================
         */
        if (role === role_enum_1.Roles.TEACHER) {
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
                    role: role_enum_1.Roles.TEACHER,
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
        if (role === role_enum_1.Roles.STUDENT) {
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
                    role: role_enum_1.Roles.STUDENT,
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
        if (user.teacher_id && role === role_enum_1.Roles.ADMIN) {
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
                teacher_id: role === role_enum_1.Roles.ADMIN ? null : user.teacher_id,
            },
        });
    });
    return res.json({
        message: "User role updated successfully",
        user: updatedUser,
    });
};
exports.changeUserRoleController = changeUserRoleController;
const enableUserController = async (req, res) => {
    const user = await client_1.prisma.user.update({
        where: { user_id: req.params.userId },
        data: { is_active: true },
    });
    res.json({
        message: "User enabled successfully",
        data: user,
    });
};
exports.enableUserController = enableUserController;
const disableUserController = async (req, res) => {
    const user = await client_1.prisma.user.update({
        where: { user_id: req.params.userId },
        data: { is_active: false },
    });
    res.json({
        message: "User disabled successfully",
        data: user,
    });
};
exports.disableUserController = disableUserController;
/* ================= COURSES ================= */
const createCourseController = async (req, res) => {
    if (!req.body.course_name?.trim()) {
        return res.status(400).json({
            message: "course_name is required",
        });
    }
    const course = await client_1.prisma.course.create({ data: req.body });
    return res.status(201).json(course);
};
exports.createCourseController = createCourseController;
const getAllCoursesController = async (_, res) => {
    return res.json(await client_1.prisma.course.findMany({ include: { teacher: true } }));
};
exports.getAllCoursesController = getAllCoursesController;
const getCourseByIdController = async (req, res) => {
    const course = await client_1.prisma.course.findUnique({
        where: { course_id: req.params.courseId },
        include: { teacher: true },
    });
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    return res.json(course);
};
exports.getCourseByIdController = getCourseByIdController;
const updateCourseController = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body is empty" });
    }
    const course = await client_1.prisma.course.update({
        where: { course_id: req.params.courseId },
        data: req.body,
    });
    return res.json(course);
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
/* ================= FEES ================= */
const createFeeController = async (req, res) => {
    const { student_id, amount, due_date } = req.body;
    if (!student_id || !amount || !due_date) {
        return res.status(400).json({
            message: "student_id, amount and due_date are required",
        });
    }
    const studentExists = await client_1.prisma.student.findUnique({
        where: { student_id },
    });
    if (!studentExists) {
        return res.status(400).json({
            message: "Invalid student_id",
        });
    }
    const fee = await client_1.prisma.fee.create({ data: req.body });
    return res.status(201).json(fee);
};
exports.createFeeController = createFeeController;
const getAllFeesController = async (_, res) => {
    return res.json(await client_1.prisma.fee.findMany({ include: { student: true } }));
};
exports.getAllFeesController = getAllFeesController;
const getFeeByIdController = async (req, res) => {
    const fee = await client_1.prisma.fee.findUnique({
        where: { fee_id: req.params.feeId },
        include: { student: true },
    });
    if (!fee) {
        return res.status(404).json({ message: "Fee not found" });
    }
    return res.json(fee);
};
exports.getFeeByIdController = getFeeByIdController;
const updateFeeController = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body is empty" });
    }
    const fee = await client_1.prisma.fee.update({
        where: { fee_id: req.params.feeId },
        data: req.body,
    });
    return res.json(fee);
};
exports.updateFeeController = updateFeeController;
const deleteFeeController = async (req, res) => {
    await client_1.prisma.fee.delete({
        where: { fee_id: req.params.feeId },
    });
    return res.json({ message: "Fee deleted successfully" });
};
exports.deleteFeeController = deleteFeeController;
const markFeeAsPaidController = async (req, res) => {
    res.json(await client_1.prisma.fee.update({
        where: { fee_id: req.params.feeId },
        data: { status: "Paid" },
    }));
};
exports.markFeeAsPaidController = markFeeAsPaidController;
/* ======================================================
   ENROLLMENTS
====================================================== */
const createEnrollmentController = async (req, res) => {
    res.status(201).json(await client_1.prisma.enrollment.create({ data: req.body }));
};
exports.createEnrollmentController = createEnrollmentController;
const getAllEnrollmentsController = async (_, res) => {
    res.json(await client_1.prisma.enrollment.findMany({
        include: { student: true, course: true },
    }));
};
exports.getAllEnrollmentsController = getAllEnrollmentsController;
const getEnrollmentsByStudentController = async (req, res) => {
    res.json(await client_1.prisma.enrollment.findMany({
        where: { student_id: req.params.studentId },
    }));
};
exports.getEnrollmentsByStudentController = getEnrollmentsByStudentController;
const updateEnrollmentController = async (req, res) => {
    res.json(await client_1.prisma.enrollment.update({
        where: { enrollment_id: req.params.enrollmentId },
        data: req.body,
    }));
};
exports.updateEnrollmentController = updateEnrollmentController;
const deleteEnrollmentController = async (req, res) => {
    await client_1.prisma.enrollment.delete({
        where: { enrollment_id: req.params.enrollmentId },
    });
    res.status(204).send();
};
exports.deleteEnrollmentController = deleteEnrollmentController;
/* ======================================================
   SESSIONS
====================================================== */
const createSessionController = async (req, res) => {
    const session = await client_1.prisma.session.create({
        data: req.body,
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
    res.json(session);
};
exports.getSessionByIdController = getSessionByIdController;
const updateSessionController = async (req, res) => {
    const session = await client_1.prisma.session.update({
        where: { session_id: req.params.sessionId },
        data: req.body,
    });
    res.json(session);
};
exports.updateSessionController = updateSessionController;
const deleteSessionController = async (req, res) => {
    await client_1.prisma.session.delete({
        where: { session_id: req.params.sessionId },
    });
    res.status(204).send();
};
exports.deleteSessionController = deleteSessionController;
/* ======================================================
   ATTENDANCE
====================================================== */
const markAttendanceController = async (req, res) => {
    const { sessionId } = req.params;
    const { studentId, status } = req.body;
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
    });
    res.json(attendance);
};
exports.getAttendanceBySessionController = getAttendanceBySessionController;
const getAttendanceByStudentController = async (req, res) => {
    const attendance = await client_1.prisma.attendance.findMany({
        where: { student_id: req.params.studentId },
        include: { session: true },
    });
    res.json(attendance);
};
exports.getAttendanceByStudentController = getAttendanceByStudentController;
const updateAttendanceController = async (req, res) => {
    const attendance = await client_1.prisma.attendance.update({
        where: { attendance_id: req.params.attendanceId },
        data: req.body,
    });
    res.json(attendance);
};
exports.updateAttendanceController = updateAttendanceController;
/* ======================================================
   EXAMS
====================================================== */
const createExamController = async (req, res) => {
    const exam = await client_1.prisma.exam.create({
        data: req.body,
    });
    res.status(201).json(exam);
};
exports.createExamController = createExamController;
const getAllExamsController = async (_req, res) => {
    const exams = await client_1.prisma.exam.findMany({
        include: { course: true },
    });
    res.json(exams);
};
exports.getAllExamsController = getAllExamsController;
const getExamByIdController = async (req, res) => {
    const exam = await client_1.prisma.exam.findUnique({
        where: { exam_id: req.params.examId },
        include: { results: { include: { student: true } } },
    });
    res.json(exam);
};
exports.getExamByIdController = getExamByIdController;
const updateExamController = async (req, res) => {
    const exam = await client_1.prisma.exam.update({
        where: { exam_id: req.params.examId },
        data: req.body,
    });
    res.json(exam);
};
exports.updateExamController = updateExamController;
const deleteExamController = async (req, res) => {
    await client_1.prisma.exam.delete({
        where: { exam_id: req.params.examId },
    });
    res.status(204).send();
};
exports.deleteExamController = deleteExamController;
/* ======================================================
   RESULTS
====================================================== */
const addExamResultsController = async (req, res) => {
    const { examId } = req.params;
    const { studentId, marks_obtained, grade } = req.body;
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
    const result = await client_1.prisma.result.update({
        where: { result_id: req.params.resultId },
        data: req.body,
    });
    res.json(result);
};
exports.updateResultController = updateResultController;
/* ======================================================
   PERMISSIONS
====================================================== */
const createPermissionController = async (req, res) => {
    const permission = await client_1.prisma.permission.create({
        data: req.body,
    });
    res.status(201).json(permission);
};
exports.createPermissionController = createPermissionController;
const getAllPermissionsController = async (_req, res) => {
    const permissions = await client_1.prisma.permission.findMany();
    res.json(permissions);
};
exports.getAllPermissionsController = getAllPermissionsController;
const assignPermissionToStudentController = async (req, res) => {
    const { studentId } = req.params;
    const { permissionId } = req.body;
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
    await client_1.prisma.studentPermission.delete({
        where: {
            student_id_permission_id: {
                student_id: studentId,
                permission_id: permissionId,
            },
        },
    });
    res.status(204).send();
};
exports.removePermissionFromStudentController = removePermissionFromStudentController;
/* ======================================================
   DASHBOARD
====================================================== */
const getAdminDashboardStatsController = async (_, res) => {
    const [students, teachers, courses, unpaidFees, genderStats,] = await Promise.all([
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
//# sourceMappingURL=admin.controller.js.map