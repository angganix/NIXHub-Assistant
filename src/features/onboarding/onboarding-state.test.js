import { completeOnboarding, getDefaultSystemPrompt, isOnboardingComplete, setDefaultSystemPrompt } from './onboarding-state';

test('onboarding completion persists and restores through supplied storage', async () => {
  const values = new Map();
  const storage = { async getItem(key) { return values.get(key) || null; }, async setItem(key, value) { values.set(key, value); } };
  expect(await isOnboardingComplete(storage)).toBe(false);
  await completeOnboarding(storage);
  expect(await isOnboardingComplete(storage)).toBe(true);
});

test('default system prompt persists and reloads through supplied storage', async () => {
  const values = new Map();
  const storage = { async getItem(key) { return values.get(key) || null; }, async setItem(key, value) { values.set(key, value); } };
  expect(await getDefaultSystemPrompt(storage)).toBe('');
  await setDefaultSystemPrompt('Be concise', storage);
  expect(await getDefaultSystemPrompt(storage)).toBe('Be concise');
});
