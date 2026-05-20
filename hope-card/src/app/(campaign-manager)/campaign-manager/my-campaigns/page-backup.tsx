import { redirect } from 'next/navigation';
import { createClient } from '@/campaign-manager-utils/supabase/server';
import { createAdminClient } from '@/campaign-manager-utils/supabase/admin';
import MyCampaignsUI from './my-campaigns-ui';
import { getMyCampaigns } from '@/app/(campaign-manager)/campaign-manager/actions/reports';

export default async function MyCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('[MyCampaignsPage] No user found, redirecting to /');
      redirect('/campaign-manager/create-account');
    }

    const adminSupabase = createAdminClient();
    const { data: managerProfile } = await adminSupabase
      .from('campaign_manager_profiles')
      .select('first_name, last_name, status')
      .eq('auth_user_id', user.id)
      .single();

    if (!managerProfile) {
      console.log('[MyCampaignsPage] No manager profile found, redirecting to /');
      redirect('/campaign-manager/create-account');
    }

    if (managerProfile.status !== 'approved') {
      console.log('[MyCampaignsPage] Manager profile not approved, redirecting to /');
      redirect(`/?error=account_not_approved`);
    }

    const params = await searchParams;
    const currentPage = Math.max(1, parseInt(params.page ?? '1', 10));

    console.log('[MyCampaignsPage] Fetching campaigns for user:', user.id);
    const { campaigns, totalCount } = await getMyCampaigns(user.id, {
      status: params.status,
      search: params.search,
      page: currentPage,
    });

    const managerName = `${managerProfile.first_name} ${managerProfile.last_name}`;

    return (
      <MyCampaignsUI
        campaigns={campaigns}
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
