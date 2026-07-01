export const GOOGLE_SEARCH_CONSOLE_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
export const GOOGLE_OAUTH_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_REFRESH_TOKEN_FILE_NAME = 'google-refresh-token.enc';
export const GOOGLE_STATE_COOKIE_NAME = 'google_oauth_state';

export type GoogleRefreshTokenSource = 'env' | 'database' | 'none';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string | null;
}

export interface GoogleOAuthStatePayload {
  state: string;
  issuedAt: number;
}

export interface GoogleOAuthTokenExchangeResult {
  accessToken: string;
  expiresIn: number;
  refreshToken: string | null;
  scope: string[];
  tokenType: string;
}

export interface GoogleOAuthTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}

export interface GoogleRefreshTokenRecord {
  version: 1;
  iv: string;
  tag: string;
  ciphertext: string;
  createdAt: string;
}

export interface GoogleIntegrationStatus {
  connectionStatus: 'CONNECTED' | 'NOT_CONNECTED';
  refreshTokenAvailable: boolean;
  refreshTokenSource: GoogleRefreshTokenSource;
  siteProperty: string;
  lastSyncLabel: string;
}
