import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isLookSettled } from '../src/features/looks/look-status.schema';

test('generation completion does not stop polling while Drive delivery is pending', () => {
  for (const delivery_status of ['pending', 'delivering'] as const) {
    assert.equal(isLookSettled({ generation_status: 'completed', delivery_status }), false);
  }
});

test('polling settles on delivery success, recovery failure or generation failure', () => {
  assert.equal(isLookSettled({ generation_status: 'completed', delivery_status: 'delivered' }), true);
  assert.equal(isLookSettled({ generation_status: 'completed', delivery_status: 'failed' }), true);
  assert.equal(isLookSettled({ generation_status: 'failed', delivery_status: 'pending' }), true);
  assert.equal(isLookSettled({ generation_status: 'generating', delivery_status: 'pending' }), false);
});
