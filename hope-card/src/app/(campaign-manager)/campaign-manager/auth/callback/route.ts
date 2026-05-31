import { NextResponse } from 'next/server';
import { createClient } from '@/campaign-manager-utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const code = searchParams.get('code');
  const supabaseError = searchParams.get('error');

  // Supabase sends ?error= when something went wrong on their end
  if (supabaseError) {
    return NextResponse.redirect(`${origin}/campaign-manager/login?error=confirmation_failed`);
  }

  // PKCE flow: exchange the code for a session
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/campaign-manager/login?error=confirmation_failed`);
    }
  }

  // generateLink flow: Supabase already confirmed the email and redirected here cleanly (no code, no error)
  const response = NextResponse.redirect(`${origin}/campaign-manager/login?confirmed=true`);
  response.cookies.set('persona', 'campaign-manager', { path: '/', sameSite: 'strict' });
  return response;
}
