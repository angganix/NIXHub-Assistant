import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { getConversationRuntime } from '../../src/core/conversations/runtime';
import ChatScreen from '../../src/features/chat/chat-screen';

export default function ChatHome() {
  const [ready, setReady] = useState(false);
  useFocusEffect(useCallback(() => {
    let mounted = true;
    getConversationRuntime().repository.listConversations().then((rows) => {
      if (!mounted) return;
      setReady(true);
      if (rows.length === 0) getConversationRuntime().repository.createConversation({}).then((thread) => router.replace(`/chat/${thread.id}`));
    });
    return () => { mounted = false; };
  }, []));
  if (!ready) return null;
  return <ChatScreen />;
}
