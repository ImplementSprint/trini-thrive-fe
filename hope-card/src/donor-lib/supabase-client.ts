import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AuthError = {
  message: string;
  code?: string;
};

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
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
    const { data, error } = await supabase.auth.signInWithPassword({
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
    const { error } = await supabase.auth.signOut();

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
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return data.user;
  } catch (error) {
    return null;
  }
}
