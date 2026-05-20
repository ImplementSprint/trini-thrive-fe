import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, validateServerConfig } from '@/admin-lib/supabase/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'hopecard-admin-secret-key-change-in-production'
);

const DEMO_CREDENTIALS = {
  'admin@hopecard.com': 'admin123',
  'steven.cai.cics@ust.edu.ph': 'admin123',
};

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword, confirmPassword, token: tokenFromBody } =
      await request.json();

    // Get JWT token from cookie, header, or request body
    let token = request.cookies.get('admin_token')?.value || tokenFromBody;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - no token provided' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let verified;
    try {
      verified = await jwtVerify(token, JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const userId = verified.payload.sub as string;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Get user email from JWT token
    const userEmail = verified.payload.email as string;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Invalid token - email not found' },
        { status: 401 }
      );
    }

    // Verify current password - try demo credentials first
    let passwordValid = false;
    
    // Check if email is in demo credentials
    if (DEMO_CREDENTIALS[userEmail as keyof typeof DEMO_CREDENTIALS] === currentPassword) {
      passwordValid = true;
    } else {
      // Try Supabase Auth
      try {
        validateServerConfig();
        const { error: signInError } = await supabaseServer.auth.signInWithPassword({
          email: userEmail,
          password: currentPassword,
        });
        
        if (!signInError) {
          passwordValid = true;
        }
      } catch (error) {
        console.warn('Supabase auth not available, checking demo credentials only');
      }
    }

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update password using admin API (Supabase)
    try {
      validateServerConfig();
      console.log('🔄 Attempting to update password in Supabase for user:', userEmail);
      
      // First, try to find the user in Supabase Auth
      const { data: { users }, error: listError } = await supabaseServer.auth.admin.listUsers();
      
      if (listError) {
        console.error('❌ Error listing users:', listError);
        return NextResponse.json(
          { error: 'Failed to verify user: ' + listError.message },
          { status: 500 }
        );
      }

      // Find the user by email
      const supabaseUser = users?.find((u: any) => u.email === userEmail);

      if (!supabaseUser) {
        console.warn('⚠️ User not found in Supabase Auth:', userEmail);
        console.warn('ℹ️ This is normal for demo credentials. Password change only works with Supabase Auth users.');
        return NextResponse.json(
          { error: 'User not found in Supabase. Password changes only work with Supabase Auth accounts.' },
          { status: 404 }
        );
      }

      // Now update the password for the actual Supabase user
      console.log('✅ Found user in Supabase, updating password...');
      const { error: updateError } = await supabaseServer.auth.admin.updateUserById(
        supabaseUser.id,
        { password: newPassword }
      );

      if (updateError) {
        console.error('❌ Password update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update password: ' + updateError.message },
          { status: 500 }
        );
      }

      console.log('✅ Password updated successfully in Supabase for user:', userEmail);
      return NextResponse.json(
        {
          success: true,
          message: 'Password changed successfully',
        },
        { status: 200 }
      );
    } catch (supabaseError) {
      console.error('❌ Supabase error during password update:', supabaseError);
      return NextResponse.json(
        { error: 'Supabase error: ' + (supabaseError instanceof Error ? supabaseError.message : 'Unknown error') },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
