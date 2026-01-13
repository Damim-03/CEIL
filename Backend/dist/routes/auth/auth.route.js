"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const app_config_1 = require("../../config/app.config");
const auth_controller_1 = require("../../controllers/auth/auth.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const failedUrl = `${app_config_1.config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`;
const authRoutes = (0, express_1.Router)();
/**
 * PUBLIC AUTH
 */
authRoutes.post("/register", auth_controller_1.registerUserController); // STUDENT / TEACHER
authRoutes.post("/login", auth_controller_1.loginController);
authRoutes.post("/refresh", auth_controller_1.refreshController);
/**
 * PROTECTED
 */
authRoutes.get("/me", auth_middleware_1.authMiddleware, auth_controller_1.meController);
authRoutes.post("/logout", auth_middleware_1.authMiddleware, auth_controller_1.logOutController);
/**
 * GOOGLE OAUTH
 */
authRoutes.get("/google", passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
}));
authRoutes.get("/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: failedUrl,
    session: false,
}), auth_controller_1.googleLoginCallback);
exports.default = authRoutes;
//# sourceMappingURL=auth.route.js.map