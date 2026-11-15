import Database from 'better-sqlite3';
import { initializeDatabase } from '../storage/database';
import { providerAccounts, modelConfigs } from '../storage/schema';
import { createProviderAccountService } from './accounts';

function setup() {
  const native = new Database(':memory:');
  const database = initializeDatabase(native);
  const secrets = new Map();
  const secretStore = {
    async setSecret(id, value) { secrets.set(id, value); },
    async getSecret(id) { return secrets.get(id) || null; },
    async deleteSecret(id) { secrets.delete(id); },
  };
  const providerServices = {
    adapterFor: jest.fn((account) => ({ format: account.format })),
    testConnection: jest.fn(async (account) => ({ ok: true, account })),
    fetchModels: jest.fn(async (account) => ({ models: [{ id: `${account.format}-model` }], manualModelIdAllowed: false })),
  };
  return { native, database, secrets, secretStore, providerServices, service: createProviderAccountService({ database, secretStore, providerServices }) };
}

test('editing provider retains existing key when blank and updates metadata', async () => {
  const context = setup();
  const created = await context.service.saveProvider({ label: 'First', baseUrl: 'https://api.example.test', format: 'openai', apiKey: 'secret' });
  const updated = await context.service.saveProvider({ id: created.id, providerId: created.providerId, secretRef: created.secretRef, label: 'Renamed', baseUrl: 'https://api.example.test/v1', format: 'openai', apiKey: '' });
  expect(updated.label).toBe('Renamed');
  expect(await context.secretStore.getSecret(created.secretRef)).toBe('secret');
  expect((await context.service.listProviders())[0].label).toBe('Renamed');
  context.native.close();
});

test('provider service resolves fresh provider cache for connection and chat adapter', async () => {
  const context = setup();
  const provider = await context.service.saveProvider({ label: 'API', baseUrl: 'https://api.example.test', format: 'anthropic', apiKey: 'secret' });
  await context.service.setModels(provider.id, ['claude-model']);
  const account = (await context.service.listProviders())[0];
  await context.service.testConnection(account);
  await context.service.fetchModels(account);
  expect(context.providerServices.testConnection).toHaveBeenCalledWith(account);
  expect(context.providerServices.fetchModels).toHaveBeenCalledWith(account);
  expect(context.service.adapterFor(account)).toEqual({ format: 'anthropic' });
  context.native.close();
});

test('deleting provider removes account, cascading models, and secret', async () => {
  const context = setup();
  const provider = await context.service.saveProvider({ label: 'API', baseUrl: 'https://api.example.test', format: 'openai', apiKey: 'secret' });
  await context.service.setModels(provider.id, ['model']);
  await context.service.deleteProvider(provider.id);
  expect(await context.database.select().from(providerAccounts)).toHaveLength(0);
  expect(await context.database.select().from(modelConfigs)).toHaveLength(0);
  expect(context.secrets.size).toBe(0);
  context.native.close();
});
