import { translate } from './translations';

test('translation uses Indonesian default copy and English labels', () => {
  expect(translate('id', 'tabs.models')).toBe('Model');
  expect(translate('en', 'tabs.models')).toBe('Models');
});

test('all required onboarding and provider management strings exist in both languages', () => {
  for (const locale of ['id', 'en']) {
    for (const key of ['onboarding.privacy', 'models.apiKey', 'models.edit', 'settings.privacy', 'legal.terms']) {
      expect(translate(locale, key)).not.toBe(key);
    }
  }
});

test('unknown translation key falls back to key instead of crashing', () => {
  expect(translate('id', 'tabs.missing')).toBe('tabs.missing');
});
