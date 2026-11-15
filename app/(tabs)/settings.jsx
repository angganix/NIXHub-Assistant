import { ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { useLocale } from '../../src/core/i18n/locale-context';
import { useTheme } from '../../src/core/theme/theme-context';
import { Card } from '../../src/components/ui/card';
import { Screen } from '../../src/components/ui/screen';
import { getDefaultSystemPrompt, setDefaultSystemPrompt } from '../../src/features/onboarding/onboarding-state';

function Option({ label, selected, onPress }) {
  return <Text accessibilityRole="button" onPress={onPress} className={`mr-2 rounded-lg px-3 py-2 text-sm ${selected ? 'bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>{label}</Text>;
}

export default function SettingsScreen() {
  const { locale, setLocale, t } = useLocale();
  const { mode, setMode } = useTheme();
  const [systemPrompt, setSystemPrompt] = useState('');
  useEffect(() => { getDefaultSystemPrompt().then(setSystemPrompt); }, []);
  const changePrompt = (value) => {
    setSystemPrompt(value);
    setDefaultSystemPrompt(value);
  };
  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-4 px-5 pb-8 pt-3">
        <Text className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">{t('tabs.settings')}</Text>
        <Card>
          <Text className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Language / Bahasa</Text>
          <View className="flex-row"><Option label="Bahasa Indonesia" selected={locale === 'id'} onPress={() => setLocale('id')} /><Option label="English" selected={locale === 'en'} onPress={() => setLocale('en')} /></View>
        </Card>
        <Card>
          <Text className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Theme</Text>
          <View className="flex-row"><Option label="System" selected={mode === 'system'} onPress={() => setMode('system')} /><Option label="Light" selected={mode === 'light'} onPress={() => setMode('light')} /><Option label="Dark" selected={mode === 'dark'} onPress={() => setMode('dark')} /></View>
        </Card>
        <Card>
          <Text accessibilityRole="header" className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('settings.systemPrompt')}</Text>
          <TextInput accessibilityLabel={t('settings.systemPrompt')} value={systemPrompt} onChangeText={changePrompt} multiline placeholder={t('settings.systemPromptPlaceholder')} className="min-h-20 rounded-lg bg-zinc-100 p-3 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" />
        </Card>
        <Card>
          <Text className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">{t('onboarding.privacy')}</Text>
          <View className="mt-3 flex-row flex-wrap gap-x-4 gap-y-2"><Text accessibilityRole="link" onPress={() => router.push('/settings/privacy')} className="text-indigo-700 underline dark:text-indigo-300">{t('settings.privacy')}</Text><Text accessibilityRole="link" onPress={() => router.push('/settings/terms')} className="text-indigo-700 underline dark:text-indigo-300">{t('settings.terms')}</Text><Text accessibilityRole="link" onPress={() => router.push('/settings/disclaimer')} className="text-indigo-700 underline dark:text-indigo-300">{t('settings.disclaimer')}</Text></View>
          <Text className="mt-3 text-xs text-zinc-500">{t('settings.version')}: {Constants.expoConfig?.version || '0.1.0'}</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}
