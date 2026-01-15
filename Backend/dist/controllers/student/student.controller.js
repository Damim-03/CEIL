"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyDocumentsController = exports.uploadDocumentController = exports.updateMyStudentProfile = exports.getMyProfile = void 0;
const client_1 = require("../../prisma/client");
const getMyProfile = async (req, res) => {
    const student = await client_1.prisma.student.findFirst({
        where: {
            user: {
                user_id: req.user.user_id, // ✅ الآن TypeScript يعرفه
            },
        },
        include: {
            group: true,
            user: {
                select: { email: true, role: true },
            },
        },
    });
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    return res.json(student);
};
exports.getMyProfile = getMyProfile;
const updateMyStudentProfile = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { first_name, last_name, date_of_birth, gender, phone_number, nationality, address, language, education_level, study_location, } = req.body;
    // 🔐 Validation أساسية
    if (!first_name?.trim() ||
        !last_name?.trim() ||
        !date_of_birth ||
        !gender ||
        !phone_number ||
        !nationality) {
        return res.status(400).json({
            message: "Missing required student profile fields",
        });
    }
    const updatedStudent = await client_1.prisma.student.update({
        where: { user_id: user.user_id },
        data: {
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            date_of_birth: new Date(date_of_birth),
            gender,
            phone_number,
            nationality,
            address,
            language,
            education_level,
            study_location,
        },
    });
    return res.json({
        message: "Profile updated successfully",
        student: updatedStudent,
    });
};
exports.updateMyStudentProfile = updateMyStudentProfile;
const uploadDocumentController = async (req, res) => {
    const user = req.user;
    if (!req.file) {
        return res.status(400).json({ message: "File is required" });
    }
    const { type } = req.body;
    if (!type) {
        return res.status(400).json({ message: "Document type is required" });
    }
    const student = await client_1.prisma.student.findUnique({
        where: { user_id: user.user_id },
    });
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    const document = await client_1.prisma.document.create({
        data: {
            student_id: student.student_id,
            type,
            file_path: req.file.path,
        },
    });
    return res.status(201).json({
        message: "Document uploaded successfully",
        document,
    });
};
exports.uploadDocumentController = uploadDocumentController;
const getMyDocumentsController = async (req, res) => {
    const user = req.user;
    const student = await client_1.prisma.student.findUnique({
        where: { user_id: user.user_id },
        include: { documents: true },
    });
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    return res.json(student.documents);
};
exports.getMyDocumentsController = getMyDocumentsController;
//# sourceMappingURL=student.controller.js.map