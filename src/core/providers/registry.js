export function createProviderRegistry() {
  const adapters = new Map();
  return {
    register(id, adapter) {
      if (!id || !adapter || typeof adapter.streamChat !== 'function' || typeof adapter.listModels !== 'function') {
        throw new Error('Provider adapter must implement listModels and streamChat');
      }
      adapters.set(id, adapter);
    },
    get(id) {
      const adapter = adapters.get(id);
      if (!adapter) throw new Error(`Unknown provider: ${id}`);
      return adapter;
    },
    list() {
      return [...adapters.keys()];
    },
  };
}
