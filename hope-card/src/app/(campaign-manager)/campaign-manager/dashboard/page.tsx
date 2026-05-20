import { redirect } from 'next/navigation';
import { createClient } from '@/campaign-manager-utils/supabase/server';
import { createAdminClient } from '@/campaign-manager-utils/supabase/admin';
import DashboardUI from './dashboard-ui';
import { getDashboardData } from '@/app/(campaign-manager)/campaign-manager/actions/reports';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/campaign-manager/create-account');
    return null;
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('campaign_manager_profiles')
    .select('status')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile || profile.status !== 'approved') {
    await supabase.auth.signOut();
    redirect('/campaign-manager/create-account');
    return null;
  }

  const { metrics, campaigns, liveActivity } = await getDashboardData(user.id);

  // Re-fetch profile for full name (DashboardData only gives metrics)
  const { data: fullProfile } = await adminClient
    .from('campaign_manager_profiles')
    .select('first_name, last_name, organization_name')
    .eq('auth_user_id', user.id)
    .single();

  const userName = fullProfile ? `${fullProfile.first_name} ${fullProfile.last_name}` : 'Manager';

  return (
    <DashboardUI
      metrics={metrics}
      campaigns={campaigns}
      liveActivity={liveActivity}
      userName={userName}
      userRole="Campaign Manager"
    />
  );
}
