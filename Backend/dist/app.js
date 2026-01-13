"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_config_1 = require("./config/app.config");
const errorHandler_middleware_1 = require("./middlewares/errorHandler.middleware");
const http_config_1 = require("./config/http/http.config");
const asyncHandler_middleware_1 = require("./middlewares/asyncHandler.middleware");
const mainRoutes_1 = __importDefault(require("./routes/mainRoutes"));
require("./config/passport/passport.config");
const app = (0, express_1.default)();
const BASE_PATH = app_config_1.config.BASE_PATH;
app.use((0, cors_1.default)({
    origin: app_config_1.config.FRONTEND_ORIGIN,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/api", mainRoutes_1.default);
app.use(errorHandler_middleware_1.errorHandler);
app.use((0, cookie_session_1.default)({
    name: "session",
    keys: [app_config_1.config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    secure: app_config_1.config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
}));
app.get(`${BASE_PATH || "/"}`, (0, asyncHandler_middleware_1.asyncHandler)(async (_, res) => {
    res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Hello World!",
    });
}));
app.listen(app_config_1.config.PORT, async () => {
    console.log(`🚀 Server is running on port ${app_config_1.config.PORT} in ${app_config_1.config.NODE_ENV} mode`);
});
//# sourceMappingURL=app.js.map