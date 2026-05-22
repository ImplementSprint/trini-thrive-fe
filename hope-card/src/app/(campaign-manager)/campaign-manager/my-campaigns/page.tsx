export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createClient } from '@/campaign-manager-utils/supabase/server';
import { createAdminClient } from '@/campaign-manager-utils/supabase/admin';
import MyCampaignsUI from './my-campaigns-ui';

export default async function MyCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect('/campaign-manager/login');
    }

    const adminSupabase = createAdminClient();
    const { data: managerProfile } = await adminSupabase
      .from('campaign_manager_profiles')
      .select('first_name, last_name, status')
      .eq('auth_user_id', user.id)
      .single();

    if (!managerProfile) {
      redirect('/campaign-manager/login');
    }

    if (managerProfile.status !== 'approved') {
      redirect(`/?error=account_not_approved`);
    }

    const params = await searchParams;
    const currentPage = Math.max(1, parseInt(params.page ?? '1', 10));
    const statusFilter = params.status?.trim() || '';
    const searchFilter = params.search?.trim() || '';

    let query = adminSupabase
      .from('hc_campaigns')
      .select('id, title, status, collected_amount, target_amount, end_date, cover_image_key, created_at', { count: 'exact' })
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .range((currentPage - 1) * 10, currentPage * 10 - 1);

    if (statusFilter) query = query.eq('status', statusFilter);
    if (searchFilter) query = query.ilike('title', `%${searchFilter}%`);

    const { data: campaigns, count, error: campaignsError } = await query;

    if (campaignsError) {
      throw campaignsError;
    }

    const campaignList = campaigns ?? [];
    const totalCount = count ?? campaignList.length;

    const managerName = `${managerProfile.first_name} ${managerProfile.last_name}`;

    // Fetch beneficiaries for these campaigns
    const campaignIds = campaignList.map((c: any) => c.id);
    const beneficiaryMap: Record<string, string> = {};

    if (campaignIds.length > 0) {
      const { data: links } = await adminSupabase
        .from('campaign_invitations')
        .select('campaign_id, beneficiary_profile_id')
        .in('campaign_id', campaignIds)
        .eq('status', 'accepted');

      const beneficiaryIds = [...new Set((links ?? []).map((l: any) => l.beneficiary_profile_id))];

      if (beneficiaryIds.length > 0) {
        const { data: bProfiles } = await adminSupabase
          .from('beneficiary_profiles')
          .select('id, first_name, last_name')
          .in('id', beneficiaryIds);

        const bMap = Object.fromEntries(
          (bProfiles ?? []).map((b: any) => [b.id, `${b.first_name} ${b.last_name}`])
        );

        for (const link of links ?? []) {
          if (bMap[(link as any).beneficiary_profile_id]) {
            if (beneficiaryMap[(link as any).campaign_id]) {
              beneficiaryMap[(link as any).campaign_id] += `, ${bMap[(link as any).beneficiary_profile_id]}`;
            } else {
              beneficiaryMap[(link as any).campaign_id] = bMap[(link as any).beneficiary_profile_id];
            }
          }
        }
      }
    }

    // Convert to expected format
    const formattedCampaigns = campaignList.map((c: any) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      collectedAmount: Number(c.collected_amount ?? 0),
      targetAmount: Number(c.target_amount ?? 0),
      endDate: c.end_date,
      beneficiaryName: beneficiaryMap[c.id] ?? '—',
      coverImageKey: c.cover_image_key,
      createdAt: c.created_at,
    }));

    return (
      <MyCampaignsUI
        campaigns={formattedCampaigns}
        totalCount={totalCount}
        currentPage={currentPage}
        managerName={managerName}
      />
    );
  } catch (error) {
    console.error('[MyCampaignsPage] Error:', error);
    redirect(`/?error=server_error`);
  }
}
