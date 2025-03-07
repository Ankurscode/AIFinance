import { supabase } from './supabase';

export function useAuth() {
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    signOut,
  };
} 