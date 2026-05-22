import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.NEXT_PUBLIC_BENEFICIARY_BACKEND_URL ?? '';

async function getAccessToken(req: NextRequest): Promise<string | null> {
  // 1. Explicit Authorization header (for future direct calls)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

  // 2. Persona-scoped JWT stored as cookie on login
  const cookieStore = await cookies();
  const beneficiaryToken = cookieStore.get('beneficiary_token')?.value;
  if (beneficiaryToken) return beneficiaryToken;

  return null;
}

async function proxy(req: NextRequest, path: string[]) {
  const resource = path.join('/');
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND}/api/v1/hopecard/beneficiary/${resource}${search}`;

  const token = await getAccessToken(req);
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const contentType = req.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;

  let body: BodyInit | undefined;
  if (!['GET', 'HEAD'].includes(req.method)) {
    body = await req.arrayBuffer().then(b => b.byteLength > 0 ? b : undefined);
  }

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  });

  const text = await upstream.text();
  let json: unknown;
  try { json = JSON.parse(text); } catch { json = { error: text || upstream.statusText }; }

  return NextResponse.json(json, { status: upstream.status });
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
