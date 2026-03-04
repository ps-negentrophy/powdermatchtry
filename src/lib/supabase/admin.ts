import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Admin client with service role - bypasses RLS. Use only in server-side API routes.
 * Falls back to anon if service role key is not set.
 */
export function createAdminClient() {
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey);
  }
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(supabaseUrl, anonKey);
}
