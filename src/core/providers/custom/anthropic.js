import { validateProviderConfig, validateCustomHeaders } from '../../security/provider-config';
import { validateChatRequest } from '../types';
import { readEventStream, responseError } from './shared';
import { normalizeProviderError } from '../errors';

function endpoint(baseUrl) {
  const base = baseUrl.replace(/\/$/, '');
  return base.endsWith('/v1') ? `${base}/messages` : `${base}/v1/messages`;
}

async function fetchWithTimeout(fetchImpl, url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const signal = options.signal ? AbortSignal.any([options.signal, controller.signal]) : controller.signal;
  try {
    return await fetchImpl(url, { ...options, signal });
  } finally {
    clearTimeout(timer);
  }
}

function toAnthropicMessages(messages) {
  const system = messages.filter((message) => message.role === 'system').map((message) => message.content).join('\n');
  const chat = messages.filter((message) => message.role !== 'system').map(({ role, content }) => ({ role: role === 'assistant' ? 'assistant' : 'user', content }));
  return { system, messages: chat };
}

export function createAnthropicAdapter({ fetchImpl = globalThis.fetch, secretStore, timeoutMs = 30000 }) {
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
      const response = await fetchWithTimeout(fetchImpl, `${baseUrl.replace(/\/$/, '')}/v1/models`, {
        headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', ...validateCustomHeaders(account.headers) }, redirect: 'manual',
      }, timeoutMs);
      if (response.status >= 300 && response.status < 400) throw new Error('Provider redirect blocked');
      const body = await response.json();
      if (!response.ok) throw new Error(responseError(response, body, key).message);
      return (body.data || []).map((model) => ({ id: model.id, name: model.display_name || model.id, providerId: account.providerId, capabilities: {} }));
    },
    capabilities() {
      return { streaming: true, tools: true, vision: 'unknown', contextWindow: null };
    },
    normalizeError(error) {
      return error?.kind ? error : { ...normalizeProviderError(error), message: error?.message || 'Provider error' };
    },
    async *streamChat(request, account, signal) {
      validateChatRequest(request);
      const { baseUrl } = validateProviderConfig(account);
      const key = await credentials(account);
      const normalized = toAnthropicMessages(request.messages);
      let response;
      try {
        response = await fetchWithTimeout(fetchImpl, endpoint(baseUrl), {
          method: 'POST', redirect: 'manual', signal,
          headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', ...validateCustomHeaders(account.headers) },
          body: JSON.stringify({ model: request.model, max_tokens: request.maxTokens || 4096, stream: true, ...normalized }),
        }, timeoutMs);
      } catch (error) {
        const normalizedError = normalizeProviderError(error);
        yield { type: 'error', error: { ...normalizedError, message: error?.name === 'AbortError' ? 'Provider request timed out or was cancelled' : error?.message || 'Provider network error' } };
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
        if (data.type === 'content_block_delta' && data.delta?.type === 'text_delta') return [{ type: 'text_delta', text: data.delta.text }];
        if (data.type === 'message_delta' && data.usage) return [{ type: 'usage', inputTokens: 0, outputTokens: data.usage.output_tokens || 0 }];
        if (data.type === 'message_start' && data.message?.usage) return [{ type: 'usage', inputTokens: data.message.usage.input_tokens || 0, outputTokens: 0 }];
        if (data.type === 'message_stop') return [{ type: 'done' }];
        return [];
      }, key);
    },
  };
}
