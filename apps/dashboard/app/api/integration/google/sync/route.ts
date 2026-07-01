import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '../../../../../lib/session';
import { runSearchConsoleSync } from '../../../../../lib/google';

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

    const { force } = (await request.json().catch(() => ({}))) || {};

    // Trigger sync
    const result = await runSearchConsoleSync(Boolean(force));

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Sync failed' }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      duration: result.duration,
      rowsSynced: result.rowsSynced
    });
  } catch (error: any) {
    console.error('[Sync Route] Failed:', error);
    return NextResponse.json({ error: error.message || 'Synchronization failed' }, { status: 500 });
  }
}
