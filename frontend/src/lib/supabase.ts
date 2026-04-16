import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[ZeroTrace] Supabase env vars not set. Auth will be disabled.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// ─── Auth Helpers ────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
}

export async function sendOTP(phone: string) {
  // Normalize phone: ensure leading +
  const normalized = phone.startsWith('+') ? phone : `+${phone}`;
  const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
  if (error) throw error;
}

export async function verifyOTP(phone: string, token: string) {
  const normalized = phone.startsWith('+') ? phone : `+${phone}`;
  const { data, error } = await supabase.auth.verifyOtp({
    phone: normalized,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
