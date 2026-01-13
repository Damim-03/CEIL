"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleGuard = void 0;
const role_enum_1 = require("../enums/role.enum");
const roleGuard = (requiredPermissions) => (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const permissions = role_enum_1.RolePermissions[user.role];
    if (!permissions) {
        return res.status(403).json({ message: "Invalid role" });
    }
    const hasPermission = requiredPermissions.every((permission) => permissions.includes(permission));
    if (!hasPermission) {
        return res.status(403).json({
            message: "You do not have permission to access this resource",
        });
    }
    next();
};
exports.roleGuard = roleGuard;
//# sourceMappingURL=roleGuard.js.map