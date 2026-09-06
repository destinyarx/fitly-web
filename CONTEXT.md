# Fitly web context

Read this before writing code. For visual work, read `DESIGN.md` as well.

**Status:** Next.js foundation. The libraries and shared clients are configured. Web product features, web-specific Supabase migrations, Google Drive integration, authentication flows, and the web generation branch are not implemented yet.

The sibling `fitly-mobile` project is a product reference, not a code dependency. The web app shares its Supabase account, profile, consent, quota, and future subscription with mobile. It does not share image libraries or generated looks.

## 1. What Fitly is

Fitly is a virtual clothing try-on product. A user supplies a photo of themselves and a garment image. The product generates an AI preview of that garment on the user's body.

The product answers one question: "What would this clothing look like on me?"

The goal is to reduce purchase uncertainty. A user should move from finding a garment to seeing a useful preview in under a minute, without measurements or a fitting room.

### Users

- Online shoppers who are unsure how a garment will look on them.
- Trend-led users who want to try several items, keep results, and share image files.

### Product principles

1. Speed over perfect simulation. A quick, useful preview beats a slow claim of exact fit.
2. Honest feedback. Queues, limits, generation failures, and Drive failures state what happened and what the user can do next.
3. Private images. Ask for clear consent, keep files private, disclose every processing location, and make deletion available.
4. Shopping aid, not fit guarantee. The result helps a decision but does not promise sizing accuracy.

## 2. Domain language

Use these terms in code, copy, issues, and tests.

| Term | Meaning |
|---|---|
| Account | The user's Google-authenticated identity in Supabase Auth. |
| Profile | Shared account data such as display name and plan limits. It is not an image library. |
| Body template | A saved user photo used for try-on generation. |
| Pose | `full` for head-to-toe or `half` for waist-up. |
| Garment | A clothing item supplied by catalogue, upload, URL, or camera. |
| Category | `top`, `bottom`, `dress`, `outerwear`, `shoes`, or `accessory`. |
| Source image | The original body-template or garment image supplied by the user. |
| Look | A generated try-on result. Use `TryOnResult` as the code type when needed. |
| Draft | The selected body template and garment before generation begins. |
| Client platform | The application that owns an image library or result: `mobile` or `web`. |
| Drive connection | The separately revocable permission for Fitly to manage its app-created Google Drive files. |
| Generation attempt | The append-only quota event created when the backend admits a try-on request. |
| Delivery | Saving a successfully generated web look into the user's Google Drive. |
| Quota | The shared daily generation allowance. Body-template caps apply separately to each platform library. |
| Companion | Fitly's first-person assistant voice, shown only in companion UI. |

Do not rename a body template to model, avatar, selfie, or body photo in domain code. "Body photo" is acceptable only when discussing raw image bytes or storage.

### Compatibility rule

A half-body template cannot wear a `bottom`, `dress`, or `shoes`. Those categories require legs in the frame.

Encode this rule in the web domain module and at the trusted generation boundary. Keep incompatible templates visible, disable selection, and state the reason.

### Generation and delivery lifecycle

```text
generation: queued -> generating -> completed
                              \-> failed

delivery:   pending -> delivering -> delivered
                                \-> failed
```

`queued` is normal. An AI-generation failure releases its quota reservation. A Drive delivery failure happens after generation succeeded, so it stays counted and retries only delivery.

## 3. Intended web routes

The exact URLs may change during implementation. Preserve these product areas:

```text
public
|-- landing
|-- sign in
`-- sign up

authenticated
|-- looks
|-- closet
|-- try-on flow
|-- look detail
|-- profile
`-- settings
```

Use App Router route groups to separate public and authenticated layouts without adding URL segments. Layout redirects improve navigation but are not authorization.

Built so far: `/` (landing), `/login` and `/signup` under the `(auth)` group, and the `GET /auth/callback` route handler that exchanges the Google authorization code for a session. `/terms` and `/privacy` are linked from the sign-up consents but do not exist yet. Completed sign-in currently lands on `/`; it moves to Looks when that route exists (`POST_SIGN_IN_PATH` in `src/features/auth/auth.constants.ts`).

## 4. Architecture

The app uses feature modules under `src/features/`. Next.js route files in `src/app/` compose those features.

