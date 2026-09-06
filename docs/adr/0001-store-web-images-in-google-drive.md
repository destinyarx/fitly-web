# ADR 0001: Store web images in Google Drive

- Status: Accepted
- Date: 2026-09-02

## Context

Fitly web needs durable storage for body templates, garment images, and generated looks. The mobile app keeps source images on the device and currently keeps generated results in Supabase Storage. The web product must keep its image library separate from mobile and place its files under the user's control.

Supabase Google authentication proves the Fitly identity, but Supabase does not retain or refresh Google provider tokens for Drive API use.

## Decision

Fitly web stores all durable source images and generated looks in a visible `Fitly` folder in the same Google account used for Supabase sign-in.

The folder layout is:

~~~text
Fitly/
  Body Templates/
  Garments/
  Generated Looks/
~~~

Fitly requests the narrow `drive.file` scope, offline access, and explicit consent during Google sign-in. It stores opaque folder and file IDs rather than public URLs or mutable names.

A trusted Next.js Node.js Route Handler normalizes and uploads source images. The generation worker uploads completed web results directly to Drive. Supabase Storage may contain web bytes only during generation staging or failed-delivery recovery.

Google refresh tokens live in Supabase Vault. A service-only connection record maps the Supabase user to the Vault secret and Drive folder IDs. The Drive account identifier must match the Google identity used for Fitly login.

## Alternatives considered

- Durable private Supabase Storage was rejected because the web product requires the user's Google Drive to own its images.
- Google's hidden `appDataFolder` was rejected because the user should be able to see and control Fitly files.
- Broad full-Drive scopes were rejected because Fitly only needs files it creates.
- Browser-held refresh tokens were rejected because browser storage is not an acceptable place for a long-lived Drive grant.

## Consequences

- Login and Drive connection are separate states even though one consent flow requests both.
- Private images render through authenticated responses. Fitly does not create public Drive links.
- Sharing sends or downloads the file through browser capabilities.
- A revoked Drive grant blocks image-dependent actions but does not sign the user out.
- Account deletion removes tracked app-created files. It never recursively deletes a folder by name or removes unrelated user files.
- If Drive access is unavailable during account deletion, the user may reconnect for full cleanup or explicitly continue while leaving Drive files under their control.
