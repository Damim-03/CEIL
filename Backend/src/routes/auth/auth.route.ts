import { Router } from "express";
import passport from "passport";
import { config } from "../../config/app.config";
import {
  googleLoginCallback,
  googleMobileController,
  loginController,
  logOutController,
  meController,
  refreshController,
  registerUserController,
} from "../../controllers/auth/auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const failedUrl = `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`;

const authRoutes = Router();

/**
 * PUBLIC AUTH
 */
authRoutes.post("/register", registerUserController); // STUDENT / TEACHER
authRoutes.post("/login", loginController);
authRoutes.post("/refresh", refreshController);

authRoutes.post("/google/mobile", googleMobileController);

/**
 * PROTECTED
 */

authRoutes.get("/me", authMiddleware, meController);

authRoutes.post("/logout", authMiddleware, logOutController);

/**
 * GOOGLE OAUTH
 */
authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: failedUrl,
    session: false,
  }),
  googleLoginCallback
);

export default authRoutes;
