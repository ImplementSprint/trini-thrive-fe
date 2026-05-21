import { NextRequest, NextResponse } from 'next/server';

const PERSONA_MAP: Record<string, string> = {
  '/admin': 'admin',
  '/citizen': 'citizen',
  '/dispatcher': 'dispatcher',
  '/site-manager': 'site-manager',
};

const PUBLIC_SUFFIXES = ['/login', '/signup', '/forgot-password'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const prefix = Object.keys(PERSONA_MAP).find(p => pathname.startsWith(p));
  if (!prefix) return NextResponse.next();

  if (PUBLIC_SUFFIXES.some(s => pathname.includes(s))) return NextResponse.next();

  const stored = req.cookies.get('persona')?.value;
  if (!stored || stored !== PERSONA_MAP[prefix]) {
    return NextResponse.redirect(new URL(`${prefix}/login`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/citizen/:path*',
    '/dispatcher/:path*',
    '/site-manager/:path*',
  ],
};
