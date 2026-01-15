import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma/client";
import { config } from "../../config/app.config";
import { Roles } from "../../enums/role.enum";
import { hashPassword, verifyPassword } from "../../utils/password.util";
import { JwtUser } from "../../middlewares/auth.middleware";

/**
 * =========================
 * REGISTER (EMAIL + PASSWORD)
 * =========================
 */
export const registerUserController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    // 🔐 TRANSACTION
    const user = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create USER (STUDENT by default)
      const createdUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: Roles.STUDENT,
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

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      config.SESSION_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Registration failed" });
  }
};

/**
 * =========================
 * LOGIN (EMAIL + PASSWORD)
 * =========================
 */
export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔐 ACCESS TOKEN (short-lived)
    const accessToken = jwt.sign(
      { user_id: user.user_id, role: user.role },
      config.SESSION_SECRET,
      { expiresIn: "15m" }
    );

    // 🔁 REFRESH TOKEN (long-lived) — IMPORTANT
    const refreshToken = jwt.sign(
      { user_id: user.user_id, role: user.role },
      config.REFRESH_SECRET, // ✅ MUST be this
      { expiresIn: "7d" }
    );

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
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
};

/**
 * =========================
 * LOGOUT
 * =========================
 * Stateless JWT → handled on frontend
 */
export const logOutController = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  return res.status(200).json({ message: "Logged out successfully" });
};

/**
 * =========================
 * GOOGLE LOGIN CALLBACK
 * =========================
 */
export const googleLoginCallback = async (req: any, res: Response) => {
  try {
    const googleUser = req.user;

    if (!googleUser) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
      );
    }

    const { id, email, avatar } = googleUser;

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ google_id: id }, ...(email ? [{ email }] : [])],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          google_id: id,
          google_avatar: avatar,
          role: Roles.STUDENT,
        },
      });
    }

    if (user && !user.google_id) {
      user = await prisma.user.update({
        where: { user_id: user.user_id },
        data: {
          google_id: id,
          google_avatar: avatar,
        },
      });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      config.SESSION_SECRET,
      { expiresIn: "1d" }
    );

    return res.redirect(
      `${config.FRONTEND_GOOGLE_CALLBACK_URL}?token=${token}&status=success`
    );
  } catch {
    return res.redirect(
      `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
    );
  }
};

export const meController = async (req: Request, res: Response) => {
  const jwtUser = (req as Request & { user?: JwtUser }).user;

  if (!jwtUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
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

export const refreshController = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      config.REFRESH_SECRET // ✅ MUST match login
    ) as JwtUser;

    const newAccessToken = jwt.sign(
      { user_id: payload.user_id, role: payload.role },
      config.SESSION_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({ token: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};
