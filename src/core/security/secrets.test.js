import { createSecretStore } from './secrets';

test('secret store roundtrips whitespace and Unicode without changing content', async () => {
  const values = new Map();
  const secureStore = {
    async setItemAsync(key, value) { values.set(key, value); },
    async getItemAsync(key) { return values.get(key) ?? null; },
    async deleteItemAsync(key) { values.delete(key); },
  };
  const store = createSecretStore({ secureStore });
  const secret = '  秘密 🔐 token\n ';

  await store.setSecret('provider-one', secret);
  expect(await store.getSecret('provider-one')).toBe(secret);
  await store.deleteSecret('provider-one');
  expect(await store.getSecret('provider-one')).toBeNull();
});

test('secret store rejects empty identifiers without exposing secret value', async () => {
  const secret = 'SUPER_PRIVATE_秘密';
  const store = createSecretStore({ secureStore: {} });
  await expect(store.setSecret(' ', secret)).rejects.toThrow('Secret ID is required');
  await expect(store.getSecret(' ')).rejects.toThrow('Secret ID is required');
});
