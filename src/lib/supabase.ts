import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl!,
  supabaseAnonKey!
);

/** Anon-only client that uses its own storage key so it never carries an auth session. */
export const supabaseNoAuth = createClient(
  supabaseUrl!,
  supabaseAnonKey!,
  { auth: { storageKey: 'sb-whosin-anon' } }
);

export async function checkConnection() {
  try {
    const { error } = await supabase.from('events').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
