import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/admin-lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Get the JWT token to extract user info
    const token = request.cookies.get('admin_token')?.value;

    // Try to sign out from Supabase if configured
    if (token) {
      try {
        // Sign out the user from Supabase Auth
        // This invalidates any sessions associated with this user
        await supabaseServer.auth.signOut();
      } catch (supabaseError) {
        // Log but don't fail if Supabase sign out fails
        console.warn('Supabase sign out warning:', supabaseError);
      }
    }

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // Clear the admin token cookie
    response.cookies.set({
      name: 'admin_token',
      value: '',
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 0, // Immediately expire
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
