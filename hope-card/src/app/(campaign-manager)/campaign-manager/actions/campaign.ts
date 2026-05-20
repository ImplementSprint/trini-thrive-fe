'use server';

import { createClient } from '@/campaign-manager-utils/supabase/server';
import { createAdminClient } from '@/campaign-manager-utils/supabase/admin';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export type ActionResponse = {
  success: boolean;
  error?: string;
  data?: any;
  validationErrors?: Array<{ field: string; message: string }>;
};

interface CampaignValidationError {
  field: string;
  message: string;
}

function validateCampaignData(data: {
  title: string | null;
  category: string | null;
  description: string | null;
  targetAmount: number;
  endDate: string | null;
  beneficiaryIds: string[];
  managerId: File | null;
  proofOfAddress: File | null;
  agreedToTerms: string | null;
  agreedToPrivacy: string | null;
  agreedToCampaignAccuracy: string | null;
}): CampaignValidationError[] {
  const errors: CampaignValidationError[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Campaign title is required' });
  }

  const validCategories = ['Health', 'Education', 'Environment', 'Disaster'];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.push({ field: 'category', message: 'Please select a valid category' });
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Campaign description is required' });
  }

  if (isNaN(data.targetAmount) || data.targetAmount <= 0) {
    errors.push({ field: 'targetAmount', message: 'Target amount must be greater than 0' });
  }

  if (!data.endDate) {
    errors.push({ field: 'endDate', message: 'End date is required' });
  } else {
    const endDate = new Date(data.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (endDate <= today) {
      errors.push({ field: 'endDate', message: 'End date must be in the future' });
    }
  }

  if (data.beneficiaryIds.length === 0) {
    errors.push({ field: 'beneficiaries', message: 'At least one beneficiary must be selected' });
  }

  if (!data.managerId || data.managerId.size === 0) {
    errors.push({ field: 'managerId', message: 'Manager ID document is required' });
  }

  if (!data.proofOfAddress || data.proofOfAddress.size === 0) {
    errors.push({ field: 'proofOfAddress', message: 'Proof of Address document is required' });
  }

  if (data.agreedToTerms !== 'true') {
    errors.push({ field: 'agreements', message: 'You must agree to the Terms of Service' });
  }

  if (data.agreedToPrivacy !== 'true') {
    errors.push({ field: 'agreements', message: 'You must agree to the Privacy Policy' });
  }

  if (data.agreedToCampaignAccuracy !== 'true') {
    errors.push({ field: 'agreements', message: 'You must certify campaign accuracy' });
  }

  return errors;
}

export async function getApprovedBeneficiaries(): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('beneficiary_profiles')
      .select('id, first_name, last_name, email, role, status, account_name, bank_name')
      .eq('status', 'approved')
      .eq('role', 'beneficiary');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCampaignAction(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const targetAmount = parseFloat(formData.get('target_amount') as string) || 0;
    const endDate = (formData.get('end_date') as string) || null;
    const coverImage = formData.get('coverImage') as File | null;
    let selectedBeneficiaryIds: string[] = [];
    try {
      selectedBeneficiaryIds = JSON.parse((formData.get('selectedBeneficiaries') as string) || '[]');
    } catch {}

    const managerId = formData.get('managerId') as File | null;
    const proofOfAddress = formData.get('proofOfAddress') as File | null;
    const agreedToTerms = formData.get('agreedToTerms') as string | null;
    const agreedToPrivacy = formData.get('agreedToPrivacy') as string | null;
    const agreedToCampaignAccuracy = formData.get('agreedToCampaignAccuracy') as string | null;

    // Validate campaign data
    const validationErrors = validateCampaignData({
      title,
      category,
      description,
      targetAmount,
      endDate,
      beneficiaryIds: selectedBeneficiaryIds,
      managerId,
      proofOfAddress,
      agreedToTerms,
      agreedToPrivacy,
      agreedToCampaignAccuracy,
    });

    if (validationErrors.length > 0) {
      return { success: false, error: 'Campaign validation failed', validationErrors };
    }

    let cover_image_key = null;

    if (coverImage && coverImage.size > 0) {
      const fileExt = coverImage.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `cover-images/campaigns/${fileName}`;

      const { data: uploadData, error: uploadError } = await adminSupabase.storage
        .from('camp-man-files')
        .upload(filePath, coverImage);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: 'Failed to upload cover image. Ensure the camp-man-files bucket and cover-images folder exist.' };
      }
      cover_image_key = uploadData.path;
    }

    const { data: campaign, error: insertError } = await adminSupabase
      .from('hc_campaigns')
      .insert({
        title: title || 'Untitled Campaign',
        category: category?.toLowerCase() || null,
        description: description || null,
        cover_image_key,
        target_amount: targetAmount,
        end_date: endDate,
        status: 'draft',
        created_by: userData.user.id,
        start_date: new Date().toISOString().split('T')[0],
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return { success: false, error: 'Failed to create campaign.' };
    }

    if (selectedBeneficiaryIds.length > 0) {
      await adminSupabase
        .from('campaign_invitations')
        .insert(selectedBeneficiaryIds.map((id) => ({
          campaign_id: campaign.id,
          beneficiary_profile_id: id,
          status: 'pending',
        })));

      const { data: beneficiaries } = await adminSupabase
        .from('beneficiary_profiles')
        .select('email, first_name, last_name')
        .in('id', selectedBeneficiaryIds);

      for (const b of beneficiaries ?? []) {
        if (!b.email) continue;
        try {
          await transporter.sendMail({
            from: `${process.env.SMTP_FROM} <${process.env.SMTP_USER}>`,
            to: b.email,
            subject: 'You have been invited to a new HopeCard Campaign!',
            html: `<div style="font-family:sans-serif;text-align:center;color:#333">
              <h2 style="color:#b55247">Hello ${b.first_name || 'Beneficiary'},</h2>
              <p>You have been selected as a beneficiary for a newly created campaign on HopeCard.</p>
              <p>Please log in to your dashboard to view the details and confirm your participation.</p>
            </div>`,
          });
        } catch (mailError: any) {
          console.error(`Failed to send invite email to ${b.email}:`, mailError.message);
        }
      }
    }

    return { success: true, data: campaign };
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return { success: false, error: error.message };
  }
}

