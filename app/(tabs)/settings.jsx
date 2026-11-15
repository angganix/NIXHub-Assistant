import { ScrollView, Text, View } from 'react-native';
import { useLocale } from '../../src/core/i18n/locale-context';
import { useTheme } from '../../src/core/theme/theme-context';
import { Card } from '../../src/components/ui/card';
import { Screen } from '../../src/components/ui/screen';

function Option({ label, selected, onPress }) {
  return (
    <Text accessibilityRole="button" onPress={onPress} className={`mr-2 rounded-lg px-3 py-2 text-sm ${selected ? 'bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
      {label}
    </Text>
  );
}

export default function SettingsScreen() {
  const { locale, setLocale, t } = useLocale();
  const { mode, setMode } = useTheme();
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
          <Text className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">NIXHub Assistant adalah proyek independen. Provider yang kamu pilih menerima pesan dan data yang diperlukan untuk menjawab. Token disimpan di perangkat. Kamu bertanggung jawab mematuhi ketentuan layanan provider.</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}
