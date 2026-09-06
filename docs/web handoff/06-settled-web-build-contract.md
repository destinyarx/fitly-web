# Settled web build contract

This document is the implementation authority for the Fitly web handoff. It
records the decisions accepted during the grilling session on 2026-09-02.
Where an earlier handoff recommendation differs, this document wins.

## Scope

Build the web product in:

`C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\Fitly\fitly-web`

Prepare shared migrations and Edge Function changes in:

`C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\Fitly\supabase-side-projects`

Do not change the mobile application as part of the web implementation. Do not
apply migrations or deploy functions without the user's explicit instruction.

## Settled product rules

- Production authentication is Google OAuth only.
- Request Google Drive access during sign-in.
- The Drive identity must be the same Google identity used for Fitly login.
- All durable web body-template, garment, and generated-look files live in the
  user's visible Google Drive.
- Mobile keeps its current storage behavior.
- Web and mobile do not display or reuse one another's image libraries or
  generated looks.
- Account identity, profile, consent, daily quota, and future subscription are
  shared.
- Daily quota is three generation attempts across both platforms, resetting at
  00:00 UTC.
- Each platform may have five body templates in its separate library.
- The first web release generates one garment at a time.
- Completed web generations appear in Looks automatically. Favorite is a
  separate toggle.
- Retailer URL extraction is not implemented in the first release. Display it
  as `Coming soon`.
- Web sharing sends the image file through the Web Share API when supported and
  falls back to Download. It never creates a public Drive permission.

## Storage ownership

| Data | Durable owner | Temporary location |
|---|---|---|
| Web body-template image | User's Google Drive | Private Supabase generation staging |
| Web garment image | User's Google Drive | Private Supabase generation staging |
| Web generated look | User's Google Drive | Private Supabase recovery storage only if Drive delivery fails |
| Mobile source images | Mobile device | Existing private Supabase staging |
| Mobile generated look | Existing mobile Supabase result storage | None beyond current behavior |
| Identity and profile | Supabase | None |
| Metadata and status | Supabase Postgres | None |
| Google refresh token | Supabase Vault | Provider access token in trusted memory |

Supabase Auth is not a Google Drive token store. Treat `Drive connection` and
`Fitly session` as separate states.

## Google Drive layout

Fitly uses `drive.file` and manages only files it creates or the user
explicitly grants to it.

~~~text
Fitly/
  Body Templates/
  Garments/
  Generated Looks/
~~~

Persist every folder ID. Names are presentation only because the user may
rename a folder. If a stored folder ID no longer exists, recreate that folder
under the stored root when possible. Do not search by name and choose an
arbitrary duplicate.

Use Drive `appProperties` on created files for Fitly's entity ID, entity type,
and environment. Do not store personal attributes in file names or
`appProperties`.

## Authentication and Drive connection

### Sign-in

Start Supabase PKCE Google OAuth with:

- identity scopes required by Supabase;
- `https://www.googleapis.com/auth/drive.file`;
- `access_type=offline`;
- `prompt=consent`.

The auth form requires acceptance of the current Terms, Privacy Policy, and
AI-processing consent. Keep the accepted versions in short-lived signed
pre-auth state. After the callback identifies the user, write an append-only
consent record with the user ID, document versions, and timestamp.

### Callback

The callback must:

1. Validate the OAuth state and relative return path.
2. Exchange the PKCE code for the Supabase session.
3. Capture the Google provider access and refresh tokens while available.
4. Verify the Google provider subject and Drive account match the Supabase
   Google identity.
5. send the refresh token to a service-only credential operation;
6. create or replace the user's Vault secret;
7. verify or create the three Drive folders;
8. store connection state and folder IDs;
9. continue to the validated return path.

Never store a provider refresh token in a browser-readable cookie, local
storage, session storage, Zustand, TanStack Query, rendered props, logs, or a
client-readable row.

### Connection state

Use:

~~~text
connected
reauthorization_required
revoked
~~~

A valid Supabase session does not imply `connected`. If Drive access is
revoked, keep the account signed in, block image-dependent operations, and show
Reconnect Google Drive.

