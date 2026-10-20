import { createClient } from '@supabase/supabase-js';

// Project: jsuhyfrtklwcmmrbtrpo
const SUPABASE_URL = 'https://jsuhyfrtklwcmmrbtrpo.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fire-and-forget insert. Logs errors to console; never throws so UI stays unaffected.
 */
export async function dbInsert(table, row) {
  const { error } = await supabase.from(table).insert(row);
  if (error) console.error(`[supabase] ${table} insert failed:`, error.message);
}
