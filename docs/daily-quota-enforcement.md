# Three daily try-ons

The shared ledger already serialized admission by user, counted reservations and successful generations across mobile and web, and prevented look deletion from refunding quota. The remaining gaps were configurable profile limits above three, stale frontend usage, discarded Edge quota error details, and an ordinary-user-accessible diagnostic provider endpoint.

The review screen now reads usage every 15 seconds, on focus, and before submission. Failed usage validation disables generation. The Next.js POST checks allowance before Drive downloads or staging. After authentication, the Edge Function checks usage before source validation. The database is the final authority: its per-user transaction lock and quota recheck reserve at most three slots, even when multiple requests pass preflight together.

Quota resets at 00:00 UTC. AI failures release their reservations; successful generation with failed Drive delivery remains counted. Delivery retry does not spend another try-on. Lower administrative limits still apply.

The API rejection is HTTP 429 with `error: daily_cap_reached` and `quota: { used, limit, remaining, resetsAt }`. The frontend parses the structured response and shows the daily-limit message. Quota responses are authenticated and `private, no-store`; clients cannot select another user's quota.

## Activation

No migration or function deployment was performed. From the shared backend repository, review pending migrations first, then run:

```powershell
bunx --no-install supabase migration list --linked
bunx --no-install supabase db push --linked --dry-run
bunx --no-install supabase db push --linked
bunx --no-install supabase functions deploy generate-tryon --project-ref oazefwqrrwpyixgkugqh
bunx --no-install supabase functions deploy replicate-test --project-ref oazefwqrrwpyixgkugqh
```

The intended migration is `20261006010000_enforce_three_daily_generations.sql`. Review the dry-run so unrelated pending migrations are not applied unintentionally. Diagnostic provider calls now require service credentials; never send those credentials to a browser or mobile client.

## Verification

Web lint, strict typecheck, build and ten tests passed. Four backend handler regressions passed using the actual handler source with mocked database clients: early quota rejection, missing quota data, atomic-admission rejection after a successful preflight, and diagnostic endpoint denial. The tester's live review screen showed 3/3 used and disabled generation at phone and desktop widths. No AI generation was triggered by these checks.

The rollback-only database regression covers the hard ceiling despite a profile limit of 999, mixed mobile/web ledger usage, fourth-attempt rejection, direct role rejection, immutable accounting after deletion, and failure release. It could not run: the linked Supabase CLI returned HTTP 403 for database access, and the local Docker daemon was unavailable. Real parallel database admissions, two-account quota/cache isolation, UTC reset execution, full mobile generation and staging cleanup after quota rejection remain unverified. The handler race regression is not a concurrent database test.

Run the database regression after access is restored:

```powershell
bun scripts/test-web-generation-admission.ts --linked <body-id> <garment-id>
```

It installs only a temporary admission function and rolls back all writes; it invokes no worker or AI provider.