Reconnection must use the same Google account, replace the old Vault secret,
preserve folder IDs that still work, recreate missing folders, and resume the
interrupted action only when its IDs and intent still validate.

## Platform-separated data

The existing mobile tables remain the mobile record family:

- `body_photos`
- `garments`
- `tryon_results`

Do not write web records into them. The unchanged mobile queries do not filter
by platform and would display broken web records.

Add:

- `web_body_templates`
- `web_garments`
- `web_tryon_results`
- `web_generation_inputs`
- `google_drive_connections`
- `user_consents`
- `generation_attempts`

Use a shared `client_platform` enum:

~~~text
mobile | web
~~~

Backfill existing mobile record families as `mobile`. Constrain web record
families to `web`. Record the value on every shared generation attempt and in
the function handoff.

### Web body templates

Minimum fields:

| Field | Purpose |
|---|---|
| `id`, `user_id` | Entity identity and owner |
| `client_platform` | Constrained to `web` |
| `name`, `pose` | Domain metadata |
| `drive_file_id` | Private source file |
| `mime_type`, `byte_size` | Verified normalized file facts |
| `availability_status` | `available \| missing` |
| `is_primary` | At most one web primary template |
| `created_at`, `updated_at` | Audit and ordering |

Enforce a maximum of five owned web templates at a trusted database boundary.
Do not rely on a disabled Add button.

### Web garments

Minimum fields:

| Field | Purpose |
|---|---|
| `id`, `user_id` | Entity identity and owner |
| `client_platform` | Constrained to `web` |
| `name`, `brand`, `price` | Display metadata |
| `category`, `source` | Compatibility and acquisition metadata |
| `product_url` | Reserved for future URL extraction |
| `drive_file_id` | Private source file |
| `mime_type`, `byte_size` | Verified normalized file facts |
| `availability_status` | `available \| missing` |
| `created_at`, `updated_at` | Audit and ordering |

The first release accepts `camera` and `upload`. It keeps `url` in the
domain enum but never writes it from a fake import flow.

### Web try-on results

Minimum fields:

| Field | Purpose |
|---|---|
| `id`, `user_id` | Result identity and owner |
| `client_platform` | Constrained to `web` |
| `body_template_id`, `garment_ids` | Source references |
| `generation_status` | `queued \| generating \| completed \| failed` |
| `delivery_status` | `pending \| delivering \| delivered \| failed` |
| `drive_file_id` | Durable generated look after delivery |
| `recovery_output_path` | Temporary private fallback after delivery failure |
| `recovery_expires_at` | No later than seven days after failed delivery |
| `body_template_snapshot` | Immutable name and pose needed after deletion |
| `garment_snapshots` | Immutable name, brand, and category |
| `verdict` | Honest display sentence |
| `is_favorite` | User-controlled favorite state |
| `failure_code`, `failure_reason` | Stable behavior and safe copy |
| `created_at`, `updated_at` | Ordering and observation |

A completed look appears in Looks when generation is completed and delivery is
delivered. It does not require an extra Save action.

### Web generation inputs

Each row belongs to one `staging_attempt_id`, one user, and one immutable
staging object. Record input kind, selected entity ID, bucket, object path,
verified MIME type, byte size, creation time, expiry, and optional bound result
ID.

Never reuse a source row's single staging pointer for web. Paths include the
user ID and staging attempt ID:

~~~text
{user_id}/web/{staging_attempt_id}/body.jpg
{user_id}/web/{staging_attempt_id}/garments/{garment_id}.jpg
~~~

### Drive connections

The client may query a safe connection status but must not select the Vault
secret ID or token material. Keep provider subject, Drive account identifier,
folder IDs, status, and timestamps behind service-only writes.

### Consent

Consent records are append-only. Store the exact Terms, Privacy, and
AI-processing versions accepted and the acceptance timestamp. When a current
version is missing, block uploads and generation but keep settings and account
deletion available.

## Shared atomic quota

Use append-only `generation_attempts` instead of counting deletable result
rows.

Each attempt records:

- user ID;
- `client_platform`;
- platform result ID;
- `reserved | consumed | released` state;
- creation time;
- release time and stable reason when released.

