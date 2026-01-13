import bcrypt from "bcrypt";

/**
 * Recommended bcrypt salt rounds
 * 10–12 is safe for production
 */
const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 * Always store the HASH, never the raw password
 */
export const hashPassword = async (
  password: string
): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verify a password against a stored hash
 * Returns false if:
 *  - password hash does not exist (Google users)
 *  - password is invalid
 */
export const verifyPassword = async (
  password: string,
  hashedPassword?: string | null
): Promise<boolean> => {
  if (!hashedPassword) return false;
  return bcrypt.compare(password, hashedPassword);
};
