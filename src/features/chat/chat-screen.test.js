import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatScreen from './chat-screen';
import { router } from 'expo-router';

jest.mock('lucide-react-native', () => ({ ArrowUp: 'ArrowUp', Plus: 'Plus', Search: 'Search', Square: 'Square', Trash2: 'Trash2' }));
jest.mock('../../components/ui/screen', () => ({ Screen: ({ children }) => children }));
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));
jest.mock('../../core/conversations/runtime', () => ({
  getConversationRuntime: () => ({ repository: { listConversations: jest.fn().mockResolvedValue([]), searchConversations: jest.fn().mockResolvedValue([]), createConversation: jest.fn().mockResolvedValue({ id: 'new-id' }) } }),
}));
jest.mock('../../core/i18n/locale-context', () => ({ useLocale: () => ({ t: (key) => key }) }));

test('chat list displays empty state and creates new conversation', async () => {
  const screen = render(<ChatScreen />);
  expect(await screen.findByText('chat.empty')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('app.newChat'));
  await waitFor(() => expect(router.push).toHaveBeenCalledWith('/chat/new-id'));
});
