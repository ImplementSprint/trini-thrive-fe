'use server';

import { createClient } from '@/campaign-manager-utils/supabase/server';
import { createAdminClient } from '@/campaign-manager-utils/supabase/admin';
import { redirect } from 'next/navigation';
import nodemailer from 'nodemailer';

export type AuthActionResult = { error?: string; success?: boolean } | null;
export type SendOTPResult = { error?: string; success?: boolean };
export type VerifyOTPResult = { error?: string; success?: boolean };

// Generate a random 6-digit OTP code
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const organizationName = formData.get('organization') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('contactNumber') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const secFile = formData.get('secRegistration') as File;
  const orgCertFile = formData.get('orgCertificate') as File;

  if (!firstName || !lastName || !organizationName || !email || !phone || !password || !confirmPassword) {
    return { error: 'All fields are required.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  if (!secFile || secFile.size === 0) {
    return { error: 'Please upload your SEC Registration.' };
  }
  if (secFile.size > MAX_FILE_SIZE) {
    return { error: 'SEC Registration must be smaller than 5 MB.' };
  }

  if (!orgCertFile || orgCertFile.size === 0) {
    return { error: 'Please upload your Organizational Certificate.' };
  }
  if (orgCertFile.size > MAX_FILE_SIZE) {
    return { error: 'Organizational Certificate must be smaller than 5 MB.' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return { error: 'Server misconfiguration. Please contact support.' };
  }

  const adminClient = createAdminClient();

  // Upload SEC Registration
  const secExt = secFile.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') ?? 'bin';
  const secKey = `sec-registrations/${Date.now()}-${crypto.randomUUID()}.${secExt}`;
  const { error: secUploadError } = await adminClient.storage
    .from('camp-man-files')
    .upload(secKey, secFile);

  if (secUploadError) {
    return { error: `Failed to upload SEC Registration: ${secUploadError.message}` };
  }

  // Upload Org Certificate
  const orgCertExt = orgCertFile.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') ?? 'bin';
  const orgCertKey = `org-certificates/${Date.now()}-${crypto.randomUUID()}.${orgCertExt}`;
  const { error: orgCertUploadError } = await adminClient.storage
    .from('camp-man-files')
    .upload(orgCertKey, orgCertFile);

  if (orgCertUploadError) {
    await adminClient.storage.from('camp-man-files').remove([secKey]);
    return { error: 'Failed to upload Organizational Certificate. Please try again.' };
  }

  // Create auth user
  const supabase = await createClient();
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/campaign-manager/auth/callback`,
    },
  });

  if (signUpError) {
    await adminClient.storage.from('camp-man-files').remove([secKey, orgCertKey]);
    return { error: signUpError.message };
  }

  const user = data.user;
  if (!user) {
    return { error: 'Signup failed. Please try again.' };
  }

  // Insert profile row
  const { error: profileError } = await adminClient
    .from('campaign_manager_profiles')
    .insert({
      auth_user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      organization_name: organizationName,
      email,
      phone,
      sec_registration: secKey,
      organizational_certificate: orgCertKey,
      status: 'pending',
    });

  if (profileError) {
    console.error('[signUpAction] profile insertion failed:', profileError);
    await adminClient.storage.from('camp-man-files').remove([secKey, orgCertKey]);
    await adminClient.auth.admin.deleteUser(user.id);
    return { error: `Failed to save profile: ${profileError.message}` };
  }

  return null; // success — caller shows confirmation message
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  console.log('[loginAction] Attempting login for:', email);

  if (!email || !password) {
    console.log('[loginAction] Missing email or password');
    return { error: 'Email and password are required.' };
  }

  const supabase = await createClient();

  console.log('[loginAction] Signing in with Supabase...');
  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error('[loginAction] Sign in error:', signInError);
    return { error: 'Invalid email or password.' };
  }

  if (!data.user) {
    console.log('[loginAction] No user returned from sign in');
    await supabase.auth.signOut();
    return { error: 'Invalid email or password.' };
  }

  const user = data.user;
  console.log('[loginAction] User signed in:', user.id);

  // Belt-and-suspenders: Supabase also blocks unconfirmed sign-ins at the
  // project level, but we re-check here in case that setting is disabled.
  if (!user.email_confirmed_at) {
    console.log('[loginAction] User email not confirmed');
    await supabase.auth.signOut();
    return { error: 'Please confirm your email before signing in.' };
  }

  const adminClient = createAdminClient();
  console.log('[loginAction] Fetching profile...');
  const { data: profile, error: profileError } = await adminClient
    .from('campaign_manager_profiles')
    .select('status')
    .eq('auth_user_id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('[loginAction] profile query failed:', profileError?.message);
    await supabase.auth.signOut();
    return { error: 'Account not found. Please contact support.' };
  }

  console.log('[loginAction] Profile status:', profile.status);

  if (profile.status !== 'approved') {
    await supabase.auth.signOut();
    const msg =
      profile.status === 'pending'
        ? 'Your account is pending admin approval.'
        : profile.status === 'rejected'
          ? 'Your account has been rejected. Please contact support.'
          : 'Your account is not active. Please contact support.';
    console.log('[loginAction] Account not approved:', msg);
    return { error: msg };
  }

  console.log('[loginAction] Login successful, redirecting');
  // Use redirect() which is the proper Next.js way to handle post-action redirects
  // This ensures the Set-Cookie headers are included in the redirect response
  redirect('/campaign-manager/dashboard');
}

export async function getProfileAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const adminClient = createAdminClient();
  const { data: profile, error } = await adminClient
    .from('campaign_manager_profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (error || !profile) return null;

  return profile;
}

export async function updateProfileAction(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const organizationName = formData.get('organizationName') as string;
  const phone = formData.get('phone') as string;

  if (!firstName || !lastName || !organizationName || !phone) {
    return { error: 'First name, last name, organization, and phone are required.' };
  }

  const adminClient = createAdminClient();
  const { error: profileError } = await adminClient
    .from('campaign_manager_profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      organization_name: organizationName,
      phone: phone,
    })
    .eq('auth_user_id', user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  return null;
}

export async function sendOTPAction(formData: FormData): Promise<SendOTPResult> {
  const email = (formData.get('email') as string | null)?.trim() ?? '';

  if (!email) {
    return { error: 'Email is required.' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  const adminClient = createAdminClient();

  // Check if user exists in auth
  const { data: users, error: userQueryError } = await adminClient.auth.admin.listUsers();

  if (userQueryError) {
    console.error('[sendOTPAction] failed to query users:', userQueryError);
    return { error: 'Failed to verify account. Please try again.' };
  }

  const userExists = users?.users.some(u => u.email === email);
  if (!userExists) {
    return { error: 'No account found with this email address.' };
  }

  // Generate OTP
  const otpCode = generateOTPCode();
  const expiresAtMs = Date.now() + 15 * 60 * 1000; // 15 minutes

  // Delete any existing OTP sessions for this email
  await adminClient
    .from('otp_sessions')
    .delete()
    .eq('email', email);

  // Insert new OTP session
  const { error: insertError } = await adminClient
    .from('otp_sessions')
    .insert({
      email,
      otp: otpCode,
      expires_at_ms: expiresAtMs,
      created_at_ms: Date.now(),
    });

  if (insertError) {
    console.error('[sendOTPAction] failed to insert OTP session:', insertError);
    return { error: 'Failed to send recovery code. Please try again.' };
  }

  // Send email via SMTP (non-blocking - OTP is already stored in database)
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `${process.env.SMTP_FROM} <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Hopecard Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #a6493f;">Password Reset Request</h2>
          <p>You have requested to reset your password. Use the code below to complete the process:</p>
          <div style="background-color: #f5f2f1; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #6d4a44; margin: 0;">
              ${otpCode}
            </p>
          </div>
          <p style="color: #666;">This code will expire in 15 minutes.</p>
          <p style="color: #666;">If you did not request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">© Hopecard. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('[sendOTPAction] OTP email sent successfully to:', email);
  } catch (emailError) {
    console.warn('[sendOTPAction] email send failed (non-blocking):', emailError);
    // Continue - OTP is already stored in database, user can still use it
  }

  return { success: true };
}

