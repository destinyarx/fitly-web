import assert from 'node:assert/strict';
import { test } from 'node:test';

// Integration tests run against an already-running local Fitly server.
const origin = process.env.FITLY_TEST_ORIGIN ?? 'http://localhost:3000';

for (const [query, expectedError] of [
  ['error=access_denied', 'access_denied'],
  ['error=invalid_request&error_code=bad_oauth_callback', 'oauth_failed'],
  ['error=untrusted&error_description=do-not-render-this', 'oauth_failed'],
  ['', 'missing_code'],
  ['code=untrusted-without-consent-cookie', 'missing_code'],
] as const) {
  test(`OAuth callback ${query || 'without parameters'}`, async () => {
    const response = await fetch(`${origin}/auth/callback?${query}`, {
      redirect: 'manual',
    });
    assert.equal(response.status, 307);
    assert.equal(
      response.headers.get('location'),
      `${origin}/sign-in?error=${expectedError}`,
    );
  });
}
