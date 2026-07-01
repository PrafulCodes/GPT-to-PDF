import { GOOGLE_SEARCH_CONSOLE_SCOPE, type GoogleOAuthConfig } from './types';
import { getGoogleConfig } from '../config';

export function getGoogleOAuthConfig(): GoogleOAuthConfig {
  const googleConfig = getGoogleConfig();
  return {
    clientId: googleConfig.GOOGLE_CLIENT_ID,
    clientSecret: googleConfig.GOOGLE_CLIENT_SECRET,
    redirectUri: googleConfig.GOOGLE_REDIRECT_URI,
    refreshToken: googleConfig.GOOGLE_REFRESH_TOKEN || null,
  };
}

export function getGoogleOAuthScope(): string {
  return GOOGLE_SEARCH_CONSOLE_SCOPE;
}
