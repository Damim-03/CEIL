"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * Recommended bcrypt salt rounds
 * 10–12 is safe for production
 */
const SALT_ROUNDS = 12;
/**
 * Hash a plain text password
 * Always store the HASH, never the raw password
 */
const hashPassword = async (password) => {
    return bcrypt_1.default.hash(password, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
/**
 * Verify a password against a stored hash
 * Returns false if:
 *  - password hash does not exist (Google users)
 *  - password is invalid
 */
const verifyPassword = async (password, hashedPassword) => {
    if (!hashedPassword)
        return false;
    return bcrypt_1.default.compare(password, hashedPassword);
};
exports.verifyPassword = verifyPassword;
//# sourceMappingURL=password.util.js.map