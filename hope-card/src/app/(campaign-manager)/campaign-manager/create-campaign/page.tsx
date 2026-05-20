import { redirect } from 'next/navigation';
import { createClient } from '@/campaign-manager-utils/supabase/server';
import { createAdminClient } from '@/campaign-manager-utils/supabase/admin';
import CreateCampaignUI from './create-campaign-ui';

export default async function CreateCampaignPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/campaign-manager/create-account');
    return null;
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('campaign_manager_profiles')
    .select('first_name, last_name, status')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile || profile.status !== 'approved') {
    redirect('/campaign-manager/create-account');
    return null;
  }

  const managerName = `${profile.first_name} ${profile.last_name}`;

  return (
    <CreateCampaignUI
      managerName={managerName}
    />
  );
}
