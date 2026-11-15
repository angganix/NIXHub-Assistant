import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ShieldCheck, Sparkles } from 'lucide-react-native';
import { Screen } from '../../components/ui/screen';
import { useLocale } from '../../core/i18n/locale-context';
import { completeOnboarding } from './onboarding-state';

export default function OnboardingScreen() {
  const { t } = useLocale();
  const [acknowledged, setAcknowledged] = useState(false);
  const continueToApp = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/chat');
  };
  return (
    <Screen className="px-6">
      <ScrollView contentContainerClassName="flex-grow justify-center py-10">
        <View className="mb-6 h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950"><Sparkles size={28} color="#4f46e5" /></View>
        <Text className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">{t('app.name')}</Text>
        <Text className="mt-3 text-base leading-6 text-zinc-600 dark:text-zinc-300">{t('onboarding.intro')}</Text>
        <View className="mt-8 rounded-2xl bg-white p-5 dark:bg-zinc-900">
          <View className="flex-row items-center"><ShieldCheck size={20} color="#4f46e5"/><Text className="ml-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('onboarding.privacyTitle')}</Text></View>
          <Text className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t('onboarding.privacy')}</Text>
          <View className="mt-4 flex-row flex-wrap gap-x-4 gap-y-2"><Text accessibilityRole="link" onPress={() => router.push('/settings/privacy')} className="text-indigo-700 underline dark:text-indigo-300">{t('settings.privacy')}</Text><Text accessibilityRole="link" onPress={() => router.push('/settings/terms')} className="text-indigo-700 underline dark:text-indigo-300">{t('settings.terms')}</Text><Text accessibilityRole="link" onPress={() => router.push('/settings/disclaimer')} className="text-indigo-700 underline dark:text-indigo-300">{t('settings.disclaimer')}</Text></View>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: acknowledged }} accessibilityLabel={t('onboarding.acknowledge')} onPress={() => setAcknowledged((value) => !value)} className="mt-5 min-h-11 flex-row items-center"><View className={`mr-3 h-5 w-5 rounded border ${acknowledged ? 'border-indigo-600 bg-indigo-600' : 'border-zinc-400'}`} /> <Text className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{t('onboarding.acknowledge')}</Text></Pressable>
        </View>
        <View className="mt-6 gap-3"><Pressable accessibilityRole="button" accessibilityState={{ disabled: !acknowledged }} onPress={async () => { if (acknowledged) { await completeOnboarding(); router.replace('/(tabs)/models'); } }} className={`min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 ${acknowledged ? '' : 'opacity-50'}`}><Text className="font-semibold text-white">{t('onboarding.addProvider')}</Text></Pressable><Pressable accessibilityRole="button" onPress={continueToApp} className="min-h-11 items-center justify-center rounded-xl bg-zinc-100 px-4 dark:bg-zinc-800"><Text className="font-semibold text-zinc-900 dark:text-zinc-100">{t('onboarding.skip')}</Text></Pressable></View>
      </ScrollView>
    </Screen>
  );
}
