import { NextRequest, NextResponse } from 'next/server';

const ADMIN_BACKEND = process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL ?? 'http://localhost:3101';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${ADMIN_BACKEND}/api/v1/hopecard/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Unable to reach admin service.' }, { status: 502 });
  }
}
