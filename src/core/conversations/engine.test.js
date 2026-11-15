import { createConversationEngine } from './engine';
import Database from 'better-sqlite3';
import { initializeDatabase } from '../storage/database';
import { createConversationRepository } from './repository';

function setup() {
  const calls = [];
  const thread = { id: 'c1', messages: [{ id: 'old', role: 'user', content: 'earlier' }] };
  const repo = {
    async getConversation() { return thread; },
    async appendMessage(conversationId, message) {
      const record = { id: `m${calls.length + 1}`, conversationId, ...message };
      calls.push(['append', record]);
      thread.messages.push(record);
      return record;
    },
    async setConversationTitle(_id, title) { thread.title = title; },
    async updateMessage(id, changes) {
      calls.push(['update', id, changes]);
      const item = thread.messages.find((message) => message.id === id);
      Object.assign(item, changes);
    },
  };
  const engine = createConversationEngine({ repository: repo });
  return { engine, calls };
}

test('prepends stored conversation system prompt to provider request', async () => {
  const repository = {
    async appendMessage(_id, message) { return { id: `m-${message.role}` }; },
    async getConversation() { return { id: 'c1', systemPrompt: 'Be concise', messages: [] }; },
    async updateMessage() {},
  };
  const testEngine = createConversationEngine({ repository });
  await testEngine.sendMessage('c1', { model: 'm', messages: [{ role: 'user', content: 'Hello' }] }, {
    async *streamChat(request) {
      expect(request.messages).toEqual([{ role: 'system', content: 'Be concise' }, { role: 'user', content: 'Hello' }]);
      yield { type: 'done' };
    },
  }, { providerId: 'p' });
});

test('persists user then assistant streaming deltas and provider attribution after prior history', async () => {
  const { engine, calls } = setup();
  const request = { model: 'm2', messages: [{ role: 'user', content: 'new' }] };
  const adapter = { async *streamChat(received) {
    expect(received.messages).toEqual([{ role: 'user', content: 'earlier' }, { role: 'user', content: 'new' }]);
    yield { type: 'text_delta', text: 'Hi' };
    yield { type: 'text_delta', text: ' there' };
    yield { type: 'done' };
  } };
  await engine.sendMessage('c1', request, adapter, { providerId: 'p', id: 'a' });
  expect(calls[0][1]).toMatchObject({ role: 'user', content: 'new' });
  expect(calls[1][1]).toMatchObject({ role: 'assistant', providerId: 'p', modelId: 'm2' });
  expect(calls.at(-1)).toEqual(['update', 'm2', expect.objectContaining({ content: 'Hi there', status: 'complete' })]);
});

test('stores provider failure and leaves recoverable assistant message', async () => {
  const { engine, calls } = setup();
  const adapter = { async *streamChat() { throw new Error('offline'); } };
  await expect(engine.sendMessage('c1', { model: 'm', messages: [{ role: 'user', content: 'x' }] }, adapter, { providerId: 'p' })).rejects.toThrow('offline');
  expect(calls.at(-1)).toEqual(['update', 'm2', expect.objectContaining({ status: 'error', errorMessage: 'offline' })]);
});

test('rejects rapid duplicate sends for same conversation', async () => {
  const { engine } = setup();
  let release;
  const adapter = { async *streamChat() {
    await new Promise((resolve) => { release = resolve; });
    yield { type: 'done' };
  } };
  const request = { model: 'm', messages: [{ role: 'user', content: 'x' }] };
  const pending = engine.sendMessage('c1', request, adapter, { providerId: 'p' });
  await new Promise((resolve) => setImmediate(resolve));
  await expect(engine.sendMessage('c1', request, adapter, { providerId: 'p' })).rejects.toThrow('already active');
  release();
  await pending;
});

test('history can restore from repository after engine recreation', async () => {
  const native = new Database(':memory:');
  const repository = createConversationRepository({ database: initializeDatabase(native) });
  const conversation = await repository.createConversation({ title: 'Persisted' });
  await repository.appendMessage(conversation.id, { role: 'user', content: 'Saved' });
  const restored = await createConversationEngine({ repository }).getConversation(conversation.id);
  expect(restored.messages[0].content).toBe('Saved');
  native.close();
});

test('cancel persists cancelled status', async () => {
  const { engine, calls } = setup();
  const controller = new AbortController();
  const adapter = { async *streamChat(_request, _account, signal) {
    await new Promise((resolve) => signal.addEventListener('abort', resolve, { once: true }));
    throw Object.assign(new Error('aborted'), { name: 'AbortError' });
  } };
  const pending = engine.sendMessage('c1', { model: 'm', messages: [{ role: 'user', content: 'x' }] }, adapter, { providerId: 'p' }, controller.signal);
  await new Promise((resolve) => setImmediate(resolve));
  controller.abort();
  await expect(pending).rejects.toThrow('aborted');
  expect(calls.at(-1)[2].status).toBe('cancelled');
});
