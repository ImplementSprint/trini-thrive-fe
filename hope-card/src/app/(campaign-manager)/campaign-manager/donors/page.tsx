import { redirect } from 'next/navigation';
import { createClient } from '@/campaign-manager-utils/supabase/server';
import { createAdminClient } from '@/campaign-manager-utils/supabase/admin';
import DonorsUI from './donors-ui';
import { getDonorsData } from '@/app/(campaign-manager)/campaign-manager/actions/reports';

export default async function DonorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/campaign-manager/create-account');
    return null;
  }

  const adminSupabase = createAdminClient();
  const { data: managerProfile } = await adminSupabase
    .from('campaign_manager_profiles')
    .select('first_name, last_name, status')
    .eq('auth_user_id', user.id)
    .single();

  if (!managerProfile || managerProfile.status !== 'approved') {
    redirect('/campaign-manager/create-account');
    return null;
  }

  const managerName = `${managerProfile.first_name} ${managerProfile.last_name}`;

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10));

  const { statCards, donors, totalCount } = await getDonorsData(user.id, currentPage);

  return (
    <DonorsUI
      statCards={statCards}
      donors={donors}
      totalCount={totalCount}
      currentPage={currentPage}
      managerName={managerName}
    />
  );
}
