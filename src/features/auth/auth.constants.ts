/**
 * Google is the only production sign-in method. Fitly asks for the narrow
 * `drive.file` scope plus offline access so the trusted server boundary can
 * write the user's own Fitly folders later (AGENTS.md 12, ADR 0001).
 */
export const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

export const GOOGLE_OAUTH_QUERY_PARAMS = {
  access_type: "offline",
  prompt: "consent",
} as const;

export const AUTH_CALLBACK_PATH = "/auth/callback";

export const POST_SIGN_IN_PATH = "/looks";

export const TERMS_VERSION = "2026-09-06";
export const PRIVACY_VERSION = "2026-09-06";
export const AI_PROCESSING_VERSION = "2026-09-06";

export const PRE_AUTH_COOKIE = "fitly-pre-auth";
export const PRE_AUTH_MAX_AGE_SECONDS = 10 * 60;
