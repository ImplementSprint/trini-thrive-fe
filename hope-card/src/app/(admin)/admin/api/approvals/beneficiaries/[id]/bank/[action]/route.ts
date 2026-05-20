import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrlServer } from '@/admin-lib/backend-discovery-server';

async function getBackendUrl() {
  return await getBackendUrlServer();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const { id, action } = await params;
    const token = request.headers.get('Authorization');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const BACKEND_URL = await getBackendUrl();
    const url = `${BACKEND_URL}/api/v1/approvals/beneficiaries/${id}/bank/${action}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing bank approval action:', error);
    return NextResponse.json(
      { error: 'Failed to process bank approval action' },
      { status: 500 }
    );
  }
}
