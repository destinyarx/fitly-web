# Fitly web AGENTS.md alignment

The actual `fitly-web/AGENTS.md` was amended after the architecture interview.
This file records what changed and what future agents must preserve.

## Applied rules

### Shared backend location

The web agent instructions now identify:

`C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\Fitly\supabase-side-projects`

That repository owns migrations and Edge Functions. Agents may prepare files
there but must not apply migrations or deploy functions without the user's
explicit instruction.

### Web storage

- Durable web body-template, garment, and generated-look files live in the
  user's visible Google Drive.
- A trusted Next.js Node.js Route Handler uploads web source images.
- Supabase Storage is temporary for web source staging and failed-delivery
  recovery.
- The generated web result goes from `run-generation` directly to Drive.
- Mobile keeps its current storage path and request.

### Google credentials

- Sign-in requests `drive.file`, offline access, and explicit consent.
- The Drive and Supabase Google identities must match.
- Refresh tokens live in Supabase Vault behind service-only operations.
- Tokens never enter browser storage, client state, rendered props, logs, or
  client-readable rows.
- A Drive failure does not sign the user out of Fitly.

### Platform isolation

- Existing tables remain the mobile record family.
- Web uses separate content and result tables.
- Identity, profile, consent, daily quota, and future subscription are shared.
- `client_platform` identifies `mobile` or `web` on shared handoffs and the
  quota ledger.

This avoids a real compatibility bug. The existing mobile services select all
owned rows without a platform filter. Putting web rows in those tables would
make the unchanged mobile app list records whose Drive images it cannot load.

### Generation

- The browser calls only `generate-tryon`.
- An absent platform keeps the current mobile behavior.
- Web sends `clientPlatform: 'web'` and `stagingAttemptId`.
- Web staging is immutable and result-specific.
- The worker preserves its mobile branch and adds a Drive-delivery web branch.
- Generation and delivery use separate states.
- A delivery retry uses recovery bytes and never calls Replicate again.

### Quota

- Admission uses an append-only shared generation ledger and an atomic database
  operation.
- AI failure releases the reservation.
- Successful generation consumes it.
- Drive delivery failure stays counted.
- Deleting a look does not remove its quota event.
- The daily cap is three across platforms. Each platform has a separate
  five-template cap.

### Product behavior

- Web generates one garment at a time.
- Delivered results appear in Looks automatically.
- Favorite does not control file durability.
- URL extraction is labeled `Coming soon`.
- Sharing sends or downloads a file without creating a public Drive link.
- Account deletion removes tracked Drive files only and deletes the Supabase
  auth user last.

### Verification and publishing

The web instructions now require mobile request regression, two-account
ownership, Drive revocation, staging cleanup, quota concurrency, and delivery
retry checks.

They also state that the user owns remote migrations, function deployment, and
publishing. Agents do not run those operations without an explicit request.

## Documentation precedence

Use this order when implementation documents disagree:

1. Accepted ADRs in the web repository
2. The settled web build contract in this handoff
3. Current migration and Edge Function contracts
4. Root `CONTEXT.md` and `DESIGN.md`
5. Feature specifications and issue notes

Report a conflict before coding. When the task permits documentation changes,
update the stale source in the same change.

## Issue tracker note

The web repository's agent documentation points issue and specification work to
`.scratch/`. The empty `docs/issues/issue-tracker.md` should not be treated
as an active tracker unless the user deliberately changes that convention.
