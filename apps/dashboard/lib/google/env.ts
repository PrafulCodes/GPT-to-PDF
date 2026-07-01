import { GOOGLE_SEARCH_CONSOLE_SCOPE, type GoogleOAuthConfig } from './types';
import { config } from '../config';

export function getGoogleOAuthConfig(): GoogleOAuthConfig {
  return {
    clientId: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    redirectUri: config.GOOGLE_REDIRECT_URI,
    refreshToken: config.GOOGLE_REFRESH_TOKEN || null,
  };
}

export function getGoogleOAuthScope(): string {
  return GOOGLE_SEARCH_CONSOLE_SCOPE;
}
