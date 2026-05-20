import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrlServer } from '@/admin-lib/backend-discovery-server';

async function getBackendUrl() {
  return await getBackendUrlServer();
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    const token = request.headers.get('Authorization');
    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const BACKEND_URL = await getBackendUrl();
    const url = `${BACKEND_URL}/api/approvals/beneficiaries/bank?page=${page}&limit=${limit}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log('--- BANK APPROVALS DEBUG ---');
    console.log('Backend URL:', url);
    console.log('Data received count:', data.data?.length || 0);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching bank approvals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bank approvals' },
      { status: 500 }
    );
  }
}
