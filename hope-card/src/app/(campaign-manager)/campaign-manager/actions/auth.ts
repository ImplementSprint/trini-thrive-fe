'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/campaign-manager-utils/supabase/server';
import { createAdminClient } from '@/campaign-manager-utils/supabase/admin';

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

  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/campaign-manager/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName,
        organization,
        contact_number: contactNumber,
        role: 'campaign-manager',
      },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  const authUserId = signUpData.user?.id;
  if (!authUserId) {
    return { error: 'Sign up succeeded but no user ID was returned. Please try again.' };
  }

  // Always register profile — backend is idempotent
  try {
    const formData = new FormData();
    formData.append('authUserId', authUserId);
    formData.append('email', email);
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('organization', organization);
    formData.append('contactNumber', contactNumber);
    if (secRegistration) formData.append('secRegistration', secRegistration);
    if (orgCertificate) formData.append('orgCertificate', orgCertificate);

    await fetch(`${CM_BACKEND_URL}/api/v1/hopecard/cm/auth/register`, {
      method: 'POST',
      body: formData,
      cache: 'no-store',
    });
  } catch {
    // Non-fatal — admin can manually create profile
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
