import { Request, Response, NextFunction } from "express";
import { JwtUser } from "../middlewares/auth.middleware";
import { PermissionType, RoleType } from "../enums/role.enum";
import { RolePermissions } from "../enums/role.enum";

/**
 * ✅ UPDATED: OWNER and ADMIN both bypass all permission checks
 */
export const roleGuard =
  (requiredPermissions: PermissionType[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: JwtUser }).user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ OWNER bypasses all permission checks - has full system access
    if (user.role === "OWNER") {
      return next();
    }

    // ✅ ADMIN bypasses all permission checks (existing behavior)
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

/**
 * ✅ NEW: Middleware that allows only OWNER role
 */
export const ownerOnly =
  () => (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: JwtUser }).user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.role !== "OWNER") {
      return res.status(403).json({
        message: "Forbidden: only OWNER can access this resource",
      });
    }

    return next();
  };

/**
 * ✅ NEW: Middleware that allows OWNER or ADMIN
 */
export const adminOrOwner =
  () => (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: JwtUser }).user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Forbidden: only OWNER or ADMIN can access this resource",
      });
    }

    return next();
  };
