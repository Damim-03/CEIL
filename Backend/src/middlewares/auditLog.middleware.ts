// ================================================================
// 📌 ملف: src/middlewares/auditLog.middleware.ts
// ================================================================

import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import { JwtUser } from "./auth.middleware";

/**
 * Helper function to log an audit event
 */
export const logAuditEvent = async (params: {
  user_id?: string;
  user_email?: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
}) => {
  try {
    // If we have user_id but no email, fetch it from DB
    let email = params.user_email || null;
    if (!email && params.user_id) {
      const user = await prisma.user.findUnique({
        where: { user_id: params.user_id },
        select: { email: true },
      });
      email = user?.email || null;
    }

    await prisma.auditLog.create({
      data: {
        user_id: params.user_id || null,
        user_email: email,
        user_role: params.user_role || null,
        action: params.action,
        entity_type: params.entity_type,
        entity_id: params.entity_id || null,
        details: params.details ? JSON.stringify(params.details) : null,
        ip_address: params.ip_address || null,
      },
    });
  } catch (error) {
    console.error("❌ Audit log error:", error);
  }
};

/**
 * Middleware factory for automatic audit logging
 */
export const auditLogMiddleware = (
  action: string,
  entityType: string,
  entityIdParam?: string,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const user = (req as any).user as JwtUser | undefined;
        const entityId = entityIdParam
          ? req.params[entityIdParam] ||
            body?.enrollment_id ||
            body?.student_id ||
            null
          : null;

        logAuditEvent({
          user_id: user?.user_id,
          user_role: user?.role,
          action,
          entity_type: entityType,
          entity_id: entityId,
          details: {
            method: req.method,
            path: req.originalUrl,
            status_code: res.statusCode,
          },
          ip_address:
            (req.headers["x-forwarded-for"] as string) ||
            req.socket.remoteAddress ||
            undefined,
        });
      }

      return originalJson(body);
    };

    next();
  };
};
