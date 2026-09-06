# Fitly web domain language

Use these terms in web code, copy, schemas, issues, and tests.

## Identity and authorization

**Account**:
The user's Google-authenticated identity in Supabase Auth.
_Avoid_: Drive account, profile

**Profile**:
Shared Fitly account data such as display name and plan limits.
_Avoid_: account, user record

**Fitly session**:
The authenticated Supabase session for an Account.
_Avoid_: Drive session

**Drive connection**:
The separately revocable authorization that lets Fitly manage its app-created
files in the Account's matching Google Drive.
_Avoid_: login, session

**Consent record**:
An append-only record of the Terms, Privacy Policy, and AI-processing versions
accepted by an Account.
_Avoid_: checkbox state

## Try-on sources

**Body template**:
A named photo of the user with a full-body or half-body pose classification.
_Avoid_: model, avatar, selfie

**Pose**:
The visible body coverage of a Body template, either `full` or `half`.
_Avoid_: crop, template type

**Garment**:
A clothing item supplied for try-on.
_Avoid_: product when no retailer product record exists

**Category**:
The Garment compatibility class: `top`, `bottom`, `dress`,
`outerwear`, `shoes`, or `accessory`.
_Avoid_: type

**Source image**:
The original body-template or garment image supplied by the user.
_Avoid_: upload after the file has already been saved

**Acquisition source**:
How a Garment entered Fitly: `camera`, `upload`, `url`, or
`catalogue`.
_Avoid_: storage provider

**Client platform**:
The application that owns an image library or result, either `mobile` or
`web`.
_Avoid_: source, device type

## Generation

**Draft**:
The temporary selection of one Body template and one Garment before admission.
_Avoid_: pending result

**Staging attempt**:
One immutable set of temporary Supabase source objects prepared for a web
generation request.
_Avoid_: upload, draft

**Generation attempt**:
The append-only shared quota event created when the backend admits a request.
_Avoid_: Look, result row

**Generation**:
The AI work that produces image bytes from a Body template and Garment.
_Avoid_: delivery

**Delivery**:
Saving successfully generated web image bytes to the user's Google Drive.
_Avoid_: generation

**Look**:
A delivered generated try-on result shown in the web product.
_Avoid_: generation attempt, output file

**Favorite**:
A user-controlled marker on a Look.
_Avoid_: saved, when referring to file durability

**Quota**:
The shared daily number of admitted mobile and web Generation attempts.
_Avoid_: credit unless a paid credit system exists

**Recovery copy**:
A private, temporary Supabase copy of completed image bytes retained only when
web Drive delivery fails.
_Avoid_: saved Look, backup

## Product voice

**Companion**:
Fitly's first-person assistant voice, used only in its distinct companion UI.
_Avoid_: system message, toast
