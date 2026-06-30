import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyPassword } from '../../../lib/auth';
import { signSession } from '../../../lib/session';
import { logAudit, logError } from '../../../lib/logger';

export async function POST(request: Request) {
  // Extract client IP address from standard headers
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown';

  try {
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!password) {
      logAudit('ADMIN_LOGIN_FAILED', ip, { reason: 'Missing password input parameter.' });
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
    }

    const isValid = verifyPassword(password);
    if (!isValid) {
      logAudit('ADMIN_LOGIN_FAILED', ip, { reason: 'Incorrect password entered.' });
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    const token = await signSession({ role: 'admin' });
    
    // In Next.js 15, cookies() is asynchronous and must be awaited
    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    logAudit('ADMIN_LOGIN_SUCCESS', ip);
    return NextResponse.json({ success: true });
  } catch (error) {
    logError('ADMIN_LOGIN_EXCEPTION', error, ip);
    return NextResponse.json({ error: 'An unexpected authentication error occurred.' }, { status: 500 });
  }
}
