import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnv } from "@/config/env";

export function createBrowserSupabaseClient() {
  const { supabasePublishableKey, supabaseUrl } = getPublicEnv();

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
