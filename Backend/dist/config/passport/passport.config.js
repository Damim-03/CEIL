"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_local_1 = require("passport-local");
const client_1 = require("../../prisma/client");
const app_config_1 = require("../app.config");
const appErros_1 = require("../../utils/appErros");
const role_enum_1 = require("../../enums/role.enum");
const password_util_1 = require("../../utils/password.util");
/**
 * =========================
 * GOOGLE STRATEGY (JWT, NO SESSION)
 * =========================
 */
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: app_config_1.config.GOOGLE_CLIENT_ID,
    clientSecret: app_config_1.config.GOOGLE_CLIENT_SECRET,
    callbackURL: app_config_1.config.GOOGLE_CALLBACK_URL,
    passReqToCallback: true,
}, async (_req, _accessToken, _refreshToken, profile, done) => {
    try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;
        if (!email) {
            throw new appErros_1.NotFoundException("Google account has no email");
        }
        if (!googleId) {
            throw new appErros_1.NotFoundException("Google ID is missing");
        }
        let user = await client_1.prisma.user.findFirst({
            where: {
                OR: [{ google_id: googleId }, ...(email ? [{ email }] : [])],
            },
        });
        if (!user) {
            user = await client_1.prisma.user.create({
                data: {
                    email,
                    google_id: googleId,
                    google_avatar: avatar,
                    role: role_enum_1.Roles.STUDENT,
                },
            });
        }
        if (user && !user.google_id) {
            user = await client_1.prisma.user.update({
                where: { user_id: user.user_id },
                data: {
                    google_id: googleId,
                    google_avatar: avatar,
                },
            });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, false);
    }
}));
/**
 * =========================
 * LOCAL STRATEGY (EMAIL + PASSWORD)
 * =========================
 */
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password",
    session: false,
}, async (email, password, done) => {
    try {
        const user = await client_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user || !user.password) {
            return done(null, false, {
                message: "Invalid credentials",
            });
        }
        const isValid = await (0, password_util_1.verifyPassword)(password, user.password);
        if (!isValid) {
            return done(null, false, {
                message: "Invalid credentials",
            });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, false);
    }
}));
//# sourceMappingURL=passport.config.js.map