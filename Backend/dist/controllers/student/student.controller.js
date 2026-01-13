"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentCourseRequestController = void 0;
const client_1 = require("../../prisma/client");
const studentCourseRequestController = async (req, res) => {
    const studentId = req.user.student_id;
    const { courseId, level } = req.body;
    if (!studentId) {
        return res.status(403).json({ message: "Not a student" });
    }
    if (!courseId) {
        return res.status(400).json({ message: "Course is required" });
    }
    // منع التكرار
    const exists = await client_1.prisma.enrollment.findUnique({
        where: {
            student_id_course_id: {
                student_id: studentId,
                course_id: courseId,
            },
        },
    });
    if (exists) {
        return res
            .status(400)
            .json({ message: "Already requested or enrolled" });
    }
    const enrollment = await client_1.prisma.enrollment.create({
        data: {
            student_id: studentId,
            course_id: courseId,
            level,
            status: "pending",
        },
    });
    res.status(201).json({
        message: "Request sent successfully",
        enrollment,
    });
};
exports.studentCourseRequestController = studentCourseRequestController;
//# sourceMappingURL=student.controller.js.map