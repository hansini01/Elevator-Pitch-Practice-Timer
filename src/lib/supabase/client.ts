import { createBrowserClient } from '@supabase/ssr';
import { createClient as createLegacyClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

export const createClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
};
