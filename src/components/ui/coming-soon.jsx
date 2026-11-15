import { Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useLocale } from '../../core/i18n/locale-context';
import { Screen } from './screen';

export function ComingSoon({ title }) {
  const { t } = useLocale();
  return (
    <Screen className="items-center justify-center px-8">
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950">
        <Sparkles size={24} color="#6366f1" />
      </View>
      <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</Text>
      <Text className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{t('app.comingSoon')}</Text>
    </Screen>
  );
}
