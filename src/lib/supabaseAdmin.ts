
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://telslaeykvfpmcrrnprb.supabase.co";

// Esta será configurada con el service role key
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

export const initializeSupabaseAdmin = (serviceRoleKey: string) => {
  supabaseAdmin = createClient(SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  return supabaseAdmin;
};

export const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase Admin client not initialized. Call initializeSupabaseAdmin first.');
  }
  return supabaseAdmin;
};
