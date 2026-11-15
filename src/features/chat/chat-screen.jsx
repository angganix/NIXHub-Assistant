import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowUp, Plus, Search, Square, Trash2 } from 'lucide-react-native';
import { Screen } from '../../components/ui/screen';
import { useLocale } from '../../core/i18n/locale-context';
import { getConversationRuntime } from '../../core/conversations/runtime';
import { getDefaultSystemPrompt } from '../onboarding/onboarding-state';

const runtime = getConversationRuntime();

function MessageBubble({ item }) {
  const user = item.role === 'user';
  return (
    <View className={`mb-4 max-w-[88%] rounded-2xl px-4 py-3 ${user ? 'self-end bg-indigo-600' : 'self-start bg-white dark:bg-zinc-900'}`}>
      <Text className={user ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}>{item.content || (item.status === 'streaming' ? '…' : '')}</Text>
      {!user && item.providerId ? <Text className="mt-2 text-xs text-zinc-500">{item.providerId} · {item.modelId}</Text> : null}
      {item.status === 'error' ? <Text className="mt-2 text-xs text-red-600">{item.errorMessage || 'Provider error'}</Text> : null}
    </View>
  );
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const conversationId = params.conversationId;
  const { t } = useLocale();
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const list = useRef(null);

  const refresh = useCallback(async () => {
    if (conversationId) setConversation(await runtime.repository.getConversation(conversationId));
    else {
      const rows = search ? await runtime.repository.searchConversations(search) : await runtime.repository.listConversations();
      setConversations(rows);
    }
  }, [conversationId, search]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (!conversationId || !busy) return undefined;
    const timer = setInterval(() => runtime.repository.getConversation(conversationId).then(setConversation), 300);
    return () => clearInterval(timer);
  }, [conversationId, busy]);

  const newChat = async () => {
    const systemPrompt = await getDefaultSystemPrompt();
    const created = await runtime.repository.createConversation({ systemPrompt });
    router.push(`/chat/${created.id}`);
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || busy || !conversationId) return;
    setDraft('');
    setBusy(true);
    try {
      const { listProviderAccounts, providerAccountService } = await import('../../core/providers/runtime');
      const accounts = await listProviderAccounts();
      const account = accounts.find((item) => item.enabled && item.models.length > 0);
      if (!account) throw new Error(t('chat.noProvider'));
      await runtime.engine.sendMessage(conversationId, { model: account.models[0].modelId, messages: [{ role: 'user', content: text }] }, providerAccountService.adapterFor(account), account);
    } catch (error) {
      setConversation(await runtime.repository.getConversation(conversationId));
      if (!conversation) console.warn(error.message);
    } finally {
      setBusy(false);
      setConversation(await runtime.repository.getConversation(conversationId));
      list.current?.scrollToEnd({ animated: true });
    }
  };

  if (!conversationId) {
    const rows = search ? conversations.filter((row) => row.title.toLowerCase().includes(search.toLowerCase())) : conversations;
    return (
      <Screen className="px-5">
        <View className="flex-row items-center justify-between py-3">
          <Text className="text-xl font-bold text-zinc-950 dark:text-zinc-50">{t('tabs.chat')}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t('app.newChat')} onPress={newChat} className="h-11 w-11 items-center justify-center rounded-full bg-indigo-600"><Plus color="white" size={22} /></Pressable>
        </View>
        <View className="mb-3 flex-row items-center rounded-xl bg-white px-3 dark:bg-zinc-900"><Search size={17} color="#71717a" /><TextInput value={search} onChangeText={setSearch} placeholder={t('chat.search')} className="h-11 flex-1 px-2 text-zinc-900 dark:text-zinc-100" /></View>
        <FlatList data={rows} keyExtractor={(item) => item.id} ListEmptyComponent={<Text className="mt-16 text-center text-zinc-500">{t('chat.empty')}</Text>} renderItem={({ item }) => <Pressable onPress={() => router.push(`/chat/${item.id}`)} className="border-b border-zinc-200 py-4 dark:border-zinc-800"><Text className="font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</Text><Text className="mt-1 text-sm text-zinc-500">{new Date(item.updatedAt).toLocaleString()}</Text></Pressable>} />
      </Screen>
    );
  }

  const messages = conversation?.messages || [];
  return (
    <Screen>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-row items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <Pressable accessibilityRole="button" accessibilityLabel={t('chat.back')} onPress={() => router.back()} className="h-11 justify-center"><Text className="text-zinc-700 dark:text-zinc-200">{t('tabs.chat')}</Text></Pressable>
          <Text numberOfLines={1} className="max-w-[65%] font-semibold text-zinc-900 dark:text-zinc-100">{conversation?.title || t('app.newChat')}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t('chat.delete')} onPress={async () => { await runtime.repository.deleteConversation(conversationId); router.replace('/(tabs)/chat'); }} className="h-11 w-11 items-center justify-center"><Trash2 size={18} color="#71717a" /></Pressable>
        </View>
        <FlatList ref={list} className="flex-1 px-4 pt-4" data={messages} keyExtractor={(item) => item.id} renderItem={({ item }) => <MessageBubble item={item} />} onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })} ListEmptyComponent={<Text className="mt-20 text-center text-zinc-500">{t('chat.emptyThread')}</Text>} />
        <View className="flex-row items-end gap-2 border-t border-zinc-200 px-3 py-3 dark:border-zinc-800">
          <TextInput accessibilityLabel={t('chat.messageInput')} value={draft} onChangeText={setDraft} multiline editable={!busy} placeholder={t('chat.messagePlaceholder')} className="max-h-32 min-h-11 flex-1 rounded-2xl bg-white px-4 py-3 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" />
          <Pressable accessibilityRole="button" accessibilityLabel={busy ? t('chat.cancel') : t('chat.send')} onPress={() => busy ? runtime.engine.cancel(conversationId) : send()} className="h-11 w-11 items-center justify-center rounded-full bg-indigo-600">{busy ? <Square color="white" size={17} /> : <ArrowUp color="white" size={20} />}</Pressable>
        </View>
        {busy ? <ActivityIndicator className="absolute right-16 top-16" color="#4f46e5" /> : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}
