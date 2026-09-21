import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'bidsmith_supabase_url';
const STORAGE_KEY_ANON = 'bidsmith_supabase_anon';

export function getStoredSupabaseCredentials() {
  const url = localStorage.getItem(STORAGE_KEY_URL) || (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const key = localStorage.getItem(STORAGE_KEY_ANON) || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  return { url, key };
}

export function saveStoredSupabaseCredentials(url: string, key: string) {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (key) localStorage.setItem(STORAGE_KEY_ANON, key.trim());
  else localStorage.removeItem(STORAGE_KEY_ANON);
}

export function createBrowserSupabaseClient(): SupabaseClient | null {
  const { url, key } = getStoredSupabaseCredentials();
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch (err) {
    console.error('Failed to create browser Supabase client:', err);
    return null;
  }
}
