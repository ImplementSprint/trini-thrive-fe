import { createProxyHandlers } from '../../src/lib/api-proxy';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockCookies = jest.fn();
jest.mock('next/headers', () => ({
  cookies: () => mockCookies(),
}));

jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn(),
    NextResponse: {
      json: jest.fn((body: unknown, init?: { status?: number }) => ({ body, status: init?.status ?? 200 })),
    },
  };
});

function makeRequest(opts: {
  method?: string;
  url?: string;
  authHeader?: string | null;
  contentType?: string | null;
  body?: ArrayBuffer;
}): ReturnType<typeof import('next/server').NextRequest> {
  const url = new URL(opts.url ?? 'http://localhost/api/test/path');
  return {
    method: opts.method ?? 'GET',
    nextUrl: url,
    headers: {
      get: (name: string) => {
        if (name === 'authorization') return opts.authHeader ?? null;
        if (name === 'content-type') return opts.contentType ?? null;
        return null;
      },
    },
    arrayBuffer: async () => opts.body ?? new ArrayBuffer(0),
  } as unknown as ReturnType<typeof import('next/server').NextRequest>;
}

const opts = {
  backendUrl: 'http://backend:3000',
  apiPrefix: 'api/v1/service',
  cookieName: 'service_token',
  serviceName: 'test service',
};

beforeEach(() => {
  mockFetch.mockReset();
  mockCookies.mockReset();
  mockCookies.mockReturnValue({ get: () => undefined });
});

describe('createProxyHandlers', () => {
  it('forwards GET request and returns JSON', async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify({ ok: true }),
      statusText: 'OK',
    });

    const handlers = createProxyHandlers(opts);
    const req = makeRequest({ method: 'GET', url: 'http://localhost/api/items?page=1' });
    const result = await handlers.GET(req, { params: Promise.resolve({ path: ['items'] }) });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://backend:3000/api/v1/service/items?page=1',
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toMatchObject({ body: { ok: true }, status: 200 });
  });

  it('attaches Bearer token from Authorization header', async () => {
    mockFetch.mockResolvedValue({ status: 200, text: async () => '{}', statusText: 'OK' });

    const handlers = createProxyHandlers(opts);
    const req = makeRequest({ authHeader: 'Bearer mytoken' });
    await handlers.GET(req, { params: Promise.resolve({ path: ['items'] }) });

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers['Authorization']).toBe('Bearer mytoken');
  });

  it('attaches token from cookie when no Authorization header', async () => {
    mockCookies.mockReturnValue({ get: (name: string) => name === 'service_token' ? { value: 'cookietoken' } : undefined });
    mockFetch.mockResolvedValue({ status: 200, text: async () => '{}', statusText: 'OK' });

    const handlers = createProxyHandlers(opts);
    const req = makeRequest({});
    await handlers.GET(req, { params: Promise.resolve({ path: ['items'] }) });

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers['Authorization']).toBe('Bearer cookietoken');
  });

  it('returns 502 when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

    const handlers = createProxyHandlers(opts);
    const req = makeRequest({ method: 'GET' });
    const result = await handlers.GET(req, { params: Promise.resolve({ path: ['items'] }) });

    expect(result).toMatchObject({ status: 502 });
  });

  it('forwards non-JSON upstream response as error body', async () => {
    mockFetch.mockResolvedValue({ status: 500, text: async () => 'Internal Error', statusText: 'Internal Server Error' });

    const handlers = createProxyHandlers(opts);
    const req = makeRequest({});
    const result = await handlers.GET(req, { params: Promise.resolve({ path: ['items'] }) });

    expect(result).toMatchObject({ body: { error: 'Internal Error' }, status: 500 });
  });

  it('forwards body for POST requests', async () => {
    mockFetch.mockResolvedValue({ status: 201, text: async () => '{"id":1}', statusText: 'Created' });

    const handlers = createProxyHandlers(opts);
    const bodyBuf = Buffer.from('{"name":"test"}').buffer as ArrayBuffer;
    const req = makeRequest({ method: 'POST', contentType: 'application/json', body: bodyBuf });
    await handlers.POST(req, { params: Promise.resolve({ path: ['items'] }) });

    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBeTruthy();
  });

  it('PATCH handler proxies correctly', async () => {
    mockFetch.mockResolvedValue({ status: 200, text: async () => '{}', statusText: 'OK' });
    const handlers = createProxyHandlers(opts);
    const req = makeRequest({ method: 'PATCH' });
    const result = await handlers.PATCH(req, { params: Promise.resolve({ path: ['items', '1'] }) });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://backend:3000/api/v1/service/items/1',
      expect.objectContaining({ method: 'PATCH' })
    );
    expect(result).toMatchObject({ status: 200 });
  });

  it('PUT handler proxies correctly', async () => {
    mockFetch.mockResolvedValue({ status: 200, text: async () => '{}', statusText: 'OK' });
    const handlers = createProxyHandlers(opts);
    const req = makeRequest({ method: 'PUT' });
    await handlers.PUT(req, { params: Promise.resolve({ path: ['items', '1'] }) });
    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe('PUT');
  });

  it('DELETE handler proxies correctly', async () => {
    mockFetch.mockResolvedValue({ status: 204, text: async () => '', statusText: 'No Content' });
    const handlers = createProxyHandlers(opts);
    const req = makeRequest({ method: 'DELETE' });
    await handlers.DELETE(req, { params: Promise.resolve({ path: ['items', '1'] }) });
    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe('DELETE');
  });

  it('does not send body for GET requests', async () => {
    mockFetch.mockResolvedValue({ status: 200, text: async () => '{}', statusText: 'OK' });
    const handlers = createProxyHandlers(opts);
    const req = makeRequest({ method: 'GET' });
    await handlers.GET(req, { params: Promise.resolve({ path: ['items'] }) });
    const [, init] = mockFetch.mock.calls[0];
    expect(init.body).toBeUndefined();
  });
});
