"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * Number of salt rounds
 * 10–12 is recommended for production
 */
const SALT_ROUNDS = 12;
/**
 * Hash a plain text password
 */
const hashPassword = async (password) => {
    return bcrypt_1.default.hash(password, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
/**
 * Compare plain password with hashed password
 * Returns false if hash does not exist (Google users)
 */
const verifyPassword = async (password, hashedPassword) => {
    if (!hashedPassword)
        return false;
    return bcrypt_1.default.compare(password, hashedPassword);
};
exports.verifyPassword = verifyPassword;
//# sourceMappingURL=bcrypt.js.map