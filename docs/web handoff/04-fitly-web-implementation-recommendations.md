# Fitly web implementation recommendations

These recommendations apply the
[settled build contract](./06-settled-web-build-contract.md) to the installed
Next.js stack. They do not replace the approved UI mockup or `DESIGN.md`.

## Current foundation

| Area | Installed choice |
|---|---|
| Framework | Next.js 16.3.4 App Router and React 19.2.8 |
| Language and CSS | Strict TypeScript and Tailwind CSS 4 |
| Supabase | Supabase JS 2.112.4 and `@supabase/ssr` 0.12.5 |
| Client server-state | TanStack Query 5.102.8 |
| Workflow state | Zustand 5.0.15 |
| Forms | React Hook Form 7.87.0 and the Zod resolver |
| Validation | Zod 4.5.4 |

The repository also has browser and server Supabase factories, an environment
schema, Query provider, domain enums, compatibility logic, and project docs.
Product features are not built.

shadcn/ui is not installed. Do not treat it as approved without the user's
permission.

## Route and feature shape

~~~text
src/
  app/
    (public)/
      page.tsx
      sign-in/page.tsx
      sign-up/page.tsx
    (app)/
      layout.tsx
      looks/page.tsx
      looks/[lookId]/page.tsx
      closet/page.tsx
      try-on/
        garment/page.tsx
        body/page.tsx
        review/page.tsx
        generating/page.tsx
      me/page.tsx
      settings/page.tsx
    auth/callback/route.ts
    api/
      drive/
      media/
      try-on/
  proxy.ts
  features/
    auth/
    drive/
    closet/
    profile/
    try-on/
    looks/
  lib/supabase/
  providers/
  shared/
  config/
~~~

Route files load, redirect, and compose. Feature modules own business behavior.
Keep Drive as a feature because it has its own authorization, failure, and
deletion lifecycle.

## Server and client split

Use Server Components by default. Add client boundaries only for browser
camera APIs, event handlers, React Hook Form, TanStack Query, or Zustand.

Use the browser Supabase SDK through feature services for:

- web template metadata;
- web garment metadata;
- web Looks and favorites;
- profile and quota display;
- result polling or Realtime observation.

Use trusted Node.js Route Handlers for:

- Google OAuth callback and credential handoff;
- source-image decode, normalization, and Drive upload;
- authenticated private Drive image responses;
- Drive-to-Supabase generation staging;
- destructive multi-system operations when a single HTTP contract is clearer.

Use `proxy.ts` for Supabase cookie refresh and optimistic route redirects.
Verify the user again at every data and mutation boundary.

## Feature responsibilities

### Auth

- Start Google OAuth with `drive.file`, offline access, and explicit consent.
- Carry only a validated relative return path.
- Persist accepted policy versions after the callback identifies the user.
- Verify that the Drive and Supabase Google identities match.
- Report Fitly session and Drive connection separately.
- Clear Query cache, Zustand, and user-namespaced session storage on account
  change or sign-out.

### Drive

- Own connection state, token refresh, folder IDs, file CRUD, account matching,
  and provider error mapping.
- Keep Vault and provider response details out of other features.
- Return stable domain errors such as
  `drive_reauthorization_required`, `drive_account_mismatch`, and
  `source_missing`.
- Use authenticated media responses for private previews.

### Closet

- Own `web_garments`, category filters, camera/file form, and deletion.
- Require category with no default selection.
- Store the normalized Drive file before advancing the flow.
- Display URL extraction as `Coming soon` with no fake route.

### Profile

- Own profile, quota display, consent state, and `web_body_templates`.
- Enforce five web templates in the database.
- Keep the first-template primary behavior unless the mockup contains an
  explicit primary-selection control.
- Delete tracked Drive files before their metadata rows.

### Try-on

- Own the ID-only Zustand draft.
- Re-check half-body compatibility at review and admission.
- Stage selected Drive files under one immutable attempt.
- Call only `generate-tryon`, never `run-generation`.
- Observe generation and Drive delivery as separate states.
- Map delivery retry to existing recovery bytes, never to a new Replicate call.

### Looks

