<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Fitly web agent guidelines

Read this file before creating, changing, reviewing, or deleting code. These rules adapt the Fitly mobile architecture to the Next.js web app. Do not copy Expo or React Native patterns into this repository.

## 1. Read the project docs first

Before implementation, read:

- `CONTEXT.md` for product scope, domain terms, business rules, current status, and settled decisions.
- `DESIGN.md` for visual tokens, responsive behavior, interaction rules, loading states, and accessibility.
- Relevant ADRs in `docs/adr/` when they exist.
- Relevant issue or specification files under `.scratch/` when the task references them.
- Relevant Next.js 16 documentation in `node_modules/next/dist/docs/` before using framework APIs.

Update `CONTEXT.md` when product behavior, modules, domain language, architecture, or business rules change. Update `DESIGN.md` when visual tokens, shared components, responsive behavior, or interaction patterns change. Record durable technical decisions as ADRs rather than burying them in code comments.

## Frontend reference implementation

When building or modifying the frontend or UI, first inspect the reference mockup at:

`C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\Fitly\design mockup\Fitly Web.html`

Treat this mockup as the visual and UX target. Reproduce its layout, visual hierarchy, spacing, typography, colors, component states, responsive behavior, and interactions as closely as practical. Implement the result as reusable React components in `.tsx` files. Do not copy the mockup into the application as a standalone HTML page, iframe, or monolithic component.

All frontend implementation must use TypeScript and comply with every architecture, naming, accessibility, security, and verification rule in this file. Keep strict TypeScript enabled and do not introduce JavaScript source files. If the mockup conflicts with `DESIGN.md`, accessibility requirements, responsive behavior, application functionality, or another rule in this file, preserve the mockup's design intent while following the documented project rule. Update `DESIGN.md` when the implementation establishes or changes a shared visual or interaction pattern.

Before declaring UI work complete, compare the running implementation with the reference mockup at both narrow and desktop widths. Check the main layout, spacing, typography, colors, controls, states, and interactions, and correct material visual differences.

## 2. Product and security model

Fitly is an AI-powered virtual try-on product. In the first web release, a user supplies one body template and one garment image, then receives a generated preview of that garment on their body.

The browser must never call the AI provider directly. The trusted flow is:

```text
Browser
  -> Supabase Google OAuth session with Drive access
  -> trusted Next.js source-image boundary
  -> user's visible Fitly folder in Google Drive

Generation
  -> trusted Next.js Drive-to-Supabase staging boundary
  -> generate-tryon admission Edge Function
  -> internal run-generation worker
  -> Replicate
  -> user's Google Drive for the generated look
  -> web app observes the web result row
```

Web body images, garment images, and generated looks are private files in the user's Google Drive. Supabase Storage may hold web source or result bytes only as temporary processing or failed-delivery storage. Enforce database ownership with RLS, Storage ownership with bucket policies, and Drive ownership at every trusted server boundary. A hidden button, protected layout, or client-side check is not authorization.

## 3. Required stack

- Next.js 16 App Router and React 19
- TypeScript in strict mode
- Tailwind CSS 4
- Supabase Auth, Postgres, Storage, Realtime when needed, and Edge Functions
- `@supabase/ssr` for cookie-based browser and server clients
- TanStack Query for client-side server state
- Zustand for small client-only workflow and UI state
- Zod for validation at trust boundaries
- React Hook Form for interactive client forms

Use the platform and existing stack before adding another dependency. Do not add a competing state, form, validation, routing, auth, or data-fetching library without user approval.

## 4. Repository structure

Use feature-based organization while respecting App Router conventions:

```text
src/
├── app/                         Next.js routes, layouts, loading/error files, and route handlers
│   ├── (auth)/                  Route groups may organize layouts without changing URLs
│   ├── (app)/
│   └── api/                     Route handlers only when an HTTP endpoint is required
├── features/
│   ├── auth/
│   ├── drive/
│   ├── looks/
│   ├── closet/
│   ├── try-on/
│   └── profile/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── stores/
│       ├── profile.types.ts
│       ├── profile.schema.ts
│       ├── profile.keys.ts
│       ├── profile.constants.ts
│       └── index.ts
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   └── constants/
├── lib/
│   └── supabase/                Shared browser and server client factories
├── providers/                   Client providers mounted by a server layout
└── config/                      Typed application configuration
```

The `src/app/` tree owns URLs and framework files. Keep `page.tsx` and `layout.tsx` focused on routing, data loading, metadata, and composition. Business logic belongs in `features/`, not in route files.

Not every feature needs every folder or file. Create a folder only when it has real content. Do not build empty architecture for hypothetical work.

## 5. Feature boundaries

Each feature owns its components, hooks, services, client stores, types, schemas, query keys, constants, and utilities.

- Other features import through the owning feature's `index.ts` public API.
- Do not deep-import another feature's private files.
- Shared code must be domain-neutral and used by more than one feature. Otherwise keep it in the feature.
- Avoid catch-all files such as `helpers.ts`, `common.ts`, or `types.ts` at the project root.
- Prefer one clear source for each business rule. For example, the body-template compatibility rule must not be reimplemented in several components.

