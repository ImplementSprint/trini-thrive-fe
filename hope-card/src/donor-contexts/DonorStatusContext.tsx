'use client';

import React, {
  createContext, useContext, useEffect, useState, ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getDonorTokenPayload } from '@/donor-lib/supabase-client';

interface DonorStatusState {
  isSuspended: boolean;
  isBanned: boolean;
  statusReason: string | null;
  statusExpiresAt: string | null;
  isLoading: boolean;
}

const DonorStatusContext = createContext<DonorStatusState>({
  isSuspended: false,
  isBanned: false,
  statusReason: null,
  statusExpiresAt: null,
  isLoading: true,
});

export function DonorStatusProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<DonorStatusState>({
    isSuspended: false,
    isBanned: false,
    statusReason: null,
    statusExpiresAt: null,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function checkStatus() {
      const { data: { session } } = await supabase.auth.getSession();
      let userId: string | null = null;
      let email: string | null = null;
      let token: string | null = null;

      if (session?.user) {
        userId = session.user.id;
        email = session.user.email ?? null;
        token = localStorage.getItem('donor_token') ?? session.access_token ?? null;
      } else {
        const payload = getDonorTokenPayload();
        if (payload?.sub) {
          userId = payload.sub;
          email = (payload as any).email ?? null;
          token = localStorage.getItem('donor_token') ?? null;
        }
      }

      if (!userId) {
        if (!cancelled) setState(s => ({ ...s, isLoading: false }));
        return;
      }

      try {
        const base = process.env.NEXT_PUBLIC_DONOR_BACKEND_URL ?? '';
        const res = await fetch(
          `${base}/api/v1/hopecard/donor/profile?authUserId=${userId}&email=${encodeURIComponent(email ?? '')}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!res.ok) {
          if (!cancelled) setState(s => ({ ...s, isLoading: false }));
          return;
        }

        const data = await res.json();
        const profile = data.profile;
        const status: string = profile?.status ?? '';
        const statusReason: string | null = profile?.status_reason ?? null;
        const statusExpiresAt: string | null = profile?.status_expires_at ?? null;

        if (status === 'banned') {
          if (cancelled) return;
          await supabase.auth.signOut();
          localStorage.removeItem('donor_token');
          document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
          const params = new URLSearchParams({ banned: '1' });
          if (statusReason) params.set('reason', statusReason);
          if (statusExpiresAt) params.set('expires', statusExpiresAt);
          router.push(`/donor/login?${params.toString()}`);
          return;
        }

        if (!cancelled) {
          setState({
            isSuspended: status === 'suspended',
            isBanned: false,
            statusReason,
            statusExpiresAt,
            isLoading: false,
          });
        }
      } catch {
        if (!cancelled) setState(s => ({ ...s, isLoading: false }));
      }
    }

    checkStatus();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <DonorStatusContext.Provider value={state}>
      {children}
    </DonorStatusContext.Provider>
  );
}

export function useDonorStatus(): DonorStatusState {
  return useContext(DonorStatusContext);
}
