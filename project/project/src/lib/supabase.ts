import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    storage: window.sessionStorage, // Use sessionStorage instead of localStorage
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Helper function to clear all auth data
export const clearAuthData = () => {
  // Clear all Supabase-related items from sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // Clear specific auth items
  sessionStorage.removeItem('supabase.auth.token');
  sessionStorage.removeItem('supabase.auth.expires_at');
  sessionStorage.removeItem('supabase.auth.refresh_token');
  
  // Clear any localStorage items just in case
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-')) {
      localStorage.removeItem(key);
    }
  });
};

// Add event listener for when the window is about to unload
window.addEventListener('beforeunload', () => {
  clearAuthData();
  supabase.auth.signOut().catch(console.error);
});