Admission must run in one database transaction. Lock the user's quota scope,
count reserved and consumed attempts since 00:00 UTC, enforce
`users.daily_limit`, insert the reservation, and create or bind the result.

AI or provider failure releases the reservation. Successful model output
consumes it. Drive delivery failure does not release it. Deleting a look never
deletes its generation attempt.

Update the profile default and existing profile values to five body templates.
Enforce five separately against mobile and web template tables.

## Source-image write boundary

Use a trusted Next.js Node.js Route Handler for web source creation.

1. Verify the Supabase cookie session.
2. Verify current consent and a connected, matching Drive account.
3. Validate RHF input again with Zod.
4. Decode JPEG, PNG, or WebP rather than trusting MIME or extension.
5. enforce pixel limits and normalize orientation;
6. strip EXIF and location metadata;
7. re-encode within the worker's seven MiB input limit;
8. upload to the correct Drive folder;
9. insert the web metadata row under RLS or a narrowly authorized operation;
10. if the row write fails, delete the just-created Drive file;
11. return the domain object without provider tokens or public URLs.

Use an entity ID or idempotency key before upload so a safe retry can find an
already-created file instead of duplicating it.

## Generation orchestration

### Browser to Next.js

The browser sends one web body-template ID and one web garment ID to a trusted
Route Handler. The handler:

1. authenticates the Supabase cookie session;
2. validates UUID input with Zod;
3. loads owner-scoped web rows;
4. checks current consent, Drive connection, source availability, and pose
   compatibility;
5. downloads the private Drive files;
6. decodes and revalidates the bytes;
7. creates a random staging attempt ID;
8. uploads immutable private staging objects;
9. writes `web_generation_inputs`;
10. invokes `generate-tryon` with the user's Supabase access token;
11. on admission rejection, removes all staging objects and records;
12. returns the admitted result ID and HTTP 202 payload.

### Public generation request

The existing mobile request stays valid:

~~~json
{
  "bodyTemplateId": "uuid",
  "garmentIds": ["uuid"]
}
~~~

The web request is:

~~~json
{
  "clientPlatform": "web",
  "bodyTemplateId": "uuid",
  "garmentIds": ["uuid"],
  "stagingAttemptId": "uuid"
}
~~~

If `clientPlatform` is absent, use `mobile`. Do not accept another value.
For web, require exactly one garment. Do not trust the platform value as proof
of ownership. Select from the matching record family and verify every owner.

### Admission function

The web branch of `generate-tryon`:

1. verifies the Supabase user;
2. loads the web template, garment, staging attempt, current consent, and Drive
   connection;
3. verifies ownership, input binding, source availability, and compatibility;
4. atomically reserves shared quota and creates the web result;
5. binds the staging rows to the result;
6. invokes `run-generation` with service-only authorization, result ID, and
   platform;
7. returns HTTP 202 and the result ID.

The mobile branch preserves the old request and current source/result storage.
It should use the new atomic ledger without requiring a mobile client change.

### Worker

The web branch of `run-generation`:

1. claims the result idempotently;
2. loads immutable result-specific staging;
3. marks generation as `generating`;
4. calls the existing Replicate model and prompt path;
5. marks generation `completed` only after valid output bytes exist;
6. marks delivery `delivering`;
7. refreshes the Google token from the Vault-held grant;
8. uploads the JPEG to the stored Generated Looks folder;
9. writes the Drive file ID, snapshots, verdict, and `delivered`;
10. purges all source staging.

If Replicate fails, mark generation failed, release quota, and purge staging.
If Drive delivery fails after valid output exists, keep a private recovery copy,
mark delivery failed, keep quota consumed, and purge source staging.

### Delivery retry and expiry

Add a caller-facing delivery-retry function or trusted route that:

- authenticates the user;
- verifies ownership and `generation_status = completed`;
- requires `delivery_status = failed`;
- verifies the recovery object exists and is not expired;
- uploads the existing bytes to Drive without calling Replicate;
- deletes the recovery object after confirmed Drive upload.

A scheduled Supabase cleanup deletes recovery objects after seven days and
marks them expired. It never performs Drive delivery.

