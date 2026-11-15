import { desc, eq, like, or } from 'drizzle-orm';
import { conversations, messages } from '../storage/schema';
import { validateMessage } from './types';

function now() {
  return new Date().toISOString();
}

function createId() {
  return globalThis.crypto.randomUUID();
}

function escapeLike(value) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export function createConversationRepository({ database }) {
  return {
    async createConversation(input = {}) {
      const timestamp = now();
      const record = {
        id: createId(), title: input.title?.trim() || 'New conversation',
        createdAt: timestamp, updatedAt: timestamp, pinned: false, archived: false,
        systemPrompt: input.systemPrompt || null,
      };
      await database.insert(conversations).values(record);
      return record;
    },
    async listConversations({ includeArchived = false } = {}) {
      const rows = await database.select().from(conversations).orderBy(desc(conversations.updatedAt));
      return includeArchived ? rows : rows.filter((row) => !row.archived);
    },
    async updateConversation(id, changes) {
      const updated = { ...changes, updatedAt: now() };
      delete updated.id;
      delete updated.createdAt;
      await database.update(conversations).set(updated).where(eq(conversations.id, id));
      return this.getConversation(id);
    },
    async setConversationTitle(id, title) {
      const normalized = title.trim().slice(0, 80) || 'New conversation';
      await database.update(conversations).set({ title: normalized, updatedAt: now() }).where(eq(conversations.id, id));
      return this.getConversation(id);
    },
    async getConversation(id) {
      const [conversation] = await database.select().from(conversations).where(eq(conversations.id, id)).limit(1);
      if (!conversation) return null;
      const threadMessages = await database.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.sequence);
      return { ...conversation, messages: threadMessages };
    },
    async appendMessage(conversationId, input) {
      validateMessage(input);
      const [conversation] = await database.select({ id: conversations.id }).from(conversations).where(eq(conversations.id, conversationId)).limit(1);
      if (!conversation) throw new Error('Conversation not found');
      const latest = await database.select({ sequence: messages.sequence }).from(messages).where(eq(messages.conversationId, conversationId)).orderBy(desc(messages.sequence)).limit(1);
      const timestamp = now();
      const record = {
        id: createId(), conversationId, sequence: (latest[0]?.sequence ?? 0) + 1,
        role: input.role, content: input.content,
        providerId: input.providerId || null, modelId: input.modelId || null,
        status: input.status || 'complete', errorCode: input.errorCode || null, errorMessage: input.errorMessage || null,
        createdAt: timestamp, updatedAt: timestamp,
      };
      await database.insert(messages).values(record);
      await database.update(conversations).set({ updatedAt: timestamp }).where(eq(conversations.id, conversationId));
      return record;
    },
    async updateMessage(id, changes) {
      const [existing] = await database.select().from(messages).where(eq(messages.id, id)).limit(1);
      if (!existing) throw new Error('Message not found');
      const updated = { ...changes, updatedAt: now() };
      delete updated.id;
      delete updated.conversationId;
      delete updated.sequence;
      await database.update(messages).set(updated).where(eq(messages.id, id));
      return { ...existing, ...updated };
    },
    async deleteConversation(id) {
      const removed = await database.delete(conversations).where(eq(conversations.id, id));
      return removed.changes > 0;
    },
    async searchConversations(query) {
      const needle = query.trim();
      if (!needle) return [];
      return database.selectDistinct({
        id: conversations.id, title: conversations.title, createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt, pinned: conversations.pinned, archived: conversations.archived,
        systemPrompt: conversations.systemPrompt,
      }).from(conversations).leftJoin(messages, eq(messages.conversationId, conversations.id))
        .where(or(like(conversations.title, `%${escapeLike(needle)}%`), like(messages.content, `%${escapeLike(needle)}%`)))
        .orderBy(desc(conversations.updatedAt));
    },
  };
}
