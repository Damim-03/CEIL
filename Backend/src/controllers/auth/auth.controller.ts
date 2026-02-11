import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma/client";
import { config } from "../../config/app.config";
import { Roles } from "../../enums/role.enum";
import { hashPassword, verifyPassword } from "../../utils/password.util";
import { Gender } from "../../../generated/prisma/client";
import { JwtUser } from "../../middlewares/auth.middleware";

/**
 * =========================
 * REGISTER (EMAIL + PASSWORD)
 * =========================
 */
export const registerUserController = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      gender,
      phone_number,
      nationality,
      education_level,
    } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        message: "Email, password, first name and last name are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: Roles.STUDENT,
          is_active: true,
        },
      });

      const student = await tx.student.create({
        data: {
          user_id: createdUser.user_id,
          first_name,
          last_name,
          gender: gender ? (gender.toUpperCase() as Gender) : null,
          phone_number,
          nationality,
          education_level,
          email,
        },
      });

      await tx.user.update({
        where: { user_id: createdUser.user_id },
        data: {
          student_id: student.student_id,
        },
      });

      return createdUser;
    });

    // 🔐 AUTO LOGIN (same as loginController)
    const accessToken = jwt.sign(
      { user_id: user.user_id, role: user.role },
      config.SESSION_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { user_id: user.user_id, role: user.role },
      config.REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: config.NODE_ENV === "production",
      path: "/",
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Registration failed",
    });
  }
};

/**
 * =========================
 * LOGIN (EMAIL + PASSWORD)
 * =========================
 */
export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password || !user.is_active) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = jwt.sign(
    { user_id: user.user_id, role: user.role },
    config.SESSION_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { user_id: user.user_id, role: user.role },
    config.REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: config.NODE_ENV === "production",
    path: "/",
  };

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  return res.json({ message: "Login successful" });
};

/**
 * =========================
 * LOGOUT
 * =========================
 * Stateless JWT → handled on frontend
 */
export const logOutController = async (_req: Request, res: Response) => {
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: config.NODE_ENV === "production",
    path: "/",
  };

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
    // 1️⃣ user جاي من passport
    const passportUser = req.user as any;

    if (!passportUser) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`,
      );
    }

    const { user_id, email, role } = passportUser;

    // 2️⃣ إنشاء JWTs
    const accessToken = jwt.sign({ user_id, role }, config.SESSION_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ user_id, role }, config.REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // 3️⃣ Access Token Cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000, // ✅ 15 دقيقة (يطابق JWT expiry)
    });

    // 4️⃣ Refresh Token Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // ✅ 7 أيام (يطابق JWT expiry)
    });

    // 5️⃣ Redirect نظيف للفرونت (بدون token في URL)
    return res.redirect(config.FRONTEND_GOOGLE_CALLBACK_URL);
  } catch (error) {
    console.error("Google login callback error:", error);
    return res.redirect(
      `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`,
    );
  }
};

export const meController = async (req: Request, res: Response) => {
  const jwtUser = (req as any).user;

  if (!jwtUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { user_id: jwtUser.user_id },
    select: {
      user_id: true,
      email: true,
      role: true,
      is_active: true,
      google_avatar: true,
      created_at: true,
    },
  });

  return res.json(user);
};

export const refreshController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken; // ✅ من الكوكي

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const payload = jwt.verify(refreshToken, config.REFRESH_SECRET) as JwtUser;

    const newAccessToken = jwt.sign(
      { user_id: payload.user_id, role: payload.role },
      config.SESSION_SECRET,
      { expiresIn: "1h" },
    );

    // 🔥 مهم جدًا: نعيد حفظه في cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: config.NODE_ENV === "production",
      path: "/",
    });

    return res.json({ message: "Access token refreshed" });
  } catch {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};
