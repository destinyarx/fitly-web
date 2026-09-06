# Data model and generation contract

## Shared Supabase project

The mobile and web apps use the same Supabase project, account, profile,
consent, quota ledger, and future subscription. They do not share content
tables or images. The deployed mobile backend lives outside either client
repository:

`C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\Fitly\supabase-side-projects`

The tables below describe the deployed mobile baseline. Keep them for mobile.
The accepted web target adds separate web tables and backward-compatible
function branches. See
[Settled web build contract](./06-settled-web-build-contract.md).

Do not recreate the current tables from this summary. Prepare reviewed
migrations in the shared backend repository and generate web database types
from the resulting schema.

## Database enums

```text
body_pose:          full | half
garment_category:   top | bottom | dress | outerwear | shoes | accessory
garment_source:     catalogue | upload | url | camera
generation_status:  pending | queued | generating | completed | failed
```

## Current mobile tables

### `public.users`

| Column | Type and behavior |
|---|---|
| `id` | UUID primary key, references `auth.users`, cascades on account deletion. |
| `display_name` | Nullable text, populated from Google `full_name` by `handle_new_fitly_user()`. |
| `sizing_prefs` | JSONB, default `{}`. No current UI writes it. |
| `daily_limit` | Integer, default 3, non-negative. Client can read but cannot update it. |
| `template_limit` | Current migration default 3; current mobile fallback 2. The accepted target migration sets existing profiles and the default to 5. |
| `created_at` | Timestamp with timezone. |

The auth trigger inserts this profile row after a new Supabase auth user is
created.

### `public.body_photos`

| Column | Type and behavior |
|---|---|
| `id` | UUID primary key. |
| `user_id` | Owner UUID, cascades with auth user. |
| `name` | Required text. |
| `pose` | Required `body_pose`. |
| `storage_path` | Nullable staging path after the second migration. Any value must start with `{user_id}/`. |
| `is_primary` | Boolean, default false. A partial unique index allows one primary template per user. |
| `usage_count` | Integer, default 0. No implementation currently increments it. |
| `created_at` | Timestamp with timezone. |

For mobile, `storage_path = null` is the resting state. The durable image is on
the device and the column points to a temporary Supabase Storage copy only while
generation runs.

### `public.garments`

| Column | Type and behavior |
|---|---|
| `id` | UUID primary key. |
| `user_id` | Owner UUID, cascades with auth user. |
| `name` | Required text. |
| `brand` | Nullable text. |
| `price` | Nullable text. It is display text, not a money type. |
| `category` | Required `garment_category`. |
| `source` | Required `garment_source`. |
| `storage_path` | Nullable staging path. Any value must start with `{user_id}/`. |
| `product_url` | Nullable text. URL import is not implemented. |
| `created_at` | Timestamp with timezone. |

### `public.tryon_results`

| Column | Type and behavior |
|---|---|
| `id` | UUID primary key. |
| `user_id` | Owner UUID, cascades with auth user. |
| `body_photo_id` | Nullable FK to `body_photos`. Deleting a template sets this to null. |
| `garment_ids` | Required UUID array. The backend accepts 1 to 4. |
| `status` | `generation_status`, default `pending`. Admission currently inserts `queued`. |
| `output_path` | Nullable private Storage path, constrained to the owner prefix. |
| `verdict` | Nullable generated-by-template display sentence. |
| `match_label` | Nullable. Current worker always writes null because Replicate gives no confidence score. |
| `is_saved` | Boolean, default false. This is the only result column the client may update. |
| `failure_reason` | Nullable user-facing failure text. |
| `counted_against_quota` | Boolean, default true. Provider and handoff failures set it false and set status to failed. |
| `created_at` | Timestamp with timezone. Used for quota and ordering. |

There is no relational join table for garments in a look. IDs are stored as a
UUID array. Keep that shape for initial compatibility. If the web product needs
garment ordering, per-item metadata, or strong foreign keys, record a new ADR
before changing it.

## RLS and grants

- Every user-owned table has RLS enabled.
- `users`, `body_photos`, `garments`, and `tryon_results` restrict rows to
  `auth.uid()`.
