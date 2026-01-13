"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const student_controller_1 = require("../../controllers/student/student.controller");
const router = (0, express_1.Router)();
router.post("/course-requests", auth_middleware_1.authMiddleware, student_controller_1.studentCourseRequestController);
exports.default = router;
//# sourceMappingURL=student.route.js.map