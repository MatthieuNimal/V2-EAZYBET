// Compatibility layer - redirects to new modular clients
export { supabaseBrowser as supabase, getSupabaseBrowserClient as getSupabaseClient } from './supabase/browser';
export * from './supabase/types';
