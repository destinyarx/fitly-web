# Product behavior and flows

## Product job

Fitly answers one question: "What would this clothing look like on me?"

The target experience is under one minute from finding or photographing a
garment to seeing a useful try-on. The image is a shopping aid, not a promise
about exact sizing or fit.

The product is aimed at regular online shoppers and trend-led users who try
several items, keep results, favorite them, and share image files. Four
principles shape its
behavior:

1. Prefer a fast, useful preview over a slow claim of perfect simulation.
2. Explain queues, limits, and failures without blaming the user.
3. Treat body images as sensitive and explain their handling at capture time.
4. Do not invent data. No guessed category, fake confidence score, or missing
   profile value should appear as fact.

## Canonical domain language

The full web glossary is in [Domain glossary](./07-domain-glossary.md).

| Term | Meaning |
|---|---|
| Account | The identity in `auth.users`. Production identity is OAuth-only. |
| Profile | The matching row in `public.users`, with display name, sizing preferences, and quota limits. |
| Body template | A reusable photo of the user, named by the user and tagged with a pose. |
| Pose | `full` for head-to-toe or `half` for waist-up. |
| Garment | A clothing item with a category and source. |
| Category | `top`, `bottom`, `dress`, `outerwear`, `shoes`, or `accessory`. |
| Source | `catalogue`, `upload`, `url`, or `camera`. This describes how the garment entered Fitly, not where its bytes are stored. |
| Look | A generated try-on. The code type is `TryOnResult`. |
| Draft | The temporary body-template and garment selection before generation. |
| Client platform | The application that owns an image library or result: `mobile` or `web`. |
| Drive connection | The separately revocable permission for Fitly to manage its app-created Drive files. |
| Generation attempt | The append-only shared quota event created at admission. |
| Delivery | Saving a completed web generation into Google Drive. |
| Quota | Three daily generations shared across platforms. Template caps are per-platform. |
| Companion | Fitly's first-person assistant voice. It should only speak in its distinct companion treatment. |

Do not rename a body template to model, avatar, or selfie in domain code. "Body
photo" is acceptable when discussing raw image bytes or storage.

## Compatibility rule

A half-body template can wear a `top`, `outerwear`, or `accessory`. It cannot
wear a `bottom`, `dress`, or `shoes`, because those categories require legs in
frame.

The rule is implemented in `CATEGORY_POSE_RULES` and checked in both the client
and `generate-tryon`. The web app should keep one shared client rule and one
trusted backend copy. Incompatible templates remain visible, disabled, and
labeled with the reason. Hiding them makes a saved image look lost.

## Authentication behavior

- Production authentication is Google OAuth only.
- Request the narrow Google Drive `drive.file` scope, offline access, and
  explicit consent during sign-in.
- The Drive account must match the Google identity used for the Fitly account.
- Fitly session and Drive connection are separate states. Revoked Drive access
  does not sign the user out.
- Sign-in and sign-up use the same Supabase OAuth operation. Their copy differs,
  but Google either creates or restores the account.
- There is no production email/password flow, confirmation flow, reset flow, or
  Fitly-managed password.
- Both auth screens require two unchecked consents before continuing:
  acceptance of Terms and Privacy Policy, and consent to image processing by
  Fitly's AI partner.
- The profile display name comes from Google's `full_name` metadata through the
  database trigger. The client does not need to write it during registration.
- The mobile app launches authenticated users into Looks. The web app should do
  the same.
- Shared garment or look context must survive an auth redirect.

The mobile repository has a temporary development-only password sign-in for
Expo Go. It is explicitly forbidden from release and is not a web requirement.

## Main route areas for web

```text
public
  /
  /sign-in
  /sign-up
  /auth/callback

authenticated
  /looks
  /looks/[lookId]
  /closet
  /try-on/garment
  /try-on/body
  /try-on/review
  /try-on/generating
  /me
  /settings

either state
  /share or another shared-entry route
```

