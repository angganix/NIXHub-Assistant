import { normalizeProviderError } from './errors';
import { parseSSE } from './sse';
import { validateProviderConfig, validateCustomHeaders, redactSecrets } from '../security/provider-config';
import { validateChatRequest } from './types';
import { createOpenAIAdapter } from './custom/openai';
import { createAnthropicAdapter } from './custom/anthropic';
import { createProviderRegistry } from './registry';
import { createProviderServices } from './services';

test('normalizes quota, auth, rate-limit, server and network errors', () => {
  expect(normalizeProviderError({ status: 402 }).kind).toBe('QUOTA');
  expect(normalizeProviderError({ status: 401 }).kind).toBe('AUTH');
  expect(normalizeProviderError({ status: 429 }).kind).toBe('RATE_LIMIT');
  expect(normalizeProviderError({ status: 503 }).kind).toBe('SERVER');
  expect(normalizeProviderError(new TypeError('network failed')).kind).toBe('NETWORK');
});

test('requires HTTPS except explicit loopback development opt-in', () => {
  expect(() => validateProviderConfig({ baseUrl: 'http://api.example.com' })).toThrow('HTTPS is required');
  expect(validateProviderConfig({ baseUrl: 'http://127.0.0.1:9000', allowInsecureLocal: true }).origin).toBe('http://127.0.0.1:9000');
  expect(() => validateProviderConfig({ baseUrl: 'http://192.168.1.2:9000', allowInsecureLocal: true })).toThrow('HTTPS is required');
  expect(validateProviderConfig({ baseUrl: 'http://192.168.1.2:9000', allowInsecureLocal: true, allowInsecurePrivateLan: true }).origin).toBe('http://192.168.1.2:9000');
});

test('rejects credentials embedded in endpoint URL', () => {
  expect(() => validateProviderConfig({ baseUrl: 'https://secret:token@api.example.com' })).toThrow('Credentials are not allowed in provider URL');
});

test('blocks custom authorization headers and redacts credential values', () => {
  expect(() => validateCustomHeaders({ authorization: 'Bearer custom' })).toThrow('conflicts with provider credentials');
  expect(redactSecrets('bad API key SECRET_VALUE', ['SECRET_VALUE'])).not.toContain('SECRET_VALUE');
});

test('validates outgoing model and messages', () => {
  expect(() => validateChatRequest({ model: '', messages: [] })).toThrow('Model ID is required');
  expect(() => validateChatRequest({ model: 'test', messages: [] })).toThrow('At least one message is required');
});

test('parses SSE frames split between arbitrary byte chunks', async () => {
  const bytes = new TextEncoder().encode('data: {"delta":"hi"}\r\n\r\ndata: [DONE]\n\n');
  async function* stream() {
    yield bytes.slice(0, 7);
    yield bytes.slice(7, 15);
    yield bytes.slice(15);
  }
  const frames = [];
  for await (const frame of parseSSE(stream())) frames.push(frame);
  expect(frames).toEqual(['{"delta":"hi"}', '[DONE]']);
});

test('OpenAI adapter sends credential in bearer header and blocks redirects', async () => {
  let captured;
  const adapter = createOpenAIAdapter({
    secretStore: { async getSecret() { return 'PRIVATE_KEY'; } },
    fetchImpl: async (_url, options) => { captured = options; return { ok: false, status: 302, body: null }; },
  });
  const events = [];
  for await (const event of adapter.streamChat({ model: 'm', messages: [{ role: 'user', content: 'hello' }] }, { providerId: 'p', baseUrl: 'https://example.com/v1', secretRef: 'ref' })) events.push(event);
  expect(captured.headers.Authorization).toBe('Bearer PRIVATE_KEY');
  expect(captured.redirect).toBe('manual');
  expect(events).toEqual([{ type: 'error', error: { kind: 'NETWORK', message: 'Provider redirect blocked' } }]);
});

