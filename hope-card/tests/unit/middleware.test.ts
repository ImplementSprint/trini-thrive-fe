// Build a minimal base64url-encoded JWT with the given payload
function makeToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

// ── Next.js mocks ─────────────────────────────────────────────────────────────
const mockRedirect = jest.fn();
const mockNext = jest.fn();

jest.mock('next/server', () => {
  class NextResponse {
    static redirect(url: URL) {
      mockRedirect(url.pathname);
      return { type: 'redirect', url };
    }
    static next() {
      mockNext();
      return { type: 'next' };
    }
  }
  class NextRequest {
    nextUrl: URL;
    cookies: { get: (name: string) => { value: string } | undefined };
    constructor(url: string, cookieVal?: string) {
      this.nextUrl = new URL(url);
      this.cookies = {
        get: (name: string) =>
          name === 'hopecard_token' && cookieVal ? { value: cookieVal } : undefined,
      };
    }
  }
  return { NextResponse, NextRequest };
});

import { middleware } from '../../middleware';
import { NextRequest } from 'next/server';

describe('middleware', () => {
  beforeEach(() => {
    mockRedirect.mockClear();
    mockNext.mockClear();
  });

  it('allows request through when persona matches URL prefix', () => {
    const token = makeToken({ persona: 'admin', system: 'hopecard' });
    const req = new NextRequest('http://localhost/hope-card/admin/dashboard', token);
    middleware(req);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects to login when no token present', () => {
    const req = new NextRequest('http://localhost/hope-card/donor/dashboard');
    middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith('/hope-card/donor/login');
  });

  it('redirects to correct persona dashboard when persona is wrong', () => {
    const token = makeToken({ persona: 'donor', system: 'hopecard' });
    const req = new NextRequest('http://localhost/hope-card/admin/dashboard', token);
    middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith('/hope-card/donor/dashboard');
  });

  it('allows beneficiary through on beneficiary route', () => {
    const token = makeToken({ persona: 'beneficiary', system: 'hopecard' });
    const req = new NextRequest('http://localhost/hope-card/beneficiary/profile', token);
    middleware(req);
    expect(mockNext).toHaveBeenCalled();
  });

  it('allows cm through on cm route', () => {
    const token = makeToken({ persona: 'cm', system: 'hopecard' });
    const req = new NextRequest('http://localhost/hope-card/cm/campaigns', token);
    middleware(req);
    expect(mockNext).toHaveBeenCalled();
  });

  it('allows request through on /login paths without a token', () => {
    const req = new NextRequest('http://localhost/hope-card/admin/login');
    middleware(req);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('allows request through for unknown persona prefix', () => {
    const req = new NextRequest('http://localhost/hope-card/unknown/page');
    middleware(req);
    expect(mockNext).toHaveBeenCalled();
  });

  it('redirects to login when token payload is malformed', () => {
    const req = new NextRequest('http://localhost/hope-card/donor/dashboard', 'not.a.jwt');
    middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith('/hope-card/donor/login');
  });
});