export async function activateCampaignAction(campaignId: string): Promise<ActionResponse> {
  try {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from('hc_campaigns')
      .update({ status: 'active' })
      .eq('id', campaignId);

    if (error) {
      console.error('Activation error:', error);
      return { success: false, error: 'Failed to activate campaign.' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error activating campaign:', error);
    return { success: false, error: error.message };
  }
}

export async function completeCampaignAction(campaignId: string): Promise<ActionResponse> {
  try {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from('hc_campaigns')
      .update({ status: 'completed' })
      .eq('id', campaignId);

    if (error) {
      console.error('Completion error:', error);
      return { success: false, error: 'Failed to complete campaign.' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error completing campaign:', error);
    return { success: false, error: error.message };
  }
}

export async function cancelCampaignAction(campaignId: string): Promise<ActionResponse> {
  try {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from('hc_campaigns')
      .update({ status: 'cancelled' })
      .eq('id', campaignId);

    if (error) {
      console.error('Cancellation error:', error);
      return { success: false, error: 'Failed to cancel campaign.' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error cancelling campaign:', error);
    return { success: false, error: error.message };
  }
}

export async function changeCampaignToDraftAction(campaignId: string): Promise<ActionResponse> {
  try {
    const adminSupabase = createAdminClient();

    // First, fetch the current campaign status
    const { data: campaign, error: fetchError } = await adminSupabase
      .from('hc_campaigns')
      .select('status')
      .eq('id', campaignId)
      .single();

    if (fetchError || !campaign) {
      console.error('Error fetching campaign:', fetchError);
      return { success: false, error: 'Campaign not found.' };
    }

    // Validate that campaign is in 'active' status
    if (campaign.status === 'draft') {
      return { success: false, error: 'This campaign is already in Draft status.' };
    }

    if (campaign.status !== 'active') {
      return { success: false, error: 'You can only change Active campaigns to Draft.' };
    }

    // Update status to draft
    const { error: updateError } = await adminSupabase
      .from('hc_campaigns')
      .update({ status: 'draft' })
      .eq('id', campaignId);

    if (updateError) {
      console.error('Draft status change error:', updateError);
      return { success: false, error: 'Failed to change campaign to draft.' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error changing campaign to draft:', error);
    return { success: false, error: error.message };
  }
}

export async function getCampaignBeneficiaryIds(campaignId: string): Promise<ActionResponse> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('campaign_invitations')
      .select('beneficiary_profile_id')
      .eq('campaign_id', campaignId)
      .in('status', ['pending', 'accepted']);

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []).map((r) => r.beneficiary_profile_id) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function inviteBeneficiariesToCampaignAction(
  campaignId: string,
  beneficiaryIds: string[]
): Promise<ActionResponse> {
  try {
    const adminSupabase = createAdminClient();

    const { data: existing } = await adminSupabase
      .from('campaign_invitations')
      .select('beneficiary_profile_id')
      .eq('campaign_id', campaignId);

    const existingIds = new Set((existing ?? []).map((r) => r.beneficiary_profile_id));
    const newIds = beneficiaryIds.filter((id) => !existingIds.has(id));

    if (newIds.length > 0) {
      const { error } = await adminSupabase
        .from('campaign_invitations')
        .insert(newIds.map((id) => ({ campaign_id: campaignId, beneficiary_profile_id: id })));

      if (error) return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function migrateCoverImagesAction(): Promise<ActionResponse> {
  try {
    const { migrateCoverImages } = await import('@/campaign-manager-utils/migrate-cover-images');
    const result = await migrateCoverImages();
    return result;
  } catch (error: any) {
    console.error('Migration action error:', error);
    return { success: false, error: error.message };
  }
}
