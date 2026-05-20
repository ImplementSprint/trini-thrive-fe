// hooks/useCampaigns.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  target_amount: number;
  collected_amount: number;
  progress_pct: number;
  cover_image_url: string | null;
  status: string;
  end_date: string | null;
}

export function useCampaigns(category?: string) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_DONOR_BACKEND_URL;
      const url = category
        ? `${base}/api/v1/campaigns?category=${encodeURIComponent(category)}`
        : `${base}/api/v1/campaigns`;
      const donorToken = typeof window !== 'undefined' ? localStorage.getItem('donor_token') : null;
      const res = await fetch(url, {
        headers: donorToken ? { Authorization: `Bearer ${donorToken}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load campaigns');
      setCampaigns(data.campaigns ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  return { campaigns, loading, error, refetch: fetchCampaigns };
}
