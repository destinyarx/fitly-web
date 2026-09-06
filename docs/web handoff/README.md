# Fitly web handoff

This folder contains the product, backend, and implementation knowledge needed
to build Fitly in Next.js. The initial scan was completed on 2026-09-02 and the
architecture was settled through a grilling and domain-modeling session with
the user on the same date.

## Project locations

- Mobile behavior reference: `C:\expo\fitly-mobile`
- Web implementation:
  `C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\Fitly\fitly-web`
- Shared Supabase backend:
  `C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\Fitly\supabase-side-projects`

The mobile app remains unchanged. Web migrations and Edge Function changes
belong in the shared Supabase repository. Agents prepare those files locally;
the user applies migrations and deploys functions.

## Reading order

1. [Settled web build contract](./06-settled-web-build-contract.md)
2. [Product behavior and flows](./01-product-behavior-and-flows.md)
3. [Current backend and target contract](./02-data-model-and-generation-contract.md)
4. [Google Drive adaptation](./03-google-drive-source-image-adaptation.md)
5. [Next.js implementation recommendations](./04-fitly-web-implementation-recommendations.md)
6. [Applied AGENTS.md alignment](./05-fitly-web-agents-md-suggestions.md)
7. [Domain glossary](./07-domain-glossary.md)

The settled build contract wins if an older observation differs. The product
flow document describes behavior. The backend document separates the deployed
mobile baseline from the web changes that are not built yet.

## Accepted web decisions

- Google OAuth is the only production sign-in method.
- Fitly requests `drive.file` and offline access during sign-in.
- A visible `Fitly` folder holds all durable web source images and generated
  looks.
- Source uploads use a trusted Next.js Node.js Route Handler. There is no web
  source-upload Edge Function.
- The internal generation worker uploads completed web results directly to
  Drive.
- Google refresh tokens live in Supabase Vault and never enter client storage.
- Web uses separate content tables so the unchanged mobile client cannot list
  web records.
- Identity, profile, consent, daily quota, and future subscription remain
  shared.
- Daily quota is three across both platforms. Each platform has its own
  five-body-template cap.
- Web supports one garment per generation.
- Completed web looks appear automatically in Looks. Favorite is a separate
  state.
- URL extraction is a future feature labeled `Coming soon`.
- Drive delivery has a separate lifecycle from AI generation.
- Failed Drive delivery keeps a private recovery copy for seven days and
  retries delivery without rerunning Replicate.

## Accepted ADRs

The web repository now records the hard-to-reverse decisions:

- `docs/adr/0001-store-web-images-in-google-drive.md`
- `docs/adr/0002-separate-web-and-mobile-image-libraries.md`
- `docs/adr/0003-extend-generation-with-web-drive-delivery.md`
- `docs/adr/0004-use-an-append-only-generation-ledger.md`

Its root `AGENTS.md`, `CONTEXT.md`, and storage-related `DESIGN.md` rules
have also been reconciled with this handoff.

## Important baseline correction

The opening status in the mobile `CONTEXT.md` is stale. The shared Supabase
repository already contains:

- the current mobile tables, grants, RLS, and private buckets;
- `generate-tryon` admission;
- the internal `run-generation` worker;
- Replicate integration using `black-forest-labs/flux-2-pro`;
- the current `delete-account` function.

Those functions do not yet support the accepted web table family, Vault-backed
Drive delivery, result-specific web staging, or the atomic shared quota ledger.
Treat those as required implementation work, not existing behavior.

## Web foundation

The web repository already has Next.js 16.3.4, React 19.2.8, strict TypeScript,
Tailwind CSS 4, Supabase JS, `@supabase/ssr`, TanStack Query, Zustand, React
Hook Form, Zod, and the Zod resolver.

It does not currently include shadcn/ui. Do not add it unless the user approves
that dependency.
