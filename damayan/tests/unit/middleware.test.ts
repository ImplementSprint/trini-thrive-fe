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
  it('passes through root path', () => {
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

describe('middleware — public suffix paths', () => {
  it.each([
    ['/admin/login'],
    ['/citizen/login'],
    ['/dispatcher/login'],
    ['/site-manager/login'],
    ['/admin/signup'],
    ['/citizen/signup'],
    ['/admin/forgot-password'],
    ['/dispatcher/forgot-password'],
  ])('passes through %s without checking cookie', (path) => {
    middleware(makeReq(path));
    expect(next).toHaveBeenCalledTimes(1);
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe('middleware — protected paths, no cookie', () => {
  it.each([
    ['/admin/dashboard', '/admin/login'],
    ['/citizen/dashboard', '/citizen/login'],
    ['/dispatcher/dashboard', '/dispatcher/login'],
    ['/site-manager/dashboard', '/site-manager/login'],
  ])('%s redirects to %s when no cookie', (path, loginPath) => {
    middleware(makeReq(path));
    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect.mock.calls[0][0].pathname).toBe(loginPath);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('middleware — protected paths, wrong persona', () => {
  it('redirects admin path when persona is citizen', () => {
    middleware(makeReq('/admin/dashboard', 'citizen'));
    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect.mock.calls[0][0].pathname).toBe('/admin/login');
  });

  it('redirects citizen path when persona is admin', () => {
    middleware(makeReq('/citizen/dashboard', 'admin'));
    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect.mock.calls[0][0].pathname).toBe('/citizen/login');
  });
});

describe('middleware — protected paths, correct persona', () => {
  it.each([
    ['/admin/dashboard', 'admin'],
    ['/citizen/dashboard', 'citizen'],
    ['/dispatcher/dashboard', 'dispatcher'],
    ['/site-manager/dashboard', 'site-manager'],
  ])('%s passes through with matching persona', (path, persona) => {
    middleware(makeReq(path, persona));
    expect(next).toHaveBeenCalledTimes(1);
    expect(redirect).not.toHaveBeenCalled();
  });
});