- Query only `web_tryon_results`.
- List every delivered result automatically.
- Treat favorite as a filter, not as file retention.
- Render deleted-source metadata from result snapshots.
- Share the file through Web Share or Download.
- Delete the Drive file without removing the generation ledger event.

## Forms and Zod

Use React Hook Form for interactive forms and validate again at the trusted
boundary.

Suggested schemas:

~~~text
authConsentSchema
  acceptedTerms: literal true
  acceptedPrivacy: literal true
  acceptedAiProcessing: literal true
  termsVersion: non-empty string
  privacyVersion: non-empty string
  aiProcessingVersion: non-empty string

garmentSchema
  file: File with browser feedback
  category: garment enum
  name: trimmed string with fallback
  brand: trimmed optional string
  price: trimmed optional display string

bodyTemplateSchema
  file: File with browser feedback
  pose: body-pose enum
  name: trimmed non-empty string

webGenerationSchema
  bodyTemplateId: UUID
  garmentIds: tuple containing one UUID
~~~

Do not trust browser file metadata. Decode, limit dimensions, normalize
orientation, remove EXIF, re-encode, and enforce seven MiB in the Node.js
handler.

## Supabase typing and services

Generate `Database` types from the real shared backend after the migrations
exist. Type browser and server clients.

Keep generated row types inside data services. Map snake-case rows to
camel-case domain objects. Validate Edge Function, Vault RPC, and Google API
responses with Zod before use.

Use RLS on every client-readable web table. The browser must not select Vault
references, token material, service credentials, other users' rows, raw
staging records, or recovery object paths that it does not need.

## TanStack Query

Use user-scoped key factories:

~~~text
webBodyTemplatesKeys
webGarmentsKeys
webLooksKeys
generationQuotaKeys
driveConnectionKeys
consentKeys
~~~

Refetch quota after admission and AI failure. Do not refund on Drive delivery
failure or look deletion.

Poll active results every two seconds and stop normal polling after the local
deadline. A timed-out browser does not cancel the worker. Slow or pause polling
in a hidden document and refetch on focus.

Do not automatically retry authorization, consent, cap, compatibility,
missing-file, or expired-recovery errors.

## Zustand

Store only:

~~~text
garmentId
bodyTemplateId
resultId
entryPoint
~~~

Never store full rows, Files, image blobs, sessions, or tokens. If reload
recovery is needed, persist a validated and versioned ID-only draft in
user-namespaced `sessionStorage`.

## Private image responses

Drive images do not have a permanent render URL. Use owner-authenticated media
routes with explicit private caching and content-type headers.

Do not put access tokens in URLs or props. Do not allow a shared server cache to
reuse user A's image response for user B. Use fixed image container dimensions
to prevent layout shift.

## Error model

Map external errors to stable codes in one service:

~~~text
unauthorized
consent_required
drive_reauthorization_required
drive_account_mismatch
source_missing
invalid_image
image_too_large
template_limit_reached
incompatible_template
daily_cap_reached
could_not_stage
could_not_queue
generation_failed
delivery_failed
recovery_expired
~~~

Components render domain errors. They do not parse Google, Supabase, or
Replicate error text.

## Implementation order

1. Add the accepted Supabase migrations and tests.
2. Add Vault credential functions and Drive connection state.
3. Route mobile admission through the atomic shared ledger without changing its
   request.
4. Build Google OAuth callback, consent persistence, and Proxy.
5. Build Drive folders, authenticated media, and normalized source upload.
6. Build web body-template and garment CRUD.
7. Build the garment-first draft and review flow.
8. Build result-specific staging and web admission.
9. Add direct Drive result delivery and seven-day recovery.
10. Build result observation, Looks, favorites, sharing, and deletion.
11. Extend account deletion.
12. Run mobile contract regression, two-user ownership, Drive, concurrency,
    recovery, and responsive browser tests.

## Completion checks

- `bun run lint`
- `bun run typecheck`
- relevant unit and integration tests
- `bun run build` for routing, runtime, configuration, or server/client changes
- narrow and desktop browser checks for UI work
- secret scan for Google tokens, Supabase secret keys, and Replicate keys
- two-account RLS and cache-isolation checks
- existing mobile request regression
- parallel shared-quota admission
- source staging and recovery cleanup

Do not claim a remote migration or function deployment passed unless the user
ran it and supplied the result.
