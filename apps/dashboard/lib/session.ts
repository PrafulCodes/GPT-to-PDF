import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || 'super_secret_session_signing_key_32_bytes_long';
const key = new TextEncoder().encode(JWT_SECRET);


/**
 * Signs a JWT session token with a 7-day expiration.
 * This runs in both Node.js and Edge runtimes.
 */
export async function signSession(payload: { role: string }): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

/**
 * Verifies a JWT session token signature and expiration.
 * This runs in both Node.js and Edge runtimes (including Next.js Middleware).
 */
export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}
