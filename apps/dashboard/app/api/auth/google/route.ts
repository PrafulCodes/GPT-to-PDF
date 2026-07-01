import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logAudit, logError } from '../../../../lib/logger';
import { verifySession } from '../../../../lib/session';
import { buildGoogleOAuthAuthorizationUrl, createGoogleOAuthState, getGoogleOAuthConfig, GOOGLE_STATE_COOKIE_NAME } from '../../../../lib/google';

export const runtime = 'nodejs';

function getRequestIp(request: Request): string {
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

export async function GET(request: Request) {
  const ip = getRequestIp(request);

  try {
    const isValidAdminSession = await hasValidAdminSession();
    if (!isValidAdminSession) {
      logAudit('GOOGLE_OAUTH_UNAUTHORIZED', ip, { reason: 'Missing or invalid admin session.' });
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url), { status: 303 });
    }

    const config = getGoogleOAuthConfig();
    const oauthState = createGoogleOAuthState();
    const authUrl = buildGoogleOAuthAuthorizationUrl(config, { state: oauthState, issuedAt: Date.now() });

    const response = NextResponse.redirect(authUrl, { status: 303 });
    response.cookies.set(GOOGLE_STATE_COOKIE_NAME, oauthState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60,
    });

    logAudit('GOOGLE_OAUTH_STARTED', ip, {
      clientIdSuffix: config.clientId.slice(-6),
      redirectUri: config.redirectUri,
    });

    return response;
  } catch (error) {
    logError('GOOGLE_OAUTH_START_FAILED', error, ip);
    return NextResponse.redirect(new URL('/settings/integrations?google=error&reason=oauth-start-failed', request.url), { status: 303 });
  }
}
