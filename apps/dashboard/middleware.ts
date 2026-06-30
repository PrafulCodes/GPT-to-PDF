import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/session';


const PROTECTED_PATHS = [
  '/dashboard',
  '/analytics',
  '/performance',
  '/seo',
  '/exports',
  '/settings',
];

export async function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const path = nextUrl.pathname;

  // Determine path categorization
  const isProtected = PROTECTED_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
  const isRoot = path === '/';

  // Read admin session token
  const sessionToken = cookies.get('admin_session')?.value;

  // Verify session validity
  let isValidSession = false;
  if (sessionToken) {
    const payload = await verifySession(sessionToken);
    if (payload && payload.role === 'admin') {
      isValidSession = true;
    }
  }

  // Intercept and redirect unauthenticated requests to protected paths
  if (isProtected && !isValidSession) {
    const loginUrl = new URL('/', request.url);
    const response = NextResponse.redirect(loginUrl);
    
    // Clear cookie if present but invalid
    if (sessionToken) {
      response.cookies.set('admin_session', '', { path: '/', maxAge: 0 });
    }
    return response;
  }

  // Intercept and redirect authenticated requests on login page (root) to the dashboard
  if (isRoot && isValidSession) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.png, favicon.ico (favicon files)
     */
    '/((?!api|_next/static|_next/image|favicon.png|favicon.ico).*)',
  ],
};
