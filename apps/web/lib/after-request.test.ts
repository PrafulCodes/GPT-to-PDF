import assert from 'node:assert/strict';
import test from 'node:test';
import { runBackgroundTask } from './after-request';

test('background task failures are isolated from the caller', async () => {
  await assert.doesNotReject(() => runBackgroundTask(async () => {
    throw new Error('analytics unavailable');
  }, 'test_analytics'));
});

test('successful background tasks run exactly once', async () => {
  let executions = 0;
  await runBackgroundTask(async () => {
    executions += 1;
  }, 'test_analytics');

  assert.equal(executions, 1);
});
