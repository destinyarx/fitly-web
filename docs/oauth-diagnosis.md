# Google OAuth callback diagnosis

Verified on 2026-10-06 against the linked `oazefwqrrwpyixgkugqh` project.

## Confirmed findings

Supabase Auth's remote `site_url` is
`https://oazefwqrrwpyixgkugqh.supabase.co/auth/v1/callback`.
This endpoint processes Google's response and requires OAuth state. It is not an
application landing page. A request without state receives HTTP 303 to the same
endpoint with `bad_oauth_callback` and `OAuth state parameter missing`. Following
that redirect produces the identical redirect again. This reproduces the reported
error URL and explains the browser's failure to finish loading.

The current remote allow list includes `http://localhost:3000/auth/callback` and
the mobile redirect entries. Fitly's local `/api/auth/google` returns an
authorization URL with that callback, an S256 PKCE challenge, and code-verifier
cookies. Supabase redirects it to Google with a nonempty OAuth state and the
correct Supabase provider callback. A simulated provider denial with valid state
returns to the local app callback. The current start flow does not omit state.

The browser's earlier Google error page reported that the account lacked access
to the OAuth application while it was in testing. Confirm that the testing
account is included in Google Auth Platform's test users. This earlier denial
does not prove what triggered the later callback without state. The first
missing-state request was not captured, so its cause remains unverified.

Fitly previously mapped provider errors to `missing_code`, hiding the distinction
between denied authorization and a missing code. The callback now maps
`access_denied` to a fixed access-denied alert and other provider errors to a fixed
OAuth-failure alert. It never renders provider error descriptions.

## Required remote correction

In Supabase Dashboard, Authentication > URL Configuration, set Site URL to
`http://localhost:3000` for the current local development setup. Use the real
application origin when production is available. Preserve existing redirect URLs,
including the mobile entries and `http://localhost:3000/auth/callback`.

Keep Google Cloud's authorized redirect URI as
`https://oazefwqrrwpyixgkugqh.supabase.co/auth/v1/callback`.
These settings serve different parts of the OAuth flow.

Changing remote configuration requires explicit user authorization under
`AGENTS.md` section 17. No remote settings, migrations, or Edge Functions were
changed during this diagnosis.

## Verification

- The live Supabase missing-state callback redirect loop reproduced twice.
- The local callback regression test failed on three provider-error cases before
  the change and passed all five cases after it. Run
  `bun test tests/auth-callback.test.ts` against a running local server.
- `bun run lint`, `bun run typecheck`, and `bun run build` passed.
- The fixed alert was checked at 1440px and 390px viewport widths.

A full Google sign-in, session exchange, Drive permission and Vault storage still
need to be tested after the remote correction. Two-account ownership, Drive
revocation and deletion, quota concurrency, staging cleanup, and mobile generation
were outside the exercised callback path and remain unverified in this diagnosis.