test.each([[401, 'AUTH'], [403, 'AUTH'], [402, 'QUOTA'], [429, 'RATE_LIMIT'], [503, 'SERVER']])('normalizes HTTP %i and redacts API key', async (status, kind) => {
  const adapter = createOpenAIAdapter({
    secretStore: { async getSecret() { return 'PRIVATE_KEY'; } },
    fetchImpl: async () => ({ ok: false, status, json: async () => ({ error: { message: 'rejected PRIVATE_KEY' } }) }),
  });
  const events = [];
  for await (const event of adapter.streamChat({ model: 'm', messages: [{ role: 'user', content: 'hi' }] }, { providerId: 'p', baseUrl: 'https://example.com', secretRef: 'ref' })) events.push(event);
  expect(events[0].error.kind).toBe(kind);
  expect(events[0].error.message).not.toContain('PRIVATE_KEY');
});

test('uses request timeout signal and normalizes timeout errors without leaking key', async () => {
  let requestSignal;
  const adapter = createOpenAIAdapter({
    timeoutMs: 5,
    secretStore: { async getSecret() { return 'PRIVATE_KEY'; } },
    fetchImpl: async (_url, options) => {
      requestSignal = options.signal;
      await new Promise((resolve) => setTimeout(resolve, 15));
      throw new TypeError('request timed out PRIVATE_KEY');
    },
  });
  const events = [];
  for await (const event of adapter.streamChat({ model: 'm', messages: [{ role: 'user', content: 'hi' }] }, { providerId: 'p', baseUrl: 'https://example.com', secretRef: 'ref' })) events.push(event);
  expect(requestSignal.aborted).toBe(true);
  expect(events[0].error.kind).toBe('NETWORK');
  expect(events[0].error.message).not.toContain('PRIVATE_KEY');
});

test('normalizes abort while reading stream and malformed events do not crash', async () => {
  const adapter = createOpenAIAdapter({
    secretStore: { async getSecret() { return 'PRIVATE_KEY'; } },
    fetchImpl: async () => ({ ok: true, status: 200, body: (async function* () {
      yield new TextEncoder().encode('data: not-json\n\ndata: {"choices":[{"delta":{"content":"ok"}}]}\n\n');
      throw Object.assign(new Error('aborted PRIVATE_KEY'), { name: 'AbortError' });
    })() }),
  });
  const events = [];
  for await (const event of adapter.streamChat({ model: 'm', messages: [{ role: 'user', content: 'hi' }] }, { providerId: 'p', baseUrl: 'https://example.com', secretRef: 'ref' })) events.push(event);
  expect(events).toContainEqual({ type: 'text_delta', text: 'ok' });
  expect(events.at(-1).type).toBe('error');
  expect(events.at(-1).error.message).not.toContain('PRIVATE_KEY');
});

test('provider services report connection result and preserve manual model fallback', async () => {
  const registry = createProviderRegistry();
  registry.register('p', {
    async listModels() { throw new Error('offline'); },
    normalizeError(error) { return { kind: 'NETWORK', message: error.message }; },
    async *streamChat() {},
  });
  const services = createProviderServices({ registry });
  expect(await services.testConnection({ providerId: 'p' })).toEqual({ ok: false, error: { kind: 'NETWORK', message: 'offline' } });
  expect(await services.fetchModels({ providerId: 'p' })).toEqual({ models: [], manualModelIdAllowed: true, error: { kind: 'NETWORK', message: 'offline' } });
});

test('Anthropic adapter maps system prompt and SSE text deltas', async () => {
  let captured;
  const frame = new TextEncoder().encode('event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hi"}}\n\nevent: message_stop\ndata: {"type":"message_stop"}\n\n');
  const adapter = createAnthropicAdapter({
    secretStore: { async getSecret() { return 'PRIVATE_KEY'; } },
    fetchImpl: async (_url, options) => { captured = options; return { ok: true, status: 200, body: (async function* () { yield frame; })() }; },
  });
  const events = [];
  for await (const event of adapter.streamChat({ model: 'claude', messages: [{ role: 'system', content: 'You help' }, { role: 'user', content: 'Hello' }] }, { providerId: 'a', baseUrl: 'https://api.example.com', secretRef: 'ref' })) events.push(event);
  const body = JSON.parse(captured.body);
  expect(body.system).toBe('You help');
  expect(body.messages).toEqual([{ role: 'user', content: 'Hello' }]);
  expect(events).toContainEqual({ type: 'text_delta', text: 'Hi' });
});
