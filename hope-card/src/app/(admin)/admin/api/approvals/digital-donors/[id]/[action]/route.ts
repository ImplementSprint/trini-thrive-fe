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
    const url = `${BACKEND_URL}/api/approvals/digital-donors/${id}/${action}`;

    console.log(`[API ROUTE] Forwarding donor ${action} for ${id} to ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    console.log(`[API ROUTE] Backend responded with status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      console.error(`[API ROUTE] Backend error:`, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error processing digital donor approval action:', error);
    return NextResponse.json(
      { error: 'Failed to process approval action', details: error.message },
      { status: 500 }
    );
  }
}
