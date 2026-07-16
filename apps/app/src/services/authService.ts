import type { Session } from '@supabase/supabase-js';
import { environment } from '../config/environment';
import { supabase } from '../lib/supabaseClient';

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function sendEmailLink(email: string, emailRedirectTo = environment.appUrl): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo,
    },
  });

  if (error) {
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, redirectTo = environment.appUrl): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw error;
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
