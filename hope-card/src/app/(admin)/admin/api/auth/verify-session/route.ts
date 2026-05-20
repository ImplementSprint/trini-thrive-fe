import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/admin-lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    let token = null;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = request.cookies.get('admin_token')?.value;
    }

    if (!token) {
      // Also check localStorage via body for client-side calls
      const body = await request.json().catch(() => null);
      if (body?.token) {
        token = body.token;
      }
    }

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: 'No token found' },
        { status: 401 }
      );
    }

    // Verify the JWT token
    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: payload.sub,
          email: payload.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
