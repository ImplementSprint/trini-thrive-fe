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
      const base = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
      const url = category
        ? `${base}/api/campaigns?category=${encodeURIComponent(category)}`
        : `${base}/api/campaigns`;
      const res = await fetch(url);
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
