export const CHAT_EVENT_TYPES = Object.freeze(['text_delta', 'usage', 'tool_call', 'done', 'error']);
export const PROVIDER_ERROR_KINDS = Object.freeze(['RATE_LIMIT', 'QUOTA', 'AUTH', 'NETWORK', 'SERVER', 'INVALID_REQUEST', 'UNKNOWN']);

/** @typedef {{ role: string, content: string }} ChatMessage */
/** @typedef {{ model: string, messages: ChatMessage[], stream?: boolean }} ChatRequest */
/** @typedef {{ type: string, [key: string]: unknown }} ChatEvent */
/** @typedef {{ id: string, name: string, providerId: string, capabilities: object }} ModelDescriptor */
/** @typedef {{ id: string, providerId: string, baseUrl: string, format: string, secretRef?: string }} ProviderAccount */

export function validateChatRequest(request) {
  if (!request || typeof request.model !== 'string' || !request.model.trim()) throw new Error('Model ID is required');
  if (!Array.isArray(request.messages) || request.messages.length === 0) throw new Error('At least one message is required');
  for (const message of request.messages) {
    if (!message || !['system', 'user', 'assistant', 'tool'].includes(message.role) || typeof message.content !== 'string') {
      throw new Error('Invalid chat message');
    }
  }
  return request;
}
