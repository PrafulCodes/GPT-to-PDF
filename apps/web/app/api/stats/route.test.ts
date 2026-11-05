import assert from 'node:assert/strict';
import test from 'node:test';
import { withTimeout } from '../../../lib/with-timeout';

test('stats timeout resolves safely without exposing database errors', async () => {
  const result = await withTimeout(
    new Promise<number>((resolve) => setTimeout(() => resolve(1), 25)),
    1
  );

  assert.equal(result, null);
});

test('stats timeout preserves successful results', async () => {
  const result = await withTimeout(Promise.resolve({ pdfGeneratedCount: 2 }), 100);

  assert.deepEqual(result, { pdfGeneratedCount: 2 });
});
