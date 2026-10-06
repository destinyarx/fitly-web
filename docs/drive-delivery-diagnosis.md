# Drive delivery configuration failure

Verified on 2026-10-06 for look `28c78113-d415-43d9-ba8f-2986580542c8`.

## Cause

Generation completed and consumed its quota event, but the worker could not save
the image to Drive. Its `_shared/google-drive.ts` helper requires
`GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` to refresh the Google
token stored in Vault. Both names are absent from the project's Edge Function
secret list. The helper throws `google_oauth_not_configured` when they are missing.

Those credentials exist in the local Next.js environment. Local `.env` files do
not configure the remote Edge Function runtime. This explains why source uploads
and local recovery delivery work while automatic worker delivery fails.

`FITLY_ENVIRONMENT` is also absent from the Edge secrets. The worker defaults to
`production`, while the current local app uses `development`. Match this setting
so both upload paths use the same app-properties tracking value.

## Recovery verified

The owned look initially had `generation_status = completed`,
`delivery_status = failed`, an unexpired private recovery copy, a connected Drive
grant, and a consumed quota event. Clicking **Retry Drive delivery** successfully
saved that existing recovery image through the local server. The page and database
then reported `delivered`, with a Drive file ID and no remaining recovery pointer.
The retry did not rerun Replicate or create a generation attempt. The quota event
remained consumed.

This verifies that the current Google grant, destination folder, and local upload
path work. Automatic delivery by the worker still needs a new generation test
after its configuration is corrected.

## Remote correction

Set only these Edge Function secrets using the same Google OAuth client as the
Supabase Google provider and the local server:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `FITLY_ENVIRONMENT=development` for the current development setup

Use the Supabase Dashboard's Edge Function secrets settings or
`supabase secrets set --env-file <private-file>`. The private file must contain
only these three entries, remain outside version control, and be removed after
use. Do not send the entire Next.js environment file to Supabase or print secret
values. Remote configuration requires explicit authorization under `AGENTS.md`
section 17. No worker redeployment or database migration is required for this
configuration correction.
