import bcrypt from 'bcryptjs';
import { config } from './config';

/**
 * Compares a plain password against the stored environment variable hash.
 * This must ONLY be called in Node.js runtime environments (like API routes).
 */
export function verifyPassword(password: string): boolean {
  const hash = config.ADMIN_PASSWORD_HASH;
  return bcrypt.compareSync(password, hash);
}
