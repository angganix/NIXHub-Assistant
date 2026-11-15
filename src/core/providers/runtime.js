import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '../storage/schema';
import { getNativeDatabase } from '../conversations/runtime';
import { secretStore } from '../security/secrets';
import { createProviderServices } from './services';
import { createProviderAccountService } from './accounts';
import { createOpenAIAdapter } from './custom/openai';
import { createAnthropicAdapter } from './custom/anthropic';

const database = drizzle(getNativeDatabase(), { schema });
const adapters = {
  openai: createOpenAIAdapter({ secretStore }),
  anthropic: createAnthropicAdapter({ secretStore }),
};
let accountCache = [];
const providerServices = createProviderServices({
  registry: {
    get(providerId) {
      const account = accountCache.find((item) => item.providerId === providerId);
      if (!account) throw new Error('Provider not configured');
      const adapter = adapters[account.format];
      if (!adapter) throw new Error('Unsupported provider format');
      return adapter;
    },
  },
});

export const providerAccountService = createProviderAccountService({ database, secretStore, providerServices });

export async function listProviderAccounts() {
  const accounts = await providerAccountService.listProviders();
  accountCache = accounts;
  return accounts;
}