export async function verifyOTPAction(
  email: string,
  otpCode: string
): Promise<VerifyOTPResult> {
  const trimmedEmail = (email ?? '').trim();
  const trimmedOTP = (otpCode ?? '').trim();

  if (!trimmedEmail || !trimmedOTP) {
    return { error: 'Email and recovery code are required.' };
  }

  const adminClient = createAdminClient();

  // Find matching OTP session
  const { data: otpSessions, error: queryError } = await adminClient
    .from('otp_sessions')
    .select('*')
    .eq('email', trimmedEmail)
    .eq('otp', trimmedOTP)
    .single();

  if (queryError || !otpSessions) {
    return { error: 'Invalid recovery code.' };
  }

  // Check if OTP has expired
  if (Date.now() > otpSessions.expires_at_ms) {
    return { error: 'Recovery code has expired. Please request a new one.' };
  }

  // Mark OTP as used
  const { error: updateError } = await adminClient
    .from('otp_sessions')
    .update({ used: true })
    .eq('id', otpSessions.id);

  if (updateError) {
    console.error('[verifyOTPAction] failed to verify OTP:', updateError);
    return { error: 'Failed to verify code. Please try again.' };
  }

  return { success: true };
}

export async function resetPasswordAction(
  email: string,
  otpCode: string,
  newPassword: string
): Promise<AuthActionResult> {
  const trimmedEmail = (email ?? '').trim();
  const trimmedOTP = (otpCode ?? '').trim();

  if (!trimmedEmail || !trimmedOTP || !newPassword) {
    return { error: 'Email, recovery code, and new password are required.' };
  }

  const adminClient = createAdminClient();

  // Verify that this OTP has been used (verified)
  const { data: otpSession, error: queryError } = await adminClient
    .from('otp_sessions')
    .select('*')
    .eq('email', trimmedEmail)
    .eq('otp', trimmedOTP)
    .eq('used', true)
    .single();

  if (queryError || !otpSession) {
    return { error: 'Invalid or expired recovery code.' };
  }

  // Check if OTP has expired
  if (Date.now() > otpSession.expires_at_ms) {
    return { error: 'Recovery code has expired. Please request a new one.' };
  }

  // Get user from auth by email
  const { data: users, error: userListError } = await adminClient.auth.admin.listUsers();

  if (userListError || !users) {
    console.error('[resetPasswordAction] failed to list users:', userListError);
    return { error: 'Failed to reset password. Please try again.' };
  }

  const user = users.users.find(u => u.email === trimmedEmail);
  if (!user) {
    return { error: 'User account not found.' };
  }

  // Update user password using admin API
  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );

  if (updateError) {
    console.error('[resetPasswordAction] failed to update password:', updateError);
    return { error: 'Failed to reset password. Please try again.' };
  }

  // Delete the OTP session after successful password reset
  await adminClient
    .from('otp_sessions')
    .delete()
    .eq('id', otpSession.id);

  return null; // success
}
