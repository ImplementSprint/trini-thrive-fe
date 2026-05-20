// hooks/useProfile.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase-client';

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
  status: 'pending' | 'approved' | 'rejected';
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
        const user = session?.user ?? null;

        if (!user) {
          if (isMounted) {
            setLoading(false);
            setProfile(null);
          }
          return;
        }

        if (isMounted) setAuthUserId(user.id);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/profile?authUserId=${user.id}&email=${encodeURIComponent(user.email || '')}`, {
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        });
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
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
