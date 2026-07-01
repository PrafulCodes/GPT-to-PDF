import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logAudit, logError } from '../../../../../lib/logger';
import { verifySession } from '../../../../../lib/session';
import {
  exchangeGoogleOAuthCode,
  getGoogleOAuthConfig,
  GOOGLE_STATE_COOKIE_NAME,
  isGoogleOAuthStateValid,
  storeGoogleRefreshToken,
} from '../../../../../lib/google';

export const runtime = 'nodejs';

function getRequestIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown';
}

async function hasValidAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token) {
    return false;
  }

  const payload = await verifySession(token);
  return Boolean(payload && payload.role === 'admin');
}

export async function GET(request: NextRequest) {
  const ip = getRequestIp(request);
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(GOOGLE_STATE_COOKIE_NAME)?.value;
  const { searchParams } = request.nextUrl;
  const error = searchParams.get('error');
  const code = searchParams.get('code');
  const receivedState = searchParams.get('state') || undefined;

  const clearStateCookie = (response: NextResponse): NextResponse => {
    response.cookies.set(GOOGLE_STATE_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  };

  const buildFailureRedirect = (reason: string): NextResponse => {
    const redirectUrl = new URL('/settings/integrations', request.url);
    redirectUrl.searchParams.set('google', 'error');
    redirectUrl.searchParams.set('reason', reason);
    return clearStateCookie(NextResponse.redirect(redirectUrl, { status: 303 }));
  };

  try {
    if (!(await hasValidAdminSession())) {
      logAudit('GOOGLE_OAUTH_CALLBACK_UNAUTHORIZED', ip, { reason: 'Missing or invalid admin session.' });
      return buildFailureRedirect('unauthorized');
    }

    if (error) {
      logAudit('GOOGLE_OAUTH_CALLBACK_DENIED', ip, { reason: error });
      return buildFailureRedirect(error);
    }

    if (!code || !receivedState) {
      logAudit('GOOGLE_OAUTH_CALLBACK_INVALID', ip, { reason: 'Missing code or state query parameter.' });
      return buildFailureRedirect('missing-code-or-state');
    }

    if (!isGoogleOAuthStateValid(stateCookie, receivedState)) {
      logAudit('GOOGLE_OAUTH_CALLBACK_INVALID_STATE', ip, { reason: 'CSRF state mismatch.' });
      return buildFailureRedirect('invalid-state');
    }

    const config = getGoogleOAuthConfig();
    const tokenResponse = await exchangeGoogleOAuthCode(code, config);
    const refreshToken = tokenResponse.refreshToken || config.refreshToken;

    if (!refreshToken) {
      logAudit('GOOGLE_OAUTH_CALLBACK_MISSING_REFRESH_TOKEN', ip, { reason: 'Google did not return a refresh token.' });
      return buildFailureRedirect('missing-refresh-token');
    }

    await storeGoogleRefreshToken(refreshToken);

    logAudit('GOOGLE_OAUTH_COMPLETED', ip, {
      expiresIn: tokenResponse.expiresIn,
      tokenType: tokenResponse.tokenType,
      scopeCount: tokenResponse.scope.length,
    });

    const redirectUrl = new URL('/settings/integrations', request.url);
    redirectUrl.searchParams.set('google', 'connected');
    return clearStateCookie(NextResponse.redirect(redirectUrl, { status: 303 }));
  } catch (error) {
    logError('GOOGLE_OAUTH_CALLBACK_FAILED', error, ip);
    return buildFailureRedirect('oauth-callback-failed');
  }
}
