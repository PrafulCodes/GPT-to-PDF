import crypto from 'node:crypto';
import { db, Prisma } from '@repo/db';
import { logAudit, logError } from '../logger';
import type { GoogleIntegrationStatus, GoogleRefreshTokenSource } from './types';
import { config } from '../config';

const GOOGLE_INTEGRATION_PROVIDER = 'google_search_console';

type EncryptedRefreshTokenPayload = {
  iv: string;
  tag: string;
  ciphertext: string;
};

function getEncryptionKey(): Buffer {
  const secretMaterial = [config.GOOGLE_CLIENT_SECRET, config.SESSION_SECRET]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .join('::');

  if (!secretMaterial) {
    throw new Error('Unable to derive Google token encryption key. GOOGLE_CLIENT_SECRET or SESSION_SECRET must be configured.');
  }

  return crypto.createHash('sha256').update(secretMaterial).digest();
}

function encryptRefreshToken(refreshToken: string): EncryptedRefreshTokenPayload {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const ciphertext = Buffer.concat([cipher.update(refreshToken, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
}

function decryptRefreshToken(payload: EncryptedRefreshTokenPayload): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(payload.iv, 'base64');
  const tag = Buffer.from(payload.tag, 'base64');
  const ciphertext = Buffer.from(payload.ciphertext, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

function getEnvRefreshToken(): string | null {
  return config.GOOGLE_REFRESH_TOKEN || null;
}

async function readIntegrationRow() {
  return await db.integration.findUnique({
    where: { provider: GOOGLE_INTEGRATION_PROVIDER },
  });
}

export async function getGoogleRefreshTokenSource(): Promise<GoogleRefreshTokenSource> {
  const row = await readIntegrationRow();
  if (row?.encryptedCredential && row.credentialIv && row.credentialTag) {
    return 'database';
  }

  return getEnvRefreshToken() ? 'env' : 'none';
}

export async function getGoogleRefreshToken(): Promise<string | null> {
  const row = await readIntegrationRow();
  if (row?.encryptedCredential && row.credentialIv && row.credentialTag) {
    return decryptRefreshToken({
      iv: row.credentialIv,
      tag: row.credentialTag,
      ciphertext: row.encryptedCredential,
    });
  }

  const envRefreshToken = getEnvRefreshToken();
  if (!envRefreshToken) {
    return null;
  }

  await storeGoogleRefreshToken(envRefreshToken);
  return envRefreshToken;
}

export async function storeGoogleRefreshToken(refreshToken: string): Promise<void> {
  const encrypted = encryptRefreshToken(refreshToken);

  try {
    await db.integration.upsert({
      where: { provider: GOOGLE_INTEGRATION_PROVIDER },
      create: {
        provider: GOOGLE_INTEGRATION_PROVIDER,
        status: 'CONNECTED',
        encryptedCredential: encrypted.ciphertext,
        credentialIv: encrypted.iv,
        credentialTag: encrypted.tag,
        credentialVersion: 1,
        connectedAt: new Date(),
      },
      update: {
        status: 'CONNECTED',
        encryptedCredential: encrypted.ciphertext,
        credentialIv: encrypted.iv,
        credentialTag: encrypted.tag,
        credentialVersion: 1,
        connectedAt: new Date(),
        lastError: null,
      },
    });

    logAudit('GOOGLE_REFRESH_TOKEN_RECEIVED');
  } catch (error) {
    logError('GOOGLE_REFRESH_TOKEN_STORE_FAILED', error);
    throw error;
  }
}

export async function clearGoogleRefreshToken(): Promise<void> {
  try {
    await db.integration.upsert({
      where: { provider: GOOGLE_INTEGRATION_PROVIDER },
      create: {
        provider: GOOGLE_INTEGRATION_PROVIDER,
        status: 'NOT_CONNECTED',
        encryptedCredential: null,
        credentialIv: null,
        credentialTag: null,
        credentialVersion: 1,
        metadata: Prisma.DbNull,
      },
      update: {
        status: 'NOT_CONNECTED',
        encryptedCredential: null,
        credentialIv: null,
        credentialTag: null,
        connectedAt: null,
        metadata: Prisma.DbNull,
        lastSuccessfulSync: null,
        lastFailedSync: null,
        lastError: null,
      },
    });

    delete process.env.GOOGLE_REFRESH_TOKEN;
  } catch (error) {
    logError('GOOGLE_REFRESH_TOKEN_CLEAR_FAILED', error);
    throw error;
  }
}

export async function getGoogleIntegrationStatus(): Promise<GoogleIntegrationStatus> {
  const refreshToken = await getGoogleRefreshToken();
  const refreshTokenSource = await getGoogleRefreshTokenSource();
  const row = await readIntegrationRow();
  const metadata = (row?.metadata as Record<string, any>) || {};
  const siteProperty = metadata.siteProperty || config.GOOGLE_SITE_PROPERTY || 'Not configured';

  return {
    connectionStatus: refreshToken ? 'CONNECTED' : 'NOT_CONNECTED',
    refreshTokenAvailable: Boolean(refreshToken),
    refreshTokenSource,
    siteProperty,
    lastSyncLabel: row?.lastSuccessfulSync ? row.lastSuccessfulSync.toISOString() : 'Never',
  };
}

export async function setGoogleIntegrationSiteProperty(siteProperty: string): Promise<void> {
  const row = await readIntegrationRow();
  const existingMetadata = (row?.metadata as Record<string, any>) || {};
  
  await db.integration.upsert({
    where: { provider: GOOGLE_INTEGRATION_PROVIDER },
    create: {
      provider: GOOGLE_INTEGRATION_PROVIDER,
      metadata: { ...existingMetadata, siteProperty },
    },
    update: {
      metadata: { ...existingMetadata, siteProperty },
    },
  });
}

