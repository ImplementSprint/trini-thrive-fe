import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL ?? 'http://localhost:3101';

async function getAccessToken(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token')?.value;
  if (adminToken) return adminToken;

  // Also check localStorage-persisted token forwarded as header
  const xToken = req.headers.get('x-admin-token');
  if (xToken) return xToken;

  return null;
}

async function proxy(req: NextRequest, path: string[]) {
  const resource = path.join('/');
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND}/api/v1/hopecard/admin/${resource}${search}`;

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
    return NextResponse.json({ error: 'Unable to reach admin service.' }, { status: 502 });
  }
}

type Params = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: Params) {
  return proxy(req, (await params).path);
}
export async function POST(req: NextRequest, { params }: Params) {
  return proxy(req, (await params).path);
}
export async function PATCH(req: NextRequest, { params }: Params) {
  return proxy(req, (await params).path);
}
export async function PUT(req: NextRequest, { params }: Params) {
  return proxy(req, (await params).path);
}
export async function DELETE(req: NextRequest, { params }: Params) {
  return proxy(req, (await params).path);
}
