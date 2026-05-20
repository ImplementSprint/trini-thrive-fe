// hooks/useImpact.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase-client';

export interface ImpactStats {
  total_donations_amount: number;
  total_donations_count: number;
  lives_touched: number;
}

export interface DonationHistoryItem {
  id: string;
  campaign_title: string;
  amount_paid: number;
  payment_method: string;
  status: string;
  purchased_at: string;
}

export interface ImpactData {
  first_name: string;
  stats: ImpactStats;
  donation_history: DonationHistoryItem[];
}

export function useImpact() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImpact = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/impact?authUserId=${session.user.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load impact data');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImpact(); }, [fetchImpact]);

  return { data, loading, error, refetch: fetchImpact };
}
