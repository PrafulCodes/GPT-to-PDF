import { URLSearchParams } from 'node:url';
import {
  GOOGLE_OAUTH_AUTHORIZATION_URL,
  GOOGLE_OAUTH_TOKEN_URL,
  GOOGLE_SEARCH_CONSOLE_SCOPE,
  type GoogleOAuthConfig,
  type GoogleOAuthStatePayload,
  type GoogleOAuthTokenExchangeResult,
  type GoogleOAuthTokenResponse,
} from './types';

export function buildGoogleOAuthAuthorizationUrl(config: Pick<GoogleOAuthConfig, 'clientId' | 'redirectUri'>, state: GoogleOAuthStatePayload): URL {
  const { clientId, redirectUri } = config;

  const url = new URL(GOOGLE_OAUTH_AUTHORIZATION_URL);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', GOOGLE_SEARCH_CONSOLE_SCOPE);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('include_granted_scopes', 'false');
  url.searchParams.set('state', state.state);
  return url;
}

export async function exchangeGoogleOAuthCode(code: string, config: GoogleOAuthConfig): Promise<GoogleOAuthTokenExchangeResult> {
  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const payload = (await response.json().catch(() => ({}))) as GoogleOAuthTokenResponse;

  if (!response.ok) {
    const error = payload.error_description || payload.error || `Token exchange failed with status ${response.status}.`;
    throw new Error(error);
  }

  if (!payload.access_token || typeof payload.expires_in !== 'number') {
    throw new Error('Google token exchange response was missing required fields.');
  }

  return {
    accessToken: payload.access_token,
    expiresIn: payload.expires_in,
    refreshToken: payload.refresh_token || null,
    scope: payload.scope ? payload.scope.split(' ').filter(Boolean) : [GOOGLE_SEARCH_CONSOLE_SCOPE],
    tokenType: payload.token_type || 'Bearer',
  };
}

export async function refreshGoogleOAuthAccessToken(refreshToken: string, config: GoogleOAuthConfig): Promise<GoogleOAuthTokenExchangeResult> {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'refresh_token',
  });

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const payload = (await response.json().catch(() => ({}))) as GoogleOAuthTokenResponse;

  if (!response.ok) {
    const error = payload.error_description || payload.error || `Token refresh failed with status ${response.status}.`;
    throw new Error(error);
  }

  if (!payload.access_token || typeof payload.expires_in !== 'number') {
    throw new Error('Google refresh response was missing required fields.');
  }

  return {
    accessToken: payload.access_token,
    expiresIn: payload.expires_in,
    refreshToken: payload.refresh_token || refreshToken,
    scope: payload.scope ? payload.scope.split(' ').filter(Boolean) : [GOOGLE_SEARCH_CONSOLE_SCOPE],
    tokenType: payload.token_type || 'Bearer',
  };
}
