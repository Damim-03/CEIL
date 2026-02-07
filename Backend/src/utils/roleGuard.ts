import { Request, Response, NextFunction } from "express";
import { JwtUser } from "../middlewares/auth.middleware";
import { PermissionType, RoleType } from "../enums/role.enum";
import { RolePermissions } from "../enums/role.enum";

/**
 * ✅ FIXED: Admin now bypasses all permission checks
 *
 * This fixes the 403 error on /api/admin/sessions/:sessionId/attendance
 */
export const roleGuard =
  (requiredPermissions: PermissionType[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: JwtUser }).user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ CRITICAL FIX: Admin bypasses all permission checks
    if (user.role === "ADMIN") {
      return next();
    }

    // ✅ For other roles (TEACHER, STUDENT), check permissions
    const permissions = RolePermissions[user.role as RoleType];

    if (!permissions) {
      return res.status(403).json({ message: "Invalid role" });
    }

    const hasPermission = requiredPermissions.every((permission) =>
      permissions.includes(permission),
    );

    if (!hasPermission) {
      return res.status(403).json({
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
