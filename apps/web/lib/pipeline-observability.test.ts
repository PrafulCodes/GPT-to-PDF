import assert from 'node:assert/strict';
import test from 'node:test';
import { createPipelineObserver } from './pipeline-observability';

test('creates a correlation id and records bounded stage lifecycle calls', () => {
  const observer = createPipelineObserver('test-correlation');

  observer.start('chat_page_fetch');
  observer.complete('chat_page_fetch', { attempt: 2, status: 200 });
  observer.start('html_parsing');
  observer.fail('html_parsing', { errorCode: 'EMPTY_CONVERSATION' }, 'warn');

  assert.equal(observer.correlationId, 'test-correlation');
});

test('generates a correlation id when one is not supplied', () => {
  const observer = createPipelineObserver();

  assert.match(observer.correlationId, /^[0-9a-f-]{36}$/);
});

test('stage diagnostics do not log supplied conversation content', () => {
  const originalInfo = console.info;
  const output: unknown[] = [];
  console.info = (value?: unknown) => output.push(value);

  try {
    const observer = createPipelineObserver('privacy-test');
    observer.start('message_extraction');
    observer.complete('message_extraction', {
      extractedMessageCount: 2,
      errorCode: 'NONE'
    });

    const serialized = JSON.stringify(output);
    assert.doesNotMatch(serialized, /conversation secret text/i);
    assert.match(serialized, /privacy-test/);
    assert.match(serialized, /message_extraction/);
  } finally {
    console.info = originalInfo;
  }
});
