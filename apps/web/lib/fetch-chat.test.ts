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

  const result = await fetchChatPage(sharedUrl, 1000, { sleep: async () => {} });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.category, 'NETWORK_ERROR');
    assert.equal(result.attempt, 3);
    assert.equal(result.retriesExhausted, true);
  }
});

test('applies the bounded reader to a fetched shared page', async () => {
  globalThis.fetch = async () => responseWithBody(
    new TextEncoder().encode('<html>ok</html>'),
    { 'content-length': '15' }
  );

  const result = await fetchChatPage(sharedUrl);

  assert.deepEqual(result, {
    ok: true,
    html: '<html>ok</html>',
    status: 200,
    contentType: null,
    finalUrl: sharedUrl,
    bytes: 15,
    attempts: 1
  });
});

test('retries HTTP 503 and succeeds', async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return calls === 1 ? new Response(null, { status: 503 }) : responseWithBody(new TextEncoder().encode('<html>ok</html>'));
  };

  const result = await fetchChatPage(sharedUrl, 1000, { sleep: async () => {}, random: () => 0 });

  assert.equal(result.ok, true);
  assert.equal(calls, 2);
});

test('retries HTTP 502 and succeeds', async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return calls === 1 ? new Response(null, { status: 502 }) : responseWithBody(new TextEncoder().encode('<html>ok</html>'));
  };

  const result = await fetchChatPage(sharedUrl, 1000, { sleep: async () => {}, random: () => 0 });

  assert.equal(result.ok, true);
  assert.equal(calls, 2);
});

test('retries HTTP 429 using a bounded Retry-After delay', async () => {
  let calls = 0;
  const delays: number[] = [];
  globalThis.fetch = async () => {
    calls += 1;
    return calls === 1
      ? new Response(null, { status: 429, headers: { 'retry-after': '1' } })
      : responseWithBody(new TextEncoder().encode('<html>ok</html>'));
  };

  const result = await fetchChatPage(sharedUrl, 2000, {
    sleep: async (delay) => { delays.push(delay); },
    random: () => 0
  });

  assert.equal(result.ok, true);
  assert.deepEqual(delays, [1000]);
  assert.equal(calls, 2);
});

test('exhausts retries for repeated transient responses', async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(null, { status: 503 });
  };

  const result = await fetchChatPage(sharedUrl, 1000, { sleep: async () => {}, random: () => 0 });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.category, 'UPSTREAM_UNAVAILABLE');
    assert.equal(result.attempt, 3);
    assert.equal(result.retriesExhausted, true);
  }
  assert.equal(calls, 3);
});

test('does not retry permanent access and not-found failures', async () => {
  for (const status of [403, 404]) {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return new Response(null, { status });
    };

    const result = await fetchChatPage(sharedUrl, 1000, { sleep: async () => {} });

    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.category, status === 403 ? 'ACCESS_DENIED' : 'RESOURCE_NOT_FOUND');
    assert.equal(calls, 1);
  }
});

test('retries a network failure and succeeds', async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    if (calls === 1) throw new Error('ECONNRESET');
    return responseWithBody(new TextEncoder().encode('<html>ok</html>'));
  };

  const result = await fetchChatPage(sharedUrl, 1000, { sleep: async () => {}, random: () => 0 });

  assert.equal(result.ok, true);
  assert.equal(calls, 2);
});

test('retries an aborted attempt and succeeds before the deadline', async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    if (calls === 1) throw Object.assign(new Error('timed out'), { name: 'AbortError' });
    return responseWithBody(new TextEncoder().encode('<html>ok</html>'));
  };

  const result = await fetchChatPage(sharedUrl, 1000, { sleep: async () => {}, random: () => 0 });

  assert.equal(result.ok, true);
  assert.equal(calls, 2);
});

test('does not start a retry after the overall deadline', async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(null, { status: 503 });
  };

  const result = await fetchChatPage(sharedUrl, 1, { sleep: async () => {} });

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.category, 'UPSTREAM_TIMEOUT');
  assert.equal(calls, 1);
});

test('stops immediately when the caller has cancelled the request', async () => {
  const controller = new AbortController();
  controller.abort();
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return responseWithBody(new TextEncoder().encode('<html>ok</html>'));
  };

  const result = await fetchChatPage(sharedUrl, 1000, { signal: controller.signal, sleep: async () => {} });

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, 'Fetch cancelled');
  assert.equal(calls, 0);
});

test('follows safe redirects', async () => {
  const requested: string[] = [];
  globalThis.fetch = async (input) => {
    requested.push(String(input));
    return requested.length === 1
      ? new Response(null, { status: 302, headers: { location: 'https://chatgpt.com/share/redirected' } })
      : responseWithBody(new TextEncoder().encode('<html>ok</html>'));
  };

  const result = await fetchChatPage(sharedUrl, 1000, { sleep: async () => {} });

  assert.equal(result.ok, true);
  assert.deepEqual(requested, [sharedUrl, 'https://chatgpt.com/share/redirected']);
});

test('rejects unsafe redirects without retrying', async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/admin' } });
  };

  const result = await fetchChatPage(sharedUrl, 1000, { sleep: async () => {} });

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.category, 'REDIRECT_ERROR');
  assert.equal(calls, 1);
});

test('stops redirect loops at the redirect limit', async () => {
  let calls = 0;
  globalThis.fetch = async (input) => {
    calls += 1;
    return new Response(null, {
      status: 302,
      headers: { location: String(input) }
    });
  };

  const result = await fetchChatPage(sharedUrl, 1000, { sleep: async () => {} });

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.category, 'REDIRECT_ERROR');
  assert.equal(calls, 1);
});

test('classifies empty successful responses as invalid responses', async () => {
  globalThis.fetch = async () => responseWithBody(new TextEncoder().encode('   '));

  const result = await fetchChatPage(sharedUrl, 1000, { sleep: async () => {} });

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.category, 'INVALID_RESPONSE');
});
