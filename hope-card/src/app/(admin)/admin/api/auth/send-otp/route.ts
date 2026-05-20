import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, validateServerConfig } from '@/admin-lib/supabase/server';
import { generateOTP } from '@/admin-lib/auth';
import { sendOTPEmail } from '@/admin-lib/email';

export async function POST(request: NextRequest) {
  try {
    validateServerConfig();

    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email exists in Supabase Auth
    const { data: { users }, error: usersError } = await supabaseServer.auth.admin.listUsers();

    if (usersError || !users) {
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    const authUser = users.find(u => u.email === email);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const now = Date.now();

    // Delete any previous unused OTPs for this email (prevents conflicts)
    await supabaseServer
      .from('otp_sessions')
      .delete()
      .eq('email', email)
      .eq('used', false);

    // Store OTP in database with correct columns (milliseconds format)
    const { error: otpError } = await supabaseServer
      .from('otp_sessions')
      .insert({
        email,
        otp,
        expires_at_ms: expiresAt.getTime(), // Convert to milliseconds
        created_at_ms: now,
        used: false,
      });

    if (otpError) {
      console.error('OTP storage error:', otpError);
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      );
    }

    // Send OTP via email using Google SMTP
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent to email',
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Masked email
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
