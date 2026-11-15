export const MESSAGE_ROLES = Object.freeze(['system', 'user', 'assistant', 'tool']);
export const MESSAGE_STATUSES = Object.freeze(['pending', 'streaming', 'complete', 'error', 'cancelled']);

export function validateMessage(input) {
  if (!input || !MESSAGE_ROLES.includes(input.role)) throw new Error('Invalid message role');
  if (typeof input.content !== 'string') throw new Error('Message content must be a string');
  return input;
}
