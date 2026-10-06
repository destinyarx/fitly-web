# ADR 0005: Separate the look client and server APIs

- Status: Accepted
- Date: 2026-10-06

The Looks feature now shares status polling with the try-on feature. Re-exporting
server-only queries from the same module consumed by a Client Component makes
Next.js include server-only imports in the client graph and fail the build.

Keep `features/looks/index.ts` as the browser-safe public API for status hooks,
domain types, predicates, and interactive components. Server routes load initial
owned data through the explicit `features/looks/server.ts` public entry point.
The latter imports `server-only`. Neither API requires callers to deep-import
private services.

Status polling treats generation and delivery as separate stages. A look settles
on generation failure, or on completed generation with delivered or failed
delivery. AI completion alone does not settle the workflow. Direct visits to a
pending detail page refresh the server composition when either state changes.
