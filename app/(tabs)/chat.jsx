import { Text, View } from 'react-native';
import { MessageSquareText } from 'lucide-react-native';
import { useLocale } from '../../src/core/i18n/locale-context';
import { Button } from '../../src/components/ui/button';
import { Screen } from '../../src/components/ui/screen';

export default function ChatScreen() {
  const { t } = useLocale();
  return (
    <Screen className="px-5">
      <View className="flex-row items-center justify-between pb-4 pt-3">
        <Text className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">{t('app.name')}</Text>
        <Button title={t('app.newChat')} variant="secondary" onPress={() => {}} />
      </View>
      <View className="flex-1 items-center justify-center px-6 pb-16">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950">
          <MessageSquareText size={28} color="#6366f1" />
        </View>
        <Text className="text-center text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('app.welcome')}</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-zinc-500 dark:text-zinc-400">{t('app.noProvider')}</Text>
        <View className="mt-5 w-full max-w-56"><Button title={t('app.addProvider')} variant="primary" onPress={() => {}} /></View>
      </View>
    </Screen>
  );
}
