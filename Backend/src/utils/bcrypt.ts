import bcrypt from "bcrypt";

/**
 * Number of salt rounds
 * 10–12 is recommended for production
 */
const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 */
export const hashPassword = async (
  password: string
): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare plain password with hashed password
 * Returns false if hash does not exist (Google users)
 */
export const verifyPassword = async (
  password: string,
  hashedPassword?: string | null
): Promise<boolean> => {
  if (!hashedPassword) return false;
  return bcrypt.compare(password, hashedPassword);
};
