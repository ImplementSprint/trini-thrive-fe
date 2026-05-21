import { redirect } from 'next/navigation';
import { getProfileAction } from '@/app/(campaign-manager)/campaign-manager/actions/auth';
import SettingsUI from './settings-ui';

export default async function SettingsPage() {
  const profile = await getProfileAction();

  if (!profile || profile.status !== 'approved') {
    redirect('/campaign-manager/login');
    return null;
  }

  return (
    <SettingsUI
      initialProfile={{
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? '',
        email: profile.email ?? '',
        bio: '',
        organization_name: profile.organization_name ?? '',
        phone: profile.phone ?? '',
      }}
    />
  );
}
