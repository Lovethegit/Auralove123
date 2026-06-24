import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase env vars missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Anon client — used by the public site for reads (RLS allows anon SELECT on published rows).
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Hardcoded admin gate (no Supabase Auth). Admin mutations (create/update/delete) cannot go
// through the anon client because RLS restricts writes to the authenticated role. Instead,
// all admin CRUD is proxied through the `admin-crud` edge function which holds the service
// role key and bypasses RLS. The admin function re-checks the hardcoded credentials on every
// call so the service role is never exposed to the browser.
export const ADMIN_USER = 'love@aura';
export const ADMIN_PASS = 'loveaura@2019';
export const STORAGE_BUCKET = 'media';
export const ATTRIBUTION = 'Published by Love Parekh';
