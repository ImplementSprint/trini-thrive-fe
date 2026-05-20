import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type AuthError = {
  message: string;
  code?: string;
};

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: { message: error.message, code: error.code },
      };
    }

    return {
      success: true,
      data: data.user,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return {
      success: false,
      error: { message },
    };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: { message: error.message, code: error.code },
      };
    }

    return {
      success: true,
      data: data.user,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return {
      success: false,
      error: { message },
    };
  }
}

export async function signOut() {
  try {
    const { error } = await getSupabase().auth.signOut();

    if (error) {
      return {
        success: false,
        error: { message: error.message, code: error.code },
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return {
      success: false,
      error: { message },
    };
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await getSupabase().auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return data.user;
  } catch {
    return null;
  }
}
