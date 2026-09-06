import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("authentication_required");
  }

  return { supabase, user: data.user };
}

export function authenticationErrorResponse(error: unknown) {
  if (error instanceof Error && error.message === "authentication_required") {
    return Response.json({ error: "authentication_required" }, { status: 401 });
  }

  return Response.json({ error: "request_failed" }, { status: 500 });
}
