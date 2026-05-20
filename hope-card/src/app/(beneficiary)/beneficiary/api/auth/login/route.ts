// app/api/auth/login/route.ts
// Note: uses raw @supabase/supabase-js client (not @supabase/ssr) intentionally —
// this route returns session tokens to the client for browser-side setSession() calls.
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (
      !email || !password ||
      typeof email !== 'string' || typeof password !== 'string' ||
      email.length > 254 || password.length > 1000
    ) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error.' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Authenticate credentials
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (
        error.code === 'email_not_confirmed' ||
        error.message.toLowerCase().includes('email not confirmed')
      ) {
        return NextResponse.json(
          { error: 'Please confirm your email before logging in.' },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'Please confirm your email before logging in.' },
        { status: 403 }
      );
    }

    // Step 2: Check approval status in beneficiary_profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('beneficiary_profiles')
      .select('status')
      .eq('auth_user_id', data.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'No beneficiary account found for this email. Please contact support.' },
        { status: 403 }
      );
    }

    if (profile.status === 'pending') {
      return NextResponse.json(
        { error: 'Your account is pending admin approval. You will be notified once approved.' },
        { status: 403 }
      );
    }

    if (profile.status === 'rejected') {
      return NextResponse.json(
        { error: 'Your account application was not approved. Please contact support.' },
        { status: 403 }
      );
    }

    // status === 'approved' — return session tokens for client to set
    return NextResponse.json(
      {
        success: true,
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
