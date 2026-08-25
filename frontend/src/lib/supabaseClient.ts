import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://xysqwrmsnetuawmrkika.supabase.co').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Fallback to a placeholder string if VITE_SUPABASE_ANON_KEY is unset,
// preventing createClient from throwing a fatal top-level uncaught exception during bundle initialization.
const safeKey = supabaseAnonKey || 'dummy-anon-key-placeholder';

export const isSupabaseConfigured = Boolean(supabaseAnonKey && supabaseAnonKey !== 'dummy-anon-key-placeholder');

if (!isSupabaseConfigured) {
  console.warn(
    '[SupabaseClient] Notice: VITE_SUPABASE_ANON_KEY environment variable is not set. ' +
    'Please add VITE_SUPABASE_ANON_KEY to your Vercel project environment variables and trigger a fresh deployment.'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