## 6. Next.js and React rules

- Use Server Components by default.
- Add `'use client'` only to the smallest component that needs browser APIs, event handlers, React client hooks, Zustand, React Hook Form, or TanStack Query.
- Do not turn an entire page or layout into a Client Component to support one interactive child.
- Fetch initial data in Server Components when the data is needed to render the route and does not require client polling or realtime behavior.
- Use `loading.tsx`, Suspense, `error.tsx`, and `not-found.tsx` where the route needs those states.
- Use `next/link`, `next/image`, the Metadata API, and App Router navigation APIs.
- Treat `params`, `searchParams`, `cookies()`, and `headers()` according to the installed Next.js documentation. Do not rely on old synchronous examples.
- Use Server Actions for form-driven mutations when they fit. Validate, authenticate, and authorize inside every action.
- Use Route Handlers when another client needs an HTTP contract, for webhooks, callbacks, uploads, or when a Server Action is the wrong boundary. Treat every handler as a public endpoint.
- Keep secrets and server-only modules out of the client module graph. Never pass an entire session or secret-bearing object into a Client Component.
- Make caching explicit. Do not cache user-specific responses in a shared cache. Revalidate affected paths or tags after successful mutations when server-rendered data must update.

## 7. Data ownership and state

Use the state owner that matches the data:

| State | Owner |
|---|---|
| Server-rendered route data | Server Component or server service |
| Client cache, polling, optimistic mutations, realtime-backed lists | TanStack Query |
| Temporary multi-step try-on draft and local UI state | Feature-scoped Zustand store |
| Form field state | React Hook Form |
| Shareable navigation state | URL path or search parameters |
| Auth identity, metadata, consent, quota, and generation state | Supabase |
| Durable web source images and generated looks | User's Google Drive |

Do not copy server data into Zustand. Do not use Zustand as an auth database or persistence layer. Do not add TanStack Query around a server fetch that has no client-side lifecycle.

## 8. TanStack Query

- Put query options, mutations, and hooks in the owning feature.
- Define feature-scoped key factories in `<feature>.keys.ts`.
- Query functions call services. Components do not build Supabase queries inline.
- Query functions return typed domain data or throw typed errors. Do not return raw `{ data, error }` pairs to UI code.
- Mutations invalidate or update every affected query deliberately.
- Use optimistic updates only when rollback behavior is clear and tested.
- Handle pending, empty, error, success, and retry states in the UI.
- Set stale time, retry behavior, and polling intervals from product needs rather than copying defaults blindly.

## 9. Zustand

- Use small feature stores for synchronous client workflow state such as an in-progress try-on draft.
- Keep actions beside the state they modify.
- Use selectors so components subscribe only to required slices.
- Never store Supabase clients, query results, access tokens, or server secrets.
- Persist only when the product requires reload recovery. Version and validate persisted data when it crosses a trust boundary.

## 10. Forms and validation

- Define Zod schemas in the owning feature and infer TypeScript types from them.
- React Hook Form owns interactive form state. Use `zodResolver` for client feedback.
- Validate the same untrusted input again at the server boundary. Client validation is a usability feature, not security.
- Normalize empty strings, optional values, numbers, dates, and file metadata in the schema.
- Keep submission and Supabase mutation logic outside presentational form fields.
- Map server errors to field errors when possible and show a useful form-level fallback otherwise.

## 11. Supabase

The shared Supabase project is located at:

`C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\Fitly\supabase-side-projects`

That repository owns database migrations and Edge Functions. The existing mobile tables and request contract must remain backward compatible. Prepare required migration and function files there, but do not apply migrations or deploy functions unless the user explicitly requests that exact remote operation.

- Use the shared factories under `src/lib/supabase/`. Do not instantiate ad hoc clients in features.
- Use the browser client only in Client Components or browser-only services.
- Create a fresh server client per request using the cookie store.
- Use the publishable key in browser-safe configuration. Never expose a secret key, legacy service-role key, or AI provider key through a `NEXT_PUBLIC_` variable.
- On the server, verify the user and enforce authorization close to every data access. Proxy-based session refresh is not the final authorization check.
- Keep table and Storage access in feature services. Return domain types rather than leaking generated database types across the UI.
- Enable RLS on every user-owned table and write Storage policies for every private bucket.
- Users may access only their own body templates, garments, generated looks, and account data.
- Keep web-specific source and result metadata in the web tables defined by the accepted ADRs. Do not put web rows in the unchanged mobile content tables.
- Use private Supabase buckets only for temporary web generation staging, failed Drive-delivery recovery, and the mobile behavior already owned by the shared backend. Every temporary object needs an owner, deterministic cleanup, and no public URL.
- Handle every Supabase error. Do not use silent fallbacks that can hide lost writes or authorization failures.
- Put privileged administration and AI calls in trusted server code or Supabase Edge Functions. Keep them out of Server Components that might accidentally expose results.

## 12. Google Drive

