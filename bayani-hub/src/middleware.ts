import { NextRequest, NextResponse } from 'next/server';

// Maps URL prefix → expected persona cookie value
const PERSONA_MAP: Record<string, string> = {
  '/admin':   'admin',
  '/enduser': 'end-user',
  '/siteman': 'site-manager',
};

// Route suffixes that are publicly accessible (no cookie check)
const PUBLIC_SUFFIXES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/register',
  '/about',
  '/mission',
  '/terms',
  '/privacy',
  '/help',
];

/**
 * BayaniHub persona route enforcement proxy.
 * Prevents cross-persona URL access by checking the persona cookie.
 * Per CICD Migration Plan v11 Phase 5 Step C.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Find which persona prefix this request falls under
  const prefix = Object.keys(PERSONA_MAP).find((p) =>
    pathname.startsWith(p)
  );

  // Ignore static assets
  if (pathname.match(/\.(png|jpe?g|svg|ico|gif|webp|css|js)$/i)) return NextResponse.next();

  // Not a persona route — pass through
  if (!prefix) return NextResponse.next();

  // Public routes pass through without cookie check
  if (PUBLIC_SUFFIXES.some((suffix) => pathname.endsWith(suffix))) {
    return NextResponse.next();
  }

  // Check persona cookie
  const storedPersona = req.cookies.get('persona')?.value;
  const expectedPersona = PERSONA_MAP[prefix];

  if (!storedPersona || storedPersona !== expectedPersona) {
    return NextResponse.redirect(new URL(`${prefix}/login`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/enduser/:path*', '/siteman/:path*'],
};
