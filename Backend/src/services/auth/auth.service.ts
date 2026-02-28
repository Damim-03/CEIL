// ================================================================
// 📦 src/services/auth.service.ts
// ✅ Authentication business logic
// Token generation, user registration, credential verification
// ================================================================

import jwt from "jsonwebtoken";
import { prisma } from "../../prisma/client";
import { config } from "../../config/app.config";
import { Roles } from "../../enums/role.enum";
import { hashPassword, verifyPassword } from "../../utils/password.util";
import { Gender } from "../../../generated/prisma/client";

// ─── Types ───────────────────────────────────────────────

interface RegisterInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  gender?: string;
  phone_number?: string;
  nationality?: string;
  education_level?: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ─── TOKEN GENERATION ────────────────────────────────────

export function generateTokens(userId: string, role: string): TokenPair {
  const accessToken = jwt.sign(
    { user_id: userId, role },
    config.SESSION_SECRET,
    { expiresIn: "1h" },
  );

  const refreshToken = jwt.sign(
    { user_id: userId, role },
    config.REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  return { accessToken, refreshToken };
}

export function refreshAccessToken(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, config.REFRESH_SECRET) as {
      user_id: string;
      role: string;
    };

    const newAccessToken = jwt.sign(
      { user_id: payload.user_id, role: payload.role },
      config.SESSION_SECRET,
      { expiresIn: "1h" },
    );

    return { data: newAccessToken };
  } catch {
    return { error: "invalid_token" as const };
  }
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: config.NODE_ENV === "production",
    path: "/",
  };
}

// ─── REGISTER ────────────────────────────────────────────

export async function registerStudent(input: RegisterInput) {
  const {
    email,
    password,
    first_name,
    last_name,
    gender,
    phone_number,
    nationality,
    education_level,
  } = input;

  if (!email || !password || !first_name || !last_name) {
    return { error: "validation" as const };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "duplicate_email" as const };
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
      data: { student_id: student.student_id },
    });

    return createdUser;
  });

  return { data: user };
}

// ─── LOGIN ───────────────────────────────────────────────

export async function loginWithCredentials(email: string, password: string) {
  if (!email || !password) {
    return { error: "validation" as const };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password || !user.is_active) {
    return { error: "invalid_credentials" as const };
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return { error: "invalid_credentials" as const };
  }

  return { data: user };
}

// ─── GET CURRENT USER ────────────────────────────────────

export async function getCurrentUser(userId: string) {
  return prisma.user.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      email: true,
      role: true,
      is_active: true,
      google_avatar: true,
      created_at: true,
    },
  });
}
