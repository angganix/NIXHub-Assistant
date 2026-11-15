import { Text, View } from 'react-native';
import { Boxes } from 'lucide-react-native';
import { useLocale } from '../../src/core/i18n/locale-context';
import { Button } from '../../src/components/ui/button';
import { Screen } from '../../src/components/ui/screen';

export default function ModelsScreen() {
  const { t } = useLocale();
  return (
    <Screen className="px-5">
      <View className="flex-row items-center justify-between pb-5 pt-3">
        <Text className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">{t('tabs.models')}</Text>
        <Button title={t('app.addProvider')} onPress={() => {}} />
      </View>
      <View className="flex-1 items-center justify-center pb-12">
        <Boxes size={32} color="#71717a" />
        <Text className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{t('app.noProvider')}</Text>
      </View>
    </Screen>
  );
}
