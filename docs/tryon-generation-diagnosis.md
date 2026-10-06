# Try-on admission failure

Verified on 2026-10-06 using the tester's selected full-body template and red dress.

Subsequent verification confirmed the follow-up migration is now recorded as
applied, and the tester generated a look successfully. The diagnosis below records
the original admission failure and the rollback tests that verified its fix.
See `drive-delivery-diagnosis.md` for the separate worker-configuration failure.

## Root cause

The browser POST reaches `/api/try-on`. Drive downloads and temporary staging
succeed, but `generate-tryon` returns HTTP 500 with `could_not_queue`. Its database
RPC, `admit_fitly_generation`, raises PostgreSQL error `42702`:

```text
column reference "result_id" is ambiguous
It could refer to either a PL/pgSQL variable or a table column.
```

`RETURNS TABLE(result_id ...)` creates a PL/pgSQL output variable. The web staging
update uses `and result_id is null` without a table qualifier, so PostgreSQL
cannot resolve it. The RPC transaction rolls back before a quota event is
inserted. No worker or Replicate request starts. The Edge Function maps this
database failure to `could_not_queue`, and the web route hides that behind
`generation_rejected`, producing the generic alert.

## Prepared fix

The shared backend's follow-up migration is
`supabase/migrations/20261006000000_fix_web_generation_admission.sql`.
It aliases `web_generation_inputs` as `input` and qualifies `input.user_id`,
`input.staging_attempt_id`, and `input.result_id` in the staging update. It keeps
the RPC signature, service-role check, atomic quota transaction, and mobile branch.
The applied historical migration is preserved.

From `supabase-side-projects`, the migration commands are:

```powershell
bunx --no-install supabase db push --dry-run
# Apply only after explicit user authorization:
bunx --no-install supabase db push
```

The dry run listed only the admission-fix migration. No Edge Function deployment
or credential change is required for this fix.

The regression runner accepts two existing test-owned source IDs:

```powershell
bun scripts/test-web-generation-admission.ts --local <body-id> <garment-id>
# Explicitly select the linked database for a rollback-only check:
bun scripts/test-web-generation-admission.ts --linked <body-id> <garment-id>
```

Append `--baseline` to reproduce the failure using the original function. The
runner installs only a session-local `pg_temp` function, executes the regression,
and rolls back. Use a tester with remaining daily quota. The staged metadata is
synthetic and does not require an image upload.

## Evidence and limits

- Clicking the real Generate button reproduced the failure.
- The deployed RPC definition contains the ambiguous update.
- The original function failed the database regression with error `42702`.
- A temporary copy of the corrected function passed admission, input binding,
  attempt isolation, quota reservation, deletion-without-refund, and failure-release
  assertions in `supabase/tests/web-generation-admission.sql`.
- Both test executions were wrapped in transactions. Successful test writes were
  rolled back. No storage files, Drive files, workers, or provider jobs were created
  by the SQL test.
- After the browser requests and rollback tests, the tester had zero active quota
  attempts and zero unbound staging rows. The public RPC remained unchanged.
- Temporary diagnostic logging was removed.
- Web lint, typecheck, the five callback regression tests, and production build
  passed. The new Bun regression runner also passed strict TypeScript checking.

Full generation and Drive delivery must be retested after migration approval.
The rollback test does not establish two-account ownership, parallel quota
admission, Drive revocation, cleanup scheduling, or mobile generation end to end.