## Query and client-state contract

TanStack Query owns web metadata and generation observation. Use user-scoped
keys:

~~~text
['web-body-templates', userId]
['web-garments', userId, filters]
['web-looks', userId, filters]
['web-look', userId, lookId]
['generation-quota', userId, utcDate]
['drive-connection', userId]
['current-consent', userId]
~~~

The browser may query web metadata tables directly through the shared Supabase
browser client and RLS. Drive file bytes use authenticated Next.js media routes.
Do not place Google access tokens in query functions.

Zustand stores only:

~~~text
garmentId
bodyTemplateId
resultId
entryPoint
~~~

Persist an ID-only, user-namespaced, versioned draft in `sessionStorage` only
when reload recovery is required. Clear query cache and the draft on sign-out
or account switch.

Poll active result rows every two seconds with a local deadline and a Realtime
option when useful. Do not retry authorization, consent, cap, compatibility,
missing-source, or expired-recovery errors as transient failures.

## Looks and deletion

- Add every delivered web result to Looks automatically.
- Favorite is a filterable boolean, not a storage switch.
- Keep generated looks after a source is deleted.
- Render deleted-source details from immutable result snapshots.
- Deleting a web look deletes its tracked Drive file first, then removes visible
  result metadata. The append-only generation attempt remains.
- If a generated Drive file is missing, mark the look missing and offer Delete
  record or Generate again. Generate again is a new quota-counted attempt.
- If a source Drive file is missing, mark the source missing and offer Replace
  image or Delete entry.

## Account deletion

Extend the existing `delete-account` behavior for web:

1. authenticate the user;
2. list only tracked Fitly-created Drive file IDs;
3. delete those files, treating already-missing files as success;
4. delete app-created folders only when empty;
5. purge temporary web Supabase staging and recovery objects;
6. delete or revoke the Vault credential;
7. remove web metadata, consent, and permitted account records;
8. run the existing mobile/Supabase cleanup;
9. delete the Supabase auth user last.

If Drive is revoked, offer Reconnect and delete everything or Continue and
leave Drive files. Record the user's explicit choice. Never block access to
account deletion solely because a third-party grant is unavailable.

## Required tests

- Existing mobile request without platform fields still follows the mobile
  branch.
- Mobile queries never receive web content rows.
- User A cannot query or mutate user B's web rows, staging, recovery files,
  connection, consent, or Drive file IDs.
- A web request cannot bind another user's staging attempt.
- Parallel web and mobile admission cannot exceed the shared daily limit.
- Deleting a look does not refund quota.
- Five templates are allowed per platform and the sixth is rejected at the
  trusted database boundary.
- Half-body templates fail for bottom, dress, and shoes in UI and direct calls.
- Drive sign-in, token refresh, revoked grant, wrong Google account, renamed
  folder, deleted folder, and missing file all reach their specified states.
- Admission rejection, worker failure, and duplicate invocation do not leak
  staging or start duplicate provider jobs.
- Delivery retry never calls Replicate.
- Recovery expiry removes private bytes and reports that regeneration is
  required.
- Account deletion never removes untracked user files from Drive.
- URL extraction appears as `Coming soon` and has no fake success path.

## Implementation order

1. Add migrations for platform provenance, consent, Drive connections, web
   tables, result-specific staging, and the generation ledger.
2. Add service-only Vault functions and RLS/grants.
3. Make quota admission atomic and route the current mobile branch through the
   ledger without changing its request.
4. Build Google OAuth callback, consent persistence, Drive verification, and
   folder management.
5. Build authenticated Drive media and source-upload Route Handlers.
6. Build web template and garment CRUD with camera/file input.
7. Build the garment-first draft flow and compatibility checks.
8. Add the web branch to `generate-tryon`.
9. Add direct Drive delivery and recovery behavior to `run-generation`.
10. Add result observation, Looks, favorites, retry delivery, sharing, and
    deletion.
11. Extend account deletion.
12. Run the required ownership, compatibility, concurrency, Drive, and mobile
    regression tests.

Prepare migration and function files locally. The user applies and deploys
them.
