import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration interface
export interface SupabaseEnvConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

// Retrieve client-side environment variables safely
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if valid credentials are provided (ignoring placeholder values)
const isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('sua-url-do-supabase') &&
  !supabaseAnonKey.includes('sua-chave-anonima')
);

export const getSupabaseConfig = (): SupabaseEnvConfig => ({
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  isConfigured
});

export const isSupabaseReady = (): boolean => isConfigured;

// Initialize Supabase client
// When unconfigured, createClient is called with fallback dummy values to prevent runtime import exceptions,
// while alerting the developer in console without blocking the UI.
export const supabase: SupabaseClient = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'sf_supabase_auth_token'
    }
  }
);

if (!isConfigured && import.meta.env.DEV) {
  console.info(
    '[STRAVA FIGHT] Supabase operando em modo híbrido/local fallback. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env ou no painel da Vercel para persistência direta na nuvem.'
  );
}
