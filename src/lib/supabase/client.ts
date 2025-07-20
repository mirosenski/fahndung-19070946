import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import { logger } from '@/lib/logger'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: fetch, // Für Service Worker/Caching
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      db: {
        schema: 'public',
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    }
  )
}

// Singleton-Instanz für bessere Performance
let clientInstance: ReturnType<typeof createClient> | null = null;

export function getClient() {
  if (!clientInstance) {
    clientInstance = createClient();
    logger.debug('Supabase client instance created');
  }
  return clientInstance;
} 