- Google OAuth is the only production sign-in method. Request `drive.file`, offline access, and explicit consent during sign-in.
- The Drive identity must match the Google identity used for the Supabase account.
- Supabase login and Drive connection are separate states. Keep the user signed in when Drive needs reconnection, and block only image-dependent actions.
- Web source uploads run through a trusted Next.js Node.js Route Handler. Do not add an Edge Function that uploads source images.
- Store durable web files in the visible `Fitly/Body Templates`, `Fitly/Garments`, and `Fitly/Generated Looks` folders. Persist folder and file IDs; never depend on folder names after creation.
- Store Google refresh tokens in Supabase Vault behind service-only database functions. Tokens must not enter local storage, Zustand, TanStack Query, rendered props, client-readable rows, or logs.
- Store opaque Drive file IDs, not public links. Serve private previews through authenticated, non-shared responses with explicit cache policy.
- Delete only tracked app-created Drive files. Never recursively delete a folder by name or delete unrelated files a user placed inside it.
- If account deletion cannot access Drive, offer reconnection or explicit continuation that leaves Drive files under the user's control.

## 13. AI generation

The client may save source images through the trusted Next.js boundary, request a generation, observe its status, cancel local polling, and display the result. It must not receive the provider API key, Google refresh token, Supabase secret key, or a privileged provider request.

The web client calls only `generate-tryon`. The request includes `clientPlatform: 'web'` and a generation-specific `stagingAttemptId`. The existing mobile request without those fields remains valid and defaults to mobile behavior.

`generate-tryon` must:

1. Authenticate the caller.
2. Authorize ownership of every body template and garment.
3. Validate input with a schema.
4. Re-check compatibility and quota rules server-side.
5. Reserve shared daily quota atomically in the append-only generation ledger.
6. Bind immutable web staging records to the new result.
7. Invoke `run-generation` with a service-only credential.
8. Return HTTP 202 and the result ID.

`run-generation` must preserve its current mobile branch. Its web branch reads result-specific private staging, calls Replicate, uploads the generated look directly to the user's Drive through the stored grant, updates generation and delivery state separately, and purges staging.

If generation succeeds but Drive delivery fails, keep a temporary private recovery copy for seven days and offer delivery retry without rerunning Replicate. This attempt remains counted. AI or provider failure releases the quota reservation. Deleting a result never deletes its append-only quota event.

A failed generation must not consume quota unless the documented business rule changes.

## 14. TypeScript and naming

- Keep `strict` enabled. Do not use `any`.
- Use `unknown` for untrusted data, then narrow or validate it.
- Prefer discriminated unions and precise domain types over loose strings.
- Avoid type assertions. An assertion does not validate runtime data.
- Use `import type` for type-only imports.
- Use named exports in features and shared modules. Next.js route files may use the framework-required default export.
- Use `kebab-case` for files and folders, `PascalCase` for components and types, `camelCase` for variables and functions, `UPPER_SNAKE_CASE` for constants, and `use` prefixes for hooks.
- Name booleans as questions such as `isGenerating`, `hasResult`, and `canRetry`.
- Import order is external packages, absolute `@/` imports, then relative imports.

## 15. UI and accessibility

- Follow `DESIGN.md`; do not invent a parallel token set in a component.
- Use semantic HTML before adding ARIA.
- Every control must have an accessible name, keyboard behavior, visible focus, and adequate target size.
- Do not encode meaning with color alone.
- Respect reduced motion and avoid animation that blocks input.
- Design responsive layouts for narrow phones, tablets, laptops, and wide screens. Do not stretch mobile cards across a desktop viewport.
- Provide explicit pending, empty, error, offline, queued, completed, and destructive-confirmation states where the flow can reach them.
- Provide explicit Drive reconnect, source missing, delivery failed, delivery retry, and expired recovery states.
- Label retailer URL extraction as `Coming soon`; do not route it to camera or upload as if extraction worked.

## 16. Verification and completion

Before claiming completion:

1. Run `bun run lint`.
2. Run `bun run typecheck`.
3. Run relevant tests when they exist.
4. Run `bun run build` for routing, server/client boundary, environment, or configuration changes.
5. Check the changed flow at narrow and desktop widths for UI work.
6. Confirm sensitive data and secrets are absent from logs, rendered props, and client bundles.
7. Update `CONTEXT.md`, `DESIGN.md`, and relevant ADRs when behavior or decisions changed.
8. Run two-account ownership and cache-isolation checks for user-owned data.
9. Verify Drive refresh, revocation, account mismatch, missing files, and tracked-file deletion.
10. Verify parallel requests cannot exceed shared daily quota and deleting a look does not refund it.
11. Verify existing mobile generation requests still work without `clientPlatform` or `stagingAttemptId`.
12. Verify web staging is result-specific and is purged after success, failure, or admission rejection.

Do not report a command as passing unless you ran it. If verification is blocked by missing credentials or external services, state exactly what remains unverified.

## 17. Remote operations and publishing

The user reviews and publishes changes. Agents do not run `git push`, create or merge pull requests, publish releases, apply remote database migrations, deploy Supabase Edge Functions, or mutate production configuration unless the user explicitly requests that exact operation. Local implementation and verification are allowed. Give the user the required migration and deployment commands when remote work remains.
