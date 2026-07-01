import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '../../../../../lib/session';
import { setGoogleIntegrationSiteProperty } from '../../../../../lib/google';

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

    const { siteProperty } = await request.json();
    if (!siteProperty || typeof siteProperty !== 'string') {
      return NextResponse.json({ error: 'Invalid siteProperty parameter' }, { status: 400 });
    }

    await setGoogleIntegrationSiteProperty(siteProperty.trim());

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Update Site Property] Failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to update site property' }, { status: 500 });
  }
}
