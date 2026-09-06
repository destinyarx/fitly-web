# ADR 0003: Extend generation with web Drive delivery

- Status: Accepted
- Date: 2026-09-02

## Context

The deployed mobile contract calls `generate-tryon` with a body-template ID and garment IDs. That function creates a result and invokes the internal `run-generation` worker. The worker reads source staging from the mobile rows and stores completed output in private Supabase Storage.

Web must reuse this generation boundary, preserve mobile behavior, stage sources safely, and deliver generated web results to Google Drive.

## Decision

The existing mobile request remains valid:

~~~json
{
  "bodyTemplateId": "uuid",
  "garmentIds": ["uuid"]
}
~~~

Web sends:

~~~json
{
  "clientPlatform": "web",
  "bodyTemplateId": "uuid",
  "garmentIds": ["uuid"],
  "stagingAttemptId": "uuid"
}
~~~

An absent `clientPlatform` means `mobile`. The first web release requires exactly one garment.

Before admission, a trusted Next.js Route Handler downloads the selected Drive files, validates them, and writes private staging objects under the immutable attempt ID. It creates owner-scoped `web_generation_inputs` records. The web branch of `generate-tryon` verifies the attempt, source ownership, compatibility, consent, Drive connection, and quota before binding the inputs to a web result.

`run-generation` keeps its existing mobile branch. Its web branch consumes result-specific staging, calls Replicate, uploads the completed image to `Fitly/Generated Looks`, writes immutable source display snapshots, and purges staging.

Web results track generation and delivery separately:

~~~text
generation: queued -> generating -> completed | failed
delivery:   pending -> delivering -> delivered | failed
~~~

If generation succeeds but Drive delivery fails, the worker keeps a private recovery copy in Supabase Storage for seven days. Delivery retry does not call Replicate again. The attempt remains counted. A cleanup job deletes expired recovery objects but does not attempt delivery.

## Alternatives considered

- Reusing the source rows' single `storage_path` was rejected because concurrent generations can overwrite one another's pointer.
- A browser-driven result transfer was rejected because closing the browser could strand a completed generation.
- A Next.js background finalizer was rejected because delivery should not depend on the web deployment or a scheduled web job.
- Treating Drive delivery failure as AI failure was rejected because it would discard paid, completed provider work.

## Consequences

- The caller-facing function name and mobile request remain stable, but both Edge Functions gain web branches.
- Google credential access is required in the web worker branch.
- Web status polling observes `web_tryon_results`, including delivery state.
- Deleting a source keeps completed looks, so the result stores body-template and garment display snapshots.
- Every staging, admission, worker, retry, and cleanup path must be idempotent.
