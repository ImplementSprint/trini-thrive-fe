import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, validateServerConfig } from '@/admin-lib/supabase/server';
import { createJWT } from '@/admin-lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    let isValidOTP = false;
    let authUser: any = null;

    // Try Supabase first
    try {
      validateServerConfig();

      const currentTime = new Date().toISOString();
      console.log('🔍 OTP Verification:');
      console.log('   Email:', email);
      console.log('   OTP:', otp);
      console.log('   Current Time (UTC):', currentTime);

      // Fetch OTP - ignore expiration, check in JavaScript instead
      const { data: otpData, error: otpError } = await supabaseServer
        .from('otp_sessions')
        .select('*')
        .eq('email', email)
        .eq('otp', otp)
        .eq('used', false)
        .single();

      console.log('   Query error:', otpError?.message || 'none');
      console.log('   OTP data found?', !!otpData);

      if (otpError) {
        console.log('   ❌ Failed to find OTP in database');
        console.log('   Error details:', JSON.stringify(otpError, null, 2));
      }

      if (!otpError && otpData) {
        // Use millisecond timestamps for bulletproof timezone-independent comparison
        const createdAtMs = otpData.created_at_ms;
        const expiresAtMs = otpData.expires_at_ms;
        const nowMs = new Date().getTime();
        
        console.log('   ✅ OTP FOUND in database');
        console.log('   Created at (ms): ' + createdAtMs);
        console.log('   Expires at (ms): ' + expiresAtMs);
        console.log('   Now (ms): ' + nowMs);
        
        const ageMs = nowMs - createdAtMs;
        const ageSeconds = Math.round(ageMs / 1000);
        const ageMinutes = Math.round(ageMs / 1000 / 60);
        const remainingMs = expiresAtMs - nowMs;
        const remainingSeconds = Math.round(remainingMs / 1000);
        
        console.log('   Age: ' + ageSeconds + ' seconds (' + ageMinutes + ' minutes)');
        console.log('   Remaining: ' + remainingSeconds + ' seconds until expiry');
        console.log('   Is valid? ' + (remainingMs > 0));
        
        if (remainingMs > 0) {
          isValidOTP = true;
          console.log('   ✅✅✅ OTP IS VALID - not expired');
        } else {
          console.log('   ❌ OTP IS EXPIRED');
        }

        if (isValidOTP) {
          // Mark OTP as used
          await supabaseServer
            .from('otp_sessions')
            .update({ used: true })
            .eq('id', otpData.id);

          // Get user from Supabase Auth
          const { data: { users }, error: usersError } = await supabaseServer.auth.admin.listUsers();

          if (!usersError && users) {
            authUser = users.find(u => u.email === email);
          }
        }
      }
    } catch (error) {
      console.error('❌ Verify-OTP error:', error);
      return NextResponse.json(
        { error: 'OTP verification failed' },
        { status: 401 }
      );
    }

    if (!isValidOTP) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    if (!authUser) {
      authUser = {
        id: email.replace('@', '-').replace('.', '-'),
        email: email,
        user_metadata: { name: 'Admin User' },
      };
    }

    // Create JWT token
    const jwtToken = await createJWT(authUser.id, authUser.email || email);

    // Create response with token in cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'OTP verified successfully. Logging you in...',
        token: jwtToken,
        admin: {
          id: authUser.id,
          email: authUser.email || email,
          name: authUser.user_metadata?.name || 'Admin User',
        },
      },
      { status: 200 }
    );

    // Set token in cookie
    response.cookies.set({
      name: 'admin_token',
      value: jwtToken,
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
