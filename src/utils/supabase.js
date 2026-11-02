import { createClient } from '@supabase/supabase-js';

// Project: jsuhyfrtklwcmmrbtrpo
const SUPABASE_URL = 'https://jsuhyfrtklwcmmrbtrpo.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const QUEUE_KEY = 'hoc_pending_db_queue';
let isFlushing = false;

async function insertWithRetry(table, row, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { error } = await supabase.from(table).insert(row);
      if (!error) return true;
      if (attempt === retries) {
        console.error(`[supabase] ${table} insert failed:`, error.message);
      }
    } catch (err) {
      if (attempt === retries) {
        console.error(`[supabase] ${table} network error:`, err);
      }
    }
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  return false;
}

export async function flushPendingQueue() {
  if (isFlushing) return;
  isFlushing = true;
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return;
    const queue = JSON.parse(raw);
    if (!Array.isArray(queue) || queue.length === 0) return;

    const remaining = [];
    for (const item of queue) {
      const ok = await insertWithRetry(item.table, item.row, 1);
      if (!ok) remaining.push(item);
    }
    if (remaining.length > 0) {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    } else {
      localStorage.removeItem(QUEUE_KEY);
    }
  } catch {} finally {
    isFlushing = false;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushPendingQueue();
  });
}

/**
 * Resilient insert with automatic retry + offline localStorage queue.
 */
export async function dbInsert(table, row) {
  const ok = await insertWithRetry(table, row, 2);
  if (!ok) {
    try {
      const existing = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      existing.push({ table, row });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(existing));
    } catch {}
    return;
  }
  flushPendingQueue();
}
