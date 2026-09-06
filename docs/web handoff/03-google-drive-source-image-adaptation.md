# Google Drive image storage

This document describes the accepted web-only Drive model. The mobile app keeps
its current storage behavior.

## What changes

The mobile app does not have a source-upload Edge Function. It stores source
images locally, stages temporary copies directly into private Supabase Storage,
and calls `generate-tryon`.

The web app uses a different durable store:

- a trusted Next.js Node.js Route Handler saves normalized user source images
  to Google Drive;
- a trusted Next.js generation route copies selected Drive sources to
  result-specific private Supabase staging;
- `generate-tryon` admits the request;
- `run-generation` generates the image and uploads the completed web result
  directly to Drive;
- the worker purges input staging;
- Supabase keeps metadata, consent, quota, and status.

There is no web source-upload Edge Function. The worker's output upload to Drive
is part of generation delivery, not source acquisition.

## Drive scope and folders

Use `https://www.googleapis.com/auth/drive.file`. Do not request a restricted
full-Drive scope.

Create a visible structure:

~~~text
Fitly/
  Body Templates/
  Garments/
  Generated Looks/
~~~

Persist folder IDs. If a user renames a folder, continue using its ID. If a
folder is deleted, mark affected records missing and recreate the folder only
for future files or explicit replacement.

Use Fitly entity IDs in Drive `appProperties` to make upload retries
idempotent. Do not expose file IDs as public URLs or create public permissions.

Official references:

- [Google Drive scope guidance](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)
- [Google Drive file and folder search](https://developers.google.com/workspace/drive/api/guides/search-files)

## OAuth and token custody

Request Drive access during Google sign-in with offline access and explicit
consent. The Drive account must match the Google identity used for Supabase
Auth.

Supabase does not refresh or retain Google provider tokens for later Drive
calls. Capture the provider refresh token during the PKCE callback and transfer
it immediately to a service-only operation. Store it in Supabase Vault. Store
only the Vault secret reference, provider subject, Drive account identifier,
folder IDs, connection status, and timestamps in the connection record.

The browser must never receive a stored refresh token. Do not place Google
provider tokens in:

- local storage or session storage;
- Zustand or TanStack Query;
- client-readable Supabase rows;
- rendered Server Component props;
- application logs;
- ordinary cookies.

Official references:

- [Supabase Google login and provider tokens](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase social-login provider token behavior](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth offline access](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Supabase Vault](https://supabase.com/docs/guides/database/vault)

## Connection behavior

Treat Fitly authentication and Drive connection as different facts:

~~~text
connected
reauthorization_required
revoked
~~~

When Drive rejects a refreshed grant:

1. keep the Supabase session active;
2. mark the Drive connection as requiring authorization;
3. block image upload, generation, media rendering, and Drive deletion;
4. keep settings and account deletion available;
5. offer Reconnect Google Drive;
6. resume the interrupted operation only after its IDs and intent validate
   again.

Reconnection replaces the old Vault secret, preserves working folder IDs, and
recreates only missing folders.

## Source upload

Use a Next.js Route Handler with the Node.js runtime. It must authenticate the
Supabase cookie session, verify current consent, and verify the matching Drive
connection.

Accept JPEG, PNG, and WebP. At the trusted boundary:

- decode bytes instead of trusting MIME or extension;
- cap pixel dimensions to prevent decompression bombs;
- normalize orientation;
- strip EXIF and location metadata;
- re-encode the accepted image;
- keep the result at or below seven MiB;
- upload into the correct Drive folder;
- write the matching web metadata row;
- delete the new Drive file if the row write fails.

Create the domain entity ID before upload and use it as an idempotency key. A
retry should find the app-created file instead of making duplicates.

## Authenticated image rendering

Web metadata queries may run from the browser through Supabase RLS. Private
Drive bytes must pass through an authenticated Next.js media route that:

1. verifies the Supabase user;
2. loads the web row by owner and entity ID;
3. refreshes Drive access server-side;
4. downloads the recorded file ID;
5. streams an image response with a private, explicit cache policy.

Do not put access tokens in image URLs. Do not use a shared Next.js cache for
user-specific image responses.

## Generation staging

The source rows do not have a mutable staging pointer. The trusted Next.js
generation route creates immutable staging records and paths under a random
`stagingAttemptId`.

~~~text
{user_id}/web/{staging_attempt_id}/body.jpg
{user_id}/web/{staging_attempt_id}/garments/{garment_id}.jpg
~~~

If Drive download, staging, or admission fails, remove every object and record
created for that attempt. The worker purges staging after generation success or
failure. Add stale-input cleanup for process crashes.

## Generated-look delivery

The web branch of `run-generation` refreshes the user's Google grant from the
Vault-backed connection and uploads valid provider output to the stored
Generated Looks folder.

Track generation and Drive delivery separately. A provider failure releases
quota. A Drive failure after generation:

- keeps the attempt counted;
- writes a private Supabase recovery copy;
- marks delivery failed;
- offers Retry saving to Google Drive;
- never reruns Replicate during delivery retry;
- expires and deletes the recovery bytes after seven days.

A Supabase cleanup job handles expiry. It does not deliver files in the
background.

## Missing files

The user may delete files from Drive outside Fitly.

- Missing body template or garment: mark missing and offer Replace image or
  Delete entry.
- Missing generated look: mark missing and offer Delete record or Generate
  again.
- Generate again is a new quota-counted attempt.
- Never recreate a user-deleted file automatically.

## Deletion

For a body template, garment, or look:

1. authenticate the owner;
2. delete the tracked Drive file or accept an already-missing response;
3. delete or update the metadata row;
4. remove related temporary staging or recovery objects.

Keep completed looks when a source is deleted. Web result snapshots retain the
body-template and garment display facts.

For account deletion, delete only tracked app-created file IDs. Remove
app-created folders only when empty. Never recursively delete a folder by name,
because the user may have placed unrelated files inside it.

If Drive access is revoked, offer two explicit paths:

- reconnect and delete Fitly-created Drive files;
- continue deleting the Fitly account while leaving Drive files under the
  user's control.

Delete the Supabase Auth user last so earlier cleanup remains retryable.

## Privacy copy

A truthful starting point is:

> Your source photos and generated looks are saved in your Google Drive. When
> you generate a look, Fitly temporarily copies the selected source images to
> private processing storage and sends them to its AI provider. Fitly deletes
> those temporary source copies when processing finishes. If saving a completed
> look to Drive fails, Fitly may keep a private recovery copy for up to seven
> days so you can retry.

Legal review should settle final wording, processor disclosures, policy
versions, and retention language.
