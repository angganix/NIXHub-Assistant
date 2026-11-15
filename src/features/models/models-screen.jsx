import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Check, Plus, Trash2, Wifi } from 'lucide-react-native';
import { Screen } from '../../components/ui/screen';
import { Button } from '../../components/ui/button';
import { useLocale } from '../../core/i18n/locale-context';
import { listProviderAccounts, providerAccountService } from '../../core/providers/runtime';

export default function ModelsScreen() {
  const { t } = useLocale();
  const [accounts, setAccounts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [label, setLabel] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.example.com');
  const [format, setFormat] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [modelId, setModelId] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => setAccounts(await listProviderAccounts()), []);
  useEffect(() => { refresh(); }, [refresh]);

  const beginEdit = (account) => {
    setEditingId(account.id);
    setLabel(account.label);
    setBaseUrl(account.baseUrl);
    setFormat(account.format);
    setApiKey('');
    setEditing(true);
  };
  const resetEditor = () => {
    setEditing(false);
    setEditingId(null);
    setLabel('');
    setApiKey('');
  };

  const save = async () => {
    try {
      const existing = accounts.find((account) => account.id === editingId);
      const account = await providerAccountService.saveProvider({
        id: editingId || undefined, providerId: existing?.providerId, secretRef: existing?.secretRef,
        label, baseUrl, format, apiKey,
      });
      const result = await providerAccountService.fetchModels(account);
      await listProviderAccounts();
      if (result.models?.length) {
        await providerAccountService.setModels(account.id, result.models.map((model) => model.id));
      } else if (existing?.models.length) {
        await providerAccountService.setModels(account.id, existing.models.map((model) => model.modelId));
      }
      setNotice(result.manualModelIdAllowed ? t('models.manualFallback') : editingId ? t('models.updated') : t('models.saved'));
      resetEditor();
      await refresh();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const test = async (account) => {
    try {
      const result = await providerAccountService.testConnection(account);
      setNotice(result.ok ? t('models.connected') : result.error?.message || result.error?.kind || t('models.failed'));
    } catch (error) {
      setNotice(error.message || t('models.failed'));
    }
  };

  const addManual = async (account) => {
    if (!modelId.trim()) return;
    await providerAccountService.setModels(account.id, [...account.models.map((model) => model.modelId), modelId]);
    await listProviderAccounts();
    setModelId('');
    await refresh();
  };

  return (
    <Screen className="px-5">
      <View className="flex-row items-center justify-between py-4">
        <Text className="text-xl font-bold text-zinc-950 dark:text-zinc-50">{t('tabs.models')}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={t('models.add')} onPress={() => { resetEditor(); setEditing(true); }} className="h-11 w-11 items-center justify-center rounded-full bg-indigo-600"><Plus color="white" size={22} /></Pressable>
      </View>
      {editing ? <View className="mb-5 gap-2 rounded-2xl bg-white p-4 dark:bg-zinc-900">
        <TextInput accessibilityLabel={t('models.name')} value={label} onChangeText={setLabel} placeholder={t('models.name')} className="h-11 rounded-lg bg-zinc-100 px-3 dark:bg-zinc-800 dark:text-white" />
        <TextInput accessibilityLabel={t('models.endpoint')} value={baseUrl} onChangeText={setBaseUrl} autoCapitalize="none" keyboardType="url" placeholder={t('models.endpoint')} className="h-11 rounded-lg bg-zinc-100 px-3 dark:bg-zinc-800 dark:text-white" />
        <View className="flex-row gap-2"><Button title="OpenAI" variant={format === 'openai' ? 'primary' : 'secondary'} onPress={() => setFormat('openai')} /><Button title="Anthropic" variant={format === 'anthropic' ? 'primary' : 'secondary'} onPress={() => setFormat('anthropic')} /></View>
        <TextInput accessibilityLabel={t('models.apiKey')} value={apiKey} onChangeText={setApiKey} secureTextEntry placeholder={editingId ? t('models.keepKey') : t('models.apiKey')} autoCapitalize="none" className="h-11 rounded-lg bg-zinc-100 px-3 dark:bg-zinc-800 dark:text-white" />
        <View className="flex-row gap-2"><Button title={t('models.save')} onPress={save} /><Button title={t('common.cancel')} variant="secondary" onPress={resetEditor} /></View>
      </View> : null}
      {!!notice && <Text accessibilityLiveRegion="polite" className="mb-3 text-sm text-indigo-700 dark:text-indigo-300">{notice}</Text>}
      <FlatList data={accounts} keyExtractor={(item) => item.id} ListEmptyComponent={<Text className="mt-16 text-center text-zinc-500">{t('models.empty')}</Text>} renderItem={({ item }) => <View className="mb-3 rounded-2xl bg-white p-4 dark:bg-zinc-900">
        <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{item.label}</Text><Text numberOfLines={1} className="mt-1 text-xs text-zinc-500">{item.baseUrl} · {item.format}</Text>
        <View className="mt-3 flex-row gap-2"><Pressable accessibilityRole="button" accessibilityLabel={t('models.test')} onPress={() => test(item)} className="h-11 flex-row items-center gap-2 rounded-lg bg-zinc-100 px-3 dark:bg-zinc-800"><Wifi size={16} color="#4f46e5"/><Text className="text-zinc-800 dark:text-zinc-100">{t('models.test')}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={t('models.edit')} onPress={() => beginEdit(item)} className="h-11 items-center justify-center rounded-lg bg-zinc-100 px-3 dark:bg-zinc-800"><Text className="text-zinc-800 dark:text-zinc-100">{t('models.edit')}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={t('models.delete')} onPress={() => Alert.alert(t('models.deleteTitle'), t('models.deleteConfirm'), [{ text: t('common.cancel'), style: 'cancel' }, { text: t('models.delete'), style: 'destructive', onPress: async () => { await providerAccountService.deleteProvider(item.id); await refresh(); } }])} className="h-11 w-11 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800"><Trash2 size={16} color="#71717a"/></Pressable></View>
        {item.models.map((model) => <View key={model.id} className="mt-3 flex-row items-center"><Check size={15} color="#4f46e5"/><Text className="ml-2 text-sm text-zinc-700 dark:text-zinc-300">{model.modelId}</Text></View>)}
        {!item.models.length ? <View className="mt-3 flex-row items-center gap-2"><TextInput accessibilityLabel={t('models.manualModel')} value={modelId} onChangeText={setModelId} placeholder={t('models.manualModel')} autoCapitalize="none" className="h-11 flex-1 rounded-lg bg-zinc-100 px-3 dark:bg-zinc-800 dark:text-white"/><Pressable accessibilityRole="button" accessibilityLabel={t('models.addManual')} onPress={() => addManual(item)} className="h-11 w-11 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800"><Plus size={18} color="#4f46e5"/></Pressable></View> : null}
      </View>} />
    </Screen>
  );
}
