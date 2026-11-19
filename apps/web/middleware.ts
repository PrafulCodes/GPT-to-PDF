import { NextRequest, NextResponse } from 'next/server';

const CANONICAL_HOST = 'www.gpttopdf.site';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host)
    .split(',')[0]
    .trim()
    .toLowerCase();
  const protocol = (request.headers.get('x-forwarded-proto') || url.protocol.replace(':', ''))
    .split(',')[0]
    .trim()
    .toLowerCase();

  let changed = false;

  if (host !== CANONICAL_HOST || protocol !== 'https') {
    url.protocol = 'https:';
    url.hostname = CANONICAL_HOST;
    url.port = '';
    changed = true;
  }

  for (const key of Array.from(url.searchParams.keys())) {
    const normalizedKey = key.toLowerCase();
    if (
      normalizedKey === 'ref' ||
      normalizedKey === 'fbclid' ||
      normalizedKey === 'gclid' ||
      normalizedKey === 'msclkid' ||
      normalizedKey.startsWith('utm_')
    ) {
      url.searchParams.delete(key);
      changed = true;
    }
  }

  if (changed) {
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)']
};
