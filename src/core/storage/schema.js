import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  systemPrompt: text('system_prompt'),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  sequence: integer('sequence').notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  providerId: text('provider_id'),
  modelId: text('model_id'),
  status: text('status').notNull().default('complete'),
  errorCode: text('error_code'),
  errorMessage: text('error_message'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const providerAccounts = sqliteTable('provider_accounts', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull(),
  label: text('label').notNull(),
  baseUrl: text('base_url').notNull(),
  format: text('format').notNull(),
  secretRef: text('secret_ref'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

export const modelConfigs = sqliteTable('model_configs', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => providerAccounts.id, { onDelete: 'cascade' }),
  modelId: text('model_id').notNull(),
  displayName: text('display_name').notNull(),
  capabilitiesJson: text('capabilities_json').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
});

export const usageEvents = sqliteTable('usage_events', {
  id: text('id').primaryKey(),
  accountId: text('account_id'),
  modelId: text('model_id'),
  inputTokens: integer('input_tokens').notNull().default(0),
  outputTokens: integer('output_tokens').notNull().default(0),
  createdAt: text('created_at').notNull(),
});
