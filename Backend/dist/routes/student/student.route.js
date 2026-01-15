"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("../../controllers/student/student.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const upload_middleware_1 = require("../../middlewares/upload.middleware");
const studentRoutes = (0, express_1.Router)();
/* ================= PROFILE ================= */
studentRoutes.get("/me/profile", student_controller_1.getMyProfile);
studentRoutes.put("/profile", auth_middleware_1.authMiddleware, student_controller_1.updateMyStudentProfile);
studentRoutes.post("/documents", auth_middleware_1.authMiddleware, upload_middleware_1.upload.single("file"), student_controller_1.uploadDocumentController);
studentRoutes.get("/documents", auth_middleware_1.authMiddleware, student_controller_1.getMyDocumentsController);
exports.default = studentRoutes;
//# sourceMappingURL=student.route.js.map