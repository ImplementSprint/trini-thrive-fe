import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrlServer } from '@/admin-lib/backend-discovery-server';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const backendUrl = await getBackendUrlServer();

    const backendResponse = await fetch(`${backendUrl}/api/v1/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    const contentType = backendResponse.headers.get('content-type');
    let backendData: any = {};

    if (contentType && contentType.includes('application/json')) {
      backendData = await backendResponse.json();
    } else {
      const text = await backendResponse.text();
      return NextResponse.json(
        { error: `Backend error (${backendResponse.status})`, details: text.substring(0, 100) },
        { status: 500 }
      );
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: backendData.error || backendData.message || 'OTP verification failed' },
        { status: backendResponse.status }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: backendData.message || 'OTP verified successfully.',
        token: backendData.token,
        admin: backendData.admin,
        verified: true,
      },
      { status: 200 }
    );

    if (backendData.token) {
      response.cookies.set({
        name: 'admin_token',
        value: backendData.token,
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Verify OTP proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