```text
src/
|-- app/
|-- features/
|   |-- auth/
|   |-- drive/
|   |-- looks/
|   |-- closet/
|   |-- try-on/
|   `-- profile/
|-- shared/
|-- lib/supabase/
|-- providers/
`-- config/
```

Cross-feature imports go through the feature's `index.ts`. Shared modules contain domain-neutral code used by more than one feature. See `AGENTS.md` for server/client, state, validation, and security rules.

## 5. State and data

- Server Components load route data when no client lifecycle is needed.
- TanStack Query owns client-side remote data, polling, optimistic mutations, and realtime-backed lists.
- Zustand owns the ID-only, temporary try-on draft.
- React Hook Form owns form fields, with Zod at browser and trusted server boundaries.
- Supabase owns identity, metadata, consent, shared quota, and generation state.
- Google Drive owns durable web source images and generated looks.
- Supabase Storage holds web bytes only during generation staging or failed-delivery recovery.

Do not copy Supabase rows, raw `File` objects, or provider credentials into Zustand.

## 6. Storage and AI boundary

The web and mobile apps use the same Supabase project, account, profile, consent records, daily quota ledger, and future subscription. Their image libraries and result rows are separate.

- Authenticate with Google OAuth through Supabase and cookie-based SSR sessions.
- Request the narrow Google Drive `drive.file` scope and offline access during sign-in.
- Require the Drive account to match the Google identity used for Fitly login.
- Store web metadata in web-specific tables. Existing mobile tables and queries remain unchanged.
- Store web source images and generated looks in the visible `Fitly` Drive folder.
- Upload web source images through a trusted Next.js Node.js Route Handler, not an upload Edge Function.
- Stage generation inputs under immutable attempt-specific paths in private Supabase Storage.
- Reuse `generate-tryon` and `run-generation` with backward-compatible web branches.
- Store Google refresh tokens in Supabase Vault behind service-only functions.
- Never expose a Google token, Supabase secret key, Replicate key, or public Drive permission to the browser.
- Render Drive files through authenticated responses. Sharing sends or downloads the file through browser capabilities.

The shared backend repository is `C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\Fitly\supabase-side-projects`. Accepted decisions live in `docs/adr/`.

## 7. Settled product rules

- Google OAuth is the only production identity method.
- The daily generation limit is 3 across mobile and web and resets at 00:00 UTC.
- Each platform library permits 5 body templates.
- The first web release generates one garment at a time.
- Half-body templates cannot generate bottoms, dresses, or shoes.
- Completed web looks are added to Looks automatically. Saving is a favorite state.
- Deleting a source keeps completed looks. Result rows store display snapshots for deleted sources.
- AI-generation failures do not consume quota.
- Drive-delivery failures do consume quota and retry delivery without rerunning Replicate.
- A failed-delivery recovery copy stays in private Supabase Storage for no more than seven days.
- Web sharing uses the Web Share API when file sharing is available and Download otherwise. Fitly does not make the Drive file public.
- URL extraction is a future feature and must be labeled `Coming soon`.
- Fitly does not fabricate AI-provider confidence percentages.

## 8. Not built

- Web-specific Supabase tables, RLS, Vault access functions, atomic quota ledger, and staging policies
- Drive credential capture, session refresh Proxy, and protected routes (the OAuth callback exists; nothing yet reads or stores the Google refresh token)
- Google Drive folder management, authenticated media delivery, and source upload
- Body-template and garment forms
- Web branches in `generate-tryon`, `run-generation`, and `delete-account`
- Generation observation, Drive delivery retry, Looks, Closet, profile, settings, sharing, and deletion
- Automated tests and analytics
- `/terms` and `/privacy` pages linked from the sign-up consents

Do not describe these as working until they exist and have been verified.

## 9. Future product work

- Retailer URL extraction and its product-data source
- Multiple garments in one web generation
- Paid plans and subscription entitlements

Do not expose future work as working UI. Record later decisions that affect several features in `docs/adr/`.

## 10. Verification

Run the checks in `AGENTS.md` before claiming completion. Test Supabase ownership with at least two users, verify Drive revocation and missing-file recovery, exercise parallel quota admission, and check narrow and desktop layouts.
