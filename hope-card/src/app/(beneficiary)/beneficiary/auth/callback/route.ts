// app/auth/callback/route.ts
import { createClient } from '@/beneficiary-utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL('/beneficiary/login', origin));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error('Callback error:', error?.message ?? 'No session returned');
    return NextResponse.redirect(new URL('/beneficiary/login?error=expired', origin));
  }

  const response = NextResponse.redirect(new URL('/beneficiary/login?confirmed=true', origin));
  response.cookies.set('persona', 'beneficiary', { path: '/', sameSite: 'strict' });
  return response;
}
