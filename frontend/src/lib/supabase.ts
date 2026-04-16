// @ts-expect-error – run `npm install` locally; Vercel installs automatically at build time
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[ZeroTrace] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set. Auth is disabled.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// ─── Auth Helpers ────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function sendOTP(phone: string) {
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
