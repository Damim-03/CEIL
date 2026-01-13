"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("../prisma/client");
const app_config_1 = require("../config/app.config");
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
        // 1️⃣ Verify JWT
        const decoded = jsonwebtoken_1.default.verify(token, app_config_1.config.SESSION_SECRET);
        // 2️⃣ Fetch user from DB
        const user = await client_1.prisma.user.findUnique({
            where: { user_id: decoded.user_id },
            select: {
                user_id: true,
                role: true,
                is_active: true,
            },
        });
        // 3️⃣ Validate user
        if (!user || !user.is_active) {
            return res.status(403).json({
                message: "Account is disabled or does not exist",
            });
        }
        // (Optional but strong security)
        if (decoded.role !== user.role) {
            return res.status(401).json({
                message: "Invalid token",
            });
        }
        // 4️⃣ Attach user to request
        req.user = {
            user_id: user.user_id,
            role: user.role,
        };
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map