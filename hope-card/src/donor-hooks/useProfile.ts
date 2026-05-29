// hooks/useProfile.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, getDonorTokenPayload } from '@/donor-lib/supabase-client';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  barangay: string;
  municipality: string;
  province: string;
  profile_photo_url: string | null;
  profile_photo_key: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'banned';
  status_reason: string | null;
  status_expires_at: string | null;
  created_at: string;
  total_donations_amount: number;
  total_donations_count: number;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        let userId: string;
        let email: string;
        let token: string;

        if (session?.user) {
          userId = session.user.id;
          email = session.user.email ?? '';
          token = localStorage.getItem('donor_token') ?? session.access_token ?? '';
        } else {
          // Supabase session gone — recover from custom donor_token JWT
          const payload = getDonorTokenPayload();
          if (!payload?.sub) {
            if (isMounted) { setLoading(false); setProfile(null); }
            return;
          }
          userId = payload.sub;
          email = payload.email ?? '';
          token = localStorage.getItem('donor_token') ?? '';
        }

        if (isMounted) setAuthUserId(userId);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DONOR_BACKEND_URL}/api/v1/hopecard/donor/profile?authUserId=${userId}&email=${encodeURIComponent(email)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.error ?? 'Failed to load profile');
        if (isMounted) setProfile(data.profile);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'SIGNED_OUT') {
        load();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const saveProfile = useCallback(async (updates: Partial<Omit<UserProfile, 'id' | 'profile_photo_url'>>) => {
    if (!authUserId) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_DONOR_BACKEND_URL}/api/v1/hopecard/donor/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...({ Authorization: `Bearer ${localStorage.getItem('donor_token') ?? session?.access_token ?? ''}` }),
        },
        body: JSON.stringify({ authUserId, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save');
      setProfile((prev) => prev ? { ...prev, ...updates } : prev);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [authUserId]);

  return { profile, loading, error, saving, saveError, saveSuccess, saveProfile, authUserId };
}
