import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabase_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    jwt_secret: !!process.env.JWT_SECRET,
  };

  const allValid = Object.values(checks).every(v => v);

  return NextResponse.json(
    {
      status: allValid ? 'ok' : 'incomplete',
      checks,
      message: !checks.supabase_service_role_key
        ? 'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Add it to your project settings.'
        : 'All configuration checks passed',
    },
    { status: allValid ? 200 : 400 }
  );
}
