import { redirect } from 'next/navigation';
import { createClient } from '@/campaign-manager-utils/supabase/server';
import { createAdminClient } from '@/campaign-manager-utils/supabase/admin';
import Link from 'next/link';
import { ArrowLeft, Users, Calendar } from 'lucide-react';

export default async function CampaignDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/campaign-manager/login');

  const adminClient = createAdminClient();

  const { data: campaign, error } = await adminClient
    .from('hc_campaigns')
    .select('id, title, description, status, target_amount, collected_amount, end_date, cover_image_key, created_at')
    .eq('id', id)
    .eq('created_by', user.id)
    .single();

  if (error || !campaign) redirect('/campaign-manager/my-campaigns');

  const { data: invitations } = await adminClient
    .from('campaign_invitations')
    .select('beneficiary_profile_id, status')
    .eq('campaign_id', id);

  const beneficiaryIds = (invitations ?? []).map((i: any) => i.beneficiary_profile_id);
  let beneficiaryNames: string[] = [];

  if (beneficiaryIds.length > 0) {
    const { data: profiles } = await adminClient
      .from('beneficiary_profiles')
      .select('id, first_name, last_name')
      .in('id', beneficiaryIds);

    beneficiaryNames = (profiles ?? []).map((p: any) => `${p.first_name} ${p.last_name}`);
  }

  const progressPercentage =
    campaign.target_amount > 0
      ? Math.min((campaign.collected_amount / campaign.target_amount) * 100, 100)
      : 0;

  const statusColors: Record<string, string> = {
    active: '#3caa71',
    draft: '#e38f4d',
    completed: '#3caa71',
    cancelled: '#c86a5d',
  };

  return (
    <div className="min-h-screen bg-[#FCF9F8] p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/campaign-manager/my-campaigns"
          className="inline-flex items-center gap-2 text-[#877270] hover:text-[#97453e] mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to My Campaigns
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-[#dac1be33] p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1b1c1b] mb-2">{campaign.title}</h1>
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: `${statusColors[campaign.status] ?? '#877270'}22`,
                  color: statusColors[campaign.status] ?? '#877270',
                }}
              >
                {campaign.status.toUpperCase()}
              </span>
            </div>
          </div>

          {campaign.description && (
            <p className="text-[#554240] mb-6 leading-relaxed">{campaign.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#f6f3f2] rounded-xl p-4">
              <p className="text-sm text-[#877270] mb-1">Fundraising Progress</p>
              <p className="text-xl font-bold text-[#1b1c1b]">
                ₱{Number(campaign.collected_amount).toLocaleString()}{' '}
                <span className="text-base font-normal text-[#877270]">
                  of ₱{Number(campaign.target_amount).toLocaleString()}
                </span>
              </p>
              <div className="mt-2 h-2 bg-[#dac1be4d] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#97453e] rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-[#877270] mt-1">{progressPercentage.toFixed(1)}% funded</p>
            </div>

            <div className="bg-[#f6f3f2] rounded-xl p-4">
              <div className="flex items-center gap-2 text-[#877270] mb-1">
                <Calendar size={16} />
                <p className="text-sm">End Date</p>
              </div>
              <p className="text-lg font-semibold text-[#1b1c1b]">
                {campaign.end_date
                  ? new Date(campaign.end_date).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
          </div>

          {beneficiaryNames.length > 0 && (
            <div className="bg-[#f6f3f2] rounded-xl p-4">
              <div className="flex items-center gap-2 text-[#877270] mb-3">
                <Users size={16} />
                <p className="text-sm font-medium">
                  Beneficiaries ({beneficiaryNames.length})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {beneficiaryNames.map((name, i) => (
                  <span
                    key={i}
                    className="bg-white border border-[#dac1be4d] rounded-full px-3 py-1 text-sm text-[#554240]"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
