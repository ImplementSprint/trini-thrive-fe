import { supabaseServer } from './supabase/server';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'hopecard-admin-secret-key-change-in-production'
);

/**
 * Verify JWT token and extract admin data
 */
export async function verifyJWT(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Create JWT token for admin - using jose library
 */
export async function createJWT(adminId: string, adminEmail: string) {
  const token = await new SignJWT({
    sub: adminId,
    email: adminEmail,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Generate OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via email
 */
export async function sendOTPEmail(email: string, otp: string) {
  try {
    // Use Supabase Email service or your email provider
    // For now, we'll log it (you should implement actual email sending)
    console.log(`OTP for ${email}: ${otp}`);
    return true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
}

/**
 * Verify admin credentials
 */
export async function verifyAdminCredentials(email: string, password: string) {
  try {
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return null;
  }
}

/**
 * Get admin profile data
 */
export async function getAdminProfile(userId: string) {
  try {
    const { data, error } = await supabaseServer
      .from('admins')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return null;
  }
}

/**
 * Update admin password
 */
export async function updateAdminPassword(userId: string, newPassword: string) {
  try {
    const { error } = await supabaseServer.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
}

/**
 * Check if email exists and is admin
 */
export async function isAdminEmail(email: string) {
  try {
    const { data, error } = await supabaseServer
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  } catch (error) {
    return false;
  }
}
