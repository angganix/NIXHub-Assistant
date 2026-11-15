const KEY = 'nixhub.onboarding.complete';
export const DEFAULT_SYSTEM_PROMPT_KEY = 'nixhub.settings.systemPrompt';

async function getStorage(storage) {
  return storage || (await import('@react-native-async-storage/async-storage')).default;
}

export async function isOnboardingComplete(storage) {
  return (await (await getStorage(storage)).getItem(KEY)) === 'true';
}

export async function completeOnboarding(storage) {
  await (await getStorage(storage)).setItem(KEY, 'true');
}

export async function getDefaultSystemPrompt(storage) {
  return (await (await getStorage(storage)).getItem(DEFAULT_SYSTEM_PROMPT_KEY)) || '';
}

export async function setDefaultSystemPrompt(value, storage) {
  await (await getStorage(storage)).setItem(DEFAULT_SYSTEM_PROMPT_KEY, value);
}
