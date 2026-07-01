import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '../../../../../lib/session';
import { clearGoogleRefreshToken } from '../../../../../lib/google';

export const runtime = 'nodejs';

async function hasValidAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token) {
    return false;
  }

  const payload = await verifySession(token);
  return Boolean(payload && payload.role === 'admin');
}

export async function POST(request: NextRequest) {
  try {
    if (!(await hasValidAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clearGoogleRefreshToken();

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Disconnect GSC] Failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to disconnect integration' }, { status: 500 });
  }
}