- Authenticated clients can select their profile and update only
  `display_name` and `sizing_prefs`.
- Authenticated clients can select, insert, update, and delete their body photos
  and garments.
- Clients cannot insert result rows. The admission function creates them with
  the service role.
- Clients can select and delete their results and update only `is_saved`.
- Anonymous access is revoked from all four tables.

RLS is the data boundary. A protected App Router layout is navigation behavior,
not authorization.

## Current mobile Supabase Storage

All three buckets are private and use `{user_id}/...` paths:

| Bucket | Current purpose | Writer |
|---|---|---|
| `body-photos` | Temporary source-image staging | Authenticated client, then worker purges it. |
| `garments` | Temporary source-image staging | Authenticated client, then worker purges it. |
| `tryon-results` | Durable mobile generated output; temporary web recovery only after the web migration | Internal worker. |

Bucket policy limits objects to image MIME types and 8 MiB. Client and worker
code impose a 7 MiB maximum per source image.

Current mobile looks use signed URLs with a 60-minute view lifetime and a
10-minute share lifetime. Web does not use this as its durable or sharing
model. Web results live in Drive and share as files.

## Current admission function contract

Endpoint: `generate-tryon`

Authentication: caller's Supabase access token. The function calls `getUser()`
and derives the user ID from the verified session. It never trusts a user ID in
the body.

Request:

```json
{
  "bodyTemplateId": "uuid",
  "garmentIds": ["uuid"]
}
```

Validation:

- Body-template ID must be a UUID.
- `garmentIds` must contain 1 to 4 UUIDs.
- The caller must own the template and every garment.
- Every garment category must be compatible with the template pose.
- The user's non-failed result count since 00:00 UTC must be below
  `users.daily_limit`.

Success response:

```json
{
  "resultId": "uuid",
  "status": "queued",
  "positionInQueue": 1,
  "etaSeconds": 25
}
```

HTTP status is 202. The result row is claimed before the worker handoff so the
quota slot exists even if the client disconnects.

Error codes currently returned include:

| HTTP | Code | Meaning |
|---:|---|---|
| 400 | `invalid_request` | Request shape or IDs failed validation. |
| 401 | `unauthorized` | Missing or invalid Supabase session. |
| 404 | `template_not_found` | Missing, deleted, or not owned. |
| 404 | `garment_not_found` | One or more garments missing, deleted, or not owned. |
| 422 | `incompatible_template` | Pose and category do not match. |
| 429 | `daily_cap_reached` | Daily cap is already used. |
| 500 | `could_not_queue` | Result row could not be created. |
| 503 | `could_not_start` | Worker handoff failed. The new row is marked failed and refunded. |

The mobile client maps these codes to friendly copy and treats unknown errors as
"We couldn't start that generation."

## Current worker contract

Endpoint: `run-generation`

The browser must never call it. It has no CORS headers and accepts only the
Supabase service-role key as its bearer value. Gateway JWT verification is off
for this function because the function performs its own constant-time bearer
comparison.

Internal request:

```json
{
  "resultId": "uuid"
}
```

The current mobile worker:

1. Loads the result, body template, and garments with the service role.
2. Re-checks ownership and requires non-null staged paths.
3. Sets result status to `generating`.
4. Downloads each private source object and checks owner prefix, MIME type, and
   7 MiB size.
5. Encodes the images as data URIs.
6. Calls Replicate model `black-forest-labs/flux-2-pro` unless
   `REPLICATE_MODEL` overrides it.
7. Sends the body image first, followed by garment images.
8. Requests matching aspect ratio, JPEG output, and quality 90.
9. Waits up to 60 seconds on the initial Replicate request, then polls every 2
   seconds, with a 120-second worker deadline.
10. Copies the mobile provider output to
    `tryon-results/{user_id}/{result_id}.jpg`.
11. Writes `completed`, output path, and a templated verdict. It leaves
    `match_label` null.
12. On error, writes `failed`, a safe reason, and
    `counted_against_quota = false`.
13. Purges staged body and garment objects and clears their `storage_path`
    values after either success or failure.

