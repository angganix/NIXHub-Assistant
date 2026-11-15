import * as SecureStore from 'expo-secure-store';

const PREFIX = 'nixhub.secret.';

function storageKey(id) {
  if (typeof id !== 'string' || !id.trim()) throw new Error('Secret ID is required');
  return `${PREFIX}${encodeURIComponent(id.trim())}`;
}

export function createSecretStore({ secureStore = SecureStore } = {}) {
  return {
    async setSecret(id, value) {
      const key = storageKey(id);
      if (typeof value !== 'string' || value.length === 0) throw new Error('Secret value is required');
      await secureStore.setItemAsync(key, value);
    },
    async getSecret(id) {
      return secureStore.getItemAsync(storageKey(id));
    },
    async deleteSecret(id) {
      await secureStore.deleteItemAsync(storageKey(id));
    },
  };
}

export const secretStore = createSecretStore();
