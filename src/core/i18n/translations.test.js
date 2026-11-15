import { translate } from './translations';

test('translation uses Indonesian default copy and English labels', () => {
  expect(translate('id', 'tabs.models')).toBe('Model');
  expect(translate('en', 'tabs.models')).toBe('Models');
});

test('unknown translation key falls back to key instead of crashing', () => {
  expect(translate('id', 'tabs.missing')).toBe('tabs.missing');
});