The URLs are recommendations, not a requirement to mimic Expo Router paths.
Use App Router route groups for public and authenticated layouts.

## Primary try-on flow

The settled order is garment first. The user usually opens Fitly because an item
is in front of them, while their body template is reusable.

```text
Start from Try on or Add garment
  -> capture or upload garment image
  -> choose garment category, with nothing preselected
  -> save normalized garment image to Drive and create the web garment row
  -> choose "Try it on now" or "Just save it"
       "Just save it" -> Closet
       "Try it on now" -> body-source choice
  -> use a saved body template or add a new one
       saved -> template picker
       new -> capture/upload, choose pose, name, preview, save to Drive
  -> review garment and body template together
  -> show compatibility and current daily usage
  -> generate
  -> queued/generating/failed/completed
  -> look detail
```

### Garment acquisition and confirmation

- The user can use a camera or select an image file.
- Capturing an image does not create a row yet.
- Category is required, and no category is preselected.
- The mobile form currently saves `name: "New garment"`. The schema also
  supports optional `brand`, `price`, and `productUrl`.
- The row is created only after category selection. This prevents a permissive
  default such as `top` from bypassing pose compatibility.
- After saving, the user chooses whether to try the garment now or continue
  building the Closet. Saving a garment must not force a generation.

### Body-template acquisition

- The user first chooses between a saved template and a new image.
- If no templates exist, the saved option is disabled with explanatory copy.
- New body-template input includes image, pose, and name.
- Pose defaults to `full` in mobile but remains an explicit visible choice.
- Mobile initially names the template `Full body` or `Upper body`, then allows a
  name edit on preview.
- The first template becomes primary. Later primary-selection behavior is not
  implemented.
- Retaking the image removes the provisional row in mobile. A web form can avoid
  creating the row until the user accepts the preview.
- The web library permits five body templates. Enforce the cap in the database,
  not only in the form. Mobile also has a separate five-template cap.

### Template selection

- Select the first compatible template by default only when a category is known.
- Keep incompatible templates visible and disabled.
- State the reason, for example, "Dress needs a full-body photo."
- Always provide a path to add a new full-body image.
- Choosing a template does not spend quota.

### Review and generation

- Review is the last screen before a metered action.
- Show the garment and body template side by side with their names, category,
  and pose.
- Re-check compatibility because a newly created template may have bypassed the
  picker.
- Show the daily count on the Generate action.
- If the displayed cap is already reached, show the daily-cap state without
  making a request. The Edge Function remains the real enforcement point.
- The current product rule is three generations per UTC calendar day.
- A failed generation does not consume quota.

## Generation and delivery states

The backend uses these states:

```text
queued -> generating -> completed
                    \-> failed
```

`pending` exists in the enum and table default but the current admission
function inserts `queued`, so the live flow does not normally use `pending`.

The web result adds a separate Drive-delivery lifecycle:

```text
pending -> delivering -> delivered
                     \-> failed
```

Generation failure releases the quota reservation. Delivery failure happens
after the model succeeded, so it remains counted and offers Retry saving to
Google Drive without calling Replicate again.

- `queued` is calm, not an error. The current backend always reports position 1
  and an estimate of 25 seconds. That is placeholder queue metadata.
- `generating` is a focused blocking state. Mobile tells users it usually takes
  10 to 25 seconds.
- `completed` opens the look detail.
- `failed` shows the server reason, offers retry, and says whether the attempt
  counted.
- The mobile client polls every 2 seconds and stops waiting after 180 seconds.
  The generation continues on the server after the client stops.

## Looks behavior

- A completed look opens in a full result view.
- Web result actions are favorite or unfavorite, share, retry, delete, and try
  another body.
- Web generated output remains private in Google Drive. The current mobile
  result-storage behavior remains unchanged.
- Every delivered web result appears in Looks automatically. Favorite is a
  filterable preference and does not control file durability.
- Web sharing sends the file with the Web Share API when supported and falls
  back to Download. It does not create a public Drive link.
