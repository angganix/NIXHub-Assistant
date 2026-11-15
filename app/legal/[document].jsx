import { ScrollView, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '../../src/components/ui/screen';
import { useLocale } from '../../src/core/i18n/locale-context';

export default function LegalDocument() {
  const { document } = useLocalSearchParams();
  const { t } = useLocale();
  const copy = t(`legal.${document}`);
  return <Screen className="px-5"><ScrollView className="pt-5"><Text className="mb-4 text-2xl font-bold text-zinc-950 dark:text-zinc-50">{t(`settings.${document === 'privacy' ? 'privacy' : document === 'terms' ? 'terms' : 'disclaimer'}`)}</Text><Text className="text-base leading-7 text-zinc-700 dark:text-zinc-300">{copy}</Text></ScrollView></Screen>;
}
