export function createProviderServices({ registry }) {
  return {
    async testConnection(account) {
      const adapter = registry.get(account.providerId);
      try {
        const models = await adapter.listModels(account);
        return { ok: true, models };
      } catch (error) {
        return { ok: false, error: adapter.normalizeError(error) };
      }
    },
    async fetchModels(account) {
      const adapter = registry.get(account.providerId);
      try {
        return { models: await adapter.listModels(account), manualModelIdAllowed: false };
      } catch (error) {
        return { models: [], manualModelIdAllowed: true, error: adapter.normalizeError(error) };
      }
    },
  };
}