- Deleting a body template keeps its looks by default. The user may explicitly
  choose to delete the affected looks too.
- Deleting a garment keeps existing looks.

The web app should not copy two fragile mobile shortcuts. "Try again" and "Try
another body" currently depend on an in-memory draft that may be missing after a
reload or deep link. Reconstruct those actions from the look's persisted garment
and template references.

## Closet behavior

- Show all garments or filter by category.
- A populated Closet retains an Add action.
- Selecting a garment starts at body-source because the garment is already
  known.
- A category chip can reopen category selection.
- Deleting a garment requires confirmation and does not delete existing looks.
- Empty Closet explains what belongs there and offers Add garment.
- Product URL import is not built in mobile. Its current quick action routes to
  capture. Treat URL import as deferred unless the web scope changes.

## Me and settings behavior

- Me shows the Google-derived display name when present.
- Me shows daily generations remaining and saved body templates.
- Each template shows name, pose, and `usage_count`.
- The add-template action disables at five web templates. The database rejects
  a sixth template even if a caller bypasses the UI.
- Template deletion shows how many looks would be affected. Keeping those looks
  is the default. Cascade deletion is an explicit checkbox.
- Settings supports sign-out and permanent account deletion.
- Account deletion must remove database rows, generated results, source images,
  stored Google credentials, and the auth account. The Google Drive change makes
  this broader than the existing mobile deletion function.

`usage_count` is displayed but no current code increments it. The web app should
either implement its meaning or omit the count until it is trustworthy.

## Forms and validation inventory

| Flow | Inputs | Required behavior |
|---|---|---|
| Google auth consent | Terms checkbox, Privacy version, AI-processing checkbox | Persist all accepted versions and timestamp after OAuth identifies the account. |
| Garment | Image file or camera capture, category, optional name, brand, price, product URL | Category required. Validate MIME type and size. Do not guess a category. |
| Body template | Image file or camera capture, pose, name | Pose and image required. Name should trim and use a clear fallback. Enforce the template limit at a trusted boundary. |
| Review | One web body-template ID and one web garment ID | IDs must be UUIDs owned by the current user. Compatibility, staging ownership, consent, Drive connection, and quota are trusted checks. |
| Rename template | Name | Trim, reject an empty value or apply the existing name as fallback. |
| Delete template | Template ID, cascade-looks boolean | Show affected look count before confirmation. Default cascade to false. |
| Delete garment | Garment ID | Confirm. Existing looks remain. |
| Delete account | Explicit confirmation | Treat as one-way. Keep the account usable if an early purge step fails so the user can retry. |

## State ownership

- Supabase owns identity, metadata rows, consent, shared quota, and generation state.
- Google Drive owns durable web source images and generated looks.
- Supabase Storage holds web bytes only during generation staging or failed-delivery recovery.
- TanStack Query owns remote client state, mutations, polling, and invalidation.
- Zustand should own only the in-progress try-on draft and small UI state.
- React Hook Form should own form fields.
- Zod should validate browser input and validate it again at every server or Edge
  Function boundary.
- URLs should carry shareable navigation state. Do not put share links only in
  Zustand.

The web is easier to reload accidentally than a native flow. Persist only row
IDs and safe draft metadata in `sessionStorage` if reload recovery is desired.
Do not attempt to serialize raw `File` objects into Zustand persistence. Save the
source image to Drive before advancing past its confirmation step.

## Required UI states

Even though the web mockup already exists, these behaviors must have a design:

- pending, empty, filtered-empty, error, offline, queued, generating, completed
- daily cap reached
- incompatible template
- camera denied or unavailable, with file upload still usable
- Drive permission missing or revoked
- Drive file missing because the user deleted it outside Fitly
- generated successfully but Drive delivery failed
- seven-day recovery copy expired
- destructive confirmations
- OAuth callback in progress and OAuth callback failure

Use semantic HTML, keyboard-accessible dialogs, visible focus, live-region
announcements for meaningful generation changes, and reduced-motion support.
