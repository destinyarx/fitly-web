import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/config/env";

export function createAdminSupabaseClient() {
  const { supabaseSecretKey, supabaseUrl } = getServerEnv();

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
