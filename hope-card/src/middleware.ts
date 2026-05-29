import { NextRequest, NextResponse } from 'next/server';

const PERSONA_MAP: Record<string, string> = {
  '/admin': 'admin',
  '/donor': 'digital-donor',
  '/campaign-manager': 'campaign-manager',
  '/beneficiary': 'beneficiary',
};

const PUBLIC_SUFFIXES = [
  '',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
  '/auth/callback',
  '/verify',
  '/check-email',
  '/otp',
  '/signup',
  '/create-account',
  '/upload-id',
  '/landing',
  '/api',
  '/payment/success',
  '/payment/cancel',
];

export function middleware(req: NextRequest) {
  const prefix = Object.keys(PERSONA_MAP).find(p =>
    req.nextUrl.pathname === p || req.nextUrl.pathname.startsWith(p + '/')
  );
  if (!prefix) return NextResponse.next();

  const relative = req.nextUrl.pathname.slice(prefix.length);
  if (PUBLIC_SUFFIXES.some(s => relative === s || relative.startsWith(s + '/')))
    return NextResponse.next();

  const stored = req.cookies.get('persona')?.value;
  if (!stored || stored !== PERSONA_MAP[prefix]) {
    return NextResponse.redirect(new URL(`${prefix}/login`, req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/donor/:path*',
    '/campaign-manager/:path*',
    '/beneficiary/:path*',
  ],
};
