import crypto from 'node:crypto';

const GOOGLE_STATE_BYTES = 32;

export function createGoogleOAuthState(): string {
  return crypto.randomBytes(GOOGLE_STATE_BYTES).toString('base64url');
}

export function isGoogleOAuthStateValid(expectedState: string | undefined, receivedState: string | undefined): boolean {
  if (!expectedState || !receivedState) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedState);
  const receivedBuffer = Buffer.from(receivedState);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
