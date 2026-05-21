import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_DONOR_BACKEND_URL ?? 'http://localhost:3104';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get('authorization') ?? '';
  const res = await fetch(`${BACKEND}/api/v1/hopecard/donor/notifications/${params.id}/read`, {
    method: 'PATCH',
    headers: { Authorization: token },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
