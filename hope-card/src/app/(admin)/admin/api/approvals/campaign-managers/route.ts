import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrlServer } from '@/admin-lib/backend-discovery-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const url = `${BACKEND_URL}/api/approvals/campaign-managers?page=${page}&limit=${limit}`;
    console.log(`[API ROUTE] Full request URL: ${url}`);
    console.log(`[API ROUTE] Authorization header present: ${!!token}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Disable any Next.js fetch caching
      });
      console.log(`[API ROUTE] Backend response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API ROUTE] Backend error (${response.status}):`, errorText.substring(0, 200));
        try {
          const error = JSON.parse(errorText);
          return NextResponse.json(error, { status: response.status });
        } catch {
          return NextResponse.json(
            { error: `Backend returned ${response.status}: ${response.statusText}` },
            { status: response.status }
          );
        }
      }

      const data = await response.json();
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    } catch (fetchError: any) {
      console.error(`[API ROUTE] Fetch failed to ${url}`);
      console.error(`[API ROUTE] Error message: ${fetchError.message}`);
      if (fetchError.code) console.error(`[API ROUTE] Error code: ${fetchError.code}`);
      if (fetchError.cause) console.error(`[API ROUTE] Error cause:`, fetchError.cause);
      
      return NextResponse.json(
        { 
          error: 'Backend connection failed', 
          message: fetchError.message,
          url: url
        },
        { status: 502 } // Bad Gateway is more appropriate here
      );
    }
  } catch (error) {
    console.error('Error fetching pending campaign manager approvals:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch pending approvals' },
      { status: 500 }
    );
  }
}
