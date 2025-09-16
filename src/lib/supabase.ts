import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) as string;
const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY) as string;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing. Set EXPO_PUBLIC_SUPABASE_URL/ANON_KEY or NEXT_PUBLIC_SUPABASE_URL/ANON_KEY or SUPABASE_URL/ANON_KEY.');
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : (undefined as unknown as ReturnType<typeof createClient>);

