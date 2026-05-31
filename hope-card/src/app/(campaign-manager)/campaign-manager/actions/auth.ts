'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/campaign-manager-utils/supabase/server';
import { createAdminClient } from '@/campaign-manager-utils/supabase/admin'; // used by getProfileAction / updateProfileAction

const CM_BACKEND_URL = process.env.NEXT_PUBLIC_CM_BACKEND_URL ?? 'http://localhost:3103';

export async function loginAction(fd: FormData): Promise<{ error: string } | null> {
  const email = fd.get('email') as string;
  const password = fd.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  let token: string;
  try {
    const res = await fetch(`${CM_BACKEND_URL}/api/v1/hopecard/cm/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 403) {
        const payload = typeof data.message === 'object' ? data.message : data;
        const reason = payload?.reason as string | undefined;
        const statusReason = payload?.status_reason as string | null | undefined;
        const expiresAt = payload?.status_expires_at as string | null | undefined;

        if (reason === 'pending_approval') {
          return { error: 'Your account is awaiting admin approval. You will be notified once approved.' };
        }

        const durationText = (() => {
          if (!expiresAt) return 'permanently';
          const diff = new Date(expiresAt).getTime() - Date.now();
          if (diff <= 0) return 'temporarily';
          const days = Math.ceil(diff / 86_400_000);
          const date = new Date(expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          return `until ${date} (${days} day${days !== 1 ? 's' : ''} remaining)`;
        })();

        if (reason === 'banned') {
          const why = statusReason ? ` Reason: ${statusReason}.` : '';
          return { error: `Your account has been banned ${durationText}.${why}` };
        }

        if (reason === 'suspended') {
          const why = statusReason ? ` Reason: ${statusReason}.` : '';
          return { error: `Your account has been suspended ${durationText}.${why}` };
        }
      }

      return { error: data.message ?? data.error ?? 'Invalid credentials.' };
    }

    token = data.token ?? data.access_token;
    if (!token) {
      return { error: 'Login failed. Please try again.' };
    }
  } catch {
    return { error: 'Unable to reach the server. Please try again.' };
  }

  // Establish Supabase browser session
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email, password });

  const cookieStore = await cookies();
  cookieStore.set('cm_token', token, { path: '/', sameSite: 'strict', httpOnly: true });
  cookieStore.set('persona', 'campaign-manager', { path: '/', sameSite: 'strict' });

  redirect('/campaign-manager/dashboard');
}

export async function signUpAction(fd: FormData): Promise<{ error: string } | null> {
  const email = fd.get('email') as string;
  const password = fd.get('password') as string;
  const confirmPassword = fd.get('confirmPassword') as string;
  const firstName = fd.get('firstName') as string;
  const lastName = fd.get('lastName') as string;
  const organization = fd.get('organization') as string;
  const contactNumber = fd.get('contactNumber') as string;
  const secRegistration = fd.get('secRegistration') as File | null;
  const orgCertificate = fd.get('orgCertificate') as File | null;

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  // Backend creates the auth user and profile atomically — never split across client + server
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('organization', organization);
    formData.append('contactNumber', contactNumber);
    if (secRegistration) formData.append('secRegistration', secRegistration);
    if (orgCertificate) formData.append('orgCertificate', orgCertificate);

    const res = await fetch(`${CM_BACKEND_URL}/api/v1/hopecard/cm/auth/register`, {
      method: 'POST',
      body: formData,
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = (Array.isArray(body?.message) ? body.message.join(', ') : body?.message) ?? body?.error ?? `Registration error (${res.status})`;
      return { error: msg };
    }
  } catch {
    return { error: 'Unable to reach the registration service. Please try again.' };
  }

  return null;
}

export async function sendOTPAction(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email is required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/campaign-manager/auth/callback`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function verifyOTPAction(
  email: string,
  otp: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'recovery',
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function resetPasswordAction(
  email: string,
  otp: string,
  password: string,
): Promise<{ error?: string } | null> {
  const supabase = await createClient();

  // Re-verify OTP to get a session before updating password
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'recovery',
  });

  if (verifyError) {
    return { error: 'Invalid or expired recovery code.' };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });

  if (updateError) {
    return { error: updateError.message };
  }

  return null;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getProfileAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('campaign_manager_profiles')
    .select('first_name, last_name, email, organization_name, phone, address, status')
    .eq('auth_user_id', user.id)
    .single();

  return profile ?? null;
}

export async function updateProfileAction(
  fd: FormData,
): Promise<{ error?: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const updates: Record<string, string> = {};
  const firstName = fd.get('firstName') as string;
  const lastName = fd.get('lastName') as string;
  const organizationName = fd.get('organizationName') as string;
  const phone = fd.get('phone') as string;

  if (firstName) updates.first_name = firstName;
  if (lastName) updates.last_name = lastName;
  if (organizationName) updates.organization_name = organizationName;
  if (phone) updates.phone = phone;
  // bio field is not in DB — silently ignored

  const admin = createAdminClient();
  const { error } = await admin
    .from('campaign_manager_profiles')
    .update(updates)
    .eq('auth_user_id', user.id);

  if (error) return { error: error.message };
  return null;
}
