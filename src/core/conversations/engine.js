export function createConversationEngine({ repository }) {
  const active = new Map();
  return {
    async getConversation(conversationId) {
      return repository.getConversation(conversationId);
    },
    async sendMessage(conversationId, request, adapter, account, externalSignal) {
      if (active.has(conversationId)) throw new Error('A response is already active for this conversation');
      const controller = new AbortController();
      const onAbort = () => controller.abort(externalSignal?.reason);
      externalSignal?.addEventListener('abort', onAbort, { once: true });
      if (externalSignal?.aborted) onAbort();
      active.set(conversationId, controller);
      let assistant;
      let content = '';
      try {
        await repository.appendMessage(conversationId, {
          role: 'user', content: request.messages.at(-1).content,
          providerId: account.providerId, modelId: request.model, status: 'complete',
        });
        const existingThread = await repository.getConversation(conversationId);
        if (existingThread?.messages?.length === 1) {
          await repository.setConversationTitle?.(conversationId, request.messages.at(-1).content);
        }
        assistant = await repository.appendMessage(conversationId, {
          role: 'assistant', content: '', providerId: account.providerId,
          modelId: request.model, status: 'streaming',
        });
        await repository.updateMessage(assistant.id, { content: '', status: 'streaming' });
        const thread = await repository.getConversation(conversationId);
        const history = (thread?.messages || []).filter((message) => message.id !== assistant.id).map(({ role, content: text }) => ({ role, content: text }));
        const messages = request.messages.length > 1
          ? request.messages
          : [...history.slice(0, -1), request.messages.at(-1)];
        if (thread?.systemPrompt && !messages.some((message) => message.role === 'system')) {
          messages.unshift({ role: 'system', content: thread.systemPrompt });
        }
        for await (const event of adapter.streamChat({ ...request, messages }, account, controller.signal)) {
          if (event.type === 'text_delta') {
            content += event.text;
            await repository.updateMessage(assistant.id, { content, status: 'streaming' });
          } else if (event.type === 'usage') {
            await repository.updateMessage(assistant.id, { usage: event });
          } else if (event.type === 'error') {
            throw Object.assign(new Error(event.error?.message || 'Provider error'), event.error);
          } else if (event.type === 'done') {
            break;
          }
        }
        await repository.updateMessage(assistant.id, { content, status: 'complete' });
      } catch (error) {
        if (assistant) {
          const cancelled = controller.signal.aborted || error?.name === 'AbortError';
          await repository.updateMessage(assistant.id, {
            content, status: cancelled ? 'cancelled' : 'error',
            errorCode: error?.kind || error?.code || null,
            errorMessage: error?.message || 'Provider error',
          });
        }
        throw error;
      } finally {
        externalSignal?.removeEventListener('abort', onAbort);
        active.delete(conversationId);
      }
    },
    cancel(conversationId) {
      active.get(conversationId)?.abort();
    },
  };
}
