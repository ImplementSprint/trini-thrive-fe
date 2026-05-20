import { redirect } from 'next/navigation';

export default function CampaignManagerRoot() {
  redirect('/campaign-manager/login');
}
