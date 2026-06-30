import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logAudit, logError } from '../../../lib/logger';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown';

  try {
    // Clear session cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Immediately expires the cookie
    });

    logAudit('ADMIN_LOGOUT_SUCCESS', ip);
    return NextResponse.json({ success: true });
  } catch (error) {
    logError('ADMIN_LOGOUT_EXCEPTION', error, ip);
    return NextResponse.json({ error: 'An unexpected logout error occurred.' }, { status: 500 });
  }
}
