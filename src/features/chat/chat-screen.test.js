import { render, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import ChatScreen from './chat-screen';
import { router } from 'expo-router';
import { getDefaultSystemPrompt } from '../onboarding/onboarding-state';

jest.mock('lucide-react-native', () => ({ ArrowUp: 'ArrowUp', Plus: 'Plus', Search: 'Search', Square: 'Square', Trash2: 'Trash2' }));
jest.mock('../../components/ui/screen', () => ({ Screen: ({ children }) => children }));
jest.mock('../../core/i18n/locale-context', () => ({ useLocale: () => ({ t: (key) => key }) }));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => ({}) }));
jest.mock('../../core/conversations/runtime', () => ({ getConversationRuntime: () => ({ repository: { listConversations: jest.fn().mockResolvedValue([]), searchConversations: jest.fn().mockResolvedValue([]), createConversation: jest.fn().mockImplementation(async (input) => ({ id: 'new-id', ...input })) } }) }));
jest.mock('../onboarding/onboarding-state', () => ({ getDefaultSystemPrompt: jest.fn() }));

test('chat list displays empty state and creates conversation with persisted default system prompt', async () => {
  getDefaultSystemPrompt.mockResolvedValue('Be concise');
  const screen = render(<ChatScreen />);
  expect(await screen.findByText('chat.empty')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('app.newChat'));
  await waitFor(() => expect(router.push).toHaveBeenCalledWith('/chat/new-id'));
});