Replicate secrets remain in Supabase Edge Function secrets. They must never
enter the Next.js client bundle.

The accepted web branch does not replace this mobile behavior. It consumes
result-specific web staging and uploads completed web output directly to the
user's Drive. Its exact contract is in
[Settled web build contract](./06-settled-web-build-contract.md).

## Prompt behavior

The worker's prompt asks for one hyperrealistic photograph of the same person
wearing the named garments. It instructs the model to preserve face, body
proportions, pose, skin tone, and background, while changing only clothing and
matching fabric, drape, color, and fit.

The verdict is not model-generated. `buildVerdict()` formats garment brand and
name into a sentence such as "The Acme Bomber on your frame, see how it sits."

## Client observation contract

Mobile polls the owner's `tryon_results` row every 2 seconds and selects:

```text
status
verdict
match_label
failure_reason
counted_against_quota
```

Transient read failures do not fail the generation UI. The client keeps
polling. After 180 seconds, it stops locally and asks the user to check Looks.
The server job may still finish.

The table is already in the Supabase Realtime publication. Web may use polling
or Realtime, but should keep a polling fallback and avoid announcing every poll
to assistive technology.

## Query and mutation behavior to preserve

Web key families use the web record family and authenticated user ID:

```text
['web-body-templates', userId]
['web-garments', userId]
['web-looks', userId]
['web-look', userId, lookId]
['generation-quota', userId, utcDate]
['drive-connection', userId]
```

Mutation effects:

- Create, rename, or delete template invalidates templates. Cascade deletion
  also invalidates looks.
- Create, recategorize, or delete garment invalidates garments.
- Save or unsave look invalidates list and detail.
- Delete look invalidates list and detail. It must not refund a successful daily
  generation unless the product rule explicitly changes.
- Generation completion or failure invalidates looks and quota.
- Sign-out and account switch clear all user-scoped client cache.

## Existing weaknesses not to inherit silently

These findings describe the current implementation, not settled product rules.

1. **Template limit mismatch.** The current migration defaults to 3 and mobile
   fallback uses 2. The accepted target is 5 in each platform library.
2. **Template limit is not a trusted write constraint.** Mobile disables its Add
   button, but RLS allows direct inserts and no database function enforces the
   limit.
3. **Quota admission is not atomic.** `generate-tryon` counts rows and inserts a
   new row in separate operations. Parallel requests can pass the same count and
   exceed the cap.
4. **Deleting a result refunds a successful try.** The client may delete its
   result row, while the cap counts existing non-failed rows for the current day.
   Deleting a completed result therefore reduces `usedToday` and allows another
   paid generation. Usage needs an append-only ledger, a non-deletable admission
   record, or a deletion model that removes the image without removing the quota
   event.
5. **Queue data is synthetic.** There is no queue table. Every request reports
   position 1 and 25 seconds.
6. **Admission failures can leak staged sources.** Mobile stages source objects
   before calling admission. If admission rejects the request, no worker runs to
   purge those objects. Partial staging failures have the same problem.
7. **One staging pointer per source can race.** Concurrent generations using the
   same template or garment overwrite the same `storage_path` field.
8. **Worker idempotency is partial.** A completed row is a no-op, but repeated
   calls for a non-completed row can start more than one provider request.
9. **`usage_count` is never maintained.** The UI displays it, but no migration,
   trigger, admission function, or worker increments it.
10. **`pending` is effectively unused.** It remains an enum value and table
   default while admission starts rows as `queued`.
11. **Source-row orphans are expected on mobile.** A reinstall removes local
    images but keeps database rows. Google Drive introduces a similar case when
    a user deletes a Drive file manually.
12. **The backend allows four garments, the client sends one.** The first web
    release supports exactly one garment. Keep the current mobile request
    backward compatible.
13. **The current delete-account function does not know about Google Drive.** It
    purges Supabase buckets and the auth user only.

The accepted web design resolves these with separate web tables,
result-specific staging, an append-only atomic quota ledger, and two status
lifecycles. None is deployed yet. Implement and verify them before calling the
web generation path production ready.
