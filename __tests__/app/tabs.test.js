import { fireEvent, render, screen } from '@testing-library/react-native';
import { LocaleProvider, useLocale } from '../../src/core/i18n/locale-context';
import { ThemeProvider, useTheme } from '../../src/core/theme/theme-context';
import { Text, View } from 'react-native';

function PreferencesProbe() {
  const { locale, setLocale, t } = useLocale();
  const { mode, setMode } = useTheme();
  return (
    <View>
      <Text>{t('tabs.settings')}</Text>
      <Text>{mode}</Text>
      <Text>{locale}</Text>
      <Text accessibilityRole="button" onPress={() => setLocale('en')}>English</Text>
      <Text accessibilityRole="button" onPress={() => setMode('dark')}>Dark</Text>
    </View>
  );
}

test('changing language and theme updates visible preferences', () => {
  render(<ThemeProvider><LocaleProvider><PreferencesProbe /></LocaleProvider></ThemeProvider>);
  expect(screen.getByText('Pengaturan')).toBeTruthy();
  fireEvent.press(screen.getByText('English'));
  fireEvent.press(screen.getByText('Dark'));
  expect(screen.getByText('Settings')).toBeTruthy();
  expect(screen.getByText('dark')).toBeTruthy();
});
