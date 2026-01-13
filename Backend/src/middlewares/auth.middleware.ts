import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";
import { config } from "../config/app.config";

export type JwtUser = {
  user_id: string;
  role: string;
};

export type AuthenticatedRequest = Request & {
  user: JwtUser;
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 1️⃣ Verify JWT
    const decoded = jwt.verify(token, config.SESSION_SECRET) as JwtUser;

    // 2️⃣ Fetch user from DB
    const user = await prisma.user.findUnique({
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
    (req as AuthenticatedRequest).user = {
      user_id: user.user_id,
      role: user.role,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
