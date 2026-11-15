import { parseSSE } from '../sse';
import { normalizeProviderError } from '../errors';
import { redactSecrets } from '../../security/provider-config';

export async function* readEventStream(response, mapEvent, secret) {
  try {
    for await (const frame of parseSSE(response.body)) {
      if (frame === '[DONE]') {
        yield { type: 'done' };
        return;
      }
      let data;
      try {
        data = JSON.parse(frame);
      } catch {
        continue;
      }
      const events = mapEvent(data);
      for (const event of events) yield event;
    }
    yield { type: 'done' };
  } catch (error) {
    const normalized = normalizeProviderError(error);
    yield { type: 'error', error: { ...normalized, message: redactSecrets(error?.message, [secret]) } };
  }
}

export function responseError(response, body, secret) {
  const message = typeof body?.error?.message === 'string' ? body.error.message : `Provider request failed (${response.status})`;
  return { ...normalizeProviderError({ status: response.status, code: body?.error?.code }), message: redactSecrets(message, [secret]) };
}
