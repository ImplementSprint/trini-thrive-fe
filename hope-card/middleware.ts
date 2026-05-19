import { NextRequest, NextResponse } from 'next/server';

const PERSONA_PREFIXES: Record<string, string> = {
  admin: 'admin',
  donor: 'donor',
  beneficiary: 'beneficiary',
  cm: 'cm',
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const match = pathname.match(/^\/hope-card\/([^/]+)/);
  if (!match) return NextResponse.next();

  const urlSlug = match[1];
  const expectedPersona = PERSONA_PREFIXES[urlSlug];
  if (!expectedPersona) return NextResponse.next();

  if (pathname.includes('/login')) return NextResponse.next();

  const token = request.cookies.get('hopecard_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL(`/hope-card/${urlSlug}/login`, request.nextUrl));
  }

  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.persona !== 'string' || payload.system !== 'hopecard') {
    return NextResponse.redirect(new URL(`/hope-card/${urlSlug}/login`, request.nextUrl));
  }

  if (payload.persona !== expectedPersona) {
    return NextResponse.redirect(new URL(`/hope-card/${payload.persona}/dashboard`, request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/hope-card/:path*'],
};
