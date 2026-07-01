import { SignJWT, jwtVerify } from 'jose';
import { config } from './config';

const key = new TextEncoder().encode(config.SESSION_SECRET);


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
