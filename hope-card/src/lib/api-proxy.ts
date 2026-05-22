import { NextRequest, NextResponse } from 'next/server';

export interface ProxyOptions {
  backendUrl: string;
  apiPrefix: string;
  cookieName: string;
  serviceName: string;
}

export function createProxyHandlers(opts: ProxyOptions) {
  async function getAccessToken(req: NextRequest): Promise<string | null> {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get(opts.cookieName)?.value ?? null;
  }

  async function proxy(req: NextRequest, path: string[]): Promise<NextResponse> {
    const resource = path.join('/');
    const search = req.nextUrl.search;
    const targetUrl = `${opts.backendUrl}/${opts.apiPrefix}/${resource}${search}`;

    const token = await getAccessToken(req);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const contentType = req.headers.get('content-type');
    if (contentType) headers['Content-Type'] = contentType;

    let body: BodyInit | undefined;
    if (!['GET', 'HEAD'].includes(req.method)) {
      const buf = await req.arrayBuffer();
      if (buf.byteLength > 0) body = buf;
    }

    try {
      const upstream = await fetch(targetUrl, { method: req.method, headers, body });
      const text = await upstream.text();
      let json: unknown;
      try { json = JSON.parse(text); } catch { json = { error: text || upstream.statusText }; }
      return NextResponse.json(json, { status: upstream.status });
    } catch {
      return NextResponse.json({ error: `Unable to reach ${opts.serviceName}.` }, { status: 502 });
    }
  }

  type Params = { params: Promise<{ path: string[] }> };

  return {
    GET: (req: NextRequest, { params }: Params) => params.then(p => proxy(req, p.path)),
    POST: (req: NextRequest, { params }: Params) => params.then(p => proxy(req, p.path)),
    PATCH: (req: NextRequest, { params }: Params) => params.then(p => proxy(req, p.path)),
    PUT: (req: NextRequest, { params }: Params) => params.then(p => proxy(req, p.path)),
    DELETE: (req: NextRequest, { params }: Params) => params.then(p => proxy(req, p.path)),
  };
}
