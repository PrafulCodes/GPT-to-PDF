import { warnDeprecated } from './google/warnings';

// We want one deprecation warning per process per variable.
const warnedKeys = new Set<string>();

function getEnv(standardKey: string, legacyKey?: string): string | undefined {
  const standardVal = process.env[standardKey]?.trim();
  if (standardVal !== undefined && standardVal !== '') {
    return standardVal;
  }
  if (legacyKey) {
    const legacyVal = process.env[legacyKey]?.trim();
    if (legacyVal !== undefined && legacyVal !== '') {
      if (!warnedKeys.has(legacyKey)) {
        warnDeprecated(legacyKey, standardKey);
        warnedKeys.add(legacyKey);
      }
      return legacyVal;
    }
  }
  return undefined;
}

// 1. Required startup validation (Core Config)
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

export const coreConfig = {
  DATABASE_URL,
  SESSION_SECRET,
  ADMIN_PASSWORD_HASH,
};

// Exporting config for backwards compatibility with session/auth.
export const config = {
  ...coreConfig,
};
export type CoreConfig = typeof coreConfig;
export type AppConfig = CoreConfig; // For compatibility

// 2. Google Config (lazy-loaded and validated on demand)
export function getOptionalGoogleConfig() {
  return {
    GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID', 'CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: getEnv('GOOGLE_CLIENT_SECRET'),
    GOOGLE_REDIRECT_URI: getEnv('GOOGLE_REDIRECT_URI'),
    GOOGLE_SITE_PROPERTY: getEnv('GOOGLE_SITE_PROPERTY', 'GOOGLE_SEARCH_CONSOLE_SITE_PROPERTY'),
    GOOGLE_REFRESH_TOKEN: getEnv('GOOGLE_REFRESH_TOKEN'),
  };
}

export function getGoogleConfig() {
  const opt = getOptionalGoogleConfig();

  if (!opt.GOOGLE_CLIENT_ID) {
    throw new Error('Configuration Error: Missing required environment variable "GOOGLE_CLIENT_ID".');
  }

  if (!opt.GOOGLE_CLIENT_SECRET) {
    throw new Error('Configuration Error: Missing required environment variable "GOOGLE_CLIENT_SECRET".');
  }

  if (!opt.GOOGLE_REDIRECT_URI) {
    throw new Error('Configuration Error: Missing required environment variable "GOOGLE_REDIRECT_URI".');
  }

  try {
    const url = new URL(opt.GOOGLE_REDIRECT_URI);
    if (!url.pathname.endsWith('/api/auth/google/callback')) {
      throw new Error('Redirect URI pathname must end with "/api/auth/google/callback"');
    }
  } catch (err: any) {
    throw new Error(
      `Configuration Error: Invalid GOOGLE_REDIRECT_URI "${opt.GOOGLE_REDIRECT_URI}". Reason: ${err.message || 'Must be a valid absolute URL'}`
    );
  }

  if (opt.GOOGLE_SITE_PROPERTY) {
    const isValid = opt.GOOGLE_SITE_PROPERTY.startsWith('https://') || opt.GOOGLE_SITE_PROPERTY.startsWith('sc-domain:');
    if (!isValid) {
      throw new Error(
        `Configuration Error: Invalid GOOGLE_SITE_PROPERTY format "${opt.GOOGLE_SITE_PROPERTY}". Must start with "https://" or "sc-domain:".`
      );
    }
  }

  return {
    GOOGLE_CLIENT_ID: opt.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: opt.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: opt.GOOGLE_REDIRECT_URI,
    GOOGLE_SITE_PROPERTY: opt.GOOGLE_SITE_PROPERTY || undefined,
    GOOGLE_REFRESH_TOKEN: opt.GOOGLE_REFRESH_TOKEN || undefined,
  };
}
export type GoogleConfig = ReturnType<typeof getGoogleConfig>;
