import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnv = (key: string, nextKey?: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch {
    // fallback
  }
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (nextKey && process.env[nextKey]) return process.env[nextKey] as string;
      if (process.env[key]) return process.env[key] as string;
    }
  } catch {
    // fallback
  }
  return '';
};

const viteUrl = getEnv('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL') || 'https://xdggjrorpafpwsnixlww.supabase.co';
const viteAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || getEnv('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY') || 'sb_publishable_nApChRkKMTd2y2DMV-0fng_n0PrjENb';

export let browserSupabase: SupabaseClient | null = null;

if (viteUrl && viteAnonKey) {
  try {
    browserSupabase = createClient(viteUrl, viteAnonKey);
  } catch (e) {
    console.warn('[Supabase Client] Failed to initialize browser client:', e);
  }
}

export interface SupabaseConfigStatus {
  configured: boolean;
  url: string | null;
  hasAnonKey: boolean;
  hasServiceKey: boolean;
}

export interface SupabaseTestResult {
  success: boolean;
  message: string;
  details?: {
    tablesReady?: boolean;
    [key: string]: any;
  };
}

export async function getSupabaseSettings(): Promise<SupabaseConfigStatus> {
  const res = await fetch('/api/settings/supabase');
  if (!res.ok) throw new Error('Failed to fetch Supabase status');
  return await res.json();
}

export async function testSupabaseConnection(): Promise<SupabaseTestResult> {
  const res = await fetch('/api/settings/supabase/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return await res.json();
}

export async function syncLocalDataToSupabase(): Promise<{ success: boolean; message: string; syncedRooms?: number; syncedReservations?: number }> {
  const res = await fetch('/api/settings/supabase/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return await res.json();
}

export async function getSupabaseSchemaSql(): Promise<string> {
  const res = await fetch('/api/settings/supabase/schema');
  const data = await res.json();
  return data.sql;
}
