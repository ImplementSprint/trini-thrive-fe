jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({ type: 'next' })),
    redirect: jest.fn((url: URL) => ({ type: 'redirect', pathname: url.pathname })),
  },
}));

import { NextResponse } from 'next/server';
import { middleware } from '../../src/middleware';

function makeReq(pathname: string, persona?: string) {
  return {
    nextUrl: { pathname },
    url: `http://localhost${pathname}`,
    cookies: {
      get: (name: string) =>
        name === 'persona' && persona ? { value: persona } : undefined,
    },
  } as Parameters<typeof middleware>[0];
}

const next = NextResponse.next as jest.Mock;
const redirect = NextResponse.redirect as jest.Mock;

beforeEach(() => {
  next.mockClear();
  redirect.mockClear();
});

describe('middleware — non-persona paths', () => {
  it('passes through root', () => {
    middleware(makeReq('/'));
    expect(next).toHaveBeenCalledTimes(1);
    expect(redirect).not.toHaveBeenCalled();
  });

  it('passes through unknown path', () => {
    middleware(makeReq('/about'));
    expect(next).toHaveBeenCalledTimes(1);
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe('middleware — persona prefix exact paths', () => {
  it.each([['/admin'], ['/donor'], ['/campaign-manager'], ['/beneficiary']])(
    'passes through %s (exact prefix)',
    (path) => {
      middleware(makeReq(path));
      expect(next).toHaveBeenCalledTimes(1);
      expect(redirect).not.toHaveBeenCalled();
    }
  );
});

describe('middleware — known public suffix paths', () => {
  it.each([
    ['/admin/login'],
    ['/donor/signup'],
    ['/campaign-manager/forgot-password'],
    ['/beneficiary/register'],
    ['/donor/otp'],
    ['/donor/check-email'],
    ['/donor/upload-id'],
    ['/campaign-manager/create-account'],
    ['/admin/auth/callback'],
    ['/donor/api/notifications'],
  ])('passes through %s', (path) => {
    middleware(makeReq(path));
    expect(next).toHaveBeenCalledTimes(1);
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe('middleware — sub-paths pass through', () => {
  it.each([
    ['/admin/dashboard'],
    ['/donor/campaigns'],
    ['/campaign-manager/dashboard'],
    ['/beneficiary/dashboard'],
  ])('%s passes through (sub-paths are reachable)', (path) => {
    middleware(makeReq(path));
    expect(next).toHaveBeenCalledTimes(1);
    expect(redirect).not.toHaveBeenCalled();
  });
});
