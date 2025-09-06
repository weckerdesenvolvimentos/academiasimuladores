import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error('Supabase credentials not found in environment variables');
  }

  return createClient<Database>(url, anon, {
    auth: { persistSession: false },
  });
}
