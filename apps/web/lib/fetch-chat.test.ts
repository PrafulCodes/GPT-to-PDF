import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import {
  CHAT_PAGE_TOO_LARGE_REASON,
  fetchChatPage,
  MAX_HTML_BYTES,
  readHtmlWithCap
} from './fetch-chat';

const sharedUrl = 'https://chatgpt.com/share/test-share';
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function responseWithBody(body: Uint8Array, headers?: Record<string, string>) {
  return new Response(Buffer.from(body), { status: 200, headers });
}

function chunkedResponse(chunks: Uint8Array[], headers?: Record<string, string>) {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    }
  });
  return new Response(stream, { status: 200, headers });
}

test('accepts a response below the maximum', async () => {
  const result = await readHtmlWithCap(responseWithBody(new TextEncoder().encode('<html>ok</html>')), new AbortController().signal);

  assert.deepEqual(result, { ok: true, html: '<html>ok</html>' });
});

test('accepts a response exactly at the maximum', async () => {
  const body = new Uint8Array(MAX_HTML_BYTES).fill(97);
  const result = await readHtmlWithCap(responseWithBody(body, { 'content-length': String(MAX_HTML_BYTES) }), new AbortController().signal);

  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.html.length, MAX_HTML_BYTES);
});

test('rejects a declared response above the maximum before reading it', async () => {
  const result = await readHtmlWithCap(
    responseWithBody(new Uint8Array(0), { 'content-length': String(MAX_HTML_BYTES + 1) }),
    new AbortController().signal
  );

  assert.deepEqual(result, { ok: false, status: 413, reason: CHAT_PAGE_TOO_LARGE_REASON });
});

test('rejects a streamed response above the maximum', async () => {
  const result = await readHtmlWithCap(
    chunkedResponse([new Uint8Array(MAX_HTML_BYTES - 1), new Uint8Array(2)]),
    new AbortController().signal
  );

  assert.deepEqual(result, { ok: false, status: 413, reason: CHAT_PAGE_TOO_LARGE_REASON });
});

test('handles chunked responses without Content-Length', async () => {
  const result = await readHtmlWithCap(
    chunkedResponse([new TextEncoder().encode('<html>'), new TextEncoder().encode('chunked</html>')]),
    new AbortController().signal
  );

  assert.deepEqual(result, { ok: true, html: '<html>chunked</html>' });
});

test('rejects a misleading Content-Length when received bytes exceed the maximum', async () => {
  const result = await readHtmlWithCap(
    chunkedResponse([new Uint8Array(MAX_HTML_BYTES), new Uint8Array(1)], { 'content-length': '1' }),
    new AbortController().signal
  );

  assert.deepEqual(result, { ok: false, status: 413, reason: CHAT_PAGE_TOO_LARGE_REASON });
});

test('returns upstream fetch failures without disguising them as successful exports', async () => {
  globalThis.fetch = async () => {
    throw new Error('upstream unavailable');
  };

  const result = await fetchChatPage(sharedUrl);

  assert.deepEqual(result, { ok: false, status: 0, reason: 'upstream unavailable' });
});

test('applies the bounded reader to a fetched shared page', async () => {
  globalThis.fetch = async () => responseWithBody(
    new TextEncoder().encode('<html>ok</html>'),
    { 'content-length': '15' }
  );

  const result = await fetchChatPage(sharedUrl);

  assert.deepEqual(result, { ok: true, html: '<html>ok</html>' });
});
