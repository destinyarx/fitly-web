import { cookies } from "next/headers";

import {
  AUTH_CALLBACK_PATH,
  GOOGLE_DRIVE_SCOPE,
  GOOGLE_OAUTH_QUERY_PARAMS,
  POST_SIGN_IN_PATH,
  PRE_AUTH_COOKIE,
  PRE_AUTH_MAX_AGE_SECONDS,
} from "@/features/auth/auth.constants";
import { startGoogleAuthSchema } from "@/features/auth/auth.schema";
import { createPreAuthState } from "@/features/auth/services/pre-auth-state.server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const parsed = startGoogleAuthSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "consent_required" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const callbackUrl = new URL(AUTH_CALLBACK_PATH, origin);
  const next = parsed.data.next || POST_SIGN_IN_PATH;
  const cookieStore = await cookies();
  cookieStore.set(PRE_AUTH_COOKIE, await createPreAuthState(next), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: AUTH_CALLBACK_PATH,
    maxAge: PRE_AUTH_MAX_AGE_SECONDS,
  });

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      scopes: GOOGLE_DRIVE_SCOPE,
      queryParams: { ...GOOGLE_OAUTH_QUERY_PARAMS },
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    cookieStore.delete(PRE_AUTH_COOKIE);
    return Response.json({ error: "oauth_start_failed" }, { status: 502 });
  }

  return Response.json({ url: data.url }, { headers: { "Cache-Control": "no-store" } });
}
