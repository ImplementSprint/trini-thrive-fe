import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const all = cookieStore.getAll();
          console.log('[supabase.getAll] Returning', all.length, 'cookies:', all.map(c => c.name).join(','));
          return all;
        },
        setAll(cookiesToSet) {
          console.log('[supabase.setAll] Setting', cookiesToSet.length, 'cookies:', cookiesToSet.map(c => c.name).join(','));
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              console.log('[supabase.setAll] Setting', name);
              cookieStore.set(name, value, options);
            });
            console.log('[supabase.setAll] Cookies set successfully');
          } catch (e) {
            console.error('[supabase.setAll] Error:', e);
          }
        },
      },
    },
  );
}
