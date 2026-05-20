import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const [profilesResult, campaignsResult] = await Promise.all([
      supabase.from('digital_donor_profiles').select('total_donations_amount'),
      supabase.from('hc_campaigns').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ]);

    const fundsRaised = (profilesResult.data ?? []).reduce(
      (sum, row) => sum + (Number(row.total_donations_amount) || 0),
      0,
    );
    const livesImpacted = Math.floor(fundsRaised / 500);
    const globalPartners = campaignsResult.count ?? 0;

    return NextResponse.json({ livesImpacted, fundsRaised, globalPartners });
  } catch {
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
