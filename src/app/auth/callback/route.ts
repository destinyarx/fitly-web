import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getServerEnv } from "@/config/env";
import {
  POST_SIGN_IN_PATH,
  PRE_AUTH_COOKIE,
} from "@/features/auth";
import { readPreAuthState } from "@/features/auth/services/pre-auth-state.server";
import {
  ensureDriveFolders,
  getGoogleIdentity,
  storeDriveConnection,
} from "@/features/drive/services/google-drive.server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Google redirects here with an authorization code. Everything in the query
 * string is untrusted: `next` is only ever used as a same-origin path.
 */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const cookieStore = await cookies();
  const preAuthState = await readPreAuthState(cookieStore.get(PRE_AUTH_COOKIE)?.value);
  cookieStore.delete(PRE_AUTH_COOKIE);
  const next = preAuthState?.next ?? POST_SIGN_IN_PATH;

  if (!code || !preAuthState) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/sign-in?error=exchange_failed`);
  }

  try {
    const providerAccessToken = data.session.provider_token;
    const providerRefreshToken = data.session.provider_refresh_token;
    if (!providerAccessToken || !providerRefreshToken) {
      throw new Error("missing_provider_token");
    }

    const identity = await getGoogleIdentity(providerAccessToken);
    const googleIdentity = data.user.identities?.find(
      (candidate) => candidate.provider === "google",
    );
    const identityData = googleIdentity?.identity_data;
    const expectedSubject =
      typeof identityData?.sub === "string" ? identityData.sub : googleIdentity?.id;
    const expectedEmail = data.user.email?.toLowerCase();
    if (
      !expectedSubject ||
      expectedSubject !== identity.subject ||
      !expectedEmail ||
      expectedEmail !== identity.email
    ) {
      throw new Error("drive_account_mismatch");
    }

    const folders = await ensureDriveFolders(
      providerAccessToken,
      getServerEnv().fitlyEnvironment,
    );
    await storeDriveConnection({
      userId: data.user.id,
      identity,
      refreshToken: providerRefreshToken,
      folders,
    });

    const admin = createAdminSupabaseClient();
    const { error: consentError } = await admin.rpc("record_fitly_consent", {
      p_user_id: data.user.id,
      p_terms_version: preAuthState.termsVersion,
      p_privacy_version: preAuthState.privacyVersion,
      p_ai_processing_version: preAuthState.aiProcessingVersion,
    });
    if (consentError) throw new Error("consent_store_failed");
  } catch (callbackError) {
    await supabase.auth.signOut();
    const errorCode =
      callbackError instanceof Error && callbackError.message === "drive_account_mismatch"
        ? "drive_account_mismatch"
        : "drive_setup_failed";
    return NextResponse.redirect(`${origin}/sign-in?error=${errorCode}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
