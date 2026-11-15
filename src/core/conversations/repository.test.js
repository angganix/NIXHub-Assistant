import Database from 'better-sqlite3';
import { initializeDatabase } from '../storage/database';
import { createConversationRepository } from './repository';

test('conversation repository persists messages in stable creation order and deletes cascade', async () => {
  const database = new Database(':memory:');
  const repository = createConversationRepository({ database: initializeDatabase(database) });

  const conversation = await repository.createConversation({ title: 'Test thread' });
  const first = await repository.appendMessage(conversation.id, { role: 'user', content: 'First' });
  await repository.appendMessage(conversation.id, { role: 'assistant', content: 'Second' });
  await repository.updateMessage(first.id, { content: 'Updated first' });

  expect((await repository.getConversation(conversation.id)).messages.map((message) => message.content)).toEqual(['Updated first', 'Second']);
  expect(await repository.searchConversations('Updated')).toHaveLength(1);
  await repository.updateConversation(conversation.id, { pinned: true, archived: true });
  expect(await repository.listConversations()).toHaveLength(0);
  expect(await repository.listConversations({ includeArchived: true })).toHaveLength(1);
  await repository.deleteConversation(conversation.id);
  expect(await repository.getConversation(conversation.id)).toBeNull();
  expect(database.prepare('SELECT COUNT(*) AS count FROM messages').get().count).toBe(0);
  database.close();
});

test('creating a message for a missing conversation leaves no partial row', async () => {
  const database = new Database(':memory:');
  const repository = createConversationRepository({ database: initializeDatabase(database) });
  await expect(repository.appendMessage('missing', { role: 'user', content: 'lost?' })).rejects.toThrow('Conversation not found');
  expect(database.prepare('SELECT COUNT(*) AS count FROM messages').get().count).toBe(0);
  database.close();
});
