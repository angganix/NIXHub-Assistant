import { listProviderAccounts, providerAccountService } from './runtime';

jest.mock('../conversations/runtime', () => ({ getNativeDatabase: () => ({ execSync: jest.fn() }) }));
jest.mock('drizzle-orm/expo-sqlite', () => ({ drizzle: () => ({}) }));
jest.mock('../storage/schema', () => ({ providerAccounts: {}, modelConfigs: {} }));
jest.mock('../security/secrets', () => ({ secretStore: {} }));
jest.mock('./services', () => ({ createProviderServices: ({ registry }) => ({ adapterFor: (account) => registry.get(account.providerId), testConnection: async (account) => ({ adapter: registry.get(account.providerId) }), fetchModels: async (account) => ({ adapter: registry.get(account.providerId) }) }) }));
jest.mock('./accounts', () => ({ createProviderAccountService: ({ providerServices }) => ({ listProviders: async () => [{ id: 'one', providerId: 'one', label: 'API', format: 'openai', models: [] }], adapterFor: (account) => providerServices.adapterFor(account), testConnection: (account) => providerServices.testConnection(account), fetchModels: (account) => providerServices.fetchModels(account) }) }));
jest.mock('./custom/openai', () => ({ createOpenAIAdapter: () => ({ name: 'openai-adapter' }) }));
jest.mock('./custom/anthropic', () => ({ createAnthropicAdapter: () => ({ name: 'anthropic-adapter' }) }));

test('listing accounts refreshes registry used by connection test and chat adapter', async () => {
  const [account] = await listProviderAccounts();
  expect(providerAccountService.adapterFor(account)).toEqual({ name: 'openai-adapter' });
  expect(await providerAccountService.testConnection(account)).toEqual({ adapter: { name: 'openai-adapter' } });
  expect(await providerAccountService.fetchModels(account)).toEqual({ adapter: { name: 'openai-adapter' } });
});
