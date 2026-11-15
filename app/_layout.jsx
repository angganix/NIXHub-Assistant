import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LocaleProvider } from '../src/core/i18n/locale-context';
import { ThemeProvider } from '../src/core/theme/theme-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocaleProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </LocaleProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
