import { validateProviderConfig, validateCustomHeaders, redactSecrets } from '../../security/provider-config';
import { validateChatRequest } from '../types';
import { readEventStream, responseError } from './shared';
import { normalizeProviderError } from '../errors';

function endpoint(baseUrl, path) {
  const base = baseUrl.replace(/\/$/, '');
  return base.endsWith('/v1') ? `${base}${path}` : `${base}/v1${path}`;
}

async function fetchWithTimeout(fetchImpl, url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const signal = options.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal;
  try {
    return await fetchImpl(url, { ...options, signal });
  } finally {
    clearTimeout(timer);
  }
}

export function createOpenAIAdapter({ fetchImpl = globalThis.fetch, secretStore, timeoutMs = 30000 }) {
  async function credentials(account) {
    if (!account.secretRef) throw new Error('Provider API key is not configured');
    const secret = await secretStore.getSecret(account.secretRef);
    if (!secret) throw new Error('Provider API key is not configured');
    return secret;
  }

  return {
    async listModels(account) {
      const { baseUrl } = validateProviderConfig(account);
      const key = await credentials(account);
      const response = await fetchWithTimeout(fetchImpl, endpoint(baseUrl, '/models'), { headers: { Authorization: `Bearer ${key}`, ...validateCustomHeaders(account.headers) }, redirect: 'manual' }, timeoutMs);
      if (response.status >= 300 && response.status < 400) throw new Error('Provider redirect blocked');
      const body = await response.json();
      if (!response.ok) throw new Error(responseError(response, body, key).message);
      return (body.data || []).map((model) => ({ id: model.id, name: model.name || model.id, providerId: account.providerId, capabilities: {} }));
    },
    capabilities() {
      return { streaming: true, tools: true, vision: 'unknown', contextWindow: null };
    },
    normalizeError(error) {
      return error?.kind ? error : { kind: 'UNKNOWN', message: error?.message || 'Provider error' };
    },
    async *streamChat(request, account, signal) {
      validateChatRequest(request);
      const { baseUrl } = validateProviderConfig(account);
      const key = await credentials(account);
      let response;
      try {
        response = await fetchWithTimeout(fetchImpl, endpoint(baseUrl, '/chat/completions'), {
          method: 'POST', redirect: 'manual', signal,
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...validateCustomHeaders(account.headers) },
          body: JSON.stringify({ model: request.model, messages: request.messages, stream: true, stream_options: { include_usage: true } }),
        }, timeoutMs);
      } catch (error) {
        const normalized = normalizeProviderError(error);
        yield { type: 'error', error: { ...normalized, message: error?.name === 'AbortError' ? 'Provider request timed out or was cancelled' : redactSecrets(error?.message || 'Provider network error', [key]) } };
        return;
      }
      if (response.status >= 300 && response.status < 400) {
        yield { type: 'error', error: { kind: 'NETWORK', message: 'Provider redirect blocked' } };
        return;
      }
      if (!response.ok) {
        let body = {};
        try { body = await response.json(); } catch {}
        yield { type: 'error', error: responseError(response, body, key) };
        return;
      }
      yield* readEventStream(response, (data) => {
        const events = [];
        const choice = data.choices?.[0];
        const text = choice?.delta?.content;
        if (typeof text === 'string' && text) events.push({ type: 'text_delta', text });
        if (choice?.delta?.tool_calls) events.push({ type: 'tool_call', toolCalls: choice.delta.tool_calls });
        if (data.usage) events.push({ type: 'usage', inputTokens: data.usage.prompt_tokens || 0, outputTokens: data.usage.completion_tokens || 0 });
        if (choice?.finish_reason) events.push({ type: 'done', finishReason: choice.finish_reason });
        return events;
      }, key);
    },
  };
}
