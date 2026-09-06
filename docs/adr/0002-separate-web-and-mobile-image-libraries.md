# ADR 0002: Separate web and mobile image libraries

- Status: Accepted
- Date: 2026-09-02

## Context

The existing mobile client queries every owner row in `body_photos`, `garments`, and `tryon_results`. It has no platform filter. Adding web rows to those tables would expose broken entries to the unchanged mobile app because mobile cannot read Google Drive files.

The products still need one Google identity, one profile, one daily allowance, and one future subscription.

## Decision

The existing content tables remain the mobile record family. Web uses separate tables:

- `web_body_templates`
- `web_garments`
- `web_tryon_results`
- `web_generation_inputs`

The two platforms share:

- Supabase Auth identity
- `public.users` profile
- versioned consent records
- append-only generation attempts and daily quota
- future subscription or plan data

The `client_platform` domain value is `mobile | web`. Existing mobile records are backfilled as `mobile`; web records are constrained to `web`. The shared generation-attempt ledger records the originating platform.

Each platform library permits five body templates. The daily generation limit is three across both platforms and resets at 00:00 UTC.

## Alternatives considered

- One set of content tables with client-side filters was rejected because the unchanged mobile client would still query web rows.
- Platform-specific RLS on shared tables was rejected because the same Supabase identity does not provide a trustworthy mobile-versus-web claim.
- Separate Supabase projects were rejected because identity, quota, and future subscription must remain shared.

## Consequences

- Web can use Supabase client-side queries under RLS without exposing its records to existing mobile queries.
- Shared backend functions need a backward-compatible platform branch.
- Web and mobile cannot reuse each other's templates, garments, or generated looks.
- Deleting content on one platform does not delete the other platform's library.
- Cross-platform account deletion must clean both platform record families and their storage systems.
