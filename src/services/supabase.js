import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// If credentials are empty or contain placeholder values, mark as not configured
export const isSupabaseConfigured = 
  url !== '' && 
  url !== 'https://example.supabase.co' && 
  key !== '' && 
  key !== 'fake-key' &&
  !key.startsWith('sb_publishable'); // Stripe/mock keys are not valid Supabase keys

// Live state tracking to fall back dynamically if connection times out or fails
export const isSupabaseOnline = true;
export function setSupabaseOffline() {
  console.warn("Supabase connection is slow or offline, but we remain in online mode to preserve data sync.");
}

// Fallback url/key for createClient initialization to prevent crashes
const supabaseUrl = isSupabaseConfigured ? url : 'https://uvzbwxmwytdypoqbrddt.supabase.co'; 
const supabaseKey = isSupabaseConfigured ? key : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid';

export const supabase = createClient(supabaseUrl, supabaseKey);

