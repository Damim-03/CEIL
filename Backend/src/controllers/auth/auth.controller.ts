// ================================================================
// 📌 src/controllers/auth/auth.controller.ts
// ✅ Refactored: Uses AuthService for business logic
// Cookie/HTTP handling stays in controller
// ================================================================

import { Request, Response } from "express";
import { config } from "../../config/app.config";
import * as AuthService from "../../services/auth/auth.service";
import { prisma } from "../../prisma/client";

/**
 * =========================
 * REGISTER (EMAIL + PASSWORD)
 * =========================
 */
export const registerUserController = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.registerStudent(req.body);

    if ("error" in result) {
      if (result.error === "validation")
        return res.status(400).json({
          message: "Email, password, first name and last name are required",
        });
      if (result.error === "duplicate_email")
        return res.status(409).json({ message: "User already exists" });
    }

    // 🔐 AUTO LOGIN
    const tokens = AuthService.generateTokens(
      result.data!.user_id,
      result.data!.role,
    );
    const cookieOptions = AuthService.getCookieOptions();

    res.cookie("accessToken", tokens.accessToken, cookieOptions);
    res.cookie("refreshToken", tokens.refreshToken, cookieOptions);

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
};

/**
 * =========================
 * LOGIN (EMAIL + PASSWORD)
 * =========================
 */
export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await AuthService.loginWithCredentials(email, password);

  if ("error" in result) {
    if (result.error === "validation")
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    if (result.error === "invalid_credentials")
      return res.status(401).json({ message: "Invalid credentials" });
  }

  const tokens = AuthService.generateTokens(
    result.data!.user_id,
    result.data!.role,
  );
  const cookieOptions = AuthService.getCookieOptions();

  res.cookie("accessToken", tokens.accessToken, cookieOptions);
  res.cookie("refreshToken", tokens.refreshToken, cookieOptions);

  const user = await AuthService.getCurrentUser(result.data!.user_id);

  return res.json({
    message: "Login successful",
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
};

/**
 * =========================
 * LOGOUT
 * =========================
 */
export const logOutController = async (_req: Request, res: Response) => {
  const cookieOptions = AuthService.getCookieOptions();

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res.json({ message: "Logged out" });
};

/**
 * =========================
 * GOOGLE LOGIN CALLBACK
 * =========================
 */
export const googleLoginCallback = async (req: Request, res: Response) => {
  try {
    const passportUser = req.user as any;

    if (!passportUser) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`,
      );
    }

    const { user_id, role } = passportUser;
    const tokens = AuthService.generateTokens(user_id, role);

    // Access Token Cookie
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    // Refresh Token Cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(config.FRONTEND_GOOGLE_CALLBACK_URL);
  } catch (error) {
    console.error("Google login callback error:", error);
    return res.redirect(
      `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`,
    );
  }
};

/**
 * =========================
 * ME (current user)
 * =========================
 */
export const meController = async (req: Request, res: Response) => {
  const jwtUser = (req as any).user;

  if (!jwtUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await AuthService.getCurrentUser(jwtUser.user_id);
  return res.json(user);
};

/**
 * =========================
 * REFRESH TOKEN
 * =========================
 */
export const refreshController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  const result = AuthService.refreshAccessToken(refreshToken);

  if ("error" in result) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  res.cookie("accessToken", result.data, AuthService.getCookieOptions());
  return res.json({ message: "Access token refreshed" });
};

/**
 * =========================
 * GOOGLE LOGIN — MOBILE
 * يستقبل Google accessToken ويرجع JWT tokens
 * =========================
 */

// ✅ أضف الـ type
interface GoogleUserInfo {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  picture: string;
  name: string;
}

export const googleMobileController = async (req: Request, res: Response) => {
  try {
    const { accessToken: googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ message: "Google token is required" });
    }

    const googleRes = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleToken}`,
    );

    if (!googleRes.ok) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const googleUser = (await googleRes.json()) as {
      id: string;
      email: string;
      given_name: string;
      family_name: string;
      picture: string;
    };

    const result = await AuthService.loginOrRegisterWithGoogle({
      email: googleUser.email,
      firstName: googleUser.given_name || googleUser.email.split("@")[0],
      lastName: googleUser.family_name || "",
      avatar: googleUser.picture,
      googleId: googleUser.id,
    });

    if ("error" in result) {
      return res.status(403).json({ message: "Google login failed" });
    }

    const tokens = AuthService.generateTokens(
      result.data!.user_id,
      result.data!.role,
    );

    // ✅ جلب بيانات المستخدم مع الـ student
    const user = await prisma.user.findUnique({
      where: { user_id: result.data!.user_id },
      select: {
        user_id: true,
        email: true,
        role: true,
        google_avatar: true,
        student: {
          select: {
            student_id: true,
            first_name: true,
            last_name: true,
            email: true,
            avatar_url: true,
            phone_number: true,
          },
        },
      },
    });

    return res.json({
      message: "Google login successful",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    });
  } catch (error) {
    console.error("Google mobile login error:", error);
    return res.status(500).json({ message: "Google login failed" });
  }
};
