import assert from 'node:assert/strict';
import test from 'node:test';
import {
  classifyChatPage,
  parseChatHtmlDetailed,
  PARSER_VERSION
} from './parse-chat';

test('extracts ordered messages from the supported DOM format', () => {
  const html = `
    <html><head><title>DOM fixture</title></head><body>
      <main>
        <div data-testid="conversation-turn" data-message-author-role="user">
          <div data-message-content><p>Question</p><pre><code>const x = 1;</code></pre></div>
        </div>
        <div data-testid="conversation-turn" data-message-author-role="assistant">
          <div data-message-content><p>Answer</p><table><tr><td>Value</td></tr></table></div>
        </div>
      </main>
    </body></html>`;

  const result = parseChatHtmlDetailed(html);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.classification, 'VALID_CONVERSATION');
  assert.equal(result.diagnostics.successfulStrategy, 'dom');
  assert.equal(result.diagnostics.domCandidateCount, 2);
  assert.deepEqual(result.conversation.messages.map((message) => message.role), ['user', 'assistant']);
  assert.match(result.conversation.messages[0].html, /<pre>/);
  assert.match(result.conversation.messages[1].html, /<table>/);
});

test('does not duplicate nested message candidates', () => {
  const html = `
    <div data-message-author-role="user">
      <div data-testid="conversation-turn">
        <div data-message-content>Only once</div>
      </div>
    </div>`;

  const result = parseChatHtmlDetailed(html);

  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.conversation.messages.length, 1);
});

test('extracts supported hydration messages arrays', () => {
  const table = [
    { title: 'Hydration fixture', messages: 1 },
    [2, 3],
    { role: 'user', content: { parts: [4] } },
    { role: 'assistant', content: { parts: [5] } },
    'Hydrated question',
    { text: 'Hydrated answer' }
  ];
  const html = `<script>streamController.enqueue(${JSON.stringify(JSON.stringify(table))})</script>`;

  const result = parseChatHtmlDetailed(html);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.diagnostics.successfulStrategy, 'structured_hydration');
  assert.equal(result.diagnostics.structuredNodeFound, true);
  assert.deepEqual(result.conversation.messages.map((message) => message.role), ['user', 'assistant']);
  assert.match(result.conversation.messages[0].html, /Hydrated question/);
  assert.match(result.conversation.messages[1].html, /Hydrated answer/);
});

test('classifies authentication pages using page structure, not conversation text', () => {
  const login = '<html><head><title>ChatGPT</title></head><body><form action="/login"><input type="password"></form></body></html>';
  const conversationMentioningLogin = '<div data-message-author-role="user"><div data-message-content>Use the login form</div></div>';

  assert.equal(classifyChatPage(login), 'AUTH_REQUIRED');
  assert.equal(classifyChatPage(conversationMentioningLogin), 'UNSUPPORTED_FORMAT');
});

test('classifies upstream status separately from HTML parsing', () => {
  assert.equal(classifyChatPage('<html><body>Unavailable</body></html>', { upstreamStatus: 503 }), 'UPSTREAM_ERROR_PAGE');
  assert.equal(classifyChatPage('<html><body>Missing</body></html>', { upstreamStatus: 404 }), 'EXPIRED_OR_UNAVAILABLE');
});

test('classifies challenge pages and empty pages safely', () => {
  assert.equal(classifyChatPage('<div data-sitekey="fixture"></div>'), 'CAPTCHA_OR_CHALLENGE');
  assert.equal(classifyChatPage('<html><body></body></html>'), 'EMPTY_CONVERSATION');

  const result = parseChatHtmlDetailed('<html><body></body></html>');
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.classification, 'EMPTY_CONVERSATION');
    assert.equal(result.diagnostics.parserVersion, PARSER_VERSION);
    assert.equal(result.diagnostics.extractedMessageCount, 0);
  }
});

test('keeps unknown roles as diagnostics instead of inventing alternation', () => {
  const result = parseChatHtmlDetailed('<div data-testid="conversation-turn"><div data-message-content>Unlabeled content</div></div>');

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.conversation.messages[0].role, 'unknown');
    assert.equal(result.diagnostics.unsupportedRoleCount, 1);
    assert.equal(result.warnings.length, 1);
  }
});

test('rejects malformed hydration without throwing', () => {
  const result = parseChatHtmlDetailed('<script>streamController.enqueue("not-json")</script>');

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.classification, 'UNSUPPORTED_FORMAT');
    assert.equal(result.diagnostics.failureClassification, 'UNSUPPORTED_FORMAT');
  }
});

test('extracts messages from __WEB_MOBILE_DATA__ script format', () => {
  const mobileData = {
    title: 'Mobile Shell Chat',
    conversationState: {
      messages: [
        { role: 'user', content: 'Hello from mobile web' },
        { role: 'assistant', content: 'Hello! How can I assist you today?' }
      ]
    }
  };
  const html = `<html><head><title>Mobile Shell Chat</title></head><body>
    <script id="__WEB_MOBILE_DATA__" type="application/json">${JSON.stringify(mobileData)}</script>
  </body></html>`;

  const result = parseChatHtmlDetailed(html);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.classification, 'VALID_CONVERSATION');
  assert.equal(result.diagnostics.successfulStrategy, 'embedded_json');
  assert.equal(result.conversation.title, 'Mobile Shell Chat');
  assert.equal(result.conversation.messages.length, 2);
  assert.equal(result.conversation.messages[0].role, 'user');
  assert.match(result.conversation.messages[0].html, /Hello from mobile web/);
  assert.equal(result.conversation.messages[1].role, 'assistant');
});

test('extracts messages from direct JSON conversation payload', () => {
  const jsonPayload = JSON.stringify({
    title: 'Direct API Chat',
    linear_conversation: [
      {
        id: 'msg-1',
        message: {
          author: { role: 'user' },
          content: { parts: ['Direct message question'] }
        }
      },
      {
        id: 'msg-2',
        message: {
          author: { role: 'assistant' },
          content: { parts: ['Direct message answer'] }
        }
      }
    ]
  });

  const result = parseChatHtmlDetailed(jsonPayload);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.classification, 'VALID_CONVERSATION');
  assert.equal(result.diagnostics.successfulStrategy, 'embedded_json');
  assert.equal(result.conversation.title, 'Direct API Chat');
  assert.equal(result.conversation.messages.length, 2);
  assert.match(result.conversation.messages[0].html, /Direct message question/);
  assert.match(result.conversation.messages[1].html, /Direct message answer/);
});
