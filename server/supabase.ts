import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache active client in memory
let runtimeSupabaseUrl = process.env.SUPABASE_URL || '';
let runtimeSupabaseKey = process.env.SUPABASE_ANON_KEY || '';
let activeClient: SupabaseClient | null = null;

export function getSupabaseConfig() {
  const url = runtimeSupabaseUrl || process.env.SUPABASE_URL || '';
  const key = runtimeSupabaseKey || process.env.SUPABASE_ANON_KEY || '';
  return {
    isConfigured: Boolean(url && key),
    supabaseUrl: url ? url.substring(0, 16) + '...' : '',
    hasKey: Boolean(key),
    rawUrl: url,
  };
}

export function setRuntimeSupabaseConfig(url: string, key: string) {
  runtimeSupabaseUrl = url.trim();
  runtimeSupabaseKey = key.trim();
  if (runtimeSupabaseUrl && runtimeSupabaseKey) {
    activeClient = createClient(runtimeSupabaseUrl, runtimeSupabaseKey);
  } else {
    activeClient = null;
  }
}

export function getActiveSupabaseClient(): SupabaseClient | null {
  if (activeClient) return activeClient;
  const url = runtimeSupabaseUrl || process.env.SUPABASE_URL;
  const key = runtimeSupabaseKey || process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    activeClient = createClient(url, key);
    return activeClient;
  }
  return null;
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const cleanUrl = url.trim().replace(/\/$/, '');
    const cleanKey = key.trim();

    if (!cleanUrl.startsWith('https://') && !cleanUrl.startsWith('http://')) {
      return { success: false, message: 'Invalid Supabase URL: Must begin with https:// (e.g. https://xyz.supabase.co)' };
    }

    if (!cleanKey || cleanKey.length < 20) {
      return { success: false, message: 'Invalid Supabase Key: Key seems too short or empty.' };
    }

    // Ping Supabase Auth Health endpoint
    const healthUrl = `${cleanUrl}/auth/v1/health`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        apikey: cleanKey,
        Authorization: `Bearer ${cleanKey}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      // Initialize active client
      setRuntimeSupabaseConfig(cleanUrl, cleanKey);
      return {
        success: true,
        message: 'Successfully connected to Supabase project! Database API is online and responding.',
      };
    } else {
      // Also try pinging the REST endpoint directly
      const restResp = await fetch(`${cleanUrl}/rest/v1/`, {
        headers: { apikey: cleanKey },
      });

      if (restResp.ok || restResp.status === 200 || restResp.status === 404) {
        setRuntimeSupabaseConfig(cleanUrl, cleanKey);
        return {
          success: true,
          message: 'Connected to Supabase REST gateway successfully.',
        };
      }

      return {
        success: false,
        message: `Supabase responded with HTTP status ${response.status}: ${response.statusText}. Please verify that the Project URL and Anon Key are correct.`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err.message || 'Network error connecting to Supabase endpoint.'}`,
    };
  }
}
