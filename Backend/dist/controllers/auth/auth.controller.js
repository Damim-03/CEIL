"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshController = exports.meController = exports.googleLoginCallback = exports.logOutController = exports.loginController = exports.registerUserController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("../../prisma/client");
const app_config_1 = require("../../config/app.config");
const role_enum_1 = require("../../enums/role.enum");
const password_util_1 = require("../../utils/password.util");
/**
 * =========================
 * REGISTER (EMAIL + PASSWORD)
 * =========================
 */
const registerUserController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }
        const existingUser = await client_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        const hashedPassword = await (0, password_util_1.hashPassword)(password);
        // 🔐 TRANSACTION
        const user = await client_1.prisma.$transaction(async (tx) => {
            // 1️⃣ Create USER (STUDENT by default)
            const createdUser = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: role_enum_1.Roles.STUDENT,
                },
            });
            // 2️⃣ Create STUDENT profile
            const student = await tx.student.create({
                data: {
                    user_id: createdUser.user_id, // ✅ الآن صحيح
                    first_name: "",
                    last_name: "",
                },
            });
            // 3️⃣ Link USER ↔ STUDENT
            await tx.user.update({
                where: { user_id: createdUser.user_id },
                data: { student_id: student.student_id },
            });
            return createdUser;
        });
        const token = jsonwebtoken_1.default.sign({ user_id: user.user_id, role: user.role }, app_config_1.config.SESSION_SECRET, { expiresIn: "1d" });
        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Registration failed" });
    }
};
exports.registerUserController = registerUserController;
/**
 * =========================
 * LOGIN (EMAIL + PASSWORD)
 * =========================
 */
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }
        const user = await client_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isValid = await (0, password_util_1.verifyPassword)(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // 🔐 ACCESS TOKEN (short-lived)
        const accessToken = jsonwebtoken_1.default.sign({ user_id: user.user_id, role: user.role }, app_config_1.config.SESSION_SECRET, { expiresIn: "15m" });
        // 🔁 REFRESH TOKEN (long-lived) — IMPORTANT
        const refreshToken = jsonwebtoken_1.default.sign({ user_id: user.user_id, role: user.role }, app_config_1.config.REFRESH_SECRET, // ✅ MUST be this
        { expiresIn: "7d" });
        // ✅ DEV / POSTMAN RESPONSE
        return res.json({
            message: "Login successful",
            token: accessToken,
            refreshToken, // 👈 THIS is what you paste into /auth/refresh
            user: {
                user_id: user.user_id,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Login failed" });
    }
};
exports.loginController = loginController;
/**
 * =========================
 * LOGOUT
 * =========================
 * Stateless JWT → handled on frontend
 */
const logOutController = async (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
        await client_1.prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });
    }
    return res.status(200).json({ message: "Logged out successfully" });
};
exports.logOutController = logOutController;
/**
 * =========================
 * GOOGLE LOGIN CALLBACK
 * =========================
 */
const googleLoginCallback = async (req, res) => {
    try {
        const googleUser = req.user;
        if (!googleUser) {
            return res.redirect(`${app_config_1.config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`);
        }
        const { id, email, avatar } = googleUser;
        let user = await client_1.prisma.user.findFirst({
            where: {
                OR: [{ google_id: id }, ...(email ? [{ email }] : [])],
            },
        });
        if (!user) {
            user = await client_1.prisma.user.create({
                data: {
                    email,
                    google_id: id,
                    google_avatar: avatar,
                    role: role_enum_1.Roles.STUDENT,
                },
            });
        }
        if (user && !user.google_id) {
            user = await client_1.prisma.user.update({
                where: { user_id: user.user_id },
                data: {
                    google_id: id,
                    google_avatar: avatar,
                },
            });
        }
        const token = jsonwebtoken_1.default.sign({ user_id: user.user_id, role: user.role }, app_config_1.config.SESSION_SECRET, { expiresIn: "1d" });
        return res.redirect(`${app_config_1.config.FRONTEND_GOOGLE_CALLBACK_URL}?token=${token}&status=success`);
    }
    catch {
        return res.redirect(`${app_config_1.config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`);
    }
};
exports.googleLoginCallback = googleLoginCallback;
const meController = async (req, res) => {
    const jwtUser = req.user;
    if (!jwtUser) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await client_1.prisma.user.findUnique({
        where: { user_id: jwtUser.user_id },
        select: {
            user_id: true,
            email: true,
            role: true,
            created_at: true,
        },
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
};
exports.meController = meController;
const refreshController = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(refreshToken, app_config_1.config.REFRESH_SECRET // ✅ MUST match login
        );
        const newAccessToken = jsonwebtoken_1.default.sign({ user_id: payload.user_id, role: payload.role }, app_config_1.config.SESSION_SECRET, { expiresIn: "15m" });
        return res.json({ token: newAccessToken });
    }
    catch (error) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
};
exports.refreshController = refreshController;
//# sourceMappingURL=auth.controller.js.map