import { warnDeprecated } from './google/warnings';

function getEnv(standardKey: string, legacyKey?: string): string | undefined {
  const standardVal = process.env[standardKey]?.trim();
  if (standardVal !== undefined && standardVal !== '') {
    return standardVal;
  }
  if (legacyKey) {
    const legacyVal = process.env[legacyKey]?.trim();
    if (legacyVal !== undefined && legacyVal !== '') {
      warnDeprecated(legacyKey, standardKey);
      return legacyVal;
    }
  }
  return undefined;
}

// 1. Required startup validation
const DATABASE_URL = getEnv('DATABASE_URL');
if (!DATABASE_URL) {
  throw new Error('Configuration Error: Missing required environment variable "DATABASE_URL".');
}

const SESSION_SECRET = getEnv('SESSION_SECRET', 'JWT_SECRET');
if (!SESSION_SECRET) {
  throw new Error('Configuration Error: Missing required environment variable "SESSION_SECRET".');
}

const ADMIN_PASSWORD_HASH = getEnv('ADMIN_PASSWORD_HASH');
if (!ADMIN_PASSWORD_HASH) {
  throw new Error('Configuration Error: Missing required environment variable "ADMIN_PASSWORD_HASH".');
}

const GOOGLE_CLIENT_ID = getEnv('GOOGLE_CLIENT_ID', 'CLIENT_ID');
if (!GOOGLE_CLIENT_ID) {
  throw new Error('Configuration Error: Missing required environment variable "GOOGLE_CLIENT_ID".');
}

const GOOGLE_CLIENT_SECRET = getEnv('GOOGLE_CLIENT_SECRET');
if (!GOOGLE_CLIENT_SECRET) {
  throw new Error('Configuration Error: Missing required environment variable "GOOGLE_CLIENT_SECRET".');
}

const GOOGLE_REDIRECT_URI = getEnv('GOOGLE_REDIRECT_URI');
if (!GOOGLE_REDIRECT_URI) {
  throw new Error('Configuration Error: Missing required environment variable "GOOGLE_REDIRECT_URI".');
}

// 2. Format validation
try {
  const url = new URL(GOOGLE_REDIRECT_URI);
  if (!url.pathname.endsWith('/api/auth/google/callback')) {
    throw new Error('Redirect URI pathname must end with "/api/auth/google/callback"');
  }
} catch (err: any) {
  throw new Error(
    `Configuration Error: Invalid GOOGLE_REDIRECT_URI "${GOOGLE_REDIRECT_URI}". Reason: ${err.message || 'Must be a valid absolute URL'}`
  );
}

const GOOGLE_SITE_PROPERTY = getEnv('GOOGLE_SITE_PROPERTY', 'GOOGLE_SEARCH_CONSOLE_SITE_PROPERTY');
if (GOOGLE_SITE_PROPERTY) {
  const isValid = GOOGLE_SITE_PROPERTY.startsWith('https://') || GOOGLE_SITE_PROPERTY.startsWith('sc-domain:');
  if (!isValid) {
    throw new Error(
      `Configuration Error: Invalid GOOGLE_SITE_PROPERTY format "${GOOGLE_SITE_PROPERTY}". Must start with "https://" or "sc-domain:".`
    );
  }
}

const GOOGLE_REFRESH_TOKEN = getEnv('GOOGLE_REFRESH_TOKEN');

export const config = {
  DATABASE_URL,
  SESSION_SECRET,
  ADMIN_PASSWORD_HASH,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_SITE_PROPERTY: GOOGLE_SITE_PROPERTY || undefined,
  GOOGLE_REFRESH_TOKEN: GOOGLE_REFRESH_TOKEN || undefined,
};
export type AppConfig = typeof config;
