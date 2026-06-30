import bcrypt from 'bcryptjs';

/**
 * Compares a plain password against the stored environment variable hash.
 * This must ONLY be called in Node.js runtime environments (like API routes).
 */
export function verifyPassword(password: string): boolean {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    console.error('ADMIN_PASSWORD_HASH environment variable is not defined.');
    return false;
  }
  return bcrypt.compareSync(password, hash);
}
