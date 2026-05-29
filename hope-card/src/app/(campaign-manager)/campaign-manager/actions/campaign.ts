'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/campaign-manager-utils/supabase/server';
import { createAdminClient } from '@/campaign-manager-utils/supabase/admin';

const CM_BACKEND_URL = process.env.NEXT_PUBLIC_CM_BACKEND_URL ?? 'http://localhost:3103';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('cm_token')?.value ?? null;
}

// ─── Campaign status actions ──────────────────────────────────────────────────

async function updateCampaignStatus(
  campaignId: string,
  status: string,
): Promise<{ error?: string } | null> {
  const admin = createAdminClient();
  const { error } = await admin
    .from('hc_campaigns')
    .update({ status })
    .eq('id', campaignId);

  if (error) return { error: error.message };
  revalidatePath('/campaign-manager/my-campaigns');
  revalidatePath('/campaign-manager/dashboard');
  return null;
}

export async function activateCampaignAction(campaignId: string) {
  return updateCampaignStatus(campaignId, 'active');
}

export async function completeCampaignAction(campaignId: string) {
  return updateCampaignStatus(campaignId, 'completed');
}

export async function cancelCampaignAction(campaignId: string) {
  return updateCampaignStatus(campaignId, 'cancelled');
}

export async function changeCampaignToDraftAction(campaignId: string) {
  return updateCampaignStatus(campaignId, 'draft');
}

// ─── Beneficiary helpers ──────────────────────────────────────────────────────

export async function getApprovedBeneficiaries(): Promise<{
  success: boolean;
  data?: { id: string; first_name: string; last_name: string; email: string; bank_name: string | null }[];
  error?: string;
}> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('beneficiary_profiles')
      .select('id, first_name, last_name, email, status')
      .eq('status', 'approved');

    if (error) return { success: false, error: error.message };

    // Try to fetch bank names
    const ids = (data ?? []).map((b: any) => b.id);
    const bankMap: Record<string, string> = {};
    if (ids.length > 0) {
      const { data: banks } = await admin
        .from('beneficiary_bank_accounts')
        .select('beneficiary_profile_id, bank_name')
        .in('beneficiary_profile_id', ids)
        .eq('is_primary', true);
      for (const bank of banks ?? []) {
        bankMap[bank.beneficiary_profile_id] = bank.bank_name;
      }
    }

    return {
      success: true,
      data: (data ?? []).map((b: any) => ({
        id: b.id,
        first_name: b.first_name,
        last_name: b.last_name,
        email: b.email ?? '',
        bank_name: bankMap[b.id] ?? null,
      })),
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getCampaignBeneficiaryIds(campaignId: string): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('campaign_invitations')
      .select('beneficiary_profile_id')
      .eq('campaign_id', campaignId)
      .eq('status', 'accepted');

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []).map((r: any) => r.beneficiary_profile_id) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function inviteBeneficiariesToCampaignAction(
  campaignId: string,
  beneficiaryIds: string[],
): Promise<{ error?: string } | null> {
  const admin = createAdminClient();

  const rows = beneficiaryIds.map((id) => ({
    campaign_id: campaignId,
    beneficiary_profile_id: id,
    status: 'pending',
  }));

  const { error } = await admin
    .from('campaign_invitations')
    .upsert(rows, { onConflict: 'campaign_id,beneficiary_profile_id' });

  if (error) return { error: error.message };
  revalidatePath('/campaign-manager/my-campaigns');
  return null;
}

// ─── Create campaign ──────────────────────────────────────────────────────────

export async function createCampaignAction(
  fd: FormData,
): Promise<{ error?: string; campaignId?: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated.' };

  const token = await getAuthToken();

  const res = await fetch(`${CM_BACKEND_URL}/api/v1/hopecard/cm/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      title: fd.get('title'),
      description: fd.get('description'),
      target_amount: Number(fd.get('targetAmount') ?? 0),
      category: fd.get('category'),
      end_date: fd.get('endDate'),
      created_by: user.id,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: data.message ?? 'Failed to create campaign.' };
  }

  const data = await res.json();
  revalidatePath('/campaign-manager/my-campaigns');
  revalidatePath('/campaign-manager/dashboard');
  return { campaignId: data.id };
}
