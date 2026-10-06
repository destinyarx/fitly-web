import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseQuotaRow, quotaReachedSchema } from '../src/features/try-on/quota.schema';

const resetsAt = '2026-10-07T00:00:00+00:00';

test('quota blocks a fourth try-on and ignores profile limits above three', () => {
  assert.deepEqual(parseQuotaRow({ used_today: 3, daily_limit: 999, resets_at: resetsAt }), { used: 3, limit: 3, remaining: 0, resetsAt });
  assert.equal(parseQuotaRow({ used_today: 2, daily_limit: 3, resets_at: resetsAt }).remaining, 1);
});

test('missing or malformed quota cannot become zero usage', () => {
  for (const value of [null, undefined, {}, { used_today: -1, daily_limit: 3, resets_at: resetsAt }]) {
    assert.throws(() => parseQuotaRow(value));
  }
});

test('structured quota rejection is understood and rejects malformed responses', () => {
  const quota = parseQuotaRow({ used_today: 3, daily_limit: 3, resets_at: resetsAt });
  assert.equal(quotaReachedSchema.safeParse({ error: 'daily_cap_reached', quota }).success, true);
  assert.equal(quotaReachedSchema.safeParse({ error: 'daily_cap_reached' }).success, false);
});
