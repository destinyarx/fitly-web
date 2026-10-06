# Fitly web

The Next.js web client for Fitly, an AI-assisted virtual clothing try-on product.

## Stack

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- Supabase Auth, Postgres, Storage, and Edge Functions
- TanStack Query and Zustand
- Zod and React Hook Form

## Local setup

1. Install dependencies with `bun install`.
2. Copy `.env.example` to `.env.local` and add all six values. `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` must match the web OAuth client configured for the Supabase Google provider. Generate `AUTH_STATE_SECRET` as at least 32 random characters.
3. Start the app with `bun dev`.
4. Open `http://localhost:3000`.

The app needs the shared backend migration and Edge Function changes under
`C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\Fitly\supabase-side-projects`.
The linked project's base web migration and named functions were confirmed
deployed on 2026-10-06. The follow-up admission fix is now applied, and generation
and local recovery delivery succeeded for the tester. The Edge runtime still needs
Google OAuth credentials for automatic delivery; see
[the Drive delivery diagnosis](docs/drive-delivery-diagnosis.md). See
[the generation diagnosis](docs/tryon-generation-diagnosis.md) for
the root cause, regression runner, and migration commands. Deployment presence
does not establish complete generation or Drive-delivery verification.

For local Google sign-in, add `http://localhost:3000/auth/callback` to the
Supabase Auth redirect allow list. In Google Cloud, enable the Drive API and add
`https://<project-ref>.supabase.co/auth/v1/callback` to the web OAuth client's
authorized redirect URIs.

Keep the two callback settings separate. Google Cloud's authorized redirect URI
is the Supabase `/auth/v1/callback` URL. Supabase Auth's Site URL is the app's
origin, `http://localhost:3000` during local development, and its redirect allow
list includes `http://localhost:3000/auth/callback`. Preserve the mobile redirect
entries in this shared project. Never set the Supabase Site URL to its own
callback: an OAuth error then redirects back to the callback repeatedly and
reports `OAuth state parameter missing`.

If the Google OAuth app is in Testing, add the tester's Google account to its
test users in Google Auth Platform. A Google `access_denied` page can mean that
the account was not admitted as a tester, as well as denied consent.

Run callback regression tests against a running local server with
`bun test tests/auth-callback.test.ts`. Set `FITLY_TEST_ORIGIN` for another port.

## Commands

```bash
bun dev
bun run lint
bun run typecheck
bun run build
```

## Project guidance

Read `AGENTS.md` before changing code. Product and domain context lives in `CONTEXT.md`; visual and interaction rules live in `DESIGN.md`.

The mobile project is a sibling reference for Fitly behavior and language. Web code must use the Next.js architecture documented in this repository.
