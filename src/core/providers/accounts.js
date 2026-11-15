import { eq } from 'drizzle-orm';
import { providerAccounts, modelConfigs } from '../storage/schema';
import { validateProviderConfig } from '../security/provider-config';

function createId() {
  return globalThis.crypto.randomUUID();
}

export function createProviderAccountService({ database, secretStore, providerServices }) {
  return {
    async saveProvider(input) {
      const { baseUrl } = validateProviderConfig(input);
      if (!['openai', 'anthropic'].includes(input.format)) throw new Error('Unsupported provider format');
      const timestamp = new Date().toISOString();
      const id = input.id || createId();
      const secretRef = input.apiKey?.length ? `provider:${id}` : input.secretRef || null;
      if (input.apiKey?.length) await secretStore.setSecret(secretRef, input.apiKey);
      const record = {
        id,
        providerId: input.providerId || id,
        label: input.label.trim() || input.format,
        baseUrl,
        format: input.format,
        secretRef,
        enabled: input.enabled !== false,
        createdAt: input.createdAt || timestamp,
      };
      if (input.id) await database.update(providerAccounts).set(record).where(eq(providerAccounts.id, id));
      else await database.insert(providerAccounts).values(record);
      const { apiKey, ...safe } = { ...record, apiKey: input.apiKey };
      return safe;
    },
    async listProviders() {
      const accounts = await database.select().from(providerAccounts).orderBy(providerAccounts.createdAt);
      const models = await database.select().from(modelConfigs);
      return accounts.map((account) => ({ ...account, models: models.filter((model) => model.accountId === account.id) }));
    },
    async setModels(accountId, modelIds) {
      await database.delete(modelConfigs).where(eq(modelConfigs.accountId, accountId));
      const createdAt = new Date().toISOString();
      for (const modelId of [...new Set(modelIds.map((value) => value.trim()).filter(Boolean))]) {
        await database.insert(modelConfigs).values({ id: createId(), accountId, modelId, displayName: modelId, capabilitiesJson: '{}', createdAt });
      }
    },
    testConnection(account) { return providerServices.testConnection(account); },
    fetchModels(account) { return providerServices.fetchModels(account); },
    adapterFor(account) { return providerServices.adapterFor(account); },
    async deleteProvider(id) {
      const [existing] = await database.select().from(providerAccounts).where(eq(providerAccounts.id, id)).limit(1);
      if (!existing) return false;
      await database.delete(providerAccounts).where(eq(providerAccounts.id, id));
      if (existing.secretRef) await secretStore.deleteSecret(existing.secretRef);
      return true;
    },
  };
}
