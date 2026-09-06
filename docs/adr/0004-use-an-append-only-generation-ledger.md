# ADR 0004: Use an append-only generation ledger

- Status: Accepted
- Date: 2026-09-02

## Context

The current admission function counts non-failed result rows and then inserts a result in a separate operation. Parallel requests can exceed the cap. Deleting a successful result also lowers the count and refunds quota.

The web and mobile apps need one daily allowance even though their result tables are separate.

## Decision

Add an append-only `generation_attempts` table shared by both platforms. Each record identifies the user, platform, admitted result, reservation state, and creation time.

A database function performs admission in one transaction. It locks the user's quota scope, counts active or consumed attempts since 00:00 UTC, enforces the profile's daily limit, inserts the attempt, and creates or binds the platform result.

The attempt transitions between reserved, consumed, and released states. AI or provider failure releases the reservation. Successful generation consumes it. Drive delivery failure does not release it because generation succeeded.

Deleting a look removes its image and visible result metadata according to product rules. It does not delete the generation attempt.

## Alternatives considered

- Counting result rows was rejected because results are user-deletable and live in platform-specific tables.
- A count followed by an insert was rejected because it is unsafe under concurrent requests.
- Soft-deleting every result forever was rejected because quota accounting should not control content retention.

## Consequences

- Daily quota is shared across mobile and web without sharing their image libraries.
- Result deletion cannot refund a successful generation.
- Admission and refund behavior become testable independently of result presentation.
- The ledger needs retention and privacy rules, but it must remain immutable to ordinary clients.
