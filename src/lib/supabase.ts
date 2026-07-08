import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl!,
  supabaseAnonKey!
);

/**
 * Client that picks up the auth session from localStorage when logged in,
 * or runs as anon when not. Same underlying client as `supabase`.
 */
export const supabaseNoAuth = createClient(
  supabaseUrl!,
  supabaseAnonKey!
);

export async function checkConnection() {
  try {
    const { error } = await supabase.from('events').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
