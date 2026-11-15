import SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '../storage/schema';
import { createConversationRepository } from './repository';
import { createConversationEngine } from './engine';

let runtime;

export function getConversationRuntime() {
  if (!runtime) {
    const native = SQLite.openDatabaseSync('nixhub.db');
    native.execSync('PRAGMA foreign_keys = ON');
    native.execSync(`CREATE TABLE IF NOT EXISTS conversations (id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, pinned INTEGER NOT NULL DEFAULT 0, archived INTEGER NOT NULL DEFAULT 0, system_prompt TEXT); CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY NOT NULL, conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE, sequence INTEGER NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, provider_id TEXT, model_id TEXT, status TEXT NOT NULL DEFAULT 'complete', error_code TEXT, error_message TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(conversation_id, sequence)); CREATE INDEX IF NOT EXISTS messages_conversation_sequence_idx ON messages(conversation_id, sequence); CREATE INDEX IF NOT EXISTS conversations_updated_at_idx ON conversations(updated_at DESC); CREATE TABLE IF NOT EXISTS provider_accounts (id TEXT PRIMARY KEY NOT NULL, provider_id TEXT NOT NULL, label TEXT NOT NULL, base_url TEXT NOT NULL, format TEXT NOT NULL, secret_ref TEXT, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS model_configs (id TEXT PRIMARY KEY NOT NULL, account_id TEXT NOT NULL REFERENCES provider_accounts(id) ON DELETE CASCADE, model_id TEXT NOT NULL, display_name TEXT NOT NULL, capabilities_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS usage_events (id TEXT PRIMARY KEY NOT NULL, account_id TEXT, model_id TEXT, input_tokens INTEGER NOT NULL DEFAULT 0, output_tokens INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL); PRAGMA user_version = 1;`);
    const database = drizzle(native, { schema });
    const repository = createConversationRepository({ database });
    runtime = { database, repository, engine: createConversationEngine({ repository }) };
  }
  return runtime;
}
