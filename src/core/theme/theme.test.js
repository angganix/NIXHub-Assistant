import { palettes, resolveTheme } from './theme';

test('system theme follows OS while explicit theme overrides OS', () => {
  expect(resolveTheme('system', 'dark').scheme).toBe('dark');
  expect(resolveTheme('light', 'dark').colors.background).toBe(palettes.light.background);
});

test('unknown theme safely falls back to light palette', () => {
  expect(resolveTheme('solarized').colors.background).toBe(palettes.light.background);
});
